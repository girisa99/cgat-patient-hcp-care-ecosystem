import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react';
import { JourneyContext, JourneyStage } from '@/hooks/useJourneyExecution';

interface JourneyProgressIndicatorProps {
  journeyContext: JourneyContext | null;
  className?: string;
  compact?: boolean;
}

const getStageIcon = (stage: JourneyStage, index: number, currentIndex: number) => {
  if (index < currentIndex) {
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  } else if (index === currentIndex) {
    return <Clock className="w-4 h-4 text-blue-500" />;
  } else {
    return <Circle className="w-4 h-4 text-muted-foreground" />;
  }
};

const getStageTypeColor = (type: JourneyStage['type']) => {
  switch (type) {
    case 'information_gathering':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'decision_point':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
    case 'action_required':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'completion':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export const JourneyProgressIndicator: React.FC<JourneyProgressIndicatorProps> = ({
  journeyContext,
  className = '',
  compact = false
}) => {
  if (!journeyContext || !journeyContext.stages || journeyContext.stages.length === 0) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">No journey stages configured</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentIndex = journeyContext.current_stage || 0;
  const totalStages = journeyContext.stages.length;
  const progressPercentage = Math.round((currentIndex / totalStages) * 100);
  const currentStage = journeyContext.stages[currentIndex];

  if (compact) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Journey Progress</span>
              <Badge variant="outline" className="text-xs">
                {currentIndex + 1} of {totalStages}
              </Badge>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="text-xs text-muted-foreground">
              Current: {currentStage?.title || 'Unknown'}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Journey Progress</CardTitle>
          <Badge variant="outline">
            Stage {currentIndex + 1} of {totalStages}
          </Badge>
        </div>
        <Progress value={progressPercentage} className="mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {journeyContext.stages.map((stage, index) => {
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;
            
            return (
              <div
                key={stage.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                  isActive 
                    ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950' 
                    : isCompleted
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                    : 'border-muted bg-muted/20'
                }`}
              >
                <div className="mt-0.5">
                  {getStageIcon(stage, index, currentIndex)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium text-sm ${
                      isActive ? 'text-blue-900 dark:text-blue-100' : ''
                    }`}>
                      {stage.title}
                    </h4>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getStageTypeColor(stage.type)}`}
                    >
                      {stage.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  {stage.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {stage.description}
                    </p>
                  )}
                  {isActive && stage.conditions?.required_fields && (
                    <div className="mt-2">
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Required Information:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {stage.conditions.required_fields.map((field) => (
                          <Badge key={field} variant="outline" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {currentIndex >= totalStages && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Journey Completed!</span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              All journey stages have been successfully completed.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JourneyProgressIndicator;