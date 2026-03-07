

## Plan

### Task 1: Send Fee Breakdown Email to shawnspicer55@gmail.com

Call the `send-fee-breakdown-notification` edge function with the existing fee data ($200, $18, $123) for Shawn Spicer's $30,000 withdrawal. This is a direct API call — no code changes needed.

### Task 2: Fix Password Reset Flow

**Problem**: The current password reset has a race condition. When a user clicks the reset link in their email, Supabase creates a session automatically. The `checkUser` function in `Auth.tsx` sees this session and redirects to `/dashboard` before `PASSWORD_RECOVERY` event fires or `showResetPassword` is set. The user never sees the "Set New Password" form.

**Solution**: Create a dedicated `/reset-password` route that reliably catches the recovery flow.

**Changes**:

1. **Create `src/pages/ResetPassword.tsx`** — A standalone page that:
   - Listens for the `PASSWORD_RECOVERY` auth event
   - Shows the new password form (reuse existing UI from Auth.tsx)
   - Calls `supabase.auth.updateUser({ password })` then signs out and redirects to `/auth`

2. **Update `src/components/AnimatedRoutes.tsx`** — Add a public route for `/reset-password`

3. **Update `src/pages/Auth.tsx`** — Change the `redirectTo` in `resetPasswordForEmail` to use `/reset-password` instead of `/auth?type=recovery`. Remove the inline reset password UI and state since it moves to its own page.

4. **Update `src/pages/admin/Login.tsx`** — Same redirect fix for admin forgot password flow (point to `/reset-password`)

This ensures the reset form loads on a clean page without competing session-redirect logic.

