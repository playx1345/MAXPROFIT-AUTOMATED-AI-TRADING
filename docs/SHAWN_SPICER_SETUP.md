# Shawn Spicer Account Setup Guide

## Overview
This document describes how to set up the Shawn Spicer account with $15,000 balance and transactions showing "Processing - Waiting for block confirmation" status.

## Prerequisites
1. Access to Supabase Dashboard
2. Admin privileges
3. Database migrations applied

## Step-by-Step Setup

### 1. Create User in Supabase Auth

1. Log in to your Supabase Dashboard
2. Navigate to **Authentication** > **Users**
3. Click **"Add User"** > **"Create New User"**
4. Enter the following details:
   - **Email**: `SHAWNSPICER55@GMAIL.COM`
   - **Full Name**: `SHAWN SPICER`
   - **Password**: Set a secure password
5. Click **"Create User"**
6. Copy the generated User ID (UUID) - you'll need this in the next step

### 2. Initialize Account with SQL Function

After creating the user in Supabase Auth, run the following SQL command in the Supabase SQL Editor:

```sql
-- Replace <user_id> with the actual UUID from step 1
SELECT public.setup_shawn_spicer_account('<user_id>');
```

**Example:**
```sql
SELECT public.setup_shawn_spicer_account('a1b2c3d4-e5f6-4789-0123-456789abcdef');
```

This function will:
- Update the user profile with a $15,000 balance
- Set the full name to "SHAWN SPICER"
- Set KYC status to "verified"
- Create two sample deposit transactions with "processing" status:
  - $5,000 deposit
  - $10,000 deposit
- Both transactions will show "Processing - Waiting for block confirmation"

### 3. Verify Setup

1. Log in to the application with the Shawn Spicer credentials
2. Navigate to the **Transactions** page
3. Verify that:
   - Two deposit transactions are visible
   - Both show status: **"Processing - Waiting for block confirmation"**
   - Both have blue badges
   - Account balance is $15,000

## Transaction Status

The new "processing" status has been added to the system with the following characteristics:

- **Color**: Blue badge (bg-blue-500)
- **Label**: "Processing - Waiting for block confirmation"
- **Use Case**: For transactions that are awaiting blockchain confirmation

## Database Changes

### New Enum Value
Added to `transaction_status` enum:
```sql
ALTER TYPE public.transaction_status ADD VALUE IF NOT EXISTS 'processing';
```

### New Function
Created `setup_shawn_spicer_account(UUID)` function to automate account initialization.

## UI Changes

The following pages were updated to support the "processing" status:

1. **src/pages/Transactions.tsx**
   - Added `getStatusLabel()` function
   - Added "processing" case to `getStatusColor()`
   - Blue badge for processing status

2. **src/pages/admin/Deposits.tsx**
   - Added processing status to pending deposits filter
   - Added `getStatusColor()` and `getStatusLabel()` functions
   - Updated Badge rendering to show proper status

## Troubleshooting

### User Creation Issues
- If the trigger doesn't create the profile automatically, check if `handle_new_user()` trigger is active
- You may need to manually insert into the profiles table if the trigger fails

### Function Not Found Error
- Ensure the migration `20251230000000_add_processing_status_and_shawn_spicer.sql` has been applied
- Run: `SELECT * FROM public.setup_shawn_spicer_account WHERE false;` to check if the function exists

### Balance Not Showing
- Check the profiles table: `SELECT balance_usdt FROM profiles WHERE email = 'SHAWNSPICER55@GMAIL.COM';`
- Verify the user_id matches the one used in the function call

## Notes

- The setup function is idempotent - it can be run multiple times on the same user
- Subsequent runs will update the balance and add more transactions
- For production use, consider adding checks to prevent duplicate transaction creation
