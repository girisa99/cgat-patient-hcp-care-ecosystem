 # Genie Cast Implementation Audit
 
 > **Purpose**: Inventory what exists, what's missing, and the recommended next steps
 > **Date**: February 2026
 
 ---
 
## 📊 Current Implementation Status (Updated Phase 2)
 
### ✅ Fully Implemented
 
 | Component | File | Description |
 |-----------|------|-------------|
 | **4-Tab Hub** | `GenieCastConsolidatedTabs.tsx` | CREATE/PRODUCE/MANAGE/PUBLISH navigation |
 | **Template Grid** | `BlueprintTemplatesGrid.tsx` | 407+ templates with filtering, search, categories |
 | **Template Preview** | `BlueprintPreviewModal.tsx` | Scene-by-scene preview with timing |
 | **Template Creation** | `CreateTemplateDialog.tsx` | AI-assisted + Clone + Visual builder |
 | **Messaging Generator** | `MessagingGeneratorPanel.tsx` | Hooks, CTAs, benefits, 14-language transcreation |
 | **Brand Assets** | `BrandAssetsPanel.tsx` | Logos, screenshots, colors |
 | **Video Matrix** | `VideoGenerationMatrix.tsx` | Product × Language batch generation |
 | **Style Cards** | `VideoStyleCards.tsx` | 43 video styles from registry |
 | **Flow Diagram** | `GenieCastFlowDiagram.tsx` | Pipeline visualization |
 | **Filter Bar** | `TemplateFilterBar.tsx` | Region, device, capability, combination filters |
| **Style Intent Resolver** | `styleIntentResolver.ts` | ✅ NEW - Decouples templates from providers |
| **Regional Dialect Selector** | `RegionalDialectSelector.tsx` | ✅ NEW - India/MENA/CJK sub-regions |
| **Unified Authoring Hook** | `useUnifiedAuthoring.ts` | ✅ NEW - Cross-product authoring workflow |
| **Script Template Mapper** | `ScriptTemplateMapper.tsx` | ✅ NEW - Scene-to-script alignment |
| **Authoring Stage Indicator** | `AuthoringStageIndicator.tsx` | ✅ NEW - Visual progress indicator |
 
### ⚠️ Partially Implemented (Needs Connection)

| Component | File | What's Missing |
|-----------|------|----------------|
| **Script Preview** | `ScriptPreviewPanel.tsx` | ✅ Has TTS, needs useUnifiedAuthoring integration |
| **ScriptTemplateMapper** | ✅ WIRED | Integrated into PRODUCE > Studio sub-tab |
| **Style-Driven Config** | ✅ WIRED | Integrated into PRODUCE > Generate sub-tab |
 
 ### ❌ Missing Components (All P1 Complete!)

 | Component | Purpose | Priority |
 |-----------|---------|----------|
| **`style_intent` Field** | ✅ DONE - Added to video_blueprints | ~~P0~~ |
| **ScriptTemplateMapper** | ✅ DONE - Created component | ~~P0~~ |
| **AVSyncPreview** | ✅ DONE - Timeline, waveform, playhead, sync indicators | ~~P1~~ |
| **ApprovalDashboard** | ✅ DONE - Unified approval queue with session state | ~~P1~~ |
| **Regional Sub-Selector** | ✅ DONE - RegionalDialectSelector created | ~~P1~~ |
| **useUnifiedAuthoring** | ✅ DONE - Cross-product hook created | ~~P2~~ |
| **Template Selection Wiring** | ✅ DONE - BrandAssetsPanel → castSession.selectTemplate | ~~P1~~ |
| **Messaging Approval Wiring** | ✅ DONE - MessagingGeneratorPanel → castSession.approveMessaging | ~~P1~~ |
| **CREATE → PRODUCE Handoff** | ✅ DONE - useGenieCastSession persists state across tabs | ~~P1~~ |
 
 ---
 
 ## 🔗 Existing Cross-Product Patterns
 
 ### From `useStudioEcosystem.ts` (Composition Studio)
 
 ```typescript
 // ✅ Already Built - Can Import Directly
 generateVoiceover(text, languageCode, tier)    // 4-zone TTS routing
 transcreateContent(script, source, targets)    // Multi-language
 generateMultiLanguageAudio(scripts, tier)      // Batch TTS
 generateVideo(prompt, visualType, duration)    // Video with fallback
 combineChapterVideos(chapters)                 // FFmpeg stitching
 mixAudio(voiceUrl, musicUrl, options)          // Voice + music mixing
 generateCaptions(audioUrl, languageCode)       // SRT/VTT generation
 ```
 
 ### From `translationService.ts`
 
 ```typescript
 // ✅ Already Built - Can Import Directly
 translate({ text, sourceLanguage, targetLanguage, domain })
 getRecommendedProvider(sourceLanguage, targetLanguage)
 getMultiLanguageSelectionImpact(provider, source, targets)
 ```
 
 ### From `multiLanguageAudioOrchestrator.ts`
 
 ```typescript
 // ✅ Already Built - Can Import Directly
 createSession()
 addVoiceJob(sessionId, text, languageCode, options, tier)
 addMusicJob(sessionId, prompt, duration, tier)
 executeSession(sessionId, progressCallback)
 LANGUAGE_VOICE_MAPPINGS  // 4-zone provider routing
 ```
 
 ---
 
 ## 📐 Database Schema Review
 
 ### `video_blueprints` Table (Exists)
 
 ```typescript
 interface VideoBlueprint {
   id: string;
   name: string;
   description: string | null;
   category: string;
   thumbnail_url: string | null;
   preview_video_url: string | null;
   estimated_duration_seconds: number;
   target_platform: string[];
   industry_tags: string[];
   default_settings: Record<string, any>;  // ← Can store style_intent here
   style_preset: Record<string, any>;      // ← Or here
   is_system_default: boolean;
   is_active: boolean;
   usage_count: number;
   scenes?: BlueprintScene[];
 }
 ```
 
 ### `blueprint_scenes` Table (Exists)
 
 ```typescript
 interface BlueprintScene {
   id: string;
   blueprint_id: string;
   scene_key: string;
   title: string;
   order_index: number;
   scene_type: string;
   script_template: string | null;  // ← Script with {{variables}}
   duration_seconds: number;
   min_duration_seconds: number;
   max_duration_seconds: number;
   visual_config: Record<string, any>;
   audio_config: Record<string, any>;
   transition_config: Record<string, any>;
 }
 ```
 
 ### ❌ Missing: `style_intent` Column
 
 Need to add to `video_blueprints`:
 ```sql
 ALTER TABLE video_blueprints 
 ADD COLUMN style_intent TEXT DEFAULT 'corporate';
 
 ALTER TABLE video_blueprints 
 ADD COLUMN target_regions TEXT[] DEFAULT ARRAY['global'];
 
 ALTER TABLE video_blueprints 
 ADD COLUMN supported_dialects JSONB DEFAULT '{}';
 ```
 
 ---
 
 ## 🎯 Recommended Next Step: Phase 1 + Regional UI
 
 Based on the audit, the **best approach** is to start with **Phase 1 (Style Abstraction)** combined with the **Regional Sub-Selector UI**:
 
 ### Why Start Here?
 
 1. **Unblocks Everything**: Without `style_intent`, templates stay locked to DALL-E
 2. **Low Risk**: Adding a field doesn't break existing functionality
 3. **Regional UI Now**: Since you need granular dialects (India N/S/E/W, MENA), build UI during schema change
 4. **Quick Win**: 1-2 days to complete
 
 ### Implementation Steps
 
 ```
 STEP 1: Database Migration (30 min)
 ├── Add style_intent column to video_blueprints
 ├── Add target_regions column (array)
 ├── Add supported_dialects column (JSONB)
 └── Update existing 407 templates with default style_intent
 
 STEP 2: Style Intent Resolver Service (2-4 hours)
 ├── Create src/services/styleIntentResolver.ts
 ├── Map style_intent → provider chain
 ├── Integrate with 4-zone routing
 └── Export for use in genie-cast-assembler
 
 STEP 3: Regional Sub-Selector UI (4-6 hours)
 ├── Create RegionalDialectSelector component
 ├── Add to MessagingGeneratorPanel (transcreation)
 ├── Add to ScriptPreviewPanel (TTS voice selection)
 ├── Show sub-regions: India (N/S/E/W), MENA (7 dialects)
 └── Wire to existing LANGUAGE_VOICE_MAPPINGS
 
 STEP 4: Connect Messaging → Script (2-4 hours)
 ├── Add "Use Approved Messaging" prop handoff
 ├── Pass approvedMessaging from MessagingGeneratorPanel
 ├── ScriptPreviewPanel receives and composes scripts
 └── Add navigation button: "Continue to Script →"
 ```
 
 ---
 
 ## 📋 Files to Create/Modify
 
 ### New Files
 
 ```
 src/services/styleIntentResolver.ts              # Style → Provider mapping
 src/components/shared/RegionalDialectSelector.tsx # Sub-region UI
 ```
 
 ### Files to Modify
 
 ```
 src/hooks/useVideoBlueprints.tsx                 # Add style_intent type
 src/components/genie-admin/genie-cast/GenieCastConsolidatedTabs.tsx  # Wire messaging → script
 src/components/genie-admin/genie-cast/ScriptPreviewPanel.tsx         # Receive approved messaging
 src/components/genie-admin/MessagingGeneratorPanel.tsx               # Add regional selector
 supabase/functions/genie-cast-assembler/index.ts                     # Use style resolver
 ```
 
 ---
 
 ## ✅ Recommended Answer: Build Regional UI with Phase 1
 
 **Best approach for regional dialects:**
 
 > Build the **RegionalDialectSelector** component NOW as part of Phase 1, because:
 > - The `style_intent` schema change is the right time to add `target_regions` and `supported_dialects`
 > - The UI can immediately use the existing `LANGUAGE_VOICE_MAPPINGS` from `multiLanguageAudioOrchestrator`
 > - Avoids separate Phase 3 work later
 
 **Shall I proceed with Phase 1 + Regional UI implementation?**