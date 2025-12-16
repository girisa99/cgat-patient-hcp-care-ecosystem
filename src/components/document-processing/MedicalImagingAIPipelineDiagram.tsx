import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import pipelineImage from '@/assets/medical-imaging-ai-pipeline.png';

export const MedicalImagingAIPipelineDiagram = () => {
  const handleDownload = async () => {
    try {
      const response = await fetch(pipelineImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'medical-imaging-ai-pipeline.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Medical Imaging AI Pipeline diagram downloaded!');
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
        <CardTitle className="text-white text-lg">Medical Imaging Vision Analysis Pipeline</CardTitle>
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
            alt="Medical Imaging AI Pipeline - CNN + Vision Transformers + LLM for Clinical Insights"
            className="w-full h-auto min-w-[800px]"
          />
        </div>
        <p className="text-slate-500 text-xs mt-3 text-center">
          Multi-Model AI Stack: CNN (ResNet, VGG, EfficientNet) + Vision AI (ViT, Google, Azure, AWS) + LLM (Gemini, GPT-4 Vision)
        </p>
      </CardContent>
    </Card>
  );
};

export default MedicalImagingAIPipelineDiagram;
