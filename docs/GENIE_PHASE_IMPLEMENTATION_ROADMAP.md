# Genie Mind & Genie Vibe - Phase Implementation Roadmap

> **Last Updated:** 2026-01-05
> **Status:** Active Implementation - Phase 2 In Progress
> **Version:** 1.2

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
          ▼                                       ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│      GENIE MIND         │◄───────►│      GENIE VIBE         │
│   "Intelligence Layer"  │  API    │   "Creative Layer"      │
├─────────────────────────┤ Share   ├─────────────────────────┤
│ • Document Processing   │         │ • Recording Studio      │
│ • Content Understanding │         │ • Video Production      │
│ • Script Generation     │         │ • Audio Processing      │
│ • Workflow Orchestration│         │ • Image Generation      │
│ • AI Routing & Planning │         │ • Animation Creation    │
│ • B-Roll Selection      │         │ • Design Import         │
│ • RAG Knowledge Base    │         │ • TTS/Voice Synthesis   │
└─────────────────────────┘         └─────────────────────────┘
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

## Implementation Status Summary

| Phase | Total | Complete | In Progress | Planned |
|-------|-------|----------|-------------|---------|
| Phase 1 (P0 Partials + NLP) | 4 | 4 | 0 | 0 |
| Phase 2 (High Impact P0) | 4 | 0 | 0 | 4 |
| Phase 3 (P1 Essentials) | 8 | 0 | 0 | 8 |
| **Total** | **16** | **4** | **0** | **12** |

**Phase 1 Completion:** 100% ✅
**Overall Progress:** 25%

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

*This document follows the governance protocol from `docs/IMPLEMENTATION_GOVERNANCE.md`*
