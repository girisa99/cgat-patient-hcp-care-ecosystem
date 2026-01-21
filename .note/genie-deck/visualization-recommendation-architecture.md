# Visualization Recommendation Architecture

## Key Principle
**Industry/Framework SUGGESTS but NEVER RESTRICTS visualization options.**

## Created Files
1. `docs/GENIE_DECK_CONTEXT_FLOW_ARCHITECTURE.md` - Full architecture doc
2. `src/components/genie-studio/presentation-generator/services/visualizationRecommendationService.ts` - Service implementation

## How It Works

### Context Flow (Steps 0-5)
- Step 0: Input → Topics/Keywords extracted
- Step 1: Industry/Segment/Collateral → `getRecommendedProviders()` for AI models
- Step 2: Frameworks + Visual Features → `visualizationRecommendationService` for suggestions
- Step 3: Output Type → Tier-filtered options
- Step 4: Agents/Languages → Voice configs
- Step 5: Aggregated context → Generation

### Visualization Determination
1. **Framework-based**: SWOT → Quadrant charts, Porter's → Radar, etc.
2. **Industry-based**: Finance → Waterfall/Candlestick, Healthcare → Timelines
3. **Content-type-based**: Training → Interactive, Investor → Charts/Data
4. **Output-format-based**: Video avoids tables, 3D needs 3D elements

### Mode Behavior
- **AI Auto**: Shows recommendations with badges, ALL options available
- **Custom**: No recommendations, full access within tier
- **Global Tier Filter**: Only restriction mechanism (Standard/Advanced/Premium)

## Integration Points
- Export from `index.ts`
- Used in Step 2 (TemplateBrandingPanelV2)
- Suggestions injected into AI prompt during generation
