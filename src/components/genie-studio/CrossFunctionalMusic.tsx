/**
 * CROSS-FUNCTIONAL MUSIC COMPONENT
 * Available in: Mind, Vibe, Deck
 * Provides AI music generation across products
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Music, 
  Play, 
  Pause, 
  Download, 
  Sparkles,
  Clock,
  Wand2,
  Volume2,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { GenieProduct } from '@/constants/genie-products';

interface MusicTrack {
  id: string;
  name: string;
  url?: string;
  duration: number;
  genre: string;
  mood: string;
  createdAt: Date;
}

interface CrossFunctionalMusicProps {
  product: GenieProduct;
  onTrackGenerated?: (track: MusicTrack) => void;
  onTrackSelected?: (track: MusicTrack) => void;
  className?: string;
  compact?: boolean;
}

const MUSIC_GENRES = [
  { value: 'ambient', label: 'Ambient' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'electronic', label: 'Electronic' },
  { value: 'acoustic', label: 'Acoustic' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'classical', label: 'Classical' },
  { value: 'pop', label: 'Pop' },
];

const MUSIC_MOODS = [
  { value: 'uplifting', label: 'Uplifting' },
  { value: 'calm', label: 'Calm' },
  { value: 'energetic', label: 'Energetic' },
  { value: 'dramatic', label: 'Dramatic' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'mysterious', label: 'Mysterious' },
  { value: 'playful', label: 'Playful' },
  { value: 'melancholic', label: 'Melancholic' },
];

export const CrossFunctionalMusic: React.FC<CrossFunctionalMusicProps> = ({
  product,
  onTrackGenerated,
  onTrackSelected,
  className,
  compact = false,
}) => {
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('ambient');
  const [mood, setMood] = useState('calm');
  const [duration, setDuration] = useState([30]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTracks, setGeneratedTracks] = useState<MusicTrack[]>([]);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  const productColors: Record<GenieProduct, string> = {
    mind: 'from-blue-500 to-cyan-500',
    vibe: 'from-purple-500 to-pink-500',
    deck: 'from-purple-500 to-violet-500',
    spark: 'from-amber-500 to-orange-500',
    hub: 'from-emerald-500 to-teal-500',
    arc: 'from-emerald-500 to-teal-500',
    cast: 'from-pink-500 to-rose-500',
    studio: 'from-indigo-500 to-violet-500',
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe the music you want');
      return;
    }

    setIsGenerating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to generate music');
        return;
      }

      // Call the music generation edge function
      const { data, error } = await supabase.functions.invoke('generate-music', {
        body: {
          prompt: prompt.trim(),
          genre,
          mood,
          duration: duration[0],
          product,
        }
      });

      if (error) throw error;

      const trackId = crypto.randomUUID();
      const trackName = `${mood} ${genre} - ${prompt.slice(0, 30)}`;

      const newTrack: MusicTrack = {
        id: trackId,
        name: trackName,
        url: data?.url || undefined,
        duration: duration[0],
        genre,
        mood,
        createdAt: new Date(),
      };

      // Persist to generated_media table
      await supabase.from('generated_media').insert({
        name: trackName,
        file_type: 'audio',
        storage_bucket: 'generated_media',
        storage_path: `audio/${trackId}`,
        file_url: data?.url || null,
        source: 'music-generation',
        metadata: {
          type: 'instrumental',
          genre,
          mood,
          prompt: prompt.trim(),
          duration: duration[0],
          product,
        }
      });

      setGeneratedTracks(prev => [newTrack, ...prev]);
      onTrackGenerated?.(newTrack);
      toast.success('Music generated and saved!');

    } catch (error: any) {
      // If edge function not deployed, generate placeholder and still save
      if (error?.message?.includes('not found') || error?.status === 404) {
        const { data: { user } } = await supabase.auth.getUser();
        const trackId = crypto.randomUUID();
        const trackName = `${mood} ${genre} - ${prompt.slice(0, 30)}`;

        const newTrack: MusicTrack = {
          id: trackId,
          name: trackName,
          duration: duration[0],
          genre,
          mood,
          createdAt: new Date(),
        };

        if (user) {
          await supabase.from('generated_media').insert({
            name: trackName,
            file_type: 'audio',
            storage_bucket: 'generated_media',
            storage_path: `audio/${trackId}`,
            source: 'music-generation',
            metadata: { type: 'instrumental', genre, mood, prompt: prompt.trim(), duration: duration[0], product }
          });
        }

        setGeneratedTracks(prev => [newTrack, ...prev]);
        onTrackGenerated?.(newTrack);
        toast.success('Music request saved! Audio will be generated when the music API is deployed.');
      } else {
        toast.error('Failed to generate music');
        console.error('Music generation error:', error);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlay = (trackId: string) => {
    setPlayingTrackId(prev => prev === trackId ? null : trackId);
  };

  if (compact) {
    return (
      <Card className={cn("border-dashed", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center",
              productColors[product]
            )}>
              <Music className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <Input
                placeholder="Describe the music you need..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="h-8"
              />
            </div>
            <Button 
              size="sm" 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center",
              productColors[product]
            )}>
              <Music className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Music Generation</CardTitle>
              <CardDescription>Create background music for your content</CardDescription>
            </div>
          </div>
          <Badge variant="outline">
            <Sparkles className="h-3 w-3 mr-1" />
            Cross-functional
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Prompt input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Describe your music</label>
          <Input
            placeholder="e.g., Upbeat corporate music for a tech presentation..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        {/* Genre & Mood selectors */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Genre</label>
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MUSIC_GENRES.map(g => (
                  <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Mood</label>
            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MUSIC_MOODS.map(m => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Duration slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Duration</label>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {duration[0]} seconds
            </span>
          </div>
          <Slider
            value={duration}
            onValueChange={setDuration}
            min={15}
            max={120}
            step={5}
          />
        </div>

        {/* Generate button */}
        <Button 
          className="w-full" 
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Generate Music
            </>
          )}
        </Button>

        {/* Generated tracks */}
        {generatedTracks.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <h4 className="text-sm font-medium">Generated Tracks</h4>
            {generatedTracks.map((track) => (
              <div 
                key={track.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => togglePlay(track.id)}
                >
                  {playingTrackId === track.id ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{track.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {track.duration}s • {track.genre} • {track.mood}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => onTrackSelected?.(track)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CrossFunctionalMusic;
