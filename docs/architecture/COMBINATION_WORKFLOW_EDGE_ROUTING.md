# Combination Workflow Edge Function Routing

> **Purpose**: Document all combination scenarios and their edge function routing chains
> **Last Updated**: 2025-01-24
> **Status**: Production Ready

---

## Overview

The Genie Suite supports 25+ combination elements that can be mixed into 15+ preset workflows. Each combination routes through specific edge functions based on the output category and provider requirements.

---

## 1. Edge Function Categories

### Core Generation Functions
| Function | Purpose | Providers Used |
|----------|---------|----------------|
| `ai-universal-processor` | LLM content generation | Gemini, Claude, OpenAI, DeepSeek, Alibaba |
| `ai-video-generator` | Video, Avatar, Lip-sync | ModelsLab, Alibaba, Replicate |
| `modelslab-media` | Image, Video, 3D, Animation | ModelsLab, Meshy, Replicate |

### Voice & Audio Functions
| Function | Purpose | Providers Used |
|----------|---------|----------------|
| `elevenlabs-voice` | Premium TTS | ElevenLabs |
| `openai-tts` | OpenAI TTS | OpenAI |
| `azure-tts` | Azure Neural TTS (400+ voices) | Azure |
| `alibaba-tts` | CJK-optimized TTS | Alibaba CosyVoice |
| `google-tts` | Google Cloud TTS | Google |
| `voice-clone-processor` | Voice cloning | ElevenLabs, ModelsLab |
| `multi-language-audio-orchestrator` | Multi-language dubbing | All TTS + Translation |
| `elevenlabs-music` | AI music generation | ElevenLabs |
| `music-composer-agent` | Music composition | ElevenLabs, ModelsLab |
| `elevenlabs-sfx` | Sound effects | ElevenLabs |

### Translation Functions
| Function | Purpose | Providers Used |
|----------|---------|----------------|
| `translation-service` | Text translation | DeepL, Alibaba, Azure, Google |

### Interactive Functions
| Function | Purpose | Providers Used |
|----------|---------|----------------|
| `quiz-video-generator` | Interactive quizzes | Gemini, OpenAI |
| `microlearning-generator` | Bite-sized modules | Gemini, OpenAI |

### Export Functions
| Function | Purpose | Providers Used |
|----------|---------|----------------|
| `share-presentation` | PDF/PPTX export | Gemini |
| `google-slides-export` | Google Slides export | Google |

---

## 2. Combination Scenarios → Edge Function Chains

### Basic Workflows

#### Basic Presentation (Free)
```
Input → ai-universal-processor → share-presentation → Output (PDF)
```
**Providers**: Gemini (LLM)
**Credits**: 1

#### Professional Deck (Starter)
```
Input → ai-universal-processor → share-presentation → Output (PPTX)
```
**Providers**: Gemini (LLM)
**Credits**: 2

---

### Animated Workflows (Creator)

#### Animated Presentation
```
Input → ai-universal-processor → ai-video-generator → Output (MP4)
        └── [charts, transitions]
```
**Providers**: Gemini (LLM), ModelsLab (AnimateDiff)
**Credits**: 6

#### Motion Graphics Video
```
Input → ai-universal-processor ─┬─→ ai-video-generator → Output (MP4)
                                └─→ music-composer-agent ─┘
```
**Providers**: Gemini, ModelsLab, ElevenLabs
**Credits**: 13

---

### Video + Narration Workflows (Creator-Pro)

#### Narrated Presentation
```
Input → ai-universal-processor ─┬─→ elevenlabs-voice → ai-video-generator → Output
                                │
                                └── [script generation]
```
**Providers**: Gemini (LLM), ElevenLabs (TTS), ModelsLab (video)
**Credits**: 8

#### Global Multi-Language Video (Pro)
```
Input → ai-universal-processor ─┬─→ translation-service ─┬─→ multi-language-audio-orchestrator
                                │                        │
                                └── [base script]        └─→ ai-video-generator → Output
```
**Provider Selection by Language**:
- **European** (EN, DE, FR, ES, IT, PT, NL, PL): DeepL + ElevenLabs
- **CJK** (ZH, JA, KO): Alibaba Qwen-MT + CosyVoice
- **Arabic/MENA** (AR, HE, FA): Azure + GPT-4o
- **India/SEA** (HI, TH, VI, ID): Gemini + Google TTS

**Credits**: 25

---

### Avatar Workflows (Pro-Business)

#### Talking Head Avatar (Pro)
```
Input → ai-universal-processor → elevenlabs-voice → ai-video-generator → Output
                                                    └── [type: 'avatar']
                                                    └── [provider: alibaba/replicate]
```
**Providers**: Gemini, ElevenLabs, Alibaba (Wan2.2)
**Edge Function Params**: `{ type: 'avatar', sourceImage: url, audioUrl: ttsOutput }`
**Credits**: 31

#### Full-Body AI Presenter (Business)
```
Input → ai-universal-processor → elevenlabs-voice ─┬─→ ai-video-generator
                                                   │   └── [type: 'avatar', fullBody: true]
                                                   └─→ music-composer-agent ─┘
```
**Providers**: Gemini, ElevenLabs, Alibaba (OmniAvatar)
**Edge Function Params**: `{ type: 'avatar', fullBody: true, priorityRendering: true }`
**Credits**: 55

#### Talking Photo Story (Pro)
```
Input → [photo upload] → ai-universal-processor → elevenlabs-voice → ai-video-generator
                                                                     └── [provider: replicate (EMO/V-Express)]
```
**Providers**: Gemini, ElevenLabs, Replicate
**Credits**: 25

---

### 3D & Immersive Workflows (Pro-Enterprise)

#### 3D Product Showcase (Pro)
```
Input → ai-universal-processor → modelslab-media → elevenlabs-voice → Output
                                 └── [type: '3d', provider: meshy]
```
**Providers**: Gemini, Meshy AI, ElevenLabs
**Credits**: 31

#### Image-to-3D Conversion
```
Input → [image upload] → modelslab-media → Output (GLTF/USDZ/FBX)
                         └── [type: 'image_to_3d', provider: meshy/replicate (TripoSR)]
```
**Providers**: Meshy AI, Replicate
**Credits**: 20

#### VR Immersive Presentation (Business)
```
Input → ai-universal-processor ─┬─→ modelslab-media [3D assets]
                                │   └── [type: '3d', provider: meshy]
                                │
                                ├─→ ai-video-generator [360° video]
                                │
                                └─→ elevenlabs-voice ─────────────────→ Output (WebXR)
```
**Providers**: Gemini, Meshy AI, ModelsLab, ElevenLabs
**Export**: A-Frame / Three.js WebXR package
**Credits**: 80

#### AR Product Experience (Business)
```
Input → modelslab-media [image_to_3d] → modelslab-media [ar_export] → Output (USDZ)
        └── [provider: meshy]           └── [ar_overlay: true]
```
**Providers**: Meshy AI, Google Model Viewer
**Credits**: 55

---

### Interactive Workflows (Creator-Pro)

#### Interactive Course (Creator)
```
Input → ai-universal-processor ─┬─→ elevenlabs-voice → ai-video-generator
                                │
                                ├─→ quiz-video-generator
                                │
                                └─→ microlearning-generator → Output (SCORM/LMS)
```
**Providers**: Gemini, ElevenLabs, ModelsLab
**Credits**: 19

#### Branching Scenario Training (Pro)
```
Input → ai-universal-processor ─┬─→ ai-video-generator [avatar]
        └── [provider: claude]  │   └── [type: 'avatar']
                                │
                                └─→ quiz-video-generator → Output
```
**Providers**: Claude (nuanced scenarios), Alibaba (avatar), ElevenLabs
**Credits**: 36

---

### Ultimate Combinations (Enterprise)

#### Ultimate Production Suite
```
Input → ai-universal-processor ─┬─→ voice-clone-processor
        └── [provider: claude]  │
                                ├─→ multi-language-audio-orchestrator
                                │   └── [70+ languages]
                                │
                                ├─→ ai-video-generator
                                │   └── [type: 'avatar', fullBody: true]
                                │
                                ├─→ music-composer-agent
                                │
                                └─→ Output (4K MP4 + all formats)
```
**Credits**: 90

#### Metaverse Experience
```
Input → modelslab-media [3D world] ─┬─→ ai-video-generator [full_body_avatar]
        └── [provider: meshy]       │
                                    ├─→ ai-video-generator [360_video]
                                    │
                                    └─→ elevenlabs-voice → Output (WebXR/VR package)
```
**Credits**: 150

---

## 3. Provider Selection Logic by Region

### 5-Zone Regional Routing

| Zone | Countries | LLM | TTS | Translation |
|------|-----------|-----|-----|-------------|
| **Claude** | US, EU, LatAm, IL, ZA | Claude 3.5 Sonnet | ElevenLabs | DeepL |
| **Alibaba** | CN, JP, KR, HK, TW, SG | Qwen-Max | CosyVoice | Qwen-MT |
| **Arabic** | MENA (AR, HE, FA) | GPT-4o | Azure Neural | Azure |
| **Gemini** | India, SEA, Africa | Gemini 2.5 Pro | Google TTS | Google |
| **Fallback** | Anywhere | DeepSeek V3 | OpenAI TTS | OpenAI |

### Global Providers (No Regional Routing)

| Capability | Primary Provider | Fallback |
|------------|-----------------|----------|
| **Avatar (Talking Head)** | Alibaba Wan2.2 | Replicate |
| **Avatar (Full Body)** | Alibaba OmniAvatar | None |
| **3D Mesh** | Meshy AI | ModelsLab |
| **Image-to-3D** | Meshy AI | Replicate (TripoSR) |
| **AnimateDiff** | ModelsLab | Replicate |
| **Image Gen (FLUX)** | ModelsLab | Replicate |
| **Priority Rendering** | RunPod | None |

---

## 4. Credit Cost Summary by Tier

| Tier | Monthly Credits | Available Combinations |
|------|-----------------|----------------------|
| **Free** | 5 | Basic Presentation |
| **Starter** | 50 | + Professional Deck |
| **Creator** | 200 | + Animated, Narrated, Interactive Course |
| **Pro** | 500 | + Multi-Language, Avatar, 3D, Talking Photo |
| **Business** | 2,000 | + Full-Body Avatar, VR, AR, 360° |
| **Enterprise** | Custom | All + Ultimate + Metaverse |

---

## 5. Edge Function Error Handling

### Fallback Chain Execution

```typescript
// Example: TTS fallback chain
const TTS_FALLBACK_CHAIN = ['elevenlabs', 'azure', 'openai', 'google', 'alibaba'];

async function generateVoiceWithFallback(text, language) {
  for (const provider of TTS_FALLBACK_CHAIN) {
    try {
      const result = await invokeEdgeFunction(`${provider}-tts`, { text, language });
      if (result.success) return result;
    } catch (e) {
      console.log(`${provider} failed, trying next...`);
    }
  }
  throw new Error('All TTS providers failed');
}
```

### A2A Coordinator Integration

The `ai-a2a-coordinator` function orchestrates multi-step combinations:

```typescript
// Request to A2A coordinator
{
  action: 'orchestrate',
  generationContext: {
    workflowContext: { selectedContentTypes: ['video_presentation'] },
    templateContext: { visualFeatures: ['3d_product', 'avatar'] },
    voiceConfig: { provider: 'elevenlabs', voiceId: 'Rachel' },
    outputConfig: { format: '4k', includeVoiceover: true }
  },
  userTier: 'pro',
  sessionId: 'uuid'
}
```

---

## 6. Quick Reference: Element → Edge Function Map

| Element | Primary Edge Function | Fallback |
|---------|----------------------|----------|
| Static Slides | `ai-universal-processor` | - |
| Animated Charts | `ai-video-generator` | - |
| Kinetic Typography | `ai-video-generator` | - |
| AI Voiceover | `elevenlabs-voice` | `azure-tts`, `openai-tts` |
| Voice Cloning | `voice-clone-processor` | - |
| Multi-Language Dubbing | `multi-language-audio-orchestrator` | - |
| Background Music | `elevenlabs-music` | `music-composer-agent` |
| Sound Effects | `elevenlabs-sfx` | - |
| Talking Head Avatar | `ai-video-generator` (type: avatar) | - |
| Full Body Avatar | `ai-video-generator` (fullBody: true) | - |
| Talking Photo | `ai-video-generator` (EMO/V-Express) | - |
| Lip Sync | `ai-video-generator` (Azure Visemes) | - |
| 3D Product | `modelslab-media` (Meshy) | - |
| Image to 3D | `modelslab-media` (TripoSR) | - |
| VR Experience | `modelslab-media` + WebXR export | - |
| AR Overlay | `modelslab-media` + USDZ | - |
| 360° Video | `ai-video-generator` | - |
| Interactive Quiz | `quiz-video-generator` | - |
| Microlearning | `microlearning-generator` | - |
| Branching Narrative | `ai-universal-processor` (Claude) | - |

---

## 7. Implementation Files

| File | Purpose |
|------|---------|
| `src/services/ai-hub/combinationWorkflowService.ts` | Combination definitions & recommendations |
| `src/components/genie-studio/presentation-generator/CombinationWorkflowSelector.tsx` | Visual UI selector |
| `supabase/functions/ai-a2a-coordinator/index.ts` | Multi-agent orchestration |
| `supabase/functions/ai-video-generator/index.ts` | Video/Avatar generation |
| `supabase/functions/multi-language-audio-orchestrator/index.ts` | Dubbing orchestration |
| `supabase/functions/modelslab-media/index.ts` | 3D/Image/Animation generation |

---

**Document Status**: Production Ready
**Last Reviewed**: 2025-01-24
**Maintainer**: Genie AI Team
