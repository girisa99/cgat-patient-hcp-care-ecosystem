
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Filter,
  Download,
  Edit,
  Mail,
  Phone,
  Building2,
  Users,
  UserPlus,
  MoreHorizontal
} from 'lucide-react';
import { useConsolidatedUsers } from '@/hooks/useConsolidatedUsers';
import UsersList from '@/components/users/UsersList';
import BulkRoleAssignment from '@/components/users/BulkRoleAssignment';

export const ConsolidatedUserManagement: React.FC = () => {
  const { 
    users, 
    isLoading, 
    getUserStats, 
    searchUsers,
    createUser,
    assignRole,
    assignFacility,
    meta
  } = useConsolidatedUsers();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('users');

  const stats = getUserStats();
  const filteredUsers = searchUsers(searchQuery);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading users from consolidated data source...</p>
      </div>
    );
  }

  const handleCreateUser = () => {
    // TODO: Implement create user dialog
    console.log('Create user clicked');
  };

  const handleAssignRole = (userId: string) => {
    // TODO: Implement role assignment dialog
    console.log('Assign role clicked for user:', userId);
  };

  const handleAssignFacility = (userId: string) => {
    // TODO: Implement facility assignment dialog
    console.log('Assign facility clicked for user:', userId);
  };

  const handleEditUser = (user: any) => {
    // TODO: Implement edit user dialog
    console.log('Edit user clicked:', user);
  };

  return (
    <div className="space-y-6">
      {/* Data Source Information */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-900 text-lg">
            <Users className="h-5 w-5" />
            Consolidated User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Data Source:</strong> {meta.dataSource}</p>
            <div className="flex gap-4">
              <span><strong>Total:</strong> {meta.totalUsers}</span>
              <span><strong>Patients:</strong> {meta.patientCount}</span>
              <span><strong>Staff:</strong> {meta.staffCount}</span>
              <span><strong>Admins:</strong> {meta.adminCount}</span>
            </div>
            <p className="text-xs"><strong>Last Updated:</strong> {new Date(meta.lastFetched).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Compact Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
          <Users className="h-5 w-5 text-blue-600" />
          <div>
            <div className="text-xl font-semibold text-blue-900">{stats.total}</div>
            <div className="text-sm text-blue-700">Total Users</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
          <Badge className="h-5 w-5 bg-green-600" />
          <div>
            <div className="text-xl font-semibold text-green-900">{stats.withRoles}</div>
            <div className="text-sm text-green-700">With Roles</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
          <div className="h-5 w-5 bg-purple-600 rounded" />
          <div>
            <div className="text-xl font-semibold text-purple-900">{stats.active}</div>
            <div className="text-sm text-purple-700">Active</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
          <Building2 className="h-5 w-5 text-orange-600" />
          <div>
            <div className="text-xl font-semibold text-orange-900">{stats.withFacilities}</div>
            <div className="text-sm text-orange-700">With Facilities</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">User Management</CardTitle>
              <p className="text-gray-600 mt-1">Manage users, roles, and permissions across the platform</p>
            </div>
            <Button onClick={handleCreateUser}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-6">
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

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users List ({filteredUsers.length})
              </TabsTrigger>
              <TabsTrigger value="bulk" className="flex items-center gap-2">
                <MoreHorizontal className="h-4 w-4" />
                Bulk Actions
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="mt-6">
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-lg">
                            {user.first_name} {user.last_name}
                          </h3>
                          {user.user_roles?.map((userRole, index) => (
                            <Badge key={index} variant="outline">
                              {userRole.roles?.name || 'Unknown'}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="h-4 w-4" />
                              {user.phone}
                            </div>
                          )}
                          {user.facilities && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Building2 className="h-4 w-4" />
                              {user.facilities.name}
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-500">
                          Created: {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredUsers.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No users found matching your search.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="bulk" className="mt-6">
              <BulkRoleAssignment />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
