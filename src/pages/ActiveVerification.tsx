
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw, Plus, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { useMasterData } from '@/hooks/useMasterData';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useUnifiedDevelopmentLifecycle } from '@/hooks/useUnifiedDevelopmentLifecycle';
import AccessDenied from '@/components/AccessDenied';

const ActiveVerification: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, userRoles } = useMasterAuth();
  const { navigation } = useUnifiedDevelopmentLifecycle();
  const { 
    users,
    facilities,
    isLoading, 
    error, 
    refreshData, 
    stats 
  } = useMasterData();
  
  const [searchQuery, setSearchQuery] = React.useState('');

  console.log('🔍 Active Verification Page - Master Data Integration');

  // Role-based access guard
  if (!navigation.hasAccess('/active-verification')) {
    return <AccessDenied />;
  }

  if (authLoading || isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-muted-foreground">Loading verification system...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">Please log in to access verification</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-600">Error loading verification: {error.message}</div>
            <Button onClick={refreshData} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Active Verification</h1>
        <p className="text-muted-foreground">
          Real-time verification and compliance monitoring
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{users.length}</div>
          <div className="text-sm text-green-600">Verified Users</div>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{facilities.length}</div>
          <div className="text-sm text-blue-600">Verified Facilities</div>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">0</div>
          <div className="text-sm text-yellow-600">Pending</div>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">0</div>
          <div className="text-sm text-red-600">Failed</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              User Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{user.first_name} {user.last_name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div className="text-center p-4 text-muted-foreground">
                  No users to verify
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Facility Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Facility Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {facilities.slice(0, 5).map((facility) => (
                <div key={facility.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{facility.name}</div>
                    <div className="text-sm text-muted-foreground">{facility.facility_type}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </div>
              ))}
              {facilities.length === 0 && (
                <div className="text-center p-4 text-muted-foreground">
                  No facilities to verify
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Verification Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Run Full Verification
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh Status
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              View Issues
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActiveVerification;
