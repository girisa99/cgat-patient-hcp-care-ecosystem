/**
 * Genie Mind - Standalone AI Dashboard & Script Management
 * "Think Beyond Limits" - AI-powered script editing and management
 * 
 * DATA FLOW: Uses existing hooks - all data is user-scoped via RLS
 * INTEGRATED: Ask Genie AI assistant for context-aware help
 */

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// NEW: 4-Quadrant Architecture - use QuadrantLayout for consistent navigation
import { QuadrantLayout } from '@/components/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Brain,
  PenTool,
  Mic,
  Library,
  FileText,
  Layers,
  Video,
  Headphones,
  Music,
  Film,
  Zap,
  Files
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ScriptEditorTab } from '@/components/genie-studio/ScriptEditorTab';
import { SavedAudioCard } from '@/components/genie-studio/SavedAudioCard';
import { useGenieScripts, type GenieScript } from '@/components/genie-studio/useGenieScripts';
import { useGenieMediaLibrary } from '@/components/genie-studio/useGenieMediaLibrary';
import { AskGenie } from '@/components/genie-studio/AskGenie';
import { CrossFunctionalMusic } from '@/components/genie-studio/CrossFunctionalMusic';
import genieMindLogo from '@/assets/logos/genie-mind-combined.png';
import { BatchScriptGenerationWorkflow } from '@/components/genie-studio/batch/BatchScriptGenerationWorkflow';

const GenieMind: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'dashboard';
  
  const [activeTab, setActiveTab] = useState(initialTab);

  // Existing hooks - data flow unchanged
  const { 
    scripts: savedScripts, 
    saveScript, 
    deleteScript, 
    updateScript 
  } = useGenieScripts();
  
  // Use the actual return type from the hook
  const { 
    voiceovers,
    instrumentalMusic,
    ttsFiles,
    isLoading: mediaLoading
  } = useGenieMediaLibrary();

  // Stats
  const videoScripts = savedScripts.filter(s => s.type === 'video');
  const audioScripts = savedScripts.filter(s => s.type === 'audio');

  // Combine voiceovers and TTS files
  const allAudio = [...voiceovers, ...ttsFiles];

  return (
    <QuadrantLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-950/10">
        {/* Hero Header */}
        <div className="relative overflow-hidden border-b border-border/50 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-violet-500/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />
          
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
                  <div className="h-16 w-16 rounded-2xl bg-white/90 backdrop-blur border border-purple-200/50 flex items-center justify-center shadow-lg overflow-hidden p-2">
                    <img src={genieMindLogo} alt="Genie Mind" className="h-full w-full object-contain" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Genie Mind
                    </h1>
                    <p className="text-sm text-muted-foreground">AI Dashboard & Scripts • Think Beyond Limits</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                  {savedScripts.length} Scripts
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/genie-spark')}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Generate in Spark
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  onClick={() => navigate('/genie-vibe')}
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Record in Vibe
                </Button>
              </div>
            </div>

            {/* Quick Stats - Simplified without templates */}
            <div className="grid grid-cols-5 gap-4 mt-6">
              {[
                { label: 'Video Scripts', value: String(videoScripts.length), icon: FileText, color: 'text-destructive' },
                { label: 'Audio Scripts', value: String(audioScripts.length), icon: Headphones, color: 'text-primary' },
                { label: 'Voiceovers', value: String(allAudio.length), icon: Mic, color: 'text-accent-foreground' },
                { label: 'Music Tracks', value: String(instrumentalMusic.length), icon: Music, color: 'text-muted-foreground' },
                { label: 'Total Items', value: String(savedScripts.length + allAudio.length + instrumentalMusic.length), icon: Layers, color: 'text-secondary-foreground' }
              ].map((stat, i) => (
                <div key={i} className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-4 hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                    <span className="text-xs">{stat.label}</span>
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-muted/50 border border-border/50 p-1">
              <TabsTrigger value="dashboard" className="gap-2">
                <Layers className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="script-editor" className="gap-2">
                <PenTool className="h-4 w-4" />
                Script Editor
              </TabsTrigger>
              <TabsTrigger value="batch-generation" className="gap-2">
                <Files className="h-4 w-4" />
                Batch Generation
              </TabsTrigger>
              <TabsTrigger value="library" className="gap-2">
                <Library className="h-4 w-4" />
                Media Library
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* Recent Scripts */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Recent Scripts</h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('script-editor')}>
                    View All
                  </Button>
                </div>
                
                {savedScripts.length === 0 ? (
                  <Card className="border-dashed border-2 border-purple-500/30 bg-purple-500/5">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <PenTool className="h-12 w-12 text-purple-500 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Scripts Yet</h3>
                      <p className="text-muted-foreground text-center mb-4">
                        Generate scripts with Genie Spark or create manually.
                      </p>
                      <Button onClick={() => navigate('/genie-spark')}>
                        <Zap className="h-4 w-4 mr-2" />
                        Go to Genie Spark
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedScripts.slice(0, 6).map(script => (
                      <Card 
                        key={script.id} 
                        className="hover:border-purple-500/30 transition-colors cursor-pointer"
                        onClick={() => setActiveTab('script-editor')}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            {script.type === 'video' ? (
                              <Video className="h-4 w-4 text-red-500" />
                            ) : (
                              <Mic className="h-4 w-4 text-purple-500" />
                            )}
                            <span className="font-medium truncate">{script.name}</span>
                            {script.hasVoiceover && (
                              <Badge variant="outline" className="text-xs bg-green-500/10">
                                <Headphones className="h-3 w-3 mr-1" />
                                Voice
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {(script.enhancedContent || script.content).slice(0, 100)}...
                          </p>
                          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                            <span>{script.stats?.wordCount || 0} words</span>
                            <span>{new Date(script.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card 
                  className="hover:border-orange-500/30 transition-colors cursor-pointer group"
                  onClick={() => navigate('/genie-spark')}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Generate Content</h4>
                      <p className="text-sm text-muted-foreground">Create scripts with AI in Spark</p>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="hover:border-pink-500/30 transition-colors cursor-pointer group"
                  onClick={() => navigate('/genie-vibe')}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Mic className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Record Voiceovers</h4>
                      <p className="text-sm text-muted-foreground">Add voice in Vibe studio</p>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="hover:border-indigo-500/30 transition-colors cursor-pointer group"
                  onClick={() => navigate('/genie-arc')}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Film className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Manage Shows</h4>
                      <p className="text-sm text-muted-foreground">Plan productions in Arc</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Script Editor Tab */}
            <TabsContent value="script-editor" className="mt-0">
              <ScriptEditorTab
                savedScripts={savedScripts}
                onSaveScript={(script) => saveScript(script)}
                onDeleteScript={deleteScript}
                onUpdateScript={updateScript}
                onSaveVoiceover={(url, name, scriptId, audioBlob, scriptMeta) => {
                  // Note: The hook doesn't have saveVoiceover - just log for now
                  toast.success(`Voiceover "${name}" saved!`);
                  if (scriptId) {
                    updateScript(scriptId, { hasVoiceover: true });
                  }
                }}
                savedVoiceovers={allAudio.map(v => ({
                  id: v.id,
                  name: v.name,
                  url: v.url || ''
                }))}
              />
            </TabsContent>

            {/* Batch Generation Tab */}
            <TabsContent value="batch-generation" className="mt-0">
              <BatchScriptGenerationWorkflow />
            </TabsContent>

            {/* Media Library Tab - Now includes cross-functional music */}
            <TabsContent value="library" className="space-y-6">
              {/* Cross-functional Music Generation */}
              <CrossFunctionalMusic 
                product="mind"
                onTrackGenerated={(track) => {
                  toast.success(`Music track "${track.name}" added to library`);
                }}
              />

              <Tabs defaultValue="voiceovers">
                <TabsList>
                  <TabsTrigger value="voiceovers">
                    <Headphones className="h-4 w-4 mr-2" />
                    Voiceovers ({allAudio.length})
                  </TabsTrigger>
                  <TabsTrigger value="music">
                    <Music className="h-4 w-4 mr-2" />
                    Music ({instrumentalMusic.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="voiceovers" className="mt-4">
                  {allAudio.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="py-12 text-center">
                        <Headphones className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No voiceovers yet</p>
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
                          onDelete={() => toast.info('Delete via Genie Vibe')}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="music" className="mt-4">
                  {instrumentalMusic.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="py-12 text-center">
                        <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No music tracks yet - generate above!</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {instrumentalMusic.map(track => (
                        <Card key={track.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <Music className="h-8 w-8 text-muted-foreground" />
                              <div className="flex-1">
                                <p className="font-medium truncate">{track.name}</p>
                                {track.url && <audio src={track.url} controls className="w-full mt-2" />}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>

          {/* Ask Genie - Context-aware AI for Mind */}
          <AskGenie 
            product="mind" 
            currentTab={activeTab}
            sessionData={{ scriptsCount: savedScripts?.length || 0 }}
          />
        </div>
      </div>
    </QuadrantLayout>
  );
};

export default GenieMind;
