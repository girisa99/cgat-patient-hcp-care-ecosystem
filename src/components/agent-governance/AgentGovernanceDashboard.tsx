import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Gavel, 
  Users, 
  FileCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Shield,
  BookOpen,
  Archive
} from 'lucide-react';

interface GovernanceMetrics {
  policyCompliance: number;
  activeAgents: number;
  pendingApprovals: number;
  riskScore: number;
  auditItems: number;
}

export const AgentGovernanceDashboard: React.FC = () => {
  const [metrics] = useState<GovernanceMetrics>({
    policyCompliance: 92,
    activeAgents: 47,
    pendingApprovals: 3,
    riskScore: 23,
    auditItems: 12
  });

  const [policies] = useState([
    {
      id: 1,
      name: 'Agent Data Privacy Policy',
      status: 'active',
      compliance: 95,
      lastUpdated: '2024-01-15',
      category: 'privacy'
    },
    {
      id: 2,
      name: 'AI Ethics Guidelines',
      status: 'draft',
      compliance: 0,
      lastUpdated: '2024-01-10',
      category: 'ethics'
    },
    {
      id: 3,
      name: 'Healthcare Compliance Framework',
      status: 'active',
      compliance: 98,
      lastUpdated: '2024-01-12',
      category: 'healthcare'
    }
  ]);

  const [approvals] = useState([
    {
      id: 1,
      type: 'Agent Deployment',
      name: 'Patient Triage Agent v2.1',
      requester: 'Dr. Smith',
      submitted: '2024-01-16',
      priority: 'high',
      status: 'pending'
    },
    {
      id: 2,
      type: 'Model Update',
      name: 'GPT-4 Integration',
      requester: 'DevOps Team',
      submitted: '2024-01-15',
      priority: 'medium',
      status: 'pending'
    },
    {
      id: 3,
      type: 'Data Access Request',
      name: 'Patient Records API',
      requester: 'Research Team',
      submitted: '2024-01-14',
      priority: 'low',
      status: 'under_review'
    }
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Agent Governance</h2>
          <p className="text-muted-foreground">Manage policies, approvals, and compliance across all agents</p>
        </div>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          <Gavel className="w-3 h-3 mr-1" />
          Governance Active
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Policy Compliance</p>
                <p className="text-2xl font-bold">{metrics.policyCompliance}%</p>
                <Progress value={metrics.policyCompliance} className="mt-2" />
              </div>
              <FileCheck className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Agents</p>
                <p className="text-2xl font-bold">{metrics.activeAgents}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.pendingApprovals}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Risk Score</p>
                <p className="text-2xl font-bold text-green-600">{metrics.riskScore}</p>
              </div>
              <Shield className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Audit Items</p>
                <p className="text-2xl font-bold">{metrics.auditItems}</p>
              </div>
              <Archive className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="policies" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="risk-management">Risk Management</TabsTrigger>
          <TabsTrigger value="audit-compliance">Audit & Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Governance Policies
              </CardTitle>
              <CardDescription>
                Manage and monitor AI agent governance policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {policies.map((policy) => (
                  <div key={policy.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        policy.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      <div>
                        <p className="font-medium">{policy.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Last updated: {new Date(policy.lastUpdated).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {policy.status === 'active' ? `${policy.compliance}% compliant` : 'Draft'}
                        </p>
                        <Progress 
                          value={policy.compliance} 
                          className="w-20 h-2" 
                        />
                      </div>
                      <Badge className={getStatusColor(policy.status)}>
                        {policy.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
                <Button className="w-full" variant="outline">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Create New Policy
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Pending Approvals
              </CardTitle>
              <CardDescription>
                Review and approve agent deployments, updates, and access requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approvals.map((approval) => (
                  <div key={approval.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{approval.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {approval.type} • Requested by {approval.requester}
                        </p>
                      </div>
                      <Badge className={getPriorityColor(approval.priority) + " border"}>
                        {approval.priority} priority
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Submitted: {new Date(approval.submitted).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                        <Button size="sm" variant="destructive">
                          Reject
                        </Button>
                        <Button size="sm">
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk-management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Risk Management
              </CardTitle>
              <CardDescription>
                Monitor and mitigate risks across AI agent operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Risk Categories</h4>
                  {[
                    { name: 'Data Privacy', level: 'low', score: 15 },
                    { name: 'Model Bias', level: 'medium', score: 35 },
                    { name: 'Security Vulnerabilities', level: 'low', score: 20 },
                    { name: 'Compliance Gaps', level: 'low', score: 10 }
                  ].map((risk, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{risk.name}</p>
                        <p className="text-xs text-muted-foreground">Risk score: {risk.score}</p>
                      </div>
                      <Badge variant={risk.level === 'medium' ? 'destructive' : 'secondary'}>
                        {risk.level}
                      </Badge>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Mitigation Actions</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Regular security audits completed
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      Bias testing in progress
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      Monitoring systems enhanced
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit-compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="w-5 h-5" />
                Audit & Compliance
              </CardTitle>
              <CardDescription>
                Track compliance status and prepare for audits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <h4 className="font-medium">Next Audit</h4>
                    <p className="text-2xl font-bold text-blue-600">Q2 2024</p>
                    <p className="text-sm text-muted-foreground">HIPAA Compliance</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <h4 className="font-medium">Compliance Score</h4>
                    <p className="text-2xl font-bold text-green-600">{metrics.policyCompliance}%</p>
                    <p className="text-sm text-muted-foreground">Above target (90%)</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <h4 className="font-medium">Open Items</h4>
                    <p className="text-2xl font-bold text-orange-600">{metrics.auditItems}</p>
                    <p className="text-sm text-muted-foreground">To be resolved</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Recent Audit Activities</h4>
                  {[
                    'Data lineage documentation updated',
                    'Agent decision logs archived',
                    'Privacy impact assessment completed',
                    'Security controls validated'
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">{activity}</span>
                      <Badge variant="outline" className="ml-auto">
                        Completed
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};