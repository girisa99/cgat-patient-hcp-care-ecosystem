
import React from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Shield, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { profile, userRoles, loading, user } = useAuthContext();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superAdmin': return 'bg-red-100 text-red-800 border-red-200';
      case 'healthcareProvider': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'nurse': return 'bg-green-100 text-green-800 border-green-200';
      case 'caseManager': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'onboardingTeam': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'patientCaregiver': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const handleRefresh = () => {
    window.location.reload();
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome to your healthcare portal dashboard
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Show success message when everything is loaded */}
      {user && profile && userRoles.length > 0 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Your profile and permissions have been loaded successfully. You have {userRoles.length} role(s) assigned.
          </AlertDescription>
        </Alert>
      )}

      {/* Show alert if there are issues loading user data */}
      {user && (!profile || userRoles.length === 0) && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {!profile && "Profile information could not be loaded. "}
            {userRoles.length === 0 && "No user roles have been assigned to your account. "}
            Please contact your administrator if this persists, or try refreshing the page.
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
                  <p><strong>Name:</strong> {profile.first_name || 'Not set'} {profile.last_name || ''}</p>
                  <p><strong>Email:</strong> {profile.email || user?.email || 'Not available'}</p>
                  <p><strong>Department:</strong> {profile.department || 'Not specified'}</p>
                  <p className="text-xs text-green-600">
                    ✓ Profile loaded successfully
                  </p>
                </>
              ) : user ? (
                <>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p className="text-sm text-amber-600">⚠ Profile setup may be required</p>
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
              Your Roles ({userRoles.length})
            </CardTitle>
            <CardDescription>System access permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userRoles.length > 0 ? (
                userRoles.map((role) => (
                  <div key={role} className="space-y-1">
                    <Badge variant="outline" className={getRoleColor(role)}>
                      {role}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {getRoleDescription(role)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="space-y-2">
                  <p className="text-muted-foreground">No roles assigned</p>
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
            <CardTitle>System Status</CardTitle>
            <CardDescription>Authentication and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${user ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm">Authentication: {user ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${profile ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                <span className="text-sm">Profile: {profile ? 'Loaded' : 'Pending'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${userRoles.length > 0 ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                <span className="text-sm">Roles: {userRoles.length > 0 ? `${userRoles.length} assigned` : 'None'}</span>
              </div>
              {user && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    User ID: {user.id.slice(0, 8)}...
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
