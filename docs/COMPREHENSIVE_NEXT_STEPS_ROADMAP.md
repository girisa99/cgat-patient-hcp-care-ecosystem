# Comprehensive Next Steps Roadmap
**Created:** 2026-01-23 | **Status:** Active Planning Document

---

## 📊 Executive Summary

### Current State Assessment

| Area | Status | Completion |
|------|--------|------------|
| **Infrastructure (P0-P2)** | ✅ Complete | 100% |
| **AI Pipelines** | ✅ Operational | 92% (100+ of 110) |
| **12 Core Providers** | ✅ Integrated | 100% |
| **Mobile Components** | ✅ Mostly Complete | 82% |
| **P3 Features** | ✅ Built | 90% |
| **6-Tier Pricing System** | ✅ Implemented | 100% |
| **User Onboarding/Segmentation** | ❌ Critical Gap | 0% |
| **Stripe Integration** | ⚠️ Partial | 40% |
| **Production API Upgrades** | ⚠️ Pending | 20% |

---

## 🚨 CRITICAL PATH (Must Complete Before Launch)

### Priority 1: User Segmentation & Onboarding (Week 1-2)
**Status:** ❌ NOT STARTED | **Impact:** BLOCKING

The registration flow does NOT capture user segments, preventing:
- Proper tier assignment
- Feature gating
- Credit allocation
- Analytics segmentation

**Tasks:**
| Task | Effort | Dependencies |
|------|--------|--------------|
| Add segment selection to email signup | 2 days | None |
| Add segment selection post-OAuth | 1 day | None |
| Update `profiles` table with segment | 0.5 days | Migration |
| Create segment → tier mapping logic | 1 day | None |
| Add onboarding wizard UI (3-4 screens) | 3 days | Design |
| Enforce feature gates per segment | 2 days | Segment logic |

**Deliverable:** User sees segment selection → tier comparison → feature preview during signup

---

### Priority 2: Stripe Integration & Billing (Week 2-3)
**Status:** ⚠️ PARTIAL | **Impact:** BLOCKING

Current state: 6-tier pricing defined in code, but NOT connected to Stripe.

**Tasks:**
| Task | Effort | Dependencies |
|------|--------|--------------|
| Create 6 Stripe Products (Free→Enterprise) | 1 day | Stripe account |
| Create Monthly + Yearly Prices | 0.5 days | Products |
| Wire `checkout-session` edge function | 1 day | Prices |
| Wire `stripe-webhook` for subscription updates | 2 days | None |
| Add `user_subscriptions` table | 0.5 days | Migration |
| Create billing portal integration | 1 day | Webhook |
| Add credit purchase flow (top-ups) | 2 days | Webhook |
| Implement usage metering for credits | 3 days | Credit system |

**Deliverable:** Users can subscribe, upgrade, downgrade, and purchase credit top-ups

---

### Priority 3: Production API Upgrades (Week 3)
**Status:** ❌ NOT STARTED | **Impact:** HIGH

Before go-live, these APIs MUST be upgraded:

| API | Current State | Required Action | Priority |
|-----|---------------|-----------------|----------|
| Gemini | v1beta endpoint | Switch to v1 production | Critical |
| DocuSign | Demo environment | Upgrade to production | Critical |
| Label Studio | localhost | Deploy production instance | High |
| Resend | Free tier (3k/mo) | Upgrade to Pro (50k/mo) | High |
| Stripe | Test mode | Switch to live keys | Critical |

**Tasks:**
| Task | Effort |
|------|--------|
| Upgrade Gemini API endpoint | 0.5 days |
| Configure production DocuSign | 1 day |
| Deploy Label Studio (or defer) | 2 days |
| Upgrade Resend tier | 0.5 days |
| Switch Stripe to live mode | 0.5 days |

---

## 📋 SECONDARY PRIORITIES (Weeks 4-8)

### Priority 4: Phased Pipeline Rollout (Per Strategy)
**Status:** ✅ Planned | **Reference:** `docs/PIPELINE_COMMERCIAL_ORGANIZATION.md`

| Phase | Pipelines | Target Regions | Timeline |
|-------|-----------|----------------|----------|
| Phase 1 | 15 Core (Quick Tools, Presentation) | India, SEA, LatAm | Weeks 1-2 |
| Phase 2 | +25 Pro (Video, Training) | MEA, CJK | Weeks 3-4 |
| Phase 3 | +30 Advanced (Marketing, Global) | Europe | Weeks 5-6 |
| Phase 4 | +17 Enterprise (Compliance, SSO) | US/Canada | Weeks 7-8 |

**VR/AR Status:** Deferred 6-8 months per strategy decision

---

### Priority 5: Compliance & Legal Features (Weeks 5-6)
**Status:** ⏳ PENDING

| Feature | Segment | Effort |
|---------|---------|--------|
| Copyright Detection | All | 2 days |
| HIPAA Compliance Check | Healthcare | 3 days |
| GDPR Data Compliance | Enterprise/EU | 2 days |
| WCAG 2.1 AA Compliance | All | 2 days |
| Auto-Disclaimer Injection | Healthcare/Legal | 1 day |

---

### Priority 6: Analytics & A/B Testing Framework (Weeks 6-7)
**Status:** ⏳ PENDING

Required for phased geographic rollout:

| Feature | Purpose |
|---------|---------|
| Region-specific metrics dashboard | Track GEO-001 to GEO-005 tests |
| Conversion funnel by segment | Identify drop-off points |
| Pipeline usage analytics | Measure cost vs. revenue per pipeline |
| A/B test framework | Test pricing, features, messaging |

---

### Priority 7: Enterprise Features (Weeks 7-8)
**Status:** ⏳ PENDING

| Feature | Effort | Dependency |
|---------|--------|------------|
| SSO/SAML Integration | 5 days | Auth0/WorkOS |
| Audit Logging | 2 days | None |
| White-Label Solution | 5 days | Branding system |
| Multi-Tenant Workspaces | 5 days | Phase 4 |
| Custom SLA Dashboard | 2 days | Analytics |
| Enterprise API Gateway | 3 days | Rate limiting |

---

## 💰 FINANCIAL TARGETS

### Break-Even Analysis (from PIPELINE_FINANCIAL_ANALYSIS.md)

| Metric | Value |
|--------|-------|
| Monthly Fixed Costs | $131 |
| Blended ARPU (Hybrid A+C) | $35/mo |
| Blended Variable Cost | $8/mo |
| Contribution Margin | $27/mo per user |
| **Break-even Users** | **5 paying users** |
| Free→Paid Conversion (target) | 15% |
| **Required Signups** | **34 users** |

### Revenue Projection (8-Week Rollout)

| Phase | Week | MRR Target |
|-------|------|------------|
| Phase 1 | Week 2 | $665 |
| Phase 1 | Week 4 | $1,855 |
| Phase 2 | Week 6 | $3,500 |
| Phase 2 | Week 8 | $5,460 |
| Phase 3 | Week 10 | $7,500-8,000 |
| Phase 4 | Week 12 | $10,000-12,000 |

### Target Margins by Tier

| Tier | Price | Target Margin | Credits |
|------|-------|---------------|---------|
| Free | $0 | -100% (loss leader) | 10 |
| Starter | $12 | 65%+ | 150 |
| Creator | $29 | 60%+ | 400 |
| Pro | $59 | 55%+ | 1,000 |
| Business | $149 | 50%+ | 3,000 |
| Enterprise | Custom | 40%+ | Custom |

---

## 🛠️ TECHNICAL DEBT (Address in Parallel)

| Issue | Priority | Effort |
|-------|----------|--------|
| Standardize error handling across panels | Medium | 2 days |
| Create shared loading/progress hook | Low | 1 day |
| Add Zod schemas for all input forms | Medium | 3 days |
| Replace `any` types with proper interfaces | Low | 2 days |
| Add unit tests for critical paths | Low | 5 days |
| Consolidate duplicate edge functions | Medium | 2 days |

---

## 📅 MASTER TIMELINE

```
WEEK 1-2: FOUNDATION
├── User Segmentation & Onboarding
├── Segment Selection UI
├── Tier Comparison Display
└── Feature Gate Enforcement

WEEK 2-3: MONETIZATION
├── Stripe Products & Prices Setup
├── Checkout Session Integration
├── Webhook Handling
├── Billing Portal
└── Credit Purchase Flow

WEEK 3-4: PRODUCTION READINESS
├── API Upgrades (Gemini, DocuSign, Stripe)
├── Phase 1 Pipeline Release (15 core)
├── Geographic A/B Tests (India, SEA, LatAm)
└── Monitoring & Alerting Setup

WEEK 4-6: SCALING
├── Phase 2 Pipeline Release (+25 pro)
├── Geographic Expansion (MEA, CJK)
├── Analytics Dashboard
└── Usage Metering Verification

WEEK 6-8: ENTERPRISE
├── Phase 3 Pipeline Release (+30 advanced)
├── Compliance Features (HIPAA, GDPR)
├── SSO/SAML Integration
├── White-Label Foundation
└── Enterprise API Gateway
```

---

## ✅ IMMEDIATE ACTION ITEMS (This Sprint)

1. **Create Onboarding Wizard Component** - Post-signup segment selection
2. **Create Stripe Products** - 6 tiers with monthly/yearly prices
3. **Wire Checkout Edge Function** - Connect tier selection to Stripe
4. **Create Subscription Webhook** - Handle payment events
5. **Add Feature Gate Hooks** - `useFeatureGate(feature, tier)`
6. **Upgrade Gemini API** - Switch v1beta → v1

---

## 🎯 SUCCESS CRITERIA

### Week 4 Checkpoint
- [ ] 34+ signups achieved
- [ ] 5+ paying subscribers
- [ ] $665+ MRR
- [ ] All critical APIs in production mode
- [ ] Phase 1 pipelines live

### Week 8 Checkpoint
- [ ] 200+ signups
- [ ] 30+ paying subscribers
- [ ] $5,000+ MRR
- [ ] Phase 1-2 pipelines live
- [ ] Geographic A/B tests running

### Week 12 Checkpoint (Commercial Launch)
- [ ] 500+ signups
- [ ] 75+ paying subscribers
- [ ] $10,000+ MRR
- [ ] Full pipeline suite (minus VR/AR)
- [ ] Enterprise customers onboarded

---

**Next Steps:** Start with Priority 1 (User Segmentation) - create the onboarding wizard component and segment selection UI.
