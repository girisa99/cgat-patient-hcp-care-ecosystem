# Memory: features/genie-cast/style-to-capability-derivation
Updated: just now

## Style → Production Capability Auto-Derivation

### Verified Stats
- **43 video styles** across 8 categories in `MASTER_VIDEO_STYLES`
- **6 production capabilities** in `PRODUCTION_CONTEXT_TONES`
- **Extended styles**: Additional styles in `extended-video-styles.ts`

### Derivation Logic (`deriveProductionCapability()`)
Located in `src/config/video-style-pipeline-mapping.ts`:

| Priority | Detection | → Capability |
|---|---|---|
| 1 | `avatarProvider` present | `avatar_lipsync` |
| 2 | meshy/3d in providers | `3d_vr` |
| 3 | investor_relations, internal_comms, compliance | `ppt_slides` |
| 4 | TTS narrative/documentary/warm | `stock_remix` |
| 5 | Fast/dynamic pacing | `motion_graphics` |
| 6 | social_shorts, ad_creative | `banner_static` |
| 7 | Default | `motion_graphics` |

### Reverse Lookup
`getStylesForCapability(capability)` returns all styles matching a given capability — useful for filtering style cards when a production capability is pre-selected.

### Content Pool Integration
The Content Pool (`useContentPool`) provides product metadata, brand assets, audiences, and regional scripts. When a user selects a template/style:
1. Style → `deriveProductionCapability()` → `ProductionCapability`
2. Capability → `PRODUCTION_CONTEXT_TONES` → tone directive injected into AI prompt
3. Content Pool enriches the prompt with product-specific data
4. Messaging output is automatically adapted to the production format

### Files Modified
- `src/config/video-style-pipeline-mapping.ts` — Added `deriveProductionCapability()`, `getStylesForCapability()`
- `src/services/marketing/aiMessagingGeneratorService.ts` — `PRODUCTION_CONTEXT_TONES` (from previous step)
