
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  AlertTriangle,
  Download,
  Eye,
  Activity
} from 'lucide-react';

interface ConsumptionTabContentProps {
  publishedApis: any[];
}

export const ConsumptionTabContent: React.FC<ConsumptionTabContentProps> = ({
  publishedApis
}) => {
  const [selectedApi, setSelectedApi] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('7d');

  // Mock analytics data
  const analyticsData = useMemo(() => ({
    totalRequests: 15420,
    totalConsumers: 89,
    averageResponseTime: 245,
    errorRate: 2.1,
    topEndpoints: [
      { endpoint: '/api/v1/users', requests: 4521, responseTime: 180 },
      { endpoint: '/api/v1/facilities', requests: 3892, responseTime: 220 },
      { endpoint: '/api/v1/onboarding', requests: 2847, responseTime: 340 },
      { endpoint: '/api/v1/modules', requests: 2105, responseTime: 165 },
      { endpoint: '/api/v1/auth', requests: 2055, responseTime: 95 }
    ],
    consumersOverTime: [
      { date: '2024-01-01', consumers: 45 },
      { date: '2024-01-02', consumers: 52 },
      { date: '2024-01-03', consumers: 61 },
      { date: '2024-01-04', consumers: 73 },
      { date: '2024-01-05', consumers: 82 },
      { date: '2024-01-06', consumers: 87 },
      { date: '2024-01-07', consumers: 89 }
    ],
    requestsOverTime: [
      { date: '2024-01-01', requests: 1200 },
      { date: '2024-01-02', requests: 1450 },
      { date: '2024-01-03', requests: 1820 },
      { date: '2024-01-04', requests: 2100 },
      { date: '2024-01-05', requests: 2650 },
      { date: '2024-01-06', requests: 2890 },
      { date: '2024-01-07', requests: 3310 }
    ]
  }), []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Consumption Analytics</h2>
          <p className="text-muted-foreground">Monitor API usage, performance, and consumer behavior</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedApi} onValueChange={setSelectedApi}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select API" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All APIs</SelectItem>
              {publishedApis.map((api) => (
                <SelectItem key={api.id} value={api.id}>
                  {api.external_name || api.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last Day</SelectItem>
              <SelectItem value="7d">Last Week</SelectItem>
              <SelectItem value="30d">Last Month</SelectItem>
              <SelectItem value="90d">Last Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BarChart3 className="h-4 w-4 mr-2 text-blue-500" />
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalRequests.toLocaleString()}</div>
            <div className="flex items-center text-sm text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2 text-green-500" />
              Active Consumers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalConsumers}</div>
            <div className="flex items-center text-sm text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.2% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2 text-orange-500" />
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.averageResponseTime}ms</div>
            <div className="flex items-center text-sm text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              -5.3% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
              Error Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.errorRate}%</div>
            <div className="flex items-center text-sm text-red-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +0.8% from last period
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Top Endpoints
            </CardTitle>
            <CardDescription>Most frequently accessed API endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topEndpoints.map((endpoint, index) => (
                <div key={endpoint.endpoint} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-mono text-sm">{endpoint.endpoint}</div>
                      <div className="text-xs text-muted-foreground">
                        Avg: {endpoint.responseTime}ms
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{endpoint.requests.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">requests</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* API Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              API Status Overview
            </CardTitle>
            <CardDescription>Current status of all published APIs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {publishedApis.length > 0 ? (
                publishedApis.map((api) => (
                  <div key={api.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{api.external_name || api.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Version {api.version} • {api.visibility}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={api.status === 'published' ? 'default' : 'secondary'}>
                        {api.status}
                      </Badge>
                      <div className="text-right text-sm">
                        <div className="font-medium text-green-600">99.9%</div>
                        <div className="text-muted-foreground">uptime</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Published APIs</h3>
                  <p className="text-muted-foreground">
                    Publish some APIs to start seeing consumption analytics.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Trends</CardTitle>
          <CardDescription>API consumption patterns over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Daily Requests</h4>
              <div className="space-y-2">
                {analyticsData.requestsOverTime.map((day) => (
                  <div key={day.date} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {new Date(day.date).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(day.requests / 3500) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {day.requests.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Consumer Growth</h4>
              <div className="space-y-2">
                {analyticsData.consumersOverTime.map((day) => (
                  <div key={day.date} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {new Date(day.date).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(day.consumers / 100) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {day.consumers}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
