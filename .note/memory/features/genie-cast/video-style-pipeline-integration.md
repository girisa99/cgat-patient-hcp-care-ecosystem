# Memory: features/genie-cast/video-style-pipeline-integration
Updated: just now

## Video Style → Pipeline Integration

The Genie Cast video style selection (`VideoStyleCards.tsx`) is now fully integrated with the production pipeline:

### Frontend Flow
1. **Style Selection**: User selects from 21+ video styles in the Overview tab
2. **Config Resolution**: `getStylePipelineConfig()` maps style → provider configuration
3. **Auto-Enhancement**: If style requires avatar or 3D, Full Production Mode auto-enables
4. **Request to Assembler**: Style config sent to `genie-cast-assembler` edge function

### Key Files
- **Config**: `src/config/video-style-pipeline-mapping.ts` (NEW) - Maps all 21 styles to providers
- **UI**: `src/components/genie-admin/genie-cast/VideoStyleCards.tsx` - Style selection cards
- **Panel**: `src/components/genie-admin/UnifiedVideoGenerationPanel.tsx` - Wires style to generation
- **Assembler**: `supabase/functions/genie-cast-assembler/index.ts` - Receives and logs style config

### Style → Provider Mapping Examples
```typescript
'ugc_avatar_photorealistic' → avatarProvider: 'alibaba-wan2.2'
'ugc_avatar_3d_pixar' → avatarProvider: 'meshy-3d', animationProvider: 'modelslab'
'anime' → videoProvider: 'modelslab', animationProvider: 'modelslab-anime'
'educational' → videoProvider: 'vertex-ai', avatarProvider: 'alibaba-wan2.2'
```

### Registry Integration
Video styles are now registered in `contextRegistry.ts` as VISUAL_FEATURES:
- `smart-storytelling`, `hook-video`, `micro-drama` → video-generation
- `photorealistic-avatar`, `3d-pixar-avatar`, `2d-animated-avatar` → avatar-lipsync
- `chapter-navigation`, `quiz-overlay`, `cta-video` → distribution

### Ecosystem Coverage
- **Genie Cast**: Full style selection + generation
- **Vibe/Deck**: Styles available in VISUAL_FEATURES registry for wizard integration
- **Scripts**: Style's `scriptTone` and `toneModifier` inform script generation parameters

### Not Landing Page
All components are scoped to `/genie-admin` panel only. No landing page exposure.
