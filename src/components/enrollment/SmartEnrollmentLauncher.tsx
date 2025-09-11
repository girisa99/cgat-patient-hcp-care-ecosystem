/**
 * SMART ENROLLMENT LAUNCHER
 * Intelligent launcher that adapts to page context and user preferences
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  MessageCircle, 
  FileText, 
  Zap, 
  Clock, 
  User,
  Building,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Settings
} from 'lucide-react';
import { usePageAwareEnrollment } from '@/hooks/usePageAwareEnrollment';
import { StructuredEnrollmentAgent } from './StructuredEnrollmentAgent';

type ModuleType = 'patient' | 'treatment_center' | 'customer' | 'manufacturer';
type EnrollmentMethod = 'structured-ai' | 'conversational' | 'traditional';

interface SmartEnrollmentLauncherProps {
  className?: string;
  variant?: 'floating' | 'inline' | 'card';
  forceModule?: ModuleType;
  showMethodSelection?: boolean;
}

export const SmartEnrollmentLauncher: React.FC<SmartEnrollmentLauncherProps> = ({
  className = '',
  variant = 'card',
  forceModule,
  showMethodSelection = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<EnrollmentMethod | null>(null);
  const [selectedModule, setSelectedModule] = useState<ModuleType | null>(null);
  
  const { getPageContext, getAvailableModules } = usePageAwareEnrollment();
  const pageContext = getPageContext();
  const availableModules = getAvailableModules();
  
  const suggestedModule = forceModule || availableModules[0] || 'patient';

  const handleLaunchEnrollment = (module: ModuleType, method: EnrollmentMethod) => {
    setSelectedModule(module);
    setSelectedMethod(method);
  };

  const handleMethodComplete = (result: { instanceId: string; pdfUrl: string }) => {
    console.log('Enrollment completed:', result);
    setIsOpen(false);
    setSelectedMethod(null);
    setSelectedModule(null);
    
    // Auto-download PDF if available
    if (result.pdfUrl) {
      const link = document.createElement('a');
      link.href = result.pdfUrl;
      link.download = `enrollment_${result.instanceId}.pdf`;
      link.click();
    }
  };


  const getModuleInfo = (module: ModuleType) => {
    const info = {
      patient: {
        title: 'Patient Enrollment',
        icon: User,
        description: 'Complete medical intake and enrollment',
        contextPrompt: 'Start your patient enrollment process'
      },
      treatment_center: {
        title: 'Treatment Center Onboarding',
        icon: Building,
        description: 'Register facility and complete compliance requirements', 
        contextPrompt: 'Begin treatment center registration and compliance setup'
      },
      customer: {
        title: 'Customer Registration',
        icon: User,
        description: 'Create account and set preferences',
        contextPrompt: 'Welcome! Let\'s get your account set up'
      },
      manufacturer: {
        title: 'Manufacturer Registration',
        icon: Building,
        description: 'Register company and product catalog',
        contextPrompt: 'Register your company and products with us'
      }
    };
    return info[module];
  };

  if (selectedMethod && selectedModule) {
    if (selectedMethod === 'structured-ai') {
      return (
        <StructuredEnrollmentAgent
          moduleType={selectedModule}
          onComplete={handleMethodComplete}
          onCancel={() => {
            setSelectedMethod(null);
            setSelectedModule(null);
          }}
        />
      );
    }
    
    // Other methods would be implemented here
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedMethod === 'conversational' ? 'Full Conversational AI' : 'Traditional Forms'} - Coming Soon
            </CardTitle>
            <p className="text-muted-foreground">
              This enrollment method is currently in development.
            </p>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setSelectedMethod(null)}>
              Back to Method Selection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (variant === 'floating') {
    return (
      <>
        <Button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg ${className}`}
          size="icon"
        >
          <Sparkles className="h-6 w-6" />
        </Button>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Smart Enrollment Assistant</DialogTitle>
            </DialogHeader>
            <EnrollmentMethodSelector
              suggestedModule={suggestedModule}
              availableModules={availableModules}
              onLaunch={handleLaunchEnrollment}
              pageContext={pageContext}
            />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`border rounded-lg p-4 bg-gradient-to-r from-primary/5 to-blue-500/5 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">AI-Powered Enrollment Available</h4>
              <p className="text-sm text-muted-foreground">
                {getModuleInfo(suggestedModule).contextPrompt}
              </p>
            </div>
          </div>
          <Button onClick={() => setIsOpen(true)}>
            Get Started
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Choose Your Enrollment Method</DialogTitle>
            </DialogHeader>
            <EnrollmentMethodSelector
              suggestedModule={suggestedModule}
              availableModules={availableModules}
              onLaunch={handleLaunchEnrollment}
              pageContext={pageContext}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Default card variant
  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          Smart Enrollment Assistant
        </CardTitle>
        <p className="text-muted-foreground">
          Choose from multiple AI-powered enrollment methods tailored to your needs
        </p>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={() => setIsOpen(true)}
          className="w-full"
        >
          Start Enrollment Process
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Choose Your Enrollment Method</DialogTitle>
            </DialogHeader>
            <EnrollmentMethodSelector
              suggestedModule={suggestedModule}
              availableModules={availableModules}
              onLaunch={handleLaunchEnrollment}
              pageContext={pageContext}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

const EnrollmentMethodSelector: React.FC<{
  suggestedModule: ModuleType;
  availableModules: ModuleType[];
  onLaunch: (module: ModuleType, method: EnrollmentMethod) => void;
  pageContext: any;
}> = ({ suggestedModule, availableModules, onLaunch, pageContext }) => {
  const methods: EnrollmentMethod[] = ['structured-ai', 'conversational', 'traditional'];
  
  const getMethodIcon = (method: EnrollmentMethod) => {
    switch (method) {
      case 'structured-ai': return <Sparkles className="h-5 w-5" />;
      case 'conversational': return <MessageCircle className="h-5 w-5" />;
      case 'traditional': return <FileText className="h-5 w-5" />;
    }
  };

  const getMethodDetails = (method: EnrollmentMethod) => {
    const details = {
      'structured-ai': {
        title: 'Structured AI Sections',
        description: 'Section-by-section AI assistance with specialized agents',
        benefits: ['Specialized AI for each section', 'Structured data capture', 'Guided validation', 'Progress tracking'],
        badge: 'Recommended',
        badgeVariant: 'default' as const,
        estimatedTime: '12-18 minutes'
      },
      'conversational': {
        title: 'Full Conversational AI', 
        description: 'Single AI conversation covering all enrollment aspects',
        benefits: ['Natural conversation flow', 'Ask questions anytime', 'Adaptive responses', 'Contextual guidance'],
        badge: 'Popular',
        badgeVariant: 'secondary' as const,
        estimatedTime: '15-25 minutes'
      },
      'traditional': {
        title: 'Traditional Forms',
        description: 'Standard form interface with validation',
        benefits: ['Familiar form layout', 'Self-paced completion', 'Clear sections', 'Save & resume'],
        badge: 'Classic',
        badgeVariant: 'outline' as const,
        estimatedTime: '20-30 minutes'
      }
    };
    return details[method];
  };
  
  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto">
      {/* Module Selection */}
      {availableModules.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Enrollment Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableModules.map((module) => {
                const info = getModuleInfo(module);
                return (
                  <div
                    key={module}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      module === suggestedModule ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <info.icon className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-medium">{info.title}</h4>
                        <p className="text-sm text-muted-foreground">{info.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Method Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {methods.map((method) => {
          const details = getMethodDetails(method);
          return (
            <Card 
              key={method}
              className={`relative transition-all hover:shadow-md cursor-pointer ${
                method === 'structured-ai' ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div className="absolute top-4 right-4">
                <Badge variant={details.badgeVariant}>
                  {details.badge}
                </Badge>
              </div>
              
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 pr-8">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {getMethodIcon(method)}
                  </div>
                  <span className="text-base">{details.title}</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {details.description}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Benefits:</h4>
                  <ul className="space-y-1">
                    {details.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{details.estimatedTime}</span>
                </div>
                
                <Button 
                  className="w-full"
                  variant={method === 'structured-ai' ? 'default' : 'outline'}
                  onClick={() => onLaunch(suggestedModule, method)}
                >
                  {method === 'structured-ai' && <Zap className="h-3 w-3 mr-1" />}
                  Choose This Method
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const getModuleInfo = (module: ModuleType) => {
  const info = {
    patient: {
      title: 'Patient Enrollment',
      icon: User,
      description: 'Complete medical intake and enrollment',
      contextPrompt: 'Start your patient enrollment process'
    },
    treatment_center: {
      title: 'Treatment Center Onboarding',
      icon: Building,
      description: 'Register facility and complete compliance requirements', 
      contextPrompt: 'Begin treatment center registration and compliance setup'
    },
    customer: {
      title: 'Customer Registration',
      icon: User,
      description: 'Create account and set preferences',
      contextPrompt: 'Welcome! Let\'s get your account set up'
    },
    manufacturer: {
      title: 'Manufacturer Registration',
      icon: Building,
      description: 'Register company and product catalog',
      contextPrompt: 'Register your company and products with us'
    }
  };
  return info[module];
};
