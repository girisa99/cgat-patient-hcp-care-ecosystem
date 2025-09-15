# Healthcare Database Tables by Role and Onboarding Process

## Overview
This document provides a comprehensive mapping of database tables used in the healthcare provider application, organized by user roles and onboarding processes.

---

## 🏥 PATIENT ONBOARDING TABLES (11 tables)

**Used by:** `patientCaregiver` role during patient enrollment and intake

| Table Name | Description | Primary Use |
|------------|-------------|-------------|
| `enrollment_patient_info` | Core patient demographic and contact information | Patient registration |
| `enrollment_clinical_info` | Clinical data including medical history and medications | Medical intake |
| `enrollment_insurance_info` | Insurance coverage and billing information | Insurance verification |
| `enrollment_consent` | Patient consent forms and HIPAA authorizations | Legal compliance |
| `enrollment_documents` | Document management for enrollment process | File storage |
| `patient_enrollments` | Patient enrollment tracking and status management | Workflow tracking |
| `enrollment_treatment_plan` | Treatment plans and care coordination | Care planning |
| `enrollment_collaborations` | Care team collaboration and communication | Team coordination |
| `enrollment_instances` | Enrollment session instances and workflow tracking | Session management |
| `treatment_assessments` | Clinical assessments and treatment evaluations | Clinical evaluation |
| `insurance_coverages` | Insurance coverage options and details | Coverage management |

### Data Flow for Patient Onboarding:
```
enrollment_patient_info → enrollment_clinical_info → enrollment_insurance_info → 
enrollment_consent → enrollment_documents → patient_enrollments → enrollment_treatment_plan
```

---

## 🏢 TREATMENT CENTER ONBOARDING TABLES (7 tables)

**Used by:** `onboardingTeam` role for facility and provider onboarding

| Table Name | Description | Primary Use |
|------------|-------------|-------------|
| `treatment_center_onboarding` | Treatment center facility information and onboarding status | Facility registration |
| `provider_profiles` | Healthcare provider profiles and credentials | Provider management |
| `npi_verification_results` | NPI number verification and validation results (NPPES) | Credentialing |
| `clinical_trials` | Clinical trial management and tracking | Research management |
| `service_providers` | External service provider configurations | Service integration |
| `service_provider_capabilities` | Service provider capabilities and offerings | Service catalog |
| `provider_test_configs` | Provider testing and configuration settings | Testing & QA |

### Data Flow for Treatment Center Onboarding:
```
treatment_center_onboarding → provider_profiles → npi_verification_results → 
service_providers → service_provider_capabilities → clinical_trials
```

---

## 👨‍⚕️ HEALTHCARE PROVIDER ROLE TABLES (18 tables)

**Used by:** `healthcareProvider` role for clinical workflows and patient management

**Includes all Patient Onboarding tables PLUS:**

| Additional Table Name | Description | Primary Use |
|----------------------|-------------|-------------|
| `enrollment_provider_info` | Provider information within enrollment context | Provider coordination |
| `enrollment_treatment_plan` | Treatment plans and care coordination | Care management |
| `clinical_trials` | Clinical trial management and tracking | Research participation |
| `provider_profiles` | Healthcare provider profiles and credentials | Professional identity |
| `npi_verification_results` | NPI verification results | Credential validation |
| `treatment_assessments` | Clinical assessments and evaluations | Patient assessment |
| `insurance_coverages` | Insurance coverage options | Coverage verification |

### Key Workflows:
- Patient clinical management
- Treatment planning and coordination
- Clinical documentation
- Provider credentialing
- Research participation

---

## 👥 CUSTOMER ONBOARDING ROLE TABLES (11 tables)

**Used by:** `onboardingTeam` role for system configuration and service setup

**Includes Treatment Center tables PLUS:**

| Additional Table Name | Description | Primary Use |
|----------------------|-------------|-------------|
| `enrollment_templates` | Enrollment form templates and configurations | Form management |
| `saml_providers` | SAML authentication provider configurations | SSO setup |
| `sso_providers` | Single sign-on provider configurations | Authentication |
| `voice_providers` | Voice communication provider settings | Communication setup |

### Key Workflows:
- Facility onboarding and setup
- Service configuration and integration
- Authentication and SSO setup
- Communication system setup
- Template and form management

---

## 🛡️ SUPER ADMIN TABLES (30+ tables)

**Used by:** `superAdmin` role - Full system access to all tables

### Core System Tables (6 tables):
| Table Name | Description | Access Level |
|------------|-------------|--------------|
| `profiles` | User profiles and basic information | Full CRUD |
| `roles` | System roles and permissions | Full CRUD |
| `user_roles` | User role assignments | Full CRUD |
| `user_permissions` | Individual user permissions | Full CRUD |
| `permissions` | System permission definitions | Full CRUD |
| `role_permissions` | Role-based permission assignments | Full CRUD |

### Organization & Infrastructure (4 tables):
| Table Name | Description | Access Level |
|------------|-------------|--------------|
| `facilities` | Healthcare facilities and treatment centers | Full CRUD |
| `modules` | System modules and features | Full CRUD |
| `role_module_assignments` | Role access to modules | Full CRUD |
| `user_module_assignments` | User access to specific modules | Full CRUD |

### Monitoring & Audit (2 tables):
| Table Name | Description | Access Level |
|------------|-------------|--------------|
| `audit_logs` | System audit and activity logs | Read only |
| `active_issues` | System issues and alerts monitoring | Full CRUD |

### Agent & AI System (12+ tables):
- `agents` - AI agent configurations
- `agent_sessions` - Agent session data
- `agent_conversations` - Conversation logs
- `agent_templates` - Agent templates
- `agent_workflows` - Workflow definitions
- `ai_model_integrations` - AI model configs
- `ai_model_configs` - Model parameters
- And more...

### API & Integration (6+ tables):
- `api_keys` - API key management
- `api_endpoints` - Endpoint configurations
- `api_documentation` - API documentation
- `voice_connectors` - Voice system integration
- `voice_analytics_events` - Communication analytics
- And more...

**Plus ALL tables from other roles for complete system oversight**

---

## 🔄 DATA INTEGRATION PATTERNS

### External System Integrations:

#### EMR Systems:
- **Cerner**: Maps to `enrollment_clinical_info`, `provider_profiles`
- **Athenahealth**: Maps to `enrollment_patient_info`, `enrollment_insurance_info`
- **Change Healthcare**: Maps to `enrollment_insurance_info`, `npi_verification_results`

#### Business Systems:
- **Salesforce**: Maps to `patient_enrollments`, `provider_profiles`
- **Veeva**: Maps to `clinical_trials`, `provider_profiles`
- **Oracle Clinical**: Maps to `clinical_trials`, `treatment_assessments`
- **SAP**: Maps to `service_providers`, `enrollment_insurance_info`

### Data Push/Pull Operations:

#### Patient Data Flow:
```
External EMR → enrollment_patient_info → enrollment_clinical_info → 
patient_enrollments → treatment_assessments
```

#### Provider Data Flow:
```
NPI Registry → npi_verification_results → provider_profiles → 
enrollment_provider_info → clinical_trials
```

#### Insurance Data Flow:
```
Insurance API → enrollment_insurance_info → insurance_coverages → 
patient_enrollments
```

---

## 🔐 SECURITY & COMPLIANCE

### Row Level Security (RLS) Policies:
- All tables have role-based access control
- Patient data protected by HIPAA compliance policies
- Provider credentials secured with encryption
- Audit logs track all data access and modifications

### Data Privacy:
- PHI (Protected Health Information) encrypted at rest
- PII (Personally Identifiable Information) access logged
- Role-based field-level permissions
- Automatic data retention policies

---

## 📊 TABLE STATISTICS

| Role | Table Count | Primary Focus |
|------|-------------|---------------|
| Patient/Caregiver | 11 | Patient enrollment & care |
| Healthcare Provider | 18 | Clinical workflows & patient management |
| Customer Onboarding | 11 | System setup & service configuration |
| Super Admin | 30+ | Complete system administration |

**Total Unique Tables**: 50+ tables
**Core Healthcare Tables**: 25 tables
**System Infrastructure**: 15 tables
**Integration & API**: 10+ tables

---

This comprehensive table mapping ensures proper data access, security compliance, and efficient workflow management across all user roles in the healthcare provider application.