import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

export const SubAgentArchitectureDiagram: React.FC = () => {
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
      link.download = 'sub-agent-architecture-diagram.png';
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
  <text x="600" y="40" text-anchor="middle" fill="#ffffff" font-size="24" font-weight="bold">Sub-Agent Architecture</text>
  <text x="600" y="70" text-anchor="middle" fill="#94a3b8" font-size="14">Domain Orchestrator Routes Tasks to Specialist Agents</text>
  
  <!-- Legend -->
  <g transform="translate(50, 720)">
    <rect width="1100" height="60" rx="8" fill="#1e293b" stroke="#475569"/>
    <text x="20" y="25" fill="#94a3b8" font-size="12" font-weight="bold">Legend:</text>
    <circle cx="100" cy="20" r="8" fill="#6366f1"/>
    <text x="115" y="25" fill="#94a3b8" font-size="11">Domain Orchestrator</text>
    <circle cx="280" cy="20" r="8" fill="#22d3ee"/>
    <text x="295" y="25" fill="#94a3b8" font-size="11">Task Routing</text>
    <circle cx="420" cy="20" r="8" fill="#22c55e"/>
    <text x="435" y="25" fill="#94a3b8" font-size="11">Result Aggregation</text>
    
    <text x="20" y="48" fill="#94a3b8" font-size="12" font-weight="bold">Agents:</text>
    <rect x="80" y="35" width="16" height="16" rx="2" fill="#3b82f6"/>
    <text x="102" y="48" fill="#94a3b8" font-size="10">Verification</text>
    <rect x="180" y="35" width="16" height="16" rx="2" fill="#22c55e"/>
    <text x="202" y="48" fill="#94a3b8" font-size="10">Benefits</text>
    <rect x="270" y="35" width="16" height="16" rx="2" fill="#f97316"/>
    <text x="292" y="48" fill="#94a3b8" font-size="10">Prior Auth</text>
    <rect x="370" y="35" width="16" height="16" rx="2" fill="#a855f7"/>
    <text x="392" y="48" fill="#94a3b8" font-size="10">Coding</text>
    <rect x="450" y="35" width="16" height="16" rx="2" fill="#06b6d4"/>
    <text x="472" y="48" fill="#94a3b8" font-size="10">Adherence</text>
    <rect x="550" y="35" width="16" height="16" rx="2" fill="#eab308"/>
    <text x="572" y="48" fill="#94a3b8" font-size="10">Custom</text>
  </g>
  
  <!-- Orchestrator -->
  <g transform="translate(400, 150)">
    <rect width="400" height="120" rx="16" fill="#312e81" stroke="#6366f1" stroke-width="2"/>
    <text x="200" y="40" text-anchor="middle" fill="#ffffff" font-size="20" font-weight="bold">🧠 Domain Orchestrator</text>
    <text x="200" y="65" text-anchor="middle" fill="#a5b4fc" font-size="12">Central Intelligence Hub</text>
    <text x="200" y="90" text-anchor="middle" fill="#c7d2fe" font-size="11">Task Analysis • Agent Selection • Result Aggregation</text>
  </g>
  
  <!-- Agent boxes -->
  <g transform="translate(50, 350)">
    <rect width="160" height="150" rx="10" fill="#1e3a8a" stroke="#3b82f6" stroke-width="2"/>
    <text x="80" y="30" text-anchor="middle" fill="#ffffff" font-size="24">🔍</text>
    <text x="80" y="55" text-anchor="middle" fill="#93c5fd" font-size="12" font-weight="bold">Verification</text>
    <text x="80" y="75" text-anchor="middle" fill="#bfdbfe" font-size="10">Agent</text>
  </g>
  <g transform="translate(230, 350)">
    <rect width="160" height="150" rx="10" fill="#14532d" stroke="#22c55e" stroke-width="2"/>
    <text x="80" y="30" text-anchor="middle" fill="#ffffff" font-size="24">💊</text>
    <text x="80" y="55" text-anchor="middle" fill="#86efac" font-size="12" font-weight="bold">Benefits</text>
    <text x="80" y="75" text-anchor="middle" fill="#bbf7d0" font-size="10">Investigation</text>
  </g>
  <g transform="translate(410, 350)">
    <rect width="160" height="150" rx="10" fill="#7c2d12" stroke="#f97316" stroke-width="2"/>
    <text x="80" y="30" text-anchor="middle" fill="#ffffff" font-size="24">📋</text>
    <text x="80" y="55" text-anchor="middle" fill="#fdba74" font-size="12" font-weight="bold">Prior Auth</text>
    <text x="80" y="75" text-anchor="middle" fill="#fed7aa" font-size="10">Agent</text>
  </g>
  <g transform="translate(590, 350)">
    <rect width="160" height="150" rx="10" fill="#581c87" stroke="#a855f7" stroke-width="2"/>
    <text x="80" y="30" text-anchor="middle" fill="#ffffff" font-size="24">🏷️</text>
    <text x="80" y="55" text-anchor="middle" fill="#d8b4fe" font-size="12" font-weight="bold">Coding</text>
    <text x="80" y="75" text-anchor="middle" fill="#e9d5ff" font-size="10">Agent</text>
  </g>
  <g transform="translate(770, 350)">
    <rect width="160" height="150" rx="10" fill="#164e63" stroke="#06b6d4" stroke-width="2"/>
    <text x="80" y="30" text-anchor="middle" fill="#ffffff" font-size="24">💚</text>
    <text x="80" y="55" text-anchor="middle" fill="#67e8f9" font-size="12" font-weight="bold">Adherence</text>
    <text x="80" y="75" text-anchor="middle" fill="#a5f3fc" font-size="10">Agent</text>
  </g>
  <g transform="translate(950, 350)">
    <rect width="160" height="150" rx="10" fill="#713f12" stroke="#eab308" stroke-width="2"/>
    <text x="80" y="30" text-anchor="middle" fill="#ffffff" font-size="24">⚙️</text>
    <text x="80" y="55" text-anchor="middle" fill="#fde047" font-size="12" font-weight="bold">Custom</text>
    <text x="80" y="75" text-anchor="middle" fill="#fef08a" font-size="10">Agents</text>
  </g>
  
  <!-- Output -->
  <g transform="translate(300, 580)">
    <rect width="600" height="80" rx="12" fill="#064e3b" stroke="#22c55e" stroke-width="2"/>
    <text x="300" y="35" text-anchor="middle" fill="#22c55e" font-size="16" font-weight="bold">Aggregated Response</text>
    <text x="300" y="60" text-anchor="middle" fill="#a7f3d0" font-size="12">✓ Validated • ✓ Checked • ✓ Approved • ✓ Assigned • ✓ Tracked • ✓ Processed</text>
  </g>
</svg>`;
    
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sub-agent-architecture-diagram.svg';
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
          <head><title>Sub-Agent Architecture Diagram</title></head>
          <body style="margin:0;padding:20px;background:#0f172a;display:flex;justify-content:center;">
            ${diagramRef.current.outerHTML}
          </body>
        </html>
      `);
    }
  };

  const specialistAgents = [
    { 
      name: 'Verification Agent', 
      icon: '🔍', 
      color: 'from-blue-600 to-blue-800',
      borderColor: 'border-blue-500',
      domain: 'Data Validation',
      tasks: ['NPI Lookup', 'DEA Validation', 'Address Standardization'],
      integration: 'NPI Registry, USPS API'
    },
    { 
      name: 'Benefits Investigation', 
      icon: '💊', 
      color: 'from-green-600 to-green-800',
      borderColor: 'border-green-500',
      domain: 'Coverage Analysis',
      tasks: ['Formulary Check', 'Coverage Verification', 'Copay Estimation'],
      integration: 'Payer APIs'
    },
    { 
      name: 'Prior Authorization', 
      icon: '📋', 
      color: 'from-orange-600 to-orange-800',
      borderColor: 'border-orange-500',
      domain: 'Authorization',
      tasks: ['PA Form Generation', 'Status Tracking', 'Appeals'],
      integration: 'Payer Portals'
    },
    { 
      name: 'Coding Agent', 
      icon: '🏷️', 
      color: 'from-purple-600 to-purple-800',
      borderColor: 'border-purple-500',
      domain: 'Medical Coding',
      tasks: ['ICD-10 Validation', 'CPT/HCPCS Assignment', 'NDC Verification'],
      integration: 'CMS Databases'
    },
    { 
      name: 'Adherence Agent', 
      icon: '💚', 
      color: 'from-cyan-600 to-cyan-800',
      borderColor: 'border-cyan-500',
      domain: 'Patient Support',
      tasks: ['Refill Reminders', 'Therapy Tracking', 'Intervention Alerts'],
      integration: 'Patient Systems'
    },
    { 
      name: 'Custom Agents', 
      icon: '⚙️', 
      color: 'from-yellow-600 to-yellow-800',
      borderColor: 'border-yellow-500',
      domain: 'Extensible',
      tasks: ['Per-Client Workflows', 'Custom Integration', 'Workflow Builder'],
      integration: 'Custom APIs'
    },
  ];

  return (
    <Card className="w-full bg-slate-900 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white text-lg">Sub-Agent Architecture - Domain Orchestrator</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleOpenFullSize} className="gap-2 text-slate-300 border-slate-600 hover:bg-slate-800">
            <Maximize2 className="h-4 w-4" />
            Full Size
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadSVG} className="gap-2 text-slate-300 border-slate-600 hover:bg-slate-800">
            <Download className="h-4 w-4" />
            SVG
          </Button>
          <Button variant="default" size="sm" onClick={handleDownloadPNG} className="gap-2 bg-cyan-600 hover:bg-cyan-700">
            <Download className="h-4 w-4" />
            PNG
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div 
          ref={diagramRef}
          className="relative w-full overflow-auto rounded-lg border border-slate-700 bg-slate-950 p-6"
          style={{ minWidth: '1000px' }}
        >
          {/* Title */}
          <h2 className="text-xl font-bold text-center text-white mb-2">
            Sub-Agent Architecture
          </h2>
          <p className="text-slate-400 text-xs text-center mb-8">
            Domain Orchestrator Routes Tasks to Specialist Agents
          </p>

          {/* Input Layer */}
          <div className="flex justify-center mb-6">
            <div className="bg-slate-800 border border-slate-600 rounded-lg px-6 py-3 text-center">
              <span className="text-slate-400 text-xs block mb-1">Incoming Request</span>
              <span className="text-white font-medium text-sm">Patient Onboarding Task Queue</span>
            </div>
          </div>

          {/* Arrow Down */}
          <div className="flex justify-center mb-4">
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-6 bg-cyan-500"></div>
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-transparent border-t-cyan-500"></div>
            </div>
          </div>

          {/* Domain Orchestrator - Central Hub */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 border-2 border-indigo-400 rounded-2xl p-6 w-[400px] shadow-lg shadow-indigo-500/20">
                <div className="text-center">
                  <span className="text-4xl block mb-2">🧠</span>
                  <h3 className="text-xl font-bold text-white mb-1">Domain Orchestrator</h3>
                  <p className="text-indigo-200 text-xs mb-4">Central Intelligence Hub</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div className="bg-indigo-800/50 rounded-lg p-2">
                      <span className="text-[10px] text-indigo-300 block">Task Analysis</span>
                      <span className="text-xs text-white">Intent Classification</span>
                    </div>
                    <div className="bg-indigo-800/50 rounded-lg p-2">
                      <span className="text-[10px] text-indigo-300 block">Agent Selection</span>
                      <span className="text-xs text-white">Capability Matching</span>
                    </div>
                    <div className="bg-indigo-800/50 rounded-lg p-2">
                      <span className="text-[10px] text-indigo-300 block">Dependency Graph</span>
                      <span className="text-xs text-white">Execution Order</span>
                    </div>
                    <div className="bg-indigo-800/50 rounded-lg p-2">
                      <span className="text-[10px] text-indigo-300 block">Result Aggregation</span>
                      <span className="text-xs text-white">Response Synthesis</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Routing Arrows */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-[380px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
            </div>
          </div>
          <div className="flex justify-center mb-6">
            <span className="text-cyan-400 text-xs uppercase tracking-wider">Routes to Specialist Agents</span>
          </div>

          {/* Specialist Agents Grid */}
          <div className="grid grid-cols-6 gap-3 mb-6">
            {specialistAgents.map((agent) => (
              <div 
                key={agent.name} 
                className={`bg-gradient-to-br ${agent.color} ${agent.borderColor} border-2 rounded-xl p-3 relative`}
              >
                {/* Connection Line to Orchestrator */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-0.5 h-4 bg-slate-500"></div>
                </div>
                
                <div className="text-center">
                  <span className="text-2xl block mb-1">{agent.icon}</span>
                  <h4 className="text-xs font-bold text-white mb-2 leading-tight">{agent.name}</h4>
                  
                  {/* Domain Label */}
                  <div className="bg-white/20 rounded px-2 py-0.5 mb-2">
                    <span className="text-[8px] text-white font-medium">{agent.domain}</span>
                  </div>
                  
                  <div className="space-y-1 mb-2">
                    {agent.tasks.map((task) => (
                      <div key={task} className="bg-black/20 rounded px-1.5 py-0.5">
                        <span className="text-[8px] text-white/80">{task}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-white/10 rounded px-2 py-1">
                    <span className="text-[8px] text-white/60">{agent.integration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Return Arrows */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-[380px] bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
            </div>
          </div>
          <div className="flex justify-center mb-6">
            <span className="text-green-400 text-xs uppercase tracking-wider">Returns Verified Results</span>
          </div>

          {/* Output Aggregation */}
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-500 rounded-lg px-8 py-4 text-center">
              <span className="text-green-400 text-xs block mb-2">Aggregated Response</span>
              <div className="flex gap-4">
                {[
                  { label: 'Verification', status: '✓ Validated' },
                  { label: 'Benefits', status: '✓ Checked' },
                  { label: 'Prior Auth', status: '✓ Approved' },
                  { label: 'Coding', status: '✓ Assigned' },
                  { label: 'Adherence', status: '✓ Tracked' },
                  { label: 'Custom', status: '✓ Processed' },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <span className="text-[10px] text-slate-400 block">{item.label}</span>
                    <span className="text-xs text-green-400 font-medium">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Agent Capabilities Matrix */}
          <div className="mt-6 pt-4 border-t border-slate-700">
            <h3 className="text-white text-sm font-bold text-center mb-4">Agent Capabilities Matrix</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-slate-400 py-2 px-2">Agent</th>
                    <th className="text-left text-slate-400 py-2 px-2">Domain</th>
                    <th className="text-left text-slate-400 py-2 px-2">Capabilities</th>
                    <th className="text-left text-slate-400 py-2 px-2">Integration</th>
                  </tr>
                </thead>
                <tbody>
                  {specialistAgents.map((agent) => (
                    <tr key={agent.name} className="border-b border-slate-800">
                      <td className="py-2 px-2">
                        <span className="text-white font-medium">{agent.icon} {agent.name}</span>
                      </td>
                      <td className="py-2 px-2">
                        <span className="text-cyan-400">{agent.domain}</span>
                      </td>
                      <td className="py-2 px-2">
                        <span className="text-slate-300">{agent.tasks.join(', ')}</span>
                      </td>
                      <td className="py-2 px-2">
                        <span className="text-green-400">{agent.integration}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-slate-700">
            <div className="flex justify-center gap-6 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                <span className="text-[10px] text-slate-400">Domain Orchestrator</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                <span className="text-[10px] text-slate-400">Task Routing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-[10px] text-slate-400">Result Aggregation</span>
              </div>
            </div>
            <p className="text-slate-500 text-[10px] text-center">
              The Domain Orchestrator analyzes incoming tasks, routes them to appropriate specialist agents, and aggregates results into a unified response
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubAgentArchitectureDiagram;
