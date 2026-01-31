# Create → Review Workflow Architecture

## Date: 2026-01-31

## Summary
Implemented best-practice workflow for Composition Studio Create → Review → Publish flow with:
- **Generate Once, Review Only**: Assets generated in Create tab; Review tab shows confidence scores and allows selective regeneration only if quality < 95%
- **Multi-language Audio Player**: Primary language plays by default, dropdown to switch between generated languages
- **Confidence Scores**: Visual indicators showing 95% target with color-coded progress bars
- **Script Editing**: Inline editing with AI enhancement suggestions

## Architecture Decisions

### 1. Generate Once Workflow (Best UX + Cost Optimization)
- **Create Tab**: Generates all assets (script, audio, video) once per chapter
- **Review Tab**: Displays generated content with quality scores
- **Regeneration**: Only triggered when confidence < 95% target OR user explicitly requests
- **Prevents**: Double token costs, duplicate API calls, wasted compute

### 2. Database Persistence
New tables created:
- `composition_projects`: Project-level metadata with user_id RLS
- `composition_chapters`: Chapter-level data with confidence scores, multi-language audio JSONB

Schema supports:
- Script content with confidence factors
- Multi-language audio URLs in JSONB column
- Video/visual URLs with provider tracking
- Approval workflow (approved_at, feedback)

### 3. Confidence Score Integration
Using `ConfidenceLoopEngine` (95% target, 5 iterations max):
- `providerResponseQuality`: 25%
- `languageAccuracy`: 20%
- `formatCompliance`: 15%
- `contentRelevance`: 20%
- `technicalQuality`: 20%

Visual indicators:
- ≥95%: Green (primary color) - meets target
- 80-94%: Amber - needs improvement
- <80%: Red (destructive) - regenerate recommended

### 4. Multi-Language Audio
Structure in `audioByLanguage`:
```typescript
{
  [languageCode]: {
    languageCode: string;
    languageName: string;
    audioUrl?: string;
    confidenceScore?: number;
    provider?: string;
    status: 'pending' | 'generating' | 'complete' | 'error';
  }
}
```

Primary language populated from main TTS generation.
Additional languages populated from transcreation workflow.

## New Components Created

1. **MultiLanguageAudioPlayer.tsx**
   - Primary audio playback with language dropdown
   - Confidence score display per language
   - Regenerate button for low-quality audio

2. **ConfidenceScoreCard.tsx**
   - Asset-level quality visualization
   - Tooltip with detailed confidence factors
   - "Improve Quality" button for < 95% scores

3. **ScriptEnhanceEditor.tsx**
   - Inline script editing
   - AI enhancement suggestions
   - Auto-trigger audio regeneration prompt on significant changes

## Files Modified
- `SimpleCompositionStudio.tsx`: Added confidence score mapping, audioByLanguage
- `ReviewEnhanceStep.tsx`: Integrated confidence scores in overview grid
- `ChapterPreviewPanel.tsx`: Added props for multi-language audio
- `index.ts`: Exported new components

## Best Practices Implemented
1. ✅ URL-driven state management for tab switching
2. ✅ Database persistence with proper RLS
3. ✅ Confidence-based regeneration (not duplicate generation)
4. ✅ Multi-language support with dropdown selector
5. ✅ Script editing with AI enhancement
6. ✅ Visual quality indicators with 95% target
