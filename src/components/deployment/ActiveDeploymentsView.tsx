import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Activity, 
  Search, 
  Pause,
  Play,
  Settings,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

const ActiveDeploymentsView = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock active deployments data
  const activeDeployments = [
    {
      id: '1',
      agentName: 'Onboarding Assistant',
      channel: 'Web Chat',
      environment: 'Production',
      status: 'active',
      uptime: '99.9%',
      requests: 1247,
      responseTime: '2.3s',
      lastActivity: '2 minutes ago',
      health: 'healthy'
    },
    {
      id: '2',
      agentName: 'Treatment Scheduler',
      channel: 'SMS',
      environment: 'Production',
      status: 'active',
      uptime: '98.7%',
      requests: 834,
      responseTime: '1.8s',
      lastActivity: '5 minutes ago',
      health: 'healthy'
    },
    {
      id: '3',
      agentName: 'FAQ Bot',
      channel: 'Phone',
      environment: 'UAT',
      status: 'paused',
      uptime: '95.2%',
      requests: 456,
      responseTime: '3.1s',
      lastActivity: '1 hour ago',
      health: 'warning'
    },
    {
      id: '4',
      agentName: 'Insurance Verifier',
      channel: 'Email',
      environment: 'Production',
      status: 'active',
      uptime: '99.5%',
      requests: 678,
      responseTime: '4.2s',
      lastActivity: '10 minutes ago',
      health: 'healthy'
    }
  ];

  const filteredDeployments = activeDeployments.filter((deployment) =>
    deployment.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deployment.channel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEnvironmentColor = (env: string) => {
    switch (env.toLowerCase()) {
      case 'production': return 'bg-red-100 text-red-800';
      case 'uat': return 'bg-orange-100 text-orange-800';
      case 'test': return 'bg-blue-100 text-blue-800';
      case 'dev': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 border-b">
        <Button variant="ghost" className="border-b-2 border-primary">
          All Deployments
        </Button>
        <Button variant="ghost">
          Voice Deployments
        </Button>
        <Button variant="ghost">
          Chat Deployments
        </Button>
      </div>

      {/* Search and Overview Stats */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search active deployments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {activeDeployments.filter(d => d.status === 'active').length} Active
          </Badge>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            {activeDeployments.filter(d => d.status === 'paused').length} Paused
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {activeDeployments.filter(d => d.channel === 'Phone').length} Voice
          </Badge>
        </div>
      </div>

      {/* Deployments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDeployments.map((deployment) => (
          <Card key={deployment.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {getHealthIcon(deployment.health)}
                    <CardTitle className="text-lg">{deployment.agentName}</CardTitle>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(deployment.status)}>
                    {deployment.status}
                  </Badge>
                  <Badge className={getEnvironmentColor(deployment.environment)}>
                    {deployment.environment}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Channel and Basic Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Channel</p>
                  <p className="font-medium">{deployment.channel}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Activity</p>
                  <p className="font-medium">{deployment.lastActivity}</p>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-4 p-3 bg-muted/20 rounded-lg">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Uptime</p>
                  <p className="text-sm font-bold text-green-600">{deployment.uptime}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Requests</p>
                  <p className="text-sm font-bold">{deployment.requests.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Avg Response</p>
                  <p className="text-sm font-bold">{deployment.responseTime}</p>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button 
                  size="sm" 
                  variant={deployment.status === 'active' ? 'outline' : 'default'}
                  className="flex-1"
                >
                  {deployment.status === 'active' ? (
                    <>
                      <Pause className="h-3 w-3 mr-1" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 mr-1" />
                      Resume
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDeployments.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No active deployments found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms' : 'Deploy some agents to see them here'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ActiveDeploymentsView;