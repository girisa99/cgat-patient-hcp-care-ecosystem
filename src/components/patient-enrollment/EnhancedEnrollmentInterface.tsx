import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  FileText, 
  User, 
  Download, 
  Eye, 
  Settings,
  Brain,
  Database,
  Mic
} from 'lucide-react';
import { ConversationManager } from '@/components/conversation/ConversationManager';
import { PatientEnrollmentForm } from './PatientEnrollmentForm';
import { UniversalVoiceInterface } from '@/components/voice/UniversalVoiceInterface';
import { toast } from 'sonner';

interface EnhancedEnrollmentInterfaceProps {
  onSubmit?: (data: any) => void;
  isInModal?: boolean;
}

export const EnhancedEnrollmentInterface: React.FC<EnhancedEnrollmentInterfaceProps> = ({
  onSubmit,
  isInModal = false
}) => {
  const [activeTab, setActiveTab] = useState<'conversation' | 'form'>('form');
  const [enrollmentData, setEnrollmentData] = useState<any>({});
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [voiceData, setVoiceData] = useState<any>({});
  const [currentChannel, setCurrentChannel] = useState<'online' | 'pdf' | 'fax' | 'voice'>('online');

  const handleDataCapture = (capturedData: any) => {
    setEnrollmentData(prev => ({
      ...prev,
      ...capturedData
    }));
    
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
    <div className={`w-full ${isInModal ? 'p-4' : 'max-w-7xl mx-auto'} space-y-4`}>
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
      
      {/* Modal Header */}
      {isInModal && (
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <MessageSquare className="h-6 w-6 mx-auto mb-1 text-primary" />
              <p className="text-xs font-medium">AI Conversation</p>
            </div>
            <div>
              <FileText className="h-6 w-6 mx-auto mb-1 text-primary" />
              <p className="text-xs font-medium">Smart Forms</p>
            </div>
            <div>
              <Download className="h-6 w-6 mx-auto mb-1 text-primary" />
              <p className="text-xs font-medium">Complete Package</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <TabsList className="grid w-full max-w-lg grid-cols-3">
              <TabsTrigger value="conversation" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                {isInModal ? "Chat" : "Conversation"}
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Voice
              </TabsTrigger>
              <TabsTrigger value="form" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Form
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3 flex-wrap">
              {!isInModal && (
                <select
                  value={currentChannel}
                  onChange={(e) => setCurrentChannel(e.target.value as any)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="online">Online</option>
                  <option value="voice">Voice</option>
                  <option value="pdf">PDF</option>
                  <option value="fax">Fax</option>
                </select>
              )}
              <Button 
                variant="outline" 
                size={isInModal ? "sm" : "default"}
                onClick={downloadEnrollmentPackage}
              >
                <Download className="h-4 w-4 mr-2" />
                {isInModal ? "Export" : "Download Package"}
              </Button>
              <Button 
                size={isInModal ? "sm" : "default"}
                onClick={() => handleFormSubmit(enrollmentData)}
                disabled={Object.keys(enrollmentData).length === 0}
              >
                Complete Enrollment
              </Button>
            </div>
          </div>
        </div>

        <TabsContent value="conversation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5" />
                AI Enrollment Assistant
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Chat naturally about your enrollment needs. The AI will ask questions and extract information automatically.
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className={`${isInModal ? 'h-[400px]' : 'min-h-[500px]'} overflow-hidden`}>
                <ConversationManager
                  agentId="enrollment-agent"
                  enrollmentContext={{
                    process_type: 'patient_enrollment',
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
        </TabsContent>

        <TabsContent value="voice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mic className="h-5 w-5" />
                Voice Interface
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Use voice commands and speech to complete your enrollment
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className={`${isInModal ? 'h-[400px]' : 'min-h-[500px]'} overflow-hidden`}>
                <UniversalVoiceInterface
                  agentType="conversational"
                  channelType={currentChannel}
                  onDataCapture={handleVoiceDataCapture}
                  onStatusChange={(status) => {
                    console.log('Voice status:', status);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="form" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Enrollment Form
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Review and complete the information captured from your conversation
              </p>
            </CardHeader>
            <CardContent className={`${isInModal ? 'max-h-[450px] overflow-y-auto' : ''}`}>
              <PatientEnrollmentForm
                initialData={enrollmentData}
                onSubmit={handleFormSubmit}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Status Panel - Only show when not in modal to save space */}
      {!isInModal && Object.keys(enrollmentData).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Captured Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(enrollmentData).map(([key, value]) => (
                <div key={key} className="text-center">
                  <Badge variant="secondary" className="mb-1">
                    {key.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {typeof value === 'object' ? 'Complex Data' : String(value).substring(0, 20)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};