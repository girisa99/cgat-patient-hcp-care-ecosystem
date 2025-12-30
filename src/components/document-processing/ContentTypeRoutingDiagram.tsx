import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

export const ContentTypeRoutingDiagram = () => {
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
      link.download = 'content-type-model-routing.png';
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      
      toast.success('Diagram downloaded as PNG!');
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
            <title>Content-Type Model Routing</title>
            <style>
              body { margin: 0; padding: 20px; background: #0f172a; display: flex; justify-content: center; }
            </style>
          </head>
          <body>${diagramRef.current.outerHTML}</body>
        </html>
      `);
    }
  };

  const contentTypes = [
    {
      type: 'Tables & Structured Data',
      icon: '📊',
      color: 'from-blue-600 to-blue-800',
      borderColor: 'border-blue-500',
      models: [
        { name: 'Google Gemini', task: 'Table Structure Recognition', icon: '✨' },
        { name: 'AWS Textract', task: 'Table Cell Extraction', icon: '📊' },
      ],
      examples: ['Invoices', 'Forms', 'Spreadsheets'],
    },
    {
      type: 'Medical Images',
      icon: '🩻',
      color: 'from-purple-600 to-purple-800',
      borderColor: 'border-purple-500',
      models: [
        { name: 'GPT-4 Vision', task: 'Radiology Analysis', icon: '🧠' },
        { name: 'Google Med-PaLM', task: 'Clinical Findings', icon: '🏥' },
      ],
      examples: ['X-Rays', 'CT Scans', 'MRI', 'Ultrasound'],
    },
    {
      type: 'Lab Results',
      icon: '🧪',
      color: 'from-green-600 to-green-800',
      borderColor: 'border-green-500',
      models: [
        { name: 'Anthropic Claude', task: 'Result Interpretation', icon: '🔮' },
        { name: 'Google Gemini', task: 'Reference Range Validation', icon: '✨' },
      ],
      examples: ['Blood Tests', 'Urinalysis', 'Pathology Reports'],
    },
    {
      type: 'General Images',
      icon: '🖼️',
      color: 'from-cyan-600 to-cyan-800',
      borderColor: 'border-cyan-500',
      models: [
        { name: 'Azure Computer Vision', task: 'Image Classification', icon: '☁️' },
        { name: 'GPT-4 Vision', task: 'Context Understanding', icon: '🧠' },
      ],
      examples: ['Photos', 'Diagrams', 'Signatures'],
    },
    {
      type: 'Handwritten Text',
      icon: '✍️',
      color: 'from-orange-600 to-orange-800',
      borderColor: 'border-orange-500',
      models: [
        { name: 'Google Vision API', task: 'Handwriting OCR', icon: '🔍' },
        { name: 'OpenAI GPT-4', task: 'Context Correction', icon: '🧠' },
      ],
      examples: ['Notes', 'Prescriptions', 'Annotations'],
    },
  ];

  return (
    <Card className="w-full bg-slate-900 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white text-lg">Content-Type Based Model Routing</CardTitle>
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
          style={{ minWidth: '900px' }}
        >
          {/* Title */}
          <h2 className="text-xl font-bold text-center text-white mb-2">
            Content-Type Based AI Model Routing
          </h2>
          <p className="text-slate-400 text-xs text-center mb-6">
            Intelligent routing of different content types to specialized AI models
          </p>

          {/* Content Type Cards */}
          <div className="grid grid-cols-5 gap-4">
            {contentTypes.map((content) => (
              <div key={content.type} className={`bg-gradient-to-br ${content.color} rounded-xl p-4 ${content.borderColor} border-2`}>
                {/* Content Type Header */}
                <div className="text-center mb-3">
                  <span className="text-3xl block mb-1">{content.icon}</span>
                  <h3 className="text-white font-bold text-sm leading-tight">{content.type}</h3>
                </div>

                {/* Examples */}
                <div className="bg-black/20 rounded-lg p-2 mb-3">
                  <div className="text-[9px] text-white/60 uppercase tracking-wide mb-1">Examples</div>
                  <div className="flex flex-wrap gap-1">
                    {content.examples.map((ex) => (
                      <span key={ex} className="text-[9px] bg-white/10 rounded px-1.5 py-0.5 text-white/80">
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Arrow Down */}
                <div className="flex justify-center my-2">
                  <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-transparent border-t-white/40"></div>
                </div>

                {/* Assigned Models */}
                <div className="space-y-2">
                  {content.models.map((model) => (
                    <div key={model.name} className="bg-slate-900/80 rounded-lg p-2">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-sm">{model.icon}</span>
                        <span className="text-[10px] text-white font-medium">{model.name}</span>
                      </div>
                      <div className="text-[9px] text-slate-400 ml-5">{model.task}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Output Section */}
          <div className="mt-6 pt-4 border-t border-slate-700">
            <div className="flex justify-center items-center gap-4 mb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
              <span className="text-slate-400 text-xs uppercase tracking-wide">Unified Output</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
            </div>
            
            <div className="flex justify-center gap-4">
              {[
                { name: 'Structured JSON', color: 'bg-yellow-500/20 border-yellow-500 text-yellow-400' },
                { name: 'FHIR R4', color: 'bg-green-500/20 border-green-500 text-green-400' },
                { name: 'HL7 v2', color: 'bg-purple-500/20 border-purple-500 text-purple-400' },
                { name: 'DICOM SR', color: 'bg-pink-500/20 border-pink-500 text-pink-400' },
              ].map((format) => (
                <div key={format.name} className={`${format.color} border rounded-lg px-4 py-2 text-center`}>
                  <span className="text-xs font-bold">{format.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-slate-700/50">
            <p className="text-slate-500 text-[10px] text-center">
              Each content type is automatically detected and routed to specialized AI models for optimal extraction and analysis
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentTypeRoutingDiagram;
