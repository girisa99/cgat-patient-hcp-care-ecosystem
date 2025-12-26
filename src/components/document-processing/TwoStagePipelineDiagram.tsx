import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import pipelineImage from '@/assets/two-stage-ai-pipeline-architecture.png';

export const TwoStagePipelineDiagram = () => {
  const handleDownload = async () => {
    try {
      const response = await fetch(pipelineImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'two-stage-ai-pipeline-architecture.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Two-Stage Pipeline diagram downloaded!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download diagram');
    }
  };

  const handleOpenFullSize = () => {
    window.open(pipelineImage, '_blank');
  };

  return (
    <Card className="w-full bg-slate-900 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white text-lg">Two-Stage AI Document Processing Pipeline</CardTitle>
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
            src={pipelineImage} 
            alt="Two-Stage AI Document Processing Pipeline - Classification → Intelligent Routing → Structured Output"
            className="w-full h-auto min-w-[800px]"
          />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="bg-teal-900/30 border border-teal-700 rounded-lg p-3">
            <h4 className="font-semibold text-teal-400 mb-1">Stage 1: Classification</h4>
            <p className="text-slate-400 text-xs">Gemini 2.5 Flash auto-detects document type with confidence scoring</p>
          </div>
          <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-3">
            <h4 className="font-semibold text-purple-400 mb-1">Stage 2: Intelligent Routing</h4>
            <p className="text-slate-400 text-xs">Routes to optimal pipeline: Vision, LLM, or Specialized based on document type</p>
          </div>
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
            <h4 className="font-semibold text-blue-400 mb-1">Output: Analytics</h4>
            <p className="text-slate-400 text-xs">Structured JSON output with model usage tracking and performance metrics</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TwoStagePipelineDiagram;
