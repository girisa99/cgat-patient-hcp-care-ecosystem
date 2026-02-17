# Memory: features/localization/mena-pakistan-bangladesh-sub-region-routing-v1
Updated: just now

## MENA 5-Zone Hybrid Routing

The MENA region is split into 5 dialect-specific sub-regions with hybrid LLM routing:

| Sub-Region | LLM Primary | Fallback Chain | TTS Primary | Key Differentiator |
|------------|-------------|----------------|-------------|-------------------|
| **MENA_GULF** (UAE, Saudi, Qatar, Kuwait) | Qwen Max | GPT-4o → Claude 4 → DeepSeek | Azure Neural (ar-AE, ar-SA) | Gulf dialect business tone |
| **MENA_EGYPT** | GPT-4o | Qwen Max → Claude 4 → DeepSeek | Azure Neural (ar-EG) | Egyptian colloquial — #1 Arabic entertainment dialect |
| **MENA_LEVANT** (Lebanon, Jordan, Iraq) | GPT-4o | Qwen Max → Claude 4 → DeepSeek | Azure Neural (ar-JO, ar-LB) | Levantine — most understood Arabic dialect in media |
| **MENA_MAGHREB** (Morocco, Algeria, Tunisia) | Claude 4 | GPT-4o → Qwen Max → DeepSeek | Azure Neural (ar-MA, ar-TN) | French-Arabic code-switching |
| **MENA_MSA** (Pan-Arab formal) | Qwen Max | Claude 4 → GPT-4o → DeepSeek | Azure Neural (ar-SA) | Formal/literary Arabic for news/government |

## Pakistan & Bangladesh — Separate Regions

| Region | LLM Primary | Fallback Chain | TTS Primary | Why Separate |
|--------|-------------|----------------|-------------|-------------|
| **PAKISTAN** | GPT-4o | Gemini → Claude 4 → DeepSeek | Azure Neural (ur-PK) | Urdu uses Arabic script (RTL), Islamic cultural context differs from India |
| **BANGLADESH** | Gemini 3 Pro | GPT-4o → Claude 4 → DeepSeek | Azure Neural (bn-BD) | Bengali with unique cultural identity, not Indian Bengali |

TTS coverage: 3 Arabic providers (Azure Neural primary with 7+ locale codes, Alibaba Qwen3-TTS fallback, ElevenLabs for premium cloned voices).

All MENA sub-regions inherit RTL text direction support.

Last Updated: 2026-02-11
