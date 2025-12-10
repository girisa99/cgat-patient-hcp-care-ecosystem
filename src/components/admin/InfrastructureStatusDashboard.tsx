/**
 * INFRASTRUCTURE STATUS DASHBOARD
 * Shows health status of all connected systems (P0-P3, MCP, Channels)
 */
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Database,
  Settings,
  Zap,
  Globe,
  Bot,
  Layers,
} from 'lucide-react';
import { useUnifiedAgentInfrastructure } from '@/hooks/useUnifiedAgentInfrastructure';

const COMPONENT_INFO: Record<string, { name: string; description: string; icon: React.ElementType }> = {
  featureSelector: { name: 'Feature Selector (P0)', description: 'Genie feature catalog and selection', icon: Settings },
  mcpBridge: { name: 'MCP SDK Bridge (P2)', description: 'Model Context Protocol integration', icon: Zap },
  deploymentPersistence: { name: 'Deployment Persistence (P3)', description: 'Feature config storage per deployment', icon: Database },
  channelDeployments: { name: 'Channel Deployments', description: 'Agent channel assignment system', icon: Globe },
  agentRegistry: { name: 'Agent Registry', description: 'Unified agent use case management', icon: Bot },
  database: { name: 'Supabase Database', description: 'Primary data storage', icon: Layers },
};

export const InfrastructureStatusDashboard: React.FC = () => {
  const {
    infrastructureStatus,
    infrastructureStats,
    isInfrastructureHealthy,
    getUnhealthyComponents,
    statusLoading,
    statsLoading,
    refetchStatus,
    refetchStats,
  } = useUnifiedAgentInfrastructure();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Disconnected</Badge>;
    }
  };

  const unhealthyComponents = getUnhealthyComponents();
  const isHealthy = isInfrastructureHealthy();

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {isHealthy ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                )}
                Infrastructure Status
              </CardTitle>
              <CardDescription>
                Unified Agent Infrastructure Health (P0-P3, MCP, Channels)
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchStatus();
                refetchStats();
              }}
              disabled={statusLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${statusLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!isHealthy && unhealthyComponents.length > 0 && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {unhealthyComponents.length} component(s) need attention: {unhealthyComponents.join(', ')}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {infrastructureStatus && Object.entries(infrastructureStatus).map(([key, status]) => {
              const info = COMPONENT_INFO[key];
              const Icon = info?.icon || Settings;
              return (
                <Card key={key} className="border">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${status === 'connected' ? 'bg-green-100' : 'bg-muted'}`}>
                          <Icon className={`h-5 w-5 ${status === 'connected' ? 'text-green-600' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{info?.name || key}</p>
                          <p className="text-xs text-muted-foreground">{info?.description}</p>
                        </div>
                      </div>
                      {getStatusIcon(status)}
                    </div>
                    <div className="mt-3">
                      {getStatusBadge(status)}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {infrastructureStats && (
        <Card>
          <CardHeader>
            <CardTitle>Infrastructure Statistics</CardTitle>
            <CardDescription>Aggregated metrics across all agents and deployments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{infrastructureStats.totalAgents}</p>
                <p className="text-sm text-muted-foreground">Total Agents</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-green-600">{infrastructureStats.activeAgents}</p>
                <p className="text-sm text-muted-foreground">Active Agents</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{infrastructureStats.totalChannels}</p>
                <p className="text-sm text-muted-foreground">Total Channels</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{infrastructureStats.mcpToolsEnabled}</p>
                <p className="text-sm text-muted-foreground">MCP Tools</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{infrastructureStats.featuresConfigured}</p>
                <p className="text-sm text-muted-foreground">Features</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{infrastructureStats.crmIntegrations.length}</p>
                <p className="text-sm text-muted-foreground">CRM Integrations</p>
              </div>
            </div>

            {infrastructureStats.crmIntegrations.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Connected CRMs:</p>
                <div className="flex gap-2">
                  {infrastructureStats.crmIntegrations.map(crm => (
                    <Badge key={crm} variant="secondary">{crm}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Architecture Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Architecture Overview</CardTitle>
          <CardDescription>How all systems connect together</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg">
            <pre className="text-xs overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────────┐
│                  UNIFIED AGENT INFRASTRUCTURE HUB                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │ P0: Feature  │    │ P1: Enrollment│    │ P2: MCP SDK  │       │
│  │   Selector   │───▶│  Agent Config │───▶│    Bridge    │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│         │                   │                   │                │
│         ▼                   ▼                   ▼                │
│  ┌──────────────────────────────────────────────────────┐       │
│  │         P3: Deployment Feature Persistence           │       │
│  │            (genie_deployments.configuration)          │       │
│  └──────────────────────────────────────────────────────┘       │
│         │                   │                   │                │
│         ▼                   ▼                   ▼                │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   Channel    │    │   Branding   │    │ Rate Limits  │       │
│  │ Deployments  │    │   Config     │    │  & Tokens    │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│         │                   │                   │                │
│         └───────────────────┼───────────────────┘                │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────┐       │
│  │              Agent Use Case Registry                  │       │
│  │  (Patient Intake, Order Status, Treatment Center,     │       │
│  │   Manufacturing Onboarding, Custom Use Cases)         │       │
│  └──────────────────────────────────────────────────────┘       │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────┐       │
│  │                   Supabase Database                   │       │
│  │  (agents, genie_deployments, agent_channel_deployments)│       │
│  └──────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InfrastructureStatusDashboard;
