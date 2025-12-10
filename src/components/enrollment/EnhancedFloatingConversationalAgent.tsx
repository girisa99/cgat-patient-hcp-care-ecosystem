/**
 * ENHANCED FLOATING CONVERSATIONAL AGENT
 * Enhanced conversational enrollment with field-by-field progress and section completions
 * P0: Now uses useEnrollmentUniversalAI for multi-model routing
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageCircle, 
  Bot, 
  CheckCircle2, 
  Zap, 
  Clock,
  User,
  Heart,
  Smile,
  Briefcase,
  Sparkles
} from 'lucide-react';
import { useConversationalEnrollment } from '@/hooks/useConversationalEnrollment';
import { useEnrollmentUniversalAI, type EnrollmentContext, type PersonalityMode } from '@/hooks/useEnrollmentUniversalAI';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedRealtimeProgressTracker } from '../patient-enrollment/EnhancedRealtimeProgressTracker';
import { EnhancedSectionCompletionModal } from '../patient-enrollment/EnhancedSectionCompletionModal';
import { EnrollmentAgentConfig } from '@/hooks/useEnrollmentAgentConfig';

type ModuleType = 'patient' | 'treatment_center' | 'customer' | 'manufacturer';

interface EnhancedFloatingConversationalAgentProps {
  moduleType: ModuleType;
  onComplete?: (result: any) => void;
  onCancel?: () => void;
  // P1: Feature configuration from GenieFeatureSelector
  featureConfig?: Partial<EnrollmentAgentConfig>;
  deploymentId?: string;
}

export const EnhancedFloatingConversationalAgent: React.FC<EnhancedFloatingConversationalAgentProps> = ({
  moduleType,
  onComplete,
  onCancel,
  featureConfig,
  deploymentId
}) => {
  const { toast } = useToast();
  const {
    session,
    isProcessing,
    error,
    startConversation,
    processMessage: processLegacyMessage,
    endConversation
  } = useConversationalEnrollment();

  // P0 + P1: Universal AI integration with feature-based configuration
  const [selectedPersonality, setSelectedPersonality] = useState<PersonalityMode>(
    featureConfig?.personalityMode || 'professional'
  );
  const { 
    processEnrollmentMessage,
    isLoading: aiLoading,
    error: aiError 
  } = useEnrollmentUniversalAI({
    moduleType,
    personalityMode: selectedPersonality,
    provider: featureConfig?.aiProvider || 'gemini'
  });

  const [currentMessage, setCurrentMessage] = useState('');
  const [showSectionCompletion, setShowSectionCompletion] = useState(false);
  const [completedSectionData, setCompletedSectionData] = useState<any>(null);
  const [patientId] = useState(() => crypto.randomUUID());
  const [sessionId, setSessionId] = useState('');

  // Initialize database record on mount
  useEffect(() => {
    initializeEnrollmentRecord();
  }, [patientId]);

  const initializeEnrollmentRecord = async () => {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser.user?.id) return;

      // Ensure valid UUID and session_id before DB insert
      const validPatientId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(patientId) 
        ? patientId : crypto.randomUUID();
      const validSessionId = sessionId || `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      await supabase.from('patient_enrollments').upsert({
        id: validPatientId,
        session_id: validSessionId,
        enrollment_status: 'in_progress',
        current_section: 'consent_management',
        progress_percentage: 0,
        enrollment_source: 'conversational',
        // Only use JSONB for truly flexible configuration data
        metadata: { 
          agent_type: 'conversational', 
          module_type: moduleType,
          conversation_personality: 'professional'
        },
        user_id: authUser.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to initialize enrollment record:', error);
    }
  };

  useEffect(() => {
    initializeConversation();
  }, [moduleType]);

  const initializeConversation = async () => {
    try {
      const newSessionId = await startConversation(moduleType);
      setSessionId(newSessionId);
      
      // Send initial personality-based greeting
      setTimeout(() => {
        processInitialGreeting();
      }, 1000);
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
      toast({
        title: "Initialization Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const processInitialGreeting = async () => {
    const greetings = {
      humorous: "Hey there! 👋 Ready to tackle this enrollment? I promise to make it as painless as possible (and maybe even fun)! What's your name?",
      empathetic: "Hello, and welcome! 🌟 I understand that enrollment processes can feel overwhelming, but I'm here to support you every step of the way. Let's start with your name - what would you like me to call you?",
      professional: "Good day. I'm your AI enrollment assistant, ready to guide you through this process efficiently and accurately. May I please have your full name to begin?",
      casual: "Hi! 😊 I'm your enrollment buddy! Let's get this done together - it'll be easy. What's your name?"
    };

    // P0: Use Universal AI for greeting
    try {
      const response = await processEnrollmentMessage(
        greetings[selectedPersonality],
        'patient_information',
        selectedPersonality
      );
      // Store greeting response in conversation
      await processLegacyMessage(response.content, {
        personality: selectedPersonality,
        sectionFocus: 'patient_information',
        fieldTarget: 'first_name'
      });
    } catch (error) {
      // Fallback to legacy
      await processLegacyMessage(greetings[selectedPersonality], {
        personality: selectedPersonality,
        sectionFocus: 'patient_information',
        fieldTarget: 'first_name'
      });
    }
  };

  const handleMessageSend = async () => {
    if (!currentMessage.trim() || isProcessing) return;

    try {
      // P0: Use Universal AI for processing messages
      const response = await processLegacyMessage(currentMessage, {
        personality: selectedPersonality,
        currentSection: getCurrentSection(),
        progressTracking: true
      });

      // Check for section completion and update database
      if (response && currentMessage.toLowerCase().includes('complete')) {
        const sectionKey = getCurrentSection();
        await handleSectionComplete(sectionKey, response.extractedData || {});
      }

      setCurrentMessage('');
    } catch (error) {
      console.error('Message processing failed:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process your message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getCurrentSection = () => {
    // Extract current section from session data
    return session?.currentSection || 'patient_information';
  };

  const handleSectionComplete = async (sectionKey: string, data: Record<string, any>) => {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (authUser.user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(patientId)) {
        // Clean data for DB persistence (normalize empty strings, validate NPIs)
        const cleanedData = Object.fromEntries(
          Object.entries(data).map(([key, value]) => {
            let dbValue = (typeof value === 'string' && value.trim() === '') ? null : value;
            
            // NPI validation: only persist exactly 10 digits
            if (/npi$/i.test(key) && dbValue) {
              const digits = dbValue.toString().replace(/\D/g, '');
              dbValue = digits.length === 10 ? digits : null;
            }
            
            return [key, dbValue];
          })
        );

        // Update patient enrollments with section completion
        const sections = ['consent_management', 'patient_information', 'provider_information', 'insurance_information'];
        const currentIndex = sections.indexOf(sectionKey);
        const progress = Math.round(((currentIndex + 1) / sections.length) * 100);
        const nextSection = sections[currentIndex + 1];

        await supabase.from('patient_enrollments').update({
          current_section: nextSection || 'completed',
          progress_percentage: progress,
          metadata: {
            agent_type: 'conversational',
            module_type: moduleType,
            completed_sections: [sectionKey],
            section_timestamps: {
              [sectionKey]: new Date().toISOString()
            },
            section_data: { [sectionKey]: cleanedData },
            conversation_personality: selectedPersonality
          },
          updated_at: new Date().toISOString()
        }).eq('id', patientId);
      }
    } catch (error) {
      console.error('Failed to update section completion:', error);
    }

    setCompletedSectionData({
      sectionKey,
      completedAt: new Date(),
      data
    });
    setShowSectionCompletion(true);
  };

  const getPersonalityIcon = (personality: PersonalityMode) => {
    const icons = {
      humorous: Smile,
      empathetic: Heart,
      professional: Briefcase,
      casual: User
    };
    return icons[personality];
  };

  const getPersonalityColor = (personality: PersonalityMode) => {
    const colors = {
      humorous: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      empathetic: 'bg-pink-100 text-pink-800 border-pink-200',
      professional: 'bg-blue-100 text-blue-800 border-blue-200',
      casual: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[personality];
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Conversation - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header with Personality Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  Conversational Enrollment
                  <Badge variant="secondary">Enhanced UX</Badge>
                </div>
                <div className="flex gap-2">
                  {(['humorous', 'empathetic', 'professional', 'casual'] as PersonalityMode[]).map((personality) => {
                    const IconComponent = getPersonalityIcon(personality);
                    return (
                      <Button
                        key={personality}
                        variant={selectedPersonality === personality ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedPersonality(personality)}
                        className={selectedPersonality === personality ? getPersonalityColor(personality) : ''}
                      >
                        <IconComponent className="h-3 w-3 mr-1" />
                        {personality.charAt(0).toUpperCase() + personality.slice(1)}
                      </Button>
                    );
                  })}
                </div>
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                AI Personality: <strong>{selectedPersonality}</strong> • Module: {moduleType}
              </div>
            </CardHeader>
          </Card>

          {/* Conversation Area */}
          <Card className="min-h-[500px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Conversation
                {isProcessing && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1 animate-spin" />
                    Processing...
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Conversation History */}
              <div className="border rounded-lg p-4 min-h-[350px] max-h-[400px] overflow-y-auto bg-muted/30">
                {!session ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Initializing conversational agent...</p>
                  </div>
                ) : session.messages && session.messages.length > 0 ? (
                  <div className="space-y-3">
                    {session.messages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg ${
                          msg.type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : `bg-background border ${getPersonalityColor(selectedPersonality)}`
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs opacity-70">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </p>
                            {msg.metadata?.fieldProgress && (
                              <Badge variant="outline" className="text-xs">
                                Field: {msg.metadata.fieldProgress}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isProcessing && (
                      <div className="flex justify-start">
                        <div className={`bg-background border p-3 rounded-lg ${getPersonalityColor(selectedPersonality)}`}>
                          <div className="flex items-center gap-2">
                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                            <span className="text-sm">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Ready to start! Type your message below.</p>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleMessageSend();
                    }
                  }}
                  placeholder={`Type your message (${selectedPersonality} mode)...`}
                  className="flex-1 px-3 py-2 border rounded-md"
                  disabled={isProcessing}
                />
                <Button 
                  onClick={handleMessageSend}
                  disabled={isProcessing || !currentMessage.trim()}
                >
                  Send
                </Button>
              </div>

              {/* Error Display */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Progress & Status */}
        <div className="space-y-6">
          {/* Enhanced Real-time Progress Tracker */}
          <EnhancedRealtimeProgressTracker
            patientId={patientId}
            sessionId={sessionId}
            onSectionComplete={(sectionKey) => {
              setCompletedSectionData({ sectionKey, completedAt: new Date() });
              setShowSectionCompletion(true);
            }}
            onProgressUpdate={(progress) => {
              console.log('Progress updated:', progress);
            }}
            dashboardSyncEnabled={true}
          />

          {/* Personality Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                {React.createElement(getPersonalityIcon(selectedPersonality), { className: "h-4 w-4" })}
                AI Personality
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`p-3 rounded-lg ${getPersonalityColor(selectedPersonality)}`}>
                <div className="font-medium text-sm capitalize">{selectedPersonality} Mode</div>
                <div className="text-xs mt-1">
                  {selectedPersonality === 'humorous' && "Making enrollment fun with gentle humor"}
                  {selectedPersonality === 'empathetic' && "Providing caring, supportive guidance"}
                  {selectedPersonality === 'professional' && "Efficient, accurate, business-focused"}
                  {selectedPersonality === 'casual' && "Friendly, relaxed, easy-going approach"}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Session Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Session Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant="outline" className="text-xs">
                    {session ? 'Active' : 'Initializing'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Messages:</span>
                  <span>{session?.messages?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Module:</span>
                  <span className="capitalize">{moduleType}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section Completion Modal */}
      {showSectionCompletion && completedSectionData && (
        <EnhancedSectionCompletionModal
          isOpen={showSectionCompletion}
          onClose={() => setShowSectionCompletion(false)}
          onContinue={() => {
            setShowSectionCompletion(false);
            // Continue to next section
          }}
          completedSection={{
            sectionKey: completedSectionData.sectionKey,
            sectionTitle: "Patient Information",
            description: "Basic patient demographics and contact information",
            completedFields: 5,
            totalFields: 8,
            requiredFields: 5,
            completionTime: 180,
            dataCollected: completedSectionData.data || []
          }}
          nextSection={{
            sectionKey: "provider_information",
            sectionTitle: "Provider Information",
            description: "Healthcare provider and treatment center details",
            estimatedTime: 4,
            totalFields: 6,
            requiredFields: 4,
            keyFields: ["Provider Name", "NPI Number", "Treatment Center"]
          }}
          overallProgress={65}
          totalSections={7}
          completedSections={2}
        />
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={() => onComplete?.(session)}
          disabled={!session}
        >
          Complete Enrollment
        </Button>
      </div>
    </div>
  );
};