# Memory: features/genie-cast/p2-live-generation-implementation-v1
Updated: just now

## P2 Live TTS/Video Generation Implementation

The P2 Live Generation feature provides real-time chapter-by-chapter TTS and video preview generation within the Studio tab of Genie Cast.

### Components Implemented

| Component | File | Purpose |
|-----------|------|---------|
| `useLiveTTSPreview` | `src/hooks/useLiveTTSPreview.ts` | Hook for scene-by-scene TTS generation with audio playback controls |
| `useLiveVideoPreview` | `src/hooks/useLiveVideoPreview.ts` | Hook for thumbnail/video generation and final assembly |
| `LiveGenerationPreview` | `src/components/genie-admin/genie-cast/LiveGenerationPreview.tsx` | Self-contained UI component with generation controls, playback, and progress tracking |

### Integration Location

The `LiveGenerationPreview` component is integrated in `GenieCastConsolidatedTabs.tsx` within the **PRODUCE > Studio** sub-tab, positioned after the `AVSyncPreview` component.

### Key Features

1. **Chapter-by-Chapter TTS Generation**
   - Real-time playback per scene
   - Audio caching to minimize redundant API calls
   - Chain playback across all scenes

2. **Video Preview Generation**
   - Thumbnail generation per scene
   - Provider routing based on style intent and region

3. **Full Production Mode**
   - One-click orchestration: TTS → Thumbnails → Assembly
   - Calls `genie-cast-assembler` for final video stitching

4. **Status Indicators**
   - TTS ready (green check)
   - Visuals ready (blue check)
   - Progress bars for batch operations

### Props Interface

```typescript
interface LiveGenerationPreviewProps {
  mapping: TemplateMapping;
  styleIntent?: StyleIntent;       // e.g., 'product-hero', 'corporate'
  region?: RegionZone;             // e.g., 'global', 'mena', 'cjk'
  language?: string;               // e.g., 'en-US', 'ar-SA'
  onTTSComplete?: (results: TTSAudioResult[]) => void;
  onVideoComplete?: (results: VideoGenerationResult[]) => void;
  onAssemblyComplete?: (videoUrl: string) => void;
  showAdvancedControls?: boolean;
  className?: string;
}
```

### Workflow Integration

1. User configures script in **ScriptTemplateMapper** (scene-to-script alignment)
2. User validates sync in **AVSyncPreview** (waveform visualization)
3. User triggers generation in **LiveGenerationPreview** (TTS + Video)
4. On completion, user is navigated to **Review** sub-tab

### Cross-Functional Exports

All P2 components and hooks are exported from `src/components/genie-admin/genie-cast/index.ts` for reuse in other products (Deck, Vibe, Mind).
