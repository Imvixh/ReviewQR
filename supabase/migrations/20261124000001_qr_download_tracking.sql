-- Private records for completed poster PNG deliveries. This migration is additive:
-- it does not alter QR routing, destination, status, or scan behavior.
CREATE TABLE IF NOT EXISTS public.qr_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id UUID REFERENCES public.qr_codes(id) ON DELETE SET NULL,
  qr_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  business_city TEXT NOT NULL DEFAULT '',
  qr_type TEXT NOT NULL CHECK (qr_type IN ('direct', 'guided')),
  template TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  delivery_token_hash TEXT NOT NULL,
  prepared_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  file_served_at TIMESTAMPTZ,
  downloaded_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qr_downloads_downloaded_at
  ON public.qr_downloads(downloaded_at DESC) WHERE downloaded_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_qr_downloads_qr_code_id
  ON public.qr_downloads(qr_code_id);

ALTER TABLE public.qr_downloads ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.qr_downloads FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS public.qr_download_admin_audit (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  qr_download_id UUID NOT NULL REFERENCES public.qr_downloads(id) ON DELETE CASCADE,
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changes JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_qr_download_admin_audit_download
  ON public.qr_download_admin_audit(qr_download_id, created_at DESC);
ALTER TABLE public.qr_download_admin_audit ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.qr_download_admin_audit FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_admin_qr_engagement_counts(p_qr_ids UUID[])
RETURNS TABLE(qr_code_id UUID, scan_count BIGINT, handoff_count BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT requested.id,
         (SELECT count(*) FROM public.qr_scan_events e WHERE e.qr_code_id = requested.id),
         (SELECT count(*) FROM public.review_destination_clicks e WHERE e.qr_code_id = requested.id)
  FROM unnest(p_qr_ids) AS requested(id);
$$;
REVOKE ALL ON FUNCTION public.get_admin_qr_engagement_counts(UUID[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_qr_engagement_counts(UUID[]) TO service_role;

CREATE OR REPLACE FUNCTION public.update_admin_qr_download_metadata(
  p_id UUID,
  p_admin_user_id UUID,
  p_changes JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_row public.qr_downloads%ROWTYPE;
  audit_changes JSONB := '{}'::jsonb;
BEGIN
  IF p_changes IS NULL OR p_changes = '{}'::jsonb
     OR p_changes - ARRAY['qrName', 'businessName', 'businessCity', 'template'] <> '{}'::jsonb THEN
    RAISE EXCEPTION 'Invalid QR download metadata fields';
  END IF;

  SELECT * INTO current_row
  FROM public.qr_downloads
  WHERE id = p_id AND downloaded_at IS NOT NULL
  FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;

  IF p_changes ? 'qrName' AND current_row.qr_name IS DISTINCT FROM p_changes->>'qrName' THEN
    audit_changes := audit_changes || jsonb_build_object('qr_name', jsonb_build_object('before', current_row.qr_name, 'after', p_changes->>'qrName'));
  END IF;
  IF p_changes ? 'businessName' AND current_row.business_name IS DISTINCT FROM p_changes->>'businessName' THEN
    audit_changes := audit_changes || jsonb_build_object('business_name', jsonb_build_object('before', current_row.business_name, 'after', p_changes->>'businessName'));
  END IF;
  IF p_changes ? 'businessCity' AND current_row.business_city IS DISTINCT FROM p_changes->>'businessCity' THEN
    audit_changes := audit_changes || jsonb_build_object('business_city', jsonb_build_object('before', current_row.business_city, 'after', p_changes->>'businessCity'));
  END IF;
  IF p_changes ? 'template' AND current_row.template IS DISTINCT FROM p_changes->>'template' THEN
    audit_changes := audit_changes || jsonb_build_object('template', jsonb_build_object('before', current_row.template, 'after', p_changes->>'template'));
  END IF;
  IF audit_changes = '{}'::jsonb THEN RETURN true; END IF;

  UPDATE public.qr_downloads
  SET qr_name = COALESCE(p_changes->>'qrName', qr_name),
      business_name = COALESCE(p_changes->>'businessName', business_name),
      business_city = COALESCE(p_changes->>'businessCity', business_city),
      template = COALESCE(p_changes->>'template', template),
      updated_at = now()
  WHERE id = p_id;

  INSERT INTO public.qr_download_admin_audit(qr_download_id, admin_user_id, changes)
  VALUES (p_id, p_admin_user_id, audit_changes);
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.update_admin_qr_download_metadata(UUID, UUID, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_admin_qr_download_metadata(UUID, UUID, JSONB) TO service_role;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('qr-downloads', 'qr-downloads', false, 10485760, ARRAY['image/png'])
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/png'];

-- No anon/authenticated policies are created for this bucket. Server routes use
-- the server-only service role after validating either a one-time delivery token
-- or the existing Super Admin authorization context.
