import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SystemConnectors } from '@/components/agentic/SystemConnectors';
import { EnhancedConnectorSystem } from '@/components/agentic/enhanced-connector/EnhancedConnectorSystem';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plug, Zap, Settings } from 'lucide-react';

interface ConnectorsTabProps {
  sessionId: string;
  actions?: any[];
}

export const ConnectorsTab: React.FC<ConnectorsTabProps> = ({ sessionId, actions = [] }) => {
  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Plug className="h-5 w-5" />
            System Connectors
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage external integrations, APIs, and connector configurations
          </p>
        </div>
      </div>

      {/* Connector Management Tabs */}
      <Tabs defaultValue="system" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            System Connectors
          </TabsTrigger>
          <TabsTrigger value="enhanced" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Enhanced Connectors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Available System Connectors</CardTitle>
              <CardDescription>
                Connect to external services, APIs, and integrations. Test connections and manage credentials.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SystemConnectors />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enhanced" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Connector System</CardTitle>
              <CardDescription>
                Advanced connector management with workflow automation and business intelligence.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedConnectorSystem 
                agentId={sessionId}
                actions={actions}
                onAssignmentsChange={() => {
                  console.log('Connector assignments changed');
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};