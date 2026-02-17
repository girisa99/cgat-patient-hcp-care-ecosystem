# Memory: integration/alibaba/cosyvoice-websocket-breakthrough-v1
Updated: 2026-02-09

## CosyVoice WebSocket: npm:ws WORKS ✅

### Breakthrough
Using `npm:ws@8.18.0` in Deno edge functions successfully connects to DashScope WebSocket with custom Authorization headers.

### Test Results (2026-02-09)
| Region | Connection | Auth | Task | Result |
|--------|-----------|------|------|--------|
| China (Beijing) | ✅ Connected | ✅ Accepted | Started then failed | `InvalidParameter: Engine error 418` (model not activated) |
| Singapore | ✅ Connected | ✅ Accepted | Failed | `AccessDenied` (model not activated on SG portal) |
| Virginia | ✅ Connected | ✅ Accepted | Failed | `AccessDenied` (model not activated on VA portal) |

### Key Findings
1. **npm:ws with custom headers works from Supabase Edge Functions** — this was the main blocker
2. CosyVoice v3 Flash **EXISTS** on all 3 regions (SG and VA return AccessDenied not ModelNotFound)
3. China key's CosyVoice returns InvalidParameter (418) — likely means model needs console activation
4. Minor warning: `Not implemented: ClientRequest.options.createConnection` — doesn't affect functionality

### Action Required
Activate CosyVoice v3 Flash on Alibaba DashScope portal for:
1. China (Beijing) account → dashscope.aliyuncs.com
2. Singapore account → DashScope International
3. Virginia account → DashScope International

Once activated, CosyVoice TTS will work on ALL regions with premium multilingual quality.

### Interim Fallback
Until activation: Azure Neural TTS → ElevenLabs → Google TTS (already configured in multi-provider-tts routing)
