
import React from 'react';
import { useUnifiedUserManagement } from '@/hooks/useUnifiedUserManagement';
import { useRealTimeUserStats } from '@/hooks/useRealTimeUserStats';
import { useAuthValidation } from '@/hooks/useAuthValidation';
import { RealTimeStatsCard } from './RealTimeStatsCard';
import DashboardHeader from './DashboardHeader';
import DashboardLoading from './DashboardLoading';
import { RealTimeDashboardStats } from './RealTimeDashboardStats';
import SystemStatusCard from './SystemStatusCard';
import { ModulesOverviewCard } from './ModulesOverviewCard';
import { ComponentsServicesCard } from './ComponentsServicesCard';
import ProfileCard from './ProfileCard';
import UserRolesCard from './UserRolesCard';
import StatusAlerts from './StatusAlerts';
import { SystemHighlightsCard } from './SystemHighlightsCard';
import { supabase } from '@/integrations/supabase/client';

const UnifiedDashboard: React.FC = () => {
  console.log('🎯 Unified Dashboard - Rendering with real-time data integration');
  
  const { users, isLoading: usersLoading, meta } = useUnifiedUserManagement();
  const { data: realTimeStats, isLoading: statsLoading, refetch: refetchStats } = useRealTimeUserStats();
  const { validationResult, validateAuth } = useAuthValidation();

  // Get current user and profile from auth
  const [user, setUser] = React.useState<any>(null);
  const [profile, setProfile] = React.useState<any>(null);

  React.useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      
      if (currentUser) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .maybeSingle();
        setProfile(profileData);
      }
    };
    
    getCurrentUser();
  }, []);

  const handleRefresh = () => {
    console.log('🔄 Refreshing dashboard data...');
    refetchStats();
    validateAuth();
  };

  const handleAssignTestRole = async () => {
    console.log('🔧 Test role assignment triggered');
    // This would be implemented based on your role assignment logic
  };

  if (usersLoading || statsLoading) {
    return <DashboardLoading />;
  }

  // Extract user roles from validation result
  const userRoles = validationResult?.userId ? 
    users.find(u => u.id === validationResult.userId)?.user_roles?.map(ur => ur.roles.name) || [] : 
    [];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superAdmin': return 'bg-red-100 text-red-800';
      case 'onboardingTeam': return 'bg-blue-100 text-blue-800';
      case 'patientCaregiver': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'superAdmin': return 'Full system access';
      case 'onboardingTeam': return 'Onboarding management';
      case 'patientCaregiver': return 'Patient care services';
      default: return 'Standard user';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <DashboardHeader 
        user={user}
        userRoles={userRoles}
        onRefresh={handleRefresh}
        onAssignTestRole={handleAssignTestRole}
      />
      
      {/* Real-Time Statistics - Primary Display */}
      <RealTimeStatsCard />
      
      {/* Enhanced Real-Time Stats with Comparison */}
      <RealTimeDashboardStats 
        users={users} 
        realTimeStats={realTimeStats}
        meta={meta}
      />

      {/* System Status and Overview Cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SystemStatusCard 
          user={user}
          profile={profile}
          userRoles={userRoles}
        />
        <SystemHighlightsCard />
      </div>

      {/* Module and Services Overview */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ModulesOverviewCard />
        <ComponentsServicesCard />
      </div>

      {/* User Profile and Roles */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ProfileCard 
          profile={profile}
          user={user}
        />
        <UserRolesCard 
          userRoles={userRoles}
          user={user}
          getRoleColor={getRoleColor}
          getRoleDescription={getRoleDescription}
        />
      </div>

      {/* Status Alerts */}
      <StatusAlerts 
        user={user}
        profile={profile}
        userRoles={userRoles}
      />
    </div>
  );
};

export default UnifiedDashboard;
