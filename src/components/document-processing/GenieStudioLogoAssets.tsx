import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

// Import all logo versions
import smallIcon from '@/assets/logos/genie-studio-small-icon.png';
import banner from '@/assets/logos/genie-studio-banner.png';
import presentation from '@/assets/logos/genie-studio-presentation-v2.png';
import product from '@/assets/logos/genie-studio-product.png';

interface LogoAsset {
  id: string;
  title: string;
  description: string;
  src: string;
  dimensions: string;
}

const logoAssets: LogoAsset[] = [
  {
    id: 'small-icon',
    title: 'Small Icon',
    description: 'Compact icon for favicons, app icons, and small displays',
    src: smallIcon,
    dimensions: '1:1 Square',
  },
  {
    id: 'banner',
    title: 'Banner Logo',
    description: 'Wide format for website headers and social media banners',
    src: banner,
    dimensions: '16:9 Wide',
  },
  {
    id: 'presentation',
    title: 'Presentation Logo',
    description: 'Large format for presentations and marketing materials',
    src: presentation,
    dimensions: '1:1 Square',
  },
  {
    id: 'product',
    title: 'Product Logo',
    description: 'Compact logo for app interfaces and product headers',
    src: product,
    dimensions: '4:3 Landscape',
  },
];

export const GenieStudioLogoAssets = () => {
  const handleDownloadPNG = async (logo: LogoAsset) => {
    try {
      const response = await fetch(logo.src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `genie-studio-${logo.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Downloaded ${logo.title} as PNG`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download image');
    }
  };

  const handleDownloadAll = async () => {
    for (const logo of logoAssets) {
      await handleDownloadPNG(logo);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    toast.success('All logos downloaded!');
  };

  return (
    <Card className="w-full bg-slate-900 border-slate-700">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Genie Studio Logo Assets</h3>
          <p className="text-sm text-slate-400">Download logos in PNG format</p>
        </div>
        <Button onClick={handleDownloadAll} variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Download All (PNG)
        </Button>
      </div>
      <CardContent className="p-4">
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
                    <p className="text-slate-500 text-xs mt-1">{logo.dimensions}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleDownloadPNG(logo)}
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
      </CardContent>
    </Card>
  );
};

export default GenieStudioLogoAssets;
