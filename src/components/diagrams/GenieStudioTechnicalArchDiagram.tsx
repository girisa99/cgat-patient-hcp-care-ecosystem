import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ExternalLink, 
  FileText, 
  Server, 
  Database, 
  Cpu, 
  Workflow, 
  Download,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

// Color legend for consistent enterprise styling
const colorLegend = {
  background: '#1e293b',
  cardBg: '#0f172a',
  headerBg: '#1e3a5f',
  borderDefault: '#475569',
  borderAccent: '#3b82f6',
  textPrimary: '#f1f5f9',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  accentBlue: '#3b82f6',
  accentPurple: '#7c3aed',
  accentGreen: '#22c55e',
  accentAmber: '#f59e0b',
};

export const GenieStudioTechnicalArchDiagram = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const diagramRef = useRef<HTMLDivElement>(null);

  const openDocs = () => {
    window.open('/docs/GENIE_STUDIO_TECHNICAL_ARCHITECTURE.md', '_blank');
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
      link.download = `genie-studio-technical-architecture-${activeTab}.png`;
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
              <Server className="h-8 w-8 text-[#94a3b8]" />
              <div>
                <CardTitle className="text-2xl text-[#f1f5f9]">Technical Architecture</CardTitle>
                <p className="text-[#94a3b8] text-sm">Genie Studio & Recording Studio - System Design</p>
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
        <TabsList className="grid grid-cols-5 w-full bg-[#0f172a] border border-[#475569]">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#334155] text-[#cbd5e1] data-[state=active]:text-[#f1f5f9]">System Overview</TabsTrigger>
          <TabsTrigger value="script-pipeline" className="data-[state=active]:bg-[#334155] text-[#cbd5e1] data-[state=active]:text-[#f1f5f9]">Script Pipeline</TabsTrigger>
          <TabsTrigger value="recording-pipeline" className="data-[state=active]:bg-[#334155] text-[#cbd5e1] data-[state=active]:text-[#f1f5f9]">Recording Pipeline</TabsTrigger>
          <TabsTrigger value="data-model" className="data-[state=active]:bg-[#334155] text-[#cbd5e1] data-[state=active]:text-[#f1f5f9]">Data Model</TabsTrigger>
          <TabsTrigger value="integration" className="data-[state=active]:bg-[#334155] text-[#cbd5e1] data-[state=active]:text-[#f1f5f9]">Integration Points</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[600px] mt-4">
          <div ref={diagramRef}>
            <TabsContent value="overview" className="space-y-4">
              {/* System Overview SVG Diagram */}
              <Card className="bg-[#1e293b] border-[#475569]">
                <CardContent className="pt-6">
                  <svg viewBox="0 0 1200 600" className="w-full h-auto">
                    <defs>
                      <marker id="arrowTech" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                      </marker>
                      <filter id="techShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
                      </filter>
                    </defs>

                    {/* Background */}
                    <rect width="1200" height="600" fill="#1e293b" rx="12" />

                    {/* Title */}
                    <text x="600" y="40" textAnchor="middle" fill="#f1f5f9" fontSize="22" fontWeight="600">
                      Genie Studio Technical Architecture - P0/P1/P2
                    </text>

                    {/* Frontend Layer */}
                    <g transform="translate(50, 80)">
                      <rect width="1100" height="100" rx="12" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" filter="url(#techShadow)" />
                      <rect width="1100" height="32" rx="12" fill="#1e3a5f" />
                      <text x="20" y="22" fill="#93c5fd" fontSize="13" fontWeight="600">FRONTEND LAYER (React + Vite + TypeScript)</text>
                      
                      {['GenieStudio.tsx', 'RecordingStudio.tsx', 'Teleprompter.tsx', 'AudioMixer.tsx', 'ScriptEditor.tsx', 'ProjectManager.tsx'].map((name, i) => (
                        <g key={name}>
                          <rect x={20 + i * 180} y="45" width="160" height="40" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                          <text x={100 + i * 180} y="70" textAnchor="middle" fill="#cbd5e1" fontSize="10">{name}</text>
                        </g>
                      ))}
                    </g>

                    {/* Services Layer */}
                    <g transform="translate(50, 200)">
                      <rect width="1100" height="100" rx="12" fill="#0f172a" stroke="#7c3aed" strokeWidth="2" filter="url(#techShadow)" />
                      <rect width="1100" height="32" rx="12" fill="#312e81" />
                      <text x="20" y="22" fill="#c4b5fd" fontSize="13" fontWeight="600">SERVICES LAYER (Hooks & Services)</text>
                      
                      {['useUniversalAI', 'genieConversationService', 'useRecordingStudio', 'useTTSGeneration', 'useMediaRecorder'].map((name, i) => (
                        <g key={name}>
                          <rect x={20 + i * 220} y="45" width="200" height="40" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                          <text x={120 + i * 220} y="70" textAnchor="middle" fill="#cbd5e1" fontSize="10">{name}</text>
                        </g>
                      ))}
                    </g>

                    {/* Edge Functions Layer */}
                    <g transform="translate(50, 320)">
                      <rect width="1100" height="100" rx="12" fill="#0f172a" stroke="#22c55e" strokeWidth="2" filter="url(#techShadow)" />
                      <rect width="1100" height="32" rx="12" fill="#14532d" />
                      <text x="20" y="22" fill="#86efac" fontSize="13" fontWeight="600">EDGE FUNCTIONS (Supabase)</text>
                      
                      {['ai-universal-processor', 'tts-generate', 'script-enhance', 'media-processor', 'knowledge-search'].map((name, i) => (
                        <g key={name}>
                          <rect x={20 + i * 220} y="45" width="200" height="40" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                          <text x={120 + i * 220} y="70" textAnchor="middle" fill="#cbd5e1" fontSize="9">{name}</text>
                        </g>
                      ))}
                    </g>

                    {/* Database Layer */}
                    <g transform="translate(50, 440)">
                      <rect width="1100" height="100" rx="12" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" filter="url(#techShadow)" />
                      <rect width="1100" height="32" rx="12" fill="#78350f" />
                      <text x="20" y="22" fill="#fcd34d" fontSize="13" fontWeight="600">DATABASE LAYER (Supabase PostgreSQL)</text>
                      
                      {['genie_projects', 'genie_scripts', 'genie_recordings', 'genie_tts_audio', 'universal_knowledge_base', 'agent_conversations'].map((name, i) => (
                        <g key={name}>
                          <rect x={20 + i * 180} y="45" width="160" height="40" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                          <text x={100 + i * 180} y="70" textAnchor="middle" fill="#cbd5e1" fontSize="9">{name}</text>
                        </g>
                      ))}
                    </g>

                    {/* Connecting Arrows */}
                    <line x1="600" y1="180" x2="600" y2="200" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowTech)" />
                    <line x1="600" y1="300" x2="600" y2="320" stroke="#7c3aed" strokeWidth="2" markerEnd="url(#arrowTech)" />
                    <line x1="600" y1="420" x2="600" y2="440" stroke="#22c55e" strokeWidth="2" markerEnd="url(#arrowTech)" />

                    {/* Legend */}
                    <g transform="translate(50, 560)">
                      <text x="0" y="10" fill="#94a3b8" fontSize="10">Color Legend:</text>
                      <rect x="80" y="0" width="16" height="12" fill="#3b82f6" rx="2" />
                      <text x="102" y="10" fill="#cbd5e1" fontSize="10">Frontend</text>
                      <rect x="170" y="0" width="16" height="12" fill="#7c3aed" rx="2" />
                      <text x="192" y="10" fill="#cbd5e1" fontSize="10">Services</text>
                      <rect x="260" y="0" width="16" height="12" fill="#22c55e" rx="2" />
                      <text x="282" y="10" fill="#cbd5e1" fontSize="10">Edge Functions</text>
                      <rect x="380" y="0" width="16" height="12" fill="#f59e0b" rx="2" />
                      <text x="402" y="10" fill="#cbd5e1" fontSize="10">Database</text>
                    </g>
                  </svg>
                </CardContent>
              </Card>

              {/* Implementation Status Grid */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-[#1e293b] border-[#22c55e]">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="h-5 w-5 text-[#22c55e]" />
                      <span className="text-[#86efac] font-semibold">P0 Core - 90% Done</span>
                    </div>
                    <ul className="text-sm text-[#cbd5e1] space-y-1">
                      <li className="text-[#86efac]">✓ Script creation & editing</li>
                      <li className="text-[#86efac]">✓ TTS generation (ElevenLabs)</li>
                      <li className="text-[#86efac]">✓ Basic recording</li>
                      <li className="text-[#86efac]">✓ Teleprompter sync</li>
                      <li className="text-[#94a3b8]">○ Export pipeline</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-[#1e293b] border-[#3b82f6]">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-5 w-5 text-[#3b82f6]" />
                      <span className="text-[#93c5fd] font-semibold">P1 Enhanced - 60% Done</span>
                    </div>
                    <ul className="text-sm text-[#cbd5e1] space-y-1">
                      <li className="text-[#86efac]">✓ Multi-track audio</li>
                      <li className="text-[#86efac]">✓ AI script enhancement</li>
                      <li className="text-[#94a3b8]">○ Screen recording</li>
                      <li className="text-[#94a3b8]">○ Audio ducking</li>
                      <li className="text-[#94a3b8]">○ Template library</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-[#1e293b] border-[#f59e0b]">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="h-5 w-5 text-[#f59e0b]" />
                      <span className="text-[#fcd34d] font-semibold">P2 Advanced - 30% Done</span>
                    </div>
                    <ul className="text-sm text-[#94a3b8] space-y-1">
                      <li>○ Collaborative editing</li>
                      <li>○ Version control</li>
                      <li>○ Analytics dashboard</li>
                      <li>○ Batch processing</li>
                      <li>○ API integrations</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="script-pipeline" className="space-y-4">
              <Card className="bg-[#1e293b] border-[#475569]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#c4b5fd]">
                    <Workflow className="h-5 w-5" />
                    Script Generation Pipeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <svg viewBox="0 0 1000 400" className="w-full h-auto">
                    <rect width="1000" height="400" fill="#1e293b" rx="8" />
                    
                    {/* Pipeline Steps */}
                    <g transform="translate(50, 50)">
                      {[
                        { num: 1, title: 'INPUT', desc: ['User provides topic', 'or document'], color: '#7c3aed' },
                        { num: 2, title: 'AI PROCESS', desc: ['useUniversalAI', 'generates script'], color: '#3b82f6' },
                        { num: 3, title: 'ENHANCE', desc: ['Script optimization', '& timing calc'], color: '#22c55e' },
                        { num: 4, title: 'TTS', desc: ['ElevenLabs API', 'voice generation'], color: '#f59e0b' },
                        { num: 5, title: 'OUTPUT', desc: ['Script + Audio', 'ready for recording'], color: '#ef4444' }
                      ].map((step, i) => (
                        <g key={step.num}>
                          <rect x={i * 180} y="0" width="160" height="80" rx="8" fill="#0f172a" stroke={step.color} strokeWidth="2" />
                          <text x={80 + i * 180} y="35" textAnchor="middle" fill="#f1f5f9" fontSize="12" fontWeight="600">{step.num}. {step.title}</text>
                          {step.desc.map((d, j) => (
                            <text key={j} x={80 + i * 180} y={55 + j * 15} textAnchor="middle" fill="#94a3b8" fontSize="10">{d}</text>
                          ))}
                          {i < 4 && (
                            <g>
                              <line x1={160 + i * 180} y1="40" x2={180 + i * 180} y2="40" stroke="#475569" strokeWidth="2" />
                              <polygon points={`${175 + i * 180},35 ${185 + i * 180},40 ${175 + i * 180},45`} fill="#475569" />
                            </g>
                          )}
                        </g>
                      ))}
                    </g>

                    {/* Data Flow Details */}
                    <g transform="translate(50, 160)">
                      <rect width="900" height="180" rx="8" fill="#0f172a" stroke="#475569" strokeWidth="1" />
                      <rect width="900" height="32" rx="8" fill="#1e3a5f" />
                      <text x="20" y="22" fill="#93c5fd" fontSize="12" fontWeight="600">DATA FLOW DETAILS</text>
                      
                      <text x="20" y="60" fill="#94a3b8" fontSize="11">Input Types:</text>
                      <text x="120" y="60" fill="#cbd5e1" fontSize="11">Topic prompt | Document upload | Knowledge base query | Manual text</text>
                      
                      <text x="20" y="90" fill="#94a3b8" fontSize="11">AI Models:</text>
                      <text x="120" y="90" fill="#cbd5e1" fontSize="11">GPT-4 / Claude / Gemini (via useUniversalAI)</text>
                      
                      <text x="20" y="120" fill="#94a3b8" fontSize="11">TTS Voices:</text>
                      <text x="120" y="120" fill="#cbd5e1" fontSize="11">ElevenLabs (30+ voices) | Browser Web Speech API (fallback)</text>
                      
                      <text x="20" y="150" fill="#94a3b8" fontSize="11">Output:</text>
                      <text x="120" y="150" fill="#cbd5e1" fontSize="11">Script JSON | Audio WAV/MP3 | Timing metadata | Project file</text>
                    </g>

                    {/* Tech Stack & Legend */}
                    <g transform="translate(50, 360)">
                      <text x="0" y="0" fill="#94a3b8" fontSize="10">Tech Stack:</text>
                      {['React', 'TypeScript', 'Supabase Edge', 'ElevenLabs API', 'Web Audio API'].map((tech, i) => (
                        <g key={tech}>
                          <rect x={80 + i * 130} y="-12" width="110" height="20" rx="4" fill="#0f172a" stroke="#475569" strokeWidth="1" />
                          <text x={135 + i * 130} y="2" textAnchor="middle" fill="#cbd5e1" fontSize="9">{tech}</text>
                        </g>
                      ))}
                    </g>
                  </svg>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recording-pipeline" className="space-y-4">
              <Card className="bg-[#1e293b] border-[#475569]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#86efac]">
                    <Cpu className="h-5 w-5" />
                    Recording & Export Pipeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <svg viewBox="0 0 1000 450" className="w-full h-auto">
                    <rect width="1000" height="450" fill="#1e293b" rx="8" />
                    
                    {/* Recording Flow */}
                    <g transform="translate(50, 30)">
                      <text x="0" y="0" fill="#93c5fd" fontSize="14" fontWeight="600">RECORDING FLOW</text>
                      
                      {[
                        { title: 'Camera Input', desc: 'MediaDevices API', color: '#3b82f6' },
                        { title: 'Screen Capture', desc: 'getDisplayMedia', color: '#7c3aed' },
                        { title: 'Audio Mixer', desc: 'Web Audio API', color: '#22c55e' },
                        { title: 'MediaRecorder', desc: 'Stream capture', color: '#f59e0b' },
                        { title: 'Output', desc: 'Blob/File', color: '#ef4444' }
                      ].map((item, i) => (
                        <g key={item.title}>
                          <rect x={i * 180} y="20" width="160" height="60" rx="8" fill="#0f172a" stroke={item.color} strokeWidth="2" />
                          <text x={80 + i * 180} y="45" textAnchor="middle" fill="#f1f5f9" fontSize="11" fontWeight="500">{item.title}</text>
                          <text x={80 + i * 180} y="65" textAnchor="middle" fill="#94a3b8" fontSize="9">{item.desc}</text>
                          {i < 4 && (
                            <g>
                              <line x1={160 + i * 180} y1="50" x2={180 + i * 180} y2="50" stroke="#475569" strokeWidth="2" />
                              <polygon points={`${175 + i * 180},45 ${185 + i * 180},50 ${175 + i * 180},55`} fill="#475569" />
                            </g>
                          )}
                        </g>
                      ))}
                    </g>

                    {/* Export Pipeline */}
                    <g transform="translate(50, 130)">
                      <text x="0" y="0" fill="#c4b5fd" fontSize="14" fontWeight="600">EXPORT PIPELINE</text>
                      
                      {[
                        { title: 'Raw Recording', desc: 'WebM/MP4 blob', color: '#7c3aed' },
                        { title: 'Processing', desc: 'FFmpeg WASM', color: '#3b82f6' },
                        { title: 'Encoding', desc: 'Format conversion', color: '#22c55e' },
                        { title: 'Storage', desc: 'Supabase Storage', color: '#f59e0b' },
                        { title: 'Download', desc: 'Signed URL', color: '#ef4444' }
                      ].map((item, i) => (
                        <g key={item.title}>
                          <rect x={i * 180} y="20" width="160" height="60" rx="8" fill="#0f172a" stroke={item.color} strokeWidth="2" />
                          <text x={80 + i * 180} y="45" textAnchor="middle" fill="#f1f5f9" fontSize="11" fontWeight="500">{item.title}</text>
                          <text x={80 + i * 180} y="65" textAnchor="middle" fill="#94a3b8" fontSize="9">{item.desc}</text>
                          {i < 4 && (
                            <g>
                              <line x1={160 + i * 180} y1="50" x2={180 + i * 180} y2="50" stroke="#475569" strokeWidth="2" />
                              <polygon points={`${175 + i * 180},45 ${185 + i * 180},50 ${175 + i * 180},55`} fill="#475569" />
                            </g>
                          )}
                        </g>
                      ))}
                    </g>

                    {/* Teleprompter Sync */}
                    <g transform="translate(50, 230)">
                      <text x="0" y="0" fill="#86efac" fontSize="14" fontWeight="600">TELEPROMPTER SYNC</text>
                      
                      <rect x="0" y="20" width="900" height="80" rx="8" fill="#0f172a" stroke="#22c55e" strokeWidth="1" />
                      
                      {[
                        { label: 'Script Load', x: 50 },
                        { label: 'Calculate WPM', x: 200 },
                        { label: 'Scroll Speed', x: 350 },
                        { label: 'Record Start', x: 500 },
                        { label: 'Sync Playback', x: 650 },
                        { label: 'Pause/Resume', x: 800 }
                      ].map((item, i) => (
                        <g key={item.label}>
                          <circle cx={item.x} cy="60" r="20" fill="#14532d" stroke="#22c55e" strokeWidth="2" />
                          <text x={item.x} y="65" textAnchor="middle" fill="#f1f5f9" fontSize="10">{i + 1}</text>
                          <text x={item.x} y="95" textAnchor="middle" fill="#94a3b8" fontSize="8">{item.label}</text>
                          {i < 5 && (
                            <line x1={item.x + 25} y1="60" x2={item.x + 115} y2="60" stroke="#22c55e" strokeWidth="1" strokeDasharray="4" />
                          )}
                        </g>
                      ))}
                    </g>

                    {/* Audio Features */}
                    <g transform="translate(50, 340)">
                      <text x="0" y="0" fill="#fcd34d" fontSize="14" fontWeight="600">AUDIO FEATURES</text>
                      
                      {[
                        { title: 'Multi-track', status: 'done' },
                        { title: 'Background Music', status: 'done' },
                        { title: 'Audio Ducking', status: 'partial' },
                        { title: 'Voice Enhancement', status: 'planned' },
                        { title: 'Noise Reduction', status: 'planned' }
                      ].map((item, i) => (
                        <g key={item.title}>
                          <rect x={i * 180} y="20" width="160" height="40" rx="6" fill="#0f172a" stroke="#475569" strokeWidth="1" />
                          <text x={80 + i * 180} y="38" textAnchor="middle" fill="#f1f5f9" fontSize="10">{item.title}</text>
                          <text x={80 + i * 180} y="52" textAnchor="middle" fill={item.status === 'done' ? '#86efac' : item.status === 'partial' ? '#fcd34d' : '#94a3b8'} fontSize="8">
                            {item.status === 'done' ? '✓ Done' : item.status === 'partial' ? '◐ Partial' : '○ Planned'}
                          </text>
                        </g>
                      ))}
                    </g>

                    {/* Color Legend */}
                    <g transform="translate(50, 420)">
                      <text x="0" y="0" fill="#94a3b8" fontSize="9">Legend:</text>
                      <rect x="50" y="-10" width="12" height="12" rx="2" fill="#3b82f6" />
                      <text x="68" y="0" fill="#cbd5e1" fontSize="9">Input</text>
                      <rect x="110" y="-10" width="12" height="12" rx="2" fill="#7c3aed" />
                      <text x="128" y="0" fill="#cbd5e1" fontSize="9">Process</text>
                      <rect x="180" y="-10" width="12" height="12" rx="2" fill="#22c55e" />
                      <text x="198" y="0" fill="#cbd5e1" fontSize="9">Sync</text>
                      <rect x="240" y="-10" width="12" height="12" rx="2" fill="#f59e0b" />
                      <text x="258" y="0" fill="#cbd5e1" fontSize="9">Storage</text>
                      <rect x="310" y="-10" width="12" height="12" rx="2" fill="#ef4444" />
                      <text x="328" y="0" fill="#cbd5e1" fontSize="9">Output</text>
                    </g>
                  </svg>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data-model" className="space-y-4">
              <Card className="bg-[#1e293b] border-[#475569]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#fcd34d]">
                    <Database className="h-5 w-5" />
                    Database Schema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <svg viewBox="0 0 1000 500" className="w-full h-auto">
                    <rect width="1000" height="500" fill="#1e293b" rx="8" />

                    {/* Tables */}
                    {[
                      {
                        name: 'genie_projects',
                        x: 50, y: 30,
                        fields: ['id (uuid)', 'user_id (uuid)', 'name (text)', 'description (text)', 'status (text)', 'created_at', 'updated_at'],
                        color: '#3b82f6'
                      },
                      {
                        name: 'genie_scripts',
                        x: 350, y: 30,
                        fields: ['id (uuid)', 'project_id (uuid)', 'title (text)', 'content (text)', 'version (int)', 'word_count (int)', 'estimated_duration'],
                        color: '#7c3aed'
                      },
                      {
                        name: 'genie_recordings',
                        x: 650, y: 30,
                        fields: ['id (uuid)', 'project_id (uuid)', 'script_id (uuid)', 'file_url (text)', 'duration_ms (int)', 'status (text)', 'metadata (jsonb)'],
                        color: '#22c55e'
                      },
                      {
                        name: 'genie_tts_audio',
                        x: 50, y: 270,
                        fields: ['id (uuid)', 'script_id (uuid)', 'voice_id (text)', 'audio_url (text)', 'duration_ms (int)', 'provider (text)'],
                        color: '#f59e0b'
                      },
                      {
                        name: 'universal_knowledge_base',
                        x: 350, y: 270,
                        fields: ['id (uuid)', 'user_id (uuid)', 'content (text)', 'metadata (jsonb)', 'embedding (vector)', 'source_type (text)'],
                        color: '#ef4444'
                      },
                      {
                        name: 'agent_conversations',
                        x: 650, y: 270,
                        fields: ['id (uuid)', 'agent_id (uuid)', 'user_id (uuid)', 'session_id (text)', 'conversation_data (jsonb)', 'status (text)'],
                        color: '#06b6d4'
                      }
                    ].map((table) => (
                      <g key={table.name}>
                        <rect x={table.x} y={table.y} width="280" height={30 + table.fields.length * 18} rx="8" fill="#0f172a" stroke={table.color} strokeWidth="2" />
                        <rect x={table.x} y={table.y} width="280" height="28" rx="8" fill={table.color} fillOpacity="0.3" />
                        <text x={table.x + 140} y={table.y + 19} textAnchor="middle" fill="#f1f5f9" fontSize="11" fontWeight="600">{table.name}</text>
                        {table.fields.map((field, i) => (
                          <text key={field} x={table.x + 15} y={table.y + 48 + i * 18} fill="#94a3b8" fontSize="9">{field}</text>
                        ))}
                      </g>
                    ))}

                    {/* Relationships */}
                    <g stroke="#475569" strokeWidth="1" strokeDasharray="4" fill="none">
                      <path d="M330,100 L350,100" />
                      <path d="M630,100 L650,100" />
                      <path d="M190,200 L190,270" />
                      <path d="M490,200 L490,270" />
                    </g>

                    {/* Legend */}
                    <g transform="translate(50, 470)">
                      <text x="0" y="0" fill="#94a3b8" fontSize="9">Table Colors:</text>
                      {[
                        { color: '#3b82f6', label: 'Projects' },
                        { color: '#7c3aed', label: 'Scripts' },
                        { color: '#22c55e', label: 'Recordings' },
                        { color: '#f59e0b', label: 'TTS' },
                        { color: '#ef4444', label: 'Knowledge' },
                        { color: '#06b6d4', label: 'Conversations' }
                      ].map((item, i) => (
                        <g key={item.label}>
                          <rect x={80 + i * 120} y="-10" width="12" height="12" rx="2" fill={item.color} />
                          <text x={98 + i * 120} y="0" fill="#cbd5e1" fontSize="9">{item.label}</text>
                        </g>
                      ))}
                    </g>
                  </svg>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integration" className="space-y-4">
              <Card className="bg-[#1e293b] border-[#475569]">
                <CardHeader>
                  <CardTitle className="text-[#93c5fd]">External Service Integrations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        name: 'ElevenLabs',
                        type: 'TTS Provider',
                        status: 'Active',
                        features: ['30+ voice options', 'Multi-language support', 'Voice cloning (planned)', 'Streaming audio'],
                        color: '#22c55e'
                      },
                      {
                        name: 'OpenAI / Anthropic / Google',
                        type: 'AI Models',
                        status: 'Active',
                        features: ['Script generation', 'Content enhancement', 'RAG queries', 'Multi-model routing'],
                        color: '#3b82f6'
                      },
                      {
                        name: 'Supabase Storage',
                        type: 'File Storage',
                        status: 'Active',
                        features: ['Recording storage', 'Audio file hosting', 'Signed URLs', 'CDN delivery'],
                        color: '#7c3aed'
                      },
                      {
                        name: 'FFmpeg WASM',
                        type: 'Media Processing',
                        status: 'Partial',
                        features: ['Format conversion', 'Audio mixing', 'Video encoding', 'Client-side processing'],
                        color: '#f59e0b'
                      }
                    ].map((service, i) => (
                      <Card key={i} className="bg-[#0f172a] border-[#475569]">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="text-[#f1f5f9] font-medium">{service.name}</h4>
                              <p className="text-[#94a3b8] text-sm">{service.type}</p>
                            </div>
                            <Badge variant="outline" style={{ borderColor: service.color, color: service.color }}>
                              {service.status}
                            </Badge>
                          </div>
                          <ul className="text-sm text-[#cbd5e1] space-y-1">
                            {service.features.map((f, j) => (
                              <li key={j}>• {f}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default GenieStudioTechnicalArchDiagram;
