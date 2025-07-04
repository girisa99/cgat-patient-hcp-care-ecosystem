import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterAuth } from '@/hooks/useMasterAuth';

interface PatientData {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  email: string;
  phone?: string;
  medical_record_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  created_at: string;
  updated_at: string;
}

export const useSecurePatientData = () => {
  const { user, userRoles } = useMasterAuth();
  const [loading, setLoading] = useState(false);

  // Check if user has access to patient data
  const hasPatientAccess = () => {
    return userRoles.includes('superAdmin') || 
           userRoles.includes('admin') || 
           userRoles.includes('onboardingTeam') ||
           userRoles.includes('user');
  };

  // Fetch patient data with role-based access control
  const { data: patientData, isLoading, error, refetch } = useQuery({
    queryKey: ['securePatientData', user?.id],
    queryFn: async () => {
      if (!user?.id || !hasPatientAccess()) {
        console.log('🔒 User does not have patient data access');
        return [];
      }

      setLoading(true);
      try {
        console.log('🔍 Fetching secure patient data for user:', user.id);
        
        let query = supabase
          .from('patient_data')
          .select('*')
          .order('created_at', { ascending: false });

        // If user is not admin, only show their own data
        if (!userRoles.includes('superAdmin') && !userRoles.includes('admin')) {
          query = query.eq('user_id', user.id);
        }

        const { data, error } = await query;

        if (error) {
          console.error('❌ Error fetching patient data:', error);
          throw error;
        }

        console.log('✅ Patient data fetched successfully:', data?.length || 0, 'records');
        return data || [];
      } catch (error) {
        console.error('� Exception fetching patient data:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!user?.id && hasPatientAccess(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });

  // Create new patient record
  const createPatientRecord = async (patientInfo: Partial<PatientData>) => {
    if (!user?.id || !hasPatientAccess()) {
      throw new Error('Access denied: insufficient permissions');
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patient_data')
        .insert({
          ...patientInfo,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Patient record created successfully');
      await refetch();
      return data;
    } catch (error) {
      console.error('❌ Error creating patient record:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update patient record
  const updatePatientRecord = async (patientId: string, updates: Partial<PatientData>) => {
    if (!user?.id || !hasPatientAccess()) {
      throw new Error('Access denied: insufficient permissions');
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patient_data')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', patientId)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Patient record updated successfully');
      await refetch();
      return data;
    } catch (error) {
      console.error('❌ Error updating patient record:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete patient record (admin only)
  const deletePatientRecord = async (patientId: string) => {
    if (!userRoles.includes('superAdmin') && !userRoles.includes('admin')) {
      throw new Error('Access denied: admin privileges required');
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('patient_data')
        .delete()
        .eq('id', patientId);

      if (error) throw error;

      console.log('✅ Patient record deleted successfully');
      await refetch();
    } catch (error) {
      console.error('❌ Error deleting patient record:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    patientData: patientData || [],
    isLoading: isLoading || loading,
    error,
    hasPatientAccess: hasPatientAccess(),
    userRoles,
    createPatientRecord,
    updatePatientRecord,
    deletePatientRecord,
    refetch,
    // Security info
    accessLevel: userRoles.includes('superAdmin') ? 'Full Access' : 
                userRoles.includes('admin') ? 'Administrative' : 
                userRoles.includes('onboardingTeam') ? 'Onboarding' : 'Limited',
    canViewAll: userRoles.includes('superAdmin') || userRoles.includes('admin'),
    canEdit: hasPatientAccess(),
    canDelete: userRoles.includes('superAdmin') || userRoles.includes('admin')
  };
};
