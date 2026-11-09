-- Preserve existing business categories and add optional hotel subcategory support.
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS subcategory TEXT;

-- The public customer page needs category context, but no other private business fields.
DROP FUNCTION IF EXISTS public.get_public_qr_by_token(TEXT);

CREATE FUNCTION public.get_public_qr_by_token(p_token TEXT)
RETURNS TABLE (
  business_name TEXT,
  business_city TEXT,
  google_review_url TEXT,
  headline TEXT,
  tagline TEXT,
  supporting_text TEXT,
  accent_color TEXT,
  business_category TEXT,
  business_subcategory TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_token IS NULL OR length(p_token) < 20 OR length(p_token) > 128 THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT b.name, b.city, b.google_review_url, q.headline, q.tagline,
         q.supporting_text, q.accent_color, b.category, b.subcategory
  FROM public.qr_codes q
  JOIN public.businesses b
    ON b.id = q.business_id AND b.owner_id = q.owner_id
  WHERE q.token = p_token AND q.status = 'active'
  LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.get_public_qr_by_token(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_qr_by_token(TEXT) TO anon, authenticated;
