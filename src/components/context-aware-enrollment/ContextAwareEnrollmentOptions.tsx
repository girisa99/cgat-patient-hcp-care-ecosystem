/**
 * CONTEXT-AWARE ENROLLMENT OPTIONS
 * Shows enrollment options based on current page context
 * Integrates AI agents with existing enrollment flows
 */
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText, 
  Edit3, 
  Bot, 
  Clock, 
  CheckCircle,
  Users,
  Building2,
  UserCheck,
  Factory,
  Database,
  Settings
} from 'lucide-react';
import DataIntegrationPanel from './DataIntegrationPanel';
import { UniversalEnrollmentProcessor } from './UniversalEnrollmentProcessor';

type ModuleType = 'patient' | 'treatment_center' | 'customer' | 'manufacturer';

interface EnrollmentOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  estimatedTime: string;
  isAgent?: boolean;
  action: () => void;
}

interface ContextAwareEnrollmentOptionsProps {
  onAgentSelect: (moduleType: ModuleType) => void;
  onTraditionalSelect: (option: string) => void;
  className?: string;
}

const getModuleFromPath = (pathname: string): ModuleType | null => {
  if (pathname.includes('patient')) return 'patient';
  if (pathname.includes('treatment-center') || pathname.includes('facilities')) return 'treatment_center';
  if (pathname.includes('customer')) return 'customer';
  if (pathname.includes('manufacturer') || pathname.includes('order-management')) return 'manufacturer';
  return null;
};

const getModuleInfo = (moduleType: ModuleType) => {
  const moduleConfig = {
    patient: {
      title: 'Patient Enrollment',
      icon: <Users className="h-6 w-6" />,
      color: 'bg-blue-500',
      sections: ['Demographics', 'Medical History', 'Insurance', 'Consent']
    },
    treatment_center: {
      title: 'Treatment Center Onboarding',
      icon: <Building2 className="h-6 w-6" />,
      color: 'bg-green-500',
      sections: ['Facility Information', 'Licensing', 'Staff Credentials', 'Agreements']
    },
    customer: {
      title: 'Customer Enrollment',
      icon: <UserCheck className="h-6 w-6" />,
      color: 'bg-purple-500',
      sections: ['Account Setup', 'Preferences', 'Billing', 'Verification']
    },
    manufacturer: {
      title: 'Manufacturer Registration',
      icon: <Factory className="h-6 w-6" />,
      color: 'bg-orange-500',
      sections: ['Company Details', 'Products', 'Certifications', 'Contracts']
    }
  };

  return moduleConfig[moduleType];
};

export const ContextAwareEnrollmentOptions: React.FC<ContextAwareEnrollmentOptionsProps> = ({
  onAgentSelect,
  onTraditionalSelect,
  className = ''
}) => {
  const location = useLocation();
  const currentModule = getModuleFromPath(location.pathname);
  const [showDataIntegration, setShowDataIntegration] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showProcessor, setShowProcessor] = useState(false);

  // Don't show if not on a specific module page
  if (!currentModule) {
    return null;
  }

  const moduleInfo = getModuleInfo(currentModule);

  const enrollmentOptions: EnrollmentOption[] = [
    {
      id: 'agent',
      title: 'AI-Powered Enrollment',
      description: 'Let our AI assistant guide you through the process with intelligent questions',
      icon: <Bot className="h-5 w-5" />,
      estimatedTime: '5-10 min',
      isAgent: true,
      action: () => {
        setSelectedOption('agent');
        setShowProcessor(true);
        onAgentSelect(currentModule);
      }
    },
    {
      id: 'online-form',
      title: 'Fill Online Form',
      description: 'Complete the enrollment using our standard online form with NPI verification and voice support',
      icon: <Edit3 className="h-5 w-5" />,
      estimatedTime: '10-15 min',
      action: () => {
        setSelectedOption('online-form');
        setShowProcessor(true);
        onTraditionalSelect('online-form');
      }
    },
    {
      id: 'pdf-fill',
      title: 'Fill & Submit PDF',
      description: 'Generate PDF form with auto-fill, voice review, and AI validation',
      icon: <FileText className="h-5 w-5" />,
      estimatedTime: '15-20 min',
      action: () => {
        setSelectedOption('pdf-fill');
        setShowProcessor(true);
        onTraditionalSelect('pdf-fill');
      }
    },
    {
      id: 'download-fax',
      title: 'Fill & Fax (OCR)',
      description: 'Process documents via fax with OCR extraction and voice clarification',
      icon: <Download className="h-5 w-5" />,
      estimatedTime: '20-30 min',
      action: () => {
        setSelectedOption('download-fax');
        setShowProcessor(true);
        onTraditionalSelect('download-fax');
      }
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Module Header */}
      <Card className="border-l-4" style={{ borderLeftColor: moduleInfo.color.replace('bg-', '').replace('-500', '') }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${moduleInfo.color} text-white`}>
              {moduleInfo.icon}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{moduleInfo.title}</h2>
              <p className="text-sm text-muted-foreground">
                Choose how you'd like to complete your enrollment
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Enrollment Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {enrollmentOptions.map((option) => (
          <Card 
            key={option.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              option.isAgent ? 'ring-2 ring-primary/20 bg-primary/5' : ''
            }`}
            onClick={option.action}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    option.isAgent ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    {option.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{option.title}</h3>
                    {option.isAgent && (
                      <Badge variant="secondary" className="mt-1">
                        Recommended
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {option.estimatedTime}
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                {option.description}
              </p>

              <Button 
                variant={option.isAgent ? "default" : "outline"} 
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  option.action();
                }}
              >
                {option.isAgent ? 'Start with AI Assistant' : 'Select This Option'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Sections Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">What You'll Complete</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowDataIntegration(!showDataIntegration)}
          >
            <Database className="h-4 w-4 mr-2" />
            Data Integration
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {moduleInfo.sections.map((section, index) => (
              <div key={section} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{section}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Integration Panel */}
      {showDataIntegration && (
        <DataIntegrationPanel 
          moduleType={currentModule}
          onDataUpdate={(result) => {
            console.log('Data integration result:', result);
          }}
        />
      )}

      {/* Universal Enrollment Processor */}
      {showProcessor && selectedOption && (
        <UniversalEnrollmentProcessor
          selectedOption={selectedOption}
          moduleType={currentModule}
          onComplete={(data) => {
            console.log('Enrollment completed:', data);
            setShowProcessor(false);
            setSelectedOption(null);
          }}
        />
      )}
    </div>
  );
};