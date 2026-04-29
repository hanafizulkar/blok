CREATE OR REPLACE FUNCTION public.bansos_distribution_to_wallet_tx()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _treasury_wallet UUID;
  _recipient_wallet UUID;
  _recipient_user UUID;
  _recipient_name TEXT;
BEGIN
  IF NEW.status NOT IN ('distributed','received') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status IN ('distributed','received') THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.bansos_wallet_transactions
    WHERE distribution_id = NEW.id AND tx_type = 'disbursement'
  ) THEN
    RETURN NEW;
  END IF;

  SELECT treasury_wallet_id INTO _treasury_wallet
  FROM public.bansos_programs WHERE id = NEW.program_id;

  SELECT user_id, full_name INTO _recipient_user, _recipient_name
  FROM public.bansos_recipients WHERE id = NEW.recipient_id;

  SELECT id INTO _recipient_wallet
  FROM public.bansos_wallets
  WHERE owner_recipient_id = NEW.recipient_id AND wallet_type = 'recipient'
  LIMIT 1;

  IF _recipient_wallet IS NULL THEN
    INSERT INTO public.bansos_wallets (wallet_type, owner_recipient_id, owner_user_id, label)
    VALUES ('recipient', NEW.recipient_id, _recipient_user, 'Dompet ' || COALESCE(_recipient_name,'Penerima'))
    RETURNING id INTO _recipient_wallet;
  END IF;

  IF _treasury_wallet IS NULL THEN
    INSERT INTO public.bansos_wallet_transactions
      (tx_type, to_wallet_id, amount, description, distribution_id)
    VALUES ('disbursement', _recipient_wallet, NEW.amount,
            'Penyaluran ' || NEW.tracking_id, NEW.id);
  ELSE
    INSERT INTO public.bansos_wallet_transactions
      (tx_type, from_wallet_id, to_wallet_id, amount, description, distribution_id)
    VALUES ('disbursement', _treasury_wallet, _recipient_wallet, NEW.amount,
            'Penyaluran ' || NEW.tracking_id, NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bansos_distribution_to_wallet_tx_trg ON public.bansos_distributions;
CREATE TRIGGER bansos_distribution_to_wallet_tx_trg
AFTER INSERT OR UPDATE OF status ON public.bansos_distributions
FOR EACH ROW
EXECUTE FUNCTION public.bansos_distribution_to_wallet_tx();

DO $$
DECLARE
  d RECORD;
  _treasury UUID;
  _recipient_wallet UUID;
  _recipient_user UUID;
  _recipient_name TEXT;
BEGIN
  FOR d IN
    SELECT * FROM public.bansos_distributions
    WHERE status IN ('distributed','received')
      AND id NOT IN (
        SELECT distribution_id FROM public.bansos_wallet_transactions
        WHERE distribution_id IS NOT NULL AND tx_type = 'disbursement'
      )
  LOOP
    SELECT treasury_wallet_id INTO _treasury FROM public.bansos_programs WHERE id = d.program_id;
    SELECT user_id, full_name INTO _recipient_user, _recipient_name
      FROM public.bansos_recipients WHERE id = d.recipient_id;

    SELECT id INTO _recipient_wallet FROM public.bansos_wallets
      WHERE owner_recipient_id = d.recipient_id AND wallet_type = 'recipient' LIMIT 1;

    IF _recipient_wallet IS NULL THEN
      INSERT INTO public.bansos_wallets (wallet_type, owner_recipient_id, owner_user_id, label)
      VALUES ('recipient', d.recipient_id, _recipient_user, 'Dompet ' || COALESCE(_recipient_name,'Penerima'))
      RETURNING id INTO _recipient_wallet;
    END IF;

    IF _treasury IS NULL THEN
      INSERT INTO public.bansos_wallet_transactions
        (tx_type, to_wallet_id, amount, description, distribution_id)
      VALUES ('disbursement', _recipient_wallet, d.amount,
              'Backfill penyaluran ' || d.tracking_id, d.id);
    ELSE
      INSERT INTO public.bansos_wallet_transactions
        (tx_type, from_wallet_id, to_wallet_id, amount, description, distribution_id)
      VALUES ('disbursement', _treasury, _recipient_wallet, d.amount,
              'Backfill penyaluran ' || d.tracking_id, d.id);
    END IF;
  END LOOP;
END $$;