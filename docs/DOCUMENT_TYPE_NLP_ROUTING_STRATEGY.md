# Document-Type Aware NLP Model Routing Strategy

## Overview

This document outlines the implementation strategy for intelligent NLP model routing in **Stage 2 (Entity Extraction)** of the document processing pipeline. Stage 1 (Google Vision OCR) remains unchanged.

---

## Current Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CURRENT PIPELINE (Single Model)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Document Upload → Stage 1: Google Vision OCR → Stage 2: Gemini NLP → Output│
│                            (unchanged)              (single model)          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Proposed Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PROPOSED PIPELINE (Multi-Model Routing)                   │
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
│                    │    Claude AI        OpenAI/Claude    Gemini Pro    │  │
│                    │  (Clinical Data)   (Tables/RCM)    (Vision + NLP) │  │
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

## Model Strengths by Document Type

### 1. **Prescriptions** → Claude AI (Primary)

| Capability | Why Claude Excels |
|------------|-------------------|
| Clinical terminology | Superior medical knowledge, accurate drug name extraction |
| Dosage interpretation | Better at parsing complex sig codes (e.g., "1 tab PO BID PRN") |
| Drug interactions | Can identify potential interactions during extraction |
| Alternative suggestions | Clinical reasoning for therapeutic alternatives |
| Handwriting context | Better contextual inference for ambiguous handwritten text |

**Fallback:** Gemini → OpenAI

### 2. **Invoices/RCM** → OpenAI GPT-4 or Claude (Primary)

| Capability | Why OpenAI/Claude Excels |
|------------|--------------------------|
| Table extraction | Superior structured data parsing |
| Line item detection | Accurate identification of billing rows |
| Financial calculations | Better at numeric accuracy and arithmetic |
| Code recognition | CPT, HCPCS, Revenue Code identification |
| Multi-format handling | Adapts to various invoice layouts |

**Recommended:** OpenAI for tables, Claude for complex billing narratives
**Fallback:** Gemini

### 3. **Insurance Cards** → Claude AI (Primary)

| Capability | Why Claude Excels |
|------------|-------------------|
| Variant detection | Better at distinguishing Pharmacy/Medical/Medicaid |
| Abbreviation expansion | DED, OOP, BIN, PCN interpretation |
| Policy structure | Understanding coverage hierarchies |
| Network interpretation | PPO, HMO, EPO type identification |

**Fallback:** OpenAI → Gemini

### 4. **Medical Imaging** → Gemini Pro Vision + Claude (Hybrid)

| Stage | Model | Purpose |
|-------|-------|---------|
| Visual Analysis | Gemini Pro Vision | Image understanding, modality detection |
| Clinical Narrative | Claude | Medical interpretation, findings summary |
| Differential Diagnosis | Claude | Scientific reasoning, pattern correlation |

**Why Hybrid:**
- Gemini excels at visual pattern recognition
- Claude excels at clinical narrative generation
- Combined provides comprehensive imaging reports

### 5. **Patient Onboarding Forms** → Gemini (Primary)

| Capability | Why Gemini Excels |
|------------|-------------------|
| Form field mapping | Good at structured form extraction |
| Multi-language | Better multilingual support |
| Speed | Faster processing for standard forms |

**Fallback:** Claude → OpenAI

---

## Implementation Strategy

### Phase 1: Configuration Layer

Create a model routing configuration that maps document types to optimal models:

```typescript
// src/config/nlpModelRouting.ts

export interface NLPModelConfig {
  primary: 'gemini' | 'claude' | 'openai';
  fallback: ('gemini' | 'claude' | 'openai')[];
  promptTemplate: string;
  specializations: string[];
  temperature: number;
  maxTokens: number;
}

export const NLP_MODEL_ROUTING: Record<string, NLPModelConfig> = {
  prescription: {
    primary: 'claude',
    fallback: ['gemini', 'openai'],
    promptTemplate: 'prescription_extraction',
    specializations: ['clinical_terminology', 'drug_interactions', 'sig_parsing'],
    temperature: 0.1,  // Low for accuracy
    maxTokens: 2000
  },
  
  invoice: {
    primary: 'openai',
    fallback: ['claude', 'gemini'],
    promptTemplate: 'invoice_extraction',
    specializations: ['table_extraction', 'financial_parsing', 'code_recognition'],
    temperature: 0.0,  // Zero for numeric accuracy
    maxTokens: 3000
  },
  
  insurance_card: {
    primary: 'claude',
    fallback: ['openai', 'gemini'],
    promptTemplate: 'insurance_extraction',
    specializations: ['variant_detection', 'abbreviation_expansion'],
    temperature: 0.1,
    maxTokens: 1500
  },
  
  medical_imaging: {
    primary: 'gemini',  // For vision
    fallback: ['claude'],
    promptTemplate: 'imaging_analysis',
    specializations: ['visual_analysis', 'clinical_findings'],
    temperature: 0.3,  // Slightly higher for clinical reasoning
    maxTokens: 4000
  },
  
  patient_onboarding: {
    primary: 'gemini',
    fallback: ['claude', 'openai'],
    promptTemplate: 'form_extraction',
    specializations: ['field_mapping', 'validation'],
    temperature: 0.1,
    maxTokens: 2000
  }
};
```

### Phase 2: Prompt Templates per Document Type

```typescript
// src/config/nlpPromptTemplates.ts

export const NLP_PROMPT_TEMPLATES = {
  prescription_extraction: {
    claude: `You are a clinical pharmacist AI assistant specializing in prescription analysis.
    
TASK: Extract ALL medications and clinical data from the following OCR text.

CRITICAL REQUIREMENTS:
1. Extract EVERY medication mentioned (prescriptions often have multiple drugs)
2. Parse sig codes accurately (e.g., "1 tab PO BID PRN" = 1 tablet, by mouth, twice daily, as needed)
3. Identify potential drug interactions if multiple medications present
4. Suggest therapeutic alternatives when appropriate
5. Flag any concerning dosages or contraindications

OCR TEXT:
{ocr_text}

Return JSON with this structure:
{
  "medications": [
    {
      "name": "drug name",
      "strength": "dosage strength",
      "form": "tablet/capsule/liquid",
      "quantity": number,
      "sig": "original sig code",
      "sig_parsed": {
        "dose": "amount per administration",
        "route": "oral/topical/etc",
        "frequency": "times per day",
        "duration": "days/weeks",
        "prn": boolean,
        "instructions": "special instructions"
      },
      "refills": number,
      "daw": boolean
    }
  ],
  "prescriber": {
    "name": "",
    "npi": "",
    "dea": "",
    "phone": "",
    "address": ""
  },
  "patient": {
    "name": "",
    "dob": "",
    "address": ""
  },
  "pharmacy": {
    "name": "",
    "phone": "",
    "address": ""
  },
  "clinical_flags": [
    {
      "type": "interaction|dosage_concern|contraindication",
      "message": "",
      "severity": "low|medium|high"
    }
  ],
  "date_written": "",
  "date_filled": ""
}`,

    gemini: `Extract prescription data from OCR text...`, // Simplified fallback
    openai: `Extract prescription data from OCR text...`  // Simplified fallback
  },

  invoice_extraction: {
    openai: `You are a healthcare revenue cycle management specialist.

TASK: Extract all financial and billing data from this invoice OCR text.

REQUIREMENTS:
1. Identify ALL line items with their codes and amounts
2. Detect code types: CPT, HCPCS, Revenue Codes, ICD-10
3. Extract totals: billed, allowed, adjustment, patient responsibility
4. Identify payer information
5. Flag any coding inconsistencies

OCR TEXT:
{ocr_text}

Return JSON:
{
  "invoice_number": "",
  "date_of_service": "",
  "billing_provider": {},
  "patient": {},
  "payer": {},
  "line_items": [
    {
      "code": "",
      "code_type": "CPT|HCPCS|Revenue|ICD10",
      "description": "",
      "units": number,
      "billed_amount": number,
      "allowed_amount": number,
      "adjustment": number,
      "patient_responsibility": number
    }
  ],
  "totals": {
    "total_billed": number,
    "total_allowed": number,
    "total_adjustment": number,
    "total_patient_responsibility": number,
    "amount_paid": number,
    "balance_due": number
  },
  "coding_flags": []
}`,

    claude: `...`, // Alternative template
    gemini: `...`  // Alternative template
  },

  imaging_analysis: {
    gemini: `You are a radiologist AI assistant analyzing medical imaging.

TASK: Analyze this medical image and provide clinical insights.

IMAGE CONTEXT:
{ocr_text}

Provide:
1. Imaging modality detection (X-ray, CT, MRI, etc.)
2. Anatomical region identification
3. Key findings and observations
4. Measurements against normal ranges
5. Potential abnormalities with confidence scores
6. Recommended follow-up if needed

Return structured clinical report...`,

    claude: `...` // For clinical narrative generation
  }
};
```

### Phase 3: Model Router Service

```typescript
// src/services/nlpModelRouter.ts

import { NLP_MODEL_ROUTING, NLPModelConfig } from '@/config/nlpModelRouting';
import { NLP_PROMPT_TEMPLATES } from '@/config/nlpPromptTemplates';

export class NLPModelRouter {
  
  /**
   * Route to optimal NLP model based on document type
   */
  async extractEntities(
    documentType: string,
    ocrText: string,
    imageBase64?: string
  ): Promise<ExtractionResult> {
    
    const config = NLP_MODEL_ROUTING[documentType] || NLP_MODEL_ROUTING['patient_onboarding'];
    const models = [config.primary, ...config.fallback];
    
    for (const model of models) {
      try {
        const result = await this.callModel(model, documentType, ocrText, imageBase64, config);
        
        if (result.success) {
          return {
            ...result,
            modelUsed: model,
            documentType
          };
        }
      } catch (error) {
        console.warn(`Model ${model} failed for ${documentType}, trying fallback...`);
        continue;
      }
    }
    
    throw new Error(`All models failed for document type: ${documentType}`);
  }
  
  private async callModel(
    model: 'gemini' | 'claude' | 'openai',
    documentType: string,
    ocrText: string,
    imageBase64: string | undefined,
    config: NLPModelConfig
  ): Promise<any> {
    
    const promptTemplate = NLP_PROMPT_TEMPLATES[config.promptTemplate]?.[model];
    const prompt = promptTemplate.replace('{ocr_text}', ocrText);
    
    switch (model) {
      case 'gemini':
        return this.callGemini(prompt, imageBase64, config);
      case 'claude':
        return this.callClaude(prompt, config);
      case 'openai':
        return this.callOpenAI(prompt, config);
    }
  }
  
  private async callGemini(prompt: string, imageBase64: string | undefined, config: NLPModelConfig) {
    // Use existing Gemini integration via Universal AI
    // Supports vision for medical imaging
  }
  
  private async callClaude(prompt: string, config: NLPModelConfig) {
    // Use Anthropic Claude API
    // Best for clinical reasoning and structured extraction
  }
  
  private async callOpenAI(prompt: string, config: NLPModelConfig) {
    // Use OpenAI GPT-4 API
    // Best for tables and financial data
  }
}
```

### Phase 4: Edge Function Updates

```typescript
// supabase/functions/document-processor/index.ts (modifications)

// Add model routing logic
async function processStage2(
  ocrText: string,
  documentType: string,
  imageBase64?: string
): Promise<ExtractionResult> {
  
  const modelConfig = getModelConfigForDocumentType(documentType);
  
  // Try primary model first
  try {
    return await extractWithModel(
      modelConfig.primary,
      ocrText,
      documentType,
      imageBase64,
      modelConfig
    );
  } catch (primaryError) {
    console.log(`Primary model ${modelConfig.primary} failed, trying fallback...`);
    
    // Try fallback models
    for (const fallbackModel of modelConfig.fallback) {
      try {
        return await extractWithModel(
          fallbackModel,
          ocrText,
          documentType,
          imageBase64,
          modelConfig
        );
      } catch (fallbackError) {
        continue;
      }
    }
    
    throw new Error('All NLP models failed');
  }
}

async function extractWithModel(
  model: string,
  ocrText: string,
  documentType: string,
  imageBase64: string | undefined,
  config: NLPModelConfig
): Promise<ExtractionResult> {
  
  switch (model) {
    case 'claude':
      return await extractWithClaude(ocrText, documentType, config);
    case 'openai':
      return await extractWithOpenAI(ocrText, documentType, config);
    case 'gemini':
    default:
      return await extractWithGemini(ocrText, documentType, imageBase64, config);
  }
}
```

---

## API Key Requirements

| Model | Secret Name | Status |
|-------|-------------|--------|
| Google Gemini | `GEMINI_API_KEY` | ✅ Already configured |
| Anthropic Claude | `ANTHROPIC_API_KEY` | ⚠️ Need to add |
| OpenAI GPT | `OPENAI_API_KEY` | ⚠️ Need to add |

---

## Hybrid Model Approach for Medical Imaging

For medical imaging, we recommend a **two-stage hybrid approach**:

```
┌─────────────────────────────────────────────────────────────────┐
│                 MEDICAL IMAGING HYBRID PIPELINE                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Medical Image                                                 │
│        ↓                                                        │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  Stage 2A: Gemini Pro Vision                             │  │
│   │  - Modality detection (X-ray, CT, MRI, etc.)            │  │
│   │  - Anatomical region identification                      │  │
│   │  - Visual abnormality detection                          │  │
│   │  - Measurement extraction                                │  │
│   └─────────────────────────────────────────────────────────┘  │
│        ↓                                                        │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  Stage 2B: Claude AI (Clinical Narrative)                │  │
│   │  - Medical interpretation of Gemini findings             │  │
│   │  - Differential diagnosis suggestions                    │  │
│   │  - Clinical correlation                                  │  │
│   │  - Report generation in medical terminology              │  │
│   └─────────────────────────────────────────────────────────┘  │
│        ↓                                                        │
│   Comprehensive Imaging Report                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Create `nlpModelRouting.ts` configuration
- [ ] Create `nlpPromptTemplates.ts` with document-specific prompts
- [ ] Add Claude and OpenAI API key secrets

### Phase 2: Backend Integration (Week 1-2)
- [ ] Update `document-processor` edge function with model router
- [ ] Implement Claude API integration
- [ ] Implement OpenAI API integration
- [ ] Add fallback logic with retry mechanism

### Phase 3: Testing & Validation (Week 2)
- [ ] Test prescription extraction with Claude vs Gemini
- [ ] Test invoice extraction with OpenAI vs Claude
- [ ] Test medical imaging with Gemini+Claude hybrid
- [ ] Validate accuracy improvements with test dataset

### Phase 4: UI Updates (Week 2-3)
- [ ] Add model selection indicator in extraction results
- [ ] Show which model was used for extraction
- [ ] Add model preference override in settings (optional)

---

## Expected Accuracy Improvements

| Document Type | Current (Gemini Only) | Expected (Multi-Model) |
|---------------|----------------------|------------------------|
| Prescriptions | ~85% | ~95% (Claude) |
| Invoices/Tables | ~80% | ~92% (OpenAI) |
| Insurance Cards | ~82% | ~90% (Claude) |
| Medical Imaging | ~75% | ~88% (Gemini+Claude) |
| Patient Forms | ~88% | ~90% (Gemini) |

---

## Cost Considerations

| Model | Cost per 1K tokens (Input) | Cost per 1K tokens (Output) |
|-------|---------------------------|----------------------------|
| Gemini 2.5 Flash | ~$0.00001 | ~$0.00004 |
| Claude 3.5 Sonnet | ~$0.003 | ~$0.015 |
| GPT-4o | ~$0.005 | ~$0.015 |

**Recommendation:** Use Gemini as fallback for cost efficiency, route to premium models only for document types where they significantly outperform.

---

## Next Steps

1. **Confirm approach** - Review this strategy and confirm document type → model mappings
2. **Add API keys** - Configure ANTHROPIC_API_KEY and OPENAI_API_KEY secrets
3. **Implement Phase 1** - Create configuration files
4. **Implement Phase 2** - Update edge function with multi-model routing
5. **Test and validate** - Compare extraction accuracy across models

---

## Questions to Confirm

1. Should model selection be automatic (recommended) or allow user override?
2. Priority: accuracy vs. cost? (affects fallback order)
3. For medical imaging hybrid: sequential (Gemini → Claude) or parallel?
4. Should we track model usage analytics for optimization?

