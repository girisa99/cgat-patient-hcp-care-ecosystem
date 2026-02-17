import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Maximize2, FileSearch, Brain, Zap, Database, ArrowDown, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

export const TwoStagePipelineFlowDiagram: React.FC = () => {
  const diagramRef = useRef<HTMLDivElement>(null);

  const handleDownloadPNG = async () => {
    if (!diagramRef.current) return;
    
    try {
      toast.info('Generating PNG...');
      const canvas = await html2canvas(diagramRef.current, {
        backgroundColor: '#0f172a',
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        foreignObjectRendering: true,
      });
      
      const link = document.createElement('a');
      link.download = 'two-stage-ai-pipeline-diagram.png';
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('PNG downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download PNG.');
    }
  };

  const handleDownloadSVG = () => {
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="700" fill="url(#bgGrad)"/>
  
  <text x="600" y="50" text-anchor="middle" fill="#ffffff" font-size="28" font-weight="bold">Two-Stage Vision AI Pipeline</text>
  <text x="600" y="80" text-anchor="middle" fill="#94a3b8" font-size="14">Intelligent Document Classification → Optimized Multi-Model Processing</text>
  
  <!-- Legend -->
  <g transform="translate(50, 620)">
    <rect width="1100" height="60" rx="8" fill="#1e293b" stroke="#475569"/>
    <text x="20" y="25" fill="#94a3b8" font-size="12" font-weight="bold">Pipeline Stages:</text>
    <rect x="140" y="12" width="20" height="20" rx="4" fill="#14b8a6"/>
    <text x="170" y="27" fill="#94a3b8" font-size="11">Stage 1: Classification</text>
    <rect x="320" y="12" width="20" height="20" rx="4" fill="#a855f7"/>
    <text x="350" y="27" fill="#94a3b8" font-size="11">Stage 2: Model Routing</text>
    <rect x="500" y="12" width="20" height="20" rx="4" fill="#10b981"/>
    <text x="530" y="27" fill="#94a3b8" font-size="11">Output: Structured Data</text>
    
    <text x="20" y="48" fill="#94a3b8" font-size="12" font-weight="bold">Models:</text>
    <rect x="80" y="35" width="16" height="16" rx="2" fill="#3b82f6"/>
    <text x="102" y="48" fill="#94a3b8" font-size="10">Claude 3.5</text>
    <rect x="170" y="35" width="16" height="16" rx="2" fill="#22c55e"/>
    <text x="192" y="48" fill="#94a3b8" font-size="10">Gemini Pro</text>
    <rect x="270" y="35" width="16" height="16" rx="2" fill="#f97316"/>
    <text x="292" y="48" fill="#94a3b8" font-size="10">GPT-4o</text>
    <rect x="350" y="35" width="16" height="16" rx="2" fill="#ec4899"/>
    <text x="372" y="48" fill="#94a3b8" font-size="10">Fallback</text>
  </g>
  
  <!-- Stage 1 -->
  <g transform="translate(300, 130)">
    <rect width="600" height="120" rx="12" fill="#134e4a" stroke="#14b8a6" stroke-width="2"/>
    <rect x="15" y="15" width="50" height="50" rx="8" fill="#14b8a6"/>
    <text x="40" y="48" text-anchor="middle" fill="#ffffff" font-size="24" font-weight="bold">1</text>
    <text x="85" y="35" fill="#5eead4" font-size="18" font-weight="bold">Stage 1: Classification + OCR</text>
    <text x="85" y="55" fill="#99f6e4" font-size="12">Gemini 2.5 Flash (Fast &amp; Accurate)</text>
  </g>
  
  <!-- Arrow -->
  <path d="M600 260 L600 290" stroke="#a855f7" stroke-width="3" fill="none"/>
  <polygon points="592,285 600,300 608,285" fill="#a855f7"/>
  
  <!-- Stage 2 -->
  <g transform="translate(200, 310)">
    <rect width="800" height="140" rx="12" fill="#4c1d95" stroke="#a855f7" stroke-width="2"/>
    <rect x="15" y="15" width="50" height="50" rx="8" fill="#a855f7"/>
    <text x="40" y="48" text-anchor="middle" fill="#ffffff" font-size="24" font-weight="bold">2</text>
    <text x="85" y="35" fill="#c4b5fd" font-size="18" font-weight="bold">Stage 2: Intelligent Model Routing</text>
    <text x="85" y="55" fill="#ddd6fe" font-size="12">Dynamic Selection Based on Document Type</text>
    
    <!-- Model boxes -->
    <rect x="50" y="75" width="150" height="50" rx="6" fill="#1e3a8a" stroke="#3b82f6"/>
    <text x="125" y="105" text-anchor="middle" fill="#93c5fd" font-size="11" font-weight="bold">Claude 3.5</text>
    <rect x="220" y="75" width="150" height="50" rx="6" fill="#14532d" stroke="#22c55e"/>
    <text x="295" y="105" text-anchor="middle" fill="#86efac" font-size="11" font-weight="bold">Gemini Pro</text>
    <rect x="390" y="75" width="150" height="50" rx="6" fill="#7c2d12" stroke="#f97316"/>
    <text x="465" y="105" text-anchor="middle" fill="#fdba74" font-size="11" font-weight="bold">GPT-4o</text>
    <rect x="560" y="75" width="150" height="50" rx="6" fill="#831843" stroke="#ec4899"/>
    <text x="635" y="105" text-anchor="middle" fill="#f9a8d4" font-size="11" font-weight="bold">Fallback</text>
  </g>
  
  <!-- Arrow -->
  <path d="M600 460 L600 490" stroke="#10b981" stroke-width="3" fill="none"/>
  <polygon points="592,485 600,500 608,485" fill="#10b981"/>
  
  <!-- Output -->
  <g transform="translate(300, 510)">
    <rect width="600" height="90" rx="12" fill="#064e3b" stroke="#10b981" stroke-width="2"/>
    <text x="300" y="35" text-anchor="middle" fill="#34d399" font-size="18" font-weight="bold">Structured Output</text>
    <text x="300" y="60" text-anchor="middle" fill="#a7f3d0" font-size="12">JSON Schema • Field Mapping • Analytics</text>
  </g>
</svg>`;
    
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'two-stage-ai-pipeline-diagram.svg';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('SVG downloaded successfully!');
  };

  const handleOpenFullSize = async () => {
    if (!diagramRef.current) return;
    
    try {
      toast.info('Generating full size view...');
      const canvas = await html2canvas(diagramRef.current, {
        backgroundColor: '#0f172a',
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        foreignObjectRendering: true,
      });
      
      const dataUrl = canvas.toDataURL('image/png');
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head><title>Two-Stage AI Pipeline Diagram</title></head>
            <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#0f172a;">
              <img src="${dataUrl}" style="max-width:100%;height:auto;" />
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    } catch (error) {
      console.error('Failed to open full size:', error);
      toast.error('Failed to open full size view');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">Two-Stage AI Document Processing Pipeline</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleOpenFullSize}>
            <Maximize2 className="h-4 w-4 mr-2" />
            Full Size
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadSVG}>
            <Download className="h-4 w-4 mr-2" />
            SVG
          </Button>
          <Button variant="default" size="sm" onClick={handleDownloadPNG}>
            <Download className="h-4 w-4 mr-2" />
            PNG
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div 
          ref={diagramRef}
          className="p-8 rounded-lg min-w-[900px]"
          style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}
        >
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Two-Stage Vision AI Pipeline
            </h2>
            <p className="text-slate-400 text-sm">
              Intelligent Document Classification → Optimized Multi-Model Processing
            </p>
          </div>

          {/* Input Section */}
          <div className="flex justify-center mb-6">
            <div className="bg-slate-800 border-2 border-slate-600 rounded-xl p-6 w-[300px] text-center">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileSearch className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Document Input</h3>
              <p className="text-sm text-slate-400">PDF, Images, Scanned Documents</p>
            </div>
          </div>

          {/* Arrow Down */}
          <div className="flex justify-center mb-6">
            <ArrowDown className="h-8 w-8 text-teal-400" />
          </div>

          {/* Stage 1 */}
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-teal-900/50 to-teal-800/50 border-2 border-teal-500 rounded-xl p-6 w-[500px]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-teal-400">Stage 1: Classification + OCR</h3>
                  <p className="text-teal-300 text-sm">Gemini 2.5 Flash (Fast & Accurate)</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-teal-900/50 rounded-lg p-3">
                  <p className="text-teal-300 font-semibold text-sm">Document Type</p>
                  <p className="text-white text-xs mt-1">Auto-Detection</p>
                </div>
                <div className="bg-teal-900/50 rounded-lg p-3">
                  <p className="text-teal-300 font-semibold text-sm">Text Extraction</p>
                  <p className="text-white text-xs mt-1">OCR Processing</p>
                </div>
                <div className="bg-teal-900/50 rounded-lg p-3">
                  <p className="text-teal-300 font-semibold text-sm">Confidence</p>
                  <p className="text-white text-xs mt-1">Score Analysis</p>
                </div>
              </div>
            </div>
          </div>

          {/* Arrow Down */}
          <div className="flex justify-center mb-6">
            <ArrowDown className="h-8 w-8 text-purple-400" />
          </div>

          {/* Stage 2 */}
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border-2 border-purple-500 rounded-xl p-6 w-[700px]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-purple-400">Stage 2: Intelligent Model Routing</h3>
                  <p className="text-purple-300 text-sm">Dynamic Selection Based on Document Type</p>
                </div>
              </div>
              
              {/* Model Options */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-blue-900/50 border border-blue-500 rounded-lg p-3 text-center">
                  <Brain className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                  <p className="text-blue-300 font-semibold text-xs">Claude 3.5</p>
                  <p className="text-slate-400 text-xs mt-1">Complex Analysis</p>
                </div>
                <div className="bg-green-900/50 border border-green-500 rounded-lg p-3 text-center">
                  <Zap className="h-6 w-6 text-green-400 mx-auto mb-2" />
                  <p className="text-green-300 font-semibold text-xs">Gemini Pro</p>
                  <p className="text-slate-400 text-xs mt-1">Vision Tasks</p>
                </div>
                <div className="bg-orange-900/50 border border-orange-500 rounded-lg p-3 text-center">
                  <Brain className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                  <p className="text-orange-300 font-semibold text-xs">GPT-4o</p>
                  <p className="text-slate-400 text-xs mt-1">Medical Docs</p>
                </div>
                <div className="bg-pink-900/50 border border-pink-500 rounded-lg p-3 text-center">
                  <Database className="h-6 w-6 text-pink-400 mx-auto mb-2" />
                  <p className="text-pink-300 font-semibold text-xs">Fallback</p>
                  <p className="text-slate-400 text-xs mt-1">Auto-Retry</p>
                </div>
              </div>
            </div>
          </div>

          {/* Arrow Down */}
          <div className="flex justify-center mb-6">
            <ArrowDown className="h-8 w-8 text-emerald-400" />
          </div>

          {/* Output Section */}
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-emerald-900/50 to-emerald-800/50 border-2 border-emerald-500 rounded-xl p-6 w-[500px]">
              <div className="flex items-center justify-center gap-4 mb-4">
                <Database className="h-8 w-8 text-emerald-400" />
                <h3 className="text-xl font-bold text-emerald-400">Structured Output</h3>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-emerald-900/50 rounded-lg p-3">
                  <p className="text-emerald-300 font-semibold text-sm">JSON Schema</p>
                  <p className="text-white text-xs mt-1">Validated Data</p>
                </div>
                <div className="bg-emerald-900/50 rounded-lg p-3">
                  <p className="text-emerald-300 font-semibold text-sm">Field Mapping</p>
                  <p className="text-white text-xs mt-1">Auto-Populated</p>
                </div>
                <div className="bg-emerald-900/50 rounded-lg p-3">
                  <p className="text-emerald-300 font-semibold text-sm">Analytics</p>
                  <p className="text-white text-xs mt-1">Model Metrics</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Footer */}
          <div className="mt-8 flex justify-center gap-8 text-center">
            <div className="bg-slate-800/50 rounded-lg px-6 py-3">
              <p className="text-2xl font-bold text-teal-400">94%</p>
              <p className="text-slate-400 text-xs">Classification Accuracy</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg px-6 py-3">
              <p className="text-2xl font-bold text-purple-400">2.3s</p>
              <p className="text-slate-400 text-xs">Avg Processing Time</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg px-6 py-3">
              <p className="text-2xl font-bold text-emerald-400">12+</p>
              <p className="text-slate-400 text-xs">Document Types</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-4 text-center">
          Two-stage architecture: Fast classification followed by optimized model selection for each document type
        </p>
      </CardContent>
    </Card>
  );
};

export default TwoStagePipelineFlowDiagram;
