# Review Step Data Binding & Generation Status Fix

## Issue Summary
Users reported that after generation, the Review step wasn't showing content properly:
- Scripts not displaying correctly
- No visuals/video showing
- Voice/TTS not playing
- Assets sidebar showing empty

## Root Causes Identified
1. **Script field duplication** - Scripts stored in both `chapter.script` and `chapter.generatedContent.script`
2. **Pending vs Generated confusion** - Review step showed "No Content" if no fully-generated script existed
3. **Missing fallback display** - AI-suggested prompts weren't shown as previews
4. **TTS network errors** - Unhandled network failures from multi-provider-tts

## Fixes Applied

### 1. Enhanced Review Data Mapping (SimpleCompositionStudio.tsx)
- Added multiple fallbacks for script content: `ch.script || ch.generatedContent?.script || ch.customPrompt || ch.aiSuggestedPrompt`
- Differentiated between "pending preview" and "generated content"
- Added quality score calculation based on asset completeness
- Added `_hasGeneratedScript`, `_hasGeneratedAudio`, `_hasGeneratedVideo` flags

### 2. ChapterPreviewPanel Improvements
- Shows AI-suggested prompt as preview when script not yet generated
- Added "Generate Script" / "Generate Voice" / "Generate Visual" buttons for empty assets
- Shows timing hints (e.g., "Videos may take 2-5 minutes")
- Better visual distinction between pending and complete content

### 3. ReviewEnhanceStep UI Enhancements
- Added generation status notice when all chapters pending
- Asset status indicators (green/gray dots) for quick visual scanning
- Changed "Approve All Pending" to only count chapters with actual content

## Technical Details

### Asset Status Logic
```typescript
const hasScript = chapter.assets?.script?.status === 'complete';
const hasAudio = chapter.assets?.audio?.status === 'complete';
const hasVideo = chapter.assets?.video?.status === 'complete';
const assetCount = [hasScript, hasAudio, hasVideo].filter(Boolean).length;
```

### Quality Score Calculation
```typescript
let qualityScore = 0;
if (hasScript) qualityScore += 40;
if (hasAudio) qualityScore += 30;
if (hasVideo) qualityScore += 30;
```

## Files Modified
- `src/components/genie-admin/composition-studio/SimpleCompositionStudio.tsx`
- `src/components/genie-admin/composition-studio/ChapterPreviewPanel.tsx`
- `src/components/genie-admin/composition-studio/ReviewEnhanceStep.tsx`

## Date: 2026-01-30
