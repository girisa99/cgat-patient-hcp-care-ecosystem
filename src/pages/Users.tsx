
import React from 'react';
import DashboardHeader from "@/components/layout/DashboardHeader";
import { MasterApplicationTable } from '@/components/master/MasterApplicationTable';
import { UserManagementModule } from '@/components/isolation/IsolatedModule';
import { StateIsolationProvider } from '@/components/isolation/StateIsolation';
import { StabilityProtectedUserModule } from '@/components/stability/ProtectedComponents';
import { useDuplicateProtection, useBreakingChangeProtection } from '@/hooks/stability/useProtectionHooks';

const Users = () => {
  console.log('👥 Users Page - Now using Phase 4 Stability Protection');

  // Protect against duplicate data fetching
  const { protectedFetch } = useDuplicateProtection(
    'users-data',
    'user-management',
    async () => {
      // This would be your actual fetch function
      return Promise.resolve([]);
    }
  );

  // Protect against breaking changes to MasterApplicationTable
  const { validateProps } = useBreakingChangeProtection(
    'MasterApplicationTable',
    [], // Expected props - empty for now since it takes no props
    'user-management'
  );

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StateIsolationProvider moduleId="user-management" isolated={true}>
          <StabilityProtectedUserModule>
            <UserManagementModule>
              <MasterApplicationTable />
            </UserManagementModule>
          </StabilityProtectedUserModule>
        </StateIsolationProvider>
      </div>
    </div>
  );
};

export default Users;
