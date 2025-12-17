import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Eye, FileSearch, Sparkles, Database, ArrowDown, Download, Video } from 'lucide-react';
import { toast } from 'sonner';

const videoScript = `# Document Processing Platform - Video Script

## Video Title
**"AI-Powered Document Processing: From Upload to Insights in Seconds"**

---

## INTRO (0:00 - 0:30)

> "Hey everyone! Today I'm walking you through our AI-powered document processing platform that transforms how healthcare organizations handle prescriptions, insurance cards, medical imaging, and invoices."

## SECTION 1: THE TWO-STAGE PIPELINE (0:30 - 1:30)

> "Our platform uses a two-stage AI pipeline. Stage 1 is OCR - Google Cloud Vision, AWS Textract, or Azure Form Recognizer extracts raw text. Stage 2 is NLP Entity Extraction with Google Gemini 2.5 Flash - the AI understands context, not just characters."

## SECTION 2: PRESCRIPTION PROCESSING DEMO (1:30 - 3:00)

> "Let's see this in action with a prescription. Watch the processing stages - real-time progress as each step completes. We extract patient name, medication, dosage, frequency, prescriber - plus automatic NDC lookup and clinical recommendations."

## SECTION 3: INSURANCE CARD PROCESSING (3:00 - 4:00)

> "Our system auto-detects insurance card variants - pharmacy, medical, or Medicaid. It expands abbreviations too - DED becomes Deductible, OOP becomes Out of Pocket Maximum."

## SECTION 4: MEDICAL IMAGING ANALYSIS (4:00 - 5:30)

> "Medical imaging uses vision AI - ResNet and Vision Transformers analyze images for abnormalities. Auto-detects modality and anatomical region with confidence scores."

## SECTION 5: INVOICE & RCM ANALYSIS (5:30 - 6:30)

> "Full Revenue Cycle Management analysis - CPT codes, Revenue codes, ICD-10 diagnosis codes. Real-time code lookups via NLM Clinical Tables API."

## SECTION 6: MCP SDK EXPORT (6:30 - 7:30)

> "Push extracted data to Supabase, Salesforce, HubSpot, Veeva, or any external API via webhooks. Field mapping is automatic but fully customizable."

## SECTION 7: SUB-AGENT RECOMMENDATIONS (7:30 - 8:15)

> "After processing, the system recommends AI sub-agents for follow-up workflows. Click 'Build Agent' and it auto-generates a workflow on our visual canvas."

## SECTION 8: PROCESSING HISTORY (8:15 - 8:45)

> "Everything is tracked and auditable. History tab shows all processed documents with thumbnails and confidence scores."

## CLOSING (8:45 - 9:15)

> "That's the AI-powered document processing platform. Check out the full technical article linked in the description. Thanks for watching!"

---

## VIDEO DESCRIPTION

🏥 AI-Powered Document Processing for Healthcare
✅ Prescriptions with NDC lookup
✅ Insurance cards with auto-variant detection
✅ Medical imaging with AI analysis
✅ Invoices with RCM

Tech Stack: Google Cloud Vision, Gemini 2.5 Flash, OpenFDA, NLM Clinical Tables, ResNet, Vision Transformers

#HealthcareAI #DocumentProcessing #MachineLearning
`;

const NLPPipelineStepsDiagram = () => {
  const handleDownloadScript = () => {
    const blob = new Blob([videoScript], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Document_Processing_Video_Script.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Video script downloaded!');
  };

  const steps = [
    {
      number: 1,
      title: 'Upload Document',
      description: 'User uploads prescription, insurance card, or invoice',
      icon: FileText,
      color: 'bg-blue-500',
      borderColor: 'border-blue-500'
    },
    {
      number: 2,
      title: 'OCR Text Extraction',
      description: 'Google Vision API reads all text from the image',
      icon: Eye,
      color: 'bg-green-500',
      borderColor: 'border-green-500'
    },
    {
      number: 3,
      title: 'Detect Document Type',
      description: 'System identifies: prescription, insurance, or invoice',
      icon: FileSearch,
      color: 'bg-orange-500',
      borderColor: 'border-orange-500'
    },
    {
      number: 4,
      title: 'AI Entity Extraction',
      description: 'Gemini 2.5 Flash analyzes text and extracts structured data',
      icon: Sparkles,
      color: 'bg-purple-500',
      borderColor: 'border-purple-500'
    },
    {
      number: 5,
      title: 'Structured Output',
      description: 'Clean JSON with patient name, medication, dosage, etc.',
      icon: Database,
      color: 'bg-teal-500',
      borderColor: 'border-teal-500'
    }
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-xl">
          Document Processing Pipeline
        </CardTitle>
        <p className="text-center text-muted-foreground text-sm">
          Stage 1: OCR → Stage 2: NLP Entity Extraction
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className={`flex items-center gap-4 p-4 rounded-lg border-2 ${step.borderColor} bg-card`}>
              <div className={`flex-shrink-0 w-12 h-12 rounded-full ${step.color} flex items-center justify-center text-white font-bold text-lg`}>
                {step.number}
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2">
                  <step.icon className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {step.description}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="flex justify-center">
                <ArrowDown className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </React.Fragment>
        ))}
        
        {/* Output example */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-xs font-mono text-muted-foreground mb-2">Example Output:</p>
          <pre className="text-xs font-mono text-foreground overflow-x-auto">
{`{
  "patient_name": "John Smith",
  "medication": "Amoxicillin",
  "dosage": "500mg",
  "frequency": "3x daily",
  "prescriber": "Dr. Johnson"
}`}
          </pre>
        </div>

        {/* Video Script Download */}
        <div className="mt-6 p-4 border border-primary/20 rounded-lg bg-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Video Script</p>
                <p className="text-xs text-muted-foreground">8-9 min walkthrough script</p>
              </div>
            </div>
            <Button onClick={handleDownloadScript} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download .md
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NLPPipelineStepsDiagram;
