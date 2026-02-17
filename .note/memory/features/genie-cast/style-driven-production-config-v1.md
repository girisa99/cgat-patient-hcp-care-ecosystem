# Memory: features/genie-cast/style-driven-production-config-v1
Updated: just now

## Style-Driven Production Configuration

The Genie Cast production workflow now **auto-derives** all production settings from the selected video styles in Overview, eliminating redundant manual Full Production Mode toggles.

### Flow

1. **Overview Tab**: User selects video styles (e.g., "3D Pixar Avatar", "Smart Storytelling")
2. **Generate Tab**: System auto-detects required features:
   - Avatar generation (if any style has `avatarProvider`)
   - Animation (if any style has `animationProvider`)
   - 3D elements (if style visual effect includes '3d' or uses Meshy)
3. **StyleDrivenProductionConfig** displays detected requirements with provider attribution
4. **Optional fine-tuning**: Collapsible section for avatar gender preference only

### Key Files

- **NEW**: `src/components/genie-admin/genie-cast/StyleDrivenProductionConfig.tsx`
  - `deriveProductionRequirements(styles)` - Auto-detects Avatar/Animation/3D needs
  - `estimateGenerationTime(requirements, quality)` - Calculates generation time
  - UI shows feature pills with checkmarks and provider badges

- **UPDATED**: `src/components/genie-admin/UnifiedVideoGenerationPanel.tsx`
  - Removed manual `enableFullProduction` toggle
  - Uses `styleRequirements = deriveProductionRequirements(selectedVideoStyles)`
  - `isFullProduction` computed from style requirements

### Benefits

1. **No redundancy**: Style selection → production config automatically
2. **Cleaner UX**: No duplicate toggles for Avatar/3D/Animations
3. **Smart defaults**: Provider routing derived from VIDEO_STYLE_PROVIDERS registry
4. **Minimal fine-tuning**: Only avatar gender is user-configurable

### Style → Production Mapping

```typescript
// Example derivation
'ugc_avatar_3d_pixar' → {
  needsAvatar: true,
  needs3D: true,
  avatarProviders: ['meshy-3d'],
  animationProviders: ['modelslab']
}

'smart_storytelling' → {
  needsAvatar: false,
  needsAnimation: true,
  animationProviders: ['modelslab']
}
```

### UI Summary

Generate Tab now shows:
1. Compact style badges header
2. Auto-Configured panel with Avatar/Animations/3D pills
3. Provider attribution badges
4. Collapsible "Fine-tune Avatar Options" (only if avatar needed)
5. Token consumption and generation time estimates
