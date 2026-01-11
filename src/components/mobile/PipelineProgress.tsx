/**
 * Pipeline Progress Indicator
 * Shows current stage in the Record → Clips → Mix → Timeline → Publish workflow
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Video, 
  Scissors, 
  Music, 
  Layers, 
  Upload,
  Check
} from 'lucide-react';

export type PipelineStage = 'record' | 'clips' | 'mix' | 'timeline' | 'publish';

interface PipelineProgressProps {
  currentStage: PipelineStage;
  completedStages?: PipelineStage[];
  onStageClick?: (stage: PipelineStage) => void;
  className?: string;
}

const STAGES: { id: PipelineStage; label: string; icon: React.ElementType }[] = [
  { id: 'record', label: 'Record', icon: Video },
  { id: 'clips', label: 'Clips', icon: Scissors },
  { id: 'mix', label: 'Mix', icon: Music },
  { id: 'timeline', label: 'Timeline', icon: Layers },
  { id: 'publish', label: 'Publish', icon: Upload },
];

export const PipelineProgress: React.FC<PipelineProgressProps> = ({
  currentStage,
  completedStages = [],
  onStageClick,
  className
}) => {
  const currentIndex = STAGES.findIndex(s => s.id === currentStage);

  return (
    <div className={cn("flex items-center justify-between px-4 py-2 bg-muted/30 border-b", className)}>
      {STAGES.map((stage, index) => {
        const Icon = stage.icon;
        const isActive = stage.id === currentStage;
        const isCompleted = completedStages.includes(stage.id);
        const isPast = index < currentIndex;
        
        return (
          <React.Fragment key={stage.id}>
            <button
              onClick={() => onStageClick?.(stage.id)}
              className={cn(
                "flex flex-col items-center gap-0.5 transition-all",
                isActive && "text-primary",
                !isActive && !isCompleted && !isPast && "text-muted-foreground/50",
                (isCompleted || isPast) && !isActive && "text-muted-foreground",
                onStageClick && "cursor-pointer hover:text-primary"
              )}
            >
              <div className={cn(
                "relative w-7 h-7 rounded-full flex items-center justify-center transition-all",
                isActive && "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background",
                isCompleted && !isActive && "bg-green-500/20 text-green-600",
                isPast && !isCompleted && !isActive && "bg-muted text-muted-foreground",
                !isActive && !isCompleted && !isPast && "bg-muted/50"
              )}>
                {isCompleted && !isActive ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
              </div>
              <span className={cn(
                "text-[9px] font-medium",
                isActive && "text-primary",
                !isActive && "text-muted-foreground"
              )}>
                {stage.label}
              </span>
            </button>
            
            {/* Connector line */}
            {index < STAGES.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-1",
                index < currentIndex ? "bg-primary/50" : "bg-muted"
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default PipelineProgress;
