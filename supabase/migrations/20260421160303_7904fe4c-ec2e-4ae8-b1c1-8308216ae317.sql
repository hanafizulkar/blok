-- ========= ENUMS =========
CREATE TYPE public.bansos_role AS ENUM ('admin_pemerintah', 'petugas_lapangan', 'penerima');
CREATE TYPE public.bansos_category AS ENUM ('PKH', 'BPNT', 'BLT', 'PIP', 'BST', 'Lainnya');
CREATE TYPE public.bansos_verification_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE public.bansos_distribution_status AS ENUM ('scheduled', 'distributed', 'received', 'failed');

-- ========= ROLES =========
CREATE TABLE public.bansos_user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.bansos_role NOT NULL,
  assigned_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.bansos_user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.bansos_has_role(_user_id uuid, _role public.bansos_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.bansos_user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.bansos_is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.bansos_user_roles
    WHERE user_id = _user_id AND role IN ('admin_pemerintah','petugas_lapangan'));
$$;

CREATE POLICY "Users view own bansos roles" ON public.bansos_user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.bansos_has_role(auth.uid(),'admin_pemerintah'));
CREATE POLICY "Admin manage bansos roles" ON public.bansos_user_roles
  FOR ALL TO authenticated USING (public.bansos_has_role(auth.uid(),'admin_pemerintah'))
  WITH CHECK (public.bansos_has_role(auth.uid(),'admin_pemerintah'));
CREATE POLICY "Self-assign first role" ON public.bansos_user_roles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ========= PROGRAMS =========
CREATE TABLE public.bansos_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category public.bansos_category NOT NULL DEFAULT 'Lainnya',
  description text DEFAULT '',
  amount_per_distribution numeric(14,2) NOT NULL DEFAULT 0,
  start_date date,
  end_date date,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.bansos_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public view programs" ON public.bansos_programs FOR SELECT USING (true);
CREATE POLICY "Admin manage programs" ON public.bansos_programs
  FOR ALL TO authenticated USING (public.bansos_has_role(auth.uid(),'admin_pemerintah'))
  WITH CHECK (public.bansos_has_role(auth.uid(),'admin_pemerintah'));

-- ========= RECIPIENTS =========
CREATE TABLE public.bansos_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  nik text NOT NULL UNIQUE,
  full_name text NOT NULL,
  address text DEFAULT '',
  province text DEFAULT '',
  city text DEFAULT '',
  phone text DEFAULT '',
  category public.bansos_category NOT NULL DEFAULT 'PKH',
  verification_status public.bansos_verification_status NOT NULL DEFAULT 'pending',
  verified_by uuid,
  verified_at timestamptz,
  qr_token text NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text,'-',''),
  notes text DEFAULT '',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX bansos_recipients_nik_idx ON public.bansos_recipients(nik);
CREATE INDEX bansos_recipients_qr_idx ON public.bansos_recipients(qr_token);
ALTER TABLE public.bansos_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff view recipients" ON public.bansos_recipients
  FOR SELECT TO authenticated USING (public.bansos_is_staff(auth.uid()) OR auth.uid() = user_id);
CREATE POLICY "Admin manage recipients" ON public.bansos_recipients
  FOR ALL TO authenticated USING (public.bansos_has_role(auth.uid(),'admin_pemerintah'))
  WITH CHECK (public.bansos_has_role(auth.uid(),'admin_pemerintah'));

-- ========= DISTRIBUTIONS =========
CREATE TABLE public.bansos_distributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id text NOT NULL UNIQUE DEFAULT 'BNS-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,10)),
  recipient_id uuid NOT NULL REFERENCES public.bansos_recipients(id) ON DELETE CASCADE,
  program_id uuid NOT NULL REFERENCES public.bansos_programs(id) ON DELETE RESTRICT,
  officer_id uuid,
  amount numeric(14,2) NOT NULL DEFAULT 0,
  status public.bansos_distribution_status NOT NULL DEFAULT 'scheduled',
  location text DEFAULT '',
  notes text DEFAULT '',
  distributed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX bansos_dist_recipient_idx ON public.bansos_distributions(recipient_id);
CREATE INDEX bansos_dist_program_idx ON public.bansos_distributions(program_id);
ALTER TABLE public.bansos_distributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public view distributions summary" ON public.bansos_distributions FOR SELECT USING (true);
CREATE POLICY "Staff insert distributions" ON public.bansos_distributions
  FOR INSERT TO authenticated WITH CHECK (public.bansos_is_staff(auth.uid()));
CREATE POLICY "Staff update distributions" ON public.bansos_distributions
  FOR UPDATE TO authenticated USING (public.bansos_is_staff(auth.uid()));
CREATE POLICY "Admin delete distributions" ON public.bansos_distributions
  FOR DELETE TO authenticated USING (public.bansos_has_role(auth.uid(),'admin_pemerintah'));

-- ========= BLOCKCHAIN =========
CREATE TABLE public.bansos_blockchain (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_index bigserial NOT NULL UNIQUE,
  distribution_id uuid REFERENCES public.bansos_distributions(id) ON DELETE SET NULL,
  data jsonb NOT NULL,
  previous_hash text NOT NULL,
  hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX bansos_block_dist_idx ON public.bansos_blockchain(distribution_id);
ALTER TABLE public.bansos_blockchain ENABLE ROW LEVEL SECURITY;

-- Publik bisa baca semua blok (transparansi)
CREATE POLICY "Public view blockchain" ON public.bansos_blockchain FOR SELECT USING (true);
-- Tidak ada policy INSERT/UPDATE/DELETE → hanya trigger (SECURITY DEFINER) yang bisa menulis
-- → immutable dari sisi client

-- Trigger: buat blok baru setiap ada distribusi
CREATE OR REPLACE FUNCTION public.bansos_create_block()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_prev_hash text;
  v_payload jsonb;
  v_hash text;
  v_recipient_name text;
  v_program_name text;
BEGIN
  SELECT full_name INTO v_recipient_name FROM public.bansos_recipients WHERE id = NEW.recipient_id;
  SELECT name INTO v_program_name FROM public.bansos_programs WHERE id = NEW.program_id;

  SELECT hash INTO v_prev_hash FROM public.bansos_blockchain ORDER BY block_index DESC LIMIT 1;
  IF v_prev_hash IS NULL THEN v_prev_hash := '0'; END IF;

  v_payload := jsonb_build_object(
    'tracking_id', NEW.tracking_id,
    'recipient_id', NEW.recipient_id,
    'recipient_name', v_recipient_name,
    'program_id', NEW.program_id,
    'program_name', v_program_name,
    'officer_id', NEW.officer_id,
    'amount', NEW.amount,
    'status', NEW.status,
    'location', NEW.location,
    'timestamp', extract(epoch from now())
  );

  v_hash := encode(
    digest(v_prev_hash || v_payload::text || now()::text || NEW.id::text, 'sha256'),
    'hex'
  );

  INSERT INTO public.bansos_blockchain(distribution_id, data, previous_hash, hash)
  VALUES (NEW.id, v_payload, v_prev_hash, v_hash);

  RETURN NEW;
END;
$$;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TRIGGER bansos_distributions_to_blockchain
  AFTER INSERT ON public.bansos_distributions
  FOR EACH ROW EXECUTE FUNCTION public.bansos_create_block();

-- Trigger: cegah update/delete blockchain (immutability enforcement)
CREATE OR REPLACE FUNCTION public.bansos_block_immutable()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Blockchain records are immutable';
END;
$$;

CREATE TRIGGER bansos_block_no_update BEFORE UPDATE ON public.bansos_blockchain
  FOR EACH ROW EXECUTE FUNCTION public.bansos_block_immutable();
CREATE TRIGGER bansos_block_no_delete BEFORE DELETE ON public.bansos_blockchain
  FOR EACH ROW EXECUTE FUNCTION public.bansos_block_immutable();

-- ========= HELPERS =========
CREATE OR REPLACE FUNCTION public.bansos_verify_chain()
RETURNS TABLE(total_blocks bigint, valid boolean, first_invalid_index bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r record;
  v_prev text := '0';
  v_valid boolean := true;
  v_invalid bigint;
  v_count bigint := 0;
BEGIN
  FOR r IN SELECT block_index, previous_hash, hash FROM public.bansos_blockchain ORDER BY block_index ASC LOOP
    v_count := v_count + 1;
    IF r.previous_hash <> v_prev THEN
      v_valid := false;
      v_invalid := r.block_index;
      EXIT;
    END IF;
    v_prev := r.hash;
  END LOOP;
  RETURN QUERY SELECT v_count, v_valid, v_invalid;
END;
$$;

CREATE OR REPLACE FUNCTION public.bansos_public_track(_query text)
RETURNS TABLE(
  tracking_id text,
  recipient_name text,
  program_name text,
  category text,
  amount numeric,
  status text,
  location text,
  distributed_at timestamptz,
  block_hash text,
  block_index bigint,
  created_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT d.tracking_id, r.full_name, p.name, p.category::text, d.amount, d.status::text,
         d.location, d.distributed_at, b.hash, b.block_index, d.created_at
  FROM public.bansos_distributions d
  JOIN public.bansos_recipients r ON r.id = d.recipient_id
  JOIN public.bansos_programs p ON p.id = d.program_id
  LEFT JOIN public.bansos_blockchain b ON b.distribution_id = d.id
  WHERE d.tracking_id = _query
     OR r.qr_token = _query
     OR r.nik = _query
  ORDER BY d.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.bansos_stats()
RETURNS TABLE(
  total_recipients bigint,
  verified_recipients bigint,
  total_distributions bigint,
  total_amount numeric,
  total_blocks bigint,
  active_programs bigint
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    (SELECT count(*) FROM public.bansos_recipients),
    (SELECT count(*) FROM public.bansos_recipients WHERE verification_status = 'verified'),
    (SELECT count(*) FROM public.bansos_distributions),
    COALESCE((SELECT sum(amount) FROM public.bansos_distributions WHERE status IN ('distributed','received')),0),
    (SELECT count(*) FROM public.bansos_blockchain),
    (SELECT count(*) FROM public.bansos_programs WHERE is_active = true);
$$;

-- updated_at triggers
CREATE TRIGGER bansos_programs_updated BEFORE UPDATE ON public.bansos_programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER bansos_recipients_updated BEFORE UPDATE ON public.bansos_recipients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER bansos_distributions_updated BEFORE UPDATE ON public.bansos_distributions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();