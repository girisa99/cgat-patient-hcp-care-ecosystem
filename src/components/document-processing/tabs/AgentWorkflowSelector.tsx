/**
 * Agent Workflow Selector Component
 * Card for selecting AI agent workflows based on document type
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DocumentTypeConfig } from '@/config/documentTypes';

type AgentWorkflowType = 'none' | 'insurance-verification' | 'prescription-processing' | 'patient-intake' | 'imaging-analysis';

interface AgentWorkflowConfig {
  id: AgentWorkflowType;
  title: string;
  description: string;
  icon: React.ReactNode;
  documentTypes: string[];
  capabilities: string[];
}

interface AgentWorkflowSelectorProps {
  currentConfig: DocumentTypeConfig;
  recommendedWorkflows: AgentWorkflowConfig[];
  selectedWorkflow: AgentWorkflowType;
  setSelectedWorkflow: (workflow: AgentWorkflowType) => void;
}

export function AgentWorkflowSelector({
  currentConfig,
  recommendedWorkflows,
  selectedWorkflow,
  setSelectedWorkflow
}: AgentWorkflowSelectorProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Select Agent Workflow
        </CardTitle>
        <CardDescription>Choose an AI agent to process your {currentConfig.title} document</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recommendedWorkflows.length > 0 ? (
            recommendedWorkflows.map((workflow) => (
              <div
                key={workflow.id}
                onClick={() => setSelectedWorkflow(workflow.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedWorkflow === workflow.id 
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                    : 'hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${selectedWorkflow === workflow.id ? 'bg-primary/20' : 'bg-muted'}`}>
                    {workflow.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{workflow.title}</h4>
                    <p className="text-xs text-muted-foreground">{workflow.description}</p>
                  </div>
                  {selectedWorkflow === workflow.id && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {workflow.capabilities.slice(0, 2).map((cap, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px]">{cap}</Badge>
                  ))}
                  {workflow.capabilities.length > 2 && (
                    <Badge variant="outline" className="text-[10px]">+{workflow.capabilities.length - 2}</Badge>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-6 text-muted-foreground">
              <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No agent workflows available for {currentConfig.title}</p>
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => navigate('/agents/canvas')}
                className="mt-2"
              >
                Create custom agent workflow →
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default AgentWorkflowSelector;
