
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw, Plus, Shield, Lock, Key, AlertTriangle } from 'lucide-react';
import { useMasterData } from '@/hooks/useMasterData';
import { useMasterAuth } from '@/hooks/useMasterAuth';

const Security: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, userRoles } = useMasterAuth();
  const { 
    users,
    isLoading, 
    error, 
    refreshData, 
    stats 
  } = useMasterData();
  
  const [searchQuery, setSearchQuery] = React.useState('');

  console.log('🔒 Security Page - Master Data Integration');

  if (authLoading || isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-muted-foreground">Loading security dashboard...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">Please log in to access security</div>
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
            <div className="text-red-600">Error loading security: {error.message}</div>
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
        <h1 className="text-3xl font-bold tracking-tight">Security Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor and manage system security settings
        </p>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.totalUsers}</div>
          <div className="text-sm text-green-600">Active Users</div>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">0</div>
          <div className="text-sm text-blue-600">Security Events</div>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">0</div>
          <div className="text-sm text-yellow-600">Alerts</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{userRoles.length}</div>
          <div className="text-sm text-purple-600">Your Roles</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Access Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Access Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Multi-Factor Authentication</div>
                <div className="text-sm text-muted-foreground">Enhanced login security</div>
              </div>
              <Badge variant="outline">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Password Policy</div>
                <div className="text-sm text-muted-foreground">Strong password requirements</div>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Session Management</div>
                <div className="text-sm text-muted-foreground">Auto-logout after inactivity</div>
              </div>
              <Badge variant="outline">30 min</Badge>
            </div>
          </CardContent>
        </Card>

        {/* API Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Rate Limiting</div>
                <div className="text-sm text-muted-foreground">Request throttling</div>
              </div>
              <Badge variant="outline">1000/hr</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">API Key Management</div>
                <div className="text-sm text-muted-foreground">Active API keys</div>
              </div>
              <Badge variant="outline">0 keys</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">HTTPS Enforcement</div>
                <div className="text-sm text-muted-foreground">Secure connections only</div>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-800">Enabled</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Events */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Recent Security Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No security events found</p>
            <p className="text-sm">Security events will appear here for monitoring</p>
          </div>
        </CardContent>
      </Card>

      {/* Security Actions */}
      <div className="mt-6 flex gap-4">
        <Button onClick={refreshData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Status
        </Button>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Security Scan
        </Button>
      </div>
    </div>
  );
};

export default Security;
