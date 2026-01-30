# Comprehensive Provider Routing Matrix

> **Last Updated:** 2026-01-30
> **Version:** 2.0
> **Status:** ACTIVE - Reference for AI Hub Routing

---

## 📊 Executive Summary

This document provides a complete mapping of **14+ providers** across **7 regional zones**, **19 capability types**, and **206 pipelines** with primary/secondary/fallback routing logic.

### Core 12 Active Providers
| # | Provider | Type | Primary Use Cases |
|---|----------|------|-------------------|
| 1 | **OpenAI** | LLM/Media | GPT-4o, DALL-E 3, Whisper, TTS, Sora |
| 2 | **Claude** | LLM | Claude 3.5 Sonnet - Best for US/EU text |
| 3 | **Gemini** | LLM/Media | Gemini 3.0 Flash, Imagen 3, Veo 2 |
| 4 | **DeepSeek** | LLM | DeepSeek-V3 - CJK optimized |
| 5 | **Alibaba** | LLM/Media | Qwen-Max, CosyVoice, WAN 2.2, Wanx |
| 6 | **Azure** | TTS/OCR | Neural TTS, Form Recognizer, Visemes |
| 7 | **ModelsLab** | Media | FLUX, AnimateDiff, 3D Mesh |
| 8 | **Replicate** | Media | Open-source models, 3D |
| 9 | **ElevenLabs** | Audio | Premium TTS, Voice Clone, SFX, Music |
| 10 | **DeepL** | Translation | Best European language translation |
| 11 | **Meshy** | 3D | Text-to-3D, Image-to-3D |
| 12 | **Sora2API** | Video | High-quality cinematic video |

### Additional Providers (Specialized)
| # | Provider | Type | Primary Use Cases |
|---|----------|------|-------------------|
| 13 | **Google TTS** | Audio | Fallback TTS for 130+ languages |
| 14 | **Supabase** | Backend | Auth, Database, Edge Functions |
| 15 | **Stripe** | Payments | Payment processing |

---

## 🌍 7-Zone Regional Routing

| Zone | Countries/Regions | Primary LLM | Primary TTS | Primary Translation |
|------|-------------------|-------------|-------------|---------------------|
| **Claude** | US, UK, EU, Brazil, Israel, South Africa | Claude 3.5 | ElevenLabs | DeepL |
| **Alibaba (CJK)** | China, Japan, Korea, Taiwan, HK, Singapore | Qwen-Max | CosyVoice | Qwen-MT |
| **Alibaba (Arabic)** | MENA, Gulf States | GPT-4o | Azure Neural | Azure Translator |
| **Gemini (India)** | India, Pakistan, Bangladesh | Gemini Pro | Azure Neural | Google Translate |
| **Gemini (SEA)** | Indonesia, Vietnam, Thailand, Philippines, Malaysia | Gemini Pro | Azure Neural | Google Translate |
| **Gemini (Africa)** | Nigeria, Kenya, South Africa, Ethiopia | Gemini Pro | Azure Neural | Google/NLLB |
| **Fallback** | All other regions | GPT-4o | OpenAI TTS | DeepL |

---

## 🎯 Capability-to-Provider Routing Matrix

### Legend
- **P1** = Primary (First choice)
- **P2** = Secondary (If P1 fails)
- **FB** = Fallback (Last resort)
- **Q** = Quality Score (1-5)

---

### 1️⃣ LLM / Text Generation

| Zone | P1 Provider | P2 Provider | FB Provider | Q | Notes |
|------|-------------|-------------|-------------|---|-------|
| Claude (US/EU) | Claude 3.5 Sonnet | GPT-4o | Gemini Pro | 5 | Best for narrative |
| Alibaba (CJK) | Qwen-Max | GPT-4o | DeepSeek-V3 | 5 | Native CJK generation |
| Alibaba (Arabic) | GPT-4o | Claude | Qwen-Max | 5 | GPT-4o best for Arabic |
| Gemini (India/SEA) | Gemini Pro | GPT-4o | Claude | 5 | 1M context window |
| Gemini (Africa) | Gemini Pro | GPT-4o | Claude | 4 | Multilingual support |
| Fallback | GPT-4o | Gemini Pro | Claude | 5 | Universal fallback |

---

### 2️⃣ Text-to-Speech (TTS)

| Zone | P1 Provider | P2 Provider | FB Provider | Q | Notes |
|------|-------------|-------------|-------------|---|-------|
| Claude (US/EU) | ElevenLabs | Azure Neural | OpenAI TTS | 5 | Premium voices |
| Alibaba (CJK) | CosyVoice | Azure Neural | Google TTS | 5 | MOS 4.5+ native prosody |
| Alibaba (Arabic) | Azure Neural | Google TTS | ElevenLabs | 5 | Gulf/Egyptian dialects |
| Gemini (India) | Azure Neural | Google TTS | ElevenLabs | 5 | 22+ Indian languages |
| Gemini (SEA) | Azure Neural | Google TTS | ElevenLabs | 4 | Thai/Vietnamese/Bahasa |
| Gemini (Africa) | Azure Neural | Google TTS | ElevenLabs | 4 | Swahili/Yoruba/Hausa |
| Fallback | OpenAI TTS | Azure Neural | Google TTS | 5 | Universal fallback |

---

### 3️⃣ Speech-to-Text (STT)

| Zone | P1 Provider | P2 Provider | FB Provider | Q | Notes |
|------|-------------|-------------|-------------|---|-------|
| Claude (US/EU) | ElevenLabs Scribe | Whisper | Azure STT | 5 | Premium transcription |
| Alibaba (CJK) | Paraformer | Whisper | Azure STT | 5 | Best for CJK audio |
| Alibaba (Arabic) | Whisper | Azure STT | Google STT | 5 | Whisper Arabic support |
| Gemini (India/SEA) | Whisper | Azure STT | Google STT | 5 | Multilingual |
| Gemini (Africa) | Whisper | Azure STT | Google STT | 4 | African language support |
| Fallback | Whisper | Azure STT | Google STT | 5 | Universal fallback |

---

### 4️⃣ Translation

| Zone | P1 Provider | P2 Provider | FB Provider | Q | Notes |
|------|-------------|-------------|-------------|---|-------|
| Claude (US/EU) | DeepL | Azure Translator | Google Translate | 5 | Best European quality |
| Alibaba (CJK) | Qwen-MT | DeepL | Google Translate | 5 | CJK pairs optimized |
| Alibaba (Arabic) | Azure Translator | Google Translate | DeepL | 5 | Arabic dialects |
| Gemini (India) | Google Translate | Azure Translator | DeepL | 5 | Indian languages |
| Gemini (SEA) | Google Translate | Azure Translator | DeepL | 4 | SEA languages |
| Gemini (Africa) | Google Translate | NLLB | Azure | 4 | Low-resource languages |
| Fallback | DeepL | Google Translate | Azure | 5 | Universal fallback |

---

### 5️⃣ Image Generation

| Zone | P1 Provider | P2 Provider | FB Provider | Q | Notes |
|------|-------------|-------------|-------------|---|-------|
| Claude (US/EU) | ModelsLab (FLUX) | DALL-E 3 | Gemini Imagen | 5 | FLUX Pro quality |
| Alibaba (CJK) | Alibaba Wanx | ModelsLab | Gemini | 5 | CJK aesthetics |
| Alibaba (Arabic) | ModelsLab | DALL-E 3 | Gemini | 5 | Cultural compliance |
| Gemini (India/SEA) | Gemini Imagen | ModelsLab | DALL-E 3 | 5 | Regional styles |
| Gemini (Africa) | Gemini Imagen | ModelsLab | DALL-E 3 | 4 | African aesthetics |
| Fallback | ModelsLab | DALL-E 3 | Gemini | 5 | Universal fallback |

---

### 6️⃣ Video Generation

| Visual Type Priority | P1 Provider | P2 Provider | FB Provider | Q | Notes |
|---------------------|-------------|-------------|-------------|---|-------|
| Cinematic/Realistic | Sora2API | ModelsLab | Gemini Veo | 5 | Film quality |
| Avatar/Lip-sync | Alibaba WAN 2.2 | Replicate | ModelsLab | 5 | Best avatar quality |
| 3D Product | Meshy | ModelsLab | Replicate | 4 | 3D mesh generation |
| Kinetic Typography | Gemini Veo | ModelsLab | Alibaba | 4 | Motion graphics |
| Infographics | Gemini Veo | ModelsLab | Alibaba | 4 | Data visualization |
| General Purpose | ModelsLab | Alibaba WAN | Replicate | 5 | Default chain |

**Regional Override:**
| Zone | P1 Provider | P2 Provider | FB Provider |
|------|-------------|-------------|-------------|
| CJK | Alibaba WAN 2.2 | ModelsLab | Gemini |
| India/SEA/Africa | Gemini Veo | ModelsLab | Alibaba |
| US/EU | Sora2API | ModelsLab | Gemini |

---

### 7️⃣ Audio Generation (Music/SFX)

| Capability | P1 Provider | P2 Provider | FB Provider | Q | Notes |
|------------|-------------|-------------|-------------|---|-------|
| Music Generation | ElevenLabs Music | Replicate | - | 4 | Requires Creator+ plan |
| Sound Effects (SFX) | ElevenLabs SFX | Replicate | - | 4 | Extensive library |
| Voice Cloning | ElevenLabs | Azure Neural | Alibaba | 5 | Instant voice clone |
| Audio Mixing | ElevenLabs | - | - | 4 | Post-production |

---

### 8️⃣ Avatar Generation

| Type | P1 Provider | P2 Provider | FB Provider | Q | Notes |
|------|-------------|-------------|-------------|---|-------|
| Talking Head | Alibaba WAN 2.2 | Replicate | ModelsLab | 5 | Global routing |
| Full-Body Avatar | Alibaba OmniAvatar | - | - | 5 | Premium only |
| Animated Character | Alibaba WAN-Animate | Replicate | - | 5 | Reference video |
| Speech-to-Video | Alibaba WAN-S2V | Replicate | - | 5 | Film-quality avatars |
| 3D Gaussian Splatting | Alibaba TaoAvatar | - | - | 5 | AR-ready 90 FPS |
| Text-to-Avatar | Alibaba MACH | Replicate | - | 4 | Text-to-3D avatar |

---

### 9️⃣ 3D Generation

| Capability | P1 Provider | P2 Provider | FB Provider | Q | Notes |
|------------|-------------|-------------|-------------|---|-------|
| Text-to-3D | Meshy | ModelsLab | Replicate | 4 | Mesh generation |
| Image-to-3D | Meshy | ModelsLab | Replicate | 4 | Single image input |
| 3D Mesh Refinement | Meshy | Replicate | - | 4 | Texture improvement |
| Product Showcase | Meshy | ModelsLab | - | 4 | E-commerce ready |

---

### 🔟 OCR / Document Processing

| Zone | P1 Provider | P2 Provider | FB Provider | Q | Notes |
|------|-------------|-------------|-------------|---|-------|
| Claude (US/EU) | Azure Form Recognizer | GPT-4o Vision | Gemini Vision | 5 | Best form extraction |
| Alibaba (CJK) | DeepSeek-VL | Azure | Gemini Vision | 5 | CJK document support |
| Alibaba (Arabic) | Azure Form Recognizer | GPT-4o Vision | Gemini | 5 | Arabic document OCR |
| Gemini (India/SEA) | Gemini Vision | Azure | GPT-4o | 5 | Multilingual docs |
| Gemini (Africa) | Gemini Vision | Azure | GPT-4o | 4 | African scripts |
| Fallback | Azure Form Recognizer | GPT-4o | Gemini | 5 | Universal fallback |

---

### 1️⃣1️⃣ Vision / Image Analysis

| Zone | P1 Provider | P2 Provider | FB Provider | Q | Notes |
|------|-------------|-------------|-------------|---|-------|
| Claude (US/EU) | GPT-4o Vision | Claude Vision | Gemini Vision | 5 | Best accuracy |
| Alibaba (CJK) | Qwen-VL | GPT-4o | Gemini | 5 | CJK scene understanding |
| Alibaba (Arabic) | GPT-4o Vision | Gemini | Claude | 5 | Arabic text in images |
| Gemini (India/SEA) | Gemini Vision | GPT-4o | Claude | 5 | 1M context |
| Fallback | GPT-4o Vision | Gemini | Claude | 5 | Universal fallback |

---

### 1️⃣2️⃣ Lip-Sync

| Zone | P1 Provider | P2 Provider | FB Provider | Q | Notes |
|------|-------------|-------------|-------------|---|-------|
| Claude (US/EU) | Azure Visemes | Alibaba | Replicate | 5 | Best viseme accuracy |
| Alibaba (CJK) | Alibaba | Azure Visemes | Replicate | 5 | Native CJK lip-sync |
| All Others | Azure Visemes | Alibaba | Replicate | 5 | Universal |

---

## 🏭 Pipeline Category Routing

| Category | Primary Capabilities | P1 Providers | P2 Providers |
|----------|---------------------|--------------|--------------|
| **Presentation** | LLM, Script, Image, DataViz | Claude/GPT-4o, ModelsLab | Gemini, DALL-E |
| **Video Production** | Video, Avatar, Lip-sync, TTS, Music | ModelsLab, Alibaba, ElevenLabs | Replicate, Azure |
| **Content Repurposing** | LLM, Summarization, STT, Video | Claude, Whisper, ModelsLab | GPT-4o, Azure |
| **Training & L&D** | LLM, Script, TTS, Avatar, Image | Claude, ElevenLabs, Alibaba | GPT-4o, Azure |
| **Marketing** | LLM, Image, Video, TTS, Music | Claude, ModelsLab, ElevenLabs | GPT-4o, Replicate |
| **Social Media** | Video, Image, TTS, Music | ModelsLab, ElevenLabs | Alibaba, Gemini |
| **Sales Enablement** | LLM, Script, Avatar, TTS, DataViz | Claude, Alibaba, ElevenLabs | GPT-4o, Azure |
| **Customer Education** | LLM, Script, Avatar, TTS, Image | Claude, Alibaba, ElevenLabs | GPT-4o, Azure |
| **Localization** | Translation, TTS, Voice Clone, STT | DeepL, ElevenLabs, Whisper | Azure, Google |
| **Data Analytics** | LLM, DataViz, OCR, Vision | GPT-4o, Azure | Gemini, Claude |
| **Internal Comms** | LLM, TTS, Avatar, Video | Claude, ElevenLabs, Alibaba | GPT-4o, Azure |
| **Live/Realtime** | LLM, STT, TTS, Avatar | Claude, Whisper, ElevenLabs | GPT-4o, Azure |
| **Immersive 3D** | 3D Gen, Image, Video | Meshy, ModelsLab | Replicate |
| **Audio/SFX** | TTS, Music, SFX, Voice Clone | ElevenLabs | Azure, Replicate |

---

## 🌐 Language Coverage Matrix (70+ Languages)

### Tier 1 - Full Coverage (Q5)
| Language | LLM | TTS | STT | Translation | Region |
|----------|-----|-----|-----|-------------|--------|
| English | Claude/GPT-4o | ElevenLabs | Whisper | DeepL | Claude |
| German | Claude | ElevenLabs | Whisper | DeepL | Claude |
| French | Claude | ElevenLabs | Whisper | DeepL | Claude |
| Spanish | Claude | ElevenLabs | Whisper | DeepL | Claude |
| Portuguese (BR) | Claude | ElevenLabs | Whisper | DeepL | Claude |
| Japanese | Qwen-Max | CosyVoice | Paraformer | Qwen-MT | Alibaba |
| Korean | Qwen-Max | CosyVoice | Paraformer | Qwen-MT | Alibaba |
| Chinese (Simplified) | Qwen-Max | CosyVoice | Paraformer | Qwen-MT | Alibaba |
| Arabic (MSA) | GPT-4o | Azure Neural | Whisper | Azure | Arabic |
| Hindi | Gemini | Azure Neural | Whisper | Google | Gemini |

### Tier 2 - Strong Coverage (Q4)
| Language | LLM | TTS | STT | Translation | Region |
|----------|-----|-----|-----|-------------|--------|
| Italian | Claude | ElevenLabs | Whisper | DeepL | Claude |
| Dutch | Claude | ElevenLabs | Whisper | DeepL | Claude |
| Polish | Claude | ElevenLabs | Whisper | DeepL | Claude |
| Russian | Claude | ElevenLabs | Whisper | DeepL | Claude |
| Chinese (Traditional) | Qwen-Max | CosyVoice | Paraformer | Qwen-MT | Alibaba |
| Bengali | Gemini | Azure Neural | Whisper | Google | Gemini |
| Tamil | Gemini | Azure Neural | Whisper | Google | Gemini |
| Telugu | Gemini | Azure Neural | Whisper | Google | Gemini |
| Indonesian | Gemini | Azure Neural | Whisper | Google | Gemini |
| Vietnamese | Gemini | Azure Neural | Whisper | Google | Gemini |
| Thai | Gemini | Azure Neural | Whisper | Google | Gemini |
| Swahili | Gemini | Azure Neural | Whisper | Google/NLLB | Gemini |

### Tier 3 - Good Coverage (Q3)
| Language | LLM | TTS | STT | Translation | Region |
|----------|-----|-----|-----|-------------|--------|
| Marathi | Gemini | Azure Neural | Whisper | Google | Gemini |
| Gujarati | Gemini | Azure Neural | Whisper | Google | Gemini |
| Kannada | Gemini | Azure Neural | Whisper | Google | Gemini |
| Malayalam | Gemini | Azure Neural | Whisper | Google | Gemini |
| Punjabi | Gemini | Azure Neural | Whisper | Google | Gemini |
| Urdu | Gemini | Azure Neural | Whisper | Google | Gemini |
| Filipino | Gemini | Azure Neural | Whisper | Google | Gemini |
| Malay | Gemini | Azure Neural | Whisper | Google | Gemini |
| Yoruba | Gemini | Azure Neural | Whisper | Google/NLLB | Gemini |
| Amharic | Gemini | Google TTS | Whisper | Google/NLLB | Gemini |
| Arabic (Gulf) | GPT-4o | Azure Neural | Whisper | Azure | Arabic |
| Arabic (Egyptian) | GPT-4o | Azure Neural | Whisper | Azure | Arabic |

### Tier 4 - Basic Coverage (Q2-3)
| Language | LLM | TTS | STT | Translation | Region |
|----------|-----|-----|-----|-------------|--------|
| Hausa | Gemini | Azure Neural | Whisper | NLLB | Gemini |
| Igbo | Gemini | Azure Neural | Whisper | NLLB | Gemini |
| Zulu | Gemini | Azure Neural | Whisper | Google | Gemini |
| Xhosa | Gemini | Azure Neural | Whisper | Google | Gemini |
| Afrikaans | Gemini | Azure Neural | Whisper | Google | Gemini |
| Hebrew | Claude | Azure Neural | Whisper | Azure | Claude |
| Persian/Farsi | GPT-4o | Azure Neural | Whisper | Azure | Arabic |
| Arabic (Moroccan) | GPT-4o | Azure Neural | Whisper | Azure | Arabic |
| Arabic (Iraqi) | GPT-4o | Azure Neural | Whisper | Azure | Arabic |

---

## 📋 Template Categories & Routing

| Template Category | Region Focus | Visual Types | Primary Providers |
|-------------------|--------------|--------------|-------------------|
| Saudi Vision 2030 | MENA | Cinematic, 3D | Sora2API, Azure, Meshy |
| Digital India | India | Storytelling, Regional Art | Gemini, Azure, ModelsLab |
| Made in China 2025 | CJK | Modern, Industrial | Alibaba, Qwen, ModelsLab |
| Africa Rising | Africa | Cultural, Storytelling | Gemini, Azure, ModelsLab |
| EU Innovation | EU | Corporate, Data | Claude, ElevenLabs, ModelsLab |
| LATAM Growth | LATAM | Vibrant, Cultural | Claude, ElevenLabs, ModelsLab |
| SEA Digital | SEA | Modern, Tech | Gemini, Azure, ModelsLab |

---

## 🔄 Fallback Chain Logic

```
┌─────────────────────────────────────────────────────────────┐
│                    REQUEST RECEIVED                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Detect Region → Assign Zone (Claude/Alibaba/Gemini/FB)  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Check Visual Type → Override if specific type requested │
│     (Cinematic→Sora2API, Avatar→Alibaba, 3D→Meshy)         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Try P1 Provider                                          │
│     └─ Success → Return result                               │
│     └─ Fail → Continue to P2                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Try P2 Provider                                          │
│     └─ Success → Return result                               │
│     └─ Fail → Continue to FB                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Try Fallback Provider                                    │
│     └─ Success → Return result                               │
│     └─ Fail → Return error with retry suggestion             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Improvement Recommendations

### 1. Provider Gaps Identified

| Gap | Current State | Recommended Action |
|-----|--------------|-------------------|
| Azure Speech Key | Not configured | Add `AZURE_SPEECH_KEY` for 400+ voices |
| Azure Doc Intelligence | Not configured | Add `AZURE_FORM_RECOGNIZER_KEY` for OCR |
| Suno Music | Deprecated | ElevenLabs Music sufficient |
| Real-time STT | Limited | Add Deepgram for <100ms latency |

### 2. Regional Optimization

| Region | Current | Recommendation |
|--------|---------|----------------|
| Africa | Gemini fallback | Add dedicated African language TTS models |
| LATAM | Claude zone | Consider Spanish LATAM-specific voices |
| India | Good coverage | Add Bhashini integration for govt compliance |

### 3. Quality Improvements

| Capability | Current Q | Target Q | Action |
|------------|-----------|----------|--------|
| African STT | 3 | 4 | Fine-tune Whisper on African accents |
| Arabic Video | 4 | 5 | Add more MENA-focused video templates |
| CJK 3D | 4 | 5 | Integrate Alibaba 3D models directly |

### 4. Cost Optimization

| Provider | Usage Pattern | Optimization |
|----------|---------------|--------------|
| ElevenLabs | High TTS volume | Cache common phrases |
| ModelsLab | Video generation | Batch requests |
| Sora2API | Premium video | Reserve for high-value content |

---

## 📚 Related Documentation

- [AI Provider Capability Matrix](./AI_PROVIDER_CAPABILITY_MATRIX.md)
- [Pipeline Commercial Organization](./PIPELINE_COMMERCIAL_ORGANIZATION.md)
- [Provider Subscription Requirements](./PROVIDER_SUBSCRIPTION_REQUIREMENTS.md)
- [Global Market Pipeline Strategy](./GLOBAL_MARKET_PIPELINE_STRATEGY.md)

---

## ✅ Configuration Status

### Configured (Ready)
- ✅ OpenAI (`OPENAI_API_KEY`)
- ✅ Claude (`CLAUDE_API_KEY`, `ANTHROPIC_API_KEY`)
- ✅ Gemini (`GOOGLE_API_KEY`) - **Updated to AI Studio key**
- ✅ DeepSeek (`DEEPSEEK_API_KEY`)
- ✅ Alibaba (`ALIBABA_API_KEY`)
- ✅ ElevenLabs (`ELEVENLABS_API_KEY`)
- ✅ DeepL (`DEEPL_API_KEY`)
- ✅ Replicate (`REPLICATE_API_TOKEN`)
- ✅ Microsoft Translator (`MICROSOFT_TRANSLATE_API_KEY`)
- ✅ Hugging Face (`HUGGING_FACE_ACCESS_TOKEN`)

### Pending Configuration
- ❌ Azure Speech (`AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`)
- ❌ Azure Doc Intelligence (`AZURE_FORM_RECOGNIZER_KEY`)
- ❌ ModelsLab (`MODELSLAB_API_KEY`) - Verify status
- ❌ Meshy (`MESHY_API_KEY`) - Verify status
- ❌ Sora2API (`SORA2API_KEY`) - Verify status

---

*This matrix is auto-synchronized with the routing services in:*
- `src/services/unifiedProviderRoutingAdapter.ts`
- `src/services/pipelineDynamicProviderRouting.ts`
- `src/services/llmRoutingStrategy.ts`
