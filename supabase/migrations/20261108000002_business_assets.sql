-- ==============================================================================
-- ReviewQR Database Migration: 20261108000002_business_assets.sql
-- Adds branding image asset paths (logo and thumbnail/cover) and storage bucket
-- ==============================================================================

-- 1. Alter businesses table to add branding asset columns
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS logo_path TEXT,
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS thumbnail_path TEXT;

-- 2. Create Storage bucket for business branding assets (logos, thumbnails, posters)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-assets',
  'business-assets',
  true,
  5242880, -- 5 MB
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

-- 3. Storage RLS policies for business-assets bucket
-- Public read access for active QR codes and customer review flows
DROP POLICY IF EXISTS "Public can view business assets" ON storage.objects;
CREATE POLICY "Public can view business assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'business-assets');

-- Authenticated business owners can upload their own branding assets
DROP POLICY IF EXISTS "Authenticated users can upload business assets" ON storage.objects;
CREATE POLICY "Authenticated users can upload business assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'business-assets' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated business owners can update/replace their assets
DROP POLICY IF EXISTS "Authenticated users can update own business assets" ON storage.objects;
CREATE POLICY "Authenticated users can update own business assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'business-assets' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated business owners can delete their assets
DROP POLICY IF EXISTS "Authenticated users can delete own business assets" ON storage.objects;
CREATE POLICY "Authenticated users can delete own business assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'business-assets' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

