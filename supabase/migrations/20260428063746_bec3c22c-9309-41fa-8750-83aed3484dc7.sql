-- Add merchant role
ALTER TYPE public.bansos_role ADD VALUE IF NOT EXISTS 'merchant';

-- 1. Wallet type enum
CREATE TYPE public.bansos_wallet_type AS ENUM ('recipient', 'merchant', 'treasury');

-- 2. WALLETS
CREATE TABLE public.bansos_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE DEFAULT ('0x' || encode(gen_random_bytes(20), 'hex')),
  wallet_type public.bansos_wallet_type NOT NULL,
  owner_user_id UUID,
  owner_recipient_id UUID REFERENCES public.bansos_recipients(id) ON DELETE CASCADE,
  owner_program_id UUID REFERENCES public.bansos_programs(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  balance NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_bansos_wallets_owner_user ON public.bansos_wallets(owner_user_id);
CREATE INDEX idx_bansos_wallets_recipient ON public.bansos_wallets(owner_recipient_id);
CREATE INDEX idx_bansos_wallets_type ON public.bansos_wallets(wallet_type);
ALTER TABLE public.bansos_wallets ENABLE ROW LEVEL SECURITY;

-- 3. MERCHANTS
CREATE TABLE public.bansos_merchants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_user_id UUID,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'sembako',
  address TEXT,
  phone TEXT,
  wallet_id UUID REFERENCES public.bansos_wallets(id) ON DELETE SET NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bansos_merchants ENABLE ROW LEVEL SECURITY;

-- 4. WALLET TRANSACTIONS
CREATE TYPE public.bansos_tx_type AS ENUM ('topup', 'disbursement', 'purchase', 'transfer', 'withdraw', 'allocation');
CREATE TYPE public.bansos_tx_status AS ENUM ('pending', 'completed', 'failed');

CREATE TABLE public.bansos_wallet_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tx_hash TEXT NOT NULL UNIQUE DEFAULT ('0x' || encode(gen_random_bytes(32), 'hex')),
  tx_type public.bansos_tx_type NOT NULL,
  from_wallet_id UUID REFERENCES public.bansos_wallets(id),
  to_wallet_id UUID REFERENCES public.bansos_wallets(id),
  amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  description TEXT,
  merchant_id UUID REFERENCES public.bansos_merchants(id),
  distribution_id UUID REFERENCES public.bansos_distributions(id),
  status public.bansos_tx_status NOT NULL DEFAULT 'completed',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_bansos_wtx_from ON public.bansos_wallet_transactions(from_wallet_id);
CREATE INDEX idx_bansos_wtx_to ON public.bansos_wallet_transactions(to_wallet_id);
CREATE INDEX idx_bansos_wtx_created ON public.bansos_wallet_transactions(created_at DESC);
ALTER TABLE public.bansos_wallet_transactions ENABLE ROW LEVEL SECURITY;

-- 5. Program budget cols
ALTER TABLE public.bansos_programs ADD COLUMN IF NOT EXISTS budget_total NUMERIC(18,2) NOT NULL DEFAULT 0;
ALTER TABLE public.bansos_programs ADD COLUMN IF NOT EXISTS treasury_wallet_id UUID REFERENCES public.bansos_wallets(id);

-- ============ RLS ============
CREATE POLICY "Wallet view"
  ON public.bansos_wallets FOR SELECT
  USING (
    auth.uid() = owner_user_id
    OR wallet_type = 'treasury'
    OR public.bansos_has_role(auth.uid(), 'admin_pemerintah')
    OR public.bansos_has_role(auth.uid(), 'petugas_lapangan')
  );

CREATE POLICY "Wallet admin manage"
  ON public.bansos_wallets FOR ALL
  USING (public.bansos_has_role(auth.uid(), 'admin_pemerintah'))
  WITH CHECK (public.bansos_has_role(auth.uid(), 'admin_pemerintah'));

CREATE POLICY "Merchants public read"
  ON public.bansos_merchants FOR SELECT USING (true);

CREATE POLICY "Merchants admin manage"
  ON public.bansos_merchants FOR ALL
  USING (public.bansos_has_role(auth.uid(), 'admin_pemerintah'))
  WITH CHECK (public.bansos_has_role(auth.uid(), 'admin_pemerintah'));

CREATE POLICY "Merchants self register"
  ON public.bansos_merchants FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Merchants self update"
  ON public.bansos_merchants FOR UPDATE
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Tx view own/treasury"
  ON public.bansos_wallet_transactions FOR SELECT
  USING (
    public.bansos_has_role(auth.uid(), 'admin_pemerintah')
    OR public.bansos_has_role(auth.uid(), 'petugas_lapangan')
    OR EXISTS (
      SELECT 1 FROM public.bansos_wallets w
      WHERE (w.id = from_wallet_id OR w.id = to_wallet_id)
        AND (w.owner_user_id = auth.uid() OR w.wallet_type = 'treasury')
    )
  );

CREATE POLICY "Tx insert authenticated"
  ON public.bansos_wallet_transactions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Tx no update" ON public.bansos_wallet_transactions FOR UPDATE USING (false);
CREATE POLICY "Tx no delete" ON public.bansos_wallet_transactions FOR DELETE USING (false);

-- ============ BALANCE TRIGGER ============
CREATE OR REPLACE FUNCTION public.bansos_apply_wallet_tx()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    IF NEW.from_wallet_id IS NOT NULL THEN
      UPDATE public.bansos_wallets
      SET balance = balance - NEW.amount, updated_at = now()
      WHERE id = NEW.from_wallet_id;
    END IF;
    IF NEW.to_wallet_id IS NOT NULL THEN
      UPDATE public.bansos_wallets
      SET balance = balance + NEW.amount, updated_at = now()
      WHERE id = NEW.to_wallet_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER bansos_wtx_apply_balance
AFTER INSERT ON public.bansos_wallet_transactions
FOR EACH ROW EXECUTE FUNCTION public.bansos_apply_wallet_tx();

-- ============ AUTO-CREATE RECIPIENT WALLET ============
CREATE OR REPLACE FUNCTION public.bansos_auto_create_recipient_wallet()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.verification_status = 'verified' AND (TG_OP = 'INSERT' OR OLD.verification_status IS DISTINCT FROM 'verified') THEN
    IF NOT EXISTS (SELECT 1 FROM public.bansos_wallets WHERE owner_recipient_id = NEW.id) THEN
      INSERT INTO public.bansos_wallets (wallet_type, owner_recipient_id, owner_user_id, label)
      VALUES ('recipient', NEW.id, NEW.user_id, 'Dompet ' || NEW.full_name);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER bansos_recipient_wallet_autocreate
AFTER INSERT OR UPDATE OF verification_status ON public.bansos_recipients
FOR EACH ROW EXECUTE FUNCTION public.bansos_auto_create_recipient_wallet();

-- ============ RPC: TREASURY TOPUP ============
CREATE OR REPLACE FUNCTION public.bansos_treasury_topup(_program_id UUID, _amount NUMERIC, _description TEXT DEFAULT 'Top-up anggaran')
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _wallet_id UUID;
  _tx_id UUID;
BEGIN
  IF NOT public.bansos_has_role(auth.uid(), 'admin_pemerintah') THEN
    RAISE EXCEPTION 'Hanya admin yang dapat top-up treasury';
  END IF;
  SELECT treasury_wallet_id INTO _wallet_id FROM public.bansos_programs WHERE id = _program_id;
  IF _wallet_id IS NULL THEN
    INSERT INTO public.bansos_wallets (wallet_type, owner_program_id, label)
    VALUES ('treasury', _program_id, 'Treasury ' || COALESCE((SELECT name FROM public.bansos_programs WHERE id = _program_id), 'Program'))
    RETURNING id INTO _wallet_id;
    UPDATE public.bansos_programs SET treasury_wallet_id = _wallet_id WHERE id = _program_id;
  END IF;
  INSERT INTO public.bansos_wallet_transactions (tx_type, to_wallet_id, amount, description)
  VALUES ('topup', _wallet_id, _amount, _description)
  RETURNING id INTO _tx_id;
  UPDATE public.bansos_programs SET budget_total = budget_total + _amount WHERE id = _program_id;
  RETURN _tx_id;
END;
$$;

-- ============ RPC: MERCHANT PURCHASE ============
CREATE OR REPLACE FUNCTION public.bansos_merchant_purchase(_merchant_id UUID, _amount NUMERIC, _description TEXT DEFAULT 'Pembelian')
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _from UUID;
  _to UUID;
  _tx UUID;
  _bal NUMERIC;
BEGIN
  SELECT id, balance INTO _from, _bal FROM public.bansos_wallets
  WHERE owner_user_id = auth.uid() AND wallet_type = 'recipient' LIMIT 1;
  IF _from IS NULL THEN RAISE EXCEPTION 'Dompet penerima tidak ditemukan'; END IF;
  IF _bal < _amount THEN RAISE EXCEPTION 'Saldo tidak mencukupi'; END IF;

  SELECT wallet_id INTO _to FROM public.bansos_merchants WHERE id = _merchant_id;
  IF _to IS NULL THEN
    INSERT INTO public.bansos_wallets (wallet_type, label)
    VALUES ('merchant', 'Merchant ' || COALESCE((SELECT name FROM public.bansos_merchants WHERE id = _merchant_id), ''))
    RETURNING id INTO _to;
    UPDATE public.bansos_merchants SET wallet_id = _to WHERE id = _merchant_id;
  END IF;

  INSERT INTO public.bansos_wallet_transactions (tx_type, from_wallet_id, to_wallet_id, amount, description, merchant_id)
  VALUES ('purchase', _from, _to, _amount, _description, _merchant_id)
  RETURNING id INTO _tx;
  RETURN _tx;
END;
$$;