/**
 * ONBOARDING WIZARD - Step-by-step onboarding form
 * Comprehensive wizard for treatment center onboarding
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Check,
  Building,
  Users,
  FileText,
  CreditCard,
  Shield
} from 'lucide-react';
import { TreatmentCenterOnboarding } from '@/types/onboarding';

interface OnboardingWizardProps {
  applicationId?: string | null;
  onSubmit: (data: Partial<TreatmentCenterOnboarding>) => void;
  onBack: () => void;
}

interface WizardStep {
  id: string;
  title: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  applicationId,
  onSubmit,
  onBack
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<TreatmentCenterOnboarding>>({
    company_info: {
      legal_name: '',
      dba_name: '',
      website: '',
      federal_tax_id: '',
      same_as_legal_address: false,
      legal_address: {
        street: '',
        city: '',
        state: '',
        zip: ''
      }
    },
    business_info: {
      business_type: [],
      years_in_business: 0,
      ownership_type: 'corporation' as any,
      number_of_employees: 0,
      estimated_monthly_purchases: 0
    }
  });

  const updateFormData = (section: string, data: any) => {
    setFormData(prev => {
      const currentSection = prev[section as keyof typeof prev] as any;
      return {
        ...prev,
        [section]: {
          ...(currentSection || {}),
          ...data
        }
      };
    });
  };

  const CompanyInfoStep = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="legal_name">Legal Company Name *</Label>
          <Input
            id="legal_name"
            value={formData.company_info?.legal_name || ''}
            onChange={(e) => updateFormData('company_info', { legal_name: e.target.value })}
            placeholder="Enter legal company name"
            required
          />
        </div>
        <div>
          <Label htmlFor="dba_name">DBA Name</Label>
          <Input
            id="dba_name"
            value={formData.company_info?.dba_name || ''}
            onChange={(e) => updateFormData('company_info', { dba_name: e.target.value })}
            placeholder="Doing Business As name"
          />
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={formData.company_info?.website || ''}
            onChange={(e) => updateFormData('company_info', { website: e.target.value })}
            placeholder="https://example.com"
          />
        </div>
        <div>
          <Label htmlFor="federal_tax_id">Federal Tax ID *</Label>
          <Input
            id="federal_tax_id"
            value={formData.company_info?.federal_tax_id || ''}
            onChange={(e) => updateFormData('company_info', { federal_tax_id: e.target.value })}
            placeholder="XX-XXXXXXX"
            required
          />
        </div>
      </div>
    </div>
  );

  const BusinessInfoStep = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="years_in_business">Years in Business</Label>
          <Input
            id="years_in_business"
            type="number"
            value={formData.business_info?.years_in_business || ''}
            onChange={(e) => updateFormData('business_info', { years_in_business: parseInt(e.target.value) || 0 })}
            placeholder="5"
            min="0"
          />
        </div>
        <div>
          <Label htmlFor="number_of_employees">Number of Employees</Label>
          <Input
            id="number_of_employees"
            type="number"
            value={formData.business_info?.number_of_employees || ''}
            onChange={(e) => updateFormData('business_info', { number_of_employees: parseInt(e.target.value) || 0 })}
            placeholder="50"
            min="0"
          />
        </div>
        <div>
          <Label htmlFor="estimated_monthly_purchases">Estimated Monthly Purchases ($)</Label>
          <Input
            id="estimated_monthly_purchases"
            type="number"
            value={formData.business_info?.estimated_monthly_purchases || ''}
            onChange={(e) => updateFormData('business_info', { estimated_monthly_purchases: parseFloat(e.target.value) || 0 })}
            placeholder="50000"
            min="0"
            step="1000"
          />
        </div>
        <div>
          <Label htmlFor="ownership_type">Ownership Type</Label>
          <select
            id="ownership_type"
            value={formData.business_info?.ownership_type || 'corporation'}
            onChange={(e) => updateFormData('business_info', { ownership_type: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="corporation">Corporation</option>
            <option value="llc">LLC</option>
            <option value="partnership">Partnership</option>
            <option value="sole_proprietorship">Sole Proprietorship</option>
            <option value="non_profit">Non-Profit</option>
            <option value="government">Government</option>
          </select>
        </div>
      </div>
    </div>
  );

  const ReviewStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Company Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Legal Name:</strong> {formData.company_info?.legal_name}
          </div>
          <div>
            <strong>DBA Name:</strong> {formData.company_info?.dba_name || 'N/A'}
          </div>
          <div>
            <strong>Website:</strong> {formData.company_info?.website || 'N/A'}
          </div>
          <div>
            <strong>Federal Tax ID:</strong> {formData.company_info?.federal_tax_id}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Business Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Years in Business:</strong> {formData.business_info?.years_in_business}
          </div>
          <div>
            <strong>Employees:</strong> {formData.business_info?.number_of_employees}
          </div>
          <div>
            <strong>Monthly Purchases:</strong> ${formData.business_info?.estimated_monthly_purchases?.toLocaleString()}
          </div>
          <div>
            <strong>Ownership Type:</strong> {formData.business_info?.ownership_type}
          </div>
        </div>
      </div>
    </div>
  );

  const steps: WizardStep[] = [
    {
      id: 'company_info',
      title: 'Company Information',
      icon: <Building className="h-5 w-5" />,
      component: <CompanyInfoStep />
    },
    {
      id: 'business_info',
      title: 'Business Details',
      icon: <Users className="h-5 w-5" />,
      component: <BusinessInfoStep />
    },
    {
      id: 'review',
      title: 'Review & Submit',
      icon: <Check className="h-5 w-5" />,
      component: <ReviewStep />
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <h1 className="text-2xl font-bold mb-2">
          {applicationId ? 'Edit Application' : 'New Onboarding Application'}
        </h1>
        
        <Progress value={progress} className="w-full" />
        
        <div className="flex justify-between mt-4 text-sm text-muted-foreground">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center gap-2 ${
                index === currentStep ? 'text-primary font-medium' : ''
              } ${index < currentStep ? 'text-green-600' : ''}`}
            >
              {step.icon}
              {step.title}
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {steps[currentStep].icon}
            {steps[currentStep].title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {steps[currentStep].component}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          
          {isLastStep ? (
            <Button onClick={handleSubmit}>
              <Check className="h-4 w-4 mr-2" />
              Submit Application
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};