import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users as UsersIcon, 
  UserPlus, 
  RefreshCw, 
  Search, 
  Eye, 
  Shield, 
  UserX, 
  Edit, 
  Trash2,
  Mail,
  MailCheck,
  Building,
  Puzzle,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useMasterData } from '@/hooks/useMasterData';
import { DataTable, ColumnConfig } from '@/components/ui/DataTable';
import { ActionButton, BulkActionConfig } from '@/components/ui/ActionButton';
import AppLayout from '@/components/layout/AppLayout';

const Users: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useMasterAuth();
  const { 
    users, 
    roles,
    facilities,
    modules,
    isLoading, 
    error, 
    createUser,
    assignRole,
    assignModule,
    assignFacility,
    resendEmailVerification,
    deactivateUser,
    refreshData, 
    searchUsers,
    stats,
    isCreatingUser,
    isAssigningRole,
    isAssigningModule,
    isAssigningFacility,
    isResendingVerification,
    isDeactivatingUser
  } = useMasterData();
  
  // Dialog states
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false);
  const [isAssignModuleOpen, setIsAssignModuleOpen] = useState(false);
  const [isAssignFacilityOpen, setIsAssignFacilityOpen] = useState(false);
  const [isViewUserOpen, setIsViewUserOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form states
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    facilityId: '',
    roleId: ''
  });
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [selectedModuleAccess, setSelectedModuleAccess] = useState<string>('read');
  const [selectedFacility, setSelectedFacility] = useState<string>('');

  console.log('👥 Enhanced Users Page - Complete User Management System');

  // Enhanced table columns with all required fields
  const columns: ColumnConfig[] = [
    {
      key: 'name',
      label: 'Name',
      render: (_, row) => (
        <div>
          <div className="font-medium text-gray-900">
            {row.first_name} {row.last_name}
          </div>
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      ),
      className: 'font-medium'
    },
    {
      key: 'verification',
      label: 'Verification',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {row.is_email_verified ? (
            <Badge variant="default" className="text-xs bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
              <AlertCircle className="h-3 w-3 mr-1" />
              Unverified
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'roles',
      label: 'Roles',
      render: (_, row) => (
        <div className="flex flex-wrap gap-1">
          {row.user_roles?.map((ur: any, index: number) => (
            <Badge key={index} variant="outline" className="text-xs">
              {ur.role?.name || 'Unknown Role'}
            </Badge>
          ))}
          {(!row.user_roles || row.user_roles.length === 0) && (
            <Badge variant="secondary" className="text-xs text-gray-500">No roles</Badge>
          )}
        </div>
      )
    },
    {
      key: 'facility',
      label: 'Facility',
      render: (_, row) => (
        <div className="text-sm">
          {row.facility ? (
            <div>
              <div className="font-medium">{row.facility.name}</div>
              <div className="text-gray-500 capitalize">{row.facility.facility_type}</div>
            </div>
          ) : (
            <span className="text-gray-400">No facility</span>
          )}
        </div>
      )
    },
    {
      key: 'modules',
      label: 'Modules Assigned',
      render: (_, row) => (
        <div className="flex flex-wrap gap-1">
          {row.assigned_modules?.slice(0, 3).map((ma: any, index: number) => (
            <Badge key={index} variant="outline" className="text-xs">
              {ma.module?.name}
            </Badge>
          ))}
          {row.assigned_modules?.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{row.assigned_modules.length - 3} more
            </Badge>
          )}
          {(!row.assigned_modules || row.assigned_modules.length === 0) && (
            <span className="text-xs text-gray-400">No modules</span>
          )}
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value) => (
        <div className="text-sm text-gray-600">
          {value || <span className="text-gray-400">-</span>}
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value) => value ? new Date(value).toLocaleDateString() : '-',
      sortable: true
    }
  ];

  // Enhanced individual row actions
  const renderRowActions = (user: any) => (
    <div className="flex items-center gap-1">
      <ActionButton
        icon={Eye}
        label="View"
        onClick={() => {
          setSelectedUser(user);
          setIsViewUserOpen(true);
        }}
        variant="outline"
        size="sm"
      />
      <ActionButton
        icon={Shield}
        label="Assign Role"
        onClick={() => {
          setSelectedUser(user);
          setIsAssignRoleOpen(true);
        }}
        variant="outline"
        size="sm"
      />
      <ActionButton
        icon={Puzzle}
        label="Assign Module"
        onClick={() => {
          setSelectedUser(user);
          setIsAssignModuleOpen(true);
        }}
        variant="outline"
        size="sm"
      />
      <ActionButton
        icon={Building}
        label="Assign Facility"
        onClick={() => {
          setSelectedUser(user);
          setIsAssignFacilityOpen(true);
        }}
        variant="outline"
        size="sm"
      />
      {!user.is_email_verified && (
        <ActionButton
          icon={Mail}
          label="Resend Verification"
          onClick={() => handleResendVerification(user)}
          variant="outline"
          size="sm"
        />
      )}
      <ActionButton
        icon={UserX}
        label="Deactivate"
        onClick={() => handleDeactivateUser(user)}
        variant="outline"
        size="sm"
      />
    </div>
  );

  // Enhanced bulk actions
  const bulkActions: BulkActionConfig[] = [
    {
      id: 'assign-role',
      label: 'Assign Role',
      icon: Shield,
      handler: (selectedIds) => console.log('Bulk assign role:', selectedIds),
      permission: 'users.write'
    },
    {
      id: 'assign-module',
      label: 'Assign Module',
      icon: Puzzle,
      handler: (selectedIds) => console.log('Bulk assign module:', selectedIds),
      permission: 'users.write'
    },
    {
      id: 'assign-facility',
      label: 'Assign Facility',
      icon: Building,
      handler: (selectedIds) => console.log('Bulk assign facility:', selectedIds),
      permission: 'users.write'
    },
    {
      id: 'resend-verification',
      label: 'Resend Verification',
      icon: Mail,
      handler: (selectedIds) => console.log('Bulk resend verification:', selectedIds),
      permission: 'users.write'
    },
    {
      id: 'deactivate',
      label: 'Deactivate',
      icon: UserX,
      handler: (selectedIds) => console.log('Bulk deactivate:', selectedIds),
      permission: 'users.write'
    }
  ];

  // Enhanced handlers
  const handleAddUser = () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email) {
      return;
    }

    createUser({
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      phone: newUser.phone,
      facilityId: newUser.facilityId || undefined,
      roleId: newUser.roleId || undefined
    });

    setIsAddUserOpen(false);
    setNewUser({ firstName: '', lastName: '', email: '', phone: '', facilityId: '', roleId: '' });
  };

  const handleAssignRole = () => {
    if (!selectedUser || !selectedRole) return;

    assignRole({
      userId: selectedUser.id,
      roleId: selectedRole
    });

    setIsAssignRoleOpen(false);
    setSelectedRole('');
  };

  const handleAssignModule = () => {
    if (!selectedUser || !selectedModule) return;

    assignModule({
      userId: selectedUser.id,
      moduleId: selectedModule,
      accessLevel: selectedModuleAccess
    });

    setIsAssignModuleOpen(false);
    setSelectedModule('');
    setSelectedModuleAccess('read');
  };

  const handleAssignFacility = () => {
    if (!selectedUser || !selectedFacility) return;

    assignFacility({
      userId: selectedUser.id,
      facilityId: selectedFacility
    });

    setIsAssignFacilityOpen(false);
    setSelectedFacility('');
  };

  const handleResendVerification = (user: any) => {
    resendEmailVerification({
      userId: user.id,
      email: user.email
    });
  };

  const handleDeactivateUser = (user: any) => {
    if (!confirm(`Are you sure you want to deactivate ${user.first_name} ${user.last_name}?`)) {
      return;
    }
    
    deactivateUser({ userId: user.id });
  };

  const filteredUsers = searchUsers(searchQuery);

  // Loading state
  if (authLoading || isLoading) {
    return (
      <AppLayout title="User Management">
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <div className="text-muted-foreground">Loading users...</div>
        </div>
      </AppLayout>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <AppLayout title="User Management">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">Please log in to view users</div>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AppLayout title="User Management">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-600 mb-4">Error loading users: {error.message}</div>
            <Button onClick={refreshData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="User Management">
      <div className="space-y-6">
        {/* Enhanced Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
            <div className="text-sm text-blue-600">Total Users</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">{stats.verifiedUsers}</div>
            <div className="text-sm text-green-600">Verified</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">{stats.unverifiedUsers}</div>
            <div className="text-sm text-orange-600">Unverified</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">{stats.adminCount}</div>
            <div className="text-sm text-purple-600">Admins</div>
          </div>
          <div className="text-center p-4 bg-teal-50 rounded-lg border border-teal-200">
            <div className="text-2xl font-bold text-teal-600">{stats.staffCount}</div>
            <div className="text-sm text-teal-600">Staff</div>
          </div>
        </div>

        {/* Main Users Table Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5" />
                User Management ({filteredUsers.length} users)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={refreshData}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                
                {/* Enhanced Add User Dialog */}
                <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                  <DialogTrigger asChild>
                    <ActionButton
                      icon={UserPlus}
                      label="Add User"
                      onClick={() => {}}
                      variant="default"
                      size="sm"
                    />
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New User</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            value={newUser.firstName}
                            onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                            placeholder="First name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            value={newUser.lastName}
                            onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                            placeholder="Last name"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Email address"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={newUser.phone}
                          onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Phone number"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="roleId">Initial Role</Label>
                        <Select value={newUser.roleId} onValueChange={(value) => setNewUser(prev => ({ ...prev, roleId: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name} {role.description && `- ${role.description}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="facilityId">Facility</Label>
                        <Select value={newUser.facilityId} onValueChange={(value) => setNewUser(prev => ({ ...prev, facilityId: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a facility (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {facilities.map((facility) => (
                              <SelectItem key={facility.id} value={facility.id}>
                                {facility.name} ({facility.facility_type})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button 
                        onClick={handleAddUser} 
                        disabled={isCreatingUser || !newUser.firstName || !newUser.lastName || !newUser.email}
                        className="w-full"
                      >
                        {isCreatingUser ? 'Creating...' : 'Create User'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Enhanced Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search users by name, email, role, or facility..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Enhanced Users Table */}
              <DataTable
                data={filteredUsers}
                columns={columns}
                actions={renderRowActions}
                bulkActions={bulkActions}
                permissions={['users.read', 'users.write', 'users.delete']}
                searchable={false}
                sortable={true}
                pagination={true}
                pageSize={10}
                loading={isLoading}
                emptyMessage="No users found"
                onRefresh={refreshData}
              />
            </div>
          </CardContent>
        </Card>

        {/* View User Dialog */}
        <Dialog open={isViewUserOpen} onOpenChange={setIsViewUserOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="roles">Roles</TabsTrigger>
                  <TabsTrigger value="modules">Modules</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <div className="text-sm font-medium">{selectedUser.first_name} {selectedUser.last_name}</div>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <div className="text-sm">{selectedUser.email}</div>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <div className="text-sm">{selectedUser.phone || 'Not provided'}</div>
                    </div>
                    <div>
                      <Label>Email Verification</Label>
                      <div className="flex items-center gap-2">
                        {selectedUser.is_email_verified ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Unverified
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label>Facility</Label>
                      <div className="text-sm">
                        {selectedUser.facility ? `${selectedUser.facility.name} (${selectedUser.facility.facility_type})` : 'No facility assigned'}
                      </div>
                    </div>
                    <div>
                      <Label>Created</Label>
                      <div className="text-sm">{new Date(selectedUser.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="roles" className="space-y-4">
                  <div>
                    <Label>Assigned Roles</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedUser.user_roles?.map((ur: any, index: number) => (
                        <Badge key={index} variant="outline">
                          {ur.role?.name}
                        </Badge>
                      ))}
                      {(!selectedUser.user_roles || selectedUser.user_roles.length === 0) && (
                        <div className="text-sm text-gray-500">No roles assigned</div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="modules" className="space-y-4">
                  <div>
                    <Label>Assigned Modules</Label>
                    <div className="space-y-2 mt-2">
                      {selectedUser.assigned_modules?.map((ma: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{ma.module?.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {ma.access_level}
                          </Badge>
                        </div>
                      ))}
                      {(!selectedUser.assigned_modules || selectedUser.assigned_modules.length === 0) && (
                        <div className="text-sm text-gray-500">No modules assigned</div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>

        {/* Assign Role Dialog */}
        <Dialog open={isAssignRoleOpen} onOpenChange={setIsAssignRoleOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Role to {selectedUser?.first_name} {selectedUser?.last_name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="role">Select Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name} {role.description && `- ${role.description}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleAssignRole} 
                disabled={isAssigningRole || !selectedRole}
                className="w-full"
              >
                {isAssigningRole ? 'Assigning...' : 'Assign Role'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Assign Module Dialog */}
        <Dialog open={isAssignModuleOpen} onOpenChange={setIsAssignModuleOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Module to {selectedUser?.first_name} {selectedUser?.last_name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="module">Select Module</Label>
                <Select value={selectedModule} onValueChange={setSelectedModule}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a module" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map((module) => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.name} {module.description && `- ${module.description}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="accessLevel">Access Level</Label>
                <Select value={selectedModuleAccess} onValueChange={setSelectedModuleAccess}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose access level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="write">Write</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleAssignModule} 
                disabled={isAssigningModule || !selectedModule}
                className="w-full"
              >
                {isAssigningModule ? 'Assigning...' : 'Assign Module'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Assign Facility Dialog */}
        <Dialog open={isAssignFacilityOpen} onOpenChange={setIsAssignFacilityOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Facility to {selectedUser?.first_name} {selectedUser?.last_name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="facility">Select Facility</Label>
                <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a facility" />
                  </SelectTrigger>
                  <SelectContent>
                    {facilities.map((facility) => (
                      <SelectItem key={facility.id} value={facility.id}>
                        {facility.name} ({facility.facility_type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleAssignFacility} 
                disabled={isAssigningFacility || !selectedFacility}
                className="w-full"
              >
                {isAssigningFacility ? 'Assigning...' : 'Assign Facility'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Users;
