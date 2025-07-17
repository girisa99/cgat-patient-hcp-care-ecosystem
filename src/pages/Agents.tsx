import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Network } from 'lucide-react';

// Import the ecosystem components
import AgenticEcosystem from './AgenticEcosystem';
import AgenticAPIEcosystem from './AgenticAPIEcosystem';

const Agents = () => {
  const [activeTab, setActiveTab] = useState('agentic-ecosystem');

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Agents</h1>
            <p className="text-muted-foreground mt-2">
              Manage and deploy intelligent agents for healthcare automation
            </p>
          </div>
        </div>

        {/* Main Tabs Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="agentic-ecosystem" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Agentic Ecosystem
            </TabsTrigger>
            <TabsTrigger value="agentic-api-ecosystem" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Agentic API Ecosystem
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agentic-ecosystem" className="space-y-4">
            <AgenticEcosystem />
          </TabsContent>

          <TabsContent value="agentic-api-ecosystem" className="space-y-4">
            <AgenticAPIEcosystem />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Agents;