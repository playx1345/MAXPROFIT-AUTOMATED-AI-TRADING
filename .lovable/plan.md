

## Improve Mobile Responsive Scrolling Across All Pages

### Problem
On mobile devices, some pages may have scrolling issues due to:
- The `overscroll-contain` property on the main content area can interfere with natural scrolling
- Fixed header (52px) and bottom nav (72px) padding may clip content on smaller screens
- The `overflow-auto` on the main element combined with `min-h-screen` can create nested