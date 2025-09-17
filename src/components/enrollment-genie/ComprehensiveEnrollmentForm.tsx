/**
 * COMPREHENSIVE ENROLLMENT FORM
 * Sequential form following the exact online form design:
 * 1. Consent
 * 2. Patient Information  
 * 3. Provider and Treatment (with NPI verification, credentialing)
 * 4. Insurance Information
 * 5. Clinical and Treatment
 * 6. Submit (with signature capture and PDF generation)
 */
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, Clock, AlertCircle, ArrowRight, ArrowLeft, FileText, Shield, Users, Stethoscope, CreditCard, Signature, Download, Eye, Settings, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import SignatureCanvas from 'react-signature-canvas';

interface ComprehensiveEnrollmentFormProps {
  sessionId?: string;
  userId?: string;
  tenantId?: string;
  onSectionComplete?: (sectionId: string, data: any) => void;
  onFormComplete?: (formData: any) => void;
}

interface EnrollmentSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  hasSubTabs?: boolean;
  subTabs?: string[];
}

const enrollmentSections: EnrollmentSection[] = [
  {
    id: 'consent',
    title: 'Consent',
    description: 'Consent forms and authorizations',
    icon: <FileText className="h-5 w-5" />,
    status: 'pending'
  },
  {
    id: 'patient',
    title: 'Patient Information',
    description: 'Personal and demographic details',
    icon: <Users className="h-5 w-5" />,
    status: 'pending'
  },
  {
    id: 'provider',
    title: 'Provider & Treatment',
    description: 'Provider details with NPI verification',
    icon: <Stethoscope className="h-5 w-5" />,
    status: 'pending',
    hasSubTabs: true,
    subTabs: ['provider_info', 'npi_verification', 'credentialing']
  },
  {
    id: 'insurance',
    title: 'Insurance Information',
    description: 'Coverage and payment details',
    icon: <Shield className="h-5 w-5" />,
    status: 'pending'
  },
  {
    id: 'clinical',
    title: 'Clinical & Treatment',
    description: 'Medical history and treatment plan',
    icon: <CreditCard className="h-5 w-5" />,
    status: 'pending',
    hasSubTabs: true,
    subTabs: ['clinical_info', 'treatment_plan']
  },
  {
    id: 'submit',
    title: 'Review & Submit',
    description: 'Signature capture and final submission',
    icon: <Signature className="h-5 w-5" />,
    status: 'pending'
  }
];

export const ComprehensiveEnrollmentForm: React.FC<ComprehensiveEnrollmentFormProps> = ({
  sessionId = `enrollment_${Date.now()}`,
  userId,
  tenantId,
  onSectionComplete,
  onFormComplete
}) => {
  const [sections, setSections] = useState<EnrollmentSection[]>(enrollmentSections);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [currentSubTab, setCurrentSubTab] = useState<string>('');
  const [enrollmentId, setEnrollmentId] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [prepopulatedData, setPrepopulatedData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [npiVerificationStatus, setNpiVerificationStatus] = useState<'pending' | 'verified' | 'failed'>('pending');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const signatureRef = useRef<SignatureCanvas>(null);
  const [realtimeUsers, setRealtimeUsers] = useState<any[]>([]);

  console.log('🏥 ComprehensiveEnrollmentForm initialized', { sessionId, userId, tenantId });

  // Initialize enrollment and prepopulate data
  useEffect(() => {
    initializeEnrollment();
    loadPrepopulatedData();
    setupRealtimeChannels();
  }, [sessionId, userId]);

  const initializeEnrollment = async () => {
    console.log('🚀 Initializing enrollment session');
    try {
      const { data, error } = await supabase
        .from('patient_enrollments')
        .insert({
          session_id: sessionId,
          user_id: userId || null,
          tenant_id: tenantId,
          current_section: 'consent',
          progress_percentage: 0
        })
        .select()
        .single();

      if (error) throw error;
      setEnrollmentId(data.id);
      console.log('✅ Enrollment session created:', data);
    } catch (error) {
      console.error('❌ Failed to initialize enrollment:', error);
      toast.error('Failed to initialize enrollment session');
    }
  };

  const loadPrepopulatedData = async () => {
    if (!userId) return;
    
    console.log('📥 Loading prepopulated data for user:', userId);
    try {
      const { data, error } = await supabase.rpc('get_prepopulate_data', {
        user_uuid: userId
      });

      if (error) throw error;
      
      if (data) {
        setPrepopulatedData(data);
        // Pre-fill form with existing data
        const patientInfo = (data as any)?.patient_info || {};
        const insuranceInfo = (data as any)?.insurance_info || {};
        
        setFormData(prev => ({
          ...prev,
          ...patientInfo,
          ...insuranceInfo
        }));
        
        console.log('✅ Prepopulated data loaded:', data);
        toast.success('Previous enrollment data loaded');
      }
    } catch (error) {
      console.error('❌ Failed to load prepopulated data:', error);
    }
  };

  const setupRealtimeChannels = () => {
    console.log('📡 Setting up real-time channels');
    
    // Progress updates channel
    const progressChannel = supabase
      .channel(`enrollment_progress_${sessionId}`)
      .on('broadcast', { event: 'section_progress' }, (payload) => {
        console.log('📨 Received section progress:', payload);
        handleRealtimeProgressUpdate(payload.payload);
      })
      .on('broadcast', { event: 'form_data_update' }, (payload) => {
        console.log('📝 Received form data update:', payload);
        handleRealtimeFormUpdate(payload.payload);
      })
      .subscribe();

    // User presence channel
    const presenceChannel = supabase
      .channel(`enrollment_presence_${sessionId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        setRealtimeUsers(Object.values(state).flat());
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        toast.success(`${newPresences[0]?.user_name || 'User'} joined enrollment`);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: userId || 'anonymous',
            user_name: userId || 'Anonymous User',
            current_section: sections[currentSectionIdx]?.id,
            joined_at: new Date().toISOString()
          });
        }
      });

    return () => {
      supabase.removeChannel(progressChannel);
      supabase.removeChannel(presenceChannel);
    };
  };

  const handleRealtimeProgressUpdate = (payload: any) => {
    setSections(prev => 
      prev.map(section => 
        section.id === payload.sectionId 
          ? { ...section, status: payload.status }
          : section
      )
    );
  };

  const handleRealtimeFormUpdate = (payload: any) => {
    setFormData(prev => ({
      ...prev,
      [payload.fieldId]: payload.value
    }));
  };

  const broadcastProgress = async (sectionId: string, status: string) => {
    const channel = supabase.channel(`enrollment_progress_${sessionId}`);
    await channel.send({
      type: 'broadcast',
      event: 'section_progress',
      payload: { sectionId, status, userId, timestamp: new Date().toISOString() }
    });
  };

  const broadcastFormUpdate = async (fieldId: string, value: any) => {
    const channel = supabase.channel(`enrollment_progress_${sessionId}`);
    await channel.send({
      type: 'broadcast',
      event: 'form_data_update',
      payload: { fieldId, value, userId, timestamp: new Date().toISOString() }
    });
  };

  const handleFieldChange = async (fieldId: string, value: any) => {
    // Handle date values properly to prevent toISOString errors
    let processedValue = value;
    
    if (fieldId.includes('date') || fieldId.includes('_date') || fieldId.includes('dob')) {
      if (value && typeof value === 'string') {
        // If it's already a string, validate it's a proper date
        const dateTest = new Date(value);
        processedValue = !isNaN(dateTest.getTime()) ? value : null;
      } else if (value instanceof Date) {
        // If it's a Date object, convert to ISO string safely
        processedValue = !isNaN(value.getTime()) ? value.toISOString() : null;
      } else if (value === undefined || value === '') {
        processedValue = null;
      }
    }
    
    setFormData(prev => ({ ...prev, [fieldId]: processedValue }));
    await broadcastFormUpdate(fieldId, processedValue);
  };

  const verifyNPI = async (npiNumber: string) => {
    setNpiVerificationStatus('pending');
    console.log('🔍 Verifying NPI:', npiNumber);
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-npi', {
        body: { npi: npiNumber }
      });

      if (error) throw error;
      
      if (data.verified) {
        setNpiVerificationStatus('verified');
        toast.success('NPI verified successfully');
        return data;
      } else {
        setNpiVerificationStatus('failed');
        toast.error('NPI verification failed');
        return null;
      }
    } catch (error) {
      console.error('❌ NPI verification failed:', error);
      setNpiVerificationStatus('failed');
      toast.error('NPI verification service unavailable');
      return null;
    }
  };

  const saveCurrentSection = async () => {
    const currentSection = sections[currentSectionIdx];
    console.log('💾 Saving section:', currentSection.id);
    
    try {
      setIsSubmitting(true);
      
      switch (currentSection.id) {
        case 'consent':
          await supabase.from('enrollment_consent').upsert({
            enrollment_id: enrollmentId,
            consent_to_treatment: formData.consent_to_treatment || false,
            hipaa_authorization: formData.hipaa_authorization || false,
            financial_responsibility: formData.financial_responsibility || false,
            communication_consent: formData.communication_consent || false,
            telehealth_consent: formData.telehealth_consent || false,
            marketing_consent: formData.marketing_consent || false,
            consent_date: new Date().toISOString(),
            patient_signature: formData.patient_signature || ''
          });
          break;
          
        case 'patient':
          await supabase.from('enrollment_patient_info').upsert({
            enrollment_id: enrollmentId,
            first_name: formData.first_name || '',
            last_name: formData.last_name || '',
            middle_name: formData.middle_name || '',
            date_of_birth: formData.date_of_birth || null,
            ssn: formData.ssn || '',
            gender: formData.gender || '',
            phone: formData.phone || '',
            email: formData.email || '',
            address_line1: formData.address_line1 || '',
            address_line2: formData.address_line2 || '',
            city: formData.city || '',
            state: formData.state || '',
            zip_code: formData.zip_code || '',
            emergency_contact_name: formData.emergency_contact_name || '',
            emergency_contact_phone: formData.emergency_contact_phone || '',
            emergency_contact_relationship: formData.emergency_contact_relationship || '',
            preferred_language: formData.preferred_language || 'English',
            marital_status: formData.marital_status || '',
            occupation: formData.occupation || '',
            employer: formData.employer || ''
          });
          break;
          
        case 'provider':
          // Ensure date fields are properly handled for provider section
          const processedProviderData = { ...formData };
          if (processedProviderData.treatment_start_date) {
            const startDate = new Date(processedProviderData.treatment_start_date);
            processedProviderData.treatment_start_date = !isNaN(startDate.getTime()) 
              ? startDate.toISOString() 
              : null;
          }
          
          await supabase.from('enrollment_provider_info').upsert({
            enrollment_id: enrollmentId,
            referring_provider_name: processedProviderData.referring_provider_name || '',
            referring_provider_npi: processedProviderData.referring_provider_npi || '',
            referring_provider_phone: processedProviderData.referring_provider_phone || '',
            primary_care_physician: processedProviderData.primary_care_physician || '',
            pcp_npi: processedProviderData.pcp_npi || '',
            pcp_phone: processedProviderData.pcp_phone || '',
            treatment_facility: processedProviderData.treatment_facility || '',
            facility_npi: processedProviderData.facility_npi || '',
            facility_address: processedProviderData.facility_address || '',
            treatment_type: processedProviderData.treatment_type || '',
            treatment_start_date: processedProviderData.treatment_start_date || null,
            diagnosis_codes: processedProviderData.diagnosis_codes || [],
            treatment_plan: processedProviderData.treatment_plan || {},
            npi_verification_status: npiVerificationStatus,
            credentialing_status: processedProviderData.credentialing_status || 'pending',
            credentialing_notes: processedProviderData.credentialing_notes || ''
          });
          break;
          
        case 'insurance':
          await supabase.from('enrollment_insurance_info').upsert({
            enrollment_id: enrollmentId,
            primary_insurance_name: formData.primary_insurance_name || '',
            primary_policy_number: formData.primary_policy_number || '',
            primary_group_number: formData.primary_group_number || '',
            primary_subscriber_name: formData.primary_subscriber_name || '',
            primary_subscriber_dob: formData.primary_subscriber_dob || null,
            primary_subscriber_relationship: formData.primary_subscriber_relationship || '',
            primary_effective_date: formData.primary_effective_date || null,
            secondary_insurance_name: formData.secondary_insurance_name || '',
            secondary_policy_number: formData.secondary_policy_number || '',
            secondary_group_number: formData.secondary_group_number || '',
            secondary_subscriber_name: formData.secondary_subscriber_name || '',
            secondary_subscriber_dob: formData.secondary_subscriber_dob || null,
            secondary_subscriber_relationship: formData.secondary_subscriber_relationship || '',
            secondary_effective_date: formData.secondary_effective_date || null,
            insurance_verification_status: 'pending',
            copay_amount: parseFloat(formData.copay_amount) || 0,
            deductible_amount: parseFloat(formData.deductible_amount) || 0,
            out_of_pocket_max: parseFloat(formData.out_of_pocket_max) || 0,
            prior_authorization_required: formData.prior_authorization_required || false,
            prior_auth_number: formData.prior_auth_number || ''
          });
          break;
          
        case 'clinical':
          await supabase.from('enrollment_clinical_info').upsert({
            enrollment_id: enrollmentId,
            chief_complaint: formData.chief_complaint || '',
            current_medications: formData.current_medications || [],
            medical_history: formData.medical_history || [],
            surgical_history: formData.surgical_history || [],
            family_history: formData.family_history || [],
            social_history: formData.social_history || {},
            allergies: formData.allergies || [],
            vital_signs: formData.vital_signs || {},
            lab_results: formData.lab_results || [],
            imaging_results: formData.imaging_results || [],
            risk_factors: formData.risk_factors || [],
            treatment_goals: formData.treatment_goals || [],
            clinical_notes: formData.clinical_notes || ''
          });
          
          await supabase.from('enrollment_treatment_plan').upsert({
            enrollment_id: enrollmentId,
            treatment_modality: formData.treatment_modality || '',
            frequency: formData.frequency || '',
            duration: formData.duration || '',
            location: formData.location || '',
            provider_assignments: formData.provider_assignments || [],
            therapy_goals: formData.therapy_goals || [],
            medication_management: formData.medication_management || {},
            monitoring_plan: formData.monitoring_plan || {},
            discharge_criteria: formData.discharge_criteria || [],
            estimated_cost: parseFloat(formData.estimated_cost) || 0,
            authorization_status: 'pending',
            treatment_schedule: formData.treatment_schedule || {}
          });
          break;
      }
      
      // Update main enrollment record
      const progress = Math.round(((currentSectionIdx + 1) / sections.length) * 100);
      await supabase.from('patient_enrollments').update({
        current_section: currentSection.id,
        progress_percentage: progress,
        updated_at: new Date().toISOString()
      }).eq('id', enrollmentId);
      
      // Update section status
      setSections(prev => 
        prev.map((section, idx) => 
          idx === currentSectionIdx 
            ? { ...section, status: 'completed' }
            : section
        )
      );
      
      await broadcastProgress(currentSection.id, 'completed');
      onSectionComplete?.(currentSection.id, formData);
      
      toast.success(`${currentSection.title} saved successfully`);
      
    } catch (error) {
      console.error('❌ Failed to save section:', error);
      toast.error('Failed to save section data');
      setSections(prev => 
        prev.map((section, idx) => 
          idx === currentSectionIdx 
            ? { ...section, status: 'error' }
            : section
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextSection = async () => {
    await saveCurrentSection();
    
    if (currentSectionIdx < sections.length - 1) {
      const nextIdx = currentSectionIdx + 1;
      setCurrentSectionIdx(nextIdx);
      setSections(prev => 
        prev.map((section, idx) => 
          idx === nextIdx 
            ? { ...section, status: 'in_progress' }
            : section
        )
      );
      setCurrentSubTab(''); // Reset sub tab
    }
  };

  const handlePrevSection = () => {
    if (currentSectionIdx > 0) {
      setCurrentSectionIdx(currentSectionIdx - 1);
      setCurrentSubTab(''); // Reset sub tab
    }
  };

  const handleFinalSubmission = async () => {
    console.log('🎯 Starting final submission');
    setIsSubmitting(true);
    
    try {
      // Save signature
      const signatureData = signatureRef.current?.toDataURL();
      if (signatureData) {
        await supabase.from('patient_enrollments').update({
          signature_data: { signature: signatureData },
          signed_at: new Date().toISOString(),
          enrollment_status: 'completed',
          completed_at: new Date().toISOString()
        }).eq('id', enrollmentId);
      }
      
      // Generate PDF
      const { data: pdfData, error: pdfError } = await supabase.functions.invoke('generate-enrollment-pdf', {
        body: { enrollmentId }
      });
      
      if (pdfError) throw pdfError;
      
      // Update PDF status
      await supabase.from('patient_enrollments').update({
        pdf_generated: true,
        pdf_file_path: pdfData.pdfPath
      }).eq('id', enrollmentId);
      
      toast.success('🎉 Enrollment completed successfully!');
      onFormComplete?.(formData);
      
    } catch (error) {
      console.error('❌ Final submission failed:', error);
      toast.error('Failed to complete enrollment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateProgress = () => {
    const completedSections = sections.filter(s => s.status === 'completed').length;
    return (completedSections / sections.length) * 100;
  };

  const currentSection = sections[currentSectionIdx];
  const progress = calculateProgress();

  const renderConsentSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {[
          { id: 'consent_to_treatment', label: 'Consent to Treatment', required: true },
          { id: 'hipaa_authorization', label: 'HIPAA Authorization', required: true },
          { id: 'financial_responsibility', label: 'Financial Responsibility Agreement', required: true },
          { id: 'communication_consent', label: 'Communication Consent', required: false },
          { id: 'telehealth_consent', label: 'Telehealth Services Consent', required: false },
          { id: 'marketing_consent', label: 'Marketing Communications', required: false }
        ].map((consent) => (
          <div key={consent.id} className="flex items-center space-x-2 p-4 border rounded-lg">
            <Checkbox
              id={consent.id}
              checked={formData[consent.id] || false}
              onCheckedChange={(checked) => handleFieldChange(consent.id, checked)}
            />
            <Label htmlFor={consent.id} className="text-sm font-medium">
              {consent.label}
              {consent.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPatientSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            value={formData.first_name || ''}
            onChange={(e) => handleFieldChange('first_name', e.target.value)}
            className="bg-white/80"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name *</Label>
          <Input
            id="last_name"
            value={formData.last_name || ''}
            onChange={(e) => handleFieldChange('last_name', e.target.value)}
            className="bg-white/80"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="middle_name">Middle Name</Label>
          <Input
            id="middle_name"
            value={formData.middle_name || ''}
            onChange={(e) => handleFieldChange('middle_name', e.target.value)}
            className="bg-white/80"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date_of_birth">Date of Birth *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-white/80",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  // Safely handle date conversion to prevent toISOString errors
                  if (date && !isNaN(date.getTime())) {
                    handleFieldChange('date_of_birth', date.toISOString().split('T')[0]);
                  } else {
                    handleFieldChange('date_of_birth', null);
                  }
                }}
                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender *</Label>
          <Select onValueChange={(value) => handleFieldChange('gender', value)}>
            <SelectTrigger className="bg-white/80">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => handleFieldChange('phone', e.target.value)}
            className="bg-white/80"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            className="bg-white/80"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ssn">Social Security Number</Label>
          <Input
            id="ssn"
            value={formData.ssn || ''}
            onChange={(e) => handleFieldChange('ssn', e.target.value)}
            className="bg-white/80"
            placeholder="XXX-XX-XXXX"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Address Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="address_line1">Address Line 1 *</Label>
            <Input
              id="address_line1"
              value={formData.address_line1 || ''}
              onChange={(e) => handleFieldChange('address_line1', e.target.value)}
              className="bg-white/80"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="address_line2">Address Line 2</Label>
            <Input
              id="address_line2"
              value={formData.address_line2 || ''}
              onChange={(e) => handleFieldChange('address_line2', e.target.value)}
              className="bg-white/80"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={formData.city || ''}
              onChange={(e) => handleFieldChange('city', e.target.value)}
              className="bg-white/80"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              value={formData.state || ''}
              onChange={(e) => handleFieldChange('state', e.target.value)}
              className="bg-white/80"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zip_code">ZIP Code *</Label>
            <Input
              id="zip_code"
              value={formData.zip_code || ''}
              onChange={(e) => handleFieldChange('zip_code', e.target.value)}
              className="bg-white/80"
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="emergency_contact_name">Contact Name *</Label>
            <Input
              id="emergency_contact_name"
              value={formData.emergency_contact_name || ''}
              onChange={(e) => handleFieldChange('emergency_contact_name', e.target.value)}
              className="bg-white/80"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergency_contact_phone">Contact Phone *</Label>
            <Input
              id="emergency_contact_phone"
              type="tel"
              value={formData.emergency_contact_phone || ''}
              onChange={(e) => handleFieldChange('emergency_contact_phone', e.target.value)}
              className="bg-white/80"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergency_contact_relationship">Relationship *</Label>
            <Input
              id="emergency_contact_relationship"
              value={formData.emergency_contact_relationship || ''}
              onChange={(e) => handleFieldChange('emergency_contact_relationship', e.target.value)}
              className="bg-white/80"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderProviderSection = () => (
    <Tabs value={currentSubTab || 'provider_info'} onValueChange={setCurrentSubTab}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="provider_info">Provider Info</TabsTrigger>
        <TabsTrigger value="npi_verification">NPI Verification</TabsTrigger>
        <TabsTrigger value="credentialing">Credentialing</TabsTrigger>
      </TabsList>
      
      <TabsContent value="provider_info" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="referring_provider_name">Referring Provider Name</Label>
            <Input
              id="referring_provider_name"
              value={formData.referring_provider_name || ''}
              onChange={(e) => handleFieldChange('referring_provider_name', e.target.value)}
              className="bg-white/80"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="referring_provider_npi">Referring Provider NPI</Label>
            <Input
              id="referring_provider_npi"
              value={formData.referring_provider_npi || ''}
              onChange={(e) => handleFieldChange('referring_provider_npi', e.target.value)}
              className="bg-white/80"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="primary_care_physician">Primary Care Physician</Label>
            <Input
              id="primary_care_physician"
              value={formData.primary_care_physician || ''}
              onChange={(e) => handleFieldChange('primary_care_physician', e.target.value)}
              className="bg-white/80"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pcp_npi">PCP NPI</Label>
            <Input
              id="pcp_npi"
              value={formData.pcp_npi || ''}
              onChange={(e) => handleFieldChange('pcp_npi', e.target.value)}
              className="bg-white/80"
            />
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="npi_verification" className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Enter NPI number to verify"
              value={formData.npi_to_verify || ''}
              onChange={(e) => handleFieldChange('npi_to_verify', e.target.value)}
              className="bg-white/80"
            />
            <Button
              onClick={() => verifyNPI(formData.npi_to_verify)}
              disabled={!formData.npi_to_verify || npiVerificationStatus === 'pending'}
            >
              {npiVerificationStatus === 'pending' ? 'Verifying...' : 'Verify NPI'}
            </Button>
          </div>
          
          {npiVerificationStatus !== 'pending' && (
            <div className={`p-4 rounded-lg ${
              npiVerificationStatus === 'verified' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {npiVerificationStatus === 'verified' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${
                  npiVerificationStatus === 'verified' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {npiVerificationStatus === 'verified' ? 'NPI Verified' : 'NPI Verification Failed'}
                </span>
              </div>
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="credentialing" className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="credentialing_status">Credentialing Status</Label>
            <Select onValueChange={(value) => handleFieldChange('credentialing_status', value)}>
              <SelectTrigger className="bg-white/80">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="credentialing_notes">Credentialing Notes</Label>
            <Textarea
              id="credentialing_notes"
              value={formData.credentialing_notes || ''}
              onChange={(e) => handleFieldChange('credentialing_notes', e.target.value)}
              className="bg-white/80"
              rows={4}
            />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );

  const renderInsuranceSection = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Primary Insurance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primary_insurance_name">Insurance Provider *</Label>
            <Input
              id="primary_insurance_name"
              value={formData.primary_insurance_name || ''}
              onChange={(e) => handleFieldChange('primary_insurance_name', e.target.value)}
              className="bg-white/80"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="primary_policy_number">Policy Number *</Label>
            <Input
              id="primary_policy_number"
              value={formData.primary_policy_number || ''}
              onChange={(e) => handleFieldChange('primary_policy_number', e.target.value)}
              className="bg-white/80"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="primary_group_number">Group Number</Label>
            <Input
              id="primary_group_number"
              value={formData.primary_group_number || ''}
              onChange={(e) => handleFieldChange('primary_group_number', e.target.value)}
              className="bg-white/80"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="primary_subscriber_name">Subscriber Name *</Label>
            <Input
              id="primary_subscriber_name"
              value={formData.primary_subscriber_name || ''}
              onChange={(e) => handleFieldChange('primary_subscriber_name', e.target.value)}
              className="bg-white/80"
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Coverage Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="copay_amount">Copay Amount ($)</Label>
            <Input
              id="copay_amount"
              type="number"
              value={formData.copay_amount || ''}
              onChange={(e) => handleFieldChange('copay_amount', e.target.value)}
              className="bg-white/80"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deductible_amount">Deductible ($)</Label>
            <Input
              id="deductible_amount"
              type="number"
              value={formData.deductible_amount || ''}
              onChange={(e) => handleFieldChange('deductible_amount', e.target.value)}
              className="bg-white/80"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="out_of_pocket_max">Out of Pocket Max ($)</Label>
            <Input
              id="out_of_pocket_max"
              type="number"
              value={formData.out_of_pocket_max || ''}
              onChange={(e) => handleFieldChange('out_of_pocket_max', e.target.value)}
              className="bg-white/80"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderClinicalSection = () => (
    <Tabs value={currentSubTab || 'clinical_info'} onValueChange={setCurrentSubTab}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="clinical_info">Clinical Information</TabsTrigger>
        <TabsTrigger value="treatment_plan">Treatment Plan</TabsTrigger>
      </TabsList>
      
      <TabsContent value="clinical_info" className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chief_complaint">Chief Complaint</Label>
            <Textarea
              id="chief_complaint"
              value={formData.chief_complaint || ''}
              onChange={(e) => handleFieldChange('chief_complaint', e.target.value)}
              className="bg-white/80"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="medical_history">Medical History</Label>
            <Textarea
              id="medical_history"
              value={formData.medical_history || ''}
              onChange={(e) => handleFieldChange('medical_history', e.target.value)}
              className="bg-white/80"
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="current_medications">Current Medications</Label>
            <Textarea
              id="current_medications"
              value={formData.current_medications || ''}
              onChange={(e) => handleFieldChange('current_medications', e.target.value)}
              className="bg-white/80"
              rows={3}
              placeholder="List all current medications, dosages, and frequency"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="allergies">Known Allergies</Label>
            <Textarea
              id="allergies"
              value={formData.allergies || ''}
              onChange={(e) => handleFieldChange('allergies', e.target.value)}
              className="bg-white/80"
              rows={2}
            />
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="treatment_plan" className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="treatment_modality">Treatment Modality</Label>
              <Input
                id="treatment_modality"
                value={formData.treatment_modality || ''}
                onChange={(e) => handleFieldChange('treatment_modality', e.target.value)}
                className="bg-white/80"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Input
                id="frequency"
                value={formData.frequency || ''}
                onChange={(e) => handleFieldChange('frequency', e.target.value)}
                className="bg-white/80"
                placeholder="e.g., 3 times per week"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration || ''}
                onChange={(e) => handleFieldChange('duration', e.target.value)}
                className="bg-white/80"
                placeholder="e.g., 12 weeks"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Treatment Location</Label>
              <Input
                id="location"
                value={formData.location || ''}
                onChange={(e) => handleFieldChange('location', e.target.value)}
                className="bg-white/80"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="treatment_goals">Treatment Goals</Label>
            <Textarea
              id="treatment_goals"
              value={formData.treatment_goals || ''}
              onChange={(e) => handleFieldChange('treatment_goals', e.target.value)}
              className="bg-white/80"
              rows={4}
            />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );

  const renderSubmitSection = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg border">
        <h3 className="text-lg font-medium mb-4">Review & Signature</h3>
        <p className="text-sm text-gray-600 mb-6">
          Please review all information and provide your signature to complete the enrollment process.
        </p>
        
        <div className="space-y-4">
          <Label htmlFor="signature">Patient Signature *</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <SignatureCanvas
              ref={signatureRef}
              canvasProps={{
                width: 400,
                height: 200,
                className: 'signature-canvas border rounded'
              }}
            />
            <div className="flex justify-between mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => signatureRef.current?.clear()}
              >
                Clear Signature
              </Button>
              <span className="text-xs text-gray-500">Sign above</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button
          onClick={handleFinalSubmission}
          disabled={isSubmitting}
          className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 px-8 py-3 text-lg"
        >
          {isSubmitting ? (
            <>
              <Clock className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Download className="mr-2 h-5 w-5" />
              Complete Enrollment & Generate PDF
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (currentSection.id) {
      case 'consent': return renderConsentSection();
      case 'patient': return renderPatientSection();
      case 'provider': return renderProviderSection();
      case 'insurance': return renderInsuranceSection();
      case 'clinical': return renderClinicalSection();
      case 'submit': return renderSubmitSection();
      default: return <div>Section not found</div>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header with Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">🏥 Patient Enrollment</h2>
            <p className="text-slate-600">Complete sequential enrollment process</p>
          </div>
          <div className="flex items-center gap-3">
            {realtimeUsers.length > 1 && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                👥 {realtimeUsers.length} users active
              </Badge>
            )}
            <Badge variant="outline">Session: {sessionId}</Badge>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Progress: {currentSection.title}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </div>

      {/* Section Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {sections.map((section, idx) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`relative cursor-pointer transition-all duration-200 ${
              idx === currentSectionIdx 
                ? 'transform scale-105' 
                : 'hover:scale-102'
            }`}
          >
            <Card className={`h-20 ${
              idx === currentSectionIdx 
                ? 'ring-2 ring-teal-500 bg-gradient-to-br from-teal-50 to-cyan-50' 
                : section.status === 'completed'
                ? 'bg-green-50 border-green-200'
                : section.status === 'error'
                ? 'bg-red-50 border-red-200'
                : 'hover:shadow-md'
            }`}>
              <CardContent className="p-3 h-full flex flex-col justify-center">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    {section.icon}
                    {section.status === 'completed' && (
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                    )}
                    {section.status === 'in_progress' && (
                      <Clock className="h-3 w-3 text-teal-600" />
                    )}
                    {section.status === 'error' && (
                      <AlertCircle className="h-3 w-3 text-red-600" />
                    )}
                  </div>
                </div>
                <h4 className="text-xs font-medium truncate">{section.title}</h4>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Current Section Form */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSection.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-white via-cyan-50/30 to-blue-50/30 border-2 border-teal-200/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                {currentSection.icon}
                <div>
                  <CardTitle className="text-2xl text-slate-800">
                    {currentSection.title}
                  </CardTitle>
                  <p className="text-slate-600">{currentSection.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {renderSectionContent()}
              
              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-8 border-t mt-8">
                <Button
                  variant="outline"
                  onClick={handlePrevSection}
                  disabled={currentSectionIdx === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-slate-600">
                    Step {currentSectionIdx + 1} of {sections.length}
                  </p>
                </div>
                
                {currentSectionIdx === sections.length - 1 ? (
                  <span /> // Final submission button is in the submit section
                ) : (
                  <Button
                    onClick={handleNextSection}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                  >
                    {isSubmitting ? 'Saving...' : 'Next Section'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Live Activity Feed */}
      {realtimeUsers.length > 1 && (
        <Card className="bg-slate-50 border-slate-200">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              👥 Live Activity
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {realtimeUsers.length} active users
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {realtimeUsers.map((user, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">{user.user_name}</span>
                  <span className="text-slate-500">
                    working on {sections.find(s => s.id === user.current_section)?.title || 'Unknown Section'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};