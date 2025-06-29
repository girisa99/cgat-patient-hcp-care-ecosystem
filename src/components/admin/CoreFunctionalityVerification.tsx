
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Building2, 
  UserCheck, 
  Settings, 
  CheckCircle, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useUnifiedUserData } from '@/hooks/useUnifiedUserData';
import { useFacilities } from '@/hooks/useFacilities';
import { useModules } from '@/hooks/useModules';

const CoreFunctionalityVerification = () => {
  const [verificationResults, setVerificationResults] = useState<any[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);

  // Test all core hooks
  const usersHook = useUsers();
  const unifiedUserData = useUnifiedUserData();
  const facilitiesHook = useFacilities();
  const modulesHook = useModules();

  const runVerification = async () => {
    setIsVerifying(true);
    const results = [];

    try {
      // Test Users functionality
      results.push({
        name: 'Users Hook',
        status: usersHook.error ? 'error' : usersHook.isLoading ? 'loading' : 'success',
        data: {
          users: usersHook.users?.length || 0,
          error: usersHook.error?.message
        }
      });

      // Test Unified User Data
      results.push({
        name: 'Unified User Data',
        status: unifiedUserData.error ? 'error' : unifiedUserData.isLoading ? 'loading' : 'success',
        data: {
          totalUsers: unifiedUserData.meta.totalUsers,
          patients: unifiedUserData.meta.patientCount,
          staff: unifiedUserData.meta.staffCount,
          admins: unifiedUserData.meta.adminCount,
          error: unifiedUserData.error?.message
        }
      });

      // Test Facilities functionality
      results.push({
        name: 'Facilities Hook',
        status: facilitiesHook.error ? 'error' : facilitiesHook.isLoading ? 'loading' : 'success',
        data: {
          facilities: facilitiesHook.facilities?.length || 0,
          error: facilitiesHook.error?.message
        }
      });

      // Test Modules functionality
      results.push({
        name: 'Modules Hook',
        status: modulesHook.error ? 'error' : modulesHook.isLoading ? 'loading' : 'success',
        data: {
          modules: modulesHook.modules?.length || 0,
          error: modulesHook.error?.message
        }
      });

      setVerificationResults(results);
    } catch (error: any) {
      results.push({
        name: 'Verification Process',
        status: 'error',
        data: { error: error.message }
      });
      setVerificationResults(results);
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'loading':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Working</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'loading':
        return <Badge className="bg-blue-100 text-blue-800">Loading</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Core Functionality Verification</h2>
          <p className="text-muted-foreground">
            Verify that all core system components are working correctly
          </p>
        </div>
        <Button onClick={runVerification} disabled={isVerifying}>
          {isVerifying ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            'Run Verification'
          )}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="facilities">Facilities</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {usersHook.users?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total users in system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Facilities</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {facilitiesHook.facilities?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Healthcare facilities
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Patients</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {unifiedUserData.meta.patientCount || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Registered patients
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Modules</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {modulesHook.modules?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  System modules
                </p>
              </CardContent>
            </Card>
          </div>

          {verificationResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Verification Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {verificationResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <h4 className="font-medium">{result.name}</h4>
                          {result.data.error && (
                            <p className="text-sm text-red-600">{result.data.error}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(result.status)}
                        {Object.keys(result.data).filter(key => key !== 'error').length > 0 && (
                          <span className="text-sm text-muted-foreground">
                            {Object.entries(result.data)
                              .filter(([key]) => key !== 'error')
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Users System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Users Hook Status:</span>
                  {usersHook.error ? (
                    <Badge variant="destructive">Error: {usersHook.error.message}</Badge>
                  ) : usersHook.isLoading ? (
                    <Badge className="bg-blue-100 text-blue-800">Loading</Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800">Working</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Total Users:</span>
                  <span>{usersHook.users?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Create User Function:</span>
                  <Badge className={usersHook.createUser ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {usersHook.createUser ? 'Available' : 'Not Available'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facilities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Facilities System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Facilities Hook Status:</span>
                  {facilitiesHook.error ? (
                    <Badge variant="destructive">Error: {facilitiesHook.error.message}</Badge>
                  ) : facilitiesHook.isLoading ? (
                    <Badge className="bg-blue-100 text-blue-800">Loading</Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800">Working</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Total Facilities:</span>
                  <span>{facilitiesHook.facilities?.length || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Modules System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Modules Hook Status:</span>
                  {modulesHook.error ? (
                    <Badge variant="destructive">Error: {modulesHook.error.message}</Badge>
                  ) : modulesHook.isLoading ? (
                    <Badge className="bg-blue-100 text-blue-800">Loading</Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800">Working</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Total Modules:</span>
                  <span>{modulesHook.modules?.length || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoreFunctionalityVerification;
