import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MessageSquare, 
  FileText, 
  User, 
  Download, 
  Eye, 
  Settings,
  Brain,
  Database,
  Mic,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { ConversationManager } from '@/components/conversation/ConversationManager';
import { PatientEnrollmentForm } from './PatientEnrollmentForm';
import { UniversalVoiceInterface } from '@/components/voice/UniversalVoiceInterface';
import { EnrollmentJourneySteps } from './EnrollmentJourneySteps';
import { toast } from 'sonner';

interface EnhancedEnrollmentInterfaceProps {
  onSubmit?: (data: any) => void;
  isInModal?: boolean;
  showSectionSummary?: boolean;
}

export const EnhancedEnrollmentInterface: React.FC<EnhancedEnrollmentInterfaceProps> = ({
  onSubmit,
  isInModal = false,
  showSectionSummary = true
}) => {
  const [activeTab, setActiveTab] = useState<'conversation' | 'form'>('conversation');
  const [enrollmentData, setEnrollmentData] = useState<any>({});
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [voiceData, setVoiceData] = useState<any>({});
  const [currentChannel, setCurrentChannel] = useState<'online' | 'pdf' | 'fax' | 'voice'>('online');
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [sectionsData, setSectionsData] = useState<Record<string, any>>({});

  const enrollmentSteps = [
    { title: 'Consent & Agreement', section: 'consent' },
    { title: 'Patient Information', section: 'patient' },
    { title: 'Provider & Treatment', section: 'provider' },
    { title: 'NPI & Credentialing', section: 'npi' },
    { title: 'Insurance Details', section: 'insurance' },
    { title: 'Clinical & Treatment', section: 'clinical' },
    { title: 'Review & Submit', section: 'submit' }
  ];

  const handleDataCapture = (capturedData: any) => {
    // Determine which section this data belongs to
    const currentSection = enrollmentSteps[currentStep]?.section || 'general';
    
    setSectionsData(prev => ({
      ...prev,
      [currentSection]: {
        ...prev[currentSection],
        ...capturedData
      }
    }));
    
    setEnrollmentData(prev => ({
      ...prev,
      ...capturedData
    }));
    
    // Check if current section is complete and advance
    if (Object.keys(capturedData).length > 0) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      
      // Auto-advance to next step if current section has sufficient data
      if (currentStep < enrollmentSteps.length - 1) {
        setTimeout(() => {
          setCurrentStep(prev => prev + 1);
          toast.success(`${enrollmentSteps[currentStep].title} completed!`, {
            description: `Moving to ${enrollmentSteps[currentStep + 1]?.title}`
          });
        }, 1500);
      }
    }
    
    toast.success('Information captured from conversation', {
      description: 'Data has been automatically filled in the enrollment form'
    });
  };

  const handleVoiceDataCapture = (capturedData: any) => {
    setVoiceData(prev => ({
      ...prev,
      ...capturedData
    }));
    
    setEnrollmentData(prev => ({
      ...prev,
      ...capturedData
    }));
    
    toast.success('Voice data captured', {
      description: 'Voice input has been processed and added to the form'
    });
  };

  const handleFormSubmit = (formData: any) => {
    const combinedData = {
      ...enrollmentData,
      ...formData,
      ...voiceData,
      source: 'enhanced_enrollment',
      conversation_history: conversationHistory,
      voice_data: voiceData,
      channel: currentChannel,
      timestamp: new Date().toISOString()
    };

    if (onSubmit) {
      onSubmit(combinedData);
    }

    toast.success('Enrollment completed successfully!');
  };

  const downloadEnrollmentPackage = () => {
    const packageData = {
      enrollment_data: enrollmentData,
      conversation_history: conversationHistory,
      voice_data: voiceData,
      form_data: enrollmentData,
      channel: currentChannel,
      metadata: {
        completion_method: 'multi_channel_assisted',
        completion_date: new Date().toISOString(),
        data_sources: ['conversation', 'voice', 'form'],
        audit_trail: true,
        channels_used: [currentChannel]
      }
    };

    const blob = new Blob([JSON.stringify(packageData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enrollment_package_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Enrollment package downloaded');
  };

  return (
    <div className={`w-full ${isInModal ? 'p-2 sm:p-4' : 'max-w-7xl mx-auto'} space-y-2 sm:space-y-4`}>
      {/* Header - Simplified for modal */}
      {!isInModal && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Enhanced Patient Enrollment
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Brain className="h-3 w-3" />
                  AI-Powered
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  Data Captured
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Audit Ready
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-medium">Natural Conversation</h3>
                <p className="text-sm text-muted-foreground">
                  Speak naturally about your needs and let AI extract the structured data
                </p>
              </div>
              <div className="text-center">
                <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-medium">Auto-Fill Forms</h3>
                <p className="text-sm text-muted-foreground">
                  Information from conversations automatically populates enrollment forms
                </p>
              </div>
              <div className="text-center">
                <Download className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-medium">Audit Trail</h3>
                <p className="text-sm text-muted-foreground">
                  Complete conversation history stored for compliance and verification
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      

      {/* Main Interface */}
      {isInModal ? (
        <>
          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 mb-2 sm:mb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={downloadEnrollmentPackage}
              className="w-full sm:w-auto"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Export</span>
            </Button>
            <Button 
              size="sm"
              onClick={() => handleFormSubmit(enrollmentData)}
              disabled={Object.keys(enrollmentData).length === 0}
              className="w-full sm:w-auto"
            >
              <span className="text-xs sm:text-sm">Complete Enrollment</span>
            </Button>
          </div>

          {/* Progress Tracker */}
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  Enrollment Progress
                </CardTitle>
                <Badge variant="outline">{completedSteps.length} of {enrollmentSteps.length} completed</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={(completedSteps.length / enrollmentSteps.length) * 100} className="h-2" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ChevronRight className="h-3 w-3" />
                  Current: {enrollmentSteps[currentStep]?.title}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Journey Steps Navigation */}
          <div className="mb-4">
            <EnrollmentJourneySteps
              currentStep={currentStep}
              onStepClick={(step) => {
                setCurrentStep(step);
                toast.info(`Switched to ${enrollmentSteps[step]?.title}`);
              }}
              completedSteps={completedSteps}
            />
          </div>

          {/* Combined Chat + Current Section Form layout for modal */}
          <div className={`grid grid-cols-1 ${showSectionSummary ? 'md:grid-cols-2' : ''} gap-2 sm:gap-4`}>
            {/* Chat */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                  AI Enrollment Assistant
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Currently working on: <strong>{enrollmentSteps[currentStep]?.title}</strong>
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[35vh] sm:h-[42vh] md:h-[48vh] overflow-hidden">
                  <ConversationManager
                    agentId="enrollment-agent"
                    enrollmentContext={{
                      process_type: 'patient_enrollment',
                      current_section: enrollmentSteps[currentStep]?.section || 'general',
                      step: currentStep,
                      total_steps: enrollmentSteps.length,
                      capture_fields: [
                        'personal_information',
                        'medical_history', 
                        'insurance_details',
                        'contact_information',
                        'emergency_contacts',
                        'preferences'
                      ]
                    }}
                    onDataCapture={handleDataCapture}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Current Section Progress */}
            <Card className={!showSectionSummary ? 'hidden' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                  {enrollmentSteps[currentStep]?.title}
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Section {currentStep + 1} of {enrollmentSteps.length} - Information captured via conversation
                </p>
              </CardHeader>
              <CardContent className="p-2 sm:p-4">
                <div className="h-[35vh] sm:h-[42vh] md:h-[48vh] overflow-y-auto">
                  {/* Current Section Data Display */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">Current Section</span>
                      <Badge variant={completedSteps.includes(currentStep) ? "default" : "outline"}>
                        {completedSteps.includes(currentStep) ? "Complete" : "In Progress"}
                      </Badge>
                    </div>
                    
                    {sectionsData[enrollmentSteps[currentStep]?.section] ? (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Captured Information:</h4>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          {Object.entries(sectionsData[enrollmentSteps[currentStep]?.section] || {}).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center py-1">
                              <span className="text-xs text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                              <span className="text-xs font-medium">{typeof value === 'string' ? value : JSON.stringify(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Start the conversation to capture information for this section</p>
                      </div>
                    )}

                    {/* Next Steps */}
                    {currentStep < enrollmentSteps.length - 1 && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <ChevronRight className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Next: {enrollmentSteps[currentStep + 1]?.title}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        // Full screen version with form
        <Card>
          <CardContent>
            <PatientEnrollmentForm
              initialData={enrollmentData}
              onSubmit={handleFormSubmit}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};