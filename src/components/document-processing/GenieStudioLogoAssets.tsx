import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

// Import centralized product definitions - SINGLE SOURCE OF TRUTH
import { GENIE_PRODUCTS, PRODUCT_DISPLAY_ORDER } from '@/constants/genie-products';

interface LogoAsset {
  id: string;
  title: string;
  tagline: string;
  description: string;
  src: string;
}

// Build logo assets from centralized product definitions
const logoAssets: LogoAsset[] = PRODUCT_DISPLAY_ORDER.map(productKey => {
  const product = GENIE_PRODUCTS[productKey];
  return {
    id: `genie-${productKey}`,
    title: product.name,
    tagline: product.tagline,
    description: `${product.name} logo for presentations, websites, products, and all use cases`,
    src: product.logos.combined,
  };
});

export const GenieStudioLogoAssets = () => {
  const handleDownloadPNG = async (logo: LogoAsset) => {
    try {
      const response = await fetch(logo.src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${logo.id}-combined.png`;
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
          <h3 className="text-lg font-semibold text-white">Genie Suite Logo Assets</h3>
          <p className="text-sm text-slate-400">Finalized logos with taglines — Use for all purposes (presentations, websites, products, icons)</p>
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
                    <p className="text-purple-400 text-sm mt-1 font-medium">{logo.tagline}</p>
                    <p className="text-slate-400 text-xs mt-1">{logo.description}</p>
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
