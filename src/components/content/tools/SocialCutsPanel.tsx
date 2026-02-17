/**
 * Social Cuts Panel
 * Auto-cut content for different social platforms
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Scissors, 
  Play,
  Download,
  RefreshCw,
  Clock,
  Zap,
  TrendingUp,
  Check
} from 'lucide-react';
import { socialCutsService, type SocialPlatform, type SocialCut, type HookSegment } from '@/services/socialCutsService';
import { toast } from 'sonner';

interface SocialCutsPanelProps {
  contentId?: string;
  videoUrl?: string;
  videoDuration?: number;
  onCutsGenerated?: (cuts: SocialCut[]) => void;
}

const SocialCutsPanelComponent: React.FC<SocialCutsPanelProps> = ({
  contentId = 'demo-content',
  videoUrl,
  videoDuration = 300,
  onCutsGenerated
}) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(['tiktok', 'youtube_shorts']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cuts, setCuts] = useState<SocialCut[]>([]);
  const [hooks, setHooks] = useState<HookSegment[]>([]);

  const platforms: { id: SocialPlatform; label: string; icon: string; color: string }[] = [
    { id: 'tiktok', label: 'TikTok', icon: '🎵', color: 'bg-pink-500' },
    { id: 'instagram_reels', label: 'Reels', icon: '📸', color: 'bg-purple-500' },
    { id: 'youtube_shorts', label: 'Shorts', icon: '▶️', color: 'bg-red-500' },
    { id: 'facebook_reels', label: 'FB Reels', icon: '📘', color: 'bg-blue-500' },
    { id: 'linkedin', label: 'LinkedIn', icon: '💼', color: 'bg-blue-700' },
    { id: 'twitter', label: 'X/Twitter', icon: '𝕏', color: 'bg-gray-800' },
  ];

  const togglePlatform = (platformId: SocialPlatform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleGenerateCuts = async () => {
    if (selectedPlatforms.length === 0) {
      toast.error('Select at least one platform');
      return;
    }

    setIsGenerating(true);
    try {
      // Detect hooks first
      const detectedHooks = await socialCutsService.detectHooks(contentId, videoDuration);
      setHooks(detectedHooks);

      // Generate cuts
      const generatedCuts = await socialCutsService.generateCuts(
        contentId,
        selectedPlatforms,
        { cutsPerPlatform: 2, preferHooks: true }
      );
      setCuts(generatedCuts);
      onCutsGenerated?.(generatedCuts);
      toast.success(`Generated ${generatedCuts.length} cuts!`);
    } catch (err) {
      toast.error('Failed to generate cuts');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Platform Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Scissors className="h-4 w-4" />
              Select Platforms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {platforms.map(platform => {
                const config = socialCutsService.getPlatformConfig(platform.id);
                return (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                      selectedPlatforms.includes(platform.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full ${platform.color} flex items-center justify-center text-white text-sm`}>
                      {platform.icon}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">{platform.label}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {config.aspect_ratio} • {config.max_duration}s max
                      </p>
                    </div>
                    {selectedPlatforms.includes(platform.id) && (
                      <Check className="h-4 w-4 text-primary ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>

            <Button 
              onClick={handleGenerateCuts}
              disabled={isGenerating || selectedPlatforms.length === 0}
              className="w-full"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Generate Cuts for {selectedPlatforms.length} Platform{selectedPlatforms.length !== 1 ? 's' : ''}
            </Button>
          </CardContent>
        </Card>

        {/* Detected Hooks */}
        {hooks.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Detected Hooks
                </span>
                <Badge variant="secondary">{hooks.length} found</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {hooks.map((hook, i) => (
                  <div 
                    key={i}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 text-xs text-muted-foreground">
                        {formatTime(hook.start_time)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{hook.description}</p>
                        <Badge variant="outline" className="text-[10px] mt-1">
                          {hook.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={hook.score} className="w-16 h-2" />
                      <span className="text-xs text-muted-foreground w-8">{hook.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generated Cuts */}
        {cuts.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Scissors className="h-4 w-4" />
                  Generated Cuts
                </span>
                <Badge>{cuts.length} cuts</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cuts.map((cut, i) => {
                  const platform = platforms.find(p => p.id === cut.platform);
                  const optimization = socialCutsService.getPlatformOptimization(cut.platform);
                  
                  return (
                    <div 
                      key={cut.id}
                      className="border rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full ${platform?.color} flex items-center justify-center text-white text-xs`}>
                            {platform?.icon}
                          </div>
                          <span className="font-medium text-sm">{platform?.label}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {cut.aspect_ratio}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {cut.engagement_prediction}%
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(cut.start_time)} - {formatTime(cut.end_time)}
                        </span>
                        <span>•</span>
                        <span>{cut.duration}s duration</span>
                        <span>•</span>
                        <Badge variant={cut.status === 'ready' ? 'default' : 'secondary'} className="text-[10px]">
                          {cut.status}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Play className="h-3 w-3 mr-1" />
                          Preview
                        </Button>
                        <Button size="sm" className="flex-1">
                          <Download className="h-3 w-3 mr-1" />
                          Export
                        </Button>
                      </div>

                      {/* Quick Tips */}
                      {optimization.engagement_tips.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-[10px] text-muted-foreground mb-1">Quick tip:</p>
                          <p className="text-xs">💡 {optimization.engagement_tips[0]}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Platform Optimization Tips */}
        {selectedPlatforms.length > 0 && cuts.length === 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Platform Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedPlatforms.slice(0, 3).map(platformId => {
                  const platform = platforms.find(p => p.id === platformId);
                  const optimization = socialCutsService.getPlatformOptimization(platformId);
                  
                  return (
                    <div key={platformId} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span>{platform?.icon}</span>
                        <span className="font-medium text-sm">{platform?.label}</span>
                      </div>
                      <ul className="space-y-1 text-xs text-muted-foreground pl-6">
                        <li>• Recommended: {optimization.recommended_duration}s</li>
                        <li>• Best times: {optimization.best_posting_times.slice(0, 2).join(', ')}</li>
                        <li>• Formats: {optimization.trending_formats.slice(0, 3).join(', ')}</li>
                      </ul>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
};

export default SocialCutsPanelComponent;
