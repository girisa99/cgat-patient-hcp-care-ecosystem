 # Consolidated Template Implementation Plan
 
 > **Master Document** - Combines: Style Intent, Regional Strategy, Bottlenecks, Workflow Gaps, Cross-Product Reuse
 > **Last Updated:** February 2026
 > **Status:** Ready for Review
 
 ---
 
 ## 📊 Executive Summary
 
 This document consolidates all template-related documentation into a single implementation plan:
 
 | Area | Source Document | Key Takeaway |
 |------|-----------------|--------------|
 | Style Abstraction | `template-style-intent-abstraction.md` | Decouple templates from providers via `style_intent` field |
 | Regional Gaps | `TEMPLATE_REGIONAL_STRATEGY.md` | 407+ templates need regional expansion (MENA, India, CJK, Africa) |
 | Infrastructure | `template-system-infrastructure-constraints.md` | 4 bottlenecks: RTL, CJK fonts, Arabic dialects, Mobile variants |
 | Workflow Gaps | `TEMPLATE_TO_PUBLISH_WORKFLOW.md` | 8-stage pipeline missing 3 critical components |
 | Cross-Product Reuse | This document | Leverage Spark/Mind/Deck/Vibe/Composition Studio patterns |
 
 ---
 
 ## 🏗️ Architecture: Style Intent Abstraction
 
 ### The Problem
 
 Many existing templates were seeded with OpenAI/DALL-E, but the master routing registry designates DALL-E as "LAST RESORT ONLY." This creates a conflict between template fidelity and cost optimization.
 
 ### The Solution
 
 Replace hardcoded `provider` with semantic `style_intent`:
 
 ```typescript
 // BEFORE: Locked to provider
 interface BlueprintTemplate {
   provider: "openai-dalle-3";  // ❌ Locked
   model: "dall-e-3";
 }
 
 // AFTER: Style-based routing
 interface BlueprintTemplate {
   style_intent: StyleIntent;           // ✅ Semantic
   tone_modifier?: ToneModifier;
   aesthetic_keywords?: string[];
   original_provider?: string;          // Audit trail only
 }
 
 type StyleIntent = 
   | 'photorealistic' | 'cinematic' | 'anime' | 'pixar-3d'
   | 'watercolor' | 'minimalist' | 'corporate' | 'editorial'
   | 'product-hero' | 'lifestyle' | 'documentary' | 'explainer'
   | 'ugc-authentic' | 'luxury-fashion' | 'tech-startup';
 ```
 
 ### Style Intent → Provider Mapping
 
 | Style Intent | Primary | Secondary | Tertiary | Fallback |
 |--------------|---------|-----------|----------|----------|
 | `photorealistic` | Gemini 3 Pro | Vertex Imagen 3 | ModelsLab FLUX | DALL-E |
 | `cinematic` | Vertex Veo 3 | Sora 2 | Alibaba Wan 2.6 | ModelsLab |
 | `anime` | ModelsLab Anime | Alibaba Wan 2.6 | Replicate | — |
 | `pixar-3d` | Alibaba Wan 2.6 | ModelsLab | Meshy 3D | — |
 | `corporate` | Gemini 3 Pro | Vertex Imagen 3 | ModelsLab FLUX | DALL-E |
 | `product-hero` | Gemini 3 Pro | Vertex Imagen 3 | ModelsLab FLUX | DALL-E |
 
 ---
 
 ## 🌍 Regional Strategy: One Template → Many Videos
 
 ### Current Inventory (407+ Templates)
 
 | Zone | Coverage | Gap | Priority |
 |------|----------|-----|----------|
 | **Claude Zone** (Western/EU) | ✅ ~300 | Need more EU variants | P2 |
 | **Alibaba Zone** (CJK) | ⚠️ ~40 | Japanese, Korean, Chinese | P1 |
 | **Alibaba Zone** (MENA/RTL) | ⚠️ ~30 | RTL layouts, 7 Arabic dialects | P0 |
 | **Gemini Zone** (India/SEA) | ⚠️ ~25 | Bollywood, regional festivals | P0 |
 | **Gemini Zone** (Africa) | ❌ ~12 | Swahili, Yoruba, Amharic | P1 |
 
 ### One Template → Multi-Regional Output
 
 ```
 USER selects template (style_intent: photorealistic)
   → Zone Detection: MENA/RTL (via IP)
   → Style Resolution: photorealistic → Gemini 3 Pro (images)
   → TTS Resolution: Azure Neural (7 Arabic dialects)
   → LLM Resolution: Alibaba Qwen-Max (regional context)
   → OUTPUT: Same visual track, regionally authentic audio
 ```
 
 **Key Principle**: Single visual / Multi-audio assembly strategy.
 
 ---
 
 ## 🔴 Infrastructure Bottlenecks (Must Fix Before Phase 2)
 
 | Bottleneck | Impact | Solution | Effort |
 |------------|--------|----------|--------|
 | **RTL Layout Engine** | Arabic templates display incorrectly | Update `genie-cast-assembler` for flipped layouts | 3-5 days |
 | **CJK Typography** | Chinese/Japanese/Korean text rendering | Embed Noto Sans CJK fonts in video pipeline | 2-3 days |
 | **Arabic Dialect TTS** | Only MSA available | Map templates to dialect selector (ar-SA, ar-AE, ar-EG, ar-MA, ar-JO, ar-IQ, ar-LB) | 1-2 days |
 | **Mobile Variants** | Only ~30% have 9:16 | Batch-generate portrait versions | 3-5 days |
 
 ---
 
 ## 📋 Template-to-Publish Workflow (8 Stages)
 
 ### Current vs. Ideal State
 
 | Stage | Description | Current State | Gap |
 |-------|-------------|---------------|-----|
 | 1. Template Selection | AI-assisted + Manual | ✅ `BlueprintTemplatesGrid` | Complete |
 | 2. Messaging Generation | Hooks, CTAs, positioning | ✅ `MessagingGeneratorPanel` | Complete |
 | 3. Script Generation | Product-specific scripts | ⚠️ `ScriptPreviewPanel` exists | Needs integration |
 | 4. Script-Template Mapping | Auto-fit or extend chapters | ❌ No UI | **MISSING** |
 | 5. TTS/Voiceover | Regional routing | ⚠️ TTS exists but isolated | Needs connection |
 | 6. A/V Synchronization | Preview aligned audio + visual | ❌ No sync preview | **MISSING** |
 | 7. Approval Review | Chapter-by-chapter approval | ⚠️ Exists but not connected | Needs unification |
 | 8. Publish | Multi-platform distribution | ⚠️ UI exists, not wired | Needs wiring |
 
 ---
 
 ## ♻️ Cross-Product Reuse Analysis
 
 ### Existing Patterns to Leverage
 
 | Product | Pattern | Location | Reuse For |
 |---------|---------|----------|-----------|
 | **Spark** | Content extraction | `useIdeaGeneration.ts` | Script generation from inputs |
 | **Mind** | Multi-model routing | `useUniversalAI.ts` | Quality routing for TTS/LLM |
 | **Mind** | Confidence scoring | `ConfidenceLoopEngine.ts` | Quality gates before approval |
 | **Deck** | Slide-to-script mapping | `genie-studio-video-script.ts` | Scene-to-script alignment |
 | **Deck** | Chapter duration | `ChapterScript` interface | Duration estimation |
 | **Vibe** | Video generation | `unifiedVideoService.ts` | Visual asset creation |
 | **Composition Studio** | `StudioChapter` interface | `useStudioEcosystem.ts` | Unified chapter model |
 | **Composition Studio** | TTS generation | `generateVoiceover()` | Regional voice routing |
 | **Composition Studio** | Transcreation | `translationService` | Multi-language scripts |
 | **Composition Studio** | Edit suggestions | `proactivePipelineEditorService` | AI-powered refinements |
 
 ### Already Built (Reuse Immediately)
 
 ```typescript
 // FROM: src/components/genie-admin/composition-studio/useStudioEcosystem.ts
 export function useStudioEcosystem() {
   // ✅ Voice generation with 4-zone routing
   const generateVoiceover = useCallback(async (text, languageCode, tier) => { ... });
   
   // ✅ Multi-language transcreation
   const transcreateContent = useCallback(async (script, source, targets, domain) => { ... });
   
   // ✅ Multi-language audio generation
   const generateMultiLanguageAudio = useCallback(async (scripts, tier) => { ... });
   
   // ✅ Video generation with fallback
   const generateVideo = useCallback(async (prompt, visualType, duration, sourceImage) => { ... });
   
   // ✅ Chapter video stitching
   const combineChapterVideos = useCallback(async (chapterVideos) => { ... });
   
   // ✅ Audio mixing (voice + music)
   const mixAudio = useCallback(async (voiceUrl, musicUrl, options) => { ... });
   
   // ✅ Captions generation
   const generateCaptions = useCallback(async (audioUrl, languageCode, style) => { ... });
 }
 ```
 
 ### Need to Build (New Components)
 
 | Component | Purpose | Priority |
 |-----------|---------|----------|
 | `ScriptTemplateMapper.tsx` | Scene-to-script alignment, duration estimation | P0 |
 | `AVSyncPreview.tsx` | Timeline scrubbing, waveform sync preview | P0 |
 | `ApprovalDashboard.tsx` | Unified approval queue across stages | P1 |
 | `useUnifiedAuthoring.ts` | Shared hook for all products | P1 |
 
 ---
 
 ## 🎯 Implementation Roadmap
 
 ### Phase 1: Style Abstraction (1-2 days)
 **Goal**: Unlock templates from DALL-E without regeneration
 
 - [ ] Add `style_intent` field to `blueprint_templates` table
 - [ ] Create mapping function: `style_intent` → provider chain
 - [ ] Update `genie-cast-assembler` to use style routing
 - [ ] Migrate existing 407 templates (add `style_intent` metadata)
 
 ### Phase 2: Connect Existing Components (2-3 days)
 **Goal**: Wire existing scattered components together
 
 - [ ] Connect `MessagingGeneratorPanel` output → `ScriptPreviewPanel` input
 - [ ] Add "Use Approved Messaging" toggle in script generator
 - [ ] Connect script approval → video generation trigger
 - [ ] Import `useStudioEcosystem` patterns into Genie Cast
 
 ### Phase 3: Fix Infrastructure Bottlenecks (5-7 days)
 **Goal**: Enable regional template generation
 
 - [ ] RTL Layout Engine in `genie-cast-assembler`
 - [ ] CJK font embedding (Noto Sans CJK)
 - [ ] Arabic dialect selector (7 dialects → Azure Neural voices)
 - [ ] Mobile variant batch generation pipeline
 
 ### Phase 4: Build Missing Components (5-7 days)
 **Goal**: Complete the 8-stage workflow
 
 - [ ] Build `ScriptTemplateMapper.tsx`
   - Side-by-side: Template scenes ↔ Script segments
   - Duration indicators (150 WPM = 30s per 75 words)
   - "Auto-Fit" AI trim/extend
   - "Add Chapter" template extension
 
 - [ ] Build `AVSyncPreview.tsx`
   - Timeline with audio waveform
   - Visual thumbnails aligned to timeline
   - Playhead scrubbing
   - Sync status indicators (green/red)
 
 - [ ] Build `ApprovalDashboard.tsx`
   - Unified view: Messaging → Scripts → A/V → Publish
   - Progress indicator (e.g., "3 of 4 stages approved")
   - "Approve All" with dependency validation
 
 ### Phase 5: Extract Shared Hook (2-3 days)
 **Goal**: Cross-product reuse
 
 - [ ] Create `useUnifiedAuthoring.ts`
 - [ ] Migrate patterns from Spark/Mind/Deck/Vibe/Composition
 - [ ] Update Genie Cast to use shared hook
 - [ ] Update other products to use shared hook
 
 ### Phase 6: Regional Template Expansion (Ongoing)
 **Goal**: Fill regional gaps with native templates
 
 | Region | New Templates | Aesthetic Focus |
 |--------|---------------|-----------------|
 | MENA/RTL | +50 | Arabesque, Islamic geometry, RTL layouts |
 | India | +40 | Bollywood, regional festivals, cricket |
 | CJK | +60 | Anime, minimalist (Muji), K-pop |
 | Africa | +30 | Pan-African, tribal patterns, vibrant colors |
 | SEA | +25 | Buddhist, tropical, modern Asian |
 | LATAM | +20 | Carnival, soccer, colonial architecture |
 
 ---
 
 ## 📁 Files to Create/Modify
 
 ### New Files
 
 ```
 src/hooks/useUnifiedAuthoring.ts              # Shared authoring hook
 src/components/genie-admin/genie-cast/ScriptTemplateMapper.tsx
 src/components/genie-admin/genie-cast/AVSyncPreview.tsx
 src/components/genie-admin/genie-cast/ApprovalDashboard.tsx
 src/services/styleIntentResolver.ts           # Style → Provider mapping
 ```
 
 ### Files to Modify
 
 ```
 src/components/genie-admin/genie-cast/GenieCastConsolidatedTabs.tsx
 src/components/genie-admin/genie-cast/ScriptPreviewPanel.tsx
 src/components/genie-admin/MessagingGeneratorPanel.tsx
 supabase/functions/genie-cast-assembler/index.ts
 ```
 
 ---
 
 ## ✅ Success Criteria
 
 | Criteria | Metric |
 |----------|--------|
 | End-to-end flow | User can go from template → published video in one session |
 | Style abstraction | All 407 templates route to optimal providers (not DALL-E) |
 | Script-template sync | 90%+ auto-fit accuracy without manual adjustment |
 | A/V alignment | Audio matches scene duration within ±2 seconds |
 | Approval flow | Single dashboard shows all pending items |
 | Regional coverage | 225+ new regional templates added |
 | Cross-product reuse | `useUnifiedAuthoring` used by 3+ products |
 
 ---
 
 ## 🔗 Related Documentation
 
 - `.note/memory/architecture/ai/template-style-intent-abstraction.md`
 - `.note/memory/infrastructure/genie-cast/template-system-infrastructure-constraints.md`
 - `docs/TEMPLATE_REGIONAL_STRATEGY.md`
 - `docs/TEMPLATE_TO_PUBLISH_WORKFLOW.md`
 
 ---
 
 **Document Status**: Ready for Implementation Review
 **Next Step**: Approve phases and begin Phase 1 (Style Abstraction)