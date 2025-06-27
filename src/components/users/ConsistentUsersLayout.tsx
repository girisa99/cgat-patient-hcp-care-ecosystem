
/**
 * PRIMARY COMPONENT: ConsistentUsersLayout
 * 
 * ⚠️  CANONICAL SOURCE OF TRUTH - DO NOT DUPLICATE ⚠️
 * 
 * This is the primary layout component for user management pages.
 * Provides consistent header and overview structure across user-related pages.
 * 
 * USAGE LOCATIONS:
 * - User management overview pages
 * - Admin dashboards requiring user management context
 * 
 * FEATURES:
 * - Standardized page header and title
 * - User management overview cards
 * - Consistent spacing and layout
 * - Icon-based visual hierarchy
 * 
 * MODIFICATIONS:
 * - Always update this file for layout changes
 * - Do not create alternative user layout components
 * - Keep styling consistent with design system
 * 
 * LAST UPDATED: 2025-06-27
 * MAINTAINER: System Architecture Team
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, Settings } from 'lucide-react';

const ConsistentUsersLayout = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
        <p className="text-muted-foreground">
          Manage system users, roles, and permissions
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center space-x-4 p-4 border rounded-lg">
              <UserPlus className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-medium">Add Users</h3>
                <p className="text-sm text-muted-foreground">Create new user accounts</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 border rounded-lg">
              <Settings className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-medium">Manage Roles</h3>
                <p className="text-sm text-muted-foreground">Assign and modify user roles</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 border rounded-lg">
              <Users className="h-8 w-8 text-purple-500" />
              <div>
                <h3 className="font-medium">View Users</h3>
                <p className="text-sm text-muted-foreground">Browse all system users</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsistentUsersLayout;
