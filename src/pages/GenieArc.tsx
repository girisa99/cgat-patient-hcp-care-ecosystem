/**
 * Genie Arc - Standalone Show/Project Creation Hub
 * "Script Your Success" - Production planning and show creation
 * 
 * DATA FLOW: Uses existing hooks - all data is user-scoped via RLS
 * INTEGRATED: Ask Genie AI assistant for context-aware help
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Plus, 
  Video, 
  Podcast, 
  Calendar, 
  Briefcase,
  Tv,
  Radio,
  Film,
  Loader2,
  Trash2,
  Play,
  Edit,
  FolderOpen,
  Send
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useShows } from '@/hooks/useShows';
import { toast } from 'sonner';
import { PodcastToVideoConverter } from '@/components/shared';
import { AskGenie } from '@/components/genie-studio/AskGenie';
import { InlineTrainAIFeedback } from '@/components/genie-studio/InlineTrainAIFeedback';
import genieArcLogo from '@/assets/logos/genie-arc-combined.png';
import { AutoPublishScheduler } from '@/components/genie-studio/publishing/AutoPublishScheduler';

const SHOW_TYPES = [
  { value: 'podcast', label: 'Podcast', icon: Podcast, color: 'from-purple-500 to-pink-500' },
  { value: 'video_series', label: 'Video Series', icon: Video, color: 'from-red-500 to-orange-500' },
  { value: 'webinar', label: 'Webinar', icon: Tv, color: 'from-blue-500 to-cyan-500' },
  { value: 'live_stream', label: 'Live Stream', icon: Radio, color: 'from-green-500 to-emerald-500' },
  { value: 'documentary', label: 'Documentary', icon: Film, color: 'from-amber-500 to-yellow-500' },
  { value: 'course', label: 'Course', icon: Calendar, color: 'from-indigo-500 to-violet-500' },
];

const GenieArc: React.FC = () => {
  const navigate = useNavigate();
  const { shows, isLoading, createShow, deleteShow } = useShows();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Form state
  const [newShow, setNewShow] = useState({
    title: '',
    description: '',
    show_type: 'podcast',
    host_name: '',
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateShow = async () => {
    if (!newShow.title.trim()) {
      toast.error('Please enter a show title');
      return;
    }

    setIsCreating(true);
    try {
      await createShow({
        title: newShow.title,
        description: newShow.description,
        show_type: newShow.show_type as any,
        host_name: newShow.host_name,
      });
      toast.success(`"${newShow.title}" created successfully!`);
      setIsCreateDialogOpen(false);
      setNewShow({ title: '', description: '', show_type: 'podcast', host_name: '' });
    } catch (error) {
      toast.error('Failed to create show');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteShow = async (id: string, title: string) => {
    if (confirm(`Delete "${title}"? This cannot be undone.`)) {
      await deleteShow(id);
      toast.success(`"${title}" deleted`);
    }
  };

  const filteredShows = activeTab === 'all' 
    ? shows 
    : shows?.filter(s => s.show_type === activeTab);

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-indigo-950/10">
        {/* Hero Header */}
        <div className="relative overflow-hidden border-b border-border/50 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent" />
          
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
                  <div className="h-16 w-16 rounded-2xl bg-white/90 backdrop-blur border border-indigo-200/50 flex items-center justify-center shadow-lg overflow-hidden p-2">
                    <img src={genieArcLogo} alt="Genie Arc" className="h-full w-full object-contain" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Genie Arc
                    </h1>
                    <p className="text-sm text-muted-foreground">Show & Project Management • Script Your Success</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20">
                  {shows?.length || 0} Shows
                </Badge>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Show
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Main Tabs - Shows + Tools */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-muted/50 border border-border/50">
              <TabsTrigger value="all">All Shows</TabsTrigger>
              {SHOW_TYPES.map(type => (
                <TabsTrigger key={type.value} value={type.value} className="gap-2">
                  <type.icon className="h-4 w-4" />
                  {type.label}
                </TabsTrigger>
              ))}
              <TabsTrigger value="podcast-to-video" className="gap-2">
                <Video className="h-4 w-4" />
                Podcast→Video
              </TabsTrigger>
              <TabsTrigger value="auto-publish" className="gap-2">
                <Send className="h-4 w-4" />
                Auto-Publish
              </TabsTrigger>
            </TabsList>
            
            {/* Shows Tabs Content */}
            <TabsContent value="all" className="mt-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                </div>
              ) : !filteredShows?.length ? (
                <Card className="border-dashed border-2 border-indigo-500/30 bg-indigo-500/5">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
                      <FolderOpen className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Shows Yet</h3>
                    <p className="text-muted-foreground text-center mb-4 max-w-md">
                      Create your first show to start planning episodes, managing scripts, and tracking production.
                    </p>
                    <Button
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Show
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredShows.map(show => {
                    const showType = SHOW_TYPES.find(t => t.value === show.show_type) || SHOW_TYPES[0];
                    return (
                      <Card 
                        key={show.id}
                        className="group hover:shadow-lg hover:border-indigo-500/30 transition-all cursor-pointer"
                        onClick={() => navigate(`/genie-studio/productions?show=${show.id}`)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className={cn(
                              "h-12 w-12 rounded-xl flex items-center justify-center bg-gradient-to-br",
                              showType.color
                            )}>
                              <showType.icon className="h-6 w-6 text-white" />
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {show.current_stage?.replace('_', ' ') || 'Planning'}
                            </Badge>
                          </div>
                          
                          <h3 className="font-semibold text-lg mb-1 group-hover:text-indigo-600 transition-colors">
                            {show.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {show.description || 'No description'}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {show.current_stage || 'Planning'}
                            </span>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/genie-studio/productions?show=${show.id}`);
                                }}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteShow(show.id, show.title);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
            
            {SHOW_TYPES.map(type => (
              <TabsContent key={type.value} value={type.value} className="mt-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                  </div>
                ) : !shows?.filter(s => s.show_type === type.value)?.length ? (
                  <Card className="border-dashed border-2 border-indigo-500/30 bg-indigo-500/5">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
                        <type.icon className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">No {type.label}s Yet</h3>
                      <p className="text-muted-foreground text-center mb-4 max-w-md">
                        Create your first {type.label.toLowerCase()} to get started.
                      </p>
                      <Button
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create {type.label}
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {shows?.filter(s => s.show_type === type.value).map(show => {
                      const showType = SHOW_TYPES.find(t => t.value === show.show_type) || SHOW_TYPES[0];
                      return (
                        <Card 
                          key={show.id}
                          className="group hover:shadow-lg hover:border-indigo-500/30 transition-all cursor-pointer"
                          onClick={() => navigate(`/genie-studio/productions?show=${show.id}`)}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className={cn(
                                "h-12 w-12 rounded-xl flex items-center justify-center bg-gradient-to-br",
                                showType.color
                              )}>
                                <showType.icon className="h-6 w-6 text-white" />
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {show.current_stage?.replace('_', ' ') || 'Planning'}
                              </Badge>
                            </div>
                            
                            <h3 className="font-semibold text-lg mb-1 group-hover:text-indigo-600 transition-colors">
                              {show.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                              {show.description || 'No description'}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {show.current_stage || 'Planning'}
                              </span>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/genie-studio/productions?show=${show.id}`);
                                  }}
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteShow(show.id, show.title);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            ))}
            
            {/* Podcast to Video Converter Tab */}
            <TabsContent value="podcast-to-video" className="mt-6 space-y-4">
              <PodcastToVideoConverter
                onConversionComplete={(result) => {
                  toast.success(`Video conversion complete!`);
                }}
              />
              {/* Feedback after conversion */}
              <InlineTrainAIFeedback
                data={{
                  context: 'podcast_conversion',
                  product: 'arc',
                  metadata: { tab: 'podcast-to-video' }
                }}
                variant="compact"
                showTextFeedback={true}
              />
            </TabsContent>

            {/* Auto-Publish Scheduling Tab */}
            <TabsContent value="auto-publish" className="mt-6">
              <AutoPublishScheduler />
            </TabsContent>
          </Tabs>
        </div>

        {/* Create Show Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                Create New Show
              </DialogTitle>
              <DialogDescription>
                Set up a new show or project to organize your episodes and content.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label>Show Title *</Label>
                <Input
                  value={newShow.title}
                  onChange={(e) => setNewShow({ ...newShow, title: e.target.value })}
                  placeholder="e.g., Tech Talk Weekly"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={newShow.description}
                  onChange={(e) => setNewShow({ ...newShow, description: e.target.value })}
                  placeholder="Brief description of your show..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label>Show Type</Label>
                <Select
                  value={newShow.show_type}
                  onValueChange={(v) => setNewShow({ ...newShow, show_type: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SHOW_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Host Name</Label>
                <Input
                  value={newShow.host_name}
                  onChange={(e) => setNewShow({ ...newShow, host_name: e.target.value })}
                  placeholder="e.g., John Smith"
                  className="mt-1"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateShow}
                disabled={isCreating || !newShow.title.trim()}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Show
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Ask Genie - Context-aware AI for Arc */}
        <AskGenie 
          product="arc" 
          currentTab={activeTab}
          sessionData={{ showCount: shows?.length || 0 }}
        />
      </div>
    </AppLayout>
  );
};

export default GenieArc;
