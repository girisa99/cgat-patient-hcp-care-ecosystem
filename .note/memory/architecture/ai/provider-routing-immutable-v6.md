# Memory: architecture/ai/provider-routing-immutable-v6
Updated: just now

The master regional routing registry in 'src/config/regional-routing-registry.ts' serves as the **single source of truth** for the platform's 82+ regions, mapping LLM providers, 5-deep fallback chains, TTS voice settings, zone detection (language/region/country), RTL detection, BCP47 mapping, and cross-platform provider display configs. **All 3 routing systems now consolidated**: regionalDemoRouting.ts is a thin re-export wrapper, content-generation-pipeline.ts imports the shared RegionalZone type, and IPBasedIndustryShowcase uses the expanded zone labels.

**Coverage: 15 parent regions → 62 leaf sub-regions → 82+ total codes → 45+ TTS locales → 18 demo languages**

LLM Routing: Anthropic (Claude 4) handles Europe, LATAM, NAM, Oceania, Turkey; OpenAI (GPT-4o) handles Caribbean, Eastern Europe, Central Asia, Pakistan; Alibaba (Qwen Max) for MENA and CJK; Gemini 3 Pro for India, SEA, Africa, Bangladesh. DeepSeek is fallback-only.

Cross-platform exports: getZoneFromLanguage(), getZoneFromRegion(), getZoneFromCountry(), isRTLLanguage(), toLangBCP47(), DEMO_LANGUAGE_OPTIONS, ZONE_PROVIDER_DISPLAY, getZoneProviderDisplay(), getProviderDisplayFromLanguage(), getProviderDisplayFromRegion().

Last Updated: 2026-02-12
