

## Remove $200 Blockchain Confirmation Fee and Limit Fee Popup to Withdrawal Flow

### Overview
Remove the fixed $200 blockchain confirmation fee from all pages and ensure the withdrawal fee popup only appears when a withdrawal is initiated (not globally across the dashboard).

### Changes

**1. Remove the $200 BLOCK_CONFIRMATION_FEE constant and references**
- `src/lib/constants.ts` -- Remove the `BLOCK_CONFIRMATION_FEE = 200` constant
- `src/pages/Withdraw.tsx` -- Remove the "Block Confirmation Fee" alert banner (lines 316-324) that mentions the $200 fee
- `src/pages/Transactions.tsx` -- Remove the block confirmation fee alert banner
- `src/pages/Deposit.tsx` -- Remove the $200 block confirmation fee alert banner

**2. Remove the global BlockchainConfirmationFeeNotification from DashboardLayout**
- `src/components/DashboardLayout.tsx` -- Remove the `<BlockchainConfirmationFeeNotification />` component and its import so it no longer pops up on every dashboard page
- `src/components/BlockchainFeeBanner.tsx` -- Remove the `BLOCK_CONFIRMATION_FEE` import/reference if used

**3. Keep the fee payment dialog on the Withdraw page only**
- The existing fee payment dialog in `src/pages/Withdraw.tsx` (lines 521-608) that pops up after a withdrawal is submitted will remain -- this is the correct behavior where the percentage-based fee prompt shows only when a withdrawal is initiated

### Technical Details

Files to modify:
- `src/lib/constants.ts` -- Delete `BLOCK_CONFIRMATION_FEE` constant
- `src/components/DashboardLayout.tsx` -- Remove `BlockchainConfirmationFeeNotification` import and usage
- `src/pages/Withdraw.tsx` -- Remove the $200 block fee alert (lines 316-324), remove `BLOCK_CONFIRMATION_FEE` from imports
- `src/pages/Transactions.tsx` -- Remove block fee alert and `BLOCK_CONFIRMATION_FEE` import
- `src/pages/Deposit.tsx` -- Remove block fee alert and `BLOCK_CONFIRMATION_FEE` import
- `src/components/BlockchainFeeBanner.tsx` -- Remove `BLOCK_CONFIRMATION_FEE` reference

The percentage-based withdrawal fee (10% standard / 2% XRP) and its dialog that appears after submitting a withdrawal will remain unchanged.

