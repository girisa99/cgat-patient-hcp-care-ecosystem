import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ExternalLink, 
  FileText, 
  Users, 
  Layout, 
  Download
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

// Color legend for consistent enterprise styling
const colorLegend = {
  background: '#1e293b',
  cardBg: '#1e293b',
  headerBg: '#0f172a',
  borderDefault: '#475569',
  borderAccent: '#3b82f6',
  textPrimary: '#f1f5f9',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  accentBlue: '#3b82f6',
  accentPurple: '#7c3aed',
  accentGreen: '#22c55e',
};

export const GenieStudioFunctionalArchDiagram = () => {
  const [activeTab, setActiveTab] = useState('user-journeys');
  const diagramRef = useRef<HTMLDivElement>(null);

  const openDocs = () => {
    window.open('/docs/GENIE_STUDIO_FUNCTIONAL_ARCHITECTURE.md', '_blank');
  };

  const handleDownload = async () => {
    if (!diagramRef.current) return;
    try {
      const canvas = await html2canvas(diagramRef.current, {
        backgroundColor: colorLegend.background,
        scale: 2
      });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `genie-studio-functional-architecture-${activeTab}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Diagram downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download diagram');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-[#1e293b] border-[#475569]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-[#94a3b8]" />
              <div>
                <CardTitle className="text-2xl text-[#f1f5f9]">Functional Architecture</CardTitle>
                <p className="text-[#94a3b8] text-sm">User Journeys, UI Flows & Feature Matrix</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2 border-[#475569] text-[#cbd5e1] hover:bg-[#334155] hover:text-[#f1f5f9]">
                <Download className="h-4 w-4" />
                Download PNG
              </Button>
              <Button variant="outline" size="sm" onClick={openDocs} className="gap-2 border-[#475569] text-[#cbd5e1] hover:bg-[#334155] hover:text-[#f1f5f9]">
                <FileText className="h-4 w-4" />
                Documentation
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full bg-[#0f172a] border border-[#475569]">
          <TabsTrigger value="user-journeys" className="data-[state=active]:bg-[#334155] text-[#cbd5e1] data-[state=active]:text-[#f1f5f9]">User Journeys</TabsTrigger>
          <TabsTrigger value="ui-flows" className="data-[state=active]:bg-[#334155] text-[#cbd5e1] data-[state=active]:text-[#f1f5f9]">UI Flows</TabsTrigger>
          <TabsTrigger value="feature-matrix" className="data-[state=active]:bg-[#334155] text-[#cbd5e1] data-[state=active]:text-[#f1f5f9]">Feature Matrix</TabsTrigger>
          <TabsTrigger value="personas" className="data-[state=active]:bg-[#334155] text-[#cbd5e1] data-[state=active]:text-[#f1f5f9]">User Personas</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[600px] mt-4">
          <div ref={diagramRef}>
            <TabsContent value="user-journeys" className="space-y-4">
              {/* Main User Journey SVG */}
              <Card className="bg-[#1e293b] border-[#475569]">
                <CardHeader>
                  <CardTitle className="text-[#93c5fd]">Primary User Journey: Script to Video</CardTitle>
                </CardHeader>
                <CardContent>
                  <svg viewBox="0 0 1200 400" className="w-full h-auto">
                    <defs>
                      <linearGradient id="funcStepGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#1e3a5f" />
                        <stop offset="100%" stopColor="#1e293b" />
                      </linearGradient>
                      <marker id="arrowFunc" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                      </marker>
                      <filter id="funcShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
                      </filter>
                    </defs>

                    <rect width="1200" height="400" fill="#1e293b" rx="8" />

                    {/* Journey Steps */}
                    <g transform="translate(30, 50)">
                      {[
                        { num: 1, label: 'CREATE', desc: ['New Project', 'Set name & type'] },
                        { num: 2, label: 'WRITE', desc: ['Script Editor', 'Manual or AI'] },
                        { num: 3, label: 'ENHANCE', desc: ['AI Polish', 'Improve clarity'] },
                        { num: 4, label: 'VOICE', desc: ['TTS Generate', 'ElevenLabs'] },
                        { num: 5, label: 'RECORD', desc: ['Recording', 'Teleprompter'] },
                        { num: 6, label: 'EXPORT', desc: ['Final Video', 'MP4/WebM'] },
                      ].map((step, i) => (
                        <g key={step.num} transform={`translate(${i * 180}, 0)`}>
                          <circle cx="60" cy="60" r="50" fill="url(#funcStepGrad)" stroke="#3b82f6" strokeWidth="2" filter="url(#funcShadow)" />
                          <text x="60" y="55" textAnchor="middle" fill="#f1f5f9" fontSize="24" fontWeight="600">{step.num}</text>
                          <text x="60" y="75" textAnchor="middle" fill="#94a3b8" fontSize="10">{step.label}</text>
                          
                          <rect x="10" y="130" width="100" height="60" rx="8" fill="#0f172a" stroke="#475569" strokeWidth="1" />
                          <text x="60" y="155" textAnchor="middle" fill="#f1f5f9" fontSize="11">{step.desc[0]}</text>
                          <text x="60" y="175" textAnchor="middle" fill="#94a3b8" fontSize="9">{step.desc[1]}</text>
                          
                          {i < 5 && (
                            <line x1="120" y1="60" x2="170" y2="60" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowFunc)" />
                          )}
                        </g>
                      ))}
                    </g>

                    {/* Alternative Paths */}
                    <g transform="translate(30, 240)">
                      <text x="0" y="20" fill="#94a3b8" fontSize="12" fontWeight="600">ALTERNATIVE PATHS:</text>
                      
                      {[
                        { text: 'Quick TTS: Skip to Step 4 → Generate audio only', x: 0 },
                        { text: 'Script Only: Steps 1-3 → Export as document', x: 370 },
                        { text: 'Manual Record: Skip TTS → Direct recording', x: 740 },
                      ].map((path, i) => (
                        <g key={i}>
                          <rect x={path.x} y="35" width="350" height="35" rx="6" fill="#0f172a" stroke="#475569" strokeWidth="1" />
                          <text x={path.x + 10} y="57" fill="#cbd5e1" fontSize="11">{path.text}</text>
                        </g>
                      ))}
                    </g>

                    {/* Time Estimate */}
                    <g transform="translate(30, 320)">
                      <rect width="1110" height="50" rx="8" fill="#14532d" stroke="#22c55e" strokeWidth="1" />
                      <text x="20" y="30" fill="#bbf7d0" fontSize="12" fontWeight="600">TYPICAL TIME:</text>
                      <text x="150" y="30" fill="#d1fae5" fontSize="11">5-minute video = ~15 minutes total (AI-assisted) | ~45 minutes (fully manual)</text>
                    </g>

                    {/* Color Legend */}
                    <g transform="translate(950, 320)">
                      <text x="0" y="15" fill="#94a3b8" fontSize="9">Legend:</text>
                      <rect x="50" y="5" width="12" height="12" rx="2" fill="#3b82f6" />
                      <text x="68" y="15" fill="#cbd5e1" fontSize="9">Active Step</text>
                      <rect x="130" y="5" width="12" height="12" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="1" />
                      <text x="148" y="15" fill="#cbd5e1" fontSize="9">Info Card</text>
                    </g>
                  </svg>
                </CardContent>
              </Card>

              {/* Journey Variants */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { title: 'Content Creator', focus: 'Quick content with AI assistance', items: ['AI script generation', 'TTS voiceover', 'Screen recording'], color: '#3b82f6' },
                  { title: 'Training Producer', focus: 'Professional training videos', items: ['Teleprompter recording', 'Multi-take editing', 'Quality review'], color: '#22c55e' },
                  { title: 'Marketing Team', focus: 'Branded content at scale', items: ['Template library', 'Batch processing', 'Brand consistency'], color: '#f59e0b' },
                ].map((variant, i) => (
                  <Card key={i} className="bg-[#1e293b] border-[#475569]">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: variant.color }} />
                        <span className="text-[#f1f5f9] font-semibold">{variant.title}</span>
                      </div>
                      <p className="text-sm text-[#94a3b8] mb-2">Focus: {variant.focus}</p>
                      <div className="text-xs text-[#cbd5e1] space-y-1">
                        {variant.items.map((item, j) => (
                          <p key={j}>• {item}</p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ui-flows" className="space-y-4">
              <Card className="bg-[#1e293b] border-[#475569]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#93c5fd]">
                    <Layout className="h-5 w-5" />
                    UI Component Flow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <svg viewBox="0 0 1200 500" className="w-full h-auto">
                    <rect width="1200" height="500" fill="#1e293b" rx="8" />

                    {/* Genie Studio UI */}
                    <g transform="translate(30, 30)">
                      <rect width="550" height="440" rx="12" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" />
                      <rect width="550" height="40" rx="12" fill="#1e3a5f" />
                      <text x="275" y="26" textAnchor="middle" fill="#f1f5f9" fontSize="14" fontWeight="600">GENIE STUDIO UI</text>

                      {/* Sidebar */}
                      <g transform="translate(10, 50)">
                        <rect width="120" height="380" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                        <text x="60" y="25" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">SIDEBAR</text>
                        
                        {['Projects', 'Scripts', 'Recordings', 'Knowledge', 'Settings'].map((item, i) => (
                          <g key={item}>
                            <rect x="10" y={40 + i * 40} width="100" height="30" rx="4" fill="#0f172a" stroke="#475569" strokeWidth="1" />
                            <text x="60" y={60 + i * 40} textAnchor="middle" fill="#cbd5e1" fontSize="9">{item}</text>
                          </g>
                        ))}
                      </g>

                      {/* Main Content Area */}
                      <g transform="translate(140, 50)">
                        <rect width="400" height="380" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                        <text x="200" y="25" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">MAIN CONTENT AREA</text>
                        
                        {/* Script Editor */}
                        <rect x="10" y="40" width="380" height="150" rx="6" fill="#0f172a" stroke="#3b82f6" strokeWidth="1" />
                        <text x="20" y="60" fill="#93c5fd" fontSize="10" fontWeight="600">Script Editor</text>
                        {[75, 95, 115, 135].map((y, i) => (
                          <rect key={i} x="20" y={y} width={350 - i * 50} height="12" rx="2" fill="#1e293b" />
                        ))}
                        
                        <rect x="280" y="155" width="100" height="25" rx="4" fill="#3b82f6" />
                        <text x="330" y="172" textAnchor="middle" fill="#f1f5f9" fontSize="9">AI Enhance</text>

                        {/* TTS Controls */}
                        <rect x="10" y="200" width="185" height="80" rx="6" fill="#0f172a" stroke="#7c3aed" strokeWidth="1" />
                        <text x="20" y="220" fill="#c4b5fd" fontSize="10" fontWeight="600">TTS Controls</text>
                        <rect x="20" y="235" width="80" height="20" rx="3" fill="#1e293b" />
                        <text x="60" y="249" textAnchor="middle" fill="#cbd5e1" fontSize="8">Voice: Sarah</text>
                        <rect x="110" y="235" width="70" height="20" rx="3" fill="#7c3aed" />
                        <text x="145" y="249" textAnchor="middle" fill="#f1f5f9" fontSize="8">Generate</text>

                        {/* Preview */}
                        <rect x="205" y="200" width="185" height="80" rx="6" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
                        <text x="215" y="220" fill="#fcd34d" fontSize="10" fontWeight="600">Preview</text>
                        <circle cx="297" cy="250" r="15" fill="#f59e0b" />
                        <text x="297" y="255" textAnchor="middle" fill="#0f172a" fontSize="12">▶</text>

                        {/* Action Buttons */}
                        <rect x="10" y="295" width="120" height="35" rx="6" fill="#22c55e" />
                        <text x="70" y="318" textAnchor="middle" fill="#0f172a" fontSize="11" fontWeight="500">Record</text>
                        
                        <rect x="140" y="295" width="120" height="35" rx="6" fill="#3b82f6" />
                        <text x="200" y="318" textAnchor="middle" fill="#f1f5f9" fontSize="11">Save</text>
                        
                        <rect x="270" y="295" width="120" height="35" rx="6" fill="#0f172a" stroke="#475569" strokeWidth="1" />
                        <text x="330" y="318" textAnchor="middle" fill="#cbd5e1" fontSize="11">Export</text>
                      </g>
                    </g>

                    {/* Arrow between UIs */}
                    <g transform="translate(590, 250)">
                      <rect x="0" y="-15" width="40" height="30" rx="4" fill="#3b82f6" />
                      <text x="20" y="5" textAnchor="middle" fill="#f1f5f9" fontSize="16" fontWeight="bold">→</text>
                    </g>

                    {/* Recording Studio UI */}
                    <g transform="translate(620, 30)">
                      <rect width="550" height="440" rx="12" fill="#0f172a" stroke="#22c55e" strokeWidth="2" />
                      <rect width="550" height="40" rx="12" fill="#14532d" />
                      <text x="275" y="26" textAnchor="middle" fill="#f1f5f9" fontSize="14" fontWeight="600">RECORDING STUDIO UI</text>

                      {/* Video Preview */}
                      <g transform="translate(10, 50)">
                        <rect width="530" height="200" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                        <text x="265" y="25" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">CAMERA PREVIEW</text>
                        <rect x="20" y="40" width="330" height="140" rx="6" fill="#0f172a" stroke="#475569" strokeWidth="1" />
                        <text x="185" y="115" textAnchor="middle" fill="#94a3b8" fontSize="12">Camera Feed</text>
                        
                        {/* PiP */}
                        <rect x="370" y="40" width="140" height="80" rx="6" fill="#0f172a" stroke="#475569" strokeWidth="1" />
                        <text x="440" y="85" textAnchor="middle" fill="#94a3b8" fontSize="9">Screen Share</text>
                      </g>

                      {/* Teleprompter */}
                      <g transform="translate(10, 260)">
                        <rect width="350" height="120" rx="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="1" />
                        <text x="175" y="25" textAnchor="middle" fill="#93c5fd" fontSize="10" fontWeight="600">TELEPROMPTER</text>
                        {[40, 58, 76, 94].map((y, i) => (
                          <rect key={i} x="20" y={y} width={310 - i * 20} height="12" rx="2" fill={i === 3 ? '#1e3a5f' : '#0f172a'} />
                        ))}
                      </g>

                      {/* Controls */}
                      <g transform="translate(370, 260)">
                        <rect width="170" height="120" rx="8" fill="#1e293b" stroke="#ef4444" strokeWidth="1" />
                        <text x="85" y="25" textAnchor="middle" fill="#fca5a5" fontSize="10" fontWeight="600">CONTROLS</text>
                        
                        <circle cx="85" cy="70" r="30" fill="#ef4444" stroke="#fca5a5" strokeWidth="2" />
                        <text x="85" y="75" textAnchor="middle" fill="#f1f5f9" fontSize="16">●</text>
                        <text x="85" y="110" textAnchor="middle" fill="#fca5a5" fontSize="9">REC</text>
                      </g>

                      {/* Audio Levels */}
                      <g transform="translate(10, 390)">
                        <rect width="530" height="40" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                        <text x="20" y="25" fill="#94a3b8" fontSize="9">Audio Level:</text>
                        <rect x="100" y="12" width="350" height="16" rx="3" fill="#0f172a" />
                        <rect x="100" y="12" width="220" height="16" rx="3" fill="#22c55e" />
                      </g>
                    </g>

                    {/* Color Legend */}
                    <g transform="translate(30, 480)">
                      <text x="0" y="0" fill="#94a3b8" fontSize="9">Color Legend:</text>
                      <rect x="80" y="-10" width="12" height="12" rx="2" fill="#3b82f6" />
                      <text x="98" y="0" fill="#cbd5e1" fontSize="9">Script/Edit</text>
                      <rect x="160" y="-10" width="12" height="12" rx="2" fill="#22c55e" />
                      <text x="178" y="0" fill="#cbd5e1" fontSize="9">Record</text>
                      <rect x="230" y="-10" width="12" height="12" rx="2" fill="#7c3aed" />
                      <text x="248" y="0" fill="#cbd5e1" fontSize="9">TTS/Audio</text>
                      <rect x="310" y="-10" width="12" height="12" rx="2" fill="#f59e0b" />
                      <text x="328" y="0" fill="#cbd5e1" fontSize="9">Preview</text>
                      <rect x="390" y="-10" width="12" height="12" rx="2" fill="#ef4444" />
                      <text x="408" y="0" fill="#cbd5e1" fontSize="9">Recording</text>
                    </g>
                  </svg>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="feature-matrix" className="space-y-4">
              <Card className="bg-[#1e293b] border-[#475569]">
                <CardHeader>
                  <CardTitle className="text-[#93c5fd]">Feature Implementation Matrix</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#475569]">
                          <th className="text-left py-3 px-4 text-[#94a3b8] font-medium">Feature</th>
                          <th className="text-center py-3 px-4 text-[#94a3b8] font-medium">P0 Core</th>
                          <th className="text-center py-3 px-4 text-[#94a3b8] font-medium">P1 Enhanced</th>
                          <th className="text-center py-3 px-4 text-[#94a3b8] font-medium">P2 Advanced</th>
                          <th className="text-center py-3 px-4 text-[#94a3b8] font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: 'Script Creation', p0: true, p1: true, p2: true, status: 'done' },
                          { name: 'AI Script Generation', p0: true, p1: true, p2: true, status: 'done' },
                          { name: 'TTS Voice Generation', p0: true, p1: true, p2: true, status: 'done' },
                          { name: 'Teleprompter Recording', p0: true, p1: true, p2: true, status: 'done' },
                          { name: 'Multi-track Audio', p0: false, p1: true, p2: true, status: 'done' },
                          { name: 'Screen Recording', p0: false, p1: true, p2: true, status: 'partial' },
                          { name: 'Audio Ducking', p0: false, p1: true, p2: true, status: 'partial' },
                          { name: 'Collaborative Editing', p0: false, p1: false, p2: true, status: 'planned' },
                          { name: 'Version Control', p0: false, p1: false, p2: true, status: 'planned' },
                          { name: 'Analytics Dashboard', p0: false, p1: false, p2: true, status: 'partial' },
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-[#334155]">
                            <td className="py-3 px-4 text-[#f1f5f9]">{row.name}</td>
                            <td className="text-center py-3 px-4">
                              {row.p0 ? <span className="text-[#22c55e]">●</span> : <span className="text-[#475569]">○</span>}
                            </td>
                            <td className="text-center py-3 px-4">
                              {row.p1 ? <span className="text-[#22c55e]">●</span> : <span className="text-[#475569]">○</span>}
                            </td>
                            <td className="text-center py-3 px-4">
                              {row.p2 ? <span className="text-[#22c55e]">●</span> : <span className="text-[#475569]">○</span>}
                            </td>
                            <td className="text-center py-3 px-4">
                              <Badge variant="outline" className={
                                row.status === 'done' ? 'border-[#22c55e] text-[#86efac]' :
                                row.status === 'partial' ? 'border-[#f59e0b] text-[#fcd34d]' :
                                'border-[#475569] text-[#94a3b8]'
                              }>
                                {row.status === 'done' ? '✓ Done' : row.status === 'partial' ? '◐ Partial' : '○ Planned'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="personas" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    title: 'Content Creator',
                    role: 'Individual / Small Team',
                    goals: ['Quick video production', 'AI-assisted content', 'Social media ready'],
                    pain: ['Time constraints', 'Limited resources', 'Technical complexity'],
                    color: '#3b82f6'
                  },
                  {
                    title: 'Training Manager',
                    role: 'L&D Department',
                    goals: ['Professional training videos', 'Consistent quality', 'Compliance tracking'],
                    pain: ['Review cycles', 'Version control', 'Multi-stakeholder approval'],
                    color: '#22c55e'
                  },
                  {
                    title: 'Marketing Lead',
                    role: 'Marketing Team',
                    goals: ['Brand consistency', 'High volume output', 'Performance analytics'],
                    pain: ['Template management', 'Asset organization', 'Campaign coordination'],
                    color: '#f59e0b'
                  },
                  {
                    title: 'Healthcare Educator',
                    role: 'Clinical Education',
                    goals: ['Accurate medical content', 'Regulatory compliance', 'Patient education'],
                    pain: ['Medical accuracy', 'Legal review', 'Accessibility requirements'],
                    color: '#7c3aed'
                  }
                ].map((persona, i) => (
                  <Card key={i} className="bg-[#1e293b] border-[#475569]">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${persona.color}20`, border: `2px solid ${persona.color}` }}>
                          <Users className="h-5 w-5" style={{ color: persona.color }} />
                        </div>
                        <div>
                          <CardTitle className="text-[#f1f5f9] text-lg">{persona.title}</CardTitle>
                          <p className="text-[#94a3b8] text-sm">{persona.role}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-[#94a3b8] text-xs font-medium mb-2">GOALS</p>
                        <div className="space-y-1">
                          {persona.goals.map((g, j) => (
                            <p key={j} className="text-[#cbd5e1] text-sm">• {g}</p>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[#94a3b8] text-xs font-medium mb-2">PAIN POINTS</p>
                        <div className="space-y-1">
                          {persona.pain.map((p, j) => (
                            <p key={j} className="text-[#94a3b8] text-sm">• {p}</p>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default GenieStudioFunctionalArchDiagram;
