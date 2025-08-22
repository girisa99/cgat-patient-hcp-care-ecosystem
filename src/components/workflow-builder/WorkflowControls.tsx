import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Save, Upload, Maximize2, Rocket } from 'lucide-react';

interface WorkflowControlsProps {
  onSimulate?: () => void;
  onSave?: () => void;
  onLoad?: () => void;
  onFitView?: () => void;
  onDeploy?: () => void;
  className?: string;
}

export const WorkflowControls: React.FC<WorkflowControlsProps> = ({
  onSimulate,
  onSave,
  onLoad,
  onFitView,
  onDeploy,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button variant="outline" size="sm" className="h-8" onClick={onSimulate}>
        <Play className="h-4 w-4 mr-2" />
        Simulate
      </Button>
      <Button variant="outline" size="sm" className="h-8" onClick={onSave}>
        <Save className="h-4 w-4 mr-2" />
        Save
      </Button>
      <Button variant="outline" size="sm" className="h-8" onClick={onLoad}>
        <Upload className="h-4 w-4 mr-2" />
        Load
      </Button>
      <Button variant="outline" size="sm" className="h-8" onClick={onFitView}>
        <Maximize2 className="h-4 w-4 mr-2" />
        Fit View
      </Button>
      <Button variant="default" size="sm" className="h-8" onClick={onDeploy}>
        <Rocket className="h-4 w-4 mr-2" />
        Deploy
      </Button>
    </div>
  );
};
