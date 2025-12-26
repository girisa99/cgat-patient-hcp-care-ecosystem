import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

export const TwoStagePipelineSVG = () => {
  const diagramRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!diagramRef.current) return;
    
    try {
      const canvas = await html2canvas(diagramRef.current, {
        backgroundColor: '#1a1a2e',
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = 'two-stage-ai-pipeline-architecture.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Diagram downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download diagram');
    }
  };

  const handleFullScreen = () => {
    if (diagramRef.current) {
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>Two-Stage AI Pipeline</title></head>
            <body style="margin:0;background:#1a1a2e;display:flex;justify-content:center;align-items:center;min-height:100vh;">
              ${diagramRef.current.outerHTML}
            </body>
          </html>
        `);
      }
    }
  };

  return (
    <Card className="w-full bg-slate-900 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white text-lg">Two-Stage AI Document Processing Pipeline</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleFullScreen} className="gap-2">
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
        <div 
          ref={diagramRef}
          className="relative w-full overflow-auto rounded-lg p-8"
          style={{ backgroundColor: '#1a1a2e', minWidth: '900px' }}
        >
          {/* Title */}
          <h2 className="text-center text-white text-2xl font-bold mb-8">
            Two-Stage AI Document Processing Pipeline
          </h2>
          
          {/* Main Flow Container */}
          <div className="flex items-center justify-center gap-4">
            
            {/* Stage 1: Classification */}
            <div className="bg-teal-600 rounded-xl p-6 w-72 text-center">
              <h3 className="text-white font-bold text-lg mb-4">Stage 1: Classification</h3>
              
              {/* Document Icon */}
              <div className="bg-teal-700/50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              
              <p className="text-white text-sm mb-2">Document Classification<br/>with Confidence Scoring</p>
              <p className="text-teal-200 text-xs">Gemini 2.5 Flash AI</p>
            </div>
            
            {/* Arrow 1 */}
            <div className="flex flex-col items-center">
              <span className="text-slate-400 text-xs mb-1">Stage 1</span>
              <svg className="w-16 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
            
            {/* Stage 2: Intelligent Routing */}
            <div className="bg-purple-600 rounded-xl p-6 w-80 text-center">
              <h3 className="text-white font-bold text-lg mb-4">Stage 2: Intelligent Routing</h3>
              
              {/* Brain Icon */}
              <div className="bg-purple-700/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              
              {/* Pipeline Options */}
              <div className="flex justify-center gap-3 mb-2">
                <div className="bg-purple-800 rounded-lg px-3 py-2">
                  <p className="text-white text-xs font-medium">Vision Pipeline</p>
                </div>
                <div className="bg-purple-800 rounded-lg px-3 py-2">
                  <p className="text-white text-xs font-medium">LLM Pipeline</p>
                </div>
                <div className="bg-purple-800 rounded-lg px-3 py-2">
                  <p className="text-white text-xs font-medium">Specialized Pipeline</p>
                </div>
              </div>
            </div>
            
            {/* Arrow 2 */}
            <div className="flex flex-col items-center">
              <span className="text-slate-400 text-xs mb-1 text-center">Model Usage<br/>Tracking</span>
              <svg className="w-16 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
            
            {/* Stage 3: Structured Output */}
            <div className="bg-blue-600 rounded-xl p-6 w-72 text-center">
              <h3 className="text-white font-bold text-lg mb-4">Structured Output</h3>
              
              {/* Dashboard Icon */}
              <div className="bg-blue-700/50 rounded-lg p-4 mx-auto mb-4">
                <div className="flex gap-2 mb-2">
                  <div className="bg-blue-400 h-2 w-8 rounded"></div>
                  <div className="bg-green-400 h-2 w-6 rounded"></div>
                  <div className="bg-orange-400 h-2 w-10 rounded"></div>
                </div>
                <div className="flex gap-2 mb-2">
                  <div className="bg-purple-400 h-2 w-6 rounded"></div>
                  <div className="bg-teal-400 h-2 w-12 rounded"></div>
                </div>
                <div className="flex justify-center gap-3 mt-3">
                  <div className="w-8 h-8 rounded-full border-4 border-blue-400 border-t-transparent"></div>
                  <div className="w-8 h-8 rounded-full border-4 border-orange-400 border-t-transparent"></div>
                </div>
              </div>
              
              <p className="text-white text-sm">JSON Output + Analytics</p>
              <p className="text-blue-200 text-xs">Performance Metrics</p>
            </div>
          </div>
        </div>
        
        {/* Legend */}
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

export default TwoStagePipelineSVG;
