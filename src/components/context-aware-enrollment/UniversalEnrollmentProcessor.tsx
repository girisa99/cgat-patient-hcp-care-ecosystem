import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Send, 
  Bot,
  Mic,
  Brain
} from 'lucide-react';
import { UniversalWorkflowProcessor } from '@/components/workflow-processor/UniversalWorkflowProcessor';
import { UniversalLLMAssistant } from '@/components/intelligent-assistant/UniversalLLMAssistant';
import { toast } from 'sonner';

interface UniversalEnrollmentProcessorProps {
  selectedOption: string;
  moduleType: 'patient' | 'treatment_center' | 'customer' | 'manufacturer';
  onComplete?: (data: any) => void;
}

export const UniversalEnrollmentProcessor: React.FC<UniversalEnrollmentProcessorProps> = ({
  selectedOption,
  moduleType,
  onComplete
}) => {
  const [processingData, setProcessingData] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'workflow' | 'assistant'>('workflow');

  const getWorkflowType = (option: string) => {
    switch (option) {
      case 'online-form':
        return 'fill_online';
      case 'pdf-fill':
        return 'pdf_submit';
      case 'download-fax':
        return 'fill_fax_ocr';
      case 'agent':
        return 'agent_assisted';
      default:
        return 'fill_online';
    }
  };

  const getProcessorTitle = (option: string) => {
    const titles = {
      'online-form': 'Fill Online Form',
      'pdf-fill': 'Fill & Submit PDF',
      'download-fax': 'Fill & Fax (OCR)',
      'agent': 'AI Agent-Assisted Enrollment'
    };
    return titles[option as keyof typeof titles] || 'Enrollment Processing';
  };

  const getProcessorDescription = (option: string, moduleType: string) => {
    const moduleNames = {
      patient: 'Patient',
      treatment_center: 'Treatment Center',
      customer: 'Customer',
      manufacturer: 'Manufacturer'
    };
    
    const descriptions = {
      'online-form': `Complete ${moduleNames[moduleType as keyof typeof moduleNames]} enrollment using our online form with NPI verification, credentialing, and voice support`,
      'pdf-fill': `Generate and fill a PDF form for ${moduleNames[moduleType as keyof typeof moduleNames]} enrollment with automatic submission`,
      'download-fax': `Process ${moduleNames[moduleType as keyof typeof moduleNames]} enrollment via fax with OCR text extraction and verification`,
      'agent': `AI-powered conversational enrollment for ${moduleNames[moduleType as keyof typeof moduleNames]} with intelligent assistance`
    };
    
    return descriptions[option as keyof typeof descriptions] || 'Processing enrollment with comprehensive verification';
  };

  const handleWorkflowComplete = (completedData: any) => {
    const enrichedData = {
      ...completedData,
      module_type: moduleType,
      processing_option: selectedOption,
      completed_at: new Date().toISOString(),
      features_used: [
        'npi_verification',
        'credentialing_check',
        'voice_processing',
        'llm_assistance'
      ]
    };

    toast.success('Enrollment completed successfully!', {
      description: 'All verification and processing steps have been completed.'
    });

    onComplete?.(enrichedData);
  };

  const handleDataCapture = (capturedData: any) => {
    setProcessingData(prev => ({
      ...prev,
      ...capturedData,
      last_updated: new Date().toISOString()
    }));
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                {selectedOption === 'agent' ? <Bot className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{getProcessorTitle(selectedOption)}</h2>
                <p className="text-sm text-muted-foreground">
                  {getProcessorDescription(selectedOption, moduleType)}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="ml-4">
              {moduleType.replace('_', ' ').toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="workflow" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Workflow Processor
          </TabsTrigger>
          <TabsTrigger value="assistant" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Assistant
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workflow" className="mt-6">
          <UniversalWorkflowProcessor
            workflowType={getWorkflowType(selectedOption)}
            initialData={{
              module_type: moduleType,
              processing_option: selectedOption,
              started_at: new Date().toISOString()
            }}
            onComplete={handleWorkflowComplete}
          />
        </TabsContent>

        <TabsContent value="assistant" className="mt-6">
          <UniversalLLMAssistant
            context={{
              module_type: moduleType,
              processing_option: selectedOption,
              workflow_data: processingData
            }}
            workflowType={selectedOption === 'download-fax' ? 'fax' : 
                         selectedOption === 'pdf-fill' ? 'pdf' :
                         selectedOption === 'online-form' ? 'online' : 'enrollment'}
            onDataCapture={handleDataCapture}
            onActionSuggestion={(action) => {
              toast.info(`Suggested action: ${action.type}`, {
                description: action.description
              });
            }}
          />
        </TabsContent>
      </Tabs>

      <Card className="border-dashed">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">NPI Verification</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Credentialing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Voice Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm">AI Assistance</span>
              </div>
            </div>
            <p className="text-sm">
              This processor includes comprehensive verification, voice support, and AI assistance for all workflow types.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};