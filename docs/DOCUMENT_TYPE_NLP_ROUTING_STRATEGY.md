# Document-Type Aware NLP Model Routing Strategy

## Overview

This document outlines the implementation strategy for intelligent NLP model routing in **Stage 2 (Entity Extraction)** of the document processing pipeline. Stage 1 (Google Vision OCR) remains unchanged.

**Status:** ✅ Strategy Finalized - Ready for Implementation  
**Last Updated:** 2025-01-19

---

## Final Model Routing Decisions

| Document Type | Primary Model | Pipeline Type | Rationale |
|---------------|---------------|---------------|-----------|
| **Prescriptions** | Claude AI | Single | Superior clinical reasoning, NDC lookups, drug interaction analysis, therapeutic alternatives with clinical justification |
| **Medical Imaging** | Gemini Vision → Claude AI | Sequential Hybrid | Gemini for visual pattern recognition; Claude for clinical interpretation and recommendations |
| **Insurance Cards** | Claude AI | Single | Complex policy extraction, coverage analysis, member ID parsing |
| **Invoices/RCM** | OpenAI GPT | Single | Excellent table/structured data extraction, financial calculations |
| **Patient Forms** | Gemini | Single (Claude fallback) | Fast form field extraction, handwriting recognition |

---

## Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FINALIZED PIPELINE (Multi-Model Routing)                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Document Upload → Stage 1: Google Vision OCR → Document Type Detection    │
│                            (unchanged)                    ↓                 │
│                                                                             │
│                    ┌──────────────────────────────────────┴──────────────┐  │
│                    │           INTELLIGENT MODEL ROUTER                  │  │
│                    │                                                     │  │
│                    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │  │
│                    │  │ Prescription│  │   Invoice   │  │   Medical   │ │  │
│                    │  │   Router    │  │   Router    │  │   Imaging   │ │  │
│                    │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘ │  │
│                    │         │                │                │        │  │
│                    │         ▼                ▼                ▼        │  │
│                    │    Claude AI         OpenAI GPT     Gemini→Claude  │  │
│                    │  (Clinical Data)    (Tables/RCM)   (Hybrid Pipeline)│  │
│                    │                                                     │  │
│                    └─────────────────────────────────────────────────────┘  │
│                                           ↓                                 │
│                              Stage 3: Code Intelligence                     │
│                              (NDC, CPT, ICD-10, etc.)                       │
│                                           ↓                                 │
│                                    Verified Output                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Medical Imaging: Sequential Hybrid Pipeline (CONFIRMED)

Medical imaging uses a **two-stage SEQUENTIAL pipeline** for optimal accuracy:

### Why Sequential (Not Parallel)?
- **Stage dependency**: Claude needs Gemini's visual analysis output to generate clinical insights
- **Context enrichment**: Claude builds upon Gemini's structured findings
- **Better accuracy**: Sequential allows Claude to focus purely on clinical synthesis

### Stage 2A: Visual Analysis (Gemini Vision)

```typescript
interface GeminiVisionAnalysis {
  modality: 'X-Ray' | 'CT' | 'MRI' | 'Ultrasound' | 'ECG';
  anatomical_region: string;
  visual_findings: {
    finding: string;
    location: string;
    confidence: number;
  }[];
  measurements: {
    measurement: string;
    value: string;
    unit: string;
    normal_range?: string;
  }[];
  image_quality: 'excellent' | 'good' | 'fair' | 'poor';
  technical_notes: string[];
}
```

**Gemini Vision Responsibilities:**
- ✅ Detect imaging modality (X-Ray, CT, MRI, Ultrasound, ECG)
- ✅ Identify anatomical regions and structures
- ✅ Extract visual findings (opacities, masses, fractures, abnormalities)
- ✅ Extract measurements and compare to normal ranges
- ✅ Assess image quality and technical parameters
- ✅ Output structured JSON for Claude consumption

### Stage 2B: Clinical Synthesis (Claude AI)

```typescript
interface ClaudeClinicalSynthesis {
  clinical_interpretation: string;
  differential_diagnoses: {
    diagnosis: string;
    probability: 'high' | 'moderate' | 'low';
    supporting_findings: string[];
  }[];
  severity_assessment: 'critical' | 'urgent' | 'routine' | 'normal';
  recommendations: {
    immediate_actions: string[];
    follow_up_imaging: string[];
    specialist_referrals: string[];
  };
  clinical_correlation: string;
  comparison_with_prior?: string;
  limitations: string[];
}
```

**Claude AI Responsibilities:**
- ✅ Interpret Gemini's visual findings in clinical context
- ✅ Generate differential diagnoses with probability rankings
- ✅ Assess severity and urgency levels
- ✅ Provide actionable clinical recommendations
- ✅ Suggest follow-up imaging or specialist referrals
- ✅ Add clinical correlation notes and study limitations

### Sequential Pipeline Flow

```
┌─────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│  OCR Extracted  │     │   Gemini Vision     │     │    Claude AI        │
│  Image + Text   │────▶│   Visual Analysis   │────▶│    Clinical         │
│                 │     │                     │     │    Synthesis        │
└─────────────────┘     └─────────────────────┘     └─────────────────────┘
                              │                            │
                              ▼                            ▼
                        gemini_output:                claude_output:
                        {                             {
                          modality,                     interpretation,
                          anatomical_region,            diagnoses,
                          visual_findings[],            severity,
                          measurements[],               recommendations,
                          image_quality                 clinical_correlation
                        }                             }
                                    ↓
                              MERGED FINAL OUTPUT
```

### Imaging Modality-Specific Analysis

| Modality | Gemini Focus | Claude Focus |
|----------|--------------|--------------|
| **X-Ray** | Bone density, fracture lines, lung fields, cardiac silhouette | Fracture classification, pneumonia patterns, cardiomegaly assessment |
| **CT** | Hounsfield units, contrast enhancement, lesion boundaries | Tumor staging, vascular pathology, differential diagnosis |
| **MRI** | Signal intensity, T1/T2 characteristics, enhancement patterns | Soft tissue pathology, neurological findings, joint assessment |
| **Ultrasound** | Echogenicity, measurements, blood flow (Doppler) | Organ assessment, fetal development, vascular stenosis |
| **ECG** | Wave patterns, intervals, rhythm strips | Arrhythmia classification, ischemic changes, clinical correlation |

---

## Prescription Processing: Claude AI (CONFIRMED)

### Why Claude for Prescriptions?

1. **Superior Clinical Reasoning**: Best understanding of drug interactions, contraindications, and therapeutic alternatives
2. **NDC Code Accuracy**: Accurate National Drug Code identification and validation
3. **Alternative Drug Suggestions**: Evidence-based therapeutic alternatives with:
   - Clinical justification for each alternative
   - Cost comparison (generic vs brand)
   - Therapeutic equivalence ratings
   - Formulary considerations
4. **Dosage Validation**: Context-aware dosage checking with patient-specific factors

### Prescription Entity Extraction Schema

```typescript
interface PrescriptionExtraction {
  medications: {
    drug_name: string;
    generic_name: string;
    brand_name?: string;
    ndc_code: string;
    strength: string;
    form: string;
    quantity: number;
    days_supply: number;
    refills: number;
    daw_code: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
    sig: {
      original: string;
      parsed: {
        dose: string;
        route: string;
        frequency: string;
        duration?: string;
        prn: boolean;
        special_instructions?: string;
      };
    };
  }[];
  prescriber: {
    name: string;
    npi: string;
    dea_number: string;
    specialty?: string;
    phone: string;
    address: string;
  };
  patient: {
    name: string;
    dob: string;
    address?: string;
    allergies?: string[];
  };
  clinical_insights: {
    drug_interactions: {
      drugs: [string, string];
      severity: 'major' | 'moderate' | 'minor';
      description: string;
      management: string;
    }[];
    therapeutic_alternatives: {
      original_drug: string;
      alternative: string;
      alternative_ndc: string;
      reason: string;
      cost_comparison: 'lower' | 'similar' | 'higher';
      therapeutic_equivalence: 'AB' | 'AN' | 'AO' | 'AP' | 'AT' | 'BC' | 'BD' | 'BP' | 'BS' | 'BT' | 'BX';
    }[];
    warnings: string[];
    black_box_warnings?: string[];
  };
  rx_metadata: {
    date_written: string;
    date_filled?: string;
    prescription_number?: string;
    is_controlled: boolean;
    schedule?: 'II' | 'III' | 'IV' | 'V';
  };
}
```

---

## Invoice/RCM Processing: OpenAI GPT (CONFIRMED)

### Why OpenAI for Invoices?

1. **Table Extraction Excellence**: Best at parsing complex multi-column tables
2. **Financial Accuracy**: Superior numerical processing and arithmetic validation
3. **Code Recognition**: Excellent CPT, HCPCS, Revenue Code, ICD-10 identification
4. **Format Adaptability**: Handles diverse invoice layouts consistently

### Invoice Entity Extraction Schema

```typescript
interface InvoiceExtraction {
  invoice_header: {
    invoice_number: string;
    date_of_service: string;
    statement_date: string;
    due_date: string;
  };
  billing_provider: {
    name: string;
    npi: string;
    tax_id: string;
    address: string;
    phone: string;
  };
  patient: {
    name: string;
    account_number: string;
    dob?: string;
    address?: string;
  };
  payer: {
    name: string;
    payer_id: string;
    claim_number?: string;
    authorization_number?: string;
  };
  line_items: {
    service_date: string;
    code: string;
    code_type: 'CPT' | 'HCPCS' | 'Revenue' | 'ICD10-PCS';
    modifier?: string[];
    description: string;
    units: number;
    billed_amount: number;
    allowed_amount?: number;
    adjustment_amount?: number;
    patient_responsibility?: number;
    diagnosis_pointers?: string[];
  }[];
  diagnoses: {
    code: string;
    description: string;
    pointer: string;
  }[];
  totals: {
    total_charges: number;
    total_allowed: number;
    total_adjustments: number;
    insurance_paid: number;
    patient_responsibility: number;
    previous_balance?: number;
    current_balance: number;
  };
  payment_info: {
    payment_terms?: string;
    payment_due_date: string;
    accepted_payment_methods?: string[];
  };
}
```

---

## Insurance Card Processing: Claude AI (CONFIRMED)

### Why Claude for Insurance Cards?

1. **Policy Complexity**: Superior understanding of complex policy structures
2. **Coverage Inference**: Can infer coverage details from plan types and codes
3. **Variant Detection**: Distinguishes Pharmacy/Medical/Dental/Medicaid variants
4. **Abbreviation Expansion**: Accurate interpretation of industry abbreviations

### Insurance Card Entity Extraction Schema

```typescript
interface InsuranceCardExtraction {
  member_info: {
    member_id: string;
    group_number: string;
    member_name: string;
    dependent_names?: string[];
    effective_date: string;
    termination_date?: string;
    relationship?: 'self' | 'spouse' | 'child' | 'other';
  };
  plan_info: {
    plan_name: string;
    plan_type: 'HMO' | 'PPO' | 'EPO' | 'POS' | 'HDHP' | 'Medicaid' | 'Medicare';
    payer_id: string;
    payer_name: string;
    network_tier?: 'in-network' | 'out-of-network';
  };
  pharmacy_info?: {
    bin: string;
    pcn: string;
    rx_group: string;
    rx_id?: string;
  };
  contact_info: {
    customer_service: string;
    provider_services?: string;
    claims_address: string;
    pharmacy_help?: string;
    mental_health?: string;
    prior_auth?: string;
  };
  coverage_details: {
    copay_pcp: number;
    copay_specialist: number;
    copay_urgent_care?: number;
    copay_er: number;
    deductible_individual?: number;
    deductible_family?: number;
    oop_max_individual?: number;
    oop_max_family?: number;
    coinsurance?: number;
  };
  card_metadata: {
    card_type: 'medical' | 'pharmacy' | 'dental' | 'vision' | 'combined';
    issuer_logo_detected: boolean;
    card_version?: string;
  };
}
```

---

## Patient Forms Processing: Gemini (CONFIRMED)

### Why Gemini for Patient Forms?

1. **Speed**: Fastest processing for high-volume form intake
2. **Handwriting Recognition**: Good at deciphering handwritten entries
3. **Form Structure**: Efficient checkbox, radio button, and field extraction
4. **Cost Efficiency**: Lower cost for standard forms

### Patient Form Entity Extraction Schema

```typescript
interface PatientFormExtraction {
  patient_demographics: {
    first_name: string;
    middle_name?: string;
    last_name: string;
    preferred_name?: string;
    dob: string;
    ssn_last_four?: string;
    gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    marital_status?: string;
    preferred_language?: string;
    race?: string;
    ethnicity?: string;
  };
  contact_info: {
    address: {
      street: string;
      apartment?: string;
      city: string;
      state: string;
      zip: string;
    };
    phone_home?: string;
    phone_mobile: string;
    phone_work?: string;
    email?: string;
    preferred_contact: 'phone' | 'email' | 'text';
  };
  emergency_contact: {
    name: string;
    relationship: string;
    phone: string;
    address?: string;
  };
  medical_history: {
    current_conditions: string[];
    past_conditions: string[];
    surgeries: { procedure: string; year: string }[];
    allergies: { allergen: string; reaction: string }[];
    current_medications: { name: string; dosage: string; frequency: string }[];
    family_history?: { condition: string; relation: string }[];
  };
  insurance_info: {
    has_insurance: boolean;
    primary_insurance?: {
      company: string;
      policy_number: string;
      group_number?: string;
      subscriber_name: string;
      subscriber_dob?: string;
      relationship: string;
    };
    secondary_insurance?: {
      company: string;
      policy_number: string;
      group_number?: string;
    };
  };
  consent_signatures: {
    hipaa_consent: { signed: boolean; date?: string };
    treatment_consent: { signed: boolean; date?: string };
    financial_responsibility: { signed: boolean; date?: string };
    release_of_information?: { signed: boolean; date?: string };
  };
}
```

---

## Fallback Strategy

```typescript
const FALLBACK_CHAIN: Record<DocumentType, string[]> = {
  'prescription': ['claude', 'gemini', 'openai'],
  'medical_imaging': ['gemini+claude', 'gemini', 'claude'],
  'insurance_card': ['claude', 'gemini', 'openai'],
  'invoice': ['openai', 'claude', 'gemini'],
  'patient_form': ['gemini', 'claude', 'openai'],
};
```

### Fallback Trigger Conditions
- Primary model timeout (>30 seconds)
- Primary model rate limit exceeded
- Primary model returns confidence <70%
- Primary model API error

---

## API Key Requirements

| Provider | Secret Name | Purpose | Status |
|----------|-------------|---------|--------|
| Google Gemini | Via Lovable AI Gateway | Gemini for forms, vision analysis | ✅ Configured |
| Anthropic | `ANTHROPIC_API_KEY` | Claude for prescriptions, clinical synthesis, insurance | ⚠️ Need to add |
| OpenAI | `OPENAI_API_KEY` | GPT for invoices/RCM processing | ⚠️ Need to add |

---

## Edge Function Structure

```
supabase/functions/
├── document-nlp-router/
│   ├── index.ts                    # Main router entry point
│   ├── types/
│   │   ├── extraction-schemas.ts   # All TypeScript interfaces
│   │   └── router-types.ts         # Router configuration types
│   ├── routers/
│   │   ├── prescription-router.ts  # Claude AI processing
│   │   ├── imaging-router.ts       # Gemini → Claude pipeline
│   │   ├── insurance-router.ts     # Claude AI processing
│   │   ├── invoice-router.ts       # OpenAI GPT processing
│   │   └── patient-form-router.ts  # Gemini processing
│   ├── processors/
│   │   ├── claude-processor.ts     # Anthropic API integration
│   │   ├── gemini-processor.ts     # Gemini via Lovable AI
│   │   └── openai-processor.ts     # OpenAI API integration
│   ├── prompts/
│   │   ├── prescription-prompts.ts
│   │   ├── imaging-prompts.ts
│   │   ├── insurance-prompts.ts
│   │   ├── invoice-prompts.ts
│   │   └── patient-form-prompts.ts
│   └── utils/
│       ├── response-formatter.ts   # Unified output formatting
│       ├── fallback-handler.ts     # Fallback logic
│       └── confidence-scorer.ts    # Extraction confidence scoring
```

---

## Implementation Phases

### Phase 1: Core Infrastructure (Days 1-2)
- [ ] Create edge function `document-nlp-router` structure
- [ ] Implement TypeScript interfaces for all schemas
- [ ] Set up Claude processor with ANTHROPIC_API_KEY
- [ ] Set up OpenAI processor with OPENAI_API_KEY
- [ ] Configure Gemini processor via Lovable AI gateway

### Phase 2: Document Routers (Days 3-5)
- [ ] Implement prescription router (Claude)
- [ ] Implement invoice router (OpenAI)
- [ ] Implement insurance card router (Claude)
- [ ] Implement patient form router (Gemini)

### Phase 3: Medical Imaging Pipeline (Days 6-8)
- [ ] Implement Gemini Vision analysis stage
- [ ] Implement Claude clinical synthesis stage
- [ ] Create sequential pipeline coordinator
- [ ] Test with X-Ray, CT, MRI, Ultrasound, ECG samples

### Phase 4: Integration & Testing (Days 9-10)
- [ ] Integrate with existing document processing flow
- [ ] Add fallback handling and retry logic
- [ ] Performance optimization and caching
- [ ] Comprehensive testing with real documents
- [ ] Update UI to show model used per extraction

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Prescription extraction accuracy | ~85% | >95% |
| Invoice table extraction accuracy | ~80% | >92% |
| Insurance card parsing accuracy | ~82% | >90% |
| Medical imaging analysis accuracy | ~75% | >88% |
| Patient form field extraction | ~88% | >92% |
| Average processing time (non-imaging) | ~4s | <3s |
| Medical imaging pipeline time | N/A | <8s |
| Fallback trigger rate | N/A | <5% |

---

## Cost Optimization

| Model | Input Cost (per 1M tokens) | Output Cost (per 1M tokens) |
|-------|---------------------------|----------------------------|
| Gemini 2.5 Flash | $0.01 | $0.04 |
| Claude 3.5 Sonnet | $3.00 | $15.00 |
| GPT-4o | $5.00 | $15.00 |

**Strategy:**
- Use Gemini as primary for high-volume, simpler documents (patient forms)
- Use premium models (Claude/OpenAI) only where they significantly outperform
- Implement caching for repeated extractions
- Use Gemini as final fallback for cost efficiency

---

## Confirmed Decisions

| Question | Decision |
|----------|----------|
| Model selection | ✅ Automatic based on document type (no user override needed initially) |
| Priority | ✅ Accuracy over cost (use best model per document type) |
| Medical imaging pipeline | ✅ Sequential (Gemini Vision → Claude) |
| Alternative drugs for prescriptions | ✅ Claude AI (clinical reasoning strength) |
| Model usage analytics | ✅ Yes - track for optimization |

---

**Last Updated:** 2025-01-19  
**Status:** ✅ Strategy Finalized - Ready for Implementation  
**Next Step:** Add ANTHROPIC_API_KEY and OPENAI_API_KEY secrets, then begin Phase 1
