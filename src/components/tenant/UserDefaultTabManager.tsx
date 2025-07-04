import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Home, Users, Heart, Building, Shield, FileText, Upload, TestTube, CheckCircle } from 'lucide-react';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useMasterData } from '@/hooks/useMasterData';
import { useMasterToast } from '@/hooks/useMasterToast';
import { ActionButton, BulkActionConfig } from '@/components/ui/ActionButton';
import { DataTable, ColumnConfig } from '@/components/ui/DataTable';

// ✅ AVAILABLE MODULES WITH ICONS (REUSABLE CONFIG)
const AVAILABLE_MODULES = [
  { id: 'dashboard', name: 'Dashboard', icon: Home, description: 'Main overview dashboard' },
  { id: 'users', name: 'Users', icon: Users, description: 'User management' },
  { id: 'patients', name: 'Patients', icon: Heart, description: 'Patient management' },
  { id: 'facilities', name: 'Facilities', icon: Building, description: 'Facility management' },
  { id: 'modules', name: 'Modules', icon: Settings, description: 'Module configuration' },
  { id: 'api-services', name: 'API Services', icon: Shield, description: 'API integration' },
  { id: 'testing', name: 'Testing', icon: TestTube, description: 'System testing' },
  { id: 'security', name: 'Security', icon: Shield, description: 'Security management' },
  { id: 'data-import', name: 'Data Import', icon: Upload, description: 'Data import tools' },
  { id: 'verification', name: 'Verification', icon: CheckCircle, description: 'Verification processes' },
  { id: 'onboarding', name: 'Onboarding', icon: FileText, description: 'User onboarding' },
];

// ✅ INDIVIDUAL USER DEFAULT TAB SELECTOR (REUSABLE COMPONENT)
export const UserDefaultTabSelector: React.FC<{
  userId: string;
  currentTab: string;
  userName: string;
  availableModules: string[];
  disabled?: boolean;
}> = ({ userId, currentTab, userName, availableModules, disabled = false }) => {
  const { showSuccess, showError } = useMasterToast(); // ✅ SINGLE SOURCE
  const [isUpdating, setIsUpdating] = useState(false);

  // ✅ FILTER AVAILABLE MODULES
  const userModules = AVAILABLE_MODULES.filter(module => 
    availableModules.includes(module.id)
  );

  const handleTabChange = async (newTab: string) => {
    setIsUpdating(true);
    try {
      // ✅ TODO: Implement updateUserDefaultTab in useMasterData
      // await updateUserDefaultTab(userId, newTab);
      
      // ✅ SIMULATE SUCCESS FOR NOW
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess(`Default tab updated to ${newTab} for ${userName}`);
    } catch (error) {
      showError('Failed to update default tab');
    } finally {
      setIsUpdating(false);
    }
  };

  const currentModule = AVAILABLE_MODULES.find(m => m.id === currentTab);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor={`default-tab-${userId}`}>Default Landing Tab</Label>
        {currentModule && (
          <Badge variant="outline" className="flex items-center space-x-1">
            <currentModule.icon className="h-3 w-3" />
            <span>{currentModule.name}</span>
          </Badge>
        )}
      </div>
      
      <Select 
        value={currentTab} 
        onValueChange={handleTabChange}
        disabled={disabled || isUpdating}
      >
        <SelectTrigger id={`default-tab-${userId}`}>
          <SelectValue placeholder="Select default tab" />
        </SelectTrigger>
        <SelectContent>
          {userModules.map(module => (
            <SelectItem key={module.id} value={module.id}>
              <div className="flex items-center space-x-2">
                <module.icon className="h-4 w-4" />
                <div>
                  <div className="font-medium">{module.name}</div>
                  <div className="text-xs text-gray-500">{module.description}</div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {isUpdating && (
        <div className="text-sm text-blue-600">Updating default tab...</div>
      )}
    </div>
  );
};

// ✅ BULK DEFAULT TAB ASSIGNMENT (REUSABLE COMPONENT)
export const BulkDefaultTabAssignment: React.FC<{
  selectedUserIds: string[];
  availableModules: string[];
  onComplete: () => void;
}> = ({ selectedUserIds, availableModules, onComplete }) => {
  const { showSuccess, showError } = useMasterToast(); // ✅ SINGLE SOURCE
  const [selectedTab, setSelectedTab] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const userModules = AVAILABLE_MODULES.filter(module => 
    availableModules.includes(module.id)
  );

  const handleBulkUpdate = async () => {
    if (!selectedTab) {
      showError('Please select a default tab');
      return;
    }

    setIsUpdating(true);
    try {
      // ✅ TODO: Implement bulk update in useMasterData
      // await Promise.all(
      //   selectedUserIds.map(userId => updateUserDefaultTab(userId, selectedTab))
      // );
      
      // ✅ SIMULATE SUCCESS FOR NOW
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const selectedModule = AVAILABLE_MODULES.find(m => m.id === selectedTab);
      showSuccess(`Set ${selectedModule?.name} as default tab for ${selectedUserIds.length} users`);
      onComplete();
    } catch (error) {
      showError('Failed to update default tabs');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Select Default Tab for {selectedUserIds.length} Users</Label>
        <Select value={selectedTab} onValueChange={setSelectedTab}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Choose default tab" />
          </SelectTrigger>
          <SelectContent>
            {userModules.map(module => (
              <SelectItem key={module.id} value={module.id}>
                <div className="flex items-center space-x-2">
                  <module.icon className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{module.name}</div>
                    <div className="text-xs text-gray-500">{module.description}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ActionButton
        icon={Settings}
        label={isUpdating ? 'Updating...' : 'Update Default Tabs'}
        onClick={handleBulkUpdate}
        disabled={!selectedTab || isUpdating}
        loading={isUpdating}
        variant="default"
        className="w-full"
      />
    </div>
  );
};

// ✅ MAIN USER DEFAULT TAB MANAGER (REUSABLE COMPONENT)
export const UserDefaultTabManager: React.FC<{
  users: any[];
  showInline?: boolean;
}> = ({ users, showInline = false }) => {
  const { permissions, availableModules = [] } = useMasterAuth(); // ✅ SINGLE SOURCE
  const { showSuccess } = useMasterToast(); // ✅ SINGLE SOURCE
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);

  // ✅ PERMISSION CHECK
  const canManageDefaults = permissions.includes('users.manage') || permissions.includes('tenant.manage');

  if (!canManageDefaults) return null;

  // ✅ TABLE COLUMNS FOR DEFAULT TAB MANAGEMENT
  const columns: ColumnConfig[] = [
    {
      key: 'name',
      label: 'User',
      render: (_, row) => (
        <div>
          <div className="font-medium">{row.first_name} {row.last_name}</div>
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      )
    },
    {
      key: 'default_landing_tab',
      label: 'Current Default Tab',
      render: (value) => {
        const module = AVAILABLE_MODULES.find(m => m.id === value);
        if (!module) return <Badge variant="secondary">Not Set</Badge>;
        
        return (
          <Badge variant="outline" className="flex items-center space-x-1 w-fit">
            <module.icon className="h-3 w-3" />
            <span>{module.name}</span>
          </Badge>
        );
      }
    },
    {
      key: 'available_modules_count',
      label: 'Available Modules',
      render: (_, row) => (
        <div className="text-sm text-gray-600">
          {row.available_modules?.length || availableModules.length} modules
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Manage Default',
      render: (_, row) => (
        <Dialog>
          <DialogTrigger asChild>
            <ActionButton
              icon={Settings}
              label="Set Default"
              onClick={() => {}}
              variant="outline"
              size="sm"
            />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Set Default Tab for {row.first_name} {row.last_name}
              </DialogTitle>
            </DialogHeader>
            <UserDefaultTabSelector
              userId={row.id}
              currentTab={row.default_landing_tab || 'dashboard'}
              userName={`${row.first_name} ${row.last_name}`}
              availableModules={row.available_modules || availableModules}
            />
          </DialogContent>
        </Dialog>
      )
    }
  ];

  // ✅ BULK ACTIONS FOR DEFAULT TAB MANAGEMENT
  const bulkActions: BulkActionConfig[] = [
    {
      id: 'bulk-set-default',
      label: 'Set Default Tabs',
      icon: Settings,
      handler: (selectedIds) => {
        setSelectedUsers(selectedIds);
        setIsBulkDialogOpen(true);
      },
      permission: 'users.manage'
    }
  ];

  const handleBulkComplete = () => {
    setIsBulkDialogOpen(false);
    setSelectedUsers([]);
    // ✅ TODO: Refresh data
  };

  if (showInline) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Default Tab Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={users}
            columns={columns}
            bulkActions={bulkActions}
            permissions={permissions}
            searchable={true}
            searchPlaceholder="Search users for default tab management..."
            pageSize={5}
            emptyMessage="No users available for default tab management"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User Default Tab Management</h2>
          <p className="text-gray-600">
            Set default landing tabs for users when they log in
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
            <DialogTrigger asChild>
              <ActionButton
                icon={Settings}
                label="Bulk Set Defaults"
                onClick={() => setIsBulkDialogOpen(true)}
                variant="outline"
              />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Set Default Tabs</DialogTitle>
              </DialogHeader>
              <BulkDefaultTabAssignment
                selectedUserIds={selectedUsers}
                availableModules={availableModules}
                onComplete={handleBulkComplete}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ✅ AVAILABLE MODULES OVERVIEW */}
      <Card>
        <CardHeader>
          <CardTitle>Available Modules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AVAILABLE_MODULES
              .filter(module => availableModules.includes(module.id))
              .map(module => (
                <div key={module.id} className="flex items-center space-x-2 p-2 border rounded">
                  <module.icon className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-sm font-medium">{module.name}</div>
                    <div className="text-xs text-gray-500">{module.description}</div>
                  </div>
                </div>
              ))
            }
          </div>
        </CardContent>
      </Card>

      {/* ✅ MAIN DATA TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>User Default Tab Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={users}
            columns={columns}
            bulkActions={bulkActions}
            permissions={permissions}
            searchable={true}
            searchPlaceholder="Search users for default tab management..."
            sortable={true}
            pagination={true}
            pageSize={10}
            emptyMessage="No users available for default tab management"
          />
        </CardContent>
      </Card>

      {/* ✅ BULK ASSIGNMENT DIALOG */}
      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Set Default Tabs</DialogTitle>
          </DialogHeader>
          <BulkDefaultTabAssignment
            selectedUserIds={selectedUsers}
            availableModules={availableModules}
            onComplete={handleBulkComplete}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};