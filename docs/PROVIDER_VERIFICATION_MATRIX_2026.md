# AI Provider Verification Matrix - February 2026

> **Verification Date:** 2026-02-01  
> **Status:** ✅ 17 Providers Configured (incl. Meshy 3D, Vertex AI Veo)  
> **Geo-Compliance:** ✅ Operational (4-Zone Architecture Active)  
> **Routing Intelligence:** ✅ Operational (13 Intent Categories)

---

## 🌍 COMPLETE 4-ZONE REGIONAL ROUTING MATRIX

### Zone Architecture Overview

| ZONE | REGIONS/COUNTRIES | PRIMARY LLM | PRIMARY TTS | PRIMARY TRANSLATION |
|------|-------------------|-------------|-------------|---------------------|
| **CLAUDE ZONE** | US, UK, EU, Brazil, Israel, South Africa, Russia | Claude 3.5 Sonnet | ElevenLabs | DeepL |
| **ALIBABA ZONE** | Japan, Korea, China, HK, Taiwan, MEA (Arabic) | Qwen-Max | Qwen3-TTS | Qwen-MT |
| **GEMINI ZONE** | India, Pakistan, SEA, Africa | Gemini Pro | Azure Neural | Google Translate |
| **FALLBACK ZONE** | When primary fails globally | GPT-4o | OpenAI TTS | Azure Translator |

---

## 📊 LLM ROUTING BY ZONE (Detailed)

### Claude Zone (Western Markets)

| Language | Code | Primary LLM | Fallback | Quality |
|----------|------|-------------|----------|---------|
| English (US) | en-US | claude-3-5-sonnet | gpt-4o | ⭐⭐⭐⭐⭐ |
| English (UK) | en-GB | claude-3-5-sonnet | gpt-4o | ⭐⭐⭐⭐⭐ |
| German | de | claude-3-5-sonnet | gpt-4o | ⭐⭐⭐⭐⭐ |
| French | fr | claude-3-5-sonnet | gpt-4o | ⭐⭐⭐⭐⭐ |
| Spanish | es | claude-3-5-sonnet | gpt-4o | ⭐⭐⭐⭐⭐ |
| Italian | it | claude-3-5-sonnet | gpt-4o | ⭐⭐⭐⭐⭐ |
| Portuguese (BR) | pt-BR | claude-3-5-sonnet | gpt-4o | ⭐⭐⭐⭐⭐ |
| Portuguese (PT) | pt-PT | claude-3-5-sonnet | gpt-4o | ⭐⭐⭐⭐⭐ |
| Dutch | nl | claude-3-5-sonnet | gpt-4o | ⭐⭐⭐⭐⭐ |
| Polish | pl | claude-3-5-sonnet | gpt-4o | ⭐⭐⭐⭐⭐ |
| Russian | ru | claude-3-5-sonnet | gpt-4o | ⭐⭐⭐⭐⭐ |
| Hebrew | he | claude-3-5-sonnet | gpt-4o | ⭐⭐⭐⭐ |

### Alibaba Zone (CJK + Arabic)

| Language | Code | Primary LLM | Fallback | Quality | Notes |
|----------|------|-------------|----------|---------|-------|
| Japanese | ja | qwen-max | gpt-4o | ⭐⭐⭐⭐⭐ | Native CJK |
| Korean | ko | qwen-max | gpt-4o | ⭐⭐⭐⭐⭐ | Native CJK |
| Chinese (Simplified) | zh-CN | qwen-max | gpt-4o | ⭐⭐⭐⭐⭐ | Native CJK |
| Chinese (Traditional) | zh-TW | qwen-max | gpt-4o | ⭐⭐⭐⭐⭐ | Native CJK |
| Chinese (HK) | zh-HK | qwen-max | gpt-4o | ⭐⭐⭐⭐⭐ | Cantonese |
| Arabic (MSA) | ar | qwen-max | gpt-4o | ⭐⭐⭐⭐⭐ | **7 dialects - MOAT** |
| Arabic (Egyptian) | ar-EG | qwen-max | gpt-4o | ⭐⭐⭐⭐⭐ | Egyptian dialect |
| Arabic (Saudi) | ar-SA | qwen-max | gpt-4o | ⭐⭐⭐⭐⭐ | Gulf dialect |
| Arabic (UAE) | ar-AE | qwen-max | gpt-4o | ⭐⭐⭐⭐⭐ | Gulf dialect |
| Arabic (Moroccan) | ar-MA | qwen-max | gpt-4o | ⭐⭐⭐⭐ | Maghrebi dialect |
| Arabic (Iraqi) | ar-IQ | qwen-max | gpt-4o | ⭐⭐⭐⭐ | Mesopotamian dialect |

### Gemini Zone (India/SEA/Africa)

| Language | Code | Primary LLM | Fallback | Quality | Notes |
|----------|------|-------------|----------|---------|-------|
| Hindi | hi | gemini-pro | gpt-4o | ⭐⭐⭐⭐⭐ | **22 Indian languages - MOAT** |
| Bengali | bn | gemini-pro | gpt-4o | ⭐⭐⭐⭐⭐ | 2nd most spoken in India |
| Telugu | te | gemini-pro | gpt-4o | ⭐⭐⭐⭐⭐ | South India |
| Tamil | ta | gemini-pro | gpt-4o | ⭐⭐⭐⭐⭐ | South India |
| Marathi | mr | gemini-pro | gpt-4o | ⭐⭐⭐⭐ | Maharashtra |
| Gujarati | gu | gemini-pro | gpt-4o | ⭐⭐⭐⭐ | Gujarat |
| Kannada | kn | gemini-pro | gpt-4o | ⭐⭐⭐⭐ | Karnataka |
| Malayalam | ml | gemini-pro | gpt-4o | ⭐⭐⭐⭐ | Kerala |
| Punjabi | pa | gemini-pro | gpt-4o | ⭐⭐⭐⭐ | Punjab |
| Urdu | ur | gemini-pro | gpt-4o | ⭐⭐⭐⭐ | Pakistan/India |
| Indonesian | id | gemini-pro | gpt-4o | ⭐⭐⭐⭐ | SEA |
| Vietnamese | vi | gemini-pro | gpt-4o | ⭐⭐⭐⭐ | SEA |
| Thai | th | gemini-pro | gpt-4o | ⭐⭐⭐⭐ | SEA |
| Filipino | fil | gemini-pro | gpt-4o | ⭐⭐⭐⭐ | SEA |
| Malay | ms | gemini-pro | gpt-4o | ⭐⭐⭐⭐ | SEA |
| Swahili | sw | gemini-pro | gpt-4o | ⭐⭐⭐⭐⭐ | **African FIRST MOVER** |
| Yoruba | yo | gemini-pro | gpt-4o | ⭐⭐⭐⭐ | Nigeria |
| Hausa | ha | gemini-pro | gpt-4o | ⭐⭐⭐ | Nigeria |
| Igbo | ig | gemini-pro | gpt-4o | ⭐⭐⭐ | Nigeria |
| Amharic | am | gemini-pro | gpt-4o | ⭐⭐⭐⭐ | Ethiopia |
| Zulu | zu | gemini-pro | gpt-4o | ⭐⭐⭐⭐ | South Africa |

---

## 🎤 TTS ROUTING BY ZONE (Detailed)

### Claude Zone TTS

| Language | Primary TTS | Fallback | Quality | Provider Notes |
|----------|-------------|----------|---------|----------------|
| English (US/UK/AU) | elevenlabs | openai-tts | ⭐⭐⭐⭐⭐ | Premium voices |
| German | elevenlabs | azure-neural | ⭐⭐⭐⭐⭐ | Natural European |
| French | elevenlabs | azure-neural | ⭐⭐⭐⭐⭐ | Natural European |
| Spanish | elevenlabs | azure-neural | ⭐⭐⭐⭐⭐ | ES + MX variants |
| Italian | elevenlabs | azure-neural | ⭐⭐⭐⭐⭐ | Natural European |
| Portuguese (BR/PT) | elevenlabs | azure-neural | ⭐⭐⭐⭐⭐ | Both variants |
| Dutch | elevenlabs | azure-neural | ⭐⭐⭐⭐⭐ | Netherlands |
| Polish | elevenlabs | azure-neural | ⭐⭐⭐⭐⭐ | Eastern European |
| Russian | elevenlabs | azure-neural | ⭐⭐⭐⭐⭐ | Slavic |

### Alibaba Zone TTS

| Language | Primary TTS | Fallback | Quality | Provider Notes |
|----------|-------------|----------|---------|----------------|
| Japanese | alibaba-qwen3-tts | azure-neural | ⭐⭐⭐⭐⭐ | Native CJK prosody |
| Korean | alibaba-qwen3-tts | azure-neural | ⭐⭐⭐⭐⭐ | Native CJK prosody |
| Chinese (CN/TW) | alibaba-qwen3-tts | azure-neural | ⭐⭐⭐⭐⭐ | Native Mandarin |
| Chinese (HK) | azure-neural | google-tts | ⭐⭐⭐⭐ | Cantonese support |
| Arabic (all 7 dialects) | azure-neural | google-tts | ⭐⭐⭐⭐⭐ | **MOAT: 7 dialects** |

### Gemini Zone TTS (India/SEA/Africa) - **Azure Neural PRIMARY** (Visemes Support)

| Language | Primary TTS | Fallback | Quality | Reason |
|----------|-------------|----------|---------|--------|
| **Hindi/Bengali/Telugu/Tamil** | azure-neural | google-tts | ⭐⭐⭐⭐⭐ | Azure Visemes for lip-sync |
| **Marathi/Gujarati/Kannada/Malayalam** | azure-neural | google-tts | ⭐⭐⭐⭐ | Azure Neural Indic voices |
| **Punjabi/Odia/Assamese** | azure-neural | google-tts | ⭐⭐⭐⭐ | Azure coverage |
| **Vietnamese/Thai** | azure-neural | google-tts | ⭐⭐⭐⭐ | SEA - Azure Visemes |
| **Indonesian/Malay/Filipino** | azure-neural | google-tts | ⭐⭐⭐⭐ | SEA - Azure Visemes |
| **Swahili** | azure-neural | google-tts | ⭐⭐⭐⭐⭐ | African FIRST MOVER |
| **Yoruba/Hausa/Igbo/Amharic** | azure-neural | google-tts | ⭐⭐⭐⭐ | African coverage |
| **Zulu/Xhosa/Afrikaans** | azure-neural | google-tts | ⭐⭐⭐⭐ | South Africa |

> **Why Azure Neural for Gemini Zone?** Google AI Studio keys (GEMINI_API_KEY) are incompatible with Google Cloud TTS. Azure Neural provides Visemes for avatar lip-sync and superior dialect support.

---

## 🌐 TRANSLATION ROUTING BY ZONE

| Zone | Languages | Primary | Fallback 1 | Fallback 2 |
|------|-----------|---------|------------|------------|
| **Claude** | European (DE/FR/ES/IT/PT/NL/PL/RU) | DeepL | Azure Translator | Google |
| **Claude** | English | DeepL | Google Translate | - |
| **Alibaba** | Japanese/Korean | Qwen-MT | DeepL | Google |
| **Alibaba** | Chinese (CN/TW) | Qwen-MT | Google Translate | - |
| **Alibaba** | Arabic (all) | Azure Translator | Google Translate | - |
| **Gemini** | Indian Languages | Google Translate | Azure Translator | - |
| **Gemini** | SEA Languages | Google Translate | Azure Translator | - |
| **Gemini** | African Languages | Google Translate | NLLB | - |

---

## 🎙️ STT ROUTING BY ZONE

| Zone | Languages | Primary | Fallback | Real-time |
|------|-----------|---------|----------|-----------|
| **Claude** | English | elevenlabs-scribe | whisper | Deepgram (<100ms) |
| **Claude** | European | whisper | azure-stt | Deepgram |
| **Alibaba** | CJK | alibaba-paraformer | whisper | Deepgram |
| **Alibaba** | Arabic | whisper | azure-stt | Deepgram |
| **Gemini** | Indian | whisper | azure-stt | Deepgram |
| **Gemini** | African | whisper | google-stt | Deepgram |

> **Deepgram is PRIMARY for all real-time STT** across all zones (<100ms latency).

---

## 🎬 VIDEO GENERATION - Cascade Routing

| Priority | Provider | Capabilities | Quality |
|----------|----------|--------------|---------|
| **P1** | Sora2API | Cinematic, Commercial, Documentary, Film | ⭐⭐⭐⭐⭐ |
| **P2** | Vertex AI Veo 2/3 | High-fidelity, Premium Video | ⭐⭐⭐⭐⭐ |
| **P3** | ModelsLab | AnimateDiff, SVD, Animation | ⭐⭐⭐⭐ |
| **P4** | Alibaba WAN 2.6 | Video generation (International) | ⭐⭐⭐⭐ |
| **P5** | Replicate | Open-source fallback | ⭐⭐⭐ |

---

## 🎨 IMAGE GENERATION - Cascade Routing

| Priority | Provider | Models | Quality |
|----------|----------|--------|---------|
| **P1** | ModelsLab | FLUX Pro, FLUX Schnell, SDXL | ⭐⭐⭐⭐⭐ |
| **P2** | Vertex AI | Imagen 3 | ⭐⭐⭐⭐⭐ |
| **P3** | OpenAI | DALL-E 3 | ⭐⭐⭐⭐ |
| **P4** | Replicate | Open-source models | ⭐⭐⭐ |

---

## 🧊 3D GENERATION - Meshy AI (GLOBAL)

> **Meshy AI is the PRIMARY 3D provider globally** - NOT zone-based.

| Capability | Provider | Fallback | Output Formats | Quality |
|------------|----------|----------|----------------|---------|
| **Text-to-3D** | Meshy AI | Replicate TripoSR | GLTF, USDZ, FBX, OBJ | ⭐⭐⭐⭐⭐ |
| **Image-to-3D** | Meshy AI | Replicate TripoSR | GLTF, USDZ, FBX | ⭐⭐⭐⭐⭐ |
| **Text-to-Texture** | Meshy AI | - | PBR Maps | ⭐⭐⭐⭐⭐ |
| **3D Rigging** | Meshy AI | - | Animated GLTF | ⭐⭐⭐⭐⭐ |
| **Product 360°** | Meshy AI | ModelsLab | Turntable Video | ⭐⭐⭐⭐ |
| **Character Model** | Meshy AI | Alibaba | Rigged Character | ⭐⭐⭐⭐⭐ |

---

## 🥽 VR/AR GENERATION - Multi-Provider Matrix

> **VR/AR uses Meshy + Alibaba + ModelsLab depending on capability**

### 3D/VR/AR Provider Hierarchy

| Capability | Primary | Secondary | Tertiary | Output Formats |
|------------|---------|-----------|----------|----------------|
| **Text-to-3D** | Meshy AI | Alibaba MACH | Replicate | GLTF, USDZ, FBX |
| **Image-to-3D** | Meshy AI | Alibaba Richdreamer | Replicate TripoSR | GLTF, USDZ |
| **3D Texturing** | Meshy AI | - | - | PBR Maps |
| **3D Rigging** | Meshy AI | Alibaba Animate3D | - | Animated GLTF/FBX |
| **AR Object** | Meshy AI | Alibaba TaoAvatar | Replicate | USDZ (iOS), GLTF |
| **VR Scene** | Meshy + ModelsLab | Alibaba Animate3D | - | GLTF Scene |
| **3D Avatar** | Alibaba TaoAvatar | Alibaba MACH | Meshy | GLB, 3DGS |
| **Photo-to-3D Character** | Alibaba 3D Animate Hub | Meshy | - | MP4, GIF |

### Alibaba 3D/VR Models (Global)

| Model | Type | Capabilities | Tier |
|-------|------|--------------|------|
| **TaoAvatar** | 3D (3DGS) | 90 FPS, AR, Apple Vision Pro, Full-body | Enterprise |
| **MACH** | Text-to-3D | Text-to-3D avatar, Virtual humans | Standard |
| **Richdreamer** | Image-to-3D | 2D-to-3D, Normal-depth diffusion | Premium |
| **Animate3D** | Animation | Static 3D → animated, VR scenes, Gaming | Premium |
| **3D Animate Hub** | Photo-to-3D | Social media, Character animation | Standard |
| **OmniAvatar** | Real-time Avatar | Audio-driven, Live streaming | Enterprise |
| **Wan2.2-Animate** | Video | Character replacement, Motion transfer | Premium |

### VR/AR Pipeline Routing

| Pipeline | Primary Provider | Fallback | Use Case |
|----------|-----------------|----------|----------|
| `text-to-vr` | Meshy AI | Alibaba MACH | VR Environment from text |
| `text-to-ar` | Meshy AI | Alibaba TaoAvatar | AR Object from text |
| `3d-to-vr` | Meshy + ModelsLab | Alibaba Animate3D | 3D Model to VR Scene |
| `3d-to-ar` | Meshy AI | Replicate | 3D Model to AR |
| `scene-to-vr` | Meshy + Sora2API | ModelsLab | 360° VR Scene |
| `scene-to-ar` | Meshy AI | Alibaba | AR Scene |
| `immersive-training` | Meshy + Sora2API | ModelsLab | 360° + 3D Training |
| `spatial-presentation` | Meshy + ModelsLab | - | VR Presentation |
| `photo-to-3d-avatar` | Alibaba 3D Animate Hub | Meshy | Photo → 3D Character |
| `text-to-3d-avatar` | Alibaba MACH | Meshy | Text → 3D Avatar |
| `3d-avatar-ar` | Alibaba TaoAvatar | Meshy | 3D Avatar for AR |

---

## 🧑‍🎤 AVATAR GENERATION - Global Routing (NOT Zone-Based)

> **Avatar features use Alibaba globally for best-in-class quality**

| Feature | Primary | Fallback | Global? | Tier Required |
|---------|---------|----------|---------|---------------|
| **Custom Avatar (S2V)** | Alibaba WAN 2.2 | Replicate | ✅ GLOBAL | Pro+ |
| **Full-body Avatar** | Alibaba OmniAvatar | NONE | ✅ GLOBAL | Enterprise |
| **Avatar Lip-Sync** | Alibaba WAN 2.2 | Azure Visemes | ✅ GLOBAL | Creator+ |
| **Priority Rendering** | RunPod | Replicate | ✅ GLOBAL | Pro+ |
| **Text-to-Avatar** | Alibaba MACH | Replicate | ✅ GLOBAL | Pro+ |
| **TaoAvatar (3DGS)** | Alibaba TaoAvatar | - | ✅ GLOBAL | Enterprise |

---

## 🎵 AUDIO GENERATION BY ZONE

| Capability | Claude Zone | Alibaba Zone | Gemini Zone | Fallback |
|------------|-------------|--------------|-------------|----------|
| **Music Gen** | ElevenLabs | ElevenLabs | ElevenLabs | ModelsLab |
| **SFX Gen** | ElevenLabs | ElevenLabs | ElevenLabs | ModelsLab |
| **Voice Clone** | ElevenLabs | Qwen3-TTS | ElevenLabs | - |

---

## Provider Status Summary

### TIER 1: Primary Providers (11)

| Provider | Status | Primary Capabilities | Zone |
|----------|--------|---------------------|------|
| **OpenAI** | ✅ | LLM, TTS, STT, Image, Vision | Fallback |
| **Claude** | ✅ | LLM, Translation, Vision | Claude Zone |
| **Gemini** | ✅ | LLM, TTS, STT, Image, Vision | Gemini Zone |
| **Vertex AI (Veo)** | ✅ | Video (Veo 2/3), Image (Imagen 3) | Global |
| **DeepSeek** | ✅ | LLM, Vision, OCR | CJK Fallback |
| **Alibaba** | ✅ | LLM, TTS, STT, Video, Avatar | Alibaba Zone |
| **Deepgram** | ✅ | Realtime STT (<100ms) | **ALL ZONES** |
| **Sora2API** | ✅ | Cinematic Video | Global |
| **ElevenLabs** | ✅ | TTS, Voice Clone, Music, SFX | Claude Zone |
| **DeepL** | ✅ | Translation | Claude Zone |
| **Meshy** | ✅ | 3D Gen, VR/AR, Rigging | **GLOBAL** |

### TIER 2: Specialized Providers (6)

| Provider | Status | Primary Capabilities | Use Case |
|----------|--------|---------------------|----------|
| **Azure** | ✅ | Neural TTS, STT, OCR, Visemes | Gemini/MENA Zone |
| **Google** | ✅ | TTS, STT, Translation, Vision | Gemini Fallback |
| **ModelsLab** | ✅ | FLUX Image, AnimateDiff | Global Image/Video |
| **Replicate** | ✅ | Open-source models | Universal Fallback |
| **HuggingFace** | ✅ | LLM, NLP | Open-source Fallback |
| **Stripe** | ✅ | Payments, Subscriptions | Global |

---

## API Key Configuration (17+ Providers)

| Secret Name | Status | Provider |
|-------------|--------|----------|
| `OPENAI_API_KEY` | ✅ | OpenAI |
| `ANTHROPIC_API_KEY` | ✅ | Claude |
| `GEMINI_API_KEY` | ✅ | Gemini |
| `GOOGLE_VERTEX_SERVICE_ACCOUNT` | ✅ | Vertex AI (Veo/Imagen) |
| `DEEPSEEK_API_KEY` | ✅ | DeepSeek |
| `ALIBABA_API_KEY` | ✅ | Alibaba (International) |
| `ALIBABA_CHINA_API_KEY` | ✅ | Alibaba (China/Beijing) |
| `DEEPGRAM_API_KEY` | ✅ | Deepgram |
| `SORA2API_KEY` | ✅ | Sora2API |
| `ELEVENLABS_API_KEY` | ✅ | ElevenLabs |
| `DEEPL_API_KEY` | ✅ | DeepL |
| `AZURE_SPEECH_KEY` | ✅ | Azure Speech |
| `AZURE_FORM_RECOGNIZER_KEY` | ✅ | Azure Document Intelligence |
| `MICROSOFT_TRANSLATE_API_KEY` | ✅ | Azure Translator |
| `MODELSLAB_API_KEY` | ✅ | ModelsLab |
| `MESHY_API_KEY` | ✅ | Meshy AI |
| `REPLICATE_API_TOKEN` | ✅ | Replicate |
| `HUGGING_FACE_ACCESS_TOKEN` | ✅ | HuggingFace |
| `GOOGLE_API_KEY` | ✅ | Google Cloud |

---

## Routing Intelligence Components

| Component | Location | Status |
|-----------|----------|--------|
| `AIRoutingIntelligenceService.ts` | `src/services/ai/` | ✅ Active |
| `unifiedProviderRoutingAdapter.ts` | `src/services/` | ✅ Active |
| `multiLanguageAudioOrchestrator.ts` | `src/services/` | ✅ Active |
| `globalTierService.ts` | `src/services/shared/` | ✅ Active |
| `check-ai-provider` | Edge Function | ✅ Operational |
| `geo-compliance-check` | Edge Function | ✅ Operational |

---

## Known Issues & Activation Status

| Provider | Issue | Status | Action |
|----------|-------|--------|--------|
| Alibaba China (TTS) | Legacy CosyVoice required WebSocket (incompatible with Deno); replaced by Qwen3-TTS | ✅ Resolved | Qwen3-TTS (qwen3-tts-flash) via DashScope REST API; Azure Neural as fallback |
| Alibaba China (TTS) | Sambert models need DashScope console activation | ⏳ Pending | Account rep activation in progress |
| Alibaba China (Avatar) | Wan 2.2, OmniAvatar, TaoAvatar, MACH need activation | ⏳ Pending | Account rep activation in progress |
| Alibaba China (3D) | Richdreamer needs activation | ⏳ Pending | Account rep activation in progress |
| Alibaba China (Audio) | FunAudio needs activation | ⏳ Pending | Account rep activation in progress |
| Alibaba International | DashScope console unavailable on alibabacloud.com | ℹ️ Known | Must use aliyun.com (China) portal for activation |
| ModelsLab | Requires `type` parameter | ✅ Fixed | Working with proper format |

### Alibaba Account Verification Status (February 2026)

| Item | Status |
|------|--------|
| **Account Verification** | ✅ Complete (both International + China) |
| **API Keys Configured** | ✅ `ALIBABA_API_KEY` (International) + `ALIBABA_CHINA_API_KEY` (China) |
| **Dual-Key Routing** | ✅ All edge functions updated with smart endpoint routing |
| **Rep Approval** | ⏳ Pending — verification done, awaiting service activation |
| **Models Awaiting Activation** | Sambert TTS, Wan 2.2, OmniAvatar, TaoAvatar, MACH, Richdreamer, FunAudio |
| **Models Working Now** | Qwen LLM, Paraformer STT, Wanx Images, Wan 2.6 (International) |

### Qwen3-TTS Migration (Complete)

Legacy CosyVoice TTS has been fully replaced by **Qwen3-TTS** (model: `qwen3-tts-flash`) which uses the native DashScope REST API, resolving all WebSocket incompatibilities with Supabase Edge Functions. Qwen3-TTS is the primary CJK TTS provider via the Singapore endpoint, with Azure Neural as the global fallback.

### Interim TTS Routing (Until Alibaba Activation)

| Zone | Primary TTS | Secondary | Notes |
|------|-------------|-----------|-------|
| **CJK** | Azure Neural | Google TTS | Interim until Sambert activated |
| **MENA/RTL** | Azure Neural | Google TTS | Production (7 Arabic dialects) |
| **Western/EU** | ElevenLabs | Azure Neural | Production |
| **India/SEA/Africa** | Azure Neural | Google TTS | Production |

---

**Last Updated:** 2026-02-07  
**Next Verification:** 2026-02-14
