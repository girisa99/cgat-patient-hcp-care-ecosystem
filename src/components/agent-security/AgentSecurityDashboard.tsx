import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Lock, 
  Key, 
  Eye, 
  Users, 
  Clock,
  FileText,
  Globe,
  Database
} from 'lucide-react';

interface SecurityMetrics {
  securityScore: number;
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  compliance: {
    hipaa: boolean;
    gdpr: boolean;
    sox: boolean;
    iso27001: boolean;
  };
  accessControls: {
    rbacEnabled: boolean;
    mfaRequired: boolean;
    sessionTimeout: number;
  };
}

export const AgentSecurityDashboard: React.FC = () => {
  const [securityConfig, setSecurityConfig] = useState({
    encryptionEnabled: true,
    auditLogging: true,
    accessControl: true,
    dataRetention: true,
  });

  const [metrics] = useState<SecurityMetrics>({
    securityScore: 87,
    vulnerabilities: {
      critical: 0,
      high: 2,
      medium: 5,
      low: 12
    },
    compliance: {
      hipaa: true,
      gdpr: true,
      sox: false,
      iso27001: false
    },
    accessControls: {
      rbacEnabled: true,
      mfaRequired: false,
      sessionTimeout: 3600
    }
  });

  const getComplianceStatus = (isCompliant: boolean) => (
    <Badge variant={isCompliant ? "default" : "destructive"}>
      {isCompliant ? "Compliant" : "Non-Compliant"}
    </Badge>
  );

  const getVulnerabilityColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Agent Security & Compliance</h2>
          <p className="text-muted-foreground">Secure your AI agents and maintain regulatory compliance</p>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <Shield className="w-3 h-3 mr-1" />
          Security Score: {metrics.securityScore}%
        </Badge>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Security Score</p>
                <p className="text-2xl font-bold">{metrics.securityScore}%</p>
                <Progress value={metrics.securityScore} className="mt-2" />
              </div>
              <Shield className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Vulnerabilities</p>
                <p className="text-2xl font-bold text-red-600">{metrics.vulnerabilities.critical}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Compliance</p>
                <p className="text-2xl font-bold">{Object.values(metrics.compliance).filter(Boolean).length}/4</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Access Controls</p>
                <p className="text-2xl font-bold">{metrics.accessControls.rbacEnabled ? 'Active' : 'Inactive'}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="vulnerabilities" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="access-control">Access Control</TabsTrigger>
          <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="vulnerabilities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Security Vulnerabilities
              </CardTitle>
              <CardDescription>
                Identified security issues and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(metrics.vulnerabilities).map(([level, count]) => (
                  <div key={level} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full bg-current ${getVulnerabilityColor(level)}`} />
                      <div>
                        <p className="font-medium capitalize">{level} Risk</p>
                        <p className="text-sm text-muted-foreground">
                          {level === 'critical' ? 'Immediate action required' :
                           level === 'high' ? 'Address within 24 hours' :
                           level === 'medium' ? 'Address within 7 days' :
                           'Monitor and address as needed'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={level === 'critical' ? 'destructive' : 'secondary'}>
                      {count} issues
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Regulatory Compliance
              </CardTitle>
              <CardDescription>
                Compliance status for various regulatory frameworks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">HIPAA</p>
                      <p className="text-sm text-muted-foreground">Health Insurance Portability</p>
                    </div>
                    {getComplianceStatus(metrics.compliance.hipaa)}
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">GDPR</p>
                      <p className="text-sm text-muted-foreground">General Data Protection Regulation</p>
                    </div>
                    {getComplianceStatus(metrics.compliance.gdpr)}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">SOX</p>
                      <p className="text-sm text-muted-foreground">Sarbanes-Oxley Act</p>
                    </div>
                    {getComplianceStatus(metrics.compliance.sox)}
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">ISO 27001</p>
                      <p className="text-sm text-muted-foreground">Information Security Management</p>
                    </div>
                    {getComplianceStatus(metrics.compliance.iso27001)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access-control" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Access Control Settings
              </CardTitle>
              <CardDescription>
                Manage user access and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Role-Based Access Control (RBAC)</p>
                  <p className="text-sm text-muted-foreground">Control access based on user roles</p>
                </div>
                <Switch 
                  checked={metrics.accessControls.rbacEnabled}
                  onCheckedChange={() => {}}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Multi-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Require additional authentication factors</p>
                </div>
                <Switch 
                  checked={metrics.accessControls.mfaRequired}
                  onCheckedChange={() => {}}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Session Timeout</p>
                  <p className="text-sm text-muted-foreground">Automatic logout after inactivity</p>
                </div>
                <Badge variant="outline">
                  {Math.floor(metrics.accessControls.sessionTimeout / 60)} minutes
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit-logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Audit Trail
              </CardTitle>
              <CardDescription>
                Security events and access logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { action: 'Agent Configuration Updated', user: 'admin@healthcare.com', time: '2 minutes ago', risk: 'low' },
                  { action: 'New API Key Generated', user: 'dev@healthcare.com', time: '1 hour ago', risk: 'medium' },
                  { action: 'Failed Login Attempt', user: 'unknown@example.com', time: '3 hours ago', risk: 'high' },
                  { action: 'Data Export Initiated', user: 'manager@healthcare.com', time: '1 day ago', risk: 'medium' },
                ].map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        log.risk === 'high' ? 'bg-red-500' :
                        log.risk === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`} />
                      <div>
                        <p className="font-medium text-sm">{log.action}</p>
                        <p className="text-xs text-muted-foreground">{log.user}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{log.time}</p>
                      <Badge variant={log.risk === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                        {log.risk}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};