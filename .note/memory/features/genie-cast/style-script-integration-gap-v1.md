# Memory: features/genie-cast/style-script-integration-gap-v1
Updated: just now

## Current Issue: Style Selection Not Affecting Script Content

### Problem Identified (2026-02-04)

The video style selection (Educational, Hook Videos, UGC Avatar, 3D Pixar, etc.) in Overview:
1. **Correctly passes** `styleConfig` with `scriptTone`, `pacing`, `toneModifier` (hookIntensity, emotionalArc, etc.) to the assembler
2. **BUT** the assembler's `getChapterScript()` function ignores these values and returns hardcoded, static scripts

### Current Script Implementation (lines 741-802 in genie-cast-assembler)
```typescript
function getChapterScript(chapterId: string, language: string): string {
  // Returns static scripts - NO dynamic hook generation
  // NO adaptation based on styleConfig
  const scripts = {
    'opening': { 'en': "Welcome to Genie Studio..." },  // Same for all styles
    // ...
  };
  return scripts[chapterId]?.[language] || '';
}
```

### Required Changes

1. **Dynamic Script Generation**: Modify `getChapterScript()` to accept `styleConfig` and generate:
   - Strong hooks for `hook_videos` style (hookIntensity: 1.0)
   - Emotional storytelling for `smart_storytelling` (emotionalArc: true)
   - Educational tone for `educational` style
   - Playful/warm tone for `ugc_avatar_3d_pixar`

2. **AI-Powered Script Enhancement**: Route to LLM to transform base scripts with style-specific tone:
   - Use Lovable AI or existing multi-provider-llm function
   - Pass `scriptTone` and `toneModifier` parameters

3. **Full Production Mode Assets**: Currently flags are passed but:
   - `generateAvatarSegment()` calls `ai-video-generator` - needs valid source images
   - `generate3DElement()` calls `alibaba-3d-generator` - needs proper prompts
   - These require actual AI provider API keys and credits

### Temporary Workarounds

Until full implementation:
- Scripts remain static but professional
- Avatar/3D features logged but may not render if providers are not configured
- Video assembly falls back to `composite://` placeholder URLs

### Files To Update
- `supabase/functions/genie-cast-assembler/index.ts` - Add style-aware script generation
- Consider creating a dedicated `script-enhancer` edge function
