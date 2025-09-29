/**
 * GENIE MANAGEMENT DASHBOARD
 * Unified management interface for all Genie instances across the system
 * Supports: Public Genie, Internal Authorized Genie, MCP Agent Genie
 */
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Bot, 
  Settings, 
  Activity, 
  Shield, 
  Globe,
  Users,
  Zap,
  RefreshCw,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Lock,
  Unlock,
  Code,
  Search,
  Plus
} from 'lucide-react';
import { useGenieManagement, GenieInstance } from '@/hooks/useGenieManagement';
import { Link } from 'react-router-dom';
import { GenieInstanceCard } from './GenieInstanceCard';
import { DeploymentOptionsDialog } from './DeploymentOptionsDialog';

export const GenieManagementDashboard: React.FC = () => {
  const {
    genieInstances,
    rateLimitData,
    ipTracking,
    isLoading,
    generateDeploymentCode,
    checkHealth,
    toggleActive,
    updateIPReputation,
    refreshAll,
  } = useGenieManagement();

  const [searchQuery, setSearchQuery] = useState('');
  const [deploymentFilter, setDeploymentFilter] = useState<'all' | 'public' | 'internal' | 'mcp' | 'embedded'>('all');
  const [selectedInstance, setSelectedInstance] = useState<GenieInstance | null>(null);
  const [showDeploymentDialog, setShowDeploymentDialog] = useState(false);

  // Filter instances
  const filteredInstances = genieInstances.filter(instance => {
    const matchesSearch = instance.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         instance.business_unit?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         instance.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         instance.product_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = deploymentFilter === 'all' || instance.deployment_type === deploymentFilter;
    return matchesSearch && matchesFilter;
  });

  const handleViewDetails = (instance: GenieInstance) => {
    setSelectedInstance(instance);
    setShowDeploymentDialog(true);
  };

  const handleViewAnalytics = (instance: GenieInstance) => {
    window.location.href = `/genie-analytics/${instance.id}`;
  };

  // Stats aggregation
  const stats = {
    total: genieInstances.length,
    activeInstances: genieInstances.filter(i => i.is_active).length,
    public: genieInstances.filter(i => i.deployment_type === 'public').length,
    internal: genieInstances.filter(i => i.deployment_type === 'internal').length,
    embedded: genieInstances.filter(i => i.deployment_type === 'embedded').length,
    totalConversations: genieInstances.reduce((sum, i) => sum + i.total_conversations, 0),
    verifiedDomains: genieInstances.filter(i => i.domain_verified).length,
    deploymentOptions: genieInstances.reduce((sum, i) => sum + i.deployment_options.length, 0),
  };

  const getDeploymentTypeIcon = (type: string) => {
    switch (type) {
      case 'public': return <Globe className="h-4 w-4" />;
      case 'internal': return <Lock className="h-4 w-4" />;
      case 'mcp': return <Zap className="h-4 w-4" />;
      case 'embedded': return <Bot className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  const getDeploymentTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      public: 'bg-blue-100 text-blue-800',
      internal: 'bg-purple-100 text-purple-800',
      mcp: 'bg-green-100 text-green-800',
      embedded: 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="h-8 w-8" />
            Genie Management Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor Genieaiexperimentationhub.tech - Public, Internal, MCP & Patient Onboarding deployments
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshAll} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link to="/agents/canvas">
            <Button variant="outline">
              <Bot className="h-4 w-4 mr-2" />
              Agent Canvas
            </Button>
          </Link>
          <Link to="/configurable-genie">
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Configure New
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Instances</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Bot className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeInstances}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Public</p>
                <p className="text-2xl font-bold">{stats.public}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Internal</p>
                <p className="text-2xl font-bold">{stats.internal}</p>
              </div>
              <Lock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Embedded</p>
                <p className="text-2xl font-bold">{stats.embedded}</p>
              </div>
              <Bot className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversations</p>
                <p className="text-2xl font-bold">{stats.totalConversations}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verified Domains</p>
                <p className="text-2xl font-bold text-green-600">{stats.verifiedDomains}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by brand, business, product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={deploymentFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setDeploymentFilter('all')}
              >
                All
              </Button>
              <Button
                variant={deploymentFilter === 'public' ? 'default' : 'outline'}
                onClick={() => setDeploymentFilter('public')}
              >
                <Globe className="h-4 w-4 mr-1" />
                Public
              </Button>
              <Button
                variant={deploymentFilter === 'internal' ? 'default' : 'outline'}
                onClick={() => setDeploymentFilter('internal')}
              >
                <Lock className="h-4 w-4 mr-1" />
                Internal
              </Button>
              <Button
                variant={deploymentFilter === 'mcp' ? 'default' : 'outline'}
                onClick={() => setDeploymentFilter('mcp')}
              >
                <Zap className="h-4 w-4 mr-1" />
                MCP
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instances Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInstances.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-12 text-center">
                <Bot className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? 'No matching deployments' : 'No Genie Deployments'}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? 'Try adjusting your search criteria'
                    : 'Create your first GENIE brand configuration to get started'
                  }
                </p>
                <Link to="/configurable-genie">
                  <Button className="mt-4">Create First Instance</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredInstances.map((instance) => (
            <GenieInstanceCard
              key={instance.id}
              instance={instance}
              onViewDetails={handleViewDetails}
              onViewAnalytics={handleViewAnalytics}
            />
          ))
        )}
      </div>

      {/* IP Tracking Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            IP Address Tracking
          </CardTitle>
          <CardDescription>
            Monitor and manage IP addresses accessing your Genie instances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(ipTracking || []).slice(0, 10).map((ip: any) => (
              <div key={ip.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {ip.ip_address}
                    </code>
                    {ip.is_whitelisted && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Whitelisted
                      </Badge>
                    )}
                    {ip.is_blacklisted && (
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Blacklisted
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-6 mt-2 text-sm text-muted-foreground">
                    <span>Requests: {ip.total_requests}</span>
                    <span>Conversations: {ip.total_conversations}</span>
                    <span>Reputation: {(ip.reputation_score * 100).toFixed(0)}%</span>
                    {ip.country_code && <span>Location: {ip.country_code}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateIPReputation(ip.id, 'whitelist')}
                    disabled={ip.is_whitelisted}
                  >
                    <Unlock className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateIPReputation(ip.id, 'blacklist')}
                    disabled={ip.is_blacklisted}
                  >
                    <Lock className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deployment Options Dialog */}
      <DeploymentOptionsDialog
        instance={selectedInstance}
        open={showDeploymentDialog}
        onClose={() => {
          setShowDeploymentDialog(false);
          setSelectedInstance(null);
        }}
        onGenerateCode={generateDeploymentCode}
      />
    </div>
  );
};