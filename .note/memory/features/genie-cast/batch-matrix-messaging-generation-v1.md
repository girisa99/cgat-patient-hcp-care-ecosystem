# Memory: features/genie-cast/batch-matrix-messaging-generation-v1
Updated: just now

## Batch & Matrix Messaging Generation

### New Capabilities Added

The MessagingGeneratorPanel now supports three generation modes:

**1. Single Product** (default)
- Generate messaging for one selected product
- Select target audiences
- Traditional single-item workflow

**2. All 7 Products at Once** (Batch)
- One-click generation for all main products: Spark, Mind, Vibe, Deck, Arc, Cast, Ask Genie
- Same target audiences applied to all
- Sequential processing with progress indicator

**3. Full Matrix** (Product × Audience)
- Generate unique messaging for every product-audience combination
- 7 products × 6 audiences = 42 combinations
- Visual matrix grid showing coverage status
- "Approve All" batch approval workflow

### Regional Transcreation Options

Users can choose when messaging gets transcreated to 14 languages:

1. **At Video Production** (default, recommended)
   - English master messaging stored
   - Transcreation happens on-demand when generating regional videos
   - Most efficient for credits

2. **Immediate Transcreation**
   - Generate messaging in all 14 languages upfront
   - Higher credit cost but all languages ready immediately
   - Languages: EN, AR, ZH, JA, KO, ES, FR, DE, PT, HI, BN, UR, ID, SW

3. **English Only**
   - No transcreation at all
   - For English-only deployments

### UI Changes

**Generate Tab:**
- Radio group for generation mode selection
- Multi-product checkbox list (for custom batch)
- Transcreation mode selector
- Batch progress indicator with per-product status

**New Matrix Tab:**
- Visual grid showing Product × Audience coverage
- Checkmarks for approved combinations
- "Generate Full Matrix" one-click action

**Pending Tab:**
- "Approve All" bulk approval button
- Per-request approve/reject controls

### Flow

1. Select generation mode (Single / All Products / Matrix)
2. Select target audiences
3. Choose transcreation timing
4. Click Generate
5. Review in Pending tab
6. Approve individually or "Approve All"
7. Approved messaging available in video generation

### Files Modified

- `src/components/genie-admin/MessagingGeneratorPanel.tsx` - Complete rewrite with batch/matrix support

### Integration with Video Generation

When generating videos:
1. Enable "Use Approved Messaging" toggle
2. System pulls approved messaging for the product
3. If transcreation mode was "immediate", uses pre-translated version
4. If transcreation mode was "deferred", transcreates on-the-fly during generation
