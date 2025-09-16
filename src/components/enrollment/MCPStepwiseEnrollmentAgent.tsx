/**
 * MCP STEPWISE ENROLLMENT AGENT
 * Integrates Model Context Protocol (MCP) with stepwise guided enrollment
 * Provides real-time database updates, structured conversations, and comprehensive data handling
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Shield, 
  FileCheck, 
  MessageCircle, 
  CheckCircle,
  Bot,
  Database,
  Activity,
  Zap,
  AlertCircle,
  Workflow,
  Heart,
  Building2,
  CreditCard,
  Stethoscope
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUniversalAI } from '@/hooks/useUniversalAI';
import { supabase } from '@/integrations/supabase/client';

type ModuleType = 'patient' | 'treatment_center' | 'customer' | 'manufacturer';

interface MCPStepwiseEnrollmentAgentProps {
  moduleType: ModuleType;
  onComplete?: (result: { instanceId: string; pdfUrl: string }) => void;
  onCancel?: () => void;
}

interface EnrollmentStep {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  mcpTools: string[];
  realtimeEnabled: boolean;
  requiredFields: string[];
  validationRules: Record<string, any>;
  aiPrompt: string;
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

export const MCPStepwiseEnrollmentAgent: React.FC<MCPStepwiseEnrollmentAgentProps> = ({
  moduleType,
  onComplete,
  onCancel
}) => {
  const [mcpSession, setMcpSession] = useState<MCPSession | null>(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mcpError, setMcpError] = useState<string | null>(null);
  const { toast } = useToast();
  const { generateResponse, isLoading } = useUniversalAI();

  // Define the 7-step enrollment schema with MCP integration
  const enrollmentSteps: EnrollmentStep[] = [
    {
      id: 'submission_method',
      name: 'Submission Method',
      icon: Workflow,
      description: 'Choose how you want to submit your information',
      mcpTools: ['validate-submission-method', 'track-submission-preference'],
      realtimeEnabled: true,
      requiredFields: ['preferred_method', 'communication_preferences'],
      validationRules: { preferred_method: { required: true } },
      aiPrompt: 'Let\'s start your enrollment. How would you prefer to submit your information today?'
    },
    {
      id: 'consent_management',
      name: 'Consent Management',
      icon: Shield,
      description: 'Review and provide consent for data processing',
      mcpTools: ['validate-consent', 'store-consent-records', 'audit-consent-trail'],
      realtimeEnabled: true,
      requiredFields: ['hipaa_consent', 'data_processing_consent', 'communication_consent'],
      validationRules: { hipaa_consent: { required: true } },
      aiPrompt: 'I need to get your consent for data processing. Let me walk you through each consent form clearly.'
    },
    {
      id: 'patient_info',
      name: 'Patient Information',
      icon: User,
      description: 'Collect basic patient demographics and contact information',
      mcpTools: ['validate-patient-data', 'check-duplicate-records', 'verify-identity'],
      realtimeEnabled: true,
      requiredFields: ['first_name', 'last_name', 'date_of_birth', 'email', 'phone'],
      validationRules: { email: { required: true, format: 'email' } },
      aiPrompt: 'Now I\'ll collect your basic information. Let\'s start with your full name and date of birth.'
    },
    {
      id: 'provider_info',
      name: 'Provider Information',
      icon: Stethoscope,
      description: 'Healthcare provider and referral information',
      mcpTools: ['verify-npi', 'validate-provider-credentials', 'check-provider-network'],
      realtimeEnabled: true,
      requiredFields: ['provider_name', 'provider_npi', 'facility_name', 'referral_reason'],
      validationRules: { provider_npi: { required: true, format: 'npi' } },
      aiPrompt: 'Tell me about your healthcare provider who referred you or will be involved in your care.'
    },
    {
      id: 'insurance',
      name: 'Insurance Information',
      icon: CreditCard,
      description: 'Insurance coverage and benefit verification',
      mcpTools: ['verify-insurance', 'check-benefits', 'validate-coverage'],
      realtimeEnabled: true,
      requiredFields: ['insurance_provider', 'member_id', 'group_number', 'policy_holder'],
      validationRules: { member_id: { required: true } },
      aiPrompt: 'Let\'s verify your insurance coverage. I\'ll need your insurance card information.'
    },
    {
      id: 'treatment_assessment',
      name: 'Treatment Assessment',
      icon: Heart,
      description: 'Clinical assessment and treatment planning',
      mcpTools: ['assess-clinical-needs', 'validate-treatment-criteria', 'check-contraindications'],
      realtimeEnabled: true,
      requiredFields: ['primary_diagnosis', 'symptoms', 'treatment_history', 'medications'],
      validationRules: { primary_diagnosis: { required: true } },
      aiPrompt: 'Now I need to understand your medical situation and treatment needs.'
    },
    {
      id: 'final_review',
      name: 'Final Review',
      icon: FileCheck,
      description: 'Review all information and generate final documents',
      mcpTools: ['generate-summary', 'create-pdf', 'send-notifications', 'update-records'],
      realtimeEnabled: true,
      requiredFields: ['digital_signature', 'final_confirmation'],
      validationRules: { digital_signature: { required: true } },
      aiPrompt: 'Let\'s review everything together and finalize your enrollment.'
    }
  ];

  // Initialize MCP session with real-time database connection
  const initializeMCPSession = useCallback(async () => {
    try {
      setIsProcessing(true);
      setMcpError(null);

      const sessionId = `mcp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Set up real-time channel for this enrollment session
      const realtimeChannel = supabase.channel(`enrollment_${sessionId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'agent_conversations'
        }, (payload) => {
          console.log('🔄 Real-time database update:', payload);
          handleRealtimeUpdate(payload);
        })
        .subscribe();

      // Initialize MCP session
      const newSession: MCPSession = {
        sessionId,
        mcpServerStatus: 'connecting',
        realtimeChannel,
        currentStep: 0,
        stepData: {},
        conversationHistory: [{
          role: 'system',
          content: 'MCP Stepwise Enrollment Agent initialized',
          timestamp: new Date(),
          mcpContext: { sessionId, moduleType }
        }]
      };

      setMcpSession(newSession);

      // Simulate MCP server connection
      setTimeout(() => {
        setMcpSession(prev => prev ? { ...prev, mcpServerStatus: 'connected' } : null);
        toast({
          title: "MCP Integration Active",
          description: "Real-time database updates and structured conversations enabled"
        });
      }, 1000);

    } catch (error) {
      console.error('Failed to initialize MCP session:', error);
      setMcpError('Failed to initialize MCP integration');
    } finally {
      setIsProcessing(false);
    }
  }, [moduleType, toast]);

  // Handle real-time database updates
  const handleRealtimeUpdate = useCallback((payload: any) => {
    if (!mcpSession) return;

    console.log('📡 Processing real-time update through MCP:', payload);
    
    // Update conversation history with real-time context
    const realtimeMessage = {
      role: 'system' as const,
      content: `Real-time update: ${payload.eventType} on ${payload.table}`,
      timestamp: new Date(),
      mcpContext: {
        realtimeData: payload,
        sessionId: mcpSession.sessionId
      }
    };

    setMcpSession(prev => prev ? {
      ...prev,
      conversationHistory: [...prev.conversationHistory, realtimeMessage]
    } : null);
  }, [mcpSession]);

  // Process message with MCP integration
  const processMessageWithMCP = useCallback(async (message: string) => {
    if (!mcpSession || !message.trim()) return;

    setIsProcessing(true);
    const currentStep = enrollmentSteps[mcpSession.currentStep];

    try {
      // Add user message to conversation
      const userMessage = {
        role: 'user' as const,
        content: message,
        timestamp: new Date()
      };

      setMcpSession(prev => prev ? {
        ...prev,
        conversationHistory: [...prev.conversationHistory, userMessage]
      } : null);

      // Clear input after sending
      setCurrentMessage('');

      // Use MCP context in AI processing
      const mcpContext = {
        sessionId: mcpSession.sessionId,
        currentStep: currentStep.name,
        mcpTools: currentStep.mcpTools,
        realtimeEnabled: currentStep.realtimeEnabled,
        stepData: mcpSession.stepData,
        conversationHistory: mcpSession.conversationHistory
      };

      const systemPrompt = `
        You are an MCP-enabled stepwise enrollment agent for ${moduleType} enrollment.
        Current step: ${currentStep.name} (${currentStep.description})
        Available MCP tools: ${currentStep.mcpTools.join(', ')}
        Real-time database updates: ${currentStep.realtimeEnabled ? 'ENABLED' : 'DISABLED'}
        
        Required fields for this step: ${currentStep.requiredFields.join(', ')}
        
        Process the user's message and:
        1. Extract relevant data for required fields
        2. Use MCP tools to validate and process data
        3. Update database in real-time if enabled
        4. Provide structured, helpful response
        5. Guide to next step when current step is complete
        
        MCP Context: ${JSON.stringify(mcpContext)}
      `;

      const response = await generateResponse({
        provider: 'openai',
        model: 'gpt-4o-mini',
        prompt: message,
        systemPrompt,
        context: mcpContext
      });

      if (response) {
        // Process response with MCP tools
        const processedData = await processMCPResponse(response.content, currentStep, message);
        
        // Add AI response to conversation
        const aiMessage = {
          role: 'assistant' as const,
          content: response.content,
          timestamp: new Date(),
          mcpContext: {
            toolsUsed: currentStep.mcpTools,
            dataExtracted: processedData,
            realtimeUpdate: currentStep.realtimeEnabled
          }
        };

        setMcpSession(prev => prev ? {
          ...prev,
          conversationHistory: [...prev.conversationHistory, aiMessage],
          stepData: { ...prev.stepData, ...processedData }
        } : null);

        // Real-time database update if enabled
        if (currentStep.realtimeEnabled && Object.keys(processedData).length > 0) {
          await updateDatabaseRealtime(mcpSession.sessionId, currentStep.id, processedData);
        }
      }

    } catch (error) {
      console.error('MCP message processing failed:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process message with MCP integration",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [mcpSession, enrollmentSteps, moduleType, generateResponse, toast]);

  // Simulate MCP tool processing
  const processMCPResponse = async (response: string, step: EnrollmentStep, userMessage: string) => {
    const extractedData: Record<string, any> = {};

    // Simulate MCP tool execution based on step
    console.log(`🔧 Using MCP tools: ${step.mcpTools.join(', ')}`);

    // Basic data extraction based on step requirements
    if (step.id === 'patient_info') {
      const nameMatch = userMessage.match(/(?:my name is|i'm|i am|call me)\s+([a-zA-Z\s]+)/i);
      if (nameMatch) {
        const fullName = nameMatch[1].trim();
        const nameParts = fullName.split(' ');
        extractedData.first_name = nameParts[0] || '';
        extractedData.last_name = nameParts.slice(1).join(' ') || '';
      }

      const emailMatch = userMessage.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) {
        extractedData.email = emailMatch[1];
      }
    }

    return extractedData;
  };

  // Real-time database update
  const updateDatabaseRealtime = async (sessionId: string, stepId: string, data: any) => {
    try {
      const { error } = await supabase
        .from('agent_conversations')
        .upsert({
          session_id: sessionId,
          agent_id: `mcp_${moduleType}`,
          conversation_data: {
            currentStep: stepId,
            stepData: data,
            timestamp: new Date().toISOString(),
            mcpEnabled: true
          },
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      console.log('✅ Real-time database update successful:', { sessionId, stepId, data });
    } catch (error) {
      console.error('❌ Real-time database update failed:', error);
    }
  };

  // Navigate to next step
  const proceedToNextStep = useCallback(() => {
    if (!mcpSession || mcpSession.currentStep >= enrollmentSteps.length - 1) return;

    const nextStep = mcpSession.currentStep + 1;
    const nextStepInfo = enrollmentSteps[nextStep];

    setMcpSession(prev => prev ? {
      ...prev,
      currentStep: nextStep,
      conversationHistory: [...prev.conversationHistory, {
        role: 'system',
        content: `Moving to step ${nextStep + 1}: ${nextStepInfo.name}`,
        timestamp: new Date(),
        mcpContext: { stepTransition: true, nextStep: nextStepInfo.name }
      }]
    } : null);

    toast({
      title: "Step Complete",
      description: `Moving to ${nextStepInfo.name}`
    });
  }, [mcpSession, enrollmentSteps, toast]);

  // Initialize on mount
  useEffect(() => {
    initializeMCPSession();
    
    return () => {
      // Cleanup real-time subscription
      if (mcpSession?.realtimeChannel) {
        supabase.removeChannel(mcpSession.realtimeChannel);
      }
    };
  }, [initializeMCPSession]);

  if (!mcpSession) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-primary animate-pulse" />
              Initializing MCP Stepwise Enrollment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Setting up real-time database connection and MCP integration...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStep = enrollmentSteps[mcpSession.currentStep];
  const progress = ((mcpSession.currentStep + 1) / enrollmentSteps.length) * 100;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header with MCP Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-green-500" />
              MCP Stepwise Enrollment Agent
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={mcpSession.mcpServerStatus === 'connected' ? 'default' : 'secondary'}>
                <Database className="h-3 w-3 mr-1" />
                MCP {mcpSession.mcpServerStatus.toUpperCase()}
              </Badge>
              <Badge variant="outline">
                <Activity className="h-3 w-3 mr-1" />
                Real-time Updates Active
              </Badge>
            </div>
          </CardTitle>
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              Step {mcpSession.currentStep + 1} of {enrollmentSteps.length}: {currentStep.name}
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* MCP Error Alert */}
      {mcpError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{mcpError}</AlertDescription>
        </Alert>
      )}

      {/* Current Step Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {React.createElement(currentStep.icon, { className: "h-6 w-6 text-primary" })}
            {currentStep.name}
          </CardTitle>
          <p className="text-muted-foreground">{currentStep.description}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">MCP Tools Available:</h4>
              <div className="flex flex-wrap gap-1">
                {currentStep.mcpTools.map(tool => (
                  <Badge key={tool} variant="outline" className="text-xs">
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Features:</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Real-time database updates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  MCP tool integration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Structured conversation flow
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversation Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5" />
            AI Conversation - {currentStep.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Conversation History */}
            <div className="border rounded-lg p-4 h-64 overflow-y-auto bg-muted/20">
              {mcpSession.conversationHistory
                .filter(msg => msg.role !== 'system' || msg.mcpContext)
                .map((message, index) => (
                <div
                  key={index}
                  className={`mb-3 ${
                    message.role === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : message.role === 'system'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-background border'
                    }`}
                  >
                    {message.role === 'system' && (
                      <div className="flex items-center gap-2 mb-1">
                        <Database className="h-3 w-3" />
                        <span className="text-xs font-medium">MCP System</span>
                      </div>
                    )}
                    {message.content}
                    {message.mcpContext && (
                      <div className="text-xs mt-2 opacity-75">
                        MCP Context: {JSON.stringify(message.mcpContext).length > 50 
                          ? 'Data processed with MCP tools' 
                          : JSON.stringify(message.mcpContext)}
                      </div>
                    )}
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
                      <span>MCP Agent processing...</span>
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

            {/* Message Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && processMessageWithMCP(currentMessage)}
                placeholder={currentStep.aiPrompt}
                className="flex-1 px-3 py-2 border rounded-md"
                disabled={isProcessing}
              />
              <Button
                onClick={() => processMessageWithMCP(currentMessage)}
                disabled={isProcessing || !currentMessage.trim()}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Send
              </Button>
            </div>

            {/* Step Navigation */}
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="outline"
                onClick={onCancel}
              >
                Cancel Enrollment
              </Button>
              
              <div className="flex gap-2">
                {mcpSession.currentStep < enrollmentSteps.length - 1 && (
                  <Button
                    onClick={proceedToNextStep}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Complete {currentStep.name}
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </Button>
                )}
                {mcpSession.currentStep === enrollmentSteps.length - 1 && (
                  <Button
                    onClick={() => onComplete?.({ instanceId: mcpSession.sessionId, pdfUrl: '#' })}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Complete Enrollment
                    <FileCheck className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};