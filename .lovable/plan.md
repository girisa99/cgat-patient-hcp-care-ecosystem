

# Reuse Existing Admin Hub for Subscriber Onboarding

## What Already Exists (No Need to Rebuild)

You have ALL the infrastructure needed across these existing systems:

| Need | Already Built | Table/Component |
|------|--------------|-----------------|
| Organization setup | WorkspaceManagement | `genie_studio_teams` |
| Team/seats | TeamInviteManagement | `genie_studio_team_members` |
| Branding | WhitelabelConfiguration | `genie_studio_whitelabel_configs` |
| Products & services | dynamicMarketingRegistryService | `marketing_products` (has `user_id`) |
| Audiences | dynamicMarketingRegistryService | `marketing_audiences` (has `user_id`) |
| Brand assets | dynamicMarketingRegistryService | `marketing_brand_assets` (has `user_id`) |
| Product knowledge | useUniversalEnrichment | `product_knowledge_registry` |
| Credit/tier config | tokenCreditService | `genie_studio_users.current_subscription_tier` |

## What Needs to Change (Extend, Not Create)

### 1. Add a "My Products" Tab to the Admin Hub

Instead of a separate onboarding wizard, add a new tab to `ProductionHubAdmin` called **"My Products"** (or "Product Setup"). This tab surfaces the existing `dynamicMarketingRegistryService` CRUD in a guided wizard-style UI for subscribers to:

- Add their own products (saves to `marketing_products` with their `user_id`, `is_system_default = false`)
- Add product knowledge (saves to `product_knowledge_registry` with their product ID)
- Add target audiences (saves to `marketing_audiences` with their `user_id`)
- Upload brand assets (saves to `marketing_brand_assets`)

This reuses the existing service layer with zero new tables.

### 2. Wire Universal Enrichment to Subscriber Products

`useUniversalEnrichment` already queries `product_knowledge_registry` and falls back to static Genie data. For subscribers, it just needs to:
- Accept a `user_id` filter when loading products
- Merge subscriber's `marketing_products` + `product_knowledge_registry` entries into the enrichment context
- This is a small extension to the existing `fetchProductKnowledge()` function

### 3. Tier-Gate the Tab Visibility

Using the existing `TIER_LIMITS` pattern from `WorkspaceManagement`:
- **Free/Starter**: Read-only view of Genie's 7 products (system defaults)
- **Pro**: Can add up to 3 custom products + audiences
- **Business**: Up to 10 products, full brand assets
- **Enterprise**: Unlimited products, full white-label

### 4. Add URL/Knowledge Fields to `product_knowledge_registry`

The `product_knowledge_registry` table already has `value_proposition`, `positioning_statement`, `pain_points`, `key_benefits`, etc. Two small columns to add:

- `website_url` (text, nullable) - subscriber's product URL
- `knowledge_docs` (jsonb, nullable) - array of uploaded doc references

This is a single migration, not a new table.

## Implementation Steps

### Step 1: DB Migration (Minimal)
Add `website_url` and `knowledge_docs` columns to `product_knowledge_registry`.

### Step 2: Create SubscriberProductSetup Component
A guided form component that reuses `dynamicMarketingRegistryService` methods:
- `createProduct()` / `updateProduct()` for products
- `createAudience()` for audiences  
- `createBrandAsset()` for assets
- Direct insert to `product_knowledge_registry` for knowledge

Rendered inside the existing Admin Hub as a new tab.

### Step 3: Update ProductionHubAdmin
Add `'product-setup'` to the `AdminTab` type and render `SubscriberProductSetup` when active. Tier-gate visibility using the existing pattern.

### Step 4: Extend useUniversalEnrichment
Add a `userId` parameter to `fetchProductKnowledge()` so it can load subscriber-specific product knowledge alongside Genie defaults.

### Step 5: Credit Config Adjustability
Move `TIER_CREDIT_CONFIG` from `tokenCreditService.ts` constants into a tier-gated admin section (inside the existing Workspace settings) so Pro/Enterprise admins can view their credit ratios. Actual editing remains admin-only for now.

## Technical Details

### Files Modified (not created from scratch)
- `src/components/genie-admin/ProductionHubAdmin.tsx` - Add tab
- `src/hooks/useUniversalEnrichment.ts` - Add userId filter
- `src/services/marketing/dynamicMarketingRegistryService.ts` - Already has CRUD, no changes needed
- `src/services/tokenCreditService.ts` - No structural changes, ratios already adjustable as constants

### New File (1 only)
- `src/components/genie-admin/SubscriberProductSetup.tsx` - Guided form that wraps existing service calls

### DB Migration (1 only)
```sql
ALTER TABLE product_knowledge_registry
  ADD COLUMN IF NOT EXISTS website_url text,
  ADD COLUMN IF NOT EXISTS knowledge_docs jsonb DEFAULT '[]';
```

## Outcome

- Zero new tables (reuses 6 existing tables)
- One new component (wraps existing services)
- One small migration (2 columns)
- Subscribers add their products/knowledge through the same Admin Hub
- Universal Enrichment automatically picks up subscriber data
- Credit ratios remain adjustable constants (promote to DB-driven later if needed)

