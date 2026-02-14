# Memory: architecture/intelligence/competitive-intelligence-engine-v1
Updated: just now

## Competitive Intelligence Engine

A full-stack market research and competitive positioning system integrated into the Intelligence Center.

### Database Tables (6 tables)
1. **`competitor_profiles`** - 21 competitors across 10 categories. Enriched with Command Center data: revenue estimates, platforms, video/UX ratings, learning curves, Genie differentiators. DeepL/ElevenLabs removed (providers).
2. **`feature_comparison_matrix`** - 12 seeded feature comparisons with competitor scores and Genie capability ratings (unique/full/partial/planned)
3. **`market_analysis_results`** - AI-generated analyses (positioning, gap analysis, battle cards, USP narrative, SWOT, trend reports) — stored with region/sub-region scope
4. **`trend_monitoring_log`** - Market trend captures with impact levels. Seeded with 8 verified market research trends (McKinsey, Gartner, CB Insights, etc.)
5. **`usp_registry`** - 6 validated USPs with strength scores and competitor-lacking lists
6. **`market_segments`** - **NEW** 8 market segments (Creator, Influencer, Knowledge, SMB, Healthcare, Education, Enterprise, Traveler) with TAM/SAM/SOM, pricing intelligence, pain points, VoC quotes. Seeded from Command Center data.
4. **`trend_monitoring_log`** - Market trend captures with impact levels and affected products
5. **`usp_registry`** - 6 validated USPs with strength scores and competitor-lacking lists

### Service Layer
- **`competitiveIntelligenceService`** - Singleton with 5-min cache, provides `getPromptEnrichment()` for auto-injecting competitive context into AI prompts. Now passes region/subRegion to edge function.
- **`useCompetitiveIntelligence`** hook - React Query with mutations for AI analysis

### Edge Function (Dynamic Routing)
- **`competitive-intelligence`** - Uses **4-provider fallback chain**: Gemini → OpenAI → Claude → DeepSeek (mirrors platform's routing adapter). No more hardcoded provider selection.
- Supports `get_regions` action returning 11 parent regions → 62+ sub-regions
- Analysis requests accept `region` and `subRegion` for regionally-scoped competitive intelligence

### UI
- **Market Intelligence tab** in IntelligenceCenter with 5 sub-tabs: Competitors, Feature Matrix, USPs, AI Analysis, Trends
- **Region Selector** at top: Parent region dropdown + sub-region dropdown (mirrors platform's 15-zone hierarchy)
- Analysis buttons pass selected region/sub-region scope

### Prompt Enrichment
`competitiveIntelligenceService.getPromptEnrichment(productId)` returns structured competitive context for injection into any AI messaging prompt.

### Key Design Decisions
- DeepL, ElevenLabs are **providers** (integrated partners), NOT competitors
- Edge function uses dynamic provider routing, not hardcoded
- Regional vs sub-regional scoping aligns with platform's existing region config
- Subscriber-ready: dynamic data-driven, no hardcoded competitor lists
