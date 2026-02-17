# Memory: architecture/ai/hybrid-auto-suggest-user-choice-differentiator
Updated: just now

## Critical Differentiator: Hybrid Auto-Suggest + User Choice

The Genie ecosystem implements a **hybrid provider selection model** that sets it apart from single-provider competitors:

### 18 Integrated AI Providers (Production Registry)

| Category | Providers |
|----------|-----------|
| **Video** | Vertex Veo 3, Sora 2, Alibaba Wan 2.6/2.2, ModelsLab, Replicate, DeepSeek |
| **Image** | Gemini 3 Pro, Vertex Imagen 3, Banana Nano, ModelsLab FLUX/SDXL, Stability SDXL, OpenAI DALL-E (last resort) |
| **LLM** | Claude 3.5, Qwen Max, Gemini Pro, GPT-4o, DeepSeek V3, Mistral, Cohere, Groq |
| **TTS** | Azure Neural, Alibaba CosyVoice, Google TTS, ElevenLabs (clone only), OpenAI TTS, Amazon Polly |
| **STT** | Deepgram Nova 2, Alibaba Paraformer, Azure STT, OpenAI Whisper |
| **Avatar/3D** | Alibaba Wan 2.2, OmniAvatar, TaoAvatar, MACH, Meshy AI, ModelsLab 3D |
| **Translation** | DeepL, Qwen-MT, Azure Translator, Google Translate, AWS Translate |

### Pattern: IP/Region Auto-Suggest → User Override Option

1. **System Auto-Suggests** based on:
   - User IP geolocation → Maps to 4-zone regional routing
   - Industry vertical → Industry-specific provider recommendations
   - Task type → Capability-optimized providers
   - Subscription tier → Tier-appropriate quality levels

2. **User Can Override** with multi-provider selection:
   - View all available providers per category (3-7 options typically)
   - Compare quality/speed/cost scores
   - Select preferred provider(s)
   - Switch between providers mid-workflow

### TTS Routing Clarification

**WHY AZURE NEURAL PRIMARY FOR MENA/RTL (Not Alibaba)?**
- Azure Neural provides superior VISEME DATA for lip-sync animations
- 7 Arabic dialects supported: ar-SA, ar-AE, ar-EG, ar-MA, ar-JO, ar-IQ, ar-LB
- RTL text rendering integration
- Alibaba CosyVoice is SECONDARY for Arabic

**WHY ALIBABA COSYVOICE PRIMARY FOR CJK?**
- Native dialect handling (keigo for Japanese, tones for Chinese)
- Better number/date formatting for Asian scripts
- CosyVoice v2 supports voice cloning for CJK

**WHY ELEVENLABS IS TERTIARY (NOT PRIMARY)?**
- Premium tier only (cost)
- Best for voice cloning, NOT production TTS
- Azure Neural provides equivalent quality + Visemes

### 4-Zone Architecture Summary

| Zone | LLM | TTS | Translation |
|------|-----|-----|-------------|
| **Claude Zone** (Western/EU) | Claude 3.5 | Azure Neural | DeepL |
| **Alibaba Zone** (CJK) | Qwen Max | Alibaba CosyVoice | Qwen-MT |
| **Alibaba Zone** (MENA/RTL) | Qwen Max | Azure Neural (7 dialects) | Azure Translator |
| **Gemini Zone** (India/SEA/Africa) | Gemini Pro | Azure Neural | Google Translate |
| **Fallback** | GPT-4o | Azure Neural | Google Translate |

### Key Service Files

- **Master Provider Registry**: `src/config/master-provider-routing-registry.ts` (FROZEN/IMMUTABLE)
- **Flexible Agent Config**: `src/services/flexibleAgentConfigService.ts`
- **Unified Provider Routing**: `src/services/unifiedProviderRoutingAdapter.ts`
- **Contextual AI Providers**: `src/hooks/useContextualAIProviders.ts`

### Competitive Advantage

| Feature | Genie Ecosystem | Typical Competitors |
|---------|-----------------|---------------------|
| Provider Options | 3-7 per category | 1 (locked-in) |
| Regional Optimization | Auto + Override | None or manual only |
| Arabic Dialects | 7 dialects | 1-2 at most |
| Quality/Speed/Cost Transparency | ✅ Visible scores | ❌ Hidden |
| Mid-workflow Switching | ✅ Supported | ❌ Not possible |
| Fallback Chains | 4-5 deep | 1-2 at most |

### Transcreation vs Translation

The system performs **TRANSCREATION** (not translation):
- Cultural context adaptation
- Regional dialect selection (7 Arabic, CJK variants)
- Tone/formality adjustment per market
- Industry-specific terminology localization
- RTL layout handling for MENA
