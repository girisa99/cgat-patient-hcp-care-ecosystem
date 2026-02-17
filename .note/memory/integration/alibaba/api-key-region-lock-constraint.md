# Memory: integration/alibaba/api-key-region-lock-constraint
Updated: just now

## Tri-Region API Key Architecture (2026-02-09)

Alibaba Cloud API keys are strictly region-locked. The platform now uses a **3-key strategy** for optimal latency and coverage:

| Key Secret | Region | Endpoint | Serves |
|------------|--------|----------|--------|
| `ALIBABA_CHINA_API_KEY` | China (Beijing) | `dashscope.aliyuncs.com` | CJK markets + China-only models |
| `ALIBABA_SINGAPORE_API_KEY` | Singapore (International) | `dashscope-intl.aliyuncs.com` | Asia, Europe, MEA, Africa, India |
| `ALIBABA_API_KEY` | Virginia (International) | `dashscope-intl.aliyuncs.com` | US, Americas, Western markets |

### Key Rules
- Cross-region usage is **not supported** (China key ≠ International endpoint)
- Singapore and Virginia keys both use `dashscope-intl.aliyuncs.com` but are distinct credentials
- China-only models (Wan 2.1, MACH, OmniAvatar, etc.) **require** the China key regardless of user location
- Fallback chain: Regional key → alternate international key → non-Alibaba provider (Azure/Meshy/ModelsLab)
