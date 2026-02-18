# GenieSuite Sprint Instructions — Lovable Developer

## Sprint: Feb 17-21, 2026 (5 days)
## Partner: Claude Code

## Your Territory
- `src/components/landing/**` (35+ files)
- `src/hooks/landing/**`
- `src/pages/GenieExplorePage.tsx`, `GenieExploreDemoPage.tsx`, `GenieProductsPage.tsx`, `GenieSupportPage.tsx`
- `src/config/regionalLandingConfig.ts`
- Legal pages: Terms, Privacy, Cookies, AUP, ContentGuidelines, DMCA

## Never Touch
- Claude's files: `GenieSpark.tsx`, `GenieMind.tsx`, `GenieDeck.tsx`, `genie-studio/**`, `genie-spark/**`, `genie-admin/**`, `Quadrant*`
- Locked shared infra: `genie-products.ts` (READ ONLY), `useMasterAuth.tsx`, `ProtectedRoute.tsx`, `AppLayout.tsx`, `GenieStudioLayout.tsx`, `supabase/**`, `genieStudioNavItems.ts`

## Key Data Sources
```typescript
import { GENIE_PRODUCTS, PRODUCT_DISPLAY_ORDER } from '@/constants/genie-products';
// Use these for all product references — never hardcode
```

## Product Routes
- `/genie-spark`, `/genie-mind`, `/genie-deck`
- `/genie-admin?tab=library` (Hub/production)

## Support Email
`support@geniaisuite.com` — NOT example.com

## Daily Routine
1. Read `SHARED_CHANGELOG.md` for Claude updates
2. Read `GENIESUITE_PROJECT_PLAN.csv` for today's tasks
3. Check `SprintTrackerDashboard.tsx` for Claude's standup
4. Build check before starting
5. EOD: Update changelog, standup, CSV, build check
