# Audio Script: Patient Onboarding
## Voice-Over Only — Technical Architecture Focus

---

Hello everyone! Good morning, evening, afternoon, or night—wherever you are watching this video!

If you watched my previous video on this AI document processing platform, you saw what was possible in less than 64 hours during a single weekend.

Today, I'm excited to share what happened next—the evolution from a weekend prototype to an enterprise-grade solution.

Since that original build, I've made significant enhancements on both the technical architecture and functional sides.

On the technical architecture side:

First, a Multi-Model AI Routing System. The platform now performs content-aware model selection based on document characteristics. Specialized models handle different content types—tables, handwriting, medical images. Dynamic routing logic chooses the optimal AI model for each document.

Second, Configuration-Driven Architecture. Document type configurations are externalized from code. Field mapping rules are configurable per document category. Processing hints enable specialized pipelines like NDC medication lookup.

Third, a Two-Stage Pipeline with Provider Abstraction. The OCR layer dynamically selects providers—Google Vision, AWS Textract, or Azure Form Recognizer. The NLP layer routes to different models based on document complexity. Interface patterns allow swapping providers without changing the pipeline.

On the functional side:

Intelligent multi-model routing means automatic model selection based on document type, confidence-based routing with fallback strategies, and cost optimization through model tiering.

Dynamic field discovery allows extracting fields from any document type without pre-configuration, schema inference from document structure, and flexible field mapping with validation rules.

Enhanced confidence scoring provides per-field confidence from zero to 100 percent, healthcare-specific validation against clinical rules, and human-in-the-loop triggers at configurable thresholds.

Healthcare-specific integrations include NDC medication database lookups for prescription validation, ICD-10 and CPT code search, insurance payer database integration, and seamless patient onboarding workflow integration.

What started as a proof-of-concept now has production-ready architecture and functionality.

Let me walk you through the transformation.

---

The biggest architectural change is intelligent multi-model routing.

Before, with the single model approach, one AI model processed every document type. The same extraction logic ran regardless of content. Generic prompts had no document-type optimization. Accuracy dropped significantly on specialized content.

Now, with the content-aware routing system, the platform analyzes document characteristics and routes to specialized models.

For tables and structured data: Gemini 2.5 Flash handles structure recognition. AWS Textract performs precise cell extraction. This path is optimized for invoices, forms, and tabular medical records.

For medical imaging: GPT-5 analyzes radiology findings. Med-PaLM 2 provides clinical interpretation. This handles X-rays, CT scans, and MRI reports.

For lab results: Claude Sonnet interprets results. Gemini Pro validates reference ranges. This covers blood tests, pathology reports, and urinalysis.

For handwritten content: Google Vision performs handwriting OCR. GPT-5 Mini applies contextual correction. This handles physician notes and handwritten prescriptions.

Each routing decision is logged with the model selected, confidence threshold applied, and processing time.

---

The second major enhancement is configuration-driven architecture.

Previously, adding a new document type meant writing custom code—new components, new extraction logic, new field mappings.

Now, document types are defined in configuration. A document type config includes the ID, category, expected fields, and processing hints. Processing hints specify options like enable OCR, enable medication lookup, and preferred OCR provider.

What does this enable? You can add new document types without code changes. You can A/B test different field extraction strategies. Per-document-type model selection becomes trivial. Custom validation rules can be defined per category.

The processing hints system drives dynamic behavior. Enable medication lookup triggers NDC database integration. Enable table extraction activates the AWS Textract pipeline. Preferred OCR provider routes to a specific OCR service. Confidence threshold sets the human review trigger level.

This pattern follows the Open/Closed Principle—the system is open for extension but closed for modification.

---

The processing foundation is a two-stage pipeline with provider abstraction.

Stage 1 is the OCR layer with provider selection. The system dynamically selects OCR providers based on document characteristics. Google Cloud Vision for general-purpose printed text. AWS Textract for superior table and form extraction. Azure Form Recognizer for structured documents.

Provider selection logic considers document type from classification, presence of tables or forms, handwriting detection results, and cost optimization rules.

Stage 2 is NLP entity extraction. After OCR, the text flows through entity extraction. Prompt templates are document-type-specific. Field schemas define expected fields with types and validation rules. Confidence scoring provides per-field certainty from zero to 100 percent.

The key technical pattern is provider abstraction. Both OCR and NLP layers use a provider interface pattern. This means swapping providers—or adding new ones—requires zero changes to the processing pipeline.

---

Let's see the architecture in action with patient onboarding.

Patient onboarding is architecturally interesting because it demonstrates multi-document workflow chaining, cross-document validation, and multiple extraction pipelines in sequence.

Watch the processing stages. Document classification identifies type as patient enrollment. Config lookup loads processing hints and field schema. OCR provider selected is Google Vision for printed form. NLP model routed is Gemini 2.5 Flash for structured extraction.

Each extracted field includes metadata. Value is the extracted content. Confidence is model certainty from zero to one. Source indicates OCR-derived or NLP-inferred. Validation status shows passed, warning, or failed.

The system performs cross-document validation. Patient name is checked for consistency across all documents. Date of birth is verified between forms. Insurance member ID is matched against card scan.

This is enabled by workflow context that persists across document processing.

---

So that's the technical architecture—configuration-driven document types, multi-model routing, and a two-stage pipeline with provider abstraction.

But there's one more architectural pattern I haven't shown yet.

You might have noticed a dialog appearing after processing—Sub-Agent Recommendations.

This is the next evolution: after extracting data, the system can recommend and orchestrate follow-up AI agents. Insurance eligibility verification agent. Prior authorization agent. Care team notification agent.

These agents are dynamically generated based on document context and connected through an MCP SDK integration layer.

But that architecture deserves its own deep dive.

In Part 2, I'll cover sub-agent generation from document context, the workflow canvas for visual agent orchestration, MCP SDK integration patterns, and event-driven agent communication.

If you're building AI-powered document systems, subscribe for the technical deep dive.

Full architecture documentation is linked in the description.

Thanks for watching!

---

*Total Runtime: Approximately 11 minutes*
*Version 3.0 | Technical Architecture Focus*
