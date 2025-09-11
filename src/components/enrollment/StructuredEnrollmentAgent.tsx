/**
 * STRUCTURED ENROLLMENT AGENT
 * Multi-agent system for section-specific patient enrollment
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Heart, 
  Shield, 
  FileCheck, 
  MessageCircle, 
  CheckCircle,
  ArrowRight,
  Bot
} from 'lucide-react';
import { useEnrollmentAgent } from '@/hooks/useEnrollmentAgent';

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

  useEffect(() => {
    if (!currentSession) {
      startEnrollment(moduleType);
    }
  }, [moduleType, currentSession, startEnrollment]);

  const handleStartSectionChat = (sectionId: string) => {
    setActiveChatSection(sectionId);
  };

  const handleSectionComplete = async (sectionId: string, data: any) => {
    setSectionData(prev => ({ ...prev, [sectionId]: data }));
    await updateSection(sectionId, data);
    await completeSection(sectionId);
    
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    } else {
      // All sections complete - generate PDF
      const result = await generatePDF();
      onComplete?.({ instanceId: currentSession?.instanceId || '', pdfUrl: result.pdfUrl });
    }
    
    setActiveChatSection(null);
  };

  if (activeChatSection) {
    const section = sections.find(s => s.id === activeChatSection);
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {section?.icon && React.createElement(section.icon, { className: "h-6 w-6 text-primary" })}
              AI Assistant: {section?.name}
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
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Patient Enrollment - Structured AI Approach</span>
            <Badge variant="outline">
              Section {currentSectionIndex + 1} of {sections.length}
            </Badge>
          </CardTitle>
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              Complete each section with dedicated AI assistance
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
    {
      role: 'assistant',
      content: section.aiPrompt,
      timestamp: new Date()
    }
  ]);

  // Mock chat interface - would integrate with real AI
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
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <Button 
          onClick={() => onComplete({ sampleData: 'completed' })}
          className="flex-1"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Complete Section
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Back to Overview
        </Button>
      </div>
    </div>
  );
};

const getSectionsForModule = (moduleType: ModuleType): EnrollmentSection[] => {
  const patientSections: EnrollmentSection[] = [
    {
      id: 'demographics',
      name: 'Demographics',
      icon: User,
      description: 'Basic personal information and contact details',
      aiPrompt: "Hi! I'm your AI assistant for collecting your personal information. I'll help you provide your demographics in a conversational way. Let's start with your full name - what would you like me to call you?",
      estimatedTime: '3-5 min',
      requiredFields: ['Full Name', 'Date of Birth', 'Address', 'Phone', 'Email', 'Emergency Contact'],
      validationRules: { name: 'required', dob: 'date', phone: 'phone', email: 'email' }
    },
    {
      id: 'medical-history',
      name: 'Medical History',
      icon: Heart,
      description: 'Current medications, allergies, and medical conditions',
      aiPrompt: "Now I'll help you document your medical history. This information helps us provide better care. Let's start with any current medications you're taking - you can tell me about them one by one or all at once, whatever feels comfortable.",
      estimatedTime: '5-8 min',
      requiredFields: ['Current Medications', 'Allergies', 'Past Surgeries', 'Chronic Conditions', 'Family History'],
      validationRules: { medications: 'array', allergies: 'array' }
    },
    {
      id: 'insurance',
      name: 'Insurance Information', 
      icon: Shield,
      description: 'Insurance details and coverage verification',
      aiPrompt: "Let's get your insurance information set up. I'll walk you through this step by step. First, do you have your insurance card handy? If so, I can help you enter the details, or you can tell me what information you have available.",
      estimatedTime: '3-4 min',
      requiredFields: ['Insurance Provider', 'Policy Number', 'Group Number', 'Subscriber Information'],
      validationRules: { policyNumber: 'required', provider: 'required' }
    },
    {
      id: 'consent',
      name: 'Consent & Agreements',
      icon: FileCheck,
      description: 'Legal agreements and consent forms',
      aiPrompt: "Finally, I'll help you understand and complete the necessary consent forms and agreements. I'll explain each one clearly and answer any questions you have. Shall we start with the treatment consent form?",
      estimatedTime: '2-3 min',
      requiredFields: ['Treatment Consent', 'Privacy Notice', 'Financial Responsibility', 'Digital Signature'],
      validationRules: { signature: 'required', consents: 'required' }
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