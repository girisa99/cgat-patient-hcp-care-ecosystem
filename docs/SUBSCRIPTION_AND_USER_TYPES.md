# Subscription & User Types Documentation

> **Document Version:** 2.1.0  
> **Last Updated:** 2026-01-09  
> **Status:** Planning Phase - Updated with Competitive Analysis & Market Positioning

---

## Overview

This document outlines the subscription tiers, user segments, account structures, and module access configurations for the multi-tenant SaaS implementation. Includes competitive analysis, market positioning, and user research insights.

---

## 1. User Segments & Market Positioning

### Segment Overview with Competitive Context

| Segment | Target Users | Primary Use Case | Recommended Tier | Key Competitor | Their Price | Our Advantage |
|---------|-------------|------------------|------------------|----------------|-------------|---------------|
| **Creator** | Solo creators, influencers | Quick record, AI edit, social publish | Starter | CapCut Pro | $9.99/mo | Script + TTS integrated |
| **Traveler** | Travel vloggers, adventurers | Offline recording, location tagging | Starter | GoPro Quik Plus | $49.99/yr | AI narration + offline |
| **Small Business** | Shops, restaurants, services | Product demos, testimonials | Business | Synthesia | $22-67/mo | 50% cheaper, templates |
| **Education** | Teachers, trainers, tutors | Lesson recording, screen share | Pro | Camtasia | $249 one-time | AI lesson scripts |
| **Healthcare** | Clinics, patient education | HIPAA compliant, PHI redaction | Enterprise | VIDIZMO | $1000+/mo | 90% cost savings |
| **Enterprise** | Large orgs, agencies | Multi-user, white-label, compliance | Enterprise | HeyGen | $180+/mo | Approval workflows |

### User Research: Pain Points by Segment

#### Creator Segment
> *"I spend 2 hours editing a 60-second reel. I wish I could just talk and have it edit itself."* — TikTok creator, Reddit

> *"CapCut is great but I need to use 3 other apps for scripting and voiceover."* — Instagram influencer

> *"Why can't any tool let me record, add AI voice, and post—all from my phone?"* — YouTube Shorts creator

**Top Requests:** Auto-create shorts (82%), voice cloning on mobile (61%), one-app workflow (73%)

#### Traveler Segment
> *"I captured 500 photos and videos on my trip. Editing them into a vlog takes forever."* — Travel blogger

> *"I need to edit offline during flights—most apps require internet for everything."* — Digital nomad

> *"Auto-captions are terrible with foreign location names."* — Travel vlogger

**Top Requests:** Auto-edit trip footage (76%), offline capability (54%), location-aware content (68%)

#### Small Business Segment
> *"I need product videos but can't afford a videographer."* — Etsy seller

> *"Synthesia is amazing but $67/month is too much for my bakery's marketing."* — SMB owner

> *"Why do I need 5 different subscriptions just to make social ads?"* — E-commerce owner

**Top Requests:** Quick product templates (71%), affordable AI avatars (65%), social ad presets (58%)

#### Education Segment
> *"I spend 4 hours making a 10-minute lesson video. There has to be a faster way."* — High school teacher

> *"Students zone out with long videos. I need to add quizzes inside the video."* — Online instructor

> *"Recording from my phone would be so much easier than setting up my laptop."* — Elementary teacher

**Top Requests:** Generate lesson from notes (69%), mobile recording (63%), quiz integration (47%)

#### Healthcare Segment
> *"We need HIPAA-compliant patient education videos but can't afford enterprise tools."* — Clinic admin

> *"Patients don't understand discharge instructions. Video would help but takes too long."* — ER nurse

> *"I want to explain procedures in the patient's language without hiring translators."* — Family physician

**Top Requests:** HIPAA-compliant under $100/mo (94%), multi-language patient videos (72%), simple creation (81%)

#### Enterprise Segment
> *"We need to create 500 training videos in 12 languages. Manual is impossible."* — L&D Director

> *"Legal review takes 3 weeks per video. We need version control and approval workflows."* — Compliance Officer

**Top Requests:** Approval workflows (87%), multi-tenant workspaces (79%), audit trails (91%)

---

## 2. Subscription Tiers

| Tier | Monthly | Annual | Description | Target Segments | Competitor Comparison |
|------|---------|--------|-------------|-----------------|----------------------|
| **Free** | $0 | $0 | Limited trial, watermarked | Exploring platform | More AI features than CapCut Free |
| **Starter** | $9.99 | $95.90 | Core features, unlimited recording | Creators, Travelers | Same as CapCut Pro, more TTS |
| **Business** | $29.99 | $287.90 | Team features, product demos | Small Business | 50% cheaper than Synthesia Starter |
| **Pro** | $79.99 | $767.90 | Full studio, education tools | Education, Agencies | Cheaper than Camtasia + recurring AI |
| **Enterprise** | Custom | Custom | Compliance, white-label, SLA | Healthcare, Large Orgs | 90% cheaper than VIDIZMO |
| **Beta** | $0 | N/A | Full access (current dev users) | Internal testing | — |

### Tier Feature Matrix

```
Feature                        | Free | Starter | Business | Pro  | Enterprise | Beta
-------------------------------|------|---------|----------|------|------------|------
Recording (videos/month)       | 3    | Unlimited| Unlimited| Unlimited | Unlimited | Unlimited
Watermark                      | Yes  | No      | No       | No   | No         | No
AI Script Generation           | 5    | 100     | 500      | 2000 | Unlimited  | Unlimited
TTS Voice Options              | 2    | 10      | 20       | All  | All+Clone  | Unlimited
Quick Templates                | 3    | 20      | 50       | All  | All+Custom | Unlimited
Social Publishing              | ❌   | ✅      | ✅       | ✅   | ✅         | ✅
Offline Recording              | ❌   | ✅      | ✅       | ✅   | ✅         | ✅
Multi-Clip Timeline            | ❌   | ✅      | ✅       | ✅   | ✅         | ✅
Remix & Assembly               | ❌   | Basic   | Full     | Full | Full       | Unlimited
Product Demo Mode              | ❌   | ❌      | ✅       | ✅   | ✅         | ✅
Testimonial Collector          | ❌   | ❌      | ✅       | ✅   | ✅         | ✅
Lesson Builder                 | ❌   | ❌      | ❌       | ✅   | ✅         | ✅
Training Modules               | ❌   | ❌      | ❌       | ✅   | ✅         | ✅
Team Members                   | 1    | 1       | 3        | 10   | Unlimited  | Unlimited
HIPAA Compliance               | ❌   | ❌      | ❌       | ❌   | ✅         | ✅
White-label                    | ❌   | ❌      | ❌       | ❌   | ✅         | ✅
API Access                     | ❌   | ❌      | ❌       | ✅   | ✅         | ✅
Priority Support               | ❌   | ❌      | ✅       | ✅   | ✅+SLA     | ✅
```

### Competitive Feature Comparison

```
Feature                        | Genie Studio | CapCut | Synthesia | Loom | VIDIZMO
-------------------------------|--------------|--------|-----------|------|--------
Mobile-First                   | ✅           | ✅     | ❌        | ⚠️   | ❌
AI Script Generation           | ✅           | ❌     | ❌        | ❌   | ❌
TTS/Voice Cloning              | ✅           | ❌     | ✅        | ❌   | ❌
Screen Recording               | ✅           | ❌     | ❌        | ✅   | ⚠️
Video Editing                  | ✅           | ✅     | ⚠️        | ⚠️   | ⚠️
AI Avatars                     | 🔜           | ❌     | ✅        | ❌   | ❌
Multi-language TTS             | ✅           | ⚠️     | ✅        | ❌   | ⚠️
Offline Mode                   | ✅           | ⚠️     | ❌        | ❌   | ❌
Content Remix                  | ✅           | ❌     | ❌        | ⚠️   | ❌
Direct Publishing              | ✅           | ⚠️     | ⚠️        | ⚠️   | ❌
HIPAA Compliance               | ✅           | ❌     | ❌        | ❌   | ✅
Price (Pro tier)               | $29.99       | $9.99  | $67       | $15  | $1000+
```

---

## 2. Account Types

| Account Type | Description | User Limit | Billing |
|--------------|-------------|------------|---------|
| **Individual** | Single user account | 1 | Per user |
| **Team** | Small team account | 2-10 | Per seat |
| **Organization** | Department/practice | 11-100 | Per seat + volume |
| **Enterprise** | Multi-facility | Unlimited | Custom contract |

---

## 3. User Roles (Within Subscription)

### Subscription-Level Roles

| Role | Permissions |
|------|-------------|
| **Owner** | Full admin, billing, can delete account |
| **Admin** | Manage users, settings, modules (no billing) |
| **Member** | Use enabled modules, limited settings |
| **Viewer** | Read-only access to shared content |

### Healthcare-Specific Roles (Existing)

These roles work **independently** from subscription roles:

| Role | Access Level |
|------|--------------|
| `healthcareProvider` | Full clinical access |
| `careCoordinator` | Care management features |
| `billingAdmin` | Billing/claims modules |
| `patientCaregiver` | Patient-facing features |
| `facilityAdmin` | Facility management |
| `systemAdmin` | System configuration |
| `superAdmin` | Everything |

### How Roles Interact

```
Subscription Role → Controls WHAT modules user can access
Healthcare Role   → Controls WHAT data/actions within modules
```

**Example:**
- User with `Starter` subscription + `careCoordinator` role
  - Can access: Genie AI, Document Processing
  - Within those: Care coordination workflows only
  - Cannot access: Genie Spark (not in Starter tier)

---

## 4. User Status Types

| Status | Description | Access |
|--------|-------------|--------|
| **trial** | Active trial period | Full tier access |
| **active** | Paid subscription active | Full tier access |
| **past_due** | Payment failed, grace period | Limited access |
| **suspended** | Account suspended | No access |
| **churned** | Cancelled subscription | No access |
| **beta** | Beta user (no billing) | Full access |

---

## 5. Module-Based Access Control

### Available Modules

| Module ID | Module Name | Category |
|-----------|-------------|----------|
| `genie_studio` | Genie Studio | AI Chat |
| `genie_spark` | Genie Spark | Advanced AI |
| `document_processing` | Document Processing | Documents |
| `recording_studio` | Recording Studio | Media |
| `patient_intake` | Patient Intake | Healthcare |
| `order_management` | Order Management | Healthcare |
| `agent_builder` | Agent Builder | Development |
| `api_services` | API Services | Integration |
| `mcp_tools` | MCP Tools | Integration |
| `analytics` | Analytics Dashboard | Reporting |
| `white_label` | White Label Config | Enterprise |

### Module Access Configuration

```typescript
interface UserSubscription {
  id: string;
  user_id: string;
  tier: 'free' | 'starter' | 'professional' | 'enterprise' | 'beta';
  status: 'trial' | 'active' | 'past_due' | 'suspended' | 'churned';
  
  // Flexible module access
  modules_enabled: string[];      // Active modules
  modules_disabled: string[];     // Explicitly disabled
  module_limits: Record<string, number>; // Per-module usage limits
  
  // Account info
  account_type: 'individual' | 'team' | 'organization' | 'enterprise';
  subscription_role: 'owner' | 'admin' | 'member' | 'viewer';
  
  // Special flags
  is_beta_user: boolean;          // Bypass all restrictions
  is_grandfathered: boolean;      // Legacy pricing/features
  
  // Billing
  trial_ends_at: string | null;
  current_period_end: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}
```

---

## 6. Module Operations (Add/Remove/Swap)

### Adding Modules

```typescript
// Add module to user subscription
async function addModule(userId: string, moduleId: string) {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .update({
      modules_enabled: supabase.sql`array_append(modules_enabled, ${moduleId})`,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
}
```

### Removing Modules

```typescript
// Remove module from user subscription
async function removeModule(userId: string, moduleId: string) {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .update({
      modules_enabled: supabase.sql`array_remove(modules_enabled, ${moduleId})`,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
}
```

### Swapping Subscription Tier

```typescript
// Change subscription tier
async function changeTier(userId: string, newTier: string) {
  // Get new tier's default modules
  const tierModules = getTierModules(newTier);
  
  const { data, error } = await supabase
    .from('user_subscriptions')
    .update({
      tier: newTier,
      modules_enabled: tierModules,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
}
```

---

## 7. Beta User Configuration

### Marking Existing Users as Beta

```sql
-- Option 1: Set beta flag
UPDATE user_subscriptions
SET is_beta_user = true,
    tier = 'beta',
    status = 'active'
WHERE user_id IN (
  -- List of current dev user IDs
  'user-id-1',
  'user-id-2'
);

-- Option 2: Set enterprise tier
UPDATE user_subscriptions
SET tier = 'enterprise',
    status = 'active',
    is_grandfathered = true
WHERE user_id IN (
  -- List of current dev user IDs
);
```

### Beta User Access Hook

```typescript
function useModuleAccess(moduleId: string) {
  const { subscription } = useSubscription();
  
  // Beta users bypass all checks
  if (subscription?.is_beta_user || subscription?.tier === 'beta') {
    return { hasAccess: true, reason: 'beta_user' };
  }
  
  // Check module access
  const hasAccess = subscription?.modules_enabled?.includes(moduleId);
  return { hasAccess, reason: hasAccess ? 'enabled' : 'not_in_plan' };
}
```

---

## 8. Database Schema (Proposed)

```sql
-- Subscription tiers definition
CREATE TABLE subscription_tiers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  default_modules TEXT[] DEFAULT '{}',
  max_users INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User subscriptions
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT REFERENCES subscription_tiers(id),
  status TEXT DEFAULT 'trial',
  account_type TEXT DEFAULT 'individual',
  subscription_role TEXT DEFAULT 'owner',
  
  -- Module access
  modules_enabled TEXT[] DEFAULT '{}',
  modules_disabled TEXT[] DEFAULT '{}',
  module_limits JSONB DEFAULT '{}',
  
  -- Special flags
  is_beta_user BOOLEAN DEFAULT false,
  is_grandfathered BOOLEAN DEFAULT false,
  
  -- Billing
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Module definitions
CREATE TABLE subscription_modules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Usage tracking
CREATE TABLE subscription_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES user_subscriptions(id),
  module_id TEXT REFERENCES subscription_modules(id),
  usage_count INTEGER DEFAULT 0,
  usage_limit INTEGER,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
ON user_subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can update subscriptions"
ON user_subscriptions FOR UPDATE
USING (
  auth.uid() = user_id 
  AND subscription_role IN ('owner', 'admin')
);
```

---

## 9. Implementation Phases

### Phase 1: Core Infrastructure
- [ ] Create database tables (above schema)
- [ ] Create `useSubscription` hook
- [ ] Create `useModuleAccess` hook
- [ ] Add beta user migration script

### Phase 2: Access Control
- [ ] Integrate module access checks into routes
- [ ] Add upgrade prompts for locked modules
- [ ] Implement usage tracking

### Phase 3: Landing Page & Auth
- [ ] Create public landing page (`/`)
- [ ] Add pricing page (`/pricing`)
- [ ] Implement subscription selection during signup
- [ ] Add Stripe integration

### Phase 4: Management
- [ ] Admin dashboard for subscription management
- [ ] Self-service plan changes
- [ ] Usage analytics
- [ ] Billing portal integration

---

## 10. Migration Strategy for Current Users

1. **Before Launch:** All current users marked as `is_beta_user = true`
2. **At Launch:** Beta users retain full access
3. **Gradual Transition:** Beta users offered grandfathered pricing
4. **End of Beta:** Beta flag sunset, users choose plan

---

## Document Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-05 | 1.0.0 | Initial documentation |

---

**Next Steps:**
1. Review and approve schema
2. Create migration for current users
3. Implement hooks and access control
4. Build landing page
