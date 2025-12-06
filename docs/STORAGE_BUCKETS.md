# Storage Buckets Documentation

This document describes the storage bucket architecture implemented in the MAXPROFIT Trading Platform.

## Overview

The platform uses Supabase Storage with four dedicated buckets for different types of files. Each bucket has specific configurations, file size limits, and Row Level Security (RLS) policies.

## Buckets

### 1. KYC Documents (`kyc-documents`)

**Purpose**: Stores user identity verification documents (ID cards, proof of address, etc.)

**Configuration**:
- **Public**: No (private bucket)
- **File Size Limit**: 5MB
- **Allowed MIME Types**: 
  - `image/jpeg`
  - `image/jpg`
  - `image/png`
  - `image/webp`
  - `application/pdf`

**Storage Path Format**: `kyc-documents/{userId}/{filename}`

**RLS Policies**:
- Users can upload their own KYC documents
- Users can view their own KYC documents
- Admins can view all KYC documents
- Users can update their own KYC documents
- Users can delete their own KYC documents

**Database Reference**: `profiles.kyc_id_card_url`

---

### 2. Profile Pictures (`profile-pictures`)

**Purpose**: Stores user profile pictures/avatars

**Configuration**:
- **Public**: Yes (for easy display across the platform)
- **File Size Limit**: 2MB
- **Allowed MIME Types**: 
  - `image/jpeg`
  - `image/jpg`
  - `image/png`
  - `image/webp`

**Storage Path Format**: `profile-pictures/{userId}/avatar.{ext}`

**RLS Policies**:
- Anyone can view profile pictures (public bucket)
- Users can upload their own profile picture
- Users can update their own profile picture
- Users can delete their own profile picture

**Database Reference**: `profiles.profile_picture_url`

---

### 3. Transaction Receipts (`transaction-receipts`)

**Purpose**: Stores deposit and withdrawal transaction receipts/screenshots

**Configuration**:
- **Public**: No (private bucket for security)
- **File Size Limit**: 10MB
- **Allowed MIME Types**: 
  - `image/jpeg`
  - `image/jpg`
  - `image/png`
  - `image/webp`
  - `application/pdf`

**Storage Path Format**: `transaction-receipts/{userId}/receipt-{transactionId}.{ext}`

**RLS Policies**:
- Users can upload their own transaction receipts
- Users can view their own transaction receipts
- Admins can view all transaction receipts
- Users can delete their own transaction receipts

**Database Reference**: `transactions.receipt_url`

---

### 4. Platform Documents (`platform-documents`)

**Purpose**: Stores platform-related documents (terms of service, privacy policy, guides, etc.)

**Configuration**:
- **Public**: Yes (for easy access to platform documentation)
- **File Size Limit**: 50MB
- **Allowed MIME Types**: 
  - `application/pdf`
  - `image/jpeg`
  - `image/jpg`
  - `image/png`
  - `image/webp`

**Storage Path Format**: `platform-documents/{documentName}.{ext}`

**RLS Policies**:
- Anyone can view platform documents (public bucket)
- Only admins can upload platform documents
- Only admins can update platform documents
- Only admins can delete platform documents

**Database Reference**: No direct reference (accessed via storage API)

---

## Usage

### Using Storage Utilities

The platform provides a set of utility functions in `src/lib/storage-utils.ts` for working with storage buckets:

```typescript
import {
  uploadFile,
  deleteFile,
  getSignedUrl,
  getPublicUrl,
  uploadProfilePicture,
  uploadTransactionReceipt,
  validateFile,
} from '@/lib/storage-utils';

// Upload a profile picture
const storedPath = await uploadProfilePicture(file, userId);

// Upload a transaction receipt
const receiptPath = await uploadTransactionReceipt(file, userId, transactionId);

// Validate a file before upload
const validation = validateFile(file, 'KYC_DOCUMENTS');
if (!validation.isValid) {
  console.error(validation.error);
}

// Get a signed URL for private files
const signedUrl = await getSignedUrl(storedPath, 3600); // expires in 1 hour

// Get a public URL for public files
const publicUrl = getPublicUrl(storedPath);

// Delete a file
await deleteFile(storedPath);
```

### Using the Legacy KYC Utilities

For KYC documents specifically, you can still use the legacy utilities:

```typescript
import {
  KYC_DOCUMENTS_BUCKET,
  extractKycFilePath,
  getKycDocumentSignedUrl,
} from '@/lib/kyc-utils';

const signedUrl = await getKycDocumentSignedUrl(storedPath);
```

---

## Security Considerations

### Private Buckets
- **KYC Documents** and **Transaction Receipts** are private buckets
- Files are only accessible via signed URLs with expiration times
- RLS policies ensure users can only access their own files
- Admins have read-only access to all files for verification purposes

### Public Buckets
- **Profile Pictures** and **Platform Documents** are public buckets
- Files are accessible via public URLs without authentication
- Upload/update/delete operations are still protected by RLS policies
- Only appropriate users/admins can modify files

### File Validation
- All uploads are validated for file type and size before storage
- File size limits prevent abuse and manage storage costs
- MIME type restrictions prevent unauthorized file types

---

## Database Schema

### Profiles Table
```sql
ALTER TABLE public.profiles
ADD COLUMN profile_picture_url TEXT,
ADD COLUMN kyc_id_card_url TEXT;
```

### Transactions Table
```sql
ALTER TABLE public.transactions
ADD COLUMN receipt_url TEXT;
```

---

## Migration

The storage buckets are created via the migration file:
```
supabase/migrations/20251206020100_create_storage_buckets.sql
```

This migration:
1. Creates all four storage buckets with proper configurations
2. Sets up Row Level Security (RLS) policies for each bucket
3. Adds necessary columns to database tables
4. Uses `ON CONFLICT DO UPDATE` to be idempotent

---

## Best Practices

1. **Always validate files** before upload using `validateFile()`
2. **Delete old files** before uploading new ones to avoid clutter
3. **Use signed URLs** for private files with appropriate expiration times
4. **Store bucket paths** in the database, not full URLs (for flexibility)
5. **Handle errors gracefully** when uploading/deleting files
6. **Use appropriate expiration times** for signed URLs (default: 1 hour)

---

## Troubleshooting

### File Upload Fails
- Check file size is within limits
- Verify file MIME type is allowed
- Ensure user is authenticated
- Check RLS policies are correctly configured

### Cannot Access File
- For private buckets, ensure you're using signed URLs
- Check URL expiration time hasn't passed
- Verify user has permission to access the file

### Policy Errors
- Ensure the `has_role()` function exists and is accessible
- Check user is properly authenticated
- Verify user ID matches the folder path for user-specific files

---

## Future Enhancements

Potential improvements for the storage system:

1. **Image Processing**: Add automatic image resizing/compression for profile pictures
2. **Virus Scanning**: Implement automatic virus scanning for uploaded files
3. **CDN Integration**: Use CDN for faster delivery of public files
4. **Backup Strategy**: Implement automated backup of critical documents
5. **Analytics**: Track storage usage per user and bucket
