import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Maximize2, X, FileImage, FileCode } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

export const SolutionArchitectureDiagram = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);

  const handleDownloadSVG = () => {
    const svgElement = document.getElementById('solution-architecture-svg');
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'solution-architecture-overview.svg';
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
      link.download = 'solution-architecture-overview.png';
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
      id="solution-architecture-svg"
      viewBox="0 0 1400 1100"
      className="w-full h-auto"
      style={{ minWidth: '900px' }}
    >
      <defs>
        <linearGradient id="inputGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0d9488" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="routingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="supabaseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#16a34a" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="mcpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#db2777" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="integrationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ea580c" stopOpacity="0.1" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
        </marker>
      </defs>

      {/* Background */}
      <rect width="1400" height="1100" fill="#0f172a" />

      {/* Title */}
      <text x="700" y="40" textAnchor="middle" fill="#f8fafc" fontSize="24" fontWeight="bold">
        AI Document Processing Solution Architecture
      </text>
      <text x="700" y="65" textAnchor="middle" fill="#94a3b8" fontSize="14">
        Multi-Model Routing • Sub-Agent Orchestration • MCP SDK Integration
      </text>

      {/* Layer 1: Input Channels */}
      <g transform="translate(50, 90)">
        <rect x="0" y="0" width="1300" height="120" rx="8" fill="url(#inputGradient)" stroke="#14b8a6" strokeWidth="2" />
        <text x="20" y="25" fill="#14b8a6" fontSize="16" fontWeight="bold">INPUT CHANNELS</text>
        
        {/* Input Channel Boxes */}
        {[
          { x: 20, label: 'Web Portal', icon: '🌐' },
          { x: 180, label: 'Mobile App', icon: '📱' },
          { x: 340, label: 'REST API', icon: '🔌' },
          { x: 500, label: 'Email Gateway', icon: '📧' },
          { x: 660, label: 'Fax/Scan', icon: '📠' },
          { x: 820, label: 'Batch Upload', icon: '📦' },
          { x: 980, label: 'HL7/FHIR', icon: '🏥' },
          { x: 1140, label: 'Webhook', icon: '🔗' },
        ].map((channel, i) => (
          <g key={i} transform={`translate(${channel.x}, 40)`}>
            <rect x="0" y="0" width="140" height="65" rx="6" fill="#0f172a" stroke="#14b8a6" strokeWidth="1" />
            <text x="70" y="25" textAnchor="middle" fill="#f8fafc" fontSize="20">{channel.icon}</text>
            <text x="70" y="50" textAnchor="middle" fill="#5eead4" fontSize="11">{channel.label}</text>
          </g>
        ))}
      </g>

      {/* Flow Arrow 1 */}
      <path d="M700 215 L700 240" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)" />

      {/* Layer 2: AI Processing Layer with Multi-Model Routing */}
      <g transform="translate(50, 250)">
        <rect x="0" y="0" width="1300" height="200" rx="8" fill="url(#aiGradient)" stroke="#a855f7" strokeWidth="2" />
        <text x="20" y="25" fill="#a855f7" fontSize="16" fontWeight="bold">AI PROCESSING LAYER - TWO-STAGE CLASSIFICATION</text>
        
        {/* Stage 1: Content Detection */}
        <g transform="translate(20, 40)">
          <rect x="0" y="0" width="400" height="145" rx="6" fill="#0f172a" stroke="#a855f7" strokeWidth="1" />
          <text x="200" y="20" textAnchor="middle" fill="#c4b5fd" fontSize="13" fontWeight="bold">STAGE 1: CONTENT DETECTION</text>
          
          <rect x="10" y="30" width="120" height="50" rx="4" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="1" />
          <text x="70" y="50" textAnchor="middle" fill="#a78bfa" fontSize="10">OCR Engine</text>
          <text x="70" y="65" textAnchor="middle" fill="#64748b" fontSize="9">Tesseract/AWS</text>
          
          <rect x="140" y="30" width="120" height="50" rx="4" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="1" />
          <text x="200" y="50" textAnchor="middle" fill="#a78bfa" fontSize="10">NLP Pipeline</text>
          <text x="200" y="65" textAnchor="middle" fill="#64748b" fontSize="9">Entity Extract</text>
          
          <rect x="270" y="30" width="120" height="50" rx="4" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="1" />
          <text x="330" y="50" textAnchor="middle" fill="#a78bfa" fontSize="10">Vision AI</text>
          <text x="330" y="65" textAnchor="middle" fill="#64748b" fontSize="9">Image Analysis</text>
          
          <rect x="10" y="90" width="380" height="45" rx="4" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="1" />
          <text x="200" y="110" textAnchor="middle" fill="#c4b5fd" fontSize="11">Content Types: Medical • Insurance • Prescription • Invoice • ID • Imaging</text>
          <text x="200" y="125" textAnchor="middle" fill="#64748b" fontSize="9">Confidence Scoring → Threshold: 85%</text>
        </g>

        {/* Arrow between stages */}
        <path d="M430 115 L450 115" stroke="#a855f7" strokeWidth="2" markerEnd="url(#arrowhead)" />

        {/* Stage 2: Model Routing */}
        <g transform="translate(460, 40)">
          <rect x="0" y="0" width="400" height="145" rx="6" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
          <text x="200" y="20" textAnchor="middle" fill="#fcd34d" fontSize="13" fontWeight="bold">STAGE 2: MULTI-MODEL ROUTING</text>
          
          <rect x="10" y="30" width="90" height="50" rx="4" fill="#1c1917" stroke="#f59e0b" strokeWidth="1" />
          <text x="55" y="48" textAnchor="middle" fill="#fcd34d" fontSize="9">Gemini 2.5</text>
          <text x="55" y="62" textAnchor="middle" fill="#64748b" fontSize="8">Vision+Text</text>
          
          <rect x="108" y="30" width="90" height="50" rx="4" fill="#1c1917" stroke="#f59e0b" strokeWidth="1" />
          <text x="153" y="48" textAnchor="middle" fill="#fcd34d" fontSize="9">GPT-5</text>
          <text x="153" y="62" textAnchor="middle" fill="#64748b" fontSize="8">Reasoning</text>
          
          <rect x="206" y="30" width="90" height="50" rx="4" fill="#1c1917" stroke="#f59e0b" strokeWidth="1" />
          <text x="251" y="48" textAnchor="middle" fill="#fcd34d" fontSize="9">Claude 4</text>
          <text x="251" y="62" textAnchor="middle" fill="#64748b" fontSize="8">Analysis</text>
          
          <rect x="304" y="30" width="86" height="50" rx="4" fill="#1c1917" stroke="#f59e0b" strokeWidth="1" />
          <text x="347" y="48" textAnchor="middle" fill="#fcd34d" fontSize="9">Med-PaLM</text>
          <text x="347" y="62" textAnchor="middle" fill="#64748b" fontSize="8">Medical</text>
          
          <rect x="10" y="90" width="380" height="45" rx="4" fill="#1c1917" stroke="#f59e0b" strokeWidth="1" />
          <text x="200" y="108" textAnchor="middle" fill="#fcd34d" fontSize="10">Scoring: (Accuracy×0.4) + (Speed×0.3) + (1/Cost×0.3)</text>
          <text x="200" y="125" textAnchor="middle" fill="#64748b" fontSize="9">Load Balancing • Rate Limiting • Circuit Breaker • Fallback Chain</text>
        </g>

        {/* Arrow to Sub-Agents */}
        <path d="M870 115 L890 115" stroke="#a855f7" strokeWidth="2" markerEnd="url(#arrowhead)" />

        {/* Sub-Agent Orchestration */}
        <g transform="translate(900, 40)">
          <rect x="0" y="0" width="380" height="145" rx="6" fill="#0f172a" stroke="#ec4899" strokeWidth="1" />
          <text x="190" y="20" textAnchor="middle" fill="#f472b6" fontSize="13" fontWeight="bold">SUB-AGENT ORCHESTRATION</text>
          
          <rect x="10" y="30" width="115" height="50" rx="4" fill="#1e1b4b" stroke="#ec4899" strokeWidth="1" />
          <text x="67" y="48" textAnchor="middle" fill="#f9a8d4" fontSize="9">Onboarding</text>
          <text x="67" y="62" textAnchor="middle" fill="#64748b" fontSize="8">Agent</text>
          
          <rect x="133" y="30" width="115" height="50" rx="4" fill="#1e1b4b" stroke="#ec4899" strokeWidth="1" />
          <text x="190" y="48" textAnchor="middle" fill="#f9a8d4" fontSize="9">Document</text>
          <text x="190" y="62" textAnchor="middle" fill="#64748b" fontSize="8">Agent</text>
          
          <rect x="256" y="30" width="114" height="50" rx="4" fill="#1e1b4b" stroke="#ec4899" strokeWidth="1" />
          <text x="313" y="48" textAnchor="middle" fill="#f9a8d4" fontSize="9">Billing/RCM</text>
          <text x="313" y="62" textAnchor="middle" fill="#64748b" fontSize="8">Agent</text>
          
          <rect x="10" y="90" width="360" height="45" rx="4" fill="#1e1b4b" stroke="#ec4899" strokeWidth="1" />
          <text x="190" y="108" textAnchor="middle" fill="#f472b6" fontSize="10">Coordinator: Task Distribution • State Management</text>
          <text x="190" y="125" textAnchor="middle" fill="#64748b" fontSize="9">Inter-Agent Communication • Human-in-Loop Escalation</text>
        </g>
      </g>

      {/* Flow Arrow 2 */}
      <path d="M700 455 L700 480" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)" />

      {/* Layer 3: Supabase Backend & MCP */}
      <g transform="translate(50, 490)">
        <rect x="0" y="0" width="640" height="160" rx="8" fill="url(#supabaseGradient)" stroke="#22c55e" strokeWidth="2" />
        <text x="20" y="25" fill="#22c55e" fontSize="16" fontWeight="bold">SUPABASE BACKEND</text>
        
        {/* Supabase Components */}
        <g transform="translate(20, 40)">
          <rect x="0" y="0" width="140" height="55" rx="4" fill="#0f172a" stroke="#22c55e" strokeWidth="1" />
          <text x="70" y="22" textAnchor="middle" fill="#4ade80" fontSize="11">PostgreSQL DB</text>
          <text x="70" y="40" textAnchor="middle" fill="#64748b" fontSize="9">RLS • Triggers</text>
          
          <rect x="150" y="0" width="140" height="55" rx="4" fill="#0f172a" stroke="#22c55e" strokeWidth="1" />
          <text x="220" y="22" textAnchor="middle" fill="#4ade80" fontSize="11">Edge Functions</text>
          <text x="220" y="40" textAnchor="middle" fill="#64748b" fontSize="9">Deno Runtime</text>
          
          <rect x="300" y="0" width="140" height="55" rx="4" fill="#0f172a" stroke="#22c55e" strokeWidth="1" />
          <text x="370" y="22" textAnchor="middle" fill="#4ade80" fontSize="11">Auth</text>
          <text x="370" y="40" textAnchor="middle" fill="#64748b" fontSize="9">JWT • MFA</text>
          
          <rect x="450" y="0" width="140" height="55" rx="4" fill="#0f172a" stroke="#22c55e" strokeWidth="1" />
          <text x="520" y="22" textAnchor="middle" fill="#4ade80" fontSize="11">Storage</text>
          <text x="520" y="40" textAnchor="middle" fill="#64748b" fontSize="9">CDN • Buckets</text>
        </g>
        
        <g transform="translate(20, 100)">
          <rect x="0" y="0" width="290" height="45" rx="4" fill="#0f172a" stroke="#22c55e" strokeWidth="1" />
          <text x="145" y="18" textAnchor="middle" fill="#4ade80" fontSize="10">Real-time Subscriptions</text>
          <text x="145" y="35" textAnchor="middle" fill="#64748b" fontSize="9">WebSocket • Broadcast • Presence</text>
          
          <rect x="300" y="0" width="290" height="45" rx="4" fill="#0f172a" stroke="#22c55e" strokeWidth="1" />
          <text x="445" y="18" textAnchor="middle" fill="#4ade80" fontSize="10">Vector Search (pgvector)</text>
          <text x="445" y="35" textAnchor="middle" fill="#64748b" fontSize="9">RAG • Semantic Search • Embeddings</text>
        </g>
      </g>

      {/* MCP SDK Export Layer */}
      <g transform="translate(710, 490)">
        <rect x="0" y="0" width="640" height="160" rx="8" fill="url(#mcpGradient)" stroke="#ec4899" strokeWidth="2" />
        <text x="20" y="25" fill="#ec4899" fontSize="16" fontWeight="bold">MCP SDK EXPORT LAYER</text>
        
        <g transform="translate(20, 40)">
          <rect x="0" y="0" width="140" height="55" rx="4" fill="#0f172a" stroke="#ec4899" strokeWidth="1" />
          <text x="70" y="22" textAnchor="middle" fill="#f9a8d4" fontSize="11">Agent Packaging</text>
          <text x="70" y="40" textAnchor="middle" fill="#64748b" fontSize="9">Config Export</text>
          
          <rect x="150" y="0" width="140" height="55" rx="4" fill="#0f172a" stroke="#ec4899" strokeWidth="1" />
          <text x="220" y="22" textAnchor="middle" fill="#f9a8d4" fontSize="11">Tool Registry</text>
          <text x="220" y="40" textAnchor="middle" fill="#64748b" fontSize="9">MCP Tools</text>
          
          <rect x="300" y="0" width="140" height="55" rx="4" fill="#0f172a" stroke="#ec4899" strokeWidth="1" />
          <text x="370" y="22" textAnchor="middle" fill="#f9a8d4" fontSize="11">Prompt Templates</text>
          <text x="370" y="40" textAnchor="middle" fill="#64748b" fontSize="9">System Prompts</text>
          
          <rect x="450" y="0" width="140" height="55" rx="4" fill="#0f172a" stroke="#ec4899" strokeWidth="1" />
          <text x="520" y="22" textAnchor="middle" fill="#f9a8d4" fontSize="11">Resource Export</text>
          <text x="520" y="40" textAnchor="middle" fill="#64748b" fontSize="9">Knowledge Base</text>
        </g>
        
        <g transform="translate(20, 100)">
          <rect x="0" y="0" width="290" height="45" rx="4" fill="#0f172a" stroke="#ec4899" strokeWidth="1" />
          <text x="145" y="18" textAnchor="middle" fill="#f9a8d4" fontSize="10">Claude Desktop Integration</text>
          <text x="145" y="35" textAnchor="middle" fill="#64748b" fontSize="9">stdio Transport • JSON-RPC</text>
          
          <rect x="300" y="0" width="290" height="45" rx="4" fill="#0f172a" stroke="#ec4899" strokeWidth="1" />
          <text x="445" y="18" textAnchor="middle" fill="#f9a8d4" fontSize="10">External AI Platforms</text>
          <text x="445" y="35" textAnchor="middle" fill="#64748b" fontSize="9">OpenAI • Anthropic • Custom LLMs</text>
        </g>
      </g>

      {/* Flow Arrow 3 */}
      <path d="M700 655 L700 680" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)" />

      {/* Layer 4: Output & Integrations */}
      <g transform="translate(50, 690)">
        <rect x="0" y="0" width="1300" height="140" rx="8" fill="url(#integrationGradient)" stroke="#f97316" strokeWidth="2" />
        <text x="20" y="25" fill="#f97316" fontSize="16" fontWeight="bold">INTEGRATIONS & OUTPUTS</text>
        
        {/* Integration Boxes */}
        {[
          { x: 20, label: 'EHR Systems', sub: 'Epic • Cerner • Allscripts', icon: '🏥' },
          { x: 200, label: 'RCM/Billing', sub: 'Claims • Payments', icon: '💳' },
          { x: 380, label: 'Analytics', sub: 'Dashboards • Reports', icon: '📊' },
          { x: 560, label: 'Notifications', sub: 'Email • SMS • Push', icon: '🔔' },
          { x: 740, label: 'Workflow Engine', sub: 'n8n • Temporal', icon: '⚙️' },
          { x: 920, label: 'Label Studio', sub: 'Human Review', icon: '🏷️' },
          { x: 1100, label: 'Audit Trail', sub: 'Compliance Logs', icon: '📋' },
        ].map((item, i) => (
          <g key={i} transform={`translate(${item.x}, 40)`}>
            <rect x="0" y="0" width="165" height="85" rx="6" fill="#0f172a" stroke="#f97316" strokeWidth="1" />
            <text x="82" y="25" textAnchor="middle" fill="#f8fafc" fontSize="20">{item.icon}</text>
            <text x="82" y="50" textAnchor="middle" fill="#fdba74" fontSize="12">{item.label}</text>
            <text x="82" y="70" textAnchor="middle" fill="#64748b" fontSize="9">{item.sub}</text>
          </g>
        ))}
      </g>

      {/* Layer 5: Security & Compliance Footer */}
      <g transform="translate(50, 850)">
        <rect x="0" y="0" width="1300" height="80" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="1" />
        <text x="650" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="bold">SECURITY & COMPLIANCE</text>
        
        {[
          { x: 100, label: 'HIPAA', color: '#22c55e' },
          { x: 250, label: 'SOC 2 Type II', color: '#3b82f6' },
          { x: 420, label: 'End-to-End Encryption', color: '#a855f7' },
          { x: 620, label: 'Audit Logging', color: '#f59e0b' },
          { x: 790, label: 'Role-Based Access', color: '#ec4899' },
          { x: 970, label: 'Data Residency', color: '#14b8a6' },
          { x: 1140, label: 'BAA Available', color: '#f97316' },
        ].map((item, i) => (
          <g key={i} transform={`translate(${item.x}, 40)`}>
            <rect x="0" y="0" width="130" height="30" rx="15" fill={item.color} fillOpacity="0.2" stroke={item.color} strokeWidth="1" />
            <text x="65" y="20" textAnchor="middle" fill={item.color} fontSize="11">{item.label}</text>
          </g>
        ))}
      </g>

      {/* Flow Lines connecting layers */}
      <g stroke="#475569" strokeWidth="1" strokeDasharray="4,4" opacity="0.5">
        <line x1="200" y1="450" x2="200" y2="490" />
        <line x1="500" y1="450" x2="500" y2="490" />
        <line x1="900" y1="450" x2="900" y2="490" />
        <line x1="1200" y1="450" x2="1200" y2="490" />
      </g>

      {/* Version info */}
      <text x="1340" y="1080" textAnchor="end" fill="#475569" fontSize="10">
        v2.0 - Updated with Multi-Model Routing & MCP SDK
      </text>
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
    <Card className="w-full bg-slate-900 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white text-lg">AI Document Processing Solution Architecture</CardTitle>
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
            Fullscreen
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div ref={diagramRef} className="relative w-full overflow-auto rounded-lg border border-slate-700">
          <DiagramContent />
        </div>
        <div className="mt-4 grid grid-cols-6 gap-3 text-sm">
          <div className="bg-teal-900/30 border border-teal-700 rounded-lg p-3">
            <h4 className="font-semibold text-teal-400 mb-1">Input Channels</h4>
            <p className="text-slate-400 text-xs">8 Multi-channel ingestion</p>
          </div>
          <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-3">
            <h4 className="font-semibold text-purple-400 mb-1">AI Processing</h4>
            <p className="text-slate-400 text-xs">Two-stage classification</p>
          </div>
          <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-3">
            <h4 className="font-semibold text-amber-400 mb-1">Model Routing</h4>
            <p className="text-slate-400 text-xs">Multi-model assignment</p>
          </div>
          <div className="bg-pink-900/30 border border-pink-700 rounded-lg p-3">
            <h4 className="font-semibold text-pink-400 mb-1">Sub-Agents</h4>
            <p className="text-slate-400 text-xs">Orchestrated specialists</p>
          </div>
          <div className="bg-green-900/30 border border-green-700 rounded-lg p-3">
            <h4 className="font-semibold text-green-400 mb-1">Supabase</h4>
            <p className="text-slate-400 text-xs">Full-stack backend</p>
          </div>
          <div className="bg-orange-900/30 border border-orange-700 rounded-lg p-3">
            <h4 className="font-semibold text-orange-400 mb-1">MCP Export</h4>
            <p className="text-slate-400 text-xs">SDK integration</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SolutionArchitectureDiagram;
