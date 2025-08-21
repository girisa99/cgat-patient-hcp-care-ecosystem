import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  ChevronDown, ChevronRight, Play, Settings, Bot, Database, 
  Shield, Plug, TestTube, Rocket, CheckCircle, ArrowRight,
  Lightbulb, Target, Workflow
} from 'lucide-react';

interface SequentialFlowGuideProps {
  currentStep?: number;
  onStepSelect?: (step: number) => void;
}

export const SequentialFlowGuide: React.FC<SequentialFlowGuideProps> = ({
  currentStep = 0,
  onStepSelect = () => {}
}) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(currentStep);

  const workflowSteps = [
    {
      id: 1,
      phase: "Planning & Setup",
      title: "Configure Workflow Assets",
      description: "Set up your foundation resources and tools",
      icon: Settings,
      color: "bg-blue-100 text-blue-700",
      substeps: [
        {
          title: "Define AI Agents",
          description: "Configure agent roles, personalities, and capabilities",
          location: "Left Panel → Agents Tab",
          action: "Create and configure agents for different workflow tasks"
        },
        {
          title: "Select AI Models", 
          description: "Choose appropriate models for different intelligence needs",
          location: "Left Panel → AI Models Tab",
          action: "Configure LLMs, vision models, and specialized AI services"
        },
        {
          title: "Set Access Control",
          description: "Configure security, permissions, and compliance settings",
          location: "Left Panel → Access Tab",
          action: "Define roles, permissions, and security policies"
        }
      ]
    },
    {
      id: 2,
      phase: "Workflow Design",
      title: "Build Workflow Logic",
      description: "Create the actual workflow using nodes and connections",
      icon: Workflow,
      color: "bg-purple-100 text-purple-700",
      substeps: [
        {
          title: "Start Configuration",
          description: "Set entry points and initial conditions",
          location: "Node Palette → Configuration (Start Here)",
          action: "Add Start nodes, triggers, and initial setup nodes"
        },
        {
          title: "Add Intelligence",
          description: "Connect AI agents and models to workflow",
          location: "Node Palette → AI & Intelligence", 
          action: "Add AI Agent nodes, LLM nodes, and conditional agents"
        },
        {
          title: "Build Logic Flow",
          description: "Create decision paths and business logic",
          location: "Node Palette → Workflow Nodes",
          action: "Add conditions, loops, human inputs, and flow control"
        }
      ]
    },
    {
      id: 3,
      phase: "Integration",
      title: "Connect External Systems",
      description: "Integrate with databases, APIs, and external services",
      icon: Plug,
      color: "bg-green-100 text-green-700",
      substeps: [
        {
          title: "Data Connections",
          description: "Connect to databases and data sources",
          location: "Node Palette → Integrations & Data",
          action: "Add database nodes, API connectors, and data transformers"
        },
        {
          title: "Communication Channels",
          description: "Set up messaging, notifications, and communications",
          location: "Node Palette → Integrations & Data",
          action: "Configure email, SMS, chat, and notification systems"
        }
      ]
    },
    {
      id: 4,
      phase: "Testing & Deployment",
      title: "Test and Deploy Workflow",
      description: "Validate functionality and deploy to production",
      icon: Rocket,
      color: "bg-orange-100 text-orange-700",
      substeps: [
        {
          title: "Testing & Validation",
          description: "Test workflow paths and validate functionality",
          location: "Node Palette → Deployment & Testing",
          action: "Add test nodes, validation checkpoints, and monitoring"
        },
        {
          title: "Production Deployment",
          description: "Deploy workflow to live environment",
          location: "Node Palette → Deployment & Testing",
          action: "Configure deployment settings and go-live"
        }
      ]
    }
  ];

  return (
    <Card className="w-80 h-full">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-sm flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Sequential Workflow Guide
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Follow this step-by-step process from planning to deployment
        </p>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="p-4 space-y-3">
            {workflowSteps.map((step, index) => (
              <Collapsible
                key={step.id}
                open={expandedStep === step.id}
                onOpenChange={(open) => setExpandedStep(open ? step.id : null)}
              >
                <CollapsibleTrigger asChild>
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      currentStep === step.id ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${step.color}`}>
                          <step.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <Badge variant="outline" className="text-xs mb-1">
                                {step.phase}
                              </Badge>
                              <h3 className="font-medium text-sm">{step.title}</h3>
                              <p className="text-xs text-muted-foreground">{step.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {currentStep > step.id && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                              {expandedStep === step.id ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="ml-4 pl-4 border-l-2 border-muted space-y-2 mt-2">
                    {step.substeps.map((substep, subIndex) => (
                      <Card key={subIndex} className="bg-muted/30">
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-xs">{substep.title}</h4>
                              <p className="text-xs text-muted-foreground mb-2">{substep.description}</p>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="text-xs">
                                  <Target className="h-2 w-2 mr-1" />
                                  {substep.location}
                                </Badge>
                              </div>
                              <p className="text-xs bg-primary/5 p-2 rounded border-l-2 border-primary/20">
                                <Lightbulb className="h-3 w-3 inline mr-1" />
                                {substep.action}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    <div className="flex justify-center pt-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-xs"
                        onClick={() => onStepSelect(step.id)}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Start This Phase
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
            
            <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                Key Relationships
              </h4>
              <div className="text-xs text-muted-foreground space-y-2">
                <div className="flex items-center gap-2 p-2 bg-background/50 rounded">
                  <ArrowRight className="h-3 w-3" />
                  <span><strong>Workflow Assets</strong> (Left Panel) = Your toolkit and resources</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-background/50 rounded">
                  <ArrowRight className="h-3 w-3" />
                  <span><strong>Node Palette</strong> (Right Panel) = Building blocks for workflows</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-background/50 rounded">
                  <ArrowRight className="h-3 w-3" />
                  <span><strong>Canvas</strong> (Center) = Where you build and connect everything</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};