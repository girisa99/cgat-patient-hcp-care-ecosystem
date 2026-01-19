# Unified Media AI Strategy
## Consolidating Fragmented AI Providers

**Last Updated:** 2025-01-19  
**Status:** ACTIVE - Strategic Decision Document

---

## 🎯 Problem Statement

Currently, the codebase has **highly fragmented** AI providers for media generation:
- Multiple image providers (DALL-E, Stable Diffusion, FLUX, etc.)
- Separate video, audio, 3D providers
- Inconsistent API patterns
- Difficult to manage 10+ API keys
- No clear fallback strategy

---

## ✅ RECOMMENDED UNIFIED STRATEGY

### Tier 1: Primary Hub Providers (Consolidated)

| Provider | Capabilities | API Key | Status | Priority |
|----------|-------------|---------|--------|----------|
| **Lovable AI Gateway** | LLM (Gemini, GPT-5) | `LOVABLE_API_KEY` ✅ | Active | 🥇 1 |
| **ModelsLab** | Image, Video, Audio, 3D, LLM, Training | `MODELSLAB_API_KEY` 💳 | **ADD THIS** | 🥇 1 |
| **OpenAI** | DALL-E, TTS, Whisper, Vision | `OPENAI_API_KEY` ✅ | Active | 🥈 2 |
| **ElevenLabs** | Voice, TTS, Voice Clone | `ELEVENLABS_API_KEY` ✅ | Active | 🥈 2 |

### Tier 2: Specialist Providers (Configured)

| Provider | Best For | API Key | Status |
|----------|----------|---------|--------|
| **Replicate** | FLUX, Specialized Models | `REPLICATE_API_TOKEN` ✅ | Active |
| **Alibaba DashScope** | Asian content, Low cost | `ALIBABA_API_KEY` ✅ | Active |
| **DeepSeek** | Code, Chinese, Technical | `DEEPSEEK_API_KEY` ✅ | Active |

### Tier 3: NOT Recommended (Fragmentation)

| Provider | Issue | Alternative |
|----------|-------|-------------|
| **Midjourney** | ❌ No official API | Use ModelsLab Midjourney-style |
| **Stability AI Direct** | Already via Replicate/ModelsLab | ModelsLab SDXL |
| **Ideogram AI** | Separate API, limited | ModelsLab or DALL-E |
| **Leonardo.AI** | Another API to manage | ModelsLab |
| **Suno/Udio** | No stable API | ElevenLabs + ModelsLab |

---

## 🏗️ ModelsLab: The Multi-Modal Hub

**Why ModelsLab?**
- ✅ Single API for: Image, Video, Audio, 3D, LLM, Training
- ✅ Access to 10,000+ models including CivitAI community models
- ✅ Stable Diffusion (all versions), FLUX, Midjourney-style
- ✅ Video generation (text-to-video, image-to-video)
- ✅ Audio/Music generation
- ✅ 3D model generation
- ✅ Model fine-tuning/training
- ✅ Reasonable pricing

### ModelsLab Capabilities Matrix

| Capability | Endpoint | Models Available |
|------------|----------|------------------|
| **Text-to-Image** | `/text2img` | SDXL, SD 1.5, SD 3, FLUX, Midjourney-style, Realistic Vision, DreamShaper |
| **Image-to-Image** | `/img2img` | Style transfer, upscaling, editing |
| **Inpainting** | `/inpaint` | Object removal, replacement |
| **ControlNet** | `/controlnet` | Pose, Depth, Canny, OpenPose |
| **Text-to-Video** | `/text2video` | AnimateDiff, Stable Video Diffusion |
| **Image-to-Video** | `/img2video` | Animation from still images |
| **Text-to-Audio** | `/text2audio` | Music, sound effects |
| **Voice Clone** | `/voice_clone` | Custom voice generation |
| **3D Generation** | `/text2mesh` | 3D model from text |
| **Training** | `/dreambooth` | Custom model fine-tuning |

---

## 📋 Implementation Plan

### Step 1: Add ModelsLab API Key

```bash
# Add to secrets
MODELSLAB_API_KEY=your_key_here
```

### Step 2: Create Unified Media Router

```typescript
// src/services/ai-hub/UnifiedMediaRouter.ts
export const UNIFIED_MEDIA_ROUTING = {
  image: {
    primary: 'modelslab',    // SD, FLUX, Midjourney-style
    fallback1: 'openai',     // DALL-E 3
    fallback2: 'replicate',  // FLUX.1
    fallback3: 'alibaba',    // Wanx
  },
  video: {
    primary: 'modelslab',    // AnimateDiff, SVD
    fallback1: 'replicate',  // minimax/video-01
  },
  audio: {
    primary: 'elevenlabs',   // TTS, Voice
    fallback1: 'modelslab',  // Music, SFX
    fallback2: 'openai',     // OpenAI TTS
  },
  '3d': {
    primary: 'modelslab',    // Only option with API
  },
  llm: {
    primary: 'lovable',      // Gateway (Gemini, GPT-5)
    fallback1: 'openai',     // Direct
    fallback2: 'anthropic',  // Claude
    fallback3: 'deepseek',   // Technical
  },
};
```

### Step 3: Provider Comparison for Each Capability

#### Image Generation Decision Tree

```
┌─────────────────────────────────────────────────────────────┐
│                    IMAGE GENERATION                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Need text in image? ───────────────► DALL-E 3 (OpenAI)     │
│          │                                                   │
│          ▼                                                   │
│  Need photorealism? ────────────────► ModelsLab (SDXL)      │
│          │                                                   │
│          ▼                                                   │
│  Need anime/artistic? ──────────────► ModelsLab (Anything)  │
│          │                                                   │
│          ▼                                                   │
│  Need Midjourney style? ────────────► ModelsLab (MJ-style)  │
│          │                                                   │
│          ▼                                                   │
│  Need fast/cheap? ──────────────────► ModelsLab (SD Turbo)  │
│          │                                                   │
│          ▼                                                   │
│  Need ControlNet/editing? ──────────► ModelsLab (SDXL)      │
│          │                                                   │
│          ▼                                                   │
│  Default ───────────────────────────► Lovable AI (Gemini)   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Video Generation Decision Tree

```
┌─────────────────────────────────────────────────────────────┐
│                    VIDEO GENERATION                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Need text-to-video? ───────────────► ModelsLab (SVD)       │
│          │                                                   │
│          ▼                                                   │
│  Need image-to-video? ──────────────► ModelsLab (I2V)       │
│          │                                                   │
│          ▼                                                   │
│  Need longer videos? ───────────────► Replicate (minimax)   │
│          │                                                   │
│          ▼                                                   │
│  Default ───────────────────────────► ModelsLab             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Voice/Audio Decision Tree

```
┌─────────────────────────────────────────────────────────────┐
│                    VOICE/AUDIO                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Need voice TTS? ───────────────────► ElevenLabs            │
│          │                                                   │
│          ▼                                                   │
│  Need voice cloning? ───────────────► ElevenLabs            │
│          │                                                   │
│          ▼                                                   │
│  Need music generation? ────────────► ModelsLab             │
│          │                                                   │
│          ▼                                                   │
│  Need SFX? ─────────────────────────► ModelsLab             │
│          │                                                   │
│          ▼                                                   │
│  Need cheap TTS? ───────────────────► OpenAI TTS            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 Final API Key Strategy

### KEEP (Currently Configured - 9 Keys)
```
LOVABLE_API_KEY          ✅ LLM Gateway (Managed)
OPENAI_API_KEY           ✅ DALL-E, TTS, Whisper, Vision
ELEVENLABS_API_KEY       ✅ Voice, TTS, Voice Clone
REPLICATE_API_TOKEN      ✅ FLUX, Specialized Models
ALIBABA_API_KEY          ✅ Asian content, Translation
DEEPSEEK_API_KEY         ✅ Code, Chinese
ANTHROPIC_API_KEY        ✅ Claude (backup LLM)
GEMINI_API_KEY           ✅ Direct Gemini access
HUGGING_FACE_ACCESS_TOKEN ✅ Open models
```

### ADD (1 New Key)
```
MODELSLAB_API_KEY        💳 ADD - Unified Image/Video/Audio/3D/Training
```

### REMOVE/SKIP (Avoid Fragmentation)
```
STABILITY_API_KEY        ❌ Already via ModelsLab/Replicate
MIDJOURNEY_API_KEY       ❌ No official API (use ModelsLab)
IDEOGRAM_API_KEY         ❌ Limited, use ModelsLab
LEONARDO_API_KEY         ❌ Another hub, redundant
SUNO_API_KEY             ❌ No stable API
UDIO_API_KEY             ❌ No stable API
```

---

## 🎨 Midjourney Alternative

Since Midjourney has **NO official API**, here are the options:

| Option | Provider | Quality | Notes |
|--------|----------|---------|-------|
| **Midjourney-style** | ModelsLab | 85% | Uses fine-tuned models |
| **Niji-style (anime)** | ModelsLab | 90% | Excellent for anime |
| **Unofficial Proxy** | ❌ Not Recommended | - | TOS violation, unstable |
| **DALL-E 3 with prompts** | OpenAI | 80% | Different aesthetic |

**Recommendation:** Use ModelsLab's Midjourney-style models, they're trained to replicate the aesthetic.

---

## 📊 Cost Comparison

| Task | Current (Fragmented) | Unified (ModelsLab) |
|------|---------------------|---------------------|
| 1000 Images | $40 (mixed) | $2-5 |
| 100 Videos | $50 (Replicate) | $10-20 |
| 1000 Voice clips | $15 (ElevenLabs) | Keep ElevenLabs |
| 100 3D Models | ❌ Not available | $5-10 |

---

## 🚀 Action Items

1. **[ ] Add MODELSLAB_API_KEY** to secrets
2. **[ ] Create UnifiedMediaRouter.ts** service
3. **[ ] Update edge functions** to use ModelsLab
4. **[ ] Update LanguageConfigPopup** with unified options
5. **[ ] Create fallback chains** in provider registry
6. **[ ] Remove unused provider UI** (Midjourney direct, etc.)

---

## 📝 Notes

- **CivitAI Models**: Available through ModelsLab (they host CivitAI models)
- **Training/Fine-tuning**: Only ModelsLab provides training API
- **3D Generation**: Only ModelsLab has text-to-3D API
- **Ideogram**: Skip - DALL-E 3 is better for text-in-image

This strategy reduces **10+ providers down to 4 primary** while maintaining all capabilities.
