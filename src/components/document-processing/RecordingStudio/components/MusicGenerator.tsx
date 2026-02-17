/**
 * Music Generator Component - Generate instrumental music using ElevenLabs
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Music, Download, Play, Square } from 'lucide-react';
import { toast } from 'sonner';

interface GeneratedMusic {
  id: string;
  name: string;
  prompt: string;
  duration: number;
  url: string;
  createdAt: Date;
}

interface MusicGeneratorProps {
  onMusicGenerated?: (music: GeneratedMusic) => void;
  onPlayMusic?: (url: string) => void;
  onStopMusic?: () => void;
  isPlaying?: boolean;
}

const DURATION_OPTIONS = [
  { value: '15', label: '15 seconds' },
  { value: '30', label: '30 seconds' },
  { value: '60', label: '1 minute' },
  { value: '120', label: '2 minutes' },
];

const PROMPT_SUGGESTIONS = [
  'Upbeat corporate background music',
  'Calm relaxing piano ambient',
  'Cinematic orchestral epic',
  'Lo-fi hip hop chill beats',
  'Energetic electronic dance',
  'Soft acoustic guitar melody',
  'Inspirational motivational soundtrack',
  'Dark dramatic tension music',
];

export function MusicGenerator({
  onMusicGenerated,
  onPlayMusic,
  onStopMusic,
  isPlaying = false,
}: MusicGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState('30');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMusic, setGeneratedMusic] = useState<GeneratedMusic[]>([]);
  const [selectedMusicId, setSelectedMusicId] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a music description');
      return;
    }

    setIsGenerating(true);
    
    try {
      toast.info('Generating instrumental music...');
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-music`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            prompt,
            duration: parseInt(duration),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Generation failed: ${response.status}`);
      }

      // Edge function returns JSON with base64 audio
      const data = await response.json();
      
      if (!data.audioContent) {
        throw new Error('No audio content received');
      }
      
      // Convert base64 to blob
      const byteCharacters = atob(data.audioContent);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const audioBlob = new Blob([byteArray], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      const newMusic: GeneratedMusic = {
        id: `music-${Date.now()}`,
        name: `🎵 ${prompt.substring(0, 40)}${prompt.length > 40 ? '...' : ''}`,
        prompt,
        duration: data.duration || parseInt(duration),
        url: audioUrl,
        createdAt: new Date(),
      };

      setGeneratedMusic(prev => [newMusic, ...prev]);
      setSelectedMusicId(newMusic.id);
      onMusicGenerated?.(newMusic);
      
      toast.success('Music generated successfully!');
      setPrompt('');
    } catch (error) {
      console.error('Music generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate music');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (music: GeneratedMusic) => {
    const a = document.createElement('a');
    a.href = music.url;
    a.download = `${music.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.mp3`;
    a.click();
    toast.success('Downloading...');
  };

  const handlePlay = (music: GeneratedMusic) => {
    if (selectedMusicId === music.id && isPlaying) {
      onStopMusic?.();
    } else {
      setSelectedMusicId(music.id);
      onPlayMusic?.(music.url);
    }
  };

  return (
    <div className="space-y-3 p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="w-4 h-4 text-primary" />
          Generate Instrumental Music
        </Label>
        <Badge variant="outline" className="text-xs">AI Powered</Badge>
      </div>

      {/* Prompt Input */}
      <div className="space-y-2">
        <Input
          placeholder="Describe the music you want..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isGenerating}
          className="bg-background"
        />
        
        {/* Quick Suggestions */}
        <div className="flex flex-wrap gap-1">
          {PROMPT_SUGGESTIONS.slice(0, 4).map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setPrompt(suggestion)}
              className="text-[10px] px-2 py-0.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Duration & Generate */}
      <div className="flex gap-2">
        <Select value={duration} onValueChange={setDuration} disabled={isGenerating}>
          <SelectTrigger className="w-28 bg-background h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DURATION_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="flex-1 gap-2 h-9"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Music className="w-4 h-4" />
              Generate
            </>
          )}
        </Button>
      </div>

      {/* Generated Music List */}
      {generatedMusic.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-primary/10">
          <Label className="text-xs text-muted-foreground">Generated Music</Label>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {generatedMusic.map((music) => (
              <div
                key={music.id}
                className={`flex items-center gap-2 p-2 rounded-md text-xs transition-colors ${
                  selectedMusicId === music.id ? 'bg-primary/10 border border-primary/30' : 'bg-muted/50'
                }`}
              >
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 shrink-0"
                  onClick={() => handlePlay(music)}
                >
                  {selectedMusicId === music.id && isPlaying ? (
                    <Square className="w-3 h-3" />
                  ) : (
                    <Play className="w-3 h-3" />
                  )}
                </Button>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{music.name}</div>
                  <div className="text-muted-foreground text-[10px]">{music.duration}s</div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 shrink-0"
                  onClick={() => handleDownload(music)}
                >
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
