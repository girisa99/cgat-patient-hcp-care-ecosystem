/**
 * Guided Editing Experience
 * Main container that lets user choose Wizard or Sidebar mode
 * Includes Universal AI Assistant
 * Works on both mobile and desktop
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wand2,
  ListChecks,
  MessageCircle,
  Sparkles,
  GraduationCap,
  Zap,
  ArrowRight,
  Bot,
  X,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { TimelineClip } from './MultiClipTimeline';
import { GuidedEditingWizard } from './GuidedEditingWizard';
import { SmartEditingSidebar } from './SmartEditingSidebar';
import { UniversalAIEditingAssistant } from './UniversalAIEditingAssistant';

type ExperienceMode = 'choose' | 'wizard' | 'sidebar';

interface GuidedEditingExperienceProps {
  clips: TimelineClip[];
  hasMusic: boolean;
  hasArrangement: boolean;
  hasTransitions: boolean;
  onNavigateToStep: (step: string) => void;
  className?: string;
}

export const GuidedEditingExperience: React.FC<GuidedEditingExperienceProps> = ({
  clips,
  hasMusic,
  hasArrangement,
  hasTransitions,
  onNavigateToStep,
  className,
}) => {
  const [mode, setMode] = useState<ExperienceMode>('choose');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [currentStep, setCurrentStep] = useState('import');

  const videoClips = clips.filter(c => c.type === 'video');

  const handleStepAction = useCallback((stepId: string) => {
    setCurrentStep(stepId);
    onNavigateToStep(stepId);
    toast.info(`Opening ${stepId}...`);
  }, [onNavigateToStep]);

  const handleAskAI = useCallback((question: string) => {
    if (question === 'voice') {
      toast.info('Voice input coming soon!');
      return;
    }
    setShowAIAssistant(true);
  }, []);

  const handleComplete = useCallback(() => {
    toast.success('🎉 Video editing complete! Ready to export.');
    onNavigateToStep('export');
  }, [onNavigateToStep]);

  const handleAIAction = useCallback((action: string) => {
    handleStepAction(action);
    setShowAIAssistant(false);
  }, [handleStepAction]);

  // Mode Selection Screen
  if (mode === 'choose') {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-lg">Choose Your Experience</CardTitle>
          <CardDescription className="text-sm">
            How would you like to edit your {videoClips.length} clips?
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 pb-6">
          {/* Wizard Mode */}
          <button
            onClick={() => setMode('wizard')}
            className="w-full p-4 rounded-xl border-2 border-muted hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                <GraduationCap className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-sm">Step-by-Step Wizard</h3>
                  <Badge variant="secondary" className="text-[9px]">Beginner</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  I'll guide you through each step with clear instructions and AI suggestions
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-3" />
            </div>
          </button>

          {/* Sidebar Mode */}
          <button
            onClick={() => setMode('sidebar')}
            className="w-full p-4 rounded-xl border-2 border-muted hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                <Zap className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-sm">Quick Checklist</h3>
                  <Badge variant="secondary" className="text-[9px]">Advanced</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Flexible editing with a smart checklist. Complete steps in any order
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-3" />
            </div>
          </button>

          {/* AI Assistant Preview */}
          <div className="pt-3 border-t">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-3">
              <Bot className="h-3.5 w-3.5" />
              <span>AI Assistant available in both modes</span>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowAIAssistant(true)}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat with AI First
            </Button>
          </div>
        </CardContent>

        {/* AI Assistant */}
        <UniversalAIEditingAssistant
          clips={clips}
          hasMusic={hasMusic}
          hasArrangement={hasArrangement}
          hasTransitions={hasTransitions}
          currentStep={currentStep}
          onAction={handleAIAction}
          isOpen={showAIAssistant}
          onClose={() => setShowAIAssistant(false)}
        />
      </Card>
    );
  }

  // Active Editing Mode
  return (
    <div className={cn("relative", className)}>
      {/* Mode Switcher */}
      <div className="flex items-center justify-between mb-3">
        <Tabs value={mode} onValueChange={(v) => setMode(v as ExperienceMode)}>
          <TabsList className="h-8">
            <TabsTrigger value="wizard" className="text-xs h-7 px-3">
              <GraduationCap className="h-3 w-3 mr-1.5" />
              Wizard
            </TabsTrigger>
            <TabsTrigger value="sidebar" className="text-xs h-7 px-3">
              <ListChecks className="h-3 w-3 mr-1.5" />
              Checklist
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button
          variant={showAIAssistant ? "default" : "outline"}
          size="sm"
          className="h-8"
          onClick={() => setShowAIAssistant(!showAIAssistant)}
        >
          <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
          AI Help
        </Button>
      </div>

      {/* Content based on mode */}
      {mode === 'wizard' && (
        <GuidedEditingWizard
          clips={clips}
          hasMusic={hasMusic}
          hasArrangement={hasArrangement}
          hasTransitions={hasTransitions}
          onStepAction={handleStepAction}
          onAskAI={handleAskAI}
          onComplete={handleComplete}
        />
      )}

      {mode === 'sidebar' && (
        <SmartEditingSidebar
          clips={clips}
          hasMusic={hasMusic}
          hasArrangement={hasArrangement}
          hasTransitions={hasTransitions}
          onItemAction={handleStepAction}
          onAskAI={handleAskAI}
        />
      )}

      {/* Floating AI Button (when assistant is closed) */}
      {!showAIAssistant && (
        <Button
          size="icon"
          className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg z-40"
          onClick={() => setShowAIAssistant(true)}
        >
          <Bot className="h-5 w-5" />
        </Button>
      )}

      {/* AI Assistant */}
      <UniversalAIEditingAssistant
        clips={clips}
        hasMusic={hasMusic}
        hasArrangement={hasArrangement}
        hasTransitions={hasTransitions}
        currentStep={currentStep}
        onAction={handleAIAction}
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
      />
    </div>
  );
};

export default GuidedEditingExperience;
