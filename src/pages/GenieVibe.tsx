/**
 * Genie Vibe - Standalone Recording & Voice Studio
 * "Voice Your Vision" - Recording studio and TTS generation
 * 
 * RESPONSIVE ARCHITECTURE:
 * - Desktop: Full studio with tabs, TTS generator, audio library, music
 * - Mobile: Streamlined recording-first with bottom nav, quick clips, timeline
 * 
 * DATA FLOW: Uses existing hooks - all data is user-scoped via RLS
 */

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { 
  ArrowLeft, 
  Mic, 
  Headphones, 
  Music,
  Download,
  Upload,
  Loader2,
  Volume2,
  Video,
  FileText,
  Save,
  Smartphone,
  Monitor,
  Camera,
  ScreenShare,
  Scissors,
  Sparkles,
  Film,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useTTSGeneration, OPENAI_VOICES, ELEVENLABS_VOICES } from '@/components/document-processing/RecordingStudio/hooks/useTTSGeneration';
import { useGenieScripts } from '@/components/genie-studio/useGenieScripts';
import { useGenieMediaLibrary } from '@/components/genie-studio/useGenieMediaLibrary';
import { SavedAudioCard } from '@/components/genie-studio/SavedAudioCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileRecordingView } from '@/components/document-processing/RecordingStudio/components/MobileRecordingView';
import { QuickClipsGenerator, MultiClipTimeline, ScriptStitcher } from '@/components/mobile';
import type { TimelineClip } from '@/components/mobile/MultiClipTimeline';
import type { StitchedResult } from '@/components/mobile/ScriptStitcher';
import genieVibeLogo from '@/assets/logos/genie-vibe-combined.png';

const GenieVibe: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const voiceoverUploadRef = useRef<HTMLInputElement>(null);
  
  // View mode: 'desktop' or 'mobile' - auto-detect based on device
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>(isMobile ? 'mobile' : 'desktop');
  
  // Existing hooks - data flow unchanged
  const { scripts: savedScripts, updateScript } = useGenieScripts();
  const { voiceovers, instrumentalMusic, ttsFiles, refresh: refreshMedia } = useGenieMediaLibrary();
  
  // TTS state
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'elevenlabs'>('elevenlabs');
  const [selectedVoice, setSelectedVoice] = useState('CwhRBWXzGAHq8TQ4Fs17'); // Default to ElevenLabs Roger
  const [voiceText, setVoiceText] = useState('');
  const [speed, setSpeed] = useState([1.0]);
  const [activeTab, setActiveTab] = useState('video'); // Default to video recording tab
  
  const { generate, isGenerating, lastResult } = useTTSGeneration();
  
  // Get voices for current provider and ensure default voice is valid
  const currentVoices = selectedProvider === 'openai' ? OPENAI_VOICES : ELEVENLABS_VOICES;
  
  // Update selected voice when provider changes to ensure it's valid
  React.useEffect(() => {
    const voiceExists = currentVoices.some(v => v.value === selectedVoice);
    if (!voiceExists && currentVoices.length > 0) {
      setSelectedVoice(currentVoices[0].value);
    }
  }, [selectedProvider, currentVoices, selectedVoice]);

  // Combine voiceovers and TTS for display
  const allAudio = [...voiceovers, ...ttsFiles];

  // Timeline state for desktop
  const [timelineClips, setTimelineClips] = useState<TimelineClip[]>([]);
  const [recordings, setRecordings] = useState<Array<{ id: string; url: string; type: string; duration: number }>>([]);

  // Scripts formatted for components
  const scriptsForMobile = savedScripts.map(s => ({
    id: s.id,
    title: s.name,
    content: s.enhancedContent || s.content || ''
  }));

  // Music formatted for components
  const musicForMobile = instrumentalMusic.map(m => ({
    id: m.id,
    name: m.name,
    url: m.url
  }));

  // Handle stitch completion
  const handleStitchComplete = (result: StitchedResult) => {
    toast.success(`Stitched ${result.segments.length} scripts (${Math.round(result.totalDuration)}s total)`);
    setActiveTab('timeline');
  };

  // Handle clips change
  const handleClipsChange = (clips: TimelineClip[]) => {
    setTimelineClips(clips);
  };

  const handleGenerateTTS = async () => {
    if (!voiceText.trim()) {
      toast.error('Please enter some text to convert');
      return;
    }

    const result = await generate({
      text: voiceText,
      provider: selectedProvider,
      voice: selectedVoice,
      speed: speed[0],
    });

    if (result) {
      toast.success('Voice generated successfully!');
      refreshMedia();
    }
  };

  const handleSaveTTS = () => {
    if (lastResult?.audioUrl) {
      toast.success('Voiceover saved to library!');
      refreshMedia();
    }
  };

  const handleUploadVoiceover = (file: File) => {
    toast.success(`"${file.name}" uploaded`);
    refreshMedia();
  };

  // Scripts ready for voice
  const scriptsNeedingVoice = savedScripts.filter(s => (s.enhancedContent || s.content) && !s.hasVoiceover);

  // Use a variable to check mode to avoid TypeScript narrowing issues
  const showMobileView = viewMode === 'mobile';

  // ============================================================
  // MOBILE VIEW - Streamlined recording-first experience
  // ============================================================
  if (showMobileView) {
    return (
      <MobileRecordingView
        isOpen={true}
        onClose={() => navigate('/genie-studio')}
        scripts={scriptsForMobile}
        music={musicForMobile}
        onSwitchToDesktop={() => setViewMode('desktop')}
        onRecordingComplete={(result) => {
          console.log('Recording complete:', result);
          refreshMedia();
        }}
      />
    );
  }

  // ============================================================
  // DESKTOP VIEW - Full studio with all features
  // ============================================================
  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-pink-950/10">
        {/* Hero Header */}
        <div className="relative overflow-hidden border-b border-border/50 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-violet-500/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-500/20 via-transparent to-transparent" />
          
          <div className="relative max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/genie-studio')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Studio
                </Button>
                
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-white/90 backdrop-blur border border-pink-200/50 flex items-center justify-center shadow-lg overflow-hidden p-2">
                    <img src={genieVibeLogo} alt="Genie Vibe" className="h-full w-full object-contain" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                      Genie Vibe
                    </h1>
                    <p className="text-sm text-muted-foreground">Recording & Voice Studio • Voice Your Vision</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-1"
                  >
                    <Monitor className="h-4 w-4" />
                    <span className="hidden sm:inline">Desktop</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1"
                    onClick={() => setViewMode('mobile')}
                  >
                    <Smartphone className="h-4 w-4" />
                    <span className="hidden sm:inline">Mobile</span>
                  </Button>
                </div>

                <Badge className="bg-pink-500/10 text-pink-600 border-pink-500/20">
                  {allAudio.length} Voiceovers
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-muted/50 border border-border/50 flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="video" className="gap-2">
                <Video className="h-4 w-4" />
                Record
              </TabsTrigger>
              <TabsTrigger value="clips" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Quick Clips
              </TabsTrigger>
              <TabsTrigger value="stitch" className="gap-2">
                <Scissors className="h-4 w-4" />
                Stitch
              </TabsTrigger>
              <TabsTrigger value="timeline" className="gap-2">
                <Layers className="h-4 w-4" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="tts" className="gap-2">
                <Mic className="h-4 w-4" />
                AI Voice
              </TabsTrigger>
              <TabsTrigger value="scripts" className="gap-2">
                <FileText className="h-4 w-4" />
                Scripts ({scriptsNeedingVoice.length})
              </TabsTrigger>
              <TabsTrigger value="library" className="gap-2">
                <Headphones className="h-4 w-4" />
                Audio
              </TabsTrigger>
              <TabsTrigger value="music" className="gap-2">
                <Music className="h-4 w-4" />
                Music
              </TabsTrigger>
            </TabsList>

            {/* Video Recording Tab */}
            <TabsContent value="video" className="space-y-6">
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                        <Video className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">Video Recording Studio</h2>
                        <p className="text-sm text-muted-foreground">Record camera, screen, or both</p>
                      </div>
                    </div>
                    <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
                      HD Recording
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <Card className="border-2 border-dashed hover:border-primary transition-colors cursor-pointer p-6 text-center">
                      <Camera className="h-10 w-10 mx-auto mb-3 text-blue-500" />
                      <h3 className="font-semibold">Camera</h3>
                      <p className="text-xs text-muted-foreground">Record from webcam</p>
                    </Card>
                    <Card className="border-2 border-dashed hover:border-primary transition-colors cursor-pointer p-6 text-center">
                      <ScreenShare className="h-10 w-10 mx-auto mb-3 text-green-500" />
                      <h3 className="font-semibold">Screen</h3>
                      <p className="text-xs text-muted-foreground">Record screen activity</p>
                    </Card>
                    <Card className="border-2 border-dashed hover:border-primary transition-colors cursor-pointer p-6 text-center">
                      <div className="flex justify-center gap-1 mb-3">
                        <Camera className="h-8 w-8 text-purple-500" />
                        <ScreenShare className="h-8 w-8 text-purple-500" />
                      </div>
                      <h3 className="font-semibold">Both</h3>
                      <p className="text-xs text-muted-foreground">Camera + Screen overlay</p>
                    </Card>
                  </div>

                  {/* Recording Preview Area */}
                  <div className="aspect-video bg-black rounded-lg flex items-center justify-center mb-6 relative overflow-hidden">
                    <div className="text-center">
                      <Video className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground">Select a recording mode above to start</p>
                    </div>
                  </div>

                  {/* Recording Controls */}
                  <div className="flex justify-center gap-4">
                    <Button size="lg" className="gap-2 bg-red-500 hover:bg-red-600 text-white px-8">
                      <div className="h-3 w-3 rounded-full bg-white animate-pulse" />
                      Start Recording
                    </Button>
                  </div>

                  {/* Script Teleprompter Option */}
                  {scriptsNeedingVoice.length > 0 && (
                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">Use Script as Teleprompter</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {scriptsNeedingVoice.length} scripts available to guide your recording
                      </p>
                      <Button variant="outline" size="sm">
                        Select Script
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Quick Clips Tab */}
            <TabsContent value="clips" className="space-y-6">
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <QuickClipsGenerator 
                    onClipGenerated={(clip) => {
                      toast.success(`Generated clip: ${clip.suggestion.title}`);
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Script Stitch Tab */}
            <TabsContent value="stitch" className="space-y-6">
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <ScriptStitcher
                    availableScripts={scriptsForMobile}
                    availableMusic={musicForMobile}
                    onExport={handleStitchComplete}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="space-y-6">
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <MultiClipTimeline
                    clips={timelineClips}
                    onClipsChange={handleClipsChange}
                    onExport={(format) => {
                      toast.info(`Exporting ${timelineClips.length} clips as ${format}...`);
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* TTS Generator Tab */}
            <TabsContent value="tts" className="space-y-6">
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

                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <Label>Voice Provider</Label>
                      <Select value={selectedProvider} onValueChange={(v: 'openai' | 'elevenlabs') => setSelectedProvider(v)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="elevenlabs">ElevenLabs (Premium Quality)</SelectItem>
                          <SelectItem value="openai">OpenAI TTS (Fast)</SelectItem>
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
                          {currentVoices.map(voice => (
                            <SelectItem key={voice.value} value={voice.value}>
                              {voice.label} - {voice.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mb-6">
                    <Label>Speed: {speed[0].toFixed(1)}x</Label>
                    <Slider
                      value={speed}
                      onValueChange={setSpeed}
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>

                  <div className="mb-6">
                    <Label>Text to Convert</Label>
                    <Textarea
                      value={voiceText}
                      onChange={(e) => setVoiceText(e.target.value)}
                      placeholder="Enter the text you want to convert to speech..."
                      className="mt-1 min-h-[150px]"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {voiceText.length} characters
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleGenerateTTS}
                      disabled={isGenerating || !voiceText.trim()}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4 mr-2" />
                          Generate Voice
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Audio Preview */}
                  {lastResult?.audioUrl && (
                    <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center">
                          <Headphones className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-green-700">Voice Generated!</p>
                          <audio src={lastResult.audioUrl} controls className="w-full mt-2" />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={handleSaveTTS}>
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <a href={lastResult.audioUrl} download="voiceover.mp3">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upload Section */}
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Upload className="h-5 w-5 text-purple-500" />
                      Upload Voiceover
                    </h3>
                  </div>
                  <input
                    ref={voiceoverUploadRef}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadVoiceover(file);
                      if (voiceoverUploadRef.current) voiceoverUploadRef.current.value = '';
                    }}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => voiceoverUploadRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Audio File (MP3, WAV, etc.)
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Scripts Tab */}
            <TabsContent value="scripts" className="space-y-6">
              {scriptsNeedingVoice.length === 0 ? (
                <Card className="border-dashed border-2 border-purple-500/30 bg-purple-500/5">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <FileText className="h-12 w-12 text-purple-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Scripts Pending Voice</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Create scripts in Genie Spark or Genie Mind to add voiceovers.
                    </p>
                    <Button onClick={() => navigate('/genie-spark')}>
                      Go to Genie Spark
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {scriptsNeedingVoice.map(script => (
                    <Card key={script.id} className="hover:border-purple-500/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {script.type === 'video' ? (
                            <Video className="h-4 w-4 text-red-500" />
                          ) : (
                            <Mic className="h-4 w-4 text-purple-500" />
                          )}
                          <span className="font-medium truncate">{script.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {(script.enhancedContent || script.content).slice(0, 100)}...
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {script.stats?.wordCount || 0} words
                          </span>
                          <Button 
                            size="sm"
                            onClick={() => {
                              setVoiceText(script.cleanContent || script.enhancedContent || script.content);
                              setActiveTab('tts');
                              toast.success(`Loaded "${script.name}"`);
                            }}
                          >
                            <Volume2 className="h-3 w-3 mr-1" />
                            Add Voice
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Audio Library Tab */}
            <TabsContent value="library" className="space-y-6">
              {allAudio.length === 0 ? (
                <Card className="border-dashed border-2 border-pink-500/30 bg-pink-500/5">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Headphones className="h-12 w-12 text-pink-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Audio Yet</h3>
                    <p className="text-muted-foreground text-center">
                      Generate or upload voiceovers to see them here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allAudio.map(audio => (
                    <SavedAudioCard
                      key={audio.id}
                      audio={{
                        id: audio.id,
                        name: audio.name,
                        url: audio.url || '',
                        timestamp: audio.timestamp
                      }}
                      onDelete={() => toast.info('Refresh to update list')}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Music Tab */}
            <TabsContent value="music" className="space-y-6">
              {instrumentalMusic.length === 0 ? (
                <Card className="border-dashed border-2 border-amber-500/30 bg-amber-500/5">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Music className="h-12 w-12 text-amber-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Music Yet</h3>
                    <p className="text-muted-foreground text-center">
                      Upload background music tracks to use in your productions.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {instrumentalMusic.map(track => (
                    <Card key={track.id} className="hover:border-amber-500/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                            <Music className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{track.name}</p>
                            {track.url && <audio src={track.url} controls className="w-full mt-2 h-8" />}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

      </div>
    </AppLayout>
  );
};

export default GenieVibe;
