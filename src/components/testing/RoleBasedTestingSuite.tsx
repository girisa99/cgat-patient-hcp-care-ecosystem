/**
 * Role-Based Testing Suite
 * Comprehensive testing interface that shows only role-specific content
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TestTube, FileText, Building, Users, Shield, 
  CheckCircle, XCircle, Clock, Play, Download,
  BookOpen, Settings, AlertCircle, Database,
  Code, Layers, GitBranch, Target
} from "lucide-react";
import { useRoleSpecificSync } from '@/hooks/useRealTimeRoleSync';
import { useMasterAuth } from '@/hooks/useMasterAuth';

// Define UserRole locally since not exported from types
type UserRole = 'superAdmin' | 'healthcareProvider' | 'nurse' | 'caseManager' | 'onboardingTeam' | 'patientCaregiver' | 'financeTeam' | 'contractTeam' | 'workflowManager' | 'demoUser';

interface TestCase {
  id: string;
  name: string;
  type: 'unit' | 'integration' | 'e2e' | 'system' | 'performance' | 'security';
  status: 'passed' | 'failed' | 'pending' | 'skipped';
  role_specific: boolean;
  target_roles: UserRole[];
  description: string;
  requirements: string[];
  last_run: string;
  duration_ms: number;
}

interface DocumentationSection {
  id: string;
  type: 'user_requirements' | 'business_requirements' | 'functional_spec' | 'architecture_high' | 'architecture_low' | 'reference_architecture';
  title: string;
  content: string;
  role_access: UserRole[];
  last_updated: string;
}

interface RoleTestingConfig {
  role: UserRole;
  test_categories: string[];
  documentation_access: string[];
  architecture_levels: string[];
  permissions: {
    can_run_tests: boolean;
    can_view_results: boolean;
    can_create_tests: boolean;
    can_access_architecture: boolean;
  };
}

const ROLE_TESTING_CONFIGS: Record<UserRole, RoleTestingConfig> = {
  superAdmin: {
    role: 'superAdmin',
    test_categories: ['unit', 'integration', 'e2e', 'system', 'performance', 'security'],
    documentation_access: ['user_requirements', 'business_requirements', 'functional_spec', 'architecture_high', 'architecture_low', 'reference_architecture'],
    architecture_levels: ['high', 'low', 'reference', 'system', 'technical'],
    permissions: { can_run_tests: true, can_view_results: true, can_create_tests: true, can_access_architecture: true }
  },
  healthcareProvider: {
    role: 'healthcareProvider',
    test_categories: ['unit', 'integration', 'system'],
    documentation_access: ['user_requirements', 'functional_spec', 'architecture_high'],
    architecture_levels: ['high', 'functional'],
    permissions: { can_run_tests: true, can_view_results: true, can_create_tests: false, can_access_architecture: true }
  },
  nurse: {
    role: 'nurse',
    test_categories: ['unit', 'integration'],
    documentation_access: ['user_requirements', 'functional_spec'],
    architecture_levels: ['functional'],
    permissions: { can_run_tests: true, can_view_results: true, can_create_tests: false, can_access_architecture: false }
  },
  caseManager: {
    role: 'caseManager',
    test_categories: ['unit', 'integration', 'system'],
    documentation_access: ['user_requirements', 'business_requirements', 'functional_spec'],
    architecture_levels: ['high', 'functional'],
    permissions: { can_run_tests: true, can_view_results: true, can_create_tests: false, can_access_architecture: true }
  },
  onboardingTeam: {
    role: 'onboardingTeam',
    test_categories: ['unit', 'integration', 'e2e', 'system'],
    documentation_access: ['user_requirements', 'business_requirements', 'functional_spec', 'architecture_high'],
    architecture_levels: ['high', 'low', 'system'],
    permissions: { can_run_tests: true, can_view_results: true, can_create_tests: true, can_access_architecture: true }
  },
  patientCaregiver: {
    role: 'patientCaregiver',
    test_categories: ['unit', 'integration'],
    documentation_access: ['user_requirements', 'functional_spec'],
    architecture_levels: ['functional'],
    permissions: { can_run_tests: true, can_view_results: true, can_create_tests: false, can_access_architecture: false }
  },
  financeTeam: {
    role: 'financeTeam',
    test_categories: ['unit', 'integration', 'system'],
    documentation_access: ['business_requirements', 'functional_spec', 'architecture_high'],
    architecture_levels: ['high', 'business'],
    permissions: { can_run_tests: true, can_view_results: true, can_create_tests: false, can_access_architecture: true }
  },
  contractTeam: {
    role: 'contractTeam',
    test_categories: ['integration', 'system'],
    documentation_access: ['business_requirements', 'functional_spec'],
    architecture_levels: ['business'],
    permissions: { can_run_tests: false, can_view_results: true, can_create_tests: false, can_access_architecture: false }
  },
  workflowManager: {
    role: 'workflowManager',
    test_categories: ['unit', 'integration', 'e2e', 'system', 'performance'],
    documentation_access: ['user_requirements', 'business_requirements', 'functional_spec', 'architecture_high', 'architecture_low'],
    architecture_levels: ['high', 'low', 'system', 'workflow'],
    permissions: { can_run_tests: true, can_view_results: true, can_create_tests: true, can_access_architecture: true }
  },
  demoUser: {
    role: 'demoUser',
    test_categories: ['unit'],
    documentation_access: ['user_requirements'],
    architecture_levels: ['functional'],
    permissions: { can_run_tests: false, can_view_results: true, can_create_tests: false, can_access_architecture: false }
  }
};

export const RoleBasedTestingSuite: React.FC = () => {
  const { user } = useMasterAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [testResults, setTestResults] = useState<TestCase[]>([]);
  const [documentation, setDocumentation] = useState<DocumentationSection[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Get user role from user metadata or default to demoUser
  const userRole = (user?.user_metadata?.role || 'demoUser') as UserRole;
  const roleConfig = ROLE_TESTING_CONFIGS[userRole];

  // Real-time sync for role-specific updates
  const { hasUpdates, updateCount, getLatestUpdatesForRole } = useRoleSpecificSync(userRole);

  useEffect(() => {
    loadRoleSpecificTestData();
  }, [userRole, hasUpdates]);

  const loadRoleSpecificTestData = async () => {
    // Mock data - in real implementation, this would fetch from database
    // filtered by role permissions
    const mockTestCases: TestCase[] = [
      {
        id: '1',
        name: 'User Authentication Tests',
        type: 'unit' as const,
        status: 'passed' as const,
        role_specific: true,
        target_roles: [userRole],
        description: 'Validate user authentication flows',
        requirements: ['REQ-001', 'REQ-002'],
        last_run: new Date().toISOString(),
        duration_ms: 1500
      },
      {
        id: '2',
        name: 'API Integration Tests',
        type: 'integration' as const,
        status: 'passed' as const,
        role_specific: true,
        target_roles: [userRole],
        description: 'Test API endpoints and data flow',
        requirements: ['REQ-003', 'REQ-004'],
        last_run: new Date().toISOString(),
        duration_ms: 3200
      }
    ].filter(test => roleConfig.test_categories.includes(test.type));

    const mockDocumentation: DocumentationSection[] = [
      {
        id: '1',
        type: 'user_requirements' as const,
        title: 'User Requirements Document',
        content: `Role-specific user requirements for ${userRole}`,
        role_access: [userRole],
        last_updated: new Date().toISOString()
      },
      {
        id: '2',
        type: 'functional_spec' as const,
        title: 'Functional Specifications',
        content: `Functional specifications relevant to ${userRole}`,
        role_access: [userRole],
        last_updated: new Date().toISOString()
      }
    ].filter(doc => roleConfig.documentation_access.includes(doc.type));

    setTestResults(mockTestCases);
    setDocumentation(mockDocumentation);
  };

  const runRoleSpecificTests = async () => {
    if (!roleConfig.permissions.can_run_tests) return;

    setIsRunningTests(true);
    // Simulate test execution
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update test results
    setTestResults(prev => prev.map(test => ({
      ...test,
      status: Math.random() > 0.2 ? 'passed' : 'failed',
      last_run: new Date().toISOString(),
      duration_ms: Math.floor(Math.random() * 5000) + 500
    })));
    
    setIsRunningTests(false);
  };

  const getTestStatusIcon = (status: TestCase['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const passedTests = testResults.filter(t => t.status === 'passed').length;
  const totalTests = testResults.length;
  const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Testing Suite - {userRole}
            {hasUpdates && (
              <Badge variant="destructive" className="text-xs">
                {updateCount} updates
              </Badge>
            )}
          </h2>
          <p className="text-gray-600">
            Role-specific testing and documentation access
          </p>
        </div>
        <div className="flex items-center gap-3">
          {roleConfig.permissions.can_run_tests && (
            <Button 
              onClick={runRoleSpecificTests} 
              disabled={isRunningTests}
              className="flex items-center gap-2"
            >
              <Play className={`h-4 w-4 ${isRunningTests ? 'animate-spin' : ''}`} />
              {isRunningTests ? 'Running Tests...' : 'Run Tests'}
            </Button>
          )}
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
        </div>
      </div>

      {/* Testing Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total Tests</p>
                <p className="text-2xl font-bold text-blue-900">{totalTests}</p>
              </div>
              <TestTube className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Passed</p>
                <p className="text-2xl font-bold text-green-900">{passedTests}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">Success Rate</p>
                <p className="text-2xl font-bold text-orange-900">{successRate.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Documentation</p>
                <p className="text-2xl font-bold text-purple-900">{documentation.length}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Categories Available for Role */}
      <Card>
        <CardHeader>
          <CardTitle>Available Test Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {roleConfig.test_categories.map(category => (
              <Badge key={category} variant="outline" className="capitalize">
                {category}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Testing Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tests">Test Cases</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Execution Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Progress</span>
                      <span>{successRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={successRate} className="h-2" />
                  </div>
                  
                  {roleConfig.test_categories.map(category => (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{category} Tests</span>
                        <span>
                          {testResults.filter(t => t.type === category && t.status === 'passed').length}/
                          {testResults.filter(t => t.type === category).length}
                        </span>
                      </div>
                      <Progress 
                        value={
                          testResults.filter(t => t.type === category).length > 0 
                            ? (testResults.filter(t => t.type === category && t.status === 'passed').length / 
                               testResults.filter(t => t.type === category).length) * 100
                            : 0
                        } 
                        className="h-2" 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Role Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Run Tests</span>
                    {roleConfig.permissions.can_run_tests ? 
                      <CheckCircle className="h-5 w-5 text-green-600" /> :
                      <XCircle className="h-5 w-5 text-red-600" />
                    }
                  </div>
                  <div className="flex items-center justify-between">
                    <span>View Results</span>
                    {roleConfig.permissions.can_view_results ? 
                      <CheckCircle className="h-5 w-5 text-green-600" /> :
                      <XCircle className="h-5 w-5 text-red-600" />
                    }
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Create Tests</span>
                    {roleConfig.permissions.can_create_tests ? 
                      <CheckCircle className="h-5 w-5 text-green-600" /> :
                      <XCircle className="h-5 w-5 text-red-600" />
                    }
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Access Architecture</span>
                    {roleConfig.permissions.can_access_architecture ? 
                      <CheckCircle className="h-5 w-5 text-green-600" /> :
                      <XCircle className="h-5 w-5 text-red-600" />
                    }
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Role-Specific Test Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map(test => (
                  <div key={test.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getTestStatusIcon(test.status)}
                        <h3 className="font-semibold">{test.name}</h3>
                        <Badge variant="outline" className="capitalize">
                          {test.type}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">
                        {test.duration_ms}ms
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{test.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Requirements: {test.requirements.join(', ')}</span>
                      <span>Last run: {new Date(test.last_run).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation" className="mt-6">
          <div className="grid gap-6">
            {documentation.map(doc => (
              <Card key={doc.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {doc.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{doc.content}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <Badge variant="outline" className="capitalize">
                      {doc.type.replace('_', ' ')}
                    </Badge>
                    <span>Updated: {new Date(doc.last_updated).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="architecture" className="mt-6">
          {roleConfig.permissions.can_access_architecture ? (
            <div className="grid gap-6">
              {roleConfig.architecture_levels.map(level => (
                <Card key={level}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 capitalize">
                      <Layers className="h-5 w-5" />
                      {level} Level Architecture
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      {level} level architecture documentation specific to {userRole} role.
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
                <p className="text-gray-600">
                  Architecture documentation is not accessible for your role ({userRole}).
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="requirements" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  User requirements specific to {userRole} role and responsibilities.
                </p>
              </CardContent>
            </Card>

            {roleConfig.documentation_access.includes('business_requirements') && (
              <Card>
                <CardHeader>
                  <CardTitle>Business Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Business requirements relevant to {userRole} role.
                  </p>
                </CardContent>
              </Card>
            )}

            {roleConfig.documentation_access.includes('functional_spec') && (
              <Card>
                <CardHeader>
                  <CardTitle>Functional Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Functional specifications for {userRole} workflows and processes.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};