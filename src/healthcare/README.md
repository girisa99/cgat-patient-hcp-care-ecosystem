# 🏥 Healthcare Platform

> Patient enrollment and treatment center management system

## Overview

The Healthcare Platform is an internal system for managing patient enrollment, treatment center onboarding, and healthcare workflows. This product is **NOT part of the commercial Genie Studio launch**.

## Features

| Feature | Description | Status |
|---------|-------------|--------|
| Patient Management | CRUD operations for patients | ✅ Active |
| Facility Management | Treatment center administration | ✅ Active |
| Enrollment Workflow | Multi-step patient enrollment | ✅ Active |
| Document Processing | AI-powered document extraction | ✅ Active |
| HIPAA Compliance | Audit logging and redaction | ✅ Active |

## Folder Structure

```
src/healthcare/
├── index.ts              # Main export file
├── components/           # Healthcare-specific UI
│   ├── patients/         # Patient management
│   ├── facilities/       # Facility management
│   ├── enrollment/       # Enrollment workflow
│   └── documents/        # Document processing
├── hooks/                # Healthcare-specific hooks
├── services/             # Healthcare services
├── types/                # Type definitions
└── pages/                # Page components (migrated)
```

## Key Integrations

- **DocuSign** - Electronic signatures
- **Twilio** - SMS notifications
- **WhatsApp** - Patient communication
- **Fax** - Legacy document handling

## Edge Functions

Healthcare edge functions are in `supabase/functions/healthcare/`:

| Function | Purpose |
|----------|---------|
| `create-patient` | Patient creation |
| `verify-npi` | NPI verification |
| `healthcare-agentic-orchestrator` | AI orchestration |
| `hipaa-redaction` | PHI redaction |

## Development Guidelines

### ✅ DO
- Keep all healthcare code in this folder
- Follow HIPAA compliance requirements
- Use audit logging for PHI access
- Test with anonymized data

### ❌ DON'T
- Import from `src/genie-studio/`
- Store PHI in logs
- Skip compliance checks
- Use production patient data in development

## Separation from Genie Studio

This codebase is kept separate from Genie Studio to:
1. Enable independent deployment cycles
2. Maintain compliance isolation
3. Simplify acquisition scenarios
4. Allow focused team ownership

## Related Documentation

- [Product Config](../shared/config/product-config.ts)
- [HIPAA Guidelines](../../docs/HIPAA_COMPLIANCE.md)
