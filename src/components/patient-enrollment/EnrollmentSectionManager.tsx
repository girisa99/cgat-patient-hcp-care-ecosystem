import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';
import { saveEnrollmentSection, enrollmentTableMappings } from './EnrollmentFieldMapper';
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
    description: 'Patient consent, legal documents & authorization',
    icon: <Shield className="h-4 w-4" />,
    status: 'pending',
    tableName: 'enrollment_consent',
    requiredFields: ['consent_to_treatment', 'hipaa_authorization', 'consent_date', 'patient_signature']
  },
  {
    id: 'patient_info',
    title: 'Patient Demographics',
    description: 'Personal information, contact details & demographics',
    icon: <User className="h-4 w-4" />,
    status: 'pending',
    tableName: 'enrollment_patient_info',
    requiredFields: ['first_name', 'last_name', 'date_of_birth', 'phone', 'email', 'address_line1', 'city', 'state', 'zip_code']
  },
  {
    id: 'provider_info',
    title: 'Provider Information',
    description: 'Referring provider details & NPI verification',
    icon: <Building2 className="h-4 w-4" />,
    status: 'pending',
    tableName: 'enrollment_provider_info',
    requiredFields: ['referring_provider_name', 'referring_provider_npi', 'referring_provider_phone']
  },
  {
    id: 'treatment_center',
    title: 'Treatment Center',
    description: 'Treatment facility selection & verification',
    icon: <Building2 className="h-4 w-4" />,
    status: 'pending',
    tableName: 'enrollment_treatment_plan',
    requiredFields: ['treatment_facility', 'facility_npi', 'treatment_type']
  },
  {
    id: 'insurance_info',
    title: 'Insurance Coverage',
    description: 'Medical & pharmacy insurance information',
    icon: <CreditCard className="h-4 w-4" />,
    status: 'pending',
    tableName: 'enrollment_insurance_info',
    requiredFields: ['primary_insurance_name', 'primary_policy_number', 'primary_subscriber_name']
  },
  {
    id: 'clinical_assessment',
    title: 'Clinical Assessment',
    description: 'Medical history, medications & clinical data',
    icon: <Activity className="h-4 w-4" />,
    status: 'pending',
    tableName: 'enrollment_clinical_info',
    requiredFields: ['chief_complaint', 'medical_history', 'current_medications', 'allergies']
  },
  {
    id: 'treatment_plan',
    title: 'Treatment Planning',
    description: 'Treatment goals, protocols & care planning',
    icon: <Activity className="h-4 w-4" />,
    status: 'pending',
    tableName: 'enrollment_treatment_plan',
    requiredFields: ['treatment_type', 'treatment_goals', 'estimated_duration']
  },
  {
    id: 'documents',
    title: 'Required Documents',
    description: 'Upload required forms & documentation',
    icon: <Send className="h-4 w-4" />,
    status: 'pending',
    tableName: 'enrollment_documents',
    requiredFields: ['document_type', 'file_name', 'file_path']
  },
  {
    id: 'collaborations',
    title: 'Care Team Coordination',
    description: 'Care team assignments & collaboration setup',
    icon: <User className="h-4 w-4" />,
    status: 'pending',
    tableName: 'enrollment_collaborations',
    requiredFields: ['assigned_role', 'step_id', 'status']
  },
  {
    id: 'submit',
    title: 'Review & Submit',
    description: 'Final review, signatures & enrollment completion',
    icon: <Send className="h-4 w-4" />,
    status: 'pending',
    tableName: 'patient_enrollments',
    requiredFields: ['patient_signature', 'provider_signature', 'enrollment_status']
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

      // Use the new field mapper for all sections
      const { saveEnrollmentSection } = await import('./EnrollmentFieldMapper');
      const saveResult = await saveEnrollmentSection(enrollmentId, sectionId, sectionData);
      
      if (!saveResult.success) {
        throw new Error(saveResult.error || 'Failed to save section data');
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