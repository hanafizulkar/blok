CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.bansos_create_block()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
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
    extensions.digest(convert_to(v_prev_hash || v_payload::text || now()::text || NEW.id::text, 'UTF8'), 'sha256'),
    'hex'
  );

  INSERT INTO public.bansos_blockchain(distribution_id, data, previous_hash, hash)
  VALUES (NEW.id, v_payload, v_prev_hash, v_hash);

  RETURN NEW;
END;
$function$;