# Memory: architecture/ai/hybrid-auto-suggest-user-choice-differentiator
Updated: just now

## Critical Differentiator: Hybrid Auto-Suggest + User Choice

The Genie ecosystem implements a **hybrid provider selection model** that sets it apart from single-provider competitors:

### Pattern: IP/Region Auto-Suggest → User Override Option

1. **System Auto-Suggests** based on:
   - User IP geolocation → Maps to 4-zone regional routing (Claude/Alibaba/Gemini/Fallback)
   - Industry vertical → Industry-specific provider recommendations
   - Task type → Capability-optimized providers
   - Subscription tier → Tier-appropriate quality levels

2. **User Can Override** with multi-provider selection:
   - View all available providers per category (3-6 options typically)
   - Compare quality/speed/cost scores
   - Select preferred provider(s)
   - Switch between providers mid-workflow

### Implementation Status by Category

| Category | Auto-Suggest | User Choice | Providers Available |
|----------|--------------|-------------|---------------------|
| **LLM** | ✅ 4-zone routing | ✅ Via `AIProviderSelector` | 6+ (Claude, GPT-4o, Gemini, Qwen, DeepSeek, etc.) |
| **TTS** | ✅ Regional | ✅ Via `TranslationProviderSelector` | 5+ (ElevenLabs, Azure, CosyVoice, Google, OpenAI) |
| **STT** | ✅ Regional | ✅ Via audio config | 4+ (Deepgram, Azure, Google, Whisper) |
| **Translation** | ✅ Regional | ✅ Via `TranslationProviderSelector` | 5+ (DeepL, Google, Qwen-MT, Azure, AWS) |
| **Image Gen** | ✅ Via `ImageModelSelector` | ✅ Multi-select | 6+ (FLUX, SDXL, DALL-E, Imagen, etc.) |
| **Video Gen** | ✅ Auto-routing | ✅ Via comparison matrix | 7+ (Sora, Kling, Alibaba Wan, ModelsLab, etc.) |
| **Avatar** | ✅ Global (Alibaba) | ✅ Via provider matrix | 5+ (Wan2.2, OmniAvatar, MACH, TaoAvatar, etc.) |
| **3D/VR/AR** | ✅ Global (Meshy) | ✅ Via `avatar-3d-provider-matrix` | 4+ (Meshy, Alibaba 3D Suite, Replicate, ModelsLab) |

### Key Service Files

- **Flexible Agent Config**: `src/services/flexibleAgentConfigService.ts`
  - Implements `modelSelectionMode: 'ai-auto' | 'user-override' | 'multi-select'`
  - Tracks `systemSuggested` vs `userOverride` vs `effectiveProvider`

- **Unified Provider Routing**: `src/services/unifiedProviderRoutingAdapter.ts`
  - 4-zone regional auto-routing for LLM/TTS/Translation

- **Contextual AI Providers**: `src/hooks/useContextualAIProviders.ts`
  - Dynamic provider recommendations by product/scenario

- **Avatar/3D Matrix**: `src/config/avatar-3d-provider-matrix.ts`
  - Complete Alibaba, Meshy, ModelsLab provider definitions

### Competitive Advantage

| Feature | Genie Ecosystem | Typical Competitors |
|---------|-----------------|---------------------|
| Provider Options | 3-7 per category | 1 (locked-in) |
| Regional Optimization | Auto + Override | None or manual only |
| Quality/Speed/Cost Transparency | ✅ Visible scores | ❌ Hidden |
| Mid-workflow Switching | ✅ Supported | ❌ Not possible |
| Fallback Chains | 4-5 deep | 1-2 at most |

### Priority: HIGH - CRITICAL DIFFERENTIATOR

This hybrid model is a core competitive advantage and should be:
1. Prominently featured in marketing/sales materials
2. Exposed in all Studio wizard steps
3. Documented in user onboarding
4. Maintained as parity across all 14+ capability types
