# Withdrawal Confirmation Fee Verification

## Overview

This edge function verifies that users have paid the required 10% confirmation fee in BTC before their withdrawal requests can be approved. This adds an additional layer of security and revenue to the platform's withdrawal process.

## How It Works

### 1. User Initiates Withdrawal

When a user requests a withdrawal:
1. The withdrawal amount is deducted from their balance and marked as `pending`
2. User is informed they must pay a 10% confirmation fee in BTC to the platform's wallet

### 2. User Pays Confirmation Fee

The user must:
1. Calculate 10% of their withdrawal amount in USD
2. Convert that USD amount to BTC at current market rates
3. Send the BTC to the platform's confirmation fee wallet: `bc1q3jjvkvy9wt54tn05qzk7spryramhkz7qltn2ny`
4. Obtain the transaction hash from the Bitcoin blockchain

### 3. Admin Verifies Confirmation Fee

The admin can verify the confirmation fee payment by:
1. Calling the `verify-confirmation-fee` edge function with:
   - `transaction_id`: The withdrawal transaction UUID
   - `confirmation_fee_tx_hash`: The Bitcoin transaction hash of the fee payment

### 4. Withdrawal Approval

Once the confirmation fee is verified:
- The withdrawal status can be changed from `pending` to `approved`
- Both manual and automatic (24-hour) approvals require fee verification
- Without verified confirmation fee, approvals will fail with an error message

## API Endpoint

### `POST /functions/v1/verify-confirmation-fee`

**Headers:**
```
Authorization: Bearer {SUPABASE_ANON_KEY}
Content-Type: application/json
```

**Request Body:**
```json
{
  "transaction_id": "uuid-of-withdrawal-transaction",
  "confirmation_fee_tx_hash": "bitcoin-transaction-hash"
}
```

**Success Response (200):**
```json
{
  "verified": true,
  "fee_paid": true,
  "expected_fee_btc": 0.00123456,
  "actual_amount_btc": 0.00123450,
  "to_address": "bc1q3jjvkvy9wt54tn05qzk7spryramhkz7qltn2ny",
  "from_address": "user-btc-address",
  "confirmations": 3,
  "transaction_hash": "bitcoin-tx-hash",
  "btc_price_usd": 42000.00,
  "expected_fee_usd": 51.85
}
```

**Error Response (400/404/500):**
```json
{
  "error": "Error message description"
}
```

## Database Schema

### New Fields in `transactions` Table

| Field | Type | Description |
|-------|------|-------------|
| `confirmation_fee_tx_hash` | TEXT | Bitcoin transaction hash for the confirmation fee payment |
| `confirmation_fee_verified` | BOOLEAN | Whether the fee has been verified on the blockchain (default: false) |
| `confirmation_fee_verified_at` | TIMESTAMPTZ | Timestamp when the fee was verified |

## Verification Logic

The edge function performs the following checks:

1. **Transaction Lookup**: Verifies the withdrawal transaction exists and is pending
2. **BTC Price Fetch**: Gets current BTC/USD price from Blockchair API
3. **Fee Calculation**: Calculates expected fee: `withdrawal_amount * 0.10 / btc_price_usd`
4. **Blockchain Verification**: 
   - Fetches the BTC transaction from Blockchair
   - Verifies payment went to correct address: `bc1q3jjvkvy9wt54tn05qzk7spryramhkz7qltn2ny`
   - Checks amount matches expected fee (±1% tolerance for price fluctuations)
   - Requires at least 1 blockchain confirmation
5. **Database Update**: Updates transaction with verification status

## Security Features

- **JWT Authentication**: Edge function requires authenticated admin user
- **Blockchain Verification**: Uses public Blockchair API to verify real BTC transactions
- **Atomic Operations**: Database functions use row-level locking to prevent race conditions
- **Mandatory Requirement**: Withdrawals cannot be approved without verified confirmation fee
- **Audit Trail**: All verification attempts are logged in admin activity logs

## Error Handling

The function will return errors for:
- Missing or invalid transaction ID
- Missing BTC transaction hash
- Withdrawal transaction not found
- Payment to incorrect BTC address
- Insufficient amount paid
- Insufficient blockchain confirmations
- API failures (BTC price or blockchain lookup)

## Testing

To test the edge function locally:

```bash
# Start Supabase locally
supabase start

# Deploy the function
supabase functions deploy verify-confirmation-fee

# Test with curl
curl -X POST 'http://localhost:54321/functions/v1/verify-confirmation-fee' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "transaction_id": "your-transaction-uuid",
    "confirmation_fee_tx_hash": "bitcoin-tx-hash"
  }'
```

## Production Deployment

```bash
# Deploy to production Supabase project
supabase functions deploy verify-confirmation-fee --project-ref YOUR_PROJECT_REF

# Apply database migrations
supabase db push
```

## Constants

- **Confirmation Fee Wallet**: `bc1q3jjvkvy9wt54tn05qzk7spryramhkz7qltn2ny`
- **Fee Percentage**: 10% (0.10)
- **Required Confirmations**: 1
- **Amount Tolerance**: ±1%

## Integration Example

```typescript
// Client-side integration example
const verifyConfirmationFee = async (withdrawalId: string, btcTxHash: string) => {
  const { data, error } = await supabase.functions.invoke('verify-confirmation-fee', {
    body: {
      transaction_id: withdrawalId,
      confirmation_fee_tx_hash: btcTxHash
    }
  });

  if (error) {
    console.error('Verification failed:', error);
    return false;
  }

  return data.fee_paid;
};
```

## Admin Dashboard Integration

The admin withdrawal approval page should be updated to:
1. Display confirmation fee status for each pending withdrawal
2. Provide input field for BTC transaction hash
3. Call verification endpoint before showing approval button
4. Show verification results (amount, confirmations, address)
5. Only enable approval if fee is verified

## Support & Troubleshooting

### Common Issues

**"Payment not sent to correct BTC address"**
- Ensure the BTC was sent to: `bc1q3jjvkvy9wt54tn05qzk7spryramhkz7qltn2ny`

**"Amount mismatch"**
- Check that the correct amount was sent (10% of withdrawal in BTC)
- Consider BTC price fluctuations between calculation and payment

**"Insufficient confirmations"**
- Wait for at least 1 blockchain confirmation (usually 10-30 minutes)

**"Transaction not found"**
- Verify the transaction hash is correct
- Ensure the transaction has been broadcast to the Bitcoin network
