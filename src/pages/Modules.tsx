
import React, { useState } from 'react';
import { AdminStatsGrid, StatCard } from '@/components/layout/AdminStatsGrid';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Shield, Activity, Users, Settings, Search, Filter, Download } from 'lucide-react';
import ModulesList from '@/components/modules/ModulesList';
import CreateModuleDialog from '@/components/modules/CreateModuleDialog';
import EditModuleDialog from '@/components/modules/EditModuleDialog';
import AssignModuleToRoleDialog from '@/components/modules/AssignModuleToRoleDialog';
import { UnifiedPageWrapper } from '@/components/layout/UnifiedPageWrapper';
import { useUnifiedPageData } from '@/hooks/useUnifiedPageData';

/**
 * Modules Page - UNIFIED LOCKED IMPLEMENTATION
 * Uses single source of truth via UnifiedPageWrapper and useUnifiedPageData
 */
const Modules: React.FC = () => {
  const { modules } = useUnifiedPageData();
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAssignToRoleDialog, setShowAssignToRoleDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  console.log('🔒 Modules Page - LOCKED VERSION active with unified data source');

  const stats = modules.getModuleStats();

  // Filter modules based on search using unified source
  const filteredModules = searchQuery.trim() 
    ? modules.data.filter(module => 
        module.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : modules.data;

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
    <UnifiedPageWrapper
      title="Modules Management"
      subtitle={`Unified modules management system (${modules.data.length} modules from ${modules.meta?.dataSource})`}
      headerActions={headerActions}
      fluid
    >
      <div className="space-y-6">
        {/* Stats Grid - Real Data from Single Source */}
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
            {modules.isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading modules from unified source...</p>
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
    </UnifiedPageWrapper>
  );
};

export default Modules;
