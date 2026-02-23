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
| 2 | **Document extraction stubs** — Azure Form Recognizer key configured; AWS Textract credentials pending (user to enter) | `document-processor/index.ts:4842,4884` | Falls back to basic OCR until AWS configured |
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
- Dashboard statistics: healthcare-side (facilities, modules) NOT used for GenieSuite — GenieSuite has separate tracking via `genie_studio_users` tables
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

> **Updated**: Feb 23, 2026 — Based on web research of 60+ companies across 10 categories
> Sources include TechCrunch, CNBC, PitchBook, company pricing pages, SEC filings, Getlatka

### Market Leaders by ARR

| Rank | Company | Category | ARR/Revenue | Valuation | Key Metric |
|------|---------|----------|-------------|-----------|------------|
| 1 | **Veeva Systems** | Pharma Content/MLR | $2.75B (FY2025) | $35B (public) | 100% top-20 pharma |
| 2 | **Indegene** | Pharma Omnichannel | $354M trailing | $1.52B (public) | Acquired Trilogy Writing |
| 3 | **ElevenLabs** | TTS/Voice AI | $330M ARR | $11B | $0→$330M in 3 years |
| 4 | **DeepL** | Translation | $185M revenue | $2B (IPO→$5B) | 500K+ customers |
| 5 | **Synthesia** | Avatar Video | $150M ARR | $4B | 65K+ businesses |
| 6 | **HeyGen** | Avatar Video | $100M ARR | $500M | 85K+ customers |
| 7 | **Otter.ai** | STT/Meetings | $100M ARR | N/A | 25M+ users |
| 8 | **Gamma** | Presentations | $100M ARR | $2.1B | 70M users, profitable |
| 9 | **Runway ML** | AI Video | ~$90M ARR | $3-5B | 300K+ customers |
| 10 | **Jasper AI** | AI Content | ~$88M | $1.2-1.5B | 100K+ customers |
| 11 | **Writer.com** | Enterprise AI | $47-84M | $1.9B | 160% NRR |
| 12 | **InVideo** | Video Editor | ~$70M ARR | N/A | 7M+ customers |
| 13 | **Pika Labs** | AI Video | ~$50M (proj $130M 2026) | $470-700M | N/A |

### 7A. AI Video Generation

| Company | Pricing | Per-Unit | ARR | Users | Funding | Valuation |
|---------|---------|----------|-----|-------|---------|-----------|
| **Synthesia** | Free (36 min/yr), Starter $18-29/mo (120 min/yr), Creator $64-89/mo (360 min/yr), Enterprise custom | ~$1/min (Starter) | $150M ARR | 65K+ businesses, 70% Fortune 100 | $536.6M | $4B |
| **HeyGen** | Free (3 videos), Creator $24-29/mo (200 credits), Business $149+$20/seat (2K credits), Enterprise custom | ~$1/min (API), $0.50/min (Scale) | $100M ARR | 85K+ customers | $74M | $500M |
| **Colossyan** | Starter $19-27/mo (10 min), Business $70-88/mo (unlimited), Enterprise custom | ~$1.90-2.70/min | ~$6.6M | N/A | $28.4M | N/A |
| **D-ID** | Free (3 min), Lite, Pro $4.70-5.90/mo (100 min), Enterprise custom | ~$0.06/min (Pro) | ~$33.6M | N/A | $48M | N/A |
| **Runway ML** | Free (125 credits), Standard $12-15/mo (625 credits), Pro (2,250), Unlimited $95/mo | ~$0.05-0.12/sec (Gen-4) | ~$90M ARR | 300K+ customers | ~$860M | $3-5B |
| **Pika Labs** | Free (80 credits), Standard $8-10/mo (700), Pro $28-35/mo (2K-2.3K), Fancy $76-95/mo | 5 credits/video (Turbo) | ~$50M | N/A | ~$135M | $470-700M |
| **Luma AI** | Free (500 credits), Lite $9.99/mo (3.2K), Plus $29.99-64.99/mo (10K), Pro $94.99-99.99/mo, Premier $499.99/mo | 5s video ~170 credits | N/A | N/A | ~$1.07B | $4B |
| **InVideo** | Free (10 min/wk), Plus $20-28/mo (50 min), Max $60-120/mo (200 min) | ~$0.40-0.56/min | ~$70M ARR | 7M+ customers | $52.5M | N/A |
| **Pictory** | Free (3 trial), Starter $19-25/mo (200 min), Pro $29-49/mo (600 min), Teams $99-119/mo (1.8K min) | ~$0.05-0.13/min | N/A | N/A | $7.72M | N/A |
| **Descript** | Free (60 min), Hobbyist $16-24/mo, Creator $35/mo, Business $40-50/mo | Credits-based AI | N/A | N/A | N/A | N/A |

### 7B. Text-to-Speech (TTS)

| Company | Pricing | Per-Unit | ARR | Users | Funding | Valuation |
|---------|---------|----------|-----|-------|---------|-----------|
| **ElevenLabs** | Free (10K chars), Starter $5/mo, Creator $22/mo (100K chars), Pro $99/mo (500K), Scale $330/mo (2M), Business $1,320/mo | $0.12-0.30/1K chars overage | **$330M ARR** | 41% Fortune 500, 2M+ agents | $781M | **$11B** |
| **Murf AI** | Free (10 min lifetime), Creator $19/mo (24 hrs/yr), Business $66/mo (96 hrs/yr) | Falcon API: **$0.01/min** (cheapest) | ~$800K | 6M users, 300+ Forbes 2000 | $11.5M | N/A |
| **Play.ht (PlayAI)** | Free (12.5K chars/mo), Premium $39/mo, Unlimited ~$198/mo | Varies by tier | ~$5M | N/A | $21.75M | Acquired by Meta |
| **WellSaid Labs** | Maker $44-49/mo, Creative $89/mo, Team $179/mo, Enterprise custom | Included in plan | N/A | 50% Fortune 500 claimed | Multiple rounds | N/A |
| **Resemble AI** | Pay-as-you-go from $5 | Credit-based | N/A | N/A | $25M | N/A |
| **LOVO AI** | Free (5 min), Basic $24-29/mo (2 hrs), Pro $24-48/mo (5 hrs), Pro+ $75-149/mo | API: $0.03/1K chars | N/A | N/A | $13.4M | N/A |
| **Speechify** | Free (10 voices), Premium $29/mo or $139/yr (200+ voices, 60+ langs) | API: $10/1M chars | ~$17.6M | 50M+ users | ~$10M | ~$100M |

### 7C. Speech-to-Text (STT)

| Company | Pricing | Per-Unit | ARR | Users | Funding | Valuation |
|---------|---------|----------|-----|-------|---------|-----------|
| **Deepgram** | PAYG ($200 free), Growth ($4K/yr min), Enterprise ($15K+/yr) | PAYG: $0.0077/min streaming, **$0.0043/min batch**; Enterprise: $0.003/min | ~$21.8M | N/A | $229M | **$1.3B** |
| **AssemblyAI** | Free ($50 credits), PAYG, Enterprise ($12-24K/yr) | $0.0025/min (Universal); Best $0.37/hr | ~$10.4M | 4K+ paying brands | $115M | N/A |
| **Rev.ai** | API: **$0.003/min** (cheapest), Human: $1.99/min | $0.003/min API | ~$11.7M (2020) | 400+ API customers | $30.5-51.5M | ~$200M |
| **Otter.ai** | Free (300 min/mo), Pro $8.33-16.99/mo (1.2K min), Business $20-30/user/mo (6K min) | ~$0.007-0.014/min | **$100M ARR** | 25M+ users | $70M | N/A |

### 7D. Translation / Transcreation

| Company | Pricing | Per-Unit | ARR | Users | Funding | Valuation |
|---------|---------|----------|-----|-------|---------|-----------|
| **DeepL** | Free (500K chars/mo), Starter EUR5.99/mo, Advanced EUR19.99/mo, Ultimate EUR39.99/mo, API Pro $5.49/mo + $25/1M chars | $0.000025/char (~$0.005/word) | **$185M revenue** (31% YoY) | 500K+ customers | $415M | $2B (IPO→$5B) |
| **Smartling** | Custom starts ~$500/mo | MT: $0.0075/word, AI: $0.06/word, Human: $0.20/word | N/A | N/A | N/A | N/A |
| **Phrase (Memsource)** | From $27/mo (freelancers), Team $209/mo, Enterprise custom | Platform sub + services | N/A | N/A | Acquired | N/A |
| **Lokalise** | ~$300/mo (5 users), Enterprise custom | Platform subscription | N/A | N/A | N/A | N/A |
| **Transifex** | Starter $425/mo (200K words/yr), Growth $625/mo, Enterprise custom | Per-hosted-word | N/A | Acquired by XTM (Jan 2025) | Series A | N/A |

### 7E. AI Content/Copy

| Company | Pricing | Per-Unit | ARR | Users | Funding | Valuation |
|---------|---------|----------|-----|-------|---------|-----------|
| **Jasper AI** | Creator $29-39/mo, Pro $59-69/seat/mo, Business $5K-70K/yr | Per-seat, unlimited words | ~$88M (down from $120M peak) | 100K+ customers | $131M | $1.2-1.5B |
| **Copy.ai** | Chat $24-29/mo (5 seats), Growth $1K/mo (75 seats), Enterprise custom | Per-seat + workflow credits | ~$3.1M (2023) | 17M users | $19.82M | Acquired by Fullcast |
| **Writer.com** | Starter $29-39/user/mo, Enterprise custom | Per-seat, proprietary Palmyra LLM | $47-84M (160% NRR) | N/A | $320M | **$1.9B** |
| **Writesonic** | Lite $39/mo, Standard $79/mo, Pro/Advanced custom | Per-seat + limits | N/A | 10M+ marketers | $2.62M | ~$250M |
| **Anyword** | Starter $19-39/mo, Data-Driven $79/mo, Business $349/mo | Per-seat + word limits | ~$7.5-48.5M (varies) | N/A | $30.1M | N/A |

### 7F. AI Presentations

| Company | Pricing | Per-Unit | ARR | Users | Funding | Valuation |
|---------|---------|----------|-----|-------|---------|-----------|
| **Gamma** | Free, Plus $8/mo, Pro $18/mo, Ultra $100/mo | Per-seat | **$100M ARR** (profitable) | **70M users** | $87M | **$2.1B** |
| **Tome** | **PIVOTED** — brand sold to AngelList, team became Lightfield (sales CRM) | N/A | ~$3.5M pre-pivot | 25M users pre-pivot | $81M | Dissolved |
| **Beautiful.ai** | From $12/mo, Team/Enterprise | Per-seat | N/A | N/A | $16.3M | N/A |
| **Slidebean** | Starter $7/mo, Accelerate $42/mo | Per-seat | ~$6.3M | 2.5K customers | $1M | N/A |
| **Pitch** | Free (3 decks), Pro $8-22/member/mo, Business $22-85/member/mo | Per-member | N/A | N/A | $100M+ | N/A |

### 7G. Podcast / Audio

| Company | Pricing | Per-Unit | ARR | Users | Funding | Valuation |
|---------|---------|----------|-----|-------|---------|-----------|
| **Riverside.fm** | Free (2 hrs), Standard $19/mo, Pro $24-29/mo, Teams $24/user/mo, Live $34/mo, Webinar $79/mo | Per-seat | N/A (targeting profitability 2026) | N/A | $80M | N/A |
| **Descript** | Free (60 min), Hobbyist $16-24/mo, Creator $35/mo, Business $40-50/mo, Education $5/mo | Per-seat + media min + AI credits | N/A | N/A | N/A | N/A |
| **Podcastle (Async)** | Free, Essentials $19.99/mo, Pro $39.99/mo, Business $64.99/mo | Per-seat + credits | ~$29.6M est. | N/A | $22.3M | N/A |
| **Buzzsprout** | Free (90-day), $19/mo (4 hrs), $39/mo (15 hrs), $79/mo (35 hrs) | Per-hour upload + 15% rev share | N/A | 120K active, 300K total podcasts | Bootstrapped | N/A |

### 7H. 3D / Animation

| Company | Pricing | ARR | Funding | Valuation |
|---------|---------|-----|---------|-----------|
| **Spline** | Free, Starter $12/mo, Pro $20/mo, Team $36/mo | ~$4.7-5.4M | $32M | N/A |
| **Rive** | Free, Cadet $9/mo, Voyager $32/mo, Enterprise $120/mo | ~$5.4M | $14M | N/A |
| **LottieFiles** | From ~$20/user/mo, Team/Enterprise | N/A | $47M | N/A |
| **Meshy AI** | Free, Pro $20/mo, Team $30/seat/mo | N/A | N/A | N/A |

### 7I. Pharma-Specific Platforms

| Company | Category | Revenue | Funding/Valuation | Key Metric |
|---------|----------|---------|-------------------|------------|
| **Veeva Vault PromoMats** | Content management + MLR | $2.75B total FY2025, $3.17B guided FY2026 | Public (NYSE: VEEV), ~$35B market cap | 100% top-20 pharma, AI Agents for MLR launching |
| **Indegene** | Omnichannel commercialization | $354M trailing 12mo | Public (India), $1.52B market cap | AI Invisage platform, acquired Trilogy Writing |
| **EVERSANA** | Full commercialization services | N/A (private) | Private, merged with Waltz Health | 650+ org clients, AI Accelerator (Jul 2025) |
| **Aktana** | AI HCP engagement | N/A | $90.7-204M raised (Series D) | 350+ brands, +14% sales uplift, 50% top-20 |
| **Doceree** | HCP programmatic ads | ~$4.2M (FY2024, 100%+ YoY) | $64.8M (Series B) | Only physician-directed programmatic platform |
| **DeepIntent** | Healthcare DSP | N/A (3x YoY growth) | $637M acquisition (Vitruvian, Sep 2025) | 200+ healthcare brands |
| **Sorcero** | AI medical insights | N/A | $59M ($42.5M Series B, Nov 2025) | 1/3 top-30 pharma, 263M publications indexed |

### Key Competitive Intelligence Insights

**1. Tome's Failure = Our Warning**
Tome had 25M users but only $3.5M ARR — they couldn't monetize free users and pivoted away entirely. Gamma (same category) reached $100M ARR by being profitable from day one with clear value tiers.

**2. ElevenLabs = The AI Audio Benchmark**
$0 → $330M ARR in 3 years. They proved voice AI can be a massive standalone business. Our TTS is a feature, not the product — but we can match their quality via multi-provider routing.

**3. Synthesia + HeyGen = Avatar Video Duopoly**
Combined $250M ARR. Both charge per-minute of video. Neither does transcreation, multi-format production, or end-to-end pipelines. That's our gap.

**4. Veeva = Don't Compete, Integrate**
$2.75B revenue, 100% of top-20 pharma. We should be the "content creation engine" that feeds INTO Veeva PromoMats, not tries to replace it.

**5. DeepIntent Acquisition ($637M) Validates Pharma MarTech**
A healthcare DSP sold for $637M — proves there's massive exit value in pharma-focused AI platforms.

**6. Gamma's Efficiency = Our Target**
$100M ARR with 50 employees = $2M revenue per employee. That's the efficiency we should target with our AI-first architecture.

---

## 8. AI PROVIDER COSTS (Our Internal Costs)

> **Updated**: Feb 23, 2026 — Based on actual API pricing research
> **Source**: 30 registered providers across 4 routing zones (Claude, Alibaba, Gemini, Fallback)

### LLM (Text Generation) — Per 1M Tokens

| Provider | Model | Input $/1M | Output $/1M | Cost per Script Gen | Zone |
|----------|-------|-----------|-------------|-------------------|------|
| **Anthropic** | Claude Opus 4.6 | $5.00 | $25.00 | $0.0175 | claude |
| **Anthropic** | Claude Sonnet 4.5 | $3.00 | $15.00 | $0.0135 | claude |
| **Anthropic** | Claude Haiku 4.5 | $1.00 | $5.00 | $0.0045 | claude/fallback |
| **OpenAI** | GPT-4o | $2.50 | $10.00 | $0.0100 | claude/fallback |
| **OpenAI** | GPT-4o-mini | $0.15 | $0.60 | $0.0006 | fallback |
| **Google** | Gemini 2.5 Pro | $1.25 | $10.00 | $0.0075 | gemini |
| **Google** | Gemini 2.5 Flash | $0.30 | $2.50 | $0.0019 | gemini/fallback |
| **Alibaba** | Qwen3 Max | $1.20 | $6.00 | $0.0054 | alibaba |
| **Alibaba** | Qwen 2.5-72B | $0.23 | $0.23 | $0.0006 | alibaba |
| **DeepSeek** | DeepSeek V3.2 | $0.28 | $0.42 | $0.0008 | alibaba/fallback |

*Script gen = ~2,000 input + 1,000 output tokens*

### TTS (Text-to-Speech) — Per Minute of Audio

| Provider | Model | $/1M Chars | $/min | Zone | Notes |
|----------|-------|-----------|-------|------|-------|
| **Azure** | Neural TTS | $16.00 | **$0.013** | ALL | PRIMARY — Viseme lip-sync support |
| **Azure** | Neural HD V2 | $30.00 | $0.024 | ALL | Premium voices |
| **Google Cloud** | WaveNet/Neural2 | $16.00 | $0.013 | gemini | Fallback |
| **OpenAI** | tts-1 | $15.00 | $0.012 | claude | Fallback |
| **OpenAI** | tts-1-hd | $30.00 | $0.024 | claude | Premium |
| **Amazon Polly** | Neural | $16.00 | $0.013 | fallback | AWS fallback |
| **Alibaba** | Qwen3-TTS-Flash | $13.00 | **$0.010** | alibaba | CJK primary — CHEAPEST |
| **ElevenLabs** | Multilingual V2 | $180-240 | **$0.144** | claude | Voice cloning ONLY — 11x more expensive |

### STT (Speech-to-Text) — Per Minute

| Provider | Model | $/min | Priority | Notes |
|----------|-------|-------|----------|-------|
| **Deepgram** | Nova-2 (batch) | **$0.0043** | 1st | CHEAPEST + fastest (<100ms) |
| **OpenAI** | GPT-4o-mini Transcribe | $0.003 | Budget | Cheapest absolute |
| **OpenAI** | Whisper | $0.006 | 3rd | Fallback |
| **Azure** | Speech STT | $0.017 | 2nd | HIPAA-compliant |

### Video Generation — Per Minute of Video

| Provider | Model | $/sec | $/minute | Zone | Notes |
|----------|-------|-------|---------|------|-------|
| **ModelsLab** | AnimateDiff | $0.02 | **$1.20** | fallback | CHEAPEST — artistic styles |
| **Replicate** | Luma Ray | $0.06 | $3.60 | fallback | Fallback |
| **Alibaba** | Wan 2.6 T2V (720p) | $0.08 | **$4.80** | alibaba | CJK primary — best value |
| **OpenAI** | Sora 2 Standard (720p) | $0.10 | **$6.00** | claude | Cinematic primary |
| **Alibaba** | Wan 2.6 T2V (1080p) | $0.12 | $7.20 | alibaba | CJK HD |
| **Google** | Veo 3.1 Fast | $0.10 | $9.60 | gemini | Draft iterations |
| **OpenAI** | Sora 2 Pro (1080p) | $0.50 | $30.00 | claude | HD video |
| **Google** | Veo 3.0 (no audio) | $0.50 | $48.00 | gemini | Quality primary |
| **Google** | Veo 3.0 (with audio) | $0.75 | **$72.00** | gemini | MOST EXPENSIVE |

*Max clip length 5-8 sec per generation. 60-second video = 12+ clips stitched.*

### Image Generation — Per Image

| Provider | Model | $/image | Notes |
|----------|-------|---------|-------|
| **ModelsLab** | FLUX Schnell | **$0.003** | CHEAPEST — budget/artistic |
| **Alibaba** | Wan 2.6 T2I | $0.010 | CJK styles |
| **Google** | Imagen 4 Fast | $0.020 | Fast generation |
| **OpenAI** | GPT Image 1 Mini | $0.036 | Budget with text |
| **Google** | Gemini 2.5 Flash Image | $0.039 | Primary corporate |
| **Google** | Imagen 4 Standard | $0.040 | Quality images |
| **OpenAI** | DALL-E 3 Standard | $0.040 | Fallback |
| **OpenAI** | DALL-E 3 HD | $0.080 | HD fallback |

### Translation — Per 1K Words

| Provider | $/1M Chars | $/1K Words | Zone |
|----------|-----------|-----------|------|
| **Alibaba** | Qwen (via LLM) | **$0.006** | alibaba — CHEAPEST |
| **Azure** | Translator | $0.050 | all — HIPAA |
| **Google** | Translate NMT | $0.100 | gemini |
| **DeepL** | API Pro | $0.125 | claude — best EU quality |

### Music & Sound Effects

| Provider | Service | Cost | Edge Function | Zone |
|----------|---------|------|---------------|------|
| **ElevenLabs** | Music Generation | ~$0.24-0.30/30sec clip | `elevenlabs-music` | Western, all |
| **ElevenLabs** | Sound Effects (1-22sec) | ~$0.24-0.30/clip | `elevenlabs-sfx` | Western, all |
| **Alibaba** | Music Generation (CosyVoice) | ~$0.01-0.03/clip | `multi-provider-music` | CJK, SEA |
| ~~Google Lyria~~ | ~~Music Generation~~ | N/A | `multi-provider-music` | **PARKED** — type ref only, no implementation |
| **Suno** | Music Generation | TBD | Not integrated | **PARKED** — future provider, no API integration yet |
| **ModelsLab** | Music Generation | ~$0.05-0.08/clip | `multi-provider-music` | Fallback all |
| **Alibaba** | Sound Effects | ~$0.01-0.02/clip | `multi-provider-sfx` | CJK, SEA |
| **ModelsLab** | Sound Effects | ~$0.03-0.05/clip | `multi-provider-sfx` | Fallback all |

**Orchestration:** `music-composer-agent` selects provider based on 4-zone routing (Western/CJK/MENA/SEA), mood/genre, and cost optimization. Falls back through provider chain automatically.

### Document Extraction (OCR / Form Processing) — HEALTHCARE ONLY, NOT GENIESUITE

> **SCOPE NOTE:** Document extraction is used exclusively by the healthcare platform (insurance cards, prescriptions, enrollment forms). GenieSuite does NOT use these services. DocuSign is also healthcare-only.

| Provider | Service | Cost | Edge Function | GenieSuite? |
|----------|---------|------|---------------|-------------|
| **Azure Form Recognizer** | Document Intelligence v4.0 | $1.50/1K pages | `document-processor` | NO — healthcare only |
| **AWS Textract** | OCR + Table/Form extraction | $1.50/1K pages | `document-processor` | NO — healthcare only |
| **DeepSeek Vision** | Vision-based document understanding | ~$0.01/page | `deepseek-vision` | NO — healthcare only |
| **DocuSign** | E-signatures, consent forms | Per-envelope pricing | `docusign-integration` | NO — healthcare only |

### Avatar & 3D

| Provider | Service | Cost |
|----------|---------|------|
| **Alibaba** | Wan 2.2 S2V (Avatar) | ~$0.08-0.12/sec |
| **Meshy** | Text-to-3D | ~$0.20-0.50/model |
| **Replicate** | SadTalker/Wav2Lip | ~$0.05-0.10/sec |

---

### WORKFLOW COST CALCULATIONS (Actual)

#### Workflow A: 2-Minute Marketing Video with TTS

| Step | Operation | Provider | Cost |
|------|-----------|---------|------|
| Script generation | Claude Sonnet 4.5 | 2K+1K tokens | $0.021 |
| TTS voiceover (2 min) | Azure Neural TTS | 1,600 chars | $0.026 |
| Video generation (120 sec) | Varies by provider | 24 clips x 5s | See below |
| Subtitle generation | Deepgram Nova-2 | 2 min | $0.009 |
| Video assembly | JSON2Video | 1 render | $0.50 |

| Provider Path | Video Cost | **TOTAL** |
|--------------|-----------|-----------|
| ModelsLab (budget) | $2.40 | **$2.96** |
| Alibaba Wan 2.6 720p | $9.60 | **$10.16** |
| Sora 2 Standard 720p | $12.00 | **$12.56** |
| Veo 3.0 (premium) | $48.00 | **$48.56** |

#### Workflow B: 10-Slide Presentation

| Provider Path | **TOTAL** |
|--------------|-----------|
| Budget (FLUX + DeepSeek) | **$0.14** |
| Standard (Gemini Flash Image + Sonnet) | **$0.95** |
| Premium (DALL-E 3 HD + Opus) | **$2.17** |

#### Workflow C: 15-Minute Podcast

| Step | Cost |
|------|------|
| Script (Claude Sonnet) | $0.069 |
| TTS 15 min (Azure Neural) | $0.192 |
| Music (3 x 30s ElevenLabs) | $0.90 |
| SFX (5 clips ElevenLabs) | $1.50 |
| **TOTAL** | **$2.66** |
| **TOTAL (ElevenLabs premium TTS)** | **$4.82** |

#### Workflow D: Translate to 5 Languages + TTS

| Provider Path | **TOTAL** |
|--------------|-----------|
| Alibaba Qwen (CJK) | **$0.17** |
| Google + Azure TTS | **$1.13** |
| DeepL + ElevenLabs | **$3.63** |

#### Workflow E: 2-Minute Avatar Video

| Provider Path | **TOTAL** |
|--------------|-----------|
| ModelsLab lipsync (budget) | **$3.35-$6.55** |
| Alibaba Wan 2.2 avatar | **$10.15-$14.95** |

#### Workflow F: Full Campaign (All Formats)

| Component | Budget | Standard | Premium |
|-----------|--------|----------|---------|
| 2-min video | $2.96 | $10.16 | $12.56 |
| 10-slide deck | $0.14 | $0.95 | $2.17 |
| 15-min podcast | $2.66 | $2.66 | $4.82 |
| 5-language translation | $0.17 | $1.13 | $3.63 |
| **FULL CAMPAIGN TOTAL** | **$5.93** | **$14.90** | **$23.18** |

---

### COST OPTIMIZATION RECOMMENDATIONS

1. **Video generation is 80-95% of costs** — Use Alibaba Wan 2.6 ($4.80/min) as default, Sora 2 Standard ($6/min) for cinematic, avoid Veo 3.0 ($48-72/min) unless premium quality required
2. **Azure Neural TTS is the winner** at $0.013/min with Viseme lip-sync. Keep ElevenLabs ($0.144/min) ONLY for voice cloning — 11x more expensive
3. **Use Gemini 2.5 Flash for routing/classification** at $0.30/$2.50 per 1M tokens — 10x cheaper than Sonnet for non-creative tasks
4. **Deepgram Nova-2 ($0.0043/min)** is cheapest AND fastest STT — correctly prioritized in fallback chain
5. **Batch API discounts (50% off)** available from Anthropic, OpenAI, Google for background operations
6. **Prompt caching** — 90% off on Anthropic, 75% off on Google for repeated context patterns

---

## 9. SUBSCRIPTION TIERS — REDESIGNED

> **Updated**: Feb 23, 2026 — Redesigned based on actual AI provider costs, competitor pricing, and margin analysis
> **Key change**: Hybrid model — base subscription + video/media credits purchased separately
> **Rationale**: Video generation ($1.20-72.00/min internal cost) cannot be included in flat-rate subscriptions

### Design Principles

1. **Base subscription covers cheap operations** (script gen, TTS, translation, presentations) — these cost $0.001-$1 per operation
2. **Video/media credits are separate** (or limited per tier) — these cost $1.20-$72/min per operation
3. **Competitor-aligned pricing** — Synthesia $18-89/mo, HeyGen $24-149/mo, Gamma $8-100/mo, Runway $12-95/mo
4. **Regional PPP pricing** — India/Africa/LATAM get adjusted rates through existing `genie_regional_pricing` table
5. **Credits for expensive operations** — users buy what they need, no underwater tiers

### NEW 6-Tier Model

#### Tier 1: FREE — "Try Everything"
| Feature | Limit |
|---------|-------|
| **Price** | $0/mo |
| **Script Generation** | 5/mo (Claude Haiku / Gemini Flash) |
| **Presentations** | 3/mo (budget providers) |
| **TTS Voice** | 5 min/mo (Azure Neural) |
| **Translation** | 1,000 words/mo (Qwen via LLM) |
| **Video Credits** | 1 min/mo (ModelsLab budget, 720p, watermarked) |
| **Avatar** | 0 (preview only) |
| **Podcast** | 0 |
| **Distribution** | Download + email only |
| **Video Quality** | 720p, watermarked |
| **Languages** | 3 (en, es, fr) |
| **Styles** | 5 of 99 |
| **Regions** | 1 (home region) |
| **Batch Concurrency** | 1 |
| **Internal cost/user** | ~$0.50/mo |
| **Margin** | Acquisition cost (acceptable) |

#### Tier 2: STARTER — "Solo Creator" — $19/mo ($15/mo annual)
| Feature | Limit |
|---------|-------|
| **Price** | $19/mo ($15/mo annual = $180/yr) |
| **Script Generation** | 30/mo (Claude Haiku / Gemini Flash) |
| **Presentations** | 15/mo (standard providers) |
| **TTS Voice** | 30 min/mo (Azure Neural) |
| **Translation** | 10,000 words/mo (Azure/Google) |
| **Video Credits** | 5 min/mo included (Alibaba Wan 720p) + buy more at $1.50/min |
| **Avatar** | 2 min/mo (Replicate budget) |
| **Podcast Audio** | 30 min/mo (TTS + basic mixing) |
| **Distribution** | Download, email, 3 social platforms |
| **Video Quality** | 1080p, no watermark |
| **Languages** | 10 |
| **Styles** | 25 of 99 |
| **Regions** | 3 |
| **Batch Concurrency** | 3 |
| **Internal cost/user** | ~$8/mo |
| **Margin** | ~58% ($11/mo gross profit) |

*Compared to: Synthesia Starter $18-29/mo (120 min/yr = 10 min/mo), HeyGen Creator $24-29/mo, Gamma Plus $8/mo*

#### Tier 3: CREATOR — "Content Machine" — $49/mo ($39/mo annual)
| Feature | Limit |
|---------|-------|
| **Price** | $49/mo ($39/mo annual = $468/yr) |
| **Script Generation** | Unlimited (Claude Sonnet / Gemini Pro) |
| **Presentations** | 50/mo (standard + premium) |
| **TTS Voice** | 120 min/mo (Azure Neural + Google WaveNet) |
| **Translation** | 50,000 words/mo (Azure + DeepL) |
| **Video Credits** | 15 min/mo included (Sora Standard 720p / Alibaba Wan 1080p) + buy more at $1.25/min |
| **Avatar** | 10 min/mo (Alibaba Wan 2.2) |
| **Podcast Audio** | 120 min/mo (full production: TTS + music beds + SFX) |
| **Distribution** | All social platforms (14 channels) |
| **Video Quality** | 1080p |
| **Languages** | 25 |
| **Styles** | 50 of 99 |
| **Regions** | 8 |
| **Batch Concurrency** | 5 |
| **Transcreation** | 3 regions/video (basic cultural adaptation) |
| **Brand Kit** | 1 brand profile |
| **Voice Cloning** | 1 voice clone (ElevenLabs) |
| **Internal cost/user** | ~$25/mo |
| **Margin** | ~49% ($24/mo gross profit) |

*Compared to: Synthesia Creator $64-89/mo, HeyGen Business $149/mo, Runway Pro $35/mo*

#### Tier 4: PRO — "Production Studio" — $99/mo ($79/mo annual)
| Feature | Limit |
|---------|-------|
| **Price** | $99/mo ($79/mo annual = $948/yr) |
| **Script Generation** | Unlimited (Claude Sonnet + Opus for complex) |
| **Presentations** | Unlimited |
| **TTS Voice** | 500 min/mo (all providers including ElevenLabs) |
| **Translation** | 200,000 words/mo (all providers including DeepL Premium) |
| **Video Credits** | 30 min/mo included (Sora Standard + Veo Fast) + buy more at $1.00/min |
| **Avatar** | 30 min/mo (all providers: HeyGen, Alibaba, ModelsLab) |
| **Podcast Full** | 300 min/mo (full production + video podcast conversion) |
| **Distribution** | All platforms + scheduling + auto-SEO |
| **Video Quality** | Up to 4K |
| **Languages** | 50+ |
| **Styles** | All 99 |
| **Regions** | All 16 parent regions |
| **Batch Concurrency** | 10 |
| **Transcreation** | 10 regions/video (full cultural adaptation) |
| **Brand Kit** | 5 brand profiles |
| **Voice Cloning** | 3 voice clones |
| **Timeline Editor** | Full access |
| **Analytics** | Basic dashboard |
| **Internal cost/user** | ~$55/mo |
| **Margin** | ~44% ($44/mo gross profit) |

*Compared to: Synthesia Enterprise, HeyGen Enterprise, Runway Unlimited $95/mo*

#### Tier 5: BUSINESS — "Scale Operations" — $299/mo ($249/mo annual)
| Feature | Limit |
|---------|-------|
| **Price** | $299/mo ($249/mo annual = $2,988/yr) |
| **Script Generation** | Unlimited (all models, priority routing) |
| **Presentations** | Unlimited |
| **TTS Voice** | 2,000 min/mo (all providers) |
| **Translation** | Unlimited (all providers) |
| **Video Credits** | 60 min/mo included (all providers) + buy more at $0.75/min |
| **Avatar** | 60 min/mo (all providers + custom avatar training) |
| **Podcast Full** | Unlimited audio production |
| **Webcast/Webinar** | Full access (RTMP + HLS) |
| **Distribution** | All + API access + webhooks + WhatsApp Business |
| **Video Quality** | 4K + premium providers (Veo 3.0) |
| **Languages** | 75+ (all supported) |
| **Styles** | All 99 + custom style creation |
| **Regions** | All 72 zones (16 parent + 56 sub) |
| **Batch Concurrency** | 20 |
| **Transcreation** | All 72 zones simultaneously |
| **Brand Kit** | Unlimited brand profiles |
| **Voice Cloning** | 10 voice clones |
| **Timeline Editor** | Full access + batch editing |
| **Analytics** | Full dashboard + export |
| **Team Seats** | 5 included (+$25/seat) |
| **Bulk Operations** | Yes (batch generate/translate/publish) |
| **Priority Support** | Email + chat |
| **Internal cost/user** | ~$150/mo |
| **Margin** | ~50% ($149/mo gross profit) |

*Compared to: HeyGen Enterprise, Jasper Business $5K+/yr, Writer Enterprise*

#### Tier 6: ENTERPRISE — "Pharma-Grade" — Custom ($500-5,000+/mo)
| Feature | Limit |
|---------|-------|
| **Price** | Custom ($500-5,000+/mo based on usage) |
| **Everything in Business** | Unlimited |
| **MLR Compliance Workflow** | AI pre-screening + human review gates (Phase 7) |
| **CRM Integration** | Veeva PromoMats, Salesforce Health Cloud, HubSpot |
| **HIPAA Compliance** | BAA, encrypted storage, audit logs |
| **SSO/SAML** | Yes |
| **Custom Avatar Training** | Dedicated avatar models |
| **White-Label** | Custom branding, domain |
| **SLA** | 99.9% uptime guarantee |
| **Dedicated Support** | Named account manager |
| **On-Premise Option** | For regulated data |
| **Team Seats** | Unlimited |
| **Video Credits** | Custom volume (negotiated rate) |
| **API** | Full API access with SLA |
| **Internal cost/user** | $200-1,500/mo (usage-dependent) |
| **Target margin** | 60%+ |

*Compared to: Veeva $50K-500K+/yr, IQVIA custom, Aktana custom*

### Video Credit Packs (À La Carte)

Users who need more video than their tier includes can purchase credit packs:

| Pack | Credits | Price | Effective Rate | Best For |
|------|---------|-------|----------------|----------|
| **Starter Pack** | 10 min | $15 | $1.50/min | Occasional video needs |
| **Creator Pack** | 30 min | $37.50 | $1.25/min | Regular creators |
| **Pro Pack** | 60 min | $60 | $1.00/min | Production studios |
| **Business Pack** | 200 min | $150 | $0.75/min | High-volume teams |
| **Enterprise Pack** | 1,000 min | $500 | $0.50/min | Enterprise custom |

**Provider routing by credit type:**
- Standard credits → Alibaba Wan 2.6 720p ($4.80/min internal) or ModelsLab ($1.20/min)
- HD credits → Sora 2 Standard ($6/min) or Alibaba Wan 1080p ($7.20/min)
- Premium credits → Veo 3.0 ($48-72/min) — only available on Pro+ tiers
- Avatar credits → Alibaba Wan 2.2 ($4.80-7.20/min) or Replicate ($3-6/min)

### Regional Pricing (PPP-Adjusted)

| Region | Multiplier | Starter | Creator | Pro | Business |
|--------|-----------|---------|---------|-----|----------|
| **US/Canada/Western EU** | 1.0x | $19 | $49 | $99 | $299 |
| **UK/Australia/Japan** | 0.9x | $17 | $44 | $89 | $269 |
| **Eastern EU/Korea** | 0.7x | $13 | $34 | $69 | $209 |
| **Latin America/Turkey** | 0.5x | $10 | $25 | $50 | $150 |
| **India** | 0.35x | ₹549 (~$7) | ₹1,399 (~$17) | ₹2,799 (~$35) | ₹8,499 (~$105) |
| **Southeast Asia** | 0.4x | $8 | $20 | $40 | $120 |
| **MENA (Gulf)** | 0.85x | $16 | $42 | $84 | $254 |
| **MENA (Non-Gulf)** | 0.5x | $10 | $25 | $50 | $150 |
| **Africa** | 0.3x | $6 | $15 | $30 | $90 |
| **Central Asia** | 0.35x | $7 | $17 | $35 | $105 |

*PPP multipliers already implemented via `genie_regional_pricing` Supabase table*

### Payment Methods by Region

| Region | Methods |
|--------|---------|
| **Global** | Visa, Mastercard, Amex (Stripe) |
| **US/EU** | + Apple Pay, Google Pay |
| **India** | + UPI, Paytm, PhonePe, Razorpay |
| **CJK** | + WeChat Pay, Alipay, LINE Pay, KakaoPay |
| **EU** | + SEPA, iDEAL, Bancontact, Klarna |
| **SEA** | + GrabPay, GoPay, OVO, DANA |
| **MENA** | + Mada, STC Pay, Apple Pay |
| **Africa** | + M-Pesa, Flutterwave, Paystack |
| **LATAM** | + PIX (Brazil), OXXO (Mexico), MercadoPago |

### Margin Analysis (New Pricing)

| Tier | Revenue | Internal Cost | Gross Margin | Margin % |
|------|---------|--------------|--------------|----------|
| **Free** | $0 | $0.50 | -$0.50 | Acquisition cost |
| **Starter ($19)** | $19 | $8 | $11 | **58%** |
| **Creator ($49)** | $49 | $25 | $24 | **49%** |
| **Pro ($99)** | $99 | $55 | $44 | **44%** |
| **Business ($299)** | $299 | $150 | $149 | **50%** |
| **Enterprise ($1,500 avg)** | $1,500 | $600 | $900 | **60%** |
| **Video credit packs** | Varies | ~40% COGS | | **~60%** |

**vs. Old Pricing (ALL UNDERWATER):**
| Old Tier | Old Revenue | Old Margin |
|----------|-------------|------------|
| Starter ($12) | $12 | 33% |
| Creator ($29) | $29 | **-21% LOSS** |
| Pro ($30) | $30 | **-183% LOSS** |
| Business ($149) | $149 | **-34% LOSS** |

### Revised Breakeven Analysis

| Scenario | Users (paid) | Monthly Revenue | Monthly AI Cost | Margin |
|----------|-------------|----------------|----------------|--------|
| Early (100 users) | 60S/25C/10P/5B | $5,580 | $2,325 | **$3,255** |
| Growth (500 users) | 60S/25C/10P/5B | $27,900 | $11,625 | **$16,275** |
| Scale (1,000 users) | 60S/25C/10P/5B | $55,800 | $23,250 | **$32,550** |
| Target (2,500 users) | 55S/25C/12P/6B/2E | $156,750 | $64,500 | **$92,250** |

**Full operation breakeven (including team, infra, marketing):**

| Expense | Monthly |
|---------|---------|
| Infrastructure | $5,000-10,000 |
| AI Provider costs (1K users) | $23,250 |
| Engineering team (5) | $50,000-75,000 |
| Marketing + Sales | $20,000-30,000 |
| Support + Operations | $10,000-15,000 |
| **Total Monthly Burn** | **$108,250-153,250** |

| Metric | New Pricing | Old Pricing |
|--------|------------|-------------|
| Avg ARPU | $55.80 | $34.20 |
| Users for breakeven | **1,940-2,750** | 3,000-4,300 |
| Total signups (5% conversion) | 38,800-55,000 | 60,000-86,000 |
| Total signups (10% conversion) | 19,400-27,500 | 30,000-43,000 |

### Existing Infrastructure to Update

- **Stripe Products**: Update product/price IDs for new tiers ($19/$49/$99/$299)
- **`tierFeatureGating.ts`**: Update feature limits per tier
- **Credit System**: Add video credit packs as Stripe products
- **Regional Pricing**: Already implemented in `genie_regional_pricing` — update multipliers
- **Distribution Gating**: Keep existing channel-unlock-by-tier logic
- **Quality Tiers**: Map to video provider routing (budget→standard→premium→ultra)

---

## 10. ROI MODEL & BREAKEVEN ANALYSIS

> **Updated**: Feb 23, 2026 — Reflects new pricing model ($19/$49/$99/$299/custom)

### Customer ROI (What They Save vs. Alternatives)

| Content Type | Alternative Cost | GenieSuite User Pays | Savings | ROI |
|-------------|-----------------|---------------------|---------|-----|
| 2-min marketing video | Synthesia: $18-89/mo for 10-30 min/yr | Pro: ~$3.30 of credits (30 min included) | Video + script + TTS + subtitles in one | 5-20x more content per dollar |
| 31-language video dub | Translation agency: $150K+ | Creator: $49/mo + ~$15 translation credits | Same result, 99.9% cheaper | 10,000x |
| 10-slide presentation | Designer: $500-2,000 | Starter: already included ($19/mo) | Unlimited at Creator+ | 25-100x |
| 15-min podcast | Studio: $3,000-10,000 | Creator: included in 120 min TTS | Full production pipeline | 60-200x |
| Full campaign (video+deck+podcast+5 langs) | Agency: $20K-100K | Pro: $99/mo + ~$10 credit top-up | All formats, all languages, one platform | 180-900x |

**Key selling point**: A Pro user ($99/mo) gets more content production capability than a $50K/yr agency retainer.

### Competitive Price Comparison

| Feature | GenieSuite Creator $49 | Synthesia Creator $89 | HeyGen Business $149 | Runway Unlimited $95 |
|---------|----------------------|----------------------|---------------------|---------------------|
| AI video minutes/mo | 15 min included | 30 min/mo | ~100 min/mo (credits) | Unlimited (credits) |
| Script generation | Unlimited | None | None | None |
| TTS/Voiceover | 120 min/mo | Via Synthesia only | Via HeyGen only | None |
| Presentations | 50/mo | None | None | None |
| Translation | 50K words/mo | None | None | None |
| Podcast production | Full (120 min) | None | None | None |
| Avatar video | 10 min/mo | Core feature | Core feature | None |
| Transcreation | 3 regions/video | None | None | None |
| Languages | 25 | ~30 (dubbing) | ~40 (dubbing) | None |
| Video styles | 50 of 99 | ~1 (avatar) | ~1 (avatar) | General purpose |
| **Value proposition** | **All-in-one** | **Avatar only** | **Avatar only** | **Video gen only** |

### Revenue Projections (New Pricing)

#### Year 1 Targets

| Quarter | Users (paid) | Mix | MRR | ARR Run Rate |
|---------|-------------|-----|-----|-------------|
| Q1 | 200 | 70S/20C/8P/2B | $6,420 | $77K |
| Q2 | 500 | 60S/25C/10P/4B/1E | $16,775 | $201K |
| Q3 | 1,200 | 55S/25C/12P/6B/2E | $44,940 | $539K |
| Q4 | 2,500 | 50S/25C/15P/7B/3E | $106,175 | **$1.27M** |

#### Year 2 Targets

| Quarter | Users (paid) | MRR | ARR Run Rate |
|---------|-------------|-----|-------------|
| Q1 Y2 | 4,000 | $175,000 | $2.1M |
| Q2 Y2 | 6,500 | $295,000 | $3.5M |
| Q3 Y2 | 10,000 | $470,000 | $5.6M |
| Q4 Y2 | 15,000 | $750,000 | **$9M** |

*Comparable: Gamma went from $0 to $100M ARR in ~3 years with 70M free users and aggressive viral loop*

### Unit Economics Summary

| Metric | Value |
|--------|-------|
| Blended ARPU (new pricing) | $55.80/mo |
| Blended COGS per user | $23.25/mo |
| Gross margin | **58%** |
| CAC target | $50-150 (PLG + content marketing) |
| LTV (24-mo avg) | $1,339 |
| LTV/CAC ratio | **8.9-26.8x** (excellent) |
| Payback period | ~1-3 months |
| Video credit pack margin | ~60% |
| Net revenue retention target | 120%+ (upsell to higher tiers + credit packs) |

### Path to Profitability

| Milestone | Users | MRR | Monthly Burn | Status |
|-----------|-------|-----|-------------|--------|
| **AI costs covered** | 400 | $22,320 | $23,250 AI cost | Break-even on AI |
| **Infra + AI covered** | 600 | $33,480 | $33,250 (AI+infra) | Break-even on variable costs |
| **Full operation** | 2,000 | $111,600 | $108,250 (total burn) | **Profitable** |
| **Comfortable margin** | 5,000 | $279,000 | $170,000 | $109K/mo profit |
| **Scale** | 15,000 | $837,000 | $350,000 | $487K/mo profit |

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

### Immediate (Before Phase 7) — ~45 hours
1. Fix 4 critical gaps + 5 high gaps (~25 hours)
2. Verify all AI provider integrations are calling real APIs
3. Complete analytics dashboards with real data
4. Refactor ScriptEditorTab (127KB monolith)

### Phase 7 (Pharma Marketing Automation) — 12-16 weeks
1. MLR compliance service (REGULATORY BLOCKER for enterprise pharma)
2. CRM connectors (Veeva PromoMats, Salesforce Health Cloud, HubSpot)
3. HCP engagement & segmentation
4. Omnichannel workflow builder

### Phase 8 (Enterprise Scale) — 8-12 weeks
1. Advanced analytics (funnel, cohort, attribution, LTV)
2. A/B testing framework
3. Lead management & scoring
4. AI personalization engine

### Phase 9 (Business Model) — COMPLETED IN THIS DOCUMENT
1. ~~Redesign pricing tiers based on actual costs~~ DONE (Section 9)
2. ~~Regional pricing with PPP calibration~~ DONE (Section 9)
3. ~~Enterprise pharma-specific tier~~ DONE (Section 9)
4. ~~Competitor intelligence~~ DONE (Section 7)
5. ~~ROI model and breakeven~~ DONE (Section 10)
6. **TODO**: Build customer-facing ROI calculator
7. **TODO**: Update Stripe products with new pricing ($19/$49/$99/$299)
8. **TODO**: Update `tierFeatureGating.ts` with new limits
9. **TODO**: Add video credit pack products to Stripe

### Phase 10 (Growth & GTM)
1. PLG viral loops (Gamma-style: free→paid conversion optimization)
2. Content marketing (showcase transcreation to pharma decision-makers)
3. Integration partnerships (Veeva ecosystem partner program)
4. Regional launches (India first — highest PPP value, largest pharma generics market)
5. Enterprise sales team (target top-50 pharma for $500K+ ARR contracts)

---

## APPENDIX: SOURCES

All competitor data sourced from:
- Company pricing pages (accessed Feb 23, 2026)
- TechCrunch, CNBC, PitchBook, SiliconAngle (funding/valuation data)
- Getlatka, Sacra (revenue estimates)
- SEC filings (Veeva, RWS/SDL)
- Industry reports (Forrester TEI, IDC, Grand View Research)

---

*Last updated: Feb 23, 2026 — All sections complete*
