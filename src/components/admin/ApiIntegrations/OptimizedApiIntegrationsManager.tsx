
import React, { memo, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Database, Link, Plus } from 'lucide-react';
import { useApiServices } from '@/hooks/useApiServices';

interface ApiIntegration {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  type: 'internal' | 'external';
  endpoint: string;
  lastSync: string;
}

interface OptimizedApiIntegrationsManagerProps {
  integrations?: ApiIntegration[];
  onCreateIntegration?: () => void;
  onEditIntegration?: (id: string) => void;
  onDeleteIntegration?: (id: string) => void;
}

// Memoized integration card to prevent unnecessary re-renders
const IntegrationCard = memo(({ 
  integration, 
  onEdit, 
  onDelete 
}: { 
  integration: ApiIntegration;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const handleEdit = useCallback(() => onEdit(integration.id), [onEdit, integration.id]);
  const handleDelete = useCallback(() => onDelete(integration.id), [onDelete, integration.id]);
  
  const statusColor = useMemo(() => {
    switch (integration.status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, [integration.status]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{integration.name}</CardTitle>
          <Badge className={statusColor}>
            {integration.status}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-2">
          {integration.type === 'internal' ? (
            <Database className="h-4 w-4" />
          ) : (
            <Link className="h-4 w-4" />
          )}
          {integration.type} API
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Endpoint: {integration.endpoint}
          </p>
          <p className="text-sm text-muted-foreground">
            Last sync: {integration.lastSync}
          </p>
          <div className="flex gap-2 mt-4">
            <Button size="sm" variant="outline" onClick={handleEdit}>
              Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

IntegrationCard.displayName = 'IntegrationCard';

const OptimizedApiIntegrationsManager: React.FC<OptimizedApiIntegrationsManagerProps> = memo(({
  integrations: propIntegrations,
  onCreateIntegration,
  onEditIntegration,
  onDeleteIntegration
}) => {
  // Use hook data if no props provided (single source of truth)
  const { integrations: hookIntegrations } = useApiServices();
  
  // Convert hook data to expected format if needed
  const integrations = propIntegrations || (hookIntegrations || []).map(api => ({
    id: api.id,
    name: api.name || 'Unnamed API',
    status: (api.status as 'active' | 'inactive' | 'error') || 'inactive',
    type: (api.type as 'internal' | 'external') || 'internal',
    endpoint: api.base_url || api.baseUrl || 'No endpoint',
    lastSync: api.updated_at || api.updatedAt || 'Never'
  }));

  const handleCreateIntegration = useCallback(() => {
    if (onCreateIntegration) {
      onCreateIntegration();
    } else {
      console.log('Create integration clicked');
    }
  }, [onCreateIntegration]);

  const handleEditIntegration = useCallback((id: string) => {
    if (onEditIntegration) {
      onEditIntegration(id);
    } else {
      console.log('Edit integration:', id);
    }
  }, [onEditIntegration]);

  const handleDeleteIntegration = useCallback((id: string) => {
    if (onDeleteIntegration) {
      onDeleteIntegration(id);
    } else {
      console.log('Delete integration:', id);
    }
  }, [onDeleteIntegration]);

  // Memoize statistics to prevent recalculation on every render
  const stats = useMemo(() => {
    const active = integrations.filter(i => i.status === 'active').length;
    const total = integrations.length;
    const errors = integrations.filter(i => i.status === 'error').length;
    
    return { active, total, errors };
  }, [integrations]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Integrations</h2>
          <p className="text-muted-foreground">
            Manage your API connections and integrations
          </p>
        </div>
        <Button onClick={handleCreateIntegration}>
          <Plus className="h-4 w-4 mr-2" />
          Add Integration
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
          </CardContent>
        </Card>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            onEdit={handleEditIntegration}
            onDelete={handleDeleteIntegration}
          />
        ))}
      </div>

      {integrations.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No API integrations found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

OptimizedApiIntegrationsManager.displayName = 'OptimizedApiIntegrationsManager';

export default OptimizedApiIntegrationsManager;
