# Memory: architecture/localization/refresh-cadence-and-caching-v1
Updated: 2026-02-17

## Refresh Cadence Optimization
All 1,095 entries in `regional_content_cache` switched from **weekly** to **monthly** refresh cadence. This reduces LLM API costs by ~75% (from 4,380 calls/month to ~1,095 calls/month). The `seed-regional-transcreation` edge function now accepts `refresh_cadence` param ("weekly" | "monthly" | "quarterly") defaulting to "monthly", and `force_refresh` boolean to override cadence windows. Cadence-aware skip logic checks `last_refreshed_at` against the configured window before regenerating.

## Browser-Side Caching
`useRegionalTranscreation` now caches fetched content in `sessionStorage` with a 10-minute TTL per region+subRegion key. This eliminates redundant Supabase calls during a user's browsing session, reducing database reads by ~90% for returning visitors navigating between pages.

## Cost Impact
| Metric | Before | After |
|--------|--------|-------|
| Refresh cadence | Weekly | Monthly |
| LLM calls/month | ~4,380 | ~1,095 |
| DB reads/session | 1 per page load | 1 per 10 min |
| Upsert support | Insert-only | Update existing on refresh |

## hreflang SEO
Already fully implemented in `RegionalLandingPage.tsx` (lines 166-175): all 16 regions + x-default + JSON-LD structured data.
