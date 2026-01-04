import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

// Import finalized combined logos (same logo used for all purposes)
import genieStudioBanner from '@/assets/logos/genie-studio-banner.png';
import genieMindCombined from '@/assets/logos/genie-mind-combined.png';
import genieVibeCombined from '@/assets/logos/genie-vibe-combined.png';
import genieArcCombined from '@/assets/logos/genie-arc-combined.png';

interface LogoAsset {
  id: string;
  title: string;
  tagline: string;
  description: string;
  src: string;
}

const logoAssets: LogoAsset[] = [
  {
    id: 'genie-studio',
    title: 'Genie Studio',
    tagline: 'Mind to Media — AI-Powered Production Suite',
    description: 'The complete suite banner logo for presentations, websites, products, and all use cases',
    src: genieStudioBanner,
  },
  {
    id: 'genie-arc',
    title: 'Genie Arc',
    tagline: 'Your Production Journey With Infinite Possibilities',
    description: 'Planning & scheduling module logo for presentations, websites, products, and all use cases',
    src: genieArcCombined,
  },
  {
    id: 'genie-mind',
    title: 'Genie Mind',
    tagline: 'AI That Understands',
    description: 'Pre-production module logo for presentations, websites, products, and all use cases',
    src: genieMindCombined,
  },
  {
    id: 'genie-vibe',
    title: 'Genie Vibe',
    tagline: 'Script to Screen',
    description: 'Production module logo for presentations, websites, products, and all use cases',
    src: genieVibeCombined,
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
