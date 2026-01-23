# Premium Features Provider Routing Matrix

> **Last Updated:** January 2026  
> **Status:** Active Implementation

## Complete Provider Routing Matrix

### Zone-Based Routing (Regional)

| ZONE | REGIONS | LLM | TTS/VOICE CLONE | TRANSLATION |
|------|---------|-----|-----------------|-------------|
| **CLAUDE ZONE** | US, UK, EU, Brazil, Israel, South Africa | Claude | ElevenLabs | DeepL |
| **ALIBABA ZONE** | Japan, Korea, China, HK, Taiwan, MEA (Arabic) | Qwen-Max | CosyVoice | Qwen-MT |
| **GEMINI ZONE** | India, Pakistan, SEA, Africa | Gemini | Azure Neural | Google Translate |
| **FALLBACK** | When primary fails | GPT-4o | ElevenLabs | Google |

### Global Routing (Non-Regional)

| FEATURE | PRIMARY | FALLBACK | REGIONAL? | NOTES |
|---------|---------|----------|-----------|-------|
| **Custom Avatar** | Alibaba Wan2.2 | Replicate | NO (global) | S2V animation |
| **Full-body Avatar** | Alibaba OmniAvatar | NO FALLBACK | NO (global) | Premium upsell |
| **Priority Rendering** | RunPod | Replicate | NO (global) | Dedicated GPU |
| **API Access** | Platform | N/A | NO (platform) | Business+ tier |
| **White Label** | Platform | N/A | NO (platform) | Enterprise only |

## Key Insight: Avatar vs Voice

| Component | Regional Routing? | Provider |
|-----------|-------------------|----------|
| LLM | ✅ YES (3 zones) | Claude / Qwen / Gemini |
| TTS | ✅ YES (3 zones) | ElevenLabs / CosyVoice / Azure |
| Voice Clone | ✅ YES (3 zones) | Same as TTS |
| Avatar | ❌ NO (Global) | Alibaba Wan2.2 everywhere |
| Full-body Avatar | ❌ NO (Global) | Alibaba OmniAvatar everywhere |
| Priority Rendering | ❌ NO (Global) | RunPod everywhere |

## Tier Feature Matrix

| Feature | Free | Starter | Creator | Pro | Business | Enterprise |
|---------|------|---------|---------|-----|----------|------------|
| Voice Clone | ❌ | ❌ | 1 voice | 3 voices | 10 voices | Unlimited |
| Custom Avatar | ❌ | ❌ | ❌ | 15/mo | 50/mo | Unlimited |
| Full-body Avatar | ❌ | ❌ | ❌ | ❌ | 10/mo | Unlimited |
| Priority Rendering | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| API Access | ❌ | ❌ | ❌ | Basic | Full | Full |
| White Label | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

## Implementation Files

- **Routing Adapter:** `src/services/unifiedProviderRoutingAdapter.ts`
- **Subscription Tiers:** `src/constants/subscriptionTiers.ts`
- **Video Providers:** `src/services/media/videoProviderConfig.ts`
- **Ecosystem Routing:** `src/hooks/useEcosystemRouting.ts`

## Provider Details

### Alibaba Wan2.2 (Avatar)
- Best-in-class avatar animation
- S2V (Script-to-Video) capability
- Works with all languages
- Cost-effective at scale

### Alibaba OmniAvatar (Full-body)
- Premium full-body animation
- Character consistency
- Motion transfer
- Enterprise-only feature

### RunPod (Priority Rendering)
- Dedicated GPU resources
- 2-3x faster processing
- Guaranteed availability
- Pro+ tier feature
