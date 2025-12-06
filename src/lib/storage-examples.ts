// Example usage of storage utilities
// This file demonstrates how to use the storage bucket utilities

import {
  uploadFile,
  uploadProfilePicture,
  uploadTransactionReceipt,
  validateFile,
  deleteFile,
  getSignedUrl,
  getPublicUrl,
  STORAGE_BUCKETS,
} from '@/lib/storage-utils';

/**
 * Example 1: Upload a profile picture
 */
export const handleProfilePictureUpload = async (
  file: File,
  userId: string
) => {
  try {
    // The utility automatically validates and handles old file deletion
    const storedPath = await uploadProfilePicture(file, userId);
    
    // Update user profile in database
    // await supabase.from('profiles').update({ profile_picture_url: storedPath }).eq('id', userId);
    
    // Get public URL for display
    const publicUrl = getPublicUrl(storedPath);
    console.log('Profile picture URL:', publicUrl);
    
    return storedPath;
  } catch (error) {
    console.error('Failed to upload profile picture:', error);
    throw error;
  }
};

/**
 * Example 2: Upload a transaction receipt
 */
export const handleTransactionReceiptUpload = async (
  file: File,
  userId: string,
  transactionId: string
) => {
  try {
    const storedPath = await uploadTransactionReceipt(file, userId, transactionId);
    
    // Update transaction in database
    // await supabase.from('transactions').update({ receipt_url: storedPath }).eq('id', transactionId);
    
    return storedPath;
  } catch (error) {
    console.error('Failed to upload receipt:', error);
    throw error;
  }
};

/**
 * Example 3: Upload a KYC document with validation
 */
export const handleKycDocumentUpload = async (
  file: File,
  userId: string
) => {
  try {
    // Validate file first
    const validation = validateFile(file, 'KYC_DOCUMENTS');
    if (!validation.isValid) {
      alert(validation.error);
      return null;
    }
    
    // Upload the file
    const storedPath = await uploadFile(file, 'KYC_DOCUMENTS', userId);
    
    // Update profile in database
    // await supabase.from('profiles').update({ kyc_id_card_url: storedPath }).eq('id', userId);
    
    return storedPath;
  } catch (error) {
    console.error('Failed to upload KYC document:', error);
    throw error;
  }
};

/**
 * Example 4: View a private document (KYC or receipt)
 */
export const handleViewPrivateDocument = async (storedPath: string) => {
  try {
    // Generate a signed URL that expires in 1 hour
    const signedUrl = await getSignedUrl(storedPath, 3600);
    
    if (signedUrl) {
      // Open in new tab
      window.open(signedUrl, '_blank');
    } else {
      alert('Failed to generate document URL');
    }
  } catch (error) {
    console.error('Failed to view document:', error);
    throw error;
  }
};

/**
 * Example 5: Delete a file
 */
export const handleDeleteFile = async (storedPath: string) => {
  try {
    const success = await deleteFile(storedPath);
    
    if (success) {
      console.log('File deleted successfully');
      // Update database to remove the reference
      // await supabase.from('profiles').update({ profile_picture_url: null }).eq('id', userId);
    } else {
      console.error('Failed to delete file');
    }
    
    return success;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

/**
 * Example 6: React component for profile picture upload
 * 
 * ```tsx
 * export const ProfilePictureUploader = () => {
 *   const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
 *     const file = event.target.files?.[0];
 *     if (!file) return;
 *     
 *     const userId = 'current-user-id'; // Get from auth context
 *     
 *     try {
 *       const storedPath = await uploadProfilePicture(file, userId);
 *       console.log('Uploaded to:', storedPath);
 *       
 *       // Get public URL for immediate display
 *       const publicUrl = getPublicUrl(storedPath);
 *       console.log('Display at:', publicUrl);
 *       
 *     } catch (error) {
 *       console.error('Upload failed:', error);
 *     }
 *   };
 *   
 *   return (
 *     <input
 *       type="file"
 *       accept="image/jpeg,image/jpg,image/png,image/webp"
 *       onChange={handleFileChange}
 *     />
 *   );
 * };
 * ```
 */

/**
 * Example 7: Validate before upload (form validation)
 */
export const validateBeforeUpload = (file: File) => {
  // For KYC documents
  const kycValidation = validateFile(file, 'KYC_DOCUMENTS');
  if (!kycValidation.isValid) {
    return { isValid: false, error: kycValidation.error };
  }
  
  // Additional custom validations
  const fileName = file.name.toLowerCase();
  if (!fileName.match(/\.(jpg|jpeg|png|webp|pdf)$/)) {
    return { isValid: false, error: 'Invalid file extension' };
  }
  
  return { isValid: true };
};

/**
 * Example 8: Admin uploading platform documents
 */
export const uploadPlatformDocument = async (file: File, documentName: string) => {
  try {
    // Platform documents don't follow userId structure
    const fileExt = file.name.split('.').pop();
    const fileName = `${documentName}.${fileExt}`;
    
    const storedPath = await uploadFile(
      file,
      'PLATFORM_DOCUMENTS',
      '', // No userId for platform docs
      fileName
    );
    
    // Get public URL
    const publicUrl = getPublicUrl(storedPath);
    console.log('Platform document available at:', publicUrl);
    
    return { storedPath, publicUrl };
  } catch (error) {
    console.error('Failed to upload platform document:', error);
    throw error;
  }
};
