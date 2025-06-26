
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { ExternalApiRegistry } from '@/utils/api/ExternalApiManager';
import { TrendingUp, Users, Clock, AlertTriangle } from 'lucide-react';

interface ExternalApiAnalyticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  api: ExternalApiRegistry | null;
}

// Mock analytics data - in a real app, this would come from your analytics service
const mockAnalyticsData = {
  dailyUsage: [
    { date: '2025-06-20', requests: 1200, errors: 15 },
    { date: '2025-06-21', requests: 1450, errors: 8 },
    { date: '2025-06-22', requests: 1300, errors: 12 },
    { date: '2025-06-23', requests: 1680, errors: 6 },
    { date: '2025-06-24', requests: 1520, errors: 9 },
    { date: '2025-06-25', requests: 1750, errors: 4 },
    { date: '2025-06-26', requests: 1890, errors: 3 }
  ],
  topEndpoints: [
    { path: '/api/v1/patients', requests: 4200, avgResponseTime: 145 },
    { path: '/api/v1/facilities', requests: 2800, avgResponseTime: 89 },
    { path: '/api/v1/users', requests: 2400, avgResponseTime: 167 },
    { path: '/api/v1/modules', requests: 1900, avgResponseTime: 123 },
    { path: '/api/v1/auth', requests: 1600, avgResponseTime: 201 }
  ],
  summary: {
    totalRequests: 12750,
    uniqueUsers: 248,
    avgResponseTime: 134,
    errorRate: 0.6
  }
};

const ExternalApiAnalyticsDialog = ({ open, onOpenChange, api }: ExternalApiAnalyticsDialogProps) => {
  if (!api) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Analytics: {api.external_name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{mockAnalyticsData.summary.totalRequests.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Requests</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{mockAnalyticsData.summary.uniqueUsers}</p>
                    <p className="text-sm text-muted-foreground">Unique Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{mockAnalyticsData.summary.avgResponseTime}ms</p>
                    <p className="text-sm text-muted-foreground">Avg Response</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{mockAnalyticsData.summary.errorRate}%</p>
                    <p className="text-sm text-muted-foreground">Error Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Usage (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockAnalyticsData.dailyUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="requests" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="errors" stroke="#ff7300" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Endpoints */}
          <Card>
            <CardHeader>
              <CardTitle>Top Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalyticsData.topEndpoints.map((endpoint, index) => (
                  <div key={endpoint.path} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{endpoint.path}</p>
                        <p className="text-sm text-muted-foreground">
                          {endpoint.requests.toLocaleString()} requests
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{endpoint.avgResponseTime}ms</p>
                      <p className="text-sm text-muted-foreground">avg response</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* API Status */}
          <Card>
            <CardHeader>
              <CardTitle>API Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Status</p>
                  <Badge className={
                    api.status === 'published' ? 'bg-green-100 text-green-800' :
                    api.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {api.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Visibility</p>
                  <Badge variant="outline">{api.visibility}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Version</p>
                  <p className="font-medium">{api.version}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="font-medium">
                    {api.published_at ? new Date(api.published_at).toLocaleDateString() : 'Not published'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExternalApiAnalyticsDialog;
