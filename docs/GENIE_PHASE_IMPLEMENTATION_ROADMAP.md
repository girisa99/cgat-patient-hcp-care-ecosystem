# Genie Mind & Genie Vibe - Phase Implementation Roadmap

> **Last Updated:** 2026-01-09
> **Status:** Active Implementation - Phase 1.5 Complete, Phases 2-5 Planned
> **Version:** 1.5
> **Total Features:** 37 (10 Complete, 27 Planned)
> **Market-Driven:** Includes competitive analysis and user research priorities

---

## Architecture Overview

### Shared Services Between Genie Mind & Genie Vibe

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      SHARED API SERVICES LAYER                           │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │               Universal AI Connector (unifiedAIConnector.ts)     │   │
│  │  • Unified AI request/response handling                          │   │
│  │  • Provider routing (OpenAI, Claude, Gemini)                     │   │
│  │  • MCP tool integration                                          │   │
│  │  • Screen mode configuration                                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │               useUniversalAI Hook (useUniversalAI.ts)            │   │
│  │  • React hook for AI operations                                  │   │
│  │  • Model categories: LLM, Small, Vision, MCP                     │   │
│  │  • Generate response, agent, analyze workflow                    │   │
│  │  • Provider availability checking                                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │               ai-universal-processor (Edge Function)             │   │
│  │  • Backend AI processing                                         │   │
│  │  • Multi-provider support                                        │   │
│  │  • Streaming responses                                           │   │
│  │  • Token usage tracking                                          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┴───────────────────┐
          ▼                       ▲               ▼
┌─────────────────────────┐       │   ┌─────────────────────────┐
│      GENIE MIND         │◄──────┼──►│      GENIE VIBE         │
│   "Intelligence Layer"  │  BIDIRECTIONAL  │   "Creative Layer"      │
├─────────────────────────┤   FLOW   ├─────────────────────────┤
│ • Document Processing   │       │   │ • Recording Studio      │
│ • Content Understanding │       │   │ • Video Production      │
│ • Script Generation     │◄──────┘   │ • Audio Processing      │
│ • Workflow Orchestration│ Content   │ • Image Generation      │
│ • AI Routing & Planning │ Analysis  │ • ContentAnalyzer       │
│ • B-Roll Selection      │           │ • VibeToMindBridge      │
│ • RAG Knowledge Base    │           │ • TTS/Voice Synthesis   │
└─────────────────────────┘           └─────────────────────────┘
                              │
          ┌───────────────────┴───────────────────┐
          ▼                                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              PRODUCTION HUB (OPTIONAL - Team Coordination)               │
│  • Pre-production tracking  • Team collaboration  • Approval workflows   │
│  • Agents: production_orchestrator_agent, scheduling_agent              │
│  • APIs: shows-api, calendar-sync, team-management                      │
│  Note: Publishing always happens from Vibe                               │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      AGENT & AUTOMATION LAYER                            │
├─────────────────────────────────────────────────────────────────────────┤
│  12 Agents: script_generator, tts_orchestrator, content_analyzer,       │
│             remix_engine, collaboration, production_orchestrator,       │
│             scheduling, hipaa_compliance, analytics, export, webhook    │
│  27 APIs: Internal (15) + External (12)                                 │
│  140 Scenarios across P0-P5 phases                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Phase Implementation Details

### Phase 1: Quick Wins - Complete P0 Partials ✅ COMPLETE

| # | Feature | Primary Module | Shared Services Used | Status |
|---|---------|---------------|---------------------|--------|
| 1 | AI Image Gen → Script Connection | **Shared (Mind + Vibe)** | `imageToScriptService`, `aiMediaService`, `geminiMediaService` | ✅ Complete |
| 2 | Document → Script Automation | **Genie Mind** | `documentToScriptService`, `ai-universal-processor` | ✅ Complete |
| 3 | Full Pipeline Orchestration | **Genie Mind** | `mediaProductionOrchestrator`, `useUniversalAI` | ✅ Complete |
| 4 | **NLP Infrastructure** | **Shared** | `rag-search`, `rag-knowledge-processor`, `ai-universal-processor` | ✅ Complete |
| 5 | **Frontend Integration** | **Genie Studio** | `DocumentToScriptPanel`, `ImageToScriptPanel`, `KnowledgeSearchPanel`, `PipelineOrchestrationPanel` | ✅ Complete |

### Phase 1.5: Vibe ↔ Mind Integration ✅ COMPLETE (NEW - 2026-01-05)

| # | Feature | Primary Module | Shared Services Used | Status |
|---|---------|---------------|---------------------|--------|
| 6 | **Bidirectional Flow** | **Vibe → Mind → Vibe** | `ContentAnalyzer`, `VibeToMindBridge` | ✅ Complete |
| 7 | **Content Analysis** | **Recording Studio** | PPT/PDF/URL/Image → Script | ✅ Complete |
| 8 | **Original/Enhanced Versioning** | **Scripts & Voiceovers** | `ScriptData.version`, `VoiceoverData.scriptVersion` | ✅ Complete |
| 9 | **Production Hub Optional** | **GenieStudio** | Arc button as optional for team productions | ✅ Complete |
| 10 | **Workflow Flow Indicator** | **Header** | Mind → Script → TTS → Vibe → Publish | ✅ Complete |

#### Phase 1.5 Implementation Details

**Bidirectional Vibe ↔ Mind Flow:**
```
FLOW 1 (Default): Mind → Script → TTS → Vibe → Publish
FLOW 2 (NEW):     Vibe → Mind → Script → TTS → Vibe → Publish
                  (ContentAnalyzer sends recordings/imports to Mind for AI analysis)
```

**New Components Created:**
- `src/components/document-processing/RecordingStudio/components/ContentAnalyzer.tsx`
  - Dialog for analyzing recordings, PPT, PDF, URLs, images with AI
  - Sends content to Mind for script generation
  - Returns enhanced script back to Vibe

- `src/components/document-processing/RecordingStudio/components/VibeToMindBridge.tsx`
  - Compact sidebar panel for quick Mind actions
  - Quick send to Mind functionality

**Script Versioning:**
- `ScriptData.version`: 'original' | 'enhanced'
- `ScriptData.content`: Original content
- `ScriptData.enhancedContent`: AI-enhanced version
- `VoiceoverData.scriptVersion`: Tracks which version was used for TTS

#### 1.4 NLP Infrastructure (Universal AI Integration) ✅
**Goal:** Unified NLP capabilities using Universal AI for all domain services

**Services Updated:**
- `supabase/functions/rag-search/index.ts` - Semantic reranking via Universal AI
- `supabase/functions/rag-knowledge-processor/index.ts` - Classification, summarization, entity extraction

**NLP Capabilities Implemented:**
- ✅ **Semantic Search Reranking** - Universal AI reranks keyword search results for relevance
- ✅ **Content Classification** - Auto-categorization (clinical, research, education, etc.)
- ✅ **Entity Extraction** - Healthcare entities (diseases, treatments, drugs, genes, procedures)
- ✅ **Content Summarization** - AI-generated summaries for knowledge entries
- ✅ **AI Recommendations** - Clinical insights and next-best-actions via Universal AI

#### 1.5 Frontend Integration ✅
**Goal:** Connect Phase 1 backend services to Genie Studio UI

**Components Created:**
- `src/components/genie-studio/DocumentToScriptPanel.tsx` - Upload docs, convert to scripts
- `src/components/genie-studio/ImageToScriptPanel.tsx` - Generate/upload images, convert to scripts
- `src/components/genie-studio/KnowledgeSearchPanel.tsx` - AI-powered RAG search UI
- `src/components/genie-studio/PipelineOrchestrationPanel.tsx` - Full pipeline orchestration UI

**Integration Points:**
- ✅ New "AI Tools" tab in Genie Studio with sub-tabs for each panel
- ✅ Script output automatically saves to script library
- ✅ Knowledge search results can be copied/used in scripts

#### 1.1 AI Image Gen → Script Connection (Genie Vibe)
**Goal:** Connect image generation (OpenAI DALL-E, Gemini Imagen, Replicate Flux) to script generation

**Services Involved:**
- `src/services/aiMediaService.ts` - Image generation
- `src/services/geminiMediaService.ts` - Gemini-specific media
- `supabase/functions/ai-image-generator/index.ts` - Edge function

**New Service Needed:**
- `src/services/imageToScriptService.ts` - Convert generated images to script descriptions

**Flow:**
```
[Prompt] → [Image Generation] → [Vision AI Analysis] → [Script Generation]
     ↓              ↓                    ↓                    ↓
  User Input   OpenAI/Gemini/     GPT-4 Vision or      useUniversalAI
               Replicate          Gemini Pro Vision
```

#### 1.2 Document → Script Automation (Genie Mind)
**Goal:** Parse documents and auto-generate scripts with AI enhancement

**Services Involved:**
- `src/hooks/useDocumentAI.ts` - Document AI processing
- `src/services/ragService.ts` - Knowledge base integration
- `supabase/functions/process-documents/index.ts` - Document processing

**New Service Needed:**
- `src/services/documentToScriptService.ts` - Document parsing to script conversion

**Flow:**
```
[Document Upload] → [Parse/Extract] → [RAG Context] → [Script Generation]
        ↓                 ↓                ↓                 ↓
    PDF/DOCX/PPT    Text Extraction   Knowledge Base   useUniversalAI
```

#### 1.3 Full Pipeline Orchestration (Genie Mind)
**Goal:** End-to-end orchestration from input to final media output

**Services Involved:**
- `src/services/orchestration/UnifiedDevelopmentLifecycleOrchestrator.ts`
- `src/services/unifiedAIConnector.ts`

**New Service Needed:**
- `src/services/mediaProductionOrchestrator.ts` - Pipeline orchestration

---

### Phase 2: High Impact - New P0 🔄 IN PROGRESS

| # | Feature | Primary Module | Shared Services Used | Status |
|---|---------|---------------|---------------------|--------|
| 5 | Figma API Integration | **Genie Vibe** | External API + `useUniversalAI` | 📋 Planned |
| 6 | URL → Script → Video | **Genie Mind** | `ragService`, `unifiedAIConnector`, `web-scraper` | 📋 Planned |
| 7 | Miro/Whiteboard → Presentation | **Genie Vibe** | External API + `useUniversalAI` | 📋 Planned |
| 8 | Canva → Script → Video | **Genie Vibe** | External API + `useUniversalAI` | 📋 Planned |

#### 2.1 Figma API Integration (Genie Vibe)
**New Services Needed:**
- `src/services/figmaIntegrationService.ts`
- `supabase/functions/figma-import/index.ts`

**Flow:**
```
[Figma URL] → [API Fetch] → [Frame Extraction] → [Image Analysis] → [Script Gen]
```

#### 2.2 URL → Script → Video (Genie Mind)
**Services Involved:**
- `src/services/ragService.ts` - Content extraction
- Web scraping edge function

**New Services Needed:**
- `src/services/urlToContentService.ts`
- `supabase/functions/web-scraper/index.ts`

#### 2.3 Miro/Whiteboard → Presentation (Genie Vibe)
**New Services Needed:**
- `src/services/miroIntegrationService.ts`
- `supabase/functions/miro-import/index.ts`

#### 2.4 Canva → Script → Video (Genie Vibe)
**New Services Needed:**
- `src/services/canvaIntegrationService.ts`
- `supabase/functions/canva-import/index.ts`

---

### Phase 3: P1 Essentials

| # | Feature | Primary Module | Shared Services Used | Status |
|---|---------|---------------|---------------------|--------|
| 8 | Voice Cloning | **Genie Vibe** | ElevenLabs/PlayHT API | 📋 Planned |
| 9 | Adobe XD → Video | **Genie Vibe** | External API + `useUniversalAI` | 📋 Planned |
| 10 | Sketch → Storyboard | **Genie Vibe** | External API + `useUniversalAI` | 📋 Planned |
| 11 | AI Drawing → Animation | **Genie Vibe** | `aiMediaService`, Video gen | 📋 Planned |
| 12 | OpenAI Image → Presentation | **Genie Vibe** | `ai-image-generator` | 📋 Planned |
| 13 | Gemini Image → Presentation | **Genie Vibe** | `gemini-generate-image` | 📋 Planned |
| 14 | B-Roll Auto-Integration | **Genie Mind** | Content matching AI | 📋 Planned |
| 15 | Webinar → Clips | **Genie Mind** | AI highlight detection | 📋 Planned |

---

### Phase 4: Mobile-First & Segment Features (NEW)

| # | Feature | Primary Module | Segment Target | Market Driver | Status |
|---|---------|---------------|----------------|---------------|--------|
| 16 | **One-Tap Mobile Record** | **Genie Vibe** | All | 68% want mobile-first | 📋 Planned |
| 17 | **Offline Recording** | **Genie Vibe** | Traveler | 54% need offline | 📋 Planned |
| 18 | **Quick Templates (Social)** | **Genie Vibe** | Creator | One-app workflow | 📋 Planned |
| 19 | **Voice-First Editing** | **Genie Vibe** | Creator | 47% want voice commands | 📋 Planned |
| 20 | **Product Demo Mode** | **Genie Vibe** | SMB | 71% want quick templates | 📋 Planned |
| 21 | **Lesson Builder** | **Genie Vibe** | Education | 69% want AI lesson scripts | 📋 Planned |
| 22 | **Patient Education** | **Genie Vibe** | Healthcare | HIPAA under $100/mo (94%) | 📋 Planned |
| 23 | **Multi-Clip Timeline** | **Genie Vibe** | All | Content remix gap | 📋 Planned |
| 24 | **Highlight Reel Generator** | **Genie Mind** | Creator | Auto-shorts (82%) | 📋 Planned |

### Phase 5: Commercialization & Compliance

| # | Feature | Primary Module | Market Driver | Status |
|---|---------|---------------|---------------|--------|
| 25 | **Subscription Infrastructure** | **Backend** | Revenue model | 📋 Planned |
| 26 | **Stripe Integration** | **Backend** | Payments | 📋 Planned |
| 27 | **Landing Page & Pricing** | **Frontend** | Conversion | 📋 Planned |
| 28 | **HIPAA Compliance** | **Backend** | Healthcare segment (94% want) | 📋 Planned |
| 29 | **Approval Workflows** | **Backend** | Enterprise segment (87% want) | 📋 Planned |
| 30 | **White-Label** | **Frontend** | Enterprise revenue | 📋 Planned |

---

## Implementation Status Summary

| Phase | Total | Complete | In Progress | Planned | Market Priority |
|-------|-------|----------|-------------|---------|-----------------|
| Phase 1 (P0 Partials + NLP + Frontend) | 5 | 5 | 0 | 0 | Core MVP |
| Phase 1.5 (Vibe ↔ Mind Integration) | 5 | 5 | 0 | 0 | Differentiation |
| Phase 2 (High Impact P0) | 4 | 0 | 0 | 4 | External integrations |
| Phase 3 (P1 Essentials) | 8 | 0 | 0 | 8 | Production quality |
| **Phase 4 (Mobile-First & Segments)** | **9** | **0** | **0** | **9** | **68% mobile demand** |
| **Phase 5 (Commercialization)** | **6** | **0** | **0** | **6** | **Revenue** |
| **Total** | **37** | **10** | **0** | **27** | |

**Phase 1 Completion:** 100% ✅ (Backend + Frontend)
**Phase 1.5 Completion:** 100% ✅ (Vibe ↔ Mind Bidirectional Flow)
**Overall Progress:** 27%

---

## Market-Driven Priority Alignment

### Why This Order?

| Phase | Key User Research | Competitive Gap |
|-------|-------------------|-----------------|
| Phase 1-1.5 | Foundation for all features | Basic functionality |
| Phase 2 | External content import demand | No competitor has unified import |
| Phase 3 | Voice cloning top request (61%) | Synthesia only; expensive |
| **Phase 4** | **68% want mobile-first** | **CapCut only; no AI script** |
| **Phase 5** | **Healthcare 94% want HIPAA** | **VIDIZMO $1000+; we can do <$100** |

### Competitive Advantage Timeline

```
NOW (Phase 1-1.5): Unified Mind → Vibe bidirectional flow
     ↓ No competitor has this
Q1 2026 (Phase 2-3): Voice cloning + external imports
     ↓ Synthesia competitor but 50% cheaper
Q2 2026 (Phase 4): Mobile-first + segment templates
     ↓ CapCut competitor but with AI scripts + TTS
Q3 2026 (Phase 5): HIPAA + Enterprise features
     ↓ VIDIZMO competitor at 10% of the price
```

---

## Shared Services Reference

### Existing Services (Use these - DO NOT duplicate)

| Service | Location | Purpose |
|---------|----------|---------|
| `useUniversalAI` | `src/hooks/useUniversalAI.ts` | Universal AI hook for all providers |
| `unifiedAIConnector` | `src/services/unifiedAIConnector.ts` | Unified AI connector service |
| `aiMediaService` | `src/services/aiMediaService.ts` | Image/video generation |
| `geminiMediaService` | `src/services/geminiMediaService.ts` | Gemini-specific media |
| `ragService` | `src/services/ragService.ts` | RAG knowledge base |
| `useDocumentAI` | `src/hooks/useDocumentAI.ts` | Document AI processing |

### Edge Functions (Existing)

| Function | Purpose |
|----------|---------|
| `ai-universal-processor` | Universal AI processing |
| `ai-image-generator` | Multi-provider image gen |
| `gemini-generate-image` | Gemini image generation |
| `gemini-generate-video` | Gemini video generation |
| `process-documents` | Document processing |
| `check-ai-provider` | Provider availability check |

---

## API Communication Pattern

### Genie Mind → Genie Vibe (Example)

```typescript
// From Genie Mind: Generate script, send to Genie Vibe for production
const script = await useUniversalAI.generateResponse({
  provider: 'gemini',
  prompt: documentContent,
  systemPrompt: 'Convert this document to a video script...',
  action: 'generate'
});

// Pass to Genie Vibe via shared state or context
vibeContext.setScript(script.content);
```

### Genie Vibe → Genie Mind (Example)

```typescript
// From Genie Vibe: Request B-roll suggestions from Genie Mind
const brollSuggestions = await unifiedAIConnector.generateResponse({
  useCaseId: 'content_matching',
  prompt: `Suggest B-roll for: ${scriptSegment}`,
  conversationContext: 'general',
  providerConfig: { provider: 'gemini', model: 'gemini-2.0-flash-exp' }
});
```

---

## Next Steps

### Phase 1 ✅ COMPLETE
- [x] Create `imageToScriptService.ts` (Genie Vibe)
- [x] Create `documentToScriptService.ts` (Genie Mind)
- [x] Create `mediaProductionOrchestrator.ts` (Genie Mind)
- [x] NLP Infrastructure via Universal AI (rag-search, rag-knowledge-processor)
- [x] Frontend: `DocumentToScriptPanel` component
- [x] Frontend: `ImageToScriptPanel` component
- [x] Frontend: `KnowledgeSearchPanel` component
- [x] Frontend: `PipelineOrchestrationPanel` component
- [x] Integration: New "AI Tools" tab in Genie Studio

### Phase 1.5 ✅ COMPLETE (Vibe ↔ Mind Integration)
- [x] Create `ContentAnalyzer.tsx` (Vibe → Mind dialog)
- [x] Create `VibeToMindBridge.tsx` (Quick Mind actions sidebar panel)
- [x] Implement bidirectional Vibe ↔ Mind flow
- [x] Add Original/Enhanced script versioning
- [x] Make Production Hub (Arc) optional for team productions
- [x] Add workflow flow indicator in GenieStudio header
- [x] Support PPT/PDF/URL/Image → Mind → Script → Vibe

### Phase 2 🔄 IN PROGRESS
1. **Figma API Integration:**
   - [ ] Research Figma API authentication & OAuth flow
   - [ ] Create `figmaIntegrationService.ts`
   - [ ] Create `figma-import` edge function

2. **URL → Script → Video:**
   - [ ] Create `web-scraper` edge function
   - [ ] Create `urlToContentService.ts`
   - [ ] Integrate with Universal AI for content extraction

3. **Miro/Whiteboard Integration:**
   - [ ] Research Miro API authentication
   - [ ] Create `miroIntegrationService.ts`
   - [ ] Create `miro-import` edge function

4. **Canva Integration:**
   - [ ] Research Canva API authentication
   - [ ] Create `canvaIntegrationService.ts`
   - [ ] Create `canva-import` edge function

### Phase 3 Planning
- [ ] Evaluate ElevenLabs vs PlayHT for voice cloning
- [ ] Design B-roll matching algorithm

---

## Two-Stage Pipeline Architecture

The document processing uses a two-stage AI pipeline:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        TWO-STAGE AI PIPELINE                                 │
└──────────────────────────────────────────────────────────────────────────────┘

STAGE 1: Classification + OCR (Gemini 2.5 Flash)
┌─────────────────────────────────────────────────────────────────────────────┐
│  • Document Type Detection (auto-classification)                            │
│  • Text Extraction (OCR processing)                                         │
│  • Confidence Score Analysis                                                 │
│  • Fast & Accurate (sub-second classification)                              │
└─────────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
STAGE 2: Intelligent Model Routing (Dynamic Selection)
┌─────────────────────────────────────────────────────────────────────────────┐
│  Based on document type, route to optimal model:                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                    │
│  │ Claude   │  │ Gemini   │  │ GPT-4o   │  │ Fallback │                    │
│  │ 3.5      │  │ Pro      │  │          │  │          │                    │
│  │ Complex  │  │ Vision   │  │ Medical  │  │ Auto-    │                    │
│  │ Analysis │  │ Tasks    │  │ Docs     │  │ Retry    │                    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘                    │
└─────────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
OUTPUT: Structured Data (JSON Schema, Field Mapping, Analytics)
```

### Pipeline Statistics
- 94% Classification Accuracy
- 2.3s Average Processing Time
- 15+ Document Types Supported

---

## Agent Integration Matrix

### Agent → Module Mapping

| Agent ID | Agent Name | Connected Modules | Primary Purpose | Phase |
|----------|------------|-------------------|-----------------|-------|
| `script_generator_agent` | Script Generator | Genie Mind, Genie Vibe | AI script generation from various inputs | P0 ✅ |
| `content_analyzer_agent` | Content Analyzer | Genie Mind | Document/media content analysis | P0 ✅ |
| `tts_orchestrator_agent` | TTS Orchestrator | Genie Vibe | Multi-provider TTS coordination | P0 ✅ |
| `voice_clone_agent` | Voice Clone | Genie Vibe | Voice cloning and synthesis | P1 |
| `video_assembly_agent` | Video Assembly | Genie Vibe, Recording Studio | Multi-clip assembly automation | P1 |
| `compliance_monitor_agent` | Compliance Monitor | All Modules | HIPAA/GDPR compliance scanning | P3 |
| `workflow_orchestrator_agent` | Workflow Orchestrator | Arc (Production Hub) | Multi-step workflow automation | P2 |
| `social_publisher_agent` | Social Publisher | Genie Vibe | Multi-platform social publishing | P1 |
| `translation_agent` | Translation | Genie Mind, Genie Vibe | Multi-language translation & dubbing | P2 |
| `analytics_agent` | Analytics | All Modules | Usage tracking and insights | P2 |
| `subscription_agent` | Subscription Manager | Backend | Billing, tier management, limits | P0 |
| `approval_workflow_agent` | Approval Workflow | Arc | Legal/compliance approval chains | P3 |

### Agent Automation Opportunities

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     AUTOMATION OPPORTUNITY MATRIX                             │
└──────────────────────────────────────────────────────────────────────────────┘

PHASE 0 (IMPLEMENTED) ✅
├── Script Generation Automation
│   ├── Document → Script (content_analyzer_agent → script_generator_agent)
│   ├── Image → Script (content_analyzer_agent → script_generator_agent)
│   └── URL → Script (content_analyzer_agent → script_generator_agent)
│
├── TTS Automation
│   ├── Script → Voice (tts_orchestrator_agent)
│   └── Multi-provider failover (automatic)

PHASE 1 (PLANNED)
├── Voice Clone Automation
│   ├── Voice sample → Clone model (voice_clone_agent)
│   └── Clone → TTS generation (voice_clone_agent → tts_orchestrator_agent)
│
├── Video Assembly Automation
│   ├── Multi-clip timeline (video_assembly_agent)
│   ├── AI auto-arrange (video_assembly_agent)
│   └── Smart transitions (video_assembly_agent)
│
├── Social Publishing Automation
│   ├── Platform-specific cuts (social_publisher_agent)
│   ├── Scheduled publishing (social_publisher_agent)
│   └── Cross-platform analytics (analytics_agent)

PHASE 2 (PLANNED)
├── Workflow Automation
│   ├── Multi-step pipelines (workflow_orchestrator_agent)
│   ├── Conditional branching (workflow_orchestrator_agent)
│   └── Error recovery (workflow_orchestrator_agent)
│
├── Translation Automation
│   ├── Script translation (translation_agent)
│   ├── Voice dubbing (translation_agent → voice_clone_agent)
│   └── Subtitle generation (translation_agent)

PHASE 3 (PLANNED)
├── Compliance Automation
│   ├── HIPAA PHI detection (compliance_monitor_agent)
│   ├── Auto-redaction (compliance_monitor_agent)
│   └── Audit logging (compliance_monitor_agent)
│
├── Approval Workflow Automation
│   ├── Legal review routing (approval_workflow_agent)
│   ├── Multi-reviewer chains (approval_workflow_agent)
│   └── SLA tracking (approval_workflow_agent)
```

---

## API Integration Matrix

### Internal APIs (Edge Functions)

| API Name | Endpoint | Purpose | Connected Agents | Phase |
|----------|----------|---------|------------------|-------|
| `ai-universal-processor` | `/ai-universal-processor` | Universal AI processing | All AI agents | P0 ✅ |
| `ai-image-generator` | `/ai-image-generator` | Multi-provider image gen | content_analyzer_agent | P0 ✅ |
| `gemini-generate-image` | `/gemini-generate-image` | Gemini image generation | content_analyzer_agent | P0 ✅ |
| `gemini-generate-video` | `/gemini-generate-video` | Gemini video generation | video_assembly_agent | P1 |
| `process-documents` | `/process-documents` | Document processing | content_analyzer_agent | P0 ✅ |
| `rag-search` | `/rag-search` | Knowledge base search | script_generator_agent | P0 ✅ |
| `rag-knowledge-processor` | `/rag-knowledge-processor` | Knowledge processing | content_analyzer_agent | P0 ✅ |
| `check-ai-provider` | `/check-ai-provider` | Provider availability | All AI agents | P0 ✅ |
| `voice-clone-processor` | `/voice-clone-processor` | Voice cloning | voice_clone_agent | P1 |
| `social-publish` | `/social-publish` | Social media publishing | social_publisher_agent | P1 |
| `compliance-scanner` | `/compliance-scanner` | HIPAA/GDPR scanning | compliance_monitor_agent | P3 |
| `stripe-webhook` | `/stripe-webhook` | Stripe payment webhooks | subscription_agent | P0 |
| `subscription-manager` | `/subscription-manager` | Subscription operations | subscription_agent | P0 |

### External APIs

| API Provider | Purpose | Data Format | Integration Type | Phase |
|--------------|---------|-------------|------------------|-------|
| **ElevenLabs** | TTS, Voice Cloning | JSON | REST API | P0 ✅ |
| **OpenAI** | GPT-4, TTS, DALL-E | JSON | REST API | P0 ✅ |
| **Anthropic** | Claude AI | JSON | REST API | P0 ✅ |
| **Google Gemini** | Vision, Video, TTS | JSON | REST API | P0 ✅ |
| **Stripe** | Payments, Subscriptions | JSON | REST API + Webhooks | P0 |
| **YouTube** | Video Publishing | JSON | OAuth2 + REST API | P1 |
| **TikTok** | Video Publishing | JSON | OAuth2 + REST API | P1 |
| **Instagram** | Video Publishing | JSON | OAuth2 + Graph API | P1 |
| **LinkedIn** | Video Publishing | JSON | OAuth2 + REST API | P1 |
| **Figma** | Design Import | JSON | OAuth2 + REST API | P2 |
| **Miro** | Whiteboard Import | JSON | OAuth2 + REST API | P2 |
| **Canva** | Design Import | JSON | OAuth2 + REST API | P2 |

### Data Transfer Methods

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     DATA TRANSFER PROTOCOLS                                   │
└──────────────────────────────────────────────────────────────────────────────┘

JSON (Primary)
├── Internal Edge Functions → All modules
├── AI Provider APIs → Agent processors
├── Supabase Database → Frontend hooks
└── Webhook payloads (Stripe, Social platforms)

CSV (Batch Operations)
├── Bulk video generation (Scenario 33)
├── Analytics export
├── User subscription reports
└── Compliance audit logs

MCP SDK (Agent Communication)
├── Agent → Agent messaging
├── Workflow orchestration
├── Tool calling between agents
└── Cross-module data sharing

Streaming (Real-time)
├── TTS audio streaming
├── AI response streaming
├── Video preview streaming
└── Recording live preview

Binary (Media)
├── Video files (MP4, WebM)
├── Audio files (MP3, WAV)
├── Image files (PNG, JPG, WebP)
└── Document files (PDF, DOCX, PPTX)
```

---

## Authentication & SaaS Features (Scenarios 66-80)

### Authentication Flow Matrix

| Flow | Scenario | Provider | Phase | Status |
|------|----------|----------|-------|--------|
| **Email/Password** | 66-70 | Supabase Auth | P0 | ⏳ Planned |
| **Magic Link** | 66-70 | Supabase Auth | P0 | ⏳ Planned |
| **Google OAuth** | 66-70 | Supabase + Google | P0 | ⏳ Planned |
| **Microsoft OAuth** | 66-70 | Supabase + Microsoft | P1 | ⏳ Planned |
| **SSO/SAML** | 76-80 | Supabase + Enterprise IdP | P3 | ⏳ Planned |
| **API Key Auth** | 71-75 | Custom + Supabase | P2 | ⏳ Planned |

### Subscription Infrastructure

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     SUBSCRIPTION FLOW ARCHITECTURE                            │
└──────────────────────────────────────────────────────────────────────────────┘

User Registration
        │
        ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  Supabase     │────►│  Stripe       │────►│  subscription │
│  Auth Signup  │     │  Customer     │     │  _agent       │
└───────────────┘     └───────────────┘     └───────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  profiles     │     │  Stripe       │     │  user_        │
│  table        │     │  Subscription │     │  subscriptions│
└───────────────┘     └───────────────┘     └───────────────┘
                              │
                              ▼
                      ┌───────────────┐
                      │  stripe-      │
                      │  webhook      │
                      └───────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  Payment      │     │  Subscription │     │  Access       │
│  Success      │     │  Activated    │     │  Granted      │
└───────────────┘     └───────────────┘     └───────────────┘
```

### Access Control Matrix

| Module | Free | Starter | Business | Pro | Enterprise | Agent Required |
|--------|------|---------|----------|-----|------------|----------------|
| Genie Studio | 10/mo | 100/mo | 500/mo | 2000/mo | Unlimited | subscription_agent |
| Genie Spark | ❌ | ❌ | ❌ | ✅ | ✅ | subscription_agent |
| Recording Studio | ❌ | ✅ | ✅ | ✅ | ✅ | subscription_agent |
| Voice Cloning | ❌ | ❌ | ❌ | ✅ | ✅ | voice_clone_agent |
| Social Publishing | ❌ | ✅ | ✅ | ✅ | ✅ | social_publisher_agent |
| HIPAA Mode | ❌ | ❌ | ❌ | ❌ | ✅ | compliance_monitor_agent |
| White Label | ❌ | ❌ | ❌ | ❌ | ✅ | N/A |
| API Access | ❌ | ❌ | ❌ | ✅ | ✅ | N/A |

---

## Complete Phase Implementation with Agents

### P0 - Core (Weeks 1-4) ✅ MOSTLY COMPLETE

| Feature | Agent | API | Automation | Status |
|---------|-------|-----|------------|--------|
| AI Script Generation | script_generator_agent | ai-universal-processor | Document → Script | ✅ |
| Content Analysis | content_analyzer_agent | ai-universal-processor | PPT/PDF/URL → Script | ✅ |
| TTS Generation | tts_orchestrator_agent | ElevenLabs, OpenAI | Script → Voice | ✅ |
| Bidirectional Vibe ↔ Mind | content_analyzer_agent | ai-universal-processor | Vibe → Mind → Vibe | ✅ |
| **Subscription Infrastructure** | subscription_agent | Stripe, stripe-webhook | Tier enforcement | ⏳ |
| **Authentication** | N/A | Supabase Auth, OAuth | Login/Signup | ⏳ |

### P1 - Essential (Weeks 5-8)

| Feature | Agent | API | Automation | Status |
|---------|-------|-----|------------|--------|
| Voice Cloning | voice_clone_agent | ElevenLabs Clone API | Sample → Clone | ⏳ |
| Video Assembly | video_assembly_agent | FFmpeg, gemini-generate-video | Multi-clip → Final | ⏳ |
| Social Publishing | social_publisher_agent | YouTube, TikTok, Instagram | Schedule → Publish | ⏳ |
| Quick Templates | video_assembly_agent | N/A | Template → Video | ⏳ |
| Highlight Reel | video_assembly_agent | ai-universal-processor | Long → Shorts | ⏳ |

### P2 - Important (Weeks 9-12)

| Feature | Agent | API | Automation | Status |
|---------|-------|-----|------------|--------|
| Figma Import | content_analyzer_agent | Figma API | Figma → Script → Video | ⏳ |
| Miro Import | content_analyzer_agent | Miro API | Whiteboard → Presentation | ⏳ |
| Translation | translation_agent | ai-universal-processor | Script A → Script B | ⏳ |
| Voice Dubbing | translation_agent + voice_clone_agent | ElevenLabs | Translate + Clone | ⏳ |
| Workflow Orchestration | workflow_orchestrator_agent | MCP SDK | Multi-step pipelines | ⏳ |

### P3 - Compliance (Weeks 13-18)

| Feature | Agent | API | Automation | Status |
|---------|-------|-----|------------|--------|
| HIPAA Compliance | compliance_monitor_agent | compliance-scanner | PHI detection | ⏳ |
| Auto-Redaction | compliance_monitor_agent | compliance-scanner | Blur/beep PHI | ⏳ |
| Legal Review | approval_workflow_agent | N/A | Review → Approve | ⏳ |
| Audit Logging | compliance_monitor_agent | Supabase | Action → Log | ⏳ |

### P4-P5 - Future (Weeks 19+)

| Feature | Agent | API | Automation | Status |
|---------|-------|-----|------------|--------|
| AI Avatars | avatar_generation_agent | HeyGen/D-ID | Script → Avatar Video | ⏳ |
| Real-time Collaboration | collaboration_agent | Supabase Realtime | Multi-user editing | ⏳ |
| Advanced Analytics | analytics_agent | Custom | Performance insights | ⏳ |

---

*This document follows the governance protocol from `docs/IMPLEMENTATION_GOVERNANCE.md`*
