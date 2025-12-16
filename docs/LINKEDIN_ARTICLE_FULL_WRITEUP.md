# Building an AI-Powered Document Processing Platform in 56 Hours

## How I Built a Multi-Paradigm Healthcare Document Intelligence System Over a Weekend

---

### The Challenge

Healthcare organizations process thousands of documents daily—prescriptions, insurance cards, medical images, invoices, patient intake forms. Each document type requires **fundamentally different AI approaches**:

- **Prescriptions** need medication extraction and NDC lookups
- **Insurance cards** require variant detection (Pharmacy vs Medical vs Medicaid)
- **X-rays and MRIs** need vision AI clinical analysis, not text extraction
- **Invoices** need line-item parsing and RCM (Revenue Cycle Management) analytics

Building separate systems for each? That's months of development. I built a **unified platform handling all of them** in 56 hours.

---

### The Solution: Three-Paradigm Intelligent Routing

Instead of one-size-fits-all OCR, I architected a system that **auto-detects document type** and routes to the appropriate processing paradigm:

**Paradigm 1: Field Extraction**
For prescriptions, insurance cards, patient forms—dynamically extracts visible fields, applies fuzzy matching, performs domain-specific lookups (NDC codes, clinical recommendations).

**Paradigm 2: Medical Image Analysis**
For X-rays, CT scans, MRIs, ECGs—vision AI analyzes images to generate clinical insights. No OCR—pure image understanding with CNN feature extraction + LLM clinical reasoning.

**Paradigm 3: Table/RCM Processing**
For invoices, billing, claims—extracts line items and tables, consolidates financial metrics, performs accounts receivable analytics.

---

### Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                         DOCUMENT UPLOAD                                 │
│                    (Drag & Drop / Camera / File)                       │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                          Auto-Type Detection
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    INTELLIGENT ROUTING ENGINE                           │
│                                                                         │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐               │
│   │ Prescription│    │  Insurance  │    │   Medical   │               │
│   │   Invoice   │    │    Card     │    │   Imaging   │               │
│   │   Patient   │    │   Variants  │    │   X-ray/CT  │               │
│   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘               │
│          │                  │                  │                        │
│          ▼                  ▼                  ▼                        │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐               │
│   │   PARADIGM  │    │   PARADIGM  │    │   PARADIGM  │               │
│   │      1      │    │      1      │    │      2      │               │
│   │   Field     │    │   Field +   │    │   Vision    │               │
│   │ Extraction  │    │   Variant   │    │     AI      │               │
│   └─────────────┘    └─────────────┘    └─────────────┘               │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                          Processing Results
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         OUTPUT OPTIONS                                  │
│                                                                         │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐               │
│   │  Save to    │    │  Export via │    │  Generate   │               │
│   │  History    │    │  MCP SDK    │    │  Sub-Agent  │               │
│   │             │    │  to CRM     │    │  Workflow   │               │
│   └─────────────┘    └─────────────┘    └─────────────┘               │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Implementation Deep Dive

#### 1. Two-Stage Extraction Pipeline

The extraction pipeline uses a **two-stage approach** for maximum accuracy:

**Stage 1: Google Vision OCR** extracts raw text from the document.

**Stage 2: Gemini NLP** performs intelligent entity extraction from the OCR text, understanding context and relationships.

```typescript
// document-processor edge function

// Stage 1: Google Vision OCR
const visionResponse = await fetch(
  `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_API_KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [{
        image: { content: imageBase64 },
        features: [
          { type: 'TEXT_DETECTION', maxResults: 50 },
          { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }
        ]
      }]
    })
  }
);

const visionData = await visionResponse.json();
const extractedText = visionData.responses[0]?.fullTextAnnotation?.text || '';

// Stage 2: Gemini NLP Entity Extraction
const geminiResponse = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Extract structured entities from this ${documentType} document text.
          
Document Text:
${extractedText}

Extract ALL visible information. Return as JSON with field names and values.
Do NOT include fields that are not present in the document.`
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4096
      }
    })
  }
);
```

#### 2. Insurance Card Variant Detection

Insurance cards aren't all the same. The system auto-detects between:

- **Pharmacy Insurance**: BIN, PCN, copay per-prescription
- **Medical Insurance**: Member ID, deductible, coinsurance, out-of-pocket max
- **Medicaid**: State program info, eligible services

```typescript
// Insurance variant detection via Gemini

const variantPrompt = `Analyze this insurance card and determine:
1. Insurance Type: "pharmacy" | "medical" | "medicaid"
2. Extract variant-specific fields

For Pharmacy: BIN, PCN, Group, Copay, Deductible
For Medical: Member ID, Group Number, Deductible, Coinsurance, OOP Max, Network
For Medicaid: State, Program Name, Eligible Services, Coverage Limits

Expand abbreviations:
- DED = Deductible
- OOP = Out of Pocket Maximum
- BIN = Bank Identification Number
- PCN = Processor Control Number

Return structured JSON with detected_variant and extracted_fields.`;
```

#### 3. Multi-Medication Prescription Processing

Real prescriptions often contain multiple medications. The system extracts ALL medications and performs separate lookups for each:

```typescript
// Extract all medications from prescription
const medications = extractedData.medications || [extractedData.medication];

// Perform NDC/clinical lookup for each medication
const medicationResults = await Promise.all(
  medications.map(async (med) => {
    // OpenFDA NDC Lookup
    const fdaResponse = await fetch(
      `https://api.fda.gov/drug/ndc.json?search=brand_name:"${encodeURIComponent(med.name)}"&limit=5`
    );
    const fdaData = await fdaResponse.json();
    
    // RxNorm for drug interactions
    const rxNormResponse = await fetch(
      `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(med.name)}`
    );
    const rxData = await rxNormResponse.json();
    
    return {
      medication: med,
      ndc_codes: fdaData.results?.map(r => r.product_ndc),
      clinical_info: rxData.drugGroup?.conceptGroup,
      alternatives: await fetchAlternatives(med.name),
      interactions: await fetchInteractions(med.name)
    };
  })
);
```

---

### Medical Imaging: A Different Paradigm

Medical images (X-rays, CT scans, MRIs) require **vision AI analysis**, not text extraction. I built a multi-model pipeline:

#### CNN + Vision AI + LLM Stack

```typescript
// Medical Imaging AI Model Types

export const AI_MODEL_TYPES = {
  'cnn': {
    name: 'CNN (Convolutional Neural Network)',
    description: 'Pattern recognition - identifies shapes, textures, anomalies',
    bestFor: ['Cancer detection', 'Fracture identification', 'Classification']
  },
  'u-net': {
    name: 'U-Net',
    description: 'Precise segmentation - outlines organs and abnormal regions',
    bestFor: ['Tumor segmentation', 'Organ delineation', 'Brain MRI analysis']
  },
  'yolo': {
    name: 'YOLO',
    description: 'Fast object detection - pinpoints anomalies quickly',
    bestFor: ['Real-time detection', 'Mass localization', 'Quick screening']
  },
  'faster-rcnn': {
    name: 'Faster R-CNN',
    description: 'High-precision detection with region proposals',
    bestFor: ['Mammography', 'Small lesion detection', 'Microcalcifications']
  },
  'rnn': {
    name: 'RNN',
    description: 'Sequential/time-series analysis',
    bestFor: ['ECG analysis', 'Temporal patterns', 'Signal processing']
  },
  'llm': {
    name: 'LLM (Gemini/GPT-4 Vision)',
    description: 'Clinical report generation with natural language',
    bestFor: ['Report generation', 'Clinical summaries', 'Findings documentation']
  }
};

// Modality-to-Model Mapping
export const MODALITY_CONFIGS = {
  'xray': { recommendedModel: 'cnn', capabilities: ['Pneumonia', 'TB', 'Fractures', 'Cardiomegaly'] },
  'ct-scan': { recommendedModel: 'u-net', capabilities: ['Hemorrhage', 'Tumors', 'Lung cancer'] },
  'mri': { recommendedModel: 'u-net', capabilities: ['Brain tumors', 'MS lesions', 'Alzheimer'] },
  'ecg': { recommendedModel: 'rnn', capabilities: ['Arrhythmia', 'AFib', 'MI detection'] },
  'mammogram': { recommendedModel: 'faster-rcnn', capabilities: ['Mass detection', 'BI-RADS scoring'] }
};
```

#### Clinical Insights Output

The vision AI produces structured clinical insights:

```typescript
interface MedicalAnalysisResult {
  provider: string;           // 'gemini' | 'aws-rekognition' | 'azure-health'
  modelUsed: string;          // 'cnn' | 'u-net' | 'yolo' | etc.
  modality: string;           // 'xray' | 'ct-scan' | 'mri' | etc.
  
  insights: {
    category: 'finding' | 'observation' | 'recommendation' | 'concern';
    description: string;
    confidence: number;
    clinicalSignificance: 'low' | 'medium' | 'high' | 'critical';
    anatomicalLocation: string;
    differentialDiagnosis: string[];
    followUpRecommendation: string;
  }[];
  
  measurements: {
    name: string;
    value: number;
    unit: string;
    normalRange: { min: number; max: number };
    status: 'normal' | 'borderline' | 'abnormal';
  }[];
  
  overallAssessment: string;
  urgency: 'routine' | 'priority' | 'urgent' | 'emergent';
}
```

---

### MCP SDK Integration for CRM Export

After extraction, users can push data to CRM systems via the **Model Context Protocol (MCP) SDK**:

```typescript
// MCP SDK Three-Phase Architecture

// Phase A: Server-side tool implementation
const mcpTools = {
  'insert_claim': {
    description: 'Create insurance claim in CRM',
    parameters: {
      policy_id: 'string',
      patient_name: 'string',
      diagnosis_codes: 'array',
      amount: 'number'
    },
    execute: async (params) => {
      // Real API call to Salesforce/HubSpot/Veeva
      const result = await salesforceClient.create('Claim__c', params);
      return { success: true, record_id: result.id };
    }
  },
  'update_patient_record': {
    description: 'Update patient information',
    parameters: { patient_id: 'string', updates: 'object' },
    execute: async (params) => {
      // Real API call to EHR system
      return await ehrClient.update(params.patient_id, params.updates);
    }
  }
};

// Phase B: Client-side tool discovery and invocation
const availableTools = await mcpClient.listTools();
const toolCall = {
  tool: 'insert_claim',
  arguments: {
    policy_id: extractedData.policy_number,
    patient_name: extractedData.patient_name,
    diagnosis_codes: extractedData.icd_codes,
    amount: extractedData.claim_amount
  }
};

// Phase C: Execute and confirm
const result = await mcpClient.callTool(toolCall);
// Returns: { success: true, record_id: '001ABC123...' }
```

---

### Sub-Agent Generation from Document Context

When documents are processed, the system recommends **follow-up AI agents** based on extracted context:

```typescript
// Document type → Sub-agent mapping

const SUB_AGENT_MAPPING = {
  'prescription': [
    { id: 'drug-interaction-checker', name: 'Drug Interaction Checker' },
    { id: 'pharmacy-finder', name: 'Pharmacy Finder Agent' },
    { id: 'refill-reminder', name: 'Refill Reminder Agent' }
  ],
  'insurance_card': [
    { id: 'eligibility-verifier', name: 'Insurance Eligibility Verifier' },
    { id: 'prior-auth', name: 'Prior Authorization Agent' },
    { id: 'benefits-explainer', name: 'Benefits Explanation Agent' }
  ],
  'xray': [
    { id: 'radiology-follow-up', name: 'Radiology Follow-Up Agent' },
    { id: 'specialist-referral', name: 'Specialist Referral Agent' },
    { id: 'second-opinion', name: 'Second Opinion Coordinator' }
  ],
  'invoice': [
    { id: 'payment-processor', name: 'Payment Processing Agent' },
    { id: 'dispute-handler', name: 'Billing Dispute Handler' },
    { id: 'rcm-analyzer', name: 'Revenue Cycle Analyzer' }
  ]
};

// Auto-generate workflow nodes for selected agents
const generateAgentWorkflow = (selectedAgents, documentContext) => {
  return {
    nodes: [
      { id: 'start', type: 'trigger', data: { source: 'document-processing' } },
      ...selectedAgents.map((agent, i) => ({
        id: agent.id,
        type: 'agent-node',
        data: { 
          agentType: agent.id,
          inputContext: documentContext,
          position: i + 1
        }
      })),
      { id: 'end', type: 'output', data: { returnTo: 'document-processing' } }
    ],
    edges: generateSequentialEdges(selectedAgents)
  };
};
```

---

### Configuration-Driven Architecture

The entire system is **configuration-driven**, allowing new document types without code changes:

```typescript
// documentTypes.ts

export const DOCUMENT_TYPE_CONFIGS = {
  prescription: {
    id: 'prescription',
    label: 'Prescription / Rx',
    category: 'healthcare',
    icon: 'pill',
    paradigm: 'field-extraction',
    targetFields: ['patient_name', 'medication', 'dosage', 'frequency', 'prescriber', 'npi'],
    specialTabs: ['medication-lookup', 'clinical-recommendations'],
    processingHints: {
      enableNDCLookup: true,
      enableDrugInteractions: true,
      enableMultiMedication: true
    }
  },
  'insurance_card': {
    id: 'insurance_card',
    label: 'Insurance Card',
    category: 'healthcare',
    icon: 'credit-card',
    paradigm: 'field-extraction',
    targetFields: ['member_id', 'group_number', 'payer_name', 'plan_type'],
    specialTabs: ['variant-detection', 'eligibility-check'],
    processingHints: {
      enableVariantDetection: true,
      variants: ['pharmacy', 'medical', 'medicaid']
    }
  },
  'xray': {
    id: 'xray',
    label: 'X-Ray',
    category: 'medical-imaging',
    icon: 'scan',
    paradigm: 'vision-analysis',
    specialTabs: ['clinical-insights', 'measurements', 'report'],
    processingHints: {
      enableImageAnalysis: true,
      recommendedModel: 'cnn',
      capabilities: ['pneumonia', 'fractures', 'cardiomegaly']
    }
  }
};
```

---

### The 56-Hour Timeline

**Hours 1-8**: Architecture design, document type configuration system
**Hours 9-16**: Two-stage OCR + NLP extraction pipeline (Google Vision + Gemini)
**Hours 17-24**: Insurance card variant detection, prescription multi-medication extraction
**Hours 25-32**: Medical imaging vision AI integration (CNN models, clinical insights)
**Hours 33-40**: MCP SDK export layer for CRM integration
**Hours 41-48**: Sub-agent generation workflow, canvas builder integration
**Hours 49-56**: UI polish, real-time extraction visualization, PDF report generation

---

### Key Learnings

1. **Paradigm separation is critical**: OCR doesn't work for medical images. Vision AI doesn't work for text extraction. Route intelligently.

2. **Two-stage extraction beats single-stage**: OCR for raw text, then NLP for intelligent entity extraction.

3. **Configuration over code**: New document types shouldn't require code changes.

4. **Multi-provider abstraction**: Support Google, Azure, AWS—let users choose based on their compliance needs.

5. **Zero hardcoding**: Extract only what's visible in the document. Never assume fields exist.

---

### Tech Stack

- **Frontend**: React 18 + TypeScript + TailwindCSS + Shadcn/UI
- **Backend**: Supabase Edge Functions (Deno)
- **OCR**: Google Cloud Vision API
- **NLP**: Google Gemini 2.5-flash
- **Medical Imaging**: Gemini Pro Vision, Azure Health Insights, AWS Rekognition Medical
- **Drug Data**: OpenFDA API, RxNorm
- **State Management**: TanStack Query
- **Export**: MCP SDK for CRM integration

---

### What's Next?

- DICOM viewer integration for medical imaging
- Real-time HL7 FHIR message generation
- Multi-document batch processing
- Custom document type builder UI

---

*Disclaimer: This AI system assists healthcare professionals and does not replace clinical judgment. All findings should be verified by qualified medical professionals.*

---

**#HealthcareAI #DocumentProcessing #ComputerVision #MedicalImaging #CNN #DeepLearning #GeminiAI #TypeScript #React #Supabase #OCR #NLP #RCM #InsuranceTech #HealthTech #AIEngineering**
