/**
 * Thumbnail Generator Panel
 * AI-powered thumbnail generation and optimization
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Image, 
  Sparkles, 
  Download,
  RefreshCw,
  Palette,
  Type,
  Smile,
  Hash,
  User,
  Wand2
} from 'lucide-react';
import { useVibeThumbnails, type ThumbnailStyle, type GeneratedThumbnail } from '@/hooks/useVibeThumbnails';
import { toast } from 'sonner';

interface ThumbnailGeneratorPanelProps {
  title?: string;
  description?: string;
  videoUrl?: string;
  onGenerate?: (thumbnail: GeneratedThumbnail) => void;
}

const ThumbnailGeneratorPanel: React.FC<ThumbnailGeneratorPanelProps> = ({
  title: initialTitle = '',
  description: initialDescription = '',
  videoUrl,
  onGenerate
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [overlayText, setOverlayText] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<ThumbnailStyle>('youtube');
  const [generatedThumbnails, setGeneratedThumbnails] = useState<GeneratedThumbnail[]>([]);

  const { 
    isGenerating, 
    isAnalyzing,
    analysis,
    generateThumbnail, 
    analyzeForThumbnail 
  } = useVibeThumbnails();

  const styles: { id: ThumbnailStyle; label: string; icon: React.ReactNode }[] = [
    { id: 'youtube', label: 'YouTube', icon: '▶️' },
    { id: 'tiktok', label: 'TikTok', icon: '🎵' },
    { id: 'instagram', label: 'Instagram', icon: '📸' },
    { id: 'podcast', label: 'Podcast', icon: '🎙️' },
    { id: 'webinar', label: 'Webinar', icon: '🖥️' },
  ];

  const thumbnailTips = [
    { icon: <Type className="h-4 w-4" />, tip: 'Bold text overlay', desc: '3-4 words max' },
    { icon: <User className="h-4 w-4" />, tip: 'Face close-up', desc: 'Expressions grab attention' },
    { icon: <Palette className="h-4 w-4" />, tip: 'High contrast', desc: 'Yellow/black, red/white' },
    { icon: <Hash className="h-4 w-4" />, tip: 'Include numbers', desc: 'Lists perform well' },
    { icon: <Smile className="h-4 w-4" />, tip: 'Add emoji', desc: 'Convey emotion quickly' },
  ];

  const handleGenerate = async () => {
    const result = await generateThumbnail({
      title,
      description: initialDescription,
      style: selectedStyle,
      videoUrl,
      branding: overlayText ? { overlayText } : undefined,
    });

    if (result) {
      setGeneratedThumbnails(prev => [result, ...prev].slice(0, 6));
      onGenerate?.(result);
    }
  };

  const handleAnalyze = async () => {
    await analyzeForThumbnail({
      title,
      description: initialDescription,
      style: selectedStyle,
      videoUrl,
    });
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Input Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Image className="h-4 w-4" />
              Thumbnail Generator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Video Title</label>
              <Input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title for thumbnail context..."
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Text Overlay (optional)</label>
              <Input 
                value={overlayText}
                onChange={(e) => setOverlayText(e.target.value)}
                placeholder="SHOCKING RESULT..."
                className="mt-1"
              />
            </div>

            {/* Style Selection */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Platform Style</label>
              <div className="flex flex-wrap gap-2">
                {styles.map(style => (
                  <Button
                    key={style.id}
                    variant={selectedStyle === style.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedStyle(style.id)}
                    className="gap-1"
                  >
                    <span>{style.icon}</span>
                    {style.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || !title}
                variant="outline"
                className="flex-1"
              >
                {isAnalyzing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4 mr-2" />
                )}
                Analyze
              </Button>
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || !title}
                className="flex-1"
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Generate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Thumbnail Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {thumbnailTips.map((tip, i) => (
                <div 
                  key={i}
                  className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
                >
                  <div className="p-1.5 bg-background rounded">
                    {tip.icon}
                  </div>
                  <div>
                    <p className="text-xs font-medium">{tip.tip}</p>
                    <p className="text-[10px] text-muted-foreground">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysis && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                Content Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Recommended Style</span>
                <Badge>{analysis.recommendedStyle}</Badge>
              </div>
              
              {analysis.colorPalette.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground">Suggested Colors</span>
                  <div className="flex gap-2 mt-1">
                    {analysis.colorPalette.map((color, i) => (
                      <div 
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-background shadow"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {analysis.suggestions.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground">Frame Suggestions</span>
                  <div className="space-y-1 mt-1">
                    {analysis.suggestions.map((suggestion, i) => (
                      <div 
                        key={i}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded"
                      >
                        <span className="text-xs">{suggestion.reason}</span>
                        <Badge variant="outline" className="text-xs">
                          Score: {suggestion.score}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Generated Thumbnails */}
        {generatedThumbnails.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Generated Thumbnails
                </span>
                <Badge variant="secondary">{generatedThumbnails.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {generatedThumbnails.map((thumbnail, i) => (
                  <div 
                    key={i}
                    className="group relative aspect-video bg-muted rounded-lg overflow-hidden"
                  >
                    <img 
                      src={thumbnail.thumbnailUrl} 
                      alt={`Generated thumbnail ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="icon" variant="secondary" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <Badge 
                      className="absolute bottom-1 left-1 text-[10px]"
                      variant="secondary"
                    >
                      {thumbnail.style}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
};

export default ThumbnailGeneratorPanel;
