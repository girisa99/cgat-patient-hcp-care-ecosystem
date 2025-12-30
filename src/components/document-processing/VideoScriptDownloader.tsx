import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Mic, Video } from 'lucide-react';

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

Since that original build, I've been working on significant enhancements.

On the architecture side:
- Enterprise-standard visual design with high-contrast, accessible interfaces
- Solid opaque backgrounds replacing transparency for better readability
- Professional typography using system fonts
- Drop shadows and visual depth for clear layer separation

On the functional side:
- Intelligent multi-model AI routing
- Dynamic field discovery across ANY document type
- Enhanced confidence scoring with healthcare-specific validation
- Seamless patient onboarding workflow integration

What started as a proof-of-concept is now ready for production healthcare environments.

Let me walk you through the transformation—starting with the architecture changes that made this possible.

---

# SCENE 2: BEFORE/AFTER ARCHITECTURE
**[2:30 - 4:30]**

*[Navigate to Architecture Diagram → Before/After tab]*

Let me start by showing you the before and after architecture transformation.

On the left, you can see the original architecture—what we built in 64 hours:

Before — Single Pipeline:
- One AI model for everything
- Manual document type selection
- Fixed field extraction with hardcoded mappings
- 70 to 80 percent accuracy on complex documents
- Limited validation and no confidence thresholds

Now look at the right side—the enhanced enterprise architecture:

After — Intelligent Multi-Model Routing:
- Claude 3.5 for complex medical documents requiring reasoning
- GPT-4o for structured forms like insurance and billing
- Gemini 1.5 for high-volume processing with speed optimization

Each model handles what it's best at.

Notice the visual improvements too:
- Solid opaque backgrounds with high contrast ratios
- Professional color coding with semantic meaning
- Clear section separation with drop shadows
- System fonts optimized for technical readability

This isn't just prettier—it's enterprise-ready documentation that stakeholders and compliance teams can understand.

---

# SCENE 3: SOLUTION ARCHITECTURE
**[4:30 - 6:30]**

*[Navigate to Solution Architecture tab]*

Now let's look at the complete solution architecture in enterprise detail.

This diagram shows the full stack from user input to data output.

Layer 1 — Input Sources:
At the top, you see all supported document sources:
- Patient intake forms and enrollment documents
- Prescriptions—handwritten or printed
- Insurance cards in all variants
- Medical imaging from radiology systems
- Invoices and billing documents

Layer 2 — AI Processing Engine:
This is the heart of the system:
- Document Classification using Vision AI
- Intelligent Model Routing based on document type and complexity
- Entity Extraction with healthcare-specific NLP
- Validation Engine with configurable rules

Layer 3 — Integration Layer:
Post-processing capabilities include:
- MCP SDK for external system integration
- Webhook support for real-time notifications
- API gateway for secure data access
- Audit logging for compliance requirements

Layer 4 — Output Destinations:
Extracted data flows to:
- Electronic Health Records
- Practice Management Systems
- Revenue Cycle Management platforms
- CRM systems like Salesforce

Notice the enterprise design standards—clear color differentiation between layers, solid backgrounds for accessibility, professional typography throughout, and consistent visual language.

---

# SCENE 4: TWO-STAGE PIPELINE
**[6:30 - 8:00]**

*[Navigate to NLP Pipeline diagram]*

The foundation remains our two-stage AI pipeline, but with significant enhancements.

Stage 1 — OCR with Provider Selection:
- Google Cloud Vision for general document processing
- AWS Textract for complex table extraction
- Azure Form Recognizer for structured forms

The key improvement: automatic provider routing based on document characteristics.

Stage 2 — NLP Entity Extraction, Now Multi-Model:

This is where the magic happens. Instead of one model for everything:
- Complex reasoning goes to Claude 3.5 Sonnet
- Structured data goes to GPT-4o
- High volume goes to Gemini 1.5 Flash

Each extraction includes:
- Confidence scores per field, zero to 100 percent
- Source attribution—OCR versus NLP derived
- Validation status against healthcare rules

New feature — Confidence Thresholds:
- High confidence, above 90 percent: Auto-process
- Medium, 70 to 90 percent: Human review queue
- Low, below 70 percent: Manual verification required

This human-in-the-loop approach ensures accuracy while maintaining efficiency.

---

# SCENE 5: PATIENT ONBOARDING DEMO
**[8:00 - 10:30]**

*[Navigate to Document Processing screen, select Patient Onboarding]*

Now let's see the enhanced system in action with patient onboarding documents.

Patient onboarding is one of the most complex document processing challenges because it involves multiple document types in a single workflow:
- Demographic forms
- Insurance information
- Medical history questionnaires
- Consent forms with signatures
- ID verification documents

*[Upload a patient enrollment form]*

Watch the processing—you'll see our enhanced progress indicators:
- Document classification in progress...
- Model selection: routing to Claude 3.5 for complex form...
- Entity extraction running...
- Healthcare validation applying...

*[Show Demographics Tab]*

Extracted Data — Demographics Tab:
- Patient name with confidence: 98 percent
- Date of birth: 95 percent
- Address: 92 percent
- Phone number: 97 percent
- Emergency contact: 89 percent

*[Navigate to Insurance Tab]*

Insurance Information:
- Member ID extracted from attached card
- Group number validated against payer database
- Primary versus secondary insurance detected

*[Navigate to Consent Tab]*

Consent Verification:
- Signature detected: Yes
- Signature confidence: 94 percent
- Date signed matches document date
- Required checkboxes: All verified

The Key Improvement:
Previously, each document type required separate processing. Now, the system intelligently chains related documents in a single patient onboarding flow.

All extracted data is pre-validated against:
- Required field completeness
- Data format rules—dates, phone numbers, SSN patterns
- Cross-document consistency checks

---

# SCENE 6: CLOSING & TEASER
**[10:30 - 11:30]**

*[Briefly show the Sub-Agent Recommendation Dialog appearing]*

So that's patient onboarding—from document upload to validated, structured data ready for your EHR or practice management system.

But here's where it gets really interesting...

You might have noticed this dialog appearing after processing. What you're seeing is a preview of something powerful—AI Sub-Agent Recommendations.

Imagine: after extracting patient data, the system automatically recommends follow-up AI agents:
- Insurance eligibility verification
- Demographics validation
- Care team assignment
- And more...

These sub-agents can take action on the extracted data—not just store it.

But that's a story for the next video.

In Part 2, I'll walk you through:
- How sub-agents are generated from document context
- The workflow canvas and visual orchestration
- Prescription processing with NDC lookup
- Medical imaging analysis with Vision AI
- MCP SDK integration for external systems

If you're curious about how Agentic AI transforms document processing into intelligent automation, make sure to subscribe and hit that notification bell.

In the meantime, check out the full technical article on LinkedIn—link in the description.

Thanks for watching! If you're working on healthcare automation, drop a comment—I'd love to hear about the challenges you're solving.

See you in the next one!

---

# PRODUCTION NOTES

## Sample Documents Needed
1. Patient Enrollment Form (multi-page)
2. Insurance Card (front and back)
3. Patient Demographics Form
4. Consent Form with signature

## YouTube Timestamps
0:00 Introduction
2:30 Before/After Architecture
4:30 Solution Architecture
6:30 Two-Stage Pipeline
8:00 Patient Onboarding Demo
10:30 What's Next

---

*Version 2.0 | January 2025*`;

const AUDIO_SCRIPT = `# Audio Script: Patient Onboarding
## Voice-Over Only — No Visual Cues

---

Hello everyone! Good morning, evening, afternoon, or night—wherever you are watching this video!

If you watched my previous video on this AI document processing platform, you saw what was possible in less than 64 hours during a single weekend.

Today, I'm excited to share what happened next—the evolution from a weekend prototype to an enterprise-grade solution.

Since that original build, I've been working on significant enhancements.

On the architecture side: enterprise-standard visual design with high-contrast, accessible interfaces. Solid opaque backgrounds replacing transparency for better readability. Professional typography using system fonts. And drop shadows with visual depth for clear layer separation.

On the functional side: intelligent multi-model AI routing. Dynamic field discovery across any document type. Enhanced confidence scoring with healthcare-specific validation. And seamless patient onboarding workflow integration.

What started as a proof-of-concept is now ready for production healthcare environments.

Let me walk you through the transformation—starting with the architecture changes that made this possible.

---

Let me start by showing you the before and after architecture transformation.

On the left, you can see the original architecture—what we built in 64 hours.

Before, with the single pipeline approach: one AI model for everything. Manual document type selection. Fixed field extraction with hardcoded mappings. 70 to 80 percent accuracy on complex documents. And limited validation with no confidence thresholds.

Now look at the right side—the enhanced enterprise architecture.

After, with intelligent multi-model routing: Claude 3.5 for complex medical documents requiring reasoning. GPT-4o for structured forms like insurance and billing. And Gemini 1.5 for high-volume processing with speed optimization.

Each model handles what it's best at.

Notice the visual improvements too. Solid opaque backgrounds with high contrast ratios. Professional color coding with semantic meaning. Clear section separation with drop shadows. And system fonts optimized for technical readability.

This isn't just prettier—it's enterprise-ready documentation that stakeholders and compliance teams can understand.

---

Now let's look at the complete solution architecture in enterprise detail.

This diagram shows the full stack from user input to data output.

Layer 1, Input Sources. At the top, you see all supported document sources: patient intake forms and enrollment documents, prescriptions both handwritten and printed, insurance cards in all variants, medical imaging from radiology systems, and invoices and billing documents.

Layer 2, the AI Processing Engine. This is the heart of the system. Document Classification using Vision AI. Intelligent Model Routing based on document type and complexity. Entity Extraction with healthcare-specific NLP. And a Validation Engine with configurable rules.

Layer 3, the Integration Layer. Post-processing capabilities include MCP SDK for external system integration, webhook support for real-time notifications, API gateway for secure data access, and audit logging for compliance requirements.

Layer 4, Output Destinations. Extracted data flows to Electronic Health Records, Practice Management Systems, Revenue Cycle Management platforms, and CRM systems like Salesforce.

Notice the enterprise design standards—clear color differentiation between layers, solid backgrounds for accessibility, professional typography throughout, and consistent visual language.

---

The foundation remains our two-stage AI pipeline, but with significant enhancements.

Stage 1, OCR with Provider Selection. Google Cloud Vision for general document processing. AWS Textract for complex table extraction. And Azure Form Recognizer for structured forms.

The key improvement: automatic provider routing based on document characteristics.

Stage 2, NLP Entity Extraction, now multi-model.

This is where the magic happens. Instead of one model for everything: complex reasoning goes to Claude 3.5 Sonnet, structured data goes to GPT-4o, and high volume goes to Gemini 1.5 Flash.

Each extraction includes: confidence scores per field from zero to 100 percent, source attribution showing whether it came from OCR or NLP, and validation status against healthcare rules.

New feature: Confidence Thresholds. High confidence above 90 percent means auto-process. Medium between 70 and 90 percent goes to the human review queue. And low below 70 percent requires manual verification.

This human-in-the-loop approach ensures accuracy while maintaining efficiency.

---

Now let's see the enhanced system in action with patient onboarding documents.

Patient onboarding is one of the most complex document processing challenges because it involves multiple document types in a single workflow: demographic forms, insurance information, medical history questionnaires, consent forms with signatures, and ID verification documents.

Watch the processing—you'll see our enhanced progress indicators. Document classification in progress. Model selection: routing to Claude 3.5 for complex form. Entity extraction running. Healthcare validation applying.

In the Demographics Tab, we see extracted data: patient name with confidence 98 percent, date of birth at 95 percent, address at 92 percent, phone number at 97 percent, and emergency contact at 89 percent.

Moving to the Insurance Tab: member ID extracted from attached card, group number validated against payer database, and primary versus secondary insurance detected.

In the Consent Tab: signature detected, yes. Signature confidence at 94 percent. Date signed matches document date. And all required checkboxes verified.

The key improvement: previously, each document type required separate processing. Now, the system intelligently chains related documents in a single patient onboarding flow.

All extracted data is pre-validated against required field completeness, data format rules for dates phone numbers and SSN patterns, and cross-document consistency checks.

---

So that's patient onboarding—from document upload to validated, structured data ready for your EHR or practice management system.

But here's where it gets really interesting.

You might have noticed this dialog appearing after processing. What you're seeing is a preview of something powerful—AI Sub-Agent Recommendations.

Imagine: after extracting patient data, the system automatically recommends follow-up AI agents. Insurance eligibility verification. Demographics validation. Care team assignment. And more.

These sub-agents can take action on the extracted data—not just store it.

But that's a story for the next video.

In Part 2, I'll walk you through: how sub-agents are generated from document context, the workflow canvas and visual orchestration, prescription processing with NDC lookup, medical imaging analysis with Vision AI, and MCP SDK integration for external systems.

If you're curious about how Agentic AI transforms document processing into intelligent automation, make sure to subscribe and hit that notification bell.

In the meantime, check out the full technical article on LinkedIn—link in the description.

Thanks for watching! If you're working on healthcare automation, drop a comment—I'd love to hear about the challenges you're solving.

See you in the next one!

---

*Total Runtime: Approximately 11 minutes*`;

export const VideoScriptDownloader: React.FC = () => {
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
          <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <div className="flex items-center gap-2 mb-2">
              <Video className="h-4 w-4 text-purple-400" />
              <span className="text-white font-medium">Video Script</span>
            </div>
            <p className="text-slate-400 text-xs mb-3">
              Full script with visual cues, scene directions, and timestamps for video recording.
            </p>
            <Button 
              onClick={handleDownloadVideoScript}
              variant="outline"
              size="sm"
              className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Video Script
            </Button>
          </div>
          
          <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <div className="flex items-center gap-2 mb-2">
              <Mic className="h-4 w-4 text-green-400" />
              <span className="text-white font-medium">Audio Script</span>
            </div>
            <p className="text-slate-400 text-xs mb-3">
              Voice-over only script, clean text without visual cues for audio recording or TTS.
            </p>
            <Button 
              onClick={handleDownloadAudioScript}
              variant="outline"
              size="sm"
              className="w-full border-green-500/50 text-green-300 hover:bg-green-500/20"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Audio Script
            </Button>
          </div>
        </div>

        <div className="text-xs text-slate-500 pt-2 border-t border-slate-700">
          <strong>Contents:</strong> Introduction → Before/After Architecture → Solution Architecture → Two-Stage Pipeline → Patient Onboarding Demo → Closing & Sub-Agent Teaser
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoScriptDownloader;
