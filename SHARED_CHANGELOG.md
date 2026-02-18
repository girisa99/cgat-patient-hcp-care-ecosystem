# SHARED CHANGELOG — GenieSuite Sprint (Feb 17-21, 2026)

## Format
Each entry: `[Date] [Developer] [Impact on Lovable|Impact on Claude|No Impact] — Description`

---

## Day 1 — Feb 18, 2026

### Lovable Entries

- [Feb 18] [Lovable] [No Impact] — **L-101 AUDIT COMPLETE**: RegionalLandingPage.tsx renders correctly for NAM, MENA (RTL), all 17 region slugs mapped. SEO hreflang present for all regions. DB + transcreation content merge works. No runtime errors.

- [Feb 18] [Lovable] [No Impact] — **L-102 AUDIT COMPLETE**: GenieExplorePage.tsx renders, use-case selection works. **Finding**: Uses legacy `arc` product ID (should be `hub`). Uses hardcoded product logos instead of importing from `GENIE_PRODUCTS`. Will fix in L-204 (Day 2).

- [Feb 18] [Lovable] [No Impact] — **L-103 FINDING**: GenieProductsPage.tsx hardcodes all product data (names, taglines, descriptions, features, pipeline counts) instead of importing from `src/constants/genie-products.ts`. Will fix in L-201 (Day 2).

- [Feb 18] [Lovable] [No Impact] — **L-104 FIX**: Legal pages (Terms, Privacy, Cookies) were behind auth — used `GenieStudioLayout` which requires login. Fixed to be publicly accessible with simple nav bar. AcceptableUse, ContentGuidelines, DMCA were already public.

- [Feb 18] [Lovable] [No Impact] — **ipapi.co CORS**: Geo-detection via `ipapi.co/json/` blocked by CORS in preview. Non-critical — fallback timezone detection works.

### Claude Entries
*(Add entries here)*

---
