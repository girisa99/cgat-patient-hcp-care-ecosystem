/**
 * Guided Editing Experience - Complete 7-Phase Production
 * Main container with Wizard/Sidebar mode, Universal AI, Scene Analyzer, Voice Director, and Distribution Agent
 * Covers: Recording → Voice → Timeline → Editing → Transitions → Music → Export → Distribute
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wand2,
  ListChecks,
  MessageCircle,
  Sparkles,
  GraduationCap,
  Zap,
  ArrowRight,
  Bot,
  Video,
  Mic,
  FolderOpen,
  Eye,
  Volume2,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { TimelineClip } from './MultiClipTimeline';
import { GuidedEditingWizard } from './GuidedEditingWizard';
import { SmartEditingSidebar } from './SmartEditingSidebar';
import { UniversalAIEditingAssistant } from './UniversalAIEditingAssistant';
import { SceneAnalyzerPanel } from './SceneAnalyzerPanel';
import { SceneAnalysis } from '@/hooks/useSceneAnalyzer';
import { VoiceDirectorPanel } from './VoiceDirectorPanel';
import { VoiceDirectorResult } from '@/hooks/useVoiceDirector';
import { DistributionAgentPanel } from './DistributionAgentPanel';
import { DistributionResult } from '@/hooks/useDistributionAgent';

type ExperienceMode = 'choose' | 'wizard' | 'sidebar';

interface GuidedEditingExperienceProps {
  clips: TimelineClip[];
  hasMusic: boolean;
  hasArrangement: boolean;
  hasTransitions: boolean;
  hasVoiceover?: boolean;
  hasEdits?: boolean;
  onNavigateToStep: (step: string, data?: any) => void;
  className?: string;
}

export const GuidedEditingExperience: React.FC<GuidedEditingExperienceProps> = ({
  clips,
  hasMusic,
  hasArrangement,
  hasTransitions,
  hasVoiceover = false,
  hasEdits = false,
  onNavigateToStep,
  className,
}) => {
  const [mode, setMode] = useState<ExperienceMode>('choose');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showSceneAnalyzer, setShowSceneAnalyzer] = useState(false);
  const [showVoiceDirector, setShowVoiceDirector] = useState(false);
  const [showDistribution, setShowDistribution] = useState(false);
  const [currentStep, setCurrentStep] = useState('capture');
  const [sceneAnalyses, setSceneAnalyses] = useState<SceneAnalysis[]>([]);
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string>('');

  const videoClips = clips.filter(c => c.type === 'video');
  const audioClips = clips.filter(c => c.type === 'audio');
  
  // Extract frame thumbnails for scene analysis
  const frameImages = useMemo(() => 
    videoClips.map(c => c.thumbnailUrl).filter(Boolean) as string[],
    [videoClips]
  );

  const handleSceneAnalysisComplete = useCallback((analyses: SceneAnalysis[]) => {
    setSceneAnalyses(analyses);
    toast.success(`Analyzed ${analyses.length} scenes with AI`);
  }, []);

  const handleSuggestionApply = useCallback((suggestion: any) => {
    toast.info(`Applying: ${suggestion.description}`);
    onNavigateToStep(suggestion.type, suggestion);
  }, [onNavigateToStep]);

  const handleVoiceGenerated = useCallback((result: VoiceDirectorResult) => {
    toast.success(`Voice generated: ${result.voice} (~${result.duration_estimate?.toFixed(1)}s)`);
    onNavigateToStep('voice-ai-tts', { audioUrl: result.audioUrl, metadata: result.metadata });
  }, [onNavigateToStep]);

  const handleDistributionComplete = useCallback((results: DistributionResult[]) => {
    const successCount = results.filter(r => r.status === 'success' || r.status === 'scheduled').length;
    toast.success(`🎉 Distributed to ${successCount}/${results.length} platforms!`);
    setShowDistribution(false);
  }, []);

  const handleStepAction = useCallback((action: string, data?: any) => {
    setCurrentStep(action);
    onNavigateToStep(action, data);
    
    // Show contextual toasts
    const actionMessages: Record<string, string> = {
      'record-video': 'Opening video recorder...',
      'record-audio': 'Opening audio recorder...',
      'record-one-tap': 'One-tap recording ready - tap to start!',
      'record-multi': 'Multi-take mode - record multiple segments',
      'record-location': 'Location mode - tag recordings with location',
      'import-files': 'Select files to import...',
      'voice-record-live': 'Opening voiceover recorder with teleprompter...',
      'voice-ai-tts': 'Opening AI Text-to-Speech...',
      'voice-clone-voice': 'Opening voice clone studio...',
      'arrange-ai-auto': 'AI is arranging your clips...',
      'arrange-manual': 'Opening timeline editor...',
      'arrange-script-based': 'Matching clips to script...',
      'edit-trim': 'Opening trim editor...',
      'edit-effects': 'Opening effects panel...',
      'edit-text': 'Opening text overlay editor...',
      'transitions-ai-smart': 'AI is adding smart transitions...',
      'transitions-preset': 'Opening transition presets...',
      'transitions-manual': 'Opening transition picker...',
      'music-upload': 'Select a music file...',
      'music-ai-generate': 'AI is generating music...',
      'music-beat-sync': 'Syncing clips to beat...',
      'preview': 'Playing preview...',
      'export-social': 'Preparing for social media export...',
      'export-download': 'Preparing download...',
      'export-share': 'Generating share link...',
    };

    const message = actionMessages[action] || `Opening ${action}...`;
    toast.info(message);
  }, [onNavigateToStep]);

  const handleAskAI = useCallback((question: string) => {
    if (question === 'voice') {
      toast.info('Voice input coming soon!');
      return;
    }
    setShowAIAssistant(true);
  }, []);

  const handleComplete = useCallback(() => {
    toast.success('🎉 Production complete! Your video is ready to export.');
    onNavigateToStep('export');
  }, [onNavigateToStep]);

  const handleAIAction = useCallback((action: string) => {
    handleStepAction(action);
    setShowAIAssistant(false);
  }, [handleStepAction]);

  // Quick Start options
  const quickStartOptions = [
    {
      id: 'record-video',
      icon: <Video className="h-5 w-5 text-blue-500" />,
      label: 'Record Video',
      description: 'Start with camera',
    },
    {
      id: 'record-audio',
      icon: <Mic className="h-5 w-5 text-green-500" />,
      label: 'Record Audio',
      description: 'Voice or podcast',
    },
    {
      id: 'import-files',
      icon: <FolderOpen className="h-5 w-5 text-orange-500" />,
      label: 'Import Files',
      description: 'Upload existing',
    },
  ];

  // Mode Selection Screen
  if (mode === 'choose') {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-lg">Create Your Video</CardTitle>
          <CardDescription className="text-sm">
            {videoClips.length > 0 || audioClips.length > 0 
              ? `Continue with ${videoClips.length} video & ${audioClips.length} audio clips`
              : 'Choose how you want to start'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pb-6">
          {/* Quick Start - Only show if no clips */}
          {videoClips.length === 0 && audioClips.length === 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground text-center">Quick Start</p>
              <div className="grid grid-cols-3 gap-2">
                {quickStartOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setMode('wizard');
                      setTimeout(() => handleStepAction(option.id), 100);
                    }}
                    className="flex flex-col items-center gap-1 p-3 rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    {option.icon}
                    <span className="text-xs font-medium">{option.label}</span>
                    <span className="text-[9px] text-muted-foreground">{option.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-2 text-xs text-muted-foreground">or choose your experience</span>
            </div>
          </div>

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
                  I'll guide you through 7 phases: Record → Voice → Organize → Edit → Transitions → Music → Export
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
                  Flexible editing with all 7 phases accessible. Complete steps in any order you want
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-3" />
            </div>
          </button>

          {/* AI Assistant Preview */}
          <div className="pt-3 border-t">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-3">
              <Bot className="h-3.5 w-3.5" />
              <span>Universal AI available in both modes</span>
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

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={() => setMode('choose')}
          >
            ← Back
          </Button>
          <Button
            variant={showVoiceDirector ? "default" : "outline"}
            size="sm"
            className="h-8"
            onClick={() => {
              setShowVoiceDirector(!showVoiceDirector);
              setShowSceneAnalyzer(false);
              setShowDistribution(false);
            }}
          >
            <Volume2 className="h-3.5 w-3.5 mr-1.5" />
            Voice
          </Button>
          {videoClips.length > 0 && (
            <Button
              variant={showSceneAnalyzer ? "default" : "outline"}
              size="sm"
              className="h-8"
            onClick={() => {
              setShowSceneAnalyzer(!showSceneAnalyzer);
              setShowVoiceDirector(false);
              setShowDistribution(false);
            }}
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            Analyze
          </Button>
          )}
          <Button
            variant={showDistribution ? "default" : "outline"}
            size="sm"
            className="h-8"
            onClick={() => {
              setShowDistribution(!showDistribution);
              setShowVoiceDirector(false);
              setShowSceneAnalyzer(false);
            }}
          >
            <Share2 className="h-3.5 w-3.5 mr-1.5" />
            Distribute
          </Button>
          <Button
            variant={showAIAssistant ? "default" : "outline"}
            size="sm"
            className="h-8"
            onClick={() => setShowAIAssistant(!showAIAssistant)}
          >
            <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
            AI
          </Button>
        </div>
      </div>

      {/* Content based on mode */}
      {mode === 'wizard' && (
        <GuidedEditingWizard
          clips={clips}
          hasMusic={hasMusic}
          hasArrangement={hasArrangement}
          hasTransitions={hasTransitions}
          hasVoiceover={hasVoiceover}
          hasEdits={hasEdits}
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

      {/* Voice Director Panel */}
      {showVoiceDirector && (
        <div className="fixed inset-x-4 top-20 z-50 max-h-[70vh] overflow-auto">
          <VoiceDirectorPanel
            onVoiceGenerated={handleVoiceGenerated}
            onClose={() => setShowVoiceDirector(false)}
          />
        </div>
      )}

      {/* Scene Analyzer Panel */}
      {showSceneAnalyzer && (
        <div className="fixed inset-x-4 top-20 z-50 max-h-[60vh] overflow-auto">
          <SceneAnalyzerPanel
            frames={frameImages}
            onAnalysisComplete={handleSceneAnalysisComplete}
            onSuggestionApply={handleSuggestionApply}
          />
        </div>
      )}

      {/* Distribution Agent Panel */}
      {showDistribution && (
        <div className="fixed inset-x-4 top-20 z-50 max-h-[70vh] overflow-auto">
          <DistributionAgentPanel
            videoUrl={exportedVideoUrl}
            videoTitle="My Video"
            onClose={() => setShowDistribution(false)}
            onDistributionComplete={handleDistributionComplete}
          />
        </div>
      )}

      {/* Floating AI Button (when assistant is closed) */}
      {!showAIAssistant && !showSceneAnalyzer && (
        <Button
          size="icon"
          className="fixed bottom-20 right-4 h-12 w-12 rounded-full shadow-lg z-40"
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
