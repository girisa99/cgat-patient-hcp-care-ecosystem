
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Lock,
  Eye,
  UserCheck,
  Database
} from 'lucide-react';

const SecurityMetrics: React.FC = () => {
  const securityMetrics = [
    {
      title: 'Authentication Security',
      score: 95,
      status: 'excellent',
      icon: UserCheck,
      details: 'Multi-factor authentication enabled'
    },
    {
      title: 'Data Encryption',
      score: 98,
      status: 'excellent',
      icon: Lock,
      details: 'All data encrypted at rest and in transit'
    },
    {
      title: 'Access Control',
      score: 92,
      status: 'good',
      icon: Shield,
      details: 'Role-based permissions active'
    },
    {
      title: 'Database Security',
      score: 88,
      status: 'good',
      icon: Database,
      details: 'RLS policies implemented'
    }
  ];

  const threats = [
    {
      type: 'Low Risk',
      count: 2,
      color: 'bg-green-100 text-green-800'
    },
    {
      type: 'Medium Risk',
      count: 0,
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      type: 'High Risk',
      count: 0,
      color: 'bg-red-100 text-red-800'
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Security Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {securityMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <metric.icon className="h-4 w-4 mr-2" />
                {metric.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${getScoreColor(metric.score)}`}>
                    {metric.score}%
                  </span>
                  <Badge variant={metric.status === 'excellent' ? 'default' : 'secondary'}>
                    {metric.status}
                  </Badge>
                </div>
                <Progress 
                  value={metric.score} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {metric.details}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Threat Detection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Threat Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {threats.map((threat) => (
              <div key={threat.type} className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold mb-2">{threat.count}</div>
                <Badge className={threat.color}>
                  {threat.type}
                </Badge>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">
                No active security threats detected
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Successful login audit</p>
                  <p className="text-sm text-muted-foreground">All recent logins verified</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Security scan completed</p>
                  <p className="text-sm text-muted-foreground">No vulnerabilities found</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">4 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center space-x-3">
                <Lock className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">Access permissions updated</p>
                  <p className="text-sm text-muted-foreground">User roles synchronized</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">6 hours ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityMetrics;
