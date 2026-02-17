# Memory: integration/alibaba/model-regional-availability-confirmed
Updated: 2026-02-10

## Confirmed Model Availability (from Official Docs + Console)

### TTS: Dual-Region Strategy

**Singapore (International) — `ALIBABA_SINGAPORE_API_KEY`**
- `qwen3-tts-flash` (stable) — $0.10/10K chars, 49 voices, 600 char max input
- `qwen3-tts-flash-realtime` — Streaming, customer service, multilingual
- `qwen3-tts-instruct-flash-realtime` — Emotional control, audiobooks, broadcasting
- `qwen3-tts-vd-realtime-2026-01-15` — Voice Design from text descriptions
- `qwen3-tts-vc-realtime-2026-01-15` — Voice Cloning from audio samples
- Languages: zh (Mandarin + 8 dialects), en, es, ru, it, fr, ko, ja, de, pt

**Beijing (China-Only) — `ALIBABA_CHINA_API_KEY`**
- `cosyvoice-v3-plus` — $0.286706/10K chars, 48kHz, strongest voice cloning
- `cosyvoice-v3-flash` — $0.14335/10K chars, lowest cost, streaming
- `cosyvoice-v2` — $0.286706/10K chars, LaTeX support
- Features: SSML, Instruct, Timestamp, voice cloning, Chinese dialects
- Voice list: https://www.alibabacloud.com/help/en/model-studio/cosyvoice-voice-list
- Connection: WebSocket via `npm:ws` with custom Authorization headers

### Other Models Availability

| Category | Model | Singapore | Beijing |
|----------|-------|:---------:|:-------:|
| **LLM** | Qwen-Max/Plus/Turbo, Qwen3-Max | ✅ | ✅ |
| **Vision** | Qwen-VL | ✅ | ✅ |
| **Video** | Wan 2.6 | ✅ | ✅ |
| **Video** | Wan 2.1 | ✅ | ✅ |
| **Video** | Wan 2.2 S2V (Avatar) | ❌ | ✅ |
| **Image** | Wanx 2.1 | ❌ | ✅ |
| **STT** | Paraformer, Fun-ASR | ✅ | ✅ |

### Character Billing Rules
- CJK character = 2 characters
- English letter/punctuation/space = 1 character
- SSML tag characters = NOT billed

### TTS Model Selection Guide
| Scenario | Recommended |
|----------|-------------|
| Voice design (text description) | qwen3-tts-vd-realtime (Singapore) |
| Voice cloning (audio samples) | qwen3-tts-vc-realtime (Singapore) OR cosyvoice-v3-plus (Beijing) |
| Emotional content / audiobooks | qwen3-tts-instruct-flash-realtime (Singapore) |
| Customer service / bots | qwen3-tts-flash-realtime (Singapore) OR cosyvoice-v3-flash (Beijing) |
| Dialect broadcasting | cosyvoice-v3-flash / cosyvoice-v3-plus (Beijing) |
| Multilingual global | qwen3-tts-flash (Singapore) |

### Implementation Notes
- CosyVoice requires `ALIBABA_CHINA_API_KEY` + Beijing endpoint (`dashscope.aliyuncs.com`)
- CosyVoice uses WebSocket (`npm:ws`) for streaming, not REST
- Singapore key works globally for all non-China-only models
- Qwen3-TTS-Flash uses RESTful API (not WebSocket), outputs wav at 24kHz
