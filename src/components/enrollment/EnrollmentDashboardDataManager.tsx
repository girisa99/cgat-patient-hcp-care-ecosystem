/**
 * Enrollment Dashboard Data Manager
 * Handles data fetching and status management for the Patient Onboarding Dashboard
 * Uses enrollment tables instead of patient profiles
 */
import { supabase } from '@/integrations/supabase/client';

export interface EnrollmentDashboardItem {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  providerName: string | null;
  providerNpi: string | null;
  treatmentCenter: string | null;
  treatmentCenterNpi: string | null;
  enrollmentSource: 'mcp' | 'conversational_ai' | 'ai_structure' | 'online_form' | 'diagnostic_test';
  currentSection: string;
  status: 'initiated' | 'in_progress' | 'docs_pending' | 'completed' | 'on_hold';
  progressPercentage: number;
  priority: 'high' | 'medium' | 'low';
  
  // NPI Verification Status
  providerNpiVerified: boolean;
  treatmentCenterNpiVerified: boolean;
  
  // Documentation Status
  missingDocuments: string[];
  documentCount: number;
  requiredDocumentCount: number;
  
  // Insurance Status
  insuranceVerified: boolean;
  insuranceCardUploaded: boolean;
  
  // Consent Management Status
  consentCompleted: boolean;
  consentMethod: string | null;
  consentPending: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastActivity: string;
  
  // Actions
  nextStep: string;
  assignedStaff: string;
  
  // Deactivation support
  isActive: boolean;
  deactivatedBy: string | null;
  deactivationReason: string | null;
}

export interface EnrollmentStats {
  total: number;
  initiated: number;
  inProgress: number;
  completed: number;
  documentsPending: number;
  onHold: number;
}

export class EnrollmentDashboardDataManager {
  /**
   * Fetch comprehensive enrollment data from all related tables
   */
  static async fetchEnrollmentData(): Promise<EnrollmentDashboardItem[]> {
    try {
      // Fetch main enrollment records
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('patient_enrollments')
        .select(`
          id, enrollment_status, current_section, progress_percentage, 
          enrollment_source, created_at, updated_at, session_id,
          is_active, deactivated_by, deactivation_reason
        `)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (enrollmentsError) throw enrollmentsError;

      if (!enrollments || enrollments.length === 0) {
        return [];
      }

      const enrollmentIds = enrollments.map(e => e.id);

      // Fetch related data in parallel
      const [
        { data: patientInfos },
        { data: providerInfos },
        { data: consentInfos },
        { data: documentsInfos },
        { data: insuranceInfos }
      ] = await Promise.all([
        supabase
          .from('enrollment_patient_info')
          .select('enrollment_id, first_name, last_name, email, phone')
          .in('enrollment_id', enrollmentIds),
        
        supabase
          .from('enrollment_provider_info')
          .select('enrollment_id, provider_name, provider_npi, treatment_center_name, treatment_center_npi, npi_verified')
          .in('enrollment_id', enrollmentIds),
        
        supabase
          .from('enrollment_consent')
          .select('enrollment_id, collection_method, consent_to_treatment, hipaa_authorization, privacy_consent, consent_date')
          .in('enrollment_id', enrollmentIds),
        
        supabase
          .from('enrollment_documents')
          .select('enrollment_id, document_type, document_status, is_required')
          .in('enrollment_id', enrollmentIds),
        
        supabase
          .from('enrollment_insurance_info')
          .select('enrollment_id, primary_insurance_verified, insurance_card_front_url, insurance_card_back_url')
          .in('enrollment_id', enrollmentIds)
      ]);

      // Create lookup maps
      const patientMap = this.createLookupMap(patientInfos, 'enrollment_id');
      const providerMap = this.createLookupMap(providerInfos, 'enrollment_id');
      const consentMap = this.createLookupMap(consentInfos, 'enrollment_id');
      const insuranceMap = this.createLookupMap(insuranceInfos, 'enrollment_id');
      
      // Group documents by enrollment_id
      const documentsMap = (documentsInfos || []).reduce((acc: any, doc: any) => {
        if (!acc[doc.enrollment_id]) acc[doc.enrollment_id] = [];
        acc[doc.enrollment_id].push(doc);
        return acc;
      }, {});

      // Transform data
      return enrollments.map(enrollment => this.transformEnrollmentData(
        enrollment,
        patientMap[enrollment.id],
        providerMap[enrollment.id],
        consentMap[enrollment.id],
        documentsMap[enrollment.id] || [],
        insuranceMap[enrollment.id]
      ));

    } catch (error) {
      console.error('Error fetching enrollment dashboard data:', error);
      throw error;
    }
  }

  /**
   * Calculate enrollment statistics
   */
  static async fetchEnrollmentStats(): Promise<EnrollmentStats> {
    try {
      const { data: enrollments, error } = await supabase
        .from('patient_enrollments')
        .select('enrollment_status')
        .eq('is_active', true);

      if (error) throw error;

      const stats = (enrollments || []).reduce((acc: EnrollmentStats, enrollment: any) => {
        acc.total++;
        switch (enrollment.enrollment_status) {
          case 'initiated':
            acc.initiated++;
            break;
          case 'in_progress':
            acc.inProgress++;
            break;
          case 'completed':
            acc.completed++;
            break;
          case 'docs_pending':
            acc.documentsPending++;
            break;
          case 'on_hold':
            acc.onHold++;
            break;
        }
        return acc;
      }, {
        total: 0,
        initiated: 0,
        inProgress: 0,
        completed: 0,
        documentsPending: 0,
        onHold: 0
      });

      return stats;
    } catch (error) {
      console.error('Error fetching enrollment stats:', error);
      throw error;
    }
  }

  /**
   * Update enrollment status
   */
  static async updateEnrollmentStatus(enrollmentId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('patient_enrollments')
      .update({ 
        enrollment_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', enrollmentId);

    if (error) throw error;
  }

  /**
   * Deactivate enrollment (soft delete)
   */
  static async deactivateEnrollment(
    enrollmentId: string, 
    reason: string, 
    deactivatedBy: string
  ): Promise<void> {
    const { error } = await supabase
      .from('patient_enrollments')
      .update({ 
        is_active: false,
        deactivated_by: deactivatedBy,
        deactivation_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', enrollmentId);

    if (error) throw error;
  }

  /**
   * Reactivate enrollment
   */
  static async reactivateEnrollment(enrollmentId: string): Promise<void> {
    const { error } = await supabase
      .from('patient_enrollments')
      .update({ 
        is_active: true,
        deactivated_by: null,
        deactivation_reason: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', enrollmentId);

    if (error) throw error;
  }

  /**
   * Get enrollment continuation URL
   */
  static getEnrollmentContinueUrl(enrollment: EnrollmentDashboardItem): string {
    const baseUrl = window.location.origin;
    const sourceMap = {
      'mcp': '/patient-onboarding?method=mcp',
      'conversational_ai': '/patient-onboarding?method=conversational',
      'ai_structure': '/patient-onboarding?method=structured',
      'online_form': '/patient-onboarding?method=form',
      'diagnostic_test': '/patient-onboarding?method=diagnostic'
    };
    
    const url = sourceMap[enrollment.enrollmentSource] || '/patient-onboarding';
    return `${baseUrl}${url}&enrollment_id=${enrollment.id}&resume=true`;
  }

  // Helper methods
  private static createLookupMap(data: any[], key: string): Record<string, any> {
    return (data || []).reduce ((acc: any, item: any) => {
      acc[item[key]] = item;
      return acc;
    }, {});
  }

  private static transformEnrollmentData(
    enrollment: any,
    patientInfo: any,
    providerInfo: any,
    consentInfo: any,
    documents: any[],
    insuranceInfo: any
  ): EnrollmentDashboardItem {
    // Calculate missing documents
    const requiredDocs = documents.filter(d => d.is_required);
    const missingDocs = requiredDocs.filter(d => d.document_status !== 'uploaded' && d.document_status !== 'verified');
    
    // Determine priority based on progress and time
    const daysSinceCreated = Math.floor(
      (Date.now() - new Date(enrollment.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    let priority: 'high' | 'medium' | 'low' = 'medium';
    if (enrollment.progress_percentage < 30 && daysSinceCreated > 3) priority = 'high';
    else if (enrollment.progress_percentage > 70) priority = 'low';

    // Determine next step
    const nextStepMap: Record<string, string> = {
      'consent_management': 'Patient Information Collection',
      'patient_information': 'Provider & Treatment Details',
      'provider_treatment': 'Insurance Verification',
      'insurance_information': 'Clinical Assessment',
      'clinical_treatment': 'Final Review & Submission',
      'submit': 'Enrollment Complete'
    };

    // Check consent status
    const consentCompleted = consentInfo && (
      consentInfo.consent_to_treatment && 
      consentInfo.hipaa_authorization && 
      consentInfo.privacy_consent
    );
    
    const consentPending = consentInfo && consentInfo.collection_method && !consentCompleted;

    return {
      id: enrollment.id,
      patientName: patientInfo ? `${patientInfo.first_name} ${patientInfo.last_name}`.trim() : 'Unknown Patient',
      patientEmail: patientInfo?.email || '',
      patientPhone: patientInfo?.phone || '',
      providerName: providerInfo?.provider_name || null,
      providerNpi: providerInfo?.provider_npi || null,
      treatmentCenter: providerInfo?.treatment_center_name || null,
      treatmentCenterNpi: providerInfo?.treatment_center_npi || null,
      enrollmentSource: enrollment.enrollment_source || 'online_form',
      currentSection: enrollment.current_section || 'consent_management',
      status: enrollment.enrollment_status || 'initiated',
      progressPercentage: enrollment.progress_percentage || 0,
      priority,
      
      // NPI Verification
      providerNpiVerified: providerInfo?.npi_verified || false,
      treatmentCenterNpiVerified: providerInfo?.treatment_center_npi_verified || false,
      
      // Documentation
      missingDocuments: missingDocs.map(d => d.document_type),
      documentCount: documents.filter(d => d.document_status === 'uploaded' || d.document_status === 'verified').length,
      requiredDocumentCount: requiredDocs.length,
      
      // Insurance
      insuranceVerified: insuranceInfo?.primary_insurance_verified || false,
      insuranceCardUploaded: !!(insuranceInfo?.insurance_card_front_url && insuranceInfo?.insurance_card_back_url),
      
      // Consent
      consentCompleted: !!consentCompleted,
      consentMethod: consentInfo?.collection_method || null,
      consentPending: !!consentPending,
      
      // Timestamps
      createdAt: enrollment.created_at,
      updatedAt: enrollment.updated_at,
      lastActivity: enrollment.updated_at,
      
      // Actions
      nextStep: nextStepMap[enrollment.current_section] || 'Continue Enrollment',
      assignedStaff: 'Unassigned', // TODO: Add staff assignment logic
      
      // Status
      isActive: enrollment.is_active,
      deactivatedBy: enrollment.deactivated_by,
      deactivationReason: enrollment.deactivation_reason
    };
  }
}