import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';

export interface EnrollmentPatient {
  id: string;
  session_id: string;
  user_id: string;
  enrollment_status: string;
  current_section: string;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
  enrollment_source: string;
  is_active: boolean;
  deactivated_at?: string | null;
  deactivated_by?: string | null;
  deactivation_reason?: string | null;
  source_type?: 'enrollment' | 'profile'; // Track data source
  // Patient info from enrollment_patient_info table
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address_line1?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

export const useEnrollmentPatients = () => {
  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();

  // Fetch patients ONLY from enrollment tables
  const { data: patients = [], isLoading, error } = useQuery({
    queryKey: ['enrollment-patients-only'],
    queryFn: async (): Promise<EnrollmentPatient[]> => {
      console.log('🏥 Fetching patients from enrollment tables only...');
      
      // Fetch enrollment-based patients only
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('patient_enrollments')
        .select(`
          *,
          enrollment_patient_info:enrollment_patient_info!enrollment_patient_info_enrollment_id_fkey (
            first_name,
            last_name,
            email,
            phone,
            date_of_birth,
            gender,
            address_line1,
            city,
            state,
            zip_code
          )
        `)
        .eq('is_active', true)
        .eq('enrollment_status', 'in_progress')
        .order('created_at', { ascending: false });

      if (enrollmentError) {
        console.error('❌ Error fetching enrollment patients:', enrollmentError);
        throw enrollmentError;
      }

      const enrollmentPatients: EnrollmentPatient[] = enrollmentData ? enrollmentData.map(enrollment => ({
        ...enrollment,
        first_name: enrollment.enrollment_patient_info?.[0]?.first_name || 'Unknown',
        last_name: enrollment.enrollment_patient_info?.[0]?.last_name || 'Patient',
        email: enrollment.enrollment_patient_info?.[0]?.email || 'No email',
        phone: enrollment.enrollment_patient_info?.[0]?.phone || '',
        date_of_birth: enrollment.enrollment_patient_info?.[0]?.date_of_birth || '',
        gender: enrollment.enrollment_patient_info?.[0]?.gender || '',
        address_line1: enrollment.enrollment_patient_info?.[0]?.address_line1 || '',
        city: enrollment.enrollment_patient_info?.[0]?.city || '',
        state: enrollment.enrollment_patient_info?.[0]?.state || '',
        zip_code: enrollment.enrollment_patient_info?.[0]?.zip_code || '',
        enrollment_patient_info: undefined,
        source_type: 'enrollment' as const
      })) : [];

      console.log(`✅ Successfully fetched ${enrollmentPatients.length} enrollment patients`);
      return enrollmentPatients;
    },
    staleTime: 30000, // 30 seconds
  });

  // Deactivate enrollment mutation
  const deactivateEnrollmentMutation = useMutation({
    mutationFn: async (enrollmentId: string) => {
      const { error } = await supabase
        .from('patient_enrollments')
        .update({
          is_active: false,
          deactivated_at: new Date().toISOString(),
          deactivated_by: (await supabase.auth.getUser()).data.user?.id,
          deactivation_reason: 'Deactivated from dashboard'
        })
        .eq('id', enrollmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment-patients-only'] });
      showSuccess('Patient enrollment deactivated successfully');
    },
    onError: (error) => {
      console.error('❌ Error deactivating patient enrollment:', error);
      showError('Failed to deactivate patient enrollment');
    }
  });

  // Update enrollment status mutation
  const updateEnrollmentStatusMutation = useMutation({
    mutationFn: async ({ enrollmentId, status }: { enrollmentId: string; status: string }) => {
      const { error } = await supabase
        .from('patient_enrollments')
        .update({
          enrollment_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', enrollmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment-patients-only'] });
      showSuccess('Enrollment status updated successfully');
    },
    onError: (error) => {
      console.error('❌ Error updating enrollment status:', error);
      showError('Failed to update enrollment status');
    }
  });

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['enrollment-patients-only'] });
  };

  const getEnrollmentStats = () => {
    const total = patients.length;
    const active = patients.filter(p => p.is_active).length;
    const inProgress = patients.filter(p => p.enrollment_status === 'in_progress').length;
    const completed = patients.filter(p => p.enrollment_status === 'completed').length;
    const withInfo = patients.filter(p => p.first_name !== 'Unknown').length;

    return {
      total,
      active,
      inProgress,
      completed,
      withInfo,
      averageProgress: total > 0 ? Math.round(patients.reduce((sum, p) => sum + p.progress_percentage, 0) / total) : 0
    };
  };

  return {
    patients,
    isLoading,
    error,
    deactivateEnrollment: deactivateEnrollmentMutation.mutate,
    isDeactivating: deactivateEnrollmentMutation.isPending,
    updateEnrollmentStatus: updateEnrollmentStatusMutation.mutate,
    isUpdatingStatus: updateEnrollmentStatusMutation.isPending,
    refreshData,
    getEnrollmentStats,
    meta: {
      hookName: 'useEnrollmentPatients',
      version: '1.0.0',
      dataSource: 'enrollment_tables',
      lastUpdated: new Date().toISOString()
    }
  };
};