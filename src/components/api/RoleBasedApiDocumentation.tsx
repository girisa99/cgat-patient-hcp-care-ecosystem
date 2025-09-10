/**
 * ROLE-BASED API DOCUMENTATION
 * Comprehensive documentation covering all user roles and their API access
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, Users, FileText, Key, Code, 
  Globe, Lock, Database, Stethoscope, 
  Calculator, File, Workflow,
  TestTube, Download, ExternalLink
} from "lucide-react";
import { useRoleBasedApiSuite, UserRole } from '@/hooks/useRoleBasedApiSuite';
import { useMasterAuth } from '@/hooks/useMasterAuth';

const RoleBasedApiDocumentation: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('superAdmin');
  const { generateRoleApiDocs, generatePostmanCollection } = useRoleBasedApiSuite();
  const { userRoles } = useMasterAuth();

  const roleConfig = {
    superAdmin: {
      icon: Shield,
      color: 'bg-red-100 text-red-800',
      description: 'Full system access with administrative privileges',
      primaryFunction: 'System Administration & Management',
      apiCategories: ['All Internal APIs', 'All External APIs', 'Admin APIs', 'Configuration APIs']
    },
    healthcareProvider: {
      icon: Stethoscope,
      color: 'bg-blue-100 text-blue-800',
      description: 'Clinical operations and patient care management',
      primaryFunction: 'Clinical Care & Patient Management',
      apiCategories: ['Patient APIs', 'Treatment APIs', 'Clinical APIs', 'EHR Integration']
    },
    nurse: {
      icon: Users,
      color: 'bg-green-100 text-green-800',
      description: 'Patient documentation and care coordination',
      primaryFunction: 'Patient Care Documentation',
      apiCategories: ['Patient Care APIs', 'Documentation APIs', 'Monitoring APIs']
    },
    caseManager: {
      icon: Workflow,
      color: 'bg-purple-100 text-purple-800',
      description: 'Care coordination and workflow management',
      primaryFunction: 'Care Coordination & Case Management',
      apiCategories: ['Case Management APIs', 'Workflow APIs', 'Coordination APIs']
    },
    onboardingTeam: {
      icon: FileText,
      color: 'bg-orange-100 text-orange-800',
      description: 'Facility setup and initial configurations',
      primaryFunction: 'Onboarding & Setup',
      apiCategories: ['Onboarding APIs', 'Facility APIs', 'Configuration APIs']
    },
    patientCaregiver: {
      icon: Users,
      color: 'bg-teal-100 text-teal-800',
      description: 'Patient-facing services and support',
      primaryFunction: 'Patient Support Services',
      apiCategories: ['Patient Portal APIs', 'Support APIs', 'Communication APIs']
    },
    financeTeam: {
      icon: Calculator,
      color: 'bg-yellow-100 text-yellow-800',
      description: 'Billing and financial operations',
      primaryFunction: 'Financial Management & Billing',
      apiCategories: ['Billing APIs', 'Insurance APIs', 'Financial APIs', 'Claims APIs']
    },
    contractTeam: {
      icon: File,
      color: 'bg-indigo-100 text-indigo-800',
      description: 'Legal agreements and compliance',
      primaryFunction: 'Contract & Compliance Management',
      apiCategories: ['Contract APIs', 'Legal APIs', 'Compliance APIs']
    },
    workflowManager: {
      icon: Workflow,
      color: 'bg-pink-100 text-pink-800',
      description: 'Process optimization and workflow management',
      primaryFunction: 'Process Optimization',
      apiCategories: ['Workflow APIs', 'Process APIs', 'Optimization APIs', 'Integration APIs']
    },
    demoUser: {
      icon: TestTube,
      color: 'bg-gray-100 text-gray-800',
      description: 'Limited demo access for evaluation',
      primaryFunction: 'Demo & Evaluation',
      apiCategories: ['Demo APIs', 'Sample Data APIs']
    }
  };

  const getRoleDocumentation = (role: UserRole) => {
    const docs = generateRoleApiDocs(role);
    return docs;
  };

  const downloadPostmanForRole = async (role: UserRole) => {
    const collection = generatePostmanCollection(role);
    const blob = new Blob([JSON.stringify(collection, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${role}_api_collection.postman_collection.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const accessLevelColor = (level: string) => {
    switch (level) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'write': return 'bg-blue-100 text-blue-800';
      case 'read': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const currentRoleDocs = getRoleDocumentation(selectedRole);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <FileText className="h-8 w-8" />
            <span>API Documentation by Role</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive API access documentation for all healthcare roles
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => downloadPostmanForRole(selectedRole)}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Postman Collection
          </Button>
        </div>
      </div>

      {/* Current User Role Alert */}
      {userRoles.length > 0 && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You currently have the following roles: {userRoles.join(', ')}. 
            Documentation shown below reflects your access level.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="roles">Role Details</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="testing">Testing Guide</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.keys(roleConfig) as UserRole[]).map((role) => {
              const config = roleConfig[role];
              const Icon = config.icon;
              const roleDocs = getRoleDocumentation(role);

              return (
                <Card 
                  key={role} 
                  className={`cursor-pointer transition-all ${
                    selectedRole === role ? 'ring-2 ring-primary' : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedRole(role)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-5 w-5" />
                        <CardTitle className="text-lg capitalize">
                          {role.replace(/([A-Z])/g, ' $1').trim()}
                        </CardTitle>
                      </div>
                      <Badge className={config.color}>
                        {roleDocs.total_apis} APIs
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{config.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Internal APIs:</span>
                        <Badge variant="outline">{roleDocs.internal_apis}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>External APIs:</span>
                        <Badge variant="outline">{roleDocs.external_apis}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Sandbox Enabled:</span>
                        <Badge variant="outline">{roleDocs.sandbox_enabled}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Production Access:</span>
                        <Badge variant="outline">{roleDocs.production_enabled}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Role Details Tab */}
        <TabsContent value="roles" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Role Selector */}
            <Card>
              <CardHeader>
                <CardTitle>Select Role</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(Object.keys(roleConfig) as UserRole[]).map((role) => {
                  const config = roleConfig[role];
                  const Icon = config.icon;
                  
                  return (
                    <Button
                      key={role}
                      variant={selectedRole === role ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setSelectedRole(role)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {role.replace(/([A-Z])/g, ' $1').trim()}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Role Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    {React.createElement(roleConfig[selectedRole].icon, { className: "h-6 w-6" })}
                    <CardTitle className="text-xl capitalize">
                      {selectedRole.replace(/([A-Z])/g, ' $1').trim()}
                    </CardTitle>
                    <Badge className={roleConfig[selectedRole].color}>
                      {currentRoleDocs.total_apis} APIs Available
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-gray-600">{roleConfig[selectedRole].description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Primary Function</h4>
                    <p className="text-gray-600">{roleConfig[selectedRole].primaryFunction}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">API Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {roleConfig[selectedRole].apiCategories.map((category, index) => (
                        <Badge key={index} variant="outline">{category}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {currentRoleDocs.total_apis}
                      </div>
                      <div className="text-sm text-gray-600">Total APIs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {currentRoleDocs.sandbox_enabled}
                      </div>
                      <div className="text-sm text-gray-600">Sandbox APIs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {currentRoleDocs.production_enabled}
                      </div>
                      <div className="text-sm text-gray-600">Production APIs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {currentRoleDocs.agent_integration_enabled}
                      </div>
                      <div className="text-sm text-gray-600">Agent APIs</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* API Access Details */}
              <Card>
                <CardHeader>
                  <CardTitle>API Access Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentRoleDocs.apis.map((api, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">{api.name}</h5>
                          <div className="flex items-center space-x-2">
                            <Badge className={accessLevelColor(api.accessConfig?.access_level || 'none')}>
                              {api.accessConfig?.access_level || 'none'}
                            </Badge>
                            {api.accessConfig?.sandbox_access && (
                              <Badge variant="outline">Sandbox</Badge>
                            )}
                            {api.accessConfig?.production_access && (
                              <Badge variant="outline">Production</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{api.description}</p>
                        <div className="text-xs text-gray-500">
                          <strong>Endpoints:</strong> {api.accessConfig?.endpoints_allowed?.join(', ') || 'None specified'}
                        </div>
                        {api.accessConfig?.rate_limit && (
                          <div className="text-xs text-gray-500">
                            <strong>Rate Limit:</strong> {api.accessConfig.rate_limit} requests/hour
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Endpoints Tab */}
        <TabsContent value="endpoints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Endpoints for {selectedRole.replace(/([A-Z])/g, ' $1').trim()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentRoleDocs.apis.map((api, apiIndex) => (
                  <div key={apiIndex} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3 flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span>{api.name}</span>
                      <Badge className={accessLevelColor(api.accessConfig?.access_level || 'none')}>
                        {api.accessConfig?.access_level}
                      </Badge>
                    </h4>
                    
                    <div className="space-y-2">
                      {api.accessConfig?.endpoints_allowed?.map((endpoint, endpointIndex) => (
                        <div key={endpointIndex} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <code className="text-sm">{endpoint}</code>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {api.accessConfig?.access_level === 'admin' ? 'ALL' : 
                               api.accessConfig?.access_level === 'write' ? 'GET, POST, PUT' : 'GET'}
                            </Badge>
                            {api.accessConfig?.sandbox_access && (
                              <div className="flex items-center" title="Sandbox Available">
                                <Lock className="h-3 w-3 text-green-500" />
                              </div>
                            )}
                            {api.accessConfig?.production_access && (
                              <div className="flex items-center" title="Production Access">
                                <Lock className="h-3 w-3 text-red-500" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testing Guide Tab */}
        <TabsContent value="testing" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TestTube className="h-5 w-5" />
                  <span>Testing Permissions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Sandbox Access:</span>
                    <Badge variant={currentRoleDocs.sandbox_enabled > 0 ? "default" : "secondary"}>
                      {currentRoleDocs.sandbox_enabled > 0 ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Production Access:</span>
                    <Badge variant={currentRoleDocs.production_enabled > 0 ? "default" : "secondary"}>
                      {currentRoleDocs.production_enabled > 0 ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Postman Collections:</span>
                    <Badge variant={currentRoleDocs.postman_access > 0 ? "default" : "secondary"}>
                      {currentRoleDocs.postman_access > 0 ? "Available" : "Not Available"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Agent Integration:</span>
                    <Badge variant={currentRoleDocs.agent_integration_enabled > 0 ? "default" : "secondary"}>
                      {currentRoleDocs.agent_integration_enabled > 0 ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>Authentication</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    All API requests require proper authentication with role-based access control.
                  </p>
                  <div className="bg-gray-50 p-3 rounded">
                    <code className="text-xs">
                      Authorization: Bearer your-api-key-here
                    </code>
                  </div>
                  <div className="text-xs text-gray-500">
                    <strong>Note:</strong> API keys are role-specific and grant access only to 
                    endpoints permitted for your role ({selectedRole}).
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Start Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Step 1: Get Your API Key</h4>
                  <p className="text-sm text-gray-600">
                    Visit the Developer Hub to generate role-specific API keys for {selectedRole} access.
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Step 2: Download Postman Collection</h4>
                  <p className="text-sm text-gray-600">
                    Use the button above to download a ready-to-use Postman collection with all 
                    endpoints available to your role.
                  </p>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Step 3: Test in Sandbox</h4>
                  <p className="text-sm text-gray-600">
                    {currentRoleDocs.sandbox_enabled > 0 ? 
                      "Start testing with sandbox endpoints to familiarize yourself with the API structure." :
                      "Sandbox access is not available for this role. Contact your administrator for testing access."
                    }
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Step 4: Integrate with Agents</h4>
                  <p className="text-sm text-gray-600">
                    {currentRoleDocs.agent_integration_enabled > 0 ? 
                      "Configure AI agents to use these APIs for automated workflows and intelligent processing." :
                      "Agent integration is not available for this role."
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RoleBasedApiDocumentation;