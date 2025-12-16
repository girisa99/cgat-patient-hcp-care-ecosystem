import React, { useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';

export const DocumentProcessingArchitectureDiagram = () => {
  const diagramRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);

  const handleDownload = useCallback(async () => {
    if (!diagramRef.current) return;
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(diagramRef.current, {
        backgroundColor: '#0f172a',
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const link = document.createElement('a');
      link.download = 'document-processing-architecture.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success('Architecture diagram downloaded!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download diagram');
    }
  }, []);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
  const handleFitScreen = () => setScale(1);

  return (
    <Card className="w-full bg-slate-900 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white text-lg">Document Processing Platform Architecture</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleZoomOut} className="h-8 w-8 p-0">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleFitScreen} className="h-8 w-8 p-0">
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomIn} className="h-8 w-8 p-0">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="default" size="sm" onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Download PNG
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-auto">
        <div 
          ref={diagramRef} 
          className="min-w-[900px] p-6 bg-slate-900"
          style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
        >
          {/* Layer 1: Document Types */}
          <div className="mb-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">Layer 1: Document Input</div>
            <div className="grid grid-cols-4 gap-3">
              <DocTypeBox icon="💊" title="Prescription/Rx" subtitle="Multi-medication extraction" color="emerald" />
              <DocTypeBox icon="🏥" title="Insurance Card" subtitle="3 variant auto-detection" color="blue" />
              <DocTypeBox icon="🩻" title="Medical Imaging" subtitle="Vision AI analysis" color="purple" />
              <DocTypeBox icon="📄" title="Invoice/RCM" subtitle="Table extraction + AR" color="amber" />
            </div>
          </div>

          {/* Arrow Down */}
          <FlowArrow />

          {/* Layer 2: Intelligent Router */}
          <div className="mb-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">Layer 2: Intelligent Routing</div>
            <div className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border border-cyan-500/30 rounded-lg p-4">
              <div className="flex items-center justify-center gap-4">
                <div className="text-cyan-400 font-semibold">🧠 INTELLIGENT PARADIGM ROUTER</div>
              </div>
              <div className="text-center text-slate-400 text-sm mt-2">
                Auto-detect document type → Route to correct processing paradigm
              </div>
            </div>
          </div>

          {/* Arrow Down */}
          <FlowArrow />

          {/* Layer 3: Processing Paradigms */}
          <div className="mb-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">Layer 3: Processing Paradigms</div>
            <div className="grid grid-cols-4 gap-3">
              <ParadigmBox 
                title="FIELD EXTRACTION" 
                items={['Gemini NLP', 'Multi-medication', 'NDC Lookup', 'Clinical Recommendations']}
                color="emerald"
              />
              <ParadigmBox 
                title="VARIANT DETECTION" 
                items={['Pharmacy Insurance', 'Medical Insurance', 'Medicaid', 'Abbreviation Expansion']}
                color="blue"
              />
              <ParadigmBox 
                title="VISION AI" 
                items={['Modality Detection', 'Organ Identification', 'Multi-panel Analysis', 'Clinical Insights']}
                color="purple"
              />
              <ParadigmBox 
                title="TABLE/RCM" 
                items={['Line Item Extract', 'Header Detection', 'AR Aging Analysis', 'Payment Tracking']}
                color="amber"
              />
            </div>
          </div>

          {/* Arrow Down */}
          <FlowArrow />

          {/* Layer 4: Multi-Provider OCR */}
          <div className="mb-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">Layer 4: Multi-Provider OCR Engine</div>
            <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
              <div className="grid grid-cols-4 gap-3">
                <ProviderBadge name="Google Vision" icon="🔍" />
                <ProviderBadge name="Azure Form Recognizer" icon="☁️" />
                <ProviderBadge name="AWS Textract" icon="📦" />
                <ProviderBadge name="Gemini Vision+NLP" icon="✨" />
              </div>
              <div className="text-center text-slate-500 text-xs mt-3">
                Dynamic provider selection with automatic failover
              </div>
            </div>
          </div>

          {/* Arrow Down */}
          <FlowArrow />

          {/* Layer 5: Database */}
          <div className="mb-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">Layer 5: Persistence Layer</div>
            <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-green-400 font-semibold">🗄️ SUPABASE DATABASE</span>
                <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded">RLS Enabled</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-800/50 rounded p-2 text-center">
                  <div className="text-slate-300">document_processing_jobs</div>
                  <div className="text-slate-500">user_id filtering</div>
                </div>
                <div className="bg-slate-800/50 rounded p-2 text-center">
                  <div className="text-slate-300">extracted_data (JSONB)</div>
                  <div className="text-slate-500">ndc_clinical_data</div>
                </div>
                <div className="bg-slate-800/50 rounded p-2 text-center">
                  <div className="text-slate-300">rcm_analytics (JSONB)</div>
                  <div className="text-slate-500">Multi-tenant isolation</div>
                </div>
              </div>
            </div>
          </div>

          {/* Arrow Down */}
          <FlowArrow />

          {/* Layer 6: Sub-Agent Generation */}
          <div className="mb-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">Layer 6: Sub-Agent Auto-Generation</div>
            <div className="bg-gradient-to-r from-violet-900/30 to-purple-900/30 border border-violet-500/30 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-violet-400 font-semibold">🤖 INTELLIGENT SUB-AGENT RECOMMENDATIONS</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <AgentBadge name="NDC Verification Agent" />
                <AgentBadge name="Insurance Eligibility Agent" />
                <AgentBadge name="Clinical Review Agent" />
                <AgentBadge name="Claims Processing Agent" />
              </div>
              <div className="text-center text-slate-500 text-xs mt-2">
                Document Type → Recommended Agents → Canvas Workflow Auto-Generation
              </div>
            </div>
          </div>

          {/* Arrow Down */}
          <FlowArrow />

          {/* Layer 7: MCP SDK Export */}
          <div className="mb-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">Layer 7: MCP SDK Three-Phase Export</div>
            <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-500/30 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-orange-400 font-semibold">🔗 MCP SDK INTEGRATION</span>
              </div>
              
              {/* Three Phases */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-slate-800/70 rounded-lg p-3 border border-orange-500/20">
                  <div className="text-orange-400 text-xs font-semibold mb-1">Phase A: Server-Side</div>
                  <div className="text-slate-400 text-xs">Tool schema definition & CRM library integration</div>
                </div>
                <div className="bg-slate-800/70 rounded-lg p-3 border border-orange-500/20">
                  <div className="text-orange-400 text-xs font-semibold mb-1">Phase B: Client-Side</div>
                  <div className="text-slate-400 text-xs">Tool discovery, field mapping & request building</div>
                </div>
                <div className="bg-slate-800/70 rounded-lg p-3 border border-orange-500/20">
                  <div className="text-orange-400 text-xs font-semibold mb-1">Phase C: Execution</div>
                  <div className="text-slate-400 text-xs">OAuth auth, API calls & confirmation tracking</div>
                </div>
              </div>

              {/* Export Targets */}
              <div className="grid grid-cols-7 gap-2">
                <ExportBadge name="Salesforce" icon="☁️" />
                <ExportBadge name="HubSpot" icon="🧡" />
                <ExportBadge name="Veeva" icon="💊" />
                <ExportBadge name="Webhook" icon="🔔" />
                <ExportBadge name="JSON" icon="{ }" />
                <ExportBadge name="CSV" icon="📊" />
                <ExportBadge name="REST API" icon="🌐" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-slate-600 text-xs mt-4 pt-4 border-t border-slate-700">
            Built in 56 hours • Configuration-driven • Multi-tenant • Production-ready
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper Components
const DocTypeBox = ({ icon, title, subtitle, color }: { icon: string; title: string; subtitle: string; color: string }) => {
  const colorClasses: Record<string, string> = {
    emerald: 'from-emerald-900/50 to-emerald-800/30 border-emerald-500/40 text-emerald-400',
    blue: 'from-blue-900/50 to-blue-800/30 border-blue-500/40 text-blue-400',
    purple: 'from-purple-900/50 to-purple-800/30 border-purple-500/40 text-purple-400',
    amber: 'from-amber-900/50 to-amber-800/30 border-amber-500/40 text-amber-400',
  };
  
  return (
    <div className={`bg-gradient-to-b ${colorClasses[color]} border rounded-lg p-3 text-center`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`font-semibold text-sm ${colorClasses[color].split(' ').pop()}`}>{title}</div>
      <div className="text-slate-500 text-xs">{subtitle}</div>
    </div>
  );
};

const ParadigmBox = ({ title, items, color }: { title: string; items: string[]; color: string }) => {
  const colorClasses: Record<string, string> = {
    emerald: 'border-emerald-500/30 text-emerald-400',
    blue: 'border-blue-500/30 text-blue-400',
    purple: 'border-purple-500/30 text-purple-400',
    amber: 'border-amber-500/30 text-amber-400',
  };
  
  return (
    <div className={`bg-slate-800/50 ${colorClasses[color].split(' ')[0]} border rounded-lg p-3`}>
      <div className={`font-semibold text-xs mb-2 ${colorClasses[color].split(' ').pop()}`}>{title}</div>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="text-slate-400 text-xs flex items-center gap-1">
            <span className="text-slate-600">•</span> {item}
          </div>
        ))}
      </div>
    </div>
  );
};

const ProviderBadge = ({ name, icon }: { name: string; icon: string }) => (
  <div className="bg-slate-700/50 rounded-lg p-2 text-center border border-slate-600/50">
    <div className="text-lg">{icon}</div>
    <div className="text-slate-300 text-xs">{name}</div>
  </div>
);

const AgentBadge = ({ name }: { name: string }) => (
  <div className="bg-violet-500/10 text-violet-300 text-xs px-2 py-1.5 rounded text-center border border-violet-500/20">
    {name}
  </div>
);

const ExportBadge = ({ name, icon }: { name: string; icon: string }) => (
  <div className="bg-slate-800/70 rounded p-1.5 text-center border border-slate-600/50">
    <div className="text-sm">{icon}</div>
    <div className="text-slate-400 text-[10px]">{name}</div>
  </div>
);

const FlowArrow = () => (
  <div className="flex justify-center my-2">
    <div className="flex flex-col items-center">
      <div className="w-0.5 h-4 bg-slate-600"></div>
      <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-600"></div>
    </div>
  </div>
);

export default DocumentProcessingArchitectureDiagram;
