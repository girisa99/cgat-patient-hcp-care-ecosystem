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
          className="relative w-full overflow-auto rounded-lg border border-slate-700 bg-slate-950 p-6"
          style={{ minWidth: '1100px' }}
        >
          {/* Title */}
          <h2 className="text-xl font-bold text-center text-white mb-6">
            Two-Stage AI Document Processing Pipeline
          </h2>

          <div className="flex items-stretch justify-between gap-3">
            {/* Input Documents */}
            <div className="flex flex-col gap-2 min-w-[100px]">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide text-center mb-1">Input</h4>
              {['Medical Records', 'Prescriptions', 'Insurance Cards', 'Invoices'].map((doc) => (
                <div key={doc} className="bg-slate-800 border border-slate-600 rounded-lg p-2 text-center">
                  <div className="text-lg mb-0.5">📄</div>
                  <span className="text-[10px] text-slate-300 leading-tight">{doc}</span>
                </div>
              ))}
            </div>

            {/* Arrow */}
            <div className="flex items-center self-center">
              <div className="w-6 h-0.5 bg-blue-500"></div>
              <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-l-[8px] border-transparent border-l-blue-500"></div>
            </div>

            {/* Stage 1: OCR Extraction */}
            <div className="flex-1 max-w-[220px]">
              <div className="bg-gradient-to-br from-blue-900/50 to-blue-950/50 border-2 border-blue-500 rounded-xl p-4 h-full">
                <h3 className="text-base font-bold text-blue-400 mb-2 text-center">
                  STAGE 1: EXTRACTION
                </h3>
                <div className="text-[10px] text-slate-400 text-center mb-3">User Selects OCR Provider</div>
                
                <div className="space-y-2">
                  {[
                    { name: 'Google Vision API', icon: '🔍', selected: true },
                    { name: 'Azure Computer Vision', icon: '☁️', selected: false },
                    { name: 'AWS Textract', icon: '📊', selected: false },
                  ].map((provider) => (
                    <div key={provider.name} className={`bg-slate-800/80 border rounded-lg p-2 flex items-center gap-2 ${provider.selected ? 'border-blue-400 ring-1 ring-blue-400' : 'border-slate-600'}`}>
                      <span className="text-base">{provider.icon}</span>
                      <span className="text-xs text-white">{provider.name}</span>
                      {provider.selected && <span className="ml-auto text-blue-400 text-xs">✓</span>}
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-2 border-t border-blue-500/30">
                  <div className="text-[10px] text-slate-400 text-center">Output: Raw Text + Layout</div>
                </div>
              </div>
            </div>

            {/* Arrow with label */}
            <div className="flex flex-col items-center self-center">
              <span className="text-[9px] text-slate-500 mb-1">Raw Text</span>
              <div className="w-10 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-l-[8px] border-transparent border-l-cyan-500"></div>
            </div>

            {/* Stage 2: Intelligent NLP Routing */}
            <div className="flex-1 max-w-[280px]">
              <div className="bg-gradient-to-br from-cyan-900/50 to-cyan-950/50 border-2 border-cyan-500 rounded-xl p-4 h-full">
                <h3 className="text-base font-bold text-cyan-400 mb-2 text-center">
                  STAGE 2: INTELLIGENCE
                </h3>
                <div className="text-[10px] text-slate-400 text-center mb-3">Task-Based Model Routing</div>
                
                <div className="space-y-2">
                  {[
                    { name: 'Google Gemini', icon: '✨', task: 'Entity Extraction', example: 'Patient Name, DOB, MRN' },
                    { name: 'OpenAI GPT-4', icon: '🧠', task: 'Classification & Summary', example: 'Document Type, Key Points' },
                    { name: 'Anthropic Claude', icon: '🔮', task: 'Reasoning & Validation', example: 'Cross-Reference, Compliance' },
                  ].map((provider) => (
                    <div key={provider.name} className="bg-slate-800/80 border border-slate-600 rounded-lg p-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">{provider.icon}</span>
                        <span className="text-xs text-white font-medium">{provider.name}</span>
                      </div>
                      <div className="text-[10px] text-cyan-400 ml-6">{provider.task}</div>
                      <div className="text-[9px] text-slate-500 ml-6 italic">e.g., {provider.example}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-2 border-t border-cyan-500/30">
                  <div className="text-[10px] text-slate-400 text-center">Output: Structured Data</div>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center self-center">
              <div className="w-6 h-0.5 bg-cyan-500"></div>
              <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-l-[8px] border-transparent border-l-cyan-500"></div>
            </div>

            {/* Output Formats */}
            <div className="flex flex-col gap-2 min-w-[110px]">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide text-center mb-1">Output</h4>
              {[
                { name: 'JSON', color: 'bg-yellow-500/20 border-yellow-500 text-yellow-400', example: 'API Response' },
                { name: 'FHIR R4', color: 'bg-green-500/20 border-green-500 text-green-400', example: 'Healthcare' },
                { name: 'HL7', color: 'bg-purple-500/20 border-purple-500 text-purple-400', example: 'Clinical' },
                { name: 'CSV', color: 'bg-orange-500/20 border-orange-500 text-orange-400', example: 'Analytics' },
              ].map((format) => (
                <div key={format.name} className={`${format.color} border rounded-lg p-2 text-center`}>
                  <span className="text-xs font-bold block">{format.name}</span>
                  <span className="text-[9px] opacity-70">{format.example}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Legend */}
          <div className="mt-6 pt-4 border-t border-slate-700">
            <div className="flex justify-center gap-6 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-[10px] text-slate-400">OCR Providers (User Selection)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                <span className="text-[10px] text-slate-400">AI/NLP Models (Task-Based Routing)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-[10px] text-slate-400">Healthcare Standards Output</span>
              </div>
            </div>
            <p className="text-slate-500 text-[10px] text-center">
              Stage 1: User selects OCR provider → Stage 2: Raw text routed to AI models by task type → Structured output in multiple formats
            </p>
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
