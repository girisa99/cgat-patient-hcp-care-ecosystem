# Memory: features/genie-cast/tts-versioning-sub-region-routing-v1
Updated: just now

## TTS Generation + Versioning + Sub-Region Routing

### Architecture
- **`tts_audio_versions` table**: Stores every TTS generation (append-only, never overwrites) with full metadata: provider, voice, locale, duration, generation_mode (auto/manual), fallback tracking, timestamps
- **Auto-increment**: `trg_auto_increment_tts_version` trigger auto-numbers versions per script
- **Auto-generate on approval**: When script status → `active`, TTS auto-generates using sub-region routing
- **Manual generate**: "Generate" button in TTS Preview tab calls `multi-provider-tts` with `regionCode`

### Sub-Region Routing Wiring
- `useLiveTTSPreview` hook accepts `regionCode` param, forwards to `multi-provider-tts` edge function
- `getSubRegionTTSProvider()` maps 38+ sub-regions → provider + locale
- `handleGenerateTTS()` in LandingPageScriptsPanel resolves provider from sub-region before calling edge function

### Unified Feedback System
- `script_improvement_notes.tts_version_id` FK links TTS-specific feedback to exact audio version
- `note_type = 'tts_feedback'` distinguishes TTS feedback from script feedback
- Both script and TTS feedback visible in unified Feedback tab

### Versions Tab — Interleaved Timeline
- Shows script versions AND TTS versions chronologically interleaved
- Script entries: 📝 badge, version, status, provider, script feedback count
- TTS entries: 🎙 badge, version, provider, locale, auto/manual mode, duration, TTS feedback count, play button
- Grouped by parent region → sub-region hierarchy

### Key Files
- `src/components/genie-admin/genie-cast/LandingPageScriptsPanel.tsx` — main UI
- `src/hooks/useLiveTTSPreview.ts` — regionCode param added
- DB: `tts_audio_versions`, `script_improvement_notes.tts_version_id`

Last Updated: 2026-02-11
