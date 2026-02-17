import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Rocket, 
  GitBranch, 
  Shield, 
  Globe, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Server,
  Database,
  Zap,
  Settings,
  Eye,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeploymentStage {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  duration?: string;
  description: string;
}

interface Environment {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'inactive' | 'deploying';
  version: string;
  lastDeploy: string;
}

interface ProductionDeploymentPipelineProps {
  agentId?: string;
  onDeploymentComplete?: (environment: string) => void;
}

export const ProductionDeploymentPipeline: React.FC<ProductionDeploymentPipelineProps> = ({
  agentId,
  onDeploymentComplete
}) => {
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [isDeploying, setIsDeploying] = useState(false);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('staging');

  const [stages, setStages] = useState<DeploymentStage[]>([
    {
      id: 'security-scan',
      name: 'Security Scan',
      status: 'pending',
      progress: 0,
      description: 'Scanning for vulnerabilities and security issues'
    },
    {
      id: 'build',
      name: 'Build & Package',
      status: 'pending',
      progress: 0,
      description: 'Building application and creating deployment package'
    },
    {
      id: 'test',
      name: 'Integration Tests',
      status: 'pending',
      progress: 0,
      description: 'Running comprehensive test suite'
    },
    {
      id: 'deploy',
      name: 'Deploy to Environment',
      status: 'pending',
      progress: 0,
      description: 'Deploying to target environment with zero downtime'
    },
    {
      id: 'health-check',
      name: 'Health Check',
      status: 'pending',
      progress: 0,
      description: 'Verifying deployment health and performance'
    },
    {
      id: 'monitor',
      name: 'Monitoring Setup',
      status: 'pending',
      progress: 0,
      description: 'Configuring monitoring and alerting'
    }
  ]);

  const [environments, setEnvironments] = useState<Environment[]>([
    {
      id: 'staging',
      name: 'Staging',
      url: 'https://staging.example.com',
      status: 'active',
      version: 'v1.2.3',
      lastDeploy: '2 hours ago'
    },
    {
      id: 'production',
      name: 'Production',
      url: 'https://app.example.com',
      status: 'active',
      version: 'v1.2.2',
      lastDeploy: '1 day ago'
    },
    {
      id: 'canary',
      name: 'Canary',
      url: 'https://canary.example.com',
      status: 'inactive',
      version: 'v1.2.3-rc1',
      lastDeploy: '3 days ago'
    }
  ]);

  const [deploymentConfig, setDeploymentConfig] = useState({
    autoRollback: true,
    healthCheckTimeout: 300,
    rolloutStrategy: 'blue-green',
    trafficSplit: 10
  });

  const startDeployment = async () => {
    setIsDeploying(true);
    setCurrentStage(0);
    
    // Reset all stages
    setStages(prev => prev.map(stage => ({
      ...stage,
      status: 'pending',
      progress: 0,
      duration: undefined
    })));

    // Update environment status
    setEnvironments(prev => prev.map(env => 
      env.id === selectedEnvironment 
        ? { ...env, status: 'deploying' }
        : env
    ));

    // Execute stages
    await executeStages();
  };

  const executeStages = async () => {
    for (let i = 0; i < stages.length; i++) {
      setCurrentStage(i);
      
      // Start stage
      setStages(prev => prev.map((stage, index) => 
        index === i 
          ? { ...stage, status: 'running', progress: 0 }
          : stage
      ));

      // Simulate stage execution with varying speeds
      const stageTime = 100 + Math.random() * 100; // 100-200ms per increment
      for (let progress = 0; progress <= 100; progress += 5) {
        await new Promise(resolve => setTimeout(resolve, stageTime));
        setStages(prev => prev.map((stage, index) => 
          index === i 
            ? { ...stage, progress }
            : stage
        ));
      }

      // Complete stage
      const duration = `${(2 + Math.random() * 3).toFixed(1)}s`;
      setStages(prev => prev.map((stage, index) => 
        index === i 
          ? { ...stage, status: 'completed', progress: 100, duration }
          : stage
      ));

      // Small delay between stages
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Complete deployment
    setIsDeploying(false);
    setEnvironments(prev => prev.map(env => 
      env.id === selectedEnvironment 
        ? { 
            ...env, 
            status: 'active',
            version: 'v1.2.4',
            lastDeploy: 'Just now'
          }
        : env
    ));

    onDeploymentComplete?.(selectedEnvironment);
  };

  const getStageIcon = (stage: DeploymentStage) => {
    switch (stage.id) {
      case 'security-scan':
        return <Shield className="h-4 w-4" />;
      case 'build':
        return <Settings className="h-4 w-4" />;
      case 'test':
        return <CheckCircle className="h-4 w-4" />;
      case 'deploy':
        return <Rocket className="h-4 w-4" />;
      case 'health-check':
        return <Eye className="h-4 w-4" />;
      case 'monitor':
        return <Database className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getEnvironmentIcon = (env: Environment) => {
    switch (env.status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'deploying':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Rocket className="h-6 w-6" />
          Production Deployment Pipeline
        </h2>
        <Badge variant="outline" className="flex items-center gap-1">
          <GitBranch className="h-3 w-3" />
          main
        </Badge>
      </div>

      <Tabs defaultValue="deploy" className="space-y-4">
        <TabsList>
          <TabsTrigger value="deploy">Deploy</TabsTrigger>
          <TabsTrigger value="environments">Environments</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="deploy" className="space-y-6">
          {/* Environment Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Target Environment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {environments.map((env) => (
                  <div
                    key={env.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedEnvironment === env.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedEnvironment(env.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{env.name}</span>
                      {getEnvironmentIcon(env)}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Version: {env.version}</div>
                      <div>Last Deploy: {env.lastDeploy}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Deployment Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Deployment Controls</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Button 
                onClick={startDeployment} 
                disabled={isDeploying}
                className="flex items-center gap-2"
              >
                {isDeploying ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Start Deployment
                  </>
                )}
              </Button>
              <Button variant="outline" disabled={isDeploying}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Rollback
              </Button>
            </CardContent>
          </Card>

          {/* Pipeline Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Overall Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{Math.round((stages.filter(s => s.status === 'completed').length / stages.length) * 100)}%</span>
                </div>
                <Progress 
                  value={(stages.filter(s => s.status === 'completed').length / stages.length) * 100}
                  className="h-2"
                />
              </div>

              {/* Stages */}
              <div className="space-y-3">
                {stages.map((stage, index) => (
                  <motion.div
                    key={stage.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border ${
                      stage.status === 'running' ? 'border-primary bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        stage.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                        stage.status === 'running' ? 'bg-blue-500/10 text-blue-500' :
                        stage.status === 'failed' ? 'bg-red-500/10 text-red-500' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {getStageIcon(stage)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{stage.name}</span>
                          <Badge variant={
                            stage.status === 'completed' ? 'default' :
                            stage.status === 'running' ? 'default' :
                            'secondary'
                          }>
                            {stage.status}
                          </Badge>
                          {stage.duration && (
                            <span className="text-xs text-muted-foreground">
                              {stage.duration}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {stage.description}
                        </p>
                        {stage.status === 'running' && (
                          <Progress value={stage.progress} className="h-1" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {environments.map((env) => (
              <Card key={env.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{env.name}</CardTitle>
                    {getEnvironmentIcon(env)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">URL:</span>
                      <a href={env.url} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                        <Globe className="h-3 w-3 inline mr-1" />
                        {env.url.replace('https://', '')}
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version:</span>
                      <span className="font-mono">{env.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Deploy:</span>
                      <span>{env.lastDeploy}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rollout-strategy">Rollout Strategy</Label>
                    <select 
                      id="rollout-strategy"
                      className="w-full p-2 border rounded-md"
                      value={deploymentConfig.rolloutStrategy}
                      onChange={(e) => setDeploymentConfig(prev => ({
                        ...prev,
                        rolloutStrategy: e.target.value
                      }))}
                    >
                      <option value="blue-green">Blue-Green</option>
                      <option value="canary">Canary</option>
                      <option value="rolling">Rolling</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="traffic-split">Traffic Split (%)</Label>
                    <Input
                      id="traffic-split"
                      type="number"
                      min="0"
                      max="100"
                      value={deploymentConfig.trafficSplit}
                      onChange={(e) => setDeploymentConfig(prev => ({
                        ...prev,
                        trafficSplit: parseInt(e.target.value) || 0
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="health-timeout">Health Check Timeout (seconds)</Label>
                    <Input
                      id="health-timeout"
                      type="number"
                      min="30"
                      max="600"
                      value={deploymentConfig.healthCheckTimeout}
                      onChange={(e) => setDeploymentConfig(prev => ({
                        ...prev,
                        healthCheckTimeout: parseInt(e.target.value) || 300
                      }))}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="auto-rollback"
                      checked={deploymentConfig.autoRollback}
                      onChange={(e) => setDeploymentConfig(prev => ({
                        ...prev,
                        autoRollback: e.target.checked
                      }))}
                      className="rounded"
                    />
                    <Label htmlFor="auto-rollback">Enable Auto-Rollback</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deployment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { version: 'v1.2.3', environment: 'Staging', status: 'Success', time: '2 hours ago', duration: '3m 45s' },
                  { version: 'v1.2.2', environment: 'Production', status: 'Success', time: '1 day ago', duration: '5m 12s' },
                  { version: 'v1.2.1', environment: 'Canary', status: 'Rolled Back', time: '2 days ago', duration: '8m 33s' },
                  { version: 'v1.2.0', environment: 'Production', status: 'Success', time: '3 days ago', duration: '4m 56s' }
                ].map((deployment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">
                        {deployment.version}
                      </Badge>
                      <span className="font-medium">{deployment.environment}</span>
                      <Badge variant={deployment.status === 'Success' ? 'default' : 'destructive'}>
                        {deployment.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Duration: {deployment.duration}</span>
                      <span>{deployment.time}</span>
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