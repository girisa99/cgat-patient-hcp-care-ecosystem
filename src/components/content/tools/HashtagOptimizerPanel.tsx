/**
 * HashtagOptimizerPanel - P3-QW-03 UI Component
 * 
 * AI-powered hashtag optimization with Label Studio integration
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Hash, 
  Sparkles, 
  Copy, 
  Check, 
  TrendingUp,
  Target,
  Zap,
  RefreshCw,
  Loader2,
  Plus,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { useCaptionGeneration, CaptionPlatform } from '@/hooks/useCaptionGeneration';

interface HashtagOptimizerPanelProps {
  content?: string;
  existingHashtags?: string[];
  onHashtagsOptimized?: (hashtags: string[]) => void;
}

const HashtagOptimizerPanel: React.FC<HashtagOptimizerPanelProps> = ({
  content: initialContent = '',
  existingHashtags = [],
  onHashtagsOptimized
}) => {
  const [content, setContent] = useState(initialContent);
  const [selectedPlatform, setSelectedPlatform] = useState<CaptionPlatform>('instagram');
  const [hashtagCount, setHashtagCount] = useState(15);
  const [currentHashtags, setCurrentHashtags] = useState<string[]>(existingHashtags);
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [newHashtag, setNewHashtag] = useState('');

  const { suggestHashtags } = useCaptionGeneration();

  const platforms: { id: CaptionPlatform; label: string; maxHashtags: number }[] = [
    { id: 'instagram', label: 'Instagram', maxHashtags: 30 },
    { id: 'tiktok', label: 'TikTok', maxHashtags: 100 },
    { id: 'youtube', label: 'YouTube', maxHashtags: 15 },
    { id: 'linkedin', label: 'LinkedIn', maxHashtags: 5 },
    { id: 'twitter', label: 'X/Twitter', maxHashtags: 5 },
    { id: 'facebook', label: 'Facebook', maxHashtags: 10 },
  ];

  const handleGenerate = async () => {
    if (!content.trim()) {
      toast.error('Please enter content to analyze');
      return;
    }

    setIsLoading(true);
    try {
      const hashtags = await suggestHashtags(content, selectedPlatform, hashtagCount);
      setSuggestedHashtags(hashtags.filter(h => !currentHashtags.includes(h)));
      toast.success(`Generated ${hashtags.length} hashtag suggestions`);
    } catch (err) {
      toast.error('Failed to generate hashtags');
    } finally {
      setIsLoading(false);
    }
  };

  const addHashtag = (hashtag: string) => {
    const formatted = hashtag.startsWith('#') ? hashtag : `#${hashtag}`;
    if (!currentHashtags.includes(formatted)) {
      const updated = [...currentHashtags, formatted];
      setCurrentHashtags(updated);
      setSuggestedHashtags(prev => prev.filter(h => h !== hashtag));
      onHashtagsOptimized?.(updated);
    }
  };

  const removeHashtag = (hashtag: string) => {
    const updated = currentHashtags.filter(h => h !== hashtag);
    setCurrentHashtags(updated);
    onHashtagsOptimized?.(updated);
  };

  const addCustomHashtag = () => {
    if (newHashtag.trim()) {
      addHashtag(newHashtag.trim());
      setNewHashtag('');
    }
  };

  const copyAllHashtags = async () => {
    await navigator.clipboard.writeText(currentHashtags.join(' '));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
    toast.success('Hashtags copied to clipboard');
  };

  const currentPlatform = platforms.find(p => p.id === selectedPlatform);
  const isOverLimit = currentHashtags.length > (currentPlatform?.maxHashtags || 30);

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Input Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Hashtag Optimizer
              <Badge variant="secondary" className="text-[10px]">P3-QW-03</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Content to Analyze</label>
              <Textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your content (title, description, or transcript)..."
                rows={3}
                className="mt-1"
              />
            </div>

            {/* Platform Selection */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Platform</label>
              <div className="flex flex-wrap gap-2">
                {platforms.map(platform => (
                  <Button
                    key={platform.id}
                    variant={selectedPlatform === platform.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPlatform(platform.id)}
                    className="text-xs"
                  >
                    {platform.label}
                    <span className="ml-1 text-[10px] opacity-70">max {platform.maxHashtags}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Hashtag Count */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Number of Suggestions: {hashtagCount}
              </label>
              <input 
                type="range"
                min="5"
                max="30"
                value={hashtagCount}
                onChange={(e) => setHashtagCount(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <Button 
              onClick={handleGenerate}
              disabled={isLoading || !content.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Hashtags
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Current Hashtags */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Your Hashtags
              </span>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={isOverLimit ? 'destructive' : 'outline'}
                >
                  {currentHashtags.length}/{currentPlatform?.maxHashtags || 30}
                </Badge>
                {currentHashtags.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyAllHashtags}
                    className="h-7 gap-1"
                  >
                    {copiedAll ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    Copy All
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentHashtags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {currentHashtags.map((hashtag, i) => (
                  <Badge 
                    key={i} 
                    variant="secondary" 
                    className="gap-1 pr-1"
                  >
                    {hashtag}
                    <button
                      onClick={() => removeHashtag(hashtag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">
                No hashtags yet. Generate suggestions or add your own.
              </p>
            )}

            {/* Add Custom Hashtag */}
            <div className="flex gap-2">
              <Input
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value)}
                placeholder="Add custom hashtag..."
                onKeyDown={(e) => e.key === 'Enter' && addCustomHashtag()}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={addCustomHashtag}
                disabled={!newHashtag.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Suggested Hashtags */}
        {suggestedHashtags.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  AI Suggestions
                </span>
                <Badge variant="outline">{suggestedHashtags.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {suggestedHashtags.map((hashtag, i) => (
                  <Badge 
                    key={i} 
                    variant="outline" 
                    className="gap-1 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => addHashtag(hashtag)}
                  >
                    <Plus className="h-3 w-3" />
                    {hashtag}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    suggestedHashtags.forEach(h => addHashtag(h));
                  }}
                  className="flex-1"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Add All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleGenerate}
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Hashtag Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Mix popular (1M+) and niche (10K-100K) hashtags for best reach
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Use branded hashtags to build community recognition
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Avoid banned or shadowbanned hashtags
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Refresh hashtag sets regularly to avoid repetition penalties
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};

export default HashtagOptimizerPanel;
