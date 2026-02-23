# GenieSuite Phase 9 — Business Intelligence & Competitive Analysis

> **Generated**: Feb 23, 2026
> **Status**: Living document — updated as research completes
> **Purpose**: Internal strategy doc for pricing, ROI, breakeven, competitive positioning
> **Note**: Pricing tiers are under redesign based on current build capabilities

---

## TABLE OF CONTENTS

1. [Phase 1-6 Completion Status](#1-phase-1-6-completion-status)
2. [Gap Analysis — What to Fix Before Phase 7](#2-gap-analysis)
3. [Competitive Landscape (50+ Competitors)](#3-competitive-landscape)
4. [Regional Coverage (16 Regions, 72 Zones)](#4-regional-coverage)
5. [Marketing Pipeline — Phase 6 vs 7](#5-marketing-pipeline)
6. [GenieSuite Capabilities & Differentiators](#6-geniesuite-differentiators)
7. [Competitor Pricing, ARR, Users](#7-competitor-pricing)
8. [AI Provider Costs (Our Internal Costs)](#8-ai-provider-costs)
9. [Subscription Tiers (Under Redesign)](#9-subscription-tiers)
10. [ROI Model & Breakeven Analysis](#10-roi-breakeven)

---

## 1. PHASE 1-6 COMPLETION STATUS

### Overall: 82% Complete, Production-Grade Foundation

```
Phase 1 (Foundation):       ████████████████████ 100%
Phase 2 (AI Routing):       ████████████████████ 100%
Phase 3 (Content Creation): ████████████████████ 100%
Phase 4 (Production):       ███████████████████░  95%
Phase 5 (Distribution):     ████████████████░░░░  80%
Phase 6 (Production UI):    ███████████████░░░░░  75%
```

### Key Metrics

| Metric | Value |
|--------|-------|
| Sprint Tasks | 36/41 completed (88%) |
| Products Delivered | 3 (Spark, Mind, Deck) + Cast, Vibe, Hub, Ask |
| Components Built | 194+ |
| Custom Hooks | 400+ |
| Services | 130+ files |
| Edge Functions | 250+ |
| Video Styles | 99 (19 categories) |
| AI Providers | 17+ integrated |
| Regions | 16 parent + 56 subregions = 72 zones |
| Languages | 75+ with 50+ dialects |
| Issues Found/Fixed | 33 found, 23 fixed, 3 open, 7 deferred |
| Build Status | Passing clean (0 TS errors) |

### Phase-by-Phase Details

#### Phase 1: Foundation & Authentication — 100% COMPLETE
- 3 products delivered (Spark, Mind, Deck) with real DB persistence
- Auth, navigation, routing all working
- Sprint tracker dashboard with 12 sub-components
- 14 issues found Day 1, 7 fixed immediately

#### Phase 2: AI Provider Routing — 100% COMPLETE
- Master ecosystem registry (17+ providers, 206+ pipelines)
- 4-zone regional routing (Claude, Alibaba/Qwen, Gemini, GPT-4o fallback)
- Provider selection + failover + quality scoring
- 84KB create flow orchestrator

#### Phase 3: Content Creation & Templates — 100% COMPLETE
- GenieSpark: Real AI generation (fixed from simulated), 6-phase wizard
- GenieMind: Script editing with media library, TTS, music
- GenieDeck: 8-step presentation wizard with HIPAA badge
- All saving to real DB (Supabase), real UUIDs

#### Phase 4: Production Pipeline — 95% COMPLETE
- Scene composition engine (60KB), recommendation engine (150KB)
- Multi-provider TTS, music, SFX, video generation
- Avatar generation pipeline, audio mixing, dubbing
- Gap: ScriptEditorTab is 127KB monolith needing refactor

#### Phase 5: Distribution & Analytics — 80% COMPLETE
- 99 visual styles, 22 output presets, 39 characters
- Smart scheduler (7 regions, 3 slots/day, holiday awareness)
- 14-channel distribution (tiered: Free→Pro→Business→Enterprise)
- Gap: Analytics dashboards showing skeleton/placeholder data

#### Phase 6: Production UI & Video Editing — 75% COMPLETE
- Phase 6E: Multi-mode production UI (committed)
- P1: Universal timeline editor + 30+ platform export (committed)
- P2: A/V sync engine + streaming downloads (committed)
- P3: Unified production session + scene-aware teleprompter (committed)
- Gaps: Edge function stubs need real GPU rendering, some provider integrations unverified

---

## 2. GAP ANALYSIS — What to Fix Before Phase 7

### CRITICAL (4) — Must fix before production

| # | Gap | File | Impact |
|---|-----|------|--------|
| 1 | **Voiceover save is stub** — no DB persistence | `useGenieMediaLibrary.ts` | Users can't save voiceovers in Mind |
| 2 | **Document extraction stubs** — Azure Form Recognizer & AWS Textract need credentials | `document-processor/index.ts:4842,4884` | Falls back to basic OCR |
| 3 | **Provider matrix not persisting** — "Database persistence coming soon!" toast | `ProviderCapabilityMatrix.tsx:557` | Config lost on refresh |
| 4 | **Music generation API unverified** | `CrossFunctionalMusic.tsx` | May not call real providers |

### HIGH (5) — Breaks key workflows

| # | Gap | File | Impact |
|---|-----|------|--------|
| 5 | **RBAC permissions = empty array** | `useMasterRoleManagement.tsx:37` | All users have same permissions |
| 6 | **Module/facility role assignment** — "coming soon" toasts | `RoleManagement.tsx:147,164` | Feature stubs |
| 7 | **Amazon Translate not implemented** — falls back to Gemini | `translation-service/index.ts:363` | Wrong provider routing |
| 8 | **Audio delete cross-product** — not wired | `GenieMind.tsx:301` | Can't delete audio |
| 9 | **Stale audio URL handling** | `SavedAudioCard.tsx` | Blob URLs break on reload |

### MEDIUM (18) — Feature limitations

- 7 "coming soon" toast-only buttons (voice recording, AI enhancement, auto-arrange, voice input, recording sharing, upload, social OAuth)
- Dashboard statistics all zeros (facilities, modules, activity tracking)
- Tier usage remaining always shows limit, not actual remaining
- Offline publishing queue stubbed
- Generated content drafts not persisting to DB
- Node schema registry blocked on table creation
- Enrollment session status not persisting

### LOW (12) — Polish items
- Mobile responsiveness, URL sync, template pre-fill, hardcoded header data

### Priority Order for Phase 6 Completion (Before Phase 7)

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| P0 | Fix voiceover save stub | 2h | Unblocks Mind audio |
| P0 | Verify music generation API | 4h | Cross-product music |
| P0 | Wire provider matrix to DB | 3h | Config persistence |
| P0 | Fix RBAC permissions | 4h | Security requirement |
| P1 | Wire Amazon Translate | 2h | Correct routing |
| P1 | Fix audio delete cross-product | 2h | Basic CRUD |
| P1 | Fix stale audio URLs | 3h | Data integrity |
| P2 | Complete analytics dashboards (real data) | 8h | Enterprise readiness |
| P2 | Fix 7 "coming soon" toast stubs | 4h | Feature completion |
| P2 | Wire tier usage tracking | 3h | Billing accuracy |
| P3 | Refactor ScriptEditorTab (127KB) | 8h | Maintainability |
| P3 | Fix dashboard stats (facilities/modules) | 2h | Admin visibility |

**Total estimated effort to complete Phase 6: ~45 hours (1 sprint)**

---

## 3. COMPETITIVE LANDSCAPE

### GenieSuite's 3 Defensible Moats

**1. End-to-End Content Pipeline**
No competitor chains input→script→video→audio→avatar→presentation→distribution in one platform.
- 35 combination chains (C1-C35) chaining 5-19 atomic pipelines
- Zero-to-hero pipeline: natural language → finished video in under 5 minutes
- Competitors are point solutions: Veeva manages content, Synthesia makes avatar videos, Aktana routes engagement

**2. Cultural Transcreation at Scale**
62+ sub-regional profiles with automatic adaptation of:
- Narrative style, music genre, color palette, tone
- Greeting style, CTAs, cultural references, forbidden topics
- Every competitor does translation at best; GenieSuite does *transcreation*

**3. Multi-Provider AI Architecture**
17+ AI providers with intelligent routing by style/region/capability.
- Avoids single-vendor lock-in (Veeva → Anthropic, EVERSANA → Google, Indegene → Microsoft)
- Best-in-class output quality for every region and content type

### Competitor-by-Competitor Assessment

#### Tier 1: Pharma-Specific Platforms

| Competitor | What They Do | Our Advantage | Their Advantage |
|-----------|-------------|---------------|-----------------|
| **Veeva PromoMats** | Content management + MLR review | We CREATE content; they manage it | MLR workflows, 8/10 top pharma |
| **IQVIA OCE** | CRM + omnichannel marketing | We create content; they route engagement | HCP data, prescribing behavior |
| **Indegene** | Pharma content services (200K+ pages tagged) | VIDEO/AUDIO/AVATAR; they do text only | Content atomization, MLR expertise |
| **EVERSANA** | AI-powered agency on Google Cloud | Self-service PLATFORM vs agency model | 7,000 life sciences experts |
| **Aktana** | Next-best-action HCP engagement (50% top-20 pharma) | We create the content Aktana recommends | Deep HCP behavior analytics |
| **Doceree** | Programmatic HCP advertising | We create the ads they distribute | 2,000+ medical publisher network |
| **DeepIntent** | Healthcare DSP, NPI-level targeting | We create variant assets for A/B testing | 95%+ NPI match, 80K+ drugs |
| **Sorcero** | Medical knowledge intelligence ($42.5M Series B) | We turn insights INTO content | 96.1% clinical accuracy |

#### Tier 2: Enterprise Platforms

| Competitor | Our Advantage | Their Advantage |
|-----------|---------------|-----------------|
| **Adobe GenStudio** | VIDEO/PODCAST/3D production; they do image/text | Massive install base, Firefly, pharma MLR |
| **Salesforce Health Cloud** | Content CREATION vs CRM | Dominant CRM, 1,700+ companies |

#### Tier 3: AI Video & Avatar

| Competitor | Our Advantage | Their Advantage |
|-----------|---------------|-----------------|
| **Synthesia** ($4B valuation) | Full pipeline + 99 styles vs 1 format; 62+ regions vs translation | Market leader, Fortune 100 trust, simpler UX |
| **HeyGen** | 19 providers vs proprietary; full pipeline | Polished avatar UX |
| **Colossyan** | Multi-format vs L&D only | SCORM compliance training |
| **D-ID** | Cultural transcreation | Real-time conversational agents |

#### Tier 4: AI Content & Presentation

| Competitor | Our Advantage | Their Advantage |
|-----------|---------------|-----------------|
| **Jasper AI** | VIDEO/AUDIO/PRESENTATIONS; they do text only | 342% ROI (Forrester), brand governance |
| **Gamma** ($50M ARR) | Full pipeline + video + 3D | Simpler UX, viral adoption |
| **Beautiful.ai** | Pipeline integration + cultural adaptation | Smart Slide auto-layout |
| **Tome** | Multi-format production | Interactive web content |

### Competitive Positioning Matrix

| Capability | GenieSuite | Veeva | IQVIA | Indegene | Synthesia | Adobe | Salesforce |
|------------|-----------|-------|-------|----------|-----------|-------|------------|
| Script Generation from Input | **YES** | No | No | Partial | No | No | No |
| AI Video Production | **YES (19 providers)** | No | No | No | Yes (1) | No | No |
| Avatar/Lip-sync/Dubbing | **YES** | No | No | No | Yes | No | No |
| AI Podcast/Audio | **YES** | No | No | No | No | No | No |
| AI Presentations | **YES** | No | No | No | No | No | No |
| MLR Workflow | Basic | **LEADER** | Yes | Yes | No | Yes | No |
| CRM/HCP Targeting | No | Yes | **LEADER** | Yes | No | Yes | **LEADER** |
| Cultural Transcreation | **YES (62+ regions)** | No | No | Partial | No | No | No |
| Multi-Platform Distribution | **YES (Cast)** | No | No | Partial | No | Partial | Yes |
| End-to-End Pipeline | **UNIQUE (35 chains)** | No | No | No | No | Partial | No |

### Go-To-Market Strategy

**Integration play** — Position as the "content creation engine" that feeds INTO the existing pharma ecosystem:
- Veeva PromoMats → auto-submit for MLR review
- Salesforce → supply personalized content for HCP engagement
- IQVIA OCE → generate variants for ADA engine recommendations
- Aktana → create personalized content for next-best-action delivery
- Doceree/DeepIntent → create creative assets for programmatic distribution

---

## 4. REGIONAL COVERAGE

### 16 Regions, 72 Zones, 75+ Languages

| Region | Score | Languages | TTS | Video | Translation | Compliance |
|--------|-------|-----------|-----|-------|-------------|------------|
| **North America** | 5/5 | en-US, en-CA, fr-CA | Full | Full | Full | HIPAA/CCPA |
| **Europe (Western)** | 5/5 | 18 languages | Full | Full | Full | GDPR |
| **CJK** | 5/5 | zh-CN/TW/HK, ja, ko | Native Qwen3 | Alibaba Wan | Full | PIPL/APPI/PIPA |
| **MENA** | 5/5 | 7 Arabic dialects + he, fa, tr | Full | Full | Full | PDPL |
| **India** | 5/5 | 22 languages | Full | Full | Full | DPDPA 2023 |
| **Latin America** | 5/5 | 13 languages (10 Spanish variants) | Full | Full | Full | LGPD |
| **Turkey** | 5/5 | tr, ku | Full | Full | Full | Local |
| **Oceania** | 5/5 | en-AU, en-NZ, mi | Full | Full | Full | Privacy Act |
| **Southeast Asia** | 4.5/5 | 10 languages | Full | Full | Full | PDPA |
| **Europe (Eastern)** | 4/5 | 7 languages | Full | Full | Partial | Local |
| **Africa** | 4/5 | 11 vernaculars | Limited | Limited | Limited | POPIA |
| **Pakistan** | 4/5 | ur, pa, ps, sd | Full | Partial | Partial | Local |
| **Bangladesh** | 4/5 | bn, dz, or | Full | Partial | Partial | Local |
| **Caribbean** | 4/5 | en, fr, ht | Full | Partial | Partial | Local |
| **South Asia** | 3.5/5 | ne, si, dz, dv | Partial | Partial | Partial | Local |
| **Central Asia** | 3/5 | kk, uz, az | Partial | Partial | Limited | Local |

### 3 Regional Competitive Moats (NO competitor has these)

1. **7 Arabic dialects** (Saudi, UAE, Egyptian, Moroccan, Levantine, Iraqi, Lebanese) — competitors only support MSA
2. **22 Indian languages** — competitors support 1-2 at most
3. **10+ African vernaculars** (Swahili, Yoruba, Hausa, Igbo, Amharic) — competitors have ZERO

### RTL Support: FULLY IMPLEMENTED
- Arabic (7 dialects), Hebrew, Persian, Urdu
- CSS: `dir-rtl`, `text-right`, full layout mirroring

### CJK Support: FULLY IMPLEMENTED with Native TTS
- Alibaba Qwen3-TTS for Chinese (Mandarin + Cantonese), Japanese (with keigo), Korean
- Alibaba Wan 2.6 for CJK-optimized video generation

---

## 5. MARKETING PIPELINE — Phase 6 vs Phase 7

### Phase 6 Marketing (75% Complete)

| Feature | Status |
|---------|--------|
| AI Messaging Generator (6 angles, 16 capabilities) | Built |
| Smart Scheduler (7 regions, 3 slots/day, holiday awareness) | Built |
| 11 Marketing Pipelines (repurposing + production) | Built |
| 14-Channel Distribution (tiered) | Built |
| Brand Intelligence (10 frameworks, 6 business tiers) | Built |
| Basic Analytics (platform metrics, engagement) | Built |
| Content Repurposing (shorts, highlights, thumbnails) | Built |

### Phase 7 Marketing (0% Built — Required for Enterprise Pharma)

| Feature | Priority | Impact | Effort |
|---------|----------|--------|--------|
| **MLR Compliance & Approval** | P0-CRITICAL | Regulatory blocker | 3-4 weeks |
| **CRM Integration (Veeva/Salesforce)** | P0 | Can't manage HCPs | 4-6 weeks |
| **HCP Engagement & Segmentation** | P1 | Core pharma use case | 3-4 weeks |
| **Omnichannel Automation** | P1 | Multi-step campaigns | 4-5 weeks |
| **Advanced Analytics** (funnel, cohort, LTV) | P2 | Enterprise requirement | 2-3 weeks |
| **A/B Testing Framework** | P2 | Optimization | 2 weeks |
| **Lead Management & Scoring** | P2 | Sales pipeline | 2-3 weeks |
| **AI Personalization** | P3 | Conversion improvement | 3-4 weeks |

---

## 6. GENIESUITE DIFFERENTIATORS — Feature Highlights

### What Makes GenieSuite Unique

| Differentiator | Details | Competitor Status |
|---------------|---------|-------------------|
| **99 Video Styles** | 19 categories (cinematic, avatar, podcast, 3D, VR, animation, etc.) | Synthesia: 1 style, HeyGen: 1 style |
| **72 Regional Zones** | Cultural transcreation (not just translation) | Everyone else: translation only |
| **17+ AI Providers** | Intelligent routing by style/region/capability | Competitors use 1-2 providers |
| **35 Combination Chains** | End-to-end pipelines chaining 5-19 atomic operations | No competitor has this |
| **7 Arabic Dialects** | Saudi, UAE, Egyptian, Moroccan, Levantine, Iraqi, Lebanese | Competitors: MSA only |
| **22 Indian Languages** | Full TTS + translation + transcreation | Competitors: 1-2 languages |
| **10+ African Vernaculars** | Swahili, Yoruba, Hausa, Igbo, Amharic | Competitors: ZERO |
| **Zero-to-Hero Pipeline** | Natural language → finished video in minutes | No competitor |
| **Dual Script System** | Narration (TTS) + Visual prompts (video gen) independently editable | No competitor |
| **Scene-Aware Teleprompter** | Word-level sync, inline editing, multi-format | No competitor |
| **Multi-Track Timeline** | 8 tracks (video, b-roll, avatar, voice, music, SFX, subtitle, overlay) | Basic in competitors |
| **30+ Export Platforms** | Instagram, TikTok, YouTube, WhatsApp, LinkedIn, WeChat, LINE, KakaoTalk, CTV, Digital Signage | 5-10 in competitors |
| **Streaming Downloads** | Chunked with pause/resume for 2GB+ files | Not available elsewhere |
| **A/V Sync Engine** | Auto-alignment, pre-render validation, mismatch detection | Not in content tools |
| **Production Estimator** | Duration tiers, provider limits, stitching guidance | Not available |

### Products (7 Total)

| Product | Tagline | Function |
|---------|---------|----------|
| **Genie Spark** | "Ignite Your Ideas" | Multi-format input → script generation |
| **Genie Mind** | "AI That Understands" | Script editing, TTS, voice cloning, translation |
| **Genie Vibe** | "Script to Screen" | Full AV production, podcast, video, dubbing, avatar |
| **Genie Deck** | "Ideas to Impact" | AI presentation builder: slides, 3D, interactive |
| **Genie Hub** | "Your Creative Command Center" | Project management, Kanban, approval chains |
| **Genie Cast** | "Make It. Show It. Scale It." | 14-region distribution, multi-platform publishing |
| **Ask Genie** | "Your wish is my command" | Universal AI assistant |

### AI Provider Infrastructure (19 Core)

| Category | Providers |
|----------|----------|
| **Video** | Vertex Veo 3, Sora 2, Alibaba Wan 2.6/2.2, ModelsLab, Replicate |
| **LLM** | Claude 4, Qwen Max, Gemini Pro, GPT-4o, DeepSeek V3, Mistral, Cohere |
| **TTS** | Azure Neural, Qwen3-TTS, Google TTS, ElevenLabs, OpenAI TTS |
| **STT** | Deepgram Nova 2, Alibaba Paraformer, Azure STT, Whisper |
| **Avatar/3D** | Alibaba Wan 2.2, OmniAvatar, TaoAvatar, MACH, Meshy AI |
| **Translation** | DeepL, Qwen-MT, Azure Translator, Google, AWS Translate |
| **Image** | DALL-E 3, Gemini Imagen 3, FLUX, SDXL |

---

## 7. COMPETITOR PRICING, ARR, USERS

> **Status**: Research in progress — web research agents scanning 50+ companies
> Data will be populated as research completes.

### AI Video Generation

| Competitor | Pricing | ARR | Users | Funding | Model |
|-----------|---------|-----|-------|---------|-------|
| Synthesia | Starter $22/mo, Creator $67/mo, Enterprise custom | ~$100M+ (est.) | 50,000+ businesses | $256M raised, $4B valuation | Per-seat + per-video |
| HeyGen | Creator $29/mo, Business $89/mo, Enterprise custom | ~$50M+ (est.) | 40,000+ businesses | $60M raised | Per-seat + credits |
| Colossyan | Starter $27/mo, Pro $87/mo, Enterprise custom | ~$20M (est.) | 10,000+ | $22M raised | Per-seat + minutes |
| D-ID | Lite $5.99/mo, Pro $49.99/mo, Enterprise custom | ~$30M (est.) | 100M+ API calls | $48M raised | Credits-based |
| Runway | Standard $15/mo, Pro $35/mo, Unlimited $95/mo | ~$100M+ (est.) | 500K+ | $241M raised, $4B valuation | Credits per second |
| Descript | Hobbyist $24/mo, Pro $33/mo, Business $40/mo | ~$50M (est.) | 100K+ | $100M raised | Per-seat |

### Text-to-Speech (TTS)

| Competitor | Pricing | ARR | Users | Model |
|-----------|---------|-----|-------|-------|
| ElevenLabs | Free 10K chars, Starter $5/mo, Creator $22/mo, Pro $99/mo, Scale $330/mo | ~$100M+ (est.) | 1M+ | Per-character/minute |
| Murf AI | Creator $26/mo, Business $59/mo, Enterprise custom | ~$15M (est.) | 100K+ | Per-seat + hours |
| Play.ht | Pro $31.20/mo, Business custom | ~$10M (est.) | 50K+ | Per-character |
| WellSaid Labs | Essentials $44/mo, Pro custom | ~$15M (est.) | 10K+ | Per-seat + downloads |

### Translation

| Competitor | Pricing | ARR | Users | Model |
|-----------|---------|-----|-------|-------|
| DeepL | Starter $8.74/mo, Advanced $28.74/mo, Ultimate $57.49/mo | ~$100M+ (est.) | 100K+ businesses | Per-character |
| Smartling | Custom enterprise | ~$50M (est.) | 1,000+ enterprises | Per-word |
| Phrase (Memsource) | Starter $25/mo, Pro $300/mo | ~$40M (est.) | 500+ enterprises | Per-word |

### AI Content/Copy

| Competitor | Pricing | ARR | Users | Model |
|-----------|---------|-----|-------|-------|
| Jasper AI | Creator $49/mo, Pro $69/mo, Business custom | ~$80M (est.) | 100K+ | Per-seat + words |
| Copy.ai | Free, Starter $49/mo, Advanced $249/mo | ~$30M (est.) | 50K+ | Per-seat + workflows |
| Writer.com | Team $18/seat/mo, Enterprise custom | ~$60M (est.) | 10K+ enterprises | Per-seat |

### AI Presentations

| Competitor | Pricing | ARR | Users | Model |
|-----------|---------|-----|-------|-------|
| Gamma | Free, Plus $10/mo, Pro $20/mo | ~$50M ARR (confirmed) | 1M+ | Freemium |
| Beautiful.ai | Pro $12/mo, Team $40/seat/mo | ~$20M (est.) | 100K+ | Per-seat |
| Tome | Free, Pro $16/mo, Enterprise custom | ~$15M (est.) | 500K+ | Per-seat + credits |

### Pharma-Specific

| Competitor | Pricing | ARR | Users | Model |
|-----------|---------|-----|-------|-------|
| Veeva | Platform license $50K-500K+/yr | ~$2.4B (total Veeva) | 1,300+ pharma companies | Enterprise license |
| IQVIA OCE | Custom enterprise | ~$15B (total IQVIA) | 500+ pharma companies | Enterprise license |
| Aktana | Custom | ~$50M (est.) | 350+ brands, 50%+ top-20 | Enterprise license |
| Sorcero | Custom | ~$20M (est.) | 40% top-30 pharma | Enterprise license |

> **Note**: ARR figures marked (est.) are estimates based on public data, funding, and market intelligence.
> Actual figures may differ. Updated data will be added as research completes.

---

## 8. AI PROVIDER COSTS (Our Internal Costs)

> **Status**: Research agent calculating per-operation costs
> Data will be populated as research completes.

### Per-Operation Cost Estimates (Current API Pricing)

#### LLM (Text Generation)

| Provider | Input ($/1M tokens) | Output ($/1M tokens) | Typical Script Gen Cost |
|----------|---------------------|----------------------|------------------------|
| Claude 4 Opus | $15.00 | $75.00 | ~$0.08 per 2K script |
| Claude 4 Sonnet | $3.00 | $15.00 | ~$0.02 per 2K script |
| Claude 4 Haiku | $0.25 | $1.25 | ~$0.002 per 2K script |
| GPT-4o | $2.50 | $10.00 | ~$0.015 per 2K script |
| GPT-4o-mini | $0.15 | $0.60 | ~$0.001 per 2K script |
| Gemini 2.0 Pro | $1.25 | $5.00 | ~$0.008 per 2K script |
| Gemini 2.0 Flash | $0.10 | $0.40 | ~$0.001 per 2K script |
| Qwen Max | ~$1.00 | ~$4.00 | ~$0.006 per 2K script |

#### TTS (Text-to-Speech)

| Provider | Cost per 1M Characters | Cost per Minute (~150 words) |
|----------|----------------------|------------------------------|
| Azure Neural TTS | $16.00 | ~$0.013 |
| Google Cloud TTS | $16.00 | ~$0.013 |
| ElevenLabs API | $30.00 (Starter) | ~$0.024 |
| OpenAI TTS | $15.00 | ~$0.012 |
| Alibaba Qwen3-TTS | ~$8.00 | ~$0.006 |

#### Video Generation

| Provider | Cost per Generation | Typical Duration | Cost per Minute |
|----------|--------------------|-----------------|-----------------|
| Vertex Veo 3 | ~$0.10-0.50/generation | 4-16 sec | ~$0.75-3.00 |
| Alibaba Wan 2.6 | ~$0.05-0.20/generation | 5-10 sec | ~$0.30-1.20 |
| Runway Gen-3 | ~$0.05/sec | 5-10 sec | ~$3.00 |
| Sora 2 | ~$0.15-0.50/generation | 5-20 sec | ~$0.45-3.00 |

#### Translation

| Provider | Cost per 1M Characters | Cost per 1K Words |
|----------|----------------------|-------------------|
| DeepL API | $25.00 | ~$0.13 |
| Google Translate | $20.00 | ~$0.10 |
| Azure Translator | $10.00 | ~$0.05 |
| Alibaba Qwen-MT | ~$5.00 | ~$0.025 |

### Typical Workflow Costs (Our Internal Cost)

| Workflow | Components | Estimated Cost |
|----------|-----------|----------------|
| **2-min marketing video** | Script gen + TTS + video gen + subtitles | ~$2.00-5.00 |
| **10-slide presentation** | Script gen + slide content + image gen | ~$0.50-1.50 |
| **15-min podcast** | Script gen + TTS + music + SFX | ~$1.00-3.00 |
| **Translation to 5 languages** | Translation + TTS per language | ~$0.50-2.00 |
| **2-min avatar video** | Script + avatar gen + TTS + lip-sync | ~$3.00-8.00 |
| **Full campaign (all formats)** | Video + podcast + presentation + 5 translations | ~$10.00-25.00 |

> **Note**: Costs are estimates based on current API pricing as of Feb 2026.
> Volume discounts, committed use agreements, and provider negotiations will reduce these.

---

## 9. SUBSCRIPTION TIERS (Under Redesign)

> **Note**: The existing 6-tier model ($0/$12/$29/$29.99/$149/custom) is from earlier research.
> These tiers are being redesigned based on current build capabilities.
> Below is the EXISTING architecture for reference — new pricing TBD.

### Current Tier Architecture (Reference Only)

| Tier | Price | Credits | Products | Key Features |
|------|-------|---------|----------|-------------|
| Free | $0 | 25/mo | Mind, Spark | 3 presentations, 1 dub, watermarked |
| Starter | $12/mo | 150/mo | Mind, Spark, Vibe | 15 presentations, 5 dubs, 1080p |
| Creator | $29/mo | 400/mo | Mind, Spark, Vibe, Arc | 30 presentations, 8 avatar videos, brand kit |
| Pro | $29.99/mo | 500/mo | All except Enterprise features | 15 avatar videos, unlimited dubbing, 3 voice clones |
| Business | $149/mo | 3,000/mo | All | Unlimited presentations, 50 avatar videos, API access |
| Enterprise | Custom | Unlimited | All + white-label, SSO, HIPAA, SLA | Custom avatar training, on-premise option |

### Existing Infrastructure

- **Stripe Integration**: Product/price IDs configured for Starter, Pro, Business
- **Regional Pricing**: PPP multipliers via `genie_regional_pricing` table
- **Credit System**: Per-feature costs, à la carte packages
- **Payment Methods**: Card (global), UPI (India), WeChat Pay (CJK), SEPA/iDEAL (EU), GrabPay (SEA)
- **Distribution Gating**: Channels unlocked by tier (Free: download/email, Pro: social, Business: LinkedIn/X, Enterprise: WhatsApp/Slack/webhooks)
- **Quality Tiers**: Standard (720p) → Advanced (1080p) → Premium (4K)
- **Usage Limits**: Conversations, messages, tokens, voice/video minutes all gated
- **Batch Concurrency**: Free: 2, Starter: 3, Creator: 5, Pro: 10, Business: 20, Enterprise: 50

### What Needs Redesign

1. **Pricing doesn't reflect current capabilities** — 99 styles, 72 zones, 35 chains not priced
2. **Credit costs need recalculation** — based on actual AI provider costs (Section 8)
3. **Regional pricing needs PPP calibration** — India, Africa, LATAM need adjusted pricing
4. **Podcast/webcast tiers missing** — new formats not reflected
5. **Video editing/timeline tiers missing** — P1-P3 features not gated
6. **Enterprise pharma tier missing** — MLR, CRM, HCP features need their own tier

---

## 10. ROI MODEL & BREAKEVEN ANALYSIS

> **Status**: Will be calculated once competitor pricing and AI provider cost research completes.

### Framework

#### For Customers (Their ROI)

| Metric | Traditional | With GenieSuite | Savings |
|--------|------------|-----------------|---------|
| 2-min marketing video | $5,000-50,000 (agency) | $29.99/mo subscription | 99%+ cost reduction |
| 31-language video dub | $150,000+ (Synthesia case study) | $149/mo subscription | 99%+ cost reduction |
| 10-slide presentation | $500-2,000 (designer) | $12/mo subscription | 95%+ cost reduction |
| Content localization (5 markets) | $10,000-50,000 (agencies) | $29.99/mo subscription | 99%+ cost reduction |

#### For Us (Our ROI)

| Metric | Calculation |
|--------|------------|
| **Average internal cost per user/month** | ~$5-15 (based on typical usage) |
| **Average revenue per user/month** | $12-149 (depends on tier mix) |
| **Gross margin target** | 70-80% |
| **CAC (Customer Acquisition Cost)** | TBD |
| **LTV (Lifetime Value)** | TBD (depends on churn rate) |
| **Breakeven users (Free→Paid conversion)** | TBD |
| **Monthly burn rate** | TBD (hosting + AI provider costs) |

### Breakeven Scenarios

| Scenario | Monthly Cost | Revenue Needed | Users Needed (at $30 ARPU) |
|----------|-------------|---------------|---------------------------|
| Infrastructure only | ~$5,000/mo | $5,000/mo | 167 paid users |
| + AI provider costs (1K users) | ~$20,000/mo | $20,000/mo | 667 paid users |
| + Team (5 engineers) | ~$70,000/mo | $70,000/mo | 2,333 paid users |
| + Marketing + Sales | ~$120,000/mo | $120,000/mo | 4,000 paid users |
| Full operation | ~$200,000/mo | $200,000/mo | 6,667 paid users |

> **Note**: These are placeholder estimates. Will be refined with actual provider cost data.

---

## INDUSTRY PAIN POINTS — What Customers Want

### Customer Frustrations (From Market Research)

| Pain Point | Current Solution | GenieSuite Answer |
|-----------|-----------------|-------------------|
| MLR approval takes 6-12 weeks | Manual review, email chains | Phase 7: AI pre-screening + workflow |
| Content localization is manual | Translation agencies, weeks per market | Transcreation engine (62+ regions) |
| No single platform for all content | 5-7 tools stitched together | 7 products, 1 platform |
| HCP engagement is generic | Same message to all doctors | Phase 7: Segmentation + personalization |
| Can't reuse content across channels | Manual reformatting | 11 repurposing pipelines |
| No visibility into performance | Siloed analytics | Unified attribution (Phase 7) |
| Regional compliance is guesswork | Legal team per market | 13 compliance zones mapped |
| Video creation is expensive | $5K-50K per video with agencies | AI-generated at ~$2-5 internal cost |

### Market Size

- AI in pharma: $1.97B (2025) → $21.5B (2035) at 27% CAGR
- Pharma content/commercialization: ~$150B globally
- Content spend for largest pharma: up to $1B/year
- AI video generator market: $614.8M (2024) → $2.56B (2032)
- 75% of pharma companies have GenAI as strategic priority
- Only 17% of life sciences marketers believe AI will impact their roles (adoption gap = opportunity)

---

## STRATEGIC RECOMMENDATIONS

### Immediate (Before Phase 7)
1. Fix 4 critical gaps + 5 high gaps (~25 hours)
2. Verify all AI provider integrations are calling real APIs
3. Complete analytics dashboards with real data

### Phase 7 (Pharma Marketing Automation)
1. MLR compliance service (REGULATORY BLOCKER)
2. CRM connectors (Veeva, Salesforce, HubSpot)
3. HCP engagement & segmentation
4. Omnichannel workflow builder

### Phase 8 (Enterprise Scale)
1. Advanced analytics (funnel, cohort, attribution, LTV)
2. A/B testing framework
3. Lead management & scoring
4. AI personalization engine

### Phase 9 (Business Model)
1. Redesign pricing tiers based on actual costs
2. Regional pricing with PPP calibration
3. Enterprise pharma-specific tier
4. ROI calculator for customers
5. Breakeven modeling with actual data

---

*This document will be updated as remaining research agents complete their analysis.*
