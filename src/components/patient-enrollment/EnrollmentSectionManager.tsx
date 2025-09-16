import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Shield, 
  User, 
  Building2, 
  CreditCard, 
  Activity, 
  Send 
} from 'lucide-react';

interface EnrollmentSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  tableName: string;
  requiredFields: string[];
}

interface EnrollmentSectionManagerProps {
  enrollmentId: string;
  currentSection: string;
  formData: any;
  onSectionComplete: (sectionId: string, data: any) => void;
  onSectionChange: (sectionId: string) => void;
  children: React.ReactNode;
}

const enrollmentSections: EnrollmentSection[] = [
  {
    id: 'consent_management',
    title: 'Consent Management',
    description: 'Patient consent options & provider authorization',
    icon: <Shield className="h-4 w-4" />,
    status: 'pending',
    tableName: 'enrollment_consent',
    requiredFields: ['consent_to_treatment', 'hipaa_authorization', 'consent_method']
  },
  {
    id: 'patient_info',
    title: 'Patient Information',
    description: 'Complete patient demographics and contact details',
    icon: <User className="h-4 w-4" />,
    status: 'pending',
    tableName: 'enrollment_patient_info',
    requiredFields: ['first_name', 'last_name', 'date_of_birth', 'phone', 'email']
  },
  {
    id: 'provider_info',
    title: 'Provider & Treatment Center',
    description: 'Provider information and treatment facility details',
    icon: <Building2 className="h-4 w-4" />,
    status: 'pending',
    tableName: 'enrollment_provider_info',
    requiredFields: ['referring_provider_name', 'treatment_facility']
  },
  {
    id: 'insurance',
    title: 'Insurance Information',
    description: 'Medical & pharmacy insurance coverage',
    icon: <CreditCard className="h-4 w-4" />,
    status: 'pending',
    tableName: 'enrollment_insurance_info',
    requiredFields: ['primary_insurance_name', 'primary_policy_number']
  },
  {
    id: 'treatment_assessment',
    title: 'Treatment & Clinical Assessment',
    description: 'Clinical information and treatment planning',
    icon: <Activity className="h-4 w-4" />,
    status: 'pending',
    tableName: 'enrollment_clinical_info',
    requiredFields: ['chief_complaint', 'medical_history']
  },
  {
    id: 'submit',
    title: 'Review & Submit',
    description: 'Final review and submission with signatures',
    icon: <Send className="h-4 w-4" />,
    status: 'pending',
    tableName: 'patient_enrollments',
    requiredFields: ['patient_signature']
  }
];

export const EnrollmentSectionManager: React.FC<EnrollmentSectionManagerProps> = ({
  enrollmentId,
  currentSection,
  formData,
  onSectionComplete,
  onSectionChange,
  children
}) => {
  const [sections, setSections] = useState<EnrollmentSection[]>(enrollmentSections);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const { showSuccess, showError } = useMasterToast();

  // Real-time progress tracking
  useEffect(() => {
    const channel = supabase
      .channel(`enrollment_progress_${enrollmentId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'patient_enrollments',
        filter: `id=eq.${enrollmentId}`,
      }, (payload) => {
        console.log('Real-time enrollment update:', payload);
        updateSectionStatuses();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enrollmentId]);

  const updateSectionStatuses = async () => {
    try {
      const { data: enrollment } = await supabase
        .from('patient_enrollments')
        .select('*')
        .eq('id', enrollmentId)
        .single();

      if (enrollment) {
        setSections(prev => prev.map(section => ({
          ...section,
          status: enrollment.current_section === section.id ? 'in_progress' :
                  sections.findIndex(s => s.id === enrollment.current_section) > 
                  sections.findIndex(s => s.id === section.id) ? 'completed' : 'pending'
        })));
      }
    } catch (error) {
      console.error('Failed to update section statuses:', error);
    }
  };

  const saveSection = async (sectionId: string, sectionData: any): Promise<boolean> => {
    setSavingSection(sectionId);
    const section = sections.find(s => s.id === sectionId);
    if (!section) return false;

    try {
      console.log(`Saving ${sectionId} to ${section.tableName}:`, sectionData);

      // Save to appropriate table based on section
      switch (sectionId) {
        case 'consent_management':
          await supabase.from('enrollment_consent').upsert({
            enrollment_id: enrollmentId,
            consent_to_treatment: sectionData.consentToTreatment || false,
            hipaa_authorization: sectionData.hipaaAuthorization || false,
            financial_responsibility: sectionData.financialResponsibility || false,
            communication_consent: sectionData.communicationConsent || false,
            telehealth_consent: sectionData.telehealthConsent || false,
            marketing_consent: sectionData.marketingConsent || false,
            consent_date: new Date().toISOString(),
            patient_signature: sectionData.patientSignature || '',
            witness_signature: sectionData.witnessSignature || ''
          });
          break;

        case 'patient_info':
          await supabase.from('enrollment_patient_info').upsert({
            enrollment_id: enrollmentId,
            first_name: sectionData.firstName || '',
            last_name: sectionData.lastName || '',
            middle_name: sectionData.middleName || '',
            date_of_birth: sectionData.dateOfBirth || null,
            ssn: sectionData.ssn || '',
            gender: sectionData.gender || '',
            phone: sectionData.cellPhone || sectionData.homePhone || '',
            email: sectionData.email || '',
            address_line1: sectionData.address || '',
            address_line2: sectionData.apartment || '',
            city: sectionData.city || '',
            state: sectionData.state || '',
            zip_code: sectionData.zipCode || '',
            emergency_contact_name: sectionData.alternateContactName || '',
            emergency_contact_phone: sectionData.alternateContactPhone || '',
            emergency_contact_relationship: sectionData.alternateContactRelationship || '',
            preferred_language: sectionData.preferredLanguage || 'english',
            do_not_contact: sectionData.doNotContactPatient || false
          });
          break;

        case 'provider_info':
          await supabase.from('enrollment_provider_info').upsert({
            enrollment_id: enrollmentId,
            referring_provider_name: sectionData.providerName || '',
            referring_provider_npi: sectionData.providerNpi || '',
            referring_provider_phone: sectionData.providerPhone || '',
            primary_care_physician: sectionData.primaryPhysician || '',
            treatment_facility: sectionData.treatmentCenterName || '',
            facility_npi: sectionData.treatmentCenterNpi || '',
            facility_address: sectionData.treatmentCenterAddress || '',
            treatment_type: sectionData.treatmentType || ''
          });
          break;

        case 'insurance':
          await supabase.from('enrollment_insurance_info').upsert({
            enrollment_id: enrollmentId,
            primary_insurance_name: sectionData.medicalInsurance?.provider || '',
            primary_policy_number: sectionData.medicalInsurance?.policyNumber || '',
            primary_group_number: sectionData.medicalInsurance?.groupNumber || '',
            primary_subscriber_name: `${sectionData.firstName} ${sectionData.lastName}`,
            secondary_insurance_name: sectionData.pharmacyInsurance?.provider || '',
            secondary_policy_number: sectionData.pharmacyInsurance?.policyNumber || '',
            secondary_group_number: sectionData.pharmacyInsurance?.groupNumber || ''
          });
          break;

        case 'treatment_assessment':
          await supabase.from('enrollment_clinical_info').upsert({
            enrollment_id: enrollmentId,
            chief_complaint: sectionData.treatmentType || '',
            current_medications: sectionData.currentMedications ? [sectionData.currentMedications] : [],
            medical_history: sectionData.medicalHistory ? [sectionData.medicalHistory] : [],
            allergies: sectionData.allergies ? [sectionData.allergies] : [],
            clinical_notes: sectionData.productDrugInfo || ''
          });
          break;

        case 'submit':
          await supabase.from('patient_enrollments').update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            patient_signature: sectionData.patientSignature || '',
            provider_signature: sectionData.providerSignature || ''
          }).eq('id', enrollmentId);
          break;
      }

      // Update main enrollment progress
      const currentIndex = sections.findIndex(s => s.id === sectionId);
      const progress = Math.round(((currentIndex + 1) / sections.length) * 100);
      
      await supabase.from('patient_enrollments').update({
        current_section: sectionId,
        progress_percentage: progress,
        updated_at: new Date().toISOString()
      }).eq('id', enrollmentId);

      showSuccess(`${section.title} saved successfully`, 'Your progress has been automatically saved');
      onSectionComplete(sectionId, sectionData);
      return true;
    } catch (error) {
      console.error(`Failed to save ${sectionId}:`, error);
      showError(`Failed to save ${section.title}`, 'Please try again');
      return false;
    } finally {
      setSavingSection(null);
    }
  };

  const calculateProgress = () => {
    const completedSections = sections.filter(s => s.status === 'completed').length;
    return Math.round((completedSections / sections.length) * 100);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Patient Enrollment Progress</CardTitle>
            <Badge variant="outline">{calculateProgress()}% Complete</Badge>
          </div>
          <Progress value={calculateProgress()} className="w-full" />
        </CardHeader>
      </Card>

      {/* Section Navigation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Enrollment Sections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sections.map((section, index) => (
              <Button
                key={section.id}
                variant={currentSection === section.id ? "default" : "outline"}
                className="h-auto p-4 text-left justify-start"
                onClick={() => onSectionChange(section.id)}
                disabled={savingSection === section.id}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(section.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {section.icon}
                      <span className="font-medium text-sm">{section.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {section.description}
                    </p>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Section Content */}
      <div className="relative">
        {savingSection && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center">
              <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Saving changes...</p>
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export { enrollmentSections };
export type { EnrollmentSection };