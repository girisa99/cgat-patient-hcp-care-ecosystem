import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Eye, FileSearch, Sparkles, Database, ArrowDown } from 'lucide-react';

const NLPPipelineStepsDiagram = () => {
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
      </CardContent>
    </Card>
  );
};

export default NLPPipelineStepsDiagram;
