import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

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

export const GenieStudioVisualAssets = () => {
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

  const handleDownloadAll = async () => {
    for (const image of imageAssets) {
      await handleDownloadImage(image);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    toast.success('All images downloaded!');
  };

  return (
    <Card className="w-full bg-slate-900 border-slate-700">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Genie Studio Visual Assets</h3>
          <p className="text-sm text-slate-400">Generated architecture and flow diagrams</p>
        </div>
        <Button onClick={handleDownloadAll} variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Download All
        </Button>
      </div>
      <CardContent className="p-4">
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
      </CardContent>
    </Card>
  );
};

export default GenieStudioVisualAssets;
