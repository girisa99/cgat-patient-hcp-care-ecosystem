/**
 * MULTI-LANGUAGE AUDIO PLAYER
 * 
 * Primary language plays by default with dropdown to switch and listen to other languages.
 * Displays confidence score per language for audio quality.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Play, Pause, Volume2, VolumeX, RotateCcw,
  Download, Globe, Loader2, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageAudio {
  languageCode: string;
  languageName: string;
  audioUrl?: string;
  base64?: string;
  duration?: number;
  provider?: string;
  confidenceScore?: number; // 0-100
  status: 'pending' | 'generating' | 'complete' | 'error';
}

interface MultiLanguageAudioPlayerProps {
  primaryLanguage: string;
  audioByLanguage: Record<string, LanguageAudio>;
  onRegenerateLanguage?: (languageCode: string) => Promise<void>;
  className?: string;
}

// Language display names
const LANGUAGE_NAMES: Record<string, string> = {
  'en': 'English',
  'en-gb': 'English (UK)',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ar': 'Arabic',
  'ar-sa': 'Arabic (Saudi)',
  'ar-ae': 'Arabic (UAE)',
  'hi': 'Hindi',
  'ta': 'Tamil',
  'te': 'Telugu',
  'bn': 'Bengali',
  'zh': 'Chinese',
  'ja': 'Japanese',
  'ko': 'Korean',
  'ru': 'Russian',
  'tr': 'Turkish',
  'id': 'Indonesian',
  'ms': 'Malay',
  'th': 'Thai',
  'vi': 'Vietnamese',
  'sw': 'Swahili',
  'yo': 'Yoruba',
  'ha': 'Hausa',
};

export const MultiLanguageAudioPlayer: React.FC<MultiLanguageAudioPlayerProps> = ({
  primaryLanguage,
  audioByLanguage,
  onRegenerateLanguage,
  className,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState(primaryLanguage);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const languages = Object.keys(audioByLanguage);
  const currentAudio = audioByLanguage[selectedLanguage];
  const audioSrc = currentAudio?.audioUrl || 
    (currentAudio?.base64 ? `data:audio/mpeg;base64,${currentAudio.base64}` : null);

  // Reset audio when language changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [selectedLanguage]);

  // Setup audio element
  useEffect(() => {
    if (audioSrc) {
      const audio = new Audio(audioSrc);
      audioRef.current = audio;

      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });

      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });

      return () => {
        audio.pause();
        audio.removeEventListener('loadedmetadata', () => {});
        audio.removeEventListener('timeupdate', () => {});
        audio.removeEventListener('ended', () => {});
      };
    }
  }, [audioSrc]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleRegenerate = async () => {
    if (!onRegenerateLanguage) return;
    setIsRegenerating(true);
    try {
      await onRegenerateLanguage(selectedLanguage);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDownload = () => {
    if (!audioSrc) return;
    const link = document.createElement('a');
    link.href = audioSrc;
    link.download = `audio_${selectedLanguage}.mp3`;
    link.click();
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getConfidenceColor = (score?: number) => {
    if (!score) return 'bg-muted';
    if (score >= 95) return 'bg-green-500';
    if (score >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={cn("space-y-3 p-4 border rounded-lg bg-card", className)}>
      {/* Header with language selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Voice Audio</span>
          {currentAudio?.provider && (
            <Badge variant="outline" className="text-[10px]">
              {currentAudio.provider}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <Globe className="w-3 h-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => {
                const langAudio = audioByLanguage[lang];
                const isPrimary = lang === primaryLanguage;
                return (
                  <SelectItem key={lang} value={lang} className="text-xs">
                    <div className="flex items-center justify-between w-full gap-2">
                      <span>{LANGUAGE_NAMES[lang] || lang}</span>
                      <div className="flex items-center gap-1">
                        {isPrimary && (
                          <Badge variant="secondary" className="text-[9px] px-1">
                            Primary
                          </Badge>
                        )}
                        {langAudio?.status === 'complete' && (
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                        )}
                        {langAudio?.status === 'generating' && (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        )}
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Confidence Score */}
      {currentAudio?.confidenceScore !== undefined && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Quality Score:</span>
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all", getConfidenceColor(currentAudio.confidenceScore))}
              style={{ width: `${currentAudio.confidenceScore}%` }}
            />
          </div>
          <span className={cn(
            "text-xs font-medium",
            currentAudio.confidenceScore >= 95 ? "text-green-600" :
            currentAudio.confidenceScore >= 80 ? "text-yellow-600" : "text-red-600"
          )}>
            {currentAudio.confidenceScore}%
          </span>
        </div>
      )}

      {/* Player Controls */}
      {currentAudio?.status === 'generating' ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
          <span className="text-sm text-muted-foreground">
            Generating {LANGUAGE_NAMES[selectedLanguage] || selectedLanguage} audio...
          </span>
        </div>
      ) : audioSrc ? (
        <div className="space-y-2">
          {/* Progress Bar */}
          <div 
            className="h-2 bg-muted rounded-full cursor-pointer overflow-hidden"
            onClick={handleSeek}
          >
            <div 
              className="h-full bg-primary transition-all"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <span className="text-xs text-muted-foreground">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {onRegenerateLanguage && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                >
                  {isRegenerating ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <RotateCcw className="w-3 h-3 mr-1" />
                  )}
                  Regenerate
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={handleDownload}
              >
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-6 text-muted-foreground">
          <Volume2 className="w-6 h-6 mr-2 opacity-50" />
          <span className="text-sm">No audio generated for {LANGUAGE_NAMES[selectedLanguage] || selectedLanguage}</span>
        </div>
      )}

      {/* Language Quick Stats */}
      <div className="flex flex-wrap gap-1 pt-2 border-t">
        {languages.map((lang) => {
          const langAudio = audioByLanguage[lang];
          const isPrimary = lang === primaryLanguage;
          const isSelected = lang === selectedLanguage;
          
          return (
            <Badge
              key={lang}
              variant={isSelected ? 'default' : 'outline'}
              className={cn(
                "text-[10px] cursor-pointer transition-colors",
                isPrimary && !isSelected && "border-primary/50"
              )}
              onClick={() => setSelectedLanguage(lang)}
            >
              {LANGUAGE_NAMES[lang]?.split(' ')[0] || lang}
              {langAudio?.status === 'complete' && (
                <CheckCircle2 className="w-2 h-2 ml-1 text-green-500" />
              )}
            </Badge>
          );
        })}
      </div>
    </div>
  );
};

export default MultiLanguageAudioPlayer;
