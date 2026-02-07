
# Add Spanish Language + Translate All Pages Including Admin Dashboard

## Overview
Add Spanish (es) as the 7th supported language and ensure **all pages** -- including the entire admin dashboard -- are fully translatable using the existing i18n infrastructure. Currently, admin pages use hardcoded English strings everywhere.

---

## Scope of Work

### Part 1: Add Spanish Locale
- Create `src/i18n/locales/es.json` with full Spanish translations for all keys (matching the ~446-line `en.json` structure plus new admin keys)
- Register Spanish in `src/i18n/index.ts`:
  - Import the new locale file
  - Add `{ code: 'es', name: 'Espanol', flag: '\u{1F1EA}\u{1F1F8}', dir: 'ltr' }` to the `languages` array
  - Add `es` to `resources` and `supportedLngs`
- Update `src/i18n/locales/en.json` language section to include `"es": "Spanish"`

### Part 2: Add Admin Translation Keys to `en.json`
Extend the existing `admin` section in `en.json` with keys covering every admin page. New keys will include:

```
admin.dashboard.*       - Dashboard title, stats labels, quick actions, activity
admin.users.*           - User management, KYC actions, balance adjustments
admin.deposits.*        - Deposit management, bulk actions, verification
admin.withdrawals.*     - Withdrawal management, approval flow, reversal
admin.investments.*     - Investment overview, details
admin.transactions.*    - Transaction history, filters
admin.tradingBot.*      - Bot performance, trade recording
admin.activityLog.*     - Log display, action labels
admin.settings.*        - All settings sections (wallets, fees, system)
admin.reversals.*       - Reversal history and details
admin.analytics.*       - Chart labels, KPIs, time ranges
admin.login.*           - Login form, password reset
admin.sidebar.*         - Menu items, sign out
admin.common.*          - Shared admin labels (approve, reject, bulk, search, etc.)
```

### Part 3: Translate Admin Pages (11 files)
Each admin page will be updated to:
1. Import `useTranslation` from `react-i18next`
2. Call `const { t } = useTranslation()`
3. Replace all hardcoded strings with `t('admin.xxx.yyy')` calls

**Files to modify:**

| File | Hardcoded Strings Count (approx) |
|------|----------------------------------|
| `src/components/AdminLayout.tsx` | ~15 (sidebar menu labels, title, sign out) |
| `src/pages/admin/Dashboard.tsx` | ~25 (stats, quick actions, activity) |
| `src/pages/admin/Users.tsx` | ~60 (table headers, dialogs, forms, toasts) |
| `src/pages/admin/Deposits.tsx` | ~40 (tabs, table, dialogs, bulk actions) |
| `src/pages/admin/Withdrawals.tsx` | ~50 (tabs, table, approval flow, reversal) |
| `src/pages/admin/Investments.tsx` | ~20 (table headers, details dialog) |
| `src/pages/admin/Transactions.tsx` | ~15 (filters, table headers) |
| `src/pages/admin/TradingBot.tsx` | ~25 (stats, form, table) |
| `src/pages/admin/ActivityLog.tsx` | ~20 (action labels, table) |
| `src/pages/admin/Settings.tsx` | ~40 (section titles, labels, descriptions) |
| `src/pages/admin/Reversals.tsx` | ~20 (action labels, filters, table) |
| `src/pages/admin/Login.tsx` | ~20 (login form, reset password) |
| `src/pages/admin/Analytics.tsx` | ~15 (chart labels, KPIs, time ranges) |

### Part 4: Add LanguageSelector to Admin Layout
- Import `LanguageSelector` and `ThemeToggle` in `AdminLayout.tsx`
- Add them to the sidebar footer area (above the Sign Out button), matching the user dashboard pattern

### Part 5: Mirror to All Other Locale Files
Add the same new `admin.*` keys to all 6 other locale files:
- `ar.json`, `ko.json`, `ro.json`, `ru.json`, `uk.json`
- These will initially contain the English text as placeholders (the translation structure will be in place for future professional translation)

---

## Technical Details

### Translation Key Convention
Following the existing pattern:
- Section-based nesting: `admin.dashboard.title`, `admin.users.searchPlaceholder`
- Toast messages: `admin.users.createSuccess`, `admin.deposits.approveError`
- Form labels: `admin.settings.walletAddresses`, `admin.settings.confirmationFee`

### Files Modified (Total: ~20 files)
1. `src/i18n/index.ts` -- register Spanish
2. `src/i18n/locales/en.json` -- add ~300 admin translation keys
3. `src/i18n/locales/es.json` -- new file with full Spanish translations
4. `src/i18n/locales/ar.json` -- add admin keys (English placeholders)
5. `src/i18n/locales/ko.json` -- add admin keys (English placeholders)
6. `src/i18n/locales/ro.json` -- add admin keys (English placeholders)
7. `src/i18n/locales/ru.json` -- add admin keys (English placeholders)
8. `src/i18n/locales/uk.json` -- add admin keys (English placeholders)
9. `src/components/AdminLayout.tsx` -- add `useTranslation`, translate sidebar
10. `src/pages/admin/Dashboard.tsx` -- translate all strings
11. `src/pages/admin/Users.tsx` -- translate all strings
12. `src/pages/admin/Deposits.tsx` -- translate all strings
13. `src/pages/admin/Withdrawals.tsx` -- translate all strings
14. `src/pages/admin/Investments.tsx` -- translate all strings
15. `src/pages/admin/Transactions.tsx` -- translate all strings
16. `src/pages/admin/TradingBot.tsx` -- translate all strings
17. `src/pages/admin/ActivityLog.tsx` -- translate all strings
18. `src/pages/admin/Settings.tsx` -- translate all strings
19. `src/pages/admin/Reversals.tsx` -- translate all strings
20. `src/pages/admin/Login.tsx` -- translate all strings
21. `src/pages/admin/Analytics.tsx` -- translate all strings

### Implementation Order
Due to the large number of files, implementation will be batched:
1. First: Create `es.json` and update `i18n/index.ts` and `en.json` with all new admin keys
2. Second: Update `AdminLayout.tsx` and all admin page components
3. Third: Mirror admin keys to remaining locale files

### Preserved Behavior
- All existing translations remain untouched
- Fallback to English (`fallbackLng: 'en'`) ensures no broken strings
- Language detection order (localStorage, navigator, htmlTag) is unchanged
- RTL support for Arabic is unaffected
- User-facing pages (Landing, Dashboard, Auth, etc.) already work with i18n and will automatically get Spanish support
