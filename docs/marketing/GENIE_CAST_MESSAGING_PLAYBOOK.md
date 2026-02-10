# 🎯 Genie Cast Marketing & Messaging Playbook

> **Version:** 1.0  
> **Last Updated:** 2026-02-07  
> **Status:** STRATEGIC BLUEPRINT — Pre-Implementation  
> **Scope:** Full Hybrid Framework for Genie Studio Ecosystem Marketing via Genie Cast

---

## 📋 TABLE OF CONTENTS

1. [Strategic Context](#strategic-context)
2. [The Dual Objective](#dual-objective)
3. [Framework Architecture](#framework-architecture)
4. [Framework 1: STP — Audience Segmentation Strategy](#stp)
5. [Framework 2: 4Es — Experience-Driven Marketing](#4es)
6. [Framework 3: StoryBrand — Customer-as-Hero Narrative](#storybrand)
7. [Framework 4: AIDA — Video Scene Structure](#aida)
8. [Framework 5: JTBD — Jobs To Be Done](#jtbd)
9. [Framework 6: Blue Ocean — Differentiation Strategy](#blue-ocean)
10. [Framework 7: RACE — Digital Distribution Funnel](#race)
11. [Audience-Framework Matrix](#audience-framework-matrix)
12. [Template-Framework Mapping](#template-framework-mapping)
13. [Content Layer Architecture](#content-layer-architecture)
14. [Cast Self-Reference Protocol](#cast-self-reference)
15. [Ecosystem Messaging by Audience](#ecosystem-by-audience)
16. [Product-Specific Messaging Depth](#product-depth)
17. [Full Matrix Examples](#full-examples)
18. [Implementation Roadmap](#implementation-roadmap)

---

## 1. STRATEGIC CONTEXT {#strategic-context}

### What We're Solving

Genie Cast serves a **unique dual purpose** that no competitor replicates:

1. **Marketing Engine** — Cast produces all marketing videos for the Genie Studio ecosystem (8 products)
2. **Product Demo** — Every video Cast produces IS the proof that Cast works
3. **SaaS Subscription Tool** — Cast will be offered to external subscribers to market THEIR products

This creates a **circular value loop**: Cast markets Studio → Studio includes Cast → Cast demos itself → Users subscribe to Cast for their own products.

### Current Assets Available

| Asset | Source | Status |
|-------|--------|--------|
| 8 Product Positioning | `GENIE_PRODUCT_POSITIONING` in `dogfoodingMarketingEngine.ts` | ✅ Active |
| 20 Feature Showcase Topics | `FEATURE_SHOWCASE_TOPICS` in `dogfoodingMarketingEngine.ts` | ✅ Active |
| 20 Target Audiences | `TARGET_AUDIENCES` in `aiMessagingGeneratorService.ts` | ✅ Active |
| 4 Messaging Frameworks | `MESSAGING_FRAMEWORKS` in `aiMessagingGeneratorService.ts` | ✅ Active |
| 434+ Video Blueprints | `video_blueprints` database table | ✅ Seeded |
| Dynamic Registry | `marketing_products`, `marketing_audiences`, `marketing_languages` tables | ✅ Active |
| Brand Assets Pipeline | `marketing_brand_assets`, `product_asset_inventory` | ✅ Active |
| Competitor Database | `COMPETITOR_DATABASE` in `aiMessagingGeneratorService.ts` | ✅ Active |
| Regional Hooks | `REGIONAL_HOOKS` in `dogfoodingMarketingEngine.ts` | ✅ Active |

### What's Missing (This Playbook Addresses)

| Gap | Framework Solution |
|-----|-------------------|
| No unified ecosystem narrative | StoryBrand + Blue Ocean |
| Messaging not audience-tailored at ecosystem level | STP + 4Es |
| No audience-to-framework mapping | Audience-Framework Matrix |
| Templates don't know which framework to apply | Template-Framework Tags |
| No Cast self-reference protocol | Cast Meta-Layer |
| No "Powered By" transparency chain | JTBD + 4Es Evangelism |
| No digital distribution strategy per audience | RACE |

---

## 2. THE DUAL OBJECTIVE {#dual-objective}

### Objective Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     WHAT WE'RE MARKETING                                     │
│                                                                              │
│  ┌─────────────────────────────┐  ┌──────────────────────────────────────┐  │
│  │   OBJECTIVE 1               │  │   OBJECTIVE 2                        │  │
│  │   Market Genie Studio       │  │   Position Genie Cast                │  │
│  │                             │  │                                      │  │
│  │   Cast = THE TOOL           │  │   Cast = THE SUBJECT                 │  │
│  │   Studio = THE SUBJECT      │  │   Studio = THE CONTEXT               │  │
│  │                             │  │                                      │  │
│  │   Message: "Look what       │  │   Message: "This video you're        │  │
│  │   Studio can do for you"    │  │   watching? Made in 4 minutes        │  │
│  │                             │  │   by Cast. You can do this too."     │  │
│  │   Goal: Subscribe to Studio │  │   Goal: Subscribe to Cast            │  │
│  └─────────────────────────────┘  └──────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │   OBJECTIVE 3 (Future)                                               │   │
│  │   Enable External Subscribers                                        │   │
│  │                                                                      │   │
│  │   Cast = THE PLATFORM                                                │   │
│  │   Their product = THE SUBJECT                                        │   │
│  │                                                                      │   │
│  │   Message: "We used Cast to market our own 8 products.               │   │
│  │   Now use it to market yours."                                       │   │
│  │   Goal: SaaS subscription to Cast                                    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Scene Allocation per Objective

| Video Length | Obj 1 (Market Studio) | Obj 2 (Position Cast) | Ratio |
|-------------|----------------------|----------------------|-------|
| 15s Social Ad | 12s | 3s (end card) | 80/20 |
| 30s Promo | 22s | 8s (reveal + CTA) | 73/27 |
| 60s Explainer | 42s | 18s (reveal + demo + CTA) | 70/30 |
| 90s Deep Dive | 55s | 35s (Cast workflow shown) | 61/39 |
| 3m Product Demo | 2m | 1m (Cast making-of) | 67/33 |
| 7m Full Ecosystem | 4.5m | 2.5m (Cast deep dive) | 64/36 |

---

## 3. FRAMEWORK ARCHITECTURE {#framework-architecture}

### Full Hybrid Framework Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                    STRATEGY LAYER                                 │
│            (WHO we target & HOW we differentiate)                 │
│                                                                   │
│    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│    │     STP      │  │ Blue Ocean   │  │    JTBD      │         │
│    │ Segment      │  │ Differentiate│  │ Jobs To Be   │         │
│    │ Target       │  │ from all     │  │ Done         │         │
│    │ Position     │  │ competitors  │  │              │         │
│    └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│           │                 │                  │                  │
├───────────┼─────────────────┼──────────────────┼─────────────────┤
│                    MESSAGING LAYER                                │
│           (WHAT we say & HOW we tell the story)                  │
│                                                                   │
│    ┌──────────────┐  ┌──────────────┐                            │
│    │  StoryBrand  │  │     4Es      │                            │
│    │ Customer =   │  │ Experience   │                            │
│    │ Hero         │  │ Exchange     │                            │
│    │ Cast = Guide │  │ Everyplace   │                            │
│    │              │  │ Evangelism   │                            │
│    └──────┬───────┘  └──────┬───────┘                            │
│           │                 │                                     │
├───────────┼─────────────────┼────────────────────────────────────┤
│                    EXECUTION LAYER                                │
│           (HOW we structure each video & distribute)             │
│                                                                   │
│    ┌──────────────┐  ┌──────────────┐                            │
│    │    AIDA      │  │    RACE      │                            │
│    │ Scene-by-    │  │ Distribution │                            │
│    │ scene video  │  │ funnel for   │                            │
│    │ structure    │  │ each channel │                            │
│    └──────────────┘  └──────────────┘                            │
└──────────────────────────────────────────────────────────────────┘
```

### How They Connect

| Layer | Framework | Answers | Applied Where |
|-------|-----------|---------|---------------|
| **Strategy** | STP | WHO do we talk to? | Audience selection in Matrix |
| **Strategy** | Blue Ocean | WHY are we different? | Ecosystem-level messaging |
| **Strategy** | JTBD | WHAT job does the customer need done? | Pain point → product mapping |
| **Messaging** | StoryBrand | HOW do we tell the story? | Script narrative structure |
| **Messaging** | 4Es | WHAT experience do we create? | Cast self-demo + distribution |
| **Execution** | AIDA | HOW is each video structured? | Scene-by-scene blueprint tagging |
| **Execution** | RACE | WHERE & WHEN do we distribute? | Platform-specific publishing strategy |

---

## 4. FRAMEWORK 1: STP — Segment, Target, Position {#stp}

### Segmentation (20 Audiences → 6 Verticals)

```
VERTICAL 1: CREATORS (3 segments)
├── Content Creators    → Job: "Help me make more content faster"
├── Influencers         → Job: "Keep me relevant across platforms"
└── Knowledge Sharers   → Job: "Turn my expertise into income"

VERTICAL 2: BUSINESS & MARKETING (5 segments)
├── Marketing Teams     → Job: "Hit content velocity targets"
├── Sales Teams         → Job: "Close deals with better demos"
├── Agencies            → Job: "Scale client work without hiring"
├── Entrepreneurs       → Job: "Look professional on a budget"
└── SMBs                → Job: "Compete with big-brand content"

VERTICAL 3: ENTERPRISE (5 segments)
├── Enterprise Teams    → Job: "Maintain compliance at scale"
├── Product Managers    → Job: "Communicate roadmaps visually"
├── Customer Success    → Job: "Onboard users without live calls"
├── Executive Leadership → Job: "Present to the board impressively"
└── Dev & Tech Teams    → Job: "Document APIs without manual work"

VERTICAL 4: HR & PEOPLE (2 segments)
├── HR & Recruiters     → Job: "Attract talent with culture videos"
└── L&D Professionals   → Job: "Train 10,000 people simultaneously"

VERTICAL 5: EDUCATION (1 segment)
└── Educators           → Job: "Engage remote learners effectively"

VERTICAL 6: SPECIALIZED INDUSTRIES (3 segments)
├── Healthcare          → Job: "Educate patients, stay HIPAA-compliant"
├── Compliance & Legal  → Job: "Make policy training watchable"
└── Travel & Hospitality → Job: "Market destinations in every language"
```

### Positioning Statement Template

For each audience, the positioning follows this pattern:

> **For** [target audience] **who** [job to be done],  
> **Genie Studio is** [category descriptor]  
> **that** [key benefit unlike competitors].  
> **Unlike** [competitor/alternative],  
> **Genie Studio** [primary differentiator].  
> *And this video was made by Genie Cast in [X] minutes.*

### Example Positioning Statements

**Healthcare:**
> For healthcare teams who need compliant patient education content,  
> Genie Studio is the first HIPAA-aware AI content ecosystem  
> that turns clinical documents into localized patient videos in 70+ languages.  
> Unlike hiring medical video producers,  
> Genie Studio delivers in minutes, not months.  
> *This video was created by Genie Cast using Genie Spark for the script and Genie Vibe for the voiceover.*

**Agencies:**
> For agencies who need to scale client content without scaling headcount,  
> Genie Studio is the white-label AI production platform  
> that lets one person deliver what used to take a team of five.  
> Unlike stitching together Canva, Synthesia, and Descript,  
> Genie Studio is one unified ecosystem—CREATE, PRODUCE, MANAGE, PUBLISH.  
> *This entire pitch was scripted, voiced, and assembled by Genie Cast in under 10 minutes.*

**Educators:**
> For educators who struggle to keep remote learners engaged,  
> Genie Studio is the multi-modal content creation ecosystem  
> that transforms lesson plans into interactive videos, presentations, and quizzes.  
> Unlike spending weekends editing in iMovie,  
> Genie Studio's AI handles production so you can focus on teaching.  
> *Made with Genie Cast — because teachers shouldn't have to be video editors too.*

---

## 5. FRAMEWORK 2: 4Es — Experience, Exchange, Everyplace, Evangelism {#4es}

### Traditional 4Ps → 4Es Mapping

| 4P (Old) | 4E (New) | Genie Cast Application |
|----------|----------|----------------------|
| **Product** → | **Experience** | Don't describe Cast. Show it working. The video IS the experience. |
| **Price** → | **Exchange** | Not "costs $X/month." Instead: "Exchange 4 minutes for a full marketing video." |
| **Place** → | **Everyplace** | Auto-publish to YouTube, LinkedIn, TikTok, Instagram, Twitter, Blog simultaneously. |
| **Promotion** → | **Evangelism** | Every video carries "Powered by Genie Cast" — users become promoters organically. |

### 4Es Implementation per Content Type

#### Experience (What the viewer FEELS)

| Audience | Experience Goal | How to Achieve |
|----------|----------------|----------------|
| Healthcare | "This feels compliant AND modern" | Clean UI screenshots, HIPAA badges, official tone |
| Creators | "This feels like it was made by a pro" | Cinematic transitions, studio-quality voiceover |
| Enterprise | "This feels enterprise-ready" | Dashboard screenshots, analytics views, team collaboration |
| Educators | "This feels easy enough for me" | Step-by-step demos, friendly narrator, simple workflow |
| Agencies | "This feels like a competitive advantage" | Speed demos, client-ready output, white-label showcase |

#### Exchange (What the viewer TRADES)

| Exchange Proposition | Audience Type |
|---------------------|---------------|
| "Trade 60 seconds of typing for a 30-second video" | Creators, SMBs |
| "Trade 1 document upload for 70 localized training videos" | Enterprise, Healthcare |
| "Trade 1 subscription for an entire production team" | Agencies, Entrepreneurs |
| "Trade $49/month for what costs $5,000/project outsourced" | All business audiences |

#### Everyplace (Where content appears)

| Platform | Format | Audience Priority |
|----------|--------|------------------|
| YouTube | 16:9, 1-7 min | All |
| LinkedIn | 1:1 or 16:9, 30-90s | Enterprise, B2B, HR |
| TikTok | 9:16, 15-60s | Creators, Influencers |
| Instagram Reels | 9:16, 15-60s | Creators, Travel |
| Twitter/X | 16:9, 15-30s | Tech, Product Managers |
| Blog embed | 16:9, any length | Healthcare, Education, Compliance |
| Email campaign | GIF preview + link | Sales, Marketing |

#### Evangelism (How viewers spread the word)

| Mechanism | Implementation |
|-----------|---------------|
| **"Powered by" end card** | Every video ends with "Made with Genie Cast" + generation time |
| **"Powered by" watermark** | Subtle bottom-corner badge during video (removable on premium) |
| **Share-ready format** | One-click share with auto-generated social copy |
| **"Make your own" CTA** | Direct link to Cast with pre-loaded template |
| **Dogfooding proof** | "We use Cast to market Cast" — the ultimate testimonial |

---

## 6. FRAMEWORK 3: StoryBrand — Customer-as-Hero {#storybrand}

### The 7-Part StoryBrand Framework Applied to Genie

```
┌──────────────────────────────────────────────────────────────┐
│                    STORYBRAND STRUCTURE                        │
│                                                               │
│  1. CHARACTER (Hero)     = The customer with a content problem │
│  2. PROBLEM              = Their specific pain point           │
│     - External: "I can't produce videos fast enough"          │
│     - Internal: "I feel overwhelmed and behind"               │
│     - Philosophical: "Content shouldn't require a studio"     │
│  3. GUIDE (Authority)    = Genie Studio ecosystem              │
│     - Empathy: "We built this because we had the same problem"│
│     - Authority: "30+ AI models, 8 products, 206 pipelines"   │
│  4. PLAN                 = 3-step onboarding                   │
│     - Step 1: Choose your product (Spark/Vibe/Deck/etc.)      │
│     - Step 2: Input your content (text, doc, PPT, URL, idea)  │
│     - Step 3: Publish everywhere                               │
│  5. CALL TO ACTION       = "Start creating with Genie Studio"  │
│  6. FAILURE (Stakes)     = Falling behind competitors           │
│  7. SUCCESS              = "10x content, same team size"        │
│                                                               │
│  META-LAYER: "This video was the Guide demonstrating the Plan" │
│  Cast IS the Guide showing how the Plan works.                 │
└──────────────────────────────────────────────────────────────┘
```

### StoryBrand by Audience (Problem Variations)

| Audience | External Problem | Internal Problem | Philosophical Problem |
|----------|-----------------|-----------------|----------------------|
| **Healthcare** | "Patient education takes weeks to produce" | "I feel guilty giving patients outdated materials" | "Healthcare communication shouldn't be this hard" |
| **Creators** | "I can't keep up with daily content demands" | "I feel like I'm losing relevance" | "Creativity shouldn't be crushed by production logistics" |
| **Agencies** | "Client demands outpace our team capacity" | "I fear losing accounts to bigger agencies" | "Small teams should have enterprise-level tools" |
| **Enterprise** | "Our content isn't compliant across regions" | "I worry about regulatory exposure" | "Compliance and creativity shouldn't be mutually exclusive" |
| **Educators** | "Students disengage from static materials" | "I feel like I'm failing my remote students" | "Learning should be as engaging as entertainment" |
| **Sales** | "Generic demos don't close deals" | "I know I'm losing deals to better-prepared competitors" | "Every prospect deserves a personalized pitch" |
| **HR** | "We can't compete for talent with boring job posts" | "Our employer brand doesn't reflect our culture" | "Every company has a great story — most just can't tell it" |
| **L&D** | "Training 10,000 people requires 10,000 hours" | "I can't scale without sacrificing quality" | "Training should scale like software, not like labor" |

### StoryBrand Guide Messaging: Empathy + Authority

**Empathy (We understand you):**
> "We built Genie Studio because we faced the same problem — marketing 8 products across 70+ languages to 20 different audiences. We needed a tool that didn't exist. So we built it. And we use it every day. Every video you see from us was made by Genie Cast."

**Authority (We have the credentials):**
> "30+ AI models. 206 production pipelines. 434 video templates. 70+ languages. 7 regional zones. And an ecosystem of 8 products that work together — from the first idea to the final publish."

---

## 7. FRAMEWORK 4: AIDA — Video Scene Structure {#aida}

### AIDA-to-Scene Mapping

Every video blueprint should tag each scene with its AIDA stage:

| AIDA Stage | Scene Purpose | Duration (% of video) | Content Source |
|------------|--------------|----------------------|----------------|
| **Attention** | Hook — grab in 3 seconds | 5-10% | Audience pain point (from STP) |
| **Interest** | Problem expansion + Guide introduction | 20-30% | StoryBrand problem + empathy |
| **Desire** | Solution demo + proof | 40-50% | Product screenshots + features |
| **Action** | CTA + Cast reveal | 15-20% | Cast meta-layer + subscription CTA |

### AIDA Applied to Different Video Lengths

#### 15-Second Social Ad (TikTok/Reels)
| Second | AIDA | Content |
|--------|------|---------|
| 0-3 | **A** | "Still editing videos manually?" |
| 3-9 | **I+D** | Quick montage of Genie UI in action |
| 9-13 | **D** | "8 AI tools. 1 ecosystem." |
| 13-15 | **A** | "Made by Genie Cast ✨" |

#### 60-Second Explainer
| Second | AIDA | Content |
|--------|------|---------|
| 0-5 | **Attention** | Pain point hook (audience-specific) |
| 5-15 | **Interest** | "What if you had an AI production team?" |
| 15-20 | **Interest** | Guide intro: "Meet Genie Studio" |
| 20-40 | **Desire** | Product demo (Spark → Vibe → Deck → Arc) |
| 40-48 | **Desire** | Proof: "70+ languages, 30+ AI models" |
| 48-55 | **Action** | CTA: "Start free today" |
| 55-60 | **Action** | Cast reveal: "Made in 4 minutes by Genie Cast" |

#### 90-Second Deep Dive
| Second | AIDA | Content |
|--------|------|---------|
| 0-8 | **Attention** | Emotional hook with internal problem |
| 8-20 | **Interest** | External problem expansion |
| 20-30 | **Interest** | Guide: empathy + authority stats |
| 30-40 | **Desire** | Product 1 demo (focused product) |
| 40-50 | **Desire** | Product 2+3 quick showcase (ecosystem breadth) |
| 50-60 | **Desire** | Results/transformation shown |
| 60-72 | **Desire** | "We used this to market our own 8 products" |
| 72-82 | **Action** | CTA: subscribe + try free |
| 82-90 | **Action** | Cast "Powered By" card: products used, time taken |

---

## 8. FRAMEWORK 5: JTBD — Jobs To Be Done {#jtbd}

### Core Jobs Matrix

| Audience | Functional Job | Emotional Job | Social Job |
|----------|---------------|---------------|------------|
| **Healthcare** | Produce compliant patient education | Feel confident materials are accurate | Be seen as a modern healthcare provider |
| **Creators** | Generate daily content across platforms | Feel creative, not like a content factory | Be recognized as a prolific creator |
| **Agencies** | Deliver 10x client output | Feel in control of growing demand | Be known as an innovative agency |
| **Enterprise** | Scale content with brand governance | Feel secure about compliance | Be perceived as a digital-first organization |
| **Educators** | Create engaging learning materials | Feel effective as a teacher | Be recognized as an innovative educator |
| **Sales** | Personalize demos for each prospect | Feel prepared and confident | Win deals and gain peer respect |
| **SMBs** | Create pro content on a small budget | Feel competitive with bigger brands | Be perceived as professional and established |
| **L&D** | Train thousands simultaneously | Feel efficient and impactful | Be seen as a scalable training leader |

### JTBD → Product Mapping

| Job To Be Done | Primary Product | Supporting Products | Cast Role |
|---------------|----------------|--------------------|-----------| 
| "Create a script from my rough idea" | **Spark** | Mind (RAG context) | Produces demo video |
| "Turn my document into a video" | **Spark** + **Vibe** | Deck (slides), Arc (production) | Shows the pipeline |
| "Record and auto-edit a presentation" | **Vibe** | Deck (slides), Mind (transcript) | Distributes result |
| "Generate a presentation from data" | **Deck** | Mind (analysis), Spark (narrative) | Publishes everywhere |
| "Dub my video into 70 languages" | **Vibe** + **Arc** | Cast (regional distribution) | Handles distribution |
| "Manage content compliance" | **Hub** (Studio) | Mind (policy checking) | Reports & analytics |
| "Scale my marketing without a team" | **Cast** | All products | IS the solution |

---

## 9. FRAMEWORK 6: Blue Ocean — Differentiation {#blue-ocean}

### Blue Ocean Strategy Canvas

What Genie Studio creates vs. eliminates vs. raises vs. reduces:

```
┌─────────────────────────────────────────────────────────────────┐
│                 BLUE OCEAN STRATEGY CANVAS                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ELIMINATE (Competitors have, we don't need)                     │
│  ├── Manual video editing timelines                              │
│  ├── Per-language pricing                                        │
│  ├── Separate tools for script, video, audio, presentation       │
│  └── Actor/studio hiring for professional content                │
│                                                                  │
│  REDUCE (Competitors overdo, we simplify)                        │
│  ├── Learning curve (AI-guided, not feature-heavy)               │
│  ├── Production time (minutes not hours)                         │
│  ├── Cost per video (10-100x cheaper)                            │
│  └── Number of tools needed (1 ecosystem, not 5-6 tools)         │
│                                                                  │
│  RAISE (Above industry standard)                                 │
│  ├── Language coverage (70+ vs industry avg of 5-10)             │
│  ├── AI model diversity (30+ providers vs 1-2)                   │
│  ├── Output format variety (video + slides + audio + 3D + VR)    │
│  ├── Regional cultural adaptation (transcreation, not translation)│
│  └── Compliance awareness (HIPAA, SOC2, GDPR)                   │
│                                                                  │
│  CREATE (New — no competitor has this)                            │
│  ├── Self-marketing ecosystem (Cast markets itself by running)   │
│  ├── Unified CREATE→PRODUCE→MANAGE→PUBLISH pipeline              │
│  ├── "Powered By" transparency (shows exactly how it was made)   │
│  ├── Dogfooding proof (we use our own tools publicly)            │
│  ├── Knowledge-base-aware generation (Mind RAG integration)      │
│  └── Cross-product workflow (Spark→Mind→Vibe→Deck→Arc→Cast)      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Blue Ocean Messaging Headlines

| Differentiator | Headline | Audience |
|---------------|----------|----------|
| Self-marketing | "The only video tool that demos itself" | All |
| Unified pipeline | "8 products. 1 subscription. Zero tool-switching" | Enterprise, Agencies |
| Transcreation | "Not translated — transcreated for your culture" | Global, Healthcare, Travel |
| Dogfooding | "We market 8 products with Cast. Now you can too." | All (Cast-focused) |
| AI diversity | "30+ AI models compete to give you the best result" | Tech-savvy, Enterprise |
| Compliance | "HIPAA-compliant AI video production" | Healthcare, Compliance |

---

## 10. FRAMEWORK 7: RACE — Digital Distribution {#race}

### RACE Funnel per Platform

| Stage | Action | Platform Strategy | Cast Integration |
|-------|--------|------------------|-----------------|
| **Reach** | Drive awareness | SEO, social ads, influencer seeds | Auto-generate platform-optimized cuts |
| **Act** | Engage & interact | Landing page, interactive demos, free trial | Mini-generation preview on website |
| **Convert** | Subscribe | Pricing page, demo booking, free tier | "Make your own" CTA with pre-loaded template |
| **Engage** | Retain & expand | Tutorials, feature updates, community | Auto-generated update videos per feature release |

### RACE by Audience

| Audience | Reach Channel | Act Trigger | Convert Path | Engage Loop |
|----------|--------------|-------------|-------------|-------------|
| **Healthcare** | LinkedIn, Medical blogs, Conferences | Compliance checklist download | HIPAA demo video | Monthly compliance update videos |
| **Creators** | TikTok, YouTube, Instagram | "Make this video yourself" CTA | Free tier → paid | Weekly feature showcases |
| **Agencies** | LinkedIn, Agency newsletters | White-label demo | Agency tier pricing | Client success story templates |
| **Enterprise** | LinkedIn, Webinars, Sales outreach | ROI calculator | Enterprise demo call | Quarterly product update videos |
| **Educators** | EdTech blogs, Teacher communities | Free template pack | Educator discount | Semester start campaign templates |
| **Sales** | LinkedIn, Sales communities | Pitch template download | Sales team tier | New feature demo videos for pitches |

---

## 11. AUDIENCE-FRAMEWORK MATRIX {#audience-framework-matrix}

### Which Framework Dominates per Audience

Each audience gets a **primary framework** for narrative structure, with secondary frameworks supplementing:

| Audience | Primary Framework | Secondary | Why |
|----------|------------------|-----------|-----|
| **Content Creators** | StoryBrand | AIDA | Emotional storytelling resonates; clear funnel needed |
| **Influencers** | 4Es (Experience) | Blue Ocean | They want to FEEL the product, need differentiation |
| **Knowledge Sharers** | JTBD | StoryBrand | Outcome-focused; need to see "my expertise → income" |
| **Marketing Teams** | RACE | AIDA | Funnel-minded; want to see distribution strategy |
| **Sales Teams** | JTBD | AIDA | "Help me close deals" is a clear job; need fast demos |
| **Agencies** | Blue Ocean + 4Es | RACE | Need differentiation + distribution proof |
| **Entrepreneurs** | StoryBrand | JTBD | Hero's journey resonates; budget-conscious job focus |
| **SMBs** | JTBD | 4Es (Exchange) | "Get pro results on small budget" = clear job + value exchange |
| **Enterprise** | STP + RACE | Blue Ocean | Data-driven; need segmentation proof + distribution |
| **Product Managers** | JTBD | AIDA | Feature-focused job; clear demo funnel |
| **Customer Success** | StoryBrand | JTBD | Customer-as-hero narrative; onboarding job |
| **Executive Leadership** | Blue Ocean | StoryBrand | Strategic differentiation; compelling narrative |
| **Developers** | JTBD | 4Es (Experience) | Pure outcome focus; want to experience the API/tools |
| **HR & Recruiters** | StoryBrand | 4Es (Evangelism) | Culture story; need sharing/evangelism |
| **L&D Professionals** | JTBD + RACE | STP | Scalability job; distribution to learners |
| **Educators** | StoryBrand | 4Es (Experience) | Teacher-as-hero; want to feel "this is easy for me" |
| **Healthcare** | STP + JTBD | Blue Ocean | Compliance-segmented; clear patient education job |
| **Compliance & Legal** | JTBD | Blue Ocean | "Make policy training watchable" = precise job |
| **Travel & Hospitality** | 4Es (Everyplace) | StoryBrand | Multi-platform, multi-language = everyplace focus |

### Template Tag Schema

Each blueprint template should carry:

```json
{
  "framework_primary": "storybrand",
  "framework_secondary": "aida",
  "aida_scene_tags": {
    "scene_1": "attention",
    "scene_2": "interest",
    "scene_3": "interest",
    "scene_4": "desire",
    "scene_5": "desire",
    "scene_6": "desire",
    "scene_7": "action"
  },
  "storybrand_mapping": {
    "scene_1": "character_problem",
    "scene_2": "guide_empathy",
    "scene_3": "guide_authority",
    "scene_4": "plan",
    "scene_5": "success_vision",
    "scene_6": "failure_stakes",
    "scene_7": "call_to_action"
  },
  "cast_self_reference": {
    "enabled": true,
    "placement": "closing_scene",
    "style": "powered_by_card"
  },
  "audience_fit_scores": {
    "healthcare": 0.9,
    "creators": 0.5,
    "enterprise": 0.8
  }
}
```

---

## 12. TEMPLATE-FRAMEWORK MAPPING {#template-framework-mapping}

### Template Categories → Framework Assignment

| Template Category | Primary Framework | AIDA Pattern | Cast Self-Ref Style |
|-------------------|------------------|-------------|---------------------|
| Product Explainer | StoryBrand | Full AIDA | "Powered By" end card |
| Feature Spotlight | JTBD | Interest → Desire → Action | "Made with Cast" watermark |
| Industry Use Case | STP + StoryBrand | Attention (pain) → Desire (demo) | Full meta-layer |
| Comparison/Battle Card | Blue Ocean | Attention → Interest → Action | "Even this comparison was made by Cast" |
| Tutorial/How-To | JTBD | Interest → Desire (steps) | "Tutorial made by Cast in X mins" |
| Social Ad (15-30s) | AIDA (compressed) | A→D→A | "Powered By" 3s end frame |
| Ecosystem Overview | Blue Ocean + 4Es | Full AIDA + evangelism | Full "Powered By" pipeline |
| Customer Story | StoryBrand | Full hero's journey | Subtle Cast mention |
| Product Update | RACE (Engage) | Interest → Action | "Auto-generated by Cast on release" |
| Regional Variant | STP + 4Es (Everyplace) | Same as parent | Regional Cast CTA |

---

## 13. CONTENT LAYER ARCHITECTURE {#content-layer-architecture}

### Four Content Layers (Scene-Level)

Each scene in a video pulls from one or more of these layers:

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 4: CAST META-LAYER                                        │
│  "This video was made by Genie Cast"                             │
│  Source: Auto-generated from production metadata                 │
│  Products used, AI models invoked, generation time               │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 3: FEATURE PROOF                                          │
│  Specific feature + screenshot + hook                            │
│  Source: FEATURE_SHOWCASE_TOPICS + product_asset_inventory       │
│  "Turn a sentence into a full video script" + Spark UI screenshot│
├─────────────────────────────────────────────────────────────────┤
│  LAYER 2: PRODUCT CAPABILITIES                                   │
│  What each product does + value proposition                      │
│  Source: GENIE_PRODUCT_POSITIONING + marketing_products table    │
│  "Genie Spark: From blank canvas to brilliant content in minutes"│
├─────────────────────────────────────────────────────────────────┤
│  LAYER 1: ECOSYSTEM NARRATIVE                                    │
│  Unified story — what Genie Studio IS                            │
│  Source: NEW — ecosystem_messaging registry (audience-tailored)  │
│  "8 AI products, 30+ models, 206 pipelines, 70+ languages"      │
└─────────────────────────────────────────────────────────────────┘
```

### Layer Usage by Scene Type

| Scene Type | Layer 1 (Ecosystem) | Layer 2 (Product) | Layer 3 (Feature) | Layer 4 (Cast Meta) |
|-----------|:-------------------:|:-----------------:|:-----------------:|:-------------------:|
| Opening Hook | ✅ | — | — | — |
| Problem Statement | — | ✅ (pain points) | — | — |
| Guide Introduction | ✅ (authority stats) | — | — | — |
| Product Demo | — | ✅ | ✅ | — |
| Cross-Product Flow | ✅ | ✅ (multiple) | ✅ (multiple) | — |
| Social Proof | ✅ | — | — | ✅ (dogfooding) |
| CTA | — | — | — | ✅ |
| End Card | — | — | — | ✅ (full pipeline) |

---

## 14. CAST SELF-REFERENCE PROTOCOL {#cast-self-reference}

### Three Stages of Cast Messaging

Cast's positioning evolves as the product matures:

```
STAGE 1: INTERNAL DOGFOODING (Current)
─────────────────────────────────────
Message: "We use Cast to market our own 8 products"
Proof: Every video shows "Powered by Genie Cast"
Goal: Build credibility through transparency
Template placement: End card only

STAGE 2: PRODUCT POSITIONING (Next)
─────────────────────────────────────
Message: "Cast is how Genie Studio markets itself — and how you'll market your product"
Proof: Show Cast's UI, the generation pipeline, the speed
Goal: Position Cast as a standalone subscription product
Template placement: Dedicated scenes (1-2 per video)

STAGE 3: EXTERNAL SaaS (Future)
─────────────────────────────────────
Message: "We used Cast to market 8 products across 70 languages to 20 audiences. 
          Now it's your turn."
Proof: Customer case studies generated BY Cast
Goal: Drive SaaS subscriptions
Template placement: Dedicated Cast marketing videos
```

### "Powered By" End Card Specification

Every video ends with a metadata card:

```
┌────────────────────────────────────────────────────────┐
│                                                         │
│              ✨ Powered by Genie Cast ✨                │
│                                                         │
│  Script:      Genie Spark (Script Generator)            │
│  Voice:       Genie Vibe (Azure Neural TTS)             │
│  Visuals:     Genie Hub (AI Avatar + Screenshots)       │
│  Slides:      Genie Deck (Auto-generated)               │
│  Knowledge:   Genie Mind (RAG-powered accuracy)         │
│  Published:   Genie Cast → YouTube, LinkedIn, TikTok    │
│                                                         │
│  ⏱️  Total Generation Time: 4 minutes 23 seconds        │
│                                                         │
│  "Make It. Show It. Scale It."                          │
│  geniecast.ai/try-free                                  │
│                                                         │
└────────────────────────────────────────────────────────┘
```

---

## 15. ECOSYSTEM MESSAGING BY AUDIENCE {#ecosystem-by-audience}

### Audience-Tailored Ecosystem Narratives

Each audience gets a DIFFERENT ecosystem story, emphasizing what matters to THEM:

#### Healthcare
> **Ecosystem Pitch:** "One AI ecosystem, built for healthcare compliance. From HIPAA-aware script generation (Spark) to clinician-voiced patient education (Vibe) to 70-language distribution for diverse patient populations (Cast). No scattered tools. No compliance gaps."
>
> **Stats Emphasis:** HIPAA compliance, 70+ languages, clinical document processing
>
> **Products to Highlight:** Mind (document understanding), Spark (compliant scripts), Vibe (medical-grade TTS), Cast (regional distribution)

#### Agencies & Freelancers
> **Ecosystem Pitch:** "One subscription replaces your entire freelance production team. Spark writes the scripts. Mind learns each client's brand voice. Vibe produces the audio. Deck creates the pitch. Arc manages the project. Cast publishes everywhere. White-label it all."
>
> **Stats Emphasis:** 10x content velocity, white-label capability, multi-client support
>
> **Products to Highlight:** All 8 in sequence (show the full pipeline)

#### Enterprise Teams
> **Ecosystem Pitch:** "Enterprise content governance at AI speed. SOC2-compliant infrastructure. Brand-consistent output across 70+ languages. Team collaboration with approval workflows. Analytics that prove ROI."
>
> **Stats Emphasis:** Compliance certifications, team collaboration, analytics dashboard
>
> **Products to Highlight:** Hub (governance), Mind (brand voice), Arc (workflow), Cast (analytics)

#### Content Creators
> **Ecosystem Pitch:** "Stop juggling 6 tools. Start creating. One platform where your idea becomes a script (Spark), gets your voice (Vibe), becomes a video (Arc), and goes live everywhere (Cast) — before your coffee gets cold."
>
> **Stats Emphasis:** Speed (minutes not hours), multi-platform publishing, AI variety
>
> **Products to Highlight:** Spark → Vibe → Cast (speed pipeline)

#### Educators
> **Ecosystem Pitch:** "Transform your teaching materials into engaging, accessible learning experiences. Upload your lesson plan, get a narrated video in every student's language. Because teachers shouldn't need a film degree to teach effectively."
>
> **Stats Emphasis:** 70+ languages, accessibility, ease of use
>
> **Products to Highlight:** Spark (lesson → script), Deck (slides), Vibe (narration), Cast (LMS distribution)

#### Sales Teams
> **Ecosystem Pitch:** "Every prospect gets a personalized demo. Every pitch tells their story. Spark writes the script with their pain points. Deck creates the deck. Vibe adds your voice. Cast sends it before the competition even opens PowerPoint."
>
> **Stats Emphasis:** Personalization speed, multi-format output, CRM integration potential
>
> **Products to Highlight:** Spark (personalized scripts), Deck (pitch decks), Cast (delivery)

#### HR & Recruiters
> **Ecosystem Pitch:** "Your employer brand, powered by AI. Culture videos that actually show your culture. Onboarding that doesn't put new hires to sleep. Job posts that stand out in every language your candidates speak."
>
> **Stats Emphasis:** Multi-language, video for talent attraction, training scalability
>
> **Products to Highlight:** Spark (culture scripts), Vibe (authentic voice), Cast (social distribution)

#### L&D Professionals
> **Ecosystem Pitch:** "Train 10,000 people. One recording. AI handles the rest — localization, formatting, platform-specific cuts, accessibility compliance. Your expertise scales without your time."
>
> **Stats Emphasis:** Scale (1→10,000), language coverage, format variety, LMS compatibility
>
> **Products to Highlight:** Mind (knowledge base), Vibe (recording + dubbing), Deck (training slides), Cast (LMS distribution)

#### Executive Leadership
> **Ecosystem Pitch:** "Board presentations that command the room. Investor updates that tell a compelling story. Internal comms that actually get watched. All produced by AI, all in your voice, all in minutes."
>
> **Stats Emphasis:** Executive-quality output, time savings, voice cloning, confidentiality
>
> **Products to Highlight:** Deck (presentations), Spark (narrative), Vibe (voice clone), Cast (secure distribution)

#### Travel & Hospitality
> **Ecosystem Pitch:** "Your destination, in every traveler's language. AI-generated videos that capture the magic of your property, adapted for every culture — not just translated, but transcreated for authenticity."
>
> **Stats Emphasis:** 70+ languages, transcreation (not translation), seasonal campaign automation
>
> **Products to Highlight:** Spark (destination scripts), Vibe (multilingual narration), Cast (travel platform distribution)

---

## 16. PRODUCT-SPECIFIC MESSAGING DEPTH {#product-depth}

### Three Video Depth Strategies

#### Strategy A: Single Product Focus
> **Use when:** Marketing a specific product capability  
> **Structure:** 70% focused product, 20% ecosystem context, 10% Cast meta  
> **Example:** "Genie Deck: Presentations That Don't Break on Export"  
> **Ecosystem mention:** "Part of the Genie Studio ecosystem"  

#### Strategy B: Workflow Combination (2-3 products)
> **Use when:** Showing a specific workflow pipeline  
> **Structure:** 50% primary workflow, 30% supporting products, 20% Cast meta  
> **Example:** "From Idea to Video: Spark → Vibe → Cast"  
> **Ecosystem mention:** "Powered by the unified Genie pipeline"  

#### Strategy C: Full Ecosystem Overview
> **Use when:** Introducing Genie Studio to new audiences  
> **Structure:** 60% ecosystem breadth, 20% depth on 1-2 products, 20% Cast meta  
> **Example:** "8 AI Products. 1 Subscription. Zero Excuses."  
> **Ecosystem mention:** IS the entire video  

### Depth Strategy Assignment by Audience

| Audience | Preferred Depth | Why |
|----------|----------------|-----|
| Creators | A (Spark or Vibe) | Want to see ONE tool that solves their problem |
| Agencies | C (Full Ecosystem) | Need to see the breadth of capability |
| Enterprise | B (Hub + Mind + Cast) | Want governance + intelligence + distribution |
| Healthcare | B (Mind + Spark + Vibe) | Need compliance + generation + localization |
| Educators | A (Deck or Spark) | Want simplicity, not overwhelm |
| Sales | B (Spark + Deck + Cast) | Script → Pitch → Send pipeline |
| SMBs | A (Spark or Cast) | Budget-conscious, want quick wins |
| Executive | A (Deck) or C | Either focused presentations or ecosystem investment pitch |

---

## 17. FULL MATRIX EXAMPLES {#full-examples}

### Example 1: Healthcare + Spark + 60-Second Explainer

| Scene | Sec | AIDA | StoryBrand | Layer | Content |
|-------|-----|------|-----------|-------|---------|
| 1 | 0-5 | **Attention** | Character (Hero) | L1 (Ecosystem) | "Your clinical team spends 12 hours a week creating patient education materials" |
| 2 | 5-15 | **Interest** | Problem (External) | L2 (Product) | "Scattered tools. Outdated content. No way to serve 70+ patient languages" |
| 3 | 15-22 | **Interest** | Guide (Empathy) | L1 (Ecosystem) | "Genie Studio was built for healthcare teams like yours" |
| 4 | 22-35 | **Desire** | Plan (Step 1-3) | L3 (Feature) | Screenshot: Spark Script Generator → "Upload your clinical protocol → Get a patient-friendly script in seconds" |
| 5 | 35-42 | **Desire** | Success | L3 (Feature) | Screenshot: Vibe TTS → "Narrated in your patient's language — all 70+" |
| 6 | 42-50 | **Desire** | Success | L1 (Ecosystem) | "HIPAA-compliant. 30+ AI models. Enterprise-grade" |
| 7 | 50-55 | **Action** | CTA | L4 (Cast Meta) | "Start free at geniestudio.ai" |
| 8 | 55-60 | **Action** | — | L4 (Cast Meta) | "Powered by Genie Cast: Spark (script) + Vibe (voice) + Cast (publish) — Made in 4 minutes" |

### Example 2: Agency + Full Ecosystem + 90-Second Overview

| Scene | Sec | AIDA | StoryBrand | Layer | Content |
|-------|-----|------|-----------|-------|---------|
| 1 | 0-8 | **Attention** | Character | L2 (Product) | "Your agency landed 3 new clients this month. Your production team hasn't grown." |
| 2 | 8-18 | **Interest** | Problem | L2 (Product) | "Deadlines pile up. Quality slips. Clients notice." |
| 3 | 18-28 | **Interest** | Guide | L1 (Ecosystem) | "What if one platform could replace your entire production stack?" |
| 4 | 28-38 | **Desire** | Plan Step 1 | L3 (Feature) | "Spark: Client brief → polished script in 60 seconds" |
| 5 | 38-48 | **Desire** | Plan Step 2 | L3 (Feature) | "Mind: Upload client docs → AI learns their brand voice" |
| 6 | 48-55 | **Desire** | Plan Step 3 | L3 (Feature) | "Arc: AI avatars, voiceovers, 3D — agency-quality production" |
| 7 | 55-62 | **Desire** | Success | L1 (Ecosystem) | "8 products. 206 pipelines. White-label ready." |
| 8 | 62-70 | **Desire** | Success | L3 (Feature) | "Deck: Client-ready presentations in any language" |
| 9 | 70-78 | **Action** | CTA | L4 (Cast Meta) | "Scale your agency, not your headcount. Start free." |
| 10 | 78-90 | **Action** | — | L4 (Cast Meta) | Full "Powered By" card showing all 6 products used |

### Example 3: Creator + Spark Focus + 15-Second TikTok

| Scene | Sec | AIDA | Layer | Content |
|-------|-----|------|-------|---------|
| 1 | 0-3 | **A** | L2 | "POV: You have a video idea but zero motivation to edit" |
| 2 | 3-9 | **I+D** | L3 | Quick Spark UI recording: type idea → script appears → click generate |
| 3 | 9-12 | **D** | L1 | "Genie Spark ✨ From idea to script in 10 seconds" |
| 4 | 12-15 | **A** | L4 | "Made by Cast 🧞" + link |

---

## 18. IMPLEMENTATION ROADMAP {#implementation-roadmap}

### Phase 1: Data Model (Database)
- [ ] Create `ecosystem_messaging` table (audience-tailored ecosystem narratives)
- [ ] Add `framework_tags` JSONB column to `video_blueprints`
- [ ] Add `cast_meta_config` JSONB column to `video_blueprints`
- [ ] Create `product_chain_metadata` table (tracks which products were used in generation)
- [ ] Seed ecosystem messaging for all 20 audiences

### Phase 2: Service Integration
- [ ] Extend `genieCastOrchestrationService` to pull ecosystem messaging by audience
- [ ] Wire `GENIE_PRODUCT_POSITIONING` into scene-level script generation
- [ ] Build framework-aware script generation (StoryBrand scenes, AIDA stages)
- [ ] Implement "Powered By" metadata collector
- [ ] Create `audienceFrameworkResolver` service

### Phase 3: Template Tagging
- [ ] Tag existing 434+ templates with AIDA scene mappings
- [ ] Tag templates with primary/secondary framework assignments
- [ ] Add audience fit scores to templates
- [ ] Create framework-aware SmartTemplateRecommender scoring

### Phase 4: UI Integration
- [ ] Add "Powered By" end card component
- [ ] Show framework assignment in BlueprintPreviewModal
- [ ] Add audience-framework selector to CREATE workflow
- [ ] Framework visualization in Analytics dashboard

### Phase 5: Distribution (RACE)
- [ ] Platform-specific format generation per RACE strategy
- [ ] Auto-generated social copy per platform per audience
- [ ] A/B testing framework (StoryBrand vs JTBD for same audience)
- [ ] Performance tracking by framework effectiveness

---

## APPENDIX: Quick Reference Card

### For Every Video, Ask:

1. **WHO?** → STP (which of the 20 audiences?)
2. **WHY US?** → Blue Ocean (which differentiator leads?)
3. **WHAT JOB?** → JTBD (what functional/emotional/social job?)
4. **WHAT STORY?** → StoryBrand (hero, problem, guide, plan, CTA)
5. **WHAT EXPERIENCE?** → 4Es (what does the viewer feel/exchange/share?)
6. **HOW STRUCTURED?** → AIDA (scene-by-scene attention→action flow)
7. **WHERE PUBLISHED?** → RACE (which platforms, what format, what funnel stage?)
8. **WHICH PRODUCTS?** → Product Depth Strategy (A: single, B: workflow, C: ecosystem)
9. **CAST INCLUDED?** → Always yes. What style? (end card / watermark / dedicated scenes)

---

*This playbook is the strategic foundation. No code should be written until this document is reviewed and approved.*
