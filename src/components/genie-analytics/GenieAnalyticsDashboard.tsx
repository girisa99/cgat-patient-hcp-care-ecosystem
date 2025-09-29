/**
 * REUSABLE GENIE ANALYTICS DASHBOARD
 * Complete analytics view for any Genie deployment/conversation
 * Can be filtered by genie_id, brand_config_id, or deployment_id
 */
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useGenieAnalytics } from '@/hooks/useGenieAnalytics';
import { 
  Users, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Database,
  Activity,
  BarChart3,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GenieAnalyticsDashboardProps {
  genieId?: string;
  brandConfigId?: string;
  deploymentType?: string;
  showFilters?: boolean;
  instanceName?: string;
}

export const GenieAnalyticsDashboard: React.FC<GenieAnalyticsDashboardProps> = ({
  genieId,
  brandConfigId,
  deploymentType,
  showFilters = true,
  instanceName
}) => {
  const {
    analytics,
    conversations,
    accessRequests,
    knowledgeBaseStats,
    performanceMetrics,
    contextAnalytics,
    domains,
    isLoading,
    refreshData
  } = useGenieAnalytics({ genieId, brandConfigId, deploymentType });

  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {instanceName ? `${instanceName} - Analytics` : 'Enhanced Genie Analytics Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            Complete view of users, conversations, session analytics, access requests, and engagement metrics
            {deploymentType && <span className="ml-2">• Type: <span className="font-semibold">{deploymentType}</span></span>}
          </p>
        </div>
        <Button onClick={() => refreshData()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.registeredUsers || 0} registered, {analytics?.anonymousUsers || 0} anonymous
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics?.activeSessions || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.sessionsStartedToday || 0} started today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{analytics?.completedSessions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {analytics?.avgSessionDuration || 0} min
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Access Requests</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{analytics?.accessRequests || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.approvedRequests || 0} approved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalMessages || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.peakHours || '0:00 - 1:00'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Retention</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.userRetention || 0}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Session Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Session Status Overview</CardTitle>
          <CardDescription>Breakdown of conversation completion rates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Completed Sessions</span>
            <Badge variant="default">{analytics?.completedSessions || 0}</Badge>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary rounded-full h-2" 
              style={{ 
                width: `${((analytics?.completedSessions || 0) / Math.max(analytics?.totalConversations || 1, 1)) * 100}%` 
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Active Sessions</span>
            <Badge variant="secondary">{analytics?.activeSessions || 0}</Badge>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-green-500 rounded-full h-2" 
              style={{ 
                width: `${((analytics?.activeSessions || 0) / Math.max(analytics?.totalConversations || 1, 1)) * 100}%` 
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Total: {analytics?.totalConversations || 0} conversations tracked
          </p>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="context">Context Analytics</TabsTrigger>
          <TabsTrigger value="model">Model Usage</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="users">Users & Sessions</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="access">Access Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Comprehensive view of all analytics data across {analytics?.totalConversations || 0} conversations
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="context" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Technology Context</CardTitle>
                <Database className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{contextAnalytics?.technologyContext || 0}</div>
                <p className="text-xs text-muted-foreground">0% of conversations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Healthcare Context</CardTitle>
                <Activity className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{contextAnalytics?.healthcareContext || 0}</div>
                <p className="text-xs text-muted-foreground">0% of conversations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">General Context</CardTitle>
                <MessageSquare className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{contextAnalytics?.generalContext || 0}</div>
                <p className="text-xs text-muted-foreground">0% of conversations</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Brand & Product Information</CardTitle>
                <CardDescription>Current deployment configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Brand Name</p>
                  <p className="text-sm text-muted-foreground">{analytics?.brandContext || 'No brand configured'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Product Focus</p>
                  <p className="text-sm text-muted-foreground">{analytics?.productFocus || 'No product specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Deployment Type</p>
                  <Badge variant="outline">{analytics?.deploymentType}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant={analytics?.deploymentStatus === 'active' ? 'default' : 'secondary'}>
                    {analytics?.deploymentStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Domain Verifications</CardTitle>
                <CardDescription>Verified domains for this instance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Verified Domains</span>
                    <Badge>{analytics?.verifiedDomains || 0}</Badge>
                  </div>
                  {domains && domains.length > 0 ? (
                    <div className="space-y-2 mt-4">
                      {domains.map((domain: any) => (
                        <div key={domain.id} className="p-2 border rounded-lg flex items-center justify-between">
                          <span className="text-sm">{domain.domain}</span>
                          <Badge variant={domain.is_verified ? 'default' : 'secondary'}>
                            {domain.is_verified ? 'Verified' : 'Pending'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-4">No domains configured</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="model" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Model Usage Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">Model requests: {performanceMetrics?.totalRequests || 0}</p>
                <p className="text-sm">Avg response time: {performanceMetrics?.avgResponseTime || 0}ms</p>
                <p className="text-sm">Success rate: {performanceMetrics?.successRate || 0}%</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">Uptime: {performanceMetrics?.uptime || 99.9}%</p>
                <p className="text-sm">Error rate: {performanceMetrics?.errorRate || 0}%</p>
                <p className="text-sm">Peak concurrent users: {performanceMetrics?.peakUsers || 0}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base Analytics</CardTitle>
              <CardDescription>Cross-functional knowledge base by topics and interests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Total Entries: {knowledgeBaseStats?.totalEntries || 0}</p>
                  <p className="text-sm text-muted-foreground">Active: {knowledgeBaseStats?.activeEntries || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Topics Covered</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {knowledgeBaseStats?.topics?.map((topic: string) => (
                      <Badge key={topic} variant="outline">{topic}</Badge>
                    )) || <p className="text-xs text-muted-foreground">No topics yet</p>}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Most Queried</p>
                  <p className="text-sm text-muted-foreground">{knowledgeBaseStats?.mostQueried || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User & Session Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">Total users: {analytics?.totalUsers || 0}</p>
                <p className="text-sm">Active sessions: {analytics?.activeSessions || 0}</p>
                <p className="text-sm">Avg session length: {analytics?.avgSessionDuration || 0} min</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {conversations?.length > 0 ? (
                  conversations.slice(0, 10).map((conv: any) => (
                    <div key={conv.id} className="p-2 border rounded-lg">
                      <p className="text-sm font-medium">{conv.title || 'Conversation'}</p>
                      <p className="text-xs text-muted-foreground">
                        {conv.status} • {new Date(conv.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Access Request Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {accessRequests?.length > 0 ? (
                  accessRequests.slice(0, 10).map((request: any) => (
                    <div key={request.id} className="p-2 border rounded-lg">
                      <p className="text-sm font-medium">{request.user_email}</p>
                      <p className="text-xs text-muted-foreground">
                        Status: <Badge variant={request.status === 'approved' ? 'default' : 'secondary'}>
                          {request.status}
                        </Badge>
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No access requests</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
