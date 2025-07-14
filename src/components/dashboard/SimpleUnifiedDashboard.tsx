import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useMasterData } from '@/hooks/useMasterData';
import { useAdminRealtime } from '@/hooks/useRealtime';

const SimpleUnifiedDashboard: React.FC = () => {
  // Enable real-time updates for dashboard
  useAdminRealtime({ 
    enableNotifications: true,
    areas: ['userManagement', 'facility', 'modules'] 
  });

  const { user } = useMasterAuth();
  const { stats } = useMasterData();

  console.log('🎯 Simple Unified Dashboard - Rendering for user:', user?.id);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Welcome to Healthcare Management</h1>
        <p className="text-gray-600">
          {user?.email ? `Welcome back, ${user.email}` : 'Welcome to your dashboard'}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* System Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span>System Online</span>
              </div>
              <div className="text-sm text-muted-foreground">
                All services operational
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Card */}
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
          </CardContent>
        </Card>

        {/* Patients Card */}
        <Card>
          <CardHeader>
            <CardTitle>Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{stats?.patientCount || 0}</div>
              <div className="text-sm text-muted-foreground">Patients</div>
            </div>
          </CardContent>
        </Card>

        {/* Facilities Card */}
        <Card>
          <CardHeader>
            <CardTitle>Facilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{stats?.totalFacilities || 0}</div>
              <div className="text-sm text-muted-foreground">Facilities</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <h3 className="font-semibold">User Management</h3>
              <p className="text-sm text-gray-600">Manage users and roles</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <h3 className="font-semibold">Facilities</h3>
              <p className="text-sm text-gray-600">Manage healthcare facilities</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <h3 className="font-semibold">API Services</h3>
              <p className="text-sm text-gray-600">Manage API integrations</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleUnifiedDashboard;