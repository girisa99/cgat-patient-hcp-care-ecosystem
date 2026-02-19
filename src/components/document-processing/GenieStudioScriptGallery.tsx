import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, ExternalLink, Play, FileText, Image, Video, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { GenieRecordingStudioArchitectureDiagram } from '@/components/diagrams';

// Import the full script as raw text
import fullScriptContent from '@/assets/scripts/GENIE_RECORDING_STUDIO_SCRIPT.md?raw';

// Import generated images
import heroImage from '@/assets/genie-recording-architecture-hero.png';
import beforeAfterImage from '@/assets/genie-before-after-comparison.png';
import contextHandoffImage from '@/assets/genie-context-handoff.png';

interface ImageAsset {
  id: string;
  title: string;
  description: string;
  src: string;
  category: 'architecture' | 'comparison' | 'flow';
}

const imageAssets: ImageAsset[] = [
  {
    id: 'hero',
    title: 'Architecture Overview',
    description: 'Pre-Production to Post-Production pipeline showing Genie Mind and Genie Vibe flow',
    src: heroImage,
    category: 'architecture',
  },
  {
    id: 'before-after',
    title: 'Before & After Comparison',
    description: 'From frustrating multi-tool workflow to unified production system',
    src: beforeAfterImage,
    category: 'comparison',
  },
  {
    id: 'context',
    title: 'Context Handoff',
    description: 'Data flow visualization showing production context transfer between systems',
    src: contextHandoffImage,
    category: 'flow',
  },
];

export const GenieStudioScriptGallery = () => {
  const [selectedImage, setSelectedImage] = useState<ImageAsset | null>(null);

  const handleDownloadImage = async (image: ImageAsset) => {
    try {
      const response = await fetch(image.src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${image.id}-genie-studio.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Downloaded ${image.title}`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download image');
    }
  };

  const handleOpenFullSize = (image: ImageAsset) => {
    window.open(image.src, '_blank');
  };

  // Use the imported full script content
  const scriptContent = fullScriptContent;

  return (
    <Card className="w-full bg-slate-900 border-slate-700">
      <CardHeader className="border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-purple-400" />
            <div>
              <CardTitle className="text-white text-xl">Genie Suite Documentation</CardTitle>
              <p className="text-slate-400 text-sm mt-1">Video Script & Architecture Assets</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const blob = new Blob([scriptContent], { type: 'text/markdown' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'GENIE_RECORDING_STUDIO_SCRIPT.md';
              link.click();
              URL.revokeObjectURL(url);
              toast.success('Script downloaded!');
            }}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download Script
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs defaultValue="architecture" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b border-slate-700 bg-slate-800/50 p-0 h-auto">
            <TabsTrigger value="architecture" className="data-[state=active]:bg-slate-700 rounded-none px-6 py-3 gap-2">
              <Image className="h-4 w-4" />
              Architecture Diagram
            </TabsTrigger>
            <TabsTrigger value="images" className="data-[state=active]:bg-slate-700 rounded-none px-6 py-3 gap-2">
              <Video className="h-4 w-4" />
              Visual Assets
            </TabsTrigger>
            <TabsTrigger value="script" className="data-[state=active]:bg-slate-700 rounded-none px-6 py-3 gap-2">
              <FileText className="h-4 w-4" />
              Script Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="architecture" className="m-0 p-4">
            <GenieRecordingStudioArchitectureDiagram />
          </TabsContent>

          <TabsContent value="images" className="m-0 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {imageAssets.map((image) => (
                <Card key={image.id} className="bg-slate-800 border-slate-700 overflow-hidden group">
                  <div className="relative aspect-video">
                    <img
                      src={image.src}
                      alt={image.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4 gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenFullSize(image)}
                        className="gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDownloadImage(image)}
                        className="gap-1"
                      >
                        <Download className="h-3 w-3" />
                        PNG
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h4 className="text-white font-medium text-sm">{image.title}</h4>
                    <p className="text-slate-400 text-xs mt-1 line-clamp-2">{image.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="script" className="m-0">
            <ScrollArea className="h-[500px]">
              <div className="p-6">
                <div className="prose prose-invert prose-sm max-w-none">
                  {scriptContent.split('\n').map((line, index) => {
                    if (line.startsWith('# ')) {
                      return (
                        <h1 key={index} className="text-2xl font-bold text-white mt-6 mb-4">
                          {line.replace('# ', '')}
                        </h1>
                      );
                    }
                    if (line.startsWith('## ')) {
                      return (
                        <h2 key={index} className="text-xl font-semibold text-purple-400 mt-6 mb-3 border-b border-slate-700 pb-2">
                          {line.replace('## ', '')}
                        </h2>
                      );
                    }
                    if (line.startsWith('### ')) {
                      return (
                        <h3 key={index} className="text-lg font-medium text-emerald-400 mt-4 mb-2">
                          {line.replace('### ', '')}
                        </h3>
                      );
                    }
                    if (line.startsWith('- ')) {
                      return (
                        <li key={index} className="text-slate-300 ml-4">
                          {line.replace('- ', '')}
                        </li>
                      );
                    }
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return (
                        <p key={index} className="text-amber-400 font-semibold my-2">
                          {line.replace(/\*\*/g, '')}
                        </p>
                      );
                    }
                    if (line.trim() === '') {
                      return <br key={index} />;
                    }
                    return (
                      <p key={index} className="text-slate-300 my-2">
                        {line}
                      </p>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GenieStudioScriptGallery;
