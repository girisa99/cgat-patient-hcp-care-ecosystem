import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { ExtensibleModuleTemplate } from '@/templates/components/ExtensibleModuleTemplate';
import { useAgents } from '@/hooks/useAgents';
import { Badge } from '@/components/ui/badge';
import { Bot, Brain } from 'lucide-react';

const Agents: React.FC = () => {
  console.log('🤖 Agents page - Using template structure');
  
  const { hasAccess, currentRole } = useRoleBasedNavigation();
  const agents = useAgents();
  
  if (!hasAccess('/agents')) {
    return (
      <AppLayout title="Access Denied">
        <Card>
          <CardContent className="p-8 text-center">
            <p>You don't have permission to access AI Agents.</p>
            <p className="text-sm text-muted-foreground mt-2">Current role: {currentRole}</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const columns = [
    { key: 'name', header: 'Agent Name' },
    { key: 'description', header: 'Description' },
    { key: 'agent_type', header: 'Type', cell: (value: string) => <Badge variant="outline">{value || 'single'}</Badge> },
    { key: 'status', header: 'Status', cell: (value: string) => <Badge variant={value === 'active' ? "default" : "secondary"}>{value || 'draft'}</Badge> }
  ];

  return (
    <AppLayout title="AI Agents">
      <ExtensibleModuleTemplate
        title="AI Agents"
        description="Manage intelligent AI agents for healthcare automation and assistance"
        items={agents.items}
        isLoading={agents.isLoading}
        error={agents.error}
        searchItems={agents.searchItems}
        getStatistics={agents.getStatistics}
        columns={columns}
        onRefresh={agents.refetch}
        enableCreate={false}
        enableEdit={false}
        enableDelete={false}
      />
    </AppLayout>
  );
};

export default Agents;