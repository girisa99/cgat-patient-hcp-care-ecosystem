# GENIESUITE PHASE 11: PRODUCTION AUDIT & STAGE GATES

> **Created:** Feb 23, 2026
> **Purpose:** Final audit of ALL AI providers, API keys, infrastructure, OAuth, domains, and stage gates from DEV → UAT → PROD
> **Status:** PLANNING

---

## TABLE OF CONTENTS

1. [Environment Architecture](#1-environment-architecture)
2. [Domain & Deployment Matrix](#2-domain--deployment-matrix)
3. [Supabase Project Matrix](#3-supabase-project-matrix)
4. [AI Provider Audit — All 73 Keys](#4-ai-provider-audit--all-73-keys)
5. [API Key Strategy — Same vs Separate per Environment](#5-api-key-strategy--same-vs-separate)
6. [OAuth Configuration per Environment](#6-oauth-configuration-per-environment)
7. [Stage Gates — DEV → UAT → PROD](#7-stage-gates--dev--uat--prod)
8. [Music Provider Audit — Suno, Lyria, and Active Providers](#8-music-provider-audit)
9. [Document Extraction & DocuSign Assessment](#9-document-extraction--docusign-assessment)
10. [Lovable Task Absorption Plan](#10-lovable-task-absorption-plan)
11. [Script Editor Phase 7 Plan](#11-script-editor-phase-7-plan)
12. [Existing Plans vs Production Plans](#12-existing-plans-vs-production-plans)
13. [UAT Checklist — What to Verify](#13-uat-checklist)
14. [Production Go-Live Checklist](#14-production-go-live-checklist)

---

## 0. CONSOLIDATED INVENTORY (Verified Counts — Feb 23, 2026)

| Category | Count | Source |
|----------|-------|--------|
| **Master Marketing Pipelines** | 206 | `master-ecosystem-registry.ts` |
| **Pipeline Capability Matrix** | 96 | `pipelineCapabilityMatrix.ts` |
| **Pipeline IO Registry** | 141 | `pipelineIORegistry.ts` |
| **Pending Pipelines (Phase 3)** | 39 | `pendingPipelines180.ts` |
| **Total Unique Pipeline Concepts** | **~419** | Across all registries |
| **Edge Functions (Supabase)** | 203 | `supabase/functions/` directories |
| **Visual/Video Styles** | 63 | `master-ecosystem-registry.ts` |
| **AI Providers (registered)** | 30 | `master-ecosystem-registry.ts` |
| **Provider Capability Types** | 19 | LLM, TTS, STT, video_gen, avatar, etc. |
| **Genie Studio Components** | 188 | `src/components/genie-studio/` |
| **Genie Admin Components** | 152 | `src/components/genie-admin/` |
| **Genie Vibe Components** | 8 | `src/components/genie-vibe/` |
| **Genie Spark Components** | 3 | `src/components/genie-spark/` |
| **Total Genie Components** | **351** | All genie-* directories |
| **Hooks** | 466 | `src/hooks/` |
| **Services** | 226 | `src/services/` |
| **Regional Zones** | 14 | `content-generation-pipeline.ts` |
| **AI Routing Zones** | 4 | claude, alibaba, gemini, fallback |
| **Landing Components** | 47 | `src/components/landing/` |
| **API Keys / Secrets** | 73 | Supabase secrets (all providers) |

### Scope Exclusions (Healthcare-Only — NOT GenieSuite)

| Service | Status | Reason |
|---------|--------|--------|
| **DocuSign** | REMOVED from GenieSuite | Healthcare enrollment/consent only |
| **AWS Textract** | REMOVED from GenieSuite | Healthcare document extraction only |
| **Azure Form Recognizer** | REMOVED from GenieSuite | Healthcare OCR only |
| **Google Lyria** | PARKED | No public API — DeepMind research only |
| **Suno** | PARKED | Future music provider — not integrated |
| **Medical Imaging CNN** | REMOVED from GenieSuite | Healthcare radiology only |

### Active GenieSuite API Keys (Reduced from 73 to ~55 for GenieSuite)

The following keys are NOT needed for GenieSuite deployment:
- DocuSign (5 keys) — healthcare only
- AWS Textract (3 keys) — healthcare only → user may still enter for healthcare
- Azure Form Recognizer (2 keys) — healthcare only
- Label Studio (5 keys) — internal ML training tool

**GenieSuite-specific keys: ~58**

---

## 1. ENVIRONMENT ARCHITECTURE

### Current State (What Exists)

```
LOCAL (localhost:8080)
  ↓ git push
DEV (Vercel preview / geniestudiodev.genieaisuite.com)
  ↓ manual merge
UAT (geniestudiouat.genieaisuite.com)
  ↓ release gate
PROD (www.genieaisuite.com)
```

### Environment Detection (Already Built)
**File:** `src/services/environmentService.ts`

| Environment | Hostname | Debug | Beta Features | Verbose Logs |
|-------------|----------|-------|---------------|--------------|
| **LOCAL** | `localhost`, `127.0.0.1`, `192.168.*` | ON | ON | ON |
| **DEV** | `geniestudiodev.genieaisuite.com`, `*.lovable.app`, `*.vercel.app` | ON | ON | ON |
| **UAT** | `geniestudiouat.genieaisuite.com` | OFF | ON | OFF |
| **PROD** | `www.genieaisuite.com`, `genieaisuite.com` | OFF | OFF | OFF |

### Git Branch Strategy

| Branch | Environment | Deploys To | Auto-Deploy |
|--------|-------------|-----------|-------------|
| `claude/*` | Feature branches | Vercel preview | Yes (Vercel) |
| `dev` | Development | geniestudiodev.genieaisuite.com | Yes (Vercel) |
| `uat` | UAT/Testing | geniestudiouat.genieaisuite.com | Yes (Vercel/Netlify) |
| `main` | Production | www.genieaisuite.com | Manual gate required |

---

## 2. DOMAIN & DEPLOYMENT MATRIX

### Domains (genieaisuite.com)

| Subdomain | Purpose | Platform | Status |
|-----------|---------|----------|--------|
| `geniestudiodev.genieaisuite.com` | Development | Vercel | Active |
| `geniestudiouat.genieaisuite.com` | UAT / Testing | Vercel or Netlify | Configured |
| `www.genieaisuite.com` | Production | Vercel | PLACEHOLDER (not live) |
| `genieaisuite.com` | Production (bare) | Vercel redirect | PLACEHOLDER |

### DNS Records Needed

| Type | Name | Value | Environment | Status |
|------|------|-------|-------------|--------|
| CNAME | `geniestudiodev` | `cname.vercel-dns.com` | DEV | Verify |
| CNAME | `geniestudiouat` | `cname.vercel-dns.com` | UAT | Verify |
| CNAME | `www` | `cname.vercel-dns.com` | PROD | TODO |
| A | `@` | Vercel IP | PROD | TODO |

### Action Items — Domains
- [ ] Verify DEV subdomain DNS is active and resolving
- [ ] Verify UAT subdomain DNS is active and resolving
- [ ] Set up PROD subdomain DNS when ready
- [ ] Configure SSL certificates (automatic with Vercel)
- [ ] Set up redirect: `genieaisuite.com` → `www.genieaisuite.com`

---

## 3. SUPABASE PROJECT MATRIX

### Current Configuration
**File:** `src/integrations/supabase/environment-config.ts`

| Environment | Project Ref | Status | Edge Functions | Migrations |
|-------------|-------------|--------|----------------|------------|
| **LOCAL/DEV** | `ithspbabhmdntioslfqe` | Active | 202 deployed | All applied |
| **UAT** | `epqsuaccpafjoqwtpajo` | Configured | TODO: deploy | TODO: apply |
| **PROD** | `REPLACE_WITH_PROD_PROJECT_REF` | NOT CREATED | N/A | N/A |

### Stage Gate: Supabase DEV → UAT

Before UAT goes live, you must:

1. **Migrations:** Apply all 50+ migration files to UAT Supabase project
   ```bash
   supabase link --project-ref epqsuaccpafjoqwtpajo
   supabase db push
   ```

2. **Edge Functions:** Deploy all 202 edge functions to UAT
   ```bash
   supabase functions deploy --project-ref epqsuaccpafjoqwtpajo
   ```

3. **Secrets:** Copy ALL 73 API keys to UAT Supabase secrets
   ```bash
   supabase secrets set --env-file .env.uat --project-ref epqsuaccpafjoqwtpajo
   ```

4. **RLS Policies:** Verify all Row Level Security policies are active
5. **OAuth:** Configure Google OAuth redirect URLs for UAT domain
6. **Storage Buckets:** Create `generated-audio`, `genie-content`, `avatars` buckets

### Stage Gate: Supabase UAT → PROD

1. Create new Supabase Production project
2. Update `environment-config.ts` with real PROD credentials
3. Apply all migrations
4. Deploy all edge functions
5. Set ALL secrets (use SEPARATE API keys — see Section 5)
6. Configure Google OAuth for production domain
7. Verify RLS policies
8. Load seed data if needed

---

## 4. AI PROVIDER AUDIT — ALL 73 KEYS

### Complete Key Inventory

#### Core AI Providers (LLM, Vision, Generation)

| # | Provider | Key Name | DEV Status | UAT Action | PROD Action |
|---|----------|----------|------------|------------|-------------|
| 1 | Google/Gemini | `GEMINI_API_KEY` | Configured | Copy or new key | **NEW KEY** (separate billing) |
| 2 | Google | `GOOGLE_API_KEY` | Configured | Copy or new key | **NEW KEY** |
| 3 | Google OAuth | `GOOGLE_CLIENT_ID` | Configured | Same key OK | Same key (add UAT/PROD redirect URIs) |
| 4 | Google OAuth | `GOOGLE_CLIENT_SECRET` | Configured | Same key OK | Same key |
| 5 | Google | `GOOGLE_CLOUD_PROJECT` | Configured | Same project OK | **NEW PROJECT** recommended |
| 6 | Google | `GOOGLE_CLOUD_LOCATION` | Configured | Same | Same |
| 7 | Google | `GOOGLE_TRANSLATE_API_KEY` | Configured | Copy or new | **NEW KEY** |
| 8 | Google | `GOOGLE_VERTEX_API_KEY` | Configured | Copy or new | **NEW KEY** |
| 9 | Google | `GOOGLE_VERTEX_SERVICE_ACCOUNT` | Configured | New SA | **NEW SA** |
| 10 | Google | `GOOGLE_DRIVE_TOKEN` | Configured | New token | **NEW TOKEN** |
| 11 | OpenAI | `OPENAI_API_KEY` | Configured | Copy or new | **NEW KEY** (separate billing) |
| 12 | Anthropic | `ANTHROPIC_API_KEY` | Configured | Copy or new | **NEW KEY** |
| 13 | Anthropic | `CLAUDE_API_KEY` | Configured | Copy or new | **NEW KEY** |
| 14 | DeepSeek | `DEEPSEEK_API_KEY` | Configured | Copy or new | **NEW KEY** |
| 15 | Perplexity | `PERPLEXITY_API_KEY` | Configured | Copy or new | **NEW KEY** |

#### TTS / STT / Voice

| # | Provider | Key Name | DEV Status | UAT Action | PROD Action |
|---|----------|----------|------------|------------|-------------|
| 16 | Azure Speech | `AZURE_SPEECH_KEY` | Configured | Copy or new | **NEW KEY** |
| 17 | Azure Speech | `AZURE_SPEECH_REGION` | Configured | Same | Same |
| 18 | ElevenLabs | `ELEVENLABS_API_KEY` | Configured | Copy or new | **NEW KEY** (separate billing) |
| 19 | Deepgram | `DEEPGRAM_API_KEY` | Configured | Copy or new | **NEW KEY** |
| 20 | HuggingFace | `HUGGING_FACE_ACCESS_TOKEN` | Configured | Copy or new | Copy OK (free tier) |
| 21 | HuggingFace | `HUGGING_FACE_TOKEN` | Configured | Copy or new | Copy OK |

#### Alibaba Cloud (CJK Zone)

| # | Provider | Key Name | DEV Status | UAT Action | PROD Action |
|---|----------|----------|------------|------------|-------------|
| 22 | Alibaba | `ALIBABA_API_KEY` | Configured | Copy or new | **NEW KEY** |
| 23 | Alibaba | `ALIBABA_SINGAPORE_API_KEY` | Configured | Copy or new | **NEW KEY** |
| 24 | Alibaba | `ALIBABA_CHINA_API_KEY` | Configured | Copy or new | **NEW KEY** |
| 25 | Alibaba | `ALIBABA_CHINA_KEY` | Configured | Copy or new | **NEW KEY** |
| 26 | Alibaba | `ALIBABA_SG_KEY` | Configured | Copy or new | **NEW KEY** |
| 27 | Alibaba | `ALIBABA_VA_KEY` | Configured | Copy or new | **NEW KEY** |
| 28 | Alibaba | `ALIBABA_APP_KEY` | Configured | Copy or new | **NEW KEY** |

#### Translation

| # | Provider | Key Name | DEV Status | UAT Action | PROD Action |
|---|----------|----------|------------|------------|-------------|
| 29 | DeepL | `DEEPL_API_KEY` | Configured | Copy or new | **NEW KEY** |
| 30 | Azure | `AZURE_TRANSLATOR_KEY` | Configured | Copy or new | **NEW KEY** |

#### Document Processing (Healthcare-only)

| # | Provider | Key Name | DEV Status | UAT Action | PROD Action |
|---|----------|----------|------------|------------|-------------|
| 31 | Azure | `AZURE_FORM_RECOGNIZER_KEY` | Configured | Copy or new | **NEW KEY** |
| 32 | Azure | `AZURE_FORM_RECOGNIZER_ENDPOINT` | Configured | Same | Same or new |
| 33 | AWS | `AWS_ACCESS_KEY_ID` | **PENDING** (user to enter) | User to enter | **NEW IAM USER** |
| 34 | AWS | `AWS_SECRET_ACCESS_KEY` | **PENDING** | User to enter | **NEW IAM USER** |
| 35 | AWS | `AWS_REGION` | Default us-east-1 | Same | Same or region-specific |

#### Media Generation

| # | Provider | Key Name | DEV Status | UAT Action | PROD Action |
|---|----------|----------|------------|------------|-------------|
| 36 | Replicate | `REPLICATE_API_TOKEN` | Configured | Copy or new | **NEW KEY** |
| 37 | Replicate | `REPLICATE_API_KEY` | Configured | Copy or new | **NEW KEY** |
| 38 | ModelsLab | `MODELSLAB_API_KEY` | Configured | Copy or new | **NEW KEY** |

#### Payments

| # | Provider | Key Name | DEV Status | UAT Action | PROD Action |
|---|----------|----------|------------|------------|-------------|
| 39 | Stripe | `STRIPE_SECRET_KEY` | Configured (test mode) | **TEST MODE KEY** | **LIVE MODE KEY** |
| 40 | Stripe | `STRIPE_WEBHOOK_SECRET` | Configured | New webhook | **NEW WEBHOOK** |

#### Communications

| # | Provider | Key Name | DEV Status | UAT Action | PROD Action |
|---|----------|----------|------------|------------|-------------|
| 41 | Twilio | `TWILIO_ACCOUNT_SID` | Configured | Same OK (test numbers) | **PROD ACCOUNT** or same |
| 42 | Twilio | `TWILIO_AUTH_TOKEN` | Configured | Same | Same or new |
| 43 | Twilio | `TWILIO_PHONE_NUMBER` | Configured | Same (test) | **PROD NUMBER** |
| 44 | Twilio | `TWILIO_WHATSAPP_NUMBER` | Configured | Same (test) | **PROD NUMBER** |
| 45 | Resend | `RESEND_API_KEY` | Configured | Copy or new | **NEW KEY** |
| 46 | SendGrid | `SENDGRID_API_KEY` | Configured | Copy or new | **NEW KEY** |
| 47 | SendGrid | `SENDGRID_FROM_EMAIL` | Configured | Test email | **PROD EMAIL** |

#### Social Media OAuth

| # | Provider | Key Name | DEV Status | UAT Action | PROD Action |
|---|----------|----------|------------|------------|-------------|
| 48 | LinkedIn | `LINKEDIN_CLIENT_ID` | Configured | Same (add UAT redirect) | Same (add PROD redirect) |
| 49 | LinkedIn | `LINKEDIN_CLIENT_SECRET` | Configured | Same | Same |
| 50 | YouTube | `YOUTUBE_API_KEY` | Configured | Same | Same |
| 51 | TikTok | `TIKTOK_CLIENT_KEY` | Configured | Same (add redirect) | Same (add redirect) |
| 52 | TikTok | `TIKTOK_CLIENT_SECRET` | Configured | Same | Same |

#### DocuSign (Healthcare-only)

| # | Provider | Key Name | DEV Status | UAT Action | PROD Action |
|---|----------|----------|------------|------------|-------------|
| 53 | DocuSign | `DOCUSIGN_API_KEY` | Configured | N/A for GenieSuite | N/A for GenieSuite |
| 54 | DocuSign | `DOCUSIGN_CLIENT_ID` | Configured | N/A | N/A |
| 55 | DocuSign | `DOCUSIGN_CLIENT_SECRET` | Configured | N/A | N/A |
| 56 | DocuSign | `DOCUSIGN_ACCOUNT_ID` | Configured | N/A | N/A |
| 57 | DocuSign | `DOCUSIGN_USER_ID` | Configured | N/A | N/A |

#### Cloud Storage

| # | Provider | Key Name | DEV Status | UAT Action | PROD Action |
|---|----------|----------|------------|------------|-------------|
| 58 | Dropbox | `DROPBOX_ACCESS_TOKEN` | Configured | Same | Same or new |

#### ML Observability

| # | Provider | Key Name | DEV Status | UAT Action | PROD Action |
|---|----------|----------|------------|------------|-------------|
| 59 | Arize | `ARIZE_API_KEY` | Configured | Same (dev project) | **NEW KEY** (prod project) |
| 60 | LangWatch | `LANGWATCH_API_KEY` | Configured | Same | **NEW KEY** |

#### Label Studio (ML Training)

| # | Provider | Key Name | DEV Status | UAT Action | PROD Action |
|---|----------|----------|------------|------------|-------------|
| 61-65 | Label Studio | 5 keys | Configured | Same (internal tool) | Same (internal tool) |

#### Supabase (per environment)

| # | Provider | Key Name | DEV Status | UAT Action | PROD Action |
|---|----------|----------|------------|------------|-------------|
| 66 | Supabase | `SUPABASE_URL` | Active | UAT project URL | **PROD project URL** |
| 67 | Supabase | `SUPABASE_ANON_KEY` | Active | UAT anon key | **PROD anon key** |
| 68 | Supabase | `SUPABASE_SERVICE_ROLE_KEY` | Active | UAT service key | **PROD service key** |

---

## 5. API KEY STRATEGY — SAME VS SEPARATE

### RECOMMENDATION: Separate Keys for PROD, Shared OK for DEV/UAT

| Category | DEV | UAT | PROD | Reason |
|----------|-----|-----|------|--------|
| **Supabase** | Project A | Project B | **Project C** | Data isolation, RLS, separate billing |
| **Stripe** | Test mode | Test mode | **Live mode** | NEVER use live Stripe in DEV/UAT |
| **Google OAuth** | Same client | Same client | Same client | Just add redirect URIs per environment |
| **AI Providers (LLM, TTS, etc.)** | Shared OK | Shared OK | **NEW KEYS** | Billing isolation, rate limits, abuse protection |
| **Twilio** | Test numbers | Test numbers | **Prod numbers** | Real SMS/calls cost money |
| **Email (Resend/SendGrid)** | Shared OK | Shared OK | **NEW KEYS** | Prod email reputation isolation |
| **Social OAuth** | Same app | Same app | Same app | Add redirect URIs |
| **Observability** | Shared | Shared | **NEW KEYS** | Separate prod monitoring |

### Why Separate PROD Keys?

1. **Billing isolation** — DEV testing doesn't inflate PROD costs
2. **Rate limit protection** — DEV testing can't exhaust PROD quotas
3. **Security** — If DEV is compromised, PROD keys are unaffected
4. **Audit trail** — Clear separation of usage per environment
5. **Rollback** — Can disable PROD keys without affecting DEV

### Exception: Shared Keys OK When

- Provider has free tier with generous limits (HuggingFace, Label Studio)
- OAuth apps (Google, LinkedIn, TikTok) — just add redirect URIs
- Internal tools (Arize, LangWatch) — dev project tracking is fine

---

## 6. OAUTH CONFIGURATION PER ENVIRONMENT

### Google OAuth (Primary Auth for GenieSuite)

**Google Cloud Console → Credentials → OAuth 2.0 Client**

| Setting | DEV | UAT | PROD |
|---------|-----|-----|------|
| **Authorized redirect URIs** | | | |
| Supabase callback | `https://ithspbabhmdntioslfqe.supabase.co/auth/v1/callback` | `https://epqsuaccpafjoqwtpajo.supabase.co/auth/v1/callback` | `https://PROD_REF.supabase.co/auth/v1/callback` |
| App redirect | `https://geniestudiodev.genieaisuite.com/genie-studio` | `https://geniestudiouat.genieaisuite.com/genie-studio` | `https://www.genieaisuite.com/genie-studio` |
| Localhost | `http://localhost:8080/genie-studio` | N/A | N/A |
| Vercel preview | `https://*.vercel.app/genie-studio` | N/A | N/A |

### Supabase Auth Configuration (per project)

In each Supabase project dashboard → Authentication → URL Configuration:

| Setting | DEV | UAT | PROD |
|---------|-----|-----|------|
| **Site URL** | `https://geniestudiodev.genieaisuite.com` | `https://geniestudiouat.genieaisuite.com` | `https://www.genieaisuite.com` |
| **Redirect URLs** | localhost, *.vercel.app, dev domain | UAT domain only | PROD domain only |

### Action Items — OAuth
- [ ] Verify DEV Google OAuth redirect URIs include all preview domains
- [ ] Add UAT Supabase callback to Google OAuth authorized redirects
- [ ] Add UAT domain to Google OAuth authorized JavaScript origins
- [ ] When PROD ready: add PROD Supabase callback + domain
- [ ] Verify `useGenieStudioAuth.ts` custom domain detection works for all environments

---

## 7. STAGE GATES — DEV → UAT → PROD

### GATE 1: DEV → UAT (Pre-Testing)

| # | Gate | Owner | Status | Pass Criteria |
|---|------|-------|--------|---------------|
| G1.1 | **Build passes** | Claude | Verify | `npm run build` — 0 errors |
| G1.2 | **All feature branches merged to dev** | Claude | Verify | No open PRs for current phase |
| G1.3 | **Supabase UAT project configured** | User | TODO | Project ref, anon key, service role key |
| G1.4 | **Migrations applied to UAT** | User | TODO | `supabase db push --project-ref UAT` |
| G1.5 | **Edge functions deployed to UAT** | User | TODO | `supabase functions deploy --project-ref UAT` |
| G1.6 | **All secrets set in UAT** | User | TODO | 73 keys via `supabase secrets set` |
| G1.7 | **Google OAuth — UAT redirect URIs** | User | TODO | Add UAT callback URLs in Google Console |
| G1.8 | **Supabase Auth — UAT site URL** | User | TODO | Set site URL to UAT domain |
| G1.9 | **Storage buckets created in UAT** | User | TODO | `generated-audio`, `genie-content`, `avatars` |
| G1.10 | **DNS — UAT subdomain resolves** | User | Verify | `geniestudiouat.genieaisuite.com` |
| G1.11 | **Vercel/Netlify — UAT deployment** | User | TODO | Connect `uat` branch to UAT domain |
| G1.12 | **Stripe — Test mode keys in UAT** | User | TODO | Never live keys in UAT |

### GATE 2: UAT TESTING (What to Verify)

| # | Test Area | Tests | Priority |
|---|-----------|-------|----------|
| T2.1 | **Google OAuth login** | Sign in → profile created → redirect to /genie-studio | P0 |
| T2.2 | **GenieSuite RBAC** | Roles assigned correctly, tier gating works | P0 |
| T2.3 | **Genie Spark** | Create content from prompt → save to DB → appears in library | P0 |
| T2.4 | **Genie Mind** | Edit script → generate TTS → save voiceover → play back | P0 |
| T2.5 | **Genie Deck** | Create presentation → add slides → export | P1 |
| T2.6 | **Genie Cast** | Video generation pipeline → assembly → download | P1 |
| T2.7 | **AI Providers** | Test each provider responds (LLM, TTS, STT, video) | P0 |
| T2.8 | **4-Zone Routing** | Western/CJK/MENA/SEA routes to correct provider | P1 |
| T2.9 | **Transcreation** | Regional adaptation generates correct cultural traits | P1 |
| T2.10 | **Subscription/Stripe** | Checkout flow → webhook → tier upgrade (test mode) | P1 |
| T2.11 | **Credit System** | Purchase credits → use credits → balance decreases | P1 |
| T2.12 | **Offline Mode** | PWA installs, offline content loads | P2 |
| T2.13 | **Mobile Responsive** | 320px-1280px breakpoints | P1 |
| T2.14 | **Landing Pages** | All 14 regional landing pages render | P1 |
| T2.15 | **Environment Badge** | Shows "UAT" badge, no "DEV" or "PROD" | P2 |

### GATE 3: UAT → PROD (Go-Live)

| # | Gate | Owner | Status | Pass Criteria |
|---|------|-------|--------|---------------|
| G3.1 | **All UAT tests pass** | User | TODO | T2.1-T2.15 verified |
| G3.2 | **Create PROD Supabase project** | User | TODO | New project, new credentials |
| G3.3 | **Update environment-config.ts** | Claude | TODO | Replace PROD placeholders |
| G3.4 | **Apply migrations to PROD** | User | TODO | `supabase db push --project-ref PROD` |
| G3.5 | **Deploy edge functions to PROD** | User | TODO | All 202 functions |
| G3.6 | **Set PROD secrets (NEW keys)** | User | TODO | Separate billing keys |
| G3.7 | **Stripe LIVE mode keys** | User | TODO | Switch from test to live |
| G3.8 | **Google OAuth — PROD redirects** | User | TODO | Add prod callback URLs |
| G3.9 | **DNS — PROD domain** | User | TODO | `www.genieaisuite.com` resolves |
| G3.10 | **SSL verified** | User | TODO | HTTPS works on prod domain |
| G3.11 | **Smoke test on PROD** | User | TODO | Login + create content + save works |
| G3.12 | **Monitoring active** | User | TODO | Arize + LangWatch with PROD keys |
| G3.13 | **Error tracking** | User | TODO | Sentry or equivalent configured |
| G3.14 | **Backup strategy** | User | TODO | Supabase daily backups enabled |

---

## 8. MUSIC PROVIDER AUDIT

### Active Music Providers (Working)

| Provider | Edge Function | Status | Zone | Cost |
|----------|-------------|--------|------|------|
| **ElevenLabs** | `elevenlabs-music`, `elevenlabs-sfx` | Active, API key configured | Western, all | ~$0.24-0.30/clip |
| **Alibaba** | `multi-provider-music`, `multi-provider-sfx` | Active, API key configured | CJK, SEA | ~$0.01-0.03/clip |
| **ModelsLab** | `multi-provider-music`, `multi-provider-sfx` | Active, API key configured | Fallback all | ~$0.05-0.08/clip |

### Parked Providers (Not Implemented)

| Provider | Status | Reason | Action |
|----------|--------|--------|--------|
| **Google Lyria** | PARKED | Type reference only in `multi-provider-music/index.ts`. No actual API implementation. Lyria is a research model from DeepMind — not yet publicly available as a standalone API. | Remove from active provider list. Revisit when Google launches Lyria API publicly. |
| **Suno** | PARKED | Only mentioned in comments. No API integration, no key configured. | Add to future roadmap. Suno has a public API — could integrate when needed for premium music generation. |

### Music Provider Routing (Current)

```
multi-provider-music → priority order:
  1. ModelsLab (cheapest, global)
  2. Google Lyria (PARKED — not implemented)
  3. Alibaba (CJK/SEA)
  4. ElevenLabs (quality, Western)
```

### Recommendation
- **Keep:** ElevenLabs (quality), Alibaba (CJK cost), ModelsLab (budget fallback)
- **Park:** Google Lyria (no public API), Suno (future add)
- **Phase 7 action:** Clean up `multi-provider-music` to remove Lyria from active routing

---

## 9. DOCUMENT EXTRACTION & DOCUSIGN ASSESSMENT

### Document Extraction

| Question | Answer |
|----------|--------|
| **Any use case in GenieSuite?** | **NO.** Document extraction is 100% healthcare-side (insurance cards, prescriptions, enrollment forms). |
| **GenieSuite document features?** | `DocumentToScriptPanel` converts documents to VIDEO SCRIPTS — different purpose, no OCR needed. |
| **Azure Form Recognizer for GenieSuite?** | Not needed. Key is configured for healthcare. |
| **AWS Textract for GenieSuite?** | Not needed. Credentials pending for healthcare use only. |

### DocuSign

| Question | Answer |
|----------|--------|
| **Any use case in GenieSuite?** | **NO.** DocuSign is used only for healthcare (patient enrollment, consent forms, credit applications). |
| **Do we need it for GenieSuite?** | **No.** GenieSuite has no signature/contract/consent workflows. |
| **Current DocuSign status?** | Partially implemented (mock OAuth). 5 keys configured. Used by healthcare components only. |
| **Are we covered without it?** | **Yes.** GenieSuite subscription is handled by Stripe (checkout, portal, webhooks). No signatures needed. |

### Summary: Healthcare-Only Infrastructure (Do NOT wire to GenieSuite)

| Service | Healthcare | GenieSuite |
|---------|-----------|------------|
| Azure Form Recognizer | Yes (OCR) | No |
| AWS Textract | Yes (tables/forms) | No |
| DocuSign | Yes (enrollment/consent) | No |
| DeepSeek Vision | Yes (handwriting) | No |
| Medical Imaging CNN | Yes (radiology) | No |

---

## 10. LOVABLE CLOSURE & FULL TAKEOVER

### Decision: Close Lovable, Claude Owns EVERYTHING

Lovable completed 8/18 tasks (Days 1-2). **All remaining work + full landing page redesign** now owned by Claude.

### What Lovable Completed (Keep As-Is)

| Task | Description | Status |
|------|-------------|--------|
| L-101 | Audit RegionalLandingPage.tsx (14 regions) | Done |
| L-102 | Audit GenieExplorePage E2E | Done |
| L-103 | Fix hero sections and demos | Done |
| L-104 | Verify legal pages | Done |
| L-201 | GenieProductsPage product catalog | Done |
| L-202 | Fix pricing section | Done |
| L-203 | Verify explore demo pages | Done |
| L-204 | Add missing landing sections | Done |

### Remaining Lovable Tasks → Now Claude's

| Task | Description | Effort | Priority |
|------|-------------|--------|----------|
| L-301 | Fix interactive demos (STT, Try Genie) | 3h | High |
| L-302 | Fix DeepL translation demo | 2h | Medium |
| L-303 | Fix video showcases | 2h | High |
| L-304 | Verify region switching (14 regions) | 2h | Medium |
| L-401 | Mobile responsiveness polish | 3h | High |
| L-402 | SEO verification (meta tags, OG) | 2h | Medium |
| L-403 | Performance optimization (lazy loading) | 2h | Medium |
| L-404 | Cross-browser testing | 1h | Low |
| L-501 | Final route verification | 1h | High |
| L-502 | Landing → auth → studio navigation E2E | 1h | High |

### NEW: Landing Page Redesign (Claude-owned)

In addition to the 10 remaining tasks, Claude will redesign landing pages to reflect:
- All 206 master pipelines and actual capabilities
- Updated pricing tiers ($0/$19/$49/$99/$299/custom)
- Real product demos using working GenieSuite features
- 14 regional pages with actual transcreation examples
- 63 visual styles showcased
- 30 AI providers highlighted
- Updated product taglines and descriptions

**Files to take over (47 landing components + pages):**
- `src/components/landing/**` (47 files)
- `src/hooks/landing/**`
- `src/pages/GenieExplorePage.tsx`
- `src/pages/GenieExploreDemoPage.tsx`
- `src/pages/GenieProductsPage.tsx`
- `src/pages/GenieSupportPage.tsx`
- `src/config/regionalLandingConfig.ts`

### Territory Change Required

Update CLAUDE.md: Remove "Never Touch" restriction — Claude now owns ALL files.

### Execution Plan (Phase 7)
1. **Week 1:** L-301 to L-304 (fix demos, region switching)
2. **Week 1-2:** Landing page redesign with real data from 206 pipelines
3. **Week 2:** L-401 to L-404 (mobile, SEO, performance, cross-browser)
4. **Week 2:** L-501, L-502 (E2E verification — final step)

---

## 11. SCRIPT EDITOR PHASE 7 PLAN

### Current State (Working)

| Component | File | Status |
|-----------|------|--------|
| `ScriptEditorTab` | `src/components/genie-studio/ScriptEditorTab.tsx` (127KB) | Fully working in GenieMind |
| `SegmentedScriptEditor` | `src/components/genie-studio/segmented-editor/` | Working — per-segment editing + TTS |
| `ScriptEnhanceEditor` | `src/components/genie-admin/composition-studio/` | Working — AI enhancement |

### Phase 7 Script Editor Enhancements (Planned)

| Enhancement | Description | Priority |
|-------------|-------------|----------|
| MLR compliance markers | Flag medical/legal claims in script for review | P1 (if pharma target) |
| Version history | Script diff between versions, rollback | P2 |
| Collaborative editing | Real-time multi-user script editing | P3 (future) |
| Brand voice enforcement | AI checks script against brand guidelines | P2 |
| Transcreation preview | Side-by-side original vs transcreated script | P1 |
| Script templates by industry | Pre-built script structures for pharma, retail, etc. | P2 |

---

## 12. EXISTING PLANS VS PRODUCTION PLANS

### What We Planned (Original Sprint)

| Phase | Planned | Actual | Delta |
|-------|---------|--------|-------|
| P0 | Foundation + Auth | Done | On track |
| P1 | AI Provider Routing | Done | 206 master pipelines + 96 capability matrix + 141 IO specs + 39 pending = 419 unique concepts |
| P2 | Content Creation | Done | 63 visual styles, 30 AI providers, 19 capability types |
| P3 | Production Pipeline | Done | 226 service files, 203 edge functions |
| P4 | CREATE tab + Google Places | Not started | Deferred to Phase 7+ |
| P5 | PRODUCE tab | Partially done | Video timeline, A/V sync built |
| P6 | EDIT + MANAGE | Done | +teleprompter, +podcast EP04 |
| P7 | MLR + CRM | Not started | Planned |
| P8 | Analytics + Personalization | Not started | Planned |
| P9 | Business Intelligence | Done | Comprehensive BI doc created |
| P10 | Growth + GTM | Not started | Planned |
| P11 | Production Audit | **THIS DOC** | In progress |

### What Changed from Plan to Reality

1. **Phases 4-5 partially absorbed into P1-P3** — Google Places, video generation, TTS already working
2. **Phase 9 moved up** — Business intelligence needed before Phase 7 decisions
3. **Phase 11 created** — Production readiness audit needed before UAT
4. **Lovable tasks deferred** — 10 remaining tasks absorbed by Claude
5. **RBAC evaluation deferred** — User wants proper review, not rushed implementation
6. **Healthcare infrastructure separated** — DocuSign, document extraction, RBAC confirmed NOT for GenieSuite

### Production Priority Order

```
1. Phase 11 (THIS): Production audit + stage gates → Immediate
2. Phase 7: MLR + CRM + Lovable task absorption → Next
3. MERGE TO DEV: Get all code into dev branch → Blocked on user action
4. UAT DEPLOYMENT: Apply stage gates G1.1-G1.12 → After merge
5. UAT TESTING: Verify T2.1-T2.15 → After deployment
6. Phase 8: Analytics → After UAT stable
7. Phase 10: GTM → After PROD go-live
```

---

## 13. UAT CHECKLIST — WHAT TO VERIFY

### Pre-UAT (Infrastructure)

- [ ] Supabase UAT project has all migrations applied
- [ ] All 202 edge functions deployed to UAT
- [ ] All 73 API keys set as Supabase secrets in UAT
- [ ] Google OAuth redirect URIs include UAT Supabase callback + UAT domain
- [ ] Supabase Auth site URL = `https://geniestudiouat.genieaisuite.com`
- [ ] Storage buckets created: `generated-audio`, `genie-content`, `avatars`
- [ ] DNS resolves for `geniestudiouat.genieaisuite.com`
- [ ] SSL certificate active
- [ ] Environment badge shows "UAT"
- [ ] Stripe is in TEST mode (not live)

### UAT Functional Tests

- [ ] **Auth:** Google OAuth login → creates `genie_studio_users` record → redirects to `/genie-studio`
- [ ] **Auth:** Email/password signup → verification email sent → can login
- [ ] **Auth:** Sign out → session cleared → redirected to login
- [ ] **Spark:** Enter prompt → AI generates content → saved to DB → appears in library
- [ ] **Mind:** Open script → edit text → generate TTS → play audio → save voiceover
- [ ] **Mind:** Segmented editor → per-chapter TTS → batch generation
- [ ] **Deck:** Create presentation → add slides → reorder → export
- [ ] **Cast:** Generate video → assemble → download
- [ ] **AI Providers:** Gemini responds, OpenAI responds, Claude responds, ElevenLabs TTS works
- [ ] **4-Zone:** Western request → Gemini/Veo3, CJK request → Qwen/Wan2.6
- [ ] **Transcreation:** Select India region → Hindi TTS + cultural traits displayed
- [ ] **Subscription:** Click upgrade → Stripe checkout → webhook → tier changes
- [ ] **Credits:** Purchase credits → balance increases → use credits → balance decreases
- [ ] **PWA:** App installs on mobile → offline mode works
- [ ] **Landing:** All 14 regional pages render correctly
- [ ] **Navigation:** Landing → auth → genie-studio → spark/mind/deck → back

---

## 14. PRODUCTION GO-LIVE CHECKLIST

### Infrastructure

- [ ] PROD Supabase project created with new credentials
- [ ] `environment-config.ts` updated with PROD project ref + keys
- [ ] All migrations applied to PROD
- [ ] All edge functions deployed to PROD
- [ ] **SEPARATE** API keys set for PROD (not shared with DEV)
- [ ] Stripe switched to LIVE mode with live keys
- [ ] Google OAuth PROD redirect URIs configured
- [ ] DNS resolves for `www.genieaisuite.com`
- [ ] SSL certificate active
- [ ] CDN configured (Vercel edge network)
- [ ] Error monitoring active (Sentry or equivalent)
- [ ] ML observability active (Arize + LangWatch with PROD keys)
- [ ] Daily database backups enabled
- [ ] Rate limiting configured on edge functions

### Security

- [ ] All `.env` files excluded from git (verify `.gitignore`)
- [ ] No hardcoded secrets in source code
- [ ] CORS configured for PROD domain only
- [ ] RLS policies verified on all tables
- [ ] Service role key NOT exposed to frontend
- [ ] OAuth state parameter validated
- [ ] Content Security Policy headers set

### Performance

- [ ] Build size optimized (code splitting for large chunks)
- [ ] Images lazy loaded
- [ ] Service worker registered for PWA
- [ ] Lighthouse score > 80 on all pages
- [ ] Edge function cold starts < 3s

### Compliance

- [ ] Privacy policy page accessible
- [ ] Terms of service page accessible
- [ ] Cookie consent banner (if required by region)
- [ ] GDPR data export capability (if EU users)
- [ ] Data retention policy documented

---

## APPENDIX: QUICK REFERENCE — WHAT GOES WHERE

```
DEV (ithspbabhmdntioslfqe):
  - Branch: dev
  - Domain: geniestudiodev.genieaisuite.com
  - Stripe: TEST mode
  - API keys: Shared/dev keys OK
  - Debug: ON
  - Beta features: ON

UAT (epqsuaccpafjoqwtpajo):
  - Branch: uat
  - Domain: geniestudiouat.genieaisuite.com
  - Stripe: TEST mode
  - API keys: Same as DEV OK (or separate)
  - Debug: OFF
  - Beta features: ON

PROD (TBD):
  - Branch: main
  - Domain: www.genieaisuite.com
  - Stripe: LIVE mode
  - API keys: SEPARATE (new billing accounts)
  - Debug: OFF
  - Beta features: OFF
```

---

## 15. PHASE 7 — WHAT'S PENDING (After P1-P6 100%)

### Phase 1-6 Status: COMPLETE

All core GenieSuite functionality is built and working:
- 206 master marketing pipelines registered
- 203 edge functions deployed (DEV)
- 351 genie components built
- 63 visual styles, 30 AI providers, 4-zone routing
- Google OAuth + GenieSuite RBAC system
- Spark (create) → Mind (edit/TTS) → Deck (present) → Cast (produce/publish)
- Subscription tiers + credit system + Stripe integration
- PWA + offline mode
- 14 regional zones with transcreation

### Phase 7 Scope (What Needs to Be Done)

#### 7A. Landing Page Full Takeover & Redesign (Absorbed from Lovable)
| Task | Description | Priority |
|------|-------------|----------|
| Fix interactive demos (STT, Try Genie) | Wire real API calls | P0 |
| Fix DeepL translation demo | Connect to translation-service | P1 |
| Fix video showcases | Real video playback from pipeline output | P0 |
| Verify region switching (14 regions) | All regions render correctly | P1 |
| Landing page redesign | Update with real capabilities (206 pipelines, 63 styles, 30 providers) | P0 |
| Update pricing pages | New tiers ($0/$19/$49/$99/$299/custom) | P0 |
| Mobile responsiveness | 320px-1280px breakpoints | P1 |
| SEO meta tags + OG | Per-region meta, social sharing | P1 |
| Performance (lazy loading, code splitting) | Lighthouse > 80 | P2 |
| E2E navigation | Landing → auth → genie-studio verified | P1 |

#### 7B. Script Editor Enhancements
| Task | Description | Priority |
|------|-------------|----------|
| Transcreation preview | Side-by-side original vs adapted script | P1 |
| Brand voice enforcement | AI checks script against brand guidelines | P2 |
| Script templates by industry | Pre-built structures for pharma, retail, tech | P2 |
| Version history | Diff between versions, rollback | P2 |

#### 7C. RBAC Evaluation (User-Requested Proper Review)
| Task | Description | Priority |
|------|-------------|----------|
| Evaluate existing 11 GenieSuite roles | Are all needed? Too many? | P1 |
| Internal vs external user flows | Different dashboards/features | P1 |
| Environment-specific roles | Dev/UAT/Prod role differences | P2 |
| Role management UI | Admin panel for role assignment | P2 |

#### 7D. Orphaned Edge Function Wiring
| Task | Description | Priority |
|------|-------------|----------|
| Wire `social-publish` + OAuth functions | Multi-platform publish from Cast | P1 |
| Wire `calendar-sync` | Scheduling in Cast PUBLISH tab | P2 |
| Wire `analytics-dashboard` | Cross-platform analytics view | P1 |
| Wire `bulk-operations` | Batch generate/edit/publish | P2 |
| Wire `auto-thumbnail-generator` | Thumbnails in PRODUCE tab | P1 |
| Wire `ai-caption-generator` | Auto-captions in PRODUCE | P1 |
| Wire `viral-score-predictor` | Score before publish | P2 |
| Clean up `multi-provider-music` | Remove Google Lyria from routing | P1 |

#### 7E. Stage Gate Execution (Infrastructure)
| Task | Description | Owner |
|------|-------------|-------|
| Merge feature branch to dev | All P1-P6 code into dev | User (GitHub UI) |
| Apply migrations to UAT Supabase | `supabase db push` | User |
| Deploy edge functions to UAT | `supabase functions deploy` | User |
| Set API secrets in UAT | 58 GenieSuite keys | User |
| Configure Google OAuth for UAT | Add redirect URIs | User |
| UAT smoke test | Login + create + save + publish | Both |

### Phase 7 Priority Order

```
1. MERGE TO DEV (blocked on user action — merge PR)
2. Landing page redesign (P0 — user-facing, first impression)
3. Clean up music routing (remove Lyria, verify ElevenLabs/Alibaba/ModelsLab)
4. Wire orphaned edge functions (thumbnails, captions, analytics)
5. Script editor transcreation preview
6. RBAC evaluation (user-led review, Claude supports)
7. UAT deployment + testing (stage gates)
```

### What Is NOT In Phase 7

| Item | Reason | Where |
|------|--------|-------|
| DocuSign | Healthcare only, removed from GenieSuite | N/A |
| AWS Textract | Healthcare only, removed from GenieSuite | Healthcare side |
| Azure Form Recognizer | Healthcare only | Healthcare side |
| Google Lyria | No public API, parked | Future |
| Suno | Not integrated, parked | Future |
| MLR Compliance | Deferred until pharma customers | Phase 8+ |
| Veeva/Salesforce CRM | Deferred until enterprise pipeline | Phase 8+ |
| Collaborative editing | Future feature | Phase 10+ |
| Live streaming | Future feature | Phase 10+ |
