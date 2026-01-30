# Proactive AI Recommendations & Label Studio Feedback Integration

## Overview
Added proactive AI-powered recommendations and comprehensive Label Studio feedback loops to the Composition Studio.

## New Components

### 1. StudioRecommendationService (`src/services/studioRecommendationService.ts`)
- **Local Keyword Matching**: Fast client-side matching for 50+ template and 80+ visual keywords
- **AI Enhancement**: Uses `ai-universal-processor` (Gemini) for deep prompt analysis when user input is substantial
- **Prompt Analysis**: Detects industry, region, content type, tone, and keywords
- **Confidence Scores**: 0-100 score with human-readable reason for each recommendation

### 2. AIRecommendationsPanel (`src/components/genie-admin/composition-studio/AIRecommendationsPanel.tsx`)
- **Auto-triggers**: Analyzes prompt as user types (debounced 800ms)
- **Shows WHY**: Each recommendation includes explanation
- **User Choice**: Accept individual, accept all, or dismiss
- **Feedback Buttons**: 👍/👎 on each suggestion for RLHF learning
- **Learn Notice**: "Your choices help improve future recommendations"

## Label Studio Integration Points

### Create Phase
1. **Project Setup**: Template/visual selections recorded
2. **AI Recommendations**: Accept/reject/feedback tracked
3. **Chapter Editing**: Script changes, prompt enhancements recorded
4. **Visual Type Changes**: Per-chapter visual selections tracked

### Generate Phase
1. **Generation Start**: Config snapshot recorded
2. **Generation Complete**: Full project metadata recorded
3. **Errors**: Failure modes tracked for improvement

### Publish Phase (Future)
- Review queue decisions
- Scheduling choices
- Landing page placements

## Data Flow

```
User Prompt → AIRecommendationsPanel
                ↓
        studioRecommendationService
        ↓                        ↓
   Local Keywords           AI (Gemini)
        ↓                        ↓
    Recommendations (with reasons)
                ↓
    User Accept/Reject/Feedback
                ↓
    useLabelStudioBackground.recordEvent()
                ↓
    labelStudioBackgroundService → Queue
                ↓ (30s flush)
    label-studio-connector Edge Function
                ↓
    Label Studio (RLHF Training)
```

## Event Types Recorded

| Event | Context | Use Case |
|-------|---------|----------|
| `ai_template_accepted` | Template IDs, prompt | Template recommendation accuracy |
| `ai_visual_accepted` | Visual IDs, prompt | Visual style preferences |
| `recommendation_feedback` | Like/Dislike, item ID | Improve scoring model |
| `generation_complete` | Full project config | Workflow patterns |
| `chapter_enhanced` | Original → Enhanced prompt | Prompt quality |

## Files Created/Modified

### Created
- `src/services/studioRecommendationService.ts`
- `src/components/genie-admin/composition-studio/AIRecommendationsPanel.tsx`
- `.note/composition-studio/proactive-ai-recommendations-and-feedback.md`

### Modified
- `src/components/genie-admin/composition-studio/SimpleCompositionStudio.tsx`
- `src/components/genie-admin/composition-studio/index.ts`

## Integration with Memory

Updated: `memory/features/composition/visual-type-registry-expansion`
- Documents 130+ visual formats including creative storytelling styles
- Records that proactive AI now suggests formats based on prompt analysis
