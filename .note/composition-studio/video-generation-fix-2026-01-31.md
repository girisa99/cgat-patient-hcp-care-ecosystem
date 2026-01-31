# Video Generation & Multi-Project Fix

## Date: 2026-01-31

## Issues Reported
1. Video content not visible for "Andhra Pradesh Transformation" or "Ramayana Epic" projects
2. Music not being stored when regenerated
3. Project data loss when switching between projects
4. Wrong parameter name in edge function call

## Root Causes

### 1. Edge Function Parameter Mismatch
- **Problem**: Frontend was sending `action: 'text-to-video'` but edge function expected `type: 'video'`
- **Fix**: Changed to `type: 'video'` and added `visualType` for smart routing

### 2. Music URL Not Stored in Regeneration Handler
- **Problem**: Line 2363 only set `confidenceScores.music` but never stored `musicUrl`
- **Fix**: Added `musicUrl: musicResult.audioUrl` to the regeneration handler

### 3. Project Switch Data Loss
- **Problem**: `loadProject()` didn't save current project before switching
- **Fix**: Added save logic at the start of `loadProject()` to persist current work

## Files Modified

### SimpleCompositionStudio.tsx

1. **Video Generation Call** (lines ~1847-1856):
```typescript
// BEFORE
action: 'text-to-video',
quality: 'preview',
width: 1920,
height: 1080,

// AFTER
type: 'video',
visualType: visualType,
aspectRatio: '16:9',
quality: 'standard',
```

2. **Music Regeneration** (lines ~2350-2375):
```typescript
// BEFORE - missing musicUrl
confidenceScores: {
  ...existingConfidence,
  music: newMusicConfidence
}

// AFTER - properly stores URL
musicUrl: musicResult.audioUrl,
confidenceScores: {
  ...existingConfidence,
  music: newMusicConfidence
}
```

3. **Project Switching** (lines ~974-1019):
```typescript
// ADDED at start of loadProject()
if (currentProjectId && (projectName.trim() || chapters.length > 0)) {
  const currentProject = { /* all state */ };
  saveProject(currentProject);
  console.log('[Studio] Saved current project before switching');
}
```

## Video Generation Flow (Corrected)

1. Call `ai-video-generator` edge function with correct params
2. Check for real video URL (not placeholder)
3. If real video → use it
4. If async/placeholder → call ecosystem service fallback
5. If still no video → generate HD image as preview

## Testing Verification

After these fixes:
- ✅ Video generation sends correct `type: 'video'` parameter
- ✅ Music URL properly stored when regenerated
- ✅ Switching projects saves current work first
- ✅ Project history shows updated save times
- ✅ Confidence scores preserved when regenerating single asset
