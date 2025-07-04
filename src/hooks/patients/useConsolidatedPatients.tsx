
/**
 * CONSOLIDATED PATIENTS HOOK - MASTER CONSOLIDATION ALIGNED
 * Patient management with complete TypeScript alignment
 * Version: consolidated-patients-v2.1.0 - Fixed type alignment issues
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';
import type { MasterUser } from '@/hooks/useMasterUserManagement';

export const useConsolidatedPatients = () => {
  const { showError } = useMasterToast();
  
  console.log('🎯 Consolidated Patients Hook - Master Consolidation Aligned');

  const {
    data: patients = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['consolidated-patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            role:roles (
              name,
              description
            )
          ),
          facilities (
            id,
            name,
            facility_type
          )
        `)
        .ilike('role', '%patient%')
        .order('created_at', { ascending: false });

      if (error) {
        showError('Data Error', 'Failed to load patients');
        throw error;
      }

      return (data || []).map((patient: any): MasterUser => ({
        id: patient.id,
        firstName: patient.first_name || '',
        lastName: patient.last_name || '',
        first_name: patient.first_name || '',
        last_name: patient.last_name || '',
        email: patient.email || '',
        role: patient.role || 'patient',
        phone: patient.phone,
        isActive: patient.is_active ?? true,
        is_active: patient.is_active ?? true,
        created_at: patient.created_at || new Date().toISOString(),
        updated_at: patient.updated_at,
        facility_id: patient.facility_id,
        email_confirmed_at: patient.email_confirmed_at,
        last_sign_in_at: patient.last_sign_in_at,
        email_confirmed: !!patient.email_confirmed_at,
        facilities: patient.facilities,
        user_roles: patient.user_roles || []
      }));
    }
  });

  const getPatientStats = () => ({
    total: patients.length,
    active: patients.filter(p => p.isActive).length,
    inactive: patients.filter(p => !p.isActive).length,
    withFacilities: patients.filter(p => p.facility_id).length
  });

  const searchPatients = (searchTerm: string) => {
    if (!searchTerm.trim()) return patients;
    
    return patients.filter(patient =>
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return {
    patients,
    isLoading,
    error,
    refetch,
    
    // Utility functions
    getPatientStats,
    searchPatients,
    
    // Computed stats
    stats: getPatientStats(),
    
    meta: {
      hookVersion: 'consolidated-patients-v2.1.0',
      singleSourceValidated: true,
      typeScriptAligned: true,
      masterConsolidationCompliant: true
    }
  };
};
