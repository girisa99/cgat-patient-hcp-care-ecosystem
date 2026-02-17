# Memory: integration/alibaba/account-verification-constraints-v1
Updated: just now

## Alibaba Account Status: VERIFIED ✅ (3 keys)

| Key | Region | Endpoint |
|-----|--------|----------|
| `ALIBABA_CHINA_API_KEY` | Beijing | `dashscope.aliyuncs.com` |
| `ALIBABA_SINGAPORE_API_KEY` | Singapore | `dashscope-intl.aliyuncs.com` |
| `ALIBABA_API_KEY` | Virginia | `dashscope-intl.aliyuncs.com` |

## Live Diagnostic Results — Run 3 (2026-02-09, 14/42 passed)

### ✅ FULLY WORKING — All 3 Regions

| Model | Category | Model ID | API Path |
|-------|----------|----------|----------|
| **Qwen LLM** | LLM | `qwen-max` | `/compatible-mode/v1/chat/completions` |
| **Qwen VL (Vision)** | LLM | `qwen-vl-max` | `/compatible-mode/v1/chat/completions` |
| **Wan 2.6 Video (T2V)** | Video | `wan2.6-t2v` | `/api/v1/services/aigc/video-generation/video-synthesis` |

### ✅ WORKING — International Only (Singapore + Virginia, NOT Beijing)

| Model | Category | Model ID | API Path |
|-------|----------|----------|----------|
| **Wan 2.1 Turbo** | Video | `wan2.1-t2v-turbo` | `/api/v1/services/aigc/video-generation/video-synthesis` |
| **Wan 2.1 Plus** | Video | `wan2.1-t2v-plus` | `/api/v1/services/aigc/video-generation/video-synthesis` |

### ✅ WORKING — China Only (Beijing)

| Model | Category | Model ID | API Path |
|-------|----------|----------|----------|
| **Wanx 2.1 Image** | Image | `wanx2.1-t2i-turbo` | `/api/v1/services/aigc/text2image/image-synthesis` |

### 🔒 ACCESS_DENIED — Exists but needs portal activation

| Model | Category | China | Singapore | Virginia | Notes |
|-------|----------|-------|-----------|---------|-------|
| **CosyVoice v3 Flash** | TTS | ⚠️ URL error (WebSocket only) | 🔒 ACCESS_DENIED | 🔒 ACCESS_DENIED | **EXISTS on SG+VA!** Activate to unlock |
| **Sambert TTS (Female)** | TTS | 🔒 Access Denied | ❌ Not deployed | ❌ Not deployed | Beijing-only model |
| **Paraformer STT** | STT | 🔒 "sync calls not supported" | ❌ Not deployed | ❌ Not deployed | Beijing-only, needs async |
| **SenseVoice STT** | STT | 🔒 Access Denied | ❌ Not deployed | ❌ Not deployed | Beijing-only model |
| **Wanx v1 Image** | Image | 🔒 Access Denied | ❌ Not deployed | ❌ Not deployed | Beijing-only, use Wanx 2.1 |

### ⚠️ Wan 2.2 S2V (Avatar) — China Only, URL Error

| Model | China | Singapore | Virginia | Notes |
|-------|-------|-----------|---------|-------|
| **Wan 2.2 S2V** | ⚠️ "url error" | ❌ Not deployed | ❌ Not deployed | Model exists on Beijing but requires valid image_url accessible from China |

**Root cause**: The `image_url` parameter must point to a URL accessible from China. Our test used a China-accessible URL but the model may require specific input format (audio_url for S2V = Speech-to-Video). This is NOT a text-to-video model — it's an **audio-driven video** model requiring `audio_url` + `image_url`.

## 🔑 KEY DISCOVERY: CosyVoice v3 Flash EXISTS on Singapore + Virginia!

CosyVoice v3 Flash returned **ACCESS_DENIED** (not MODEL_NOT_FOUND) on Singapore and Virginia endpoints. This means the model **IS deployed internationally** but needs activation on the Alibaba portal. Once activated:
- It can serve MEA, Europe, Asia, Africa, India via Singapore key
- It can serve Americas via Virginia key
- **However**: CosyVoice uses WebSocket protocol, incompatible with Supabase Edge Functions (Deno)

**Workaround**: CosyVoice REST endpoint (`/text2audio/generation`) returned "url error" on Beijing, meaning it doesn't support the REST text2audio path. CosyVoice requires WebSocket or SDK.

## Final Routing Matrix

### Models Available NOW (No activation needed)

| Capability | CJK (China key) | Asia/EU/MEA/Africa/India (SG key) | Americas (VA key) |
|-----------|------------------|-----------------------------------|-------------------|
| **LLM** | ✅ Qwen Max | ✅ Qwen Max | ✅ Qwen Max |
| **Vision** | ✅ Qwen VL | ✅ Qwen VL | ✅ Qwen VL |
| **Video (2.6)** | ✅ Wan 2.6 | ✅ Wan 2.6 | ✅ Wan 2.6 |
| **Video (2.1)** | ❌ → use SG key | ✅ Wan 2.1 Turbo/Plus | ✅ Wan 2.1 Turbo/Plus |
| **Image** | ✅ Wanx 2.1 | ❌ → China key cross-region | ❌ → China key cross-region |

### Models Needing Activation (Portal action required)

| Capability | What to Activate | Where Available After | Interim Fallback |
|-----------|-----------------|----------------------|-----------------|
| **TTS** | CosyVoice v3 Flash | SG + VA (but WebSocket only) | **Azure Neural TTS** |
| **TTS (REST)** | Sambert | Beijing only | **Azure Neural TTS** |
| **STT** | Paraformer v2 | Beijing only (async mode) | **Deepgram Nova 2** |
| **STT** | SenseVoice v1 | Beijing only | **Deepgram Nova 2** |
| **Avatar** | Wan 2.2 S2V | Beijing only | **ModelsLab + Azure Viseme** |
| **Image (v1)** | Wanx v1 | Beijing only | Use Wanx 2.1 instead |

### Permanent Fallbacks (No Alibaba API available)

| Capability | Why No Alibaba | Production Provider |
|-----------|---------------|-------------------|
| **3D Generation** | No DashScope REST API | **Meshy AI** |
| **Full-body Avatar** | No DashScope REST API | **Replicate** |
| **Music/SFX** | No DashScope REST API | None available |
| **Photo-to-Avatar (MACH)** | Research model only | **Meshy AI** |

## Action Items

1. ✅ ~~Fix video API paths~~ → DONE (`/video-generation/video-synthesis`)
2. **Activate CosyVoice v3 Flash** on SG + VA portals → Would give TTS on all international endpoints (but WebSocket only)
3. **Activate Sambert** on Beijing → REST-compatible TTS for Edge Functions
4. **Activate Paraformer** on Beijing with async mode → STT
5. **Fix Wan 2.2 S2V input** → Needs `audio_url` not just `image_url` (Speech-to-Video model)
6. **Image cross-region**: Wanx 2.1 is China-only. For non-CJK regions, use China key cross-region or fall back to Gemini Imagen 3
7. **Azure Neural TTS remains primary** for all regions until CosyVoice WebSocket workaround or Sambert activation
