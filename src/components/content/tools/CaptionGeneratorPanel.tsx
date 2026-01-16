/**
 * CaptionGeneratorPanel - P3-QW-02 UI Component
 * 
 * AI-powered caption generation with Label Studio integration
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Sparkles, 
  Copy, 
  Check, 
  Hash,
  Smile,
  Target,
  RefreshCw,
  Wand2,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useCaptionGeneration, CaptionTone, CaptionPlatform, CaptionLength, CaptionConfig } from '@/hooks/useCaptionGeneration';

interface CaptionGeneratorPanelProps {
  title?: string;
  description?: string;
  transcript?: string;
  onCaptionGenerated?: (caption: string, hashtags: string[]) => void;
}

const CaptionGeneratorPanel: React.FC<CaptionGeneratorPanelProps> = ({
  title: initialTitle = '',
  description: initialDescription = '',
  transcript,
  onCaptionGenerated
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [selectedTone, setSelectedTone] = useState<CaptionTone>('casual');
  const [selectedPlatform, setSelectedPlatform] = useState<CaptionPlatform>('instagram');
  const [selectedLength, setSelectedLength] = useState<CaptionLength>('medium');
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [includeCTA, setIncludeCTA] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const {
    isGenerating,
    generatedCaptions,
    selectedCaption,
    generateCaptions,
    selectCaption,
    platformLimits
  } = useCaptionGeneration();

  const tones: { id: CaptionTone; label: string; emoji: string }[] = [
    { id: 'professional', label: 'Professional', emoji: '💼' },
    { id: 'casual', label: 'Casual', emoji: '😊' },
    { id: 'humorous', label: 'Humorous', emoji: '😄' },
    { id: 'inspirational', label: 'Inspirational', emoji: '✨' },
    { id: 'educational', label: 'Educational', emoji: '📚' },
    { id: 'promotional', label: 'Promotional', emoji: '🎯' },
  ];

  const platforms: { id: CaptionPlatform; label: string; limit: number }[] = [
    { id: 'instagram', label: 'Instagram', limit: 2200 },
    { id: 'tiktok', label: 'TikTok', limit: 2200 },
    { id: 'youtube', label: 'YouTube', limit: 5000 },
    { id: 'linkedin', label: 'LinkedIn', limit: 3000 },
    { id: 'twitter', label: 'X/Twitter', limit: 280 },
    { id: 'facebook', label: 'Facebook', limit: 63206 },
  ];

  const lengths: { id: CaptionLength; label: string }[] = [
    { id: 'short', label: 'Short' },
    { id: 'medium', label: 'Medium' },
    { id: 'long', label: 'Long' },
  ];

  const handleGenerate = async () => {
    const config: CaptionConfig = {
      title,
      description,
      transcript,
      tone: selectedTone,
      platform: selectedPlatform,
      length: selectedLength,
      includeHashtags,
      includeEmojis,
      includeCTA,
    };

    const captions = await generateCaptions(config);
    if (captions && captions.length > 0) {
      onCaptionGenerated?.(captions[0].caption, captions[0].hashtags);
    }
  };

  const copyToClipboard = async (caption: string, id: string) => {
    await navigator.clipboard.writeText(caption);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Caption copied to clipboard');
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Input Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              AI Caption Generator
              <Badge variant="secondary" className="text-[10px]">P3-QW-02</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Content Title</label>
              <Input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's your content about?"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Description/Context</label>
              <Textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add context for better captions..."
                rows={2}
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
                    <span className="ml-1 text-[10px] opacity-70">{platform.limit}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Tone Selection */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Tone</label>
              <div className="flex flex-wrap gap-2">
                {tones.map(tone => (
                  <Button
                    key={tone.id}
                    variant={selectedTone === tone.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTone(tone.id)}
                    className="text-xs gap-1"
                  >
                    <span>{tone.emoji}</span>
                    {tone.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Length Selection */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Length</label>
              <div className="flex gap-2">
                {lengths.map(len => (
                  <Button
                    key={len.id}
                    variant={selectedLength === len.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedLength(len.id)}
                    className="flex-1"
                  >
                    {len.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={includeHashtags ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIncludeHashtags(!includeHashtags)}
                className="gap-1"
              >
                <Hash className="h-3 w-3" />
                Hashtags
              </Button>
              <Button
                variant={includeEmojis ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIncludeEmojis(!includeEmojis)}
                className="gap-1"
              >
                <Smile className="h-3 w-3" />
                Emojis
              </Button>
              <Button
                variant={includeCTA ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIncludeCTA(!includeCTA)}
                className="gap-1"
              >
                <Target className="h-3 w-3" />
                CTA
              </Button>
            </div>

            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !title}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Captions
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Captions */}
        {generatedCaptions.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Generated Captions
                </span>
                <Badge variant="outline">{generatedCaptions.length} variants</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {generatedCaptions.map((caption, index) => (
                <div 
                  key={caption.id}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedCaption?.id === caption.id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => selectCaption(caption.id)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="secondary" className="text-[10px]">
                      Option {index + 1}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-[10px]">
                        {caption.characterCount} chars
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(caption.caption + (caption.hashtags.length > 0 ? '\n\n' + caption.hashtags.join(' ') : ''), caption.id);
                        }}
                      >
                        {copiedId === caption.id ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm whitespace-pre-wrap">{caption.caption}</p>
                  
                  {caption.hashtags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {caption.hashtags.slice(0, 8).map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                      {caption.hashtags.length > 8 && (
                        <Badge variant="outline" className="text-[10px]">
                          +{caption.hashtags.length - 8} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>Est. engagement: {Math.round(caption.estimatedEngagement * 100)}%</span>
                    {caption.hasCTA && <Badge variant="outline" className="text-[9px]">CTA</Badge>}
                    {caption.hasEmojis && <Badge variant="outline" className="text-[9px]">✨</Badge>}
                  </div>
                </div>
              ))}

              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
};

export default CaptionGeneratorPanel;
