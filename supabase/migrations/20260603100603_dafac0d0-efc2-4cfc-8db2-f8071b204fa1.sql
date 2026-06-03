CREATE OR REPLACE FUNCTION public.bansos_public_track(_query text)
 RETURNS TABLE(tracking_id text, recipient_name text, program_name text, category text, amount numeric, status text, location text, distributed_at timestamp with time zone, block_hash text, block_index bigint, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT d.tracking_id, r.full_name, p.name, p.category::text, d.amount, d.status::text,
         d.location, d.distributed_at, b.hash, b.block_index, d.created_at
  FROM public.bansos_distributions d
  JOIN public.bansos_recipients r ON r.id = d.recipient_id
  JOIN public.bansos_programs p ON p.id = d.program_id
  LEFT JOIN public.bansos_blockchain b ON b.distribution_id = d.id
  WHERE upper(trim(d.tracking_id)) = upper(trim(_query))
     OR upper(trim(r.qr_token))   = upper(trim(_query))
     OR trim(r.nik)                = trim(_query)
  ORDER BY d.created_at DESC;
$function$;