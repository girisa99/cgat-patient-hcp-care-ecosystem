 # Template Regional Strategy & Gap Analysis
 
 > **Last Updated:** February 2026  
 > **Status:** Planning Document
 
 ## Current State Analysis
 
 ### Existing Template Inventory
 - **407+ templates** across 21 industries
 - **Primary Generation Source:** OpenAI/DALL-E (majority)
 - **Regional Coverage:** Limited - most are Western/English-centric
 - **Device Variants:** Desktop 16:9 primary, limited mobile (9:16)
 
 ### The Regional Gap
 
 | Zone | Template Coverage | Gap |
 |------|------------------|-----|
 | **Claude Zone** (Western/EU) | ✅ Good (~300 templates) | Need more EU language variants |
 | **Alibaba Zone** (CJK) | ⚠️ Limited (~40 templates) | Need Japanese, Korean, Chinese-specific |
 | **Alibaba Zone** (MENA/RTL) | ⚠️ Limited (~30 templates) | Need RTL layouts, 7 Arabic dialect support |
 | **Gemini Zone** (India/SEA) | ⚠️ Limited (~25 templates) | Need regional aesthetics (Bollywood, etc.) |
 | **Gemini Zone** (Africa) | ❌ Minimal (~12 templates) | Need Swahili, Yoruba, Amharic support |
 
 ## Provider Capability by Region
 
 ### Image Generation (Style Intent Resolution)
 
 | Region | Primary | Secondary | Notes |
 |--------|---------|-----------|-------|
 | **Western/EU** | Gemini 3 Pro | Vertex Imagen 3 | Best quality, cost-effective |
 | **CJK** | Gemini 3 Pro | ModelsLab FLUX | Good for anime/manga styles |
 | **MENA** | Gemini 3 Pro | ModelsLab FLUX | RTL text overlay needs special handling |
 | **India/SEA** | Gemini 3 Pro | Banana Nano | Cost-effective for high volume |
 | **Africa** | Gemini 3 Pro | ModelsLab | Limited specialized options |
 | **LATAM** | Gemini 3 Pro | Vertex Imagen 3 | Same as Western |
 
 ### Video Generation (All Regions - Global Routing)
 
 | Capability | Provider | Notes |
 |------------|----------|-------|
 | Text-to-Video | Vertex Veo 3 | Global primary |
 | Image-to-Video | Vertex Veo 3 / Alibaba Wan 2.6 | Style-dependent |
 | Avatar | Alibaba Wan 2.2 | Global (not regional) |
 | 3D Elements | Meshy AI | Global (not regional) |
 
 ### TTS (Zone-Specific - Critical for Templates)
 
 | Zone | Primary | Voice Clone | Dialects |
 |------|---------|-------------|----------|
 | **Western/EU** | Azure Neural | ElevenLabs | EN, ES, FR, DE, IT, PT |
 | **CJK** | Alibaba CosyVoice | CosyVoice | ZH (5 dialects), JA (keigo), KO |
 | **MENA/RTL** | Azure Neural | ElevenLabs | 7 Arabic dialects |
 | **India/SEA** | Azure Neural | ElevenLabs | HI, TA, TE, TH, VI, ID |
 | **Africa** | Azure Neural | — | SW, YO, AM (limited) |
 
 ## Recommended Strategy: Phased Regeneration
 
 ### Phase 1: Style Abstraction (Immediate)
 **Goal:** Make existing templates routing-compatible without regeneration
 
 1. Add `style_intent` field to all 407 templates
 2. Map original provider to style intent
 3. Routing engine selects optimal provider at generation time
 4. **No visual regeneration needed**
 
 ### Phase 2: Regional Template Expansion (2-4 weeks)
 **Goal:** Fill regional gaps with native templates
 
 | Priority | Region | Templates Needed | Aesthetic Focus |
 |----------|--------|------------------|-----------------|
 | P0 | MENA/RTL | +50 templates | Arabesque, Islamic geometry, RTL layouts |
 | P0 | India | +40 templates | Bollywood, regional festivals, cricket |
 | P1 | CJK | +60 templates | Anime, minimalist (Muji), K-pop |
 | P1 | Africa | +30 templates | Pan-African, tribal patterns, vibrant colors |
 | P2 | SEA | +25 templates | Buddhist, tropical, modern Asian |
 | P2 | LATAM | +20 templates | Carnival, soccer, colonial architecture |
 
 ### Phase 3: Mobile-First Variants (4-6 weeks)
 **Goal:** Every template has mobile (9:16) variant
 
 - Auto-generate mobile layouts from desktop templates
 - Platform-specific: TikTok, Instagram Reels, YouTube Shorts
 - Different aspect ratios: 9:16, 1:1, 4:5
 
 ## Identified Bottlenecks & Gaps
 
 ### 🔴 Critical Gaps
 
 | Gap | Impact | Mitigation |
 |-----|--------|------------|
 | **RTL Layout Engine** | Arabic templates display incorrectly | Need RTL-aware composition layer |
 | **7 Arabic Dialects TTS** | Only MSA available in templates | Map template to dialect selector |
 | **CJK Typography** | Chinese/Japanese text rendering issues | Font embedding in video pipeline |
 | **African Languages** | Limited TTS quality for SW/YO/AM | Azure Neural covers basics, quality varies |
 
 ### 🟡 Moderate Gaps
 
 | Gap | Impact | Mitigation |
 |-----|--------|------------|
 | **Regional Stock Assets** | Most assets are Western-centric | Need regional asset libraries |
 | **Cultural Compliance** | Some templates may be culturally inappropriate | Regional review before deployment |
 | **Mobile Templates** | Only ~30% have mobile variants | Batch mobile generation needed |
 | **Provider Consistency** | Different providers = slightly different aesthetics | Style intent normalization |
 
 ### 🟢 Minor Gaps
 
 | Gap | Impact | Mitigation |
 |-----|--------|------------|
 | **Template Versioning** | Can't track style changes | Add version field to schema |
 | **A/B Testing** | No way to test template variants | Future feature |
 | **User Favorites** | No personalization | Future feature |
 
 ## Implementation Decision Matrix
 
 | Approach | Pros | Cons | Recommendation |
 |----------|------|------|----------------|
 | **Keep All + Style Abstract** | Fast, no regeneration | Some visual inconsistency | ✅ Phase 1 |
 | **Regenerate All** | Perfect consistency | Expensive, time-consuming | ❌ Not recommended |
 | **Hybrid: Abstract + Regional New** | Best of both | Medium effort | ✅ Phase 1+2 |
 | **User Regenerate on Demand** | User controls quality | Slow, confusing UX | ❌ Not recommended |
 
 ## Recommended Approach
 
 ```
 PHASE 1 (Now)
 ├── Add style_intent to all 407 templates
 ├── Routing engine resolves to optimal provider
 └── No regeneration needed
 
 PHASE 2 (Weeks 2-4)
 ├── Generate 225 NEW regional templates
 ├── Native aesthetics (MENA, India, CJK, Africa)
 └── Built with correct providers from start
 
 PHASE 3 (Weeks 4-6)
 ├── Auto-generate mobile variants
 ├── Platform-specific (TikTok, IG, YT Shorts)
 └── 9:16, 1:1, 4:5 aspect ratios
 ```
 
 ## Template Inventory Sharing Workflow
 
 When regenerating templates, the system should:
 
 1. **Export Current Inventory**
    - JSON dump of all 407 templates with metadata
    - Include: title, style_intent, original_provider, target_regions
 
 2. **Gap Analysis Report**
    - Which templates lack regional variants
    - Which templates need mobile versions
    - Which templates have outdated providers
 
 3. **Regeneration Queue**
    - Priority-ordered list of templates to regenerate
    - Estimated credits and time
    - Can be executed in batches
 
 4. **User Override Option**
    - Users can request regeneration of specific templates
    - Uses current routing logic instead of original provider
    - Stores both versions for comparison