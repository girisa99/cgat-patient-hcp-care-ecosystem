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
| 6 | **Alibaba** | `ALIBABA_API_KEY` | ✅ | LLM, TTS (CosyVoice), STT (Paraformer), **PRIMARY Avatar/Lip-Sync**, Video, Image |
| 7 | **Azure** | `AZURE_SPEECH_KEY` | ✅ | TTS (Neural, Visemes), STT, OCR, Translation |
| 8 | **DeepL** | `DEEPL_API_KEY` | ✅ | **PRIMARY Translation** (European) |
| 9 | **ElevenLabs** | `ELEVENLABS_API_KEY` | ✅ | **PRIMARY TTS**, Voice Clone, **PRIMARY Music**, SFX |
| 10 | **Sora2API** | `SORA2API_KEY` | ✅ | **PRIMARY Video** (Cinematic, Realistic) |
| 11 | **ModelsLab** | `MODELSLAB_API_KEY` | ✅ | **PRIMARY Image** (FLUX), AnimateDiff, SVD, 3D |
| 12 | **Meshy** | `MESHY_API_KEY` | ✅ | **PRIMARY 3D** (PBR textures, rigging, USDZ) |
| 13 | **Replicate** | `REPLICATE_API_TOKEN` | ✅ | Image, Video, 3D (fallback), TripoSR |
| 14 | **Google Cloud** | `GOOGLE_API_KEY` | ✅ | TTS (WaveNet), STT, Translation, Vision |
| 15 | **HuggingFace** | `HUGGING_FACE_ACCESS_TOKEN` | ✅ | Open models, LLM fallback, Image fallback |

---

## 📊 Complete Capability → Provider Routing Matrix (ALL Providers with Fallbacks)

### 🧠 LLM (Large Language Model)

| Region | P1 (Primary) | P2 (Fallback 1) | P3 (Fallback 2) | P4 (Fallback 3) | P5+ (Budget) |
|--------|--------------|-----------------|-----------------|-----------------|--------------|
| **Global Default** | Gemini | OpenAI | Claude | DeepSeek | Alibaba, HuggingFace |
| **Western/EU** | Claude | OpenAI | Gemini | DeepSeek | HuggingFace |
| **CJK (China/Japan/Korea)** | Alibaba Qwen | DeepSeek | Gemini | OpenAI | HuggingFace |
| **India/SEA** | Gemini | OpenAI | Claude | Alibaba | DeepSeek |
| **MENA/Arabic** | Claude | OpenAI | Gemini | DeepSeek | Alibaba |
| **LATAM** | OpenAI | Claude | Gemini | DeepSeek | Alibaba |
| **Africa** | Gemini | OpenAI | Claude | DeepSeek | Alibaba |

---

### 🌍 Translation

| Region | P1 (Primary) | P2 (Fallback 1) | P3 (Fallback 2) | P4 (Fallback 3) | P5+ (Budget) |
|--------|--------------|-----------------|-----------------|-----------------|--------------|
| **Global Default** | DeepL | Azure | Claude | Google | OpenAI, DeepSeek |
| **Western/EU** | DeepL | Claude | Azure | Google | OpenAI |
| **CJK (China/Japan/Korea)** | Alibaba | DeepSeek | DeepL | Azure | Google |
| **India/SEA** | Google | Azure | DeepL | Gemini | Claude |
| **MENA/Arabic** | Azure | Google | DeepL | Claude | OpenAI |
| **LATAM** | DeepL | Azure | Google | Claude | OpenAI |
| **Africa** | Google | Azure | DeepL | Claude | OpenAI |

---

### 🔤 OCR (Document/Image Text Extraction)

| Region | P1 (Primary) | P2 (Fallback 1) | P3 (Fallback 2) | P4 (Fallback 3) | P5+ |
|--------|--------------|-----------------|-----------------|-----------------|-----|
| **Global Default** | Azure Form Recognizer | Gemini | Google Vision | Alibaba Qwen-VL | DeepSeek-VL |
| **Western/EU** | Azure Form Recognizer | Gemini | Google Vision | Claude | OpenAI |
| **CJK (China/Japan/Korea)** | Alibaba Qwen-VL | DeepSeek-VL | Azure | Gemini | Google |
| **India/SEA** | Gemini | Azure | Google | Alibaba | DeepSeek |
| **MENA/Arabic** | Azure | Gemini | Google | Claude | Alibaba |
| **LATAM** | Azure | Gemini | Google | Claude | Alibaba |
| **Africa** | Google | Azure | Gemini | Claude | Alibaba |

---

### 🎤 TTS (Text-to-Speech)

| Region | P1 (Primary) | P2 (Fallback 1) | P3 (Fallback 2) | P4 (Fallback 3) | P5+ |
|--------|--------------|-----------------|-----------------|-----------------|-----|
| **Global Default** | ElevenLabs | Azure Neural | OpenAI | Google WaveNet | Alibaba CosyVoice, ModelsLab |
| **Western/EU** | ElevenLabs | Azure Neural | OpenAI | Google | ModelsLab |
| **CJK (China/Japan/Korea)** | Alibaba CosyVoice | Azure Neural | ElevenLabs | Google | OpenAI |
| **India/SEA** | Google WaveNet | Azure Neural | ElevenLabs | Alibaba | OpenAI |
| **MENA/Arabic** | Azure Neural | ElevenLabs | Google | Alibaba | OpenAI |
| **LATAM** | ElevenLabs | Azure Neural | Google | OpenAI | ModelsLab |
| **Africa** | Google WaveNet | Azure Neural | ElevenLabs | OpenAI | Alibaba |

---

### 🎧 STT (Speech-to-Text)

| Region | P1 (Primary) | P2 (Fallback 1) | P3 (Fallback 2) | P4 (Fallback 3) | P5+ |
|--------|--------------|-----------------|-----------------|-----------------|-----|
| **Global Default** | **Deepgram** (<100ms) | OpenAI Whisper | Azure Speech | Google STT | Alibaba Paraformer |
| **Western/EU** | **Deepgram** | OpenAI Whisper | Azure | Google | Alibaba |
| **CJK (China/Japan/Korea)** | Alibaba Paraformer | **Deepgram** | Azure | Google | OpenAI Whisper |
| **India/SEA** | **Deepgram** | Google STT | Azure | OpenAI Whisper | Alibaba |
| **MENA/Arabic** | **Deepgram** | Azure | Google | OpenAI Whisper | Alibaba |
| **LATAM** | **Deepgram** | OpenAI Whisper | Azure | Google | Alibaba |
| **Africa** | **Deepgram** | Google STT | Azure | OpenAI Whisper | Alibaba |

---

### 🖼️ Image Generation

| Region | P1 (Primary) | P2 (Fallback 1) | P3 (Fallback 2) | P4 (Fallback 3) | P5+ |
|--------|--------------|-----------------|-----------------|-----------------|-----|
| **Global Default** | ModelsLab FLUX | Gemini | OpenAI DALL-E 3 | Replicate | Alibaba Wanx, HuggingFace, Meshy |
| **Western/EU** | ModelsLab FLUX | Gemini | OpenAI DALL-E 3 | Replicate | HuggingFace |
| **CJK (China/Japan/Korea)** | Alibaba Wanx | ModelsLab | Gemini | DeepSeek | Replicate, HuggingFace |
| **India/SEA** | Gemini | ModelsLab | OpenAI | Replicate | Alibaba |
| **MENA/Arabic** | ModelsLab FLUX | Gemini | OpenAI | Replicate | Alibaba |
| **LATAM** | ModelsLab FLUX | Gemini | OpenAI | Replicate | Alibaba |
| **Africa** | Gemini | ModelsLab | Replicate | OpenAI | Alibaba |

---

### 🎬 Video Generation

| Visual Type | P1 (Primary) | P2 (Fallback 1) | P3 (Fallback 2) | P4 (Fallback 3) | P5+ |
|-------------|--------------|-----------------|-----------------|-----------------|-----|
| **Cinematic/Realistic** | **Sora2API** | ModelsLab | Gemini Veo | Replicate | Alibaba |
| **Documentary** | **Sora2API** | Gemini Veo | ModelsLab | Replicate | Alibaba |
| **Commercial** | **Sora2API** | ModelsLab | Gemini | Alibaba | Replicate |
| **AnimateDiff** | ModelsLab | Alibaba | Replicate | DeepSeek | Azure |
| **SVD (Stable Video)** | ModelsLab | Alibaba | Replicate | Google | DeepSeek |
| **Avatar (Talking Head)** | **Alibaba WAN 2.2** | Azure Visemes | ModelsLab | DeepSeek | - |
| **Lip-Sync** | **Alibaba WAN 2.2** | Azure Visemes | ModelsLab | - | - |
| **Character Animation** | **Alibaba WAN 2.2** | ModelsLab | Replicate | DeepSeek | - |
| **Kinetic Typography** | Gemini | ModelsLab | Replicate | Alibaba | - |
| **Infographic** | Gemini | ModelsLab | Replicate | Alibaba | - |
| **Whiteboard** | Gemini | ModelsLab | Replicate | Alibaba | - |
| **Artistic/Abstract** | ModelsLab | Replicate | Alibaba | Gemini | - |

#### Video by Region

| Region | P1 (Primary) | P2 (Fallback 1) | P3 (Fallback 2) | P4 (Fallback 3) |
|--------|--------------|-----------------|-----------------|-----------------|
| **Global Default** | Sora2API | ModelsLab | Gemini Veo | Replicate, Alibaba |
| **Western/EU** | Sora2API | ModelsLab | Gemini | Replicate |
| **CJK (China/Japan/Korea)** | Alibaba WAN | Sora2API | ModelsLab | Replicate |
| **India/SEA** | Sora2API | Gemini | ModelsLab | Alibaba |
| **MENA/Arabic** | Sora2API | ModelsLab | Gemini | Alibaba |
| **LATAM** | Sora2API | ModelsLab | Gemini | Replicate |
| **Africa** | Gemini | Sora2API | ModelsLab | Replicate |

---

### 🧊 3D Generation

| Use Case | P1 (Primary) | P2 (Fallback 1) | P3 (Fallback 2) | P4 |
|----------|--------------|-----------------|-----------------|-----|
| **Text-to-3D (General)** | **Meshy** | ModelsLab | Replicate (TripoSR) | Alibaba |
| **Image-to-3D** | **Meshy** | Replicate (TripoSR) | ModelsLab | - |
| **3D Product Spin** | **Meshy** | ModelsLab | Replicate | - |
| **3D Character** | **Meshy** | ModelsLab | Replicate | Alibaba |
| **PBR Textures** | **Meshy** | ModelsLab | - | - |
| **Auto-Rigging** | **Meshy** | - | - | - |
| **VR/AR Ready (USDZ/GLTF)** | **Meshy** | ModelsLab | - | - |

---

### 🎭 Avatar & Lip-Sync

| Type | P1 (Primary) | P2 (Fallback 1) | P3 (Fallback 2) |
|------|--------------|-----------------|-----------------|
| **Talking Head** | **Alibaba WAN 2.2** | Azure Visemes | ModelsLab |
| **Lip-Sync** | **Alibaba WAN 2.2** | Azure Visemes | ModelsLab |
| **Character Animation** | **Alibaba WAN 2.2** | ModelsLab | Replicate |
| **Motion Transfer** | **Alibaba WAN 2.2** | ModelsLab | - |

---

### 🎵 Music Generation

| Type | P1 (Primary) | P2 (Fallback 1) | P3 |
|------|--------------|-----------------|-----|
| **Instrumental** | **ElevenLabs** | ModelsLab | Alibaba |
| **Background Music** | **ElevenLabs** | ModelsLab | Alibaba |
| **Jingles** | **ElevenLabs** | ModelsLab | - |

---

### 🔊 SFX (Sound Effects)

| Type | P1 (Primary) | P2 (Fallback 1) | P3 |
|------|--------------|-----------------|-----|
| **Sound Effects** | **ElevenLabs** | ModelsLab | Azure |
| **Ambient Sounds** | **ElevenLabs** | ModelsLab | Alibaba |
| **Foley** | **ElevenLabs** | ModelsLab | - |

---

### 👁️ Vision (Image Analysis)

| Region | P1 (Primary) | P2 (Fallback 1) | P3 (Fallback 2) | P4 | P5+ |
|--------|--------------|-----------------|-----------------|-----|-----|
| **Global Default** | Gemini | OpenAI GPT-4V | Claude | Google Vision | Alibaba, DeepSeek |
| **CJK (China/Japan/Korea)** | Alibaba Qwen-VL | DeepSeek-VL | Gemini | OpenAI | Claude |
| **All Others** | Gemini | OpenAI | Claude | Google | Alibaba |

---

### 🧪 NLP (Entity Extraction, Sentiment, etc.)

| Region | P1 (Primary) | P2 (Fallback 1) | P3 (Fallback 2) | P4 | P5+ |
|--------|--------------|-----------------|-----------------|-----|-----|
| **Global Default** | Gemini | OpenAI | Claude | Azure Language | DeepSeek, Alibaba |
| **Western/EU** | Claude | OpenAI | Gemini | Azure | DeepSeek |
| **CJK (China/Japan/Korea)** | DeepSeek | Alibaba | Gemini | Claude | OpenAI |
| **All Others** | Gemini | OpenAI | Claude | Azure | Alibaba |

---

### 🥽 VR/AR Ready Output

| Capability | P1 (Primary) | P2 (Fallback 1) | Notes |
|------------|--------------|-----------------|-------|
| **USDZ Export** | **Meshy** | ModelsLab | Apple AR/VR format |
| **GLTF Export** | **Meshy** | ModelsLab | Web/Android VR format |
| **FBX Export** | **Meshy** | - | Game engines (Unity/Unreal) |
| **360° Video** | Sora2API | ModelsLab | Experimental |
| **Interactive 3D** | Browser-based | - | Three.js rendering |

---

### 📊 PPT/Slides Generation

| Type | P1 (Primary) | P2 (Fallback 1) | Notes |
|------|--------------|-----------------|-------|
| **Script Generation** | Gemini | OpenAI | AI content |
| **Slide Layout** | Browser Render | - | React/HTML |
| **Image Assets** | ModelsLab | Gemini | FLUX/Gemini Image |
| **Video Assets** | Sora2API | ModelsLab | Embedded video |
| **3D Assets** | Meshy | ModelsLab | Interactive 3D |
| **Avatar Presenter** | Alibaba WAN | Azure Visemes | Talking head |

---

## 🌍 7-Zone Regional Routing Summary

### Zone 1: Western/EU (Claude Zone)
- **LLM**: Claude → OpenAI → Gemini
- **TTS**: ElevenLabs → Azure → OpenAI
- **STT**: Deepgram → OpenAI Whisper → Azure
- **Translation**: DeepL → Claude → Azure
- **Image**: ModelsLab → Gemini → OpenAI
- **Video**: Sora2API → ModelsLab → Gemini
- **3D**: Meshy → ModelsLab → Replicate

### Zone 2: CJK (Alibaba Zone)
- **LLM**: Alibaba Qwen → DeepSeek → Gemini
- **TTS**: Alibaba CosyVoice → Azure → ElevenLabs
- **STT**: Alibaba Paraformer → Deepgram → Azure
- **Translation**: Alibaba → DeepSeek → DeepL
- **Image**: Alibaba Wanx → ModelsLab → Gemini
- **Video**: Alibaba WAN → Sora2API → ModelsLab
- **Avatar**: Alibaba WAN 2.2 → Azure Visemes
- **3D**: Meshy → ModelsLab → Replicate

### Zone 3: India/SEA (Gemini Zone)
- **LLM**: Gemini → OpenAI → Claude
- **TTS**: Google WaveNet → Azure → ElevenLabs
- **STT**: Deepgram → Google → Azure
- **Translation**: Google → Azure → DeepL
- **Image**: Gemini → ModelsLab → OpenAI
- **Video**: Sora2API → Gemini → ModelsLab
- **3D**: Meshy → ModelsLab → Replicate

### Zone 4: MENA/Arabic (Azure Zone)
- **LLM**: Claude → OpenAI → Gemini
- **TTS**: Azure Neural → ElevenLabs → Google
- **STT**: Deepgram → Azure → Google
- **Translation**: Azure → Google → DeepL
- **Image**: ModelsLab → Gemini → OpenAI
- **Video**: Sora2API → ModelsLab → Gemini
- **3D**: Meshy → ModelsLab → Replicate

### Zone 5: LATAM (ElevenLabs Zone)
- **LLM**: OpenAI → Claude → Gemini
- **TTS**: ElevenLabs → Azure → Google
- **STT**: Deepgram → OpenAI Whisper → Azure
- **Translation**: DeepL → Azure → Google
- **Image**: ModelsLab → Gemini → OpenAI
- **Video**: Sora2API → ModelsLab → Gemini
- **3D**: Meshy → ModelsLab → Replicate

### Zone 6: Africa (Google Zone)
- **LLM**: Gemini → OpenAI → Claude
- **TTS**: Google WaveNet → Azure → ElevenLabs
- **STT**: Deepgram → Google → Azure
- **Translation**: Google → Azure → DeepL
- **Image**: Gemini → ModelsLab → Replicate
- **Video**: Gemini → Sora2API → ModelsLab
- **3D**: Meshy → ModelsLab → Replicate

### Zone 7: Global English (OpenAI Zone)
- **LLM**: OpenAI → Claude → Gemini
- **TTS**: ElevenLabs → OpenAI → Azure
- **STT**: Deepgram → OpenAI Whisper → Azure
- **Translation**: DeepL → Claude → OpenAI
- **Image**: ModelsLab → OpenAI → Gemini
- **Video**: Sora2API → ModelsLab → Gemini
- **3D**: Meshy → ModelsLab → Replicate

---

## 🏗️ Output Format Support

| Output | Primary Provider | Fallback 1 | Fallback 2 |
|--------|-----------------|------------|------------|
| **PPT/Slides** | Browser render | - | - |
| **Video (MP4)** | Sora2API | ModelsLab | Alibaba, Gemini |
| **Animation (GIF)** | ModelsLab | Replicate | - |
| **3D (GLTF/USDZ)** | Meshy | ModelsLab | - |
| **3D (FBX)** | Meshy | - | - |
| **Audio (MP3)** | ElevenLabs | Azure | OpenAI |
| **Music (MP3)** | ElevenLabs | ModelsLab | Alibaba |
| **SFX (MP3)** | ElevenLabs | ModelsLab | Azure |
| **VR/AR Ready** | Meshy (USDZ) | - | - |
| **Interactive** | Browser-based | - | - |

---

## 💰 Cost Tier Summary

| Tier | Providers | Use Case |
|------|-----------|----------|
| **Premium** | Sora2API, ElevenLabs, Meshy, OpenAI DALL-E | Production, Enterprise, High-quality |
| **Standard** | Azure, Gemini, ModelsLab, Replicate | General use, Balanced |
| **Budget** | Alibaba, DeepSeek, HuggingFace | High volume, CJK, Cost-sensitive |
| **Free** | Tesseract (OCR), HuggingFace (limited) | Fallback only |

---

## ❌ NOT Configured (Excluded from Routing)

| Provider | Reason | Alternative |
|----------|--------|-------------|
| HeyGen | No API Key | Use Alibaba WAN 2.2 for avatars |
| Suno | No API Key | Use ElevenLabs for music |
| RunPod | No API Key, requires Docker | Use ModelsLab/Meshy for GPU tasks |
| AWS | Not required | Use Azure |
| Stability AI | Not required | Use ModelsLab (same models, lower cost) |
| Runway Gen-3 | No API Key | Use Sora2API |
| Pika Labs | No API Key | Use Sora2API/ModelsLab |

---

## 🔧 RunPod GPU Cloud Setup (Future)

**When you DO decide to use RunPod:**

### Recommended Tiers
1. **Community A100** - $0.44/hr (Best for video rendering, 3D, high VRAM tasks)
2. **RTX 4090** - $0.69/hr (Good for real-time inference, SDXL)
3. **RTX 3090** - $0.44/hr (Budget option for training, lower VRAM)

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
- [x] Deepgram as PRIMARY STT (<100ms) across all regions
- [x] Sora2API as PRIMARY video (cinematic/realistic)
- [x] Alibaba WAN 2.2 as PRIMARY avatar/lip-sync
- [x] Meshy as PRIMARY 3D (PBR, rigging, USDZ)
- [x] ElevenLabs as PRIMARY TTS + Music + SFX
- [x] ModelsLab as PRIMARY image (FLUX)
- [x] 7-zone regional routing with complete fallbacks
- [x] All capabilities mapped with P1→P2→P3→P4+ chains
- [x] HeyGen, Suno, RunPod EXCLUDED (no keys)
- [ ] RunPod Docker setup (DEFERRED - not needed)
