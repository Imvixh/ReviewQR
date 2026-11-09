-- Harden tenant isolation and add token-scoped public QR operations.
-- This migration is source code only; it has not been applied to any hosted database.

ALTER TABLE public.qr_codes
  ADD COLUMN IF NOT EXISTS supporting_text TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS preset TEXT NOT NULL DEFAULT 'google-classic',
  ADD COLUMN IF NOT EXISTS geometry TEXT NOT NULL DEFAULT 'rounded',
  ADD COLUMN IF NOT EXISTS center_emblem TEXT NOT NULL DEFAULT 'google-g';

ALTER TABLE public.qr_codes
  ALTER COLUMN show_star_bar SET DEFAULT false;

ALTER TABLE public.qr_codes
  DROP CONSTRAINT IF EXISTS qr_codes_geometry_check,
  ADD CONSTRAINT qr_codes_geometry_check
    CHECK (geometry IN ('classic', 'rounded', 'dots', 'premium-eye')) NOT VALID,
  DROP CONSTRAINT IF EXISTS qr_codes_center_emblem_check,
  ADD CONSTRAINT qr_codes_center_emblem_check
    CHECK (center_emblem IN ('google-g', 'business-logo')) NOT VALID;

CREATE UNIQUE INDEX IF NOT EXISTS idx_businesses_id_owner_unique
  ON public.businesses(id, owner_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'qr_codes_business_owner_fkey'
  ) THEN
    ALTER TABLE public.qr_codes
      ADD CONSTRAINT qr_codes_business_owner_fkey
      FOREIGN KEY (business_id, owner_id)
      REFERENCES public.businesses(id, owner_id)
      NOT VALID;
  END IF;
END
$$;

-- Remove the known broad policies from the initial schema.
DROP POLICY IF EXISTS "Public can view business minimal info via active QR" ON public.businesses;
DROP POLICY IF EXISTS "Public can view active QR code by token" ON public.qr_codes;
DROP POLICY IF EXISTS "Public can record QR scan event" ON public.qr_scan_events;
DROP POLICY IF EXISTS "Public can record destination click" ON public.review_destination_clicks;

DROP POLICY IF EXISTS "Users can view own businesses" ON public.businesses;
DROP POLICY IF EXISTS "Users can create own businesses" ON public.businesses;
DROP POLICY IF EXISTS "Users can update own businesses" ON public.businesses;
DROP POLICY IF EXISTS "Users can delete own businesses" ON public.businesses;
CREATE POLICY "Users can view own businesses"
  ON public.businesses FOR SELECT TO authenticated
  USING (auth.uid() = owner_id);
CREATE POLICY "Users can create own businesses"
  ON public.businesses FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own businesses"
  ON public.businesses FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can delete own businesses"
  ON public.businesses FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);
DROP POLICY IF EXISTS "Restrict business access to owner" ON public.businesses;
CREATE POLICY "Restrict business access to owner"
  ON public.businesses AS RESTRICTIVE FOR ALL
  USING (auth.uid() IS NOT NULL AND auth.uid() = owner_id)
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can view own QR codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Users can create own QR codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Users can update own QR codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Users can delete own QR codes" ON public.qr_codes;
CREATE POLICY "Users can view own QR codes"
  ON public.qr_codes FOR SELECT TO authenticated
  USING (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = business_id AND b.owner_id = auth.uid()
    )
  );
CREATE POLICY "Users can create own QR codes"
  ON public.qr_codes FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = business_id AND b.owner_id = auth.uid()
    )
  );
CREATE POLICY "Users can update own QR codes"
  ON public.qr_codes FOR UPDATE TO authenticated
  USING (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = business_id AND b.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = business_id AND b.owner_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete own QR codes"
  ON public.qr_codes FOR DELETE TO authenticated
  USING (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = business_id AND b.owner_id = auth.uid()
    )
  );
DROP POLICY IF EXISTS "Restrict QR access to owner-owned business" ON public.qr_codes;
CREATE POLICY "Restrict QR access to owner-owned business"
  ON public.qr_codes AS RESTRICTIVE FOR ALL
  USING (
    auth.uid() IS NOT NULL
    AND auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = business_id AND b.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = business_id AND b.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Business owners can view their scan events" ON public.qr_scan_events;
CREATE POLICY "Business owners can view their scan events"
  ON public.qr_scan_events FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.qr_codes q
      JOIN public.businesses b ON b.id = q.business_id AND b.owner_id = q.owner_id
      WHERE q.id = qr_code_id
        AND q.business_id = qr_scan_events.business_id
        AND q.owner_id = auth.uid()
    )
  );
DROP POLICY IF EXISTS "Restrict scan event access to QR owner" ON public.qr_scan_events;
CREATE POLICY "Restrict scan event access to QR owner"
  ON public.qr_scan_events AS RESTRICTIVE FOR ALL
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.qr_codes q
      JOIN public.businesses b ON b.id = q.business_id AND b.owner_id = q.owner_id
      WHERE q.id = qr_code_id
        AND q.business_id = qr_scan_events.business_id
        AND q.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.qr_codes q
      JOIN public.businesses b ON b.id = q.business_id AND b.owner_id = q.owner_id
      WHERE q.id = qr_code_id
        AND q.business_id = qr_scan_events.business_id
        AND q.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Business owners can view their destination clicks" ON public.review_destination_clicks;
CREATE POLICY "Business owners can view their destination clicks"
  ON public.review_destination_clicks FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.qr_codes q
      JOIN public.businesses b ON b.id = q.business_id AND b.owner_id = q.owner_id
      WHERE q.id = qr_code_id
        AND q.business_id = review_destination_clicks.business_id
        AND q.owner_id = auth.uid()
    )
  );
DROP POLICY IF EXISTS "Restrict destination click access to QR owner" ON public.review_destination_clicks;
CREATE POLICY "Restrict destination click access to QR owner"
  ON public.review_destination_clicks AS RESTRICTIVE FOR ALL
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.qr_codes q
      JOIN public.businesses b ON b.id = q.business_id AND b.owner_id = q.owner_id
      WHERE q.id = qr_code_id
        AND q.business_id = review_destination_clicks.business_id
        AND q.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.qr_codes q
      JOIN public.businesses b ON b.id = q.business_id AND b.owner_id = q.owner_id
      WHERE q.id = qr_code_id
        AND q.business_id = review_destination_clicks.business_id
        AND q.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Restrict profile access to owner" ON public.profiles;
CREATE POLICY "Restrict profile access to owner"
  ON public.profiles AS RESTRICTIVE FOR ALL
  USING (auth.uid() IS NOT NULL AND auth.uid() = id)
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = id);
REVOKE INSERT, DELETE ON public.profiles FROM anon, authenticated;
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, phone, avatar_url) ON public.profiles TO authenticated;

DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
CREATE POLICY "Users can manage own preferences"
  ON public.user_preferences FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Restrict preferences to owner" ON public.user_preferences;
CREATE POLICY "Restrict preferences to owner"
  ON public.user_preferences AS RESTRICTIVE FOR ALL
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

REVOKE SELECT ON public.businesses, public.qr_codes FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.qr_scan_events, public.review_destination_clicks
  FROM anon, authenticated;

-- Make stored branding objects private and scope every operation to the business owner.
UPDATE storage.buckets
SET public = false,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp']
WHERE id = 'business-assets';

DROP POLICY IF EXISTS "Public can view business assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload business assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update own business assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete own business assets" ON storage.objects;
DROP POLICY IF EXISTS "Owners can view business assets" ON storage.objects;
DROP POLICY IF EXISTS "Owners can upload business assets" ON storage.objects;
DROP POLICY IF EXISTS "Owners can update business assets" ON storage.objects;
DROP POLICY IF EXISTS "Owners can delete business assets" ON storage.objects;
DROP POLICY IF EXISTS "Restrict business-assets to owning user and business" ON storage.objects;

CREATE POLICY "Owners can view business assets"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'business-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id::text = (storage.foldername(name))[2]
        AND b.owner_id = auth.uid()
    )
  );
CREATE POLICY "Owners can upload business assets"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'business-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id::text = (storage.foldername(name))[2]
        AND b.owner_id = auth.uid()
    )
  );
CREATE POLICY "Owners can update business assets"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'business-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id::text = (storage.foldername(name))[2]
        AND b.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'business-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id::text = (storage.foldername(name))[2]
        AND b.owner_id = auth.uid()
    )
  );
CREATE POLICY "Owners can delete business assets"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'business-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id::text = (storage.foldername(name))[2]
        AND b.owner_id = auth.uid()
    )
  );
CREATE POLICY "Restrict business-assets to owning user and business"
  ON storage.objects AS RESTRICTIVE FOR ALL
  USING (
    bucket_id <> 'business-assets'
    OR (
      auth.uid() IS NOT NULL
      AND (storage.foldername(name))[1] = auth.uid()::text
      AND EXISTS (
        SELECT 1 FROM public.businesses b
        WHERE b.id::text = (storage.foldername(name))[2]
          AND b.owner_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    bucket_id <> 'business-assets'
    OR (
      auth.uid() IS NOT NULL
      AND (storage.foldername(name))[1] = auth.uid()::text
      AND EXISTS (
        SELECT 1 FROM public.businesses b
        WHERE b.id::text = (storage.foldername(name))[2]
          AND b.owner_id = auth.uid()
      )
    )
  );

CREATE OR REPLACE FUNCTION public.get_public_qr_by_token(p_token TEXT)
RETURNS TABLE (
  business_name TEXT,
  business_city TEXT,
  google_review_url TEXT,
  headline TEXT,
  tagline TEXT,
  supporting_text TEXT,
  accent_color TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_business_name TEXT;
  v_business_city TEXT;
  v_google_review_url TEXT;
  v_headline TEXT;
  v_tagline TEXT;
  v_supporting_text TEXT;
  v_accent_color TEXT;
BEGIN
  IF p_token IS NULL OR length(p_token) < 20 OR length(p_token) > 128 THEN
    RETURN;
  END IF;

  SELECT b.name, b.city, b.google_review_url, q.headline, q.tagline,
         q.supporting_text, q.accent_color
    INTO v_business_name, v_business_city, v_google_review_url, v_headline,
         v_tagline, v_supporting_text, v_accent_color
  FROM public.qr_codes q
  JOIN public.businesses b
    ON b.id = q.business_id AND b.owner_id = q.owner_id
  WHERE q.token = p_token AND q.status = 'active'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT v_business_name, v_business_city, v_google_review_url, v_headline,
         v_tagline, v_supporting_text, v_accent_color;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_public_qr_scan(p_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_qr_code_id UUID;
  v_business_id UUID;
BEGIN
  IF p_token IS NULL OR length(p_token) < 20 OR length(p_token) > 128 THEN
    RETURN false;
  END IF;

  SELECT q.id, b.id
    INTO v_qr_code_id, v_business_id
  FROM public.qr_codes q
  JOIN public.businesses b
    ON b.id = q.business_id AND b.owner_id = q.owner_id
  WHERE q.token = p_token AND q.status = 'active'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  INSERT INTO public.qr_scan_events (qr_code_id, business_id)
  VALUES (v_qr_code_id, v_business_id);
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_public_destination_click(p_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_qr_code_id UUID;
  v_business_id UUID;
BEGIN
  IF p_token IS NULL OR length(p_token) < 20 OR length(p_token) > 128 THEN
    RETURN false;
  END IF;

  SELECT q.id, b.id
    INTO v_qr_code_id, v_business_id
  FROM public.qr_codes q
  JOIN public.businesses b
    ON b.id = q.business_id AND b.owner_id = q.owner_id
  WHERE q.token = p_token AND q.status = 'active'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  INSERT INTO public.review_destination_clicks (qr_code_id, business_id)
  VALUES (v_qr_code_id, v_business_id);
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_owner_qr_analytics()
RETURNS TABLE (
  qr_code_id UUID,
  placement_name TEXT,
  scan_count BIGINT,
  destination_click_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT q.id,
         q.placement_name,
         count(DISTINCT scans.id),
         count(DISTINCT clicks.id)
  FROM public.qr_codes q
  JOIN public.businesses b
    ON b.id = q.business_id AND b.owner_id = q.owner_id
  LEFT JOIN public.qr_scan_events scans
    ON scans.qr_code_id = q.id AND scans.business_id = b.id
  LEFT JOIN public.review_destination_clicks clicks
    ON clicks.qr_code_id = q.id AND clicks.business_id = b.id
  WHERE q.owner_id = auth.uid()
    AND b.owner_id = auth.uid()
  GROUP BY q.id, q.placement_name
  ORDER BY q.placement_name;
$$;

REVOKE ALL ON FUNCTION public.get_public_qr_by_token(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_public_qr_scan(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_public_destination_click(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_owner_qr_analytics() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_qr_by_token(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_public_qr_scan(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_public_destination_click(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_owner_qr_analytics() TO authenticated;

ALTER FUNCTION public.handle_new_user() SET search_path = '';
