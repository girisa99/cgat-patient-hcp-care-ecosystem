/**
 * GENIE ADMIN PAGE
 * Admin page for managing internal Genie Studio users and Production Hub
 * Restricted to internal users with super_admin role
 */
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import InternalUserAdminPanel from '@/components/genie-admin/InternalUserAdminPanel';
import ProductionHubAdmin from '@/components/genie-admin/ProductionHubAdmin';
import { useGenieStudioAuth } from '@/hooks/useGenieStudioAuth';
import { Shield, AlertTriangle, Users, Video } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

const GenieAdminPage: React.FC = () => {
  const { isAuthenticated, isInternalUser } = useGenieStudioAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('production');
  
  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="container max-w-4xl py-8">
          <Card className="border-accent/20 bg-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-accent-foreground" />
                Authentication Required
              </CardTitle>
              <CardDescription>
                Please sign in to access the admin panel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/genie-studio-auth')}>Sign In</Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }
  
  if (!isInternalUser) {
    return (
      <AppLayout>
        <div className="container max-w-4xl py-8">
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-destructive" />
                Access Denied
              </CardTitle>
              <CardDescription>
                This page is restricted to internal administrators only
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => navigate('/genie-studio')}>Go to Dashboard</Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="production" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Production Hub
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              User Management
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="production">
            <ProductionHubAdmin />
          </TabsContent>
          
          <TabsContent value="users">
            <InternalUserAdminPanel />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default GenieAdminPage;
