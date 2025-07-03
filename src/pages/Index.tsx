import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '@/components/auth/CleanAuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/components/layout/AppLayout';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';

const Index: React.FC = () => {
  const { isAuthenticated, isLoading, signIn } = useAuthContext();

  console.log('🏠 Index page - Auth state:', { isAuthenticated, isLoading });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading application...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Healthcare Management System</h1>
            <p className="text-gray-600 mb-6">Please sign in to continue</p>
            <button 
              onClick={() => signIn('demo@example.com', 'demo123')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Demo Sign In
            </button>
            <p className="text-xs text-gray-500 mt-4">
              This is a demo system. Click above to sign in with demo credentials.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { availableTabs, currentRole, isAdmin } = useRoleBasedNavigation();

  return (
    <AppLayout title="Healthcare Management Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Healthcare Management System</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Your role: <strong>{currentRole}</strong> | Available modules: <strong>{availableTabs.length}</strong>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <div className="text-2xl font-bold text-blue-600">{availableTabs.length}</div>
                <div className="text-sm text-blue-800">Available Modules</div>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <div className="text-2xl font-bold text-green-600">{isAdmin ? 'Admin' : 'User'}</div>
                <div className="text-sm text-green-800">Access Level</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableTabs.slice(1).map((tab) => {
                const Icon = tab.icon;
                return (
                  <Link key={tab.to} to={tab.to}>
                    <div className="p-4 border rounded hover:bg-accent cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <Icon className="h-6 w-6 text-primary" />
                        <div>
                          <h3 className="font-semibold">{tab.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Access {tab.title.toLowerCase()} management
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Role-Based Information */}
        <Card>
          <CardHeader>
            <CardTitle>Role Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Current Role:</strong> {currentRole}</p>
              <p><strong>Admin Access:</strong> {isAdmin ? 'Yes' : 'No'}</p>
              <p><strong>Available Sections:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                {availableTabs.map(tab => (
                  <li key={tab.to} className="text-sm">{tab.title}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Index;