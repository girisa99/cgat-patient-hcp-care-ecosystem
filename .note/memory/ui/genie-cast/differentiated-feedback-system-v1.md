# Memory: ui/genie-cast/differentiated-feedback-system-v1
Updated: just now

## Differentiated Feedback System

The Feedback & Suggestions system features a clear categorical distinction between script-level and TTS-level improvements. Script feedback targets content segments (Hook, Problem, Solution, CTA) via single-select dropdown.

### Multi-Select TTS Issue Areas with Auto-Routing
TTS feedback uses **multi-select toggle buttons** (not a dropdown) allowing reviewers to flag multiple audio issues simultaneously. The 6 issue areas are:
- 🎤 Voice Quality / Naturalness (voice)
- 🗣 Pronunciation / Accent (voice)
- ⏱ Pacing / Timing / Speed (voice)
- 🎭 Emotional Tone / Inflection (voice)
- ⚙️ Provider-Specific Issue (voice)
- 📝 Content Needs Script Change (script escalation)

### Auto-Routing Classification
The `classifyTTSFeedbackRoute()` function analyzes selected areas and displays a real-time routing indicator:
- **Voice-only** (all voice areas) → Green banner → TTS regeneration only, no script changes
- **Script escalation** (content_mismatch only) → Blue banner → Script revised first, then TTS regenerated
- **Both** (voice + content) → Amber banner → Script revision + separate TTS regeneration

### Storage
Selected areas stored as comma-separated string in `section_target` column. Routing decision and issue array persisted in `metadata` JSON column for audit trail.

### Key Files
- `src/components/genie-admin/genie-cast/LandingPageScriptsPanel.tsx` — TTS_ISSUE_AREAS config, classifyTTSFeedbackRoute(), multi-select UI

Last Updated: 2026-02-11
