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

// Import Genie Studio logos
import studioSmallIcon from '@/assets/logos/genie-studio-small-icon.png';
import studioBanner from '@/assets/logos/genie-studio-banner.png';
import studioPresentation from '@/assets/logos/genie-studio-presentation-v2.png';
import studioProduct from '@/assets/logos/genie-studio-product.png';

// Import Genie Mind logos
import mindCombined from '@/assets/logos/genie-mind-combined.png';
import mindPresentation from '@/assets/logos/genie-mind-presentation.png';
import mindProduct from '@/assets/logos/genie-mind-product.png';
import mindSmallIcon from '@/assets/logos/genie-mind-small-icon.png';

// Import Genie Arc logos
import arcCombined from '@/assets/logos/genie-arc-combined.png';
import arcPresentation from '@/assets/logos/genie-arc-presentation.png';
import arcProduct from '@/assets/logos/genie-arc-product.png';
import arcSmallIcon from '@/assets/logos/genie-arc-small-icon.png';

// Import Genie Vibe logos
import vibeCombined from '@/assets/logos/genie-vibe-combined.png';
import vibePresentation from '@/assets/logos/genie-vibe-presentation.png';
import vibeProduct from '@/assets/logos/genie-vibe-product.png';
import vibeSmallIcon from '@/assets/logos/genie-vibe-small-icon.png';

interface ImageAsset {
  id: string;
  title: string;
  description: string;
  src: string;
  category: 'architecture' | 'comparison' | 'flow' | 'logo';
  brand?: 'studio' | 'mind' | 'arc' | 'vibe';
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

const logoAssets: ImageAsset[] = [
  // Genie Studio logos
  {
    id: 'studio-small-icon',
    title: 'Genie Studio - Small Icon',
    description: 'Compact icon with tagline "From Mind to Media"',
    src: studioSmallIcon,
    category: 'logo',
    brand: 'studio',
  },
  {
    id: 'studio-banner',
    title: 'Genie Studio - Banner',
    description: 'Wide format for website headers and social media',
    src: studioBanner,
    category: 'logo',
    brand: 'studio',
  },
  {
    id: 'studio-presentation',
    title: 'Genie Studio - Presentation',
    description: 'Large format for presentations and marketing',
    src: studioPresentation,
    category: 'logo',
    brand: 'studio',
  },
  {
    id: 'studio-product',
    title: 'Genie Studio - Product',
    description: 'Compact logo for app interfaces',
    src: studioProduct,
    category: 'logo',
    brand: 'studio',
  },
  // Genie Mind logos
  {
    id: 'mind-combined',
    title: 'Genie Mind - Original',
    description: 'Combined logo with genie lamp and brain - "AI That Understands"',
    src: mindCombined,
    category: 'logo',
    brand: 'mind',
  },
  {
    id: 'mind-presentation',
    title: 'Genie Mind - Presentation',
    description: 'Large format for presentations and marketing',
    src: mindPresentation,
    category: 'logo',
    brand: 'mind',
  },
  {
    id: 'mind-product',
    title: 'Genie Mind - Product',
    description: 'Compact logo for app interfaces',
    src: mindProduct,
    category: 'logo',
    brand: 'mind',
  },
  {
    id: 'mind-small-icon',
    title: 'Genie Mind - Small Icon',
    description: 'Compact icon version',
    src: mindSmallIcon,
    category: 'logo',
    brand: 'mind',
  },
  // Genie Arc logos
  {
    id: 'arc-combined',
    title: 'Genie Arc - Original',
    description: 'Combined logo - "Your Production Journey With Infinite Possibilities"',
    src: arcCombined,
    category: 'logo',
    brand: 'arc',
  },
  {
    id: 'arc-presentation',
    title: 'Genie Arc - Presentation',
    description: 'Large format for presentations and marketing',
    src: arcPresentation,
    category: 'logo',
    brand: 'arc',
  },
  {
    id: 'arc-product',
    title: 'Genie Arc - Product',
    description: 'Compact logo for app interfaces',
    src: arcProduct,
    category: 'logo',
    brand: 'arc',
  },
  {
    id: 'arc-small-icon',
    title: 'Genie Arc - Small Icon',
    description: 'Compact icon version',
    src: arcSmallIcon,
    category: 'logo',
    brand: 'arc',
  },
  // Genie Vibe logos
  {
    id: 'vibe-combined',
    title: 'Genie Vibe - Original',
    description: 'Combined logo - "Script to Screen"',
    src: vibeCombined,
    category: 'logo',
    brand: 'vibe',
  },
  {
    id: 'vibe-presentation',
    title: 'Genie Vibe - Presentation',
    description: 'Large format for presentations and marketing',
    src: vibePresentation,
    category: 'logo',
    brand: 'vibe',
  },
  {
    id: 'vibe-product',
    title: 'Genie Vibe - Product',
    description: 'Compact logo for app interfaces',
    src: vibeProduct,
    category: 'logo',
    brand: 'vibe',
  },
  {
    id: 'vibe-small-icon',
    title: 'Genie Vibe - Small Icon',
    description: 'Compact icon version',
    src: vibeSmallIcon,
    category: 'logo',
    brand: 'vibe',
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
        <h3 className="text-lg font-semibold text-white">Genie Studio Visual Assets</h3>
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
