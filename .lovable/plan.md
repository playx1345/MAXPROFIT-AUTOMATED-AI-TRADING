

# Tone Down Light Mode Saturation

## Overview
Reduce the saturation intensity of the warm light mode colors to create a more subtle, refined appearance while maintaining the warm cream/ivory aesthetic.

---

## Color Adjustments

| Variable | Current (Too Intense) | New (Balanced) |
|----------|----------------------|----------------|
| `--background` | `38 45% 95%` | `38 30% 96%` |
| `--foreground` | `25 35% 12%` | `25 25% 15%` |
| `--card` | `42 50% 98%` | `42 35% 98%` |
| `--primary` | `40 95% 42%` | `42 80% 45%` |
| `--primary-glow` | `38 100% 48%` | `40 85% 50%` |
| `--accent` | `32 95% 42%` | `35 75% 45%` |
| `--muted` | `38 28% 88%` | `38 20% 90%` |
| `--muted-foreground` | `28 20% 38%` | `30 15% 42%` |
| `--secondary` | `35 35% 90%` | `35 25% 92%` |
| `--destructive` | `8 80% 48%` | `5 65% 50%` |
| `--success` | `140 60% 35%` | `145 50% 38%` |
| `--warning` | `40 95% 42%` | `42 80% 45%` |
| `--border` | `35 30% 82%` | `35 20% 85%` |
| `--sidebar-accent` | `38 35% 92%` | `38 22% 94%` |

---

## Gradient & Shadow Adjustments

**Gradients** will use the new reduced saturation values:
- Primary gradient: `80%` saturation instead of `95%`
- Accent gradient: `75%` saturation instead of `95%`

**Shadows** will be slightly more neutral:
- Reduce amber tint from `hsl(28 40%)` to `hsl(30 25%)`
- Reduce gold glow intensity from `0.4` to `0.3` opacity

---

## File to Modify

| File | Changes |
|------|---------|
| `src/index.css` | Update `:root` light mode variables (lines 46-140) |

---

## Expected Result
A softer, more refined warm light mode that feels elegant rather than intense—still noticeably warm with cream/ivory backgrounds and gold accents, but without the high saturation that can feel overwhelming.

