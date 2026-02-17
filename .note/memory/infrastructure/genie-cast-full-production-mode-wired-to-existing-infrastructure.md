# Memory: infrastructure/genie-cast-full-production-mode-wired-to-existing-infrastructure
Updated: just now

## Full Production Mode Now Uses Existing Infrastructure

The `genie-cast-assembler` edge function was updated to replace **stub/placeholder functions** with actual calls to the existing production AI infrastructure.

### Changes Made (2026-02-03)

| Function | Before | After |
|----------|--------|-------|
| `generateAvatarSegment()` | Returned fake placeholder URLs | Calls `ai-video-generator` with `type: 'avatar'` |
| `generate3DElement()` | Returned fake placeholder URLs | Calls `alibaba-3d-generator` then `modelslab-media` fallback |
| `generateTransition()` | Returned fake placeholder URLs | Calls `modelslab-media` with AnimateDiff |

### Infrastructure Reused

| Capability | Edge Function | Provider Chain |
|------------|---------------|----------------|
| **Avatar/Lip-Sync** | `ai-video-generator` | Alibaba Wan2.2 → ModelsLab → Azure |
| **3D Generation** | `alibaba-3d-generator` | Alibaba text-to-3d → ModelsLab 3D |
| **Transitions** | `modelslab-media` | ModelsLab AnimateDiff |

### Storage Buckets Created

- `avatar-segments` - Generated avatar videos (video/mp4, video/webm)
- `3d-elements` - GLB/GLTF/FBX 3D models
- `transitions` - Animated transition clips
- `genie-media` - TTS audio and general media (already existed)

### Key Implementation Details

1. **Avatar Source Images**: The system checks `brand-assets/avatar-sources/{language}/{gender}-*.png` for pre-uploaded presenter photos, falling back to regional stock photos if none exist.

2. **Regional Avatar Names**: Maintained in `REGIONAL_AVATARS` constant (James/Sarah for EN, Ahmed/Fatima for AR, etc.)

3. **Cross-Functional Reuse**: The same `ai-video-generator` edge function used by Deck/Vibe for avatar generation is now used by Genie Cast.

4. **Fallback Chains**: Each production function implements proper fallback chains - if Alibaba fails, it tries ModelsLab, etc.

### Files Modified

- `supabase/functions/genie-cast-assembler/index.ts` - Updated production mode functions

### API Keys Required

- `ALIBABA_API_KEY` or `ALIBABA_CHINA_API_KEY` - Avatar and 3D generation
- `MESHY_API_KEY` - 3D fallback
- `MODELSLAB_API_KEY` - Transitions and avatar fallback
- `AZURE_SPEECH_KEY` - Viseme lip-sync data

### Testing

When testing Full Production Mode in Genie Cast:
1. Enable "Full Production Mode" toggle
2. Configure Avatar (gender, placement, size)
3. Configure 3D (style, quality)
4. Configure Animations (style, intensity)
5. Generate video - now actually calls production AI providers

### Cross-Functional Consistency

This pattern ensures:
- Same avatar quality in Genie Cast as in Deck/Vibe
- Same 3D generation quality across all products
- Unified provider fallback strategy ecosystem-wide
