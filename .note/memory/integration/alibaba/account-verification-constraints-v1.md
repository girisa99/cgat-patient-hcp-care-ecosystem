# Memory: integration/alibaba/account-verification-constraints-v1
Updated: just now

## Alibaba Account Status: VERIFIED ✅

Three API keys confirmed operational:

- **ALIBABA_CHINA_API_KEY** (Beijing): `dashscope.aliyuncs.com`
- **ALIBABA_SINGAPORE_API_KEY** (Singapore): `dashscope-intl.aliyuncs.com`
- **ALIBABA_API_KEY** (Virginia): `dashscope-intl.aliyuncs.com`

## Live Diagnostic Results (2026-02-09, Run 2 — Corrected Paths)

### ✅ FULLY WORKING — All 3 Regions (China + Singapore + Virginia)

| Model | Model ID | API Path | China | Singapore | Virginia |
|-------|----------|----------|-------|-----------|---------|
| **Qwen LLM** | `qwen-max` | `/compatible-mode/v1/chat/completions` | ✅ | ✅ | ✅ |
| **Qwen VL (Vision)** | `qwen-vl-max` | `/compatible-mode/v1/chat/completions` | ✅ | ✅ | ✅ |
| **Wan 2.6 Video (T2V)** | `wan2.6-t2v` | `/api/v1/services/aigc/video-generation/video-synthesis` | ✅ | ✅ | ✅ |

### ✅ WORKING — International Only (Singapore + Virginia)

| Model | Model ID | API Path | China | Singapore | Virginia |
|-------|----------|----------|-------|-----------|---------|
| **Wan 2.1 Video (T2V Turbo)** | `wan2.1-t2v-turbo` | `/api/v1/services/aigc/video-generation/video-synthesis` | ❌ Not found | ✅ | ✅ |
| **Wan 2.1 Video (T2V Plus)** | `wan2.1-t2v-plus` | `/api/v1/services/aigc/video-generation/video-synthesis` | ❌ Not found | ✅ | ✅ |

### ✅ WORKING — China Only

| Model | Model ID | API Path | China | Singapore | Virginia |
|-------|----------|----------|-------|-----------|---------|
| **Wanx 2.1 Image** | `wanx2.1-t2i-turbo` | `/api/v1/services/aigc/text2image/image-synthesis` | ✅ | ❌ | ❌ |

### 🔒 ACCESS_DENIED — Exists on China but needs portal activation

| Model | Model ID | China | Singapore | Virginia |
|-------|----------|-------|-----------|---------|
| **Sambert TTS (Female)** | `sambert-zhichu-v1` | 🔒 Access Denied | ❌ Not deployed | ❌ Not deployed |
| **Sambert TTS (Male)** | `sambert-zhide-v1` | 🔒 Access Denied | ❌ Not deployed | ❌ Not deployed |
| **Wanx Image Gen (v1)** | `wanx-v1` | 🔒 Access Denied | ❌ Not deployed | ❌ Not deployed |
| **CosyVoice TTS** | `cosyvoice-v1` | 🔒 Access Denied | ❌ Not deployed | ❌ Not deployed |
| **Paraformer STT** | `paraformer-v2` | 🔒 Access Denied | ❌ Not deployed | ❌ Not deployed |

### ⚠️ WRONG API PATH — China Only, Needs Path Fix

| Model | Model ID | China | Notes |
|-------|----------|-------|-------|
| **Wan 2.2 Avatar (S2V)** | `wan2.2-s2v` | ⚠️ URL error | Exists but API path needs DashScope docs check |

### ❌ NOT FOUND — Model ID likely incorrect

| Model | Notes |
|-------|-------|
| **Qwen Audio** (`qwen2-audio-instruct`) | 404 all endpoints — model ID may be wrong |

## Production Routing Matrix (Updated)

### What Works NOW — 8 Models Across Regions

| Model | Capability | CJK (China key) | Asia/EU/MEA/Africa/India (SG key) | Americas/Western (VA key) | Fallback |
|-------|-----------|------------------|-----------------------------------|---------------------------|----------|
| **Qwen LLM** | Text/Chat | ✅ China | ✅ Singapore | ✅ Virginia | GPT-4o |
| **Qwen VL** | Vision | ✅ China | ✅ Singapore | ✅ Virginia | Gemini Vision |
| **Wan 2.6 T2V** | Video Gen | ✅ China | ✅ Singapore | ✅ Virginia | Vertex Veo 3 |
| **Wan 2.1 Turbo** | Video Gen | ❌ → SG fallback | ✅ Singapore | ✅ Virginia | Vertex Veo 3 |
| **Wan 2.1 Plus** | Video Gen | ❌ → SG fallback | ✅ Singapore | ✅ Virginia | Vertex Veo 3 |
| **Wanx 2.1 Image** | Image Gen | ✅ China | ❌ → China key* | ❌ → China key* | Gemini Imagen 3 |

*China key used cross-region because model only deployed in Beijing

### What Needs Activation/Fix

| Model | Capability | Status | Interim Provider |
|-------|-----------|--------|-----------------|
| **Sambert TTS** | TTS (REST) | 🔒 Needs activation | Azure Neural TTS |
| **CosyVoice TTS** | TTS (WebSocket) | 🔒 + WebSocket incompatible | Azure Neural TTS |
| **Paraformer STT** | Speech-to-Text | 🔒 Needs activation | Deepgram Nova 2 |
| **Wan 2.2 S2V** | Avatar/Lip-sync | ⚠️ Path fix needed | ModelsLab / Azure Viseme |
| **Wanx v1** | Image Gen (legacy) | 🔒 Needs activation | Use Wanx 2.1 instead |

### Non-DashScope Models (Research / No Public API)

| Model | Status | Alternative |
|-------|--------|-------------|
| **MACH (Photo-to-Avatar)** | No public DashScope API | Meshy AI |
| **RichDreamer (3D)** | Research paper, no API | Meshy AI |
| **OmniAvatar** | No public DashScope API | Replicate |
| **TaoAvatar (AR)** | No public DashScope API | None |
| **FunAudio (Music/SFX)** | No public DashScope API | None |

## Tri-Region Routing Strategy

| User Region | API Key | Endpoint |
|-------------|---------|----------|
| **CJK** (China, Japan, Korea, HK, Taiwan) | `ALIBABA_CHINA_API_KEY` | `dashscope.aliyuncs.com` |
| **Asia/EU/MEA/Africa/India** | `ALIBABA_SINGAPORE_API_KEY` | `dashscope-intl.aliyuncs.com` |
| **Western/Americas** | `ALIBABA_API_KEY` | `dashscope-intl.aliyuncs.com` |

## Action Items

1. ~~Fix Wan 2.6/2.1 video API paths~~ ✅ DONE — Correct path: `/video-generation/video-synthesis`
2. **Fix Wan 2.2 S2V API path** — Still returns URL error on China endpoint
3. **Activate on China portal**: Sambert, Paraformer, CosyVoice, Wanx v1
4. **Verify Qwen Audio model ID** — `qwen2-audio-instruct` returns 404, may need different ID
5. **Keep fallbacks**: Azure Neural (TTS), Deepgram (STT), Vertex Veo 3 (Video), Meshy (3D)
6. **Note**: MACH, RichDreamer, OmniAvatar, TaoAvatar, FunAudio have NO public DashScope API — use alternatives

### CosyVoice Permanent Constraint

CosyVoice TTS requires WebSocket — incompatible with Deno/Supabase Edge Functions. Sambert REST is the permanent alternative. Azure Neural is interim until Sambert activation.

### Key Discovery: Wan 2.1 is International-Only

Wan 2.1 models (Turbo & Plus) are deployed on **international endpoints only** (Singapore + Virginia), NOT on China/Beijing. For CJK users needing Wan 2.1, route through Singapore key.
