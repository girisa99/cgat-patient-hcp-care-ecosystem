import React from 'react';
import { useAuthContext } from '@/components/auth/CleanAuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Healthcare Management Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent>
              <a href="/users" className="text-blue-600 hover:underline">Manage Users</a>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <a href="/patients" className="text-blue-600 hover:underline">Manage Patients</a>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Facilities</CardTitle>
            </CardHeader>
            <CardContent>
              <a href="/facilities" className="text-blue-600 hover:underline">Manage Facilities</a>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <a href="/modules" className="text-blue-600 hover:underline">Manage Modules</a>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>API Services</CardTitle>
            </CardHeader>
            <CardContent>
              <a href="/api-services" className="text-blue-600 hover:underline">Manage APIs</a>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent>
              <a href="/security" className="text-blue-600 hover:underline">Security Dashboard</a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;