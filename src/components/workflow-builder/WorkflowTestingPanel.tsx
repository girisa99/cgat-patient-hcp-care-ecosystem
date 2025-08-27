import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { TestTube, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { WorkflowTesting } from './WorkflowTesting';

interface WorkflowTestingPanelProps {
  nodes: any[];
  edges: any[];
  onNodesChange?: (nodes: any[]) => void;
  onEdgesChange?: (edges: any[]) => void;
}

export const WorkflowTestingPanel: React.FC<WorkflowTestingPanelProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Quick validation for the trigger button
  const getQuickStatus = () => {
    if (nodes.length === 0) {
      return { status: 'error', count: 1, label: 'Empty' };
    }

    const connectedNodes = new Set();
    edges.forEach((edge: any) => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });

    const isolatedNodes = nodes.filter((node: any) => !connectedNodes.has(node.id));
    const hasStartNode = nodes.some((node: any) => node.type === 'start' || node.data?.isStart);
    const hasEndNode = nodes.some((node: any) => node.type === 'end' || node.data?.isEnd);

    let issues = 0;
    let warnings = 0;

    if (!hasStartNode || !hasEndNode) issues++;
    if (isolatedNodes.length > 0) warnings++;

    if (issues > 0) {
      return { status: 'error', count: issues, label: 'Issues' };
    } else if (warnings > 0) {
      return { status: 'warning', count: warnings, label: 'Warnings' };
    } else {
      return { status: 'success', count: 0, label: 'Ready' };
    }
  };

  const quickStatus = getQuickStatus();

  const getStatusIcon = () => {
    switch (quickStatus.status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <TestTube className="h-4 w-4" />;
    }
  };

  const getStatusVariant = () => {
    switch (quickStatus.status) {
      case 'success':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <TestTube className="h-4 w-4" />
          Test Workflow
          {quickStatus.count > 0 && (
            <Badge variant={getStatusVariant()} className="ml-1 px-1 min-w-[20px] h-5">
              {quickStatus.count}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-[800px] p-0">
        <SheetHeader className="p-6 pb-0">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <SheetTitle>Workflow Testing & Validation</SheetTitle>
          </div>
          <SheetDescription>
            Analyze your workflow for issues, get recommendations, and apply fixes automatically.
            Current status: <span className="font-medium">{quickStatus.label}</span>
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 overflow-hidden">
          <WorkflowTesting
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};