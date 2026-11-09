ALTER TABLE public.qr_codes
  ADD COLUMN IF NOT EXISTS destination_mode TEXT NOT NULL DEFAULT 'guided';

ALTER TABLE public.qr_codes
  DROP CONSTRAINT IF EXISTS qr_codes_destination_mode_check,
  ADD CONSTRAINT qr_codes_destination_mode_check
    CHECK (destination_mode IN ('direct', 'guided')) NOT VALID;
