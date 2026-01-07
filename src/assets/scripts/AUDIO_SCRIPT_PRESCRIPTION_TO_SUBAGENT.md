# Audio Script: Prescription to Sub-Agent Execution Flow

## Video Title: "From Prescription to Intelligent Action: Sub-Agent Architecture Deep Dive"

---

## INTRODUCTION (0:00 - 0:45)

**[VISUAL: Animated prescription document transforming into multiple AI agent nodes]**

Welcome to the complete walkthrough of our Prescription-to-Sub-Agent execution pipeline. In this video, we'll explore how a simple prescription document triggers an intelligent cascade of specialized AI agents—each handling distinct tasks like drug verification, interaction checking, patient safety validation, and pharmacy routing.

What makes this architecture powerful isn't just automation—it's **contextual intelligence**. Each sub-agent receives precisely the data it needs, executes its specialized function, and contributes results back to a unified outcome. Let's dive into how this works end-to-end.

---

## SECTION 1: THE PRESCRIPTION EXTRACTION PIPELINE (0:45 - 2:30)

**[VISUAL: Two-stage pipeline diagram with OCR and NLP layers]**

### Stage 1: Multi-Provider OCR Layer

When a prescription enters our system, it first hits our **intelligent OCR layer**. This isn't a single-model approach—we use content-aware routing:

- **Google Vision API** handles standard printed prescriptions
- **AWS Textract** excels at structured forms and tables
- **Azure Document Intelligence** processes complex multi-column layouts
- **Gemini Vision** tackles handwritten content with superior accuracy

The system analyzes the document characteristics and routes to the optimal provider—or combines multiple providers for hybrid documents.

### Stage 2: NLP Entity Extraction

Raw OCR text then flows into our **NLP extraction layer**. Here, Gemini 2.5 Flash identifies and structures:

- **Medication entities**: Drug name, dosage, frequency, duration
- **Prescriber information**: Doctor name, license number, DEA number
- **Patient identifiers**: Name, DOB, allergies (if noted)
- **Instruction parsing**: "Take with food", "Avoid alcohol", timing specifics

The output is a **structured prescription object**—clean, validated, and ready for sub-agent consumption.

---

## SECTION 2: SUB-AGENT ARCHITECTURE OVERVIEW (2:30 - 5:00)

**[VISUAL: Radial diagram showing central orchestrator with connected sub-agents]**

### What is a Sub-Agent?

A sub-agent is a **specialized AI unit** designed for a single, focused task. Unlike monolithic AI systems that try to do everything, sub-agents follow the Unix philosophy: do one thing exceptionally well.

### Core Architecture Components

**1. The Orchestrator (Central Controller)**
```
┌─────────────────────────────────────────────────┐
│              ORCHESTRATOR ENGINE                │
│  ┌─────────────────────────────────────────┐   │
│  │  • Receives structured extraction data   │   │
│  │  • Determines required sub-agents        │   │
│  │  • Manages execution order/parallelism   │   │
│  │  • Aggregates results                    │   │
│  │  • Handles failures and retries          │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

The orchestrator is the brain. It receives the extracted prescription data and decides: Which sub-agents need to run? In what order? Can any run in parallel?

**2. Sub-Agent Registry**

Every sub-agent is registered with:
- **Trigger conditions**: What data patterns activate this agent?
- **Required inputs**: What fields must be present?
- **Output schema**: What does this agent return?
- **Dependencies**: Does it need results from other agents first?

**3. Execution Engine Options**

We support multiple execution patterns:

- **Sequential Pipeline**: Agent A → Agent B → Agent C
- **Parallel Fan-Out**: Agents A, B, C run simultaneously
- **Conditional Branching**: If condition X, run Agent A; else Agent B
- **ReAct Loop**: Agent reasons, acts, observes, repeats until complete
- **Swarm Consensus**: Multiple agents vote on a decision

---

## SECTION 3: PRESCRIPTION-SPECIFIC SUB-AGENTS (5:00 - 8:00)

**[VISUAL: Card-based display of each sub-agent with icons]**

### Sub-Agent 1: Drug Verification Agent

**Purpose**: Validate the medication exists and extract comprehensive drug data

**Input**: `{ drugName: "Metformin", dosage: "500mg" }`

**Process**:
1. Query OpenFDA drug database
2. Cross-reference RxNorm for standardization
3. Retrieve NDC codes, manufacturer info
4. Pull contraindications and warnings

**Output**:
```json
{
  "verified": true,
  "rxcui": "860975",
  "brandNames": ["Glucophage", "Fortamet"],
  "drugClass": "Biguanides",
  "warnings": ["Lactic acidosis risk", "Renal function monitoring required"]
}
```

### Sub-Agent 2: Drug Interaction Checker

**Purpose**: Identify potential interactions with patient's current medications

**Input**: New drug + patient's medication list

**Process**:
1. Retrieve patient's active medications from EHR
2. Run pairwise interaction analysis via DrugBank API
3. Score severity: Minor, Moderate, Severe, Contraindicated
4. Generate clinical recommendations

**Output**:
```json
{
  "interactionsFound": 2,
  "interactions": [
    {
      "drug1": "Metformin",
      "drug2": "Lisinopril",
      "severity": "Minor",
      "description": "May increase hypoglycemic effect",
      "recommendation": "Monitor blood glucose"
    }
  ]
}
```

### Sub-Agent 3: Dosage Validation Agent

**Purpose**: Verify dosage is within safe therapeutic range

**Input**: Drug, dosage, patient demographics (age, weight, renal function)

**Process**:
1. Pull therapeutic dosing guidelines
2. Calculate patient-specific adjustments
3. Flag if outside recommended range
4. Suggest alternatives if needed

### Sub-Agent 4: Insurance Formulary Agent

**Purpose**: Check coverage and find alternatives if not covered

**Input**: Drug, patient's insurance plan ID

**Process**:
1. Query insurance formulary database
2. Determine tier and copay
3. If not covered, find therapeutic equivalents
4. Calculate cost comparison

### Sub-Agent 5: Pharmacy Router Agent

**Purpose**: Find optimal pharmacy for fulfillment

**Input**: Drug availability requirements, patient location, preferences

**Process**:
1. Check inventory at nearby pharmacies
2. Compare pricing
3. Consider patient's preferred pharmacy
4. Factor in specialty drug requirements

---

## SECTION 4: ENABLING SUB-AGENTS FROM DOCUMENT EXTRACTION (8:00 - 10:30)

**[VISUAL: Flow diagram from document upload to sub-agent recommendations]**

### The Recommendation Engine

After extraction completes, our system doesn't just return data—it returns **actionable intelligence**. Here's how:

**Step 1: Context Analysis**
```
Extracted Data → Context Analyzer → Relevant Sub-Agents Identified
```

The system examines extracted fields:
- Found a drug name? → Recommend Drug Verification Agent
- Patient ID present? → Recommend Interaction Checker
- Dosage specified? → Recommend Dosage Validator

**Step 2: Recommendation Cards**

Users see contextual recommendations:
```
┌─────────────────────────────────────────────────────┐
│  📋 Recommended Actions Based on Extraction         │
├─────────────────────────────────────────────────────┤
│  ✅ Drug Verification      [Run Now] [Add to Queue] │
│     Verify "Metformin 500mg" against drug databases │
│                                                     │
│  ⚠️ Interaction Check      [Run Now] [Add to Queue] │
│     Check against patient's 3 active medications    │
│                                                     │
│  💰 Formulary Check        [Run Now] [Add to Queue] │
│     Verify coverage under BlueCross PPO             │
└─────────────────────────────────────────────────────┘
```

**Step 3: One-Click Execution**

Users can:
- Run a single agent immediately
- Queue multiple agents for batch execution
- Deploy to the Canvas for visual workflow building
- Save as a reusable workflow template

### Configuration-Driven Enablement

Sub-agents are enabled through our configuration system:

```typescript
const prescriptionSubAgents = {
  drugVerification: {
    enabled: true,
    autoTrigger: true, // Runs automatically on extraction
    requiredFields: ['drugName'],
    optionalFields: ['dosage', 'ndc']
  },
  interactionCheck: {
    enabled: true,
    autoTrigger: false, // Requires user confirmation
    requiredFields: ['drugName', 'patientId'],
    dependencies: ['drugVerification'] // Must run after
  }
};
```

---

## SECTION 5: END-TO-END EXECUTION FLOW (10:30 - 13:00)

**[VISUAL: Animated sequence showing complete pipeline]**

Let's trace a prescription through the entire system:

### Phase 1: Document Ingestion
```
User uploads prescription image
       ↓
Document type detected: "Prescription"
       ↓
Routed to Prescription Processing Pipeline
```

### Phase 2: Intelligent Extraction
```
OCR Layer: Google Vision selected (printed text detected)
       ↓
Raw text extracted with 98.5% confidence
       ↓
NLP Layer: Gemini 2.5 Flash entity extraction
       ↓
Structured output generated:
{
  drugName: "Lisinopril",
  dosage: "10mg",
  frequency: "Once daily",
  prescriber: "Dr. Sarah Chen",
  deaNumber: "AC1234567"
}
```

### Phase 3: Sub-Agent Orchestration
```
Orchestrator receives structured data
       ↓
Parallel execution initiated:
  ├── Drug Verification Agent (async)
  ├── Prescriber Validation Agent (async)
  └── Insurance Check Agent (async)
       ↓
Results aggregated (2.3 seconds total)
       ↓
Sequential execution (dependencies resolved):
  └── Interaction Check Agent
      (requires verified drug data)
       ↓
Final aggregated result compiled
```

### Phase 4: Result Storage & Action
```
Results stored in:
  ├── prescription_extractions table (raw extraction)
  ├── drug_verifications table (verification results)
  ├── interaction_alerts table (flagged interactions)
  └── agent_execution_logs table (audit trail)
       ↓
UI updated with results
       ↓
User notified: "2 potential interactions found"
       ↓
Action options presented:
  • View detailed report
  • Send to pharmacist for review
  • Override with clinical justification
```

---

## SECTION 6: RESULTS STORAGE ARCHITECTURE (13:00 - 15:00)

**[VISUAL: Database schema diagram with relationships]**

### Multi-Layer Storage Strategy

**Layer 1: Raw Extraction Storage**
```sql
CREATE TABLE prescription_extractions (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id),
  extracted_data JSONB,
  confidence_scores JSONB,
  ocr_provider TEXT,
  nlp_model TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ
);
```

**Layer 2: Sub-Agent Results**
```sql
CREATE TABLE subagent_executions (
  id UUID PRIMARY KEY,
  extraction_id UUID REFERENCES prescription_extractions(id),
  agent_type TEXT,
  agent_version TEXT,
  input_data JSONB,
  output_data JSONB,
  execution_status TEXT,
  execution_time_ms INTEGER,
  error_details JSONB,
  created_at TIMESTAMPTZ
);
```

**Layer 3: Aggregated Insights**
```sql
CREATE TABLE prescription_insights (
  id UUID PRIMARY KEY,
  extraction_id UUID REFERENCES prescription_extractions(id),
  drug_verified BOOLEAN,
  interaction_count INTEGER,
  interaction_severity TEXT,
  formulary_status TEXT,
  recommended_actions JSONB,
  clinical_flags JSONB,
  created_at TIMESTAMPTZ
);
```

### Audit Trail & Compliance

Every sub-agent execution is logged for:
- **HIPAA compliance**: Who accessed what, when
- **Clinical audit**: Decision rationale preserved
- **Performance monitoring**: Execution times, error rates
- **Cost tracking**: API calls per agent

---

## SECTION 7: SCALING WITH MULTIPLE SUB-AGENTS (15:00 - 17:00)

**[VISUAL: Scalable architecture diagram with queuing]**

### Adding New Sub-Agents

The architecture is designed for extensibility:

```typescript
// Register a new sub-agent
subAgentRegistry.register({
  id: 'prior-authorization-agent',
  name: 'Prior Authorization Checker',
  description: 'Determines if PA is required and initiates process',
  
  triggerConditions: {
    documentType: 'prescription',
    requiredFields: ['drugName', 'insuranceId'],
    customLogic: (data) => data.drugClass === 'specialty'
  },
  
  execute: async (input, context) => {
    // Agent implementation
    const paRequired = await checkPARequirements(input);
    if (paRequired) {
      return await initiatePAProcess(input, context);
    }
    return { paRequired: false };
  },
  
  outputSchema: PriorAuthResultSchema
});
```

### Parallel Execution Optimization

For prescriptions with multiple medications:

```
Prescription with 3 drugs detected
       ↓
Fan-out to 3 parallel pipelines:
  ├── Drug 1: [Verify] → [Interact] → [Formulary]
  ├── Drug 2: [Verify] → [Interact] → [Formulary]
  └── Drug 3: [Verify] → [Interact] → [Formulary]
       ↓
Cross-drug interaction analysis
       ↓
Unified result compilation
```

### Queue-Based Processing

For high-volume scenarios:
- Prescriptions enter a priority queue
- Sub-agents pull from queue based on capacity
- Results stream back in real-time
- Failed executions retry with exponential backoff

---

## SECTION 8: THE CANVAS BUILDER INTEGRATION (17:00 - 18:30)

**[VISUAL: Workflow canvas with drag-and-drop agents]**

### Visual Workflow Design

The Canvas Builder allows non-technical users to:

1. **Drag sub-agents** onto a visual canvas
2. **Connect them** with data flow arrows
3. **Configure conditions** for branching logic
4. **Set triggers** for automatic execution
5. **Deploy** as a reusable workflow

### From Extraction to Canvas

When recommendations appear after extraction:
```
[Deploy to Canvas] button
       ↓
Opens Canvas with pre-configured nodes:
  • Document Input node (extraction data)
  • Recommended sub-agent nodes (auto-connected)
  • Result storage node
       ↓
User customizes flow
       ↓
Saves as "Prescription Processing Workflow v1"
       ↓
Available for future prescriptions
```

---

## CONCLUSION (18:30 - 19:30)

**[VISUAL: Summary diagram with key takeaways]**

Let's recap what we've covered:

1. **Intelligent Extraction**: Multi-provider OCR + advanced NLP creates structured prescription data

2. **Sub-Agent Architecture**: Specialized, focused agents that do one thing exceptionally well

3. **Orchestration**: Smart routing, parallel execution, and dependency management

4. **Contextual Recommendations**: The system suggests relevant agents based on extracted data

5. **End-to-End Flow**: From document upload to actionable insights in seconds

6. **Robust Storage**: Multi-layer persistence with full audit trails

7. **Scalability**: Easy to add new agents, handle high volumes, and customize workflows

The prescription-to-sub-agent pipeline represents a new paradigm in healthcare document processing—one where AI doesn't just extract data, but takes intelligent action on it.

In Part 2, we'll dive deeper into building custom sub-agents, advanced orchestration patterns, and integrating with external EHR systems.

---

## TECHNICAL APPENDIX

### Sub-Agent Interface Definition
```typescript
interface SubAgent<TInput, TOutput> {
  id: string;
  name: string;
  version: string;
  
  // Trigger configuration
  triggerConditions: TriggerConfig;
  requiredInputFields: (keyof TInput)[];
  optionalInputFields?: (keyof TInput)[];
  
  // Dependencies
  dependsOn?: string[]; // Other agent IDs
  
  // Execution
  execute(input: TInput, context: ExecutionContext): Promise<TOutput>;
  
  // Validation
  inputSchema: ZodSchema<TInput>;
  outputSchema: ZodSchema<TOutput>;
  
  // Metadata
  estimatedDurationMs: number;
  costPerExecution?: number;
  retryConfig?: RetryConfiguration;
}
```

### Execution Context Structure
```typescript
interface ExecutionContext {
  executionId: string;
  userId: string;
  patientId?: string;
  documentId: string;
  extractionId: string;
  
  // Results from dependent agents
  previousResults: Map<string, unknown>;
  
  // Utilities
  logger: Logger;
  metrics: MetricsCollector;
  secrets: SecretManager;
  
  // External service clients
  services: {
    openFda: OpenFDAClient;
    rxNorm: RxNormClient;
    drugBank: DrugBankClient;
    ehrIntegration: EHRClient;
  };
}
```

---

**Script Duration**: ~19-20 minutes
**Recommended Visuals**: Architecture diagrams, animated flow sequences, code snippets, UI mockups
**Target Audience**: Technical stakeholders, healthcare IT teams, developers

---

*Last Updated: January 2026*
*Version: 1.0*
