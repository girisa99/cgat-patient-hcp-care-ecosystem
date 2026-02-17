# Memory: integration/alibaba/tts-architecture-permanent-v1
Updated: just now

## Alibaba TTS Architecture - Permanent Solution

### Key Discovery: CosyVoice Cannot Work from Edge Functions

**CosyVoice** only supports:
- ❌ NOT HTTP REST (the `/compatible-mode/v1/audio/speech` does NOT exist for CosyVoice)
- ✅ WebSocket API: `wss://dashscope.aliyuncs.com/api-ws/v1/inference`
- ✅ Python/Java SDK (wraps WebSocket internally)

**Problem**: Deno/Browser standard `WebSocket` constructor does NOT support custom headers.
DashScope requires `Authorization: bearer <api_key>` in WebSocket headers.
Token-in-URL (`?token=<key>`) is NOT accepted by DashScope (connection rejected).

**Result**: CosyVoice **cannot** be used from Supabase Edge Functions (Deno runtime).

### Permanent Solution: Sambert REST API

**Sambert** supports synchronous HTTP REST:
- Endpoint: `POST /api/v1/services/aigc/text2audio/generation`
- Auth: `Authorization: Bearer <api_key>`
- Response: JSON with base64 audio in `output.audio`
- Models: sambert-zhichu-v1 (female), sambert-zhide-v1 (male), etc.
- Language: Chinese only

**Current Status**: 403 Access Denied — Sambert model needs to be **activated** in the Alibaba DashScope console at https://dashscope.console.aliyun.com/

### Critical Discovery: DashScope International Unavailability

**DashScope is NOT available on Alibabacloud.com (International)**. The console shows:
"DashScope has not yet been released on Alibabacloud.com(international), please stay tuned for our updates!"

This means Sambert activation requires a **Chinese Aliyun.com account** (not international).

### Action Required by User

**Option A (If user has Aliyun.com China account):**
1. Click "Switch to Aliyun.com account" on DashScope page
2. Go to DashScope Console → Model Management
3. Activate/enable Sambert TTS models (sambert-zhichu-v1, sambert-zhide-v1)
4. Use ALIBABA_CHINA_API_KEY (routes to dashscope.aliyuncs.com)

**Option B (If no Aliyun.com account):**
1. Skip Alibaba TTS entirely
2. Use Azure Neural TTS as primary for CJK (already configured)
3. ElevenLabs as fallback for CJK

### Architecture After Fix

| Zone | Primary Provider | Fallback | Method |
|------|-----------------|----------|--------|
| **CJK** | Alibaba Sambert REST | Azure Neural | HTTP REST |
| **MENA** | Azure Neural | Google TTS | HTTP REST |
| **Western/EU** | ElevenLabs | Azure Neural | HTTP REST |
| **South Asia/SEA** | Azure Neural | Google TTS | HTTP REST |

### Future CosyVoice Integration Options

If CosyVoice is needed (highest quality multilingual):
1. **Cloud Run / external server**: Run Python DashScope SDK in a Cloud Run container with WebSocket support
2. **Alibaba adds REST endpoint**: Monitor DashScope changelog for HTTP REST support for CosyVoice
3. **Deno WebSocket upgrade**: If Deno adds custom header support for WebSocket, re-enable CosyVoice path

### Files Updated

- `supabase/functions/alibaba-tts/index.ts` - Dual-path: CosyVoice WS (will fail gracefully) + Sambert REST
- `supabase/functions/multi-provider-tts/index.ts` - Same dual-path in generateAlibabaTTS
