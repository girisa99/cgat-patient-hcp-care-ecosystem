# Phase 3 Gap Analysis & Segment Planning
**Created:** 2026-01-16 | **Status:** Planning Document

---

## 🚨 CRITICAL GAPS IDENTIFIED

### 1. Segment Determination Gap

**Current State:**
- `user_segments` table exists with tier/segment fields
- Segments defined: Creator, Traveler, Small Business, Education, Healthcare, Enterprise
- NO automatic segment assignment during registration

**Missing:**
| Gap | Impact | Priority |
|-----|--------|----------|
| Segment selection during signup | Users don't know their tier/features | P3-Critical |
| OAuth segment capture | Google/SSO users skip segment selection | P3-Critical |
| Segment-to-feature mapping enforcement | Features accessible without proper tier | P3-High |
| Team vs Individual detection | No org/team creation flow | P3-High |

### 2. Authentication & Registration Gaps

**Current State:**
- Email/password signup captures: email, password, first_name, last_name
- Google OAuth captures: email only (from Google profile)
- Roles fetched via `get_user_roles` RPC after login

**Missing During Registration:**
| Field | Individual | Team | Enterprise |
|-------|------------|------|------------|
| Segment selection | ❌ Missing | ❌ Missing | ❌ Missing |
| Use case/industry | ❌ Missing | ❌ Missing | ❌ Missing |
| Team size | N/A | ❌ Missing | ❌ Missing |
| Organization name | N/A | ❌ Missing | ❌ Missing |
| Billing contact | N/A | ❌ Missing | ❌ Missing |
| SSO domain | N/A | N/A | ❌ Missing |

### 3. Individual vs Team vs Enterprise Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW GAP                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CURRENT:  Email/Password → Profile Created → Dashboard        │
│                                                                 │
│  NEEDED:   Email/Password → Segment Selection → Use Case →     │
│            [If Team: Org Setup] → Tier Selection → Dashboard   │
│                                                                 │
│  OAUTH:    Google → ??? → Dashboard (NO segment capture!)      │
│                                                                 │
│  NEEDED:   Google → Segment Selection → Use Case → Dashboard   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 SEGMENT COST VISIBILITY GAP

**Current Pricing (from subscriptionTiers.ts):**

| Tier | Price | Target Segment | Visible to User? |
|------|-------|----------------|------------------|
| Free | $0 | Trial users | ✅ Yes |
| Starter | $9.99/mo | Individual creators | ⚠️ Pricing page only |
| Business | $29.99/mo | Small teams (3 members) | ⚠️ Pricing page only |
| Pro | $79.99/mo | Teams (10 members) | ⚠️ Pricing page only |
| Enterprise | Custom | Large orgs | ❌ Contact sales only |

**Missing:**
- No cost display during registration
- No tier comparison during onboarding
- No feature unlock visibility per segment
- No upgrade prompts based on usage

---

## 📋 PHASE 3 PENDING ITEMS (By Priority)

### Priority 2: Generation & Automation (Weeks 14-15)
| ID | Feature | Status | Dependency |
|----|---------|--------|------------|
| P3-GEN-01 | Batch Script Generation | ✅ Built | n8n |
| P3-GEN-02 | Auto-Publish Scheduling | ✅ Built | n8n |
| P3-GEN-03 | Multi-Language Quick Dub | ⏳ Pending | ElevenLabs |
| P3-GEN-04 | Content Recycling Engine | ⏳ Pending | - |
| P3-GEN-05 | Template Variant Generation | ⏳ Pending | - |
| P3-GEN-06 | Voice Cloning for Dubs | ⏳ Pending | ElevenLabs |

### Priority 3: Compliance & Legal (Weeks 15-16)
| ID | Feature | Status | Segment |
|----|---------|--------|---------|
| P3-COMP-01 | Copyright Detection | ⏳ Pending | All |
| P3-COMP-02 | HIPAA Compliance Check | ⏳ Pending | Healthcare |
| P3-COMP-03 | GDPR Data Compliance | ⏳ Pending | Enterprise/EU |
| P3-COMP-04 | WCAG 2.1 AA Compliance | ⏳ Pending | All |
| P3-COMP-05 | Auto-Disclaimer Injection | ⏳ Pending | Healthcare/Legal |

### Priority 4: Analytics & Insights (Weeks 16-17)
| ID | Feature | Status |
|----|---------|--------|
| P3-ANA-01 | Performance Insights Dashboard | ⏳ Pending |
| P3-ANA-02 | Competitor Content Analysis | ⏳ Pending |
| P3-ANA-03 | Trend Prediction Engine | ⏳ Pending |
| P3-ANA-04 | Cross-Platform Optimization | ⏳ Pending |
| P3-ANA-05 | Engagement Prediction AI | ⏳ Pending |
| P3-ANA-06 | A/B Testing Framework | ⏳ Pending |

### Priority 5: Segment-Specific Features (Weeks 17-18)
| ID | Feature | Segment | Status |
|----|---------|---------|--------|
| P3-SEG-01 | Patient Education Videos | Healthcare | ⏳ Pending |
| P3-SEG-02 | Clinical Trial Content | Healthcare | ⏳ Pending |
| P3-SEG-03 | Medical Transcription | Healthcare | ⏳ Pending |
| P3-SEG-04 | Traveler Content Kit | Travel | ⏳ Pending |
| P3-SEG-05 | Destination Showcase | Travel | ⏳ Pending |
| P3-SEG-06 | Property Virtual Tour | Real Estate | ⏳ Pending |
| P3-SEG-07 | Listing Optimization | Real Estate | ⏳ Pending |
| P3-SEG-08 | Product Showcase Videos | E-commerce | ⏳ Pending |
| P3-SEG-09 | UGC Compilation Engine | E-commerce | ⏳ Pending |

### Priority 6: External Integrations (Weeks 18-19)
| ID | Feature | Status |
|----|---------|--------|
| P3-INT-01 | Adobe Creative Cloud | ⏳ Pending |
| P3-INT-02 | Figma Design Import | ⏳ Pending |
| P3-INT-03 | Canva Asset Import | ⏳ Pending |
| P3-INT-04 | YouTube Studio Sync | ⏳ Pending |
| P3-INT-05 | Social API Publishing | ⏳ Pending (n8n) |

### Priority 7: Enterprise Features (Weeks 19-20)
| ID | Feature | Status |
|----|---------|--------|
| P3-ENT-01 | SSO/SAML Integration | ⏳ Pending |
| P3-ENT-02 | Audit Logging | ⏳ Pending |
| P3-ENT-03 | White-Label Solution | ⏳ Pending |
| P3-ENT-04 | Multi-Tenant Workspaces | ⏳ Pending |
| P3-ENT-05 | Custom SLA Dashboard | ⏳ Pending |
| P3-ENT-06 | Enterprise API Gateway | ⏳ Pending |

---

## 🎯 RECOMMENDED ACTIONS

### Immediate (This Sprint)
1. **Add Segment Selection to Registration** - Post-signup onboarding flow
2. **Add OAuth Segment Capture** - Post-OAuth redirect to segment selection
3. **Display Tier/Cost During Onboarding** - Show what they get

### Phase 3 Priorities
1. Complete Compliance & Legal (HIPAA, GDPR, Copyright)
2. Build Segment-Specific Feature Gates
3. Implement External Integrations via n8n
4. Add Enterprise SSO/SAML

---

## 📈 SEGMENT FEATURE MATRIX (TO BUILD)

| Feature | Individual | Team | Enterprise |
|---------|------------|------|------------|
| Genie Spark | ✅ | ✅ | ✅ |
| Genie Vibe | ⚠️ Limited | ✅ | ✅ |
| Genie Mind | ❌ | ✅ | ✅ |
| Genie Arc | ❌ | ✅ | ✅ |
| Auto-Publish | ⚠️ 1 platform | ✅ 5 platforms | ✅ Unlimited |
| Batch Generation | ❌ | ✅ 10/batch | ✅ Unlimited |
| Team Collaboration | ❌ | ✅ 3 members | ✅ Unlimited |
| SSO/SAML | ❌ | ❌ | ✅ |
| HIPAA Compliance | ❌ | ⚠️ Add-on | ✅ Included |
| White-Label | ❌ | ❌ | ✅ |
| Custom Integrations | ❌ | ❌ | ✅ |

---

**Next Steps:** Implement segment selection in registration flow, then enforce feature gates per segment.
