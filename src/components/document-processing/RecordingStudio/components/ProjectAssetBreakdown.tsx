/**
 * Project Asset Breakdown - Shows all files associated with a project
 */

import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, Mic, Music, Video, Wand2, Download, 
  Clock, HardDrive, DollarSign, ExternalLink
} from 'lucide-react';
import type { MediaProjectAsset } from '../hooks/useMediaProject';

interface ProjectAssetBreakdownProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  assets: MediaProjectAsset[];
  totalCost: number;
}

const ASSET_TYPE_CONFIG: Record<string, { icon: typeof FileText; label: string; color: string }> = {
  script: { icon: FileText, label: 'Script', color: 'bg-blue-500/20 text-blue-600' },
  voiceover: { icon: Mic, label: 'Voiceover', color: 'bg-purple-500/20 text-purple-600' },
  tts: { icon: Wand2, label: 'TTS Audio', color: 'bg-green-500/20 text-green-600' },
  music: { icon: Music, label: 'Music', color: 'bg-orange-500/20 text-orange-600' },
  recording: { icon: Video, label: 'Recording', color: 'bg-red-500/20 text-red-600' },
  enhancement: { icon: Wand2, label: 'Enhanced Script', color: 'bg-cyan-500/20 text-cyan-600' },
  transcription: { icon: FileText, label: 'Transcription', color: 'bg-yellow-500/20 text-yellow-600' },
};

export function ProjectAssetBreakdown({
  isOpen,
  onClose,
  projectName,
  assets,
  totalCost,
}: ProjectAssetBreakdownProps) {
  // Group assets by type
  const groupedAssets = assets.reduce((acc, asset) => {
    const type = asset.asset_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(asset);
    return acc;
  }, {} as Record<string, MediaProjectAsset[]>);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '-';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(4)}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownload = (url: string | null, name: string) => {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[450px] sm:w-[500px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center justify-between">
            <span>Project Assets: {projectName}</span>
            <Badge variant="outline" className="text-xs gap-1">
              <DollarSign className="w-3 h-3" />
              Total: ${totalCost.toFixed(4)}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-4 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold">{assets.length}</p>
                <p className="text-xs text-muted-foreground">Total Assets</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold">{Object.keys(groupedAssets).length}</p>
                <p className="text-xs text-muted-foreground">Asset Types</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold">${totalCost.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Total Cost</p>
              </div>
            </div>

            <Separator />

            {/* Asset Groups */}
            {Object.entries(groupedAssets).map(([type, typeAssets]) => {
              const config = ASSET_TYPE_CONFIG[type] || {
                icon: FileText,
                label: type,
                color: 'bg-gray-500/20 text-gray-600',
              };
              const Icon = config.icon;
              const groupCost = typeAssets.reduce((sum, a) => sum + (a.cost || 0), 0);

              return (
                <div key={type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded ${config.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-sm">{config.label}</span>
                      <Badge variant="secondary" className="text-xs">
                        {typeAssets.length}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatCost(groupCost)}
                    </span>
                  </div>

                  <div className="space-y-1.5 pl-8">
                    {typeAssets.map((asset) => (
                      <div
                        key={asset.id}
                        className="bg-muted/30 rounded-lg p-2.5 text-sm hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{asset.asset_name}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              {asset.duration_seconds && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDuration(asset.duration_seconds)}
                                </span>
                              )}
                              {asset.file_size_bytes && (
                                <span className="flex items-center gap-1">
                                  <HardDrive className="w-3 h-3" />
                                  {formatSize(asset.file_size_bytes)}
                                </span>
                              )}
                              {asset.cost > 0 && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  {formatCost(asset.cost)}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {formatDate(asset.created_at)}
                            </p>
                          </div>
                          
                          <div className="flex gap-1">
                            {asset.asset_url && (
                              <>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={() => handleDownload(asset.asset_url, asset.asset_name)}
                                  title="Download"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={() => window.open(asset.asset_url!, '_blank')}
                                  title="Open in new tab"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {assets.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No assets in this project yet</p>
                <p className="text-xs mt-1">
                  Start recording or generating content to add assets
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
