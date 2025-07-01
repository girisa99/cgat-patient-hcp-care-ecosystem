
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Plus, 
  Search, 
  Filter,
  Download,
  Settings,
  Activity,
  Users
} from 'lucide-react';
import { useModules } from '@/hooks/useModules';
import ModulesList from './ModulesList';
import CreateModuleDialog from './CreateModuleDialog';
import EditModuleDialog from './EditModuleDialog';
import AssignModuleToRoleDialog from './AssignModuleToRoleDialog';

export const ModulesManagement: React.FC = () => {
  const { modules, isLoading, getModuleStats } = useModules();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<any>(null);
  
  // Dialog states
  const [createModuleOpen, setCreateModuleOpen] = useState(false);
  const [editModuleOpen, setEditModuleOpen] = useState(false);
  const [assignToRoleOpen, setAssignToRoleOpen] = useState(false);

  const stats = getModuleStats();
  const filteredModules = modules.filter(module => 
    module.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    module.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditModule = (module: any) => {
    setSelectedModule(module);
    setEditModuleOpen(true);
  };

  const handleAssignToRole = (module: any) => {
    setSelectedModule(module);
    setAssignToRoleOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Modules Management</h1>
          <p className="text-gray-600">Manage system modules and role assignments</p>
        </div>
        <Button onClick={() => setCreateModuleOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Module
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} active, {stats.inactive} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Modules</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Currently available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Accessible</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.userAccessible}</div>
            <p className="text-xs text-muted-foreground">Available to users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Modules</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All system modules</p>
          </CardContent>
        </Card>
      </div>

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
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Loading modules...</p>
          </CardContent>
        </Card>
      ) : (
        <ModulesList
          modules={filteredModules}
          onEditModule={handleEditModule}
          onAssignToRole={handleAssignToRole}
        />
      )}

      {/* Dialogs */}
      <CreateModuleDialog
        open={createModuleOpen}
        onOpenChange={setCreateModuleOpen}
      />

      <EditModuleDialog
        open={editModuleOpen}
        onOpenChange={setEditModuleOpen}
        module={selectedModule}
      />

      <AssignModuleToRoleDialog
        open={assignToRoleOpen}
        onOpenChange={setAssignToRoleOpen}
        module={selectedModule}
      />
    </div>
  );
};
