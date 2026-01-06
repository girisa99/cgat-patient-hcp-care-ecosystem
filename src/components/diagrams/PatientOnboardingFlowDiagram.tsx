import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Maximize2, FileText, Brain, GitBranch, User, Shield, Send, ArrowRight, ArrowDown, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

export const PatientOnboardingFlowDiagram: React.FC = () => {
  const diagramRef = useRef<HTMLDivElement>(null);

  const handleDownloadPNG = async () => {
    if (!diagramRef.current) return;
    
    try {
      toast.info('Generating PNG...');
      const canvas = await html2canvas(diagramRef.current, {
        backgroundColor: '#f8fafc', // Light background for better readability
        scale: 3,
        useCORS: true,
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = 'patient-onboarding-flow-diagram.png';
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      
      toast.success('PNG downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download PNG.');
    }
  };

  const handleDownloadSVG = () => {
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <rect width="1200" height="800" fill="#0f172a"/>
  <text x="600" y="40" text-anchor="middle" fill="#ffffff" font-size="24" font-weight="bold">Patient Onboarding AI Pipeline</text>
  <text x="600" y="65" text-anchor="middle" fill="#94a3b8" font-size="12">6-Step Multi-Model AI Document Processing &amp; Verification Flow</text>
  
  <!-- Legend -->
  <g transform="translate(50, 700)">
    <rect width="1100" height="50" rx="8" fill="#1e293b" stroke="#475569"/>
    <text x="20" y="20" fill="#94a3b8" font-size="11" font-weight="bold">Legend:</text>
    <circle cx="100" cy="25" r="6" fill="#a855f7"/>
    <text x="115" y="30" fill="#94a3b8" font-size="10">Stage 1: Classification</text>
    <circle cx="260" cy="25" r="6" fill="#22d3ee"/>
    <text x="275" y="30" fill="#94a3b8" font-size="10">Stage 2: Routing</text>
    <circle cx="400" cy="25" r="6" fill="#facc15"/>
    <text x="415" y="30" fill="#94a3b8" font-size="10">Sub-Agent Verification</text>
    <circle cx="580" cy="25" r="6" fill="#ec4899"/>
    <text x="595" y="30" fill="#94a3b8" font-size="10">MCP SDK Integration</text>
  </g>
  
  <!-- Steps -->
  <g transform="translate(50, 100)">
    <circle cx="40" cy="40" r="30" fill="#3b82f6"/>
    <text x="40" y="45" text-anchor="middle" fill="#ffffff" font-size="18" font-weight="bold">1</text>
    <text x="90" y="45" fill="#60a5fa" font-size="14" font-weight="bold">Multi-Document Intake</text>
  </g>
  <g transform="translate(50, 200)">
    <circle cx="40" cy="40" r="30" fill="#a855f7"/>
    <text x="40" y="45" text-anchor="middle" fill="#ffffff" font-size="18" font-weight="bold">2</text>
    <text x="90" y="45" fill="#c084fc" font-size="14" font-weight="bold">Stage 1 Classification (Gemini 2.5 Flash)</text>
  </g>
  <g transform="translate(50, 300)">
    <circle cx="40" cy="40" r="30" fill="#22d3ee"/>
    <text x="40" y="45" text-anchor="middle" fill="#ffffff" font-size="18" font-weight="bold">3</text>
    <text x="90" y="45" fill="#67e8f9" font-size="14" font-weight="bold">Stage 2 Intelligent Routing</text>
  </g>
  <g transform="translate(50, 400)">
    <circle cx="40" cy="40" r="30" fill="#22c55e"/>
    <text x="40" y="45" text-anchor="middle" fill="#ffffff" font-size="18" font-weight="bold">4</text>
    <text x="90" y="45" fill="#4ade80" font-size="14" font-weight="bold">Unified Patient Record</text>
  </g>
  <g transform="translate(50, 500)">
    <circle cx="40" cy="40" r="30" fill="#facc15"/>
    <text x="40" y="45" text-anchor="middle" fill="#1e293b" font-size="18" font-weight="bold">5</text>
    <text x="90" y="45" fill="#fde047" font-size="14" font-weight="bold">Sub-Agent Verification</text>
  </g>
  <g transform="translate(50, 600)">
    <circle cx="40" cy="40" r="30" fill="#ec4899"/>
    <text x="40" y="45" text-anchor="middle" fill="#ffffff" font-size="18" font-weight="bold">6</text>
    <text x="90" y="45" fill="#f472b6" font-size="14" font-weight="bold">MCP SDK Export</text>
  </g>
</svg>`;
    
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'patient-onboarding-flow-diagram.svg';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('SVG downloaded successfully!');
  };

  const handleOpenFullSize = () => {
    const newWindow = window.open('', '_blank');
    if (newWindow && diagramRef.current) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head><title>Patient Onboarding Flow Diagram</title></head>
          <body style="margin:0;padding:20px;background:#0f172a;display:flex;justify-content:center;">
            ${diagramRef.current.outerHTML}
          </body>
        </html>
      `);
    }
  };

  return (
    <Card className="w-full bg-background/80 backdrop-blur border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-foreground text-lg">Patient Onboarding AI Pipeline</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleOpenFullSize} className="gap-2">
            <Maximize2 className="h-4 w-4" />
            Full Size
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadSVG} className="gap-2">
            <Download className="h-4 w-4" />
            SVG
          </Button>
          <Button variant="default" size="sm" onClick={handleDownloadPNG} className="gap-2">
            <Download className="h-4 w-4" />
            PNG
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div 
          ref={diagramRef}
          className="relative w-full overflow-auto rounded-lg border border-border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 p-6"
          style={{ minWidth: '1000px' }}
        >
          {/* Title */}
          <h2 className="text-xl font-bold text-center text-slate-800 dark:text-slate-200 mb-2">
            Patient Onboarding AI Pipeline
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs text-center mb-6">
            6-Step Multi-Model AI Document Processing & Verification Flow
          </p>

          {/* STEP 1: Multi-Document Intake */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">1</div>
              <h3 className="text-blue-700 dark:text-blue-400 font-bold text-sm">STEP 1: Multi-Document Intake</h3>
            </div>
            <div className="ml-11 grid grid-cols-7 gap-2">
              {[
                { name: 'Enrollment Form', icon: '📋', color: 'border-blue-500 bg-blue-500/20' },
                { name: 'Insurance Card', icon: '💳', color: 'border-cyan-500 bg-cyan-500/20' },
                { name: 'Prescription', icon: '💊', color: 'border-green-500 bg-green-500/20' },
                { name: 'Income Proof', icon: '📄', color: 'border-orange-500 bg-orange-500/20' },
                { name: 'Lab Results', icon: '🧪', color: 'border-purple-500 bg-purple-500/20' },
                { name: 'Invoice/Billing', icon: '🧾', color: 'border-yellow-500 bg-yellow-500/20' },
                { name: 'Prior Auth', icon: '✅', color: 'border-pink-500 bg-pink-500/20' },
              ].map((doc) => (
              <div key={doc.name} className={`${doc.color} border rounded-lg p-2 text-center`}>
                  <span className="text-xl block mb-0.5">{doc.icon}</span>
                  <span className="text-[9px] text-slate-800 dark:text-slate-200 font-medium leading-tight block">{doc.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Arrow Down */}
          <div className="flex justify-center my-3">
            <ArrowDown className="h-6 w-6 text-muted-foreground" />
          </div>

          {/* STEP 2: Stage 1 Classification */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm">2</div>
              <h3 className="text-purple-700 dark:text-purple-400 font-bold text-sm">STEP 2: Stage 1 Classification</h3>
            </div>
            <div className="ml-11 bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/50 dark:to-purple-950/50 border border-purple-400 dark:border-purple-500 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">✨</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium text-sm">Gemini 2.5 Flash</span>
                <span className="text-purple-700 dark:text-purple-300 text-xs">— Auto-detects type + manufacturer/source</span>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {[
                  { type: 'Enrollment', detected: 'Form/Application' },
                  { type: 'Insurance', detected: 'Payer Card' },
                  { type: 'Prescription', detected: 'Rx Order' },
                  { type: 'Income', detected: 'Financial Doc' },
                  { type: 'Lab', detected: 'Test Results' },
                  { type: 'Invoice', detected: 'Billing Statement' },
                  { type: 'Prior Auth', detected: 'Authorization' },
                ].map((item) => (
                  <div key={item.type} className="bg-purple-200/80 dark:bg-purple-800/40 rounded px-2 py-1.5 text-center">
                    <span className="text-[9px] text-slate-800 dark:text-slate-200 block font-medium">{item.type}</span>
                    <span className="text-[8px] text-purple-700 dark:text-purple-300">→ {item.detected}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Arrow Down */}
          <div className="flex justify-center my-3">
            <ArrowDown className="h-6 w-6 text-muted-foreground" />
          </div>

          {/* STEP 3: Stage 2 Intelligent Routing */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold text-sm">3</div>
              <h3 className="text-cyan-700 dark:text-cyan-400 font-bold text-sm">STEP 3: Stage 2 Intelligent Routing</h3>
            </div>
            <div className="ml-11 bg-gradient-to-r from-cyan-100 to-cyan-50 dark:from-cyan-900/50 dark:to-cyan-950/50 border border-cyan-400 dark:border-cyan-500 rounded-lg p-4">
              <div className="text-xs text-slate-600 dark:text-slate-400 mb-3 text-center">Route to optimal model per document type</div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: 'Google Gemini', icon: '✨', task: 'Entity Extraction', docs: 'Enrollment, Insurance, Prior Auth' },
                  { name: 'OpenAI GPT-4', icon: '🧠', task: 'Classification & Summary', docs: 'Prescriptions, Lab Results' },
                  { name: 'Anthropic Claude', icon: '🔮', task: 'Reasoning & Validation', docs: 'Income Proof, Invoice/Billing' },
                ].map((model) => (
                  <div key={model.name} className="bg-white/90 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-600 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{model.icon}</span>
                      <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">{model.name}</span>
                    </div>
                    <div className="text-[10px] text-cyan-700 dark:text-cyan-400 mb-1">{model.task}</div>
                    <div className="text-[9px] text-slate-600 dark:text-slate-400">→ {model.docs}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Arrow Down */}
          <div className="flex justify-center my-3">
            <ArrowDown className="h-6 w-6 text-muted-foreground" />
          </div>

          {/* STEP 4: Unified Patient Record */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm">4</div>
              <h3 className="text-green-700 dark:text-green-400 font-bold text-sm">STEP 4: Unified Patient Record</h3>
            </div>
            <div className="ml-11 grid grid-cols-4 gap-3">
              {[
                { name: 'Patient Profile', confidence: '95%', color: 'border-green-500 bg-green-500/20', textColor: 'text-green-600 dark:text-green-400' },
                { name: 'Insurance', confidence: '92%', color: 'border-cyan-500 bg-cyan-500/20', textColor: 'text-cyan-600 dark:text-cyan-400' },
                { name: 'Prescriber', confidence: '97%', color: 'border-purple-500 bg-purple-500/20', textColor: 'text-purple-600 dark:text-purple-400' },
                { name: 'Medication', confidence: '98%', color: 'border-orange-500 bg-orange-500/20', textColor: 'text-orange-600 dark:text-orange-400' },
              ].map((record) => (
              <div key={record.name} className={`${record.color} border rounded-lg p-3 text-center`}>
                  <span className="text-sm font-medium block text-slate-800 dark:text-slate-200">{record.name}</span>
                  <span className={`text-lg font-bold ${record.textColor}`}>{record.confidence}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Arrow Down */}
          <div className="flex justify-center my-3">
            <ArrowDown className="h-6 w-6 text-muted-foreground" />
          </div>

          {/* STEP 5: Sub-Agent Verification */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center text-white font-bold text-sm">5</div>
              <h3 className="text-yellow-700 dark:text-yellow-400 font-bold text-sm">STEP 5: Sub-Agent Verification</h3>
            </div>
            <div className="ml-11 flex gap-3">
              {[
                { name: 'NPI Lookup', icon: '🔍' },
                { name: 'Eligibility Check', icon: '✅' },
                { name: 'Address Validation', icon: '📍' },
              ].map((agent) => (
                <div key={agent.name} className="flex-1 bg-yellow-100/80 dark:bg-yellow-900/30 border border-yellow-500 dark:border-yellow-500/50 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{agent.icon}</span>
                    <span className="text-sm text-slate-800 dark:text-slate-200 font-medium">{agent.name}</span>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              ))}
            </div>
          </div>

          {/* Arrow Down */}
          <div className="flex justify-center my-3">
            <ArrowDown className="h-6 w-6 text-muted-foreground" />
          </div>

          {/* STEP 6: MCP SDK Export */}
          <div className="mb-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center text-white font-bold text-sm">6</div>
              <h3 className="text-pink-700 dark:text-pink-400 font-bold text-sm">STEP 6: MCP SDK Export</h3>
            </div>
            <div className="ml-11 grid grid-cols-4 gap-3">
              {[
                { name: 'EHR', icon: '🏥', color: 'border-blue-500 bg-blue-500/20' },
                { name: 'Pharmacy', icon: '💊', color: 'border-green-500 bg-green-500/20' },
                { name: 'PAP Portal', icon: '📋', color: 'border-purple-500 bg-purple-500/20' },
                { name: 'RCM System', icon: '💰', color: 'border-orange-500 bg-orange-500/20' },
              ].map((system) => (
              <div key={system.name} className={`${system.color} border rounded-lg p-3 text-center`}>
                  <span className="text-2xl block mb-1">{system.icon}</span>
                  <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">{system.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Legend */}
          <div className="mt-6 pt-4 border-t border-slate-300 dark:border-slate-700">
            <div className="flex justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-[10px] text-slate-600 dark:text-slate-400">Stage 1: Classification</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                <span className="text-[10px] text-slate-600 dark:text-slate-400">Stage 2: Routing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-[10px] text-slate-600 dark:text-slate-400">Sub-Agent Verification</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                <span className="text-[10px] text-slate-600 dark:text-slate-400">MCP SDK Integration</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientOnboardingFlowDiagram;
