/**
 * STABILITY PAGE
 * Central dashboard for monitoring component stability and protection
 */
import React from 'react';
import { StabilityMonitor } from '@/components/stability/StabilityMonitor';
import { SystemStatusChecker } from '@/components/monitoring/SystemStatusChecker';
import { AutomaticEnhancementsVerification } from '@/components/monitoring/AutomaticEnhancementsVerification';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Stability: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
    </div>
  );
};

export default Stability;