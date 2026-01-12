/**
 * Guided Editing Wizard
 * Step-by-step wizard for beginners
 * Works on both mobile and desktop
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft,
  ChevronRight,
  Check,
  Upload,
  Music,
  Wand2,
  ArrowRightLeft,
  Play,
  Download,
  Sparkles,
  MessageCircle,
  Mic,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TimelineClip } from './MultiClipTimeline';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  aiHint: string;
  requirement?: string;
  isComplete: boolean;
}

interface GuidedEditingWizardProps {
  clips: TimelineClip[];
  hasMusic: boolean;
  hasArrangement: boolean;
  hasTransitions: boolean;
  onStepAction: (stepId: string) => void;
  onAskAI: (question: string) => void;
  onComplete: () => void;
  className?: string;
}

export const GuidedEditingWizard: React.FC<GuidedEditingWizardProps> = ({
  clips,
  hasMusic,
  hasArrangement,
  hasTransitions,
  onStepAction,
  onAskAI,
  onComplete,
  className,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');

  const videoClips = clips.filter(c => c.type === 'video');

  const steps: WizardStep[] = [
    {
      id: 'import',
      title: 'Import Clips',
      description: 'Add at least 2 video clips to get started',
      icon: <Upload className="h-5 w-5" />,
      aiHint: "I can help you organize clips by duration, capture time, or content type. What style are you going for?",
      requirement: 'Min 2 clips',
      isComplete: videoClips.length >= 2,
    },
    {
      id: 'music',
      title: 'Add Music',
      description: 'Upload a music track for beat synchronization',
      icon: <Music className="h-5 w-5" />,
      aiHint: "Upload your track and I'll detect the BPM. Fast songs (120+ BPM) work great for energetic edits!",
      requirement: 'Audio track',
      isComplete: hasMusic,
    },
    {
      id: 'arrange',
      title: 'AI Arrange',
      description: 'Let AI arrange your clips based on style',
      icon: <Wand2 className="h-5 w-5" />,
      aiHint: "Story Mode builds tension, Fast Cuts are great for social media, Relaxed is perfect for vlogs.",
      isComplete: hasArrangement,
    },
    {
      id: 'transitions',
      title: 'Smart Transitions',
      description: 'AI suggests transitions between clips',
      icon: <ArrowRightLeft className="h-5 w-5" />,
      aiHint: "I analyze clip pairs and suggest the best transition. Dissolves for slow scenes, cuts for action!",
      isComplete: hasTransitions,
    },
    {
      id: 'preview',
      title: 'Preview & Export',
      description: 'Review your creation and export',
      icon: <Download className="h-5 w-5" />,
      aiHint: "Your video is ready! I can suggest optimal export settings for Instagram, YouTube, or TikTok.",
      isComplete: false,
    },
  ];

  const currentStep = steps[currentStepIndex];
  const progress = (steps.filter(s => s.isComplete).length / steps.length) * 100;
  const canGoNext = currentStep.isComplete || currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleAskAI = () => {
    if (aiQuestion.trim()) {
      onAskAI(aiQuestion);
      setAiQuestion('');
    } else {
      onAskAI(currentStep.aiHint);
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Guided Editor
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Step {currentStepIndex + 1} of {steps.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>

      <CardContent className="space-y-4 px-4 pb-4">
        {/* Step Indicators */}
        <div className="flex justify-between px-2">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setCurrentStepIndex(index)}
              className={cn(
                "flex flex-col items-center gap-1 transition-all",
                index === currentStepIndex && "scale-110"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                step.isComplete 
                  ? "bg-green-500 text-white" 
                  : index === currentStepIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
              )}>
                {step.isComplete ? <Check className="h-4 w-4" /> : step.icon}
              </div>
              <span className={cn(
                "text-[9px] hidden sm:block",
                index === currentStepIndex ? "font-medium" : "text-muted-foreground"
              )}>
                {step.title}
              </span>
            </button>
          ))}
        </div>

        {/* Current Step Content */}
        <Card className="bg-muted/30 border-dashed">
          <CardHeader className="pb-2 pt-3 px-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                currentStep.isComplete ? "bg-green-500/20" : "bg-primary/20"
              )}>
                {currentStep.isComplete ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <span className="text-primary">{currentStep.icon}</span>
                )}
              </div>
              <div className="flex-1">
                <CardTitle className="text-sm">{currentStep.title}</CardTitle>
                <CardDescription className="text-xs">
                  {currentStep.description}
                </CardDescription>
              </div>
              {currentStep.requirement && (
                <Badge 
                  variant={currentStep.isComplete ? "default" : "secondary"}
                  className="text-[10px]"
                >
                  {currentStep.isComplete ? '✓ Done' : currentStep.requirement}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="px-3 pb-3 space-y-3">
            {/* AI Hint */}
            <div className="flex items-start gap-2 p-2 bg-primary/5 rounded-lg border border-primary/10">
              <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                {currentStep.aiHint}
              </p>
            </div>

            {/* Action Button */}
            <Button
              className="w-full"
              variant={currentStep.isComplete ? "outline" : "default"}
              onClick={() => onStepAction(currentStep.id)}
            >
              {currentStep.isComplete ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Completed - Modify
                </>
              ) : (
                <>
                  {currentStep.icon}
                  <span className="ml-2">
                    {currentStep.id === 'import' && 'Add Clips'}
                    {currentStep.id === 'music' && 'Upload Music'}
                    {currentStep.id === 'arrange' && 'Run AI Arrange'}
                    {currentStep.id === 'transitions' && 'Add Transitions'}
                    {currentStep.id === 'preview' && 'Preview & Export'}
                  </span>
                </>
              )}
            </Button>

            {/* Ask AI Section */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Ask AI for help..."
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                  className="w-full h-9 px-3 pr-8 text-xs rounded-md border bg-background"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-0 top-0 h-9 w-9"
                  onClick={() => onAskAI('voice')}
                >
                  <Mic className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Button
                size="icon"
                variant="secondary"
                className="h-9 w-9"
                onClick={handleAskAI}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <Button
            className="flex-1"
            onClick={handleNext}
            disabled={!canGoNext && currentStepIndex < steps.length - 1}
          >
            {currentStepIndex === steps.length - 1 ? (
              <>
                <Download className="h-4 w-4 mr-1" />
                Finish
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GuidedEditingWizard;
