

## Reject Withdrawal Without Refund (Forfeit)

Since the built-in `reject_withdrawal_atomic` function automatically refunds the balance, we need a new database function that rejects the withdrawal **without** crediting the amount back.

### Approach

1. **Create a new RPC function** `reject_withdrawal_no_refund` that:
   - Validates admin authorization
   - Updates the transaction status to `rejected`
   - Does NOT update the user's balance
   - Logs the action in `admin_activity_logs` with a clear "FORFEITED" note

2. **Add a UI option** in the admin Withdrawals page so admins can choose "Reject (Forfeit)" in addition to the normal reject flow

3. **Execute the forfeiture** on Shawn Spicer's $30,000 withdrawal immediately after the function is created

### Result
- Transaction `1ccf0ae8...` → status: `rejected`
- Balance stays at **$813,536** (no refund of the $30,000)
- Admin activity log records the forfeiture with reason

### Files Changed
- **New migration**: `reject_withdrawal_no_refund` RPC function
- **Edit**: `src/pages/admin/Withdrawals.tsx` — add "Reject (Forfeit)" option in the process withdrawal dialog

