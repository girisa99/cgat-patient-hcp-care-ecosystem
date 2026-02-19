/**
 * Genie Mind - AI Dashboard & Script Management
 * "AI That Understands" - AI-powered script editing and management
 *
 * CONSOLIDATED: Uses QuadrantLayout + QuadrantProductHeader
 * AskGenie is now centralized in QuadrantLayout (removed from here)
 */

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { QuadrantLayout, QuadrantProductHeader } from '@/components/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PenTool,
  Mic,
  Library,
  Video,
  Headphones,
  Music,
  Film,
  Zap,
  Files,
  Layers,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ScriptEditorTab } from '@/components/genie-studio/ScriptEditorTab';
import { SavedAudioCard } from '@/components/genie-studio/SavedAudioCard';
import { useGenieScripts, type GenieScript } from '@/components/genie-studio/useGenieScripts';
import { useGenieMediaLibrary } from '@/components/genie-studio/useGenieMediaLibrary';
import { CrossFunctionalMusic } from '@/components/genie-studio/CrossFunctionalMusic';
import { BatchScriptGenerationWorkflow } from '@/components/genie-studio/batch/BatchScriptGenerationWorkflow';

const GenieMind: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'dashboard';

  const [activeTab, setActiveTab] = useState(initialTab);
  const scriptIdParam = searchParams.get('scriptId');
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(scriptIdParam);

  // C-404 FIX: Sync scriptId from URL when navigating from Spark
  React.useEffect(() => {
    if (scriptIdParam) {
      setSelectedScriptId(scriptIdParam);
    }
  }, [scriptIdParam]);

  // M-010 FIX: Sync tab changes to URL search params
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };

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
      {/* Unified Product Header - replaces redundant hero */}
      <QuadrantProductHeader 
        productId="mind" 
        rightContent={
          <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">
            {savedScripts.length} Scripts
          </Badge>
        }
      />

      {/* Quick Stats Bar */}
      <div className="border-b bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { label: 'Video Scripts', value: String(videoScripts.length), icon: Video, color: 'text-destructive' },
              { label: 'Audio Scripts', value: String(audioScripts.length), icon: Headphones, color: 'text-primary' },
              { label: 'Voiceovers', value: String(allAudio.length), icon: Mic, color: 'text-accent-foreground' },
              { label: 'Music Tracks', value: String(instrumentalMusic.length), icon: Music, color: 'text-muted-foreground' },
              { label: 'Total Items', value: String(savedScripts.length + allAudio.length + instrumentalMusic.length), icon: Layers, color: 'text-secondary-foreground' }
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-2">
                <stat.icon className={cn("h-4 w-4", stat.color)} />
                <span className="text-sm font-medium">{stat.value}</span>
                <span className="text-xs text-muted-foreground hidden lg:inline">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
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
                  <Button variant="ghost" size="sm" onClick={() => handleTabChange('script-editor')}>
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
                        onClick={() => {
                          setSelectedScriptId(script.id);
                          handleTabChange('script-editor');
                        }}
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
                      <p className="text-sm text-muted-foreground">Plan productions in Hub</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Script Editor Tab */}
            <TabsContent value="script-editor" className="mt-0">
              <ScriptEditorTab
                savedScripts={savedScripts}
                initialScriptId={selectedScriptId}
                onSaveScript={(script) => saveScript(script)}
                onDeleteScript={deleteScript}
                onUpdateScript={updateScript}
                onSaveVoiceover={async (url, name, scriptId, audioBlob, scriptMeta) => {
                  try {
                    // Save voiceover metadata to generated_media table
                    const { data: { user } } = await (await import('@/integrations/supabase/client')).supabase.auth.getUser();
                    if (user) {
                      const { error } = await (await import('@/integrations/supabase/client')).supabase
                        .from('generated_media')
                        .insert({
                          user_id: user.id,
                          name,
                          file_type: 'audio',
                          file_url: url,
                          source: 'tts',
                          metadata: {
                            type: 'tts',
                            scriptId,
                            scriptText: scriptMeta?.scriptText,
                            originalScript: scriptMeta?.originalScript,
                            scriptType: scriptMeta?.scriptType
                          }
                        });
                      if (error) throw error;
                    }
                    toast.success(`Voiceover "${name}" saved!`);
                    if (scriptId) {
                      updateScript(scriptId, { hasVoiceover: true });
                    }
                  } catch (err) {
                    console.error('Failed to save voiceover:', err);
                    toast.error('Failed to save voiceover');
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

              {mediaLoading && (
                <div className="flex items-center justify-center py-8 gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Loading media library...</span>
                </div>
              )}

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
                          onDelete={async () => {
                            try {
                              const { supabase: sb } = await import('@/integrations/supabase/client');
                              const { error } = await sb.from('generated_media').delete().eq('id', audio.id);
                              if (error) throw error;
                              toast.success(`Deleted "${audio.name}"`);
                            } catch (err) {
                              console.error('Delete failed:', err);
                              toast.error('Failed to delete audio');
                            }
                          }}
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
                                {track.url && <audio src={track.url} controls className="w-full mt-2" aria-label={`Play ${track.name}`} />}
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
        </div>
        {/* AskGenie removed - now centralized in QuadrantLayout */}
      </QuadrantLayout>
    );
  };

export default GenieMind;
