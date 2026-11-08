-- ==============================================================================
-- ReviewQR Production Schema & Row Level Security (RLS) Policies
-- Migration: 20261107000001_initial_schema.sql
-- ==============================================================================

-- 1. Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'staff')),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Businesses Table
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'Restaurant & Lounge',
  city TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  google_review_url TEXT NOT NULL,
  google_place_id TEXT,
  accent_color TEXT NOT NULL DEFAULT '#1A73E8' CHECK (accent_color ~* '^#[0-9a-fA-F]{6}$'),
  logo_url TEXT,
  tagline TEXT DEFAULT 'Your honest feedback helps our staff serve you better.',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. QR Codes Table
CREATE TABLE IF NOT EXISTS public.qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  placement_name TEXT NOT NULL,
  headline TEXT NOT NULL DEFAULT 'Review us on Google',
  tagline TEXT DEFAULT 'Point phone camera & tap to share your feedback',
  accent_color TEXT NOT NULL DEFAULT '#1A73E8' CHECK (accent_color ~* '^#[0-9a-fA-F]{6}$'),
  template TEXT NOT NULL DEFAULT 'classic-acrylic',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
  show_star_bar BOOLEAN NOT NULL DEFAULT true,
  emblem_text TEXT NOT NULL DEFAULT 'G',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. QR Scan Events (Observable physical scans)
CREATE TABLE IF NOT EXISTS public.qr_scan_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  qr_code_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  visitor_hash TEXT,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Review Destination Clicks (Customer taps 'Copy & Go to Google')
CREATE TABLE IF NOT EXISTS public.review_destination_clicks (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  qr_code_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  star_rating INTEGER CHECK (star_rating BETWEEN 1 AND 5),
  suggestion_category TEXT,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. User Preferences Table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_language TEXT NOT NULL DEFAULT 'en',
  weekly_digest_enabled BOOLEAN NOT NULL DEFAULT true,
  milestone_alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  instant_surge_alerts_enabled BOOLEAN NOT NULL DEFAULT false,
  default_download_format TEXT NOT NULL DEFAULT 'png' CHECK (default_download_format IN ('png', 'pdf', 'svg')),
  show_bleed_marks_by_default BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- INDEXES FOR HIGH-PERFORMANCE DASHBOARD & QUERY ROUTING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON public.businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON public.businesses(slug);
CREATE INDEX IF NOT EXISTS idx_qr_codes_owner ON public.qr_codes(owner_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_business ON public.qr_codes(business_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_token ON public.qr_codes(token);
CREATE INDEX IF NOT EXISTS idx_scan_events_qr ON public.qr_scan_events(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_scan_events_biz ON public.qr_scan_events(business_id);
CREATE INDEX IF NOT EXISTS idx_scan_events_time ON public.qr_scan_events(scanned_at);
CREATE INDEX IF NOT EXISTS idx_dest_clicks_qr ON public.review_destination_clicks(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_dest_clicks_time ON public.review_destination_clicks(clicked_at);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scan_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_destination_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Businesses Policies (Tenant Isolation)
CREATE POLICY "Users can view own businesses"
  ON public.businesses FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create own businesses"
  ON public.businesses FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own businesses"
  ON public.businesses FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own businesses"
  ON public.businesses FOR DELETE
  USING (auth.uid() = owner_id);

-- Public minimal read for customer review journey
CREATE POLICY "Public can view business minimal info via active QR"
  ON public.businesses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.qr_codes
      WHERE qr_codes.business_id = businesses.id
      AND qr_codes.status = 'active'
    )
  );

-- QR Codes Policies
CREATE POLICY "Users can view own QR codes"
  ON public.qr_codes FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create own QR codes"
  ON public.qr_codes FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own QR codes"
  ON public.qr_codes FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own QR codes"
  ON public.qr_codes FOR DELETE
  USING (auth.uid() = owner_id);

-- Public can view active QR details for customer journey
CREATE POLICY "Public can view active QR code by token"
  ON public.qr_codes FOR SELECT
  USING (status = 'active');

-- Scan Events Policies
CREATE POLICY "Business owners can view their scan events"
  ON public.qr_scan_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = qr_scan_events.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- Anonymous customers can log observable scan events
CREATE POLICY "Public can record QR scan event"
  ON public.qr_scan_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.qr_codes
      WHERE qr_codes.id = qr_scan_events.qr_code_id
      AND qr_codes.status = 'active'
    )
  );

-- Destination Clicks Policies
CREATE POLICY "Business owners can view their destination clicks"
  ON public.review_destination_clicks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = review_destination_clicks.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- Anonymous customers can log destination clicks
CREATE POLICY "Public can record destination click"
  ON public.review_destination_clicks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.qr_codes
      WHERE qr_codes.id = review_destination_clicks.qr_code_id
      AND qr_codes.status = 'active'
    )
  );

-- User Preferences Policies
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR ALL
  USING (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'admin'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

