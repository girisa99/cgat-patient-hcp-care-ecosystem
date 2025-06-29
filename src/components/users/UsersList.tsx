
/**
 * PRIMARY COMPONENT: UsersList
 * 
 * ⚠️  CANONICAL SOURCE OF TRUTH - DO NOT DUPLICATE ⚠️
 * 
 * This is the primary users list component used throughout the application.
 * Displays users in a comprehensive table format with all necessary actions.
 * 
 * USAGE LOCATIONS:
 * - src/pages/Users.tsx (primary usage)
 * - Any component that needs to display user lists
 * 
 * FEATURES:
 * - Comprehensive user table display
 * - Real-time filtering and search
 * - Role and facility information display
 * - Action buttons for user management
 * - Loading and error states
 * - Responsive design
 * 
 * MODIFICATIONS:
 * - Always update this file for user list display changes
 * - Do not create alternative user list components
 * - Keep table structure consistent
 * 
 * LAST UPDATED: 2025-06-29
 * MAINTAINER: System Architecture Team
 */

import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, AlertCircle, CheckCircle, Users, Clock } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import UserActions from './UserActions';

interface UsersListProps {
  onCreateUser: () => void;
  onAssignRole: (userId: string) => void;
  onRemoveRole?: (userId: string) => void;
  onAssignFacility: (userId: string) => void;
  onEditUser: (user: any) => void;
  onManagePermissions?: (userId: string, userName: string) => void;
  onAssignModule?: (userId: string, userName: string) => void;
  onResendVerification?: (userEmail: string, userName: string) => void;
  onDeactivateUser?: (userId: string, userName: string, userEmail: string) => void;
  onViewModules?: (userId: string, userName: string) => void;
}

const UsersList: React.FC<UsersListProps> = ({
  onCreateUser,
  onAssignRole,
  onRemoveRole,
  onAssignFacility,
  onEditUser,
  onManagePermissions,
  onAssignModule,
  onResendVerification,
  onDeactivateUser,
  onViewModules
}) => {
  const { users, isLoading, error } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');

  // Filter and search users
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    
    return users.filter(user => {
      // Search filter
      const matchesSearch = !searchTerm || 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Role filter
      const userRoles = user.user_roles?.map(ur => ur.roles.name) || [];
      const matchesRole = roleFilter === 'all' || 
        (roleFilter === 'no-role' && userRoles.length === 0) ||
        userRoles.includes(roleFilter as any);
      
      // Verification filter
      const isEmailVerified = !!user.email_confirmed_at;
      const matchesVerification = verificationFilter === 'all' ||
        (verificationFilter === 'verified' && isEmailVerified) ||
        (verificationFilter === 'unverified' && !isEmailVerified);
      
      return matchesSearch && matchesRole && matchesVerification;
    });
  }, [users, searchTerm, roleFilter, verificationFilter]);

  const getUserRolesBadges = (user: any) => {
    if (!user.user_roles || user.user_roles.length === 0) {
      return <Badge variant="outline" className="text-gray-500">No Role</Badge>;
    }
    
    return user.user_roles.map((userRole: any, index: number) => (
      <Badge key={index} variant="secondary" className="mr-1">
        {userRole.roles.name}
      </Badge>
    ));
  };

  const getVerificationStatus = (user: any) => {
    if (!user.email) return null;
    
    const isVerified = !!user.email_confirmed_at;
    
    return isVerified ? (
      <div className="flex items-center gap-1 text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm">Verified</span>
      </div>
    ) : (
      <div className="flex items-center gap-1 text-orange-600">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">Pending</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="flex items-center justify-center gap-2 text-red-600 mb-2">
          <AlertCircle className="h-5 w-5" />
          <span>Failed to load users</span>
        </div>
        <p className="text-gray-600 text-sm">{error.message}</p>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
        <p className="text-gray-600 mb-4">Get started by creating your first user.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role-filter">Filter by Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="no-role">No Role Assigned</SelectItem>
                  <SelectItem value="superAdmin">Super Admin</SelectItem>
                  <SelectItem value="healthcareProvider">Healthcare Provider</SelectItem>
                  <SelectItem value="nurse">Nurse</SelectItem>
                  <SelectItem value="caseManager">Care Manager</SelectItem>
                  <SelectItem value="onboardingTeam">Onboarding Team</SelectItem>
                  <SelectItem value="patientCaregiver">Patient/Caregiver</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verification-filter">Email Verification</Label>
              <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Pending Verification</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredUsers.length} of {users.length} users
        </p>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email Status</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Facility</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {user.first_name || user.last_name 
                            ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                            : 'No Name'
                          }
                        </div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getVerificationStatus(user)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {getUserRolesBadges(user)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.facilities ? (
                        <Badge variant="outline">
                          {user.facilities.name}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-sm">No Facility</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="h-3 w-3" />
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <UserActions
                        user={user}
                        onEditUser={onEditUser}
                        onAssignRole={onAssignRole}
                        onRemoveRole={onRemoveRole}
                        onAssignFacility={onAssignFacility}
                        onManagePermissions={onManagePermissions || ((userId, userName) => console.log('Manage permissions:', userId, userName))}
                        onAssignModule={onAssignModule}
                        onResendVerification={onResendVerification}
                        onDeactivateUser={onDeactivateUser}
                        onViewModules={onViewModules}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersList;
