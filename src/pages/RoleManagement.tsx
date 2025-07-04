/**
 * ROLE MANAGEMENT PAGE - SINGLE SOURCE IMPLEMENTATION
 * Complete role, facility, and module management using single master hook
 */
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Shield, 
  Building2, 
  Package, 
  Users,
  Plus,
  UserPlus,
  RefreshCw
} from 'lucide-react';
import { useMasterRoleManagement } from '@/hooks/useMasterRoleManagement';

const RoleManagement: React.FC = () => {
  const {
    roles,
    facilities,
    modules,
    activeRoles,
    activeFacilities,
    activeModules,
    isLoading,
    isCreatingRole,
    isCreatingFacility,
    isAssigningRole,
    createRole,
    createFacility,
    assignUserRole,
    refreshData,
    getRoleStats,
    getDefaultModulesForRole
  } = useMasterRoleManagement();

  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newFacilityName, setNewFacilityName] = useState('');
  const [newFacilityType, setNewFacilityType] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedFacilityId, setSelectedFacilityId] = useState('');
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);

  console.log('🎯 Role Management Page - Master Hook Integration Active');

  const stats = getRoleStats();

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;
    
    await createRole({
      name: newRoleName,
      description: newRoleDescription
    });
    
    setNewRoleName('');
    setNewRoleDescription('');
  };

  const handleCreateFacility = async () => {
    if (!newFacilityName.trim() || !newFacilityType) return;
    
    await createFacility({
      name: newFacilityName,
      facility_type: newFacilityType
    });
    
    setNewFacilityName('');
    setNewFacilityType('');
  };

  const handleAssignRole = async () => {
    if (!selectedUserId || !selectedRoleId) return;
    
    const selectedRole = roles.find(r => r.id === selectedRoleId);
    const defaultModules = selectedRole ? getDefaultModulesForRole(selectedRole.name) : [];
    
    await assignUserRole({
      userId: selectedUserId,
      roleId: selectedRoleId,
      facilityId: selectedFacilityId || undefined,
      moduleIds: selectedModuleIds.length > 0 ? selectedModuleIds : defaultModules
    });
    
    // Reset form
    setSelectedUserId('');
    setSelectedRoleId('');
    setSelectedFacilityId('');
    setSelectedModuleIds([]);
  };

  if (isLoading) {
    return (
      <AppLayout title="Role Management">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading role management data...</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Role Management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
            <p className="text-muted-foreground">
              Comprehensive role, facility, and module management system
            </p>
          </div>
          <Button onClick={refreshData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Shield className="h-4 w-4 text-blue-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium">Active Roles</p>
                  <div className="text-2xl font-bold">{stats.activeRoles}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Building2 className="h-4 w-4 text-green-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium">Active Facilities</p>
                  <div className="text-2xl font-bold">{stats.activeFacilities}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Package className="h-4 w-4 text-purple-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium">Active Modules</p>
                  <div className="text-2xl font-bold">{stats.activeModules}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="h-4 w-4 text-orange-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium">Total Permissions</p>
                  <div className="text-2xl font-bold">{stats.totalPermissions}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="roles" className="space-y-4">
          <TabsList>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="facilities">Facilities</TabsTrigger>
            <TabsTrigger value="assignments">User Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="roles">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Create Role */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Create New Role
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Role name (e.g., technicalServices)"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                  />
                  <Input
                    placeholder="Role description"
                    value={newRoleDescription}
                    onChange={(e) => setNewRoleDescription(e.target.value)}
                  />
                  <Button 
                    onClick={handleCreateRole}
                    disabled={!newRoleName.trim() || isCreatingRole}
                    className="w-full"
                  >
                    {isCreatingRole ? 'Creating...' : 'Create Role'}
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Roles */}
              <Card>
                <CardHeader>
                  <CardTitle>Existing Roles ({activeRoles.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {activeRoles.map((role) => (
                      <div key={role.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="font-medium">{role.name}</div>
                          {role.description && (
                            <div className="text-sm text-gray-500">{role.description}</div>
                          )}
                        </div>
                        <Badge variant="outline">Active</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="facilities">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Create Facility */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Create New Facility
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Facility name"
                    value={newFacilityName}
                    onChange={(e) => setNewFacilityName(e.target.value)}
                  />
                  <Select value={newFacilityType} onValueChange={setNewFacilityType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select facility type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hospital">Hospital</SelectItem>
                      <SelectItem value="clinic">Clinic</SelectItem>
                      <SelectItem value="laboratory">Laboratory</SelectItem>
                      <SelectItem value="pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="imaging_center">Imaging Center</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleCreateFacility}
                    disabled={!newFacilityName.trim() || !newFacilityType || isCreatingFacility}
                    className="w-full"
                  >
                    {isCreatingFacility ? 'Creating...' : 'Create Facility'}
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Facilities */}
              <Card>
                <CardHeader>
                  <CardTitle>Existing Facilities ({activeFacilities.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {activeFacilities.map((facility) => (
                      <div key={facility.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="font-medium">{facility.name}</div>
                          <div className="text-sm text-gray-500">{facility.facility_type}</div>
                        </div>
                        <Badge variant="outline">Active</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Assign Role to User
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="User ID (for now, manually enter)"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  />
                  
                  <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedFacilityId} onValueChange={setSelectedFacilityId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select facility (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No specific facility</SelectItem>
                      {activeFacilities.map((facility) => (
                        <SelectItem key={facility.id} value={facility.id}>
                          {facility.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Modules (default modules will be assigned based on role)
                  </label>
                  <div className="text-sm text-gray-500 mb-2">
                    Available modules: {activeModules.length}
                  </div>
                </div>

                <Button 
                  onClick={handleAssignRole}
                  disabled={!selectedUserId || !selectedRoleId || isAssigningRole}
                  className="w-full"
                >
                  {isAssigningRole ? 'Assigning...' : 'Assign Role'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default RoleManagement;
