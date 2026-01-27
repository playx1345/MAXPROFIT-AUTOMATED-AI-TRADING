

# Pull-to-Refresh for Mobile Dashboard Pages

## Overview
Implement a native-app-style pull-to-refresh gesture for mobile dashboard pages. This feature will allow users to refresh data by pulling down on the page, providing immediate visual feedback with a spinner animation and haptic feedback for a premium mobile experience.

---

## Current State Analysis

| Aspect | Status |
|--------|--------|
| **Mobile Detection** | `useIsMobile()` hook exists |
| **Haptic Feedback** | Already implemented in `MobileNav` |
| **Data Fetching** | Each page has its own `fetchData` function |
| **PWA Support** | Fully configured |
| **Touch Gestures** | Not implemented for pull-to-refresh |

---

## Implementation Approach

### New Reusable Hook: `usePullToRefresh`
Create a custom hook that handles:
- Touch event tracking (touchstart, touchmove, touchend)
- Pull distance calculation with resistance curve
- Threshold detection for triggering refresh
- Visual feedback state management
- Haptic feedback integration
- Mobile-only activation

### New Component: `PullToRefresh`
A wrapper component that provides:
- Visual pull indicator with animated spinner
- Smooth elastic animation during pull
- Loading state during refresh
- Seamless integration with existing page layouts

---

## Technical Details

### Hook Implementation (`src/hooks/usePullToRefresh.ts`)

```text
Key features:
- Track touch start position
- Calculate pull distance with diminishing returns (resistance)
- Trigger refresh when pull exceeds threshold (80px)
- Provide haptic feedback at threshold
- Return: { pullDistance, isRefreshing, isPulling, containerRef }
- Only activate on mobile devices
- Disable when scrolled away from top
```

### Component Implementation (`src/components/PullToRefresh.tsx`)

```text
Visual elements:
- Animated spinner icon that rotates based on pull distance
- Progress indicator showing pull progress
- "Pull to refresh" / "Release to refresh" / "Refreshing..." text
- Smooth spring animation for release
- Glass-card styling matching the design system
```

### CSS Animations (`src/index.css`)

```text
New animations:
- pull-indicator fade and scale
- spinner rotation
- elastic spring effect for content
- Reduced motion support
```

---

## Pages to Update

| Page | File | Fetch Function |
|------|------|----------------|
| Dashboard | `src/pages/Dashboard.tsx` | `fetchData()` |
| Transactions | `src/pages/Transactions.tsx` | `fetchTransactions()` |
| Investments | `src/pages/Investments.tsx` | `fetchData()` |
| Withdraw | `src/pages/Withdraw.tsx` | Existing fetch logic |
| Deposit | `src/pages/Deposit.tsx` | Existing fetch logic |
| Profile | `src/pages/Profile.tsx` | Existing fetch logic |
| Referrals | `src/pages/Referrals.tsx` | Existing fetch logic |

---

## Files to Create

### 1. `src/hooks/usePullToRefresh.ts`

Custom hook with the following interface:

```typescript
interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number; // Default: 80px
  resistance?: number; // Default: 2.5
}

interface UsePullToRefreshReturn {
  containerRef: RefObject<HTMLDivElement>;
  pullDistance: number;
  isPulling: boolean;
  isRefreshing: boolean;
}
```

### 2. `src/components/PullToRefresh.tsx`

Wrapper component:

```typescript
interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
}
```

---

## Files to Modify

### 1. `src/index.css`
Add pull-to-refresh animations and styles:
- `.pull-indicator` - The visual refresh indicator
- `.pull-spinner` - Rotating arrow/spinner icon
- `@keyframes pull-rotate` - Rotation animation
- `@keyframes pull-bounce` - Elastic bounce effect

### 2. `src/pages/Dashboard.tsx`
- Wrap content with `<PullToRefresh>` component
- Pass `fetchData` as the refresh handler
- Add loading state management

### 3. `src/pages/Transactions.tsx`
- Wrap content with `<PullToRefresh>`
- Pass `fetchTransactions` as handler

### 4. `src/pages/Investments.tsx`
- Wrap content with `<PullToRefresh>`
- Pass `fetchData` as handler

### 5. Other dashboard pages
- Apply same pattern to Withdraw, Deposit, Profile, Referrals

---

## Visual Design

### Pull Indicator States

| State | Visual | Icon |
|-------|--------|------|
| **Idle** | Hidden | - |
| **Pulling (< threshold)** | Faded spinner | Arrow down, partial rotation |
| **Ready (>= threshold)** | Full opacity, glow | Rotated arrow |
| **Refreshing** | Pulsing spinner | Loading animation |

### Animation Timing
- Pull resistance: Exponential decay for natural feel
- Release animation: 300ms spring ease
- Spinner rotation: Synced with pull distance (0-360deg)
- Haptic feedback: Triggered at threshold crossing

---

## Haptic Feedback Integration

```typescript
// Triggered when crossing the refresh threshold
const triggerHaptic = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(10); // Light tap
  }
};

// On refresh complete
const onRefreshComplete = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate([5, 50, 5]); // Success pattern
  }
};
```

---

## Performance Considerations

- Use `passive: false` for touch events to allow `preventDefault()`
- Use `transform` instead of `top/margin` for smooth 60fps animation
- Debounce scroll position checks
- Only activate when at scroll position 0
- Disable pull gesture on desktop (mouse events)
- Respect `prefers-reduced-motion` media query

---

## Accessibility

- Announce refresh status to screen readers via `aria-live`
- Provide visual feedback for all states
- Respect reduced motion preferences
- Maintain focus management during refresh

---

## Implementation Order

1. Create `usePullToRefresh` hook
2. Create `PullToRefresh` component
3. Add CSS animations to `index.css`
4. Integrate with `Dashboard.tsx` first
5. Test on mobile devices
6. Roll out to remaining dashboard pages

---

## Expected Result

Users on mobile devices will be able to:
1. Pull down from the top of any dashboard page
2. See a visual indicator showing pull progress
3. Feel haptic feedback when the refresh threshold is reached
4. Release to trigger a data refresh
5. See a loading spinner during the refresh
6. See fresh data once complete

This creates a native-app-like experience matching iOS and Android refresh patterns.

