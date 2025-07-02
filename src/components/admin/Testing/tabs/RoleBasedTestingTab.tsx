
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { enhancedTestingService, RoleBasedTestSuite } from '@/services/enhancedTestingService';
import { Users, Shield, Key, TestTube, UserCheck, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const RoleBasedTestingTab: React.FC = () => {
  const [roleBasedSuites, setRoleBasedSuites] = useState<RoleBasedTestSuite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadRoleBasedSuites();
  }, []);

  const loadRoleBasedSuites = async () => {
    setIsLoading(true);
    try {
      const suites = await enhancedTestingService.generateRoleBasedTestSuites();
      setRoleBasedSuites(suites);
    } catch (error) {
      console.error('Failed to load role-based test suites:', error);
      toast({
        title: "❌ Failed to Load Role-Based Tests",
        description: "Could not load role-based test suites",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateSecurityTests = async () => {
    setIsGenerating(true);
    try {
      const testsCreated = await enhancedTestingService.generateSecurityAndComplianceTests();
      toast({
        title: "✅ Security Tests Generated",
        description: `Generated ${testsCreated} security and compliance test cases`,
      });
      await loadRoleBasedSuites();
    } catch (error) {
      toast({
        title: "❌ Generation Failed",
        description: "Failed to generate security test cases",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-8 w-8 text-indigo-600" />
            <div>
              <h3 className="text-xl font-semibold text-indigo-900">Role-Based Testing Suite</h3>
              <p className="text-indigo-700">Automated testing based on user roles and module access</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-sm text-gray-600">Active Roles</div>
              <div className="text-2xl font-bold text-indigo-600">{roleBasedSuites.length}</div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-sm text-gray-600">Total Test Suites</div>
              <div className="text-2xl font-bold text-purple-600">
                {roleBasedSuites.reduce((acc, suite) => acc + suite.requiredTests.length, 0)}
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-sm text-gray-600">Login Scenarios</div>
              <div className="text-2xl font-bold text-blue-600">
                {roleBasedSuites.reduce((acc, suite) => acc + suite.loginScenarios.length, 0)}
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-sm text-gray-600">Permission Tests</div>
              <div className="text-2xl font-bold text-green-600">
                {roleBasedSuites.reduce((acc, suite) => acc + suite.permissionTests.length, 0)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Test Generation Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <EnhancedButton
              onClick={loadRoleBasedSuites}
              loading={isLoading}
              loadingText="Refreshing..."
              variant="outline"
            >
              <Users className="h-4 w-4 mr-2" />
              Refresh Role-Based Tests
            </EnhancedButton>
            
            <EnhancedButton
              onClick={generateSecurityTests}
              loading={isGenerating}
              loadingText="Generating Security Tests..."
              variant="default"
            >
              <Shield className="h-4 w-4 mr-2" />
              Generate Security & Compliance Tests
            </EnhancedButton>
          </div>
        </CardContent>
      </Card>

      {/* Role-Based Test Suites */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roleBasedSuites.map((suite) => (
          <Card key={suite.roleName}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                {suite.roleName} Role Testing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="modules" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="modules">Modules</TabsTrigger>
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="permissions">Permissions</TabsTrigger>
                  <TabsTrigger value="functional">Functional</TabsTrigger>
                </TabsList>

                <TabsContent value="modules">
                  <div className="space-y-3">
                    <h4 className="font-medium">Module Access ({suite.moduleAccess.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {suite.moduleAccess.map((module) => (
                        <Badge key={module} variant="outline">
                          {module}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="login">
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Login Scenarios ({suite.loginScenarios.length})
                    </h4>
                    <div className="space-y-2">
                      {suite.loginScenarios.slice(0, 3).map((test) => (
                        <div key={test.id} className="p-2 bg-gray-50 rounded text-sm">
                          {test.test_name}
                        </div>
                      ))}
                      {suite.loginScenarios.length > 3 && (
                        <div className="text-sm text-muted-foreground">
                          +{suite.loginScenarios.length - 3} more scenarios
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="permissions">
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Permission Tests ({suite.permissionTests.length})
                    </h4>
                    <div className="space-y-2">
                      {suite.permissionTests.slice(0, 3).map((test) => (
                        <div key={test.id} className="p-2 bg-gray-50 rounded text-sm">
                          {test.test_name}
                        </div>
                      ))}
                      {suite.permissionTests.length > 3 && (
                        <div className="text-sm text-muted-foreground">
                          +{suite.permissionTests.length - 3} more permission tests
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="functional">
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <TestTube className="h-4 w-4" />
                      Functional Tests ({suite.requiredTests.length})
                    </h4>
                    <div className="space-y-2">
                      {suite.requiredTests.slice(0, 3).map((test) => (
                        <div key={test.id} className="p-2 bg-gray-50 rounded text-sm">
                          {test.test_name}
                        </div>
                      ))}
                      {suite.requiredTests.length > 3 && (
                        <div className="text-sm text-muted-foreground">
                          +{suite.requiredTests.length - 3} more functional tests
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>

      {roleBasedSuites.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No Role-Based Test Suites</h3>
            <p className="text-muted-foreground mb-4">
              Generate role-based test suites to automatically test user permissions and module access.
            </p>
            <Button onClick={loadRoleBasedSuites}>
              Generate Role-Based Tests
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
