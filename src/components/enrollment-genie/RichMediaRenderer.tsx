/**
 * ENHANCED RICH MEDIA RENDERER
 * Supports comprehensive rich media: HTML, tables, images, videos, PDFs, Word docs, 
 * SVG, infographics, Excel files, and AI generation with streamlined layout
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Image, 
  Video, 
  FileText, 
  Download, 
  Eye, 
  Play,
  Wand2,
  Loader2,
  Table,
  Code,
  ExternalLink,
  Search,
  FileImage,
  File,
  PieChart,
  Zap,
  Camera,
  Monitor
} from 'lucide-react';
import { motion } from 'framer-motion';
import { externalVisualContentService, VisualContentSource } from '@/services/externalVisualContentService';
import universalMediaService from '@/services/universalMediaService';
import { toast } from 'sonner';

interface RichMediaRendererProps {
  content: string;
  metadata?: any;
  onGenerateImage?: (prompt: string) => Promise<string>;
  onGenerateVideo?: (prompt: string) => Promise<string>;
  enableVisualSearch?: boolean;
  modelContext?: {
    provider: string;
    model: string;
    panelIndex: number;
  };
}

export const RichMediaRenderer: React.FC<RichMediaRendererProps> = ({ 
  content, 
  metadata,
  onGenerateImage,
  onGenerateVideo,
  enableVisualSearch = true,
  modelContext
}) => {
  const [imagePrompt, setImagePrompt] = useState('');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMedia, setGeneratedMedia] = useState<{ type: 'image' | 'video'; url: string }[]>([]);
  const [visualContent, setVisualContent] = useState<VisualContentSource[]>([]);
  const [isLoadingVisual, setIsLoadingVisual] = useState(false);
  const [showVisualContent, setShowVisualContent] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Enhanced content parsing for all rich media types
  const parseContent = () => {
    const sections = [];
    
    // Check for HTML content
    if (content.includes('<') && content.includes('>')) {
      sections.push({ type: 'html', content: content });
    }
    
    // Check for table markdown
    else if (content.includes('|') && content.includes('---')) {
      const tableRegex = /\|(.+)\|\n\|[-\s|]+\|\n((\|.+\|\n?)+)/g;
      let match;
      let remainingContent = content;
      
      while ((match = tableRegex.exec(content)) !== null) {
        const tableContent = match[0];
        sections.push({ type: 'table', content: tableContent });
        remainingContent = remainingContent.replace(tableContent, '');
      }
      
      if (remainingContent.trim()) {
        sections.push({ type: 'text', content: remainingContent });
      }
    }
    // Check for embedded media URLs
    else if (content.includes('http') && (content.includes('.jpg') || content.includes('.png') || 
             content.includes('.gif') || content.includes('.webp') || content.includes('.svg'))) {
      sections.push({ type: 'image_url', content: content });
    }
    else if (content.includes('http') && (content.includes('.mp4') || content.includes('.webm') || 
             content.includes('.mov') || content.includes('youtube.com') || content.includes('vimeo.com'))) {
      sections.push({ type: 'video_url', content: content });
    }
    else if (content.includes('http') && (content.includes('.pdf') || content.includes('.doc') || 
             content.includes('.docx') || content.includes('.xlsx') || content.includes('.pptx'))) {
      sections.push({ type: 'document_url', content: content });
    }
    else {
      sections.push({ type: 'text', content: content });
    }
    
    return sections;
  };

  const renderTable = (tableContent: string) => {
    const lines = tableContent.trim().split('\n');
    const headers = lines[0].split('|').map(h => h.trim()).filter(h => h);
    const rows = lines.slice(2).map(line => 
      line.split('|').map(cell => cell.trim()).filter(cell => cell)
    );

    return (
      <div className="w-full my-4 -mx-4 px-4">
        <div className="bg-background border rounded-lg overflow-hidden shadow-sm max-w-full">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead>
                <tr className="bg-muted/30 border-b">
                  {headers.map((header, index) => (
                    <th key={index} className="px-3 py-2 text-left text-sm font-semibold text-foreground whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-muted/20 hover:bg-muted/10">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-3 py-2 text-sm text-foreground whitespace-nowrap">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderEmbeddedMedia = (section: any) => {
    const urls = section.content.match(/https?:\/\/[^\s]+/g) || [];
    
    return (
      <div className="space-y-3 my-4">
        {urls.map((url: string, index: number) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-0">
              {section.type === 'image_url' && (
                <div className="relative">
                  <img 
                    src={url} 
                    alt="Embedded content"
                    className="w-full max-h-96 object-contain bg-muted"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-xs">
                      <FileImage className="h-3 w-3 mr-1" />
                      Image
                    </Badge>
                  </div>
                </div>
              )}
              
              {section.type === 'video_url' && (
                <div className="relative aspect-video bg-muted">
                  {url.includes('youtube.com') || url.includes('vimeo.com') ? (
                    <iframe 
                      src={url.replace('watch?v=', 'embed/')}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  ) : (
                    <video controls className="w-full h-full">
                      <source src={url} />
                    </video>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-xs">
                      <Video className="h-3 w-3 mr-1" />
                      Video
                    </Badge>
                  </div>
                </div>
              )}
              
              {section.type === 'document_url' && (
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {url.includes('.pdf') && <File className="h-8 w-8 text-red-600" />}
                    {url.includes('.doc') && <FileText className="h-8 w-8 text-blue-600" />}
                    {url.includes('.xlsx') && <PieChart className="h-8 w-8 text-green-600" />}
                    <div>
                      <p className="font-medium">Document</p>
                      <p className="text-xs text-muted-foreground">{url.split('/').pop()}</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => window.open(url, '_blank')}>
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderHTML = (htmlContent: string) => {
    // Enhanced HTML rendering with medical styling
    return (
      <div 
        className="prose prose-sm max-w-none my-4 medical-content"
        dangerouslySetInnerHTML={{ 
          __html: htmlContent.replace(
            /<h([1-6])/g, 
            '<h$1 style="color: #1e40af; margin-top: 1.5rem; margin-bottom: 0.75rem; font-weight: 600;"'
          ).replace(
            /<p>/g,
            '<p style="line-height: 1.6; margin-bottom: 1rem; color: #374151;">'
          ).replace(
            /<ul>/g,
            '<ul style="margin: 1rem 0; padding-left: 1.5rem; list-style-type: disc;">'
          ).replace(
            /<li>/g,
            '<li style="margin-bottom: 0.5rem; color: #374151;">'
          ).replace(
            /<strong>/g,
            '<strong style="color: #1f2937; font-weight: 600;">'
          ).replace(
            /<table>/g,
            '<table style="width: 100%; border-collapse: collapse; margin: 1rem 0; border: 1px solid #e5e7eb;">'
          ).replace(
            /<th>/g,
            '<th style="padding: 0.75rem; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: 600; text-align: left;">'
          ).replace(
            /<td>/g,
            '<td style="padding: 0.75rem; border: 1px solid #e5e7eb; color: #374151;">'
          )
        }}
      />
    );
  };

  const formatText = (text: string) => {
    // Convert markdown-style formatting to JSX
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Handle lists
      if (paragraph.includes('\n-') || paragraph.includes('\n*') || paragraph.includes('\n1.')) {
        const lines = paragraph.split('\n');
        const title = lines[0];
        const listItems = lines.slice(1).filter(line => line.trim());
        
        return (
          <div key={index} className="mb-4">
            {title && <p className="font-medium mb-2">{title}</p>}
            <ul className="space-y-1 ml-4 list-disc">
              {listItems.map((item, itemIndex) => (
                <li key={itemIndex} className="text-sm">
                  {item.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '')}
                </li>
              ))}
            </ul>
          </div>
        );
      }
      
      // Handle code blocks
      if (paragraph.includes('```')) {
        const codeMatch = paragraph.match(/```(\w+)?\n([\s\S]*?)```/);
        if (codeMatch) {
          return (
            <div key={index} className="mb-4">
              <Card className="bg-gray-900 text-gray-100">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    <span className="text-xs">{codeMatch[1] || 'Code'}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm overflow-x-auto">
                    <code>{codeMatch[2]}</code>
                  </pre>
                </CardContent>
              </Card>
            </div>
          );
        }
      }
      
      // Regular paragraph
      return (
        <p key={index} className="mb-3 last:mb-0 text-sm leading-relaxed">
          {paragraph}
        </p>
      );
    });
  };

  const handleGenerateImage = useCallback(async (prompt: string): Promise<string> => {
    try {
      // Use context-aware medical image generation
      const result = await universalMediaService.generateMedicalImage(
        prompt, 
        'clinical', 
        modelContext?.provider === 'gemini' ? 'gemini' : 'huggingface',
        content // Pass original content for context
      );
      
      if (result.success && result.mediaUrl) {
        return result.mediaUrl;
      } else {
        throw new Error(result.error || 'Failed to generate image');
      }
    } catch (error) {
      console.error('Context-aware image generation failed:', error);
      throw error;
    }
  }, [content, modelContext]);

  const handleGenerateVideo = useCallback(async (prompt: string): Promise<string> => {
    try {
      // Use context-aware video generation
      const result = await universalMediaService.generateContextVideo(
        prompt,
        content, // Pass original content for context
        'clinical'
      );
      
      if (result.success && result.mediaUrl) {
        return result.mediaUrl;
      } else {
        throw new Error(result.error || 'Failed to generate video');
      }
    } catch (error) {
      console.error('Context-aware video generation failed:', error);
      throw error;
    }
  }, [content]);

  // Auto-search for visual content based on message content
  useEffect(() => {
    if (enableVisualSearch && content) {
      const searchTerms = extractSearchTerms(content);
      if (searchTerms.length > 0) {
        searchVisualContent(searchTerms.join(' '));
      }
    }
  }, [content, enableVisualSearch]);

  const handleImageGeneration = async () => {
    if (!imagePrompt.trim() || !onGenerateImage) return;
    
    setIsGenerating(true);
    try {
      const imageUrl = await onGenerateImage(imagePrompt);
      setGeneratedMedia(prev => [...prev, { type: 'image', url: imageUrl }]);
      setImagePrompt('');
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Image generation failed. Showing related visual content instead.');
      if (imagePrompt.trim()) {
        searchVisualContent(imagePrompt);
        setShowVisualContent(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVideoGeneration = async () => {
    if (!videoPrompt.trim() || !onGenerateVideo) return;
    
    setIsGenerating(true);
    try {
      const videoUrl = await onGenerateVideo(videoPrompt);
      setGeneratedMedia(prev => [...prev, { type: 'video', url: videoUrl }]);
      setVideoPrompt('');
    } catch (error) {
      console.error('Video generation failed. Showing related visual content instead.');
      if (videoPrompt.trim()) {
        searchVisualContent(videoPrompt);
        setShowVisualContent(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const extractSearchTerms = (text: string): string[] => {
    // Extract medical/scientific terms for visual search
    const medicalTerms = [
      'CAR-T', 'immunotherapy', 'cancer', 'FDA', 'clinical trial',
      'cell therapy', 'biotech', 'pharmaceutical', 'treatment'
    ];
    
    const foundTerms = medicalTerms.filter(term => 
      text.toLowerCase().includes(term.toLowerCase())
    );
    
    return foundTerms.slice(0, 3); // Limit to 3 terms
  };

  const searchVisualContent = async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoadingVisual(true);
    try {
      const result = await externalVisualContentService.searchVisualContent(query, 6);
      setVisualContent(result.sources);
      setShowVisualContent(result.sources.length > 0);
    } catch (error) {
      console.error('Error searching visual content:', error);
    } finally {
      setIsLoadingVisual(false);
    }
  };

  const handleVisualSearch = (query: string) => {
    searchVisualContent(query);
  };

  const handleVisualCategoryFilter = (category: string) => {
    // For now, just filter existing results
    // In a full implementation, this would trigger a new search
    console.log('Category filter:', category);
  };

  const sections = parseContent();

  return (
    <div className="space-y-4">
      {/* Content Sections */}
      {sections.map((section, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {section.type === 'html' && renderHTML(section.content)}
          {section.type === 'table' && renderTable(section.content)}
          {section.type === 'text' && <div>{formatText(section.content)}</div>}
          {(section.type === 'image_url' || section.type === 'video_url' || section.type === 'document_url') && 
            renderEmbeddedMedia(section)}
        </motion.div>
      ))}

      {/* Generated Media Display */}
      {generatedMedia.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold">AI Generated Content</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedMedia.map((media, index) => (
              <Card key={index} className="overflow-hidden group hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  {media.type === 'image' ? (
                    <div className="relative">
                      <img 
                        src={media.url} 
                        alt="Generated content"
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                  ) : (
                    <video 
                      src={media.url} 
                      controls
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-3 border-t">
                    <Badge variant="secondary" className="text-xs">
                      {media.type === 'image' ? <Camera className="h-3 w-3 mr-1" /> : <Monitor className="h-3 w-3 mr-1" />}
                      AI {media.type.charAt(0).toUpperCase() + media.type.slice(1)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Streamlined Visual Content Search */}
      {enableVisualSearch && showVisualContent && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold">Related Visual Content</h4>
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Search for more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 h-8 text-xs"
                onKeyPress={(e) => e.key === 'Enter' && handleVisualSearch(searchQuery)}
              />
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleVisualSearch(searchQuery)}
                disabled={isLoadingVisual}
                className="h-8"
              >
                {isLoadingVisual ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
              </Button>
            </div>
          </div>
          
          {isLoadingVisual ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visualContent.slice(0, 6).map((source, index) => (
                <Card key={source.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative aspect-video bg-muted">
                    {source.thumbnailUrl ? (
                      <img 
                        src={source.thumbnailUrl} 
                        alt={source.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileImage className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
                      {Math.round(source.relevanceScore * 100)}%
                    </Badge>
                  </div>
                  <CardContent className="p-3">
                    <h5 className="font-medium text-sm line-clamp-2 mb-2">{source.title}</h5>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {source.sourceType.replace('_', ' ')}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          const url = source.videoUrl || source.imageUrl;
                          if (url) window.open(url, '_blank');
                        }}
                        className="h-6 px-2 text-xs"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Simplified Media Generation */}
      {(onGenerateImage || onGenerateVideo) && (
        <div className="mt-6 p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg bg-muted/10">
          <div className="flex items-center gap-2 mb-4">
            <Wand2 className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold">Generate New Content</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {onGenerateImage && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Describe an image..."
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    disabled={isGenerating}
                    className="text-sm"
                  />
                  <Button 
                    onClick={handleImageGeneration}
                    disabled={!imagePrompt.trim() || isGenerating}
                    size="sm"
                  >
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
            
            {onGenerateVideo && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Describe a video..."
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    disabled={isGenerating}
                    className="text-sm"
                  />
                  <Button 
                    onClick={handleVideoGeneration}
                    disabled={!videoPrompt.trim() || isGenerating}
                    size="sm"
                  >
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Monitor className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced File Attachments Support */}
      {metadata?.attachments && metadata.attachments.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold">Attachments</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {metadata.attachments.map((attachment: any, index: number) => {
              const getFileIcon = (type: string) => {
                if (type.includes('pdf')) return <File className="h-5 w-5 text-red-600" />;
                if (type.includes('word') || type.includes('doc')) return <FileText className="h-5 w-5 text-blue-600" />;
                if (type.includes('excel') || type.includes('sheet')) return <PieChart className="h-5 w-5 text-green-600" />;
                if (type.includes('image')) return <FileImage className="h-5 w-5 text-purple-600" />;
                return <FileText className="h-5 w-5 text-gray-600" />;
              };

              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getFileIcon(attachment.type)}
                        <div>
                          <p className="font-medium text-sm">{attachment.name}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {attachment.type}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};