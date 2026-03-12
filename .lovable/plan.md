

## Website Scan Results & Fix Plan

### Issues Found

**1. Branding Inconsistency — "Live Win Trade" still in 10+ files**
The rebrand to "Win-Tradex" was only applied to Header, Footer, and DashboardLayout. These files still say "Live Win Trade":
- `index.html` — title, meta tags, OG tags, Twitter cards
- `src/hooks/useDynamicMeta.ts` — document title fallback
- `src/pages/Auth.tsx` — logo alt text, heading text, imports old `logo.jpg`
- `src/pages/admin/Login.tsx` — logo alt text, imports old `logo.jpg`
- `src/pages/ResetPassword.tsx` — imports old `logo.jpg`
- `src/pages/Landing.tsx` — features section title "Why Choose Live Win Trade?"
- `src/components/landing/StructuredData.tsx` — all schema.org data references old name/URL
- Edge function email templates (6 files) — still reference old `logo.jpg` URL and "Live Win Trade" branding

**2. Old Logo Import (`logo.jpg`) in 3 Frontend Files**
`Auth.tsx`, `admin/Login.tsx`, and `ResetPassword.tsx` import `@/assets/logo.jpg` instead of `@/assets/wtx-logo.png`. This may cause broken images if `logo.jpg` was replaced.

**3. Stale Canonical URL & OG URLs**
`index.html` and `StructuredData.tsx` reference `https://livewintradeiv.com/` which appears to be an old/incorrect domain. The published URL is `live-win-trade-invest.lovable.app`.

**4. No Functional Bugs Detected**
- No console errors
- No failed network requests
- Routing, lazy loading, error boundary, and session management all look correct
- Mobile nav, dashboard layout padding, and responsive breakpoints are properly configured

---

### Fix Plan

**Step 1: Update `index.html`**
Replace all "Live Win Trade" with "Win-Tradex" in title, meta, OG, and Twitter tags. Update canonical/OG URLs to the published domain.

**Step 2: Update `src/hooks/useDynamicMeta.ts`**
Change fallback title from "Live Win Trade" to "Win-Tradex".

**Step 3: Fix logo imports in Auth, Admin Login, ResetPassword**
Change `import logo from "@/assets/logo.jpg"` to `import logo from "@/assets/wtx-logo.png"` and update alt text to "Win-Tradex".

**Step 4: Update `src/pages/Landing.tsx`**
Change features section title from "Why Choose Live Win Trade?" to "Why Choose Win-Tradex?".

**Step 5: Update `src/components/landing/StructuredData.tsx`**
Replace all "Live Win Trade Investment" references with "Win-Tradex" and update URLs.

**Step 6: Update edge function email templates**
Update LOGO_URL and branding text in all 7 email template/function files to use "Win-Tradex" and the new logo URL.

Total: ~16 file edits, all branding alignment — no structural or functional changes.

