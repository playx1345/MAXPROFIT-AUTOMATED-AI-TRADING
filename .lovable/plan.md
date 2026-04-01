
## 12-Hour Withdrawal Restriction System

### Overview
Admins can impose a 12-hour restriction on specific users requiring them to complete a withdrawal. Users see a countdown timer on their dashboard. If the deadline passes without an approved withdrawal, the account is automatically suspended.

### Database Changes

**1. New `user_restrictions` table**
- `id`, `user_id`, `restriction_type` (e.g., 'withdrawal_deadline'), `deadline` (timestamp), `created_by` (admin UUID), `admin_email`, `status` ('active', 'expired', 'completed', 'suspended'), `message` (custom message), `created_at`
- RLS: Admins can CRUD, users can read own active restrictions

### Backend Changes

**2. Edge function: `auto-suspend-restricted-accounts`**
- Scheduled via pg_cron every 5 minutes
- Checks for active restrictions past deadline where user has no approved/completed withdrawal
- Suspends the user account (`is_suspended = true`) and updates restriction status to 'suspended'

### Admin UI Changes

**3. Add "Restrict User" button in admin Users page**
- Dialog to set a 12-hour withdrawal deadline on a user
- Optional custom message field
- Logs action in admin_activity_logs

### User Dashboard Changes

**4. Withdrawal restriction countdown on Dashboard**
- Query active restrictions for current user
- Show prominent countdown timer with message
- "If you are having challenges, contact admin support"
- When completed (approved withdrawal exists), mark restriction as 'completed'

### Withdrawal Flow
The existing flow remains: pending → approved/completed or rejected. The restriction simply monitors whether an approved withdrawal exists before the deadline.

### Files
- Migration: `user_restrictions` table + RLS policies
- `supabase/functions/auto-suspend-restricted-accounts/index.ts`
- `src/components/WithdrawalRestrictionBanner.tsx` (countdown UI)
- `src/pages/Dashboard.tsx` (add restriction banner)
- `src/pages/admin/Users.tsx` (add restrict button + dialog)
