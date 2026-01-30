/**
 * GENERATED ASSETS SIDEBAR
 * 
 * Floating sidebar showing all generated outputs in one place:
 * - Scripts, audio, video, music per chapter
 * - Download/export options
 * - Quick preview
 * - Status at a glance
 */

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  FileText, Volume2, Video, Music, Download, Eye,
  ChevronDown, ChevronRight, Layers, Play, Pause,
  CheckCircle2, Loader2, AlertCircle, X, RefreshCw,
  ExternalLink, Copy, Folder, Clock, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Asset {
  id: string;
  type: 'script' | 'audio' | 'video' | 'music';
  chapterId: string;
  chapterTitle: string;
  chapterIndex: number;
  language: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
  content?: string;
  url?: string;
  base64?: string;
  duration?: number;
  provider?: string;
  createdAt?: Date;
  error?: string;
}

interface GeneratedAssetsSidebarProps {
  projectName: string;
  assets: Asset[];
  languages: string[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPreview: (asset: Asset) => void;
  onDownload: (asset: Asset) => void;
  onRegenerate: (asset: Asset) => void;
  className?: string;
}

export const GeneratedAssetsSidebar: React.FC<GeneratedAssetsSidebarProps> = ({
  projectName,
  assets,
  languages,
  isOpen,
  onOpenChange,
  onPreview,
  onDownload,
  onRegenerate,
  className,
}) => {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<'all' | 'script' | 'audio' | 'video' | 'music'>('all');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  // Group assets by chapter
  const groupedAssets = useMemo(() => {
    const filtered = assets.filter(a => {
      if (filterType !== 'all' && a.type !== filterType) return false;
      if (filterLanguage !== 'all' && a.language !== filterLanguage) return false;
      return true;
    });

    const grouped: Record<string, Asset[]> = {};
    filtered.forEach(asset => {
      const key = `${asset.chapterId}-${asset.chapterIndex}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(asset);
    });
    
    return grouped;
  }, [assets, filterType, filterLanguage]);

  // Stats
  const stats = useMemo(() => {
    const total = assets.length;
    const complete = assets.filter(a => a.status === 'complete').length;
    const generating = assets.filter(a => a.status === 'generating').length;
    const errors = assets.filter(a => a.status === 'error').length;
    const scripts = assets.filter(a => a.type === 'script' && a.status === 'complete').length;
    const audio = assets.filter(a => a.type === 'audio' && a.status === 'complete').length;
    const video = assets.filter(a => a.type === 'video' && a.status === 'complete').length;
    const music = assets.filter(a => a.type === 'music' && a.status === 'complete').length;
    
    return { total, complete, generating, errors, scripts, audio, video, music };
  }, [assets]);

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const getTypeIcon = (type: Asset['type']) => {
    switch (type) {
      case 'script': return <FileText className="w-4 h-4" />;
      case 'audio': return <Volume2 className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'music': return <Music className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: Asset['status']) => {
    switch (status) {
      case 'complete':
        return <Badge variant="outline" className="text-xs bg-green-100 text-green-700">Ready</Badge>;
      case 'generating':
        return <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Generating
        </Badge>;
      case 'error':
        return <Badge variant="destructive" className="text-xs">Error</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Pending</Badge>;
    }
  };

  const playAudio = (asset: Asset) => {
    if (playingAudio === asset.id) {
      setPlayingAudio(null);
      return;
    }
    
    const src = asset.url || (asset.base64 ? `data:audio/mpeg;base64,${asset.base64}` : null);
    if (src) {
      const audio = new Audio(src);
      audio.play();
      setPlayingAudio(asset.id);
      audio.onended = () => setPlayingAudio(null);
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  };

  const downloadAll = () => {
    const completeAssets = assets.filter(a => a.status === 'complete');
    toast.info(`Preparing ${completeAssets.length} assets for download...`);
    // In a real implementation, this would package all assets
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Generated Assets
            </SheetTitle>
            <SheetDescription>
              {projectName} • {stats.complete}/{stats.total} assets ready
            </SheetDescription>
          </SheetHeader>

          {/* Stats Bar */}
          <div className="p-4 bg-muted/30 border-b space-y-3">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-lg font-bold">{stats.scripts}</p>
                <p className="text-xs text-muted-foreground">Scripts</p>
              </div>
              <div>
                <p className="text-lg font-bold">{stats.audio}</p>
                <p className="text-xs text-muted-foreground">Audio</p>
              </div>
              <div>
                <p className="text-lg font-bold">{stats.video}</p>
                <p className="text-xs text-muted-foreground">Video</p>
              </div>
              <div>
                <p className="text-lg font-bold">{stats.music}</p>
                <p className="text-xs text-muted-foreground">Music</p>
              </div>
            </div>
            
            <Progress value={(stats.complete / stats.total) * 100} className="h-2" />
            
            {stats.generating > 0 && (
              <div className="flex items-center gap-2 text-xs text-yellow-600">
                <Loader2 className="w-3 h-3 animate-spin" />
                {stats.generating} asset{stats.generating > 1 ? 's' : ''} generating...
              </div>
            )}
            {stats.errors > 0 && (
              <div className="flex items-center gap-2 text-xs text-red-600">
                <AlertCircle className="w-3 h-3" />
                {stats.errors} error{stats.errors > 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="p-3 border-b flex gap-2 flex-wrap">
            <div className="flex gap-1">
              {(['all', 'script', 'audio', 'video', 'music'] as const).map(type => (
                <Button
                  key={type}
                  size="sm"
                  variant={filterType === type ? 'default' : 'ghost'}
                  className="h-7 text-xs px-2"
                  onClick={() => setFilterType(type)}
                >
                  {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
            {languages.length > 1 && (
              <select
                value={filterLanguage}
                onChange={(e) => setFilterLanguage(e.target.value)}
                className="h-7 text-xs border rounded px-2 bg-background"
              >
                <option value="all">All Languages</option>
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                ))}
              </select>
            )}
          </div>

          {/* Assets List */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {Object.entries(groupedAssets).map(([key, chapterAssets]) => {
                const firstAsset = chapterAssets[0];
                const isExpanded = expandedChapters.has(key);
                
                return (
                  <Collapsible key={key} open={isExpanded} onOpenChange={() => toggleChapter(key)}>
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                          <Badge variant="secondary" className="text-xs">
                            Ch. {firstAsset.chapterIndex + 1}
                          </Badge>
                          <span className="font-medium text-sm truncate max-w-[200px]">
                            {firstAsset.chapterTitle}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {chapterAssets.filter(a => a.status === 'complete').length}/{chapterAssets.length}
                        </Badge>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="mt-2 ml-6 space-y-2">
                        {chapterAssets.map(asset => (
                          <div
                            key={asset.id}
                            className="flex items-center justify-between p-2 border rounded bg-card text-sm"
                          >
                            <div className="flex items-center gap-2">
                              {getTypeIcon(asset.type)}
                              <span className="capitalize">{asset.type}</span>
                              {asset.language !== languages[0] && (
                                <Badge variant="outline" className="text-[10px]">
                                  {asset.language.toUpperCase()}
                                </Badge>
                              )}
                              {getStatusBadge(asset.status)}
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {asset.status === 'complete' && (
                                <>
                                  {asset.type === 'script' && asset.content && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0"
                                      onClick={() => copyToClipboard(asset.content!)}
                                    >
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                  )}
                                  {(asset.type === 'audio' || asset.type === 'music') && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0"
                                      onClick={() => playAudio(asset)}
                                    >
                                      {playingAudio === asset.id ? (
                                        <Pause className="w-3 h-3" />
                                      ) : (
                                        <Play className="w-3 h-3" />
                                      )}
                                    </Button>
                                  )}
                                  {asset.url && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0"
                                      onClick={() => onPreview(asset)}
                                    >
                                      <Eye className="w-3 h-3" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={() => onDownload(asset)}
                                  >
                                    <Download className="w-3 h-3" />
                                  </Button>
                                </>
                              )}
                              {asset.status === 'error' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-red-500"
                                  onClick={() => onRegenerate(asset)}
                                >
                                  <RefreshCw className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}

              {Object.keys(groupedAssets).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Folder className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No assets match your filters</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="p-4 border-t space-y-2">
            <Button
              className="w-full"
              onClick={downloadAll}
              disabled={stats.complete === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Download All ({stats.complete} assets)
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              <Clock className="w-3 h-3 inline mr-1" />
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Trigger button component for easy integration
export const GeneratedAssetsTrigger: React.FC<{
  assetCount: number;
  completeCount: number;
  onClick: () => void;
}> = ({ assetCount, completeCount, onClick }) => (
  <Button
    variant="outline"
    onClick={onClick}
    className="fixed bottom-4 right-4 z-50 shadow-lg gap-2"
  >
    <Layers className="w-4 h-4" />
    Assets
    <Badge variant="secondary" className="ml-1">
      {completeCount}/{assetCount}
    </Badge>
  </Button>
);

export default GeneratedAssetsSidebar;
