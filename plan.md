# Implementation Plan: Unified Editor + GPU Rendering + Cast Analytics

## Phase A: Unified Editor (Mind ↔ Cast feature parity)

### A1. Create shared editor module `src/components/genie-studio/unified-editor/`
Extract Mind's 9 components into a shared, reusable module that BOTH Mind and Cast can consume.
The key insight: Mind works with single scripts, Cast works with scenes. We need a thin adapter layer.

**New files:**
- `src/components/genie-studio/unified-editor/index.ts` — barrel export
- `src/components/genie-studio/unified-editor/UnifiedScriptAnalysis.tsx` — wraps AnalysisResultsPanel + ProgressiveAnalysisOverlay, accepts `content: string` (Mind passes full script, Cast passes scene script)
- `src/components/genie-studio/unified-editor/UnifiedEnhancement.tsx` — wraps EnhancementDialog + EnhancementReviewPanel, same adapter pattern
- `src/components/genie-studio/unified-editor/UnifiedBrandVoice.tsx` — wraps BrandVoiceChecker
- `src/components/genie-studio/unified-editor/UnifiedTranscreation.tsx` — wraps TranscreationPreview
- `src/components/genie-studio/unified-editor/UnifiedVersionHistory.tsx` — wraps VersionHistoryPanel
- `src/components/genie-studio/unified-editor/UnifiedTTSPanel.tsx` — wraps TTSOptionsPanel with scene-aware extensions (per-scene TTS, batch TTS, recording fallback)
- `src/components/genie-studio/unified-editor/UnifiedStatsBar.tsx` — wraps ScriptStatsBar
- `src/components/genie-studio/unified-editor/useUnifiedEditorState.ts` — shared state hook that manages analysis, enhancement, brand voice, transcreation, version history state (extracted from ScriptEditorTab's 37 state variables)

### A2. Wire unified editor into Cast's PRODUCE → Edit sub-tab
In `GenieCastConsolidatedTabs.tsx`, add the unified editor panels alongside existing SceneAwareTeleprompter:
- Add analysis/enhancement/brand-voice/transcreation/version-history panels that operate on the ACTIVE SCENE's script
- Scene selection in teleprompter drives which script the unified panels analyze
- Keep existing timeline, A/V sync, export as-is

### A3. Wire Cast's timeline/AV-sync/teleprompter capabilities into Mind
In `GenieMind.tsx`, add optional timeline and teleprompter for scripts linked to productions:
- When a script is linked to a show (podcast/video), show the VideoTimelineEditor
- Add SceneAwareTeleprompter for multi-scene scripts
- Add A/V sync validation
- Add export/distribution panel
- These are shown conditionally — only when script has associated media

### A4. Refactor ScriptEditorTab to use useUnifiedEditorState
Replace the 37 inline state variables in ScriptEditorTab.tsx with the shared hook.
This ensures Mind and Cast share identical analysis/enhancement/TTS logic.

---

## Phase B: GPU Rendering Pipeline (Cast + Vibe)

### B1. Implement `assemble_video` action in ai-universal-processor
Add handler in `supabase/functions/ai-universal-processor/index.ts`:
- Accept: scene video URLs, transition configs, b-roll configs, output format
- Implementation: Use provider-based approach — call Alibaba/RunPod for server-side FFmpeg
- Fallback: Return concatenated scene list for client-side assembly
- Wire: sceneRenderingOrchestrator.ts `assembleWithTransitions()` already calls this

### B2. Implement `transcode_video` action in ai-universal-processor
Add handler for format conversion:
- Accept: source URL, target preset (resolution, codec, bitrate, FPS)
- Presets: 4K, 1080p, 720p, social (1:1, 9:16), GIF, audio-only
- Implementation: Provider-based FFmpeg (RunPod/Cloud Run)
- Fallback: Client-side FFmpeg WASM for small files (<50MB)
- Wire: sceneRenderingOrchestrator.ts `exportToPresets()` already calls this

### B3. Implement real audio mixing in audio-mixer edge function
Replace Math.random() and placeholder URLs:
- Accept: voice track URL, music track URL, SFX URLs, volume/pan/fade configs
- Implementation: Ducking algorithm (lower music during voice), normalization (LUFS target)
- Provider: Server-side FFmpeg with amerge/amix filters
- Wire: useStudioEcosystem.ts already calls `audio-mixer`

### B4. Implement avatar lip-sync routing
Fix avatarGenerationPipeline.ts to route correctly:
- Detect `audioUrl` + `sourceImageUrl` params → route to lip-sync API (Alibaba WAN 2.2 Lip-Sync, not T2V)
- When no audio → route to T2V as current
- Wire viseme canvas renderer for real-time preview
- Update ai-universal-processor to distinguish `generate_video` vs `generate_avatar_video`

### B5. Implement subtitle/caption burning
Add `burn_captions` action in ai-universal-processor:
- Accept: video URL, SRT/VTT content, style (font, size, color, position, background)
- Implementation: FFmpeg drawtext/ASS filter
- Wire: usePlatformExport already has `includeCaptions` + `captionStyle` config

### B6. Implement watermark overlay
Add `add_watermark` action:
- Accept: video URL, watermark image URL, position, opacity, scale
- Implementation: FFmpeg overlay filter
- Wire: usePlatformExport already has `includeWatermark` + `watermarkPosition` config

### B7. Implement quality gate with real metrics
Update ai-quality-assessment edge function:
- Add `assess_video` action separate from `quick_check`
- Check: audio levels (LUFS), silence detection, frame integrity, resolution verification, duration accuracy
- Implementation: FFprobe for metadata + LLM for content safety
- Wire: sceneRenderingOrchestrator.ts `runQualityGate()` already calls this

### B8. Wire Vibe export presets
In VibeRecordTab.tsx / useFFmpegTrim.ts:
- Add export preset selection UI (currently only MP4)
- For small files (<50MB): use client-side FFmpeg WASM
- For large files: call `transcode_video` server-side action
- Add progress tracking with the existing useStreamingDownload hook

---

## Phase C: Cast Analytics Dashboard

### C1. Create analytics data layer
New file: `src/hooks/useCastAnalytics.ts`
- Query `landing_page_videos` for generation metrics
- Query `composition_projects` for project-level metrics
- Query `video_assembly_jobs` (if table exists, or create) for pipeline metrics
- Aggregate: total videos, success/fail rate, avg render time, cost per video, provider distribution

### C2. Redesign AnalyticsDashboard with charts
Rewrite `src/components/genie-admin/genie-cast/AnalyticsDashboard.tsx`:
- **Overview cards**: Total videos, success rate, avg cost, avg render time
- **Time-series chart**: Videos generated per day/week (line chart)
- **Provider breakdown**: Pie chart of which AI providers are used most
- **Status funnel**: Created → Generating → Completed → Published
- **Regional heatmap**: Generation success rate by region/zone
- **Format distribution**: Bar chart of content formats used
- **Cost tracking**: Estimated cost per video over time
- **Queue metrics**: Active jobs, avg wait time, throughput

### C3. Wire real cost tracking
- Track actual API costs per generation (token costs from ai-universal-processor responses)
- Store in a `generation_costs` or extend `landing_page_videos` with cost columns
- Replace hardcoded `$500 manual - $15 AI` with real aggregated costs

### C4. Add production pipeline analytics
- Track render pipeline stages: TTS time, video gen time, assembly time, export time
- Per-provider success/failure rates
- Credit consumption tracking from VideoAssemblyService
