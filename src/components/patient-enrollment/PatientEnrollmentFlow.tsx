import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Bot, 
  Scan, 
  MousePointer, 
  Settings,
  Play,
  Users,
  Stethoscope,
  CreditCard,
  Activity,
  Brain,
  Workflow,
  TestTube,
  Shield
} from 'lucide-react';
import { ComprehensiveEnrollmentForm } from '../enrollment-genie/ComprehensiveEnrollmentForm';

interface PatientEnrollmentFlowProps {
  onClose?: () => void;
}

export const PatientEnrollmentFlow: React.FC<PatientEnrollmentFlowProps> = ({ onClose }) => {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);

  const submissionModes = [
    {
      id: 'structured-ai',
      title: 'Structured AI Agent',
      description: 'Template-based AI agent for systematic enrollment processing',
      icon: Brain,
      features: ['Template-driven workflow', 'NPI verification', 'Clinical assessment', 'Voice integration']
    },
    {
      id: 'fill-fax',
      title: 'Fill & Fax (OCR)',
      description: 'Optical Character Recognition for faxed forms',
      icon: Scan,
      features: ['OCR processing', 'Auto-populate fields', 'Validation checks', 'Digital conversion']
    },
    {
      id: 'pdf-fill',
      title: 'Online PDF Fill',
      description: 'Digital PDF form completion with signature capture',
      icon: FileText,
      features: ['Interactive PDF', 'Digital signatures', 'Progress saving', 'Export options']
    },
    {
      id: 'online-form',
      title: 'Online Form Fill',
      description: 'Web-based interactive enrollment form',
      icon: MousePointer,
      features: ['Real-time validation', 'Section-based progress', 'Collaboration tools', 'Mobile responsive']
    }
  ];

  const clinicalSubtabs = [
    { id: 'identity-verification', title: 'Identity Verification', icon: Shield },
    { id: 'clinical-readiness', title: 'Clinical Readiness Assessment', icon: Activity },
    { id: 'care-coordination', title: 'Care Coordination & Logistics', icon: Users },
    { id: 'financial-counseling', title: 'Financial Counseling & Support', icon: CreditCard },
    { id: 'consent-legal', title: 'Consent & Legal Documentation', icon: FileText },
    { id: 'technology-monitoring', title: 'Technology & Monitoring Setup', icon: Settings }
  ];

  if (showEnrollmentForm) {
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-auto">
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Patient Enrollment Form</h1>
            <Button variant="outline" onClick={() => setShowEnrollmentForm(false)}>
              Back to Selection
            </Button>
          </div>
          <ComprehensiveEnrollmentForm 
            onFormComplete={(_formData) => {
              setShowEnrollmentForm(false);
              onClose?.();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Patient Enrollment</h2>
        <p className="text-muted-foreground">
          Choose your preferred enrollment method and configure the workflow
        </p>
      </div>

      <Tabs defaultValue="submission-mode" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="submission-mode" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Submission Mode
          </TabsTrigger>
          <TabsTrigger value="clinical-treatment" className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            Clinical & Treatment
          </TabsTrigger>
          <TabsTrigger value="workflow-config" className="flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            Workflow Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submission-mode" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {submissionModes.map((mode) => {
              const IconComponent = mode.icon;
              return (
                <Card 
                  key={mode.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedMode === mode.id ? 'ring-2 ring-primary shadow-lg' : ''
                  }`}
                  onClick={() => setSelectedMode(mode.id)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{mode.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{mode.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {mode.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      {selectedMode === mode.id && (
                        <Button 
                          className="w-full mt-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowEnrollmentForm(true);
                          }}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Enrollment
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {selectedMode === 'structured-ai' && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Structured AI Agent Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Enrollment Templates</h4>
                    <p className="text-sm text-muted-foreground">Pre-configured workflows for different enrollment types</p>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">NPI Review</h4>
                    <p className="text-sm text-muted-foreground">Automated provider credential verification</p>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Voice Integration</h4>
                    <p className="text-sm text-muted-foreground">Voice-enabled data entry and validation</p>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="clinical-treatment" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {clinicalSubtabs.map((subtab) => {
              const IconComponent = subtab.icon;
              return (
                <Card key={subtab.id} className="cursor-pointer hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="font-medium text-sm">{subtab.title}</h4>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Clinical & Treatment Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Assessment Protocols</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Comprehensive clinical evaluation</li>
                    <li>• Treatment readiness assessment</li>
                    <li>• Risk stratification protocols</li>
                    <li>• Compliance monitoring setup</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Data Integration</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Electronic health record sync</li>
                    <li>• Lab result integration</li>
                    <li>• Provider note compilation</li>
                    <li>• Historical treatment data</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow-config" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Deployment Environment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    Development Environment
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Staging Environment
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Production Environment
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Channel Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    Web Portal
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Mobile App
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    API Integration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Testing & Deployment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1">
                  <TestTube className="h-4 w-4 mr-2" />
                  Run Tests
                </Button>
                <Button className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Deploy
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};