# 🏥 Healthcare Platform

> Patient enrollment and treatment center management system

## Overview

The Healthcare Platform is an internal system for managing patient enrollment, treatment center onboarding, and healthcare workflows. This product is **NOT part of the commercial Genie Studio launch**.

## Folder Structure

```
src/healthcare/
├── index.ts              # Main export file (product metadata, routes, features)
├── README.md             # This documentation
├── components/
│   └── index.ts          # Consolidated component exports
├── hooks/
│   └── index.ts          # Consolidated hook exports
├── services/
│   └── index.ts          # Consolidated service exports
├── types/
│   └── index.ts          # Consolidated type exports
└── constants/
    └── index.ts          # Centralized constants
```

## Features

| Feature | Description | Status |
|---------|-------------|--------|
| Patient Management | CRUD operations for patients | ✅ Active |
| Facility Management | Treatment center administration | ✅ Active |
| Enrollment Workflow | Multi-step patient enrollment | ✅ Active |
| Document Processing | AI-powered document extraction | ✅ Active |
| NPI Verification | Provider NPI lookup & validation | ✅ Active |
| Insurance Verification | Insurance eligibility checks | ✅ Active |
| HIPAA Compliance | Audit logging and redaction | ✅ Active |
| MCP Integration | Model Context Protocol bridge | ✅ Active |

## Component Categories

### Patient Management (3 components)
- `EnhancedPatientDashboard` - Main patient dashboard
- `PatientForm` - Patient data entry form
- `PatientManagementTable` - Patient listing table

### Enrollment (68 components)
- Forms: Clinical, Insurance, Provider, Consent
- Verification: NPI, Insurance, Provider
- AI Agents: Conversational, Structured, MCP-enabled
- Field Comparisons & Analysis tools

### Facilities (1 component)
- `FacilitiesManagementTable` - Facility administration

### Treatment Centers (4 components)
- Analytics, Details, Settings, Staff management

## Hooks

| Category | Count | Examples |
|----------|-------|----------|
| Patient & Enrollment | 11 | usePatients, useEnrollmentAgent, useConversationalEnrollment |
| Healthcare AI | 4 | useHealthcareAI, useMedicalCoding, useMedicationSearch |
| Verification | 1 | useNPIVerification |
| Financial | 2 | useInsurancePipeline, useFinancialAssessment |
| Facilities | 2 | useMasterFacilities, useRealFacilities |
| Security | 1 | useSecurePatientData |
| Other | 4 | useAdherenceOrchestrator, useGPOMemberships |

## Edge Functions

| Function | Purpose |
|----------|---------|
| `healthcare/create-patient` | Patient creation |
| `verify-npi` | NPI verification |
| `verify-insurance` | Insurance eligibility |
| `hipaa-redaction` | PHI redaction |
| `healthcare-agentic-orchestrator` | AI orchestration |
| `process-medical-document` | Document extraction |
| `medication-lookup` | Medication search |

## Database Tables

- `profiles` - User profiles
- `patients` - Patient records
- `enrollment_forms` - Enrollment data
- `enrollment_patients` - Enrollment-patient relationships
- `facilities` - Healthcare facilities
- `treatment_centers` - Treatment center data
- `insurance_info` - Insurance information
- `provider_verification` - Provider NPI verification records
- `consent_records` - Consent tracking
- `therapy_sessions` - Therapy session records
- `medication_records` - Medication history
- `audit_logs` - Compliance audit trail

## Key Integrations

- **DocuSign** - Electronic signatures
- **Twilio** - SMS notifications
- **WhatsApp** - Patient communication
- **Fax** - Legacy document handling
- **Salesforce/Veeva/HubSpot** - CRM integration via MCP

## Development Guidelines

### ✅ DO
- Keep all healthcare code in this folder structure
- Follow HIPAA compliance requirements
- Use audit logging for PHI access
- Test with anonymized data
- Use barrel exports from index files

### ❌ DON'T
- Import from `src/genie-studio/`
- Store PHI in logs
- Skip compliance checks
- Use production patient data in development
- Create duplicate components outside this structure

## Separation from Other Products

This codebase is kept separate from Genie Studio and Document Processing to:
1. Enable independent deployment cycles
2. Maintain compliance isolation
3. Simplify acquisition scenarios
4. Allow focused team ownership

## Related Documentation

- [Shared Infrastructure](../shared/README.md)
- [Product Config](../shared/config/product-config.ts)
- [Genie Studio](../genie-studio/README.md)
- [Document Processing](../document-processing/README.md)
