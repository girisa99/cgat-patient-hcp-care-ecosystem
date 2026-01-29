/**
 * THUMBNAIL MANAGER
 * 
 * Handles thumbnail generation, editing, and management for compositions:
 * - Auto-generate thumbnails using AI
 * - Edit/customize thumbnails
 * - Title suggestions with AI
 * - Publish-ready metadata
 */

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Image, Wand2, Sparkles, RefreshCw, Download, Upload,
  Pencil, Check, X, Loader2, Eye, Copy, FileText,
  Youtube, Linkedin, Instagram, Facebook
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface ThumbnailData {
  url: string;
  title: string;
  subtitle?: string;
  style: 'youtube' | 'linkedin' | 'instagram' | 'podcast' | 'webinar' | 'custom';
  generatedAt?: Date;
  isCustom?: boolean;
}

export interface ContentMetadata {
  title: string;
  description: string;
  thumbnails: Record<string, ThumbnailData>; // keyed by language
  suggestedTitles?: string[];
  tags?: string[];
}

interface ThumbnailManagerProps {
  projectId: string;
  projectName: string;
  projectDescription?: string;
  chapters: Array<{ title: string; type: string; duration: number }>;
  languages: string[];
  onMetadataUpdate: (metadata: ContentMetadata) => void;
  initialMetadata?: Partial<ContentMetadata>;
}

const THUMBNAIL_STYLES = [
  { id: 'youtube', label: 'YouTube', icon: <Youtube className="w-4 h-4" />, dimensions: '1280x720' },
  { id: 'linkedin', label: 'LinkedIn', icon: <Linkedin className="w-4 h-4" />, dimensions: '1200x627' },
  { id: 'instagram', label: 'Instagram', icon: <Instagram className="w-4 h-4" />, dimensions: '1080x1080' },
  { id: 'podcast', label: 'Podcast', icon: <FileText className="w-4 h-4" />, dimensions: '1400x1400' },
  { id: 'webinar', label: 'Webinar', icon: <Eye className="w-4 h-4" />, dimensions: '1920x1080' },
];

export const ThumbnailManager: React.FC<ThumbnailManagerProps> = ({
  projectId,
  projectName,
  projectDescription,
  chapters,
  languages,
  onMetadataUpdate,
  initialMetadata,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState<string>('youtube');
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0] || 'en');
  
  // Metadata state
  const [title, setTitle] = useState(initialMetadata?.title || projectName);
  const [description, setDescription] = useState(initialMetadata?.description || projectDescription || '');
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>(initialMetadata?.suggestedTitles || []);
  const [thumbnails, setThumbnails] = useState<Record<string, ThumbnailData>>(
    initialMetadata?.thumbnails || {}
  );
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);

  // Generate thumbnail using AI
  const generateThumbnail = useCallback(async () => {
    setIsGenerating(true);
    setGenerationProgress(10);

    try {
      toast.info('Generating thumbnail...');

      // Build thumbnail prompt from project data
      const chapterSummary = chapters
        .map(c => `${c.title} (${c.type})`)
        .join(', ');

      setGenerationProgress(30);

      const { data, error } = await supabase.functions.invoke('auto-thumbnail-generator', {
        body: {
          action: 'generate',
          title: title,
          description: `${description}. Chapters: ${chapterSummary}`,
          style: selectedStyle,
        }
      });

      if (error) throw error;

      setGenerationProgress(80);

      const thumbnailData: ThumbnailData = {
        url: data.thumbnailUrl || `https://placehold.co/1280x720/6366f1/ffffff?text=${encodeURIComponent(title)}`,
        title: title,
        style: selectedStyle as ThumbnailData['style'],
        generatedAt: new Date(),
        isCustom: false,
      };

      setThumbnails(prev => ({
        ...prev,
        [selectedLanguage]: thumbnailData
      }));

      setGenerationProgress(100);
      toast.success('Thumbnail generated!');

      // Update parent
      onMetadataUpdate({
        title,
        description,
        thumbnails: { ...thumbnails, [selectedLanguage]: thumbnailData },
        suggestedTitles,
      });

    } catch (error) {
      console.error('Thumbnail generation error:', error);
      toast.error('Failed to generate thumbnail');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  }, [title, description, chapters, selectedStyle, selectedLanguage, thumbnails, suggestedTitles, onMetadataUpdate]);

  // Generate AI title suggestions
  const generateTitleSuggestions = useCallback(async () => {
    setIsGenerating(true);

    try {
      toast.info('Generating title suggestions...');

      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          action: 'generate',
          provider: 'gemini',
          model: 'gemini-2.0-flash',
          prompt: `Generate 5 compelling, SEO-friendly video titles for this content:
          
Project: ${projectName}
Description: ${projectDescription}
Chapters: ${chapters.map(c => c.title).join(', ')}

Requirements:
- Under 60 characters each
- Include power words
- Be specific and engaging
- Suitable for ${selectedStyle} platform

Return only the titles, one per line.`,
          maxTokens: 500,
        }
      });

      if (error) throw error;

      const suggestions = (data.text || data.content || '')
        .split('\n')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0 && s.length < 80)
        .slice(0, 5);

      setSuggestedTitles(suggestions);
      toast.success('Title suggestions ready!');

    } catch (error) {
      console.error('Title generation error:', error);
      toast.error('Failed to generate titles');
    } finally {
      setIsGenerating(false);
    }
  }, [projectName, projectDescription, chapters, selectedStyle]);

  // Save title edit
  const handleSaveTitle = () => {
    setTitle(editedTitle);
    setIsEditingTitle(false);
    onMetadataUpdate({
      title: editedTitle,
      description,
      thumbnails,
      suggestedTitles,
    });
    toast.success('Title updated');
  };

  // Apply suggested title
  const applySuggestedTitle = (suggestion: string) => {
    setTitle(suggestion);
    setEditedTitle(suggestion);
    onMetadataUpdate({
      title: suggestion,
      description,
      thumbnails,
      suggestedTitles,
    });
    toast.success('Title applied');
  };

  const currentThumbnail = thumbnails[selectedLanguage];

  return (
    <div className="space-y-6">
      {/* Title & Description Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Content Metadata
              </CardTitle>
              <CardDescription>
                Title, description, and SEO settings
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={generateTitleSuggestions}
              disabled={isGenerating}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              AI Titles
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label>Title</Label>
            {isEditingTitle ? (
              <div className="flex gap-2">
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="flex-1"
                  maxLength={60}
                />
                <Button size="icon" variant="ghost" onClick={handleSaveTitle}>
                  <Check className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setIsEditingTitle(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex-1 p-2 bg-muted rounded-md text-sm">
                  {title || 'No title set'}
                </div>
                <Button size="icon" variant="ghost" onClick={() => setIsEditingTitle(true)}>
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {title.length}/60 characters
            </p>
          </div>

          {/* AI Title Suggestions */}
          {suggestedTitles.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                AI Suggestions
              </Label>
              <div className="flex flex-wrap gap-2">
                {suggestedTitles.map((suggestion, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10 max-w-full truncate"
                    onClick={() => applySuggestedTitle(suggestion)}
                  >
                    {suggestion}
                    <Copy className="w-3 h-3 ml-1 opacity-50" />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                onMetadataUpdate({
                  title,
                  description: e.target.value,
                  thumbnails,
                  suggestedTitles,
                });
              }}
              placeholder="Brief description for SEO and social sharing..."
              rows={3}
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/160 characters (meta description)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Thumbnail Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5 text-primary" />
                Thumbnail
              </CardTitle>
              <CardDescription>
                Auto-generated or custom thumbnail for your content
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang} value={lang}>
                      {lang.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Style Selection */}
          <div className="space-y-2">
            <Label>Platform Style</Label>
            <div className="flex flex-wrap gap-2">
              {THUMBNAIL_STYLES.map((style) => (
                <Button
                  key={style.id}
                  variant={selectedStyle === style.id ? 'default' : 'outline'}
                  size="sm"
                  className="gap-2"
                  onClick={() => setSelectedStyle(style.id)}
                >
                  {style.icon}
                  {style.label}
                  <span className="text-[10px] opacity-70">({style.dimensions})</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Thumbnail Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden border">
              {currentThumbnail?.url ? (
                <img
                  src={currentThumbnail.url}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Image className="w-12 h-12 mb-2 opacity-50" />
                  <p className="text-sm">No thumbnail generated</p>
                  <p className="text-xs">Click "Generate" to create one</p>
                </div>
              )}
              
              {/* Overlay title preview */}
              {currentThumbnail?.url && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <h3 className="text-white font-bold text-lg truncate">{title}</h3>
                </div>
              )}
            </div>
            
            {currentThumbnail?.generatedAt && (
              <p className="text-xs text-muted-foreground">
                Generated: {new Date(currentThumbnail.generatedAt).toLocaleString()}
              </p>
            )}
          </div>

          {/* Generation Progress */}
          {isGenerating && (
            <div className="space-y-2">
              <Progress value={generationProgress} />
              <p className="text-xs text-center text-muted-foreground">
                Generating thumbnail... {generationProgress}%
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              className="flex-1 gap-2" 
              onClick={generateThumbnail}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : currentThumbnail?.url ? (
                <RefreshCw className="w-4 h-4" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              {currentThumbnail?.url ? 'Regenerate' : 'Generate'} Thumbnail
            </Button>
            
            <Button variant="outline" size="icon" disabled={!currentThumbnail?.url}>
              <Upload className="w-4 h-4" />
            </Button>
            
            <Button variant="outline" size="icon" disabled={!currentThumbnail?.url}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThumbnailManager;
