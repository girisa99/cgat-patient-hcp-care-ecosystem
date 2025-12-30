# AI Document Processing: Enterprise Edition
## Voice-Over Script — Part 1: Patient Onboarding

**Total Runtime: ~11 minutes**

---

# SCENE 1: OPENING
**[0:00 - 2:30]**

*[Show title card, then transition to screen recording]*

Hello everyone! Good morning, evening, afternoon, or night—wherever you are watching this video!

If you watched my previous video on this AI document processing platform, you saw what was possible in less than 64 hours during a single weekend.

Today, I'm excited to share what happened next—the evolution from a weekend prototype to an enterprise-grade solution.

Since that original build, I've made significant **technical architecture enhancements**:

**Multi-Model AI Routing System:**
- Content-aware model selection based on document characteristics
- Specialized models for different content types—tables, handwriting, medical images
- Dynamic routing logic that chooses the optimal AI model per document

**Configuration-Driven Architecture:**
- Document type configurations externalized from code
- Field mapping rules configurable per document category
- Processing hints that enable specialized pipelines like NDC lookup

**Enhanced Processing Pipeline:**
- Two-stage OCR plus NLP architecture with provider abstraction
- Parallel processing paths for OCR, Form Recognition, and Entity Extraction
- Confidence scoring with configurable thresholds for human-in-the-loop

**Healthcare-Specific Integrations:**
- NDC medication database lookups for prescription validation
- ICD-10 and CPT code search and validation
- Insurance payer database integration for eligibility checks

What started as a proof-of-concept now has production-ready architecture patterns.

Let me walk you through the technical transformation.

---

# SCENE 2: MULTI-MODEL ROUTING ARCHITECTURE
**[2:30 - 4:30]**

*[Navigate to Architecture Diagram → Content Type Routing tab]*

The biggest architectural change is **intelligent multi-model routing**.

Before — Single Model Approach:
- One AI model processed every document type
- Same extraction logic regardless of content
- Generic prompts with no document-type optimization
- Accuracy dropped significantly on specialized content

After — Content-Aware Routing System:

The system now analyzes document characteristics and routes to specialized models:

**Tables and Structured Data:**
- Gemini 2.5 Flash for structure recognition
- AWS Textract for precise cell extraction
- Optimized for invoices, forms, and tabular medical records

**Medical Imaging:**
- GPT-5 for radiology analysis and findings
- Med-PaLM 2 for clinical interpretation
- X-rays, CT scans, MRI reports

**Lab Results:**
- Claude Sonnet for result interpretation
- Gemini Pro for reference range validation
- Blood tests, pathology reports, urinalysis

**Handwritten Content:**
- Google Vision for handwriting OCR
- GPT-5 Mini for contextual correction
- Physician notes, handwritten prescriptions

Each routing decision is logged with the model selected, confidence threshold applied, and processing time.

---

# SCENE 3: CONFIGURATION-DRIVEN DOCUMENT TYPES
**[4:30 - 6:30]**

*[Show code structure and config files]*

The second major enhancement is **configuration-driven architecture**.

Previously, adding a new document type meant writing custom code—new components, new extraction logic, new field mappings.

Now, document types are defined in configuration:

**Document Type Config Structure:**
```typescript
{
  id: 'prescription',
  category: 'medical',
  fields: ['patient_name', 'medication', 'dosage', 'prescriber'],
  processingHints: {
    enableOCR: true,
    enableMedicationLookup: true,
    preferredOCRProvider: 'google_vision'
  },
  validationRules: [...]
}
```

**What This Enables:**
- Add new document types without code changes
- A/B test different field extraction strategies
- Per-document-type model selection
- Custom validation rules per category

**Processing Hints System:**
- `enableMedicationLookup` — triggers NDC database integration
- `enableTableExtraction` — activates AWS Textract pipeline
- `preferredOCRProvider` — routes to specific OCR service
- `confidenceThreshold` — sets human review trigger level

This pattern follows the **Open/Closed Principle**—the system is open for extension but closed for modification.

---

# SCENE 4: TWO-STAGE PIPELINE ARCHITECTURE
**[6:30 - 8:00]**

*[Navigate to NLP Pipeline diagram]*

The processing foundation is a **two-stage pipeline with provider abstraction**.

**Stage 1 — OCR Layer with Provider Selection:**

The system dynamically selects OCR providers based on document characteristics:

- **Google Cloud Vision** — General-purpose, excellent for printed text
- **AWS Textract** — Superior table and form extraction
- **Azure Form Recognizer** — Optimized for structured documents

Provider selection logic considers:
- Document type from classification
- Presence of tables or forms
- Handwriting detection results
- Cost optimization rules

**Stage 2 — NLP Entity Extraction:**

After OCR, the text flows through entity extraction:

- **Prompt Templates** — Document-type-specific extraction prompts
- **Field Schema** — Expected fields with types and validation rules
- **Confidence Scoring** — Per-field confidence from 0 to 100 percent

**Key Technical Pattern — Provider Abstraction:**

Both OCR and NLP layers use a provider interface pattern:
```typescript
interface OCRProvider {
  extractText(document: Buffer): Promise<OCRResult>;
  extractTables(document: Buffer): Promise<TableResult>;
}
```

This means swapping providers—or adding new ones—requires zero changes to the processing pipeline.

---

# SCENE 5: PATIENT ONBOARDING DEMO
**[8:00 - 10:30]**

*[Navigate to Document Processing screen, select Patient Onboarding]*

Let's see the architecture in action with patient onboarding.

Patient onboarding is architecturally interesting because it demonstrates:
- Multi-document workflow chaining
- Cross-document validation
- Multiple extraction pipelines in sequence

*[Upload a patient enrollment form]*

Watch the processing stages:
- Document classification identifies type as "patient_enrollment"
- Config lookup loads processing hints and field schema
- OCR provider selected: Google Vision for printed form
- NLP model routed: Gemini 2.5 Flash for structured extraction

*[Show extracted data]*

**Technical Details to Notice:**

Each extracted field includes metadata:
- **Value** — The extracted content
- **Confidence** — Model certainty from 0 to 1
- **Source** — OCR-derived or NLP-inferred
- **Validation Status** — Passed, warning, or failed

*[Show validation results]*

**Cross-Document Validation:**

The system performs consistency checks across documents in a workflow:
- Patient name matches across all documents
- Date of birth consistent between forms
- Insurance member ID matches card scan

This is enabled by the **workflow context** that persists across document processing.

---

# SCENE 6: CLOSING & TEASER
**[10:30 - 11:30]**

*[Briefly show the Sub-Agent Recommendation Dialog appearing]*

So that's the technical architecture—configuration-driven document types, multi-model routing, and a two-stage pipeline with provider abstraction.

But there's one more architectural pattern I haven't shown yet.

You might have noticed this dialog appearing after processing—**Sub-Agent Recommendations**.

This is the next evolution: after extracting data, the system can recommend and orchestrate follow-up AI agents:
- Insurance eligibility verification agent
- Prior authorization agent
- Care team notification agent

These agents are dynamically generated based on document context and connected through an **MCP SDK integration layer**.

But that architecture deserves its own deep dive.

In Part 2, I'll cover:
- Sub-agent generation from document context
- The workflow canvas for visual agent orchestration
- MCP SDK integration patterns
- Event-driven agent communication

If you're building AI-powered document systems, subscribe for the technical deep dive.

Full architecture documentation is linked in the description.

Thanks for watching!

---

# PRODUCTION NOTES

## Key Technical Points to Emphasize
1. Multi-model routing based on content type
2. Configuration-driven document types
3. Provider abstraction pattern (OCR and NLP)
4. Two-stage pipeline architecture
5. Per-field confidence scoring
6. Cross-document validation in workflows

## YouTube Timestamps
```
0:00 Introduction & Technical Enhancements
2:30 Multi-Model Routing Architecture
4:30 Configuration-Driven Document Types
6:30 Two-Stage Pipeline Architecture
8:00 Patient Onboarding Technical Demo
10:30 What's Next: Sub-Agent Architecture
```

## Code Samples to Show
- Document type configuration object
- Provider interface pattern
- Confidence threshold logic
- Cross-document validation

---

*Version 3.0 | January 2025 | Technical Focus*
