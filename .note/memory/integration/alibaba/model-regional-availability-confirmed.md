# Memory: integration/alibaba/model-regional-availability-confirmed
Updated: 2026-02-10

## Confirmed Model Availability (from Alibaba Rep + Official Docs)

**Source**: Alibaba Cloud rep confirmation + https://www.alibabacloud.com/help/en/model-studio/models

### Key Guidance from Rep
- Singapore region can be used **globally** as fallback when US models unavailable
- Authorize all models in Singapore "Default Workspace" via permission management
- API key guide: https://www.alibabacloud.com/help/en/model-studio/get-api-key

### Model Availability Matrix

| Category | Model | International (Singapore) | China Only (Beijing) |
|----------|-------|:---:|:---:|
| **TTS** | Qwen Speech Synthesis | ✅ | ✅ |
| **TTS** | Qwen Real-time Speech | ✅ | ✅ |
| **TTS** | Qwen Voice Design | ✅ ($0.20/voice, 10 free) | ✅ |
| **TTS** | CosyVoice (v3-plus, v3-flash, v2) | ❌ **CHINA ONLY** | ✅ |
| **STT** | Paraformer | ✅ | ✅ |
| **STT** | Fun-ASR | ✅ | ✅ |
| **LLM** | Qwen-Max, Qwen-Plus, Qwen-Turbo | ✅ | ✅ |
| **Vision** | Qwen-VL | ✅ | ✅ |
| **Video** | Wan 2.6 | ✅ | ✅ |
| **Video** | Wan 2.1 | ✅ | ✅ |
| **Video** | Wan 2.2 S2V (Avatar) | ❌ **CHINA ONLY** | ✅ |
| **Image** | Wanx 2.1 | ❌ **CHINA ONLY** | ✅ |
| **Image** | Wan - animate image | ✅ | ✅ |
| **Avatar** | Wan - digital human | ❌ **CHINA ONLY** | ✅ |
| **Avatar** | LivePortrait, EMO | ❌ **CHINA ONLY** | ✅ |

### Pricing (CosyVoice - China endpoint)
- cosyvoice-v3-plus: $0.286706 / 10K chars
- cosyvoice-v3-flash: $0.14335 / 10K chars  
- cosyvoice-v2: $0.286706 / 10K chars

### TTS Fallback Strategy (Updated)
For international users (non-China):
1. **Qwen Speech Synthesis** (Singapore) — Alibaba's international TTS
2. **Azure Neural** — Primary global TTS with viseme data
3. **ElevenLabs** — Premium voice quality
4. **Google Cloud TTS** — Fallback

For China/CJK users:
1. **CosyVoice v3-plus** (Beijing) — Best quality generative TTS
2. **Sambert** (Beijing) — Legacy but reliable
3. **Qwen Speech Synthesis** — Fallback

### Implementation Notes
- CosyVoice requires `ALIBABA_CHINA_API_KEY` + Beijing endpoint (`dashscope.aliyuncs.com`)
- CosyVoice uses WebSocket (`npm:ws`) for streaming, not REST
- Singapore key (`ALIBABA_SINGAPORE_API_KEY`) works globally for all non-China-only models
- Characters in SSML tags are not billed
- CJK characters count as 2 characters for billing
