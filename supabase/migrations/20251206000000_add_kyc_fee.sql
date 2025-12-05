-- Add KYC fee tracking to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS kyc_fee_paid BOOLEAN NOT NULL DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.kyc_fee_paid IS 'Tracks whether the $400 KYC verification fee has been paid';
