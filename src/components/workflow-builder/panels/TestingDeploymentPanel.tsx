import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TestTube, Rocket, Play, CheckCircle, XCircle, Clock,
  Shield, Monitor, Database, Zap, Settings, Plus, Eye
} from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';

interface TestingDeploymentPanelProps {
  onTestRun?: (test: any) => void;
  onDeploy?: (environment: string) => void;
}

export const TestingDeploymentPanel: React.FC<TestingDeploymentPanelProps> = ({
  onTestRun,
  onDeploy
}) => {
  const { showSuccess, showError } = useMasterToast();
  const [activeTab, setActiveTab] = useState('testing');

  const testSuites = [
    {
      id: 'integration-tests',
      name: 'Integration Tests',
      description: 'End-to-end workflow testing',
      status: 'passed',
      lastRun: '2 hours ago',
      coverage: 87,
      tests: [
        { name: 'Patient Intake Flow', status: 'passed', duration: '2.3s' },
        { name: 'Case Assignment', status: 'passed', duration: '1.8s' },
        { name: 'Notification Delivery', status: 'failed', duration: '5.2s' },
        { name: 'Data Validation', status: 'passed', duration: '0.9s' }
      ]
    },
    {
      id: 'security-tests',
      name: 'Security & Compliance',
      description: 'HIPAA and security validation',
      status: 'passed',
      lastRun: '1 hour ago',
      coverage: 94,
      tests: [
        { name: 'PHI Protection', status: 'passed', duration: '1.2s' },
        { name: 'Access Control', status: 'passed', duration: '0.8s' },
        { name: 'Audit Trail', status: 'passed', duration: '1.5s' },
        { name: 'Encryption Check', status: 'passed', duration: '0.6s' }
      ]
    },
    {
      id: 'performance-tests',
      name: 'Performance Tests',
      description: 'Load and performance validation',
      status: 'running',
      lastRun: 'Running now',
      coverage: 45,
      tests: [
        { name: 'Load Testing', status: 'running', duration: 'In progress' },
        { name: 'Latency Check', status: 'queued', duration: 'Pending' },
        { name: 'Concurrent Users', status: 'queued', duration: 'Pending' },
        { name: 'Memory Usage', status: 'queued', duration: 'Pending' }
      ]
    }
  ];

  const deploymentEnvironments = [
    {
      id: 'development',
      name: 'Development',
      status: 'active',
      version: 'v1.2.3-dev',
      lastDeployed: '3 hours ago',
      health: 98,
      instances: 2,
      traffic: '0%',
      description: 'Development environment for testing new features'
    },
    {
      id: 'staging',
      name: 'Staging',
      status: 'active',
      version: 'v1.2.2',
      lastDeployed: '1 day ago',
      health: 95,
      instances: 3,
      traffic: '5%',
      description: 'Pre-production environment for final validation'
    },
    {
      id: 'production',
      name: 'Production',
      status: 'active',
      version: 'v1.2.1',
      lastDeployed: '3 days ago',
      health: 99,
      instances: 8,
      traffic: '95%',
      description: 'Live production environment serving patients'
    }
  ];

  const handleTestAction = (testId: string, action: string) => {
    switch (action) {
      case 'run':
        showSuccess('Test suite started');
        onTestRun?.({ id: testId });
        break;
      case 'stop':
        showSuccess('Test suite stopped');
        break;
      case 'view':
        showSuccess('Opening test details');
        break;
      default:
        break;
    }
  };

  const handleDeployment = (envId: string) => {
    showSuccess(`Deploying to ${envId} environment`);
    onDeploy?.(envId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <TestTube className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Testing & Deployment</span>
          <Badge variant="secondary" className="text-xs">Healthcare Grade</Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Test workflow functionality and deploy to different environments.
        </p>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-4 pb-2 flex-shrink-0">
            <TabsList className="grid w-full grid-cols-2 h-8">
              <TabsTrigger value="testing" className="text-xs px-2 h-7">
                <TestTube className="h-3 w-3 mr-1" />
                Testing
              </TabsTrigger>
              <TabsTrigger value="deployment" className="text-xs px-2 h-7">
                <Rocket className="h-3 w-3 mr-1" />
                Deployment
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full px-4">
              <div className="pb-4">
                <TabsContent value="testing" className="mt-0 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Test Suites</h4>
                    <Button size="sm">
                      <Plus className="h-3 w-3 mr-1" />
                      New Test
                    </Button>
                  </div>
                  
                  {testSuites.map((suite) => (
                    <Card key={suite.id} className="p-3">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(suite.status)}
                            <div>
                              <p className="font-medium text-sm">{suite.name}</p>
                              <p className="text-xs text-muted-foreground">{suite.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={suite.status === 'passed' ? 'default' : suite.status === 'failed' ? 'destructive' : 'secondary'} 
                                   className="text-xs">
                              {suite.status}
                            </Badge>
                            <Button size="sm" variant="outline" onClick={() => handleTestAction(suite.id, 'run')}>
                              <Play className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Coverage: {suite.coverage}%</span>
                            <span className="text-muted-foreground">Last run: {suite.lastRun}</span>
                          </div>
                          <Progress value={suite.coverage} className="h-2" />
                        </div>

                        <div className="space-y-1">
                          {suite.tests.map((test, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs p-2 bg-muted/30 rounded">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(test.status)}
                                <span>{test.name}</span>
                              </div>
                              <span className="text-muted-foreground">{test.duration}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleTestAction(suite.id, 'view')}>
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                          {suite.status === 'running' && (
                            <Button size="sm" variant="outline" onClick={() => handleTestAction(suite.id, 'stop')}>
                              Stop Tests
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="deployment" className="mt-0 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Deployment Environments</h4>
                    <Button size="sm">
                      <Plus className="h-3 w-3 mr-1" />
                      New Environment
                    </Button>
                  </div>
                  
                  {deploymentEnvironments.map((env) => (
                    <Card key={env.id} className="p-3">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              env.id === 'production' ? 'bg-green-100 dark:bg-green-900' :
                              env.id === 'staging' ? 'bg-yellow-100 dark:bg-yellow-900' :
                              'bg-blue-100 dark:bg-blue-900'
                            }`}>
                              <Rocket className={`h-4 w-4 ${
                                env.id === 'production' ? 'text-green-600 dark:text-green-400' :
                                env.id === 'staging' ? 'text-yellow-600 dark:text-yellow-400' :
                                'text-blue-600 dark:text-blue-400'
                              }`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">{env.name}</p>
                                <Badge variant="outline" className="text-xs">{env.version}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{env.description}</p>
                            </div>
                          </div>
                          <Badge variant={env.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                            {env.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Health:</span>
                              <span className="font-medium">{env.health}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Instances:</span>
                              <span className="font-medium">{env.instances}</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Traffic:</span>
                              <span className="font-medium">{env.traffic}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Last Deploy:</span>
                              <span className="font-medium">{env.lastDeployed}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Progress value={env.health} className="h-2" />
                        </div>

                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={() => handleDeployment(env.id)}>
                            <Rocket className="h-3 w-3 mr-1" />
                            Deploy
                          </Button>
                          <Button size="sm" variant="outline">
                            <Monitor className="h-3 w-3 mr-1" />
                            Monitor
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="h-3 w-3 mr-1" />
                            Configure
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </TabsContent>
              </div>
            </ScrollArea>
          </div>
        </Tabs>
      </div>
    </div>
  );
};