import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Save } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

export const TwoStagePipelineSVGDiagram = () => {
  const diagramRef = useRef<HTMLDivElement>(null);

  const handleDownloadPNG = async () => {
    if (!diagramRef.current) return;
    
    try {
      const canvas = await html2canvas(diagramRef.current, {
        backgroundColor: '#0f172a',
        scale: 3,
        useCORS: true,
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = 'two-stage-ai-pipeline-architecture.png';
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      
      toast.success('Diagram downloaded as PNG to your downloads folder!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download diagram');
    }
  };

  const handleOpenFullSize = () => {
    const newWindow = window.open('', '_blank');
    if (newWindow && diagramRef.current) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Two-Stage AI Document Processing Pipeline</title>
            <style>
              body { margin: 0; padding: 20px; background: #0f172a; display: flex; justify-content: center; }
            </style>
          </head>
          <body>${diagramRef.current.outerHTML}</body>
        </html>
      `);
    }
  };

  return (
    <Card className="w-full bg-slate-900 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white text-lg">Two-Stage AI Document Processing Pipeline</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleOpenFullSize} className="gap-2 text-slate-300 border-slate-600 hover:bg-slate-800">
            <ExternalLink className="h-4 w-4" />
            Full Size
          </Button>
          <Button variant="default" size="sm" onClick={handleDownloadPNG} className="gap-2 bg-cyan-600 hover:bg-cyan-700">
            <Download className="h-4 w-4" />
            Download PNG
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div 
          ref={diagramRef}
          className="relative w-full overflow-auto rounded-lg border border-slate-700 bg-slate-950 p-8"
          style={{ minWidth: '900px' }}
        >
          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-white mb-8">
            Two-Stage AI Document Processing Pipeline
          </h2>

          <div className="flex items-start justify-between gap-4">
            {/* Input Documents */}
            <div className="flex flex-col gap-3 min-w-[120px]">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide text-center">Input</h4>
              {['Medical Records', 'Prescriptions', 'Insurance Cards', 'Invoices'].map((doc) => (
                <div key={doc} className="bg-slate-800 border border-slate-600 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">📄</div>
                  <span className="text-xs text-slate-300">{doc}</span>
                </div>
              ))}
            </div>

            {/* Arrow */}
            <div className="flex items-center self-center">
              <div className="w-8 h-0.5 bg-cyan-500"></div>
              <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-cyan-500"></div>
            </div>

            {/* Stage 1: Extraction */}
            <div className="flex-1 max-w-[280px]">
              <div className="bg-gradient-to-br from-blue-900/50 to-blue-950/50 border-2 border-blue-500 rounded-xl p-5">
                <h3 className="text-lg font-bold text-blue-400 mb-4 text-center">
                  STAGE 1: EXTRACTION
                </h3>
                <div className="text-xs text-slate-400 text-center mb-4">Multi-Provider OCR</div>
                
                <div className="space-y-3">
                  {[
                    { name: 'Google Vision API', icon: '🔍' },
                    { name: 'Azure Computer Vision', icon: '☁️' },
                    { name: 'AWS Textract', icon: '📊' },
                  ].map((provider) => (
                    <div key={provider.name} className="bg-slate-800/80 border border-slate-600 rounded-lg p-3 flex items-center gap-3">
                      <span className="text-xl">{provider.icon}</span>
                      <span className="text-sm text-white font-medium">{provider.name}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-blue-500/30">
                  <div className="text-xs text-slate-400 text-center">Output: Raw Text + Layout</div>
                </div>
              </div>
            </div>

            {/* Arrow between stages */}
            <div className="flex items-center self-center">
              <div className="w-12 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-cyan-500"></div>
            </div>

            {/* Stage 2: Intelligence */}
            <div className="flex-1 max-w-[280px]">
              <div className="bg-gradient-to-br from-cyan-900/50 to-cyan-950/50 border-2 border-cyan-500 rounded-xl p-5">
                <h3 className="text-lg font-bold text-cyan-400 mb-4 text-center">
                  STAGE 2: INTELLIGENCE
                </h3>
                <div className="text-xs text-slate-400 text-center mb-4">NLP & Entity Extraction</div>
                
                <div className="space-y-3">
                  {[
                    { name: 'Google Gemini Pro', icon: '✨' },
                    { name: 'OpenAI GPT-4', icon: '🧠' },
                    { name: 'Entity Extraction', icon: '🏷️' },
                  ].map((provider) => (
                    <div key={provider.name} className="bg-slate-800/80 border border-slate-600 rounded-lg p-3 flex items-center gap-3">
                      <span className="text-xl">{provider.icon}</span>
                      <span className="text-sm text-white font-medium">{provider.name}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-cyan-500/30">
                  <div className="text-xs text-slate-400 text-center">Output: Structured Data</div>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center self-center">
              <div className="w-8 h-0.5 bg-cyan-500"></div>
              <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-cyan-500"></div>
            </div>

            {/* Output Formats */}
            <div className="flex flex-col gap-3 min-w-[100px]">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide text-center">Output</h4>
              {[
                { name: 'JSON', color: 'bg-yellow-500/20 border-yellow-500 text-yellow-400' },
                { name: 'FHIR R4', color: 'bg-green-500/20 border-green-500 text-green-400' },
                { name: 'HL7', color: 'bg-purple-500/20 border-purple-500 text-purple-400' },
                { name: 'CSV', color: 'bg-orange-500/20 border-orange-500 text-orange-400' },
              ].map((format) => (
                <div key={format.name} className={`${format.color} border rounded-lg p-2 text-center`}>
                  <span className="text-sm font-bold">{format.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Labels */}
          <div className="mt-8 pt-4 border-t border-slate-700 flex justify-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs text-slate-400">OCR Providers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
              <span className="text-xs text-slate-400">AI/NLP Models</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-slate-400">Healthcare Standards</span>
            </div>
          </div>
        </div>

        <p className="text-slate-500 text-xs mt-3 text-center">
          Stage 1: Multi-Provider OCR → Stage 2: Gemini/GPT-4 NLP → Structured Output (JSON, FHIR, HL7)
        </p>
      </CardContent>
    </Card>
  );
};

export default TwoStagePipelineSVGDiagram;
