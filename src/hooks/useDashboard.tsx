
import { useState, useEffect } from 'react';
import { useAuthContext } from '@/components/auth/CleanAuthProvider';
import { useAuthActions } from '@/hooks/useAuthActions';

export const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated, profile, userRoles } = useAuthContext();
  const { signOut } = useAuthActions();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Simulate fetching dashboard data (replace with actual data fetching logic)
        await new Promise(resolve => setTimeout(resolve, 1000));
        const data = {
          welcomeMessage: `Welcome, ${user?.email || 'Guest'}!`,
          summary: 'This is a summary of your dashboard data.',
          items: [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
            { id: 3, name: 'Item 3' },
          ],
          totalUsers: 150,
          totalFacilities: 25,
          systemHealth: 'healthy',
          apiIntegrations: 8
        };
        setDashboardData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchDashboardData();
    } else {
      setDashboardData(null);
    }
  }, [isAuthenticated, user]);

  const handleLogout = async () => {
    await signOut();
  };

  return {
    dashboardData,
    loading,
    isLoading: loading,
    error,
    handleLogout,
    profile,
    userRoles: userRoles || []
  };
};
