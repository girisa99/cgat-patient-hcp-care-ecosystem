
import React, { useState } from 'react';
import { AdminStatsGrid, StatCard } from '@/components/layout/AdminStatsGrid';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Users as UsersIcon, Shield, Building2, UserCheck, Search, Filter, Download } from 'lucide-react';
import { UserManagementMain } from '@/components/admin/UserManagement/UserManagementMain';
import { UnifiedPageWrapper } from '@/components/layout/UnifiedPageWrapper';
import { useUnifiedPageData } from '@/hooks/useUnifiedPageData';

/**
 * Users Page - UNIFIED IMPLEMENTATION
 * Uses single source of truth via UnifiedPageWrapper and useUnifiedPageData
 */
const Users: React.FC = () => {
  const { users } = useUnifiedPageData();
  const [searchQuery, setSearchQuery] = useState('');

  console.log('🎯 Users Page - Unified Single Source Implementation');

  const handleCreateUser = () => {
    console.log('🆕 Create user action triggered');
  };

  // Get user statistics from unified source with proper calculation
  const stats = users.getUserStats();
  
  // Calculate specific counts for display
  const patientCount = users.getPatients().length;
  const staffCount = users.getStaff().length;
  const adminCount = users.getAdmins().length;

  const headerActions = (
    <Button onClick={handleCreateUser}>
      <Plus className="h-4 w-4 mr-2" />
      Add User
    </Button>
  );

  return (
    <UnifiedPageWrapper
      title="Users Management"
      subtitle={`Unified user management system (${users.data.length} users from ${users.meta.dataSource})`}
      headerActions={headerActions}
      fluid
    >
      <div className="space-y-6">
        {/* Stats Grid - Real Data from Single Source */}
        <AdminStatsGrid columns={4}>
          <StatCard
            title="Total Users"
            value={stats.total}
            icon={UsersIcon}
            description="All registered users"
          />
          <StatCard
            title="Patients"
            value={patientCount}
            icon={UserCheck}
            description="Patient caregivers"
          />
          <StatCard
            title="Healthcare Staff"
            value={staffCount}
            icon={Shield}
            description="Medical professionals"
          />
          <StatCard
            title="Administrators"
            value={adminCount}
            icon={Building2}
            description="System administrators"
          />
        </AdminStatsGrid>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* User Management Component */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <UserManagementMain />
          </CardContent>
        </Card>
      </div>
    </UnifiedPageWrapper>
  );
};

export default Users;
