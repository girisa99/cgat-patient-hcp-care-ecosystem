# Documentation Update Guide - Continuous Rollout

> **Version:** 1.0  
> **Updated:** 2026-01-16  
> **Purpose:** Ensure all documentation stays synchronized during development and production rollout

---

## 🎯 Single Source of Truth

All metrics and counts are derived from these governance files:

| File | Purpose | Update When |
|------|---------|-------------|
| `src/genie-studio/governance/UnifiedMetrics.ts` | Phase data (P0-P5), scenario counts, platform totals | New scenarios implemented |
| `src/genie-studio/governance/ApiProductionConfig.ts` | API configurations, dev→prod URLs, subscriptions | API changes, tier upgrades |
| `src/genie-studio/governance/GenieStudioRegistry.ts` | Edge functions, hooks, tables, agents registry | New infrastructure added |
| `src/components/diagrams/genie-command-center/data/implementation-data.ts` | Stage gates, products, infrastructure metrics | Feature completion |
| `src/components/diagrams/genie-command-center/data/governance-data.ts` | Audit logs, sync status, update checklist | Any governance change |

---

## 📋 Update Checklist by Action Type

### When Implementing a New Feature

- [ ] Update `UnifiedMetrics.ts` - increment implemented count for appropriate phase
- [ ] Update `implementation-data.ts` - mark feature status as 'done'
- [ ] Update `governance-data.ts` - add audit log entry
- [ ] Update relevant architecture doc (e.g., `GENIE_STUDIO_OVERALL_ARCHITECTURE.md`)

### When Adding a New Edge Function

- [ ] Add to `GenieStudioRegistry.ts` - `GENIE_EDGE_FUNCTIONS` array
- [ ] Update `docs/architecture/P3_API_DEPENDENCIES_GUIDE.md` if it uses external APIs
- [ ] Update `docs/architecture/P3_CLOSEOUT_PRODUCTION_READINESS.md`

### When Adding a New Hook

- [ ] Add to `GenieStudioRegistry.ts` - `GENIE_HOOKS` array
- [ ] Document in appropriate architecture file

### When Adding a New Database Table

- [ ] Add to `GenieStudioRegistry.ts` - `GENIE_DATABASE_TABLES` array
- [ ] Update `docs/DATABASE_IMPLEMENTATION_AUDIT.md`
- [ ] Ensure RLS policies documented

### When Adding a New API Integration

- [ ] Add to `ApiProductionConfig.ts` - `API_CONFIGURATIONS` array
- [ ] Add stage gate items to `API_STAGE_GATE_CHECKLIST`
- [ ] Update `docs/architecture/P3_API_DEPENDENCIES_GUIDE.md`
- [ ] Add secret key to `src/shared/config/secret-keys.ts`

### When Moving API from Dev to Prod

- [ ] Update `ApiProductionConfig.ts` - change `currentEnvironment` to 'production'
- [ ] Update endpoint URLs from dev to prod
- [ ] Mark production checklist items as complete
- [ ] Update subscription tier if needed
- [ ] Document in audit log

### When Completing a Stage Gate Item

- [ ] Update `implementation-data.ts` - change status to 'done'
- [ ] Update `UnifiedMetrics.ts` version and changelog
- [ ] Add governance audit entry

---

## 🚨 Comprehensive Stage Gate Categories (150+ Items)

The following categories MUST be addressed before production launch:

| Category | Items | Priority | Key Items |
|----------|-------|----------|-----------|
| **Legal & Compliance** | 12 | Critical | Terms, Privacy, GDPR, CCPA, HIPAA |
| **Domain & DNS** | 9 | Critical | DNS, SSL, Email Auth, CDN |
| **Payments & Banking** | 13 | Critical | Stripe, Tax, Bank, Fraud |
| **Copyright & IP** | 8 | High | Trademarks, Licenses, Attribution |
| **AI Content Moderation** | 10 | Critical | Safety, Watermarks, Ethics |
| **Age & Access Restrictions** | 10 | High | COPPA, Content Blocking |
| **Website Production** | 15 | Critical | Speed, SEO, Analytics |
| **Customer Support** | 10 | High | Help Desk, FAQ, Status Page |
| **Marketing & Launch** | 9 | Medium | Email, Social, Demo |
| **Compliance & Audit** | 10 | Critical | GDPR Rights, Incident Response |
| **Authentication** | 7 | Critical | OAuth, MFA, Sessions |
| **Authorization** | 6 | Critical | RBAC, RLS, Rate Limiting |
| **Subscriptions** | 10 | Critical | Stripe, Credits, Trials |
| **Core Features** | 10 | Critical | Products Functionality |
| **Infrastructure** | 9 | Critical | Edge Functions, DB, Storage |
| **Testing** | 7 | High | Unit, E2E, Load, A11y |
| **Monitoring** | 7 | High | Errors, Performance, Uptime |
| **Security** | 9 | Critical | XSS, CSRF, Pen Testing |
| **Go-Live Website** | 10 | Critical | Landing, Domain, SEO |
| **Documentation** | 8 | High | API Docs, Runbooks |
| **DevOps** | 10 | Critical | CI/CD, Rollback, Scaling |
| **API Production** | 29 | Critical | Dev→Prod URLs, Tiers |

---

## 📊 Documentation Files to Update

### Architecture Documents

| Document | Location | Update Frequency |
|----------|----------|------------------|
| Overall Architecture | `docs/architecture/GENIE_STUDIO_OVERALL_ARCHITECTURE.md` | Major features |
| Suite Summary | `docs/GENIE_SUITE_ARCHITECTURE_SUMMARY.md` | Weekly |
| API Dependencies | `docs/architecture/P3_API_DEPENDENCIES_GUIDE.md` | API changes |
| P3 Closeout | `docs/architecture/P3_CLOSEOUT_PRODUCTION_READINESS.md` | Feature completion |
| Scenario Map | `docs/GENIE_STUDIO_SCENARIO_MAP.md` | Scenario changes |

### Technical Documents

| Document | Location | Update Frequency |
|----------|----------|------------------|
| Database Audit | `docs/DATABASE_IMPLEMENTATION_AUDIT.md` | Table changes |
| AI Coverage | `docs/AI_Coverage_Summary.md` | AI features |
| Testing Roadmap | `docs/TESTING_AND_IMPLEMENTATION_ROADMAP.md` | Phase changes |
| Ops Runbook | `docs/Ops_Runbook_Genie.md` | Operations changes |

### Governance Documents

| Document | Location | Update Frequency |
|----------|----------|------------------|
| Implementation Governance | `docs/IMPLEMENTATION_GOVERNANCE.md` | Process changes |
| Consolidated Audit | `docs/CONSOLIDATED_DOCUMENTATION_AUDIT.md` | Weekly sync |
| Governance Quick Start | `docs/GOVERNANCE_QUICK_START.md` | Major changes |

---

## 🔄 Automated Sync Points

The Command Center UI automatically syncs from governance files:

```
UnifiedMetrics.ts → All tabs (Overview, Roadmap, Investor Dashboard)
ApiProductionConfig.ts → Stage Gates Tab (API section)
implementation-data.ts → Products, Stage Gates, Roadmap
governance-data.ts → Governance Tab, Sync Status
```

### When UI Shows Wrong Numbers

1. Check `UnifiedMetrics.ts` - all counts start here
2. Verify imports in consuming files
3. Check governance changelog for recent changes
4. Run sync status check in Governance tab

---

## 📅 Regular Sync Schedule

| Frequency | Action |
|-----------|--------|
| **Daily** | Check implementation-data.ts stage gate status |
| **Weekly** | Review UnifiedMetrics changelog, update version |
| **Per Sprint** | Full audit of all documentation files |
| **Pre-Release** | Complete production readiness checklist |
| **Post-Release** | Update all architecture docs with actual counts |

---

## 🚨 Critical Files for Go-Live

These files MUST be accurate before production launch:

1. **API Configuration** (`ApiProductionConfig.ts`)
   - All APIs must have `currentEnvironment: 'production'`
   - All production checklist items must be true
   - Subscription tiers must support expected load

2. **Stage Gates** (`implementation-data.ts`)
   - All Critical priority items must be 'done'
   - Overall readiness must be ≥90%

3. **P3 Closeout** (`P3_CLOSEOUT_PRODUCTION_READINESS.md`)
   - All features marked complete
   - All API keys documented

---

## 📝 Version Control

All governance files include:

```typescript
export const METRICS_METADATA = {
  version: 'X.X.X',        // Semver versioning
  lastUpdated: 'ISO date', // When last changed
  lastAuditedBy: 'who',    // Who made the change
  nextAuditDue: 'date',    // When to review
  changeLog: [...]         // History of changes
};
```

### Version Bump Rules

- **Major (X.0.0)**: Phase completion, major restructure
- **Minor (0.X.0)**: New features, new categories
- **Patch (0.0.X)**: Status updates, bug fixes

---

## 🔗 Related Documentation

- [Implementation Governance](./IMPLEMENTATION_GOVERNANCE.md)
- [P3 API Dependencies](./architecture/P3_API_DEPENDENCIES_GUIDE.md)
- [P3 Closeout](./architecture/P3_CLOSEOUT_PRODUCTION_READINESS.md)
- [Consolidated Audit](./CONSOLIDATED_DOCUMENTATION_AUDIT.md)

---

*Document maintained by Genie Studio DevOps Team*
