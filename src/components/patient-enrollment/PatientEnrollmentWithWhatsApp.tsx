import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Users, FileText, Phone, Heart } from 'lucide-react';
import { WhatsAppConsentAgent } from './WhatsAppConsentAgent';
import { SignatureCapture } from '../conversational-enrollment/SignatureCapture';
import { Badge } from '@/components/ui/badge';

interface PatientEnrollmentWithWhatsAppProps {
  enrollmentId?: string;
  onComplete?: (data: any) => void;
}

export const PatientEnrollmentWithWhatsApp: React.FC<PatientEnrollmentWithWhatsAppProps> = ({
  enrollmentId,
  onComplete
}) => {
  const [activeSection, setActiveSection] = useState('consent');
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [consentData, setConsentData] = useState<any>(null);

  const sections = [
    {
      id: 'consent',
      title: 'WhatsApp Consent Collection',
      icon: MessageSquare,
      description: 'Collect consent via WhatsApp with location awareness',
      component: 'whatsapp'
    },
    {
      id: 'patient_info',
      title: 'Patient Information',
      icon: Users,
      description: 'Demographics and contact information',
      component: 'form'
    },
    {
      id: 'medical_info',
      title: 'Medical Information',
      icon: Heart,
      description: 'Medical history and treatment details',
      component: 'form'
    },
    {
      id: 'signature',
      title: 'Digital Signature',
      icon: FileText,
      description: 'Final signature and consent confirmation',
      component: 'signature'
    }
  ];

  const handleConsentComplete = (data: any) => {
    setConsentData(data);
    setCompletedSections(prev => [...prev, 'consent']);
    setActiveSection('patient_info');
  };

  const handleSectionComplete = (sectionId: string, data: any) => {
    setCompletedSections(prev => [...prev, sectionId]);
    
    // Progress to next section
    const currentIndex = sections.findIndex(s => s.id === sectionId);
    if (currentIndex < sections.length - 1) {
      setActiveSection(sections[currentIndex + 1].id);
    }
  };

  const renderSectionContent = (section: any) => {
    switch (section.component) {
      case 'whatsapp':
        return (
          <WhatsAppConsentAgent
            enrollmentId={enrollmentId}
            onConsentComplete={handleConsentComplete}
          />
        );
      
      case 'signature':
        return (
          <SignatureCapture
            moduleType="patient"
            onSignatureComplete={(signature) => {
              handleSectionComplete('signature', { signature });
              onComplete?.({ 
                consent: consentData, 
                signature,
                completed_sections: [...completedSections, 'signature']
              });
            }}
            onCancel={() => setActiveSection('medical_info')}
          />
        );
      
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{section.description}</p>
              <p className="text-sm text-muted-foreground mb-6">
                This section will integrate with existing enrollment forms when WhatsApp consent data is available.
              </p>
              <Button 
                onClick={() => handleSectionComplete(section.id, {})}
                className="w-full"
              >
                Continue to Next Section
              </Button>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Patient Enrollment with WhatsApp Agent</h1>
        <div className="flex flex-wrap gap-3">
          {sections.map((section) => {
            const IconComponent = section.icon;
            const isCompleted = completedSections.includes(section.id);
            const isActive = activeSection === section.id;
            
            return (
              <Button
                key={section.id}
                variant={isActive ? 'default' : isCompleted ? 'secondary' : 'outline'}
                onClick={() => setActiveSection(section.id)}
                className="flex items-center gap-2"
              >
                <IconComponent className="h-4 w-4" />
                {section.title}
                {isCompleted && <Badge variant="secondary" className="ml-2">✓</Badge>}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Active Section Content */}
      <div className="space-y-6">
        {sections
          .filter(section => section.id === activeSection)
          .map(section => (
            <div key={section.id}>
              {renderSectionContent(section)}
            </div>
          ))}
      </div>

      {/* Features Overview */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            WhatsApp Agent Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">🏥 Location-Aware Workflows</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Facility: In-person verification with digital tablet signatures</li>
                <li>• Remote: Voice confirmation and digital alternatives</li>
                <li>• Caregiver: Dual verification for patient and caregiver</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔗 Integration Capabilities</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• n8n workflow automation</li>
                <li>• Twilio WhatsApp Business API</li>
                <li>• Secure patient data collection</li>
                <li>• Real-time consent tracking</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};