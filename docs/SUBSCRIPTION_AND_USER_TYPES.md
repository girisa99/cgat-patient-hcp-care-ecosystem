# Subscription & User Types Documentation

> **Document Version:** 2.0.0  
> **Last Updated:** 2026-01-09  
> **Status:** Planning Phase - Updated with User Segments

---

## Overview

This document outlines the subscription tiers, user segments, account structures, and module access configurations for the multi-tenant SaaS implementation. Updated to include mobile-first features and segment-specific offerings.

---

## 1. User Segments

| Segment | Target Users | Primary Use Case | Recommended Tier |
|---------|-------------|------------------|------------------|
| **Creator** | Solo content creators, influencers | Quick record, AI edit, social publish | Starter |
| **Traveler** | Travel vloggers, adventurers | Offline recording, location tagging, story templates | Starter |
| **Small Business** | Shops, restaurants, services | Product demos, testimonials, marketing videos | Business |
| **Education** | Teachers, trainers, tutors | Lesson recording, screen share, quiz integration | Pro |
| **Healthcare** | Clinics, patient education | HIPAA compliant, PHI redaction, accessibility | Enterprise |
| **Enterprise** | Large orgs, agencies | Multi-user, white-label, compliance, SLA | Enterprise |

---

## 2. Subscription Tiers

| Tier | Monthly | Annual | Description | Target Segments |
|------|---------|--------|-------------|-----------------|
| **Free** | $0 | $0 | Limited trial, watermarked | Exploring platform |
| **Starter** | $9.99 | $95.90 | Core features, unlimited recording | Creators, Travelers |
| **Business** | $29.99 | $287.90 | Team features, product demos | Small Business |
| **Pro** | $79.99 | $767.90 | Full studio, education tools | Education, Agencies |
| **Enterprise** | Custom | Custom | Compliance, white-label, SLA | Healthcare, Large Orgs |
| **Beta** | $0 | N/A | Full access (current dev users) | Internal testing |

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
