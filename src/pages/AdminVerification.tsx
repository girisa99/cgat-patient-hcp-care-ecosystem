
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { SystemVerificationDashboard } from '@/components/verification/SystemVerificationDashboard';
import SystemStatusDashboard from '@/components/admin/SystemStatusDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminVerification: React.FC = () => {
  return (
    <MainLayout>
      <PageContainer
        title="Admin Verification & System Status"
        subtitle="Comprehensive system verification with Update First enforcement and real-time status monitoring"
        fluid
      >
        <Tabs defaultValue="status" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="status">System Status</TabsTrigger>
            <TabsTrigger value="verification">Enhanced Verification</TabsTrigger>
          </TabsList>
          
          <TabsContent value="status">
            <SystemStatusDashboard />
          </TabsContent>
          
          <TabsContent value="verification">
            <SystemVerificationDashboard />
          </TabsContent>
        </Tabs>
      </PageContainer>
    </MainLayout>
  );
};

export default AdminVerification;
