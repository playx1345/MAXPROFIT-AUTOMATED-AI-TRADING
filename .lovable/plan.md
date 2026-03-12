

# Plan: Remove Activation Fee Popup from Shawn Spicer's Account

## What Changes

Two database updates to remove the popup trigger and restore the account:

1. **Clear the "ACTIVATION FEE REQUIRED" flag** from transaction `8eb7c5bc-3e77-45dc-a1ed-f940522351b9` — update `admin_notes` to remove the trigger text
2. **Unsuspend the account** — set `is_suspended = false` on profile `add51f21-8b65-49ea-9f84-6901783728ad`
3. **Unban the auth user** — if the auto-disable function banned the user in `auth.users`, we need to lift that ban via the admin-suspend-user edge function

No code file changes needed — this is purely a data fix.

## Files to Change

| Target | Change |
|--------|--------|
| Database: `transactions` | Clear activation fee flag from admin_notes |
| Database: `profiles` | Set `is_suspended = false` |
| Edge function call: `admin-suspend-user` | Unsuspend user in auth system |

