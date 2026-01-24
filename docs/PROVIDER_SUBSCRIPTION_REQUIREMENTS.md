# Provider Subscription Requirements for Commercial Deployment

> **Purpose**: Document all external AI provider subscriptions required for production deployment of Genie Suite.
> **Last Updated**: 2025-01-24
> **Status**: Planning/Pre-Commercial

---

## Executive Summary

| Category | Providers | Est. Monthly Cost | Priority |
|----------|-----------|-------------------|----------|
| **Core AI** | OpenAI, Claude, Gemini, DeepSeek | $100-500 | P0 |
| **Voice/TTS** | ElevenLabs, Azure Speech | $50-200 | P0 |
| **Translation** | DeepL, Azure Translate | $25-100 | P0 |
| **Media Gen** | ModelsLab, Meshy AI, Replicate | $50-150 | P1 |
| **Alibaba** | DashScope (Qwen, CosyVoice, WAN) | $50-200 | P1 |
| **Infrastructure** | Supabase, Stripe | $25-100 | P0 |
| **Total Estimate** | - | **$300-1,250/mo** | - |

---

## 1. Core LLM Providers (P0 - Required)

### OpenAI
| Plan | Cost | API Limits | Recommendation |
|------|------|------------|----------------|
| Pay-as-you-go | Usage-based | $120/mo cap default | ✅ **Start here** |
| Tier 1 | $100/mo minimum | Higher rate limits | Scale when needed |
| Tier 2+ | $500+/mo | Enterprise limits | Enterprise only |

**Models Used**: GPT-4o, GPT-4o-mini, DALL-E 3, Whisper, TTS
**Secret**: `OPENAI_API_KEY`
**Decision**: **Pay-as-you-go** (scale to Tier 1 at ~100 DAU)

---

### Anthropic (Claude)
| Plan | Cost | API Limits | Recommendation |
|------|------|------------|----------------|
| Build | Free tier | 1M tokens/mo | Testing only |
| Scale | Pay-as-you-go | Higher limits | ✅ **Start here** |
| Enterprise | Custom | Unlimited | Future |

**Models Used**: Claude 3.5 Sonnet, Claude 3.5 Haiku
**Secret**: `ANTHROPIC_API_KEY`, `CLAUDE_API_KEY`
**Decision**: **Scale tier** (pay-as-you-go)

---

### Google Gemini
| Plan | Cost | API Limits | Recommendation |
|------|------|------------|----------------|
| Free | $0 | 1,500 RPD (Flash) | Testing only |
| Pay-as-you-go | Usage-based | 10,000 RPM | ✅ **Start here** |
| Enterprise (Vertex) | Custom | SLA, support | Healthcare/Enterprise |

**Models Used**: Gemini 2.0 Flash, Gemini 2.0 Pro, Imagen 3
**Secret**: `GEMINI_API_KEY`, `GOOGLE_API_KEY`
**Decision**: **Pay-as-you-go** (upgrade to Vertex for HIPAA)

---

### DeepSeek
| Plan | Cost | API Limits | Recommendation |
|------|------|------------|----------------|
| Pay-as-you-go | $0.14/M input, $0.28/M output | High limits | ✅ **Use this** |

**Models Used**: DeepSeek V3, DeepSeek Coder, DeepSeek Math
**Secret**: `DEEPSEEK_API_KEY`
**Decision**: **Pay-as-you-go** (extremely cost-effective for CJK)

---

## 2. Voice & Audio Providers (P0 - Required)

### ElevenLabs
| Plan | Cost/Mo | Characters | Voice Clones | Recommendation |
|------|---------|------------|--------------|----------------|
| Free | $0 | 10k | 0 | Testing only |
| Starter | $5 | 30k (~30 min) | 3 | Validation |
| Creator | $22 | 100k (~100 min) | 10 | ✅ **Start here** |
| Pro | $99 | 500k (~500 min) | 30 | At scale |
| Scale | $330 | 2M chars | 100 | Enterprise |

**Capabilities**: TTS, Voice Clone, SFX, Music
**Secret**: `ELEVENLABS_API_KEY`
**Decision**: **Creator ($22/mo)** → Pro at 50+ DAU

---

### Azure Speech Services
| Plan | Cost | Features | Recommendation |
|------|------|----------|----------------|
| Free | $0 | 5 hrs STT/mo, 0.5M chars TTS | Testing |
| Pay-as-you-go | $1/hr STT, $16/1M chars TTS | 400+ voices | ✅ **Start here** |
| Commitment | Custom | Volume discounts | Enterprise |

**Capabilities**: Neural TTS (400+ voices), STT, Visemes (lip-sync)
**Secret**: `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`
**Decision**: **Pay-as-you-go** (critical for Arabic/MEA zone)

---

## 3. Translation Providers (P0 - Required)

### DeepL
| Plan | Cost/Mo | Characters | Recommendation |
|------|---------|------------|----------------|
| Free | $0 | 500k | Testing only |
| Starter | $8.74 | 1M | Validation |
| Advanced | $28.74 | 3M | ✅ **Start here** |
| Ultimate | $57.49 | 10M | At scale |
| Pro (API) | $5.49/M chars | Unlimited | Enterprise |

**Languages**: 30+ languages, best quality for EU
**Secret**: `DEEPL_API_KEY`
**Decision**: **Advanced ($29/mo)** → Pro API at scale

---

### Azure/Microsoft Translator
| Plan | Cost | Characters | Recommendation |
|------|------|------------|----------------|
| Free | $0 | 2M/mo | ✅ **Start here** |
| S1 | $10/M chars | Unlimited | At scale |

**Languages**: 100+ languages (best for uncommon languages)
**Secret**: `MICROSOFT_TRANSLATE_API_KEY`, `MICROSOFT_TRANSLATE_REGION`
**Decision**: **Free tier** (2M chars/mo is generous)

---

## 4. Media Generation Providers (P1 - Important)

### ModelsLab
| Plan | Cost/Mo | Credits | Models | Recommendation |
|------|---------|---------|--------|----------------|
| Free | $0 | 100/day | FLUX, SDXL | Testing |
| Basic | $9 | 2,000 | All models | Validation |
| Standard | $29 | 9,000 | All + API | ✅ **Start here** |
| Professional | $49 | 20,000 | Priority | At scale |
| Enterprise | $99+ | 50,000+ | Dedicated | High volume |

**Capabilities**: FLUX Pro, SDXL, AnimateDiff, Text-to-3D, Voice Clone
**Secret**: `MODELSLAB_API_KEY`
**Decision**: **Standard ($29/mo)** → Professional at 50+ DAU

---

### Meshy AI (3D Generation)
| Plan | Cost/Mo | Credits | Assets | Recommendation |
|------|---------|---------|--------|----------------|
| Free | $0 | 100 | 10 | Testing |
| Pro | $20 | 1,000 | ~100 | ✅ **Start here** |
| Studio | $60 | 4,000 | ~400 | Teams/Scale |
| Enterprise | Custom | Unlimited | - | High volume |

**Capabilities**: Text-to-3D, Image-to-3D, PBR textures, Rigging
**Secret**: `MESHY_API_KEY`
**Decision**: **Pro ($20/mo)** → Studio if >100 3D assets/mo

---

### Replicate
| Plan | Cost | Features | Recommendation |
|------|------|----------|----------------|
| Pay-as-you-go | ~$0.0023/sec GPU | Many models | ✅ **Start here** |
| Committed | Volume discounts | Reserved GPU | Enterprise |

**Capabilities**: TripoSR (Image-to-3D), Stable Diffusion, FLUX, SDXL
**Secret**: `REPLICATE_API_TOKEN`
**Decision**: **Pay-as-you-go** (cost-effective for sporadic use)

---

## 5. Alibaba DashScope (P1 - CJK Zone)

### DashScope (Unified Platform)
| Plan | Cost | Services | Recommendation |
|------|------|----------|----------------|
| Free Trial | $0 | 1M tokens/model | Testing |
| Pay-as-you-go | Usage-based | All services | ✅ **Start here** |
| Enterprise | Custom | SLA, support | China operations |

**Services Included**:
- **Qwen-Max/Plus**: LLM ($0.004/1K tokens)
- **Qwen-MT**: Translation (CJK-optimized)
- **CosyVoice**: TTS (best for Mandarin/Cantonese)
- **WAN 2.2**: Avatar generation
- **Wanx**: Image generation
- **Paraformer**: STT (98% CJK accuracy)

**Secret**: `ALIBABA_API_KEY`
**Decision**: **Pay-as-you-go** (single key for all CJK services)

---

## 6. Infrastructure (P0 - Required)

### Supabase
| Plan | Cost/Mo | Features | Recommendation |
|------|---------|----------|----------------|
| Free | $0 | 500MB DB, 50k MAU | Development |
| Pro | $25 | 8GB DB, 100k MAU, Daily backups | ✅ **Start here** |
| Team | $599 | 30-day backups, RBAC | Teams |
| Enterprise | Custom | HIPAA, SLA | Healthcare |

**Services**: Auth, Database, Edge Functions, Storage, Realtime
**Decision**: **Pro ($25/mo)** → Team at 5+ team members

---

### Stripe
| Plan | Cost | Features | Recommendation |
|------|------|----------|----------------|
| Standard | 2.9% + $0.30/txn | All features | ✅ **Use this** |
| Custom | Volume-based | Enterprise | High volume |

**Services**: Payments, Subscriptions, Customer Portal
**Secret**: `STRIPE_SECRET_KEY` (via connector)
**Decision**: **Standard** (no monthly fee)

---

## 7. Optional/Future Providers

### Azure Document Intelligence (OCR)
| Plan | Cost | Pages | Recommendation |
|------|------|-------|----------------|
| Free | $0 | 500/mo | Testing |
| S0 | $1.50/1K pages | Unlimited | When needed |

**Secret**: `AZURE_FORM_RECOGNIZER_KEY`, `AZURE_FORM_RECOGNIZER_ENDPOINT`
**Decision**: **Free tier** initially → S0 for healthcare OCR

---

### Hugging Face
| Plan | Cost | Features | Recommendation |
|------|------|----------|----------------|
| Free | $0 | Rate limited | ✅ **Use this** |
| Pro | $9/mo | Higher limits | If rate limited |

**Secret**: `HUGGING_FACE_ACCESS_TOKEN`
**Decision**: **Free** (fallback provider only)

---

## 8. Regional Routing Summary

### 5-Zone Provider Allocation

| Zone | Regions | LLM | TTS | Translation |
|------|---------|-----|-----|-------------|
| **Claude** | US, EU, UK, LatAm, IL, ZA | Claude 3.5 | ElevenLabs | DeepL |
| **Alibaba** | CN, JP, KR, HK, TW, SG | Qwen-Max | CosyVoice | Qwen-MT |
| **Arabic** | SA, UAE, EG, MENA | GPT-4o | Azure Neural | Azure |
| **Gemini** | India, SEA, Africa | Gemini 2.0 | Azure Neural | Google |
| **Fallback** | Global | DeepSeek V3 | OpenAI TTS | Azure |

### Global Providers (No Regional Routing)
| Capability | Provider | Notes |
|------------|----------|-------|
| Avatar | Alibaba WAN 2.2 | Best quality globally |
| Full-body Avatar | Alibaba OmniAvatar | Premium tier only |
| 3D Mesh | ModelsLab + Meshy | Visual quality priority |
| Image Gen | ModelsLab FLUX | Consistent quality |
| Priority Render | Replicate/RunPod | GPU availability |

---

## 9. Subscription Checklist

### Phase 1: MVP Launch (Minimum Viable)
- [ ] OpenAI Pay-as-you-go
- [ ] Claude Scale tier
- [ ] Gemini Pay-as-you-go
- [ ] ElevenLabs Creator ($22/mo)
- [ ] DeepL Advanced ($29/mo)
- [ ] ModelsLab Standard ($29/mo)
- [ ] Meshy Pro ($20/mo)
- [ ] Supabase Pro ($25/mo)
- [ ] Stripe Standard (no monthly fee)

**Estimated Monthly**: ~$125/mo fixed + usage

### Phase 2: Regional Expansion
- [ ] Alibaba DashScope (pay-as-you-go)
- [ ] Azure Speech (pay-as-you-go)
- [ ] Azure Translator (free tier)
- [ ] DeepSeek (pay-as-you-go)

**Additional**: ~$50-100/mo usage

### Phase 3: Enterprise/Healthcare
- [ ] Google Vertex AI (HIPAA)
- [ ] Azure Document Intelligence
- [ ] Supabase Team/Enterprise
- [ ] ElevenLabs Scale
- [ ] ModelsLab Enterprise

**Additional**: ~$500-1,000+/mo

---

## 10. Cost Control Strategies

### Rate Limiting
- Implement per-user daily/monthly limits
- Use `user_ai_credits` table for tracking
- Fallback to cheaper models when limits approached

### Model Routing
- Use cheaper models (GPT-4o-mini, Haiku) for simple tasks
- Reserve premium models (Sonnet, GPT-4o) for complex generation
- Implement `TIER_CREDIT_MULTIPLIERS` for margin control

### Caching
- Cache translation results (same source = same output)
- Cache TTS for repeated phrases
- Store generated assets in Supabase Storage

### Monitoring
- Set up billing alerts on all providers
- Use Arize/LangWatch for LLM cost tracking
- Weekly cost review dashboard

---

## 11. Secret Keys Inventory

| Provider | Secret Name(s) | Status |
|----------|----------------|--------|
| OpenAI | `OPENAI_API_KEY` | ✅ Configured |
| Claude | `ANTHROPIC_API_KEY`, `CLAUDE_API_KEY` | ✅ Configured |
| Gemini | `GEMINI_API_KEY`, `GOOGLE_API_KEY` | ✅ Configured |
| DeepSeek | `DEEPSEEK_API_KEY` | ✅ Configured |
| ElevenLabs | `ELEVENLABS_API_KEY` | ✅ Configured |
| DeepL | `DEEPL_API_KEY` | ✅ Configured |
| ModelsLab | `MODELSLAB_API_KEY` | ✅ Configured |
| Meshy | `MESHY_API_KEY` | ✅ Configured |
| Alibaba | `ALIBABA_API_KEY` | ✅ Configured |
| Replicate | `REPLICATE_API_TOKEN` | ✅ Configured |
| HuggingFace | `HUGGING_FACE_ACCESS_TOKEN` | ✅ Configured |
| Azure Speech | `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION` | ⚠️ Needed |
| Azure Translate | `MICROSOFT_TRANSLATE_API_KEY`, `MICROSOFT_TRANSLATE_REGION` | ✅ Configured |
| Azure OCR | `AZURE_FORM_RECOGNIZER_KEY`, `AZURE_FORM_RECOGNIZER_ENDPOINT` | ⚠️ Needed |
| Stripe | `STRIPE_SECRET_KEY` | ✅ Via Connector |

---

## Document History

| Date | Author | Changes |
|------|--------|---------|
| 2025-01-24 | Genie AI | Initial creation |

---

*This document should be reviewed and updated before each commercial milestone.*
