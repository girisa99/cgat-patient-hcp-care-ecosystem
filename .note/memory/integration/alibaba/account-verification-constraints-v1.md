# Memory: integration/alibaba/account-verification-constraints-v1
Updated: just now

## Alibaba Account Status: VERIFIED ✅

Both Alibaba Cloud accounts are now **fully verified and operational**:

- **ALIBABA_API_KEY** (International / Virginia endpoint): `dashscope-intl.aliyuncs.com`  
- **ALIBABA_CHINA_API_KEY** (China / Beijing endpoint): `dashscope.aliyuncs.com`

### Endpoint Routing Strategy

| Service | China (Beijing) | International (Virginia) | Primary Key |
|---------|----------------|-------------------------|-------------|
| **Qwen LLM** | ✅ `dashscope.aliyuncs.com` | ✅ `dashscope-intl.aliyuncs.com` | Either |
| **CosyVoice TTS** | ✅ `dashscope.aliyuncs.com` | ✅ `dashscope-intl.aliyuncs.com` | China preferred |
| **Paraformer STT** | ✅ `dashscope.aliyuncs.com` | ✅ `dashscope-intl.aliyuncs.com` | China preferred |
| **Wan 2.6 Video** | — | ✅ `dashscope-intl.aliyuncs.com` | International only |
| **Wan 2.2/2.1 Video** | ✅ `dashscope.aliyuncs.com` | — | China only |
| **Wanx Image Gen** | ✅ `dashscope.aliyuncs.com` | ✅ `dashscope-intl.aliyuncs.com` | Either |
| **OmniAvatar** | ✅ `dashscope.aliyuncs.com` | — | China only |
| **Richdreamer 3D** | ✅ `dashscope.aliyuncs.com` | — | China only |
| **TaoAvatar** | ✅ `dashscope.aliyuncs.com` | — | China only |
| **MACH** | ✅ `dashscope.aliyuncs.com` | — | China only |
| **Audio/Music/SFX** | ✅ `dashscope.aliyuncs.com` | ✅ `dashscope-intl.aliyuncs.com` | Either |

### Dual-Key Routing Pattern (Implemented 2026-02-06)

All edge functions now implement the following pattern:

```typescript
// China key preferred for Beijing-region models, International as fallback
const chinaKey = Deno.env.get('ALIBABA_CHINA_API_KEY');
const intlKey = Deno.env.get('ALIBABA_API_KEY');
const apiKey = chinaKey || intlKey;

const baseUrl = chinaKey 
  ? 'https://dashscope.aliyuncs.com/api/v1'
  : 'https://dashscope-intl.aliyuncs.com/api/v1';
```

### Edge Functions Updated

| Function | Before | After |
|----------|--------|-------|
| `ai-video-generator` | Only `ALIBABA_API_KEY` + China endpoint | Both keys, smart endpoint routing |
| `multi-provider-tts` | Broken conditional (both branches identical) | Correct China vs International routing |
| `generate-template-ai` | Only `ALIBABA_API_KEY` | Both keys, correct endpoint per key |
| `generate-template-thumbnails` | Only `ALIBABA_API_KEY` + China endpoint | Both keys, smart endpoint routing |
| `multi-provider-sfx` | Only `ALIBABA_API_KEY` + China endpoint | Both keys, smart endpoint routing |
| `multi-provider-music` | Only `ALIBABA_API_KEY` + China endpoint | Both keys, smart endpoint routing |
| `alibaba-video-generator` | Already correct | ✅ No change needed |
| `alibaba-3d-generator` | Already correct (China-only models) | ✅ No change needed |
| `alibaba-tts` | Already correct | ✅ No change needed |
| `alibaba-stt` | Already correct | ✅ No change needed |

### Previous Constraints (RESOLVED)

~~Alibaba DashScope media models are region-locked and return 'Access Denied' due to account verification requirements.~~

**Account verification resolved as of 2026-02-06.** Both accounts verified, billing active. **Awaiting account rep approval** to activate: Sambert TTS, Wan 2.2 Avatar, OmniAvatar, TaoAvatar, MACH, Richdreamer, FunAudio.

### CosyVoice Permanent Constraint

CosyVoice TTS requires WebSocket with custom `Authorization` headers — **incompatible with Deno/Supabase Edge Functions**. Sambert REST is the permanent alternative for edge functions. Azure Neural is the interim CJK TTS primary until Sambert is activated.

### Documentation Updated (2026-02-07)

All governance docs updated with architecture findings:
- `docs/PROVIDER_VERIFICATION_MATRIX_2026.md` — Full activation status, CosyVoice limitation, interim routing
- `docs/ALIBABA_DASHSCOPE_REGIONAL_ARCHITECTURE.md` — Activation checklist, console limitation
- `docs/COMPREHENSIVE_PROVIDER_ROUTING_MATRIX.md` — CJK TTS routing updated
- `docs/GENIE_ECOSYSTEM_COMPLETE_MATRIX_2026.md` — Zone config, dual-key note
- `docs/TEMPLATE_REGIONAL_STRATEGY.md` — TTS column updated with interim status
- `docs/IMPLEMENTATION_STATUS_AND_TESTING_ROADMAP.md` — Alibaba status section added
