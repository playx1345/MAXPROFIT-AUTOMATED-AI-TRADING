

## Plan: Comprehensive Win-Tradex Platform Update

This is a large, multi-area improvement. I'll group changes into focused tasks.

---

### 1. Cleanup: Remove Old Fee Components & References

Delete unused files that are no longer imported anywhere:
- `src/components/BlockchainConfirmationFeeNotification.tsx`
- `src/components/BlockchainFeeBanner.tsx`
- `src/components/UpgradeFeeNotification.tsx`
- `src/components/BlockchainConfirmationProgress.tsx`
- `src/hooks/useBlockchainFeeCountdown.ts`
- `src/hooks/useBlockchainVerification.ts`
- `src/components/BlockchainVerificationBadge.tsx`

Remove `CONFIRMATION_FEE_WALLET_BTC` import from `TransactionReceiptDialog.tsx` and delete the "Account Restricted" section that references the old $3,000 BTC fee. Keep the admin-note-driven restriction alert (from `AccountRestrictionFeeDialog`) since that's a separate business system.

---

### 2. Withdrawal Receipt: Add "Waiting for Admin Confirmation"

In `TransactionReceiptDialog.tsx`, update the pending status message from generic "pending review" to:

> "Waiting for admin confirmation. Your withdrawal will be processed shortly."

This makes the receipt clearer about what's happening.

---

### 3. Email Verification Enforcement

Currently, after signup, users can sign in without verifying their email. Fix:

- In `Auth.tsx` `handleSignIn`: after successful `signInWithPassword`, check `data.user.email_confirmed_at`. If null, sign the user out and show a toast: "Please verify your email before signing in."
- In `handleSignUp`: update the success toast to explicitly say "Please check your email and verify your account before signing in."

This enforces email verification without changing backend settings.

---

### 4. UI/UX Animations & Polish

**Global CSS additions (`src/index.css`):**
- Add subtle hover/focus transitions for all interactive elements
- Add a `@keyframes shimmer` for loading states
- Add button press feedback animation (scale-down on active)
- Improve card hover effects with subtle lift

**Button animations (`src/components/ui/button.tsx`):**
- Add `active:scale-[0.97]` and `transition-all duration-200` to base variant

**Card hover effects:**
- Already have `glass-card-enhanced` but add a universal subtle hover lift

**Loading skeleton shimmer:**
- Add a shimmer animation class for skeleton loading states

---

### 5. Performance Optimizations

**Withdraw page (`src/pages/Withdraw.tsx`):**
- Fix the `useCallback` for `fetchAllData` — it references `fetchBalance` and `fetchRecentWithdrawals` but doesn't include them in deps (currently works due to hoisting but is a potential stale closure bug). Wrap `fetchBalance` and `fetchRecentWithdrawals` in `useCallback`.

**Dashboard page:**
- The `sparklineData` useMemo generates random data every mount — already memoized, no issue.

**General:**
- Add `will-change-transform` to animated elements selectively
- Ensure `loading="lazy"` on non-critical images

---

### 6. Improved Error Handling in Auth & Withdrawal

**Auth page:**
- Add specific error messages for common Supabase auth errors ("Invalid login credentials" → friendlier message)

**Withdrawal page:**
- Already has try/catch with toast — no changes needed

**Email sending (`src/lib/email-utils.ts`):**
- Add simple retry logic (1 retry after 2s delay) for transactional emails

---

### Files Modified
- **Delete**: `BlockchainConfirmationFeeNotification.tsx`, `BlockchainFeeBanner.tsx`, `UpgradeFeeNotification.tsx`, `BlockchainConfirmationProgress.tsx`, `BlockchainVerificationBadge.tsx`, `useBlockchainFeeCountdown.ts`, `useBlockchainVerification.ts`
- **Edit**: `TransactionReceiptDialog.tsx` — remove old fee references, add "Waiting for admin confirmation"
- **Edit**: `Auth.tsx` — enforce email verification on sign-in
- **Edit**: `src/index.css` — add animation utilities (shimmer, hover transitions)
- **Edit**: `src/components/ui/button.tsx` — add press feedback
- **Edit**: `src/lib/email-utils.ts` — add retry logic
- **Edit**: `src/pages/Withdraw.tsx` — fix useCallback deps

