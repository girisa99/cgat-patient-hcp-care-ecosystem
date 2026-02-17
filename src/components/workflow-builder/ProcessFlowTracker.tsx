import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Play, ChevronDown, ChevronRight, CheckCircle, 
  AlertCircle, Clock, Bot, Zap, Settings, Minimize2
} from 'lucide-react';

interface ProcessStep {
  id: string;
  name: string;
  type: 'start' | 'agent' | 'action' | 'decision' | 'end';
  status: 'pending' | 'running' | 'completed' | 'error';
  model?: string;
  duration?: string;
  details?: string;
}

interface ProcessFlowTrackerProps {
  isOpen: boolean;
  onToggle: () => void;
  steps: ProcessStep[];
  onStepClick?: (step: ProcessStep) => void;
}

export const ProcessFlowTracker: React.FC<ProcessFlowTrackerProps> = ({
  isOpen,
  onToggle,
  steps = [],
  onStepClick
}) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const getStatusIcon = (status: ProcessStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />;
    }
  };

  const getTypeIcon = (type: ProcessStep['type']) => {
    switch (type) {
      case 'agent':
        return <Bot className="h-3 w-3" />;
      case 'action':
        return <Zap className="h-3 w-3" />;
      case 'decision':
        return <Settings className="h-3 w-3" />;
      default:
        return <Play className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: ProcessStep['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'running':
        return 'border-blue-200 bg-blue-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-muted bg-muted/30';
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Button onClick={onToggle} className="rounded-full h-12 w-12 shadow-lg">
          <Play className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-80">
      <Card className="shadow-xl border-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Play className="h-4 w-4 text-green-500" />
              Process Flow
            </CardTitle>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs">
                {steps.filter(s => s.status === 'completed').length}/{steps.length}
              </Badge>
              <Button size="sm" variant="ghost" onClick={onToggle}>
                <Minimize2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {steps.map((step, index) => {
                const isExpanded = expandedSteps.has(step.id);
                const isLast = index === steps.length - 1;
                
                return (
                  <div key={step.id} className="relative">
                    <Collapsible 
                      open={isExpanded} 
                      onOpenChange={() => toggleStep(step.id)}
                    >
                      <div 
                        className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-sm ${getStatusColor(step.status)}`}
                        onClick={() => onStepClick?.(step)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(step.status)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  {getTypeIcon(step.type)}
                                  <span className="text-xs font-medium truncate">
                                    {step.name}
                                  </span>
                                </div>
                                {step.model && (
                                  <Badge variant="secondary" className="text-[10px] px-1">
                                    {step.model}
                                  </Badge>
                                )}
                              </div>
                              {step.duration && (
                                <div className="text-[10px] text-muted-foreground">
                                  {step.duration}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <CollapsibleTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              {isExpanded ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ChevronRight className="h-3 w-3" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                        
                        <CollapsibleContent className="mt-2">
                          <div className="pl-7 space-y-1">
                            {step.details && (
                              <div className="text-xs text-muted-foreground">
                                {step.details}
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px]">
                                {step.type}
                              </Badge>
                              <Badge 
                                variant={step.status === 'completed' ? 'default' : 'secondary'} 
                                className="text-[10px]"
                              >
                                {step.status}
                              </Badge>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                    
                    {/* Connection Line */}
                    {!isLast && (
                      <div className="absolute left-5 top-full w-0.5 h-2 bg-border" />
                    )}
                  </div>
                );
              })}
              
              {steps.length === 0 && (
                <div className="text-center py-6 text-muted-foreground text-xs">
                  No workflow steps to track
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};