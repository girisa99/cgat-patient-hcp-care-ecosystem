/**
 * Genie Studio - Professional Media Production Hub
 * Unified dashboard for video recording, voice generation, and content creation
 * Competitor to Loom, Descript, Synthesia
 */

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Video, 
  Mic, 
  FileText, 
  Play, 
  Sparkles, 
  Wand2,
  Library,
  Clock,
  Zap,
  Music,
  Download,
  Share2,
  Layers,
  Film,
  Headphones,
  PenTool,
  Cpu,
  Globe,
  TrendingUp,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RecordingStudio } from '@/components/document-processing/RecordingStudio';
import { toast } from 'sonner';

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

// Feature cards for the dashboard
const FEATURES = [
  {
    id: 'record',
    title: 'Record Video',
    description: 'Camera, screen, or both with AI teleprompter',
    icon: Video,
    color: 'from-red-500 to-orange-500',
    badge: 'Popular',
    stats: { label: 'Quick Start', value: '< 10s' }
  },
  {
    id: 'voice',
    title: 'AI Voice Generator',
    description: 'Ultra-realistic voices with ElevenLabs & OpenAI',
    icon: Mic,
    color: 'from-purple-500 to-pink-500',
    badge: 'AI Powered',
    stats: { label: 'Voice Styles', value: '50+' }
  },
  {
    id: 'script',
    title: 'Script Editor',
    description: 'Write & enhance scripts with AI assistance',
    icon: PenTool,
    color: 'from-blue-500 to-cyan-500',
    badge: null,
    stats: { label: 'AI Enhanced', value: 'Yes' }
  },
  {
    id: 'music',
    title: 'AI Music Studio',
    description: 'Generate background music & soundscapes',
    icon: Music,
    color: 'from-green-500 to-emerald-500',
    badge: 'New',
    stats: { label: 'Genres', value: '25+' }
  }
];

// Competitive advantages
const ADVANTAGES = [
  { icon: Zap, text: 'Real-time background blur with ML' },
  { icon: Cpu, text: 'Multi-model AI routing' },
  { icon: Globe, text: 'Enterprise-grade security' },
  { icon: Layers, text: 'Integrated with your workflow' },
  { icon: Film, text: 'Professional quality exports' },
  { icon: Headphones, text: 'Studio-grade audio processing' }
];

// Custom hook to load media from localStorage (same logic as removed sections)
function useMediaLibrary() {
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [audios, setAudios] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMedia = () => {
    setIsLoading(true);
    try {
      // Load videos from localStorage (from VideoRecorder)
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

      // Load generated audios metadata
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
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  
  // Load real media from localStorage
  const { videos, audios, isLoading, loadMedia, deleteMedia } = useMediaLibrary();

  // Refresh library when studio closes
  const handleStudioClose = () => {
    setIsStudioOpen(false);
    loadMedia(); // Refresh to pick up new recordings
  };

  const handleFeatureClick = (featureId: string) => {
    setSelectedFeature(featureId);
    setIsStudioOpen(true);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'record':
        setIsStudioOpen(true);
        break;
      case 'library':
        setActiveTab('library');
        break;
      default:
        break;
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
                    onClick={() => handleQuickAction('record')}
                    className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg shadow-red-500/25 transition-all hover:scale-105"
                  >
                    <Video className="h-5 w-5 mr-2" />
                    Start Recording
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => handleQuickAction('library')}
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
                  { label: 'Videos Created', value: '12', icon: Film, trend: '+3 this week' },
                  { label: 'Voiceovers', value: '28', icon: Mic, trend: '+5 this week' },
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
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-background">
                <Layers className="h-4 w-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="library" className="data-[state=active]:bg-background">
                <Library className="h-4 w-4 mr-2" />
                Library
              </TabsTrigger>
              <TabsTrigger value="templates" className="data-[state=active]:bg-background">
                <FileText className="h-4 w-4 mr-2" />
                Templates
              </TabsTrigger>
            </TabsList>

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
                        <Button variant="ghost" size="sm">
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
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Play className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Share2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Why Genie Studio */}
                <div>
                  <Card className="border-border/50 bg-gradient-to-br from-card/80 to-primary/5 backdrop-blur">
                    <CardContent className="p-6">
                      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Why Genie Studio?
                      </h2>
                      <div className="space-y-3">
                        {ADVANTAGES.map((adv, i) => (
                          <div key={i} className="flex items-center gap-3 text-sm">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <adv.icon className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-muted-foreground">{adv.text}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 pt-4 border-t border-border/50">
                        <p className="text-xs text-muted-foreground mb-3">
                          Compared to Loom, Descript, Synthesia
                        </p>
                        <div className="flex gap-2">
                          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                            Better AI
                          </Badge>
                          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                            Integrated
                          </Badge>
                          <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                            Secure
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

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
                      <Button variant="outline" className="mt-4" onClick={() => setIsStudioOpen(true)}>
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

            <TabsContent value="templates" className="mt-0">
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-12 text-center">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Script Templates</h3>
                  <p className="text-muted-foreground mb-6">
                    Pre-built templates for demos, tutorials, and presentations
                  </p>
                  <Button variant="outline">
                    <Wand2 className="h-4 w-4 mr-2" />
                    Browse Templates
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Recording Studio Modal */}
        <RecordingStudio
          isOpen={isStudioOpen}
          onClose={handleStudioClose}
          scripts={[
            { id: 'video-script', title: 'Video Script', content: '' },
            { id: 'voiceover-script', title: 'Voiceover Script', content: '' }
          ]}
          voiceovers={[]}
          music={[]}
        />
      </div>
    </AppLayout>
  );
}
