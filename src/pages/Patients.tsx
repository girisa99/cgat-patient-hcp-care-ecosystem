
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, HeartHandshake, UserPlus, Activity,
  Clock, TrendingUp, AlertCircle, RefreshCw, Mail, Phone, Calendar
} from "lucide-react";
import { useMasterAuth } from "@/hooks/useMasterAuth";
import { useMasterData } from '@/hooks/useMasterData';
import DashboardHeader from "@/components/layout/DashboardHeader";

const Patients = () => {
  const { user, userRoles, isAuthenticated } = useMasterAuth();
  const { 
    users, 
    isLoading, 
    error,
    stats,
    refreshData
  } = useMasterData();

  // Filter users who are patients (have patientCaregiver role or treat all as patients for now)
  const patients = users.filter(u => 
    u.user_roles.some(ur => ur.roles.name === 'patientCaregiver') || 
    u.user_roles.length === 0 // Treat users without roles as potential patients
  );

  console.log('🏥 Patients Page - Current state:', {
    isAuthenticated,
    totalUsers: users.length,
    patientUsers: patients.length,
    isLoading,
    error,
    currentUser: user?.email
  });

  const handleRefresh = () => {
    console.log('🔄 Refreshing patient data...');
    refreshData();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-0 shadow-sm bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-800 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>Authentication Required</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-700">
                You need to be logged in to view patient data.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Patient Management
              </h1>
              <p className="text-lg text-gray-600">
                Secure patient data management with role-based access control
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          <div className="flex items-center space-x-2 mt-3">
            <Badge variant="outline" className="text-sm">
              Total Patients: {patients.length}
            </Badge>
            <Badge variant="outline" className="text-sm">
              All Users: {users.length}
            </Badge>
            {userRoles.length > 0 && (
              <Badge variant="default" className="text-sm">
                Your Role: {userRoles.join(', ')}
              </Badge>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-0 shadow-sm bg-red-50 border-red-200 mb-6">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>Error Loading Patient Data</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">
                {typeof error === 'string' ? error : error?.message || 'An error occurred while loading patient data'}
              </p>
              <Button onClick={handleRefresh} className="mt-4" variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <HeartHandshake className="h-4 w-4 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-600">
                {patients.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Patient records
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">All Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {users.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Total users in system
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.activeUsers}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Security</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                Secure
              </div>
              <p className="text-xs text-muted-foreground">
                HIPAA compliant access
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Patient Data Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HeartHandshake className="h-5 w-5" />
                <span>Patient Records ({patients.length})</span>
              </div>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patients.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <HeartHandshake className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-semibold mb-2">No Patient Records Found</h3>
                <p className="text-sm mb-4">
                  {error ? 'There was an error loading patient data.' : 'No patient records are available yet.'}
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  Showing users from the profiles table. Patient-specific roles will be implemented when the role system is configured.
                </p>
                <Button onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {patients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-4 bg-pink-50 rounded-lg border hover:bg-pink-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-pink-100 rounded-full flex items-center justify-center">
                        <HeartHandshake className="h-5 w-5 text-pink-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">
                            {patient.first_name} {patient.last_name}
                          </h3>
                          <Badge 
                            variant={patient.is_active ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {patient.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Mail className="h-3 w-3" />
                            <span>{patient.email}</span>
                          </div>
                          {patient.phone && (
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <Phone className="h-3 w-3" />
                              <span>{patient.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(patient.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 mt-2">
                          {patient.user_roles.map((ur, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {ur.roles.name}
                            </Badge>
                          ))}
                          {patient.user_roles.length === 0 && (
                            <Badge variant="outline" className="text-xs text-pink-600 border-pink-300">
                              Patient (roles pending)
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Development Info */}
        <Card className="border-0 shadow-sm bg-blue-50 border-blue-200 mt-8">
          <CardHeader>
            <CardTitle className="text-blue-800">🚧 Development Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Database Connection:</strong> {error ? '❌ Error' : '✅ Connected'}</p>
              <p><strong>Data Source:</strong> Supabase profiles table</p>
              <p><strong>Total Users:</strong> {users.length}</p>
              <p><strong>Patient Records:</strong> {patients.length}</p>
              <p><strong>Current User:</strong> {user?.email || 'Not logged in'}</p>
              <p><strong>User Roles:</strong> {userRoles.length > 0 ? userRoles.join(', ') : 'None assigned'}</p>
              <p><strong>Note:</strong> Currently showing all users as potential patients. Role-based filtering will be implemented when the role system is configured.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Patients;
