# Genie Studio Comprehensive Assessment & Implementation Roadmap

> **Document Version:** 1.0.0  
> **Last Updated:** 2026-01-06  
> **Status:** Assessment Complete - Ready for Implementation

---

## Executive Summary

### Assessment Results

| Category | Issues Found | Fixed | Remaining |
|----------|-------------|-------|-----------|
| **Critical (Timer/Memory Leaks)** | 6 | 6 | 0 |
| **Edge Function Timeouts** | 4 | 2 | 2 |
| **Timer Leaks** | 3 | 3 | 0 |
| **URL.createObjectURL Cleanup** | 4 | 1 | 3 |
| **Progress Interval Cleanup** | 5 | 2 | 3 |
| **Missing Error Boundaries** | 3 | 0 | 3 |

### Files Previously Fixed (Verified ✅)
- `AudioToScriptPanel.tsx` - Recording timer cleanup ✅
- `KnowledgeSearchPanel.tsx` - AbortController timeout ✅  
- `ScriptEditorTab.tsx` - AI/enhance timeout refs ✅
- `FullPipelineWorkflow.tsx` - Suggestion/pipeline timeouts ✅
- `SmartContentPipeline.tsx` - Progress/simulation refs ✅

---

## Remaining Technical Issues

### 1. Progress Interval Cleanup (Medium Priority)

**DocumentToScriptPanel.tsx** (Lines 145-156)
```typescript
// ISSUE: progressInterval not tracked for cleanup on unmount
const progressInterval = setInterval(() => {
  setProgress(prev => Math.min(prev + 10, 90));
  ...
}, 800);
```

**UrlToScriptPanel.tsx** (Lines 134-145)
```typescript
// ISSUE: progressInterval not tracked for cleanup
const progressInterval = setInterval(() => {
  setProgress(prev => Math.min(prev + 10, 90));
  ...
}, 1000);
```

**ImageToScriptPanel.tsx** (Lines 140-147)
```typescript
// ISSUE: progressInterval not tracked for cleanup
const progressInterval = setInterval(() => {
  setProgress(prev => Math.min(prev + 10, 90));
  ...
}, 1000);
```

**PipelineOrchestrationPanel.tsx** (Lines 153-165)
```typescript
// ISSUE: No cleanup mechanism - uses inline await pattern
for (let p = 0; p <= 100; p += 20) {
  setStageProgress(p);
  await new Promise(resolve => setTimeout(resolve, 300));
}
```

### 2. URL.createObjectURL Memory Leaks (Medium Priority)

**ImageToScriptPanel.tsx** (Lines 99-105)
```typescript
// ISSUE: URL.createObjectURL never revoked on upload/component unmount
setUploadedImageUrl(URL.createObjectURL(file));
```

**FullPipelineWorkflow.tsx** (Lines 203-213)
```typescript
// PARTIAL: cleanup exists in removeMedia, but not on unmount
preview: URL.createObjectURL(file),
```

**SmartContentPipeline.tsx** (Lines 238-246)
```typescript
// PARTIAL: cleanup in removeFile, but not on unmount
const preview = isImage ? URL.createObjectURL(file) : undefined;
```

### 3. Missing Error Boundaries (Low Priority)

Components that could benefit from error boundaries:
- `ScriptEditorTab.tsx` - Complex TTS/AI operations
- `FullPipelineWorkflow.tsx` - Multi-step pipeline
- `PipelineOrchestrationPanel.tsx` - Full pipeline execution

---

## Implementation Priority Roadmap

### Phase 0: Immediate Technical Fixes (This Sprint)
**Priority: P0 | Effort: 2-3 hours**

| Task | File | Type | Status |
|------|------|------|--------|
| Add progressIntervalRef cleanup | DocumentToScriptPanel.tsx | Timer Leak | 🔴 TODO |
| Add progressIntervalRef cleanup | UrlToScriptPanel.tsx | Timer Leak | 🔴 TODO |
| Add progressIntervalRef cleanup | ImageToScriptPanel.tsx | Timer Leak | 🔴 TODO |
| Add URL.revokeObjectURL on unmount | ImageToScriptPanel.tsx | Memory Leak | 🔴 TODO |
| Add URL.revokeObjectURL on unmount | SmartContentPipeline.tsx | Memory Leak | 🔴 TODO |

---

## Commercialization & Subscription Implementation Phases

### Phase 1: Core Infrastructure (Weeks 1-2)
**Priority: P0 | Dependencies: None**

| Task | Description | Status |
|------|-------------|--------|
| Create `subscription_tiers` table | Define tier structure (Free/Starter/Pro/Enterprise/Beta) | 🔴 TODO |
| Create `user_subscriptions` table | User-to-tier mapping with module access | 🔴 TODO |
| Create `subscription_modules` table | Module definitions registry | 🔴 TODO |
| Create `subscription_usage` table | Usage tracking per module | 🔴 TODO |
| Implement `useSubscription` hook | React hook for subscription state | 🔴 TODO |
| Implement `useModuleAccess` hook | Access control per module | 🔴 TODO |
| Beta user migration script | Mark current users as beta | 🔴 TODO |

**Database Schema Reference:** See `docs/SUBSCRIPTION_AND_USER_TYPES.md` Section 8

### Phase 2: Access Control Integration (Weeks 2-3)
**Priority: P0 | Dependencies: Phase 1**

| Task | Description | Status |
|------|-------------|--------|
| Route-level access checks | Integrate with React Router | 🔴 TODO |
| Module-level access gates | Component wrappers for locked modules | 🔴 TODO |
| Upgrade prompts UI | "Upgrade to unlock" modals/banners | 🔴 TODO |
| Usage tracking integration | Track API calls per module | 🔴 TODO |
| Genie AI conversation limits | Enforce per-tier limits | 🔴 TODO |

### Phase 3: Landing Page & Authentication (Weeks 3-4)
**Priority: P1 | Dependencies: Phase 1**

| Task | Description | Status |
|------|-------------|--------|
| Public landing page (`/`) | Marketing page for unauthenticated users | 🔴 TODO |
| Pricing page (`/pricing`) | Tier comparison & features | 🔴 TODO |
| Subscription selection (signup) | Tier choice during registration | 🔴 TODO |
| Stripe integration setup | Payment processing connection | 🔴 TODO |
| Stripe checkout flow | Subscription purchase UI | 🔴 TODO |
| Webhook handlers | Subscription events processing | 🔴 TODO |

### Phase 4: Management & Billing (Weeks 4-5)
**Priority: P1 | Dependencies: Phase 2, Phase 3**

| Task | Description | Status |
|------|-------------|--------|
| Admin subscription dashboard | Manage all subscriptions | 🔴 TODO |
| Self-service plan changes | Upgrade/downgrade flow | 🔴 TODO |
| Usage analytics dashboard | Per-user/per-module usage | 🔴 TODO |
| Stripe billing portal | Manage payment methods | 🔴 TODO |
| Invoice history | View past invoices | 🔴 TODO |

---

## Genie Spark Commercialization (Separate Page)

### Current State
- Genie Spark is embedded within `SmartContentPipeline.tsx`
- Needs separation for independent monetization

### Recommended Architecture

```
/genie-studio          → Main Genie Studio (included in Starter)
/genie-spark           → Genie Spark standalone (Pro+ only)
├── /genie-spark/spark       → Smart Content Pipeline
├── /genie-spark/full-pipeline → Multi-source orchestration
└── /genie-spark/workflows   → Custom workflow builder
```

### Spark-Specific Tasks (Phase 5: Weeks 5-6)

| Task | Description | Status |
|------|-------------|--------|
| Create `/genie-spark` route | Standalone page for Spark | 🔴 TODO |
| Move SmartContentPipeline | Extract to Spark page | 🔴 TODO |
| Move FullPipelineWorkflow | Extract to Spark page | 🔴 TODO |
| Spark-specific subscription gate | Pro+ tier requirement | 🔴 TODO |
| Spark usage metering | Track pipeline executions | 🔴 TODO |

---

## Module Access Matrix (From SUBSCRIPTION_AND_USER_TYPES.md)

| Module | Free | Starter | Pro | Enterprise | Beta |
|--------|------|---------|-----|------------|------|
| `genie_studio` (basic) | 10/mo | 100/mo | 1000/mo | Unlimited | Unlimited |
| `genie_spark` | ❌ | ❌ | ✅ | ✅ | ✅ |
| `document_processing` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `recording_studio` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `agent_builder` | ❌ | ❌ | ✅ | ✅ | ✅ |
| `api_services` | ❌ | ❌ | ✅ | ✅ | ✅ |
| `white_label` | ❌ | ❌ | ❌ | ✅ | ✅ |

---

## Genie AI Modules (Arc, Mind, Vibe, Spark, Prod Hub)

### Module Definitions

| Module | Description | Tier Required | Status |
|--------|-------------|---------------|--------|
| **Arc** | AI Agent Builder & Workflow Canvas | Pro+ | Partial |
| **Mind** | Knowledge Base & RAG Search | Starter+ | Implemented |
| **Vibe** | Recording Studio & TTS | Starter+ | Implemented |
| **Spark** | Smart Content Pipeline | Pro+ | Implemented, needs extraction |
| **Prod Hub** | Production Management | Pro+ | 🔴 TODO |

### Integration Points

```typescript
// Proposed module registration
const GENIE_MODULES = {
  arc: { id: 'genie_arc', tier: 'professional', route: '/arc' },
  mind: { id: 'genie_mind', tier: 'starter', route: '/mind' },
  vibe: { id: 'genie_vibe', tier: 'starter', route: '/vibe' },
  spark: { id: 'genie_spark', tier: 'professional', route: '/genie-spark' },
  prod_hub: { id: 'genie_prod_hub', tier: 'professional', route: '/prod-hub' },
};
```

---

## Implementation Sequence Summary

```
Week 1-2: Phase 1 (Core Infrastructure)
         ├── Database schema
         ├── useSubscription hook
         └── Beta user migration

Week 2-3: Phase 2 (Access Control)
         ├── Route guards
         ├── Module gates
         └── Upgrade prompts

Week 3-4: Phase 3 (Landing & Auth)
         ├── Landing page
         ├── Pricing page
         └── Stripe integration

Week 4-5: Phase 4 (Management)
         ├── Admin dashboard
         ├── Self-service
         └── Analytics

Week 5-6: Phase 5 (Spark Extraction)
         ├── /genie-spark route
         ├── Component extraction
         └── Usage metering
```

---

## Technical Debt to Address

1. **Consistent Error Handling**: Standardize try/catch patterns across all panels
2. **Loading State Management**: Create shared loading/progress hook
3. **Form Validation**: Add Zod schemas for all input forms
4. **Type Safety**: Replace `any` types with proper interfaces
5. **Test Coverage**: Add unit tests for critical paths

---

## Document Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-06 | 1.0.0 | Initial comprehensive assessment |

---

**Next Steps:**
1. Review and approve this roadmap
2. Create database migration for Phase 1
3. Implement remaining technical fixes
4. Begin Phase 1 infrastructure work
