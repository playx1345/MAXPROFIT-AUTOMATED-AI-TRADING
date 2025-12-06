-- Make the KYC bucket private and add file restrictions
UPDATE storage.buckets 
SET 
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
WHERE id = 'kyc';

-- RLS Policy: Users can upload their own KYC documents
CREATE POLICY "Users can upload own KYC documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'kyc' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy: Users can view their own KYC documents
CREATE POLICY "Users can view own KYC documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy: Users can update their own KYC documents
CREATE POLICY "Users can update own KYC documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'kyc' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy: Users can delete their own KYC documents
CREATE POLICY "Users can delete own KYC documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'kyc' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy: Admins can view all KYC documents for review
CREATE POLICY "Admins can view all KYC documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc' AND 
  public.has_role(auth.uid(), 'admin')
);