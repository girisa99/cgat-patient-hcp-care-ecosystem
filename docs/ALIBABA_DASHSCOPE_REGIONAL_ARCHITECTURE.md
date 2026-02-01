# Alibaba DashScope Regional API Architecture

## Overview

Alibaba's DashScope platform uses **region-locked models**, meaning certain AI capabilities are only available from specific geographic endpoints. This document explains how to configure and route requests correctly.

## Regional API Keys

| Key Name | Region | Endpoint | Use Case |
|----------|--------|----------|----------|
| `ALIBABA_API_KEY` | Singapore/Virginia (International) | `dashscope-intl.aliyuncs.com` | Qwen LLM, Qwen-VL, Qwen-MT |
| `ALIBABA_CHINA_API_KEY` | China (Beijing) | `dashscope.aliyuncs.com` | CosyVoice, Paraformer, Wan, 3D models |

## Model Availability by Region

### International Region (Singapore/Virginia)
**Endpoint:** `https://dashscope-intl.aliyuncs.com`
**API Key:** `ALIBABA_API_KEY`

| Model | Type | Description |
|-------|------|-------------|
| Qwen-Max | LLM | Latest flagship model |
| Qwen-Plus | LLM | Balanced performance/cost |
| Qwen-Turbo | LLM | Fast inference |
| Qwen-VL | Vision | Image understanding, OCR |
| Qwen-MT | Translation | Machine translation |
| Wanx-v1 | Image | Basic image generation |

### China (Beijing) Region - EXCLUSIVE MODELS
**Endpoint:** `https://dashscope.aliyuncs.com`
**API Key:** `ALIBABA_CHINA_API_KEY`

| Model | Type | Description |
|-------|------|-------------|
| **CosyVoice** | TTS | High-fidelity Chinese/multilingual speech |
| **Paraformer** | STT | Real-time speech recognition |
| **Wan 2.1/2.2** | Video | Text-to-video, Image-to-video |
| **Wan2.2-Animate** | Avatar | Digital human animation |
| **Wan2.2-S2V** | Avatar | Speech-to-video (talking head) |
| **TaoAvatar** | 3D | 3D Gaussian Splatting avatars |
| **MACH** | 3D | Text-to-3D character |
| **Richdreamer** | 3D | Image-to-3D mesh |
| **OmniAvatar** | 3D | Real-time 3D avatars |
| **3D Animate Hub** | 3D | Photo to animated 3D |
| **Animate3D** | 3D | 3D model animation |

## Edge Function Mapping

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ALIBABA DASHSCOPE ROUTING                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐        ┌──────────────────────────────────┐   │
│  │  International  │        │      China (Beijing) ONLY        │   │
│  │   (Singapore)   │        │                                  │   │
│  └────────┬────────┘        └───────────────┬──────────────────┘   │
│           │                                 │                       │
│  ALIBABA_API_KEY              ALIBABA_CHINA_API_KEY                │
│           │                                 │                       │
│           ▼                                 ▼                       │
│  dashscope-intl.aliyuncs.com    dashscope.aliyuncs.com            │
│           │                                 │                       │
│           │                                 │                       │
│  ┌────────┴────────┐        ┌───────────────┴──────────────────┐   │
│  │ ai-universal-   │        │ alibaba-tts (CosyVoice)          │   │
│  │ processor       │        │ alibaba-stt (Paraformer)         │   │
│  │ (Qwen LLM)      │        │ alibaba-video-generator (Wan)    │   │
│  │                 │        │ alibaba-avatar-generator         │   │
│  │                 │        │ alibaba-3d-generator             │   │
│  └─────────────────┘        └──────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Edge Functions

### TTS - `alibaba-tts`
- **Model:** CosyVoice
- **Region:** China (Beijing) ONLY
- **Key:** `ALIBABA_CHINA_API_KEY`
- **Features:** Chinese/multilingual voices, natural prosody

### STT - `alibaba-stt`
- **Model:** Paraformer
- **Region:** China (Beijing) ONLY  
- **Key:** `ALIBABA_CHINA_API_KEY`
- **Features:** Real-time transcription, 50+ languages

### Video - `alibaba-video-generator`
- **Models:** Wan 2.1, Wan 2.1-Turbo
- **Region:** China (Beijing) ONLY
- **Key:** `ALIBABA_CHINA_API_KEY`
- **Features:** Text-to-video, Image-to-video, 4K output

### Avatar - `alibaba-avatar-generator`
- **Models:** Wan2.2-Animate, Wan2.2-S2V, TaoAvatar, MACH
- **Region:** China (Beijing) ONLY
- **Key:** `ALIBABA_CHINA_API_KEY`
- **Features:** Digital humans, lip-sync, 3D avatars

### 3D - `alibaba-3d-generator`
- **Models:** Richdreamer, OmniAvatar, 3D Animate Hub, Animate3D
- **Region:** China (Beijing) ONLY
- **Key:** `ALIBABA_CHINA_API_KEY`
- **Features:** Image-to-3D, text-to-3D, 3D animation

## Setup Instructions

### 1. Create China (Beijing) API Key

1. Log in to [Alibaba Cloud Console](https://www.alibabacloud.com)
2. Navigate to **DashScope** (Model Studio)
3. **Switch region to China (Beijing)** in the top-right dropdown
4. Go to **API Keys** section
5. Create a new API key (will start with `sk-`)
6. Copy the key immediately (only shown once)

### 2. Activate Models in DashScope

1. In DashScope console (Beijing region), go to **Model Square**
2. Find and **Enable** each model you need:
   - CosyVoice (TTS)
   - Paraformer (STT)
   - Wan 2.1/2.2 (Video)
   - TaoAvatar (3D)
   - MACH (Text-to-3D)
   - Richdreamer (Image-to-3D)

### 3. Add Secret to Supabase

Add `ALIBABA_CHINA_API_KEY` in [Edge Function Secrets](https://supabase.com/dashboard/project/ithspbabhmdntioslfqe/settings/functions)

## Error Handling

### AccessDenied Error
```json
{
  "code": "AccessDenied",
  "message": "Access to model is denied"
}
```
**Solution:** The model is not activated in DashScope Model Square. Enable it in the China (Beijing) region console.

### InvalidApiKey Error
```json
{
  "code": "InvalidApiKey",
  "message": "Invalid API key"
}
```
**Solution:** Ensure you're using a Beijing-region API key (starts with `sk-`) for China-only models.

## Cost Estimates

| Service | Model | Cost |
|---------|-------|------|
| TTS | CosyVoice | ~$0.002/1K chars |
| STT | Paraformer | ~$0.001/minute |
| Video | Wan 2.1 | ~$0.08/second |
| Avatar | Wan2.2-Animate | ~$0.05/second |
| 3D | TaoAvatar | ~$0.10/generation |
| 3D | MACH | ~$0.15/generation |

## Fallback Strategy

All edge functions return a `fallback: true` flag when Alibaba fails, allowing the frontend to route to alternative providers:

```typescript
if (result.fallback) {
  // Route to ModelsLab, Replicate, or other providers
}
```

## Testing

Test each endpoint:

```bash
# TTS
curl -X POST https://ithspbabhmdntioslfqe.supabase.co/functions/v1/alibaba-tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world", "language": "en-US-female"}'

# Video
curl -X POST https://ithspbabhmdntioslfqe.supabase.co/functions/v1/alibaba-video-generator \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A sunset over the ocean", "duration": 4}'

# 3D
curl -X POST https://ithspbabhmdntioslfqe.supabase.co/functions/v1/alibaba-3d-generator \
  -H "Content-Type: application/json" \
  -d '{"model": "text-to-3d", "prompt": "A red dragon"}'
```

---

**Last Updated:** 2026-02-01
**Status:** Production Ready (pending model activation)
