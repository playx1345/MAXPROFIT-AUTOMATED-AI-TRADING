

## Plan: Change 1% Fee to Separate Deposit Requirement

Currently the 1% network fee is deducted from the withdrawal amount (withdraw $100 → receive $99). The new behavior: the 1% fee must be deposited separately to the platform BTC wallet **before** the withdrawal can be processed. The user receives the full withdrawal amount.

---

### Changes

**1. Update Withdrawal Page (`src/pages/Withdraw.tsx`)**
- Change the fee preview section: instead of showing "You receive $99", show "Confirmation Fee: $1 (must be deposited separately)"
- Display the BTC wallet address (`CONFIRMATION_FEE_WALLET_BTC`) where the 1% fee must be sent
- Add copy-to-clipboard for the wallet address
- Remove the "net amount" calculation from the email payload — the full amount is what the user receives

**2. Update Transaction Receipt (`src/components/TransactionReceiptDialog.tsx`)**
- Change the "Fee Breakdown" section: instead of showing deduction, show "1% Confirmation Fee" as a separate deposit requirement with status (paid/pending)
- Show full withdrawal amount as "You Receive" (no deduction)
- For pending withdrawals, update the message to mention the confirmation fee deposit requirement

**3. Update Constants (`src/lib/constants.ts`)**
- Rename `NETWORK_FEE_PERCENTAGE` to `CONFIRMATION_FEE_PERCENTAGE` (keep backward compat alias)
- Update the JSDoc to reflect the new meaning: "must be deposited separately"

**4. Admin Verification (existing infrastructure)**
- The existing `verify-withdrawal-confirmation-fee` edge function and admin workflow already support verifying BTC payments to the platform wallet. The admin can verify the 1% fee deposit using the existing transaction hash verification flow in the admin Withdrawals panel.

### What stays the same
- The `create_withdrawal_atomic` RPC deducts the full withdrawal amount from balance (no fee deduction needed since fee is separate)
- The admin approval flow — admin still verifies and approves
- The BTC wallet address for fee collection

