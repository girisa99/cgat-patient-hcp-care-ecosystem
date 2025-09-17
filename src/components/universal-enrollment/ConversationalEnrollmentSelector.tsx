/**
 * ENHANCED CONVERSATIONAL ENROLLMENT SELECTOR
 * Component to choose between AI agent types with detailed implementation highlights
 * Includes NPI/Credentialing confirmation and comprehensive API information
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, 
  FileText, 
  Zap, 
  Clock, 
  Workflow, 
  Shield, 
  Database, 
  Activity,
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  ChevronDown,
  ChevronUp,
  Users,
  Building2,
  Globe,
  Lock,
  Eye,
  FileCheck,
  Stethoscope,
  CreditCard
} from 'lucide-react';
import { SmartEnrollmentLauncher } from '../enrollment/SmartEnrollmentLauncher';
import { EnhancedFloatingConversationalAgent } from '../enrollment/EnhancedFloatingConversationalAgent';
import { EnhancedStructuredEnrollmentAgent } from '../enrollment/EnhancedStructuredEnrollmentAgent';
import { MCPStepwiseEnrollmentAgent } from '../enrollment/MCPStepwiseEnrollmentAgent';
import { useGlobalConversationalEnrollment } from '@/hooks/useGlobalConversationalEnrollment';
import { EnrollmentErrorBoundary } from '../enrollment/EnrollmentErrorBoundary';
import { EnrollmentAgentWorkflowCreator } from '../enrollment/EnrollmentAgentWorkflowCreator';
import { NPICredentialingConfirmationModal } from './NPICredentialingConfirmationModal';
import { MCPWelcomeOverview } from '../enrollment/MCPWelcomeOverview';
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
  const [selectedMethod, setSelectedMethod] = useState<'conversation' | 'structured' | 'traditional' | 'mcp_stepwise' | null>(null);
  const [showWorkflowCreator, setShowWorkflowCreator] = useState(false);
  const [showNPIConfirmation, setShowNPIConfirmation] = useState(false);
  const [pendingAgentType, setPendingAgentType] = useState<'mcp_stepwise' | 'structured' | 'conversation' | null>(null);
  const [showImplementationDetails, setShowImplementationDetails] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const { closeEnrollment } = useGlobalConversationalEnrollment();
  const navigate = useNavigate();

  const handleAgentSelection = (agentType: 'mcp_stepwise' | 'structured' | 'conversation') => {
    const isHealthcareModule = moduleType === 'patient' || moduleType === 'treatment_center';
    
    if (isHealthcareModule) {
      setPendingAgentType(agentType);
      setShowNPIConfirmation(true);
    } else {
      // Non-healthcare modules proceed directly
      if (agentType === 'structured') {
        console.log('Starting Structured AI with Workflow Creation');
        setShowWorkflowCreator(true);
      } else {
        setSelectedMethod(agentType);
      }
    }
  };

  const handleNPIConfirmation = (preferences: any) => {
    console.log('NPI/Credentialing preferences:', preferences);
    
    if (pendingAgentType === 'structured') {
      setShowWorkflowCreator(true);
    } else if (pendingAgentType) {
      setSelectedMethod(pendingAgentType);
    }
    
    setPendingAgentType(null);
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
        description: 'Complete your patient enrollment and medical intake with comprehensive provider verification',
        mcpBenefits: ['WhatsApp enrollment with real-time sync', 'Real-time NPI verification', 'Instant insurance eligibility', 'Provider credential validation', 'Clinical history integration', 'Business number management'],
        structuredBenefits: ['WhatsApp patient option', 'Section-by-section guidance', 'Medical terminology assistance', 'Form auto-completion', 'Insurance pre-validation', 'NPI verification integration'],
        conversationBenefits: ['WhatsApp conversational enrollment', 'AI personality selection (Humorous/Empathetic/Professional/Casual)', 'Natural medical conversation', 'Symptom explanation assistance', 'Treatment option discussion', 'Appointment scheduling'],
        traditionalBenefits: ['Familiar medical forms', 'Print-friendly format', 'Offline completion', 'Standard HIPAA compliance'],
        verificationAPIs: ['NPPES Registry', 'Eligibility APIs', 'Clinical Data Exchange'],
        dataCollected: ['Personal information', 'Insurance details', 'Medical history', 'Provider references', 'Emergency contacts']
      },
      treatment_center: {
        title: 'Treatment Center Onboarding',
        description: 'Comprehensive facility registration with full credentialing and compliance verification',
        mcpBenefits: ['Real-time facility NPI verification', 'Multi-state license validation', 'DEA registration checking', 'Insurance credentialing'],
        structuredBenefits: ['Regulatory compliance guidance', 'Accreditation tracking', 'Provider roster management', 'Documentation assistance'],
        conversationBenefits: ['Regulatory requirement explanation', 'Compliance gap analysis', 'Credentialing status updates', 'Custom workflow guidance'],
        traditionalBenefits: ['Standard onboarding forms', 'Document upload interface', 'Compliance checklists', 'Manual verification'],
        verificationAPIs: ['NPPES Registry', 'State Medical Boards', 'DEA Verification', 'CAQH ProView', 'Joint Commission', 'OIG Exclusion'],
        dataCollected: ['Facility information', 'Provider credentials', 'License numbers', 'DEA registrations', 'Insurance contracts', 'Accreditation status']
      },
      customer: {
        title: 'Customer Registration',
        description: 'Streamlined business account setup with identity and business verification',
        mcpBenefits: ['Business registration verification', 'Tax ID validation', 'Contact verification', 'Credit check integration'],
        structuredBenefits: ['Business type guidance', 'Service plan recommendations', 'Feature configuration', 'Integration setup'],
        conversationBenefits: ['Personalized onboarding', 'Service recommendations', 'Custom setup assistance', 'Integration planning'],
        traditionalBenefits: ['Quick registration', 'Standard business forms', 'Self-service setup', 'Immediate access'],
        verificationAPIs: ['D&B Business API', 'IRS Verification', 'Contact Validation Services'],
        dataCollected: ['Business information', 'Contact details', 'Tax identification', 'Service preferences', 'Payment information']
      },
      manufacturer: {
        title: 'Manufacturer Registration',
        description: 'FDA-compliant manufacturer onboarding with comprehensive regulatory verification',
        mcpBenefits: ['FDA registration verification', 'Manufacturing license validation', 'Product registration', 'Supply chain compliance'],
        structuredBenefits: ['Regulatory guidance', 'Product catalog setup', 'Quality certification tracking', 'Compliance monitoring'],
        conversationBenefits: ['Regulatory requirement explanation', 'Product classification assistance', 'Compliance gap analysis', 'Custom workflows'],
        traditionalBenefits: ['Standard registration forms', 'Document management', 'Manual verification', 'Compliance checklists'],
        verificationAPIs: ['FDA Establishment API', 'State Manufacturing Boards', 'ISO Registry', 'FDA NDC Database', 'DSCSA Compliance'],
        dataCollected: ['Manufacturing facility details', 'FDA registrations', 'Product information', 'Quality certifications', 'Supply chain data']
      }
    };
    return moduleInfo[type];
  };

  const getDetailedImplementation = (agentType: string) => {
    const implementations = {
      mcp_stepwise: {
        name: 'MCP Stepwise Agent',
        description: 'Most advanced AI agent with full MCP integration, WhatsApp enrollment, and real-time verification',
        features: [
          'Model Context Protocol (MCP) Integration',
          'WhatsApp enrollment with patient phone link',
          'Real-time database synchronization & form sync',
          'NPI provider verification integration',
          'Intelligent step-by-step guidance',
          'Auto-completion with validation',
          'Smart error recovery',
          'Contextual help system',
          'Business number management for WhatsApp'
        ],
        mcpTools: [
          'Healthcare MCP Server - Clinical data access and validation',
          'NPI Verification MCP Server - Real-time provider credential checks',
          'WhatsApp MCP Server - Patient communication and enrollment',
          'Filesystem MCP Server - Secure document handling',
          'BioMCP Server - Specialized biotech/pharma workflows (if applicable)'
        ],
        aiProviders: 'Works with OpenAI GPT-5, Claude 3.5, Gemini 2.0 (Provider-agnostic)',
        techStack: ['React + TypeScript', 'Supabase Backend', 'MCP Protocol', 'Real-time WebSockets', 'WhatsApp Business API'],
        benefits: ['WhatsApp patient enrollment', 'NPI real-time verification', 'Fastest completion time', 'Highest accuracy', 'Real-time validation', 'Smart assistance'],
        timeEstimate: '3-5 minutes (with WhatsApp)',
        accuracy: '99%+'
      },
      structured: {
        name: 'Structured AI Agent',
        description: 'Section-by-section AI guidance with WhatsApp integration and specialized assistance per form section',
        features: [
          'Section-specific AI models',
          'WhatsApp enrollment option for patients',
          'Real-time form synchronization',
          'NPI verification integration',
          'Form auto-completion',
          'Contextual validation',
          'Progress tracking',
          'Save and resume',
          'Data export options'
        ],
        mcpTools: ['WhatsApp Integration - Patient communication and data sync', 'NPI Verification - Real-time provider checks', 'Uses traditional form processing with AI enhancement'],
        aiProviders: 'Primarily OpenAI GPT-4o, with Claude 3.5 fallback',
        techStack: ['React + TypeScript', 'Supabase Backend', 'AI Form Enhancement', 'WhatsApp Business API', 'Progressive Web App'],
        benefits: ['WhatsApp patient option', 'Familiar form experience', 'AI-powered assistance', 'Section specialization', 'Flexible pacing'],
        timeEstimate: '6-10 minutes (4-6 with WhatsApp)',
        accuracy: '96%+'
      },
      conversational: {
        name: 'Conversational AI Agent',
        description: 'Natural language processing with WhatsApp integration and multiple personality modes for chat-based enrollment',
        features: [
          'Natural language understanding',
          'WhatsApp conversational enrollment',
          'AI personality selection (Humorous, Empathetic, Professional, Casual)',
          'Real-time form synchronization',
          'NPI verification during conversation',
          'Conversational data extraction',
          'Context awareness',
          'Clarifying questions',
          'Voice input support',
          'Multi-turn conversations'
        ],
        mcpTools: ['WhatsApp Integration - Patient conversations with personality modes', 'NPI Verification - Seamless provider validation', 'Uses conversational AI with standard APIs'],
        aiProviders: 'OpenAI GPT-4o for conversation, Claude 3.5 for data extraction',
        techStack: ['React + TypeScript', 'Supabase Backend', 'WhatsApp Business API', 'NLP Processing', 'Voice Recognition'],
        benefits: ['WhatsApp conversations', 'Multiple AI personalities', 'Most natural experience', 'Flexible interaction', 'Voice support', 'Adaptive flow'],
        timeEstimate: '5-10 minutes (WhatsApp), 10-15 minutes (web)',
        accuracy: '94%+'
      },
      traditional: {
        name: 'Traditional Forms',
        description: 'Standard HTML forms without AI assistance - fastest and most reliable fallback',
        features: [
          'Standard form validation',
          'Client-side validation',
          'Manual data entry',
          'Basic error checking',
          'Print-friendly format',
          'Offline capability'
        ],
        mcpTools: ['None - Pure form-based processing'],
        aiProviders: 'None - No AI processing involved',
        techStack: ['React + TypeScript', 'Supabase Backend', 'Standard Forms', 'Basic Validation'],
        benefits: ['Fastest loading', 'Most reliable', 'Offline capable', 'No AI dependencies'],
        timeEstimate: '15-20 minutes',
        accuracy: 'Depends on user input quality'
      }
    };
    return implementations[agentType];
  };

  if (selectedMethod === 'mcp_stepwise') {
    return (
      <EnrollmentErrorBoundary onBack={() => setSelectedMethod(null)}>
        <MCPStepwiseEnrollmentAgent
          moduleType={moduleType}
          enrollmentSource="mcp"
          onComplete={onComplete || (() => {})}
          onCancel={() => setSelectedMethod(null)}
        />
      </EnrollmentErrorBoundary>
    );
  }

  if (selectedMethod === 'conversation') {
    return (
      <EnrollmentErrorBoundary onBack={() => setSelectedMethod(null)}>
        <EnhancedFloatingConversationalAgent
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
        <EnhancedStructuredEnrollmentAgent
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

  // Show welcome overview first
  if (showWelcome) {
    return (
      <MCPWelcomeOverview 
        onStart={() => setShowWelcome(false)}
      />
    );
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MCP Stepwise Agent Method */}
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
              MCP Stepwise Agent
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Advanced MCP-powered stepwise process with WhatsApp enrollment, NPI verification, and real-time updates
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Benefits:</h4>
              <ul className="space-y-1">
                <li className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                  WhatsApp patient enrollment
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                  NPI verification integration
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                  Real-time form sync
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                  MCP tool integration
                </li>
              </ul>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Estimated time: 3-5 minutes</span>
            </div>
            
            <Button 
              className="w-full bg-green-500 hover:bg-green-600 gap-2"
              onClick={() => handleAgentSelection('mcp_stepwise')}
            >
              <Zap className="w-4 h-4" />
              Start MCP Agent
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
              Section-by-section AI guidance with WhatsApp integration and specialized assistance
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Benefits:</h4>
              <ul className="space-y-1">
                <li className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 bg-blue-500 rounded-full" />
                  WhatsApp enrollment option
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 bg-blue-500 rounded-full" />
                  NPI verification integration
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 bg-blue-500 rounded-full" />
                  Real-time form sync
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 bg-blue-500 rounded-full" />
                  Specialized AI per section
                </li>
              </ul>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Estimated time: 6-10 minutes</span>
            </div>
            
            <Button 
              className="w-full"
              onClick={() => handleAgentSelection('structured')}
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
              Natural chat with WhatsApp integration, AI personalities, and real-time sync
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
              <span>Estimated time: 5-10 minutes</span>
            </div>
            
            <Button 
              className="w-full"
              onClick={() => handleAgentSelection('conversation')}
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

      {/* NPI/Credentialing Confirmation Modal */}
      {showNPIConfirmation && pendingAgentType && (
        <NPICredentialingConfirmationModal
          isOpen={showNPIConfirmation}
          onClose={() => {
            setShowNPIConfirmation(false);
            setPendingAgentType(null);
          }}
          onConfirm={handleNPIConfirmation}
          moduleType={moduleType}
          agentType={pendingAgentType === 'conversation' ? 'conversational' : pendingAgentType}
        />
      )}

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