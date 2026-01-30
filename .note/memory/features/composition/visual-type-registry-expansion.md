# Memory: features/composition/visual-type-registry-expansion
Updated: just now

The visual types registry supports over 130+ production formats, ranging from standard Avatars and 3D models to creative narrative styles like 'Panchatantra' animal fables, 'Wayang' shadow puppets, and 'Sufi Tales'. This diversity allows for 'moral of the story' explainers and transformation journeys that use regional cultural archetypes and character animation (mascots, wise elders) to explain complex business or digital concepts authentically across global markets.

## Proactive AI Recommendations

The Composition Studio now features a proactive AI recommendation system (`AIRecommendationsPanel`) that:

1. **Auto-analyzes** user prompts as they type (debounced 800ms)
2. **Suggests templates** based on detected industry, region, and keywords
3. **Recommends visual formats** matching content type and cultural context
4. **Explains WHY** each suggestion is relevant (human-readable reasons with confidence scores)
5. **User choice preserved** - Users can accept, modify, or dismiss recommendations

## Label Studio Integration

All user interactions are captured for RLHF learning:
- Template/visual acceptance: `ai_template_accepted`, `ai_visual_accepted`
- Feedback buttons (👍/👎): `recommendation_feedback`
- Generation completion: `generation_complete` with full project metadata
- Prompt enhancements: `chapter_enhanced`

## Implementation Files
- Service: `src/services/studioRecommendationService.ts`
- Panel: `src/components/genie-admin/composition-studio/AIRecommendationsPanel.tsx`
- Integration: `SimpleCompositionStudio.tsx` with `useLabelStudioBackground` hook
