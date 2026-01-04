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

// Consistent enterprise color palette (matching Full Architecture diagram)
const colors = {
  // Status colors
  completed: { bg: '#10b981', text: '#ffffff', light: '#d1fae5' },
  inProgress: { bg: '#f59e0b', text: '#ffffff', light: '#fef3c7' },
  planned: { bg: '#6366f1', text: '#ffffff', light: '#e0e7ff' },
  
  // Layer colors
  presentation: { bg: '#0ea5e9', text: '#ffffff', light: '#e0f2fe' },
  application: { bg: '#8b5cf6', text: '#ffffff', light: '#ede9fe' },
  domain: { bg: '#ec4899', text: '#ffffff', light: '#fce7f3' },
  infrastructure: { bg: '#64748b', text: '#ffffff', light: '#f1f5f9' },
  
  // Neutral
  border: '#e2e8f0',
  background: '#ffffff',
  cardBg: '#f8fafc',
  text: '#1e293b',
  textMuted: '#64748b',
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
        backgroundColor: colors.background,
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
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-muted-foreground" />
              <div>
                <CardTitle className="text-2xl text-foreground">Functional Architecture</CardTitle>
                <p className="text-muted-foreground text-sm">User Journeys, UI Flows & Feature Matrix</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
                <Download className="h-4 w-4" />
                Download PNG
              </Button>
              <Button variant="outline" size="sm" onClick={openDocs} className="gap-2">
                <FileText className="h-4 w-4" />
                Documentation
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="user-journeys">User Journeys</TabsTrigger>
          <TabsTrigger value="ui-flows">UI Flows</TabsTrigger>
          <TabsTrigger value="feature-matrix">Feature Matrix</TabsTrigger>
          <TabsTrigger value="personas">User Personas</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[600px] mt-4">
          <div ref={diagramRef} className="p-4 bg-white rounded-lg">
            {/* Legend */}
            <div className="mb-4 p-3 rounded-lg border" style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2" style={{ color: colors.text }}>Implementation Status</h4>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.completed.bg }} />
                      <span className="text-xs" style={{ color: colors.textMuted }}>Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.inProgress.bg }} />
                      <span className="text-xs" style={{ color: colors.textMuted }}>In Progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.planned.bg }} />
                      <span className="text-xs" style={{ color: colors.textMuted }}>Planned</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2" style={{ color: colors.text }}>User Personas</h4>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.presentation.bg }} />
                      <span className="text-xs" style={{ color: colors.textMuted }}>Content Creator</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.completed.bg }} />
                      <span className="text-xs" style={{ color: colors.textMuted }}>Training Producer</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.inProgress.bg }} />
                      <span className="text-xs" style={{ color: colors.textMuted }}>Marketing Team</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <TabsContent value="user-journeys" className="space-y-4 mt-0">
              {/* Main User Journey SVG */}
              <Card className="border" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                <CardHeader>
                  <CardTitle style={{ color: colors.presentation.bg }}>Primary User Journey: Script to Video</CardTitle>
                </CardHeader>
                <CardContent>
                  <svg viewBox="0 0 1200 380" className="w-full h-auto">
                    <defs>
                      <marker id="arrowFunc" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill={colors.presentation.bg} />
                      </marker>
                    </defs>

                    <rect width="1200" height="380" fill={colors.background} rx="8" />

                    {/* Journey Steps */}
                    <g transform="translate(30, 40)">
                      {[
                        { num: 1, label: 'CREATE', desc: ['New Project', 'Set name & type'], color: colors.presentation.bg },
                        { num: 2, label: 'WRITE', desc: ['Script Editor', 'Manual or AI'], color: colors.application.bg },
                        { num: 3, label: 'ENHANCE', desc: ['AI Polish', 'Improve clarity'], color: colors.domain.bg },
                        { num: 4, label: 'VOICE', desc: ['TTS Generate', 'ElevenLabs'], color: colors.inProgress.bg },
                        { num: 5, label: 'RECORD', desc: ['Recording', 'Teleprompter'], color: colors.completed.bg },
                        { num: 6, label: 'EXPORT', desc: ['Final Video', 'MP4/WebM'], color: colors.planned.bg },
                      ].map((step, i) => (
                        <g key={step.num} transform={`translate(${i * 180}, 0)`}>
                          <circle cx="60" cy="60" r="50" fill={step.color} opacity="0.15" stroke={step.color} strokeWidth="2" />
                          <text x="60" y="55" textAnchor="middle" fill={step.color} fontSize="24" fontWeight="600">{step.num}</text>
                          <text x="60" y="75" textAnchor="middle" fill={colors.textMuted} fontSize="10">{step.label}</text>
                          
                          <rect x="10" y="130" width="100" height="55" rx="6" fill={colors.cardBg} stroke={colors.border} strokeWidth="1" />
                          <text x="60" y="152" textAnchor="middle" fill={colors.text} fontSize="11">{step.desc[0]}</text>
                          <text x="60" y="170" textAnchor="middle" fill={colors.textMuted} fontSize="9">{step.desc[1]}</text>
                          
                          {i < 5 && (
                            <line x1="120" y1="60" x2="170" y2="60" stroke={colors.border} strokeWidth="2" markerEnd="url(#arrowFunc)" />
                          )}
                        </g>
                      ))}
                    </g>

                    {/* Alternative Paths */}
                    <g transform="translate(30, 220)">
                      <text x="0" y="20" fill={colors.textMuted} fontSize="12" fontWeight="600">ALTERNATIVE PATHS:</text>
                      
                      {[
                        { text: 'Quick TTS: Skip to Step 4 → Generate audio only', x: 0 },
                        { text: 'Script Only: Steps 1-3 → Export as document', x: 370 },
                        { text: 'Manual Record: Skip TTS → Direct recording', x: 740 },
                      ].map((path, i) => (
                        <g key={i}>
                          <rect x={path.x} y="35" width="350" height="32" rx="6" fill={colors.cardBg} stroke={colors.border} strokeWidth="1" />
                          <text x={path.x + 15} y="56" fill={colors.text} fontSize="11">{path.text}</text>
                        </g>
                      ))}
                    </g>

                    {/* Time Estimate */}
                    <g transform="translate(30, 300)">
                      <rect width="1110" height="45" rx="8" fill={colors.completed.light} stroke={colors.completed.bg} strokeWidth="1" />
                      <text x="20" y="28" fill={colors.completed.bg} fontSize="12" fontWeight="600">TYPICAL TIME:</text>
                      <text x="150" y="28" fill={colors.text} fontSize="11">5-minute video = ~15 minutes total (AI-assisted) | ~45 minutes (fully manual)</text>
                    </g>
                  </svg>
                </CardContent>
              </Card>

              {/* Journey Variants */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { title: 'Content Creator', focus: 'Quick content with AI assistance', items: ['AI script generation', 'TTS voiceover', 'Screen recording'], color: colors.presentation.bg, lightColor: colors.presentation.light },
                  { title: 'Training Producer', focus: 'Professional training videos', items: ['Teleprompter recording', 'Multi-take editing', 'Quality review'], color: colors.completed.bg, lightColor: colors.completed.light },
                  { title: 'Marketing Team', focus: 'Branded content at scale', items: ['Template library', 'Batch processing', 'Brand consistency'], color: colors.inProgress.bg, lightColor: colors.inProgress.light },
                ].map((variant, i) => (
                  <Card key={i} className="border-2" style={{ borderColor: variant.color, backgroundColor: variant.lightColor }}>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: variant.color }} />
                        <span className="font-semibold" style={{ color: variant.color }}>{variant.title}</span>
                      </div>
                      <p className="text-sm mb-2" style={{ color: colors.textMuted }}>Focus: {variant.focus}</p>
                      <div className="text-xs space-y-1" style={{ color: colors.text }}>
                        {variant.items.map((item, j) => (
                          <p key={j}>• {item}</p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ui-flows" className="space-y-4 mt-0">
              <Card className="border" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: colors.presentation.bg }}>
                    <Layout className="h-5 w-5" />
                    UI Component Flow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <svg viewBox="0 0 1200 480" className="w-full h-auto">
                    <rect width="1200" height="480" fill={colors.background} rx="8" />

                    {/* Genie Studio UI */}
                    <g transform="translate(30, 20)">
                      <rect width="550" height="430" rx="12" fill={colors.cardBg} stroke={colors.presentation.bg} strokeWidth="2" />
                      <rect width="550" height="36" rx="12" fill={colors.presentation.bg} />
                      <text x="275" y="24" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="600">GENIE STUDIO UI</text>

                      {/* Sidebar */}
                      <g transform="translate(10, 46)">
                        <rect width="120" height="370" rx="8" fill={colors.background} stroke={colors.border} strokeWidth="1" />
                        <text x="60" y="22" textAnchor="middle" fill={colors.textMuted} fontSize="10" fontWeight="600">SIDEBAR</text>
                        
                        {['Projects', 'Scripts', 'Recordings', 'Knowledge', 'Settings'].map((item, i) => (
                          <g key={item}>
                            <rect x="10" y={35 + i * 38} width="100" height="28" rx="4" fill={colors.cardBg} stroke={colors.border} strokeWidth="1" />
                            <text x="60" y={54 + i * 38} textAnchor="middle" fill={colors.text} fontSize="9">{item}</text>
                          </g>
                        ))}
                      </g>

                      {/* Main Content Area */}
                      <g transform="translate(140, 46)">
                        <rect width="400" height="370" rx="8" fill={colors.background} stroke={colors.border} strokeWidth="1" />
                        <text x="200" y="22" textAnchor="middle" fill={colors.textMuted} fontSize="10" fontWeight="600">MAIN CONTENT AREA</text>
                        
                        {/* Script Editor */}
                        <rect x="10" y="35" width="380" height="140" rx="6" fill={colors.cardBg} stroke={colors.presentation.bg} strokeWidth="1" />
                        <text x="20" y="55" fill={colors.presentation.bg} fontSize="10" fontWeight="600">Script Editor</text>
                        {[70, 88, 106, 124].map((y, i) => (
                          <rect key={i} x="20" y={y} width={340 - i * 50} height="10" rx="2" fill={colors.border} />
                        ))}
                        
                        <rect x="280" y="145" width="100" height="22" rx="4" fill={colors.presentation.bg} />
                        <text x="330" y="160" textAnchor="middle" fill="#ffffff" fontSize="9">AI Enhance</text>

                        {/* TTS Controls */}
                        <rect x="10" y="185" width="185" height="75" rx="6" fill={colors.cardBg} stroke={colors.application.bg} strokeWidth="1" />
                        <text x="20" y="205" fill={colors.application.bg} fontSize="10" fontWeight="600">TTS Controls</text>
                        <rect x="20" y="218" width="80" height="18" rx="3" fill={colors.border} />
                        <text x="60" y="230" textAnchor="middle" fill={colors.text} fontSize="8">Voice: Sarah</text>
                        <rect x="110" y="218" width="70" height="18" rx="3" fill={colors.application.bg} />
                        <text x="145" y="230" textAnchor="middle" fill="#ffffff" fontSize="8">Generate</text>

                        {/* Preview */}
                        <rect x="205" y="185" width="185" height="75" rx="6" fill={colors.cardBg} stroke={colors.inProgress.bg} strokeWidth="1" />
                        <text x="215" y="205" fill={colors.inProgress.bg} fontSize="10" fontWeight="600">Preview</text>
                        <circle cx="297" cy="235" r="14" fill={colors.inProgress.bg} />
                        <text x="297" y="239" textAnchor="middle" fill="#ffffff" fontSize="11">▶</text>

                        {/* Action Buttons */}
                        <rect x="10" y="275" width="120" height="32" rx="6" fill={colors.completed.bg} />
                        <text x="70" y="296" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="500">Record</text>
                        
                        <rect x="140" y="275" width="120" height="32" rx="6" fill={colors.presentation.bg} />
                        <text x="200" y="296" textAnchor="middle" fill="#ffffff" fontSize="11">Save</text>
                        
                        <rect x="270" y="275" width="120" height="32" rx="6" fill={colors.cardBg} stroke={colors.border} strokeWidth="1" />
                        <text x="330" y="296" textAnchor="middle" fill={colors.text} fontSize="11">Export</text>
                      </g>
                    </g>

                    {/* Arrow between UIs */}
                    <g transform="translate(590, 240)">
                      <rect x="0" y="-15" width="40" height="30" rx="4" fill={colors.presentation.bg} />
                      <text x="20" y="5" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">→</text>
                    </g>

                    {/* Recording Studio UI */}
                    <g transform="translate(620, 20)">
                      <rect width="550" height="430" rx="12" fill={colors.cardBg} stroke={colors.completed.bg} strokeWidth="2" />
                      <rect width="550" height="36" rx="12" fill={colors.completed.bg} />
                      <text x="275" y="24" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="600">RECORDING STUDIO UI</text>

                      {/* Video Preview */}
                      <g transform="translate(10, 46)">
                        <rect width="530" height="190" rx="8" fill={colors.background} stroke={colors.border} strokeWidth="1" />
                        <text x="265" y="22" textAnchor="middle" fill={colors.textMuted} fontSize="10" fontWeight="600">CAMERA PREVIEW</text>
                        <rect x="20" y="35" width="330" height="135" rx="6" fill={colors.cardBg} stroke={colors.border} strokeWidth="1" />
                        <text x="185" y="108" textAnchor="middle" fill={colors.textMuted} fontSize="12">Camera Feed</text>
                        
                        {/* PiP */}
                        <rect x="370" y="35" width="140" height="75" rx="6" fill={colors.cardBg} stroke={colors.border} strokeWidth="1" />
                        <text x="440" y="78" textAnchor="middle" fill={colors.textMuted} fontSize="9">Screen Share</text>
                      </g>

                      {/* Teleprompter */}
                      <g transform="translate(10, 246)">
                        <rect width="350" height="110" rx="8" fill={colors.background} stroke={colors.presentation.bg} strokeWidth="1" />
                        <text x="175" y="22" textAnchor="middle" fill={colors.presentation.bg} fontSize="10" fontWeight="600">TELEPROMPTER</text>
                        {[36, 52, 68, 84].map((y, i) => (
                          <rect key={i} x="20" y={y} width={310 - i * 20} height="10" rx="2" fill={i === 3 ? colors.presentation.light : colors.border} />
                        ))}
                      </g>

                      {/* Controls */}
                      <g transform="translate(370, 246)">
                        <rect width="170" height="110" rx="8" fill={colors.background} stroke={colors.domain.bg} strokeWidth="1" />
                        <text x="85" y="22" textAnchor="middle" fill={colors.domain.bg} fontSize="10" fontWeight="600">CONTROLS</text>
                        
                        <circle cx="85" cy="60" r="25" fill={colors.domain.bg} />
                        <text x="85" y="65" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="600">REC</text>
                        
                        <rect x="10" y="90" width="70" height="14" rx="3" fill={colors.cardBg} stroke={colors.border} strokeWidth="1" />
                        <text x="45" y="100" textAnchor="middle" fill={colors.text} fontSize="8">Pause</text>
                        <rect x="90" y="90" width="70" height="14" rx="3" fill={colors.cardBg} stroke={colors.border} strokeWidth="1" />
                        <text x="125" y="100" textAnchor="middle" fill={colors.text} fontSize="8">Stop</text>
                      </g>

                      {/* Audio Meters */}
                      <g transform="translate(10, 366)">
                        <rect width="530" height="50" rx="8" fill={colors.background} stroke={colors.border} strokeWidth="1" />
                        <text x="20" y="18" fill={colors.textMuted} fontSize="9" fontWeight="600">AUDIO LEVELS</text>
                        {[0, 1, 2].map((i) => (
                          <g key={i}>
                            <text x={40 + i * 180} y="38" fill={colors.text} fontSize="8">Track {i + 1}</text>
                            <rect x={80 + i * 180} y="28" width="100" height="12" rx="2" fill={colors.border} />
                            <rect x={80 + i * 180} y="28" width={60 + i * 15} height="12" rx="2" fill={colors.completed.bg} />
                          </g>
                        ))}
                      </g>
                    </g>
                  </svg>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="feature-matrix" className="space-y-4 mt-0">
              <Card className="border" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                <CardHeader>
                  <CardTitle style={{ color: colors.application.bg }}>Feature Implementation Matrix</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse" style={{ minWidth: '800px' }}>
                      <thead>
                        <tr>
                          <th className="p-3 text-left text-sm font-semibold border" style={{ borderColor: colors.border, backgroundColor: colors.cardBg, color: colors.text }}>Category</th>
                          <th className="p-3 text-center text-sm font-semibold border" style={{ borderColor: colors.border, backgroundColor: colors.completed.light, color: colors.completed.bg }}>P0 Core</th>
                          <th className="p-3 text-center text-sm font-semibold border" style={{ borderColor: colors.border, backgroundColor: colors.presentation.light, color: colors.presentation.bg }}>P1 Enhanced</th>
                          <th className="p-3 text-center text-sm font-semibold border" style={{ borderColor: colors.border, backgroundColor: colors.inProgress.light, color: colors.inProgress.bg }}>P2 Advanced</th>
                          <th className="p-3 text-center text-sm font-semibold border" style={{ borderColor: colors.border, backgroundColor: colors.planned.light, color: colors.planned.bg }}>P3/P4 Future</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { category: 'Script Creation', p0: '✓ Manual + AI', p1: '✓ Templates', p2: '○ Collab Edit', p3: '○ Multi-lang' },
                          { category: 'TTS Generation', p0: '✓ ElevenLabs', p1: '✓ Voice Select', p2: '○ Batch Gen', p3: '○ Voice Clone' },
                          { category: 'Recording', p0: '✓ Camera', p1: '◐ Screen PiP', p2: '○ Multi-take', p3: '○ Mobile App' },
                          { category: 'Audio', p0: '✓ Basic Mix', p1: '✓ Multi-track', p2: '○ Ducking', p3: '○ Noise Reduce' },
                          { category: 'Export', p0: '◐ WebM', p1: '◐ MP4', p2: '○ Batch', p3: '○ Direct Upload' },
                          { category: 'Collaboration', p0: '✓ Save/Load', p1: '○ Share', p2: '○ Review Flow', p3: '○ Team Roles' },
                        ].map((row, i) => (
                          <tr key={i}>
                            <td className="p-3 border font-medium" style={{ borderColor: colors.border, backgroundColor: colors.cardBg, color: colors.text }}>{row.category}</td>
                            <td className="p-3 border text-center text-sm" style={{ borderColor: colors.border, color: row.p0.startsWith('✓') ? colors.completed.bg : row.p0.startsWith('◐') ? colors.inProgress.bg : colors.textMuted }}>{row.p0}</td>
                            <td className="p-3 border text-center text-sm" style={{ borderColor: colors.border, color: row.p1.startsWith('✓') ? colors.completed.bg : row.p1.startsWith('◐') ? colors.inProgress.bg : colors.textMuted }}>{row.p1}</td>
                            <td className="p-3 border text-center text-sm" style={{ borderColor: colors.border, color: row.p2.startsWith('✓') ? colors.completed.bg : row.p2.startsWith('◐') ? colors.inProgress.bg : colors.textMuted }}>{row.p2}</td>
                            <td className="p-3 border text-center text-sm" style={{ borderColor: colors.border, color: colors.textMuted }}>{row.p3}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-4 flex gap-6">
                    <div className="flex items-center gap-2">
                      <span style={{ color: colors.completed.bg }}>✓</span>
                      <span className="text-sm" style={{ color: colors.textMuted }}>Implemented</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ color: colors.inProgress.bg }}>◐</span>
                      <span className="text-sm" style={{ color: colors.textMuted }}>Partial</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ color: colors.textMuted }}>○</span>
                      <span className="text-sm" style={{ color: colors.textMuted }}>Planned</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="personas" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { 
                    name: 'Content Creator', 
                    role: 'YouTube / Social Media', 
                    needs: ['Quick content generation', 'AI assistance', 'Easy export'],
                    pain: 'Time-consuming video production',
                    color: colors.presentation.bg,
                    lightColor: colors.presentation.light
                  },
                  { 
                    name: 'Training Producer', 
                    role: 'Corporate L&D', 
                    needs: ['Professional quality', 'Consistency', 'Review workflows'],
                    pain: 'Maintaining quality at scale',
                    color: colors.completed.bg,
                    lightColor: colors.completed.light
                  },
                  { 
                    name: 'Marketing Manager', 
                    role: 'Brand Marketing', 
                    needs: ['Brand consistency', 'Templates', 'Analytics'],
                    pain: 'Coordinating team output',
                    color: colors.inProgress.bg,
                    lightColor: colors.inProgress.light
                  },
                  { 
                    name: 'Healthcare Educator', 
                    role: 'Patient Education', 
                    needs: ['Compliance', 'Accessibility', 'Multi-language'],
                    pain: 'Regulatory requirements',
                    color: colors.domain.bg,
                    lightColor: colors.domain.light
                  },
                ].map((persona, i) => (
                  <Card key={i} className="border-2" style={{ borderColor: persona.color, backgroundColor: persona.lightColor }}>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: persona.color }}>
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold" style={{ color: persona.color }}>{persona.name}</h4>
                          <p className="text-xs" style={{ color: colors.textMuted }}>{persona.role}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-medium" style={{ color: colors.textMuted }}>Key Needs:</p>
                          <ul className="text-sm" style={{ color: colors.text }}>
                            {persona.needs.map((need, j) => (
                              <li key={j}>• {need}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-medium" style={{ color: colors.textMuted }}>Pain Point:</p>
                          <p className="text-sm" style={{ color: colors.text }}>{persona.pain}</p>
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
