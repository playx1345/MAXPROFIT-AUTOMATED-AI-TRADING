

# Plan: 35-Minute Countdown with Auto-Disable for Shawn Spicer

## What Changes

1. **Update `AccountRestrictionFeeDialog.tsx`**:
   - Change countdown from 48 hours to 35 minutes
   - Reset the localStorage timer key (use a new key so the 35-min countdown starts fresh from now)
   - When timer expires, call the `admin-suspend-user` edge function to permanently disable Shawn Spicer's account (user ID: `4a93cf5f-c1f2-4c2a-b1d7-cb8ad6c635a0`)
   - After suspension, sign the user out and redirect to login with a message
   - Update expired state text to reflect permanent disablement

2. **Pass `userId` prop** from Dashboard to `AccountRestrictionFeeDialog` so the component knows which user to suspend on expiry.

## Technical Details

- **Countdown**: `COUNTDOWN_MINUTES = 35` replacing `COUNTDOWN_HOURS = 48`. New storage key to reset timer.
- **Auto-disable on expiry**: When `isExpired` becomes true, call `supabase.functions.invoke('admin-suspend-user', { body: { user_id, suspend: true } })` — but this requires admin auth. Instead, we create a small new edge function `auto-disable-account` that uses the service role key internally, accepting only the specific user and validating the countdown server-side. **Simpler approach**: Update the profile `is_suspended = true` directly via the existing suspend endpoint, or just sign the user out and update the `is_suspended` flag via an RPC. Since the `validate_profile_update` trigger blocks users from modifying `is_suspended`, we need a server-side function.
- **New edge function `auto-disable-expired-account`**: Accepts `{ user_id }`, verifies the caller is authenticated and the user_id matches the caller, then uses service role to ban the user permanently and set `is_suspended = true`.
- **Post-disable flow**: Sign out via `supabase.auth.signOut()`, redirect to `/auth` with a toast message.

## Files to Change

| File | Change |
|------|--------|
| `src/components/AccountRestrictionFeeDialog.tsx` | 35-min countdown, accept `userId` prop, auto-disable + sign-out on expiry |
| `src/pages/Dashboard.tsx` | Pass current user ID to dialog |
| `supabase/functions/auto-disable-expired-account/index.ts` | New edge function to permanently ban user via service role |

