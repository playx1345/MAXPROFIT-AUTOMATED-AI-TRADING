-- =====================================================
-- Storage Buckets Configuration
-- =====================================================
-- This migration creates and configures all storage buckets
-- needed for the MAXPROFIT Trading Platform with proper
-- Row Level Security (RLS) policies.
-- =====================================================

-- -----------------------------------------------------
-- 1. KYC Documents Bucket (ensure it exists)
-- -----------------------------------------------------
-- Stores KYC verification documents (ID cards, proof of address, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyc-documents', 
  'kyc-documents', 
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

-- RLS Policies for KYC Documents
-- Note: These policies are already created in migration 20251206012300_add_kyc_id_card.sql
-- This section ensures the bucket configuration is updated with file size limits and MIME types

-- -----------------------------------------------------
-- 2. Profile Pictures Bucket
-- -----------------------------------------------------
-- Stores user profile pictures/avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-pictures', 
  'profile-pictures', 
  true, -- Public for easy avatar display
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- RLS Policies for Profile Pictures
CREATE POLICY "Anyone can view profile pictures"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can upload their own profile picture"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own profile picture"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile picture"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- -----------------------------------------------------
-- 3. Transaction Receipts Bucket
-- -----------------------------------------------------
-- Stores deposit and withdrawal transaction receipts/screenshots
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'transaction-receipts', 
  'transaction-receipts', 
  false, -- Private for security
  10485760, -- 10MB limit for transaction screenshots
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

-- RLS Policies for Transaction Receipts
CREATE POLICY "Users can upload their own transaction receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'transaction-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own transaction receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'transaction-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all transaction receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'transaction-receipts' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can delete their own transaction receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'transaction-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- -----------------------------------------------------
-- 4. Platform Documents Bucket
-- -----------------------------------------------------
-- Stores platform-related documents (terms, policies, guides, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'platform-documents', 
  'platform-documents', 
  true, -- Public for easy access to platform docs
  52428800, -- 50MB limit for PDFs and documents
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- RLS Policies for Platform Documents
CREATE POLICY "Anyone can view platform documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'platform-documents');

CREATE POLICY "Only admins can upload platform documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'platform-documents' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Only admins can update platform documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'platform-documents' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Only admins can delete platform documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'platform-documents' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- -----------------------------------------------------
-- 5. Add columns to profiles table for profile pictures
-- -----------------------------------------------------
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

COMMENT ON COLUMN public.profiles.profile_picture_url IS 'URL path to user profile picture in storage bucket';

-- -----------------------------------------------------
-- 6. Add columns to transactions table for receipts
-- -----------------------------------------------------
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS receipt_url TEXT;

COMMENT ON COLUMN public.transactions.receipt_url IS 'URL path to transaction receipt/screenshot in storage bucket';
