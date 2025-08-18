import React from 'react';
import { SecurityMonitoringDashboard } from '@/components/security/SecurityMonitoringDashboard';
import { supabase } from '@/integrations/supabase/client';
import { useRoles } from '@/hooks/useRoles';
import { useState, useEffect } from 'react';

export const SecurityPage: React.FC = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { isLoading: rolesLoading } = useRoles();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setAuthLoading(false);
    });
  }, []);

  // Show loading while checking authentication and roles
  if (authLoading || rolesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // For now, allow all users to access security monitoring
  // In production, you might want to restrict this to admin roles only
  
  return (
    <div className="container mx-auto py-6">
      <SecurityMonitoringDashboard />
    </div>
  );
};