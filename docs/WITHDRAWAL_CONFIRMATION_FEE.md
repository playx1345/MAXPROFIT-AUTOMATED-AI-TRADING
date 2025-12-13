# Withdrawal Confirmation Fee Feature

## Overview

This feature implements a 10% confirmation fee requirement for all withdrawal requests. Users must pay this fee in Bitcoin to a designated BTC address before their withdrawal can be approved by administrators.

## Purpose

The confirmation fee provides an additional layer of security and verification for withdrawal transactions, ensuring that:
- Withdrawals are legitimate requests from real users
- Users are committed to their withdrawal request
- Platform can verify user identity through blockchain transactions

## How It Works

### For Users

1. **Submit Withdrawal Request**: User fills out the withdrawal form with amount and destination wallet
2. **Receive Fee Instructions**: System displays the BTC address where the 10% confirmation fee must be paid
3. **Pay Confirmation Fee**: User sends BTC equivalent to 10% of withdrawal amount to the designated address
4. **Wait for Verification**: Admin verifies the fee payment on the blockchain
5. **Receive Withdrawal**: Once verified, admin approves the withdrawal and processes the payment

### For Administrators

1. **Review Withdrawal Request**: Admin sees pending withdrawal in the admin panel
2. **Request Fee Payment Hash**: Admin asks user for the BTC transaction hash
3. **Verify on Blockchain**: Admin enters the transaction hash and system verifies it on blockchain
4. **Automatic Verification**: System checks:
   - Transaction is sent to correct BTC address: `bc1q3jjvkvy9wt54tn05qzk7spryramhkz7qltn2ny`
   - Transaction has 6+ confirmations
   - Transaction amount meets minimum threshold (0.0001 BTC)
5. **Approve Withdrawal**: Once fee is verified, admin can approve the withdrawal

## Technical Implementation

### Database Changes

New fields added to `transactions` table:
- `confirmation_fee_transaction_hash`: BTC transaction hash proving fee payment
- `confirmation_fee_verified`: Boolean flag indicating verification status
- `confirmation_fee_verified_at`: Timestamp of verification
- `confirmation_fee_amount`: Amount paid in BTC

### Edge Function

**Name**: `verify-withdrawal-confirmation-fee`

**Functionality**:
- Accepts transaction ID and BTC transaction hash
- Calls Blockchair API to verify the transaction on Bitcoin blockchain
- Checks transaction is sent to designated BTC address
- Verifies transaction has 6+ confirmations
- Validates amount meets minimum threshold
- Updates transaction record with verification details

**API Endpoint**: `/functions/v1/verify-withdrawal-confirmation-fee`

**Request Body**:
```json
{
  "transaction_id": "uuid-of-withdrawal-transaction",
  "confirmation_fee_tx_hash": "bitcoin-transaction-hash"
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "Confirmation fee verified successfully",
  "verification_details": {
    "transaction_hash": "...",
    "amount_btc": 0.00123,
    "confirmations": 12,
    "to_address": "bc1q3jjvkvy9wt54tn05qzk7spryramhkz7qltn2ny",
    "timestamp": "2024-01-15T10:30:00Z",
    "verified_at": "2024-01-15T10:35:00Z"
  }
}
```

### Database Functions

**Updated Functions**:

1. `approve_withdrawal_atomic`: Now checks `confirmation_fee_verified = true` before allowing approval
2. `auto_approve_withdrawal`: Also requires fee verification before auto-approving after 24 hours

Both functions raise an exception if fee is not verified:
```
"Cannot approve withdrawal: 10% confirmation fee has not been verified. User must pay the confirmation fee to the BTC address before withdrawal can be approved."
```

### User Interface

**Withdrawal Page** (`src/pages/Withdraw.tsx`):
- Prominent alert explaining 10% confirmation fee requirement
- Displays BTC address for fee payment
- Shows fee amount in USDT with note about BTC conversion
- Instructions on the verification process

**Admin Panel** (`src/pages/admin/Withdrawals.tsx`):
- Fee verification status badge in withdrawal table
- Detailed verification section in withdrawal details dialog
- Input field for BTC transaction hash
- "Verify Fee Payment" button that calls edge function
- Displays verification details once confirmed
- Approve button disabled until fee is verified
- Warning message if fee not verified

## Security Features

1. **Blockchain Verification**: All fee payments are verified on the actual Bitcoin blockchain
2. **Confirmation Requirement**: Requires 6+ blockchain confirmations to prevent double-spend attacks
3. **Address Verification**: Ensures payment was sent to the correct BTC address
4. **Minimum Amount**: Enforces minimum BTC amount to prevent dust payments
5. **Atomic Operations**: Database updates use row-level locking to prevent race conditions
6. **Admin Audit Trail**: All verifications logged in admin_activity_logs

## Configuration

**BTC Address**: Defined in `src/lib/constants.ts`
```typescript
export const CONFIRMATION_FEE_WALLET_BTC = "bc1q3jjvkvy9wt54tn05qzk7spryramhkz7qltn2ny";
```

**Fee Percentage**: Also in `src/lib/constants.ts`
```typescript
export const WITHDRAWAL_FEE_PERCENTAGE = 0.10; // 10%
```

**Minimum BTC Amount**: Defined in edge function
```typescript
const MIN_BTC_AMOUNT = 0.0001; // ~$4-10 USD
```

**Confirmation Threshold**: Defined in edge function
```typescript
const MIN_CONFIRMATIONS = 6; // Bitcoin standard
```

## Deployment

### Database Migrations

Apply these migrations in order:
1. `20251213020259_add_confirmation_fee_fields.sql` - Adds confirmation fee fields to transactions table
2. `20251213020356_require_confirmation_fee_for_withdrawal.sql` - Updates approve_withdrawal_atomic function
3. `20251213020416_update_auto_approve_with_fee_check.sql` - Updates auto_approve_withdrawal function

### Edge Function Deployment

```bash
supabase functions deploy verify-withdrawal-confirmation-fee
```

### Verification

After deployment:
1. Check Supabase Dashboard > Edge Functions to confirm function is active
2. Check Database > Tables > transactions to verify new columns exist
3. Test a withdrawal flow end-to-end

## User Flow Example

1. Alice wants to withdraw $1,000 USDT
2. Alice submits withdrawal request through the platform
3. System shows Alice must pay $100 (10% of $1,000) in BTC to: `bc1q3jjvkvy9wt54tn05qzk7spryramhkz7qltn2ny`
4. Alice sends 0.0015 BTC (current equivalent of $100) to the address
5. Alice receives Bitcoin transaction hash: `abc123...`
6. Alice provides transaction hash to admin via support chat
7. Admin enters `abc123...` in the verification field and clicks "Verify Fee Payment"
8. System verifies transaction on blockchain (6+ confirmations)
9. System updates withdrawal record: `confirmation_fee_verified = true`
10. Admin clicks "Approve & Process" button
11. Withdrawal is approved and funds sent to Alice's wallet

## Notes

- The 10% fee is separate from the withdrawal amount (not deducted from it)
- Fee must be paid in Bitcoin, regardless of withdrawal currency (USDT or BTC)
- The actual BTC amount varies based on current BTC/USD exchange rate
- System requires minimum 0.0001 BTC to prevent dust payments
- Once verified, fee verification cannot be undone
- Auto-processing after 24 hours will only work if fee is verified

## Maintenance

### Updating BTC Address

To change the BTC address for confirmation fees:
1. Update `CONFIRMATION_FEE_WALLET_BTC` in `src/lib/constants.ts`
2. Update the same address in `supabase/functions/verify-withdrawal-confirmation-fee/index.ts`
3. Rebuild and redeploy the application
4. Redeploy the edge function

### Updating Fee Percentage

To change the fee percentage:
1. Update `WITHDRAWAL_FEE_PERCENTAGE` in `src/lib/constants.ts`
2. Rebuild and redeploy the application
3. Update any documentation that references the 10% fee
