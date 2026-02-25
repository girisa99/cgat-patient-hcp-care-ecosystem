# FINAL Consolidated Implementation Plan v2.0
# Wire End-to-End Pipeline: CREATE → PRODUCE → PUBLISH

**Goal**: Every selection in CREATE flows 1:1 into PRODUCE, every format generates multiple output types in PRODUCE, PUBLISH distributes real artifacts as long-form + short-form + teasers + multi-language derivatives across 30+ platforms, tier gating enforces limits at every step, and the subscription module is cost-aware with breakeven visibility.

**Codebase Reality Check (from research):**
- 4 routing zones (Claude/Alibaba/Gemini/Fallback), 16 parent regions, 62 subregions, 18+ AI providers
- 6 OCR providers active (Gemini, Azure Form Recognizer, DeepSeek, OpenAI/GPT-4o, Claude, Alibaba Qwen-VL)
- Video: Alibaba Wan 2.6 (PRIMARY), Sora 2 (SECONDARY), Vertex Veo 3 (FALLBACK) — no SOAR2 framework exists
- 30+ platform definitions in `usePlatformExport`, `shorts-generator` + `magic-clips-generator` edge functions exist
- Podcast: 20% complete (sub-formats defined, NO multi-speaker/dialogue/Pixar character reusable pipeline)
- Presentation: 80% complete (full service + wizard, lacks dynamic post-generation slide composition)
- DeepSeek: declared in fallback chains but NOT implemented as API handler
- Scene-chapter mapping: partial (chapters exist in timeline, no intelligent auto-grouping)

---

## PHASE 1: Session State Foundation (CRITICAL)

### 1.1 Extend `GenieCastSessionState` with all CREATE fields

**File:** `src/hooks/useGenieCastSession.ts`

Add to session interface:
```
selectedCategoryId: string | null
selectedFormatId: string | null
selectedSubFormatId: string | null
primaryPlatform: string                  // 'youtube' | 'tiktok' | 'instagram' | etc.
outputLanguages: string[]                // ['en', 'hi', 'ar', ...]
dubbingSubtitleLanguages: string[]
selectedVisualStyleIds: string[]         // cast_visual_styles.id[] (DB UUIDs)
selectedCapabilityIds: string[]          // cast_production_capabilities.id[]
selectedCharacterIds: string[]           // cast_style_characters.id[]
characterFramePercent: number            // 30-80
targetDuration: number                   // seconds
selectedAssetSource: string              // 'generate' | 'upload' | 'pre-uploaded'
lipSyncEnabled: boolean
dubbingEnabled: boolean
selectedResolution: string               // '1920x1080' | '3840x2160' etc.
selectedAspectRatio: string              // '16:9' | '9:16' | '1:1' | '4:5'
productionQuality: string               // 'standard' | 'production' | 'cinematic'
enrichmentPrompt: string
avatarGender: string
discoveryChainId: string | null
selectedOutputPresets: string[]          // output preset IDs user wants to generate
speakerConfig: SpeakerConfig[] | null    // for podcast/dialogue formats
chapterGrouping: ChapterConfig[] | null  // for scene-to-chapter mapping
```

Add setter methods for each. All persist to localStorage on every change.

### 1.2 Replace all orphaned `useState` in GenieCastConsolidatedTabs

**File:** `src/components/genie-admin/genie-cast/GenieCastConsolidatedTabs.tsx`

Replace 16+ local `useState` declarations with reads/writes from `castSession`.

### 1.3 Reconcile dual style system into single DB-driven source

- Replace `selectedVideoStyles: VideoStyleType[]` with `selectedVisualStyleIds: string[]` from session
- VideoStyleCards reads from DB styles via `useCastContentRegistry`
- Remove `ACTIVE_CATEGORIES` filter — show ALL 99 styles in 19 categories

---

## PHASE 2: CREATE → PRODUCE Data Handoff

### 2.1 Build production request from full session state

**File:** `src/services/production/castProductionBridge.ts`

Rewrite `buildRequestFromSession()` to read ALL fields:
```
Category/Format/SubFormat → determines script generation mode + scene structure
Platform → determines aspect ratio, duration limits, export presets
OutputLanguages → drives transcreation + dubbing pipeline
VisualStyleIds → resolved to style configs for video generation prompts
CapabilityIds → enables/disables: avatar, 3D, animation, lip-sync, dubbing, music, captions
CharacterIds → resolved to character configs for avatar generation
TargetDuration → scene count + per-scene duration calculation (NOT hardcoded 60s)
Resolution/AspectRatio → passed to video generation + export presets
EnrichmentPrompt → injected into AI prompt context alongside brand intelligence
AssetSource → determines whether to generate, use uploaded, or fetch from library
LipSync/Dubbing flags → conditionally enables those pipelines
ProductionQuality → determines provider selection: 'standard' = Wan 2.6, 'cinematic' = Sora 2 + Veo 3
AvatarGender → passed to avatar generation pipeline
SpeakerConfig → drives multi-speaker TTS routing (podcast/dialogue)
ChapterGrouping → scene-to-chapter binding for timeline
```

### 2.2 Extend `CastProductionRequest` type

Add missing fields:
```
categoryId, formatId, subFormatId
platform, resolution, aspectRatio
outputLanguages: Array<{code, name, adaptationLevel}>
visualStyleIds, capabilityIds, characterIds
targetDuration, assetSource
lipSyncEnabled, dubbingEnabled
enrichmentPrompt
selectedOutputPresets: string[]
speakerConfig: SpeakerConfig[]
chapterGrouping: ChapterConfig[]
```

### 2.3 Validate before allowing PRODUCE entry

Add validation gate on "Go to Produce" button:
- Category + Format must be selected
- At least one visual style selected
- At least one output language selected
- For podcast: at least 2 speakers configured
- For presentation: template or "free-form" mode selected
- Show validation errors inline, block navigation until resolved

### 2.4 Wire `handleGenerate` to use typed session (not raw localStorage)

**File:** `src/components/genie-admin/genie-cast/GenieCastHub.tsx`

Replace `localStorage.getItem('genie-cast-session')` with typed `castSession.session`.
Remove all hardcoded fallbacks: `['short_video']`, `'text_to_script'`, `estimatedDuration: 60`, etc.

---

## PHASE 3: Content Registry Completeness

### 3.1 Show ALL formats for every category

- Ensure `getFormatsForCategory(categoryId)` returns all formats via `cast_category_formats`
- Add missing rows for 9 new formats (website, infographic, training, meeting, email, kids, event, document, streaming)
- Each category shows ALL applicable formats, not just original 8

### 3.2 Show ALL sub-formats for every format

- 17 formats x avg 3 sub-formats = ~50+ sub-format options
- No sub-format hidden by active/inactive flags unless intentionally disabled
- **NEW podcast sub-formats needed:**
  - `podcast_character_discussion` — multi-character animated dialogue (Pixar-style like ep04)
  - `podcast_panel_debate` — 3-5 speakers with moderator
  - `podcast_narrative` — storytelling with narrator + characters

### 3.3 Add format→capability mapping for 9 new formats

| Format | Required Capabilities |
|--------|----------------------|
| website | video, captions, music |
| infographic | image_gen, text_overlay, animation |
| training | avatar, lip_sync, captions, quiz_overlay |
| meeting_intelligence | stt, nlp, summarization, captions |
| email_campaign | image_gen, text_gen, personalization |
| kids_education | avatar, animation, music, captions |
| event_content | video, live_stream, captions, multi_cam |
| document | ocr, text_gen, pdf_export |
| live_streaming | rtmp, real_time_tts, avatar, captions |

### 3.4 Show ALL 99 visual styles (19 categories)

- Remove `ACTIVE_CATEGORIES` filter in `VideoStyleCards.tsx`
- Switch to DB-driven styles from `cast_visual_styles`
- Add search/filter by style category in selection UI
- Format→Style filtering: recommended badge on styles matching format intent

### 3.5 OCR provider completeness for document format

**Existing (6 active):**
| Provider | Status | Specialty |
|----------|--------|-----------|
| Gemini Vision (gemini-2.5-flash) | Active PRIMARY | General OCR, forms, handwriting |
| Azure Form Recognizer | Active | Structured docs, insurance, ID |
| OpenAI GPT-4o Vision | Active | Medical, general |
| Claude Vision | Active | Medical, documents |
| DeepSeek Vision (deepseek-vl) | Active | CJK, technical diagrams |
| Alibaba Qwen-VL (qwen-vl-plus) | Active | CJK documents |

**Missing (not blocking but noted):**
- AWS Textract — referenced in workflow builder but no implementation
- Google Cloud Vision — Gemini functionally replaces this
- Tesseract — no client-side or server-side implementation

**Action:** No additional OCR work needed for MVP — 6 providers cover all regions.

---

## PHASE 4: PRODUCE — Wire Real Generation + Multi-Output

### 4A. Replace FormatStudioRouter fake generation

**File:** `src/components/genie-admin/genie-cast/FormatStudioRouter.tsx`

Replace `setTimeout(3000)` fake with real production call:
```
handleGenerate(formatName) →
  1. Check credits (canAfford via useAICredits)
  2. Deduct credits (useCredits)
  3. Call castProductionBridge.startCastProduction(request)
  4. Track real progress via production.state callbacks
  5. Update status from production events (not timer)
```

### 4B. Zone-Routed LLM — Complete Provider Matrix

**Existing architecture (4 zones, 16 parent regions, 62 subregions):**

| Zone | Primary LLM | Fallback Chain |
|------|-------------|----------------|
| Claude Zone (Western/EU/LATAM/Oceania) | Claude Sonnet 4.5 | OpenAI GPT-4o → DeepSeek → Gemini |
| Alibaba Zone (CJK/MENA Gulf) | Qwen Max | OpenAI GPT-4o → Claude → DeepSeek |
| Gemini Zone (India/SEA/Africa/S.Asia) | Gemini 2.5 Pro | OpenAI GPT-4o → Claude → DeepSeek |
| Fallback (global) | OpenAI GPT-4o | Gemini → Claude → DeepSeek |

**Sub-region overrides:** MENA_EGYPT→GPT-4o, MENA_LEVANT→GPT-4o, MENA_MAGHREB→Claude, EU_FI→GPT-4o, PAKISTAN→GPT-4o, CARIBBEAN→GPT-4o, CENTRAL_ASIA→GPT-4o, EASTERN_EUROPE→GPT-4o

**OpenAI status:** FULLY INTEGRATED as fallback for all 4 zones + primary for 8 sub-region overrides.

**DeepSeek status:** DECLARED but NOT IMPLEMENTED. Listed in fallback chains but no actual API handler in Edge Function.

**Action needed:**
- **4B.1** Implement DeepSeek API handler in `ai-universal-processor/index.ts` — add `deepseek` provider with DeepSeek V3.2 API routing (cost: $0.28/$0.42 per 1M tokens — cheapest LLM)
- **4B.2** Verify all 56+ sub-region→provider overrides are wired in the runtime routing (not just config)

### 4C. Video Provider Routing (Sora 2 + Veo 3 + Wan 2.6)

**Existing video provider matrix per zone:**

| Zone | Primary | Secondary | Tertiary |
|------|---------|-----------|----------|
| Claude Zone | Vertex Veo 3 | Sora 2 | Alibaba Wan 2.6 |
| Alibaba Zone | Alibaba Wan 2.6 | Vertex Veo 3 | Sora 2 |
| Gemini Zone | Vertex Veo 3 | Alibaba Wan 2.6 | ModelsLab |
| Fallback | Vertex Veo 3 | ModelsLab | Replicate |

**Production quality routing:**
- `standard` → Alibaba Wan 2.6 ($4.80/min) — best value
- `production` → Sora 2 Standard ($6.00/min) — cinematic
- `cinematic` → Sora 2 Pro ($30.00/min) or Veo 3.0 ($72.00/min) — premium

**SOAR2 note:** NO "SOAR2" framework exists in codebase. Quality scoring uses `aiQualityAssessmentService.ts` (0-100 scale). If SOAR2 is a desired framework, it needs to be designed from scratch.

### 4D. Multiple output types per format (user's vision)

**Key concept:** Each format produces MULTIPLE output types. User selects which outputs they want based on tier.

| Selected Format | Possible Outputs | Free | Starter | Creator | Pro+ |
|----------------|-----------------|------|---------|---------|------|
| **Video** | Full video, Shorts (15s/30s/60s), Audiogram, Thumbnail pack, Blog post, Social cards, Teasers | 1 output | 3 outputs | 5 outputs | All |
| **Podcast** | Audio (MP3), Video podcast, Audiogram, Show notes, Blog post, Social quotes, RSS, Character animation | Audio only | + Video podcast | + Audiogram, notes | All |
| **Presentation** | PPTX, Google Slides, PDF, Narrated video, Social cards, Slide thumbnails | PPTX only | + PDF | + Video | All |
| **Training** | Video, Quiz overlay, Captions, Certificate template, Assessment PDF | Video only | + Captions | + Quiz | All |
| **Shorts** | TikTok, Reels, YouTube Shorts, Stories, Snapchat | 1 platform | 2 platforms | 4 platforms | All |
| **Infographic** | Static image, Animated, Video walkthrough | Static only | + Animated | + Video | All |
| **Email** | HTML email, Video embed, GIF preview, Social card | HTML only | + GIF | + Video | All |
| **Document** | PDF, DOCX, Narrated video | PDF only | + DOCX | + Video | All |
| **Live Stream** | RTMP feed, Recording, Highlights, Clips | N/A | N/A | Recording | All |

**Implementation:**
- New `OutputSelector` component in PRODUCE → Generate
- Query `cast_output_presets` + format→preset mapping
- Filter by tier via `isFeatureAvailable()`
- Show locked presets with upgrade prompts
- Store in session: `selectedOutputPresets: string[]`

### 4E. Scene-to-Chapter Mapping + Script Sync

**What exists:**
- `useVideoTimeline.ts` → `TimelineChapter` with `sceneIds: string[]`
- `useProductionSession.ts` → creates chapters from scenes, but ALL scenes in ONE chapter
- `useSceneComposition.ts` → `importChapters()`, `exportChapters()`, `sceneToChapter()`
- `SceneAwareTeleprompter.tsx` → word-level cursor across scenes

**What's missing:**
- **Intelligent chapter auto-grouping** — group scenes by topic/section
- **Script-to-scene auto-split** — detect paragraphs/sections → create scene boundaries
- **Scene-to-chapter-to-chapter** nesting — chapter contains scenes, acts contain chapters
- **Visual cue binding** — "Cut to: dashboard" in script → triggers video prompt change

**Action needed:**
- **4E.1** Add `autoGroupChapters(scenes)` in `sceneCompositionEngine.ts`:
  - Analyze scene titles/scripts for topic breaks
  - Group contiguous scenes with related topics into chapters
  - Allow manual override
- **4E.2** Add `autoSplitToScenes(script)` in production bridge:
  - Detect paragraph breaks, "---" dividers, speaker changes
  - Each section becomes a scene
  - For podcast: each speaker turn = scene
  - For presentation: each slide = scene
- **4E.3** Wire `initializeFromMapping` — the critical missing bridge in `GenieCastConsolidatedTabs.tsx`:
  ```
  useEffect(() => {
    if (authoring.state.templateMapping && productionSession.session.totalScenes === 0) {
      productionSession.initializeFromMapping(authoring.state.templateMapping, formatName);
    }
  }, [authoring.state.templateMapping]);
  ```
  This single line activates: SceneAwareTeleprompter, A/V Sync, VideoTimelineEditor, SceneProgressTracker.

### 4F. Podcast as Pixar Character Animated Discussion

**Current state:** EP04 production config demonstrates the vision perfectly but is hardcoded for 5 specific characters (Host, Atlas, Nova, Allaudin, Squirrel). NOT reusable.

**Action needed:**
- **4F.1** Create generic `SpeakerConfig` type:
  ```
  interface SpeakerConfig {
    id: string
    name: string
    role: string                      // 'host' | 'guest' | 'narrator' | 'moderator'
    voiceProvider: string             // 'azure' | 'elevenlabs' | 'alibaba' | 'openai'
    voiceId: string                   // provider-specific voice ID
    voiceFallbackChain: string[]      // fallback voices
    avatarStyle: '3d-pixar' | 'disney-2d' | 'realistic' | 'none'
    avatarPrompt: string              // Pixar/style prompt for avatar generation
    motionStyle: string               // 'energetic' | 'measured' | 'calm'
    colorPalette: string[]
  }
  ```
- **4F.2** Create `podcast_character_discussion` sub-format in DB with:
  - Blueprint: 3-5 speaker slots (configurable)
  - Dialogue flow rules (turn-taking, transitions)
  - Scene environment prompts (studio, outdoors, fantasy, etc.)
- **4F.3** Build `DialogueScriptGenerator` service:
  - Input: topic + speaker list + scene count + tone
  - Output: structured dialogue with speaker labels + visual directions
  - Uses zone-routed LLM (Claude for creative, Qwen for CJK topics)
- **4F.4** Build `PodcastEditorPanel` in FormatStudioRouter:
  - Speaker config panel (add/remove speakers, assign voices, preview TTS)
  - Dialogue editor (turn-by-turn editing, timing controls, insert pauses)
  - Character avatar selector (pick from DB styles or custom Pixar prompt)
  - Multi-track audio preview with per-speaker volume
- **4F.5** Generalize EP04 pipeline steps into reusable atoms:
  - Extract `avatar-3d`, `avatar-lipsync`, `tts` steps to work with dynamic `SpeakerConfig`
  - Scene pipeline becomes: `for each turn in dialogue → tts(speaker) → avatar(speaker) → lipsync → composite`

### 4G. Presentation with Max Flexibility

**Current state:** `universalPresentationService.ts` + `PresentationWizard.tsx` (47K lines) — 80% complete with:
- Slide-by-slide generation with per-slide styling (Pixar, cinematic, whiteboard, infographic)
- Template mapping with variable injection
- Multi-language parallel generation
- Google Slides export, PDF, PPTX

**What's missing:**
- Dynamic post-generation slide composition (reorder, insert, delete, swap styles)
- Mix-and-match slides from different pipeline outputs
- Scene-to-slide binding with runtime flexibility

**Action needed:**
- **4G.1** Add `SlideComposer` panel to PresentationWizard:
  - After generation: drag-and-drop slide reordering
  - Per-slide style change (Pixar → cinematic → whiteboard)
  - Insert blank slide with template picker
  - Delete/duplicate slides
  - Scene→slide binding: "this slide corresponds to scene 3"
- **4G.2** Extend `universalPresentationService` with `composeDeck()`:
  - Input: array of `{slideId, style, content, templateId}`
  - Allows mixing slides from different runs
  - Pipeline outputs atomic slide components; composer assembles final deck
- **4G.3** Add slide template library in DB:
  - `cast_presentation_slide_templates` table
  - Layout types: title, content, 2-column, image-left, chart, quote, comparison, timeline
  - Each template: layout placeholders, animation config, style variants

### 4H. Wire remaining PRODUCE plumbing

- **4H.1** Wire ProductionControlPanel to real pipeline (replace console.log stubs)
- **4H.2** Wire ProductionTimeline to real progress (replace hardcoded zeros)
- **4H.3** Wire SceneProgressTracker (imported but never rendered)
- **4H.4** Wire all teleprompter callbacks (replace toast stubs)
- **4H.5** Wire credit deduction before every generation

---

## PHASE 5: Unified Editor (Mind ↔ Cast)

### 5.1 Create `useUnifiedEditorState` hook

**File:** `src/components/genie-studio/unified-editor/useUnifiedEditorState.ts`

Extract 37 state variables from ScriptEditorTab into reusable hook:
- Analysis, Enhancement, Brand Voice, Transcreation, Version History, AI Provider, TTS state
- Mind passes full script content. Cast passes active scene's script content.

### 5.2 Wire into Cast PRODUCE → Edit

Collapsible "Script Tools" panel alongside SceneAwareTeleprompter:
- Scene selection drives which script the unified panels analyze
- AI Analyze/Enhance/Brand Voice/Transcreation/Version History per scene

### 5.3 Wire Cast's timeline/teleprompter into Mind

Conditional panels in GenieMind.tsx when script is linked to production:
- VideoTimelineEditor, SceneAwareTeleprompter, ExportDistributionPanel, A/V Sync

### 5.4 Refactor ScriptEditorTab to use shared hook

Replace 37 inline useState with `useUnifiedEditorState({ mode: 'script', content, onContentChange })`.

---

## PHASE 6: GPU Rendering Pipeline (Cast + Vibe)

### 6.1 Implement `assemble_video` action in ai-universal-processor
- Input: scenes with video URLs, transitions, b-roll configs, output format
- Alibaba/RunPod FFmpeg with crossfade/transition
- Fallback: concatenate scene URLs

### 6.2 Implement `transcode_video` action
- Input: source URL, target preset (resolution, codec, bitrate, FPS, aspect ratio)
- Supports: 4K, 1080p, 720p, social (1:1, 9:16, 4:5), GIF, audio-only
- **Critical for PUBLISH:** auto-transcode full video to each platform's specs

### 6.3 Implement `burn_captions` action
- Input: video URL, SRT/VTT, style (font, size, color, position)

### 6.4 Implement `add_watermark` action
- Input: video URL, watermark image, position, opacity, scale

### 6.5 Implement `mix_audio` action (replace placeholder)
- Replace Math.random() in audio-mixer edge function
- FFmpeg amerge with ducking, normalization (-16 LUFS)
- Multi-speaker audio mixing for podcast format

### 6.6 Fix avatar lip-sync routing
- `audioUrl` + `sourceImageUrl` → lip-sync API (Alibaba WAN 2.2)
- No audio → text-to-video as current
- Multi-character lip-sync for podcast format (one per speaker)

### 6.7 Implement quality gate with real metrics
- FFprobe checks: resolution, codec, duration, audio levels, bitrate
- Silence gaps, audio clipping, black frames, frame drops detection
- LLM content safety scan on keyframes
- Scored checklist (pass/warn/fail per check)

### 6.8 Wire Vibe export presets
- Export preset dropdown (currently only MP4)
- Small files (<50MB): FFmpeg WASM client-side
- Large files: `transcode_video` server-side

### 6.9 Implement DeepSeek API handler
- Add `deepseek` provider in `ai-universal-processor/index.ts`
- DeepSeek V3.2: $0.28/$0.42 per 1M tokens — cheapest LLM in fallback chain
- Currently declared but NOT implemented

---

## PHASE 7: PRODUCE → PUBLISH Data Flow + Derivatives

### 7A. Pass production artifacts through approval gate

When PRODUCE completes, store in session:
```
productionArtifacts: {
  assembledVideoUrl: string          // full video
  sceneVideoUrls: string[]           // per-scene clips
  audioUrl: string                   // mixed audio track
  captionFiles: { lang: string, srtUrl: string }[]
  thumbnailUrls: string[]
  exportPresets: string[]            // which presets were requested
  speakerTracks: { speakerId: string, audioUrl: string }[]  // per-speaker for podcast
}
```
Approval gate validates: all scenes rendered, A/V sync passes, quality gate >= threshold.

### 7B. Auto-Generate Long-Form + Short-Form + Teasers

**Existing infrastructure:**
- `magic-clips-generator` edge function — AI-analyzed clip extraction from full videos
- `shorts-generator` edge function — batch clip generation with viral scoring
- `ContentRepurposingPanel.tsx` — activates 5 derivative pipelines (shorts, clips, thumbnails, captions, square)

**Wire the full derivative pipeline:**

For EVERY completed production, auto-generate:

| Derivative | Duration | Aspect | Purpose |
|-----------|----------|--------|---------|
| **Full video** | Original | 16:9 | YouTube, website, landing page |
| **Teaser** | 15s | 9:16 | Pre-launch buzz, stories |
| **Hook clip** | 5-10s | 9:16 | Attention grabber for feed |
| **Highlight reel** | 30-60s | 9:16 | TikTok, Reels, Shorts |
| **Audiogram** | 30-60s | 1:1 | Instagram feed, Twitter |
| **Square version** | Full | 1:1 | Instagram feed, Facebook |
| **Vertical version** | Full | 9:16 | TikTok, Reels, Stories |
| **GIF preview** | 5-15s | Various | Email, social previews |
| **Thumbnail pack** | Static | Various | Platform thumbnails |

**Per-language variants:** Each derivative generated in ALL selected output languages.

**Implementation:**
- After approval gate passes, trigger `magic-clips-generator` with `mode: 'auto'`
- Generate platform-specific clips per `shorts-generator` with engagement-optimized durations
- Transcode full video to all selected aspect ratios via `transcode_video`
- Generate captions in all output languages
- Store all derivatives in session: `productionDerivatives[]`

### 7C. Wire PUBLISH Distribution to 30+ Platforms

**Existing:** `social-publish` edge function supports YouTube, TikTok, Instagram, Twitter/X, LinkedIn, Facebook, Bluesky with OAuth.

**Wire:**
- `ExportDistributionPanel` → real `social-publish` edge function
- OAuth flows: `youtube-oauth`, `tiktok-oauth`, `instagram-oauth`, `linkedin-oauth`
- Platform-specific content selection: auto-pick best derivative per platform
  - YouTube → full video (16:9)
  - TikTok → highlight clip (9:16, 21s optimal)
  - Instagram Reels → highlight clip (9:16, 15s optimal)
  - Instagram Feed → square version (1:1)
  - LinkedIn → full video or 30s clip (16:9)
  - WhatsApp Status → teaser (9:16, 30s max, 16MB)
  - Email → GIF preview (640x360, 5MB)
  - Digital Signage → full video (4K)
- Tier gating: Free = download only, Starter = 2 platforms, Creator = 5, Pro+ = all 30+

### 7D. Marketing Collaterals Auto-Generation

**Existing:** `ProductOnePagers.tsx` generates product one-pagers.

**Missing collateral types to add:**

| Collateral | Generated From | Output |
|-----------|---------------|--------|
| Social cards | Video thumbnails + title + branding | Image (1200x630, 1080x1080) |
| Email banner | Key frame + CTA text | Image (600x200) |
| Blog post | Script/transcript | Markdown/HTML text |
| Show notes | Podcast script/transcript | Markdown text |
| Social quotes | Key soundbites from script | Image (1080x1080) with text overlay |
| Press release | Script + product info | Text document |
| Landing page hero | Video + headline | Background video + overlay text |

**Implementation:**
- New `CollateralGenerator` service
- Input: `productionArtifacts` + `brandKit`
- Output: array of `{ type, format, url, platformTarget }`
- Triggered after approval gate alongside derivatives

### 7E. Wire PUBLISH Scheduler

- Connect to `calendar-sync` edge function (7 actions)
- Content calendar with scheduled posts
- "Best time to post" per platform from AI analysis
- Tier gating: Free = manual, Starter+ = scheduling, Pro+ = optimal time

### 7F. Wire PUBLISH SEO + Viral Scoring

- `SEOOptimizerPanel` → auto-generate title, description, hashtags, thumbnail
- `og-metadata` edge function for embed previews
- `viral-score-predictor` for pre-publish scoring (0-100)
- Platform-specific hashtag optimization (max 10 per platform, auto-dedup)

### 7G. Subscription Module — Breakeven Research (HOLD)

**Status: DEFERRED** until cost research is complete.

**What we know from codebase:**
- Full video (2 min): $2.96 (budget) to $48.56 (premium Veo 3.0)
- 10-slide presentation: $0.14 (budget) to $2.17 (premium)
- 15-min podcast: $2.66 to $4.82
- Full campaign (all formats): $5.93 (budget) to $23.18 (premium)
- 1 Credit = $0.10 user value, costs $0.025-0.05 (50-75% margin)
- Old pricing model: Creator/Pro/Business tiers UNDERWATER (negative margins)
- New proposed model: 49-70% margins across all tiers

**What needs research:**
- Actual per-feature credit costs in `ai_feature_costs` table (are they complete?)
- Real usage patterns (how many credits does average user consume per month?)
- Provider cost trends (are prices dropping? renegotiation possible?)
- Competitive pricing check against current market

**Will revisit after 7H data is available.**

### 7H. Cast-Specific Subscription Analytics (START HERE)

**This is the foundation for 7G breakeven analysis.**

**Build:**
- Per-user credit consumption tracking by feature type
- Provider cost accumulation per production run (from `productionCostAccumulator.ts`)
- Dual display: internal USD cost vs external credit cost (from `tokenCreditService.ts`)
- Dashboard showing: cost-per-video, cost-per-podcast, cost-per-presentation by tier
- Regional cost variance (Alibaba zone = cheapest, Veo 3 zone = most expensive)
- Credit burn rate alerts (user consuming credits too fast? slow? right pace?)

**This data feeds 7G's breakeven analysis.**

---

## PHASE 8: Cast Analytics Dashboard

### 8.1 Create `useCastAnalytics` hook

**File:** `src/hooks/useCastAnalytics.ts`

Queries:
- `landing_page_videos`: generation counts, status, language distribution
- `composition_projects`: project-level metrics
- `ai_credit_transactions`: credit consumption per feature
- `cast_content_formats`: format usage distribution
- Token cost tracking from `productionCostAccumulator`
- Scoped to user + optional date range

### 8.2 Redesign AnalyticsDashboard

Sections:
1. **Overview cards**: Total videos, success rate, credits used, credits remaining, estimated cost
2. **Generation timeline**: Videos per day/week (real data)
3. **Format distribution**: Which formats used most
4. **Provider breakdown**: Which AI providers handle most work + cost per provider
5. **Status funnel**: Draft → Generating → Completed → Published → Engagement
6. **Regional coverage**: Languages/regions with content
7. **Cost tracking**: Real credit costs per video (from `ai_credit_transactions`)
8. **Pipeline performance**: Avg TTS time, video gen time, assembly time
9. **Derivative metrics**: How many shorts/teasers/collaterals generated per full video
10. **Platform distribution**: Which social platforms receive most content

### 8.3 Session-scoped + global analytics

Filter: "Current project" vs "All projects" vs date range.

---

## PHASE 9: Tier Gating Throughout

### 9.1 Create `useTierGatedAction` hook
```
const { execute, canExecute, upgradeNeeded } = useTierGatedAction('avatar_generation');
// canExecute: tier allows feature + credits sufficient
// execute: deducts credits then runs action
// upgradeNeeded: returns min tier needed
```

### 9.2 Gate output types by tier in PRODUCE
- OutputSelector shows ALL possible outputs per format
- Locked outputs show tier badge + "Upgrade to unlock"
- Credit cost shown per output type

### 9.3 Gate platform count in PUBLISH
- Free: Download only
- Starter: 2 platforms
- Creator: 5 platforms
- Pro+: All 30+

### 9.4 Gate video quality/resolution
- Free: 720p, Starter: 1080p, Creator: 1080p + social, Pro: 4K, Enterprise: 4K + custom

### 9.5 Gate transcreation language count
- Free: 2, Starter: 5, Creator: 15, Pro: 40, Business+: 70+

### 9.6 Gate derivative generation
- Free: Full video only (no auto-derivatives)
- Starter: + 1 short clip + thumbnail
- Creator: + 3 clips + audiogram + captions
- Pro+: All derivatives (shorts, teasers, collaterals, multi-language)

### 9.7 Credit cost display in UI
Show credit cost BEFORE every action:
- "Generate Video (10 credits)" button
- Running balance in header: "Credits: 347 / 500"
- Cost breakdown in production summary: "This production will use ~45 credits"

---

## EXECUTION ORDER (Priority)

| Order | Phase | What | Why First |
|-------|-------|------|-----------|
| **1** | Phase 1 | Session state foundation | Nothing works without data persistence |
| **2** | Phase 2 | CREATE→PRODUCE handoff | User's choices must reach production |
| **3** | Phase 3 | Content registry completeness | All formats/styles/capabilities visible |
| **4** | Phase 4A-4E | Wire PRODUCE real gen + scene-chapter | Replace stubs, wire real pipeline |
| **5** | Phase 4F | Podcast character discussion format | Pixar-style animated dialogue |
| **6** | Phase 4G | Presentation max flexibility | Dynamic slide composition |
| **7** | Phase 5 | Unified editor | Mind↔Cast feature parity |
| **8** | Phase 6 | GPU rendering pipeline | Real video assembly/transcode/mix |
| **9** | Phase 7B-7D | Auto-derivatives + collaterals | Long/short/teaser generation |
| **10** | Phase 7C,7E,7F | PUBLISH distribution + scheduler + SEO | Real platform publishing |
| **11** | Phase 7H | Cast subscription analytics | Data for breakeven analysis |
| **12** | Phase 8 | Cast analytics dashboard | Real metrics |
| **13** | Phase 9 | Tier gating | Revenue enforcement |
| **HOLD** | Phase 7G | Subscription breakeven | After 7H data available |

Phases 1-4 are FOUNDATIONAL — the product doesn't work without them.
Phases 5-6 are QUALITY — make the product competitive.
Phases 7-9 are REVENUE — make the product monetizable.
Phase 7G is STRATEGIC — needs real usage data first.

---

## FILES MODIFIED (Estimated)

| Phase | Files Modified | Files Created | Lines Changed |
|-------|---------------|---------------|---------------|
| 1 | 2 | 0 | ~300 |
| 2 | 3 | 0 | ~400 |
| 3 | 3 | 0 | ~200 |
| 4A-4E | 5 | 0 | ~800 |
| 4F | 2 | 3 | ~600 |
| 4G | 2 | 1 | ~400 |
| 5 | 4 | 2 | ~800 |
| 6 | 3 | 0 | ~600 |
| 7A-7D | 3 | 2 | ~700 |
| 7C,7E,7F | 3 | 0 | ~400 |
| 7H | 2 | 1 | ~300 |
| 8 | 2 | 1 | ~400 |
| 9 | 5 | 1 | ~300 |
| **Total** | **~39** | **~11** | **~6,200** |

---

## KEY REFERENCE FILES

| What | File |
|------|------|
| Session state | `src/hooks/useGenieCastSession.ts` |
| Consolidated tabs | `src/components/genie-admin/genie-cast/GenieCastConsolidatedTabs.tsx` |
| Production bridge | `src/services/production/castProductionBridge.ts` |
| Content registry | `src/hooks/useCastContentRegistry.ts` |
| Format router | `src/components/genie-admin/genie-cast/FormatStudioRouter.tsx` |
| Platform export | `src/hooks/video-editing/usePlatformExport.ts` |
| Export/distribution UI | `src/components/genie-admin/genie-cast/editing/ExportDistributionPanel.tsx` |
| Magic clips | `supabase/functions/magic-clips-generator/index.ts` |
| Shorts generator | `supabase/functions/shorts-generator/index.ts` |
| Social publish | `supabase/functions/social-publish/index.ts` |
| AI universal processor | `supabase/functions/ai-universal-processor/index.ts` |
| Zone routing | `src/config/master-provider-routing-registry.ts` |
| Regional routing | `src/config/regional-routing-registry.ts` |
| Region hierarchy | `src/config/regionHierarchy.ts` |
| Tier feature gating | `src/config/tierFeatureGating.ts` |
| Subscription tiers | `src/constants/subscriptionTiers.ts` |
| Credit hook | `src/hooks/useAICredits.ts` |
| Cost accumulator | `src/services/productionCostAccumulator.ts` |
| Token/credit service | `src/services/tokenCreditService.ts` |
| EP04 production config | `src/config/ep04-production-config.ts` |
| Scene rendering | `src/services/production/sceneRenderingOrchestrator.ts` |
| Production session | `src/hooks/video-editing/useProductionSession.ts` |
| Video timeline | `src/hooks/video-editing/useVideoTimeline.ts` |
| Scene composition | `src/services/sceneCompositionEngine.ts` |
| Presentation service | `src/services/universalPresentationService.ts` |
| Presentation wizard | `src/components/genie-studio/presentation-generator/PresentationWizard.tsx` |
| Analytics dashboard | `src/components/genie-admin/genie-cast/AnalyticsDashboard.tsx` |
| Pricing strategy | `src/components/diagrams/genie-command-center/data/pricing-strategy-analysis.ts` |
| Business intelligence | `GENIESUITE_PHASE9_BUSINESS_INTELLIGENCE.md` |
