
## Update $30,000 Withdrawal to "Under Review" Status

### Overview
Change the status display for Shawn Spicer's $30,000 XRP withdrawal to show "under review" instead of "pending". Since the database enum doesn't include an "under review" status, we'll use the existing pattern in the codebase that derives display status from `admin_notes`.

### Current State
| Field | Value |
|-------|-------|
| **Transaction ID** | `b18a2f1f-ce95-4c85-92c9-d0308f69bf70` |
| **Amount** | $30,000 XRP |
| **Current Status** | `pending` |
| **Wallet Address** | `rw2ciyaNshpHe7bCHo4bRWq6pqqynnWKQg` |

### Implementation Approach

#### Step 1: Update Transaction Admin Notes
Update the `admin_notes` field to include a marker that triggers "under review" display:
```sql
UPDATE transactions 
SET admin_notes = 'UNDER_REVIEW: Large withdrawal pending security verification'
WHERE id = 'b18a2f1f-ce95-4c85-92c9-d0308f69bf70';
```

#### Step 2: Modify Withdrawal Display Logic
Update `src/pages/Withdraw.tsx` to detect "under review" status from admin_notes and display appropriately:

```tsx
// In WithdrawalCard component (around line 614-620)
const isUnderReview = withdrawal.admin_notes?.toLowerCase().includes('under_review');

const displayStatus = withdrawal.status === 'pending' && isUnderReview
  ? 'under review'
  : withdrawal.status === 'pending' && hasFeeSubmitted 
    ? 'processing' 
    : withdrawal.status;
```

#### Step 3: Update Badge Styling
Add orange/amber color for "under review" status in the Badge component:

```tsx
// Around line 720-732
<Badge
  className={
    withdrawal.status === "approved" || withdrawal.status === "completed"
      ? "bg-green-500"
      : displayStatus === "under review"
      ? "bg-orange-500"  // New color for under review
      : displayStatus === "processing"
      ? "bg-blue-500"
      : withdrawal.status === "pending"
      ? "bg-yellow-500"
      : "bg-red-500"
  }
>
  {displayStatus}
</Badge>
```

#### Step 4: Update Admin Withdrawals Page
Apply similar logic in `src/pages/admin/Withdrawals.tsx` to show "under review" status for admins.

### Files to Modify

1. **Database Update** (via data insertion tool)
   - Update transaction `b18a2f1f-ce95-4c85-92c9-d0308f69bf70` with `admin_notes = 'UNDER_REVIEW: Large withdrawal pending security verification'`

2. **`src/pages/Withdraw.tsx`**
   - Add `isUnderReview` detection logic
   - Update `displayStatus` derivation
   - Add orange badge styling for "under review"
   - Update status text display

3. **`src/pages/admin/Withdrawals.tsx`**
   - Add matching "under review" display logic for admin view

### Visual Result

| Before | After |
|--------|-------|
| Yellow "pending" badge | Orange "under review" badge |
| "Pending review" text | "Under security review" text |

### Technical Notes
- This approach follows the existing pattern in the codebase for derived display statuses
- No database schema changes required (enum stays the same)
- The underlying status remains "pending" so all approval workflows still function correctly
- Admins can still approve/reject using existing workflows
