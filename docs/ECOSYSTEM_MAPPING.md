# Genie Suite Ecosystem Mapping

> **Last Updated:** 2026-02-10  
> **Version:** v1.1.0  
> **Status:** Production Ready

## Executive Summary

The Genie Suite ecosystem comprises **7 Products**, **21 Pipeline Categories**, **206 Pipelines**, and **25 Cross-Functional Capabilities** working in concert to deliver an end-to-end content creation and distribution platform.

---

## 1. Product Overview (7 Products)

| # | Product | Tagline | Primary Role | Pipelines |
|---|---------|---------|--------------|-----------|
| 1 | **Genie Spark** | *Ignite your Ideas* | Input processing & script generation | 28 |
| 2 | **Genie Mind** | *AI That Understands* | Script enhancement, TTS, translation | 30 |
| 3 | **Genie Vibe** | *Script to Screen* | Audio/video production, avatar, dubbing | 74 |
| 4 | **Genie Deck** | *Ideas to Impact* | Presentations, visual design, 3D/immersive | 34 |
| 5 | **Genie Hub** | *Your Creative Command Center* | Scheduling, collaboration, project mgmt | 14 |
| 6 | **Genie Cast** | *Make It. Show It. Scale It.* | Distribution, marketing, analytics | 26 |
| 7 | **Genie Suite** | *Mind to Media* | Master orchestrator (all 206 pipelines) | ALL |

**Support Products:**
- **Ask Genie** (*Your wish is my command*) - Universal AI assistant

---

## 2. Pipeline Categories (21 Categories)

### SPARK - Script Generation (3 Categories, 28 Pipelines)
| Category ID | Name | Pipelines | Edge Function |
|-------------|------|-----------|---------------|
| `input-processing` | Input Processing | 8 | `document-processor` |
| `script-generation` | Script Generation | 12 | `ai-universal-processor` |
| `content-extraction` | Content Extraction | 8 | `azure-form-recognizer` |

### MIND - Script Enhancement (4 Categories, 30 Pipelines)
| Category ID | Name | Pipelines | Edge Function |
|-------------|------|-----------|---------------|
| `script-enhancement` | Script Enhancement | 10 | `enhance-script` |
| `tts-generation` | TTS & Voice | 8 | `elevenlabs-voice` |
| `music-generation` | Music & Audio | 6 | `multi-provider-music` |
| `translation` | Translation | 6 | `translation-service` |

### VIBE - Audio/Video Production (6 Categories, 74 Pipelines)
| Category ID | Name | Pipelines | Edge Function |
|-------------|------|-----------|---------------|
| `video-generation` | Video Generation | 15 | `ai-video-generator` |
| `video-editing` | Video Editing | 15 | `pipeline-editor-processor` |
| `audio-production` | Audio Production | 10 | `audio-mixer` |
| `podcast-webcast` | Podcast & Webcast | 16 | `extract-video-audio` |
| `avatar-lipsync` | Avatar & Lip-sync | 10 | `ai-video-generator` |
| `dubbing` | Dubbing & Localization | 8 | `multi-language-audio-orchestrator` |

### DECK - Presentations & Visual (3 Categories, 34 Pipelines)
| Category ID | Name | Pipelines | Edge Function |
|-------------|------|-----------|---------------|
| `presentation` | Presentation Generation | 12 | `share-presentation` |
| `visual-design` | Visual Design | 10 | `ai-image-generator` |
| `3d-immersive` | 3D & Immersive | 12 | `modelslab-media` |

### ARC - Project Management (2 Categories, 14 Pipelines)
| Category ID | Name | Pipelines | Edge Function |
|-------------|------|-----------|---------------|
| `scheduling` | Scheduling & Workflow | 8 | `calendar-sync` |
| `collaboration` | Collaboration | 6 | `workspace-collaboration` |

### CAST - Distribution & Marketing (3 Categories, 26 Pipelines)
| Category ID | Name | Pipelines | Edge Function |
|-------------|------|-----------|---------------|
| `distribution` | Distribution | 12 | `social-publish` |
| `marketing` | Marketing Engine | 8 | `marketing-auto-scheduler` |
| `analytics` | Analytics | 6 | `analytics-dashboard` |

---

## 3. Cross-Functional Capabilities (25 Capabilities)

### Avatar Capabilities (3)
| ID | Name | Tier | Products | Primary Provider |
|----|------|------|----------|------------------|
| `ai-avatar` | AI Avatar | Pro | Vibe, Deck, Cast | Alibaba Wan2.2 |
| `full-body-avatar` | Full-Body Avatar | Enterprise | Vibe, Cast | Alibaba OmniAvatar |
| `lip-sync` | Lip-Sync | Pro | Vibe, Cast | Azure Visemes |

### 3D & Immersive (5)
| ID | Name | Tier | Products | Primary Provider |
|----|------|------|----------|------------------|
| `3d-models` | 3D Model Generation | Enterprise | Deck, Vibe, Cast | Meshy AI, ModelsLab 3D |
| `3d-scenes` | 3D Scene Composition | Enterprise | Deck, Vibe | Three.js |
| `ar-experience` | AR Experience | Enterprise | Deck, Vibe, Cast | A-Frame |
| `vr-experience` | VR Experience | Enterprise | Deck, Vibe | A-Frame |
| `motion-graphics` | Motion Graphics | Pro | Deck, Vibe, Cast | Framer Motion |
| `animated-charts` | Animated Data Viz | Pro | Deck, Vibe | D3.js, Recharts |

### Audio Capabilities (5)
| ID | Name | Tier | Products | Primary Provider |
|----|------|------|----------|------------------|
| `tts` | Text-to-Speech | Free | Mind, Vibe, Deck, Cast | ElevenLabs, Azure, Alibaba |
| `voice-cloning` | Voice Cloning | Pro | Mind, Vibe, Cast | ElevenLabs |
| `music-generation` | AI Music | Pro | Mind, Vibe, Deck | Suno AI, ModelsLab |
| `sfx` | Sound Effects | Pro | Vibe, Deck | ElevenLabs, ModelsLab |
| `stt` | Speech-to-Text | Free | Spark, Vibe, Cast | Azure, Google, Alibaba |

### Video Capabilities (4)
| ID | Name | Tier | Products | Primary Provider |
|----|------|------|----------|------------------|
| `video-generation` | AI Video | Pro | Vibe, Deck, Cast | ModelsLab, Alibaba Wan2.2 |
| `video-editing` | Video Editing | Free | Vibe | FFmpeg |
| `podcast` | Podcast Production | Pro | Vibe, Cast | FFmpeg, ElevenLabs |
| `webcast` | Webcast Production | Enterprise | Vibe, Arc, Cast | Custom |

### Localization (3)
| ID | Name | Tier | Products | Primary Provider |
|----|------|------|----------|------------------|
| `dubbing` | Multi-Language Dubbing | Pro | Vibe, Cast | ElevenLabs, Azure, Alibaba |
| `translation` | Content Translation | Free | Spark, Mind, Deck, Cast | DeepL, Google, Alibaba |
| `regional-localization` | Regional Localization | Enterprise | Cast | Multi-provider |

### Distribution (2)
| ID | Name | Tier | Products | Primary Provider |
|----|------|------|----------|------------------|
| `social-publishing` | Multi-Platform Publishing | Pro | Cast | Platform APIs |
| `scheduled-distribution` | Scheduled Distribution | Pro | Cast, Arc | Internal Scheduler |

---

## 4. Product-to-Category Mapping Matrix

```
                    Spark  Mind  Vibe  Deck  Hub  Cast  Suite
─────────────────────────────────────────────────────────────
input-processing      ●                              ●
script-generation     ●     ○                        ●
content-extraction    ●     ○                        ●
─────────────────────────────────────────────────────────────
script-enhancement          ●     ○                  ●
tts-generation              ●     ○     ○       ○    ●
music-generation            ●     ○                  ●
translation                 ●           ○       ○    ●
─────────────────────────────────────────────────────────────
video-generation                  ●     ○       ○    ●
video-editing                     ●                  ●
audio-production                  ●     ○            ●
podcast-webcast                   ●           ○      ●
avatar-lipsync                    ●     ○       ○    ●
dubbing                           ●           ○      ●
─────────────────────────────────────────────────────────────
presentation                            ●            ●
visual-design                           ●     ○      ●
3d-immersive                      ○     ●       ○    ●
─────────────────────────────────────────────────────────────
scheduling                              ○     ●  ○   ●
collaboration                                 ●      ●
─────────────────────────────────────────────────────────────
distribution                                     ●   ●
marketing                                        ●   ●
analytics                                   ○    ●   ●

● = Primary Owner | ○ = Shared Access
```

---

## 5. Wizard Step to Product Routing

| Step | Name | Primary Product | Shared Products |
|------|------|-----------------|-----------------|
| 0 | Universal Input Gateway | Spark | Suite |
| 1 | Language & Localization | Mind | Cast |
| 2 | Industry Context | Mind | Spark |
| 3 | Framework Selection | Mind | Deck |
| 4 | Visual Features | Deck | Vibe |
| 5 | Audio Configuration | Mind | Vibe |
| 6 | Video/Avatar Setup | Vibe | Deck, Cast |
| 7 | Generation & Editor | *Dynamic* | Based on output type |
| 8 | Publishing | Cast | Hub |

---

## 6. Provider Network (12 Core Providers)

| Provider | Categories | Primary Use |
|----------|------------|-------------|
| **OpenAI** | LLM, Vision | GPT-4, DALL-E, Whisper |
| **Claude** | LLM | Claude 3.5 Sonnet |
| **Gemini** | LLM, Vision | Gemini 2.0 Flash |
| **DeepSeek** | LLM | DeepSeek-V3 |
| **Alibaba** | LLM, TTS, Avatar | Qwen-Max, Qwen3-TTS, Wan2.2 |
| **Azure** | STT, TTS, Translation | Visemes, Custom Voice |
| **ElevenLabs** | TTS, Voice Clone | High-fidelity TTS |
| **DeepL** | Translation | European languages |
| **ModelsLab** | Image, Video, 3D | FLUX, AnimateDiff |
| **Replicate** | Video, Avatar | Fallback provider |
| **Meshy AI** | 3D | Mesh generation |
| **Supabase** | Auth, DB, Edge | Infrastructure |

---

## 7. Registry Files Reference

| File | Purpose |
|------|---------|
| `src/constants/genie-products.ts` | Product definitions & taglines |
| `src/constants/pipelineProductMapping.ts` | 21 category → product mapping |
| `src/constants/crossFunctionalCapabilities.ts` | 25 cross-functional capabilities |
| `src/constants/ecosystemRegistry.ts` | Unified registry & validation |
| `src/components/genie-studio/presentation-generator/registry/contextRegistry.ts` | Industries, Frameworks, Outputs, Visuals |
| `src/utils/ecosystemVerification.ts` | Runtime verification utility |

---

## 8. Verification & Health Check

Run ecosystem verification:
```typescript
import { verifyEcosystem, logEcosystemVerification } from '@/utils/ecosystemVerification';

// Full report
const report = verifyEcosystem();
console.log(report.status); // 'healthy' | 'warning' | 'error'

// Quick health check
if (!isEcosystemHealthy()) {
  console.error('Issues detected!');
}
```

---

## 9. Quick Stats

| Metric | Count |
|--------|-------|
| **Products** | 7 |
| **Pipeline Categories** | 21 |
| **Pipelines** | 206 |
| **Cross-Functional Capabilities** | 25 |
| **Core Providers** | 12 |
| **Supported Languages** | 70+ |
| **Industries** | 25 |
| **Frameworks** | 101+ |
| **Output Types** | 24 |
| **Visual Features** | 36 |

---

*Document generated from ecosystem registry. See `src/constants/ecosystemRegistry.ts` for authoritative source.*
