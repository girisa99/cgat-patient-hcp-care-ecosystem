# Alibaba Cloud Singapore Hub — Production Readiness Checklist

**Last Updated:** 2026-02-10  
**Status:** Free Quota Active → Pay-As-You-Go Migration Needed  
**Region:** Singapore (ap-southeast-1)  
**Console:** https://modelstudio.console.alibabacloud.com/ap-southeast-1/

---

## 1. Current Activation Status ✅

| Category | Models Enabled | Status |
|----------|---------------|--------|
| **Large Language Models** | 86 (82 with sufficient quota) | ✅ Active |
| **Speech Models (TTS/STT)** | 32 | ✅ Active |
| **Visual Models (Wan 2.6)** | 7+ (T2I, T2V, I2V, R2V, flash variants) | ✅ Active |
| **Multimodal Models** | 11 | ✅ Active |
| **Embedding Models** | 5 | ✅ Active |

### Key Models Verified Active
- `qwen3-tts-flash` — TTS (9,908/10,000 free quota remaining)
- `qwen3-asr-flash` — STT (36,000 free quota)
- `qwen3-omni-30b-a3b-captioner` — Captioning (1,000,000 free quota)
- `qwen-vl-plus`, `qwen-vl-max` — Vision
- `qwen-turbo`, `qwen-plus`, `qwen-max`, `qwen3-max` — LLMs
- `wan2.6-t2i`, `wan2.6-t2v`, `wan2.6-i2v`, `wan2.6-r2v` — Visual generation

---

## 2. Pay-As-You-Go Migration Steps

### Step 1: Add Payment Method
1. Go to **Alibaba Cloud Console** → **Billing Management** → **Payment Method**
2. Add a credit card or PayPal
3. URL: https://usercenter2-intl.aliyun.com/billing/payment-method

### Step 2: Disable "Free Quota Only" per Model
1. Go to **Model Studio Console** → **Model Usage** → **Free Quota**
2. For each model category tab (LLM, Visual, Speech, Multimodal, Embedding):
   - Find each model with the **"Free Quota Only"** toggle enabled (blue)
   - **Turn OFF** the "Free Quota Only" toggle
   - This switches the model to **pay-as-you-go** billing
3. Repeat for ALL models you want to use in production

> ⚠️ **WARNING**: With "Free Quota Only" ON, the service returns **403 error** once free quota is exhausted. Turning it OFF allows unlimited usage at listed prices.

### Step 3: Enable Batch Operations (Async Calls)
1. Go to **Model Studio Console** → **Batches**
2. Click **Create Batch**
3. Enable batch/async mode for these models:
   - `wan2.6-t2i` (Image generation — async required)
   - `wan2.6-t2v` (Video generation — async required)
   - Any other models requiring async processing
4. Without this, you'll get: `"user api does not support asynchronous calls"` error

### Step 4: Verify Rate Limits
1. Go to **Model Studio Console** → **Rate Limit Increase**
2. Check current limits for high-traffic models:
   - `qwen3-tts-flash` — TTS (check requests/min)
   - `qwen-turbo` — LLM (check tokens/min)
   - `wan2.6-t2i` — Image (check requests/min)
3. Request increases if needed for production load

---

## 3. Pricing Reference (Singapore — Pay-As-You-Go)

### LLM Models
| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|----------------------|------------------------|
| qwen-turbo | $0.30 | $0.60 |
| qwen-plus | $0.80 | $2.00 |
| qwen-max | $2.00 | $6.00 |
| qwen3-max | $2.00 | $6.00 |

### TTS Models
| Model | Price |
|-------|-------|
| qwen3-tts-flash | ~$0.15 / 10K characters |
| qwen3-tts-flash-realtime | ~$0.15 / 10K characters |

### Visual Models (Wan 2.6)
| Model | Price |
|-------|-------|
| wan2.6-t2i | ~$0.02 per image |
| wan2.6-t2v | ~$0.10 per video (5s) |
| wan2.6-i2v | ~$0.10 per video (5s) |

### Embedding Models
| Model | Price |
|-------|-------|
| text-embedding-v3 | $0.0007 / 1K tokens |

> Note: Prices are approximate. Check https://www.alibabacloud.com/help/en/model-studio/models for current pricing.

---

## 4. API Keys & Secrets Configuration

| Secret Name | Region | Endpoint | Status |
|-------------|--------|----------|--------|
| `ALIBABA_SINGAPORE_API_KEY` | Singapore | `dashscope-intl.aliyuncs.com` | ✅ Configured |
| `ALIBABA_API_KEY` | Virginia | `dashscope-intl.aliyuncs.com` | ✅ Configured |
| `ALIBABA_CHINA_API_KEY` | Beijing | `dashscope.aliyuncs.com` | ✅ Configured |

### How to Get/Rotate API Keys
1. Go to **Model Studio Console** → **Key Management** (bottom-left sidebar)
2. Create or copy your API key
3. Update the corresponding secret in Lovable Cloud / Supabase secrets

---

## 5. Tri-Region Fallback Architecture

```
International Request Flow:
Singapore Key → Virginia Key → (China Key as last resort)

China-Only Models (CosyVoice, Wanx 2.1, Wan 2.2 S2V):
China Key → Singapore Key → Virginia Key

TTS Fallback Chain:
Qwen3-TTS (Singapore) → Azure Neural → ElevenLabs → Google TTS
```

### Edge Functions Using Alibaba
- `ai-universal-processor` — LLM routing, image/video generation
- `alibaba-tts` — Direct TTS calls
- `multi-provider-tts` — TTS with provider fallback
- `alibaba-video-generator` — Wan 2.6 video generation
- `alibaba-avatar-generator` — Avatar generation (China models)
- `process-thumbnail-queue` — Thumbnail generation via Wan 2.6

---

## 6. TTS Model Availability — Dual Region Strategy

### Region A: Singapore (International) — `ALIBABA_SINGAPORE_API_KEY`
**Endpoint:** `dashscope-intl.aliyuncs.com`

| Model | Version | Price | Max Input | Languages |
|-------|---------|-------|-----------|-----------|
| `qwen3-tts-flash` | Stable (= 2025-09-18) | $0.10 / 10K chars | 600 chars | zh (Mandarin + 8 dialects), en, es, ru, it, fr, ko, ja, de, pt |
| `qwen3-tts-flash-2025-11-27` | Snapshot | $0.10 / 10K chars | 600 chars | Same |
| `qwen3-tts-flash-2025-09-18` | Snapshot | $0.10 / 10K chars | 600 chars | Same |

**Realtime Models (WebSocket, Singapore):**
| Model | Use Case |
|-------|----------|
| `qwen3-tts-flash-realtime` | Streaming TTS, customer service, multilingual |
| `qwen3-tts-instruct-flash-realtime` | Emotional content, audiobooks, broadcasting — supports instruction control |
| `qwen3-tts-vd-realtime-2026-01-15` | Voice Design — create voices from text descriptions (no audio samples) |
| `qwen3-tts-vc-realtime-2026-01-15` | Voice Cloning — replicate voices from audio samples |

**Qwen3-TTS-Flash features:** 49 voices, RESTful API + SDK, wav output, 24 kHz, no SSML, no timestamps.

### Region B: Beijing (China-Only) — `ALIBABA_CHINA_API_KEY`
**Endpoint:** `dashscope.aliyuncs.com` (WebSocket via `npm:ws`)

| Model | Price | Use Case | Notes |
|-------|-------|----------|-------|
| `cosyvoice-v3-plus` | $0.286706 / 10K chars | Brand voice cloning, 48 kHz high-quality | Strongest cloning, highest cost |
| `cosyvoice-v3-flash` | $0.14335 / 10K chars | Customer service, streaming, cost-effective | Lowest cost, fast response |
| `cosyvoice-v2` | $0.286706 / 10K chars | Education, LaTeX formulas | Legacy but feature-rich |

**CosyVoice features:** SSML support, Instruct mode, Timestamp output, voice cloning, Chinese dialects (Cantonese, Northeastern, Shaanxi, etc.)

**CosyVoice Voice List:** https://www.alibabacloud.com/help/en/model-studio/cosyvoice-voice-list

**CosyVoice Scenario Guide:**
| Scenario | Recommended Model |
|----------|-------------------|
| Brand voice customization (text description) | Use Qwen3-TTS-VD (Singapore) |
| Brand voice cloning (audio samples) | Use Qwen3-TTS-VC (Singapore) OR cosyvoice-v3-plus (Beijing) |
| Smart customer service / Voice assistant | cosyvoice-v3-flash |
| Dialect broadcasting (Cantonese, Northeastern, etc.) | cosyvoice-v3-flash / cosyvoice-v3-plus |
| Educational (LaTeX formulas) | cosyvoice-v2 / cosyvoice-v3-flash |
| Structured voice (SSML control) | cosyvoice-v3-plus / cosyvoice-v3-flash / cosyvoice-v2 |
| Audio-text alignment / timestamps | cosyvoice-v3-flash / cosyvoice-v3-plus / cosyvoice-v2 |
| Multilingual global markets | cosyvoice-v3-flash / cosyvoice-v3-plus |

### Character Billing Rules (Both Regions)
- Each CJK character (Chinese, Japanese Kanji, Korean Hanja) = **2 characters**
- Each English letter, punctuation, or space = **1 character**
- SSML tag characters are **NOT billed**

---

## 7. Other China-Only Models

These models require `ALIBABA_CHINA_API_KEY` and Beijing endpoint:

| Model | Category | Fallback Provider |
|-------|----------|-------------------|
| CosyVoice (v2, v3-plus, v3-flash) | TTS (WebSocket) | Qwen3-TTS-Flash (Singapore) |
| Wanx 2.1 | Image Generation | Wan 2.6 T2I (Singapore) |
| Wan 2.2 S2V | Avatar | ModelsLab (International) |
| LivePortrait / EMO | Avatar | ModelsLab (International) |

---

## 8. TTS Fallback Chain (Production)

```
International Users:
  Qwen3-TTS-Flash (Singapore) → Azure Neural → ElevenLabs → Google TTS

CJK/China Users:
  CosyVoice v3-flash (Beijing) → Qwen3-TTS-Flash (Singapore) → Azure Neural

Voice Design/Cloning:
  Qwen3-TTS-VD/VC (Singapore) → CosyVoice v3-plus (Beijing) → ElevenLabs
```

---

## 9. Monitoring & Alerts

### Console Monitoring
- **Model Usage**: Track quota consumption per model
- **Monitoring Tab**: Real-time API call metrics
- **Alerts**: Configure spend/usage alerts

### Recommended Alerts
1. Set **billing alert** at $50, $100, $500 thresholds
2. Set **quota usage alert** at 80% for high-traffic models
3. Monitor **error rates** for 403/429 responses

---

## 10. Production Go-Live Checklist

- [ ] Payment method added to Alibaba Cloud account (International)
- [ ] Payment method added to Alibaba Cloud account (China/Aliyun)
- [ ] "Free Quota Only" toggle disabled for all production models (Singapore)
- [ ] CosyVoice models activated on Beijing DashScope portal
- [ ] Batch Operations enabled for async models (Wan 2.6 T2I/T2V)
- [ ] Rate limits reviewed and increased if needed
- [ ] Billing alerts configured
- [ ] API keys rotated (if shared during development)
- [ ] Edge functions tested with pay-as-you-go billing
- [ ] Fallback chains verified (Singapore → Virginia → Beijing)
- [ ] Monitoring dashboard bookmarked

---

## 11. Quick Reference Links

- **Console (Singapore)**: https://modelstudio.console.alibabacloud.com/ap-southeast-1/
- **Console (Beijing)**: https://bailian.console.alibabacloud.com/cn-beijing
- **Billing**: https://usercenter2-intl.aliyun.com/billing/payment-method
- **Model Docs**: https://www.alibabacloud.com/help/en/model-studio/models
- **CosyVoice Voice List**: https://www.alibabacloud.com/help/en/model-studio/cosyvoice-voice-list
- **API Key Guide**: https://www.alibabacloud.com/help/en/model-studio/get-api-key
- **Pricing**: https://www.alibabacloud.com/help/en/model-studio/billing
