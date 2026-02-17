import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import pipelineImage from '@/assets/invoice-rcm-processing-pipeline-v2.png';

export const InvoiceRCMProcessingPipelineDiagram = () => {
  const handleDownload = async () => {
    try {
      const response = await fetch(pipelineImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'invoice-rcm-processing-pipeline.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Pipeline diagram downloaded successfully');
    } catch (error) {
      toast.error('Failed to download diagram');
    }
  };

  const handleOpenFullSize = () => {
    window.open(pipelineImage, '_blank');
  };

  return (
    <Card className="p-6 bg-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Invoice/Billing RCM Analysis Pipeline</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleOpenFullSize}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Full Size
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PNG
          </Button>
        </div>
      </div>
      <div className="rounded-lg overflow-hidden border border-border">
        <img
          src={pipelineImage}
          alt="Invoice/Billing RCM Analysis Pipeline showing two-stage processing: Google Cloud Vision OCR for table, line item, and CSV extraction, Google Gemini NLP for financial entity extraction and ICD code mapping, Code Intelligence (ICD-10, CPT, Adjustment, Denial, Modifier codes), RCM Analysis for aging, payment tracking, denial management, adjustment analysis, and AR analytics"
          className="w-full h-auto"
        />
      </div>
      <p className="text-sm text-muted-foreground mt-4">
        Invoice/Billing documents and CSV tables flow through Table & Line Item Extraction (Stage 1: OCR) → Financial Entity Extraction + ICD Code Mapping (Stage 2: NLP) → Code Intelligence (ICD-10, CPT, Adjustment, Denial, Modifier Codes) → RCM Analysis (Aging, Payment Tracking, Denial Management, Adjustment Analysis, AR Analytics) → Structured Output with ICD Mapping & Adjustment Reports
      </p>
    </Card>
  );
};
