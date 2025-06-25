
import React from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Shield, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { profile, userRoles, loading, user } = useAuthContext();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superAdmin': return 'bg-red-100 text-red-800';
      case 'healthcareProvider': return 'bg-blue-100 text-blue-800';
      case 'nurse': return 'bg-green-100 text-green-800';
      case 'caseManager': return 'bg-purple-100 text-purple-800';
      case 'onboardingTeam': return 'bg-orange-100 text-orange-800';
      case 'patientCaregiver': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'superAdmin': return 'Full system access and administration';
      case 'healthcareProvider': return 'Clinical access to patient data and treatment';
      case 'nurse': return 'Patient care coordination and monitoring';
      case 'caseManager': return 'Patient care management and coordination';
      case 'onboardingTeam': return 'Facility and user onboarding management';
      case 'patientCaregiver': return 'Limited access to personal health information';
      default: return 'Role-specific access permissions';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Loading your healthcare portal...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to your healthcare portal dashboard
        </p>
      </div>

      {/* Show alert if there are issues loading user data */}
      {user && (!profile || userRoles.length === 0) && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {!profile && "Profile information is still loading. "}
            {userRoles.length === 0 && "User roles are still loading or haven't been assigned. "}
            Please contact your administrator if this persists.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile Information
            </CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {profile ? (
                <>
                  <p><strong>Name:</strong> {profile.first_name} {profile.last_name}</p>
                  <p><strong>Email:</strong> {profile.email}</p>
                  <p><strong>Department:</strong> {profile.department || 'Not specified'}</p>
                </>
              ) : user ? (
                <>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p className="text-sm text-muted-foreground">Profile details are loading...</p>
                </>
              ) : (
                <p className="text-muted-foreground">No profile information available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Your Roles
            </CardTitle>
            <CardDescription>System access permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {userRoles.length > 0 ? (
                userRoles.map((role) => (
                  <div key={role} className="space-y-1">
                    <Badge className={getRoleColor(role)}>
                      {role}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {getRoleDescription(role)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="space-y-2">
                  <p className="text-muted-foreground">No roles assigned or roles are loading</p>
                  <p className="text-xs text-muted-foreground">
                    Contact your administrator to have roles assigned to your account.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {userRoles.length > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Available actions will appear here based on your role permissions.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Actions will be available once your roles are loaded and assigned.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
