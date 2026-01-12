/**
 * Guided Editing Wizard - Complete 7-Phase Production Experience
 * Covers: Recording (Audio/Video/One-Tap) → Voice → Timeline → Editing → Transitions → Music → Export
 * Works on both mobile and desktop
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
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
  Lightbulb,
  Video,
  AudioLines,
  FolderOpen,
  Zap,
  Clapperboard,
  MapPin,
  FileAudio,
  Bot,
  Type,
  Scissors,
  Palette,
  LayoutGrid,
  Share2,
  Smartphone,
  HardDrive,
  Link
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TimelineClip } from './MultiClipTimeline';

// Phase definitions
type CaptureType = 'video' | 'audio' | 'import' | null;
type VideoStyle = 'one-tap' | 'multi-take' | 'location' | null;
type AudioType = 'voiceover' | 'voice-clone' | 'music-record' | null;
type VoiceMethod = 'record-live' | 'ai-tts' | 'clone-voice' | 'skip' | null;
type OrganizeMethod = 'ai-auto' | 'manual' | 'script-based' | null;
type EditType = 'trim' | 'effects' | 'text' | null;
type TransitionStyle = 'ai-smart' | 'preset' | 'manual' | null;
type MusicSource = 'upload' | 'ai-generate' | 'skip' | null;
type ExportFormat = 'social' | 'download' | 'share' | null;

interface WizardPhase {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isComplete: boolean;
}

interface GuidedEditingWizardProps {
  clips: TimelineClip[];
  hasMusic: boolean;
  hasArrangement: boolean;
  hasTransitions: boolean;
  hasVoiceover: boolean;
  hasEdits: boolean;
  onStepAction: (action: string, data?: any) => void;
  onAskAI: (question: string) => void;
  onComplete: () => void;
  className?: string;
}

export const GuidedEditingWizard: React.FC<GuidedEditingWizardProps> = ({
  clips,
  hasMusic,
  hasArrangement,
  hasTransitions,
  hasVoiceover,
  hasEdits,
  onStepAction,
  onAskAI,
  onComplete,
  className,
}) => {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [aiQuestion, setAiQuestion] = useState('');
  
  // Phase-specific selections
  const [captureType, setCaptureType] = useState<CaptureType>(null);
  const [videoStyle, setVideoStyle] = useState<VideoStyle>(null);
  const [audioType, setAudioType] = useState<AudioType>(null);
  const [voiceMethod, setVoiceMethod] = useState<VoiceMethod>(null);
  const [organizeMethod, setOrganizeMethod] = useState<OrganizeMethod>(null);
  const [editTypes, setEditTypes] = useState<EditType[]>([]);
  const [transitionStyle, setTransitionStyle] = useState<TransitionStyle>(null);
  const [musicSource, setMusicSource] = useState<MusicSource>(null);
  const [exportFormat, setExportFormat] = useState<ExportFormat>(null);

  const videoClips = clips.filter(c => c.type === 'video');
  const audioClips = clips.filter(c => c.type === 'audio');

  // Define all 7 phases
  const phases: WizardPhase[] = [
    {
      id: 'capture',
      title: 'Content Capture',
      description: 'Record video, audio, or import files',
      icon: <Video className="h-5 w-5" />,
      isComplete: videoClips.length > 0 || audioClips.length > 0,
    },
    {
      id: 'voice',
      title: 'Voice & Narration',
      description: 'Add voiceover, TTS, or voice clone',
      icon: <Mic className="h-5 w-5" />,
      isComplete: hasVoiceover || voiceMethod === 'skip',
    },
    {
      id: 'timeline',
      title: 'Organization',
      description: 'Arrange clips on timeline',
      icon: <LayoutGrid className="h-5 w-5" />,
      isComplete: hasArrangement,
    },
    {
      id: 'editing',
      title: 'Editing',
      description: 'Trim, effects, and text overlays',
      icon: <Scissors className="h-5 w-5" />,
      isComplete: hasEdits || editTypes.length > 0,
    },
    {
      id: 'transitions',
      title: 'Transitions',
      description: 'Add smooth transitions between clips',
      icon: <ArrowRightLeft className="h-5 w-5" />,
      isComplete: hasTransitions,
    },
    {
      id: 'music',
      title: 'Music & Audio',
      description: 'Background music and beat sync',
      icon: <Music className="h-5 w-5" />,
      isComplete: hasMusic || musicSource === 'skip',
    },
    {
      id: 'export',
      title: 'Preview & Export',
      description: 'Finalize and share your creation',
      icon: <Download className="h-5 w-5" />,
      isComplete: false,
    },
  ];

  const currentPhase = phases[currentPhaseIndex];
  const completedCount = phases.filter(p => p.isComplete).length;
  const progress = (completedCount / phases.length) * 100;

  const handleNext = () => {
    if (currentPhaseIndex < phases.length - 1) {
      setCurrentPhaseIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentPhaseIndex > 0) {
      setCurrentPhaseIndex(prev => prev - 1);
    }
  };

  const handleAskAI = () => {
    if (aiQuestion.trim()) {
      onAskAI(aiQuestion);
      setAiQuestion('');
    }
  };

  // Render phase-specific content
  const renderPhaseContent = () => {
    switch (currentPhase.id) {
      case 'capture':
        return renderCapturePhase();
      case 'voice':
        return renderVoicePhase();
      case 'timeline':
        return renderTimelinePhase();
      case 'editing':
        return renderEditingPhase();
      case 'transitions':
        return renderTransitionsPhase();
      case 'music':
        return renderMusicPhase();
      case 'export':
        return renderExportPhase();
      default:
        return null;
    }
  };

  const renderCapturePhase = () => (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-2 bg-primary/5 rounded-lg border border-primary/10">
        <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Choose how you want to capture content. Video for visual stories, Audio for podcasts/voiceovers, or Import existing files.
        </p>
      </div>

      <RadioGroup value={captureType || ''} onValueChange={(v) => setCaptureType(v as CaptureType)} className="space-y-2">
        <div className={cn("flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer", captureType === 'video' && "border-primary bg-primary/5")}>
          <RadioGroupItem value="video" id="video" />
          <Label htmlFor="video" className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-sm">Video Recording</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Record with camera</p>
          </Label>
        </div>
        
        <div className={cn("flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer", captureType === 'audio' && "border-primary bg-primary/5")}>
          <RadioGroupItem value="audio" id="audio" />
          <Label htmlFor="audio" className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <AudioLines className="h-4 w-4 text-green-500" />
              <span className="font-medium text-sm">Audio Only</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Voiceover, podcast, music</p>
          </Label>
        </div>
        
        <div className={cn("flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer", captureType === 'import' && "border-primary bg-primary/5")}>
          <RadioGroupItem value="import" id="import" />
          <Label htmlFor="import" className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-orange-500" />
              <span className="font-medium text-sm">Import Files</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Upload existing media</p>
          </Label>
        </div>
      </RadioGroup>

      {/* Sub-options based on selection */}
      {captureType === 'video' && (
        <div className="pl-4 border-l-2 border-primary/20 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Recording Style:</p>
          <div className="grid grid-cols-3 gap-2">
            <Button variant={videoStyle === 'one-tap' ? 'default' : 'outline'} size="sm" className="flex-col h-auto py-2" onClick={() => { setVideoStyle('one-tap'); onStepAction('record-one-tap'); }}>
              <Zap className="h-4 w-4 mb-1" />
              <span className="text-[10px]">One-Tap</span>
            </Button>
            <Button variant={videoStyle === 'multi-take' ? 'default' : 'outline'} size="sm" className="flex-col h-auto py-2" onClick={() => { setVideoStyle('multi-take'); onStepAction('record-multi'); }}>
              <Clapperboard className="h-4 w-4 mb-1" />
              <span className="text-[10px]">Multi-Take</span>
            </Button>
            <Button variant={videoStyle === 'location' ? 'default' : 'outline'} size="sm" className="flex-col h-auto py-2" onClick={() => { setVideoStyle('location'); onStepAction('record-location'); }}>
              <MapPin className="h-4 w-4 mb-1" />
              <span className="text-[10px]">Location</span>
            </Button>
          </div>
        </div>
      )}

      {captureType === 'audio' && (
        <div className="pl-4 border-l-2 border-primary/20 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Audio Type:</p>
          <div className="grid grid-cols-3 gap-2">
            <Button variant={audioType === 'voiceover' ? 'default' : 'outline'} size="sm" className="flex-col h-auto py-2" onClick={() => { setAudioType('voiceover'); onStepAction('record-voiceover'); }}>
              <Mic className="h-4 w-4 mb-1" />
              <span className="text-[10px]">Voiceover</span>
            </Button>
            <Button variant={audioType === 'voice-clone' ? 'default' : 'outline'} size="sm" className="flex-col h-auto py-2" onClick={() => { setAudioType('voice-clone'); onStepAction('voice-clone'); }}>
              <Bot className="h-4 w-4 mb-1" />
              <span className="text-[10px]">Clone Voice</span>
            </Button>
            <Button variant={audioType === 'music-record' ? 'default' : 'outline'} size="sm" className="flex-col h-auto py-2" onClick={() => { setAudioType('music-record'); onStepAction('record-music'); }}>
              <Music className="h-4 w-4 mb-1" />
              <span className="text-[10px]">Music/SFX</span>
            </Button>
          </div>
        </div>
      )}

      {captureType === 'import' && (
        <Button className="w-full" onClick={() => onStepAction('import-files')}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Files
        </Button>
      )}

      {(videoClips.length > 0 || audioClips.length > 0) && (
        <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded-lg text-green-600">
          <Check className="h-4 w-4" />
          <span className="text-xs font-medium">{videoClips.length} video clips, {audioClips.length} audio clips ready</span>
        </div>
      )}
    </div>
  );

  const renderVoicePhase = () => (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-2 bg-primary/5 rounded-lg border border-primary/10">
        <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Add narration to your video. Record live, use AI text-to-speech, or use a cloned voice.
        </p>
      </div>

      <RadioGroup value={voiceMethod || ''} onValueChange={(v) => setVoiceMethod(v as VoiceMethod)} className="space-y-2">
        <div className={cn("flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer", voiceMethod === 'record-live' && "border-primary bg-primary/5")}>
          <RadioGroupItem value="record-live" id="record-live" />
          <Label htmlFor="record-live" className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-red-500" />
              <span className="font-medium text-sm">Record Live</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Record voiceover with teleprompter sync</p>
          </Label>
        </div>
        
        <div className={cn("flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer", voiceMethod === 'ai-tts' && "border-primary bg-primary/5")}>
          <RadioGroupItem value="ai-tts" id="ai-tts" />
          <Label htmlFor="ai-tts" className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-purple-500" />
              <span className="font-medium text-sm">AI Text-to-Speech</span>
              <Badge variant="secondary" className="text-[9px]">AI</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Generate voice from your script</p>
          </Label>
        </div>
        
        <div className={cn("flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer", voiceMethod === 'clone-voice' && "border-primary bg-primary/5")}>
          <RadioGroupItem value="clone-voice" id="clone-voice" />
          <Label htmlFor="clone-voice" className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <AudioLines className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-sm">Use Cloned Voice</span>
              <Badge variant="secondary" className="text-[9px]">Pro</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Use your cloned voice with emotion tuning</p>
          </Label>
        </div>
        
        <div className={cn("flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer", voiceMethod === 'skip' && "border-muted bg-muted/30")}>
          <RadioGroupItem value="skip" id="skip-voice" />
          <Label htmlFor="skip-voice" className="flex-1 cursor-pointer">
            <span className="font-medium text-sm text-muted-foreground">Skip for now</span>
          </Label>
        </div>
      </RadioGroup>

      {voiceMethod && voiceMethod !== 'skip' && (
        <Button className="w-full" onClick={() => onStepAction(`voice-${voiceMethod}`)}>
          {voiceMethod === 'record-live' && <><Mic className="h-4 w-4 mr-2" />Start Recording</>}
          {voiceMethod === 'ai-tts' && <><Bot className="h-4 w-4 mr-2" />Generate Voice</>}
          {voiceMethod === 'clone-voice' && <><AudioLines className="h-4 w-4 mr-2" />Use Clone</>}
        </Button>
      )}
    </div>
  );

  const renderTimelinePhase = () => (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-2 bg-primary/5 rounded-lg border border-primary/10">
        <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Organize your clips. Let AI arrange them or do it manually. AI can detect story flow!
        </p>
      </div>

      <RadioGroup value={organizeMethod || ''} onValueChange={(v) => setOrganizeMethod(v as OrganizeMethod)} className="space-y-2">
        <div className={cn("flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer", organizeMethod === 'ai-auto' && "border-primary bg-primary/5")}>
          <RadioGroupItem value="ai-auto" id="ai-auto" />
          <Label htmlFor="ai-auto" className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-purple-500" />
              <span className="font-medium text-sm">AI Auto-Arrange</span>
              <Badge variant="secondary" className="text-[9px]">Recommended</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Story, Fast Cuts, or Relaxed mode</p>
          </Label>
        </div>
        
        <div className={cn("flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer", organizeMethod === 'manual' && "border-primary bg-primary/5")}>
          <RadioGroupItem value="manual" id="manual" />
          <Label htmlFor="manual" className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-sm">Manual Drag & Drop</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Full control over clip order</p>
          </Label>
        </div>
        
        <div className={cn("flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer", organizeMethod === 'script-based' && "border-primary bg-primary/5")}>
          <RadioGroupItem value="script-based" id="script-based" />
          <Label htmlFor="script-based" className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <FileAudio className="h-4 w-4 text-green-500" />
              <span className="font-medium text-sm">Match to Script</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">AI matches clips to script scenes</p>
          </Label>
        </div>
      </RadioGroup>

      {organizeMethod && (
        <Button className="w-full" onClick={() => onStepAction(`arrange-${organizeMethod}`)}>
          {organizeMethod === 'ai-auto' && <><Wand2 className="h-4 w-4 mr-2" />Run AI Arrange</>}
          {organizeMethod === 'manual' && <><LayoutGrid className="h-4 w-4 mr-2" />Open Timeline</>}
          {organizeMethod === 'script-based' && <><FileAudio className="h-4 w-4 mr-2" />Match to Script</>}
        </Button>
      )}
    </div>
  );

  const renderEditingPhase = () => (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-2 bg-primary/5 rounded-lg border border-primary/10">
        <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Fine-tune your clips. Trim unwanted parts, add effects, or overlay text and titles.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium">Select what to edit:</p>
        <div className="grid grid-cols-3 gap-2">
          <Button 
            variant={editTypes.includes('trim') ? 'default' : 'outline'} 
            size="sm" 
            className="flex-col h-auto py-3"
            onClick={() => {
              setEditTypes(prev => prev.includes('trim') ? prev.filter(e => e !== 'trim') : [...prev, 'trim']);
            }}
          >
            <Scissors className="h-5 w-5 mb-1" />
            <span className="text-xs">Trim & Cut</span>
            <span className="text-[9px] text-muted-foreground">AI smart cuts</span>
          </Button>
          <Button 
            variant={editTypes.includes('effects') ? 'default' : 'outline'} 
            size="sm" 
            className="flex-col h-auto py-3"
            onClick={() => {
              setEditTypes(prev => prev.includes('effects') ? prev.filter(e => e !== 'effects') : [...prev, 'effects']);
            }}
          >
            <Palette className="h-5 w-5 mb-1" />
            <span className="text-xs">Effects</span>
            <span className="text-[9px] text-muted-foreground">Filters & color</span>
          </Button>
          <Button 
            variant={editTypes.includes('text') ? 'default' : 'outline'} 
            size="sm" 
            className="flex-col h-auto py-3"
            onClick={() => {
              setEditTypes(prev => prev.includes('text') ? prev.filter(e => e !== 'text') : [...prev, 'text']);
            }}
          >
            <Type className="h-5 w-5 mb-1" />
            <span className="text-xs">Text/Titles</span>
            <span className="text-[9px] text-muted-foreground">Auto-captions</span>
          </Button>
        </div>
      </div>

      {editTypes.length > 0 && (
        <Button className="w-full" onClick={() => onStepAction('edit', { types: editTypes })}>
          <Scissors className="h-4 w-4 mr-2" />
          Start Editing ({editTypes.length} selected)
        </Button>
      )}

      <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={handleNext}>
        Skip editing for now →
      </Button>
    </div>
  );

  const renderTransitionsPhase = () => (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-2 bg-primary/5 rounded-lg border border-primary/10">
        <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Add transitions between clips. AI analyzes content to suggest the best ones!
        </p>
      </div>

      <RadioGroup value={transitionStyle || ''} onValueChange={(v) => setTransitionStyle(v as TransitionStyle)} className="space-y-2">
        <div className={cn("flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer", transitionStyle === 'ai-smart' && "border-primary bg-primary/5")}>
          <RadioGroupItem value="ai-smart" id="ai-smart" />
          <Label htmlFor="ai-smart" className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-purple-500" />
              <span className="font-medium text-sm">AI Smart Transitions</span>
              <Badge variant="secondary" className="text-[9px]">Best</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">AI picks based on clip content</p>
          </Label>
        </div>
        
        <div className={cn("flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer", transitionStyle === 'preset' && "border-primary bg-primary/5")}>
          <RadioGroupItem value="preset" id="preset" />
          <Label htmlFor="preset" className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-sm">Preset Pack</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Smooth, Dynamic, or Minimal</p>
          </Label>
        </div>
        
        <div className={cn("flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer", transitionStyle === 'manual' && "border-primary bg-primary/5")}>
          <RadioGroupItem value="manual" id="manual-trans" />
          <Label htmlFor="manual-trans" className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-orange-500" />
              <span className="font-medium text-sm">Pick Each One</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Full control over each transition</p>
          </Label>
        </div>
      </RadioGroup>

      {transitionStyle && (
        <Button className="w-full" onClick={() => onStepAction(`transitions-${transitionStyle}`)}>
          <ArrowRightLeft className="h-4 w-4 mr-2" />
          Apply Transitions
        </Button>
      )}
    </div>
  );

  const renderMusicPhase = () => (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-2 bg-primary/5 rounded-lg border border-primary/10">
        <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Add background music and sync cuts to beats. AI detects BPM automatically!
        </p>
      </div>

      <RadioGroup value={musicSource || ''} onValueChange={(v) => setMusicSource(v as MusicSource)} className="space-y-2">
        <div className={cn("flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer", musicSource === 'upload' && "border-primary bg-primary/5")}>
          <RadioGroupItem value="upload" id="upload-music" />
          <Label htmlFor="upload-music" className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-sm">Upload Your Track</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Use your own music file</p>
          </Label>
        </div>
        
        <div className={cn("flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer", musicSource === 'ai-generate' && "border-primary bg-primary/5")}>
          <RadioGroupItem value="ai-generate" id="ai-generate" />
          <Label htmlFor="ai-generate" className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-purple-500" />
              <span className="font-medium text-sm">AI Generate Music</span>
              <Badge variant="secondary" className="text-[9px]">AI</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Create music to match your video</p>
          </Label>
        </div>
        
        <div className={cn("flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer", musicSource === 'skip' && "border-muted bg-muted/30")}>
          <RadioGroupItem value="skip" id="skip-music" />
          <Label htmlFor="skip-music" className="flex-1 cursor-pointer">
            <span className="font-medium text-sm text-muted-foreground">No background music</span>
          </Label>
        </div>
      </RadioGroup>

      {musicSource && musicSource !== 'skip' && (
        <Button className="w-full" onClick={() => onStepAction(`music-${musicSource}`)}>
          <Music className="h-4 w-4 mr-2" />
          {musicSource === 'upload' ? 'Upload & Sync to Beats' : 'Generate Music'}
        </Button>
      )}
    </div>
  );

  const renderExportPhase = () => (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
        <Sparkles className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
        <p className="text-xs text-green-600 font-medium">
          Your video is ready! Preview and choose how to export.
        </p>
      </div>

      <Button variant="outline" className="w-full" onClick={() => onStepAction('preview')}>
        <Play className="h-4 w-4 mr-2" />
        Preview Full Video
      </Button>

      <RadioGroup value={exportFormat || ''} onValueChange={(v) => setExportFormat(v as ExportFormat)} className="space-y-2">
        <div className={cn("flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer", exportFormat === 'social' && "border-primary bg-primary/5")}>
          <RadioGroupItem value="social" id="social" />
          <Label htmlFor="social" className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-pink-500" />
              <span className="font-medium text-sm">Social Media</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Optimized for Instagram, TikTok, YouTube</p>
          </Label>
        </div>
        
        <div className={cn("flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer", exportFormat === 'download' && "border-primary bg-primary/5")}>
          <RadioGroupItem value="download" id="download" />
          <Label htmlFor="download" className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-sm">Download</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">MP4 or MOV in your chosen quality</p>
          </Label>
        </div>
        
        <div className={cn("flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer", exportFormat === 'share' && "border-primary bg-primary/5")}>
          <RadioGroupItem value="share" id="share" />
          <Label htmlFor="share" className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <Link className="h-4 w-4 text-green-500" />
              <span className="font-medium text-sm">Get Shareable Link</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Quick sharing without download</p>
          </Label>
        </div>
      </RadioGroup>

      {exportFormat && (
        <Button className="w-full" onClick={() => onStepAction(`export-${exportFormat}`)}>
          <Download className="h-4 w-4 mr-2" />
          Export Now
        </Button>
      )}
    </div>
  );

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Guided Production
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Phase {currentPhaseIndex + 1} of {phases.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>

      <CardContent className="space-y-4 px-4 pb-4">
        {/* Phase Indicators */}
        <div className="flex justify-between px-1 overflow-x-auto">
          {phases.map((phase, index) => (
            <button
              key={phase.id}
              onClick={() => setCurrentPhaseIndex(index)}
              className={cn(
                "flex flex-col items-center gap-1 transition-all min-w-[40px]",
                index === currentPhaseIndex && "scale-105"
              )}
            >
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center transition-all text-xs",
                phase.isComplete 
                  ? "bg-green-500 text-white" 
                  : index === currentPhaseIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
              )}>
                {phase.isComplete ? <Check className="h-3.5 w-3.5" /> : <span className="text-[10px]">{index + 1}</span>}
              </div>
            </button>
          ))}
        </div>

        {/* Current Phase Header */}
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            currentPhase.isComplete ? "bg-green-500/20" : "bg-primary/20"
          )}>
            {currentPhase.isComplete ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <span className="text-primary">{currentPhase.icon}</span>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-sm">{currentPhase.title}</h3>
            <p className="text-xs text-muted-foreground">{currentPhase.description}</p>
          </div>
        </div>

        {/* Phase Content */}
        <div className="min-h-[200px]">
          {renderPhaseContent()}
        </div>

        {/* AI Help Section */}
        <div className="flex gap-2 pt-2 border-t">
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
          <Button size="icon" variant="secondary" className="h-9 w-9" onClick={handleAskAI}>
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleBack}
            disabled={currentPhaseIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <Button className="flex-1" onClick={handleNext}>
            {currentPhaseIndex === phases.length - 1 ? (
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
