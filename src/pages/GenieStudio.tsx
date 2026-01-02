/**
 * Genie Studio - Professional Media Production Hub
 * Unified dashboard for video recording, voice generation, and content creation
 * Competitor to Loom, Descript, Synthesia
 */

import React, { useState, Suspense } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Monitor,
  Camera,
  Volume2,
  Music,
  Settings,
  Download,
  Share2,
  Layers,
  Film,
  Headphones,
  PenTool,
  Cpu,
  Globe,
  Users,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RecordingStudio } from '@/components/document-processing/RecordingStudio';

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

// Recent projects mock data
const RECENT_PROJECTS = [
  { id: '1', name: 'Product Demo Video', type: 'video', duration: '3:24', lastEdited: '2 hours ago', thumbnail: '🎬' },
  { id: '2', name: 'Onboarding Voiceover', type: 'audio', duration: '5:12', lastEdited: '1 day ago', thumbnail: '🎙️' },
  { id: '3', name: 'Training Script', type: 'script', duration: '~8 min', lastEdited: '3 days ago', thumbnail: '📝' },
];

export default function GenieStudio() {
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

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
                        {RECENT_PROJECTS.map((project) => (
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

            <TabsContent value="library" className="mt-0">
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-12 text-center">
                  <Library className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Your Media Library</h3>
                  <p className="text-muted-foreground mb-6">
                    All your recordings, voiceovers, and generated content in one place
                  </p>
                  <Button onClick={() => setIsStudioOpen(true)}>
                    <Video className="h-4 w-4 mr-2" />
                    Create Your First Recording
                  </Button>
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
          onClose={() => setIsStudioOpen(false)}
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
