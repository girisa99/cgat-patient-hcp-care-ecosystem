/**
 * SECURE CREDIT APPLICATION FORM
 * Enhanced with encryption, audit logging, and comprehensive security
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Lock, 
  FileText, 
  Upload, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  CreditCard,
  Building,
  Users,
  Download
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCreditApplications, type CreditApplication } from '@/hooks/useCreditApplications';
import { SignatureCapture } from '@/components/signature/SignatureCapture';
import { MultiPartySignature, type Signer } from '@/components/signature/MultiPartySignature';
import { PDFGenerator } from '@/components/signature/PDFGenerator';

interface DocumentUpload {
  id?: string;
  document_type: string;
  document_name: string;
  file_size?: number;
  content_type?: string;
}

interface TermsAndConditions {
  id: string;
  terms_type: string;
  version: string;
  title: string;
  content: string;
  requires_signature: boolean;
}

const BUSINESS_TYPES = [
  'sole_proprietorship',
  'partnership', 
  'llc',
  'corporation',
  'non_profit',
  'other'
];

const PAYMENT_TERMS = [
  { value: 'net_30', label: 'Net 30 Days' },
  { value: 'net_60', label: 'Net 60 Days' },
  { value: 'net_90', label: 'Net 90 Days' },
  { value: 'cod', label: 'Cash on Delivery' },
  { value: 'prepaid', label: 'Prepaid' },
  { value: 'custom', label: 'Custom Terms' }
];

const DOCUMENT_TYPES = [
  { value: 'business_license', label: 'Business License' },
  { value: 'tax_return', label: 'Tax Return' },
  { value: 'bank_statement', label: 'Bank Statement' },
  { value: 'financial_statement', label: 'Financial Statement' },
  { value: 'articles_of_incorporation', label: 'Articles of Incorporation' },
  { value: 'w9_form', label: 'W-9 Form' },
  { value: 'insurance_certificate', label: 'Insurance Certificate' },
  { value: 'trade_reference_form', label: 'Trade Reference Form' },
  { value: 'other', label: 'Other' }
];

export const SecureCreditApplicationForm: React.FC = () => {
  const navigate = useNavigate();
  const [application, setApplication] = useState<CreditApplication>({
    business_type: '',
    primary_contact_name: '',
    terms_accepted: false,
    privacy_policy_accepted: false,
    credit_check_authorized: false
  });
  
  const [documents, setDocuments] = useState<DocumentUpload[]>([]);
  const [termsAndConditions, setTermsAndConditions] = useState<TermsAndConditions[]>([]);
  const [showSensitiveData, setShowSensitiveData] = useState<{[key: string]: boolean}>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentTab, setCurrentTab] = useState('basic');
  const [showTermsDialog, setShowTermsDialog] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [signers, setSigners] = useState<Signer[]>([]);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    loadTermsAndConditions();
    loadExistingApplication();
  }, []);

  const loadTermsAndConditions = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_application_terms')
        .select('*')
        .eq('is_active', true)
        .order('terms_type, version desc');

      if (error) throw error;
      setTermsAndConditions(data || []);
    } catch (error) {
      console.error('Error loading terms:', error);
      toast({
        title: "Error",
        description: "Failed to load terms and conditions",
        variant: "destructive"
      });
    }
  };

  const loadExistingApplication = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('credit_applications')
        .select('*')
        .eq('applicant_user_id', user.id)
        .eq('application_status', 'draft')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        // Convert JSONB fields to arrays for compatibility and cast types properly
        const convertedData: CreditApplication = {
          ...data,
          trade_references: Array.isArray(data.trade_references) ? data.trade_references : [],
          bank_references: Array.isArray(data.bank_references) ? data.bank_references : [],
          application_status: (data.application_status as CreditApplication['application_status']) || 'draft'
        };
        setApplication(convertedData);
        calculateProgress(convertedData);
      }
    } catch (error) {
      console.error('Error loading application:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (app: CreditApplication) => {
    const requiredFields = [
      'business_type',
      'primary_contact_name',
      'primary_contact_email',
      'requested_credit_limit',
      'payment_terms_requested'
    ];
    
    const completedFields = requiredFields.filter(field => app[field as keyof CreditApplication]);
    const progressPercentage = (completedFields.length / requiredFields.length) * 100;
    setProgress(progressPercentage);
  };

  const encryptSensitiveData = async (data: string, applicationId?: string): Promise<string> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const response = await supabase.functions.invoke('credit-encryption', {
        body: {
          action: 'encrypt',
          data: data,
          creditApplicationId: applicationId
        }
      });

      if (response.error) throw response.error;
      return response.data.result;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt sensitive data');
    }
  };

  const decryptSensitiveData = async (encryptedData: string, applicationId?: string): Promise<string> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const response = await supabase.functions.invoke('credit-encryption', {
        body: {
          action: 'decrypt',
          data: encryptedData,
          creditApplicationId: applicationId
        }
      });

      if (response.error) throw response.error;
      return response.data.result;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt sensitive data');
    }
  };

  const updateApplication = (field: keyof CreditApplication, value: any) => {
    const updated = { ...application, [field]: value };
    setApplication(updated);
    calculateProgress(updated);
  };

  const saveApplication = async (submit = false) => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Prepare application data
      const applicationData = { ...application };
      
      // Encrypt sensitive fields before saving
      if (applicationData.encrypted_ssn && typeof applicationData.encrypted_ssn === 'string' && !applicationData.encrypted_ssn.includes('encrypted:')) {
        applicationData.encrypted_ssn = await encryptSensitiveData(applicationData.encrypted_ssn);
      }
      
      if (applicationData.encrypted_federal_id && typeof applicationData.encrypted_federal_id === 'string' && !applicationData.encrypted_federal_id.includes('encrypted:')) {
        applicationData.encrypted_federal_id = await encryptSensitiveData(applicationData.encrypted_federal_id);
      }
      
      if (applicationData.encrypted_bank_account && typeof applicationData.encrypted_bank_account === 'string' && !applicationData.encrypted_bank_account.includes('encrypted:')) {
        applicationData.encrypted_bank_account = await encryptSensitiveData(applicationData.encrypted_bank_account);
      }

      // Set application status and timestamps
      applicationData.application_status = submit ? 'submitted' : 'draft';
      if (submit) {
        applicationData.submitted_at = new Date().toISOString();
        applicationData.terms_accepted_at = application.terms_accepted ? new Date().toISOString() : undefined;
        applicationData.privacy_policy_accepted_at = application.privacy_policy_accepted ? new Date().toISOString() : undefined;
        applicationData.credit_check_authorized_at = application.credit_check_authorized ? new Date().toISOString() : undefined;
      }

      let result;
      if (application.id) {
        // Update existing application
        const { data, error } = await supabase
          .from('credit_applications')
          .update(applicationData)
          .eq('id', application.id)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      } else {
        // Create new application
        const { data, error } = await supabase
          .from('credit_applications')
          .insert([{
            ...applicationData,
            applicant_user_id: user.id
          }])
          .select()
          .single();
        
        if (error) throw error;
        result = data;
        setApplication(result);
      }

      // Log audit event
      await supabase.rpc('log_credit_application_audit', {
        p_credit_application_id: result.id,
        p_action_type: submit ? 'submitted' : 'updated',
        p_additional_context: {
          ip_address: 'client_side',
          action_timestamp: new Date().toISOString()
        }
      });

      toast({
        title: "Success",
        description: submit ? "Application submitted successfully" : "Application saved successfully"
      });

      if (submit) {
        // Navigate back to main onboarding section where all tabs are visible
        navigate('/onboarding');
      }

    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save application",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = useCallback(async (acceptedFiles: File[], documentType: string) => {
    try {
      const file = acceptedFiles[0];
      if (!file) return;

      // Validate file
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('File size must be less than 10MB');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Upload to secure storage
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('credit-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Save document record
      const { data: docData, error: docError } = await supabase
        .from('credit_application_documents')
        .insert([{
          credit_application_id: application.id,
          document_type: documentType,
          document_name: file.name,
          file_size: file.size,
          content_type: file.type,
          storage_path: uploadData.path,
          uploaded_by: user.id
        }])
        .select()
        .single();

      if (docError) throw docError;

      setDocuments(prev => [...prev, docData]);

      // Log audit event
      if (application.id) {
        await supabase.rpc('log_credit_application_audit', {
          p_credit_application_id: application.id,
          p_action_type: 'document_uploaded',
          p_additional_context: {
            document_type: documentType,
            file_name: file.name,
            file_size: file.size
          }
        });
      }

      toast({
        title: "Success",
        description: `${file.name} uploaded successfully`
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload document",
        variant: "destructive"
      });
    }
  }, [application.id]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => handleFileUpload(files, 'other'),
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  const toggleSensitiveDataVisibility = (field: string) => {
    setShowSensitiveData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmitForSigning = async (signersData: Signer[]) => {
    try {
      if (!application.id) {
        toast({
          title: "Error",
          description: "Please save the application first",
          variant: "destructive"
        });
        return;
      }

      const response = await supabase.functions.invoke('docusign-integration', {
        body: {
          action: 'send_envelope',
          data: {
            applicationId: application.id,
            signers: signersData,
            documents: [{
              name: `Credit Application - ${application.id}`,
              content: await generatePDFBase64()
            }]
          }
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "Success",
        description: "Signature requests sent successfully"
      });

      // Save application to ensure we have an ID
      await saveApplication();

    } catch (error) {
      console.error('Signature workflow error:', error);
      toast({
        title: "Error",
        description: "Failed to send signature requests",
        variant: "destructive"
      });
    }
  };

  const generatePDFBase64 = async (): Promise<string> => {
    try {
      const response = await supabase.functions.invoke('docusign-integration', {
        body: {
          action: 'generate_pdf',
          data: {
            applicationId: application.id,
            includeSignatures: false
          }
        }
      });

      if (response.error) throw response.error;
      
      // Convert PDF URL to base64 for DocuSign
      const pdfResponse = await fetch(response.data.pdf_url);
      const pdfBlob = await pdfResponse.blob();
      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(pdfBlob);
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
    }
  };

  const handleGeneratePDF = async (): Promise<string> => {
    try {
      setPdfGenerating(true);
      
      const response = await supabase.functions.invoke('docusign-integration', {
        body: {
          action: 'generate_pdf',
          data: {
            applicationId: application.id,
            includeSignatures: true
          }
        }
      });

      if (response.error) throw response.error;
      
      setPdfUrl(response.data.pdf_url);
      return response.data.pdf_url;
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
    } finally {
      setPdfGenerating(false);
    }
  };

  const renderBasicInformation = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
        <Building className="h-5 w-5 text-blue-600" />
        <span className="font-medium text-blue-900">Business Information</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="business_type">Business Type *</Label>
          <Select value={application.business_type} onValueChange={(value) => updateApplication('business_type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select business type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
              <SelectItem value="partnership">Partnership</SelectItem>
              <SelectItem value="llc">LLC</SelectItem>
              <SelectItem value="corporation">Corporation</SelectItem>
              <SelectItem value="non_profit">Non-Profit</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="years_in_business">Years in Business</Label>
          <Input
            id="years_in_business"
            type="number"
            value={application.years_in_business || ''}
            onChange={(e) => updateApplication('years_in_business', parseInt(e.target.value) || 0)}
            min="0"
            max="100"
          />
        </div>

        <div>
          <Label htmlFor="number_of_employees">Number of Employees</Label>
          <Input
            id="number_of_employees"
            type="number"
            value={application.number_of_employees || ''}
            onChange={(e) => updateApplication('number_of_employees', parseInt(e.target.value) || 0)}
            min="0"
          />
        </div>

        <div>
          <Label htmlFor="annual_revenue_range">Annual Revenue Range</Label>
          <Select value={application.annual_revenue_range || ''} onValueChange={(value) => updateApplication('annual_revenue_range', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select revenue range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="under_100k">Under $100,000</SelectItem>
              <SelectItem value="100k_500k">$100,000 - $500,000</SelectItem>
              <SelectItem value="500k_1m">$500,000 - $1,000,000</SelectItem>
              <SelectItem value="1m_5m">$1,000,000 - $5,000,000</SelectItem>
              <SelectItem value="5m_plus">Over $5,000,000</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="business_description">Business Description</Label>
        <Textarea
          id="business_description"
          value={application.business_description || ''}
          onChange={(e) => updateApplication('business_description', e.target.value)}
          placeholder="Describe your business activities and services"
          rows={3}
        />
      </div>
    </div>
  );

  const renderContactInformation = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 p-4 bg-green-50 rounded-lg">
        <Users className="h-5 w-5 text-green-600" />
        <span className="font-medium text-green-900">Primary Contact Information</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="primary_contact_name">Contact Name *</Label>
          <Input
            id="primary_contact_name"
            value={application.primary_contact_name}
            onChange={(e) => updateApplication('primary_contact_name', e.target.value)}
            placeholder="Full name"
            required
          />
        </div>

        <div>
          <Label htmlFor="primary_contact_title">Title</Label>
          <Input
            id="primary_contact_title"
            value={application.primary_contact_title || ''}
            onChange={(e) => updateApplication('primary_contact_title', e.target.value)}
            placeholder="Job title"
          />
        </div>

        <div>
          <Label htmlFor="primary_contact_email">Email *</Label>
          <Input
            id="primary_contact_email"
            type="email"
            value={application.primary_contact_email || ''}
            onChange={(e) => updateApplication('primary_contact_email', e.target.value)}
            placeholder="email@company.com"
            required
          />
        </div>

        <div>
          <Label htmlFor="primary_contact_phone">Phone</Label>
          <Input
            id="primary_contact_phone"
            type="tel"
            value={application.primary_contact_phone || ''}
            onChange={(e) => updateApplication('primary_contact_phone', e.target.value)}
            placeholder="(555) 123-4567"
          />
        </div>
      </div>
    </div>
  );

  const renderSensitiveInformation = () => (
    <div className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Sensitive Information:</strong> All data in this section is encrypted and securely stored. 
          Access is logged for audit purposes.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Label htmlFor="encrypted_ssn">Social Security Number (SSN)</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => toggleSensitiveDataVisibility('ssn')}
            >
              {showSensitiveData.ssn ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Lock className="h-4 w-4 text-green-600" />
          </div>
          <Input
            id="encrypted_ssn"
            type={showSensitiveData.ssn ? "text" : "password"}
            value={application.encrypted_ssn || ''}
            onChange={(e) => updateApplication('encrypted_ssn', e.target.value)}
            placeholder="XXX-XX-XXXX"
            maxLength={11}
          />
        </div>

        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Label htmlFor="encrypted_federal_id">Federal Tax ID (EIN)</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => toggleSensitiveDataVisibility('federal_id')}
            >
              {showSensitiveData.federal_id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Lock className="h-4 w-4 text-green-600" />
          </div>
          <Input
            id="encrypted_federal_id"
            type={showSensitiveData.federal_id ? "text" : "password"}
            value={application.encrypted_federal_id || ''}
            onChange={(e) => updateApplication('encrypted_federal_id', e.target.value)}
            placeholder="XX-XXXXXXX"
            maxLength={10}
          />
        </div>

        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Label htmlFor="encrypted_bank_account">Bank Account Information</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => toggleSensitiveDataVisibility('bank_account')}
            >
              {showSensitiveData.bank_account ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Lock className="h-4 w-4 text-green-600" />
          </div>
          <Input
            id="encrypted_bank_account"
            type={showSensitiveData.bank_account ? "text" : "password"}
            value={application.encrypted_bank_account || ''}
            onChange={(e) => updateApplication('encrypted_bank_account', e.target.value)}
            placeholder="Bank name and account details"
          />
        </div>
      </div>
    </div>
  );

  const renderCreditTerms = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 p-4 bg-purple-50 rounded-lg">
        <CreditCard className="h-5 w-5 text-purple-600" />
        <span className="font-medium text-purple-900">Credit Terms & References</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="requested_credit_limit">Requested Credit Limit ($) *</Label>
          <Input
            id="requested_credit_limit"
            type="number"
            value={application.requested_credit_limit || ''}
            onChange={(e) => updateApplication('requested_credit_limit', parseFloat(e.target.value) || 0)}
            min="0"
            placeholder="100000"
            required
          />
        </div>

        <div>
          <Label htmlFor="payment_terms_requested">Requested Payment Terms *</Label>
          <Select value={application.payment_terms_requested || ''} onValueChange={(value) => updateApplication('payment_terms_requested', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select payment terms" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_TERMS.map(term => (
                <SelectItem key={term.value} value={term.value}>
                  {term.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Trade References Section */}
      <div className="space-y-4">
        <h4 className="font-medium">Trade References</h4>
        <p className="text-sm text-gray-600">
          Provide at least 3 trade references for credit verification.
        </p>
        {/* Add trade reference form components here */}
      </div>
    </div>
  );

  const renderDocumentUpload = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 p-4 bg-orange-50 rounded-lg">
        <FileText className="h-5 w-5 text-orange-600" />
        <span className="font-medium text-orange-900">Document Upload</span>
      </div>

      <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        {isDragActive ? (
          <p className="text-blue-600">Drop the document here...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">Drag and drop a document here, or click to select</p>
            <p className="text-sm text-gray-500">PDF, DOC, DOCX, JPG, PNG (max 10MB)</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DOCUMENT_TYPES.map(docType => (
          <Card key={docType.value} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">{docType.label}</span>
              <Badge variant="outline">
                {documents.filter(d => d.document_type === docType.value).length}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
                input.onchange = (e) => {
                  const files = (e.target as HTMLInputElement).files;
                  if (files) handleFileUpload(Array.from(files), docType.value);
                };
                input.click();
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </Card>
        ))}
      </div>

      {documents.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Uploaded Documents</h4>
          {documents.map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <span className="font-medium">{doc.document_name}</span>
                <Badge variant="secondary" className="ml-2">
                  {DOCUMENT_TYPES.find(t => t.value === doc.document_type)?.label}
                </Badge>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTermsAndConditions = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 p-4 bg-red-50 rounded-lg">
        <AlertTriangle className="h-5 w-5 text-red-600" />
        <span className="font-medium text-red-900">Terms & Conditions</span>
      </div>

      {termsAndConditions.map(terms => (
        <div key={terms.id} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">{terms.title}</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTermsDialog(terms.id)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Read Full Text
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`terms_${terms.terms_type}`}
              checked={
                terms.terms_type === 'credit_terms' ? application.terms_accepted :
                terms.terms_type === 'privacy_policy' ? application.privacy_policy_accepted :
                false
              }
              onCheckedChange={(checked) => {
                if (terms.terms_type === 'credit_terms') {
                  updateApplication('terms_accepted', checked);
                } else if (terms.terms_type === 'privacy_policy') {
                  updateApplication('privacy_policy_accepted', checked);
                }
              }}
            />
            <Label htmlFor={`terms_${terms.terms_type}`} className="text-sm">
              I have read and agree to the {terms.title}
            </Label>
          </div>
        </div>
      ))}

      <div className="border rounded-lg p-4 bg-yellow-50">
        <div className="flex items-center space-x-2 mb-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <h4 className="font-medium">Credit Check Authorization</h4>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="credit_check_authorized"
            checked={application.credit_check_authorized}
            onCheckedChange={(checked) => updateApplication('credit_check_authorized', checked)}
          />
          <Label htmlFor="credit_check_authorized" className="text-sm">
            I authorize a credit check to be performed for this application. This may include obtaining 
            my credit report and contacting my references.
          </Label>
        </div>
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="space-y-6">
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Please review your application before final submission. Once submitted, you will not be able to modify most information.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Application Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Business Type:</span>
              <span className="font-medium">{application.business_type}</span>
            </div>
            <div className="flex justify-between">
              <span>Credit Limit:</span>
              <span className="font-medium">${application.requested_credit_limit?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Terms:</span>
              <span className="font-medium">{PAYMENT_TERMS.find(t => t.value === application.payment_terms_requested)?.label}</span>
            </div>
            <div className="flex justify-between">
              <span>Documents:</span>
              <span className="font-medium">{documents.length} uploaded</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Compliance Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center space-x-2">
              {application.terms_accepted ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-red-600" />}
              <span>Terms & Conditions</span>
            </div>
            <div className="flex items-center space-x-2">
              {application.privacy_policy_accepted ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-red-600" />}
              <span>Privacy Policy</span>
            </div>
            <div className="flex items-center space-x-2">
              {application.credit_check_authorized ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-red-600" />}
              <span>Credit Check Authorization</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const canSubmit = () => {
    return application.business_type &&
           application.primary_contact_name &&
           application.primary_contact_email &&
           application.requested_credit_limit &&
           application.payment_terms_requested &&
           application.terms_accepted &&
           application.privacy_policy_accepted &&
           application.credit_check_authorized;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3">Loading application...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Secure Credit Application</h1>
        <p className="text-gray-600">Complete your credit application with enterprise-grade security</p>
        
        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto">
          <div className="flex justify-between text-xs mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </div>

      {/* Main Form */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-8 overflow-x-auto whitespace-nowrap">
              <TabsTrigger value="basic" className="text-xs sm:text-sm">Basic</TabsTrigger>
              <TabsTrigger value="contact" className="text-xs sm:text-sm">Contact</TabsTrigger>
              <TabsTrigger value="sensitive" className="text-xs sm:text-sm">Sensitive</TabsTrigger>
              <TabsTrigger value="credit" className="text-xs sm:text-sm">Credit</TabsTrigger>
              <TabsTrigger value="documents" className="text-xs sm:text-sm">Docs</TabsTrigger>
              <TabsTrigger value="terms" className="text-xs sm:text-sm">Terms</TabsTrigger>
              <TabsTrigger value="signatures" className="text-xs sm:text-sm">Sign</TabsTrigger>
              <TabsTrigger value="review" className="text-xs sm:text-sm">Review</TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="basic" className="mt-0">
                {renderBasicInformation()}
              </TabsContent>

              <TabsContent value="contact" className="mt-0">
                {renderContactInformation()}
              </TabsContent>

              <TabsContent value="sensitive" className="mt-0">
                {renderSensitiveInformation()}
              </TabsContent>

              <TabsContent value="credit" className="mt-0">
                {renderCreditTerms()}
              </TabsContent>

              <TabsContent value="documents" className="mt-0">
                {renderDocumentUpload()}
              </TabsContent>

              <TabsContent value="terms" className="mt-0">
                {renderTermsAndConditions()}
              </TabsContent>

              <TabsContent value="signatures" className="mt-0">
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 p-4 bg-indigo-50 rounded-lg">
                    <Users className="h-5 w-5 text-indigo-600" />
                    <span className="font-medium text-indigo-900">Digital Signatures</span>
                  </div>

                  {/* Individual Signature Capture */}
                  <SignatureCapture
                    title="Primary Authorization Signature"
                    description="Please provide your signature to authorize this credit application"
                    required={true}
                    onSignatureChange={(data) => {
                      // Handle primary signature
                      console.log('Primary signature:', data);
                    }}
                  />

                  {/* Multi-Party Signature Management */}
                  <MultiPartySignature
                    applicationId={application.id}
                    signers={signers}
                    onSignersChange={setSigners}
                    currentUserEmail={application.primary_contact_email}
                    onSubmitForSigning={handleSubmitForSigning}
                    readOnly={false}
                  />

                  {/* PDF Generation */}
                  <PDFGenerator
                    applicationData={application}
                    signatures={signers}
                    onGeneratePDF={handleGeneratePDF}
                    loading={pdfGenerating}
                  />
                </div>
              </TabsContent>

              <TabsContent value="review" className="mt-0">
                {renderReview()}
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => saveApplication(false)}
          disabled={saving}
        >
          {saving ? <Clock className="h-4 w-4 mr-2 animate-spin" /> : null}
          Save Draft
        </Button>

        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              const currentIndex = ['basic', 'contact', 'sensitive', 'credit', 'documents', 'terms', 'review'].indexOf(currentTab);
              if (currentIndex > 0) {
                setCurrentTab(['basic', 'contact', 'sensitive', 'credit', 'documents', 'terms', 'review'][currentIndex - 1]);
              }
            }}
          >
            Previous
          </Button>

          {currentTab !== 'review' ? (
            <Button
              onClick={() => {
                const currentIndex = ['basic', 'contact', 'sensitive', 'credit', 'documents', 'terms', 'review'].indexOf(currentTab);
                if (currentIndex < 6) {
                  setCurrentTab(['basic', 'contact', 'sensitive', 'credit', 'documents', 'terms', 'review'][currentIndex + 1]);
                }
              }}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={() => saveApplication(true)}
              disabled={!canSubmit() || saving}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving ? <Clock className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              Submit Application
            </Button>
          )}
        </div>
      </div>

      {/* Terms Dialog */}
      <Dialog open={!!showTermsDialog} onOpenChange={() => setShowTermsDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {termsAndConditions.find(t => t.id === showTermsDialog)?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-sm">
              {termsAndConditions.find(t => t.id === showTermsDialog)?.content}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};