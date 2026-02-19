/**
 * Label Studio Ecosystem Widget
 * Floating widget for quick LS actions across all Genie Suite features
 * Responsive design for desktop, tablet, and mobile
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Braces,
  Camera,
  Mic,
  Video,
  FileText,
  Sparkles,
  Upload,
  Trash2,
  ChevronUp,
  ChevronDown,
  Brain,
  Wand2,
  Music,
  Scissors,
  MessageSquare,
  TrendingUp,
  X,
  Settings,
  Database,
  Layers,
  CheckCircle2,
  Circle,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useLSUniversalOptional, type LSTrainingType, type LSTrainingData } from './LSUniversalProvider';
import { toast } from 'sonner';

// Feature categories for the widget
const LS_FEATURE_CATEGORIES = {
  script: {
    label: 'Script & Content',
    icon: FileText,
    types: ['script_quality', 'script_enhancement', 'content_generation'] as LSTrainingType[],
    color: 'text-blue-400',
  },
  video: {
    label: 'Video & Visual',
    icon: Video,
    types: ['video_trimming', 'scene_detection', 'background_segmentation', 'avatar_quality'] as LSTrainingType[],
    color: 'text-purple-400',
  },
  audio: {
    label: 'Audio & Voice',
    icon: Mic,
    types: ['audio_quality', 'voice_emotion', 'tts_quality', 'voice_cloning', 'transcription_accuracy'] as LSTrainingType[],
    color: 'text-green-400',
  },
  editing: {
    label: 'Editing & Production',
    icon: Scissors,
    types: ['clip_ranking', 'auto_edit', 'transition_quality', 'music_sync'] as LSTrainingType[],
    color: 'text-orange-400',
  },
  intelligence: {
    label: 'AI Intelligence',
    icon: Brain,
    types: ['content_tagging', 'competitive_analysis', 'thumbnail_quality', 'genie_response_quality', 'suggestion_relevance'] as LSTrainingType[],
    color: 'text-pink-400',
  },
};

// Competitive differentiators
const DIFFERENTIATORS = [
  { id: 'rlhf', label: 'RLHF Training', icon: Brain, description: 'Human feedback loop for AI improvement' },
  { id: 'active_learning', label: 'Active Learning', icon: TrendingUp, description: 'Prioritize uncertain samples' },
  { id: 'multimodal', label: 'Multi-Modal', icon: Layers, description: 'Script + Audio + Video unified' },
  { id: 'realtime', label: 'Real-Time Capture', icon: Camera, description: 'Capture during workflow' },
  { id: 'auto_label', label: 'Auto Pre-Labeling', icon: Wand2, description: 'AI-assisted annotations' },
];

interface LSEcosystemWidgetProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'inline';
  defaultExpanded?: boolean;
  showDifferentiators?: boolean;
  className?: string;
}

export const LSEcosystemWidget: React.FC<LSEcosystemWidgetProps> = ({
  position = 'bottom-right',
  defaultExpanded = false,
  showDifferentiators = true,
  className,
}) => {
  const ls = useLSUniversalOptional();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeTab, setActiveTab] = useState('capture');
  const [selectedData, setSelectedData] = useState<Set<string>>(new Set());
  
  // If LS provider is not available, show minimal UI
  if (!ls) {
    return null;
  }

  const { 
    isEnabled, 
    isCapturing, 
    capturedData, 
    enableLS, 
    disableLS, 
    bulkUpload, 
    clearCaptured,
    loadProjects,
    projects,
  } = ls;

  // Group captured data by category
  const groupedData = useMemo(() => {
    const groups: Record<string, LSTrainingData[]> = {};
    capturedData.forEach(data => {
      for (const [key, category] of Object.entries(LS_FEATURE_CATEGORIES)) {
        if (category.types.includes(data.type)) {
          if (!groups[key]) groups[key] = [];
          groups[key].push(data);
          break;
        }
      }
    });
    return groups;
  }, [capturedData]);

  const totalCaptured = capturedData.length;
  const selectedCount = selectedData.size;

  const handleSelectAll = useCallback(() => {
    if (selectedData.size === capturedData.length) {
      setSelectedData(new Set());
    } else {
      setSelectedData(new Set(capturedData.map(d => d.id)));
    }
  }, [capturedData, selectedData]);

  const handleUploadSelected = useCallback(async () => {
    if (selectedData.size === 0 || projects.length === 0) {
      toast.error('Select data and ensure projects are loaded');
      return;
    }
    // For now, upload to first project - in production, would show project picker
    await bulkUpload(Array.from(selectedData), projects[0].id);
    setSelectedData(new Set());
  }, [selectedData, projects, bulkUpload]);

  // Position classes
  const positionClasses = {
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
    'top-right': 'fixed top-4 right-4 z-50',
    'top-left': 'fixed top-4 left-4 z-50',
    'inline': 'relative',
  };

  return (
    <motion.div
      className={cn(positionClasses[position], className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={cn(
        'shadow-xl border-2 transition-all duration-300 overflow-hidden',
        isEnabled ? 'border-violet-500/50' : 'border-muted',
        isExpanded ? 'w-80 md:w-96' : 'w-auto'
      )}>
        {/* Header - Always visible */}
        <CardHeader 
          className="p-3 cursor-pointer flex flex-row items-center justify-between gap-2"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
              isEnabled ? 'bg-violet-500/20 text-violet-400' : 'bg-muted text-muted-foreground'
            )}>
              <Database className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">Label Studio</span>
              {!isExpanded && (
                <span className="text-[10px] text-muted-foreground">
                  {totalCaptured} captured
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isCapturing && (
              <Badge variant="secondary" className="text-[10px] animate-pulse bg-green-500/20 text-green-400">
                Capturing
              </Badge>
            )}
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="p-3 pt-0 space-y-3">
                {/* Enable/Disable Toggle */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <Label className="text-xs font-medium">Training Mode</Label>
                  <Switch 
                    checked={isEnabled} 
                    onCheckedChange={(checked) => checked ? enableLS() : disableLS()}
                  />
                </div>

                {isEnabled && (
                  <>
                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid grid-cols-3 h-8">
                        <TabsTrigger value="capture" className="text-xs">
                          Captured ({totalCaptured})
                        </TabsTrigger>
                        <TabsTrigger value="features" className="text-xs">
                          Features
                        </TabsTrigger>
                        <TabsTrigger value="stats" className="text-xs">
                          Stats
                        </TabsTrigger>
                      </TabsList>

                      {/* Captured Data Tab */}
                      <TabsContent value="capture" className="mt-2 space-y-2">
                        {totalCaptured === 0 ? (
                          <div className="text-center py-6 text-muted-foreground text-xs">
                            <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No training data captured yet</p>
                            <p className="text-[10px] mt-1">Use the studio features to capture data</p>
                          </div>
                        ) : (
                          <>
                            {/* Selection Actions */}
                            <div className="flex items-center justify-between gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 text-xs"
                                onClick={handleSelectAll}
                              >
                                {selectedCount === totalCaptured ? 'Deselect All' : 'Select All'}
                              </Button>
                              <div className="flex gap-1">
                                <Button 
                                  variant="default" 
                                  size="sm" 
                                  className="h-7 text-xs"
                                  disabled={selectedCount === 0}
                                  onClick={handleUploadSelected}
                                >
                                  <Upload className="h-3 w-3 mr-1" />
                                  Upload ({selectedCount})
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 text-xs text-destructive"
                                  onClick={clearCaptured}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Grouped Data */}
                            <ScrollArea className="h-48">
                              <div className="space-y-2">
                                {Object.entries(groupedData).map(([categoryKey, items]) => {
                                  const category = LS_FEATURE_CATEGORIES[categoryKey as keyof typeof LS_FEATURE_CATEGORIES];
                                  const Icon = category.icon;
                                  return (
                                    <div key={categoryKey} className="space-y-1">
                                      <div className={cn('flex items-center gap-1 text-xs font-medium', category.color)}>
                                        <Icon className="h-3 w-3" />
                                        <span>{category.label}</span>
                                        <Badge variant="secondary" className="text-[10px] h-4">
                                          {items.length}
                                        </Badge>
                                      </div>
                                      {items.slice(0, 3).map(item => (
                                        <div 
                                          key={item.id}
                                          className={cn(
                                            'flex items-center gap-2 p-2 rounded-md bg-muted/30 cursor-pointer transition-colors',
                                            selectedData.has(item.id) && 'bg-violet-500/20 border border-violet-500/50'
                                          )}
                                          onClick={() => {
                                            const newSet = new Set(selectedData);
                                            if (newSet.has(item.id)) {
                                              newSet.delete(item.id);
                                            } else {
                                              newSet.add(item.id);
                                            }
                                            setSelectedData(newSet);
                                          }}
                                        >
                                          {selectedData.has(item.id) ? (
                                            <CheckCircle2 className="h-3 w-3 text-violet-400" />
                                          ) : (
                                            <Circle className="h-3 w-3 text-muted-foreground" />
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <p className="text-[10px] truncate">{item.type}</p>
                                            <p className="text-[9px] text-muted-foreground">
                                              {item.platform} • {item.source}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                      {items.length > 3 && (
                                        <p className="text-[10px] text-muted-foreground text-center">
                                          +{items.length - 3} more
                                        </p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </ScrollArea>
                          </>
                        )}
                      </TabsContent>

                      {/* Features Tab */}
                      <TabsContent value="features" className="mt-2">
                        <ScrollArea className="h-48">
                          <div className="space-y-2">
                            {Object.entries(LS_FEATURE_CATEGORIES).map(([key, category]) => {
                              const Icon = category.icon;
                              return (
                                <div 
                                  key={key}
                                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/30"
                                >
                                  <div className={cn('w-6 h-6 rounded flex items-center justify-center bg-muted', category.color)}>
                                    <Icon className="h-3 w-3" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-xs font-medium">{category.label}</p>
                                    <p className="text-[10px] text-muted-foreground">
                                      {category.types.length} training types
                                    </p>
                                  </div>
                                  <Badge variant="outline" className="text-[10px]">
                                    Active
                                  </Badge>
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      </TabsContent>

                      {/* Stats Tab */}
                      <TabsContent value="stats" className="mt-2">
                        <div className="space-y-3">
                          {showDifferentiators && (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">
                                Competitive Differentiators
                              </p>
                              {DIFFERENTIATORS.map(diff => {
                                const Icon = diff.icon;
                                return (
                                  <div 
                                    key={diff.id}
                                    className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-violet-500/10 to-transparent border border-violet-500/20"
                                  >
                                    <Icon className="h-4 w-4 text-violet-400" />
                                    <div className="flex-1">
                                      <p className="text-xs font-medium">{diff.label}</p>
                                      <p className="text-[10px] text-muted-foreground">{diff.description}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          
                          {/* Session Stats */}
                          <div className="p-2 rounded-lg bg-muted/30 space-y-2">
                            <p className="text-xs font-medium">Session Stats</p>
                            <div className="grid grid-cols-2 gap-2 text-center">
                              <div className="p-2 rounded bg-muted/50">
                                <p className="text-lg font-bold text-violet-400">{totalCaptured}</p>
                                <p className="text-[10px] text-muted-foreground">Captured</p>
                              </div>
                              <div className="p-2 rounded bg-muted/50">
                                <p className="text-lg font-bold text-green-400">{projects.length}</p>
                                <p className="text-[10px] text-muted-foreground">Projects</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Load Projects Button */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full h-7 text-xs"
                      onClick={loadProjects}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Sync with Label Studio
                    </Button>
                  </>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default LSEcosystemWidget;
