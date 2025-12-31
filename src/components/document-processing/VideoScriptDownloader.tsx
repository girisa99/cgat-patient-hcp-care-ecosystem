import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Mic, Video, Volume2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';

const VIDEO_SCRIPT = `# AI Document Processing: Enterprise Edition
## Voice-Over Script — Part 1: Patient Onboarding

**Total Runtime: ~11 minutes**

---

# SCENE 1: OPENING
**[0:00 - 2:30]**

*[Show title card, then transition to screen recording]*

Hello everyone! Good morning, evening, afternoon, or night—wherever you are watching this video!

If you watched my previous video on this AI document processing platform, you saw what was possible in less than 64 hours during a single weekend.

Today, I'm excited to share what happened next—the evolution from a weekend prototype to an enterprise-grade solution.

Since that original build, I've made significant enhancements on both the **technical architecture** and **functional** sides.

**Technical Architecture Enhancements:**

**Multi-Model AI Routing System:**
- Content-aware model selection based on document characteristics
- Specialized models for different content types—tables, handwriting, medical images
- Dynamic routing logic that chooses the optimal AI model per document

**Configuration-Driven Architecture:**
- Document type configurations externalized from code
- Field mapping rules configurable per document category
- Processing hints that enable specialized pipelines like NDC lookup

**Two-Stage Pipeline with Provider Abstraction:**
- OCR layer with dynamic provider selection—Google Vision, AWS Textract, Azure Form Recognizer
- NLP layer with multi-model routing based on document complexity
- Interface patterns that allow swapping providers without pipeline changes

**Functional Enhancements:**

**Intelligent Multi-Model AI Routing:**
- Automatic model selection based on document type and complexity
- Confidence-based routing with fallback strategies
- Cost optimization through model tiering

**Dynamic Field Discovery:**
- Extract fields from ANY document type without pre-configuration
- Schema inference from document structure
- Flexible field mapping with validation rules

**Enhanced Confidence Scoring:**
- Per-field confidence from 0 to 100 percent
- Healthcare-specific validation against clinical rules
- Human-in-the-loop triggers at configurable thresholds

**Healthcare-Specific Integrations:**
- NDC medication database lookups for prescription validation
- ICD-10 and CPT code search and validation
- Insurance payer database integration for eligibility checks
- Seamless patient onboarding workflow integration

What started as a proof-of-concept now has production-ready architecture and functionality.

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
\`\`\`typescript
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
\`\`\`

**What This Enables:**
- Add new document types without code changes
- A/B test different field extraction strategies
- Per-document-type model selection
- Custom validation rules per category

**Processing Hints System:**
- \`enableMedicationLookup\` — triggers NDC database integration
- \`enableTableExtraction\` — activates AWS Textract pipeline
- \`preferredOCRProvider\` — routes to specific OCR service
- \`confidenceThreshold\` — sets human review trigger level

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
\`\`\`typescript
interface OCRProvider {
  extractText(document: Buffer): Promise<OCRResult>;
  extractTables(document: Buffer): Promise<TableResult>;
}
\`\`\`

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
0:00 Introduction & Technical Enhancements
2:30 Multi-Model Routing Architecture
4:30 Configuration-Driven Document Types
6:30 Two-Stage Pipeline Architecture
8:00 Patient Onboarding Technical Demo
10:30 What's Next: Sub-Agent Architecture

## Code Samples to Show
- Document type configuration object
- Provider interface pattern
- Confidence threshold logic
- Cross-document validation

---

*Version 3.0 | January 2025 | Technical Focus*`;

const AUDIO_SCRIPT = `# Audio Script: Patient Onboarding
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

Let me walk you through the technical transformation.

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
*Version 3.0 | Technical Architecture Focus*`;

export const VideoScriptDownloader: React.FC = () => {
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const { showSuccess, showError } = useMasterToast();

  const handleDownloadVideoScript = () => {
    const blob = new Blob([VIDEO_SCRIPT], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'VIDEO_SCRIPT_PATIENT_ONBOARDING.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAudioScript = () => {
    const blob = new Blob([AUDIO_SCRIPT], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AUDIO_SCRIPT_PATIENT_ONBOARDING.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerateAudio = async () => {
    setIsGeneratingAudio(true);
    try {
      // Clean the script - remove markdown formatting for TTS
      const cleanedScript = AUDIO_SCRIPT
        .replace(/^#.*$/gm, '') // Remove headers
        .replace(/\*\*.*?\*\*/g, (match) => match.replace(/\*\*/g, '')) // Remove bold markers
        .replace(/\*.*?\*/g, (match) => match.replace(/\*/g, '')) // Remove italic markers
        .replace(/---/g, '') // Remove horizontal rules
        .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
        .trim();

      // Take first 4000 chars for TTS (OpenAI limit is 4096)
      const textForTTS = cleanedScript.substring(0, 4000);

      const { data, error } = await supabase.functions.invoke('openai-tts', {
        body: { 
          text: textForTTS, 
          voice: 'onyx', // Professional male voice
          speed: 1.0 
        }
      });

      if (error) throw error;

      if (data?.audioContent) {
        // Create download link for the audio
        const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
        const a = document.createElement('a');
        a.href = audioUrl;
        a.download = 'AUDIO_SCRIPT_PATIENT_ONBOARDING.mp3';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        showSuccess(data.truncated 
          ? 'Audio generated (first 4000 chars due to API limit)' 
          : 'Audio generated successfully');
      }
    } catch (error) {
      console.error('TTS generation error:', error);
      showError('Failed to generate audio: ' + (error as Error).message);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <FileText className="h-5 w-5 text-blue-400" />
          Video & Audio Scripts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-slate-300 text-sm">
          Download the complete scripts for Part 1: Patient Onboarding (~11 minutes)
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Video Script Card */}
          <Card className="bg-slate-900/50 border-slate-600">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Video className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Video Script</h3>
                  <p className="text-xs text-slate-400">With visual cues & timestamps</p>
                </div>
              </div>
              <ul className="text-xs text-slate-400 space-y-1 mb-4">
                <li>• Scene-by-scene breakdown</li>
                <li>• Visual direction notes</li>
                <li>• Production notes included</li>
                <li>• Technical architecture focus</li>
              </ul>
              <Button 
                onClick={handleDownloadVideoScript}
                className="w-full gap-2"
                variant="outline"
              >
                <Download className="h-4 w-4" />
                Download Video Script
              </Button>
            </CardContent>
          </Card>

          {/* Audio Script Card */}
          <Card className="bg-slate-900/50 border-slate-600">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Mic className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Audio Script</h3>
                  <p className="text-xs text-slate-400">Voice-over only, no visual cues</p>
                </div>
              </div>
              <ul className="text-xs text-slate-400 space-y-1 mb-4">
                <li>• Clean voice-over text</li>
                <li>• Ready for recording</li>
                <li>• Natural speech flow</li>
                <li>• Technical content focus</li>
              </ul>
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleDownloadAudioScript}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Download className="h-4 w-4" />
                  Download Audio Script
                </Button>
                <Button 
                  onClick={handleGenerateAudio}
                  disabled={isGeneratingAudio}
                  className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isGeneratingAudio ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                  {isGeneratingAudio ? 'Generating...' : 'Generate Audio (TTS)'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-xs text-blue-300">
            <strong>Part 1 covers:</strong> Multi-model routing architecture, configuration-driven document types, 
            two-stage pipeline with provider abstraction, and patient onboarding demo with cross-document validation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoScriptDownloader;
