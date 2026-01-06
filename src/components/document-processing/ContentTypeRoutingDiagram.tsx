import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Maximize2, X, FileImage } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

export const ContentTypeRoutingDiagram = () => {
  const diagramRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
      link.download = 'multi-model-routing-system.png';
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      
      toast.success('Diagram downloaded as PNG!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download diagram');
    }
  };

  const contentTypes = [
    {
      type: 'Tables & Structured',
      icon: '📊',
      color: 'from-blue-600 to-blue-800',
      borderColor: 'border-blue-500',
      models: [
        { name: 'Gemini 2.5 Flash', task: 'Structure Recognition', score: 95 },
        { name: 'AWS Textract', task: 'Cell Extraction', score: 92 },
      ],
      examples: ['Invoices', 'Forms'],
    },
    {
      type: 'Medical Images',
      icon: '🩻',
      color: 'from-purple-600 to-purple-800',
      borderColor: 'border-purple-500',
      models: [
        { name: 'GPT-5', task: 'Radiology Analysis', score: 94 },
        { name: 'Med-PaLM 2', task: 'Clinical Findings', score: 96 },
      ],
      examples: ['X-Rays', 'CT/MRI'],
    },
    {
      type: 'Lab Results',
      icon: '🧪',
      color: 'from-green-600 to-green-800',
      borderColor: 'border-green-500',
      models: [
        { name: 'Claude Sonnet', task: 'Interpretation', score: 93 },
        { name: 'Gemini Pro', task: 'Range Validation', score: 91 },
      ],
      examples: ['Blood Tests', 'Pathology'],
    },
    {
      type: 'Handwritten',
      icon: '✍️',
      color: 'from-orange-600 to-orange-800',
      borderColor: 'border-orange-500',
      models: [
        { name: 'Google Vision', task: 'Handwriting OCR', score: 89 },
        { name: 'GPT-5 Mini', task: 'Context Correction', score: 87 },
      ],
      examples: ['Notes', 'Prescriptions'],
    },
    {
      type: 'Documents',
      icon: '📄',
      color: 'from-cyan-600 to-cyan-800',
      borderColor: 'border-cyan-500',
      models: [
        { name: 'Claude Opus', task: 'Deep Analysis', score: 97 },
        { name: 'Gemini 2.5 Pro', task: 'Summarization', score: 94 },
      ],
      examples: ['Reports', 'Records'],
    },
  ];

  const modelCapabilities = [
    { model: 'Gemini 2.5 Flash', vision: true, reasoning: true, speed: 'Fast', cost: '$', context: '1M', strengths: 'Multimodal, Speed' },
    { model: 'Gemini 2.5 Pro', vision: true, reasoning: true, speed: 'Medium', cost: '$$', context: '2M', strengths: 'Complex Reasoning' },
    { model: 'GPT-5', vision: true, reasoning: true, speed: 'Medium', cost: '$$$', context: '200K', strengths: 'Accuracy, Nuance' },
    { model: 'GPT-5 Mini', vision: true, reasoning: true, speed: 'Fast', cost: '$$', context: '200K', strengths: 'Balanced' },
    { model: 'Claude Sonnet', vision: true, reasoning: true, speed: 'Fast', cost: '$$', context: '200K', strengths: 'Reasoning, Safety' },
    { model: 'Claude Opus', vision: true, reasoning: true, speed: 'Slow', cost: '$$$', context: '200K', strengths: 'Deep Analysis' },
    { model: 'Med-PaLM 2', vision: true, reasoning: true, speed: 'Medium', cost: '$$', context: '32K', strengths: 'Medical Domain' },
    { model: 'AWS Textract', vision: true, reasoning: false, speed: 'Fast', cost: '$', context: 'N/A', strengths: 'Table Extraction' },
  ];

  const routingAlgorithm = [
    { step: 1, name: 'Content Detection', desc: 'ML classifier identifies content type from document structure' },
    { step: 2, name: 'Capability Match', desc: 'Filter models by required capabilities (vision, reasoning, domain)' },
    { step: 3, name: 'Score Calculation', desc: 'Weighted scoring: Accuracy(40%) + Speed(30%) + Cost(30%)' },
    { step: 4, name: 'Load Balancing', desc: 'Check model availability and distribute across providers' },
    { step: 5, name: 'Fallback Chain', desc: 'Define backup models if primary is unavailable or fails' },
  ];

  const DiagramContent = () => (
    <div 
      className="relative w-full overflow-auto rounded-lg border border-slate-700 bg-slate-950 p-6"
      style={{ minWidth: '1100px' }}
    >
      {/* Title */}
      <h2 className="text-xl font-bold text-center text-white mb-1">
        Multi-Model AI Routing System
      </h2>
      <p className="text-slate-400 text-xs text-center mb-4">
        Intelligent content-type detection with dynamic model assignment based on capabilities and performance
      </p>

      {/* Routing Algorithm Section */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-xl p-4 mb-6 border border-indigo-500/30">
        <h3 className="text-indigo-300 font-bold text-sm mb-3 flex items-center gap-2">
          <span className="text-lg">⚙️</span> Routing Algorithm Pipeline
        </h3>
        <div className="flex items-center justify-between gap-2">
          {routingAlgorithm.map((step, idx) => (
            <React.Fragment key={step.step}>
              <div className="flex-1 bg-slate-900/60 rounded-lg p-2 text-center min-w-0">
                <div className="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-bold flex items-center justify-center mx-auto mb-1">
                  {step.step}
                </div>
                <div className="text-[10px] text-white font-medium mb-0.5 truncate">{step.name}</div>
                <div className="text-[8px] text-slate-400 leading-tight">{step.desc}</div>
              </div>
              {idx < routingAlgorithm.length - 1 && (
                <div className="text-indigo-400 text-lg flex-shrink-0">→</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Content Type Cards */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {contentTypes.map((content) => (
          <div key={content.type} className={`bg-gradient-to-br ${content.color} rounded-xl p-3 ${content.borderColor} border-2`}>
            <div className="text-center mb-2">
              <span className="text-2xl block mb-1">{content.icon}</span>
              <h3 className="text-white font-bold text-xs leading-tight">{content.type}</h3>
            </div>

            <div className="bg-black/20 rounded-lg p-1.5 mb-2">
              <div className="flex flex-wrap gap-1 justify-center">
                {content.examples.map((ex) => (
                  <span key={ex} className="text-[8px] bg-white/10 rounded px-1 py-0.5 text-white/80">
                    {ex}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-center my-1">
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-transparent border-t-white/40"></div>
            </div>

            <div className="space-y-1.5">
              {content.models.map((model) => (
                <div key={model.name} className="bg-slate-900/80 rounded-lg p-1.5">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[9px] text-white font-medium">{model.name}</span>
                    <span className="text-[8px] bg-green-500/30 text-green-300 px-1 rounded">{model.score}%</span>
                  </div>
                  <div className="text-[8px] text-slate-400">{model.task}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Model Capabilities Matrix */}
      <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 mb-6">
        <h3 className="text-cyan-300 font-bold text-sm mb-3 flex items-center gap-2">
          <span className="text-lg">📊</span> Model Capabilities & Assignment Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-slate-300 py-2 px-2">Model</th>
                <th className="text-center text-slate-300 py-2 px-2">Vision</th>
                <th className="text-center text-slate-300 py-2 px-2">Reasoning</th>
                <th className="text-center text-slate-300 py-2 px-2">Speed</th>
                <th className="text-center text-slate-300 py-2 px-2">Cost</th>
                <th className="text-center text-slate-300 py-2 px-2">Context</th>
                <th className="text-left text-slate-300 py-2 px-2">Key Strengths</th>
              </tr>
            </thead>
            <tbody>
              {modelCapabilities.map((model) => (
                <tr key={model.model} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="py-2 px-2 text-white font-medium">{model.model}</td>
                  <td className="text-center py-2 px-2">
                    <span className={model.vision ? 'text-green-400' : 'text-red-400'}>{model.vision ? '✓' : '✗'}</span>
                  </td>
                  <td className="text-center py-2 px-2">
                    <span className={model.reasoning ? 'text-green-400' : 'text-red-400'}>{model.reasoning ? '✓' : '✗'}</span>
                  </td>
                  <td className="text-center py-2 px-2">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] ${
                      model.speed === 'Fast' ? 'bg-green-500/20 text-green-300' :
                      model.speed === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>{model.speed}</span>
                  </td>
                  <td className="text-center py-2 px-2 text-yellow-400">{model.cost}</td>
                  <td className="text-center py-2 px-2 text-slate-400">{model.context}</td>
                  <td className="py-2 px-2 text-cyan-300">{model.strengths}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scoring Formula */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 rounded-xl p-4 border border-emerald-500/30">
          <h4 className="text-emerald-300 font-bold text-xs mb-2 flex items-center gap-2">
            <span>🎯</span> Scoring Formula
          </h4>
          <div className="bg-slate-900/60 rounded-lg p-2 text-[9px] font-mono text-slate-300">
            <div>Score = (Accuracy × 0.4) +</div>
            <div className="ml-6">(Speed × 0.3) +</div>
            <div className="ml-6">(1/Cost × 0.3)</div>
          </div>
          <p className="text-[8px] text-slate-400 mt-2">Weights configurable per content type</p>
        </div>

        <div className="bg-gradient-to-br from-amber-900/40 to-amber-800/20 rounded-xl p-4 border border-amber-500/30">
          <h4 className="text-amber-300 font-bold text-xs mb-2 flex items-center gap-2">
            <span>⚡</span> Load Balancing
          </h4>
          <div className="space-y-1 text-[9px] text-slate-300">
            <div className="flex justify-between"><span>Round Robin</span><span className="text-amber-400">Active</span></div>
            <div className="flex justify-between"><span>Rate Limiting</span><span className="text-green-400">100 RPM</span></div>
            <div className="flex justify-between"><span>Circuit Breaker</span><span className="text-green-400">Enabled</span></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-900/40 to-rose-800/20 rounded-xl p-4 border border-rose-500/30">
          <h4 className="text-rose-300 font-bold text-xs mb-2 flex items-center gap-2">
            <span>🔄</span> Fallback Chain
          </h4>
          <div className="space-y-1 text-[9px]">
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-green-500 text-white text-[8px] flex items-center justify-center">1</span>
              <span className="text-white">Primary Model</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-yellow-500 text-white text-[8px] flex items-center justify-center">2</span>
              <span className="text-slate-300">Secondary Model</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-red-500 text-white text-[8px] flex items-center justify-center">3</span>
              <span className="text-slate-400">Fallback Provider</span>
            </div>
          </div>
        </div>
      </div>

      {/* Output Section */}
      <div className="pt-4 border-t border-slate-700">
        <div className="flex justify-center items-center gap-4 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
          <span className="text-slate-400 text-xs uppercase tracking-wide">Unified Output Formats</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
        </div>
        
        <div className="flex justify-center gap-3">
          {[
            { name: 'Structured JSON', color: 'bg-yellow-500/20 border-yellow-500 text-yellow-400' },
            { name: 'FHIR R4', color: 'bg-green-500/20 border-green-500 text-green-400' },
            { name: 'HL7 v2', color: 'bg-purple-500/20 border-purple-500 text-purple-400' },
            { name: 'DICOM SR', color: 'bg-pink-500/20 border-pink-500 text-pink-400' },
            { name: 'Custom Schema', color: 'bg-cyan-500/20 border-cyan-500 text-cyan-400' },
          ].map((format) => (
            <div key={format.name} className={`${format.color} border rounded-lg px-3 py-1.5 text-center`}>
              <span className="text-[10px] font-bold">{format.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-slate-700/50">
        <p className="text-slate-500 text-[9px] text-center">
          Dynamic model routing based on content type detection, capability matching, and real-time performance scoring
        </p>
      </div>
    </div>
  );

  // Fullscreen modal view
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/95 overflow-auto">
        <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">Multi-Model Routing System</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadPNG} className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
              <FileImage className="h-4 w-4 mr-2" />
              Download PNG
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsFullscreen(false)} className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
        <div className="p-8 flex justify-center">
          <div ref={diagramRef}>
            <DiagramContent />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full bg-slate-900 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white text-lg">Multi-Model Routing System</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(true)} className="gap-2 text-slate-300 border-slate-600 hover:bg-slate-800">
            <Maximize2 className="h-4 w-4" />
            Full Size
          </Button>
          <Button variant="default" size="sm" onClick={handleDownloadPNG} className="gap-2 bg-cyan-600 hover:bg-cyan-700">
            <Download className="h-4 w-4" />
            Download PNG
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div ref={diagramRef}>
          <DiagramContent />
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentTypeRoutingDiagram;
