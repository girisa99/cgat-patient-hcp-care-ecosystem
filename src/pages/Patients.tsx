
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, HeartHandshake, UserPlus, Activity,
  Clock, TrendingUp, AlertCircle
} from "lucide-react";
import { useMasterAuth } from "@/hooks/useMasterAuth";
import { useSecurePatientData } from "@/hooks/useSecurePatientData";
import DashboardHeader from "@/components/layout/DashboardHeader";

const Patients = () => {
  const { user, userRoles, isLoading: authLoading } = useMasterAuth();
  const { 
    patientData, 
    isLoading: patientsLoading, 
    error,
    hasPatientAccess,
    accessLevel,
    canViewAll,
    canEdit,
    canDelete
  } = useSecurePatientData();

  if (authLoading || patientsLoading) {
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

  if (!hasPatientAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-0 shadow-sm bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>Access Denied</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">
                You do not have permission to access patient data. Please contact your administrator.
              </p>
              <div className="mt-4">
                <Badge variant="outline" className="text-red-600 border-red-300">
                  Current Access Level: {accessLevel}
                </Badge>
              </div>
            </CardContent>
          </Card>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Patient Management
          </h1>
          <p className="text-lg text-gray-600">
            Secure patient data management with role-based access control
          </p>
          <div className="flex items-center space-x-2 mt-3">
            <Badge variant="outline" className="text-sm">
              Access Level: {accessLevel}
            </Badge>
            <Badge variant={canViewAll ? "default" : "secondary"} className="text-sm">
              {canViewAll ? "Full View" : "Limited View"}
            </Badge>
            <Badge variant={canEdit ? "default" : "secondary"} className="text-sm">
              {canEdit ? "Can Edit" : "Read Only"}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <HeartHandshake className="h-4 w-4 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-600">
                {patientData.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Accessible patient records
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Access Level</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {accessLevel}
              </div>
              <p className="text-xs text-muted-foreground">
                Current permission level
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Roles</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {userRoles.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Active roles assigned
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
            <CardTitle className="flex items-center space-x-2">
              <HeartHandshake className="h-5 w-5" />
              <span>Patient Records</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8 text-red-600">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>Error loading patient data: {error.message}</p>
              </div>
            ) : patientData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <HeartHandshake className="h-8 w-8 mx-auto mb-2" />
                <p>No patient records found</p>
                <p className="text-sm">Patient data will appear here when available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {patientData.map((patient, index) => (
                  <div key={patient.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-pink-100 rounded-full flex items-center justify-center">
                        <HeartHandshake className="h-5 w-5 text-pink-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {patient.first_name} {patient.last_name}
                        </h3>
                        <p className="text-sm text-gray-600">{patient.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {new Date(patient.created_at).toLocaleDateString()}
                      </Badge>
                      {patient.phone && (
                        <Badge variant="secondary" className="text-xs">
                          Phone: {patient.phone}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Development Info */}
        {userRoles.length === 0 && (
          <Card className="border-0 shadow-sm bg-yellow-50 border-yellow-200 mt-8">
            <CardHeader>
              <CardTitle className="text-yellow-800">🚧 Development Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-yellow-700">
                <p><strong>Status:</strong> Patient data access in development mode</p>
                <p><strong>User:</strong> {user?.email}</p>
                <p><strong>Roles:</strong> {userRoles.length > 0 ? userRoles.join(', ') : 'None assigned'}</p>
                <p><strong>Security:</strong> Role-based access control active</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Patients;
