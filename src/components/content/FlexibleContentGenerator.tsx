/**
 * FLEXIBLE CONTENT GENERATOR
 * Generate images, videos, and scripts from text or images with maximum flexibility
 */
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Image, 
  Video, 
  FileText, 
  Upload, 
  Wand2, 
  Download,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasterToast } from '@/hooks/useMasterToast';

interface ContentGenerationResult {
  type: 'image' | 'video' | 'script';
  url?: string;
  content?: string;
  metadata?: any;
}

interface FlexibleContentGeneratorProps {
  onContentGenerated?: (result: ContentGenerationResult) => void;
}

export const FlexibleContentGenerator: React.FC<FlexibleContentGeneratorProps> = ({
  onContentGenerated
}) => {
  const [activeTab, setActiveTab] = useState('text-to-media');
  const [textPrompt, setTextPrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<ContentGenerationResult[]>([]);
  const [selectedOutputType, setSelectedOutputType] = useState<'image' | 'video' | 'script'>('image');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError, showInfo } = useMasterToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      showSuccess("Image Uploaded", `${file.name} ready for processing`);
    }
  };

  const generateFromText = async () => {
    if (!textPrompt.trim()) {
        showError("Input Required", "Please enter a text prompt");
      return;
    }

    setIsGenerating(true);
    try {
      let result: ContentGenerationResult;

      switch (selectedOutputType) {
        case 'image':
          result = await generateImageFromText(textPrompt);
          break;
        case 'video':
          result = await generateVideoFromText(textPrompt);
          break;
        case 'script':
          result = await generateScriptFromText(textPrompt);
          break;
        default:
          throw new Error('Invalid output type');
      }

      setGeneratedContent(prev => [result, ...prev]);
      if (onContentGenerated) {
        onContentGenerated(result);
      }

      showSuccess("Content Generated", `${selectedOutputType} generated successfully`);

    } catch (error) {
      console.error('Generation failed:', error);
      // Replace all remaining showToast calls with showError for efficiency
      showError("Generation Failed", "Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFromImage = async () => {
    if (!uploadedImage) {
      showError("Image Required", "Please upload an image first");
      return;
    }

    setIsGenerating(true);
    try {
      let result: ContentGenerationResult;

      switch (selectedOutputType) {
        case 'image':
          result = await enhanceImage(uploadedImage);
          break;
        case 'video':
          result = await generateVideoFromImage(uploadedImage);
          break;
        case 'script':
          result = await generateScriptFromImage(uploadedImage);
          break;
        default:
          throw new Error('Invalid output type');
      }

      setGeneratedContent(prev => [result, ...prev]);
      if (onContentGenerated) {
        onContentGenerated(result);
      }

      showSuccess("Content Generated", `${selectedOutputType} generated from image successfully`);

    } catch (error) {
      console.error('Generation failed:', error);
      showError("Generation Failed", "Failed to generate content from image");
    } finally {
      setIsGenerating(false);
    }
  };

  // Content generation functions
  const generateImageFromText = async (prompt: string): Promise<ContentGenerationResult> => {
    // Mock implementation - replace with actual AI service
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          type: 'image',
          url: '/api/placeholder/800/600',
          metadata: { prompt, model: 'flux-schnell', created_at: new Date() }
        });
      }, 2000);
    });
  };

  const generateVideoFromText = async (prompt: string): Promise<ContentGenerationResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          type: 'video',
          url: '/api/placeholder-video.mp4',
          metadata: { prompt, duration: '30s', model: 'runway-gen2', created_at: new Date() }
        });
      }, 5000);
    });
  };

  const generateScriptFromText = async (prompt: string): Promise<ContentGenerationResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          type: 'script',
          content: `# Script Generated from: "${prompt}"\n\n## Scene 1\n[FADE IN]\n\nThe story begins with ${prompt}...\n\n## Dialogue\nNARRATOR: ${prompt} represents a journey of discovery...\n\n## Visual Direction\n- Open with wide shot\n- Focus on key elements\n- Smooth transitions\n\n[FADE OUT]`,
          metadata: { prompt, word_count: 85, created_at: new Date() }
        });
      }, 1500);
    });
  };

  const enhanceImage = async (image: File): Promise<ContentGenerationResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          type: 'image',
          url: URL.createObjectURL(image), // Enhanced version would be different
          metadata: { original_name: image.name, enhancement: 'upscaled_2x', created_at: new Date() }
        });
      }, 3000);
    });
  };

  const generateVideoFromImage = async (image: File): Promise<ContentGenerationResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          type: 'video',
          url: '/api/placeholder-video.mp4',
          metadata: { source_image: image.name, duration: '15s', created_at: new Date() }
        });
      }, 4000);
    });
  };

  const generateScriptFromImage = async (image: File): Promise<ContentGenerationResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          type: 'script',
          content: `# Script Based on Image: ${image.name}\n\n## Visual Description\nThe image shows a compelling scene that tells a story of...\n\n## Narrative Structure\n1. Opening Hook\n2. Character Development\n3. Conflict/Challenge\n4. Resolution\n\n## Key Messages\n- Main theme derived from visual elements\n- Emotional resonance\n- Call to action\n\n## Production Notes\n- Lighting: Natural/Dramatic\n- Camera angles: Multiple perspectives\n- Music: Complementary to mood`,
          metadata: { source_image: image.name, word_count: 124, created_at: new Date() }
        });
      }, 2000);
    });
  };

  const downloadContent = (content: ContentGenerationResult) => {
    if (content.type === 'script' && content.content) {
      const blob = new Blob([content.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `script-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (content.url) {
      const a = document.createElement('a');
      a.href = content.url;
      a.download = `${content.type}-${Date.now()}`;
      a.click();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Flexible Content Generator
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Generate images, videos, and scripts from text or images with complete flexibility
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="text-to-media">Text to Media</TabsTrigger>
          <TabsTrigger value="image-to-media">Image to Media</TabsTrigger>
        </TabsList>

        <TabsContent value="text-to-media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Generate from Text</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Describe what you want to create... (e.g., 'A serene mountain landscape at sunset' or 'Create a promotional video script for a new healthcare app')"
                value={textPrompt}
                onChange={(e) => setTextPrompt(e.target.value)}
                className="min-h-[100px]"
              />
              
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Output Type:</span>
                <div className="flex gap-2">
                  {['image', 'video', 'script'].map((type) => (
                    <Button
                      key={type}
                      variant={selectedOutputType === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedOutputType(type as any)}
                    >
                      {type === 'image' && <Image className="h-4 w-4 mr-1" />}
                      {type === 'video' && <Video className="h-4 w-4 mr-1" />}
                      {type === 'script' && <FileText className="h-4 w-4 mr-1" />}
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={generateFromText}
                disabled={isGenerating || !textPrompt.trim()}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating {selectedOutputType}...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate {selectedOutputType.charAt(0).toUpperCase() + selectedOutputType.slice(1)}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="image-to-media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Generate from Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {uploadedImage ? (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">{uploadedImage.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {(uploadedImage.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <div className="text-sm">Click to upload an image</div>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Upload Image
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Output Type:</span>
                <div className="flex gap-2">
                  {['image', 'video', 'script'].map((type) => (
                    <Button
                      key={type}
                      variant={selectedOutputType === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedOutputType(type as any)}
                    >
                      {type === 'image' && <Image className="h-4 w-4 mr-1" />}
                      {type === 'video' && <Video className="h-4 w-4 mr-1" />}
                      {type === 'script' && <FileText className="h-4 w-4 mr-1" />}
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={generateFromImage}
                disabled={isGenerating || !uploadedImage}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing image...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate {selectedOutputType.charAt(0).toUpperCase() + selectedOutputType.slice(1)} from Image
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generated Content Gallery */}
      {generatedContent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <AnimatePresence>
                {generatedContent.map((content, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {content.type === 'image' && <Image className="h-3 w-3 mr-1" />}
                        {content.type === 'video' && <Video className="h-3 w-3 mr-1" />}
                        {content.type === 'script' && <FileText className="h-3 w-3 mr-1" />}
                        {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadContent(content)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>

                    {content.type === 'image' && content.url && (
                      <img 
                        src={content.url} 
                        alt="Generated" 
                        className="w-full max-w-md rounded-lg"
                      />
                    )}

                    {content.type === 'video' && content.url && (
                      <video 
                        controls 
                        className="w-full max-w-md rounded-lg"
                        src={content.url}
                      />
                    )}

                    {content.type === 'script' && content.content && (
                      <div className="bg-muted rounded-lg p-3 max-h-40 overflow-y-auto">
                        <pre className="text-sm whitespace-pre-wrap">
                          {content.content}
                        </pre>
                      </div>
                    )}

                    {content.metadata && (
                      <div className="text-xs text-muted-foreground space-y-1">
                        {content.metadata.prompt && (
                          <div>Prompt: {content.metadata.prompt}</div>
                        )}
                        {content.metadata.created_at && (
                          <div>Created: {new Date(content.metadata.created_at).toLocaleString()}</div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};