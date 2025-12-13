# Deployment Guide: Confirmation Fee Verification

## Overview
This guide provides step-by-step instructions for deploying the new confirmation fee verification edge function to your Supabase project.

## Prerequisites
- Supabase CLI installed (`npm install -g supabase`)
- Supabase project credentials
- PostgreSQL admin access to your database

## Deployment Steps

### 1. Apply Database Migrations

The following migrations need to be applied in order:

```bash
# Connect to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
supabase db push
```

Migrations that will be applied:
- `20251213020448_add_confirmation_fee_fields.sql` - Adds confirmation fee fields to transactions table
- `20251213020449_update_approve_withdrawal_require_fee.sql` - Updates approve_withdrawal_atomic function
- `20251213020450_update_auto_approve_withdrawal_require_fee.sql` - Updates auto_approve_withdrawal function

### 2. Deploy Edge Function

```bash
# Deploy the verification function
supabase functions deploy verify-confirmation-fee --project-ref YOUR_PROJECT_REF

# Verify deployment
supabase functions list
```

### 3. Verify Configuration

Check that the edge function configuration is correct in `supabase/config.toml`:

```toml
[functions.verify-confirmation-fee]
verify_jwt = true
```

### 4. Test the Deployment

#### Test with curl:

```bash
# Set your environment variables
export SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"

# Test the function (with a real withdrawal transaction)
curl -X POST "$SUPABASE_URL/functions/v1/verify-confirmation-fee" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "your-withdrawal-transaction-uuid",
    "confirmation_fee_tx_hash": "bitcoin-transaction-hash"
  }'
```

#### Or use the test script:

```bash
./scripts/test-confirmation-fee.sh <transaction_id> <btc_tx_hash>
```

### 5. Update Admin Dashboard (Optional but Recommended)

To integrate this into your admin dashboard, add UI elements to:

1. **Display confirmation fee status** for pending withdrawals
2. **Input field** for BTC transaction hash
3. **Verify button** that calls the edge function
4. **Display verification results** (amount, confirmations, address)
5. **Enable/disable approval** based on verification status

Example integration code:

```typescript
// In your admin withdrawal component
const verifyConfirmationFee = async (withdrawalId: string, btcTxHash: string) => {
  const { data, error } = await supabase.functions.invoke('verify-confirmation-fee', {
    body: {
      transaction_id: withdrawalId,
      confirmation_fee_tx_hash: btcTxHash
    }
  });

  if (error || !data.fee_paid) {
    // Show error to admin
    toast.error(data?.error || 'Verification failed');
    return false;
  }

  // Show success and enable approval button
  toast.success(`Fee verified: ${data.actual_amount_btc} BTC`);
  return true;
};
```

## Verification Checklist

After deployment, verify:

- [ ] Database migrations applied successfully
- [ ] Edge function deployed and accessible
- [ ] Edge function requires JWT authentication
- [ ] New fields exist in transactions table:
  - `confirmation_fee_tx_hash`
  - `confirmation_fee_verified`
  - `confirmation_fee_verified_at`
- [ ] `approve_withdrawal_atomic` function requires verified fee
- [ ] `auto_approve_withdrawal` function requires verified fee
- [ ] Test with a real BTC transaction (recommended)

## Rollback Plan

If you need to rollback the changes:

### 1. Revert Database Functions

Create a new migration file to restore the old functions:

```sql
-- Restore old approve_withdrawal_atomic (without fee check)
-- Copy from: supabase/migrations/20251206002858_e4720d7e-4ec1-4da4-97b1-dd6926d71e44.sql

-- Restore old auto_approve_withdrawal (without fee check)
-- Copy from: supabase/migrations/20251211050639_586b9724-7ace-4498-826b-cd1515909202.sql
```

### 2. Remove Edge Function

```bash
supabase functions delete verify-confirmation-fee
```

### 3. Remove Database Fields (Optional)

Only if you need to completely remove the feature:

```sql
ALTER TABLE public.transactions
DROP COLUMN IF EXISTS confirmation_fee_tx_hash,
DROP COLUMN IF EXISTS confirmation_fee_verified,
DROP COLUMN IF EXISTS confirmation_fee_verified_at;

DROP INDEX IF EXISTS idx_transactions_confirmation_fee_verified;
```

## Monitoring

After deployment, monitor:

1. **Edge function logs**: Check Supabase dashboard → Edge Functions → verify-confirmation-fee → Logs
2. **Database logs**: Monitor for any errors in withdrawal approval
3. **User feedback**: Ensure admins can successfully verify fees
4. **Blockchain API**: Monitor Blockchair API calls and responses

## Troubleshooting

### Edge function returns 500 error
- Check environment variables are set (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
- Verify Blockchair API is accessible
- Check edge function logs for detailed error messages

### "Confirmation fee must be verified" error when approving
- This is expected - the fee must be verified first using the edge function
- Ensure the BTC transaction hash has been submitted and verified

### Verification fails with "Transaction not found"
- Verify the BTC transaction hash is correct
- Ensure transaction has been broadcast to Bitcoin network
- Check Blockchair API status

### Amount mismatch errors
- BTC price may have changed between calculation and payment
- Check if amount is within ±1% tolerance
- Consider updating AMOUNT_TOLERANCE_PERCENTAGE if needed

## Support

For issues or questions:
1. Check the logs in Supabase dashboard
2. Review documentation in `docs/CONFIRMATION_FEE_VERIFICATION.md`
3. Check GitHub issues for similar problems
4. Contact platform administrators

## Security Notes

⚠️ **Important Security Considerations:**

1. Never expose the service role key in client-side code
2. The edge function is admin-only (JWT required)
3. Always verify the BTC wallet address is correct: `bc1q3jjvkvy9wt54tn05qzk7spryramhkz7qltn2ny`
4. Monitor for suspicious verification attempts
5. Regularly audit the admin activity logs

## Next Steps

After successful deployment:

1. Train admin staff on using the verification feature
2. Update user-facing documentation about withdrawal fees
3. Monitor the first few verifications closely
4. Gather feedback from admins on the process
5. Consider adding automated email notifications for fee verification status
