import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Settings, 
  TestTube, 
  Rocket, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProcessStep {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  duration?: string;
}

interface AnimatedProcessFlowProps {
  agentId?: string;
  onStepComplete?: (step: string) => void;
}

export const AnimatedProcessFlow: React.FC<AnimatedProcessFlowProps> = ({
  agentId,
  onStepComplete
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  
  const [steps, setSteps] = useState<ProcessStep[]>([
    {
      id: 'build',
      name: 'Build Agent',
      icon: Settings,
      status: 'pending',
      progress: 0
    },
    {
      id: 'generate',
      name: 'Generate Workflow',
      icon: Zap,
      status: 'pending',
      progress: 0
    },
    {
      id: 'test',
      name: 'Test & Validate',
      icon: TestTube,
      status: 'pending',
      progress: 0
    },
    {
      id: 'deploy',
      name: 'Deploy to Production',
      icon: Rocket,
      status: 'pending',
      progress: 0
    }
  ]);

  const startProcess = () => {
    setIsRunning(true);
    setCurrentStep(0);
    executeStep(0);
  };

  const executeStep = async (stepIndex: number) => {
    if (stepIndex >= steps.length) {
      setIsRunning(false);
      return;
    }

    // Start step
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex 
        ? { ...step, status: 'running', progress: 0 }
        : step
    ));

    // Simulate progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setSteps(prev => prev.map((step, index) => 
        index === stepIndex 
          ? { ...step, progress }
          : step
      ));
    }

    // Complete step
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex 
        ? { ...step, status: 'completed', progress: 100, duration: `${(stepIndex + 1) * 2}s` }
        : step
    ));

    onStepComplete?.(steps[stepIndex].id);

    // Move to next step
    setTimeout(() => {
      setCurrentStep(stepIndex + 1);
      executeStep(stepIndex + 1);
    }, 500);
  };

  const getStepVariants = (index: number) => ({
    pending: { 
      scale: 1, 
      opacity: 0.6,
      x: 0
    },
    running: { 
      scale: 1.1, 
      opacity: 1,
      x: 0,
      transition: { 
        scale: { duration: 0.3 },
        opacity: { duration: 0.3 }
      }
    },
    completed: { 
      scale: 1, 
      opacity: 1,
      x: 0,
      transition: { 
        scale: { duration: 0.3 },
        opacity: { duration: 0.3 }
      }
    }
  });

  const getStatusIcon = (step: ProcessStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <step.icon className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (step: ProcessStep) => {
    switch (step.status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'running':
        return 'bg-blue-500';
      default:
        return 'bg-muted';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Agent Development Pipeline
          </CardTitle>
          <Button 
            onClick={startProcess} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? 'Running...' : 'Start Process'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Overall Progress</span>
            <span>{Math.round((steps.filter(s => s.status === 'completed').length / steps.length) * 100)}%</span>
          </div>
          <Progress 
            value={(steps.filter(s => s.status === 'completed').length / steps.length) * 100}
            className="h-2"
          />
        </div>

        {/* Process Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              variants={getStepVariants(index)}
              animate={step.status}
              className="relative"
            >
              <div className="flex items-center gap-4 p-4 rounded-lg border bg-card/50">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-full ${getStatusColor(step)}/10`}>
                    {getStatusIcon(step)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{step.name}</h4>
                      <Badge variant={step.status === 'completed' ? 'default' : step.status === 'running' ? 'default' : 'secondary'}>
                        {step.status}
                      </Badge>
                    </div>
                    {step.status === 'running' && (
                      <div className="mt-2 space-y-1">
                        <Progress value={step.progress} className="h-1" />
                        <p className="text-xs text-muted-foreground">
                          Processing... {step.progress}%
                        </p>
                      </div>
                    )}
                    {step.status === 'completed' && step.duration && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Completed in {step.duration}
                      </p>
                    )}
                  </div>
                </div>

                {/* Step connector line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-[18px] top-[60px] w-[2px] h-[20px] bg-border"></div>
                )}
              </div>

              {/* Animated pulse for running step */}
              <AnimatePresence>
                {step.status === 'running' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 rounded-lg border-2 border-primary/30"
                  >
                    <motion.div
                      animate={{ 
                        opacity: [0.3, 0.7, 0.3],
                        scale: [1, 1.02, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 rounded-lg bg-primary/5"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Real-time Metrics */}
        {isRunning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-muted/50 space-y-2"
          >
            <h4 className="font-medium text-sm">Real-time Metrics</h4>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">CPU Usage</span>
                <div className="font-mono text-primary">
                  {Math.floor(Math.random() * 30 + 20)}%
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Memory</span>
                <div className="font-mono text-primary">
                  {Math.floor(Math.random() * 200 + 300)}MB
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Network</span>
                <div className="font-mono text-primary">
                  {Math.floor(Math.random() * 50 + 10)}ms
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};