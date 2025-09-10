/**
 * MODULE ENROLLMENT FORM
 * Universal form component that adapts to different module types
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Download, 
  Send, 
  FileX, 
  Globe,
  Users,
  Signature,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Building2,
  Factory,
  UserPlus
} from 'lucide-react';
import { useUniversalEnrollment } from '@/hooks/useUniversalEnrollment';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';

type ModuleType = 'patient' | 'treatment_center' | 'customer' | 'manufacturer';
type SubmissionMethod = 'online' | 'csv_import' | 'api_import' | 'fax';

interface ModuleEnrollmentFormProps {
  moduleType: ModuleType;
  instanceId?: string | null;
  onComplete?: () => void;
  onCancel?: () => void;
}

const FORM_FIELDS: Record<ModuleType, Array<{
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'textarea' | 'select';
  required: boolean;
  options?: string[];
}>> = {
  patient: [
    { name: 'firstName', label: 'First Name', type: 'text', required: true },
    { name: 'lastName', label: 'Last Name', type: 'text', required: true },
    { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone', type: 'tel', required: true },
    { name: 'address', label: 'Address', type: 'textarea', required: true },
    { name: 'insuranceProvider', label: 'Insurance Provider', type: 'text', required: false },
    { name: 'medicalHistory', label: 'Medical History', type: 'textarea', required: false }
  ],
  treatment_center: [
    { name: 'facilityName', label: 'Facility Name', type: 'text', required: true },
    { name: 'licenseNumber', label: 'License Number', type: 'text', required: true },
    { name: 'npiNumber', label: 'NPI Number', type: 'text', required: true },
    { name: 'primaryContactEmail', label: 'Primary Contact Email', type: 'email', required: true },
    { name: 'facilityAddress', label: 'Facility Address', type: 'textarea', required: true },
    { name: 'accreditation', label: 'Accreditation', type: 'text', required: false },
    { name: 'specialties', label: 'Specialties', type: 'textarea', required: false }
  ],
  customer: [
    { name: 'companyName', label: 'Company Name', type: 'text', required: true },
    { name: 'businessType', label: 'Business Type', type: 'select', required: true, 
      options: ['Corporation', 'LLC', 'Partnership', 'Sole Proprietorship', 'Non-Profit'] },
    { name: 'primaryContactName', label: 'Primary Contact Name', type: 'text', required: true },
    { name: 'primaryContactEmail', label: 'Primary Contact Email', type: 'email', required: true },
    { name: 'businessAddress', label: 'Business Address', type: 'textarea', required: true },
    { name: 'taxId', label: 'Tax ID', type: 'text', required: false },
    { name: 'description', label: 'Business Description', type: 'textarea', required: false }
  ],
  manufacturer: [
    { name: 'manufacturerName', label: 'Manufacturer Name', type: 'text', required: true },
    { name: 'fdaNumber', label: 'FDA Registration Number', type: 'text', required: false },
    { name: 'isoNumber', label: 'ISO Certification Number', type: 'text', required: false },
    { name: 'primaryContactEmail', label: 'Primary Contact Email', type: 'email', required: true },
    { name: 'manufacturingAddress', label: 'Manufacturing Address', type: 'textarea', required: true },
    { name: 'productCategories', label: 'Product Categories', type: 'textarea', required: false },
    { name: 'qualityCertifications', label: 'Quality Certifications', type: 'textarea', required: false }
  ]
};

const MODULE_ICONS = {
  patient: <UserPlus className="h-5 w-5" />,
  treatment_center: <Building2 className="h-5 w-5" />,
  customer: <Users className="h-5 w-5" />,
  manufacturer: <Factory className="h-5 w-5" />
};

export const ModuleEnrollmentForm: React.FC<ModuleEnrollmentFormProps> = ({
  moduleType,
  instanceId,
  onComplete,
  onCancel
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submissionMethod, setSubmissionMethod] = useState<SubmissionMethod>('online');
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [providerSignature, setProviderSignature] = useState<string | null>(null);
  
  const { createInstance, updateInstance, getInstance } = useUniversalEnrollment();
  const { showSuccess, showError } = useMasterToast();

  const formFields = FORM_FIELDS[moduleType];
  const totalSteps = 4;

  useEffect(() => {
    if (instanceId) {
      loadExistingInstance();
    }
  }, [instanceId]);

  const loadExistingInstance = async () => {
    try {
      const instance = await getInstance(instanceId!);
      if (instance) {
        setFormData(instance.enrollment_data || {});
        setSubmissionMethod(instance.submission_method as SubmissionMethod);
        setProgress(instance.progress);
      }
    } catch (error) {
      console.error('Error loading instance:', error);
      showError('Failed to load enrollment data');
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateProgress = () => {
    const requiredFields = formFields.filter(field => field.required);
    const completedRequired = requiredFields.filter(field => 
      formData[field.name] && formData[field.name].toString().trim() !== ''
    ).length;
    
    const baseProgress = (completedRequired / requiredFields.length) * 70; // 70% for form completion
    const methodProgress = submissionMethod ? 20 : 0; // 20% for method selection
    const signatureProgress = providerSignature ? 10 : 0; // 10% for signature
    
    return Math.round(baseProgress + methodProgress + signatureProgress);
  };

  useEffect(() => {
    setProgress(calculateProgress());
  }, [formData, submissionMethod, providerSignature]);

  const handleSubmissionMethodChange = (method: SubmissionMethod) => {
    setSubmissionMethod(method);
  };

  const handleDownloadForm = async () => {
    try {
      setLoading(true);
      
      const response = await supabase.functions.invoke('patient-enrollment-pdf', {
        body: {
          action: 'generate_module_form',
          data: {
            moduleType,
            formData,
            submissionMethod: 'fax'
          }
        }
      });

      if (response.error) throw response.error;

      // Create download link
      const link = document.createElement('a');
      link.href = response.data.pdf_url;
      link.download = `${moduleType}-enrollment-form.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSuccess('Form downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      showError('Failed to download form');
    } finally {
      setLoading(false);
    }
  };

  const handleFaxSubmission = async () => {
    try {
      setLoading(true);
      
      const response = await supabase.functions.invoke('fax-processing', {
        body: {
          action: 'setup_module_fax_reception',
          data: {
            moduleType,
            formData,
            expectedDocument: `${moduleType}_enrollment_form`
          }
        }
      });

      if (response.error) throw response.error;

      showSuccess('Fax processing setup complete. Fax number: ' + response.data.fax_number);
      await saveInstance('fax');
    } catch (error) {
      console.error('Fax setup error:', error);
      showError('Failed to setup fax processing');
    } finally {
      setLoading(false);
    }
  };

  const handleOnlineSubmission = async () => {
    try {
      setLoading(true);
      await saveInstance('online');
      showSuccess('Enrollment submitted successfully');
      onComplete?.();
    } catch (error) {
      console.error('Online submission error:', error);
      showError('Failed to submit enrollment');
    } finally {
      setLoading(false);
    }
  };

  const saveInstance = async (method: SubmissionMethod) => {
    const instanceData = {
      template_id: null, // Will be set based on module type
      module_type: moduleType,
      enrollment_data: formData,
      submission_method: method,
      status: method === 'online' ? 'completed' : 'in_progress',
      progress: calculateProgress(),
      current_step: 'submitted',
      submitted_by: null, // Will be set by RLS
      submitted_at: new Date().toISOString()
    };

    if (instanceId) {
      await updateInstance(instanceId, instanceData);
    } else {
      await createInstance(instanceData);
    }
  };

  const renderSubmissionOptions = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Choose Submission Method
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-4 gap-4">
          {/* Online Form Option */}
          <Card className={`cursor-pointer border-2 transition-colors ${
            submissionMethod === 'online' 
              ? 'border-primary bg-primary/5' 
              : 'border-muted hover:border-primary/50'
          }`}
          onClick={() => handleSubmissionMethodChange('online')}>
            <CardContent className="p-4 text-center">
              <Globe className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Online Form</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Complete and submit form online
              </p>
              {submissionMethod === 'online' && (
                <Button onClick={handleOnlineSubmission} disabled={loading} size="sm">
                  {loading ? 'Submitting...' : 'Submit Online'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* CSV Import Option */}
          <Card className={`cursor-pointer border-2 transition-colors ${
            submissionMethod === 'csv_import' 
              ? 'border-primary bg-primary/5' 
              : 'border-muted hover:border-primary/50'
          }`}
          onClick={() => handleSubmissionMethodChange('csv_import')}>
            <CardContent className="p-4 text-center">
              <Upload className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">CSV Import</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Bulk import from CSV file
              </p>
              {submissionMethod === 'csv_import' && (
                <Badge variant="default" className="bg-blue-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Use Import Tab
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* API Import Option */}
          <Card className={`cursor-pointer border-2 transition-colors ${
            submissionMethod === 'api_import' 
              ? 'border-primary bg-primary/5' 
              : 'border-muted hover:border-primary/50'
          }`}
          onClick={() => handleSubmissionMethodChange('api_import')}>
            <CardContent className="p-4 text-center">
              <FileText className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">API Import</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Import from external API
              </p>
              {submissionMethod === 'api_import' && (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Use Import Tab
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Fax Option */}
          <Card className={`cursor-pointer border-2 transition-colors ${
            submissionMethod === 'fax' 
              ? 'border-primary bg-primary/5' 
              : 'border-muted hover:border-primary/50'
          }`}
          onClick={() => handleSubmissionMethodChange('fax')}>
            <CardContent className="p-4 text-center">
              <FileX className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Download & Fax</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Download form and fax back
              </p>
              {submissionMethod === 'fax' && (
                <div className="space-y-2">
                  <Button onClick={handleDownloadForm} disabled={loading} size="sm">
                    {loading ? 'Generating...' : 'Download Form'}
                  </Button>
                  <Button onClick={handleFaxSubmission} disabled={loading} size="sm" variant="outline">
                    Setup Fax Reception
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );

  const renderFormFields = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {MODULE_ICONS[moduleType]}
          {moduleType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {formFields.map((field) => (
            <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
              <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {field.type === 'select' ? (
                <select
                  id={field.name}
                  value={formData[field.name] || ''}
                  onChange={(e) => updateFormData(field.name, e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required={field.required}
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <Textarea
                  id={field.name}
                  value={formData[field.name] || ''}
                  onChange={(e) => updateFormData(field.name, e.target.value)}
                  required={field.required}
                />
              ) : (
                <Input
                  id={field.name}
                  type={field.type}
                  value={formData[field.name] || ''}
                  onChange={(e) => updateFormData(field.name, e.target.value)}
                  required={field.required}
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {MODULE_ICONS[moduleType]}
            {moduleType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Enrollment
          </h2>
          <p className="text-muted-foreground">
            {instanceId ? 'Edit existing' : 'Create new'} {moduleType.replace('_', ' ')} enrollment
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Enrollment Progress</span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Form Fields */}
      {renderFormFields()}

      {/* Submission Options */}
      {renderSubmissionOptions()}

      {/* Document Storage Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Storage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm mb-2">
              <strong>Storage Path:</strong> /{moduleType}-enrollment/{submissionMethod}/
            </p>
            <p className="text-sm text-muted-foreground">
              Documents will be automatically organized by submission method and module type 
              for easy identification and retrieval.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};