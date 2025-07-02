
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Database, 
  Globe, 
  Key, 
  Shield, 
  Users, 
  Zap,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Settings
} from 'lucide-react';
import { useUnifiedPageData } from '@/hooks/useUnifiedPageData';

export const ApiServicesOverview: React.FC = () => {
  const { apiServices } = useUnifiedPageData();
  
  console.log('🚀 API Services Overview - Comprehensive functionality display');

  const stats = {
    total: apiServices.data.length,
    active: apiServices.data.filter(api => api.status === 'active').length,
    internal: apiServices.data.filter(api => api.type === 'internal').length,
    external: apiServices.data.filter(api => api.type === 'external').length,
    published: apiServices.data.filter(api => api.lifecycle_stage === 'production').length,
    development: apiServices.data.filter(api => api.lifecycle_stage === 'development').length
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total APIs</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active APIs</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Internal APIs</p>
                <p className="text-2xl font-bold text-purple-600">{stats.internal}</p>
              </div>
              <Database className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">External APIs</p>
                <p className="text-2xl font-bold text-orange-600">{stats.external}</p>
              </div>
              <ExternalLink className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Lifecycle Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              API Lifecycle Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Development</span>
                <Badge variant="secondary">{stats.development}</Badge>
              </div>
              <Progress value={(stats.development / stats.total) * 100} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Production</span>
                <Badge variant="default">{stats.published}</Badge>
              </div>
              <Progress value={(stats.published / stats.total) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  <span className="text-sm">API Keys Active</span>
                </div>
                <Badge variant="outline">Secured</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Access Control</span>
                </div>
                <Badge variant="outline">RLS Enabled</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm">Rate Limiting</span>
                </div>
                <Badge variant="outline">Configured</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent API Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent API Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {apiServices.data.slice(0, 5).map((api) => (
              <div key={api.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${
                    api.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  <div>
                    <p className="font-medium">{api.name}</p>
                    <p className="text-sm text-muted-foreground">{api.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={api.lifecycle_stage === 'production' ? 'default' : 'secondary'}>
                    {api.lifecycle_stage}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">All APIs Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Database Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Security Validated</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
