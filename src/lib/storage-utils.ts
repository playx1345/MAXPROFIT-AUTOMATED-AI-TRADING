import { supabase } from "@/integrations/supabase/client";

/**
 * Storage bucket names used in the application
 */
export const STORAGE_BUCKETS = {
  KYC_DOCUMENTS: 'kyc-documents',
  PROFILE_PICTURES: 'profile-pictures',
  TRANSACTION_RECEIPTS: 'transaction-receipts',
  PLATFORM_DOCUMENTS: 'platform-documents',
} as const;

/**
 * File size limits for each bucket (in bytes)
 */
export const BUCKET_SIZE_LIMITS = {
  [STORAGE_BUCKETS.KYC_DOCUMENTS]: 5 * 1024 * 1024, // 5MB
  [STORAGE_BUCKETS.PROFILE_PICTURES]: 2 * 1024 * 1024, // 2MB
  [STORAGE_BUCKETS.TRANSACTION_RECEIPTS]: 10 * 1024 * 1024, // 10MB
  [STORAGE_BUCKETS.PLATFORM_DOCUMENTS]: 50 * 1024 * 1024, // 50MB
} as const;

/**
 * Allowed MIME types for each bucket
 */
export const BUCKET_MIME_TYPES = {
  [STORAGE_BUCKETS.KYC_DOCUMENTS]: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
  ],
  [STORAGE_BUCKETS.PROFILE_PICTURES]: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ],
  [STORAGE_BUCKETS.TRANSACTION_RECEIPTS]: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
  ],
  [STORAGE_BUCKETS.PLATFORM_DOCUMENTS]: [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ],
} as const;

/**
 * Validates a file before upload
 * @param file - The file to validate
 * @param bucketName - The target bucket name
 * @returns An object with isValid boolean and optional error message
 */
export const validateFile = (
  file: File,
  bucketName: keyof typeof STORAGE_BUCKETS
): { isValid: boolean; error?: string } => {
  const bucket = STORAGE_BUCKETS[bucketName];
  const sizeLimit = BUCKET_SIZE_LIMITS[bucket];
  const allowedTypes = BUCKET_MIME_TYPES[bucket] as readonly string[];

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  // Check file size
  if (file.size > sizeLimit) {
    const sizeLimitMB = (sizeLimit / (1024 * 1024)).toFixed(0);
    return {
      isValid: false,
      error: `File size exceeds ${sizeLimitMB}MB limit`,
    };
  }

  return { isValid: true };
};

/**
 * Uploads a file to a storage bucket
 * @param file - The file to upload
 * @param bucketName - The target bucket name
 * @param userId - The user ID (used for folder structure)
 * @param customFileName - Optional custom file name
 * @returns The file path if successful, or throws an error
 */
export const uploadFile = async (
  file: File,
  bucketName: keyof typeof STORAGE_BUCKETS,
  userId: string,
  customFileName?: string
): Promise<string> => {
  const bucket = STORAGE_BUCKETS[bucketName];

  // Validate file first
  const validation = validateFile(file, bucketName);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // Generate file name
  const fileExt = file.name.split('.').pop();
  const fileName = customFileName || `${Date.now()}.${fileExt || 'bin'}`;
  const filePath = `${userId}/${fileName}`;

  // Upload file
  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) throw error;

  // Return the stored path format
  return `${bucket}/${filePath}`;
};

/**
 * Deletes a file from storage
 * @param storedPath - The stored path (format: "bucket-name/userId/filename")
 * @returns True if successful, false otherwise
 */
export const deleteFile = async (storedPath: string): Promise<boolean> => {
  try {
    const [bucketName, ...pathParts] = storedPath.split('/');
    const filePath = pathParts.join('/');

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to delete file:', error);
    return false;
  }
};

/**
 * Extracts the file path from a stored path
 * @param storedPath - The stored path value (format: "bucket-name/userId/filename")
 * @returns The file path (userId/filename) or null if invalid
 */
export const extractFilePath = (storedPath: string): string | null => {
  const parts = storedPath.split('/');
  if (parts.length < 2) return null;
  return parts.slice(1).join('/');
};

/**
 * Generates a signed URL for viewing a private file
 * @param storedPath - The stored path value from the database
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns The signed URL or null if generation fails
 */
export const getSignedUrl = async (
  storedPath: string,
  expiresIn: number = 3600
): Promise<string | null> => {
  try {
    const [bucketName, ...pathParts] = storedPath.split('/');
    const filePath = pathParts.join('/');

    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, expiresIn);

    if (error) throw error;
    return data?.signedUrl || null;
  } catch (error) {
    console.error('Failed to generate signed URL:', error);
    return null;
  }
};

/**
 * Gets a public URL for a file (only works for public buckets)
 * @param storedPath - The stored path value from the database
 * @returns The public URL
 */
export const getPublicUrl = (storedPath: string): string => {
  const [bucketName, ...pathParts] = storedPath.split('/');
  const filePath = pathParts.join('/');

  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return data.publicUrl;
};

/**
 * Uploads a profile picture for a user
 * @param file - The image file
 * @param userId - The user ID
 * @returns The stored path
 */
export const uploadProfilePicture = async (
  file: File,
  userId: string
): Promise<string> => {
  // Upload the new profile picture (no profile_picture_url column exists in profiles table)
  return uploadFile(file, 'PROFILE_PICTURES', userId, 'avatar');
};

/**
 * Uploads a transaction receipt for a user
 * @param file - The receipt file
 * @param userId - The user ID
 * @param transactionId - The transaction ID
 * @returns The stored path
 */
export const uploadTransactionReceipt = async (
  file: File,
  userId: string,
  transactionId: string
): Promise<string> => {
  const customFileName = `receipt-${transactionId}`;
  return uploadFile(file, 'TRANSACTION_RECEIPTS', userId, customFileName);
};
