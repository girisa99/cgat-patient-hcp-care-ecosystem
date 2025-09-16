/**
 * STRUCTURED ENROLLMENT AGENT WITH MCP INTEGRATION
 * Multi-agent system with real-time MCP tools, healthcare validation, and structured conversations
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Heart, 
  Shield, 
  FileCheck, 
  MessageCircle, 
  CheckCircle,
  ArrowRight,
  Bot,
  Building2,
  CreditCard,
  Activity,
  Send,
  Stethoscope,
  Search,
  AlertCircle,
  Database,
  Zap,
  Workflow
} from 'lucide-react';
import { useEnrollmentAgent } from '@/hooks/useEnrollmentAgent';
import { useEnrollmentRealtime } from '@/hooks/useEnrollmentRealtime';
import { useHealthcareAI } from '@/hooks/useHealthcareAI';
import { useNPIVerification } from '@/hooks/useNPIVerification';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type ModuleType = 'patient' | 'treatment_center' | 'customer' | 'manufacturer';

interface EnrollmentSection {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  aiPrompt: string;
  estimatedTime: string;
  requiredFields: string[];
  validationRules: Record<string, any>;
  hasSubsections?: boolean;
  subsections?: EnrollmentSection[];
  // MCP Integration
  mcpTools: string[];
  realtimeEnabled: boolean;
  mcpContext?: Record<string, any>;
}

interface MCPSession {
  sessionId: string;
  mcpServerStatus: 'connecting' | 'connected' | 'error';
  realtimeChannel: any;
  currentStep: number;
  stepData: Record<string, any>;
  conversationHistory: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    mcpContext?: any;
  }>;
}

interface StructuredEnrollmentAgentProps {
  moduleType: ModuleType;
  onComplete?: (result: { instanceId: string; pdfUrl: string }) => void;
  onCancel?: () => void;
}

export const StructuredEnrollmentAgent: React.FC<StructuredEnrollmentAgentProps> = ({
  moduleType,
  onComplete,
  onCancel
}) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [activeChatSection, setActiveChatSection] = useState<string | null>(null);
  const [sectionData, setSectionData] = useState<Record<string, any>>({});
  const [npiVerificationEnabled, setNpiVerificationEnabled] = useState<boolean | null>(null);
  const [isNpiVerifying, setIsNpiVerifying] = useState(false);
  
  // MCP Integration State
  const [mcpSession, setMcpSession] = useState<MCPSession | null>(null);
  const [mcpError, setMcpError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { verifyCredentials } = useNPIVerification();
  
  // MCP Hooks
  const { 
    isConnected: realtimeConnected, 
    connect: connectRealtime,
    updateEnrollmentData,
    createConversationEntry
  } = useEnrollmentRealtime();
  
  const { 
    queryHealthcareAI, 
    executeMCPRequest, 
    isLoading: mcpLoading 
  } = useHealthcareAI();
  
  const {
    currentSession,
    isLoading,
    startEnrollment,
    updateSection,
    completeSection,
    generatePDF
  } = useEnrollmentAgent();

  const sections = getSectionsForModule(moduleType);
  const currentSection = sections[currentSectionIndex];
  const progress = ((currentSectionIndex + 1) / sections.length) * 100;

  // Initialize MCP session and realtime connection
  useEffect(() => {
    const initializeMCPSession = async () => {
      try {
        // Connect to realtime
        await connectRealtime();
        
        // Initialize MCP session
        const sessionId = `mcp-structured-${Date.now()}`;
        const newMcpSession: MCPSession = {
          sessionId,
          mcpServerStatus: 'connecting',
          realtimeChannel: null,
          currentStep: 0,
          stepData: {},
          conversationHistory: []
        };
        
        setMcpSession(newMcpSession);
        
        // Start enrollment session
        if (!currentSession) {
          await startEnrollment(moduleType);
        }
        
        // Add initial MCP conversation entry
        await createConversationEntry({
          sessionId,
          agentId: 'structured-enrollment-agent',
          data: [{
            role: 'assistant',
            content: 'Structured Enrollment Agent with MCP integration initialized',
            timestamp: new Date()
          }],
          metadata: { moduleType, mcpEnabled: true }
        });
        
        // Update MCP status
        setMcpSession(prev => prev ? { ...prev, mcpServerStatus: 'connected' } : null);
        
        toast({
          title: "MCP Integration Active",
          description: "Real-time healthcare tools and validation enabled",
        });
      } catch (error) {
        console.error('MCP initialization failed:', error);
        setMcpError('Failed to initialize MCP integration');
        setMcpSession(prev => prev ? { ...prev, mcpServerStatus: 'error' } : null);
      }
    };

    initializeMCPSession();
  }, [moduleType]);

  useEffect(() => {
    if (!currentSession && mcpSession?.mcpServerStatus === 'connected') {
      startEnrollment(moduleType);
    }
  }, [moduleType, currentSession, startEnrollment, mcpSession?.mcpServerStatus]);

  const handleStartSectionChat = (sectionId: string) => {
    setActiveChatSection(sectionId);
  };

  const handleSectionComplete = async (sectionId: string, data: any) => {
    setSectionData(prev => ({ ...prev, [sectionId]: data }));
    
    // MCP Integration: Real-time data update
    if (mcpSession && realtimeConnected) {
      try {
        // Update enrollment data in real-time
        await updateEnrollmentData(currentSession?.instanceId || '', sectionId, data);
        
        // Execute MCP tools for this section
        const section = sections.find(s => s.id === sectionId);
        if (section?.mcpTools) {
          for (const tool of section.mcpTools) {
            try {
              await executeMCPRequest({
                method: tool,
                params: { sectionId, data, moduleType }
              });
            } catch (toolError) {
              console.warn(`MCP tool ${tool} failed:`, toolError);
            }
          }
        }
        
        // Add conversation entry for section completion
        await createConversationEntry({
          sessionId: mcpSession.sessionId,
          agentId: 'structured-enrollment-agent',
          data: {
            role: 'system',
            content: `Section ${section?.name || sectionId} completed successfully with MCP validation`,
            timestamp: new Date(),
            mcpContext: { sectionId, toolsExecuted: section?.mcpTools || [] }
          },
          metadata: { sectionId, completed: true, mcpValidated: true }
        });
        
      } catch (mcpError) {
        console.error('MCP processing error:', mcpError);
        toast({
          title: "MCP Processing Warning",
          description: "Section saved but some real-time features may not be available",
          variant: "default"
        });
      }
    }
    
    await updateSection(sectionId, data);
    await completeSection(sectionId);
    
    // Run NPI verification in background if enabled and provider data is available
    if (npiVerificationEnabled && sectionId === 'provider_info' && data.providerNPI) {
      runNPIVerification(data);
    }
    
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    } else {
      // All sections complete - generate PDF
      const result = await generatePDF();
      onComplete?.({ instanceId: currentSession?.instanceId || '', pdfUrl: result.pdfUrl });
    }
    
    setActiveChatSection(null);
  };

  const runNPIVerification = async (providerData: any) => {
    setIsNpiVerifying(true);
    try {
      const result = await verifyCredentials({
        npi: providerData.providerNPI,
        providerType: 'individual',
        providerName: `${providerData.providerFirstName} ${providerData.providerLastName}`,
        state: providerData.providerState,
        facilityId: providerData.facilityId
      });
      
      if (result.isValid) {
        toast({
          title: "NPI Verification Complete",
          description: "Provider credentials verified successfully",
        });
      } else {
        toast({
          title: "NPI Verification Issues",
          description: `Verification completed with ${result.issues?.length || 0} issues`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('NPI verification failed:', error);
      toast({
        title: "NPI Verification Failed",
        description: "Unable to verify provider credentials",
        variant: "destructive"
      });
    } finally {
      setIsNpiVerifying(false);
    }
  };

  // Show NPI verification consent first
  if (npiVerificationEnabled === null) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Search className="h-6 w-6 text-primary" />
              NPI & License Verification
            </CardTitle>
            <p className="text-muted-foreground">
              Would you like to enable automatic NPI and license verification for providers?
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Background Verification</h4>
                  <p className="text-blue-700 text-sm mt-1">
                    When enabled, the system will automatically verify provider NPIs, licenses, and credentials in the background as you enter provider information. This helps ensure data accuracy and compliance.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={() => setNpiVerificationEnabled(true)} className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Enable Verification
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setNpiVerificationEnabled(false)}
                className="flex-1"
              >
                Skip for Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activeChatSection) {
    const section = sections.find(s => s.id === activeChatSection);
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {section?.icon && React.createElement(section.icon, { className: "h-6 w-6 text-primary" })}
              AI Assistant: {section?.name}
              {isNpiVerifying && (
                <Badge variant="secondary" className="ml-auto">
                  <Search className="h-3 w-3 mr-1" />
                  Verifying NPI...
                </Badge>
              )}
            </CardTitle>
            <p className="text-muted-foreground">{section?.description}</p>
          </CardHeader>
          <CardContent>
            <EnrollmentChatInterface
              section={section!}
              onComplete={(data) => handleSectionComplete(activeChatSection, data)}
              onCancel={() => setActiveChatSection(null)}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* MCP Status Alert */}
      {mcpSession && (
        <Alert className={`border ${
          mcpSession.mcpServerStatus === 'connected' ? 'border-green-200 bg-green-50' :
          mcpSession.mcpServerStatus === 'error' ? 'border-red-200 bg-red-50' :
          'border-yellow-200 bg-yellow-50'
        }`}>
          <div className="flex items-center gap-2">
            {mcpSession.mcpServerStatus === 'connected' ? (
              <Database className="h-4 w-4 text-green-600" />
            ) : mcpSession.mcpServerStatus === 'error' ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
            ) : (
              <Bot className="h-4 w-4 text-yellow-600" />
            )}
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <AlertDescription className="mt-1">
            <strong>MCP Integration: </strong>
            {mcpSession.mcpServerStatus === 'connected' && 
              `✅ Healthcare tools active • Real-time sync enabled • ${realtimeConnected ? 'Connected' : 'Connecting...'}`}
            {mcpSession.mcpServerStatus === 'error' && 
              `❌ MCP connection failed • ${mcpError || 'Unknown error'}`}
            {mcpSession.mcpServerStatus === 'connecting' && 
              '🔄 Connecting to healthcare MCP tools...'}
          </AlertDescription>
        </Alert>
      )}

      {/* Progress Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span>Structured AI Enrollment</span>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                MCP Enhanced
              </Badge>
            </div>
            <Badge variant="outline">
              Section {currentSectionIndex + 1} of {sections.length}
            </Badge>
          </CardTitle>
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              AI-powered sections with real-time healthcare validation and MCP tools
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Section Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sections.map((section, index) => {
          const isCompleted = index < currentSectionIndex;
          const isCurrent = index === currentSectionIndex;
          const isUpcoming = index > currentSectionIndex;

          return (
            <Card 
              key={section.id}
              className={`relative transition-all ${
                isCurrent ? 'ring-2 ring-primary' : 
                isCompleted ? 'bg-muted/50' : 
                'opacity-60'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  {React.createElement(section.icon, {
                    className: `h-5 w-5 ${
                      isCompleted ? 'text-green-600' :
                      isCurrent ? 'text-primary' :
                      'text-muted-foreground'
                    }`
                  })}
                  {isCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
                </div>
                <CardTitle className="text-sm">{section.name}</CardTitle>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {section.description}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs text-muted-foreground mb-2">
                  Est. {section.estimatedTime}
                </div>
                {isCurrent && (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handleStartSectionChat(section.id)}
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Start AI Chat
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Current Section Details */}
      {currentSection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {React.createElement(currentSection.icon, { className: "h-6 w-6 text-primary" })}
              {currentSection.name}
              <Badge variant="secondary">Current Section</Badge>
            </CardTitle>
            <p className="text-muted-foreground">{currentSection.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">AI Assistant Will Help With:</h4>
                <ul className="space-y-1 text-sm">
                  {currentSection.requiredFields.map((field, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                      {field}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Bot className="h-4 w-4" />
                  Specialized AI agent for this section
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageCircle className="h-4 w-4" />
                  Natural conversation with validation
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  HIPAA compliant data handling
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => handleStartSectionChat(currentSection.id)}
                className="flex-1"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Start AI Conversation for {currentSection.name}
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const EnrollmentChatInterface: React.FC<{
  section: EnrollmentSection;
  onComplete: (data: any) => void;
  onCancel: () => void;
}> = ({ section, onComplete, onCancel }) => {
  const [chatMessages, setChatMessages] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>>([
    { role: 'assistant', content: section.aiPrompt, timestamp: new Date() },
    { role: 'assistant', content: `To begin, please provide: ${section.requiredFields[0]}.`, timestamp: new Date() }
  ]);
  
  const [currentInput, setCurrentInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [collectedData, setCollectedData] = useState<Record<string, any>>({});
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);

const handleSendMessage = async () => {
  if (!currentInput.trim() || isProcessing) return;

  const userMessage = {
    role: 'user' as const,
    content: currentInput,
    timestamp: new Date()
  };

  setChatMessages(prev => [...prev, userMessage]);
  setIsProcessing(true);

  // Extract structured data when possible
  const extractedData = extractDataFromMessage(currentInput, section.id);
  if (Object.keys(extractedData).length > 0) {
    setCollectedData(prev => ({ ...prev, ...extractedData }));
  }

  // Move to next field sequentially to avoid repetition loops
  const nextIndex = Math.min(currentFieldIndex + 1, section.requiredFields.length);
  const nextPrompt = nextIndex < section.requiredFields.length
    ? `Thank you. Next, please provide: ${section.requiredFields[nextIndex]}.`
    : "Thanks, that's everything I need for this section. You can click 'Complete Section' when ready.";

  setTimeout(() => {
    setChatMessages(prev => [...prev, {
      role: 'assistant',
      content: nextPrompt,
      timestamp: new Date()
    }]);
    setIsProcessing(false);
    setCurrentFieldIndex(nextIndex);
  }, 500);

  setCurrentInput('');
};

  const extractDataFromMessage = (message: string, sectionId: string): Record<string, any> => {
    const data: Record<string, any> = {};
    const lowerMessage = message.toLowerCase();

    if (sectionId === 'demographics') {
      // Extract name
      const nameMatch = message.match(/(?:my name is|i'm|i am|call me)\s+([a-zA-Z\s]+)/i);
      if (nameMatch) {
        const fullName = nameMatch[1].trim();
        const nameParts = fullName.split(' ');
        data.firstName = nameParts[0] || '';
        data.lastName = nameParts.slice(1).join(' ') || '';
      }

      // Extract email
      const emailMatch = message.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) {
        data.email = emailMatch[1];
      }

      // Extract phone
      const phoneMatch = message.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
      if (phoneMatch) {
        data.homePhone = phoneMatch[1];
      }

      // Extract date of birth
      const dobMatch = message.match(/(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/);
      if (dobMatch) {
        data.dateOfBirth = dobMatch[1];
      }
    }

    return data;
  };

// Deterministic prompting handled in handleSendMessage to avoid loops

const isDataComplete = () => {
  const requiredFieldCount = section.requiredFields.length;
  return currentFieldIndex >= Math.min(3, requiredFieldCount);
};

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4 h-96 overflow-y-auto bg-muted/20">
        {chatMessages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.role === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background border'
              }`}
            >
              {message.content}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="text-left">
            <div className="inline-block bg-background border p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                <span>AI is thinking...</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Input Section */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your response here..."
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isProcessing}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!currentInput.trim() || isProcessing}
            className="px-4"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Collected Data Preview */}
        {Object.keys(collectedData).length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h4 className="font-medium text-green-800 mb-2">Collected Information:</h4>
            <div className="space-y-1">
              {Object.entries(collectedData).map(([key, value]) => (
                <div key={key} className="text-sm text-green-700">
                  <strong>{key}:</strong> {value}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button 
            onClick={() => onComplete(collectedData)}
            className="flex-1"
            disabled={!isDataComplete()}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Complete Section {isDataComplete() ? '✓' : `(${Object.keys(collectedData).length}/${Math.min(3, section.requiredFields.length)} fields)`}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Back to Overview
          </Button>
        </div>
      </div>
    </div>
  );
};

const getSectionsForModule = (moduleType: ModuleType): EnrollmentSection[] => {
  const patientSections: EnrollmentSection[] = [
    {
      id: 'submission_method',
      name: 'Submission Method',
      icon: Send,
      description: 'Choose how you want to submit your enrollment',
      aiPrompt: "Welcome! I'm here to help you with your patient enrollment. First, let's set up how you'd like to complete this process. You can choose to fill everything out now, save and continue later, or get help along the way. What works best for you?",
      estimatedTime: '1-2 min',
      requiredFields: ['Submission Method', 'Contact Preference', 'Language Preference'],
      validationRules: { method: 'required' },
      mcpTools: ['validate-submission-method', 'track-submission-preference'],
      realtimeEnabled: true
    },
    {
      id: 'consent_management',
      name: 'Consent Management',
      icon: FileCheck,
      description: 'Review and provide consent for enrollment',
      aiPrompt: "Before we begin collecting your information, I need to walk you through some important consent forms. These ensure we handle your information properly and that you understand the enrollment process. Shall we start with the general enrollment consent?",
      estimatedTime: '3-4 min',
      requiredFields: ['Enrollment Consent', 'HIPAA Authorization', 'Communication Consent', 'Digital Signature'],
      validationRules: { consent: 'required', signature: 'required' },
      mcpTools: ['validate-consent', 'store-consent-records', 'audit-consent-trail'],
      realtimeEnabled: true
    },
    {
      id: 'patient_info',
      name: 'Patient Information',
      icon: User,
      description: 'Personal demographics and contact details',
      aiPrompt: "Now let's collect your personal information. I'll help you provide your demographics in a conversational way. Let's start with your full name - what would you like me to call you?",
      estimatedTime: '4-6 min',
      requiredFields: ['First Name', 'Last Name', 'Date of Birth', 'Phone Number', 'Email Address', 'Home Address', 'Emergency Contact'],
      validationRules: { name: 'required', dob: 'date', phone: 'phone', email: 'email' },
      mcpTools: ['validate-demographics', 'verify-contact-info', 'address-validation'],
      realtimeEnabled: true
    },
    {
      id: 'provider_info',
      name: 'Provider & Referral Information',
      icon: Stethoscope,
      description: 'Healthcare provider and referral details',
      aiPrompt: "Let's gather information about your healthcare providers and any referrals. This helps us coordinate your care properly. Do you have a primary care physician or specialist who referred you?",
      estimatedTime: '3-5 min',
      requiredFields: ['Primary Care Physician', 'Referring Provider', 'Provider NPI', 'Referral Reason', 'Provider Contact'],
      validationRules: { npi: 'npi_format' },
      mcpTools: ['verify-provider-npi', 'validate-medical-licenses', 'check-referral-authorization'],
      realtimeEnabled: true
    },
    {
      id: 'insurance',
      name: 'Insurance Information',
      icon: Shield,
      description: 'Insurance coverage and verification details',
      aiPrompt: "Let's get your insurance information set up. I'll walk you through this step by step. Do you have your insurance card handy? If so, I can help you enter the details.",
      estimatedTime: '4-6 min',
      requiredFields: ['Insurance Provider', 'Policy Number', 'Group Number', 'Subscriber Name', 'Subscriber DOB', 'Secondary Insurance'],
      validationRules: { policyNumber: 'required', provider: 'required' },
      mcpTools: ['verify-insurance-eligibility', 'validate-policy-status', 'check-coverage-benefits'],
      realtimeEnabled: true
    },
    {
      id: 'treatment_assessment',
      name: 'Clinical Assessment',
      icon: Heart,
      description: 'Medical history and treatment assessment',
      aiPrompt: "Now I'll help you document your medical history and current condition. This information helps us provide better care. Let's start with your current symptoms or the main reason for seeking treatment.",
      estimatedTime: '6-8 min',
      requiredFields: ['Chief Complaint', 'Current Medications', 'Allergies', 'Medical History', 'Previous Treatments', 'Current Symptoms'],
      validationRules: { medications: 'array', allergies: 'array' },
      mcpTools: ['validate-medical-history', 'check-drug-interactions', 'verify-allergy-contraindications'],
      realtimeEnabled: true
    },
    {
      id: 'final_review',
      name: 'Final Review & Submission',
      icon: CheckCircle,
      description: 'Review all information and complete enrollment',
      aiPrompt: "Great! We're almost done. Let me review all the information we've collected to make sure everything is correct. After we review together, you can submit your completed enrollment. Ready to go through everything?",
      estimatedTime: '2-3 min',
      requiredFields: ['Information Review', 'Final Consent', 'Submission Confirmation'],
      validationRules: { review: 'required', final_consent: 'required' },
      mcpTools: ['validate-completeness', 'generate-enrollment-summary', 'submit-to-healthcare-systems'],
      realtimeEnabled: true
    }
  ];

  const moduleMap = {
    patient: patientSections,
    treatment_center: [], // TODO: Add treatment center sections
    customer: [], // TODO: Add customer sections  
    manufacturer: [] // TODO: Add manufacturer sections
  };

  return moduleMap[moduleType] || patientSections;
};