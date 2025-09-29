/**
 * GENIE MANAGEMENT DASHBOARD
 * Unified management interface for all Genie instances across the system
 * Supports: Public Genie, Internal Authorized Genie, MCP Agent Genie
 */
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Bot, 
  Settings, 
  Activity, 
  Shield, 
  Globe,
  Users,
  Zap,
  BarChart3,
  RefreshCw,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle,
  Clock,
  MessageSquare,
  Lock,
  Unlock
} from 'lucide-react';
import { useGenieManagement } from '@/hooks/useGenieManagement';
import { Link } from 'react-router-dom';

export const GenieManagementDashboard: React.FC = () => {
  const {
    genieInstances,
    rateLimitData,
    ipTracking,
    isLoading,
    checkHealth,
    toggleActive,
    updateIPReputation,
    refreshAll,
  } = useGenieManagement();

  const [searchQuery, setSearchQuery] = useState('');
  const [deploymentFilter, setDeploymentFilter] = useState<'all' | 'public' | 'internal' | 'mcp' | 'embedded'>('all');

  // Filter instances
  const filteredInstances = genieInstances.filter(instance => {
    const matchesSearch = instance.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         instance.business_unit?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = deploymentFilter === 'all' || instance.deployment_type === deploymentFilter;
    return matchesSearch && matchesFilter;
  });

  // Stats aggregation
  const stats = {
    total: genieInstances.length,
    active: genieInstances.filter(i => i.is_active).length,
    public: genieInstances.filter(i => i.deployment_type === 'public').length,
    internal: genieInstances.filter(i => i.deployment_type === 'internal').length,
    mcp: genieInstances.filter(i => i.deployment_type === 'mcp').length,
    totalConversations: genieInstances.reduce((sum, i) => sum + i.total_conversations, 0),
    totalBlocked: rateLimitData?.filter(r => r.is_blocked).length || 0,
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
            Manage all Genie instances: Public, Internal, and MCP deployments
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshAll} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
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
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
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
                <p className="text-sm text-muted-foreground">MCP</p>
                <p className="text-2xl font-bold">{stats.mcp}</p>
              </div>
              <Zap className="h-8 w-8 text-green-600" />
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
                <p className="text-sm text-muted-foreground">Blocked</p>
                <p className="text-2xl font-bold text-red-600">{stats.totalBlocked}</p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Input
              placeholder="Search by brand name or business unit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
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

      {/* Instances Table */}
      <Card>
        <CardHeader>
          <CardTitle>Genie Instances</CardTitle>
          <CardDescription>
            All configured Genie instances with real-time status and metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredInstances.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bot className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>No Genie instances found</p>
                <Link to="/configurable-genie">
                  <Button className="mt-4">Create First Instance</Button>
                </Link>
              </div>
            ) : (
              filteredInstances.map((instance) => (
                <Card key={instance.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getDeploymentTypeIcon(instance.deployment_type)}
                          <h3 className="text-lg font-semibold">{instance.brand_name}</h3>
                          <Badge className={getDeploymentTypeBadge(instance.deployment_type)}>
                            {instance.deployment_type.toUpperCase()}
                          </Badge>
                          <Badge variant={instance.is_active ? 'default' : 'secondary'}>
                            {instance.is_active ? 'Active' : 'Paused'}
                          </Badge>
                        </div>
                        {instance.business_unit && (
                          <p className="text-sm text-muted-foreground mb-4">
                            Business Unit: {instance.business_unit}
                          </p>
                        )}
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Total Conversations</p>
                            <p className="text-xl font-bold">{instance.total_conversations}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Active Now</p>
                            <p className="text-xl font-bold text-green-600">{instance.active_conversations}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Rate Limited</p>
                            <p className="text-xl font-bold text-orange-600">{instance.rate_limit_info.total_blocked}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Unique IPs</p>
                            <p className="text-xl font-bold">{instance.ip_tracking.unique_ips}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleActive(instance.id, instance.is_active)}
                        >
                          {instance.is_active ? (
                            <><Pause className="h-4 w-4 mr-1" /> Pause</>
                          ) : (
                            <><Play className="h-4 w-4 mr-1" /> Activate</>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => checkHealth(instance.id)}
                        >
                          <Activity className="h-4 w-4 mr-1" />
                          Check Health
                        </Button>
                        <Link to={`/configurable-genie?id=${instance.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            <Settings className="h-4 w-4 mr-1" />
                            Configure
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
};