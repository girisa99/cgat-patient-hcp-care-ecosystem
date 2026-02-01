# Alibaba DashScope Complete API Architecture

## Overview

This document covers **ALL Alibaba DashScope AI models** available for the Genie Studio, with complete regional routing, API configurations, and implementation details.

## API Keys Configuration

| Key Name | Region | Endpoint | Required For |
|----------|--------|----------|--------------|
| `ALIBABA_API_KEY` | International (Singapore/Virginia) | `dashscope-intl.aliyuncs.com` | Wan 2.6, Qwen LLM |
| `ALIBABA_CHINA_API_KEY` | China (Beijing) | `dashscope.aliyuncs.com` | CosyVoice, Paraformer, Fun Audio, Wan 2.1, Avatar, 3D |

> **Note**: Both keys are optional but recommended for full model coverage. The edge functions auto-fallback between keys when one is not configured.

---

## Complete Model Catalog

### 🎤 TTS Models (`alibaba-tts`)

| Model ID | Type | Description | Languages | Region |
|----------|------|-------------|-----------|--------|
| `cosyvoice-v2` | TTS | Latest CosyVoice with enhanced quality | ZH, EN, JA, KO | China |
| `cosyvoice-v1` | TTS | Standard CosyVoice | ZH, EN | China |
| `cosyvoice-multilingual` | TTS | Multilingual (15+ languages) | Multi | China |
| `cosyvoice-clone` | TTS | Voice cloning from audio sample | ZH, EN | China |
| `sambert-zhichu` | TTS | Chinese female voice | ZH | China |
| `sambert-zhide` | TTS | Chinese male voice | ZH | China |
| `sambert-zhimiao` | TTS | Chinese sweet female | ZH | China |
| `sambert-zhiyuan` | TTS | Chinese broadcasting male | ZH | China |
| `fun-audio-music` | Music | Text-to-music generation | - | China |
| `fun-audio-sfx` | SFX | Text-to-sound-effects | - | China |
| `fun-audio-ambient` | Ambient | Background/ambient audio | - | China |

**Voice Presets Available**:
- Chinese: `zh-CN-female`, `zh-CN-male`, `zh-CN-child`, `zh-CN-elder-female`, `zh-CN-elder-male`
- English: `en-US-female`, `en-US-male`, `en-GB-female`, `en-GB-male`
- Asian: `ja-JP-female`, `ja-JP-male`, `ko-KR-female`, `ko-KR-male`
- European: `es-ES-female`, `fr-FR-female`, `de-DE-female`, `pt-BR-female`
- Other: `ar-SA-male`, `hi-IN-female`

### 🎙️ STT Models (`alibaba-stt`)

| Model ID | Description | Languages | Features |
|----------|-------------|-----------|----------|
| `paraformer-v2` | Latest with enhanced accuracy | ZH, EN, JA, KO | Punctuation, Timestamps, Diarization |
| `paraformer-realtime` | Real-time streaming | ZH, EN | Streaming, Low-latency |
| `paraformer-mtl` | Multilingual (50+ languages) | Multi | Auto-detect, Punctuation, Timestamps |
| `paraformer-8k` | 8kHz audio (phone calls) | ZH, EN | Telephony, Noise reduction |
| `sensevoice-large` | Emotion & event detection | ZH, EN, JA, KO, Cantonese | Emotion, Sound events, High accuracy |
| `sensevoice-small` | Fast & efficient | ZH, EN | Low-latency, Cost-effective |

### 🎬 Video Models (`alibaba-video-generator`)

| Model ID | Type | Description | Max Duration | Region |
|----------|------|-------------|--------------|--------|
| `wan2.6-t2v` | T2V | Wan 2.6 Text-to-Video (latest) | 10s | International |
| `wan2.6-i2v` | I2V | Wan 2.6 Image-to-Video | 10s | International |
| `wan2.6-flf2v` | FLF2V | First-Last-Frame interpolation | 10s | International |
| `wan2.1-t2v` | T2V | Wan 2.1 Text-to-Video (stable) | 8s | China |
| `wan2.1-i2v` | I2V | Wan 2.1 Image-to-Video | 8s | China |
| `wan2.1-turbo` | T2V | Wan 2.1 Turbo - Fast | 6s | China |
| `wan2.0` | T2V | Wan 2.0 Legacy | 6s | China |

### 🎭 Avatar Models (`alibaba-avatar-generator`)

| Model ID | Description | Input | Output |
|----------|-------------|-------|--------|
| `wan2.2-animate` | Digital human animation | Image + Motion ref | MP4 |
| `wan2.2-s2v` | Speech-to-Video (talking head) | Image + Audio | MP4 |
| `taoavatar` | 3D Gaussian Splatting | Image | GLB/GLTF |
| `mach` | Text-to-3D character (MACH) | Text prompt | GLB/GLTF |

### 🧊 3D Models (`alibaba-3d-generator`)

| Model ID | Description | Input Type | Output |
|----------|-------------|------------|--------|
| `richdreamer` | Image-to-3D mesh with textures | Image | GLB/GLTF/FBX |
| `omni-avatar` | Real-time 3D avatar | Image | GLB/GLTF |
| `3d-animate-hub` | Photo to animated 3D | Image | GLB + Animation |
| `animate3d` | Animate existing 3D models | 3D Model | GLB + Animation |
| `text-to-3d` | Generate 3D from text | Text | GLB/GLTF/OBJ |

---

## Edge Function Mapping

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ALIBABA DASHSCOPE ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                         ┌──────────────────┐                            │
│                         │  Edge Functions  │                            │
│                         └────────┬─────────┘                            │
│                                  │                                      │
│           ┌──────────────────────┼──────────────────────┐               │
│           │                      │                      │               │
│           ▼                      ▼                      ▼               │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐       │
│  │  alibaba-tts    │   │  alibaba-stt    │   │ alibaba-video-  │       │
│  │                 │   │                 │   │ generator       │       │
│  │ • CosyVoice     │   │ • Paraformer    │   │                 │       │
│  │ • Fun Audio     │   │ • SenseVoice    │   │ • Wan 2.6 (Intl)│       │
│  │ • Sambert       │   │ • Multilingual  │   │ • Wan 2.1 (CN)  │       │
│  └────────┬────────┘   └────────┬────────┘   └────────┬────────┘       │
│           │                      │                      │               │
│           ▼                      ▼                      ▼               │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐       │
│  │ alibaba-avatar- │   │  alibaba-3d-    │   │ ai-universal-   │       │
│  │ generator       │   │  generator      │   │ processor       │       │
│  │                 │   │                 │   │ (Qwen LLM)      │       │
│  │ • Wan2.2-Animate│   │ • Richdreamer   │   │                 │       │
│  │ • Wan2.2-S2V    │   │ • OmniAvatar    │   │ • Qwen-Max      │       │
│  │ • TaoAvatar     │   │ • 3D Animate    │   │ • Qwen-Plus     │       │
│  │ • MACH          │   │ • Text-to-3D    │   │ • Qwen-Turbo    │       │
│  └────────┬────────┘   └────────┬────────┘   └────────┬────────┘       │
│           │                      │                      │               │
│           └──────────────────────┼──────────────────────┘               │
│                                  │                                      │
│           ┌──────────────────────┴──────────────────────┐               │
│           │                                             │               │
│           ▼                                             ▼               │
│  ┌─────────────────────────────┐    ┌─────────────────────────────┐    │
│  │     CHINA (Beijing)         │    │    INTERNATIONAL            │    │
│  │  dashscope.aliyuncs.com     │    │  dashscope-intl.aliyuncs.com│    │
│  │                             │    │                             │    │
│  │  ALIBABA_CHINA_API_KEY      │    │  ALIBABA_API_KEY            │    │
│  │                             │    │                             │    │
│  │  • CosyVoice (TTS)          │    │  • Wan 2.6 T2V/I2V/FLF2V    │    │
│  │  • Paraformer (STT)         │    │  • Qwen LLM (Max/Plus/Turbo)│    │
│  │  • Fun Audio (Music/SFX)    │    │  • Qwen-VL (Vision)         │    │
│  │  • Wan 2.1 Video            │    │  • Qwen-MT (Translation)    │    │
│  │  • All Avatar models        │    │                             │    │
│  │  • All 3D models            │    │                             │    │
│  └─────────────────────────────┘    └─────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## API Usage Examples

### TTS - CosyVoice

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/alibaba-tts \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, welcome to Genie Studio!",
    "language": "en-US-female",
    "format": "mp3",
    "speed": 1.0
  }'
```

### TTS - Fun Audio (Music Generation)

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/alibaba-tts \
  -H "Content-Type: application/json" \
  -d '{
    "model": "fun-audio-music",
    "musicPrompt": "upbeat corporate background music",
    "duration": 30,
    "genre": "corporate",
    "mood": "positive"
  }'
```

### STT - Paraformer

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/alibaba-stt \
  -H "Content-Type: application/json" \
  -d '{
    "audioUrl": "https://example.com/audio.wav",
    "model": "paraformer-v2",
    "enablePunctuation": true,
    "enableTimestamps": true,
    "enableSpeakerDiarization": true
  }'
```

### STT - SenseVoice with Emotion Detection

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/alibaba-stt \
  -H "Content-Type: application/json" \
  -d '{
    "audioUrl": "https://example.com/audio.wav",
    "model": "sensevoice-large",
    "enableEmotionDetection": true,
    "enableSoundEventDetection": true
  }'
```

### Video - Wan 2.6

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/alibaba-video-generator \
  -H "Content-Type: application/json" \
  -d '{
    "model": "wan2.6-t2v",
    "prompt": "A serene beach at sunset with gentle waves",
    "duration": 6,
    "resolution": "1080p",
    "aspectRatio": "16:9"
  }'
```

### Avatar - Talking Head

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/alibaba-avatar-generator \
  -H "Content-Type: application/json" \
  -d '{
    "model": "wan2.2-s2v",
    "sourceImage": "https://example.com/portrait.jpg",
    "audioUrl": "https://example.com/speech.mp3"
  }'
```

### 3D - Text-to-3D

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/alibaba-3d-generator \
  -H "Content-Type: application/json" \
  -d '{
    "model": "text-to-3d",
    "prompt": "A cute cartoon robot with blue accents",
    "outputFormat": "glb",
    "style": "stylized"
  }'
```

---

## Cost Estimates

| Service | Model | Pricing |
|---------|-------|---------|
| TTS | CosyVoice | ~$0.002/1K characters |
| TTS | Fun Audio | ~$0.01/second of audio |
| STT | Paraformer | ~$0.001/minute |
| STT | SenseVoice | ~$0.002/minute |
| Video | Wan 2.6 | ~$0.08/second |
| Video | Wan 2.1 | ~$0.06/second |
| Avatar | Wan2.2-Animate | ~$0.05/second |
| Avatar | TaoAvatar | ~$0.10/generation |
| 3D | Richdreamer | ~$0.20/generation |
| 3D | MACH | ~$0.15/generation |

---

## Troubleshooting

### "Account Abnormal" Status
1. Go to [Alibaba Cloud Console](https://www.alibabacloud.com)
2. Complete **Identity Verification**
3. Add **Payment Method**
4. Ensure sufficient **Balance**

### "Model Not Exist" Error
- Model is locked to a specific region
- Verify you're using the correct API key:
  - **China models**: Use `ALIBABA_CHINA_API_KEY`
  - **International models**: Use `ALIBABA_API_KEY`

### "AccessDenied" Error
- Account may not have access to the model
- Some models require enterprise agreement
- Check model availability in your region's console

---

## Related Documentation

- [DashScope Official Docs](https://help.aliyun.com/zh/dashscope/)
- [Wan Video Models](https://help.aliyun.com/zh/dashscope/developer-reference/wan)
- [CosyVoice TTS](https://help.aliyun.com/zh/dashscope/developer-reference/cosyvoice)
- [Paraformer STT](https://help.aliyun.com/zh/dashscope/developer-reference/paraformer)

---

**Last Updated**: 2026-02-01  
**Status**: Production Ready
