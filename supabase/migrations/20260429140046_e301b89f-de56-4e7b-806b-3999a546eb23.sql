ALTER TABLE public.bansos_wallets
  ADD COLUMN IF NOT EXISTS phantom_address text,
  ADD COLUMN IF NOT EXISTS phantom_linked_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS bansos_wallets_phantom_address_uidx
  ON public.bansos_wallets(phantom_address)
  WHERE phantom_address IS NOT NULL;

CREATE OR REPLACE FUNCTION public.bansos_link_phantom(_phantom_address text)
RETURNS public.bansos_wallets
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _wallet public.bansos_wallets;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Tidak terautentikasi';
  END IF;

  IF _phantom_address IS NULL OR length(trim(_phantom_address)) < 32 THEN
    RAISE EXCEPTION 'Alamat Phantom tidak valid';
  END IF;

  -- Cek alamat sudah dipakai user lain
  IF EXISTS (
    SELECT 1 FROM public.bansos_wallets
    WHERE phantom_address = _phantom_address
      AND owner_user_id IS DISTINCT FROM auth.uid()
  ) THEN
    RAISE EXCEPTION 'Alamat Phantom ini sudah terhubung ke akun lain';
  END IF;

  UPDATE public.bansos_wallets
     SET phantom_address = _phantom_address,
         phantom_linked_at = now(),
         updated_at = now()
   WHERE owner_user_id = auth.uid()
     AND wallet_type = 'recipient'
   RETURNING * INTO _wallet;

  IF _wallet.id IS NULL THEN
    RAISE EXCEPTION 'Dompet penerima belum tersedia. Pastikan data penerima Anda sudah diverifikasi.';
  END IF;

  RETURN _wallet;
END;
$$;

CREATE OR REPLACE FUNCTION public.bansos_unlink_phantom()
RETURNS public.bansos_wallets
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _wallet public.bansos_wallets;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Tidak terautentikasi';
  END IF;

  UPDATE public.bansos_wallets
     SET phantom_address = NULL,
         phantom_linked_at = NULL,
         updated_at = now()
   WHERE owner_user_id = auth.uid()
     AND wallet_type = 'recipient'
   RETURNING * INTO _wallet;

  RETURN _wallet;
END;
$$;