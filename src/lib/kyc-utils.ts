import { supabase } from "@/integrations/supabase/client";

export const KYC_DOCUMENTS_BUCKET = 'kyc-documents';

/**
 * Extracts the file path from a stored KYC document URL/path
 * @param storedPath - The stored path value (format: "kyc-documents/{userId}/{filename}")
 * @returns The file path to use with storage APIs or null if invalid
 */
export const extractKycFilePath = (storedPath: string): string | null => {
  const pathMatch = storedPath.match(/kyc-documents\/(.+)$/);
  return pathMatch ? pathMatch[1] : null;
};

/**
 * Generates a signed URL for viewing a KYC document
 * @param storedPath - The stored path value from the database
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns The signed URL or null if generation fails
 */
export const getKycDocumentSignedUrl = async (
  storedPath: string,
  expiresIn: number = 3600
): Promise<string | null> => {
  const filePath = extractKycFilePath(storedPath);
  if (!filePath) return null;

  const { data, error } = await supabase.storage
    .from(KYC_DOCUMENTS_BUCKET)
    .createSignedUrl(filePath, expiresIn);

  if (error) throw error;
  return data?.signedUrl || null;
};
