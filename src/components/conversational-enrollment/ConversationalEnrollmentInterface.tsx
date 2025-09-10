/**
 * CONVERSATIONAL ENROLLMENT INTERFACE
 * Main component for AI-powered enrollment conversations
 */
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Send, FileText, CheckCircle, Clock, User, Bot } from 'lucide-react';
import { useConversationalEnrollment } from '@/hooks/useConversationalEnrollment';
import { SignatureCapture } from './SignatureCapture';
import { EnrollmentSummary } from './EnrollmentSummary';

type ModuleType = 'patient' | 'treatment_center' | 'customer' | 'manufacturer';

interface ConversationalEnrollmentInterfaceProps {
  moduleType: ModuleType;
  templateId?: string;
  onComplete?: (result: { instanceId: string; pdfUrl: string }) => void;
}

export const ConversationalEnrollmentInterface: React.FC<ConversationalEnrollmentInterfaceProps> = ({
  moduleType,
  templateId,
  onComplete
}) => {
  const [userInput, setUserInput] = useState('');
  const [showSignature, setShowSignature] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    context,
    messages,
    sectionProgress,
    isProcessing,
    signatureData,
    setSignatureData,
    initializeConversation,
    sendMessage,
    progressToSection,
    completeEnrollment
  } = useConversationalEnrollment();

  // Initialize conversation on mount
  useEffect(() => {
    initializeConversation(moduleType, templateId);
  }, [moduleType, templateId, initializeConversation]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isProcessing) return;
    
    const message = userInput.trim();
    setUserInput('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNextSection = async () => {
    const nextSection = getNextSection();
    if (nextSection) {
      await progressToSection(nextSection);
    }
  };

  const handleComplete = async () => {
    if (isAllSectionsComplete()) {
      if (!signatureData) {
        setShowSignature(true);
        return;
      }
      
      const result = await completeEnrollment();
      if (result && onComplete) {
        onComplete(result);
      }
    }
  };

  const getNextSection = () => {
    const currentIndex = sectionProgress.findIndex(s => s.name === context?.currentSection);
    const nextSection = sectionProgress[currentIndex + 1];
    return nextSection?.name;
  };

  const isAllSectionsComplete = () => {
    return sectionProgress.filter(s => s.required).every(s => s.completed);
  };

  const getProgressPercentage = () => {
    const completedRequired = sectionProgress.filter(s => s.required && s.completed).length;
    const totalRequired = sectionProgress.filter(s => s.required).length;
    return totalRequired > 0 ? (completedRequired / totalRequired) * 100 : 0;
  };

  const getModuleTitle = (type: ModuleType) => {
    const titles = {
      patient: 'Patient Enrollment',
      treatment_center: 'Treatment Center Onboarding',
      customer: 'Customer Registration',
      manufacturer: 'Manufacturer Registration'
    };
    return titles[type];
  };

  if (showSummary) {
    return (
      <EnrollmentSummary
        context={context}
        sectionProgress={sectionProgress}
        onEdit={() => setShowSummary(false)}
        onComplete={handleComplete}
      />
    );
  }

  if (showSignature) {
    return (
      <SignatureCapture
        onSignatureComplete={(signature) => {
          setSignatureData(signature);
          setShowSignature(false);
          setShowSummary(true);
        }}
        onCancel={() => setShowSignature(false)}
        moduleType={moduleType}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6" />
            {getModuleTitle(moduleType)}
          </CardTitle>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress: {Math.round(getProgressPercentage())}% Complete</span>
              <span>Current: {context?.currentSection?.replace('_', ' ')}</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section Progress Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Sections</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {sectionProgress.map((section) => (
                  <div
                    key={section.name}
                    className={`flex items-center gap-2 p-2 rounded-lg border ${
                      section.name === context?.currentSection
                        ? 'border-primary bg-primary/10'
                        : section.completed
                        ? 'border-green-200 bg-green-50'
                        : 'border-border'
                    }`}
                  >
                    {section.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : section.name === context?.currentSection ? (
                      <Clock className="h-4 w-4 text-primary" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-muted-foreground" />
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {section.name.replace('_', ' ').toUpperCase()}
                      </div>
                      {section.required && (
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main Chat Interface */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>AI Assistant</span>
              <div className="flex gap-2">
                {getNextSection() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextSection}
                    disabled={isProcessing}
                  >
                    Next Section
                  </Button>
                )}
                {isAllSectionsComplete() && (
                  <Button
                    size="sm"
                    onClick={() => setShowSummary(true)}
                    disabled={isProcessing}
                  >
                    Review & Complete
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Messages */}
              <ScrollArea className="h-96 border rounded-lg p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.type === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {message.type === 'user' ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                          <span className="text-sm font-medium">
                            {message.type === 'user' ? 'You' : 'AI Assistant'}
                          </span>
                        </div>
                        <div className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4" />
                          <span className="text-sm">AI Assistant is typing...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

              <Separator />

              {/* Input Area */}
              <div className="flex gap-2">
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isProcessing}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!userInput.trim() || isProcessing}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};