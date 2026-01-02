/**
 * Genie Studio - Professional Media Production Hub
 * Unified dashboard for video recording, voice generation, and content creation
 */

import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Video, 
  Mic, 
  FileText, 
  Play, 
  Pause,
  Sparkles, 
  Wand2,
  Library,
  Clock,
  Zap,
  Music,
  Download,
  Trash2,
  Layers,
  Film,
  Headphones,
  PenTool,
  Cpu,
  TrendingUp,
  Loader2,
  Volume2,
  Copy,
  Plus,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RecordingStudio } from '@/components/document-processing/RecordingStudio';
import { toast } from 'sonner';
import { useTTSGeneration, OPENAI_VOICES, ELEVENLABS_VOICES } from '@/components/document-processing/RecordingStudio/hooks/useTTSGeneration';
import { supabase } from '@/integrations/supabase/client';

// Types for media items
interface MediaItem {
  id: string;
  name: string;
  type: 'video' | 'audio';
  url?: string;
  timestamp: number;
  duration?: number;
  size?: number;
}

// Script Templates
const SCRIPT_TEMPLATES = [
  {
    id: 'product-demo',
    name: 'Product Demo',
    description: 'Showcase your product features',
    category: 'Marketing',
    content: `Welcome to [Product Name]! 

Today, I'll walk you through the key features that make our solution stand out.

First, let's look at [Feature 1]. This allows you to [benefit 1], saving you time and effort.

Next, [Feature 2] enables [benefit 2]. Watch how easy it is to [action].

Finally, [Feature 3] gives you [benefit 3], ensuring you get the most value.

Ready to get started? Click the link below to try it free today!`
  },
  {
    id: 'tutorial',
    name: 'Tutorial / How-To',
    description: 'Step-by-step educational content',
    category: 'Education',
    content: `Hey everyone! In this tutorial, I'll show you how to [topic].

By the end of this video, you'll be able to [outcome].

Let's dive in!

Step 1: [First action]
Start by [detailed instruction]. This is important because [reason].

Step 2: [Second action]
Now, [detailed instruction]. You'll notice that [observation].

Step 3: [Third action]
Finally, [detailed instruction]. And that's it!

If you found this helpful, don't forget to subscribe for more tutorials!`
  },
  {
    id: 'announcement',
    name: 'Announcement',
    description: 'Share news or updates',
    category: 'Corporate',
    content: `We're excited to announce [news/update]!

After [timeframe/effort], we're proud to share that [details].

This means [impact/benefit] for our [customers/team/community].

Here's what you need to know:
• [Key point 1]
• [Key point 2]  
• [Key point 3]

[Next steps or call to action]

Thank you for your continued support!`
  },
  {
    id: 'explainer',
    name: 'Explainer Video',
    description: 'Explain complex topics simply',
    category: 'Education',
    content: `Have you ever wondered how [topic] works?

Let me break it down for you in simple terms.

[Topic] is essentially [simple definition].

Think of it like [analogy]. When you [action], it [result].

The key thing to understand is [core concept].

This is important because [reason/impact].

Now you know the basics of [topic]! Have questions? Drop them in the comments.`
  },
  {
    id: 'testimonial',
    name: 'Customer Testimonial',
    description: 'Share customer success stories',
    category: 'Marketing',
    content: `Before using [Product/Service], I was struggling with [problem].

I tried [previous solutions] but nothing worked.

Then I discovered [Product/Service] and everything changed.

Within [timeframe], I was able to [achievement].

The best part? [Favorite feature or benefit].

I highly recommend [Product/Service] to anyone dealing with [problem].

It's been a game-changer for my [business/life/workflow].`
  },
  {
    id: 'podcast-intro',
    name: 'Podcast Introduction',
    description: 'Welcome listeners to your show',
    category: 'Entertainment',
    content: `Welcome to [Podcast Name]! I'm your host, [Name].

Today's episode is all about [topic].

We've got [guest name or content preview] joining us to discuss [specific angle].

Before we dive in, a quick reminder to subscribe and leave a review if you're enjoying the show.

Alright, let's get into it!`
  }
];

// Music genres with prompts
const MUSIC_GENRES = [
  { id: 'corporate', name: 'Corporate', prompt: 'Professional corporate background music, clean and modern, suitable for business presentations', color: 'blue' },
  { id: 'upbeat', name: 'Upbeat', prompt: 'Upbeat and energetic music, positive vibes, perfect for promotional content', color: 'orange' },
  { id: 'cinematic', name: 'Cinematic', prompt: 'Epic cinematic orchestral music with emotional depth, movie trailer style', color: 'purple' },
  { id: 'ambient', name: 'Ambient', prompt: 'Calm ambient soundscape, peaceful and relaxing, meditation style', color: 'green' },
  { id: 'motivational', name: 'Motivational', prompt: 'Inspiring motivational music with building energy, workout or achievement style', color: 'red' },
  { id: 'lofi', name: 'Lo-Fi', prompt: 'Chill lo-fi hip hop beats, relaxed and nostalgic, study music vibe', color: 'pink' },
  { id: 'electronic', name: 'Electronic', prompt: 'Modern electronic music with synths and beats, tech and innovation feel', color: 'cyan' },
  { id: 'acoustic', name: 'Acoustic', prompt: 'Warm acoustic guitar melody, natural and organic, coffeehouse atmosphere', color: 'amber' }
];

// Feature cards for the dashboard
const FEATURES = [
  {
    id: 'record',
    title: 'Record Video',
    description: 'Camera, screen, or both with AI teleprompter',
    icon: Video,
    color: 'from-red-500 to-orange-500',
    badge: 'Popular',
    stats: { label: 'Quick Start', value: '< 10s' },
    tab: 'record'
  },
  {
    id: 'voice',
    title: 'AI Voice Generator',
    description: 'Ultra-realistic voices with ElevenLabs & OpenAI',
    icon: Mic,
    color: 'from-purple-500 to-pink-500',
    badge: 'AI Powered',
    stats: { label: 'Voice Styles', value: '50+' },
    tab: 'voice'
  },
  {
    id: 'script',
    title: 'Script Editor',
    description: 'Write & enhance scripts with AI assistance',
    icon: PenTool,
    color: 'from-blue-500 to-cyan-500',
    badge: null,
    stats: { label: 'AI Enhanced', value: 'Yes' },
    tab: 'script'
  },
  {
    id: 'music',
    title: 'AI Music Studio',
    description: 'Generate background music & soundscapes',
    icon: Music,
    color: 'from-green-500 to-emerald-500',
    badge: 'New',
    stats: { label: 'Genres', value: '25+' },
    tab: 'music'
  }
];

// Quick Tips for Users
const QUICK_TIPS = [
  { icon: Zap, title: 'Script First', text: 'Start with a script to keep your recording focused and professional' },
  { icon: Mic, title: 'Preview Voice', text: 'Use TTS preview to hear how your script sounds before recording' },
  { icon: Cpu, title: 'AI Enhancement', text: 'Let AI suggest improvements for clarity and engagement' },
  { icon: Headphones, title: 'Background Audio', text: 'Add background music to enhance your video mood' },
  { icon: Film, title: 'Quick Export', text: 'Export in multiple formats optimized for different platforms' },
  { icon: Layers, title: 'Templates', text: 'Use templates for consistent branding across all content' }
];

// Custom hook to load media from localStorage
function useMediaLibrary() {
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [audios, setAudios] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMedia = () => {
    setIsLoading(true);
    try {
      const savedMedia = localStorage.getItem('recordedMedia');
      if (savedMedia) {
        const allMedia = JSON.parse(savedMedia);
        setVideos(allMedia.filter((m: any) => m.type === 'video').map((v: any, i: number) => ({
          id: v.id || `video-${i}`,
          name: v.name || `Video ${i + 1}`,
          type: 'video' as const,
          url: v.url,
          timestamp: v.timestamp || Date.now(),
          duration: v.duration,
          size: v.size
        })));
        
        const audioItems = allMedia.filter((m: any) => m.type === 'audio').map((a: any, i: number) => ({
          id: a.id || `audio-${i}`,
          name: a.name || `Audio ${i + 1}`,
          type: 'audio' as const,
          url: a.url,
          timestamp: a.timestamp || Date.now(),
          duration: a.duration,
          size: a.size
        }));
        setAudios(audioItems);
      }

      const generatedAudios = localStorage.getItem('generatedAudiosMetadata');
      if (generatedAudios) {
        const generated = JSON.parse(generatedAudios);
        const generatedItems: MediaItem[] = generated.map((a: any, i: number) => ({
          id: a.id || `gen-audio-${i}`,
          name: a.title || a.name || 'Generated Audio',
          type: 'audio' as const,
          url: a.audioUrl || a.url,
          timestamp: a.generatedAt ? new Date(a.generatedAt).getTime() : Date.now()
        }));
        setAudios(prev => [...prev, ...generatedItems]);
      }
    } catch (e) {
      console.error('Failed to load media library:', e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const deleteMedia = (id: string, type: 'video' | 'audio') => {
    try {
      const savedMedia = localStorage.getItem('recordedMedia');
      if (savedMedia) {
        const allMedia = JSON.parse(savedMedia);
        const filtered = allMedia.filter((m: any) => m.id !== id);
        localStorage.setItem('recordedMedia', JSON.stringify(filtered));
      }
      
      if (type === 'video') {
        setVideos(prev => prev.filter(v => v.id !== id));
      } else {
        setAudios(prev => prev.filter(a => a.id !== id));
      }
      toast.success(`${type === 'video' ? 'Video' : 'Audio'} deleted`);
    } catch (e) {
      toast.error('Failed to delete media');
    }
  };

  return { videos, audios, isLoading, loadMedia, deleteMedia };
}

export default function GenieStudio() {
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Script Editor State
  const [scriptContent, setScriptContent] = useState('');
  const [scriptName, setScriptName] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  // Voice Generator State
  const [voiceText, setVoiceText] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'elevenlabs'>('elevenlabs');
  const [selectedVoice, setSelectedVoice] = useState('');
  
  // Music Studio State
  const [musicPrompt, setMusicPrompt] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [generatedMusicUrl, setGeneratedMusicUrl] = useState<string | null>(null);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // TTS Hook
  const { 
    isGenerating: isTTSGenerating, 
    lastResult: ttsResult, 
    generate: generateTTS, 
    play: playTTS, 
    stop: stopTTS,
    download: downloadTTS 
  } = useTTSGeneration();
  
  // Load real media from localStorage
  const { videos, audios, isLoading, loadMedia, deleteMedia } = useMediaLibrary();

  // Set default voice when provider changes
  useEffect(() => {
    if (selectedProvider === 'openai') {
      setSelectedVoice(OPENAI_VOICES[0].value);
    } else {
      setSelectedVoice(ELEVENLABS_VOICES[0].value);
    }
  }, [selectedProvider]);

  const handleStudioClose = () => {
    setIsStudioOpen(false);
    loadMedia();
  };

  const handleFeatureClick = (featureId: string) => {
    if (featureId === 'record') {
      setIsStudioOpen(true);
    } else if (featureId === 'voice') {
      setActiveTab('voice-generator');
    } else if (featureId === 'script') {
      setActiveTab('script-editor');
    } else if (featureId === 'music') {
      setActiveTab('music-studio');
    }
  };

  // Script Editor Functions
  const calculateReadingTime = (text: string) => {
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 150); // Average speaking pace
    return { words, minutes };
  };

  const handleNewScript = () => {
    setScriptContent('');
    setScriptName('');
    toast.success('Ready for a new script!');
  };

  const handleEnhanceScript = async () => {
    if (!scriptContent.trim()) {
      toast.error('Please write some content first');
      return;
    }
    
    setIsEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhance-script', {
        body: { scriptContent, mode: 'enhance' }
      });
      
      if (error) throw error;
      
      if (data?.enhancedScript) {
        setScriptContent(data.enhancedScript);
        toast.success('Script enhanced with AI!');
      }
    } catch (err) {
      console.error('Enhancement error:', err);
      toast.error('Failed to enhance script');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleScriptTTSPreview = async () => {
    if (!scriptContent.trim()) {
      toast.error('Please write some content first');
      return;
    }
    
    // Use first 500 chars for preview
    const previewText = scriptContent.slice(0, 500);
    const result = await generateTTS({
      provider: selectedProvider,
      voice: selectedVoice || (selectedProvider === 'openai' ? 'alloy' : 'EXAVITQu4vr4xnSDxMaL'),
      text: previewText
    });
    
    if (result) {
      playTTS();
    }
  };

  const handleLoadTemplate = (template: typeof SCRIPT_TEMPLATES[0]) => {
    setScriptContent(template.content);
    setScriptName(template.name);
    setActiveTab('script-editor');
    toast.success(`Loaded "${template.name}" template`);
  };

  // Voice Generator Functions
  const handleGenerateVoice = async () => {
    if (!voiceText.trim()) {
      toast.error('Please enter text to generate');
      return;
    }
    
    const result = await generateTTS({
      provider: selectedProvider,
      voice: selectedVoice,
      text: voiceText
    });
    
    if (result) {
      playTTS();
    }
  };

  // Music Studio Functions
  const handleGenreSelect = (genre: typeof MUSIC_GENRES[0]) => {
    setSelectedGenre(genre.id);
    setMusicPrompt(genre.prompt);
  };

  const handleGenerateMusic = async () => {
    if (!musicPrompt.trim()) {
      toast.error('Please describe the music you want');
      return;
    }
    
    setIsGeneratingMusic(true);
    try {
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
            prompt: musicPrompt,
            duration: 30
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Music generation failed');
      }

      const data = await response.json();
      
      // Use data URI for proper base64 audio decoding
      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      setGeneratedMusicUrl(audioUrl);
      
      // Play automatically
      if (musicAudioRef.current) {
        musicAudioRef.current.src = audioUrl;
        musicAudioRef.current.play();
      }
      
      toast.success('Music generated!');
    } catch (err) {
      console.error('Music generation error:', err);
      toast.error('Failed to generate music. Make sure ELEVENLABS_API_KEY is configured.');
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  // Combine videos and audios for recent projects display
  const recentProjects = [...videos, ...audios]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5)
    .map(item => ({
      id: item.id,
      name: item.name,
      type: item.type,
      duration: item.duration ? `${Math.floor(item.duration / 60)}:${String(item.duration % 60).padStart(2, '0')}` : '--:--',
      lastEdited: getRelativeTime(item.timestamp),
      thumbnail: item.type === 'video' ? '🎬' : '🎙️',
      url: item.url
    }));

  function getRelativeTime(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  }

  const { words, minutes } = calculateReadingTime(scriptContent);

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Hero Header */}
        <div className="relative overflow-hidden border-b border-border/50">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5" />
          <div className="relative px-6 py-8 md:py-12">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
                        Genie Studio
                      </h1>
                      <p className="text-muted-foreground">
                        Professional media production powered by AI
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3">
                  <Button 
                    size="lg" 
                    onClick={() => setIsStudioOpen(true)}
                    className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg shadow-red-500/25 transition-all hover:scale-105"
                  >
                    <Video className="h-5 w-5 mr-2" />
                    Start Recording
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => setActiveTab('library')}
                    className="border-border/50 hover:bg-muted/50"
                  >
                    <Library className="h-5 w-5 mr-2" />
                    My Library
                  </Button>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Videos Created', value: String(videos.length), icon: Film, trend: 'Recorded' },
                  { label: 'Voiceovers', value: String(audios.length), icon: Mic, trend: 'Generated' },
                  { label: 'Total Duration', value: '2.5h', icon: Clock, trend: 'Saved' },
                  { label: 'AI Credits Used', value: '847', icon: Zap, trend: '153 left' }
                ].map((stat, i) => (
                  <div key={i} className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-4 hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <stat.icon className="h-4 w-4" />
                      <span className="text-xs">{stat.label}</span>
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.trend}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="bg-muted/50 border border-border/50 p-1">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Layers className="h-4 w-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="script-editor" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <PenTool className="h-4 w-4 mr-2" />
                Script Editor
              </TabsTrigger>
              <TabsTrigger value="voice-generator" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Mic className="h-4 w-4 mr-2" />
                Voice Generator
              </TabsTrigger>
              <TabsTrigger value="music-studio" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Music className="h-4 w-4 mr-2" />
                Music Studio
              </TabsTrigger>
              <TabsTrigger value="library" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Library className="h-4 w-4 mr-2" />
                Library
              </TabsTrigger>
              <TabsTrigger value="templates" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FileText className="h-4 w-4 mr-2" />
                Templates
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-8 mt-0">
              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {FEATURES.map((feature) => (
                  <Card 
                    key={feature.id}
                    className={cn(
                      "relative overflow-hidden cursor-pointer transition-all duration-300",
                      "hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10",
                      "border-border/50 bg-card/80 backdrop-blur group"
                    )}
                    onClick={() => handleFeatureClick(feature.id)}
                  >
                    <div className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity",
                      "bg-gradient-to-br", feature.color
                    )} style={{ opacity: 0.05 }} />
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn(
                          "h-12 w-12 rounded-xl flex items-center justify-center",
                          "bg-gradient-to-br", feature.color
                        )}>
                          <feature.icon className="h-6 w-6 text-white" />
                        </div>
                        {feature.badge && (
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-xs",
                              feature.badge === 'New' && "bg-green-500/10 text-green-600 border-green-500/20",
                              feature.badge === 'AI Powered' && "bg-purple-500/10 text-purple-600 border-purple-500/20",
                              feature.badge === 'Popular' && "bg-orange-500/10 text-orange-600 border-orange-500/20"
                            )}
                          >
                            {feature.badge}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{feature.stats.label}</span>
                        <span className="font-medium">{feature.stats.value}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Projects */}
                <div className="lg:col-span-2">
                  <Card className="border-border/50 bg-card/80 backdrop-blur">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                          Recent Projects
                        </h2>
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab('library')}>
                          View All
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {recentProjects.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <Film className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No recordings yet</p>
                            <p className="text-sm">Start recording to see your projects here</p>
                          </div>
                        ) : recentProjects.map((project) => (
                          <div 
                            key={project.id}
                            className="flex items-center gap-4 p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all cursor-pointer group"
                          >
                            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                              {project.thumbnail}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{project.name}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2">
                                <Badge variant="outline" className="text-xs capitalize">
                                  {project.type}
                                </Badge>
                                <span>•</span>
                                <span>{project.duration}</span>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground whitespace-nowrap">
                              {project.lastEdited}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Tips */}
                <div>
                  <Card className="border-border/50 bg-gradient-to-br from-card/80 to-primary/5 backdrop-blur">
                    <CardContent className="p-6">
                      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Quick Tips
                      </h2>
                      <div className="space-y-3">
                        {QUICK_TIPS.map((tip, i) => (
                          <div key={i} className="flex items-start gap-3 text-sm">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <tip.icon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <span className="font-medium text-foreground">{tip.title}</span>
                              <p className="text-muted-foreground text-xs">{tip.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Script Editor Tab */}
            <TabsContent value="script-editor" className="mt-0 space-y-6">
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <PenTool className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">Script Editor</h2>
                        <p className="text-sm text-muted-foreground">Write and enhance scripts with AI assistance</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleNewScript}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Script
                      </Button>
                      <Button variant="outline" onClick={() => setActiveTab('templates')}>
                        <FileText className="h-4 w-4 mr-2" />
                        Templates
                      </Button>
                    </div>
                  </div>
                  
                  {/* Script Stats */}
                  <div className="grid md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span className="text-xs text-muted-foreground">Words</span>
                      </div>
                      <span className="text-xl font-bold">{words}</span>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="text-xs text-muted-foreground">Reading Time</span>
                      </div>
                      <span className="text-xl font-bold">{minutes} min</span>
                    </div>
                    <div 
                      className="p-4 rounded-lg bg-muted/50 border border-border/50 cursor-pointer hover:border-purple-500/50 transition-colors"
                      onClick={handleEnhanceScript}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Wand2 className="h-4 w-4 text-purple-500" />
                        <span className="text-xs text-muted-foreground">AI Enhance</span>
                      </div>
                      <span className="text-sm font-medium">
                        {isEnhancing ? 'Enhancing...' : 'Click to enhance'}
                      </span>
                    </div>
                    <div 
                      className="p-4 rounded-lg bg-muted/50 border border-border/50 cursor-pointer hover:border-green-500/50 transition-colors"
                      onClick={handleScriptTTSPreview}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Volume2 className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-muted-foreground">TTS Preview</span>
                      </div>
                      <span className="text-sm font-medium">
                        {isTTSGenerating ? 'Generating...' : 'Click to preview'}
                      </span>
                    </div>
                  </div>

                  {/* Script Input */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="script-name">Script Name</Label>
                      <Input 
                        id="script-name"
                        value={scriptName}
                        onChange={(e) => setScriptName(e.target.value)}
                        placeholder="Enter a name for your script..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="script-content">Script Content</Label>
                      <Textarea
                        id="script-content"
                        value={scriptContent}
                        onChange={(e) => setScriptContent(e.target.value)}
                        placeholder="Start writing your script here... Or select a template to get started!"
                        className="mt-1 min-h-[300px] font-mono"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleEnhanceScript}
                        disabled={isEnhancing || !scriptContent.trim()}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      >
                        {isEnhancing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Enhancing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            AI Enhance
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={handleScriptTTSPreview}
                        disabled={isTTSGenerating || !scriptContent.trim()}
                      >
                        {isTTSGenerating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            TTS Preview
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigator.clipboard.writeText(scriptContent)}
                        disabled={!scriptContent.trim()}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Voice Generator Tab */}
            <TabsContent value="voice-generator" className="mt-0 space-y-6">
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Mic className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">AI Voice Generator</h2>
                        <p className="text-sm text-muted-foreground">Create ultra-realistic voiceovers with AI</p>
                      </div>
                    </div>
                    <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                      {selectedProvider === 'openai' ? '6' : '9'}+ Voice Styles
                    </Badge>
                  </div>

                  {/* Provider Selection */}
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <Label>Voice Provider</Label>
                      <Select value={selectedProvider} onValueChange={(v: 'openai' | 'elevenlabs') => setSelectedProvider(v)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="elevenlabs">ElevenLabs (Premium Quality)</SelectItem>
                          <SelectItem value="openai">OpenAI TTS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Voice Style</Label>
                      <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(selectedProvider === 'openai' ? OPENAI_VOICES : ELEVENLABS_VOICES).map(voice => (
                            <SelectItem key={voice.value} value={voice.value}>
                              {voice.label} - {voice.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Voice Preview Cards */}
                  <div className="grid md:grid-cols-4 gap-3 mb-6">
                    {(selectedProvider === 'openai' ? OPENAI_VOICES.slice(0, 4) : ELEVENLABS_VOICES.slice(0, 4)).map((voice) => (
                      <div 
                        key={voice.value} 
                        className={cn(
                          "p-4 rounded-lg border cursor-pointer transition-all",
                          selectedVoice === voice.value 
                            ? "bg-purple-500/10 border-purple-500/50" 
                            : "bg-muted/50 border-border/50 hover:border-purple-500/30"
                        )}
                        onClick={() => setSelectedVoice(voice.value)}
                      >
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3 mx-auto">
                          <Mic className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="font-medium text-center text-sm">{voice.label}</h3>
                        <p className="text-xs text-muted-foreground text-center mt-1">{voice.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Text Input */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="voice-text">Text to Convert</Label>
                      <Textarea
                        id="voice-text"
                        value={voiceText}
                        onChange={(e) => setVoiceText(e.target.value)}
                        placeholder="Enter the text you want to convert to speech..."
                        className="mt-1 min-h-[150px]"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleGenerateVoice}
                        disabled={isTTSGenerating || !voiceText.trim()}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      >
                        {isTTSGenerating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Voice
                          </>
                        )}
                      </Button>
                      {ttsResult && (
                        <>
                          <Button variant="outline" onClick={playTTS}>
                            <Play className="h-4 w-4 mr-2" />
                            Play
                          </Button>
                          <Button variant="outline" onClick={stopTTS}>
                            <Pause className="h-4 w-4 mr-2" />
                            Stop
                          </Button>
                          <Button variant="outline" onClick={() => downloadTTS()}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Result Preview */}
                    {ttsResult && (
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Headphones className="h-5 w-5 text-green-500" />
                          <span className="font-medium text-green-700">Voice Generated!</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Duration:</span>
                            <span className="ml-2 font-medium">{ttsResult.duration.toFixed(1)}s</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Provider:</span>
                            <span className="ml-2 font-medium capitalize">{ttsResult.provider}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Characters:</span>
                            <span className="ml-2 font-medium">{ttsResult.charactersProcessed}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Music Studio Tab */}
            <TabsContent value="music-studio" className="mt-0 space-y-6">
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                        <Music className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">AI Music Studio</h2>
                        <p className="text-sm text-muted-foreground">Generate background music and soundscapes</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                      {MUSIC_GENRES.length} Genres
                    </Badge>
                  </div>

                  {/* Genre Selection */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {MUSIC_GENRES.map((genre) => (
                      <div 
                        key={genre.id} 
                        className={cn(
                          "p-4 rounded-lg border cursor-pointer transition-all text-center",
                          selectedGenre === genre.id 
                            ? "bg-green-500/10 border-green-500/50" 
                            : "bg-muted/50 border-border/50 hover:border-green-500/30"
                        )}
                        onClick={() => handleGenreSelect(genre)}
                      >
                        <Music className="h-6 w-6 text-green-500 mx-auto mb-2" />
                        <span className="font-medium text-sm">{genre.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Music Prompt */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="music-prompt">Describe Your Music</Label>
                      <Textarea
                        id="music-prompt"
                        value={musicPrompt}
                        onChange={(e) => setMusicPrompt(e.target.value)}
                        placeholder="E.g., Upbeat corporate music for product demo, 30 seconds..."
                        className="mt-1 min-h-[100px]"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleGenerateMusic}
                        disabled={isGeneratingMusic || !musicPrompt.trim()}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                      >
                        {isGeneratingMusic ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Music
                          </>
                        )}
                      </Button>
                      {selectedGenre && (
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setSelectedGenre(null);
                            setMusicPrompt('');
                          }}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Clear
                        </Button>
                      )}
                    </div>

                    {/* Audio Player for Generated Music */}
                    {generatedMusicUrl && (
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Music className="h-5 w-5 text-green-500" />
                          <span className="font-medium text-green-700">Music Generated!</span>
                        </div>
                        <audio 
                          ref={musicAudioRef}
                          src={generatedMusicUrl} 
                          controls 
                          className="w-full" 
                        />
                        <div className="flex gap-2 mt-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const a = document.createElement('a');
                              a.href = generatedMusicUrl;
                              a.download = `genie-music-${Date.now()}.mp3`;
                              a.click();
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Library Tab */}
            <TabsContent value="library" className="mt-0 space-y-6">
              {/* Videos Section */}
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Video className="h-5 w-5 text-red-500" />
                    <h2 className="text-lg font-semibold">Video Recordings</h2>
                    <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">
                      {videos.length} Videos
                    </Badge>
                  </div>
                  
                  {videos.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                      <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No videos recorded yet</p>
                      <Button variant="outline" className="mt-4" onClick={() => setIsStudioOpen(true)}>
                        <Video className="h-4 w-4 mr-2" />
                        Record Your First Video
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {videos.map((video) => (
                        <div key={video.id} className="border rounded-lg overflow-hidden bg-card group">
                          {video.url ? (
                            <video 
                              src={video.url} 
                              className="w-full aspect-video object-cover"
                              controls
                            />
                          ) : (
                            <div className="w-full aspect-video bg-muted flex items-center justify-center">
                              <Video className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          <div className="p-3 flex items-center justify-between">
                            <div>
                              <p className="font-medium truncate">{video.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(video.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                              onClick={() => deleteMedia(video.id, 'video')}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Audio Section */}
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Music className="h-5 w-5 text-purple-500" />
                    <h2 className="text-lg font-semibold">Audio & Voiceovers</h2>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30">
                      {audios.length} Audio Files
                    </Badge>
                  </div>
                  
                  {audios.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                      <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No audio files yet</p>
                      <Button variant="outline" className="mt-4" onClick={() => setActiveTab('voice-generator')}>
                        <Mic className="h-4 w-4 mr-2" />
                        Generate Voiceover
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {audios.map((audio) => (
                        <div key={audio.id} className="border rounded-lg p-4 bg-card flex items-center gap-4 group">
                          <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                            <Music className="h-6 w-6 text-purple-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{audio.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(audio.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                          {audio.url && (
                            <audio src={audio.url} controls className="max-w-xs" />
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                            onClick={() => deleteMedia(audio.id, 'audio')}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="mt-0 space-y-6">
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">Script Templates</h2>
                        <p className="text-sm text-muted-foreground">Pre-built templates for demos, tutorials, and presentations</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SCRIPT_TEMPLATES.map((template) => (
                      <Card 
                        key={template.id}
                        className="border-border/50 hover:border-primary/30 transition-all cursor-pointer group"
                        onClick={() => handleLoadTemplate(template)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-white" />
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {template.category}
                            </Badge>
                          </div>
                          <h3 className="font-semibold mb-1">{template.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 italic">
                            "{template.content.slice(0, 100)}..."
                          </p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <PenTool className="h-4 w-4 mr-2" />
                            Use Template
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Recording Studio Modal */}
        {isStudioOpen && (
          <RecordingStudio
            isOpen={isStudioOpen}
            onClose={handleStudioClose}
            scripts={[]}
            voiceovers={[]}
            music={[]}
          />
        )}

        {/* Hidden audio element for music */}
        <audio ref={musicAudioRef} className="hidden" />
      </div>
    </AppLayout>
  );
}
