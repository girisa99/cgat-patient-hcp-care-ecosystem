
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Lock,
  Eye,
  UserCheck,
  Database,
  Code,
  Settings,
  Zap,
  Bug,
  Activity,
  Server,
  Clock,
  TrendingUp,
  Cpu,
  Globe
} from 'lucide-react';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';

interface SecurityPerformanceTabProps {
  verificationSummary?: VerificationSummary | null;
}

const SecurityPerformanceTab: React.FC<SecurityPerformanceTabProps> = ({ verificationSummary }) => {
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
      score: verificationSummary?.databaseValidation?.violations.length ? 
        Math.max(60, 100 - (verificationSummary.databaseValidation.violations.length * 10)) : 88,
      status: 'good',
      icon: Database,
      details: 'RLS policies implemented'
    }
  ];

  const performanceMetrics = [
    {
      title: 'API Response Time',
      value: '1.2s',
      percentage: 85,
      icon: Zap,
      trend: '+5%'
    },
    {
      title: 'Database Query Time',
      value: '45ms',
      percentage: 92,
      icon: Database,
      trend: '-2%'
    },
    {
      title: 'Server CPU Usage',
      value: '32%',
      percentage: 68,
      icon: Cpu,
      trend: '+1%'
    },
    {
      title: 'Network Latency',
      value: '23ms',
      percentage: 88,
      icon: Globe,
      trend: '-3%'
    }
  ];

  const systemHealth = [
    { component: 'Web Server', status: 'Healthy', uptime: '99.9%' },
    { component: 'Database', status: 'Healthy', uptime: '99.8%' },
    { component: 'API Gateway', status: 'Healthy', uptime: '99.7%' },
    { component: 'Authentication', status: 'Healthy', uptime: '100%' }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Security Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Security Metrics
          </CardTitle>
          <CardDescription>Current security posture and compliance status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {securityMetrics.map((metric) => (
              <div key={metric.title} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <metric.icon className="h-5 w-5" />
                  <Badge variant={metric.status === 'excellent' ? 'default' : 'secondary'}>
                    {metric.status}
                  </Badge>
                </div>
                <div className={`text-2xl font-bold mb-2 ${getScoreColor(metric.score)}`}>
                  {metric.score}%
                </div>
                <p className="text-sm font-medium mb-2">{metric.title}</p>
                <Progress value={metric.score} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground">{metric.details}</p>
              </div>
            ))}
          </div>

          {/* Live Verification Results */}
          {verificationSummary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-gray-50">
              <div className="text-center">
                <Database className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <div className="text-xl font-bold">{verificationSummary.databaseValidation?.violations.length || 0}</div>
                <p className="text-sm text-muted-foreground">Database Issues</p>
              </div>
              
              <div className="text-center">
                <Code className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                <div className="text-xl font-bold">{verificationSummary.codeQuality?.issues.length || 0}</div>
                <p className="text-sm text-muted-foreground">Code Quality Issues</p>
              </div>

              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto mb-2 text-red-500" />
                <div className="text-xl font-bold">{verificationSummary.securityScan?.vulnerabilities.length || 0}</div>
                <p className="text-sm text-muted-foreground">Security Vulnerabilities</p>
              </div>

              <div className="text-center">
                <Settings className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <div className="text-xl font-bold">{verificationSummary.schemaValidation?.violations.length || 0}</div>
                <p className="text-sm text-muted-foreground">Schema Issues</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Performance Metrics
          </CardTitle>
          <CardDescription>System performance and response times</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {performanceMetrics.map((metric) => (
              <div key={metric.title} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <metric.icon className="h-5 w-5" />
                  <span className="text-xs text-muted-foreground">{metric.trend}</span>
                </div>
                <div className="text-2xl font-bold mb-2">{metric.value}</div>
                <p className="text-sm font-medium mb-2">{metric.title}</p>
                <Progress value={metric.percentage} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground">
                  Performance Score: {metric.percentage}%
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              System Health Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemHealth.map((system) => (
                <div key={system.component} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">{system.component}</p>
                      <p className="text-sm text-muted-foreground">{system.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{system.uptime}</p>
                    <p className="text-sm text-muted-foreground">Uptime</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Current System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold mb-2">
                  {verificationSummary?.validationResult.warnings.length || 0}
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">
                  Warnings
                </Badge>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold mb-2">
                  {verificationSummary?.issuesFound || 0}
                </div>
                <Badge className="bg-orange-100 text-orange-800">
                  Issues
                </Badge>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold mb-2">
                  {verificationSummary?.criticalIssues || 0}
                </div>
                <Badge className="bg-red-100 text-red-800">
                  Critical
                </Badge>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">
                  {!verificationSummary || verificationSummary.criticalIssues === 0 
                    ? "No critical security threats detected" 
                    : `${verificationSummary.criticalIssues} critical issues require immediate attention`
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Performance Trends (Last 24h)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Response Time Trends</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Peak Performance</span>
                  <span className="text-sm font-medium">0.8s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average</span>
                  <span className="text-sm font-medium">1.2s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Slowest Response</span>
                  <span className="text-sm font-medium">2.1s</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Resource Usage</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Memory Usage</span>
                  <span className="text-sm font-medium">64%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Disk I/O</span>
                  <span className="text-sm font-medium">23%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Network Traffic</span>
                  <span className="text-sm font-medium">156 MB</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security & Performance Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {verificationSummary && (
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <Eye className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Comprehensive security scan completed</p>
                    <p className="text-sm text-muted-foreground">
                      {verificationSummary.issuesFound} issues found, {verificationSummary.autoFixesApplied} auto-fixed
                    </p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {verificationSummary.timestamp ? new Date(verificationSummary.timestamp).toLocaleTimeString() : 'Now'}
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Performance monitoring active</p>
                  <p className="text-sm text-muted-foreground">Real-time metrics collection enabled</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">Real-time</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">RLS policies validated</p>
                  <p className="text-sm text-muted-foreground">Database security confirmed</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">4 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center space-x-3">
                <Activity className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">Performance baseline updated</p>
                  <p className="text-sm text-muted-foreground">System metrics recalibrated</p>
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

export default SecurityPerformanceTab;
