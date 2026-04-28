CREATE OR REPLACE FUNCTION public.bansos_auto_promote_first_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.bansos_user_roles WHERE role = 'admin_pemerintah'
  ) THEN
    NEW.role := 'admin_pemerintah';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bansos_auto_promote_first_admin_trg ON public.bansos_user_roles;
CREATE TRIGGER bansos_auto_promote_first_admin_trg
BEFORE INSERT ON public.bansos_user_roles
FOR EACH ROW
EXECUTE FUNCTION public.bansos_auto_promote_first_admin();