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
        backgroundColor: '#1e293b',
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
        {/* Solid background gradients for enterprise look */}
        <linearGradient id="inputGradientSolid" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#134e4a" />
          <stop offset="100%" stopColor="#0f3d3a" />
        </linearGradient>
        <linearGradient id="aiGradientSolid" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b1d5a" />
          <stop offset="100%" stopColor="#2d1548" />
        </linearGradient>
        <linearGradient id="supabaseGradientSolid" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14532d" />
          <stop offset="100%" stopColor="#0f4025" />
        </linearGradient>
        <linearGradient id="mcpGradientSolid" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4a1d3d" />
          <stop offset="100%" stopColor="#3b1530" />
        </linearGradient>
        <linearGradient id="integrationGradientSolid" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#431407" />
          <stop offset="100%" stopColor="#341004" />
        </linearGradient>
        <linearGradient id="securityGradientSolid" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3a5f" />
          <stop offset="100%" stopColor="#172d4a" />
        </linearGradient>
        <filter id="dropShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
        </filter>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
        </marker>
      </defs>

      {/* Background - Solid enterprise dark */}
      <rect width="1400" height="1100" fill="#1e293b" />

      {/* Title with solid background */}
      <rect x="0" y="0" width="1400" height="80" fill="#0f172a" />
      <text x="700" y="38" textAnchor="middle" fill="#ffffff" fontSize="26" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">
        AI Document Processing Solution Architecture
      </text>
      <text x="700" y="62" textAnchor="middle" fill="#e2e8f0" fontSize="14" fontFamily="system-ui, -apple-system, sans-serif">
        Multi-Model Routing • Sub-Agent Orchestration • MCP SDK Integration
      </text>

      {/* Layer 1: Input Channels */}
      <g transform="translate(50, 95)">
        <rect x="0" y="0" width="1300" height="115" rx="8" fill="url(#inputGradientSolid)" stroke="#2dd4bf" strokeWidth="2" filter="url(#dropShadow)" />
        <text x="20" y="28" fill="#5eead4" fontSize="16" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">INPUT CHANNELS</text>
        
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
          <g key={i} transform={`translate(${channel.x}, 42)`}>
            <rect x="0" y="0" width="140" height="60" rx="6" fill="#1e293b" stroke="#2dd4bf" strokeWidth="1.5" />
            <text x="70" y="24" textAnchor="middle" fill="#ffffff" fontSize="20">{channel.icon}</text>
            <text x="70" y="48" textAnchor="middle" fill="#99f6e4" fontSize="12" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif">{channel.label}</text>
          </g>
        ))}
      </g>

      {/* Flow Arrow 1 */}
      <path d="M700 215 L700 240" stroke="#94a3b8" strokeWidth="3" markerEnd="url(#arrowhead)" />

      {/* Layer 2: AI Processing Layer */}
      <g transform="translate(50, 250)">
        <rect x="0" y="0" width="1300" height="195" rx="8" fill="url(#aiGradientSolid)" stroke="#a855f7" strokeWidth="2" filter="url(#dropShadow)" />
        <text x="20" y="28" fill="#c4b5fd" fontSize="16" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">AI PROCESSING LAYER - TWO-STAGE CLASSIFICATION</text>
        
        {/* Stage 1: Content Detection */}
        <g transform="translate(20, 42)">
          <rect x="0" y="0" width="400" height="140" rx="6" fill="#1e293b" stroke="#a855f7" strokeWidth="1.5" />
          <rect x="0" y="0" width="400" height="28" rx="6" fill="#6d28d9" />
          <text x="200" y="19" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">STAGE 1: CONTENT DETECTION</text>
          
          <rect x="10" y="35" width="120" height="45" rx="4" fill="#312e81" stroke="#8b5cf6" strokeWidth="1" />
          <text x="70" y="55" textAnchor="middle" fill="#e9d5ff" fontSize="11" fontWeight="600">OCR Engine</text>
          <text x="70" y="70" textAnchor="middle" fill="#a5b4fc" fontSize="9">Tesseract/AWS</text>
          
          <rect x="140" y="35" width="120" height="45" rx="4" fill="#312e81" stroke="#8b5cf6" strokeWidth="1" />
          <text x="200" y="55" textAnchor="middle" fill="#e9d5ff" fontSize="11" fontWeight="600">NLP Pipeline</text>
          <text x="200" y="70" textAnchor="middle" fill="#a5b4fc" fontSize="9">Entity Extract</text>
          
          <rect x="270" y="35" width="120" height="45" rx="4" fill="#312e81" stroke="#8b5cf6" strokeWidth="1" />
          <text x="330" y="55" textAnchor="middle" fill="#e9d5ff" fontSize="11" fontWeight="600">Vision AI</text>
          <text x="330" y="70" textAnchor="middle" fill="#a5b4fc" fontSize="9">Image Analysis</text>
          
          <rect x="10" y="88" width="380" height="42" rx="4" fill="#312e81" stroke="#8b5cf6" strokeWidth="1" />
          <text x="200" y="106" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="600">Content Types: Medical • Insurance • Prescription • Invoice • ID</text>
          <text x="200" y="122" textAnchor="middle" fill="#c4b5fd" fontSize="9">Confidence Scoring → Threshold: 85%</text>
        </g>

        {/* Arrow between stages */}
        <path d="M430 115 L450 115" stroke="#a855f7" strokeWidth="3" markerEnd="url(#arrowhead)" />

        {/* Stage 2: Model Routing */}
        <g transform="translate(460, 42)">
          <rect x="0" y="0" width="400" height="140" rx="6" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
          <rect x="0" y="0" width="400" height="28" rx="6" fill="#b45309" />
          <text x="200" y="19" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">STAGE 2: MULTI-MODEL ROUTING</text>
          
          <rect x="10" y="35" width="90" height="45" rx="4" fill="#422006" stroke="#f59e0b" strokeWidth="1" />
          <text x="55" y="53" textAnchor="middle" fill="#fef3c7" fontSize="10" fontWeight="600">Gemini 2.5</text>
          <text x="55" y="68" textAnchor="middle" fill="#fcd34d" fontSize="8">Vision+Text</text>
          
          <rect x="108" y="35" width="90" height="45" rx="4" fill="#422006" stroke="#f59e0b" strokeWidth="1" />
          <text x="153" y="53" textAnchor="middle" fill="#fef3c7" fontSize="10" fontWeight="600">GPT-5</text>
          <text x="153" y="68" textAnchor="middle" fill="#fcd34d" fontSize="8">Reasoning</text>
          
          <rect x="206" y="35" width="90" height="45" rx="4" fill="#422006" stroke="#f59e0b" strokeWidth="1" />
          <text x="251" y="53" textAnchor="middle" fill="#fef3c7" fontSize="10" fontWeight="600">Claude 4</text>
          <text x="251" y="68" textAnchor="middle" fill="#fcd34d" fontSize="8">Analysis</text>
          
          <rect x="304" y="35" width="86" height="45" rx="4" fill="#422006" stroke="#f59e0b" strokeWidth="1" />
          <text x="347" y="53" textAnchor="middle" fill="#fef3c7" fontSize="10" fontWeight="600">Med-PaLM</text>
          <text x="347" y="68" textAnchor="middle" fill="#fcd34d" fontSize="8">Medical</text>
          
          <rect x="10" y="88" width="380" height="42" rx="4" fill="#422006" stroke="#f59e0b" strokeWidth="1" />
          <text x="200" y="106" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="600">Scoring: (Accuracy×0.4) + (Speed×0.3) + (1/Cost×0.3)</text>
          <text x="200" y="122" textAnchor="middle" fill="#fcd34d" fontSize="9">Load Balancing • Rate Limiting • Circuit Breaker</text>
        </g>

        {/* Arrow to Sub-Agents */}
        <path d="M870 115 L890 115" stroke="#ec4899" strokeWidth="3" markerEnd="url(#arrowhead)" />

        {/* Sub-Agent Orchestration */}
        <g transform="translate(900, 42)">
          <rect x="0" y="0" width="380" height="140" rx="6" fill="#1e293b" stroke="#ec4899" strokeWidth="1.5" />
          <rect x="0" y="0" width="380" height="28" rx="6" fill="#be185d" />
          <text x="190" y="19" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">SUB-AGENT ORCHESTRATION</text>
          
          <rect x="10" y="35" width="115" height="45" rx="4" fill="#500724" stroke="#ec4899" strokeWidth="1" />
          <text x="67" y="53" textAnchor="middle" fill="#fce7f3" fontSize="10" fontWeight="600">Onboarding</text>
          <text x="67" y="68" textAnchor="middle" fill="#f9a8d4" fontSize="8">Agent</text>
          
          <rect x="133" y="35" width="115" height="45" rx="4" fill="#500724" stroke="#ec4899" strokeWidth="1" />
          <text x="190" y="53" textAnchor="middle" fill="#fce7f3" fontSize="10" fontWeight="600">Document</text>
          <text x="190" y="68" textAnchor="middle" fill="#f9a8d4" fontSize="8">Agent</text>
          
          <rect x="256" y="35" width="114" height="45" rx="4" fill="#500724" stroke="#ec4899" strokeWidth="1" />
          <text x="313" y="53" textAnchor="middle" fill="#fce7f3" fontSize="10" fontWeight="600">Billing/RCM</text>
          <text x="313" y="68" textAnchor="middle" fill="#f9a8d4" fontSize="8">Agent</text>
          
          <rect x="10" y="88" width="360" height="42" rx="4" fill="#500724" stroke="#ec4899" strokeWidth="1" />
          <text x="190" y="106" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="600">Coordinator: Task Distribution • State Management</text>
          <text x="190" y="122" textAnchor="middle" fill="#fbcfe8" fontSize="9">Inter-Agent Communication • Human-in-Loop</text>
        </g>
      </g>

      {/* Flow Arrow 2 */}
      <path d="M700 450 L700 475" stroke="#94a3b8" strokeWidth="3" markerEnd="url(#arrowhead)" />

      {/* Layer 3: Supabase Backend & MCP */}
      <g transform="translate(50, 485)">
        <rect x="0" y="0" width="640" height="155" rx="8" fill="url(#supabaseGradientSolid)" stroke="#22c55e" strokeWidth="2" filter="url(#dropShadow)" />
        <text x="20" y="28" fill="#86efac" fontSize="16" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">SUPABASE BACKEND</text>
        
        <g transform="translate(20, 42)">
          <rect x="0" y="0" width="140" height="50" rx="4" fill="#1e293b" stroke="#22c55e" strokeWidth="1.5" />
          <text x="70" y="22" textAnchor="middle" fill="#bbf7d0" fontSize="11" fontWeight="600">PostgreSQL DB</text>
          <text x="70" y="38" textAnchor="middle" fill="#86efac" fontSize="9">RLS • Triggers</text>
          
          <rect x="150" y="0" width="140" height="50" rx="4" fill="#1e293b" stroke="#22c55e" strokeWidth="1.5" />
          <text x="220" y="22" textAnchor="middle" fill="#bbf7d0" fontSize="11" fontWeight="600">Edge Functions</text>
          <text x="220" y="38" textAnchor="middle" fill="#86efac" fontSize="9">Deno Runtime</text>
          
          <rect x="300" y="0" width="140" height="50" rx="4" fill="#1e293b" stroke="#22c55e" strokeWidth="1.5" />
          <text x="370" y="22" textAnchor="middle" fill="#bbf7d0" fontSize="11" fontWeight="600">Auth</text>
          <text x="370" y="38" textAnchor="middle" fill="#86efac" fontSize="9">JWT • MFA</text>
          
          <rect x="450" y="0" width="140" height="50" rx="4" fill="#1e293b" stroke="#22c55e" strokeWidth="1.5" />
          <text x="520" y="22" textAnchor="middle" fill="#bbf7d0" fontSize="11" fontWeight="600">Storage</text>
          <text x="520" y="38" textAnchor="middle" fill="#86efac" fontSize="9">CDN • Buckets</text>
        </g>
        
        <g transform="translate(20, 98)">
          <rect x="0" y="0" width="290" height="42" rx="4" fill="#1e293b" stroke="#22c55e" strokeWidth="1.5" />
          <text x="145" y="18" textAnchor="middle" fill="#bbf7d0" fontSize="10" fontWeight="600">Real-time Subscriptions</text>
          <text x="145" y="33" textAnchor="middle" fill="#86efac" fontSize="9">WebSocket • Broadcast • Presence</text>
          
          <rect x="300" y="0" width="290" height="42" rx="4" fill="#1e293b" stroke="#22c55e" strokeWidth="1.5" />
          <text x="445" y="18" textAnchor="middle" fill="#bbf7d0" fontSize="10" fontWeight="600">Vector Search (pgvector)</text>
          <text x="445" y="33" textAnchor="middle" fill="#86efac" fontSize="9">RAG • Semantic Search • Embeddings</text>
        </g>
      </g>

      {/* MCP SDK Export Layer */}
      <g transform="translate(710, 485)">
        <rect x="0" y="0" width="640" height="155" rx="8" fill="url(#mcpGradientSolid)" stroke="#ec4899" strokeWidth="2" filter="url(#dropShadow)" />
        <text x="20" y="28" fill="#f9a8d4" fontSize="16" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">MCP SDK EXPORT LAYER</text>
        
        <g transform="translate(20, 42)">
          <rect x="0" y="0" width="140" height="50" rx="4" fill="#1e293b" stroke="#ec4899" strokeWidth="1.5" />
          <text x="70" y="22" textAnchor="middle" fill="#fce7f3" fontSize="11" fontWeight="600">Agent Packaging</text>
          <text x="70" y="38" textAnchor="middle" fill="#f9a8d4" fontSize="9">Config Export</text>
          
          <rect x="150" y="0" width="140" height="50" rx="4" fill="#1e293b" stroke="#ec4899" strokeWidth="1.5" />
          <text x="220" y="22" textAnchor="middle" fill="#fce7f3" fontSize="11" fontWeight="600">Tool Registry</text>
          <text x="220" y="38" textAnchor="middle" fill="#f9a8d4" fontSize="9">MCP Tools</text>
          
          <rect x="300" y="0" width="140" height="50" rx="4" fill="#1e293b" stroke="#ec4899" strokeWidth="1.5" />
          <text x="370" y="22" textAnchor="middle" fill="#fce7f3" fontSize="11" fontWeight="600">Prompt Templates</text>
          <text x="370" y="38" textAnchor="middle" fill="#f9a8d4" fontSize="9">System Prompts</text>
          
          <rect x="450" y="0" width="140" height="50" rx="4" fill="#1e293b" stroke="#ec4899" strokeWidth="1.5" />
          <text x="520" y="22" textAnchor="middle" fill="#fce7f3" fontSize="11" fontWeight="600">Resource Export</text>
          <text x="520" y="38" textAnchor="middle" fill="#f9a8d4" fontSize="9">Knowledge Base</text>
        </g>
        
        <g transform="translate(20, 98)">
          <rect x="0" y="0" width="290" height="42" rx="4" fill="#1e293b" stroke="#ec4899" strokeWidth="1.5" />
          <text x="145" y="18" textAnchor="middle" fill="#fce7f3" fontSize="10" fontWeight="600">Claude Desktop Integration</text>
          <text x="145" y="33" textAnchor="middle" fill="#f9a8d4" fontSize="9">stdio Transport • JSON-RPC</text>
          
          <rect x="300" y="0" width="290" height="42" rx="4" fill="#1e293b" stroke="#ec4899" strokeWidth="1.5" />
          <text x="445" y="18" textAnchor="middle" fill="#fce7f3" fontSize="10" fontWeight="600">External AI Platforms</text>
          <text x="445" y="33" textAnchor="middle" fill="#f9a8d4" fontSize="9">OpenAI • Anthropic • Custom LLMs</text>
        </g>
      </g>

      {/* Flow Arrow 3 */}
      <path d="M700 645 L700 670" stroke="#94a3b8" strokeWidth="3" markerEnd="url(#arrowhead)" />

      {/* Layer 4: Output & Integrations */}
      <g transform="translate(50, 680)">
        <rect x="0" y="0" width="1300" height="135" rx="8" fill="url(#integrationGradientSolid)" stroke="#f97316" strokeWidth="2" filter="url(#dropShadow)" />
        <text x="20" y="28" fill="#fdba74" fontSize="16" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">INTEGRATIONS & OUTPUTS</text>
        
        {[
          { x: 20, label: 'EHR Systems', sub: 'Epic • Cerner • Allscripts', icon: '🏥' },
          { x: 170, label: 'RCM/Billing', sub: 'Claims • Payments', icon: '💳' },
          { x: 320, label: 'CRM Systems', sub: 'Salesforce • HubSpot', icon: '👥' },
          { x: 470, label: 'ERP Systems', sub: 'SAP • Oracle • NetSuite', icon: '🏢' },
          { x: 620, label: 'Analytics', sub: 'Dashboards • Reports', icon: '📊' },
          { x: 770, label: 'Notifications', sub: 'Email • SMS • Push', icon: '🔔' },
          { x: 920, label: 'Workflow', sub: 'n8n • Temporal', icon: '⚙️' },
          { x: 1070, label: 'Label Studio', sub: 'Human Review', icon: '🏷️' },
        ].map((item, i) => (
          <g key={i} transform={`translate(${item.x}, 40)`}>
            <rect x="0" y="0" width="140" height="80" rx="6" fill="#1e293b" stroke="#f97316" strokeWidth="1.5" />
            <text x="70" y="24" textAnchor="middle" fill="#ffffff" fontSize="18">{item.icon}</text>
            <text x="70" y="46" textAnchor="middle" fill="#fed7aa" fontSize="11" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif">{item.label}</text>
            <text x="70" y="64" textAnchor="middle" fill="#fdba74" fontSize="8">{item.sub}</text>
          </g>
        ))}
      </g>

      {/* Layer 5: Security & Compliance Footer */}
      <g transform="translate(50, 835)">
        <rect x="0" y="0" width="1300" height="75" rx="8" fill="url(#securityGradientSolid)" stroke="#3b82f6" strokeWidth="2" filter="url(#dropShadow)" />
        <text x="650" y="25" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">SECURITY & COMPLIANCE</text>
        
        {[
          { x: 60, label: 'HIPAA', color: '#22c55e', bg: '#14532d' },
          { x: 200, label: 'SOC 2 Type II', color: '#3b82f6', bg: '#1e3a5f' },
          { x: 370, label: 'End-to-End Encryption', color: '#a855f7', bg: '#3b1d5a' },
          { x: 570, label: 'Audit Logging', color: '#f59e0b', bg: '#422006' },
          { x: 740, label: 'Role-Based Access', color: '#ec4899', bg: '#500724' },
          { x: 930, label: 'Data Residency', color: '#14b8a6', bg: '#134e4a' },
          { x: 1100, label: 'BAA Available', color: '#f97316', bg: '#431407' },
        ].map((item, i) => (
          <g key={i} transform={`translate(${item.x}, 40)`}>
            <rect x="0" y="0" width="130" height="28" rx="14" fill={item.bg} stroke={item.color} strokeWidth="1.5" />
            <text x="65" y="19" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif">{item.label}</text>
          </g>
        ))}
      </g>

      {/* Flow Lines connecting layers */}
      <g stroke="#475569" strokeWidth="1.5" strokeDasharray="4,4">
        <line x1="200" y1="445" x2="200" y2="485" />
        <line x1="500" y1="445" x2="500" y2="485" />
        <line x1="900" y1="445" x2="900" y2="485" />
        <line x1="1200" y1="445" x2="1200" y2="485" />
      </g>

      {/* Version info */}
      <text x="1340" y="1080" textAnchor="end" fill="#94a3b8" fontSize="11" fontWeight="500" fontFamily="system-ui, -apple-system, sans-serif">
        v2.0 - Enterprise Edition
      </text>
    </svg>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 overflow-auto p-4">
        <div className="flex justify-end mb-4 gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadPNG} className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
            <FileImage className="h-4 w-4 mr-2" />
            Download PNG
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadSVG} className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
            <FileCode className="h-4 w-4 mr-2" />
            Download SVG
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(false)} className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
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
    <Card className="w-full bg-slate-800 border-slate-600">
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-900 rounded-t-lg">
        <CardTitle className="text-white text-lg font-semibold">AI Document Processing Solution Architecture</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadPNG} className="bg-slate-700 border-slate-500 text-white hover:bg-slate-600">
            <FileImage className="h-4 w-4 mr-2" />
            PNG
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadSVG} className="bg-slate-700 border-slate-500 text-white hover:bg-slate-600">
            <FileCode className="h-4 w-4 mr-2" />
            SVG
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(true)} className="bg-slate-700 border-slate-500 text-white hover:bg-slate-600">
            <Maximize2 className="h-4 w-4 mr-2" />
            Fullscreen
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 bg-slate-800">
        <div ref={diagramRef} className="relative w-full overflow-auto rounded-lg border border-slate-600">
          <DiagramContent />
        </div>
        <div className="mt-4 grid grid-cols-6 gap-3 text-sm">
          <div className="bg-teal-900 border border-teal-600 rounded-lg p-3">
            <h4 className="font-semibold text-teal-300 mb-1">Input Channels</h4>
            <p className="text-teal-100 text-xs">8 Multi-channel ingestion</p>
          </div>
          <div className="bg-purple-900 border border-purple-600 rounded-lg p-3">
            <h4 className="font-semibold text-purple-300 mb-1">AI Processing</h4>
            <p className="text-purple-100 text-xs">Two-stage classification</p>
          </div>
          <div className="bg-amber-900 border border-amber-600 rounded-lg p-3">
            <h4 className="font-semibold text-amber-300 mb-1">Model Routing</h4>
            <p className="text-amber-100 text-xs">Multi-model assignment</p>
          </div>
          <div className="bg-pink-900 border border-pink-600 rounded-lg p-3">
            <h4 className="font-semibold text-pink-300 mb-1">Sub-Agents</h4>
            <p className="text-pink-100 text-xs">Orchestrated specialists</p>
          </div>
          <div className="bg-green-900 border border-green-600 rounded-lg p-3">
            <h4 className="font-semibold text-green-300 mb-1">Supabase</h4>
            <p className="text-green-100 text-xs">Full-stack backend</p>
          </div>
          <div className="bg-orange-900 border border-orange-600 rounded-lg p-3">
            <h4 className="font-semibold text-orange-300 mb-1">MCP Export</h4>
            <p className="text-orange-100 text-xs">SDK integration</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SolutionArchitectureDiagram;
