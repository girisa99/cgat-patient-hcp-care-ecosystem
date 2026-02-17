# Memory: integration/alibaba/tri-region-cross-region-routing-v2
Updated: 2026-02-09

## Tri-Region Cross-Region Routing (IMPLEMENTED)

All Alibaba edge functions now implement a **cross-region fallback** strategy:
- TTS (alibaba-tts, multi-provider-tts): Tries CosyVoice WebSocket on China → Singapore → Virginia, then Sambert REST on all three
- Video (alibaba-video-generator): Uses SG/VA keys for international models, China key for China models, with cross-key fallback
- Avatar (alibaba-avatar-generator): Tries China → Singapore → Virginia keys, cross-region to international endpoint

### CosyVoice WebSocket Fix
- **Problem**: Native Deno `WebSocket` cannot send custom headers (Authorization)
- **Solution**: Using `npm:ws@8.18.0` which supports `headers` option in constructor
- **Auth**: `Authorization: bearer <api_key>` header (not URL token)
- **Files updated**: `alibaba-tts/index.ts`, `multi-provider-tts/index.ts`

### Key Architecture
| Key | Secret Name | Region | Endpoint |
|-----|-------------|--------|----------|
| China | `ALIBABA_CHINA_API_KEY` | Beijing | `dashscope.aliyuncs.com` |
| Singapore | `ALIBABA_SINGAPORE_API_KEY` | Singapore | `dashscope-intl.aliyuncs.com` |
| Virginia | `ALIBABA_API_KEY` | Virginia | `dashscope-intl.aliyuncs.com` |

### Cross-Region Fallback Order
- **China-only models** (Image, Avatar, STT): China key → SG key → VA key (may fail on intl endpoint but worth trying)
- **International models** (Wan 2.6, Wan 2.1): SG key → VA key → China key
- **TTS**: CosyVoice WS on all 3 → Sambert REST on all 3

### Status: All 3 keys are configured as secrets ✅
