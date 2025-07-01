
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { AdminStatsGrid, StatCard } from '@/components/layout/AdminStatsGrid';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Shield, Activity, Users, Settings, Search, Filter, Download } from 'lucide-react';
import ModulesList from '@/components/modules/ModulesList';
import CreateModuleDialog from '@/components/modules/CreateModuleDialog';
import EditModuleDialog from '@/components/modules/EditModuleDialog';
import AssignModuleToRoleDialog from '@/components/modules/AssignModuleToRoleDialog';
import { useModules } from '@/hooks/useModules';

const Modules = () => {
  const { modules, isLoading, getModuleStats } = useModules();
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAssignToRoleDialog, setShowAssignToRoleDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const stats = getModuleStats();

  // Filter modules based on search
  const filteredModules = modules.filter(module => 
    module.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    module.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditModule = (module: any) => {
    setSelectedModule(module);
    setShowEditDialog(true);
  };

  const handleAssignToRole = (module: any) => {
    setSelectedModule(module);
    setShowAssignToRoleDialog(true);
  };

  const headerActions = (
    <Button onClick={() => setShowCreateDialog(true)}>
      <Plus className="h-4 w-4 mr-2" />
      Add Module
    </Button>
  );

  return (
    <MainLayout>
      <PageContainer
        title="Modules Management"
        subtitle="Manage system modules and role assignments"
        headerActions={headerActions}
      >
        <div className="space-y-6">
          {/* Stats Grid */}
          <AdminStatsGrid columns={4}>
            <StatCard
              title="Total Modules"
              value={stats.total}
              icon={Shield}
              description={`${stats.active} active, ${stats.inactive} inactive`}
            />
            <StatCard
              title="Active Modules"
              value={stats.active}
              icon={Activity}
              description="Currently available"
            />
            <StatCard
              title="User Accessible"
              value={stats.userAccessible}
              icon={Users}
              description="Available to users"
            />
            <StatCard
              title="System Modules"
              value={stats.total}
              icon={Settings}
              description="All system modules"
            />
          </AdminStatsGrid>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search modules by name or description..."
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

          {/* Modules List */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading modules...</p>
                </div>
              ) : (
                <ModulesList
                  modules={filteredModules}
                  onEditModule={handleEditModule}
                  onAssignToRole={handleAssignToRole}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dialogs */}
        <CreateModuleDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />

        <EditModuleDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          module={selectedModule}
        />

        <AssignModuleToRoleDialog
          open={showAssignToRoleDialog}
          onOpenChange={setShowAssignToRoleDialog}
          module={selectedModule}
        />
      </PageContainer>
    </MainLayout>
  );
};

export default Modules;
