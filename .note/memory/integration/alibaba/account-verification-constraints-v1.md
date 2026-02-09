# Memory: integration/alibaba/account-verification-constraints-v1
Updated: just now

## Alibaba Account Status: VERIFIED ✅

Three API keys confirmed operational:

- **ALIBABA_CHINA_API_KEY** (Beijing): `dashscope.aliyuncs.com`
- **ALIBABA_SINGAPORE_API_KEY** (Singapore): `dashscope-intl.aliyuncs.com`
- **ALIBABA_API_KEY** (Virginia): `dashscope-intl.aliyuncs.com`

## Live Diagnostic Results (2026-02-09)

### ✅ FULLY WORKING — All 3 Endpoints (China + Singapore + Virginia)

| Model | Model ID | API Path | Status |
|-------|----------|----------|--------|
| **Qwen LLM** | `qwen-max` | `/compatible-mode/v1/chat/completions` | ✅ All 3 regions |
| **Qwen VL (Vision)** | `qwen-vl-max` | `/compatible-mode/v1/chat/completions` | ✅ All 3 regions |

### ✅ WORKING — China Only

| Model | Model ID | API Path | Status |
|-------|----------|----------|--------|
| **Wanx 2.1 Image** | `wanx2.1-t2i-turbo` | `/api/v1/services/aigc/text2image/image-synthesis` | ✅ China only |

### 🔒 ACCESS_DENIED — Exists but needs activation (China portal)

| Model | Model ID | China | Singapore | Virginia |
|-------|----------|-------|-----------|---------|
| **Sambert TTS (Female)** | `sambert-zhichu-v1` | 🔒 Access Denied | ❌ Not deployed | ❌ Not deployed |
| **Sambert TTS (Male)** | `sambert-zhide-v1` | 🔒 Access Denied | ❌ Not deployed | ❌ Not deployed |
| **Wanx v1 Image** | `wanx-v1` | 🔒 Access Denied | ❌ Not deployed | ❌ Not deployed |
| **CosyVoice TTS** | `cosyvoice-v1` | 🔒 Access Denied | ❌ Not deployed | ❌ Not deployed |
| **Paraformer STT** | `paraformer-v2` | 🔒 Access Denied | ❌ Not deployed | ❌ Not deployed |

### ⚠️ WRONG API PATH — Model may exist, URL needs correction

| Model | Model ID | China | Singapore | Virginia | Notes |
|-------|----------|-------|-----------|---------|-------|
| **Wan 2.6 Video** | `wan2.6-t2v` | ⚠️ URL error | ⚠️ URL error | ⚠️ URL error | Path needs DashScope docs check |
| **Wan 2.2 Avatar** | `wan2.2-s2v` | ⚠️ URL error | ❌ Not deployed | ❌ Not deployed | China-only, path wrong |
| **Wan 2.1 Turbo** | `wan2.1-t2v-turbo` | ❌ Not found | ⚠️ URL error | ⚠️ URL error | Intl maybe, path wrong |
| **Wan 2.1 Plus** | `wan2.1-t2v-plus` | ❌ Not found | ⚠️ URL error | ⚠️ URL error | Intl maybe, path wrong |

### ❌ NOT FOUND — Model ID likely incorrect or not yet deployed

| Model | Notes |
|-------|-------|
| **Qwen Audio** (`qwen2-audio-instruct`) | 404 all endpoints — model ID may be wrong |

## Tri-Region Routing Strategy

| User Region | API Key | Endpoint |
|-------------|---------|----------|
| **CJK** (China, Japan, Korea, HK, Taiwan) | `ALIBABA_CHINA_API_KEY` | `dashscope.aliyuncs.com` |
| **Asia/EU/MEA/Africa/India** | `ALIBABA_SINGAPORE_API_KEY` | `dashscope-intl.aliyuncs.com` |
| **Western/Americas** | `ALIBABA_API_KEY` | `dashscope-intl.aliyuncs.com` |

### Current Routing Decision

| Model | CJK | Asia/EU/MEA/Africa/India | Western | Fallback |
|-------|-----|--------------------------|---------|----------|
| **Qwen LLM** | China key | Singapore key | Virginia key | GPT-4o |
| **Qwen VL** | China key | Singapore key | Virginia key | Gemini Vision |
| **Wanx 2.1 Image** | China key | China key* | China key* | Gemini 3 Pro / Vertex Imagen |
| **Wan 2.6 Video** | TBD (fix path) | TBD (fix path) | TBD (fix path) | Vertex Veo 3 |
| **Paraformer STT** | Pending activation | Deepgram Nova 2 | Deepgram Nova 2 | Azure STT |
| **Sambert TTS** | Pending activation | Azure Neural | Azure Neural | Google TTS |
| **CosyVoice TTS** | Pending activation | Azure Neural | Azure Neural | Google TTS |

*China key used cross-region because model is only deployed in Beijing

### Action Items

1. **Fix Wan 2.6/2.2/2.1 API paths** — Check DashScope docs for correct video generation URL
2. **Activate on China portal**: Sambert, Paraformer, CosyVoice, Wanx v1
3. **Verify Qwen Audio model ID** — `qwen2-audio-instruct` returns 404, may need different ID
4. **Keep fallbacks**: Azure Neural (TTS), Deepgram (STT), Vertex Veo 3 (Video), Gemini (Image)

### CosyVoice Permanent Constraint

CosyVoice TTS requires WebSocket — incompatible with Deno/Supabase Edge Functions. Sambert REST is the permanent alternative. Azure Neural is interim until Sambert activation.
