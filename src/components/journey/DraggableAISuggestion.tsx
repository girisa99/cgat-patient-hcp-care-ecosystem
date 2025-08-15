import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  ChevronDown, 
  ChevronUp,
  GripVertical,
  ArrowRight
} from 'lucide-react';
import { JourneyStep } from '@/components/journey/EnhancedJourneyDesigner';

interface DraggableAISuggestionProps {
  step: JourneyStep;
  index: number;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onAddStep: () => void;
  getStepTypeColor: (type: JourneyStep['type']) => string;
}

export const DraggableAISuggestion: React.FC<DraggableAISuggestionProps> = ({
  step,
  index,
  isExpanded,
  onToggleExpanded,
  onAddStep,
  getStepTypeColor
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: step.id,
    data: {
      type: 'ai-suggestion',
      step,
      index
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`border border-border/50 transition-all ${
        isDragging ? 'opacity-50 shadow-lg ring-2 ring-primary/20' : 'hover:shadow-sm'
      }`}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Step Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2 flex-1">
              {/* Drag Handle */}
              <div 
                {...attributes} 
                {...listeners}
                className="flex-shrink-0 mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
              >
                <GripVertical className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    AI Step {index + 1}
                  </span>
                  <Badge className={`text-xs ${getStepTypeColor(step.type)}`}>
                    {step.type}
                  </Badge>
                  {step.estimatedDuration && (
                    <Badge variant="outline" className="text-xs">
                      {step.estimatedDuration}m
                    </Badge>
                  )}
                </div>
                <h5 className="font-medium text-sm mb-1">{step.title}</h5>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
            
            <div className="flex gap-1 ml-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={onToggleExpanded}
                className="px-2"
              >
                {isExpanded ? 
                  <ChevronUp className="w-3 h-3" /> : 
                  <ChevronDown className="w-3 h-3" />
                }
              </Button>
              <Button
                size="sm"
                onClick={onAddStep}
                className="px-2"
                title="Add this step to your journey"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Expanded Details */}
          {isExpanded && (
            <div className="space-y-3 pt-2 border-t">
              {/* Actions */}
              {step.actions && step.actions.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-1">Actions:</p>
                  <div className="flex flex-wrap gap-1">
                    {step.actions.map(action => (
                      <Badge key={action} variant="secondary" className="text-xs">
                        {action}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Connectors */}
              {step.connectors && step.connectors.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-1">Connectors:</p>
                  <div className="flex flex-wrap gap-1">
                    {step.connectors.map(connector => (
                      <Badge key={connector} variant="outline" className="text-xs">
                        {connector}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {step.requirements && step.requirements.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-1">Requirements:</p>
                  <div className="flex flex-wrap gap-1">
                    {step.requirements.map(req => (
                      <Badge key={req} variant="secondary" className="text-xs">
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Dependencies */}
              {step.dependencies && step.dependencies.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-1">Dependencies:</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {step.dependencies.map((dep, i) => (
                      <React.Fragment key={dep}>
                        <span>{dep}</span>
                        {i < step.dependencies!.length - 1 && (
                          <ArrowRight className="w-3 h-3" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};