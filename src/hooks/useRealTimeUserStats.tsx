
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RealTimeUserStats {
  totalUsers: number;
  verifiedUsers: number;
  totalPermissions: number;
  totalFacilities: number;
  activeFacilities: number;
  usersByRole: Record<string, number>;
  lastUpdated: string;
}

/**
 * Hook to fetch real-time user statistics directly from the database
 */
export const useRealTimeUserStats = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['real-time-user-stats'],
    queryFn: async (): Promise<RealTimeUserStats> => {
      console.log('🔄 Fetching real-time user statistics...');
      
      try {
        // Get all users via edge function
        const { data: userResponse, error: userError } = await supabase.functions.invoke('manage-user-profiles', {
          body: { action: 'list' }
        });

        if (userError) {
          throw new Error(`Failed to fetch users: ${userError.message}`);
        }

        if (!userResponse?.success) {
          throw new Error(userResponse?.error || 'Failed to fetch users');
        }

        const allUsers = userResponse.data || [];
        console.log('📊 Raw user data for verification check:', allUsers.slice(0, 2));
        
        // Count verified users - check both email_confirmed_at and email_confirmed fields
        const verifiedUsers = allUsers.filter((user: any) => {
          const isVerified = Boolean(
            user.email_confirmed_at || 
            user.email_confirmed || 
            user.emailConfirmed ||
            (user.user_metadata && user.user_metadata.email_verified) ||
            (user.app_metadata && user.app_metadata.email_verified)
          );
          
          if (isVerified) {
            console.log('✅ Verified user found:', user.email, {
              email_confirmed_at: user.email_confirmed_at,
              email_confirmed: user.email_confirmed,
              emailConfirmed: user.emailConfirmed
            });
          }
          
          return isVerified;
        }).length;

        console.log(`📈 Verification stats: ${verifiedUsers} verified out of ${allUsers.length} total users`);

        // Get role distribution
        const usersByRole = allUsers.reduce((acc: Record<string, number>, user: any) => {
          const roles = user.user_roles || [];
          roles.forEach((userRole: any) => {
            const roleName = userRole.roles?.name || 'unknown';
            acc[roleName] = (acc[roleName] || 0) + 1;
          });
          return acc;
        }, {});

        // Get permissions count
        const { data: permissions, error: permError } = await supabase
          .from('permissions')
          .select('id');
        
        if (permError) {
          console.error('❌ Error fetching permissions:', permError);
        }

        // Get facilities count
        const { data: facilities, error: facilityError } = await supabase
          .from('facilities')
          .select('id, is_active');
        
        if (facilityError) {
          console.error('❌ Error fetching facilities:', facilityError);
        }

        const stats: RealTimeUserStats = {
          totalUsers: allUsers.length,
          verifiedUsers,
          totalPermissions: permissions?.length || 0,
          totalFacilities: facilities?.length || 0,
          activeFacilities: facilities?.filter(f => f.is_active !== false).length || 0,
          usersByRole,
          lastUpdated: new Date().toISOString()
        };

        console.log('✅ Real-time stats computed:', stats);
        return stats;
        
      } catch (error: any) {
        console.error('❌ Error fetching real-time stats:', error);
        toast({
          title: "Stats Error",
          description: `Failed to fetch user statistics: ${error.message}`,
          variant: "destructive",
        });
        throw error;
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
};
