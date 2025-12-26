import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const PUBLIC_IMAGE_URL = '/diagrams/document-processing-features-overview.png';

export const FeaturesOverviewDiagram = () => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = PUBLIC_IMAGE_URL;
    link.download = 'document-processing-features-overview.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Features Overview diagram downloaded!');
  };

  const handleOpenFullSize = () => {
    window.open(PUBLIC_IMAGE_URL, '_blank');
  };

  return (
    <Card className="w-full bg-slate-900 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white text-lg">AI Document Processing Solution Features</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleOpenFullSize} className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Full Size
          </Button>
          <Button variant="default" size="sm" onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Download PNG
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="relative w-full overflow-auto rounded-lg border border-slate-700">
          <img 
            src={PUBLIC_IMAGE_URL} 
            alt="AI Document Processing Solution Features - Auto-Detection, Multi-Model Routing, Analytics, Extraction, Fallback, Extensibility"
            className="w-full h-auto min-w-[800px]"
          />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-teal-500"></div>
              <span className="text-slate-300">Auto-Detection: Gemini-powered classification</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-purple-500"></div>
              <span className="text-slate-300">Multi-Model: Vision/LLM/Specialized pipelines</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-orange-500"></div>
              <span className="text-slate-300">Analytics: Real-time model usage tracking</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span className="text-slate-300">Extraction: Type-specific structured output</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500"></div>
              <span className="text-slate-300">Fallback: Automatic model failover</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-cyan-500"></div>
              <span className="text-slate-300">Extensible: Plugin architecture for new types</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeaturesOverviewDiagram;
