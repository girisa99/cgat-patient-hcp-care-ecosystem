# AI Provider Comprehensive Matrix - 15 Configured Providers

> **Last Updated**: 2026-01-30
> **Status**: PRODUCTION VERIFIED

## 🔑 15 Configured Providers (with API Keys)

| # | Provider | API Key | Status | Primary Capabilities |
|---|----------|---------|--------|---------------------|
| 1 | **OpenAI** | `OPENAI_API_KEY` | ✅ | LLM, TTS, STT (Whisper), Image (DALL-E 3), Vision |
| 2 | **Claude** | `ANTHROPIC_API_KEY` | ✅ | LLM, Translation (Literary), Vision, NLP |
| 3 | **Gemini** | `GEMINI_API_KEY` | ✅ | LLM, Translation, OCR, Image Gen, Vision, NLP |
| 4 | **Deepgram** | `DEEPGRAM_API_KEY` | ✅ | **PRIMARY STT** (<100ms real-time), 36+ languages |
| 5 | **DeepSeek** | `DEEPSEEK_API_KEY` | ✅ | LLM (CJK), Translation, OCR, Vision (low cost) |
| 6 | **Alibaba** | `ALIBABA_API_KEY` | ✅ | LLM, TTS (CosyVoice), STT (Paraformer), **PRIMARY Avatar/Lip-Sync**, Video |
| 7 | **Azure** | `AZURE_SPEECH_KEY` | ✅ | TTS (Neural, Visemes), STT, OCR, Translation |
| 8 | **DeepL** | `DEEPL_API_KEY` | ✅ | **PRIMARY Translation** (European) |
| 9 | **ElevenLabs** | `ELEVENLABS_API_KEY` | ✅ | **PRIMARY TTS**, Voice Clone, **PRIMARY Music**, SFX |
| 10 | **Sora2API** | `SORA2API_KEY` | ✅ | **PRIMARY Video** (Cinematic, Realistic) |
| 11 | **ModelsLab** | `MODELSLAB_API_KEY` | ✅ | **PRIMARY Image** (FLUX), AnimateDiff, 3D |
| 12 | **Meshy** | `MESHY_API_KEY` | ✅ | **PRIMARY 3D** (PBR textures, rigging) |
| 13 | **Replicate** | `REPLICATE_API_TOKEN` | ✅ | Image, Video, 3D (fallback) |
| 14 | **Google Cloud** | `GOOGLE_API_KEY` | ✅ | TTS (WaveNet), STT, Translation, Vision |
| 15 | **HuggingFace** | `HUGGING_FACE_ACCESS_TOKEN` | ✅ | Open models, fallback |

---

## 📊 Capability → Provider Routing Matrix

### Text & Language (LLM/Translation/NLP)

| Capability | P1 (Primary) | P2 (Fallback) | P3 (Budget) | Regional Override |
|------------|--------------|---------------|-------------|-------------------|
| **LLM** | Gemini | OpenAI | Claude | CJK: Alibaba/DeepSeek |
| **Translation** | DeepL | Azure | Claude | CJK: Alibaba, MENA: Azure |
| **NLP** | Gemini | OpenAI | Claude | CJK: DeepSeek |
| **OCR** | Azure Form | Gemini | Alibaba | CJK: Alibaba/DeepSeek |

### Audio (TTS/STT/Music/SFX)

| Capability | P1 (Primary) | P2 (Fallback) | P3 (Budget) | Regional Override |
|------------|--------------|---------------|-------------|-------------------|
| **TTS** | ElevenLabs | Azure Neural | OpenAI | CJK: Alibaba CosyVoice |
| **STT Real-time** | **Deepgram** | Azure | Google | CJK: Alibaba Paraformer |
| **STT Batch** | OpenAI Whisper | Deepgram | Azure | CJK: Alibaba Paraformer |
| **Music** | ElevenLabs | ModelsLab | Alibaba | CJK: Alibaba Music |
| **SFX** | ElevenLabs | Azure | ModelsLab | CJK: Alibaba SFX |

### Visual (Image/Video/3D/Avatar)

| Capability | P1 (Primary) | P2 (Fallback) | P3 (Budget) | Regional Override |
|------------|--------------|---------------|-------------|-------------------|
| **Image Gen** | ModelsLab FLUX | Gemini | OpenAI DALL-E | CJK: Alibaba Wanx |
| **Video (Cinematic)** | **Sora2API** | ModelsLab | Gemini Veo | - |
| **Video (AnimateDiff)** | ModelsLab | Alibaba | Replicate | - |
| **Video (Avatar/Lip-Sync)** | **Alibaba WAN 2.2** | Azure Visemes | - | - |
| **3D Generation** | **Meshy** | ModelsLab | Replicate | - |
| **3D Product Spin** | Meshy | ModelsLab | - | - |
| **Vision/Image Analysis** | Gemini | OpenAI | Claude | - |

---

## 🌍 7-Zone Regional Routing

### Zone 1: Western/EU (Claude Zone)
- **LLM**: Claude → OpenAI → Gemini
- **TTS**: ElevenLabs → Azure → OpenAI
- **STT**: Deepgram → OpenAI Whisper → Azure
- **Translation**: DeepL → Claude → Azure

### Zone 2: CJK (Alibaba Zone)
- **LLM**: Alibaba Qwen → DeepSeek → Gemini
- **TTS**: Alibaba CosyVoice → Azure → OpenAI
- **STT**: Alibaba Paraformer → Deepgram → Azure
- **Translation**: Alibaba → DeepSeek → DeepL
- **Avatar**: Alibaba WAN 2.2

### Zone 3: India/SEA (Gemini Zone)
- **LLM**: Gemini → OpenAI → Alibaba
- **TTS**: Google → Azure → ElevenLabs
- **STT**: Deepgram → Google → Azure
- **Translation**: Google → Azure → DeepL

### Zone 4: MENA/Arabic (Azure Zone)
- **LLM**: Claude → OpenAI → Gemini
- **TTS**: Azure Neural → ElevenLabs → Google
- **STT**: Deepgram → Azure → Google
- **Translation**: Azure → Google → DeepL

### Zone 5: LATAM (ElevenLabs Zone)
- **LLM**: OpenAI → Claude → Gemini
- **TTS**: ElevenLabs → Azure → Google
- **STT**: Deepgram → OpenAI Whisper → Azure
- **Translation**: DeepL → Azure → Google

### Zone 6: Africa (Google Zone)
- **LLM**: Gemini → OpenAI → Claude
- **TTS**: Google → Azure → ElevenLabs
- **STT**: Deepgram → Google → Azure
- **Translation**: Google → Azure → DeepL

### Zone 7: Global English (OpenAI Zone)
- **LLM**: OpenAI → Claude → Gemini
- **TTS**: ElevenLabs → OpenAI → Azure
- **STT**: Deepgram → OpenAI Whisper → Azure
- **Translation**: DeepL → Claude → OpenAI

---

## 🎬 Video Visual Type → Provider Routing

| Visual Type | Primary | Fallback 1 | Fallback 2 |
|-------------|---------|------------|------------|
| **Cinematic** | Sora2API | ModelsLab | Gemini |
| **Realistic** | Sora2API | ModelsLab | Gemini |
| **Documentary** | Sora2API | Gemini | ModelsLab |
| **Commercial** | Sora2API | ModelsLab | Alibaba |
| **Avatar (Talking Head)** | Alibaba WAN | Azure | - |
| **Lip-Sync** | Alibaba WAN | Azure Visemes | - |
| **Character Animation** | Alibaba WAN | ModelsLab | - |
| **3D Product** | Meshy | ModelsLab | - |
| **3D Character** | Meshy | ModelsLab | - |
| **Kinetic Typography** | Gemini | ModelsLab | - |
| **Infographic** | Gemini | ModelsLab | - |
| **Whiteboard** | Gemini | ModelsLab | - |
| **AnimateDiff** | ModelsLab | Replicate | Alibaba |
| **Stable Video (SVD)** | ModelsLab | Replicate | - |
| **Artistic/Abstract** | ModelsLab | Replicate | - |

---

## 🏗️ Output Format Support

| Output | Primary Provider | Alternatives |
|--------|-----------------|--------------|
| **PPT/Slides** | AI-generated → Browser render | - |
| **Video (MP4)** | Sora2API/ModelsLab | Alibaba, Gemini |
| **Animation (GIF)** | ModelsLab | Replicate |
| **3D (GLTF/USDZ)** | Meshy | ModelsLab |
| **3D (FBX)** | Meshy | - |
| **Audio (MP3)** | ElevenLabs | Azure, OpenAI |
| **Music (MP3)** | ElevenLabs | ModelsLab |
| **VR/AR Ready** | Meshy (USDZ) | - |
| **Interactive** | Browser-based | - |

---

## 💰 Cost Tier Summary

| Tier | Providers | Use Case |
|------|-----------|----------|
| **Premium** | Sora2API, ElevenLabs, Meshy, OpenAI | Production, Enterprise |
| **Standard** | Azure, Gemini, ModelsLab | General use |
| **Budget** | Alibaba, DeepSeek, HuggingFace | High volume, CJK |
| **Free** | Tesseract (OCR), HuggingFace | Fallback only |

---

## ❌ NOT Configured (Excluded from Routing)

| Provider | Reason | Alternative |
|----------|--------|-------------|
| HeyGen | No API Key | Use Alibaba WAN 2.2 for avatars |
| Suno | No API Key | Use ElevenLabs for music |
| RunPod | No API Key | Use ModelsLab/Meshy for GPU tasks |
| AWS | Not required | Use Azure |
| Stability AI | Not required | Use ModelsLab (same models, lower cost) |
| Runway Gen-3 | No API Key | Use Sora2API |
| Pika Labs | No API Key | Use Sora2API/ModelsLab |

---

## 🔧 RunPod GPU Cloud Setup (Future)

**When you DO decide to use RunPod:**

### Recommended Tiers
1. **Community A100** - $0.44/hr (Best for video rendering, 3D)
2. **RTX 4090** - $0.69/hr (Good for real-time inference)
3. **RTX 3090** - $0.44/hr (Budget option for training)

### Docker Requirements
RunPod Serverless requires Docker images. You need:
1. Create Dockerfile with your model/inference code
2. Push to Docker Hub or RunPod Registry
3. Configure in RunPod Console

**Sample Dockerfile for Video Generation:**
```dockerfile
FROM nvidia/cuda:12.1-cudnn8-runtime-ubuntu22.04
RUN pip install torch torchvision diffusers
COPY . /app
CMD ["python", "handler.py"]
```

### Current Recommendation
**Skip RunPod for now** - All GPU tasks are handled by:
- ModelsLab (AnimateDiff, FLUX, SVD)
- Meshy (3D generation)
- Sora2API (Video generation)
- Replicate (Fallback)

These API providers abstract GPU infrastructure with pay-per-use pricing.

---

## ✅ Verification Checklist

- [x] 15 providers with API keys configured
- [x] Deepgram as PRIMARY STT (<100ms)
- [x] Sora2API as PRIMARY video (cinematic)
- [x] Alibaba WAN 2.2 as PRIMARY avatar/lip-sync
- [x] Meshy as PRIMARY 3D
- [x] ElevenLabs as PRIMARY TTS + Music
- [x] 7-zone regional routing configured
- [x] HeyGen, Suno, RunPod EXCLUDED (no keys)
- [ ] RunPod Docker setup (DEFERRED)
