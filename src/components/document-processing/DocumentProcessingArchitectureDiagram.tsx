import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import architectureImage from '@/assets/document-processing-architecture-v2.png';

export const DocumentProcessingArchitectureDiagram = () => {
  const handleDownload = async () => {
    try {
      const response = await fetch(architectureImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'document-processing-architecture.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Architecture diagram downloaded!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download diagram');
    }
  };

  const handleOpenFullSize = () => {
    window.open(architectureImage, '_blank');
  };

  return (
    <Card className="w-full bg-slate-900 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white text-lg">Document Processing Platform Architecture</CardTitle>
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
            alt="Document Processing Platform Architecture - 7 layer diagram showing document types, intelligent routing, processing paradigms, multi-provider OCR, database, sub-agents, and MCP SDK export"
            className="w-full h-auto min-w-[800px]"
          />
        </div>
        <p className="text-slate-500 text-xs mt-3 text-center">
          Built in 56 hours • Configuration-driven • Multi-tenant • Production-ready
        </p>
      </CardContent>
    </Card>
  );
};

export default DocumentProcessingArchitectureDiagram;
