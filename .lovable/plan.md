

# Landing Page Critical Fix and Enhancement Plan

## Current State

The landing page at `/genie-landing/nam` is **stuck on "Loading..."** due to build errors in `useCastAnalytics.ts` that prevent the entire app from compiling. Beyond that critical blocker, there are 12 specific improvements needed across the page sections.

## Phase 0: Fix Build Errors (Blocker)

The file `src/hooks/useCastAnalytics.ts` queries columns that don't exist in the database:

| Query Column Used | Actual DB Column | Table |
|---|---|---|
| `language` | `language_code` | `landing_page_videos` |
| `credits_used` | `credits_amount` | `ai_credit_transactions` |
| `feature_type` | `feature_used` | `ai_credit_transactions` |
| `metadata` | `feature_metadata` | `ai_credit_transactions` |

Fix: Update all `.select()` calls and property references to use the correct column names.

---

## Phase 1: Provider Ribbon - Increase Logo Size

**Current:** Provider logos are `w-5 h-5` (20px) -- too tiny to see brand identity.

**Fix in `ProviderRibbon` component (RegionalLandingPage.tsx, line ~266-270):**
- Increase logo images from `w-5 h-5` to `w-10 h-10` (40px)
- Increase label text from `text-xs` to `text-sm`
- Increase capability text from `text-[10px]` to `text-xs`
- Increase pill padding from `px-4 py-2` to `px-5 py-3`
- Add a subtle white border glow on hover for better visibility

---

## Phase 2: Pipeline Visual - Make 8-Step and Responsive

**Current:** 6 steps (Ideation, Script, Voice, Video, 3D/Avatar, Distribute). Missing Translation and Review steps.

**Fix in `PIPELINE_STEPS` and `CinematicPipeline` (lines ~332-390):**
- Expand to 8 steps: Ideation -> Script -> Voice -> Video -> 3D/Avatar -> Translation -> Review -> Distribute
- Add `Languages` icon for Translation step with provider "140+ Lang"
- Add `Shield` icon for Review step with provider "AI QA"
- Make steps wrap properly on mobile (currently `flex-wrap` is set but arrows hide on mobile -- show vertical flow instead)

---

## Phase 3: Metrics Consistency

**Current `LANDING_METRICS` (line ~1107):**
```
regions: 16, subRegions: 56, languages: '140+', dialects: '50+',
aiProviders: 19, pipelines: 206, industries: '50+'
```

**Issues:**
- `regions: 16` but `REGION_HIERARCHY` has varying counts -- should match the 17 RegionSlug types
- `subRegions: 56` but implementation says 62+ sub-regions
- Missing metrics: `formats: 16` (after Phase 1 registry expansion), `blueprints: 441`, `chains: 35`

**Fix:** Update to match implemented values and add missing metrics used across sections.

---

## Phase 4: Hero Section - Stronger Hook, Problem, and Solutions

**Current:** Hero has 4 slides (platform, pipeline, language, transcreation). The hook is decent but doesn't call out industry pain points strongly enough.

**Enhancement to slide descriptions (lines ~638-670):**
- **Slide 1 (Platform):** Add problem statement: "Agencies charge $50K+ and take months. AI tools give you robot-sounding content. Genie Suite does both -- quality AND speed."
- **Slide 2 (Pipeline):** Add industry challenge: "Your competitors are already producing 10x more content. Every day without automation is market share lost."
- **Slide 3 (Language):** Strengthen with: "68% of consumers won't buy if content isn't in their language. Translation isn't enough -- transcreation is the difference."
- **Slide 4 (Transcreation):** Add ROI hook: "Brands using transcreation see 3x higher engagement vs translation-only campaigns."

---

## Phase 5: Universal Enrichment Integration

**Current:** The landing page does NOT use `useUniversalEnrichment`. Content is hardcoded in `regionalLandingConfig.ts`.

**Enhancement:** Wire `useUniversalEnrichment` into the landing page so that when a user selects a product context via `?product=spark`, the enrichment data (brand, audience, messaging) dynamically updates:
- Hero messaging adapts to product positioning
- Industry showcases prioritize industries relevant to the product
- CTA text reflects product-specific value props

Add to `RegionalLandingPage` main component:
- Import and call `useUniversalEnrichment` with product context from URL params
- Merge enrichment messaging into hero slides when available
- Fall back to hardcoded config when no product context

---

## Phase 6: Output Format Showcase (Video, Podcast, PPT, Social)

**Current:** The page mentions video heavily but doesn't showcase other output formats.

**Add new section between Products and Industry Showcases:**
- "What You Can Create" section showing 6 format cards:
  - Video (Explainer, Social Short, Brand Anthem)
  - Podcast (Expert Interview, Audio Drama)
  - Presentation (Investor Pitch, Sales Deck)
  - Website (Landing Page, Microsite)
  - Social (Instagram Reel, LinkedIn Post, TikTok)
  - Document (Whitepaper, Case Study)
- Each card shows: format icon, 2-3 sub-formats, "Powered by" pipeline badge
- Links to sign up to try each format

---

## Phase 7: Social Connectivity Section

**Current:** No social media links, community, or social proof section.

**Add new section after DogfoodingProof:**
- Social links row (LinkedIn, Twitter/X, YouTube, Discord, Instagram)
- "Join the Community" CTA
- Newsletter subscribe form with email input + "Subscribe" button (stores in DB, does NOT process payment)
- Social proof: "Trusted by teams at..." with placeholder logos

---

## Phase 8: Newsletter/Register Section

**Current:** CTA footer only has "Start Creating Free" and "Schedule Demo" -- no email capture.

**Add to `RegionalCTAFooter` (lines ~1316-1382):**
- Email input field with "Get Early Access" / "Subscribe for Updates" button
- Small text: "No spam. Unsubscribe anytime. Regional content updates."
- Store email in a `newsletter_subscribers` table (or existing leads table)
- Note: Pricing and payment integration is on hold per user instruction

---

## Phase 9: SEO Improvements

**Current SEO is good but missing:**
- No `<meta name="theme-color">` tag
- No FAQ structured data (FAQPage schema)
- No BreadcrumbList schema
- Product section has no `itemscope` markup

**Fix in `RegionalSEOHead`:**
- Add theme-color meta tag
- Add FAQ structured data with 3-4 common questions
- Add BreadcrumbList: Home > Genie Landing > {Region}
- Ensure all images have descriptive alt text (some just say "Genie Suite")

---

## Phase 10: CTA Differentiation

**Current:** Primary and secondary CTAs look similar in weight.

**Fix:**
- Primary CTA: Keep gradient button style, add animated pulse ring
- Secondary CTA: Change to outline with play icon for "See It In Action" -- link to a product demo video section (anchor to #products)
- Add tertiary CTA: "Schedule a Demo" as a text link with calendar icon

---

## Phase 11: Navbar Enhancement

**Current navbar (lines ~1387-1448):** Only has Products, Pricing, Explore, Region Switcher, and primary CTA.

**Add:**
- "Formats" link (anchor to new format showcase section)
- "Industries" link (anchor to industry showcases)
- "Community" link (anchor to social section)
- Mobile menu should include all links

---

## Implementation Order

| Step | What | Impact |
|------|------|--------|
| 1 | Fix `useCastAnalytics.ts` build errors | Unblocks entire app |
| 2 | Increase provider ribbon logo sizes | Visual impact, quick win |
| 3 | Update `LANDING_METRICS` to consistent values | Data accuracy |
| 4 | Expand pipeline visual to 8 steps | Completeness |
| 5 | Strengthen hero hook/problem/solution copy | Conversion |
| 6 | Add output format showcase section | Feature visibility |
| 7 | Add social connectivity + subscribe section | Engagement |
| 8 | Wire Universal Enrichment for dynamic messaging | Dynamic content |
| 9 | SEO improvements | Discoverability |
| 10 | CTA and navbar enhancements | Navigation + conversion |

## Files Changed

| File | Change |
|------|--------|
| `src/hooks/useCastAnalytics.ts` | Fix column names (language->language_code, credits_used->credits_amount, etc.) |
| `src/components/landing/RegionalLandingPage.tsx` | Provider ribbon sizes, pipeline steps, metrics, hero copy, CTA, navbar, new sections |
| `src/components/landing/OutputFormatShowcase.tsx` | New component for format cards |
| `src/components/landing/SocialConnectSection.tsx` | New component for social + subscribe |

## What We Do NOT Change
- No pricing or payment implementation (on hold per user)
- No new edge functions (reuse existing)
- No changes to the compliance gate logic
- No changes to the product showcase component (already comprehensive)
