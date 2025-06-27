
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useAuthActions } from '@/hooks/useAuthActions';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DashboardData {
  totalUsers: number;
  totalFacilities: number;
  activeModules: number;
  systemHealth: 'healthy' | 'warning' | 'error';
}

const fetchDashboardData = async (): Promise<DashboardData> => {
  // Fetch total users
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Fetch total facilities
  const { count: totalFacilities } = await supabase
    .from('facilities')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  // Fetch active modules
  const { count: activeModules } = await supabase
    .from('modules')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  return {
    totalUsers: totalUsers || 0,
    totalFacilities: totalFacilities || 0,
    activeModules: activeModules || 0,
    systemHealth: 'healthy'
  };
};

export const useDashboard = () => {
  const { profile, userRoles, loading, user, refreshUserData } = useAuthContext();
  const { assignUserRole } = useAuthActions();

  // Dashboard data query
  const { 
    data: dashboardData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['dashboard-data'],
    queryFn: fetchDashboardData,
    enabled: !!user, // Only fetch when user is authenticated
  });

  const handleRefresh = async () => {
    await Promise.all([
      refreshUserData(),
      refetch()
    ]);
  };

  const handleAssignTestRole = async () => {
    if (user) {
      console.log('🧪 Testing role assignment with updated RLS policies and security definer function...');
      const result = await assignUserRole(user.id, 'superAdmin');
      if (result.success) {
        console.log('✅ Test role assigned successfully - RLS policies are working!');
        await refreshUserData();
      } else {
        console.error('❌ Test role assignment failed:', result.error);
      }
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superAdmin': return 'bg-red-100 text-red-800 border-red-200';
      case 'healthcareProvider': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'nurse': return 'bg-green-100 text-green-800 border-green-200';
      case 'caseManager': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'onboardingTeam': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'patientCaregiver': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'superAdmin': return 'Full system access and administration';
      case 'healthcareProvider': return 'Clinical access to patient data and treatment';
      case 'nurse': return 'Patient care coordination and monitoring';
      case 'caseManager': return 'Patient care management and coordination';
      case 'onboardingTeam': return 'Facility and user onboarding management';
      case 'patientCaregiver': return 'Limited access to personal health information';
      default: return 'Role-specific access permissions';
    }
  };

  return {
    profile,
    userRoles,
    loading,
    user,
    dashboardData,
    isLoading,
    error,
    refetch: handleRefresh,
    handleRefresh,
    handleAssignTestRole,
    getRoleColor,
    getRoleDescription
  };
};
