# Memory: integration/alibaba/account-verification-constraints-v1
Updated: just now

## Alibaba Account Status: VERIFIED ✅

Three Alibaba Cloud API keys are now **fully verified and operational**:

- **ALIBABA_CHINA_API_KEY** (China / Beijing endpoint): `dashscope.aliyuncs.com` → CJK markets
- **ALIBABA_SINGAPORE_API_KEY** (Singapore endpoint): `dashscope-intl.aliyuncs.com` → Asia, Europe, MEA, Africa, India
- **ALIBABA_API_KEY** (International / Virginia endpoint): `dashscope-intl.aliyuncs.com` → US/Americas/Western

### Tri-Region Routing Strategy (Implemented 2026-02-09)

| User Region | API Key | Endpoint | Use Case |
|-------------|---------|----------|----------|
| **CJK** (China, Japan, Korea, HK, Taiwan) | `ALIBABA_CHINA_API_KEY` | `dashscope.aliyuncs.com` | China-only models + CJK linguistic |
| **Asia/EU/MEA/Africa/India** (SEA, Europe, MENA, Africa, South Asia) | `ALIBABA_SINGAPORE_API_KEY` | `dashscope-intl.aliyuncs.com` | Regional proximity, lower latency |
| **Western/Americas** (US, Canada, LATAM) | `ALIBABA_API_KEY` | `dashscope-intl.aliyuncs.com` | Virginia proximity |
| **Fallback** (if regional key fails) | Next key in chain → Azure/Meshy/ModelsLab | — | Resilience |

### Fallback Chain

```
CJK Request:      ALIBABA_CHINA_API_KEY → ALIBABA_SINGAPORE_API_KEY → ALIBABA_API_KEY → Azure/Meshy fallback
Asia/EU/MEA:       ALIBABA_SINGAPORE_API_KEY → ALIBABA_API_KEY → ALIBABA_CHINA_API_KEY* → Azure/Meshy fallback
Western/Americas:  ALIBABA_API_KEY → ALIBABA_SINGAPORE_API_KEY → Azure/Meshy fallback
```

*China key fallback only for China-exclusive models (Wan 2.1, MACH, etc.)

### Model-to-Endpoint Availability

| Service | China (Beijing) | International (Singapore/Virginia) | Primary Key by Region |
|---------|----------------|-------------------------------------|----------------------|
| **Qwen LLM** | ✅ | ✅ | Regional key |
| **CosyVoice TTS** | ✅ | ✅ | China for CJK, Singapore for rest |
| **Paraformer STT** | ✅ | ✅ | Regional key |
| **Wan 2.6 Video** | — | ✅ | Singapore/Virginia |
| **Wan 2.2/2.1 Video** | ✅ | — | China only |
| **Wanx Image Gen** | ✅ | ✅ | Regional key |
| **OmniAvatar** | ✅ | — | China only |
| **Richdreamer 3D** | ✅ | — | China only |
| **TaoAvatar** | ✅ | — | China only |
| **MACH** | ✅ | — | China only |
| **Audio/Music/SFX** | ✅ | ✅ | Regional key |

### Tri-Key Routing Pattern (Replaces Dual-Key)

```typescript
// Tri-region key selection based on user zone
function getAlibabaConfig(userZone: string) {
  const chinaKey = Deno.env.get('ALIBABA_CHINA_API_KEY');
  const sgKey = Deno.env.get('ALIBABA_SINGAPORE_API_KEY');
  const usKey = Deno.env.get('ALIBABA_API_KEY');

  switch (userZone) {
    case 'cjk':
      return {
        apiKey: chinaKey || sgKey || usKey,
        baseUrl: chinaKey
          ? 'https://dashscope.aliyuncs.com/api/v1'
          : 'https://dashscope-intl.aliyuncs.com/api/v1',
      };
    case 'asia':
    case 'europe':
    case 'mea':
    case 'africa':
    case 'india':
      return {
        apiKey: sgKey || usKey || chinaKey,
        baseUrl: 'https://dashscope-intl.aliyuncs.com/api/v1',
      };
    case 'western':
    default:
      return {
        apiKey: usKey || sgKey,
        baseUrl: 'https://dashscope-intl.aliyuncs.com/api/v1',
      };
  }
}

// For China-only models, always use China key regardless of zone
function getChinaOnlyConfig() {
  const chinaKey = Deno.env.get('ALIBABA_CHINA_API_KEY');
  if (!chinaKey) return null; // Fall back to Azure/Meshy/ModelsLab
  return {
    apiKey: chinaKey,
    baseUrl: 'https://dashscope.aliyuncs.com/api/v1',
  };
}
```

### Edge Functions to Update

| Function | Current | New Pattern |
|----------|---------|-------------|
| `ai-video-generator` | Dual-key | Tri-key with zone param |
| `multi-provider-tts` | Dual-key | Tri-key with zone param |
| `generate-template-ai` | Dual-key | Tri-key with zone param |
| `generate-template-thumbnails` | Dual-key | Tri-key with zone param |
| `multi-provider-sfx` | Dual-key | Tri-key with zone param |
| `multi-provider-music` | Dual-key | Tri-key with zone param |
| `alibaba-video-generator` | China only | Tri-key with zone param |
| `alibaba-3d-generator` | China only | China-only (unchanged) |
| `alibaba-tts` | China only | Tri-key with zone param |
| `alibaba-stt` | China only | Tri-key with zone param |

### CosyVoice Permanent Constraint

CosyVoice TTS requires WebSocket with custom `Authorization` headers — **incompatible with Deno/Supabase Edge Functions**. Sambert REST is the permanent alternative for edge functions. Azure Neural is the interim CJK TTS primary until Sambert is activated.

### Pending Activation (China Portal)

Sambert TTS, Wan 2.2 Avatar, OmniAvatar, TaoAvatar, MACH, Richdreamer, FunAudio — awaiting account rep approval on Beijing portal.
