import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Maximize2, X, FileImage, FileCode } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

export const BeforeAfterArchitectureDiagram = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);

  const handleDownloadSVG = () => {
    const svgElement = document.getElementById('before-after-architecture-svg');
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'before-after-architecture.svg';
      link.click();
      URL.revokeObjectURL(url);
      toast.success('SVG downloaded successfully!');
    }
  };

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
      link.download = 'before-after-architecture.png';
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      
      toast.success('PNG downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download PNG');
    }
  };

  const DiagramContent = () => (
    <svg
      id="before-after-architecture-svg"
      viewBox="0 0 1400 900"
      className="w-full h-auto"
      style={{ minHeight: '600px' }}
    >
      <defs>
        <linearGradient id="beforeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6b7280" />
          <stop offset="100%" stopColor="#4b5563" />
        </linearGradient>
        <linearGradient id="afterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="stepGradientOld" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#9ca3af" />
          <stop offset="100%" stopColor="#6b7280" />
        </linearGradient>
        <linearGradient id="stepGradientNew" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="orchestratorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3"/>
        </filter>
      </defs>

      {/* Background */}
      <rect width="1400" height="900" fill="#0f172a" />

      {/* Title */}
      <text x="700" y="45" textAnchor="middle" fill="#f8fafc" fontSize="28" fontWeight="bold">
        Architecture Evolution: Before & After
      </text>

      {/* BEFORE SECTION */}
      <g transform="translate(50, 80)">
        {/* Before Header */}
        <rect x="0" y="0" width="620" height="50" rx="8" fill="url(#beforeGradient)" filter="url(#dropShadow)" />
        <text x="310" y="32" textAnchor="middle" fill="#ffffff" fontSize="20" fontWeight="bold">
          BEFORE: Original Pipeline (v1.0)
        </text>

        {/* Before Pipeline Flow */}
        <g transform="translate(0, 70)">
          {/* Step 1: Document Upload */}
          <rect x="10" y="0" width="140" height="100" rx="8" fill="url(#stepGradientOld)" filter="url(#dropShadow)" />
          <text x="80" y="30" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">Document</text>
          <text x="80" y="48" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">Upload</text>
          <text x="80" y="75" textAnchor="middle" fill="#d1d5db" fontSize="10">Manual</text>
          <text x="80" y="88" textAnchor="middle" fill="#d1d5db" fontSize="10">Type Select</text>

          {/* Arrow 1 */}
          <path d="M155 50 L175 50" stroke="#9ca3af" strokeWidth="3" markerEnd="url(#arrowOld)" />
          <polygon points="175,45 185,50 175,55" fill="#9ca3af" />

          {/* Step 2: Single OCR */}
          <rect x="170" y="0" width="140" height="100" rx="8" fill="url(#stepGradientOld)" filter="url(#dropShadow)" />
          <text x="240" y="30" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">Single OCR</text>
          <text x="240" y="48" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">Engine</text>
          <text x="240" y="75" textAnchor="middle" fill="#d1d5db" fontSize="10">Google Vision</text>
          <text x="240" y="88" textAnchor="middle" fill="#d1d5db" fontSize="10">(Only Option)</text>

          {/* Arrow 2 */}
          <path d="M315 50 L335 50" stroke="#9ca3af" strokeWidth="3" />
          <polygon points="335,45 345,50 335,55" fill="#9ca3af" />

          {/* Step 3: Fixed NLP */}
          <rect x="330" y="0" width="140" height="100" rx="8" fill="url(#stepGradientOld)" filter="url(#dropShadow)" />
          <text x="400" y="30" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">Fixed NLP</text>
          <text x="400" y="48" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">Parser</text>
          <text x="400" y="75" textAnchor="middle" fill="#d1d5db" fontSize="10">Hardcoded</text>
          <text x="400" y="88" textAnchor="middle" fill="#d1d5db" fontSize="10">Field Maps</text>

          {/* Arrow 3 */}
          <path d="M475 50 L495 50" stroke="#9ca3af" strokeWidth="3" />
          <polygon points="495,45 505,50 495,55" fill="#9ca3af" />

          {/* Step 4: JSON Output */}
          <rect x="490" y="0" width="120" height="100" rx="8" fill="url(#stepGradientOld)" filter="url(#dropShadow)" />
          <text x="550" y="30" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">JSON</text>
          <text x="550" y="48" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">Output</text>
          <text x="550" y="75" textAnchor="middle" fill="#d1d5db" fontSize="10">Static</text>
          <text x="550" y="88" textAnchor="middle" fill="#d1d5db" fontSize="10">Export</text>
        </g>

        {/* Limitations Box */}
        <rect x="10" y="190" width="600" height="120" rx="8" fill="#1e293b" stroke="#ef4444" strokeWidth="2" />
        <text x="310" y="215" textAnchor="middle" fill="#ef4444" fontSize="14" fontWeight="bold">⚠ Limitations</text>
        <text x="30" y="245" fill="#f87171" fontSize="11">• Single OCR provider - no fallback options</text>
        <text x="30" y="265" fill="#f87171" fontSize="11">• Manual document type selection required</text>
        <text x="30" y="285" fill="#f87171" fontSize="11">• Hardcoded field mappings - no flexibility</text>
        <text x="320" y="245" fill="#f87171" fontSize="11">• No AI-powered classification</text>
        <text x="320" y="265" fill="#f87171" fontSize="11">• Static export format only</text>
        <text x="320" y="285" fill="#f87171" fontSize="11">• No intelligent routing</text>
      </g>

      {/* AFTER SECTION */}
      <g transform="translate(720, 80)">
        {/* After Header */}
        <rect x="0" y="0" width="620" height="50" rx="8" fill="url(#afterGradient)" filter="url(#dropShadow)" />
        <text x="310" y="32" textAnchor="middle" fill="#ffffff" fontSize="20" fontWeight="bold">
          AFTER: Two-Stage Pipeline (v2.0)
        </text>

        {/* Stage 1 */}
        <g transform="translate(0, 70)">
          <rect x="10" y="0" width="290" height="130" rx="8" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="2" />
          <text x="155" y="25" textAnchor="middle" fill="#60a5fa" fontSize="14" fontWeight="bold">STAGE 1: Universal Extraction</text>
          
          {/* Document Input */}
          <rect x="25" y="40" width="80" height="70" rx="6" fill="url(#stepGradientNew)" />
          <text x="65" y="65" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">Any Doc</text>
          <text x="65" y="80" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">Type</text>
          <text x="65" y="98" textAnchor="middle" fill="#bfdbfe" fontSize="8">Auto-detect</text>

          {/* Arrow */}
          <polygon points="110,75 120,75 115,70 120,75 115,80" fill="#60a5fa" />

          {/* Multi-Engine OCR */}
          <rect x="125" y="40" width="80" height="70" rx="6" fill="url(#stepGradientNew)" />
          <text x="165" y="60" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">Multi-</text>
          <text x="165" y="73" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">Engine</text>
          <text x="165" y="98" textAnchor="middle" fill="#bfdbfe" fontSize="8">OCR</text>

          {/* Arrow */}
          <polygon points="210,75 220,75 215,70 220,75 215,80" fill="#60a5fa" />

          {/* Raw Text */}
          <rect x="210" y="40" width="75" height="70" rx="6" fill="url(#stepGradientNew)" />
          <text x="247" y="65" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">Raw</text>
          <text x="247" y="80" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">Text</text>
          <text x="247" y="98" textAnchor="middle" fill="#bfdbfe" fontSize="8">Unified</text>
        </g>

        {/* Orchestrator (Center) */}
        <g transform="translate(310, 100)">
          <rect x="0" y="0" width="100" height="70" rx="35" fill="url(#orchestratorGradient)" filter="url(#dropShadow)" />
          <text x="50" y="30" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">AI</text>
          <text x="50" y="45" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">Orchestrator</text>
          <text x="50" y="60" textAnchor="middle" fill="#e0e7ff" fontSize="9">Router</text>
        </g>

        {/* Stage 2 */}
        <g transform="translate(320, 70)">
          <rect x="100" y="0" width="200" height="130" rx="8" fill="#1e3a5f" stroke="#8b5cf6" strokeWidth="2" />
          <text x="200" y="25" textAnchor="middle" fill="#a78bfa" fontSize="14" fontWeight="bold">STAGE 2: Specialized AI</text>
          
          {/* AI Models */}
          <rect x="115" y="40" width="55" height="35" rx="4" fill="#4f46e5" />
          <text x="142" y="55" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">Gemini</text>
          <text x="142" y="68" textAnchor="middle" fill="#c7d2fe" fontSize="7">Vision</text>

          <rect x="175" y="40" width="55" height="35" rx="4" fill="#059669" />
          <text x="202" y="55" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">GPT-4</text>
          <text x="202" y="68" textAnchor="middle" fill="#a7f3d0" fontSize="7">Analysis</text>

          <rect x="235" y="40" width="55" height="35" rx="4" fill="#dc2626" />
          <text x="262" y="55" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">Claude</text>
          <text x="262" y="68" textAnchor="middle" fill="#fecaca" fontSize="7">Reasoning</text>

          {/* Structured Output */}
          <rect x="145" y="85" width="115" height="35" rx="4" fill="#0891b2" />
          <text x="202" y="100" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">Structured</text>
          <text x="202" y="113" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">JSON Output</text>
        </g>

        {/* Benefits Box */}
        <rect x="10" y="220" width="600" height="90" rx="8" fill="#1e293b" stroke="#22c55e" strokeWidth="2" />
        <text x="310" y="245" textAnchor="middle" fill="#22c55e" fontSize="14" fontWeight="bold">✓ Benefits</text>
        <text x="30" y="270" fill="#86efac" fontSize="11">• Multi-engine OCR with automatic fallback</text>
        <text x="30" y="290" fill="#86efac" fontSize="11">• AI-powered document classification</text>
        <text x="320" y="270" fill="#86efac" fontSize="11">• Intelligent routing to specialized models</text>
        <text x="320" y="290" fill="#86efac" fontSize="11">• Dynamic structured output</text>
      </g>

      {/* Comparison Arrow */}
      <g transform="translate(670, 200)">
        <rect x="0" y="0" width="60" height="40" rx="20" fill="#fbbf24" />
        <text x="30" y="27" textAnchor="middle" fill="#1e293b" fontSize="24" fontWeight="bold">→</text>
      </g>

      {/* Key Improvements Section */}
      <g transform="translate(50, 500)">
        <rect x="0" y="0" width="1300" height="380" rx="12" fill="#1e293b" stroke="#475569" strokeWidth="1" />
        <text x="650" y="35" textAnchor="middle" fill="#f8fafc" fontSize="20" fontWeight="bold">
          Key Architectural Improvements
        </text>

        {/* Improvement 1 */}
        <g transform="translate(30, 60)">
          <rect x="0" y="0" width="280" height="140" rx="8" fill="#0f172a" stroke="#3b82f6" strokeWidth="1" />
          <circle cx="25" cy="25" r="18" fill="#3b82f6" />
          <text x="25" y="31" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">1</text>
          <text x="55" y="30" fill="#60a5fa" fontSize="14" fontWeight="bold">Multi-Engine OCR</text>
          <text x="15" y="55" fill="#94a3b8" fontSize="11">Before: Single Google Vision</text>
          <text x="15" y="75" fill="#22c55e" fontSize="11">After: Google + Azure + AWS</text>
          <text x="15" y="95" fill="#22c55e" fontSize="11">+ Tesseract with fallback</text>
          <text x="15" y="120" fill="#fbbf24" fontSize="10">↑ 40% accuracy improvement</text>
        </g>

        {/* Improvement 2 */}
        <g transform="translate(340, 60)">
          <rect x="0" y="0" width="280" height="140" rx="8" fill="#0f172a" stroke="#8b5cf6" strokeWidth="1" />
          <circle cx="25" cy="25" r="18" fill="#8b5cf6" />
          <text x="25" y="31" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">2</text>
          <text x="55" y="30" fill="#a78bfa" fontSize="14" fontWeight="bold">AI Classification</text>
          <text x="15" y="55" fill="#94a3b8" fontSize="11">Before: Manual type selection</text>
          <text x="15" y="75" fill="#22c55e" fontSize="11">After: Auto-classification via</text>
          <text x="15" y="95" fill="#22c55e" fontSize="11">ML models (95%+ accuracy)</text>
          <text x="15" y="120" fill="#fbbf24" fontSize="10">↑ 80% faster processing</text>
        </g>

        {/* Improvement 3 */}
        <g transform="translate(650, 60)">
          <rect x="0" y="0" width="280" height="140" rx="8" fill="#0f172a" stroke="#22c55e" strokeWidth="1" />
          <circle cx="25" cy="25" r="18" fill="#22c55e" />
          <text x="25" y="31" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">3</text>
          <text x="55" y="30" fill="#86efac" fontSize="14" fontWeight="bold">Intelligent Routing</text>
          <text x="15" y="55" fill="#94a3b8" fontSize="11">Before: Fixed parser for all</text>
          <text x="15" y="75" fill="#22c55e" fontSize="11">After: Domain-specific AI</text>
          <text x="15" y="95" fill="#22c55e" fontSize="11">models per document type</text>
          <text x="15" y="120" fill="#fbbf24" fontSize="10">↑ 60% better extraction</text>
        </g>

        {/* Improvement 4 */}
        <g transform="translate(960, 60)">
          <rect x="0" y="0" width="280" height="140" rx="8" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
          <circle cx="25" cy="25" r="18" fill="#f59e0b" />
          <text x="25" y="31" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">4</text>
          <text x="55" y="30" fill="#fbbf24" fontSize="14" fontWeight="bold">Dynamic Output</text>
          <text x="15" y="55" fill="#94a3b8" fontSize="11">Before: Static JSON format</text>
          <text x="15" y="75" fill="#22c55e" fontSize="11">After: Schema-adaptive output</text>
          <text x="15" y="95" fill="#22c55e" fontSize="11">with validation & enrichment</text>
          <text x="15" y="120" fill="#fbbf24" fontSize="10">↑ 99% schema compliance</text>
        </g>

        {/* Bottom Stats */}
        <g transform="translate(30, 220)">
          <rect x="0" y="0" width="1240" height="60" rx="8" fill="#0f172a" />
          <text x="155" y="38" textAnchor="middle" fill="#60a5fa" fontSize="14" fontWeight="bold">Processing Speed: 3x faster</text>
          <text x="465" y="38" textAnchor="middle" fill="#a78bfa" fontSize="14" fontWeight="bold">Accuracy: 95%+ extraction</text>
          <text x="775" y="38" textAnchor="middle" fill="#86efac" fontSize="14" fontWeight="bold">Document Types: 15+ supported</text>
          <text x="1085" y="38" textAnchor="middle" fill="#fbbf24" fontSize="14" fontWeight="bold">Uptime: 99.9% SLA</text>
        </g>

        {/* Version Labels */}
        <g transform="translate(30, 300)">
          <rect x="0" y="0" width="200" height="50" rx="6" fill="#6b7280" />
          <text x="100" y="32" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="bold">v1.0 - Legacy</text>
        </g>
        <g transform="translate(1040, 300)">
          <rect x="0" y="0" width="200" height="50" rx="6" fill="url(#afterGradient)" />
          <text x="100" y="32" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="bold">v2.0 - Current</text>
        </g>

        {/* Arrow between versions */}
        <line x1="240" y1="325" x2="1030" y2="325" stroke="#475569" strokeWidth="3" strokeDasharray="10,5" />
        <polygon points="1030,320 1040,325 1030,330" fill="#475569" />
      </g>
    </svg>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-auto p-4">
        <div className="flex justify-end mb-4 gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadPNG}>
            <FileImage className="h-4 w-4 mr-2" />
            Download PNG
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadSVG}>
            <FileCode className="h-4 w-4 mr-2" />
            Download SVG
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(false)}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
        <div ref={diagramRef}>
          <DiagramContent />
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Before & After Architecture</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadPNG}>
            <FileImage className="h-4 w-4 mr-2" />
            PNG
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadSVG}>
            <FileCode className="h-4 w-4 mr-2" />
            SVG
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(true)}>
            <Maximize2 className="h-4 w-4 mr-2" />
            Full Size
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DiagramContent />
      </CardContent>
    </Card>
  );
};
