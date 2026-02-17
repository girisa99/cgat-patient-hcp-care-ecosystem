import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, SkipForward, AlertTriangle, CheckCircle } from 'lucide-react';
import { JourneyContext, JourneyStage } from '@/hooks/useJourneyExecution';

interface JourneyStageActionsProps {
  conversationId: string;
  journeyContext: JourneyContext | null;
  currentStage: JourneyStage | null;
  onProgressStage: (nextStageId?: string, reason?: string, data?: any) => void;
  onValidateStage?: (stage: JourneyStage) => { valid: boolean; errors: string[] };
  disabled?: boolean;
}

export const JourneyStageActions: React.FC<JourneyStageActionsProps> = ({
  conversationId,
  journeyContext,
  currentStage,
  onProgressStage,
  onValidateStage,
  disabled = false
}) => {
  const [showAdvancedDialog, setShowAdvancedDialog] = useState(false);
  const [skipReason, setSkipReason] = useState('');
  const [selectedNextStage, setSelectedNextStage] = useState<string>('');

  if (!journeyContext || !currentStage) {
    return null;
  }

  const currentIndex = journeyContext.current_stage || 0;
  const isLastStage = currentIndex >= journeyContext.stages.length - 1;
  const availableNextStages = journeyContext.stages.slice(currentIndex + 1);

  // Validate current stage if validator provided
  const validation = onValidateStage ? onValidateStage(currentStage) : { valid: true, errors: [] };

  const handleNextStage = () => {
    onProgressStage(undefined, 'natural_progression');
  };

  const handleSkipStage = () => {
    if (!skipReason.trim()) return;
    
    onProgressStage(
      selectedNextStage || undefined,
      'manual_skip',
      { skip_reason: skipReason }
    );
    
    setSkipReason('');
    setSelectedNextStage('');
    setShowAdvancedDialog(false);
  };

  const handleCompleteStage = () => {
    onProgressStage(undefined, 'stage_completed');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Stage Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Stage Info */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{currentStage.type.replace('_', ' ')}</Badge>
            <span className="font-medium text-sm">{currentStage.title}</span>
          </div>
          {currentStage.description && (
            <p className="text-xs text-muted-foreground">{currentStage.description}</p>
          )}
        </div>

        {/* Validation Errors */}
        {!validation.valid && (
          <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium text-sm">Stage Requirements Not Met</span>
            </div>
            <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Primary Actions */}
        <div className="flex flex-col gap-2">
          {/* Complete Current Stage */}
          {currentStage.type === 'completion' || currentStage.type === 'action_required' ? (
            <Button
              onClick={handleCompleteStage}
              disabled={disabled || !validation.valid}
              className="w-full"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Stage
            </Button>
          ) : (
            /* Progress to Next Stage */
            <Button
              onClick={handleNextStage}
              disabled={disabled || !validation.valid || isLastStage}
              className="w-full"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              {isLastStage ? 'Complete Journey' : 'Next Stage'}
            </Button>
          )}

          {/* Advanced Options */}
          {!isLastStage && (
            <Dialog open={showAdvancedDialog} onOpenChange={setShowAdvancedDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={disabled}>
                  <SkipForward className="w-4 h-4 mr-2" />
                  Advanced Options
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Advanced Stage Actions</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Jump to Specific Stage */}
                  {availableNextStages.length > 0 && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Jump to Stage:
                      </label>
                      <select
                        value={selectedNextStage}
                        onChange={(e) => setSelectedNextStage(e.target.value)}
                        className="w-full p-2 border rounded-md text-sm"
                      >
                        <option value="">Select next stage...</option>
                        {availableNextStages.map((stage) => (
                          <option key={stage.id} value={stage.id}>
                            {stage.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Skip Reason */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Reason for Action:
                    </label>
                    <Textarea
                      value={skipReason}
                      onChange={(e) => setSkipReason(e.target.value)}
                      placeholder="Explain why you're taking this action..."
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSkipStage}
                      disabled={!skipReason.trim()}
                      variant="destructive"
                      size="sm"
                    >
                      Apply Action
                    </Button>
                    <Button
                      onClick={() => setShowAdvancedDialog(false)}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Stage Requirements */}
        {currentStage.conditions?.required_fields && (
          <div className="pt-2 border-t">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Required Information:
            </div>
            <div className="flex flex-wrap gap-1">
              {currentStage.conditions.required_fields.map((field) => (
                <Badge key={field} variant="outline" className="text-xs">
                  {field}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JourneyStageActions;