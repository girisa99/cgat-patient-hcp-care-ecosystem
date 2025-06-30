
import React from 'react';
import { Section } from '@/components/ui/layout/Section';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Workflow, 
  FileText, 
  Shield, 
  Users,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Code,
  Database
} from 'lucide-react';
import { OnboardingApiDetector } from '@/utils/api/OnboardingApiDetector';

export const OnboardingIntegrationTabContent: React.FC = () => {
  // Get onboarding APIs
  const onboardingIntegration = OnboardingApiDetector.generateOnboardingIntegration();
  const onboardingEndpoints = OnboardingApiDetector.detectOnboardingApis();

  // Group endpoints by module
  const endpointsByModule = onboardingEndpoints.reduce((acc, endpoint) => {
    if (!acc[endpoint.module]) {
      acc[endpoint.module] = [];
    }
    acc[endpoint.module].push(endpoint);
    return acc;
  }, {} as Record<string, typeof onboardingEndpoints>);

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const moduleIcons = {
    'Onboarding Workflow': Workflow,
    'Treatment Center Onboarding': Building2,
    'Onboarding Compliance': Shield
  };

  return (
    <Section 
      variant="card" 
      title="Onboarding API Integration" 
      subtitle="Comprehensive onboarding APIs for treatment centers, facilities, and healthcare provider workflows"
    >
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Code className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{onboardingIntegration.endpoints.length}</p>
                  <p className="text-sm text-muted-foreground">API Endpoints</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Database className="h-6 w-6 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{Object.keys(onboardingIntegration.schemas).length}</p>
                  <p className="text-sm text-muted-foreground">Data Schemas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{onboardingIntegration.rlsPolicies.length}</p>
                  <p className="text-sm text-muted-foreground">Security Policies</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">Active</p>
                  <p className="text-sm text-muted-foreground">Status</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Modules */}
        <div className="space-y-6">
          {Object.entries(endpointsByModule).map(([moduleName, endpoints]) => {
            const IconComponent = moduleIcons[moduleName as keyof typeof moduleIcons] || Workflow;
            
            return (
              <Card key={moduleName}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-6 w-6 text-blue-600" />
                      <div>
                        <CardTitle className="text-lg">{moduleName}</CardTitle>
                        <CardDescription>
                          {endpoints.length} endpoints available for integration
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        {endpoints.filter(e => e.requiresWorkflowPermission).length} Protected
                      </Badge>
                      <Badge variant="secondary">
                        v{onboardingIntegration.version}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {endpoints.map((endpoint, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge className={getMethodColor(endpoint.method)}>
                            {endpoint.method}
                          </Badge>
                          <div>
                            <p className="font-medium">{endpoint.name}</p>
                            <p className="text-sm text-muted-foreground">{endpoint.path}</p>
                            <p className="text-xs text-muted-foreground mt-1">{endpoint.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {endpoint.requiresWorkflowPermission && (
                            <Badge variant="outline" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              Protected
                            </Badge>
                          )}
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Integration Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5" />
              Integration Actions
            </CardTitle>
            <CardDescription>
              Available actions for onboarding API integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                View API Documentation
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Download Postman Collection
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Configure Access
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Edge Function Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Edge Function Integration
            </CardTitle>
            <CardDescription>
              Onboarding workflow edge function is connected and available
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">onboarding-workflow</p>
                  <p className="text-sm text-green-700">Edge function deployed and active</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </Section>
  );
};
