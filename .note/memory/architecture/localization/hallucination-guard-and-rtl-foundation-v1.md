# Memory: architecture/localization/hallucination-guard-and-rtl-foundation-v1
Updated: 2026-02-17

## LLM Hallucination Mitigation
The `useRegionalTranscreation` hook now includes an `isHallucinatedContent()` guard that rejects transcreated content containing: JSON blobs (`"transcreated"`, `"cultural_tone"` keys), Chinese explanatory meta-text (请注意, 解释, 为了更符合), English meta-commentary (Explanation, It seems, Let's correct), or suspiciously long content with JSON brackets (>300 chars). Rejected content falls back to static config.

## Data Fixes Applied (2026-02-17)
8 hallucinated entries were cleaned in `regional_content_cache`:
- CJK parent + CJK_JP: `comparisonTranslationLabel` — was JSON blob → fixed to `翻訳`
- CJK parent: `statsLanguagesLabel` — was JSON blob → fixed to `言語`
- CJK_KR: `comparisonTranscreationExample` — mixed Korean+Chinese → clean Korean
- INDIA_SOUTH_ML: `comparisonTranscreationExample` — fixed to Malayalam
- MENA_ISRAEL: `demoHubSubheadline` — was JSON blob → clean Hebrew
- SA_MALDIVES: `scheduleDemoLabel` + `signInPrompt` — was JSON blob → clean Dhivehi

## RTL CSS Foundation
Added to `index.css`: `[dir="rtl"]` base rules for text alignment, margin flipping, flex reversal, hero/CTA/stats/comparison section RTL awareness. Non-Latin font families defined: `.font-arabic`, `.font-hebrew`, `.font-devanagari`, `.font-cjk`, `.font-bengali`, `.font-tamil`, `.font-thai`.

RTL is activated by `useRegionalDetection.setRegion()` which sets `document.documentElement.dir = 'rtl'` for Arabic regions.
