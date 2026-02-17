 # Template-to-Publish Workflow: Complete UX Analysis
 
 **Purpose**: Document the 8-stage authoring pipeline, identify gaps, and map reusable patterns.
 
 ---
 
 ## 📊 Current vs. Ideal State Comparison
 
 | Stage | Ideal Workflow | Current State | Gap Status |
 |-------|----------------|---------------|------------|
 | 1. Template Selection | AI-assisted + Manual selection from 407+ library | ✅ `BlueprintTemplatesGrid` + `CreateTemplateDialog` | **COMPLETE** |
 | 2. Messaging Generation | Hooks, CTAs, positioning, differentiation | ✅ `MessagingGeneratorPanel` with approval workflow | **COMPLETE** |
 | 3. Script Generation | Product-specific scripts from messaging | ⚠️ `ScriptPreviewPanel` exists but not integrated | **PARTIAL** |
 | 4. Script-Template Mapping | Auto-fit or extend chapters/slides | ❌ No UI for mapping scripts to template scenes | **MISSING** |
 | 5. TTS/Voiceover | Regional routing with preview | ⚠️ TTS exists in `ScriptPreviewPanel` but isolated | **PARTIAL** |
 | 6. A/V Synchronization | Preview aligned audio + visual | ❌ No sync preview before assembly | **MISSING** |
 | 7. Approval Review | Chapter-by-chapter approve/reject | ⚠️ Exists in `ScriptPreviewPanel` but not connected | **PARTIAL** |
 | 8. Publish | Multi-platform distribution | ⚠️ UI exists in PUBLISH tab but not wired | **PARTIAL** |
 
 ---
 
 ## 🔴 Critical Missing Components
 
 ### 4.1 Script-to-Template Mapper (MISSING)
 **What It Does**: Aligns generated scripts to template scenes/chapters
 
 **Required UI**:
 - Side-by-side view: Template scenes (left) ↔ Script segments (right)
 - Duration indicators (scene duration vs. script reading time)
 - "Auto-Fit" button: AI trims/extends script to match
 - "Add Chapter" button: Extends template when script exceeds capacity
 - Drag-drop reordering of script segments
 
 **Reusable Pattern**: `useStudioEcosystem.ts` already has `StudioChapter` interface with:
 ```typescript
 interface StudioChapter {
   id: string;
   title: string;
   script: string;
   duration: number;
   // ... other fields
 }
 ```
 
 ### 4.2 A/V Sync Preview (MISSING)
 **What It Does**: Shows synchronized playback of audio + visuals before final render
 
 **Required UI**:
 - Timeline view with audio waveform
 - Visual thumbnails aligned to timeline
 - Playhead scrubbing
 - "Preview Scene" button per chapter
 - Sync indicators (green = aligned, red = mismatch)
 
 **Reusable Pattern**: `useLiveVideoGeneration.ts` has audio timing logic:
 ```typescript
 // Audio/video sync pattern from landing showcase
 audioRef.current.onended = () => setPlayingChapter(null);
 ```
 
 ### 4.3 Unified Approval Queue (PARTIAL → NEEDS INTEGRATION)
 **What It Does**: Consolidated view of all pending approvals
 
 **Current State**: 
 - `ScriptPreviewPanel` has chapter approval
 - `MessagingGeneratorPanel` has messaging approval
 - **NOT connected to each other**
 
 **Required Integration**:
 - Unified approval dashboard showing: Messaging → Scripts → A/V → Publish
 - Progress indicator (e.g., "3 of 4 stages approved")
 - "Approve All" with dependency checks
 
 ---
 
 ## ♻️ Reusable Patterns from Existing Products
 
 ### From Genie Spark (Idea Generation)
 | Pattern | Location | Reuse For |
 |---------|----------|-----------|
 | Content composition | `useIdeaGeneration.ts` | Script generation from prompts |
 | Template selection | `TemplateSelector.tsx` | Blueprint selection UI |
 
 ### From Genie Mind (AI Processing)
 | Pattern | Location | Reuse For |
 |---------|----------|-----------|
 | Multi-model routing | `useUniversalAI.ts` | Script generation routing |
 | Confidence scoring | `ConfidenceLoopEngine.ts` | Quality gates before approval |
 
 ### From Genie Deck (Presentation)
 | Pattern | Location | Reuse For |
 |---------|----------|-----------|
 | Slide-to-script mapping | `genie-studio-video-script.ts` | Scene-to-script alignment |
 | Chapter duration | `ChapterScript` interface | Duration estimation |
 | Export workflow | `exportPresentation.ts` | Multi-format output |
 
 ### From Composition Studio (Video)
 | Pattern | Location | Reuse For |
 |---------|----------|-----------|
 | `StudioChapter` interface | `useStudioEcosystem.ts` | Unified chapter model |
 | TTS generation | `generateVoiceover()` | Regional voice routing |
 | Video generation | `generateVideo()` | Visual asset creation |
 | Transcreation | `translationService` | Multi-language scripts |
 | Edit suggestions | `proactivePipelineEditorService` | AI-powered refinements |
 
 ---
 
 ## 🏗️ Proposed Shared Service: `useUnifiedAuthoring`
 
 Extract common patterns into a cross-functional hook:
 
 ```typescript
 // src/hooks/useUnifiedAuthoring.ts
 export function useUnifiedAuthoring() {
   // FROM: useStudioEcosystem
   const generateVoiceover = useCallback(...);
   const generateVideo = useCallback(...);
   
   // FROM: ScriptPreviewPanel  
   const composeScriptFromMessaging = useCallback(...);
   const generateTTS = useCallback(...);
   
   // FROM: genie-studio-video-script
   const getChapterScript = useCallback(...);
   
   // NEW: Script-Template Mapping
   const mapScriptToTemplate = useCallback((
     script: string,
     template: BlueprintTemplate
   ) => {
     // Calculate words-per-minute
     // Split into scene-sized chunks
     // Return mapping with duration estimates
   });
   
   // NEW: A/V Sync Validation
   const validateAVSync = useCallback((
     audioUrl: string,
     sceneDuration: number
   ) => {
     // Check audio duration vs scene duration
     // Return sync status: 'aligned' | 'too_long' | 'too_short'
   });
   
   return {
     // Audio
     generateVoiceover,
     generateTTS,
     
     // Video
     generateVideo,
     
     // Scripts
     composeScriptFromMessaging,
     getChapterScript,
     mapScriptToTemplate,
     
     // Validation
     validateAVSync,
   };
 }
 ```
 
 ---
 
 ## 📋 Implementation Roadmap
 
 ### Phase 1: Connect Existing Components (1-2 days)
 - [ ] Wire `MessagingGeneratorPanel` output → `ScriptPreviewPanel` input
 - [ ] Add "Use Approved Messaging" toggle in script generator
 - [ ] Connect script approval → video generation trigger
 
 ### Phase 2: Build Script-Template Mapper (3-5 days)
 - [ ] Create `ScriptTemplateMapper.tsx` component
 - [ ] Implement duration estimation (150 WPM = 30s per 75 words)
 - [ ] Add "Auto-Fit" AI trim/extend functionality
 - [ ] Add "Add Chapter" template extension
 
 ### Phase 3: Build A/V Sync Preview (3-5 days)
 - [ ] Create `AVSyncPreview.tsx` component
 - [ ] Integrate audio waveform visualization
 - [ ] Add timeline scrubbing with playhead
 - [ ] Show sync status indicators
 
 ### Phase 4: Unified Approval Dashboard (2-3 days)
 - [ ] Create `ApprovalDashboard.tsx` component
 - [ ] Connect all approval stages (Messaging → Scripts → A/V → Publish)
 - [ ] Add dependency validation (can't approve scripts without messaging)
 - [ ] Implement "Approve All" with cascade
 
 ### Phase 5: Extract Shared Hook (1-2 days)
 - [ ] Create `useUnifiedAuthoring.ts`
 - [ ] Migrate common patterns from Spark/Mind/Deck/Composition
 - [ ] Update Genie Cast to use shared hook
 - [ ] Update other products to use shared hook
 
 ---
 
 ## 🎯 Success Criteria
 
 | Criteria | Metric |
 |----------|--------|
 | End-to-end flow | User can go from template → published video in one session |
 | Script-template sync | 90%+ auto-fit accuracy without manual adjustment |
 | A/V alignment | Audio matches scene duration within ±2 seconds |
 | Approval flow | Single dashboard shows all pending items |
 | Cross-product reuse | `useUnifiedAuthoring` used by 3+ products |
 
 ---
 
 ## 📁 Files to Create/Modify
 
 ### New Files
 ```
 src/hooks/useUnifiedAuthoring.ts        # Shared authoring hook
 src/components/genie-admin/genie-cast/ScriptTemplateMapper.tsx
 src/components/genie-admin/genie-cast/AVSyncPreview.tsx
 src/components/genie-admin/genie-cast/ApprovalDashboard.tsx
 ```
 
 ### Files to Modify
 ```
 src/components/genie-admin/genie-cast/GenieCastConsolidatedTabs.tsx  # Integration
 src/components/genie-admin/genie-cast/ScriptPreviewPanel.tsx        # Connect to messaging
 src/components/genie-admin/MessagingGeneratorPanel.tsx              # Export approved messaging
 ```
 
 ---
 
 **Last Updated**: 2026-02-05
 **Status**: Analysis Complete - Ready for Implementation