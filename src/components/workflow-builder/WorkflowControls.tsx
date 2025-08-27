import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Save, Upload, Maximize2, Rocket } from 'lucide-react';
import { WorkflowTestingPanel } from './WorkflowTestingPanel';

interface WorkflowControlsProps {
  onSimulate?: () => void;
  onSave?: () => void;
  onLoad?: () => void;
  onFitView?: () => void;
  onDeploy?: () => void;
  nodes?: any[];
  edges?: any[];
  onNodesChange?: (nodes: any[]) => void;
  onEdgesChange?: (edges: any[]) => void;
  className?: string;
}

export const WorkflowControls: React.FC<WorkflowControlsProps> = ({
  onSimulate,
  onSave,
  onLoad,
  onFitView,
  onDeploy,
  nodes = [],
  edges = [],
  onNodesChange,
  onEdgesChange,
  className = ''
}) => {
  return (
      <div className={`flex items-center gap-2 overflow-x-auto whitespace-nowrap ${className}`}>
        <Button variant="outline" size="sm" className="h-8 shrink-0" onClick={onSimulate}>
          <Play className="h-4 w-4 mr-2" />
          Simulate
        </Button>
        <Button variant="outline" size="sm" className="h-8 shrink-0" onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button variant="outline" size="sm" className="h-8 shrink-0" onClick={onLoad}>
          <Upload className="h-4 w-4 mr-2" />
          Load
        </Button>
        <Button variant="outline" size="sm" className="h-8 shrink-0" onClick={onFitView}>
          <Maximize2 className="h-4 w-4 mr-2" />
          Fit View
        </Button>
        <WorkflowTestingPanel
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
        />
        <Button variant="default" size="sm" className="h-8 shrink-0" onClick={onDeploy}>
          <Rocket className="h-4 w-4 mr-2" />
          Deploy
        </Button>
      </div>
  );
};
