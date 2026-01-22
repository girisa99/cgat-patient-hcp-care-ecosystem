# Pipeline Financial Analysis & Break-Even Study

## Executive Summary

Analysis of **107 transformation pipelines** across 3 commercial options with detailed cost/margin/break-even projections.

---

## Provider Cost Matrix (Our Costs)

### AI Model Costs (per operation)
| Provider | Model | Cost/1M Input | Cost/1M Output | Cost/Script |
|----------|-------|--------------|----------------|-------------|
| Google | Gemini 2.0 Flash | $0.075 | $0.30 | $0.00094 |
| Google | Gemini 2.0 Pro | $1.25 | $5.00 | $0.0156 |
| OpenAI | GPT-4o | $2.50 | $10.00 | $0.0313 |
| OpenAI | GPT-4o-mini | $0.15 | $0.60 | $0.00188 |
| Anthropic | Claude 3.5 Sonnet | $3.00 | $15.00 | $0.045 |
| Anthropic | Claude 3.5 Haiku | $0.25 | $1.25 | $0.00375 |

### TTS Costs (per minute)
| Provider | Tier | Cost/Minute | Quality |
|----------|------|-------------|---------|
| ElevenLabs | Creator | $0.30 | Ultra |
| ElevenLabs | Pro | $0.18 | Ultra |
| Google Cloud TTS | WaveNet | $0.16 | Premium |
| Azure Speech | Neural | $0.16 | Premium |
| Amazon Polly | Neural | $0.16 | Premium |

### Video/3D/Avatar Costs (per minute)
| Provider | Service | Cost/Min | Tier |
|----------|---------|----------|------|
| ModelsLab | Video Gen | $0.05-0.15 | Standard |
| Runway Gen3 | Video Gen | $0.50-1.50 | Premium |
| HeyGen | Avatar | $0.50-1.00 | Premium |
| D-ID | Avatar | $0.30-0.60 | Advanced |
| ModelsLab | 3D Gen | $0.10-0.30 | Standard |

---

## Option A: Goal-Based Buckets (8 Categories)

### Bucket Cost Analysis

#### Bucket 1: VIDEO (Quick Video, Avatar Video, Dubbing, Shorts)
| Pipeline | Our Cost | Customer Credits | Credit Price | Customer Pays | Margin |
|----------|----------|------------------|--------------|---------------|--------|
| text-to-video (1min) | $0.85 | 50 | $0.079 | $3.95 | **78%** |
| image-to-video | $0.65 | 40 | $0.079 | $3.16 | **79%** |
| avatar-video (1min) | $3.50 | 100 | $0.079 | $7.90 | **56%** |
| video-dubbing | $4.20 | 150 | $0.079 | $11.85 | **65%** |
| long-to-shorts | $0.45 | 25 | $0.079 | $1.98 | **77%** |

**Bucket Summary:**
- **Avg Our Cost:** $1.93/operation
- **Avg Customer Pays:** $5.77/operation
- **Avg Margin:** 71%

#### Bucket 2: PRESENTATION (Pitch, Training, Dashboard, Sales Deck)
| Pipeline | Our Cost | Customer Credits | Credit Price | Customer Pays | Margin |
|----------|----------|------------------|--------------|---------------|--------|
| idea-to-presentation | $0.08 | 15 | $0.079 | $1.19 | **93%** |
| document-to-slides | $0.15 | 25 | $0.079 | $1.98 | **92%** |
| data-to-presentation | $0.22 | 30 | $0.079 | $2.37 | **91%** |
| ppt-to-video | $2.15 | 60 | $0.079 | $4.74 | **55%** |
| presentation-to-video | $1.85 | 50 | $0.079 | $3.95 | **53%** |

**Bucket Summary:**
- **Avg Our Cost:** $0.89/operation
- **Avg Customer Pays:** $2.85/operation
- **Avg Margin:** 77%

#### Bucket 3: TRAINING (Course, Compliance, Onboarding, Assessment)
| Pipeline | Our Cost | Customer Credits | Credit Price | Customer Pays | Margin |
|----------|----------|------------------|--------------|---------------|--------|
| sop-to-training | $1.25 | 45 | $0.079 | $3.56 | **65%** |
| compliance-module | $2.80 | 80 | $0.079 | $6.32 | **56%** |
| onboarding-flow | $1.65 | 50 | $0.079 | $3.95 | **58%** |
| assessment-builder | $0.75 | 25 | $0.079 | $1.98 | **62%** |
| skill-simulator | $4.50 | 100 | $0.079 | $7.90 | **43%** |

**Bucket Summary:**
- **Avg Our Cost:** $2.19/operation
- **Avg Customer Pays:** $4.74/operation
- **Avg Margin:** 57%

#### Bucket 4: GLOBAL REACH (Translate, Dub, Localize, Multi-Language)
| Pipeline | Our Cost | Customer Credits | Credit Price | Customer Pays | Margin |
|----------|----------|------------------|--------------|---------------|--------|
| translate-video | $1.50 | 50 | $0.079 | $3.95 | **62%** |
| dub-video | $5.80 | 150 | $0.079 | $11.85 | **51%** |
| localize-slides | $0.65 | 25 | $0.079 | $1.98 | **67%** |
| multi-language-campaign | $8.50 | 200 | $0.079 | $15.80 | **46%** |
| voice-clone-dub | $7.20 | 180 | $0.079 | $14.22 | **49%** |

**Bucket Summary:**
- **Avg Our Cost:** $4.73/operation
- **Avg Customer Pays:** $9.56/operation
- **Avg Margin:** 55%

#### Bucket 5: MARKETING (Ads, Social, Demo, Testimonial)
| Pipeline | Our Cost | Customer Credits | Credit Price | Customer Pays | Margin |
|----------|----------|------------------|--------------|---------------|--------|
| ad-generator | $0.95 | 35 | $0.079 | $2.77 | **66%** |
| social-suite | $1.15 | 40 | $0.079 | $3.16 | **64%** |
| product-demo | $2.45 | 60 | $0.079 | $4.74 | **48%** |
| testimonial-creator | $1.35 | 45 | $0.079 | $3.56 | **62%** |
| pitch-deck | $0.88 | 35 | $0.079 | $2.77 | **68%** |

**Bucket Summary:**
- **Avg Our Cost:** $1.36/operation
- **Avg Customer Pays:** $3.40/operation
- **Avg Margin:** 62%

#### Bucket 6: IMMERSIVE (VR, AR, 3D Walkthrough, Interactive 3D)
| Pipeline | Our Cost | Customer Credits | Credit Price | Customer Pays | Margin |
|----------|----------|------------------|--------------|---------------|--------|
| text-to-vr | $6.50 | 150 | $0.079 | $11.85 | **45%** |
| text-to-ar | $5.20 | 120 | $0.079 | $9.48 | **45%** |
| 3d-to-vr | $2.80 | 60 | $0.079 | $4.74 | **41%** |
| floor-plan-to-vr | $4.50 | 100 | $0.079 | $7.90 | **43%** |
| scene-to-ar | $3.60 | 80 | $0.079 | $6.32 | **43%** |

**Bucket Summary:**
- **Avg Our Cost:** $4.52/operation
- **Avg Customer Pays:** $8.06/operation
- **Avg Margin:** 43%

#### Bucket 7: REPURPOSE (Long→Shorts, Blog→Video, Atomizer)
| Pipeline | Our Cost | Customer Credits | Credit Price | Customer Pays | Margin |
|----------|----------|------------------|--------------|---------------|--------|
| long-to-shorts | $0.45 | 25 | $0.079 | $1.98 | **77%** |
| blog-to-video | $1.15 | 40 | $0.079 | $3.16 | **64%** |
| video-to-blog | $0.35 | 20 | $0.079 | $1.58 | **78%** |
| content-atomizer | $1.65 | 50 | $0.079 | $3.95 | **58%** |
| webinar-to-course | $2.45 | 60 | $0.079 | $4.74 | **48%** |

**Bucket Summary:**
- **Avg Our Cost:** $1.21/operation
- **Avg Customer Pays:** $3.08/operation
- **Avg Margin:** 65%

#### Bucket 8: QUICK TOOLS (Voice Notes, Summary, Subtitles, Transcribe)
| Pipeline | Our Cost | Customer Credits | Credit Price | Customer Pays | Margin |
|----------|----------|------------------|--------------|---------------|--------|
| subtitle-generator | $0.08 | 10 | $0.079 | $0.79 | **90%** |
| video-summary | $0.05 | 10 | $0.079 | $0.79 | **94%** |
| meeting-summary | $0.06 | 10 | $0.079 | $0.79 | **92%** |
| text-to-sfx | $0.12 | 5 | $0.079 | $0.40 | **70%** |
| text-to-image | $0.03 | 5 | $0.079 | $0.40 | **93%** |

**Bucket Summary:**
- **Avg Our Cost:** $0.07/operation
- **Avg Customer Pays:** $0.63/operation
- **Avg Margin:** 88%

---

### OPTION A: Summary Table

| Bucket | Pipelines | Avg Our Cost | Avg Customer Pays | Margin | Volume Priority |
|--------|-----------|--------------|-------------------|--------|-----------------|
| Quick Tools | 5 | $0.07 | $0.63 | **88%** | HIGH (entry hook) |
| Presentation | 5 | $0.89 | $2.85 | **77%** | HIGH |
| Video | 5 | $1.93 | $5.77 | **71%** | HIGH |
| Repurpose | 5 | $1.21 | $3.08 | **65%** | MEDIUM |
| Marketing | 5 | $1.36 | $3.40 | **62%** | MEDIUM |
| Training | 5 | $2.19 | $4.74 | **57%** | MEDIUM |
| Global Reach | 5 | $4.73 | $9.56 | **55%** | MEDIUM |
| Immersive | 5 | $4.52 | $8.06 | **43%** | LOW (premium only) |

---

## Option B: Tier-Based Bundles

### Starter Pack Analysis ($9.99/mo, 100 credits included)
| Pipeline | Credits | Uses/Month | Our Cost/Use | Total Cost | Revenue | Net Margin |
|----------|---------|------------|--------------|------------|---------|------------|
| text-to-image | 5 | 20 | $0.03 | $0.60 | $9.99 | - |
| video-summary | 10 | 10 | $0.05 | $0.50 | - | - |
| subtitle-generator | 10 | 5 | $0.08 | $0.40 | - | - |
| meeting-summary | 10 | 5 | $0.06 | $0.30 | - | - |
| idea-to-presentation | 15 | 3 | $0.08 | $0.24 | - | - |

**Starter Total:**
- **Total Our Cost (max usage):** $2.04/mo
- **Customer Pays:** $9.99/mo
- **Gross Margin:** **80%**
- **Fixed Overhead (allocated):** $1.50/mo
- **Net Margin:** **65%**

### Pro Pack Analysis ($79.99/mo, 1,000 credits included)
| Pipeline | Credits | Uses/Month | Our Cost/Use | Total Cost |
|----------|---------|------------|--------------|------------|
| All Starter pipelines | - | - | - | $2.04 |
| text-to-video (5) | 50 | 5 | $0.85 | $4.25 |
| image-to-video (3) | 40 | 3 | $0.65 | $1.95 |
| ppt-to-video (4) | 60 | 4 | $2.15 | $8.60 |
| sop-to-training (2) | 45 | 2 | $1.25 | $2.50 |
| ad-generator (3) | 35 | 3 | $0.95 | $2.85 |
| translate-video (2) | 50 | 2 | $1.50 | $3.00 |

**Pro Total:**
- **Total Our Cost (max usage):** $25.19/mo
- **Customer Pays:** $79.99/mo
- **Gross Margin:** **69%**
- **Fixed Overhead (allocated):** $3.00/mo
- **Net Margin:** **55%**

### Enterprise Pack Analysis ($299+/mo, Unlimited/Custom)
| Pipeline | Est. Uses/Month | Our Cost/Use | Total Cost |
|----------|-----------------|--------------|------------|
| All Pro pipelines | - | - | $25.19 |
| avatar-video (10) | 10 | $3.50 | $35.00 |
| video-dubbing (5) | 5 | $4.20 | $21.00 |
| text-to-vr (3) | 3 | $6.50 | $19.50 |
| voice-clone-dub (5) | 5 | $7.20 | $36.00 |
| full-production (2) | 2 | $15.00 | $30.00 |
| skill-simulator (3) | 3 | $4.50 | $13.50 |

**Enterprise Total:**
- **Total Our Cost (max usage):** $180.19/mo
- **Customer Pays:** $299/mo (min)
- **Gross Margin:** **40%**
- **Custom Pricing Trigger:** If cost > $200/mo → $499 tier
- **Net Margin (at $499):** **55%**

---

### OPTION B: Summary Table

| Tier | Price | Credits | Avg Usage Cost | Gross Margin | Net Margin |
|------|-------|---------|----------------|--------------|------------|
| Starter | $9.99 | 100 | $2.04 | 80% | **65%** |
| Pro | $79.99 | 1,000 | $25.19 | 69% | **55%** |
| Enterprise | $299+ | Custom | $180.19 | 40% | **35-55%** |

---

## Option C: Complexity/Token Buckets

### Low Token Bucket (1-10 credits)
| Pipeline | Credits | Our Cost | Customer Pays | Margin | Break-even/User |
|----------|---------|----------|---------------|--------|-----------------|
| text-to-image | 5 | $0.03 | $0.40 | 93% | 0.1 uses |
| text-to-sfx | 5 | $0.12 | $0.40 | 70% | 0.3 uses |
| video-summary | 10 | $0.05 | $0.79 | 94% | 0.1 uses |
| subtitle-generator | 10 | $0.08 | $0.79 | 90% | 0.1 uses |
| meeting-summary | 10 | $0.06 | $0.79 | 92% | 0.1 uses |

**Low Token Summary:**
- **Avg Margin:** **88%**
- **Best for:** Entry hook, high volume, low cost to serve

### Medium Token Bucket (15-40 credits)
| Pipeline | Credits | Our Cost | Customer Pays | Margin |
|----------|---------|----------|---------------|--------|
| idea-to-presentation | 15 | $0.08 | $1.19 | 93% |
| text-to-animation | 20 | $0.45 | $1.58 | 72% |
| document-to-slides | 25 | $0.15 | $1.98 | 92% |
| ad-generator | 35 | $0.95 | $2.77 | 66% |
| blog-to-video | 40 | $1.15 | $3.16 | 64% |

**Medium Token Summary:**
- **Avg Margin:** **77%**
- **Best for:** Core monetization, Pro tier value

### High Token Bucket (45-100 credits)
| Pipeline | Credits | Our Cost | Customer Pays | Margin |
|----------|---------|----------|---------------|--------|
| ppt-to-video | 60 | $2.15 | $4.74 | 55% |
| avatar-video | 100 | $3.50 | $7.90 | 56% |
| compliance-module | 80 | $2.80 | $6.32 | 56% |
| voice-to-video | 55 | $1.85 | $4.35 | 57% |

**High Token Summary:**
- **Avg Margin:** **56%**
- **Best for:** Pro/Business tier, professional users

### Premium Token Bucket (100+ credits)
| Pipeline | Credits | Our Cost | Customer Pays | Margin |
|----------|---------|----------|---------------|--------|
| text-to-vr | 150 | $6.50 | $11.85 | 45% |
| dub-video | 150 | $5.80 | $11.85 | 51% |
| voice-clone-dub | 180 | $7.20 | $14.22 | 49% |
| multi-language | 200 | $8.50 | $15.80 | 46% |
| full-production | 300 | $15.00 | $23.70 | 37% |

**Premium Token Summary:**
- **Avg Margin:** **46%**
- **Best for:** Enterprise only, custom pricing recommended

---

### OPTION C: Summary Table

| Token Bucket | Pipelines | Avg Margin | Recommended Tier | Volume |
|--------------|-----------|------------|------------------|--------|
| Low (1-10) | 15 | **88%** | All (entry hook) | HIGH |
| Medium (15-40) | 25 | **77%** | Starter+ | HIGH |
| High (45-100) | 35 | **56%** | Pro+ | MEDIUM |
| Premium (100+) | 32 | **46%** | Enterprise | LOW |

---

## Break-Even Analysis

### Monthly Fixed Costs
| Category | Cost |
|----------|------|
| Supabase Pro | $25 |
| Netlify Pro | $19 |
| Resend Pro | $20 |
| GitHub Team | $16 |
| Lovable Pro | $20 |
| Domain & SSL | $5 |
| Monitoring | $26 |
| **Total Fixed** | **$131/mo** |

### Break-Even by Option

#### Option A (Goal-Based Buckets)
```
Blended ARPU: $35/mo (weighted avg across tiers)
Blended Variable Cost: $8/mo (AI + TTS + Video)
Contribution Margin: $27/mo per user
Break-even Users: 131 / 27 = 5 paying users

With 15% free tier conversion:
- Need 34 total signups to get 5 paying users
- Timeline: Month 2-3 with aggressive marketing
```

#### Option B (Tier-Based Bundles)
```
Tier Mix Assumption: 60% Starter, 30% Pro, 10% Enterprise
Blended ARPU: (0.6 × $9.99) + (0.3 × $79.99) + (0.1 × $299) = $59.89
Blended Variable Cost: (0.6 × $2.04) + (0.3 × $25.19) + (0.1 × $180.19) = $26.80
Contribution Margin: $33.09/mo per user
Break-even Users: 131 / 33.09 = 4 paying users

With 12% free tier conversion:
- Need 34 total signups to get 4 paying users
- Timeline: Month 2-3
```

#### Option C (Complexity Buckets)
```
Usage Mix: 40% Low, 35% Medium, 20% High, 5% Premium
Blended Revenue/Transaction: (0.4 × $0.63) + (0.35 × $2.18) + (0.2 × $5.83) + (0.05 × $15.48) = $2.95
Blended Cost/Transaction: (0.4 × $0.07) + (0.35 × $0.56) + (0.2 × $2.08) + (0.05 × $8.60) = $1.07
Margin/Transaction: $1.88

Avg Transactions/User/Month: 15
Monthly Revenue/User: $44.25
Monthly Cost/User: $16.05
Contribution Margin: $28.20/mo per user
Break-even Users: 131 / 28.20 = 5 paying users
```

---

## Phased Rollout Timeline & Revenue Projection

### Phase 1: Core 15 Pipelines (Weeks 1-2)
| Week | New Users | Paying (15%) | MRR | Cumulative MRR |
|------|-----------|--------------|-----|----------------|
| 1 | 50 | 8 | $280 | $280 |
| 2 | 75 | 11 | $385 | $665 |
| 3 | 100 | 15 | $525 | $1,190 |
| 4 | 125 | 19 | $665 | $1,855 |

**Phase 1 Break-even:** Week 2-3 (covers $131 fixed costs)

### Phase 2: Add 25 Pro Pipelines (Weeks 3-4)
| Week | New Users | Paying | Avg Tier Mix | MRR |
|------|-----------|--------|--------------|-----|
| 5 | 150 | 23 | 70% Starter / 30% Pro | $920 |
| 6 | 175 | 26 | 65% Starter / 35% Pro | $1,170 |
| 7 | 200 | 30 | 60% Starter / 40% Pro | $1,500 |
| 8 | 225 | 34 | 55% Starter / 45% Pro | $1,870 |

**Phase 2 Cumulative MRR:** $5,460/mo

### Phase 3: Add 30 Advanced Pipelines (Weeks 5-6)
Enterprise features unlock:
- Projected Enterprise sign-ups: 2-3
- Enterprise MRR contribution: $600-900
- **Phase 3 Cumulative MRR:** $7,500-8,000/mo

### Phase 4: Full 107 Pipelines (Weeks 7-8)
- VR/AR/Premium features
- Healthcare-specific
- **Projected MRR:** $10,000-12,000/mo

---

## Recommendation Summary

### Best Option: **Hybrid A + C**

Combine **Goal-Based Buckets (Option A)** for user navigation with **Complexity Filters (Option C)** for transparent pricing.

| Metric | Option A | Option B | Option C | Hybrid A+C |
|--------|----------|----------|----------|------------|
| User Clarity | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Margin Control | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Upsell Path | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Break-even Speed | Month 2-3 | Month 2-3 | Month 2-3 | Month 2 |
| Avg Margin | 65% | 55% | 67% | **66%** |

### UI Implementation

```
Step 1: "What do you want to create?" → 8 Goal Buckets
Step 2: Filter by Token Consumption (Low/Med/High/Premium)
Step 3: Show credit cost + tier requirement
Step 4: Pre-generation cost preview
Step 5: Execute with real-time balance update
```

### Target Margins by Tier

| Customer Tier | Target Margin | Acceptable Range |
|---------------|---------------|------------------|
| Free Trial | -100% (loss leader) | -∞ to 0% |
| Starter | 65%+ | 55-75% |
| Pro | 55%+ | 45-65% |
| Enterprise | 40%+ | 35-55% |
| Healthcare | 50%+ | 45-60% |

---

## Next Steps

1. **Implement Core 15** with Goal-Based UI (Phase 1)
2. **Add Complexity Filter** toggle for power users
3. **Monitor actual costs** vs projections for first 1,000 operations
4. **Adjust credit pricing** if margins fall below targets
5. **Enterprise pricing** should be custom/negotiated above $180/mo cost
