import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import architectureImage from '@/assets/solution-architecture-overview.png';

export const SolutionArchitectureDiagram = () => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = architectureImage;
    link.download = 'solution-architecture-overview.png';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Solution Architecture diagram downloaded!');
  };

  const handleOpenFullSize = () => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head><title>AI Document Processing Solution Architecture</title></head>
          <body style="margin:0;background:#0f172a;display:flex;justify-content:center;align-items:center;min-height:100vh;">
            <img src="${architectureImage}" style="max-width:100%;height:auto;" alt="Solution Architecture" />
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  return (
    <Card className="w-full bg-slate-900 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white text-lg">AI Document Processing Solution Architecture</CardTitle>
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
            src={architectureImage} 
            alt="AI Document Processing Solution Architecture - Input Channels, Processing Layer, Data & Integrations"
            className="w-full h-auto min-w-[800px]"
          />
        </div>
        <div className="mt-4 grid grid-cols-4 gap-3 text-sm">
          <div className="bg-teal-900/30 border border-teal-700 rounded-lg p-3">
            <h4 className="font-semibold text-teal-400 mb-1">Input Channels</h4>
            <p className="text-slate-400 text-xs">Web, Mobile, API, Email, Batch</p>
          </div>
          <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-3">
            <h4 className="font-semibold text-purple-400 mb-1">AI Processing</h4>
            <p className="text-slate-400 text-xs">Two-stage classification & routing</p>
          </div>
          <div className="bg-green-900/30 border border-green-700 rounded-lg p-3">
            <h4 className="font-semibold text-green-400 mb-1">Supabase Backend</h4>
            <p className="text-slate-400 text-xs">Database, Auth, Storage, Edge Functions</p>
          </div>
          <div className="bg-orange-900/30 border border-orange-700 rounded-lg p-3">
            <h4 className="font-semibold text-orange-400 mb-1">Integrations</h4>
            <p className="text-slate-400 text-xs">EHR, RCM, Analytics Dashboards</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SolutionArchitectureDiagram;
