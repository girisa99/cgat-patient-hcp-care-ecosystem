
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { SystemVerificationDashboard } from '@/components/verification/SystemVerificationDashboard';
import SystemStatusDashboard from '@/components/admin/SystemStatusDashboard';
import SystemAnalysisDashboard from '@/components/admin/SystemAnalysisDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminVerification: React.FC = () => {
  return (
    <MainLayout>
      <PageContainer
        title="Admin Verification & System Analysis"
        subtitle="Comprehensive system verification with Update First enforcement, real-time status monitoring, and detailed analysis"
        fluid
      >
        <Tabs defaultValue="analysis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analysis">System Analysis</TabsTrigger>
            <TabsTrigger value="status">System Status</TabsTrigger>
            <TabsTrigger value="verification">Enhanced Verification</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analysis">
            <SystemAnalysisDashboard />
          </TabsContent>
          
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
