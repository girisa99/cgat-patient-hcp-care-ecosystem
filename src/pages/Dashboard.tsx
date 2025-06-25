
import React from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Shield, AlertCircle, CheckCircle, RefreshCw, Database } from 'lucide-react';
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

      {/* Success message when everything is loaded properly */}
      {user && profile && userRoles.length > 0 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>✅ System operational!</strong> Profile and {userRoles.length} role(s) loaded successfully with basic RLS policies.
          </AlertDescription>
        </Alert>
      )}

      {/* Show specific alerts based on what's missing */}
      {user && !profile && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Profile Missing:</strong> Your profile could not be loaded. This might indicate that your profile hasn't been created yet. Contact your administrator to set up your profile.
          </AlertDescription>
        </Alert>
      )}

      {user && profile && userRoles.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>No Roles Assigned:</strong> Your account doesn't have any roles assigned. Contact your administrator to have roles assigned to enable portal features.
          </AlertDescription>
        </Alert>
      )}

      {/* Authentication Status Alert */}
      {user && (
        <Alert className="border-blue-200 bg-blue-50">
          <Database className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Database Connection:</strong> Successfully connected to Supabase with simplified RLS policies. 
            Authentication is working properly.
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
            <CardDescription>Your account details and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profile ? (
                <>
                  <div className="space-y-2">
                    <p><strong>Name:</strong> {profile.first_name || 'Not set'} {profile.last_name || ''}</p>
                    <p><strong>Email:</strong> {profile.email || user?.email || 'Not available'}</p>
                    <p><strong>Department:</strong> {profile.department || 'Not specified'}</p>
                    {profile.facility_id && (
                      <p><strong>Facility ID:</strong> {profile.facility_id.slice(0, 8)}...</p>
                    )}
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-green-600 font-medium">
                      ✅ Profile loaded successfully
                    </p>
                  </div>
                </>
              ) : user ? (
                <>
                  <div className="space-y-2">
                    <p><strong>Email:</strong> {user.email}</p>
                    <p className="text-sm text-amber-600">⚠ Profile not found in database</p>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      User ID: {user.id.slice(0, 8)}... (for admin reference)
                    </p>
                  </div>
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
            <CardDescription>System access permissions and capabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userRoles.length > 0 ? (
                <>
                  {userRoles.map((role) => (
                    <div key={role} className="space-y-1">
                      <Badge variant="outline" className={getRoleColor(role)}>
                        {role}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {getRoleDescription(role)}
                      </p>
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <p className="text-xs text-green-600 font-medium">
                      ✅ Roles loaded successfully
                    </p>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <p className="text-muted-foreground">No roles assigned to your account</p>
                  <p className="text-xs text-muted-foreground">
                    Contact your administrator to have roles assigned to access portal features.
                  </p>
                  {user && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        User ID: {user.id.slice(0, 8)}... (for admin reference)
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Authentication and data loading status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${user ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm">Authentication: {user ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${profile ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                <span className="text-sm">Profile: {profile ? 'Loaded' : 'Missing'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${userRoles.length > 0 ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                <span className="text-sm">Roles: {userRoles.length > 0 ? `${userRoles.length} assigned` : 'None'}</span>
              </div>
              
              <div className="pt-2 border-t space-y-1">
                <p className="text-xs text-green-600 font-medium">
                  🔧 RLS Policies: Basic (simplified)
                </p>
                <p className="text-xs text-muted-foreground">
                  Using non-recursive policies to prevent infinite loops
                </p>
                {user && (
                  <p className="text-xs text-muted-foreground">
                    User ID: {user.id.slice(0, 8)}...
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
