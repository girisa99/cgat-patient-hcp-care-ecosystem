
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  FileText,
  Lock,
  Users,
  Database,
  Eye
} from 'lucide-react';

const ComplianceStatus: React.FC = () => {
  const complianceStandards = [
    {
      name: 'HIPAA',
      status: 'Compliant',
      percentage: 98,
      icon: Shield,
      lastAudit: '2024-06-15'
    },
    {
      name: 'SOC 2',
      status: 'Compliant',
      percentage: 95,
      icon: Lock,
      lastAudit: '2024-06-10'
    },
    {
      name: 'GDPR',
      status: 'Compliant',
      percentage: 92,
      icon: Users,
      lastAudit: '2024-06-20'
    },
    {
      name: 'ISO 27001',
      status: 'In Progress',
      percentage: 78,
      icon: FileText,
      lastAudit: '2024-06-01'
    }
  ];

  const complianceChecks = [
    {
      category: 'Data Protection',
      checks: [
        { name: 'Data encryption at rest', status: 'pass' },
        { name: 'Data encryption in transit', status: 'pass' },
        { name: 'Access logging enabled', status: 'pass' },
        { name: 'Regular backup verification', status: 'pass' }
      ]
    },
    {
      category: 'Access Control',
      checks: [
        { name: 'Multi-factor authentication', status: 'pass' },
        { name: 'Role-based access control', status: 'pass' },
        { name: 'Regular access reviews', status: 'warning' },
        { name: 'Password policy compliance', status: 'pass' }
      ]
    },
    {
      category: 'Audit & Monitoring',
      checks: [
        { name: 'Comprehensive audit logging', status: 'pass' },
        { name: 'Real-time monitoring', status: 'pass' },
        { name: 'Incident response plan', status: 'pass' },
        { name: 'Regular security assessments', status: 'pass' }
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'fail':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Compliant':
        return <Badge className="bg-green-100 text-green-800">Compliant</Badge>;
      case 'In Progress':
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case 'Non-Compliant':
        return <Badge className="bg-red-100 text-red-800">Non-Compliant</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Compliance Standards Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {complianceStandards.map((standard) => (
          <Card key={standard.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <div className="flex items-center">
                  <standard.icon className="h-4 w-4 mr-2" />
                  {standard.name}
                </div>
                {getStatusBadge(standard.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{standard.percentage}%</div>
                <Progress value={standard.percentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Last audit: {standard.lastAudit}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Compliance Checks */}
      <div className="space-y-4">
        {complianceChecks.map((category) => (
          <Card key={category.category}>
            <CardHeader>
              <CardTitle className="text-lg">{category.category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category.checks.map((check) => (
                  <div key={check.name} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(check.status)}
                      <span className="font-medium">{check.name}</span>
                    </div>
                    <Badge 
                      variant={check.status === 'pass' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {check.status === 'pass' ? 'PASS' : check.status === 'warning' ? 'WARNING' : 'FAIL'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Compliance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Compliance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg bg-green-50">
              <div className="text-3xl font-bold text-green-600 mb-2">24</div>
              <p className="text-sm text-green-800">Checks Passed</p>
            </div>
            <div className="text-center p-4 border rounded-lg bg-yellow-50">
              <div className="text-3xl font-bold text-yellow-600 mb-2">1</div>
              <p className="text-sm text-yellow-800">Warnings</p>
            </div>
            <div className="text-center p-4 border rounded-lg bg-red-50">
              <div className="text-3xl font-bold text-red-600 mb-2">0</div>
              <p className="text-sm text-red-800">Failed Checks</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-blue-800 font-medium">Overall Compliance Score: 96%</p>
                <p className="text-blue-700 text-sm">System meets healthcare industry standards</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceStatus;
