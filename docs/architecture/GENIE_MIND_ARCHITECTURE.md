# Genie Mind: Module Architecture

> **Version:** 2.0  
> **Last Updated:** 2026-01-13  
> **Tagline:** "AI That Understands"  
> **Status:** ✅ P0-P2 Complete | Production Ready

---

## P0-P2 Implementation Status ✅ COMPLETE

| Feature | Status | Details |
|---------|--------|---------|
| Script Generation | ✅ Complete | AI-powered from prompts |
| Document Analysis | ✅ Complete | PPT/PDF/Word conversion |
| Image to Script | ✅ Complete | Vision AI description |
| URL to Script | ✅ Complete | Web content extraction |
| Script Enhancement | ✅ Complete | AI improvement suggestions |
| TTS Generation | ✅ Complete | ElevenLabs + OpenAI |
| RAG Search | ✅ Complete | Knowledge base integration |
| ContentAnalyzer | ✅ Complete | Vibe → Mind bridge |

### Shared Components Integrated

| Component | Purpose | Status |
|-----------|---------|--------|
| `ContentAnalyzer` | Vibe → Mind content analysis | ✅ |
| `VibeToMindBridge` | Quick Mind actions from Vibe | ✅ |
| Pipeline orchestration | Multi-source processing | ✅ |

---

## Overview

Genie Mind is the AI intelligence layer of Genie Studio, responsible for content understanding, script generation, and AI-powered enhancements.

---

## Module Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    GENIE MIND                                                 │
│                              "AI That Understands"                                            │
│                                Pre-Production Layer                                           │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

                              ┌────────────────────────┐
                              │      INPUT SOURCES     │
                              └───────────┬────────────┘
                                          │
              ┌───────────────────────────┼───────────────────────────┐
              │                           │                           │
              ▼                           ▼                           ▼
    ┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
    │   TEXT INPUT    │         │  DOCUMENT INPUT │         │   MEDIA INPUT   │
    │                 │         │                 │         │                 │
    │ • Prompts       │         │ • PDF           │         │ • Images        │
    │ • Ideas         │         │ • PowerPoint    │         │ • URLs          │
    │ • Templates     │         │ • Word          │         │ • Recordings    │
    │ • Outlines      │         │ • Markdown      │         │ • Screenshots   │
    └────────┬────────┘         └────────┬────────┘         └────────┬────────┘
             │                           │                           │
             └───────────────────────────┼───────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                              AI PROCESSING ENGINE                                             │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                               │
│   ┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐                   │
│   │  CLASSIFICATION   │    │  CONTENT ANALYSIS │    │  SCRIPT GENERATION│                   │
│   │                   │    │                   │    │                   │                   │
│   │ • Document type   │───►│ • Entity extract  │───►│ • Structure       │                   │
│   │ • Intent detect   │    │ • Key concepts    │    │ • Narrative       │                   │
│   │ • Routing rules   │    │ • Summarization   │    │ • Pacing          │                   │
│   └───────────────────┘    └───────────────────┘    └───────────────────┘                   │
│                                                                                               │
│   ┌───────────────────────────────────────────────────────────────────────────────────────┐ │
│   │                          UNIVERSAL AI PROCESSOR                                        │ │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                   │ │
│   │  │  Claude 3.5 │  │   GPT-4o    │  │ Gemini Pro  │  │  Fallback   │                   │ │
│   │  │  (Primary)  │  │ (Medical)   │  │  (Vision)   │  │   Chain     │                   │ │
│   │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘                   │ │
│   └───────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                               │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                              OUTPUT GENERATION                                                │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                               │
│   ┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐                   │
│   │   SCRIPT OUTPUT   │    │   TTS PROCESSING  │    │   ENHANCEMENT     │                   │
│   │                   │    │                   │    │                   │                   │
│   │ • Original ver    │    │ • ElevenLabs      │    │ • AI suggestions  │                   │
│   │ • Enhanced ver    │    │ • OpenAI TTS      │    │ • Keyword extract │                   │
│   │ • Clean (no mark) │    │ • Azure Speech    │    │ • Tone adjustment │                   │
│   └───────────────────┘    └───────────────────┘    └───────────────────┘                   │
│                                                                                               │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                         │
                          ┌──────────────┴──────────────┐
                          ▼                              ▼
                ┌─────────────────┐            ┌─────────────────┐
                │   TO VIBE       │            │   TO STORAGE    │
                │  (Recording)    │            │  (Library)      │
                └─────────────────┘            └─────────────────┘
```

---

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                              MIND COMPONENT HIERARCHY                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

src/
├── pages/
│   └── GenieStudio.tsx                    # Main Mind interface
│
├── components/genie-studio/
│   ├── ScriptEditor.tsx                   # Script editing with AI
│   ├── ScriptTemplates.tsx                # Template library
│   ├── ScriptLibrary.tsx                  # Saved scripts
│   ├── TTSGenerationPanel.tsx             # Voice generation
│   ├── VoiceSelector.tsx                  # Voice selection
│   ├── MediaLibrary.tsx                   # Asset management
│   ├── DocumentToScriptPanel.tsx          # Doc → Script
│   ├── ImageToScriptPanel.tsx             # Image → Script
│   ├── KnowledgeSearchPanel.tsx           # RAG search
│   └── PipelineOrchestrationPanel.tsx     # Full pipeline
│
├── services/
│   ├── documentToScriptService.ts         # Document processing
│   ├── imageToScriptService.ts            # Image analysis
│   └── mediaProductionOrchestrator.ts     # Pipeline orchestration
│
├── hooks/
│   ├── useUniversalAI.ts                  # AI operations
│   ├── useTTSGeneration.ts                # TTS control
│   ├── useScriptVersions.ts               # Version management
│   └── useMediaProject.ts                 # Project state
│
└── supabase/functions/
    ├── ai-universal-processor/            # Multi-model AI
    ├── rag-search/                        # Knowledge search
    ├── rag-knowledge-processor/           # Knowledge processing
    └── process-documents/                 # Document extraction
```

---

## AI Model Routing

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                              INTELLIGENT MODEL ROUTING                                        │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

                              ┌────────────────────────┐
                              │    INCOMING REQUEST    │
                              └───────────┬────────────┘
                                          │
                                          ▼
                              ┌────────────────────────┐
                              │   CLASSIFY REQUEST     │
                              │   (Gemini 2.5 Flash)   │
                              └───────────┬────────────┘
                                          │
              ┌───────────────────────────┼───────────────────────────┐
              │                           │                           │
              ▼                           ▼                           ▼
    ┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
    │   COMPLEX       │         │   VISION        │         │   MEDICAL       │
    │   ANALYSIS      │         │   PROCESSING    │         │   CONTENT       │
    │                 │         │                 │         │                 │
    │   Claude 3.5    │         │   Gemini Pro    │         │   GPT-4o        │
    │   Sonnet        │         │   Vision        │         │   (HIPAA)       │
    └─────────────────┘         └─────────────────┘         └─────────────────┘

ROUTING RULES:
━━━━━━━━━━━━━━
• Document analysis → Claude 3.5 (nuanced understanding)
• Image/video → Gemini Pro Vision (visual processing)
• Medical/healthcare → GPT-4o (clinical accuracy)
• General scripts → Claude 3.5 (creative writing)
• Quick classification → Gemini Flash (speed)
```

---

## Script Versioning System

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                              SCRIPT VERSION MANAGEMENT                                        │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

interface ScriptData {
  id: string;
  name: string;
  content: string;              // Original content
  enhancedContent?: string;     // AI-enhanced version
  cleanContent?: string;        // TTS-ready (no markers)
  version: 'original' | 'enhanced';
  metadata: {
    wordCount: number;
    estimatedDuration: number;
    keywords: string[];
    tone: string;
  };
}

VERSION FLOW:
━━━━━━━━━━━━━

┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  ORIGINAL   │─────►│   ENHANCE   │─────►│  ENHANCED   │
│   SCRIPT    │ AI   │   (Mind)    │      │   VERSION   │
└─────────────┘      └─────────────┘      └─────────────┘
      │                                          │
      │                                          │
      ▼                                          ▼
┌─────────────┐                          ┌─────────────┐
│   CLEAN     │◄─────────────────────────│   CLEAN     │
│  (for TTS)  │                          │  (for TTS)  │
└─────────────┘                          └─────────────┘
      │                                          │
      └──────────────────┬───────────────────────┘
                         ▼
               ┌─────────────────┐
               │   TTS ENGINE    │
               │   (ElevenLabs)  │
               └─────────────────┘
```

---

## TTS Integration

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                              TEXT-TO-SPEECH ARCHITECTURE                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

                    ┌────────────────────────────────────────┐
                    │            TTS ORCHESTRATOR            │
                    └───────────────────┬────────────────────┘
                                        │
              ┌─────────────────────────┼─────────────────────────┐
              │                         │                         │
              ▼                         ▼                         ▼
    ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
    │   ELEVENLABS    │       │   OPENAI TTS    │       │   AZURE SPEECH  │
    │   (Premium)     │       │   (Standard)    │       │   (Enterprise)  │
    │                 │       │                 │       │                 │
    │ • 30+ voices    │       │ • 6 voices      │       │ • 400+ voices   │
    │ • Voice clone   │       │ • Fast gen      │       │ • Neural        │
    │ • Emotional     │       │ • Low cost      │       │ • SSML support  │
    └────────┬────────┘       └────────┬────────┘       └────────┬────────┘
             │                         │                         │
             └─────────────────────────┼─────────────────────────┘
                                       │
                                       ▼
                    ┌────────────────────────────────────────┐
                    │           AUDIO OUTPUT                  │
                    │  • MP3/WAV generation                   │
                    │  • Segment markers                      │
                    │  • Timing synchronization               │
                    └────────────────────────────────────────┘
```

---

## Key Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Script Generation** | AI-powered script creation from prompts | ✅ |
| **Document Analysis** | PPT/PDF/Word to script conversion | ✅ |
| **Image to Script** | Vision AI description generation | ✅ |
| **URL to Script** | Web content extraction | ✅ |
| **Script Enhancement** | AI improvement suggestions | ✅ |
| **TTS Generation** | Multi-provider voice synthesis | ✅ |
| **Voice Selection** | 30+ voice options | ✅ |
| **RAG Search** | Knowledge base integration | ✅ |
| **Template Library** | Pre-built script templates | ✅ |
| **Version Control** | Original/Enhanced tracking | ✅ |

---

## Related Scenarios (P0-P2) ✅ ALL COMPLETE

| # | Scenario | Status |
|---|----------|--------|
| 1 | Text Prompt → Script → Video | ✅ |
| 2 | AI Images → Script → Video | ✅ |
| 3 | Script Only → Manual Record | ✅ |
| 7 | PPT/Slides → Script → Video | ✅ |
| 8 | Document → Script → Video | ✅ |
| 61 | Recording → Mind → Script | ✅ |
| 62 | PPT → Mind → Script → Video | ✅ |
| 63 | PDF → Mind → Script | ✅ |
| 64 | URL → Mind → Script | ✅ |
| 65 | Image → Mind → Script | ✅ |

---

## Integration Points

| Integration | Direction | Purpose |
|-------------|-----------|---------|
| **Spark** | ← Receives | Quick prompts, templates |
| **Vibe** | ↔ Bidirectional | Scripts, TTS, Content analysis |
| **Arc** | ← Receives | Agent-generated scripts |
| **Hub** | ← Receives | Production requirements |
| **RAG** | ↔ Bidirectional | Knowledge search/storage |

---

## Nice-to-Have Enhancements (P3 Candidates) - RE-VERIFIED ✅

Based on P3 planning re-verification (2026-01-13):

| Enhancement | Component | Priority | Value Assessment | Recommendation |
|-------------|-----------|----------|------------------|----------------|
| Voice commands | `VoiceCommands` | Low | ❌ Low value - Mind is keyboard-focused | **Skip** |
| Guided Experience | — | Not Recommended | ❌ No value - Structured editor workflow | **Skip** |

**Conclusion:** No P3 nice-to-have items recommended for Genie Mind. Focus on cross-functional P3 features instead.

See: `docs/P3_IMPLEMENTATION_PLAN.md` for full P3 roadmap.

---

*Part of Genie Studio Architecture Documentation*  
*P0-P2 Closeout: 2026-01-13*
