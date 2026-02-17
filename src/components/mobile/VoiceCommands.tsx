/**
 * Voice Commands Component
 * P2 Feature: Voice-First Editing framework
 * Target: 47% market demand for voice commands
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Zap,
  HelpCircle,
  Command,
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Scissors,
  Trash2,
  Save,
  Upload,
  Settings,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Voice command definitions
export interface VoiceCommand {
  id: string;
  phrases: string[];
  action: string;
  category: 'recording' | 'editing' | 'navigation' | 'system';
  description: string;
  icon: React.ElementType;
}

export interface VoiceCommandResult {
  command: VoiceCommand | null;
  transcript: string;
  confidence: number;
  executed: boolean;
}

interface VoiceCommandsProps {
  onCommand?: (result: VoiceCommandResult) => void;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onPauseRecording?: () => void;
  onTrimClip?: () => void;
  onDeleteClip?: () => void;
  onSaveProject?: () => void;
  onExport?: () => void;
  isRecording?: boolean;
  isPaused?: boolean;
  className?: string;
  enabled?: boolean;
}

// Define available voice commands
const VOICE_COMMANDS: VoiceCommand[] = [
  // Recording commands
  {
    id: 'start-recording',
    phrases: ['start recording', 'begin recording', 'record', 'start'],
    action: 'START_RECORDING',
    category: 'recording',
    description: 'Start a new recording',
    icon: Play,
  },
  {
    id: 'stop-recording',
    phrases: ['stop recording', 'end recording', 'stop', 'done'],
    action: 'STOP_RECORDING',
    category: 'recording',
    description: 'Stop the current recording',
    icon: Square,
  },
  {
    id: 'pause-recording',
    phrases: ['pause recording', 'pause', 'hold', 'wait'],
    action: 'PAUSE_RECORDING',
    category: 'recording',
    description: 'Pause the current recording',
    icon: Pause,
  },
  {
    id: 'resume-recording',
    phrases: ['resume recording', 'resume', 'continue', 'go on'],
    action: 'RESUME_RECORDING',
    category: 'recording',
    description: 'Resume a paused recording',
    icon: Play,
  },
  // Editing commands
  {
    id: 'trim-clip',
    phrases: ['trim clip', 'trim', 'cut ends', 'trim video'],
    action: 'TRIM_CLIP',
    category: 'editing',
    description: 'Trim the current clip',
    icon: Scissors,
  },
  {
    id: 'delete-clip',
    phrases: ['delete clip', 'delete', 'remove clip', 'discard'],
    action: 'DELETE_CLIP',
    category: 'editing',
    description: 'Delete the current clip',
    icon: Trash2,
  },
  {
    id: 'undo',
    phrases: ['undo', 'undo that', 'go back', 'revert'],
    action: 'UNDO',
    category: 'editing',
    description: 'Undo the last action',
    icon: SkipBack,
  },
  {
    id: 'redo',
    phrases: ['redo', 'redo that', 'go forward'],
    action: 'REDO',
    category: 'editing',
    description: 'Redo the last undone action',
    icon: SkipForward,
  },
  // System commands
  {
    id: 'save-project',
    phrases: ['save project', 'save', 'save my work'],
    action: 'SAVE_PROJECT',
    category: 'system',
    description: 'Save the current project',
    icon: Save,
  },
  {
    id: 'export',
    phrases: ['export', 'export video', 'publish', 'download'],
    action: 'EXPORT',
    category: 'system',
    description: 'Export the video',
    icon: Upload,
  },
  {
    id: 'help',
    phrases: ['help', 'what can you do', 'commands', 'show commands'],
    action: 'SHOW_HELP',
    category: 'system',
    description: 'Show available commands',
    icon: HelpCircle,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  recording: 'bg-red-500/10 text-red-500 border-red-500/30',
  editing: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  navigation: 'bg-green-500/10 text-green-500 border-green-500/30',
  system: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
};

export const VoiceCommands: React.FC<VoiceCommandsProps> = ({
  onCommand,
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  onTrimClip,
  onDeleteClip,
  onSaveProject,
  onExport,
  isRecording = false,
  isPaused = false,
  className,
  enabled = true,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>(0);

  // Check for speech recognition support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      console.warn('Speech recognition not supported in this browser');
    }
  }, []);

  // Find matching command from transcript
  const findCommand = useCallback((text: string): VoiceCommand | null => {
    const normalizedText = text.toLowerCase().trim();
    
    for (const command of VOICE_COMMANDS) {
      for (const phrase of command.phrases) {
        if (normalizedText.includes(phrase.toLowerCase())) {
          return command;
        }
      }
    }
    return null;
  }, []);

  // Execute command
  const executeCommand = useCallback((command: VoiceCommand) => {
    switch (command.action) {
      case 'START_RECORDING':
        onStartRecording?.();
        break;
      case 'STOP_RECORDING':
        onStopRecording?.();
        break;
      case 'PAUSE_RECORDING':
      case 'RESUME_RECORDING':
        onPauseRecording?.();
        break;
      case 'TRIM_CLIP':
        onTrimClip?.();
        break;
      case 'DELETE_CLIP':
        onDeleteClip?.();
        break;
      case 'SAVE_PROJECT':
        onSaveProject?.();
        break;
      case 'EXPORT':
        onExport?.();
        break;
      case 'SHOW_HELP':
        setShowHelp(true);
        break;
      default:
        console.log('Unknown command:', command.action);
    }

    toast.success(`Voice command: ${command.description}`, {
      icon: <command.icon className="h-4 w-4" />,
    });
  }, [onStartRecording, onStopRecording, onPauseRecording, onTrimClip, onDeleteClip, onSaveProject, onExport]);

  // Start listening
  const startListening = useCallback(() => {
    if (!isSupported || !enabled) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast.info('Voice commands active', { description: 'Say a command...' });
    };

    recognition.onresult = (event: any) => {
      const results = event.results;
      const lastResult = results[results.length - 1];
      
      if (lastResult.isFinal) {
        const text = lastResult[0].transcript;
        const conf = lastResult[0].confidence;
        
        setTranscript(text);
        setConfidence(conf * 100);

        const command = findCommand(text);
        if (command) {
          setLastCommand(command);
          executeCommand(command);
          
          const result: VoiceCommandResult = {
            command,
            transcript: text,
            confidence: conf,
            executed: true,
          };
          onCommand?.(result);
        } else {
          onCommand?.({
            command: null,
            transcript: text,
            confidence: conf,
            executed: false,
          });
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        toast.error('Voice recognition error', { description: event.error });
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();

    // Start audio level monitoring
    startAudioMonitoring();
  }, [isSupported, enabled, findCommand, executeCommand, onCommand]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    stopAudioMonitoring();
  }, []);

  // Audio level monitoring
  const startAudioMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const updateLevel = () => {
        if (!analyserRef.current) return;
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(average / 255 * 100);
        
        animationRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (error) {
      console.warn('Could not start audio monitoring:', error);
    }
  };

  const stopAudioMonitoring = () => {
    cancelAnimationFrame(animationRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  if (!isSupported) {
    return (
      <Card className={cn('bg-card', className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <p className="text-sm">Voice commands not supported in this browser</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('bg-card', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <Command className="h-5 w-5 text-primary" />
            Voice Commands
          </span>
          <Badge variant={isListening ? 'default' : 'secondary'}>
            {isListening ? 'Listening...' : 'Inactive'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Control */}
        <div className="flex items-center gap-4">
          <Button
            size="lg"
            variant={isListening ? 'destructive' : 'default'}
            onClick={isListening ? stopListening : startListening}
            disabled={!enabled}
            className="gap-2"
          >
            {isListening ? (
              <>
                <MicOff className="h-5 w-5" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="h-5 w-5" />
                Start Voice Control
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowHelp(!showHelp)}
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>

        {/* Audio Level */}
        {isListening && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Volume2 className="h-4 w-4" />
                Audio Level
              </span>
              <span className="text-muted-foreground">{Math.round(audioLevel)}%</span>
            </div>
            <Progress value={audioLevel} className="h-2" />
          </div>
        )}

        {/* Last Transcript */}
        {transcript && (
          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Last heard:</span>
              <Badge variant="outline">{Math.round(confidence)}% confidence</Badge>
            </div>
            <p className="text-sm text-muted-foreground italic">"{transcript}"</p>
            {lastCommand && (
              <div className="flex items-center gap-2 mt-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  Executed: {lastCommand.description}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Help Panel */}
        {showHelp && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Available Commands</h4>
            <ScrollArea className="h-[250px]">
              <div className="space-y-2 pr-4">
                {VOICE_COMMANDS.map(command => {
                  const Icon = command.icon;
                  return (
                    <div
                      key={command.id}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50"
                    >
                      <div className={cn(
                        'p-1.5 rounded border',
                        CATEGORY_COLORS[command.category]
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{command.description}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          Say: "{command.phrases[0]}"
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize shrink-0">
                        {command.category}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Status */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Settings className="h-3 w-3" />
          {isRecording ? (
            <span className="text-red-500">Recording in progress</span>
          ) : isPaused ? (
            <span className="text-yellow-500">Recording paused</span>
          ) : (
            <span>Ready for voice commands</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceCommands;
