# Memory: features/genie-cast/region-specific-english-base-v1
Updated: just now

## Region-Specific English Base Scripts

### Problem
When a parent region (e.g., LATAM) has no English base script, the expansion workflow cannot generate sub-regional transcreations. Previously, only a single global `ENGLISH_BASE` was supported.

### Solution: Region-Specific English Bases
- Each parent region (latam, mena, india, eu, cjk, sea, africa, nam) can have its own English base script with `is_english_base: true` and `language_code: 'en'`
- The region code uses the lowercase parent code (e.g., `latam`, `mena`) — same as existing region codes in the `valid_region` constraint

### Expansion Priority
When expanding to sub-regions, the system queries for English base in this order:
1. **Region-specific English base** (e.g., `region_code = 'latam'`, `is_english_base = true`, `status = 'active'`)
2. **Global English base** (fallback: `region_code = 'ENGLISH_BASE'`)

### UI Indicators
- Parent regions show an **EN Base ✓** badge (green) if they have an active English base
- Parent regions show an **EN Base (draft)** badge if they have a draft English base
- Parent regions show a **⚠ No EN Base** badge (amber) if they're missing one
- A **"Create EN Base"** button appears in the card header for regions without one
- The button pre-fills content from the global English base (if available) for customization
- The "Expand to Sub-Regions" button is disabled when no English base (region-specific or global) is available

### Functions Modified
- `handleCreateRegionEnglishBase`: Creates a new region-specific English base (pre-fills from global base)
- `handleSaveEnglishBase`: Updated to handle both global and region-specific English bases
- `handleExpandToSubRegions`: Prefers region-specific English base, falls back to global
- `handleAutoExpandAndTranscreate`: Same priority logic

Last Updated: 2026-02-12
