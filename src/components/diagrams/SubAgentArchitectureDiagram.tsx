import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

export const SubAgentArchitectureDiagram: React.FC = () => {
  const diagramRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
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
      
      toast.success('Diagram downloaded as PNG!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download diagram.');
    }
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
      name: 'NPI Lookup Agent', 
      icon: '🔍', 
      color: 'from-blue-600 to-blue-800',
      borderColor: 'border-blue-500',
      tasks: ['Provider Verification', 'License Validation', 'DEA Number Check'],
      api: 'NPPES API'
    },
    { 
      name: 'Eligibility Agent', 
      icon: '✅', 
      color: 'from-green-600 to-green-800',
      borderColor: 'border-green-500',
      tasks: ['Coverage Check', 'Benefits Verification', 'Prior Auth Status'],
      api: 'Payer APIs'
    },
    { 
      name: 'Address Agent', 
      icon: '📍', 
      color: 'from-orange-600 to-orange-800',
      borderColor: 'border-orange-500',
      tasks: ['USPS Validation', 'Geocoding', 'Delivery Verification'],
      api: 'Google Maps API'
    },
    { 
      name: 'Document Agent', 
      icon: '📄', 
      color: 'from-purple-600 to-purple-800',
      borderColor: 'border-purple-500',
      tasks: ['OCR Extraction', 'Data Validation', 'Field Mapping'],
      api: 'Vision AI'
    },
    { 
      name: 'Compliance Agent', 
      icon: '🛡️', 
      color: 'from-cyan-600 to-cyan-800',
      borderColor: 'border-cyan-500',
      tasks: ['HIPAA Check', 'Audit Logging', 'PHI Redaction'],
      api: 'Internal Rules'
    },
    { 
      name: 'Pricing Agent', 
      icon: '💰', 
      color: 'from-yellow-600 to-yellow-800',
      borderColor: 'border-yellow-500',
      tasks: ['Copay Calculation', 'PAP Eligibility', 'Cost Estimation'],
      api: 'Drug Pricing API'
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
          <Button variant="default" size="sm" onClick={handleDownload} className="gap-2 bg-cyan-600 hover:bg-cyan-700">
            <Download className="h-4 w-4" />
            Download PNG
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
                  
                  <div className="space-y-1 mb-2">
                    {agent.tasks.map((task) => (
                      <div key={task} className="bg-black/20 rounded px-1.5 py-0.5">
                        <span className="text-[8px] text-white/80">{task}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-white/10 rounded px-2 py-1">
                    <span className="text-[8px] text-white/60">{agent.api}</span>
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
                  { label: 'NPI', status: '✓ Verified' },
                  { label: 'Eligibility', status: '✓ Active' },
                  { label: 'Address', status: '✓ Valid' },
                  { label: 'Documents', status: '✓ Extracted' },
                  { label: 'Compliance', status: '✓ Passed' },
                  { label: 'Pricing', status: '✓ Calculated' },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <span className="text-[10px] text-slate-400 block">{item.label}</span>
                    <span className="text-xs text-green-400 font-medium">{item.status}</span>
                  </div>
                ))}
              </div>
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
