# Genie Cast Video Generation Integration

## Date: 2026-02-03

## Summary

Fixed multiple issues with video generation pipeline and added credit tracking.

## Issues Fixed

### 1. JSON2Video Integration
- **Issue**: Videos stuck at "pending" status
- **Root Cause**: 
  - TTS audio returned as base64 but not persisted to storage
  - Visual URLs were placeholder paths that didn't exist
  - JSON2Video needs actual HTTP URLs, not base64 or placeholders
- **Fix Applied**:
  - `generateChapterAudio()` now uploads base64 audio to Supabase storage and returns real URL
  - `generateChapterVisual()` now returns actual brand asset URLs from `brand-assets` bucket
  - Added better response parsing for JSON2Video API (handles project, id, movie_id)

### 2. Credit/Token Consumption Tracking
- **Issue**: Credits weren't being tracked when API calls were made
- **Root Cause**: Wrong column names used (`credits_used` vs `credits_amount`)
- **Fix Applied**:
  - Updated `trackCreditConsumption()` to use correct schema:
    - `transaction_type`: 'debit'
    - `credits_amount`: negative number (debit)
    - `feature_used`: operation type
    - `feature_metadata`: JSON with provider, language, etc.

### 3. Magic Clips Integration
- **Created**: `src/hooks/useMagicClips.ts` - unified hook for generating platform-specific clips
- **Updated**: `ContentLibrary.tsx` - now calls actual edge function instead of placeholder
- **Platforms**: YouTube Shorts, TikTok, Instagram Reels, LinkedIn, Twitter/X, Facebook

## Database Schema

### ai_credit_transactions
```sql
id: uuid
user_id: uuid
transaction_type: text ('credit' | 'debit')
credits_amount: integer (positive for credit, negative for debit)
balance_after: integer
package_id: text
feature_used: text
feature_metadata: jsonb
description: text
created_at: timestamptz
```

### landing_page_videos
```sql
generation_status: 'pending' | 'processing' | 'completed' | 'failed'
generation_error: text
generation_started_at: timestamptz
```

## Cross-App Integration

| App | Feature | Status |
|-----|---------|--------|
| Production Hub/Admin | Full video generation | ✅ Complete |
| Content Library | Magic Clips generation | ✅ Complete |
| Vibe | Recording to cloud sync | ✅ Hook exists |
| Deck | Export to video (planned) | ⏳ Phase 2 |

## Edge Functions Updated

1. **genie-cast-assembler**
   - Audio now uploaded to storage with real URLs
   - Visual URLs point to actual brand assets
   - Credit tracking with correct schema
   - Better JSON2Video response handling

2. **magic-clips-generator**
   - Credit tracking with correct schema
   - Platform-specific clip generation

## Testing

```bash
# Test video assembly
curl -X POST https://ithspbabhmdntioslfqe.supabase.co/functions/v1/genie-cast-assembler \
  -H "Content-Type: application/json" \
  -d '{"language": "en", "quality": "production"}'

# Check logs
supabase functions logs genie-cast-assembler
```

## Next Steps

1. **Phase 2: Cloud Run GPU**
   - Avatar lip-sync (Alibaba Wan2.2)
   - 3D generation (Meshy AI)
   - Long video processing

2. **Phase 3: Custom FFmpeg**
   - Replace JSON2Video with self-hosted solution
   - Lower costs, more control
