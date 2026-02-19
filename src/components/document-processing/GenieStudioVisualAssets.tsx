import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import generated images
import heroImage from '@/assets/genie-recording-architecture-hero.png';
import beforeAfterImage from '@/assets/genie-before-after-comparison.png';
import contextHandoffImage from '@/assets/genie-context-handoff.png';

// Import Genie Suite logo (finalized banner)
import studioBanner from '@/assets/logos/genie-studio-banner.png';

// Import Genie Mind logo (finalized combined)
import mindCombined from '@/assets/logos/genie-mind-combined.png';

// Import Genie Hub logo (finalized combined)
import arcCombined from '@/assets/logos/genie-arc-combined.png';

// Import Genie Vibe logo (finalized combined)
import vibeCombined from '@/assets/logos/genie-vibe-combined.png';

// Import Genie Spark logo (finalized combined)
import sparkCombined from '@/assets/logos/genie-spark-combined.png';

// Import Ask Genie logo (finalized combined)
import askGenieCombined from '@/assets/logos/ask-genie-combined.png';

// Import Genie Deck logo (finalized combined)
import deckCombined from '@/assets/logos/genie-deck-combined.png';

interface ImageAsset {
  id: string;
  title: string;
  description: string;
  src: string;
  category: 'architecture' | 'comparison' | 'flow' | 'logo';
  brand?: 'studio' | 'mind' | 'arc' | 'vibe' | 'spark' | 'ask-genie' | 'deck';
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

// Finalized logo assets - one combined version per brand (used for all purposes)
const logoAssets: ImageAsset[] = [
  // Genie Suite
  {
    id: 'studio-combined',
    title: 'Genie Suite',
    description: 'Mind to Media — AI-Powered Production Suite (use for presentations, websites, products, icons)',
    src: studioBanner,
    category: 'logo',
    brand: 'studio',
  },
  // Genie Spark
  {
    id: 'spark-combined',
    title: 'Genie Spark',
    description: 'Ignite Your Ideas — AI Content Generation Engine (use for presentations, websites, products, icons)',
    src: sparkCombined,
    category: 'logo',
    brand: 'spark',
  },
  // Genie Hub
  {
    id: 'arc-combined',
    title: 'Genie Hub',
    description: 'Your Creative Command Center (use for presentations, websites, products, icons)',
    src: arcCombined,
    category: 'logo',
    brand: 'arc',
  },
  // Genie Mind
  {
    id: 'mind-combined',
    title: 'Genie Mind',
    description: 'AI That Understands (use for presentations, websites, products, icons)',
    src: mindCombined,
    category: 'logo',
    brand: 'mind',
  },
  // Genie Vibe
  {
    id: 'vibe-combined',
    title: 'Genie Vibe',
    description: 'Script to Screen (use for presentations, websites, products, icons)',
    src: vibeCombined,
    category: 'logo',
    brand: 'vibe',
  },
  // Ask Genie
  {
    id: 'ask-genie-combined',
    title: 'Ask Genie',
    description: 'Your wish is my command — AI Assistant (use for presentations, websites, products, icons)',
    src: askGenieCombined,
    category: 'logo',
    brand: 'ask-genie',
  },
  // Genie Deck
  {
    id: 'deck-combined',
    title: 'Genie Deck',
    description: 'Ideas to Impact — AI Presentation Generator (use for presentations, websites, products, icons)',
    src: deckCombined,
    category: 'logo',
    brand: 'deck',
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

  const handleDownloadAllLogos = async () => {
    for (const logo of logoAssets) {
      await handleDownloadImage(logo);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    toast.success('All logos downloaded!');
  };

  return (
    <Card className="w-full bg-slate-900 border-slate-700">
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white">Genie Suite Visual Assets</h3>
        <p className="text-sm text-slate-400">Architecture diagrams and logo assets</p>
      </div>
      <CardContent className="p-4">
        <Tabs defaultValue="diagrams" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="diagrams">Architecture Diagrams</TabsTrigger>
            <TabsTrigger value="logos">Logo Assets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="diagrams">
            <div className="flex justify-end mb-4">
              <Button onClick={handleDownloadAll} variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Download All Diagrams
              </Button>
            </div>
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
          
          <TabsContent value="logos">
            <div className="flex justify-end mb-4">
              <Button onClick={handleDownloadAllLogos} variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Download All Logos
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {logoAssets.map((logo) => (
                <Card key={logo.id} className="bg-slate-800 border-slate-700 overflow-hidden">
                  <div className="relative aspect-video bg-white flex items-center justify-center p-4">
                    <img
                      src={logo.src}
                      alt={logo.title}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-white font-medium">{logo.title}</h4>
                        <p className="text-slate-400 text-sm mt-1">{logo.description}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleDownloadImage(logo)}
                        className="gap-1 shrink-0"
                      >
                        <Download className="h-3 w-3" />
                        PNG
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GenieStudioVisualAssets;
