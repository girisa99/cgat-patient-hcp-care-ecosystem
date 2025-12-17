# Document Processing Platform - Video Script

## Video Title
**"AI-Powered Document Processing: From Upload to Insights in Seconds"**

---

## INTRO (0:00 - 0:30)

**[Screen: Platform logo/title card]**

> "Hey everyone! Today I'm walking you through our AI-powered document processing platform that transforms how healthcare organizations handle prescriptions, insurance cards, medical imaging, and invoices.
>
> If you haven't already, check out the detailed technical article linked in the description below. This video will show you the platform in action."

---

## SECTION 1: THE TWO-STAGE PIPELINE (0:30 - 1:30)

**[Screen: Show NLPPipelineStepsDiagram or the pipeline image]**

> "Let me start by explaining what happens behind the scenes. Our platform uses a two-stage AI pipeline.
>
> **Stage 1** is OCR - Optical Character Recognition. When you upload a document, it goes through Google Cloud Vision, AWS Textract, or Azure Form Recognizer - you choose your provider. This extracts all the raw text from the image.
>
> **Stage 2** is where the magic happens - NLP Entity Extraction. We take that raw text and send it to Google Gemini 2.5 Flash along with document type hints and target fields. The AI understands context, not just characters.
>
> The result? Clean, structured JSON with patient names, medications, dosages, frequencies, and prescriber information - all with confidence scores."

---

## SECTION 2: PRESCRIPTION PROCESSING DEMO (1:30 - 3:00)

**[Screen: Navigate to Document Processing page, select Prescription]**

> "Let's see this in action with a prescription. I'll select 'Prescription' as my document type and upload this image.
>
> **[Upload prescription image]**
>
> Watch the processing stages - you can see real-time progress as each step completes. Processing, then entity extraction, then validation.
>
> **[Show extraction results]**
>
> Look at what we extracted: patient name, medication - in this case Amoxicillin, the dosage, frequency, and prescriber. Each field shows whether it came from OCR or NLP extraction.
>
> **[Show NDC Lookup tab]**
>
> Now here's something powerful - automatic NDC lookup. The system queries OpenFDA to get the National Drug Code, manufacturer information, and flags if it's a controlled substance.
>
> **[Show Clinical Recommendations]**
>
> We also surface clinical recommendations - drug interactions, alternatives, and dosing guidelines. This isn't just data extraction, it's clinical intelligence."

---

## SECTION 3: INSURANCE CARD PROCESSING (3:00 - 4:00)

**[Screen: Switch to Insurance Card document type]**

> "Insurance cards are tricky because there are different variants - pharmacy cards have BIN and PCN numbers, medical cards have deductibles and coinsurance, Medicaid cards have state program information.
>
> **[Upload insurance card]**
>
> Our system auto-detects the variant. No manual selection needed. It expands abbreviations too - DED becomes Deductible, OOP becomes Out of Pocket Maximum.
>
> **[Show extracted fields]**
>
> Member ID, group number, coverage details - all extracted and ready for verification or export."

---

## SECTION 4: MEDICAL IMAGING ANALYSIS (4:00 - 5:30)

**[Screen: Switch to Medical Imaging - X-ray]**

> "Medical imaging uses a completely different paradigm. We're not extracting fields - we're analyzing images for clinical insights.
>
> **[Upload X-ray image]**
>
> The system auto-detects the imaging modality - X-ray, CT, MRI, ECG - and the anatomical region. Watch the confidence scores.
>
> **[Show analysis results]**
>
> This is where our vision AI models come in - ResNet and Vision Transformers analyze the image for abnormalities. We get findings, measurements compared to normal ranges, and clinical recommendations.
>
> For multi-panel images, the system analyzes each panel separately and tells you exactly which region shows the abnormality. This is AI-assisted radiology."

---

## SECTION 5: INVOICE & RCM ANALYSIS (5:30 - 6:30)

**[Screen: Switch to Invoice/Billing]**

> "For healthcare billing, we do full Revenue Cycle Management analysis.
>
> **[Upload invoice]**
>
> The system extracts line items, CPT codes, Revenue codes, ICD-10 diagnosis codes. Then it calculates allowed amounts, adjustments, and balance due.
>
> **[Show RCM Analysis tab]**
>
> We integrate with NLM Clinical Tables API for real-time code lookups. You see estimated reimbursement rates right alongside your extracted data. This helps identify underpayments and optimize revenue capture."

---

## SECTION 6: MCP SDK EXPORT (6:30 - 7:30)

**[Screen: Show Export/MCP SDK panel]**

> "Once you've verified your extracted data, you need to get it into your systems. That's where MCP SDK integration comes in.
>
> **[Show export options]**
>
> With one click, you can push extracted data to Supabase, Salesforce, HubSpot, Veeva, or any external API via webhooks. Field mapping is automatic but fully customizable.
>
> **[Demonstrate export]**
>
> Select your target, map your fields, and export. The data flows directly into your CRM or EHR without manual entry."

---

## SECTION 7: SUB-AGENT RECOMMENDATIONS (7:30 - 8:15)

**[Screen: Show Sub-Agent Recommendation Dialog]**

> "Here's something unique - after processing, the system recommends AI sub-agents for follow-up workflows.
>
> Process a prescription? It suggests a Drug Interaction Checker agent and a Prior Authorization agent. Process an insurance card? It suggests eligibility verification.
>
> **[Click to build agent]**
>
> Click 'Build Agent' and it auto-generates a workflow on our visual canvas. You go from document processing to automated workflow in seconds."

---

## SECTION 8: PROCESSING HISTORY (8:15 - 8:45)

**[Screen: Show History tab]**

> "Everything is tracked and auditable. The History tab shows all processed documents with thumbnails, extraction confidence scores, and timestamps.
>
> You can re-export any historical document, view the original image alongside extracted data, and maintain a complete audit trail for compliance."

---

## CLOSING (8:45 - 9:15)

**[Screen: Return to main dashboard or platform overview]**

> "That's the AI-powered document processing platform - multi-provider OCR, intelligent NLP extraction with Gemini, automatic code lookups, and seamless CRM integration.
>
> Check out the full technical deep-dive article linked in the description. If you're building healthcare automation, drop a comment - I'd love to hear what document challenges you're facing.
>
> Thanks for watching!"

---

## VIDEO DESCRIPTION TEMPLATE

```
🏥 AI-Powered Document Processing for Healthcare

In this video, I walk through our intelligent document processing platform that handles:
✅ Prescriptions with NDC lookup & clinical recommendations
✅ Insurance cards with auto-variant detection
✅ Medical imaging with AI-powered analysis
✅ Invoices with Revenue Cycle Management

📖 Read the full technical article: [LinkedIn Article Link]

Tech Stack:
- OCR: Google Cloud Vision, AWS Textract, Azure Form Recognizer
- NLP: Google Gemini 2.5 Flash
- Code Intelligence: OpenFDA, NLM Clinical Tables, RxNorm
- Vision AI: ResNet, Vision Transformers

Timestamps:
0:00 - Introduction
0:30 - Two-Stage AI Pipeline Explained
1:30 - Prescription Processing Demo
3:00 - Insurance Card Processing
4:00 - Medical Imaging Analysis
5:30 - Invoice & RCM Analysis
6:30 - MCP SDK Export to CRM
7:30 - Sub-Agent Recommendations
8:15 - Processing History & Audit
8:45 - Closing

#HealthcareAI #DocumentProcessing #MachineLearning #HealthTech
```

---

## RECORDING TIPS

1. **Screen Resolution**: Record at 1920x1080 for crisp text
2. **Cursor Highlighting**: Use a cursor highlighter tool so viewers can follow
3. **Pace**: Pause briefly after each action so viewers can see the UI respond
4. **Sample Documents**: Have clean, readable sample documents ready
5. **Audio**: Record in a quiet space, use a decent microphone
6. **B-Roll**: Consider adding the pipeline diagram images as overlays during technical explanations

---

## ESTIMATED RUNTIME

- Target: 8-9 minutes
- Comfortable pace for complex technical content
- Short enough to maintain engagement, long enough to show value
