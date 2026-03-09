

## Plan: Update Transactions and Balance for 1sergyu@gmail.com (YURI SERGYU)

### Current State
- **User**: YURI SERGYU (`4b350cbe-ef23-4be4-b0cd-6bb8cb62deea`)
- **Current balance**: $216,674.00 USDT
- **Transactions**:
  1. $30,000 withdrawal — pending
  2. $108,000 withdrawal — rejected
  3. $54,337 withdrawal — rejected

### Changes to Make

**1. Mark all 3 transactions as reversed**
- Update all transactions' `admin_notes` to include "REVERSED" and set status to `rejected` (the pending one will also become rejected/reversed).

**2. Set balance to $108,000 USDT**
- Use the `adjust_user_balance` database function or direct update to set balance from $216,674 to $108,000 (a deduction of $108,674).

### Data Operations (via insert/update tool)
- Update all 3 transaction records: set `admin_notes` to include "REVERSED" and ensure status reflects reversal.
- Update `profiles.balance_usdt` to `108000.00` for this user (will use the `admin_credit_balance` function with a negative adjustment, or direct admin balance adjustment).

### No Code Changes Required
This is purely a data update — no UI or schema modifications needed.

