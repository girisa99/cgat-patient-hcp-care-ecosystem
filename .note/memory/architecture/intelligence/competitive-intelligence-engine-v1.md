# Memory: architecture/intelligence/competitive-intelligence-engine-v1
Updated: just now

## Competitive Intelligence Engine

A full-stack market research and competitive positioning system integrated into the Intelligence Center.

### Database Tables (5 new tables)
1. **`competitor_profiles`** - 20 seeded competitors across 10 categories (AI video, PPT, podcast, translation, TTS, avatar/3D, mobile, media production, script editor, video editing)
2. **`feature_comparison_matrix`** - 12 seeded feature comparisons with competitor scores and Genie capability ratings (unique/full/partial/planned)
3. **`market_analysis_results`** - AI-generated analyses (positioning, gap analysis, battle cards, USP narrative, SWOT, trend reports)
4. **`trend_monitoring_log`** - Market trend captures with impact levels and affected products
5. **`usp_registry`** - 6 validated USPs with strength scores and competitor-lacking lists

### Service Layer
- **`competitiveIntelligenceService`** - Singleton with 5-min cache, provides `getPromptEnrichment()` for auto-injecting competitive context into AI prompts
- **`useCompetitiveIntelligence`** hook - React Query with mutations for AI analysis

### Edge Function
- **`competitive-intelligence`** - Gemini→OpenAI fallback chain, generates structured analyses from competitor/feature/USP data

### UI
- **Market Intelligence tab** in IntelligenceCenter with 5 sub-tabs: Competitors, Feature Matrix, USPs, AI Analysis, Trends
- Analysis buttons: Positioning, Gap Analysis, Battle Cards, USP Narrative, SWOT, Trend Report

### Prompt Enrichment
`competitiveIntelligenceService.getPromptEnrichment(productId)` returns structured competitive context for injection into any AI messaging prompt.
