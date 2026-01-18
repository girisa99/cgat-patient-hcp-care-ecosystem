# Universal AI Hub - Provider Capability Matrix

> **Last Updated:** 2025-01-18
> **Status:** ACTIVE - Reference for UniversalAIHub Implementation

## 🔑 API Key Status Overview

### ✅ CONFIGURED (Ready to Use)
| Provider | Secret Name | Capabilities |
|----------|-------------|--------------|
| **OpenAI** | `OPENAI_API_KEY` | LLM, TTS, STT, Image, Vision, NLP, Moderation |
| **Claude/Anthropic** | `CLAUDE_API_KEY` + `ANTHROPIC_API_KEY` | LLM, Vision, Translation, NLP |
| **Gemini/Google** | `GEMINI_API_KEY` + `GOOGLE_API_KEY` | LLM, Vision, TTS, Image, NLP, Translation |
| **DeepSeek** | `DEEPSEEK_API_KEY` | LLM, Vision (DeepSeek-VL), NLP |
| **DeepL** | `DEEPL_API_KEY` | Translation (30+ languages, best quality) |
| **ElevenLabs** | `ELEVENLABS_API_KEY` | TTS, SFX, Voice Cloning, Music |
| **Replicate** | `REPLICATE_API_TOKEN` | Image, Video, Audio generation |
| **Alibaba** | `ALIBABA_API_KEY` | LLM, Vision, TTS, Translation, Image |
| **Microsoft/Azure** | `MICROSOFT_TRANSLATE_API_KEY` | Translation (100+ languages) |
| **Hugging Face** | `HUGGING_FACE_ACCESS_TOKEN` | Open-source models, embeddings |
| **Lovable AI** | `LOVABLE_API_KEY` | Gateway to OpenAI/Gemini (auto-provisioned) |

### ❌ NOT CONFIGURED (Subscription Required)
| Provider | Secret Name Needed | Capabilities | Subscription Link |
|----------|-------------------|--------------|-------------------|
| **Azure OpenAI** | `AZURE_OPENAI_KEY`, `AZURE_OPENAI_ENDPOINT` | LLM, Vision, Image | [Azure Portal](https://portal.azure.com) |
| **Azure Speech** | `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION` | TTS, STT (400+ voices) | [Azure Speech](https://azure.microsoft.com/services/cognitive-services/speech-services/) |
| **Azure Doc Intelligence** | `AZURE_FORM_RECOGNIZER_KEY` | OCR, Forms, Tables | [Azure Form Recognizer](https://azure.microsoft.com/services/form-recognizer/) |
| **AWS Bedrock** | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` | LLM, Image (fallback) | [AWS Console](https://aws.amazon.com/bedrock/) |
| **AWS Textract** | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | OCR, Forms | [AWS Textract](https://aws.amazon.com/textract/) |
| **AWS Transcribe** | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | STT | [AWS Transcribe](https://aws.amazon.com/transcribe/) |
| **AWS Polly** | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | TTS | [AWS Polly](https://aws.amazon.com/polly/) |
| **AWS Translate** | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | Translation | [AWS Translate](https://aws.amazon.com/translate/) |
| **Cohere** | `COHERE_API_KEY` | LLM, Embeddings, Rerank | [Cohere Dashboard](https://dashboard.cohere.com/) |
| **AssemblyAI** | `ASSEMBLYAI_API_KEY` | STT (medical) | [AssemblyAI](https://www.assemblyai.com/) |
| **Stability AI** | `STABILITY_API_KEY` | Image, Audio | [Stability AI](https://platform.stability.ai/) |
| **Runway** | `RUNWAY_API_KEY` | Video Gen (Gen-3) | [Runway ML](https://runwayml.com/) |
| **Suno** | `SUNO_API_KEY` | Music Gen | [Suno AI](https://suno.ai/) |
| **Udio** | `UDIO_API_KEY` | Music Gen | [Udio](https://udio.com/) |
| **Pika Labs** | `PIKA_API_KEY` | Video Gen | [Pika Labs](https://pika.art/) |
| **Mistral** | `MISTRAL_API_KEY` | LLM | [Mistral AI](https://mistral.ai/) |
| **Groq** | `GROQ_API_KEY` | Fast LLM | [Groq Console](https://console.groq.com/) |
| **Deepgram** | `DEEPGRAM_API_KEY` | Real-time STT | [Deepgram](https://deepgram.com/) |
| **PlayHT** | `PLAYHT_API_KEY` | TTS, Voice Cloning | [PlayHT](https://play.ht/) |

---

## 📊 Complete Provider Capability Matrix

### Legend
| Symbol | Meaning |
|--------|---------|
| ✅ CONFIGURED | API key configured, ready to use |
| 🔶 PARTIAL | Limited support or requires additional setup |
| 🚫 NOT SUPPORTED | Provider does not offer this service |
| 💳 NEEDS KEY | Capability available but API key not configured |
| 🔜 COMING SOON | On roadmap, not yet available |

---

## 🧠 LLM/Chat Providers

| Provider | Status | Chat | Vision | Code | Agents/Tools | RAG | Context | Priority |
|----------|:------:|:----:|:------:|:----:|:------------:|:---:|:-------:|:--------:|
| **OpenAI (GPT-4o)** | ✅ CONFIGURED | ✅ | ✅ | ✅ | ✅ | ✅ | 128K | 1 |
| **Claude (Anthropic)** | ✅ CONFIGURED | ✅ | ✅ | ✅ | ✅ | ✅ | 200K | 2 |
| **Gemini (Google)** | ✅ CONFIGURED | ✅ | ✅ | ✅ | ✅ | ✅ | 1M+ | 3 |
| **DeepSeek-V3** | ✅ CONFIGURED | ✅ | ✅ | ✅ | ✅ | ✅ | 128K | 4 |
| **Alibaba Qwen** | ✅ CONFIGURED | ✅ | ✅ | ✅ | ✅ | ✅ | 128K | 5 |
| **Azure OpenAI** | 💳 NEEDS KEY | ✅ | ✅ | ✅ | ✅ | ✅ | 128K | 6 |
| **Mistral** | 💳 NEEDS KEY | ✅ | 🔶 | ✅ | ✅ | ✅ | 32K | 7 |
| **Cohere** | 💳 NEEDS KEY | ✅ | 🚫 No vision model | 🔶 | ✅ | ✅ | 128K | 8 |
| **Groq** | 💳 NEEDS KEY | ✅ | 🚫 No vision model | ✅ | 🔶 | 🔶 | 8K | 9 |
| **AWS Bedrock** | 💳 NEEDS KEY | ✅ | ✅ | ✅ | ✅ | ✅ | Varies | 90 |

### LLM Fallback Chain (Using Configured Keys)
```
Available Chain: OpenAI GPT-4o → Claude 3.5 → Gemini 2.0 → DeepSeek-V3 → Alibaba Qwen
Fallback (if key added): Azure OpenAI → Mistral → AWS Bedrock
```

---

## 🌐 Translation Providers

| Provider | Status | Languages | Quality | Formality | Glossary | Document | Priority |
|----------|:------:|:---------:|:-------:|:---------:|:--------:|:--------:|:--------:|
| **DeepL** | ✅ CONFIGURED | 30+ | Best | ✅ | ✅ | ✅ | 1 |
| **Claude** | ✅ CONFIGURED | 100+ | Great | 🔶 | 🚫 No glossary API | ✅ | 2 |
| **Microsoft Translator** | ✅ CONFIGURED | 100+ | Great | ✅ | ✅ | ✅ | 3 |
| **Google Translate** | ✅ CONFIGURED | 130+ | Good | 🚫 No formality | ✅ | ✅ | 4 |
| **OpenAI** | ✅ CONFIGURED | 100+ | Great | 🔶 | 🚫 No glossary API | ✅ | 5 |
| **Alibaba Translation** | ✅ CONFIGURED | 50+ | Good | 🔶 | ✅ | ✅ | 6 |
| **DeepSeek** | ✅ CONFIGURED | 50+ | 🔶 | 🚫 No formality | 🚫 No glossary | ✅ | 7 |
| **AWS Translate** | 💳 NEEDS KEY | 75+ | Good | ✅ | ✅ | ✅ | 90 |

### Translation Fallback Chain (Using Configured Keys)
```
European Languages: DeepL → Claude → Microsoft → Google
Asian Languages: Alibaba → DeepSeek → Google → Claude
Medical/Technical: DeepL (glossary) → Microsoft (custom) → Claude
Claude Advantage: Better for nuanced/literary translations, complex context
```

---

## 👁️ Vision/OCR Providers

| Provider | Status | Document OCR | Handwriting | Tables | Forms | Medical Docs | Priority |
|----------|:------:|:------------:|:-----------:|:------:|:-----:|:------------:|:--------:|
| **Azure Doc Intelligence** | 💳 NEEDS KEY | ✅ | ✅ | ✅ | ✅ | ✅ | 1 |
| **Google Cloud Vision** | ✅ CONFIGURED | ✅ | ✅ | ✅ | 🔶 | 🔶 | 2 |
| **OpenAI GPT-4V** | ✅ CONFIGURED | ✅ | ✅ | ✅ | ✅ | ✅ | 3 |
| **Claude Vision** | ✅ CONFIGURED | ✅ | ✅ | ✅ | ✅ | ✅ | 4 |
| **Gemini Vision** | ✅ CONFIGURED | ✅ | ✅ | ✅ | ✅ | ✅ | 5 |
| **DeepSeek-VL** | ✅ CONFIGURED | ✅ | 🔶 Limited | ✅ | 🔶 | 🔶 | 6 |
| **Alibaba Qwen-VL** | ✅ CONFIGURED | ✅ | ✅ | ✅ | ✅ | 🔶 | 7 |
| **AWS Textract** | 💳 NEEDS KEY | ✅ | ✅ | ✅ | ✅ | 🔶 | 90 |
| **Tesseract (Local)** | ✅ FREE | 🔶 Basic | 🔶 | 🚫 No table extraction | 🚫 No forms | 🚫 | 99 |

### OCR Fallback Chain (Using Configured Keys)
```
Available Chain: OpenAI GPT-4V → Claude Vision → Gemini Vision → Google Vision → DeepSeek-VL → Tesseract
Best for Medical: Claude Vision → OpenAI GPT-4V (if Azure key added: Azure first)
Best for Forms: Google Vision → OpenAI GPT-4V (if AWS key added: Textract)
```

---

## 🔊 Text-to-Speech (TTS) Providers

| Provider | Status | Voices | Languages | Cloning | Emotion | Streaming | Priority |
|----------|:------:|:------:|:---------:|:-------:|:-------:|:---------:|:--------:|
| **ElevenLabs** | ✅ CONFIGURED | 100+ | 29 | ✅ | ✅ | ✅ | 1 |
| **OpenAI TTS** | ✅ CONFIGURED | 6 | 50+ | 🚫 No cloning | 🔶 | ✅ | 2 |
| **Google Cloud TTS** | ✅ CONFIGURED | 300+ | 50+ | 🚫 No cloning | 🔶 | ✅ | 3 |
| **Alibaba TTS** | ✅ CONFIGURED | 100+ | 20+ | 🔶 | 🔶 | ✅ | 4 |
| **Azure Speech** | 💳 NEEDS KEY | 400+ | 140+ | ✅ | ✅ | ✅ | 5 |
| **PlayHT** | 💳 NEEDS KEY | 100+ | 30+ | ✅ | ✅ | ✅ | 6 |
| **AWS Polly** | 💳 NEEDS KEY | 60+ | 30+ | 🚫 No cloning | 🔶 | ✅ | 90 |
| **DeepSeek** | ✅ CONFIGURED | 🚫 | 🚫 | 🚫 | 🚫 | 🚫 | — |

> **Note:** DeepSeek does NOT support TTS - it's an LLM-only provider

### TTS Fallback Chain (Using Configured Keys)
```
Available Chain: ElevenLabs → OpenAI TTS → Google TTS → Alibaba TTS
Voice Cloning: ElevenLabs only (or add Azure/PlayHT keys)
Multi-language: Google TTS → ElevenLabs → Alibaba
```

---

## 🎤 Speech-to-Text (STT) Providers

| Provider | Status | Real-time | Languages | Diarization | Medical | Accuracy | Priority |
|----------|:------:|:---------:|:---------:|:-----------:|:-------:|:--------:|:--------:|
| **OpenAI Whisper** | ✅ CONFIGURED | ✅ | 99 | 🔶 | 🔶 | 98% | 1 |
| **Google Speech** | ✅ CONFIGURED | ✅ | 125+ | ✅ | ✅ | 95% | 2 |
| **AssemblyAI** | 💳 NEEDS KEY | ✅ | 100+ | ✅ | ✅ Best | 97% | 3 |
| **Azure Speech** | 💳 NEEDS KEY | ✅ | 100+ | ✅ | ✅ | 96% | 4 |
| **Deepgram** | 💳 NEEDS KEY | ✅ Best | 30+ | ✅ | ✅ | 96% | 5 |
| **AWS Transcribe** | 💳 NEEDS KEY | ✅ | 30+ | ✅ | ✅ | 94% | 90 |
| **DeepSeek** | ✅ CONFIGURED | 🚫 | 🚫 | 🚫 | 🚫 | 🚫 | — |

> **Note:** DeepSeek does NOT support STT - it's an LLM-only provider

### STT Fallback Chain (Using Configured Keys)
```
Available Chain: OpenAI Whisper → Google Speech
Medical Transcription: Add AssemblyAI key for best medical transcription
Real-time: Add Deepgram key for lowest latency
```

---

## 🖼️ Image Generation Providers

| Provider | Status | Quality | Editing | Inpainting | ControlNet | Speed | Priority |
|----------|:------:|:-------:|:-------:|:----------:|:----------:|:-----:|:--------:|
| **OpenAI DALL-E 3** | ✅ CONFIGURED | Great | 🔶 | ✅ | 🚫 No ControlNet | Fast | 1 |
| **Replicate (SDXL)** | ✅ CONFIGURED | Great | ✅ | ✅ | ✅ | Medium | 2 |
| **Gemini Imagen** | ✅ CONFIGURED | Great | 🔶 | 🔶 | 🚫 | Fast | 3 |
| **Alibaba Wanx** | ✅ CONFIGURED | Good | 🔶 | 🔶 | 🔶 | Fast | 4 |
| **Stability AI** | 💳 NEEDS KEY | Best | ✅ | ✅ | ✅ | Medium | 5 |
| **Azure OpenAI** | 💳 NEEDS KEY | Great | 🔶 | ✅ | 🚫 | Fast | 6 |
| **Leonardo.AI** | 💳 NEEDS KEY | Great | ✅ | ✅ | ✅ | Fast | 7 |
| **Midjourney** | 💳 NEEDS KEY | Best | 🔶 | 🔶 | 🚫 | Medium | 8 |
| **AWS Bedrock** | 💳 NEEDS KEY | Good | 🔶 | 🔶 | 🚫 | Medium | 90 |
| **DeepSeek** | ✅ CONFIGURED | 🚫 | 🚫 | 🚫 | 🚫 | 🚫 | — |

> **Note:** DeepSeek does NOT support image generation - it's an LLM-only provider

### Image Generation Fallback Chain (Using Configured Keys)
```
Available Chain: DALL-E 3 → Replicate (SDXL) → Gemini Imagen → Alibaba Wanx
For Editing: Replicate (SDXL) → DALL-E 3
For ControlNet: Replicate only (or add Stability AI key)
```

---

## 🎬 Video Generation Providers

| Provider | Status | Quality | Duration | Image-to-Video | Text-to-Video | Priority |
|----------|:------:|:-------:|:--------:|:--------------:|:-------------:|:--------:|
| **Replicate** | ✅ CONFIGURED | Good | Varies | ✅ | ✅ | 1 |
| **Alibaba** | ✅ CONFIGURED | Good | 5s | ✅ | 🔶 | 2 |
| **Runway Gen-3** | 💳 NEEDS KEY | Great | 10s | ✅ | ✅ | 3 |
| **Pika Labs** | 💳 NEEDS KEY | Great | 4s | ✅ | ✅ | 4 |
| **Kling AI** | 💳 NEEDS KEY | Great | 10s | ✅ | ✅ | 5 |
| **OpenAI Sora** | 💳 WAITLIST | Best | 60s | ✅ | ✅ | 6 |
| **Luma Dream Machine** | 💳 NEEDS KEY | Great | 5s | ✅ | ✅ | 7 |
| **Gemini** | ✅ CONFIGURED | 🚫 | 🚫 | 🚫 | 🚫 | — |
| **DeepSeek** | ✅ CONFIGURED | 🚫 | 🚫 | 🚫 | 🚫 | — |

> **Note:** Neither Gemini nor DeepSeek support video generation

### Video Generation Fallback Chain (Using Configured Keys)
```
Available Chain: Replicate → Alibaba
For Better Quality: Add Runway or Pika Labs keys
For Best Quality: Apply for Sora waitlist
```

---

## 🎵 Audio Generation Providers

| Provider | Status | Music | SFX | Voice | Stems | Priority |
|----------|:------:|:-----:|:---:|:-----:|:-----:|:--------:|
| **ElevenLabs** | ✅ CONFIGURED | 🔶 New | ✅ | ✅ | 🚫 No stems | 1 |
| **Replicate** | ✅ CONFIGURED | 🔶 | 🔶 | 🔶 | 🚫 | 2 |
| **Suno** | 💳 NEEDS KEY | ✅ Best | 🔶 | ✅ | 🚫 | 3 |
| **Udio** | 💳 NEEDS KEY | ✅ Great | 🔶 | ✅ | 🚫 | 4 |
| **Stability Audio** | 💳 NEEDS KEY | ✅ | ✅ | 🚫 No voice | ✅ | 5 |
| **DeepSeek** | ✅ CONFIGURED | 🚫 | 🚫 | 🚫 | 🚫 | — |

> **Note:** DeepSeek does NOT support audio generation

### Audio Generation Fallback Chain (Using Configured Keys)
```
Available Chain: ElevenLabs → Replicate
For Better Music: Add Suno or Udio keys
Sound Effects: ElevenLabs (add Stability Audio for more options)
```

---

## 📝 NLP/Text Processing Providers

| Provider | Status | Summarization | Sentiment | NER | Embeddings | Rerank | Priority |
|----------|:------:|:-------------:|:---------:|:---:|:----------:|:------:|:--------:|
| **OpenAI** | ✅ CONFIGURED | ✅ | ✅ | ✅ | ✅ | 🚫 No rerank | 1 |
| **Claude** | ✅ CONFIGURED | ✅ | ✅ | ✅ | 🚫 No embeddings API | 🚫 | 2 |
| **Gemini** | ✅ CONFIGURED | ✅ | ✅ | ✅ | ✅ | 🚫 | 3 |
| **Google NLP** | ✅ CONFIGURED | ✅ | ✅ | ✅ | ✅ | 🚫 | 4 |
| **DeepSeek** | ✅ CONFIGURED | ✅ | ✅ | ✅ | 🚫 No embeddings | 🚫 | 5 |
| **Alibaba** | ✅ CONFIGURED | ✅ | ✅ | ✅ | ✅ | 🚫 | 6 |
| **Cohere** | 💳 NEEDS KEY | ✅ | ✅ | 🔶 | ✅ | ✅ Best | 7 |
| **AWS Comprehend** | 💳 NEEDS KEY | ✅ | ✅ | ✅ | 🚫 | 🚫 | 90 |

### NLP Fallback Chain (Using Configured Keys)
```
Available Chain: OpenAI → Claude → Gemini → Google NLP → DeepSeek → Alibaba
Embeddings: OpenAI → Gemini → Google → Alibaba (Claude has no embeddings API)
Reranking: Add Cohere key (only provider with rerank API)
```

---

## 🔐 Content Moderation Providers

| Provider | Status | Text | Image | Video | Audio | Priority |
|----------|:------:|:----:|:-----:|:-----:|:-----:|:--------:|
| **OpenAI Moderation** | ✅ CONFIGURED | ✅ | ✅ | 🚫 No video | 🚫 No audio | 1 |
| **Google Cloud Vision** | ✅ CONFIGURED | 🔶 | ✅ | 🚫 | 🚫 | 2 |
| **Azure Content Safety** | 💳 NEEDS KEY | ✅ | ✅ | ✅ | ✅ | 3 |
| **AWS Rekognition** | 💳 NEEDS KEY | 🔶 | ✅ | ✅ | 🚫 | 90 |

### Moderation Fallback Chain (Using Configured Keys)
```
Available Chain: OpenAI Moderation → Google Cloud Vision
For Video/Audio Moderation: Add Azure Content Safety key
```

---

## 📊 Complete Provider Summary (With Status)

| Provider | Status | LLM | Trans | OCR | TTS | STT | ImgGen | VidGen | Audio | NLP | Mod |
|----------|:------:|:---:|:-----:|:---:|:---:|:---:|:------:|:------:|:-----:|:---:|:---:|
| **OpenAI** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🔜 Sora | 🚫 | ✅ | ✅ |
| **Claude** | ✅ | ✅ | ✅ | ✅ | 🚫 | 🚫 | 🚫 | 🚫 | 🚫 | ✅ | 🚫 |
| **Gemini** | ✅ | ✅ | ✅ | ✅ | ✅ | 🚫 | ✅ | 🚫 | 🚫 | ✅ | 🚫 |
| **DeepSeek** | ✅ | ✅ | ✅ | ✅ | 🚫 | 🚫 | 🚫 | 🚫 | 🚫 | ✅ | 🚫 |
| **Alibaba** | ✅ | ✅ | ✅ | ✅ | ✅ | 🔶 | ✅ | ✅ | 🚫 | ✅ | 🚫 |
| **Microsoft** | ✅ | 🚫 | ✅ | 🚫 | 🚫 | 🚫 | 🚫 | 🚫 | 🚫 | 🚫 | 🚫 |
| **DeepL** | ✅ | 🚫 | ✅ | 🚫 | 🚫 | 🚫 | 🚫 | 🚫 | 🚫 | 🚫 | 🚫 |
| **ElevenLabs** | ✅ | 🚫 | 🚫 | 🚫 | ✅ | 🚫 | 🚫 | 🚫 | ✅ | 🚫 | 🚫 |
| **Replicate** | ✅ | 🚫 | 🚫 | 🚫 | 🚫 | 🚫 | ✅ | ✅ | ✅ | 🚫 | 🚫 |
| **Hugging Face** | ✅ | ✅ | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🚫 | 🚫 | ✅ | 🚫 |
| **Azure** | 💳 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🚫 | 🚫 | ✅ | ✅ |
| **AWS** | 💳 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🚫 | 🚫 | ✅ | ✅ |
| **Cohere** | 💳 | ✅ | 🚫 | 🚫 | 🚫 | 🚫 | 🚫 | 🚫 | 🚫 | ✅ | 🚫 |
| **AssemblyAI** | 💳 | 🚫 | 🚫 | 🚫 | 🚫 | ✅ | 🚫 | 🚫 | 🚫 | 🚫 | 🚫 |
| **Stability** | 💳 | 🚫 | 🚫 | 🚫 | 🚫 | 🚫 | ✅ | 🚫 | ✅ | 🚫 | 🚫 |
| **Runway** | 💳 | 🚫 | 🚫 | 🚫 | 🚫 | 🚫 | 🚫 | ✅ | 🚫 | 🚫 | 🚫 |
| **Suno** | 💳 | 🚫 | 🚫 | 🚫 | 🚫 | 🚫 | 🚫 | 🚫 | ✅ | 🚫 | 🚫 |

### Legend
- ✅ = Configured & Supported
- 💳 = Needs API Key
- 🔶 = Partial Support
- 🚫 = Provider doesn't offer this service
- 🔜 = Coming Soon

---

## 🔄 Active Fallback Chains (Configured Providers Only)

```yaml
LLM_CHAT:
  available: [openai, claude, gemini, deepseek, alibaba, huggingface]
  default: openai
  notes: "Add Azure/AWS keys for enterprise fallback"
   
TRANSLATION:
  available: [deepl, claude, microsoft, google, openai, alibaba, deepseek]
  european: [deepl, claude, microsoft]
  asian: [alibaba, deepseek, google, claude]
  default: deepl
  notes: "Claude best for literary, DeepL best for professional"

OCR_VISION:
  available: [openai_gpt4v, claude_vision, gemini_vision, google_vision, deepseek_vl, alibaba_qwen_vl]
  medical: [claude_vision, openai_gpt4v]
  default: openai_gpt4v
  notes: "Add Azure Doc Intelligence for best form extraction"

TTS:
  available: [elevenlabs, openai_tts, google_tts, alibaba_tts]
  cloning: [elevenlabs]
  default: elevenlabs
  notes: "Add Azure Speech for 400+ voice options"

STT:
  available: [openai_whisper, google_speech]
  default: openai_whisper
  notes: "Add AssemblyAI for medical transcription, Deepgram for real-time"

IMAGE_GEN:
  available: [dalle3, replicate, gemini, alibaba_wanx]
  editing: [replicate]
  default: dalle3
  notes: "Add Stability AI for ControlNet support"

VIDEO_GEN:
  available: [replicate, alibaba]
  default: replicate
  notes: "Add Runway/Pika for better quality"

AUDIO_GEN:
  music: [elevenlabs, replicate]
  sfx: [elevenlabs]
  default: elevenlabs
  notes: "Add Suno for best music generation"

NLP:
  available: [openai, claude, gemini, google_nlp, deepseek, alibaba]
  embeddings: [openai, gemini, google, alibaba]
  default: openai
  notes: "Add Cohere for reranking capability"

MODERATION:
  available: [openai_moderation, google_vision]
  default: openai_moderation
  notes: "Add Azure Content Safety for video/audio moderation"
```

---

## 📋 Recommended API Key Additions

### High Priority (Significant Capability Gaps)
| Provider | Key Needed | Unlocks |
|----------|-----------|---------|
| **Azure Speech** | `AZURE_SPEECH_KEY` | 400+ voices, medical TTS/STT |
| **AssemblyAI** | `ASSEMBLYAI_API_KEY` | Best medical transcription |
| **Runway** | `RUNWAY_API_KEY` | High-quality video generation |
| **Cohere** | `COHERE_API_KEY` | Reranking for RAG |

### Medium Priority (Enhanced Capabilities)
| Provider | Key Needed | Unlocks |
|----------|-----------|---------|
| **Stability AI** | `STABILITY_API_KEY` | ControlNet, audio stems |
| **Deepgram** | `DEEPGRAM_API_KEY` | Fastest real-time STT |
| **Suno** | `SUNO_API_KEY` | Best music generation |
| **Azure Doc Intel** | `AZURE_FORM_RECOGNIZER_KEY` | Best forms/tables OCR |

### Low Priority (Fallback/Enterprise)
| Provider | Key Needed | Unlocks |
|----------|-----------|---------|
| **AWS (all)** | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | Enterprise fallback for all services |
| **Mistral** | `MISTRAL_API_KEY` | Alternative LLM |
| **Groq** | `GROQ_API_KEY` | Fastest LLM inference |

---

## 📋 Implementation Checklist

### Phase 1 - Core Providers ✅ COMPLETE
- [x] OpenAI (LLM, Vision, TTS, STT, Image)
- [x] Claude (LLM, Vision, Translation)
- [x] Gemini (LLM, Vision, TTS, Image)
- [x] DeepSeek (LLM, Vision)
- [x] DeepL (Translation)
- [x] ElevenLabs (TTS, Audio)
- [x] Microsoft (Translation)
- [x] Replicate (Image, Video, Audio)
- [x] Alibaba (Full Suite)

### Phase 2 - Extended Providers (Keys Needed)
- [ ] Azure Speech/Doc Intelligence/Content Safety
- [ ] AWS (Full Suite - Fallback)
- [ ] Cohere (Embeddings, Rerank)
- [ ] AssemblyAI (Medical STT)

### Phase 3 - Specialized Providers (Keys Needed)
- [ ] Stability AI (Image, Audio)
- [ ] Runway (Video)
- [ ] Suno (Music)
- [ ] Pika Labs (Video)
- [ ] Deepgram (Real-time STT)

### Phase 4 - Enterprise/Premium (Keys Needed)
- [ ] Midjourney (Image - no API yet)
- [ ] Leonardo.AI (Image)
- [ ] OpenAI Sora (Video - waitlist)
