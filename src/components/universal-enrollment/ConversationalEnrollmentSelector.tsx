/**
 * CONVERSATIONAL ENROLLMENT SELECTOR
 * Component to choose between traditional forms or AI conversation
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, FileText, Zap, Clock } from 'lucide-react';
import { SmartEnrollmentLauncher } from '../enrollment/SmartEnrollmentLauncher';
import { FloatingConversationalAgent } from '../enrollment/FloatingConversationalAgent';

type ModuleType = 'patient' | 'treatment_center' | 'customer' | 'manufacturer';

interface ConversationalEnrollmentSelectorProps {
  moduleType: ModuleType;
  onComplete?: (result: any) => void;
}

export const ConversationalEnrollmentSelector: React.FC<ConversationalEnrollmentSelectorProps> = ({
  moduleType,
  onComplete
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'conversation' | 'traditional' | null>(null);

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
      <FloatingConversationalAgent
        moduleType={moduleType}
        onComplete={onComplete || (() => {})}
        onCancel={() => setSelectedMethod(null)}
      />
    );
  }

  if (selectedMethod === 'traditional') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Traditional Form Method</CardTitle>
            <p className="text-muted-foreground">Traditional form interface coming soon...</p>
          </CardHeader>
        </Card>
      </div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Conversation Method */}
        <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors cursor-pointer group">
          <div className="absolute top-4 right-4">
            <Badge variant="default" className="bg-primary">
              <Zap className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
          </div>
          
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              Conversational Enrollment
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Chat with our AI assistant to complete your enrollment naturally and easily
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
              Complete standard forms at your own pace with familiar interface
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
              Use Traditional Forms
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Both methods collect the same information and provide the same digital signature and PDF generation capabilities.
            </p>
            <p className="text-xs text-muted-foreground">
              You can switch methods at any time during the process if needed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};