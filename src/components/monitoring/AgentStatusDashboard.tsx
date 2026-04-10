/**
 * AGENT STATUS DASHBOARD
 * Real-time monitoring of channels, models, and token usage
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Zap, 
  Brain, 
  MessageSquare, 
  Database,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Cpu,
  HardDrive
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface ChannelStatus {
  id: string;
  name: string;
  type: 'web' | 'api' | 'webhook' | 'socket';
  status: 'active' | 'inactive' | 'error';
  activeAgents: number;
  lastActivity: string;
  uptime: string;
  requestsPerHour: number;
}

interface ModelStatus {
  id: string;
  name: string;
  provider: string;
  status: 'active' | 'inactive' | 'rate_limited';
  tokensUsed: number;
  tokensRemaining: number;
  totalTokens: number;
  cost: number;
  activeRequests: number;
  averageResponseTime: number;
}

interface TokenUsageStats {
  totalUsed: number;
  totalRemaining: number;
  totalAllocated: number;
  costToday: number;
  requestsToday: number;
  averageCostPerRequest: number;
}

export const AgentStatusDashboard: React.FC = () => {
  const [channels, setChannels] = useState<ChannelStatus[]>([]);
  const [models, setModels] = useState<ModelStatus[]>([]);
  const [tokenStats, setTokenStats] = useState<TokenUsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load channel statuses
      const mockChannels: ChannelStatus[] = [
        {
          id: 'web-1',
          name: 'Web Interface',
          type: 'web',
          status: 'active',
          activeAgents: 5,
          lastActivity: '2 minutes ago',
          uptime: '99.9%',
          requestsPerHour: 450
        },
        {
          id: 'api-1', 
          name: 'REST API',
          type: 'api',
          status: 'active',
          activeAgents: 12,
          lastActivity: '30 seconds ago',
          uptime: '100%',
          requestsPerHour: 1250
        },
        {
          id: 'webhook-1',
          name: 'Webhook Handler',
          type: 'webhook',
          status: 'inactive',
          activeAgents: 0,
          lastActivity: '1 hour ago',
          uptime: '95.2%',
          requestsPerHour: 0
        }
      ];

      // Load model statuses
      const mockModels: ModelStatus[] = [
        {
          id: 'gpt-4o',
          name: 'GPT-4o',
          provider: 'OpenAI',
          status: 'active',
          tokensUsed: 125000,
          tokensRemaining: 875000,
          totalTokens: 1000000,
          cost: 15.75,
          activeRequests: 3,
          averageResponseTime: 850
        },
        {
          id: 'claude-sonnet-4-6',
          name: 'Claude Sonnet 4.6',
          provider: 'Anthropic',
          status: 'active',
          tokensUsed: 89000,
          tokensRemaining: 911000,
          totalTokens: 1000000,
          cost: 8.90,
          activeRequests: 1,
          averageResponseTime: 1200
        },
        {
          id: 'gpt-4o-mini',
          name: 'GPT-4o Mini',
          provider: 'OpenAI',
          status: 'rate_limited',
          tokensUsed: 980000,
          tokensRemaining: 20000,
          totalTokens: 1000000,
          cost: 2.94,
          activeRequests: 0,
          averageResponseTime: 650
        }
      ];

      // Calculate token usage stats
      const totalUsed = mockModels.reduce((sum, model) => sum + model.tokensUsed, 0);
      const totalRemaining = mockModels.reduce((sum, model) => sum + model.tokensRemaining, 0);
      const totalAllocated = mockModels.reduce((sum, model) => sum + model.totalTokens, 0);
      const costToday = mockModels.reduce((sum, model) => sum + model.cost, 0);

      const mockTokenStats: TokenUsageStats = {
        totalUsed,
        totalRemaining,
        totalAllocated,
        costToday,
        requestsToday: 2847,
        averageCostPerRequest: costToday / 2847
      };

      setChannels(mockChannels);
      setModels(mockModels);
      setTokenStats(mockTokenStats);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <Clock className="h-4 w-4 text-gray-400" />;
      case 'error':
      case 'rate_limited':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-gray-400';
      case 'error':
      case 'rate_limited':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Agent Status Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time monitoring of channels, models, and token usage
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </Badge>
          <Button variant="outline" size="sm" onClick={loadDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {tokenStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold">
                    {((tokenStats.totalUsed / tokenStats.totalAllocated) * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Token Usage</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">${tokenStats.costToday.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">Cost Today</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{tokenStats.requestsToday.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Requests Today</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {channels.filter(c => c.status === 'active').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Active Channels</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Status */}
      <Tabs defaultValue="channels">
        <TabsList>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="tokens">Token Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="space-y-4">
          <div className="grid gap-4">
            {channels.map((channel) => (
              <motion.div
                key={channel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(channel.status)}`} />
                        <div>
                          <div className="font-medium">{channel.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {channel.type.toUpperCase()} • {channel.activeAgents} agents
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Uptime</div>
                          <div className="font-medium">{channel.uptime}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Requests/hr</div>
                          <div className="font-medium">{channel.requestsPerHour}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Last Activity</div>
                          <div className="font-medium">{channel.lastActivity}</div>
                        </div>
                        {getStatusIcon(channel.status)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <div className="grid gap-4">
            {models.map((model) => (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(model.status)}`} />
                          <div>
                            <div className="font-medium">{model.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {model.provider} • ${model.cost.toFixed(2)} today
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Active Requests</div>
                            <div className="font-medium">{model.activeRequests}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Avg Response</div>
                            <div className="font-medium">{model.averageResponseTime}ms</div>
                          </div>
                          {getStatusIcon(model.status)}
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Token Usage</span>
                          <span>
                            {model.tokensUsed.toLocaleString()} / {model.totalTokens.toLocaleString()}
                          </span>
                        </div>
                        <Progress 
                          value={(model.tokensUsed / model.totalTokens) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tokens" className="space-y-4">
          {tokenStats && (
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Token Usage Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Total Usage</span>
                      <span>
                        {tokenStats.totalUsed.toLocaleString()} / {tokenStats.totalAllocated.toLocaleString()}
                      </span>
                    </div>
                    <Progress 
                      value={(tokenStats.totalUsed / tokenStats.totalAllocated) * 100} 
                      className="h-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Remaining Tokens</div>
                      <div className="text-xl font-bold">
                        {tokenStats.totalRemaining.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Average Cost per Request</div>
                      <div className="text-xl font-bold">
                        ${tokenStats.averageCostPerRequest.toFixed(4)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Usage by Model</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {models.map((model) => (
                      <div key={model.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(model.status)}`} />
                          <span className="text-sm">{model.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {((model.tokensUsed / tokenStats.totalUsed) * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ${model.cost.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};