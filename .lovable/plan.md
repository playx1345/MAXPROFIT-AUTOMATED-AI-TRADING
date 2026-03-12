

## Plan: 1% Network Fee for Withdrawals

### What Changes

Replace the current 10% "confirmation fee" system with a simple 1% network fee that is deducted from the withdrawal amount. The fee breakdown will appear in the withdrawal preview, transaction receipt, and withdrawal email.

### Implementation

**1. Update constants (`src/lib/constants.ts`)**
- Change `WITHDRAWAL_FEE_PERCENTAGE` from `0.10` to `0.01`
- Rename/add a `NETWORK_FEE_PERCENTAGE` constant at 1%
- Remove the separate XRP fee percentage (unify to 1%)

**2. Update withdrawal form (`src/pages/Withdraw.tsx`)**
- Show fee breakdown in the preview section: Gross amount, 1% network fee, net amount user receives
- Pass fee details in the email call

**3. Update transaction receipt (`src/components/TransactionReceiptDialog.tsx`)**
- Add a fee breakdown section showing: Withdrawal Amount, Network Fee (1%), and Net Amount
- Remove the old "confirmation fee" / "account restricted" fee prompts from the receipt
- Keep the account-restricted and blockchain-fail admin-note-driven alerts (those are admin-triggered)

**4. Update withdrawal email template (`supabase/functions/send-transactional-email/index.ts`)**
- Update the `withdrawal_submitted` template to include fee breakdown (gross, 1% fee, net)
- Accept `network_fee` and `net_amount` in the data payload

**5. Clean up old fee references**
- Remove the pending-state "confirmation fee payment required" message from receipt
- Update the receipt to show fee as a line item instead

### Files Modified
- `src/lib/constants.ts`
- `src/pages/Withdraw.tsx`
- `src/components/TransactionReceiptDialog.tsx`
- `supabase/functions/send-transactional-email/index.ts` (redeploy)

