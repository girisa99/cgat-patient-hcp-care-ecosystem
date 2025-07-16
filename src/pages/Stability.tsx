/**
 * STABILITY PAGE
 * Central dashboard for monitoring component stability and protection
 */
import React from 'react';
import { StabilityMonitor } from '@/components/stability/StabilityMonitor';
import { SystemStatusChecker } from '@/components/monitoring/SystemStatusChecker';
import { AutomaticEnhancementsVerification } from '@/components/monitoring/AutomaticEnhancementsVerification';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/components/layout/AppLayout';

const Stability: React.FC = () => {
  return (
    <AppLayout title="Stability Monitoring">
      <div className="space-y-6">
        <Tabs defaultValue="enhancements" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="enhancements">Auto Enhancements</TabsTrigger>
            <TabsTrigger value="status">System Status</TabsTrigger>
            <TabsTrigger value="monitoring">Stability Monitor</TabsTrigger>
          </TabsList>
          
          <TabsContent value="enhancements" className="mt-6">
            <AutomaticEnhancementsVerification />
          </TabsContent>
          
          <TabsContent value="status" className="mt-6">
            <SystemStatusChecker />
          </TabsContent>
          
          <TabsContent value="monitoring" className="mt-6">
            <StabilityMonitor />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Stability;