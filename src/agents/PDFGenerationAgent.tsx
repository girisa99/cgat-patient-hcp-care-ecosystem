/**
 * PDF GENERATION AGENT
 * Reusable PDF generation agent for all forms across applications
 * Supports MCP, Conversational AI, and Structured AI integration
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FileText, 
  Download, 
  Settings, 
  Bot, 
  MessageSquare, 
  Database,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';

interface PDFTemplate {
  id: string;
  name: string;
  description: string;
  templateType: 'enrollment' | 'consent' | 'clinical' | 'insurance' | 'universal';
  aiIntegrations: ('mcp' | 'conversational' | 'structured')[];
  fields: string[];
  isActive: boolean;
}

interface PDFGenerationJob {
  id: string;
  templateId: string;
  formData: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  aiType: 'mcp' | 'conversational' | 'structured' | 'manual';
  generatedAt?: string;
  downloadUrl?: string;
  error?: string;
}

const PDF_TEMPLATES: PDFTemplate[] = [
  {
    id: 'enrollment-comprehensive',
    name: 'Comprehensive Enrollment Form',
    description: 'Complete patient enrollment with all sections',
    templateType: 'enrollment',
    aiIntegrations: ['mcp', 'conversational', 'structured'],
    fields: ['demographics', 'clinical', 'insurance', 'provider', 'compliance'],
    isActive: true
  },
  {
    id: 'consent-forms',
    name: 'Consent Forms Package',
    description: 'HIPAA, treatment, and research consents',
    templateType: 'consent',
    aiIntegrations: ['structured', 'conversational'],
    fields: ['hipaa_consent', 'treatment_consent', 'research_consent'],
    isActive: true
  },
  {
    id: 'clinical-summary',
    name: 'Clinical Summary Report',
    description: 'Medical history and assessment summary',
    templateType: 'clinical',
    aiIntegrations: ['mcp', 'structured'],
    fields: ['medical_history', 'assessment', 'treatment_plan'],
    isActive: true
  },
  {
    id: 'insurance-verification',
    name: 'Insurance Verification Package',
    description: 'Benefits verification and coverage details',
    templateType: 'insurance',
    aiIntegrations: ['mcp', 'structured'],
    fields: ['primary_insurance', 'benefits', 'prior_auth'],
    isActive: true
  },
  {
    id: 'universal-form',
    name: 'Universal Form Template',
    description: 'Reusable across any application or form type',
    templateType: 'universal',
    aiIntegrations: ['mcp', 'conversational', 'structured'],
    fields: ['dynamic_fields'],
    isActive: true
  }
];

export const PDFGenerationAgent: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<PDFTemplate | null>(null);
  const [generationJobs, setGenerationJobs] = useState<PDFGenerationJob[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { showSuccess, showError } = useMasterToast();

  const generatePDF = async (template: PDFTemplate, formData: any, aiType: 'mcp' | 'conversational' | 'structured' | 'manual') => {
    setIsGenerating(true);
    
    try {
      // Call the universal PDF generation edge function
      const { data, error } = await supabase.functions.invoke('generate-enrollment-pdf', {
        body: {
          templateId: template.id,
          templateType: template.templateType,
          formData: formData,
          aiType: aiType,
          metadata: {
            aiIntegrations: template.aiIntegrations,
            fields: template.fields,
            generatedBy: 'pdf_agent'
          }
        }
      });

      if (error) throw error;

      const newJob: PDFGenerationJob = {
        id: data.documentId,
        templateId: template.id,
        formData: formData,
        status: 'completed',
        aiType: aiType,
        generatedAt: new Date().toISOString(),
        downloadUrl: data.pdfUrl
      };

      setGenerationJobs(prev => [newJob, ...prev]);
      showSuccess('PDF Generated', `${template.name} PDF generated successfully`);
      
    } catch (error: any) {
      console.error('PDF Generation Error:', error);
      showError('Generation Failed', error.message || 'Failed to generate PDF');
      
      const failedJob: PDFGenerationJob = {
        id: `failed-${Date.now()}`,
        templateId: template.id,
        formData: formData,
        status: 'failed',
        aiType: aiType,
        error: error.message
      };
      
      setGenerationJobs(prev => [failedJob, ...prev]);
    } finally {
      setIsGenerating(false);
    }
  };

  const getAITypeBadge = (aiType: 'mcp' | 'conversational' | 'structured' | 'manual') => {
    const config = {
      mcp: { color: 'bg-blue-500', icon: Database, label: 'MCP' },
      conversational: { color: 'bg-green-500', icon: MessageSquare, label: 'Conversational' },
      structured: { color: 'bg-purple-500', icon: Settings, label: 'Structured' },
      manual: { color: 'bg-gray-500', icon: FileText, label: 'Manual' }
    };
    
    const typeConfig = config[aiType];
    const Icon = typeConfig.icon;
    
    return (
      <Badge className={`${typeConfig.color} text-white flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {typeConfig.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: PDFGenerationJob['status']) => {
    const config = {
      pending: { color: 'bg-yellow-500', icon: Loader2, label: 'Pending' },
      processing: { color: 'bg-blue-500', icon: Loader2, label: 'Processing' },
      completed: { color: 'bg-green-500', icon: Check, label: 'Completed' },
      failed: { color: 'bg-red-500', icon: AlertCircle, label: 'Failed' }
    };
    
    const statusConfig = config[status];
    const Icon = statusConfig.icon;
    
    return (
      <Badge className={`${statusConfig.color} text-white flex items-center gap-1`}>
        <Icon className={`h-3 w-3 ${status === 'processing' ? 'animate-spin' : ''}`} />
        {statusConfig.label}
      </Badge>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="h-8 w-8" />
            PDF Generation Agent
          </h1>
          <p className="text-muted-foreground">
            Universal PDF generation for all forms across applications with AI integration
          </p>
        </div>
      </div>

      {/* Agent Capabilities */}
      <Alert>
        <Bot className="h-4 w-4" />
        <AlertDescription>
          This PDF agent works universally across all forms and applications. It integrates with MCP agents, 
          Conversational AI, and Structured AI to generate documents from any data source.
        </AlertDescription>
      </Alert>

      {/* PDF Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Available PDF Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {PDF_TEMPLATES.map((template) => (
              <Card 
                key={template.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center justify-between">
                    {template.name}
                    <Badge variant={template.isActive ? "default" : "secondary"}>
                      {template.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">AI Integrations:</span>
                      <div className="flex gap-1">
                        {template.aiIntegrations.map((ai) => getAITypeBadge(ai))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Fields:</span>
                      <Badge variant="outline">{template.fields.length} sections</Badge>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          generatePDF(template, {}, 'manual');
                        }}
                        disabled={isGenerating}
                        className="flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        Generate Sample
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generation Jobs History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent PDF Generation Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {generationJobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No PDF generation jobs yet. Generate your first PDF above.
            </div>
          ) : (
            <div className="space-y-3">
              {generationJobs.map((job) => {
                const template = PDF_TEMPLATES.find(t => t.id === job.templateId);
                return (
                  <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5" />
                      <div>
                        <p className="font-medium">{template?.name || 'Unknown Template'}</p>
                        <p className="text-sm text-muted-foreground">
                          Generated {job.generatedAt ? new Date(job.generatedAt).toLocaleString() : 'Unknown time'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getAITypeBadge(job.aiType)}
                      {getStatusBadge(job.status)}
                      {job.status === 'completed' && job.downloadUrl && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={job.downloadUrl} download>
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integration Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-500" />
                MCP Integration
              </h4>
              <p className="text-sm text-muted-foreground">
                Automatically integrates with database agents for data retrieval and validation.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-green-500" />
                Conversational AI
              </h4>
              <p className="text-sm text-muted-foreground">
                Processes natural language data from conversational enrollment sessions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Settings className="h-4 w-4 text-purple-500" />
                Structured AI
              </h4>
              <p className="text-sm text-muted-foreground">
                Handles structured form data with validation and formatting.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};