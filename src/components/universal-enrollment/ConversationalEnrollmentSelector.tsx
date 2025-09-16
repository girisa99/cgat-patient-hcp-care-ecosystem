/**
 * CONVERSATIONAL ENROLLMENT SELECTOR
 * Component to choose between traditional forms or AI conversation
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, FileText, Zap, Clock, Workflow } from 'lucide-react';
import { SmartEnrollmentLauncher } from '../enrollment/SmartEnrollmentLauncher';
import { FloatingConversationalAgent } from '../enrollment/FloatingConversationalAgent';
import { StructuredEnrollmentAgent } from '../enrollment/StructuredEnrollmentAgent';
import { useGlobalConversationalEnrollment } from '@/hooks/useGlobalConversationalEnrollment';
import { EnrollmentErrorBoundary } from '../enrollment/EnrollmentErrorBoundary';
import { EnrollmentAgentWorkflowCreator } from '../enrollment/EnrollmentAgentWorkflowCreator';
import { useNavigate } from 'react-router-dom';

type ModuleType = 'patient' | 'treatment_center' | 'customer' | 'manufacturer';

interface ConversationalEnrollmentSelectorProps {
  moduleType: ModuleType;
  onComplete?: (result: any) => void;
}

export const ConversationalEnrollmentSelector: React.FC<ConversationalEnrollmentSelectorProps> = ({
  moduleType,
  onComplete
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'conversation' | 'structured' | 'traditional' | null>(null);
  const [showWorkflowCreator, setShowWorkflowCreator] = useState(false);
  const { closeEnrollment } = useGlobalConversationalEnrollment();
  const navigate = useNavigate();

  const handleStructuredAI = () => {
    console.log('Starting Structured AI with Workflow Creation');
    setShowWorkflowCreator(true);
  };

  const handleAgentCreated = (agent: any) => {
    console.log('Agent created:', agent);
    setShowWorkflowCreator(false);
    setSelectedMethod('structured');
  };

  const getModuleInfo = (type: ModuleType) => {
    const moduleInfo = {
      patient: {
        title: 'Patient Enrollment',
        description: 'Complete your patient enrollment and medical intake',
        conversationBenefits: ['Natural conversation flow', 'Ask questions anytime', 'Guided step-by-step'],
        traditionalBenefits: ['Familiar form interface', 'Fill at your own pace', 'Standard form layout']
      },
      treatment_center: {
        title: 'Treatment Center Onboarding',
        description: 'Register your facility and complete onboarding requirements',
        conversationBenefits: ['AI guides through regulations', 'Complex questions simplified', 'Real-time assistance'],
        traditionalBenefits: ['Structured form sections', 'Save and resume later', 'Clear requirements list']
      },
      customer: {
        title: 'Customer Registration',
        description: 'Join our platform and set up your account',
        conversationBenefits: ['Personalized setup', 'Tailored recommendations', 'Interactive assistance'],
        traditionalBenefits: ['Quick standard setup', 'Familiar registration', 'Minimal time investment']
      },
      manufacturer: {
        title: 'Manufacturer Registration',
        description: 'Register your company and products',
        conversationBenefits: ['Product catalog assistance', 'Compliance guidance', 'Custom workflows'],
        traditionalBenefits: ['Bulk data entry', 'Structured product forms', 'Standard categories']
      }
    };
    return moduleInfo[type];
  };

  if (selectedMethod === 'conversation') {
    return (
      <EnrollmentErrorBoundary onBack={() => setSelectedMethod(null)}>
        <FloatingConversationalAgent
          moduleType={moduleType}
          onComplete={onComplete || (() => {})}
          onCancel={() => setSelectedMethod(null)}
        />
      </EnrollmentErrorBoundary>
    );
  }

  if (selectedMethod === 'structured') {
    return (
      <EnrollmentErrorBoundary onBack={() => setSelectedMethod(null)}>
        <StructuredEnrollmentAgent
          moduleType={moduleType}
          onComplete={onComplete || (() => {})}
          onCancel={() => setSelectedMethod(null)}
        />
      </EnrollmentErrorBoundary>
    );
  }

  if (selectedMethod === 'traditional') {
    // Close modal and let the user continue with the existing form on the page
    closeEnrollment();
    return null;
  }

  const moduleInfo = getModuleInfo(moduleType);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{moduleInfo.title}</CardTitle>
          <p className="text-muted-foreground">{moduleInfo.description}</p>
        </CardHeader>
      </Card>

      {/* Method Selection */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* AI Agent Method */}
        <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors cursor-pointer group">
          <div className="absolute top-4 right-4">
            <Badge variant="default" className="bg-green-500">
              <Zap className="h-3 w-3 mr-1" />
              Recommended
            </Badge>
          </div>
          
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Zap className="h-6 w-6 text-green-500" />
              </div>
              AI Agent
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Guided step-by-step process with AI assistance and real-time database updates
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Benefits:</h4>
              <ul className="space-y-1">
                <li className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                  Step-by-step guidance
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                  Real-time database updates
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                  Progress tracking
                </li>
              </ul>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Estimated time: 5-10 minutes</span>
            </div>
            
            <Button 
              className="w-full bg-green-500 hover:bg-green-600 gap-2"
              onClick={() => {
                closeEnrollment();
                navigate(`/agents?from=enrollment&module=${moduleType}&open=builder`);
              }}
            >
              <Zap className="w-4 h-4" />
              Start AI Agent
            </Button>
          </CardContent>
        </Card>

        {/* Structured AI Method */}
        <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors cursor-pointer group">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Workflow className="h-6 w-6 text-blue-500" />
              </div>
              Structured AI
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Section-by-section AI guidance with specialized assistance
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Benefits:</h4>
              <ul className="space-y-1">
                <li className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 bg-blue-500 rounded-full" />
                  Specialized AI per section
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 bg-blue-500 rounded-full" />
                  Structured data capture
                </li>
              </ul>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Estimated time: 8-12 minutes</span>
            </div>
            
            <Button 
              className="w-full"
              onClick={handleStructuredAI}
            >
              <Workflow className="w-4 h-4" />
              Create AI Agent
            </Button>
          </CardContent>
        </Card>

        {/* Conversational AI Method */}
        <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors cursor-pointer group">
          <div className="absolute top-4 right-4">
            <Badge variant="default" className="bg-primary">
              <MessageCircle className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
          </div>
          
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              Conversational AI
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Single AI conversation covering all enrollment aspects naturally
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Benefits:</h4>
              <ul className="space-y-1">
                {moduleInfo.conversationBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Estimated time: 10-15 minutes</span>
            </div>
            
            <Button 
              className="w-full"
              onClick={() => setSelectedMethod('conversation')}
            >
              Start AI Conversation
            </Button>
          </CardContent>
        </Card>

        {/* Traditional Form Method */}
        <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors cursor-pointer group">
          <div className="absolute top-4 right-4">
            <Badge variant="outline">
              Classic
            </Badge>
          </div>
          
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              Traditional Forms
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Use the existing manual form interface you're already familiar with
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Benefits:</h4>
              <ul className="space-y-1">
                {moduleInfo.traditionalBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="h-1.5 w-1.5 bg-muted-foreground rounded-full" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Estimated time: 15-20 minutes</span>
            </div>
            
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => setSelectedMethod('traditional')}
            >
              Use Existing Form
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              All methods collect the same information and provide digital signature and PDF generation.
            </p>
            <p className="text-xs text-muted-foreground">
              • <strong>Structured AI</strong>: Section-by-section with specialized AI assistance (Recommended)<br/>
              • <strong>Conversational AI</strong>: Natural chat-based enrollment process<br/>
              • <strong>Traditional Forms</strong>: Use the existing manual form on this page
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Creator */}
      {showWorkflowCreator && (
        <EnrollmentErrorBoundary onBack={() => setShowWorkflowCreator(false)}>
          <EnrollmentAgentWorkflowCreator 
            onAgentCreated={handleAgentCreated}
            onClose={() => setShowWorkflowCreator(false)}
          />
        </EnrollmentErrorBoundary>
      )}
    </div>
  );
};