/**
 * RICH MEDIA MESSAGE RENDERER
 * Supports HTML, tables, images, videos, PDFs, documents, AI generation, and external visual content
 */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import { VisualContentDisplay } from '../search/VisualContentDisplay';
import { externalVisualContentService, VisualContentSource } from '@/services/externalVisualContentService';

interface RichMediaRendererProps {
  content: string;
  metadata?: any;
  onGenerateImage?: (prompt: string) => Promise<string>;
  onGenerateVideo?: (prompt: string) => Promise<string>;
  enableVisualSearch?: boolean;
}

export const RichMediaRenderer: React.FC<RichMediaRendererProps> = ({ 
  content, 
  metadata,
  onGenerateImage,
  onGenerateVideo,
  enableVisualSearch = true
}) => {
  const [imagePrompt, setImagePrompt] = useState('');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMedia, setGeneratedMedia] = useState<{ type: 'image' | 'video'; url: string }[]>([]);
  const [visualContent, setVisualContent] = useState<VisualContentSource[]>([]);
  const [isLoadingVisual, setIsLoadingVisual] = useState(false);
  const [showVisualContent, setShowVisualContent] = useState(false);

  // Parse content for different media types
  const parseContent = () => {
    const sections = [];
    
    // Check for HTML content
    if (content.includes('<') && content.includes('>')) {
      sections.push({
        type: 'html',
        content: content
      });
    }
    
    // Check for table markdown
    if (content.includes('|') && content.includes('---')) {
      const tableRegex = /\|(.+)\|\n\|[-\s|]+\|\n((\|.+\|\n?)+)/g;
      let match;
      let remainingContent = content;
      
      while ((match = tableRegex.exec(content)) !== null) {
        const tableContent = match[0];
        sections.push({
          type: 'table',
          content: tableContent
        });
        remainingContent = remainingContent.replace(tableContent, '');
      }
      
      if (remainingContent.trim()) {
        sections.push({
          type: 'text',
          content: remainingContent
        });
      }
    } else {
      // Regular text content
      sections.push({
        type: 'text',
        content: content
      });
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
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, index) => (
                <th key={index} className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-2 text-sm text-gray-800 border-b">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderHTML = (htmlContent: string) => {
    return (
      <div 
        className="prose prose-sm max-w-none my-4"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
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

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() || !onGenerateImage) return;
    
    setIsGenerating(true);
    try {
      const imageUrl = await onGenerateImage(imagePrompt);
      setGeneratedMedia(prev => [...prev, { type: 'image', url: imageUrl }]);
      setImagePrompt('');
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim() || !onGenerateVideo) return;
    
    setIsGenerating(true);
    try {
      const videoUrl = await onGenerateVideo(videoPrompt);
      setGeneratedMedia(prev => [...prev, { type: 'video', url: videoUrl }]);
      setVideoPrompt('');
    } catch (error) {
      console.error('Error generating video:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-search for visual content based on message content
  useEffect(() => {
    if (enableVisualSearch && content) {
      const searchTerms = extractSearchTerms(content);
      if (searchTerms.length > 0) {
        searchVisualContent(searchTerms.join(' '));
      }
    }
  }, [content, enableVisualSearch]);

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
        </motion.div>
      ))}

      {/* Generated Media Display */}
      {generatedMedia.length > 0 && (
        <div className="mt-4 space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Generated Media:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {generatedMedia.map((media, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  {media.type === 'image' ? (
                    <img 
                      src={media.url} 
                      alt="Generated content"
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <video 
                      src={media.url} 
                      controls
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-2">
                    <Badge variant="secondary" className="text-xs">
                      {media.type === 'image' ? <Image className="h-3 w-3 mr-1" /> : <Video className="h-3 w-3 mr-1" />}
                      AI Generated {media.type}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* External Visual Content */}
      {enableVisualSearch && (showVisualContent || isLoadingVisual) && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Search className="h-4 w-4" />
              Related Visual Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VisualContentDisplay
              sources={visualContent}
              isLoading={isLoadingVisual}
              onSearch={handleVisualSearch}
              onCategoryFilter={handleVisualCategoryFilter}
            />
          </CardContent>
        </Card>
      )}

      {/* Media Generation Tools */}
      {(onGenerateImage || onGenerateVideo) && (
        <Card className="mt-4 border-dashed border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              AI Media Generation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="image" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                {onGenerateImage && (
                  <TabsTrigger value="image" disabled={isGenerating}>
                    <Image className="h-4 w-4 mr-2" />
                    Generate Image
                  </TabsTrigger>
                )}
                {onGenerateVideo && (
                  <TabsTrigger value="video" disabled={isGenerating}>
                    <Video className="h-4 w-4 mr-2" />
                    Generate Video
                  </TabsTrigger>
                )}
              </TabsList>
              
              {onGenerateImage && (
                <TabsContent value="image" className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Describe the image you want to generate..."
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      disabled={isGenerating}
                    />
                    <Button 
                      onClick={handleGenerateImage}
                      disabled={!imagePrompt.trim() || isGenerating}
                      size="sm"
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TabsContent>
              )}
              
              {onGenerateVideo && (
                <TabsContent value="video" className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Describe the video you want to generate..."
                      value={videoPrompt}
                      onChange={(e) => setVideoPrompt(e.target.value)}
                      disabled={isGenerating}
                    />
                    <Button 
                      onClick={handleGenerateVideo}
                      disabled={!videoPrompt.trim() || isGenerating}
                      size="sm"
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* File Attachments */}
      {metadata?.attachments && metadata.attachments.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments:</h4>
          <div className="space-y-2">
            {metadata.attachments.map((attachment: any, index: number) => (
              <Card key={index} className="border-gray-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">{attachment.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {attachment.type}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};