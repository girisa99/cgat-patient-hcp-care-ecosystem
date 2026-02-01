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
| **ALIBABA ZONE** | Japan, Korea, China, HK, Taiwan, MEA (Arabic) | Qwen-Max | CosyVoice | Qwen-MT |
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
| Japanese | alibaba-cosyvoice | azure-neural | ⭐⭐⭐⭐⭐ | Native CJK prosody |
| Korean | alibaba-cosyvoice | azure-neural | ⭐⭐⭐⭐⭐ | Native CJK prosody |
| Chinese (CN/TW) | alibaba-cosyvoice | azure-neural | ⭐⭐⭐⭐⭐ | Native Mandarin |
| Chinese (HK) | azure-neural | google-tts | ⭐⭐⭐⭐ | Cantonese support |
| Arabic (all 7 dialects) | azure-neural | google-tts | ⭐⭐⭐⭐⭐ | **MOAT: 7 dialects** |

### Gemini Zone TTS

| Language | Primary TTS | Fallback | Quality | Provider Notes |
|----------|-------------|----------|---------|----------------|
| Hindi/Bengali/Telugu/Tamil | azure-neural | google-tts | ⭐⭐⭐⭐⭐ | Indian languages |
| All other Indic (22 total) | azure-neural | google-tts | ⭐⭐⭐⭐ | Complete coverage |
| SEA Languages (ID/VI/TH/FIL/MS) | azure-neural | google-tts | ⭐⭐⭐⭐ | SEA coverage |
| Swahili | azure-neural | google-tts | ⭐⭐⭐⭐⭐ | African FIRST MOVER |
| Other African | azure-neural | google-tts | ⭐⭐⭐⭐ | YO/HA/IG/ZU/AM |

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

## 🥽 VR/AR GENERATION - Global Routing

> **VR/AR uses Meshy + complementary providers globally**

| Pipeline | Primary | Secondary | Output | Quality |
|----------|---------|-----------|--------|---------|
| **text-to-vr** | Meshy AI | Alibaba 3D | VR Scene (GLTF) | ⭐⭐⭐⭐ |
| **text-to-ar** | Meshy AI | Replicate | AR Model (USDZ/GLTF) | ⭐⭐⭐⭐ |
| **3d-to-vr** | Meshy AI | ModelsLab | VR Environment | ⭐⭐⭐⭐ |
| **3d-to-ar** | Meshy AI | Replicate | AR Object | ⭐⭐⭐⭐ |
| **scene-to-vr** | Meshy + Sora2API | ModelsLab | 360° VR Scene | ⭐⭐⭐⭐ |
| **scene-to-ar** | Meshy AI | Replicate | AR Scene | ⭐⭐⭐⭐ |
| **immersive-training** | Meshy + Sora2API | ModelsLab | 360° + 3D | ⭐⭐⭐⭐ |
| **spatial-presentation** | Meshy + ModelsLab | - | VR Deck | ⭐⭐⭐⭐ |

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
| **Voice Clone** | ElevenLabs | CosyVoice | ElevenLabs | - |

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

## Known Issues

| Provider | Issue | Status | Action |
|----------|-------|--------|--------|
| Alibaba China | Access Denied for CosyVoice/Paraformer | ⚠️ | Complete identity verification in DashScope |
| ModelsLab | Requires `type` parameter | ✅ Fixed | Working with proper format |

---

**Last Updated:** 2026-02-01  
**Next Verification:** 2026-02-08
