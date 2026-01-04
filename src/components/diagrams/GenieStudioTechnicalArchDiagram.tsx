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
        backgroundColor: '#0f172a',
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
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Server className="h-8 w-8 text-slate-400" />
              <div>
                <CardTitle className="text-2xl text-slate-100">Technical Architecture</CardTitle>
                <p className="text-slate-400 text-sm">Genie Studio & Recording Studio - System Design</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-800">
                <Download className="h-4 w-4" />
                Download PNG
              </Button>
              <Button variant="outline" size="sm" onClick={openDocs} className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-800">
                <FileText className="h-4 w-4" />
                Documentation
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700">System Overview</TabsTrigger>
          <TabsTrigger value="script-pipeline" className="data-[state=active]:bg-slate-700">Script Pipeline</TabsTrigger>
          <TabsTrigger value="recording-pipeline" className="data-[state=active]:bg-slate-700">Recording Pipeline</TabsTrigger>
          <TabsTrigger value="data-model" className="data-[state=active]:bg-slate-700">Data Model</TabsTrigger>
          <TabsTrigger value="integration" className="data-[state=active]:bg-slate-700">Integration Points</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[600px] mt-4">
          <div ref={diagramRef}>
            <TabsContent value="overview" className="space-y-4">
              {/* System Overview SVG Diagram */}
              <Card className="bg-slate-900 border-slate-700">
                <CardContent className="pt-6">
                  <svg viewBox="0 0 1200 600" className="w-full h-auto">
                    <defs>
                      <marker id="arrowTechEnt" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                      </marker>
                    </defs>

                    {/* Background */}
                    <rect width="1200" height="600" fill="#0f172a" rx="12" />

                    {/* Title */}
                    <text x="600" y="40" textAnchor="middle" fill="#e2e8f0" fontSize="22" fontWeight="600">
                      Genie Studio Technical Architecture - P0/P1/P2
                    </text>

                    {/* Frontend Layer */}
                    <g transform="translate(50, 80)">
                      <rect width="1100" height="100" rx="12" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                      <text x="20" y="30" fill="#94a3b8" fontSize="13" fontWeight="600">FRONTEND LAYER (React + Vite + TypeScript)</text>
                      
                      {['GenieStudio.tsx', 'RecordingStudio.tsx', 'Teleprompter.tsx', 'AudioMixer.tsx', 'ScriptEditor.tsx', 'ProjectManager.tsx'].map((name, i) => (
                        <g key={name}>
                          <rect x={20 + i * 180} y="45" width="160" height="40" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                          <text x={100 + i * 180} y="70" textAnchor="middle" fill="#e2e8f0" fontSize="10">{name}</text>
                        </g>
                      ))}
                    </g>

                    {/* Services Layer */}
                    <g transform="translate(50, 200)">
                      <rect width="1100" height="100" rx="12" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                      <text x="20" y="30" fill="#94a3b8" fontSize="13" fontWeight="600">SERVICES LAYER (Hooks & Services)</text>
                      
                      {['useUniversalAI', 'genieConversationService', 'useRecordingStudio', 'useTTSGeneration', 'useMediaRecorder'].map((name, i) => (
                        <g key={name}>
                          <rect x={20 + i * 220} y="45" width="200" height="40" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                          <text x={120 + i * 220} y="70" textAnchor="middle" fill="#e2e8f0" fontSize="10">{name}</text>
                        </g>
                      ))}
                    </g>

                    {/* Edge Functions Layer */}
                    <g transform="translate(50, 320)">
                      <rect width="1100" height="100" rx="12" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                      <text x="20" y="30" fill="#94a3b8" fontSize="13" fontWeight="600">EDGE FUNCTIONS (Supabase)</text>
                      
                      {['ai-universal-processor', 'tts-generate', 'script-enhance', 'media-processor', 'knowledge-search'].map((name, i) => (
                        <g key={name}>
                          <rect x={20 + i * 220} y="45" width="200" height="40" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                          <text x={120 + i * 220} y="70" textAnchor="middle" fill="#e2e8f0" fontSize="9">{name}</text>
                        </g>
                      ))}
                    </g>

                    {/* Database Layer */}
                    <g transform="translate(50, 440)">
                      <rect width="1100" height="100" rx="12" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                      <text x="20" y="30" fill="#94a3b8" fontSize="13" fontWeight="600">DATABASE LAYER (Supabase PostgreSQL)</text>
                      
                      {['genie_projects', 'genie_scripts', 'genie_recordings', 'genie_tts_audio', 'universal_knowledge_base', 'agent_conversations'].map((name, i) => (
                        <g key={name}>
                          <rect x={20 + i * 180} y="45" width="160" height="40" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                          <text x={100 + i * 180} y="70" textAnchor="middle" fill="#e2e8f0" fontSize="9">{name}</text>
                        </g>
                      ))}
                    </g>

                    {/* Connecting Arrows */}
                    <line x1="600" y1="180" x2="600" y2="200" stroke="#475569" strokeWidth="2" markerEnd="url(#arrowTechEnt)" />
                    <line x1="600" y1="300" x2="600" y2="320" stroke="#475569" strokeWidth="2" markerEnd="url(#arrowTechEnt)" />
                    <line x1="600" y1="420" x2="600" y2="440" stroke="#475569" strokeWidth="2" markerEnd="url(#arrowTechEnt)" />

                    {/* Legend */}
                    <g transform="translate(50, 560)">
                      {[
                        { label: 'React Components', x: 0 },
                        { label: 'Hooks/Services', x: 180 },
                        { label: 'Edge Functions', x: 340 },
                        { label: 'Database Tables', x: 500 }
                      ].map((item, i) => (
                        <g key={item.label}>
                          <rect x={item.x} y="0" width="16" height="12" fill="#334155" rx="2" />
                          <text x={item.x + 24} y="10" fill="#64748b" fontSize="10">{item.label}</text>
                        </g>
                      ))}
                    </g>
                  </svg>
                </CardContent>
              </Card>

              {/* Implementation Status Grid */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-slate-900 border-slate-700">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="h-5 w-5 text-slate-400" />
                      <span className="text-slate-300 font-semibold">P0 Core - 90% Done</span>
                    </div>
                    <ul className="text-sm text-slate-400 space-y-1">
                      <li>✓ Script creation & editing</li>
                      <li>✓ TTS generation (ElevenLabs)</li>
                      <li>✓ Basic recording</li>
                      <li>✓ Teleprompter sync</li>
                      <li className="text-slate-600">○ Export pipeline</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-700">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-5 w-5 text-slate-400" />
                      <span className="text-slate-300 font-semibold">P1 Enhanced - 60% Done</span>
                    </div>
                    <ul className="text-sm text-slate-400 space-y-1">
                      <li>✓ Multi-track audio</li>
                      <li>✓ AI script enhancement</li>
                      <li className="text-slate-600">○ Screen recording</li>
                      <li className="text-slate-600">○ Audio ducking</li>
                      <li className="text-slate-600">○ Template library</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-700">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="h-5 w-5 text-slate-500" />
                      <span className="text-slate-300 font-semibold">P2 Advanced - 30% Done</span>
                    </div>
                    <ul className="text-sm text-slate-500 space-y-1">
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
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-300">
                    <Workflow className="h-5 w-5" />
                    Script Generation Pipeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <svg viewBox="0 0 1000 400" className="w-full h-auto">
                    <rect width="1000" height="400" fill="#0f172a" rx="8" />
                    
                    {/* Pipeline Steps */}
                    <g transform="translate(50, 50)">
                      {[
                        { num: 1, title: 'INPUT', desc: ['User provides topic', 'or document'], x: 0 },
                        { num: 2, title: 'AI PROCESS', desc: ['useUniversalAI', 'generates script'], x: 200 },
                        { num: 3, title: 'ENHANCE', desc: ['Script optimization', '& timing calc'], x: 400 },
                        { num: 4, title: 'TTS', desc: ['ElevenLabs API', 'voice generation'], x: 600 },
                        { num: 5, title: 'OUTPUT', desc: ['Script + Audio', 'ready for recording'], x: 800 }
                      ].map((step, i) => (
                        <g key={step.num}>
                          <rect x={step.x} y="0" width="140" height="80" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                          <text x={step.x + 70} y="35" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="600">{step.num}. {step.title}</text>
                          {step.desc.map((d, j) => (
                            <text key={j} x={step.x + 70} y={55 + j * 15} textAnchor="middle" fill="#64748b" fontSize="10">{d}</text>
                          ))}
                          {i < 4 && (
                            <line x1={step.x + 150} y1="40" x2={step.x + 190} y2="40" stroke="#475569" strokeWidth="2" markerEnd="url(#arrowTechEnt)" />
                          )}
                        </g>
                      ))}
                    </g>

                    {/* Data Flow Details */}
                    <g transform="translate(50, 160)">
                      <rect width="900" height="180" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                      <text x="20" y="30" fill="#94a3b8" fontSize="12" fontWeight="600">DATA FLOW DETAILS</text>
                      
                      <text x="20" y="60" fill="#64748b" fontSize="11">Input Types:</text>
                      <text x="120" y="60" fill="#94a3b8" fontSize="11">Topic prompt | Document upload | Knowledge base query | Manual text</text>
                      
                      <text x="20" y="90" fill="#64748b" fontSize="11">AI Models:</text>
                      <text x="120" y="90" fill="#94a3b8" fontSize="11">GPT-4 / Claude / Gemini (via useUniversalAI)</text>
                      
                      <text x="20" y="120" fill="#64748b" fontSize="11">TTS Voices:</text>
                      <text x="120" y="120" fill="#94a3b8" fontSize="11">ElevenLabs (30+ voices) | Browser Web Speech API (fallback)</text>
                      
                      <text x="20" y="150" fill="#64748b" fontSize="11">Output:</text>
                      <text x="120" y="150" fill="#94a3b8" fontSize="11">Script JSON | Audio WAV/MP3 | Timing metadata | Project file</text>
                    </g>

                    {/* Tech Stack */}
                    <g transform="translate(50, 360)">
                      <text x="0" y="0" fill="#64748b" fontSize="10">Tech Stack:</text>
                      {['React', 'TypeScript', 'Supabase Edge', 'ElevenLabs API', 'Web Audio API'].map((tech, i) => (
                        <g key={tech}>
                          <rect x={80 + i * 130} y="-12" width="110" height="20" rx="4" fill="#334155" />
                          <text x={135 + i * 130} y="2" textAnchor="middle" fill="#94a3b8" fontSize="9">{tech}</text>
                        </g>
                      ))}
                    </g>
                  </svg>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recording-pipeline" className="space-y-4">
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-300">
                    <Cpu className="h-5 w-5" />
                    Recording & Export Pipeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <svg viewBox="0 0 1000 450" className="w-full h-auto">
                    <rect width="1000" height="450" fill="#0f172a" rx="8" />
                    
                    {/* Recording Flow */}
                    <g transform="translate(50, 30)">
                      <text x="0" y="0" fill="#94a3b8" fontSize="14" fontWeight="600">RECORDING FLOW</text>
                      
                      {[
                        { title: 'Camera Input', desc: 'MediaDevices API', x: 0 },
                        { title: 'Screen Capture', desc: 'getDisplayMedia', x: 200 },
                        { title: 'Audio Mixer', desc: 'Web Audio API', x: 400 },
                        { title: 'MediaRecorder', desc: 'Stream capture', x: 600 },
                        { title: 'Output', desc: 'Blob/File', x: 800 }
                      ].map((item, i) => (
                        <g key={item.title}>
                          <rect x={item.x} y="20" width="160" height="60" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                          <text x={item.x + 80} y="45" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="500">{item.title}</text>
                          <text x={item.x + 80} y="65" textAnchor="middle" fill="#64748b" fontSize="9">{item.desc}</text>
                          {i < 4 && (
                            <line x1={item.x + 165} y1="50" x2={item.x + 195} y2="50" stroke="#475569" strokeWidth="2" markerEnd="url(#arrowTechEnt)" />
                          )}
                        </g>
                      ))}
                    </g>

                    {/* Export Pipeline */}
                    <g transform="translate(50, 140)">
                      <text x="0" y="0" fill="#94a3b8" fontSize="14" fontWeight="600">EXPORT PIPELINE</text>
                      
                      {[
                        { title: 'Raw Recording', desc: 'WebM/MP4 blob', x: 0 },
                        { title: 'Processing', desc: 'FFmpeg WASM', x: 200 },
                        { title: 'Encoding', desc: 'Format conversion', x: 400 },
                        { title: 'Storage', desc: 'Supabase Storage', x: 600 },
                        { title: 'Download', desc: 'Signed URL', x: 800 }
                      ].map((item, i) => (
                        <g key={item.title}>
                          <rect x={item.x} y="20" width="160" height="60" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                          <text x={item.x + 80} y="45" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="500">{item.title}</text>
                          <text x={item.x + 80} y="65" textAnchor="middle" fill="#64748b" fontSize="9">{item.desc}</text>
                          {i < 4 && (
                            <line x1={item.x + 165} y1="50" x2={item.x + 195} y2="50" stroke="#475569" strokeWidth="2" markerEnd="url(#arrowTechEnt)" />
                          )}
                        </g>
                      ))}
                    </g>

                    {/* Teleprompter Sync */}
                    <g transform="translate(50, 250)">
                      <text x="0" y="0" fill="#94a3b8" fontSize="14" fontWeight="600">TELEPROMPTER SYNC</text>
                      
                      <rect x="0" y="20" width="900" height="80" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                      
                      {[
                        { label: 'Script Load', x: 50 },
                        { label: 'Calculate WPM', x: 200 },
                        { label: 'Scroll Speed', x: 350 },
                        { label: 'Record Start', x: 500 },
                        { label: 'Sync Playback', x: 650 },
                        { label: 'Pause/Resume', x: 800 }
                      ].map((item, i) => (
                        <g key={item.label}>
                          <circle cx={item.x} cy="60" r="20" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                          <text x={item.x} y="65" textAnchor="middle" fill="#e2e8f0" fontSize="10">{i + 1}</text>
                          <text x={item.x} y="95" textAnchor="middle" fill="#64748b" fontSize="8">{item.label}</text>
                          {i < 5 && (
                            <line x1={item.x + 25} y1="60" x2={item.x + 115} y2="60" stroke="#334155" strokeWidth="1" strokeDasharray="4" />
                          )}
                        </g>
                      ))}
                    </g>

                    {/* Audio Features */}
                    <g transform="translate(50, 360)">
                      <text x="0" y="0" fill="#94a3b8" fontSize="14" fontWeight="600">AUDIO FEATURES</text>
                      
                      {[
                        { title: 'Multi-track', status: 'done' },
                        { title: 'Background Music', status: 'done' },
                        { title: 'Audio Ducking', status: 'partial' },
                        { title: 'Voice Enhancement', status: 'planned' },
                        { title: 'Noise Reduction', status: 'planned' }
                      ].map((item, i) => (
                        <g key={item.title}>
                          <rect x={i * 180} y="20" width="160" height="40" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                          <text x={80 + i * 180} y="38" textAnchor="middle" fill="#e2e8f0" fontSize="10">{item.title}</text>
                          <text x={80 + i * 180} y="52" textAnchor="middle" fill={item.status === 'done' ? '#64748b' : item.status === 'partial' ? '#475569' : '#334155'} fontSize="8">
                            {item.status === 'done' ? '✓ Done' : item.status === 'partial' ? '◐ Partial' : '○ Planned'}
                          </text>
                        </g>
                      ))}
                    </g>
                  </svg>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data-model" className="space-y-4">
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-300">
                    <Database className="h-5 w-5" />
                    Database Schema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <svg viewBox="0 0 1000 500" className="w-full h-auto">
                    <rect width="1000" height="500" fill="#0f172a" rx="8" />

                    {/* Tables */}
                    {[
                      {
                        name: 'genie_projects',
                        x: 50, y: 30,
                        fields: ['id (uuid)', 'user_id (uuid)', 'name (text)', 'description (text)', 'status (text)', 'created_at', 'updated_at']
                      },
                      {
                        name: 'genie_scripts',
                        x: 350, y: 30,
                        fields: ['id (uuid)', 'project_id (uuid)', 'title (text)', 'content (text)', 'version (int)', 'word_count (int)', 'estimated_duration']
                      },
                      {
                        name: 'genie_recordings',
                        x: 650, y: 30,
                        fields: ['id (uuid)', 'project_id (uuid)', 'script_id (uuid)', 'file_url (text)', 'duration_ms (int)', 'status (text)', 'metadata (jsonb)']
                      },
                      {
                        name: 'genie_tts_audio',
                        x: 50, y: 270,
                        fields: ['id (uuid)', 'script_id (uuid)', 'voice_id (text)', 'audio_url (text)', 'duration_ms (int)', 'provider (text)']
                      },
                      {
                        name: 'universal_knowledge_base',
                        x: 350, y: 270,
                        fields: ['id (uuid)', 'user_id (uuid)', 'content (text)', 'metadata (jsonb)', 'embedding (vector)', 'source_type (text)']
                      },
                      {
                        name: 'agent_conversations',
                        x: 650, y: 270,
                        fields: ['id (uuid)', 'agent_id (uuid)', 'user_id (uuid)', 'session_id (text)', 'conversation_data (jsonb)', 'status (text)']
                      }
                    ].map((table) => (
                      <g key={table.name}>
                        <rect x={table.x} y={table.y} width="280" height={30 + table.fields.length * 18} rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                        <rect x={table.x} y={table.y} width="280" height="28" rx="8" fill="#334155" />
                        <text x={table.x + 140} y={table.y + 19} textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="600">{table.name}</text>
                        {table.fields.map((field, i) => (
                          <text key={field} x={table.x + 15} y={table.y + 48 + i * 18} fill="#64748b" fontSize="9">{field}</text>
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
                  </svg>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integration" className="space-y-4">
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-300">External Service Integrations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        name: 'ElevenLabs',
                        type: 'TTS Provider',
                        status: 'Active',
                        features: ['30+ voice options', 'Multi-language support', 'Voice cloning (planned)', 'Streaming audio']
                      },
                      {
                        name: 'OpenAI / Anthropic / Google',
                        type: 'AI Models',
                        status: 'Active',
                        features: ['Script generation', 'Content enhancement', 'RAG queries', 'Multi-model routing']
                      },
                      {
                        name: 'Supabase Storage',
                        type: 'File Storage',
                        status: 'Active',
                        features: ['Recording storage', 'Audio file hosting', 'Signed URLs', 'CDN delivery']
                      },
                      {
                        name: 'FFmpeg WASM',
                        type: 'Media Processing',
                        status: 'Partial',
                        features: ['Format conversion', 'Audio mixing', 'Video encoding', 'Client-side processing']
                      }
                    ].map((service, i) => (
                      <Card key={i} className="bg-slate-800/50 border-slate-700">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="text-slate-200 font-medium">{service.name}</h4>
                              <p className="text-slate-500 text-sm">{service.type}</p>
                            </div>
                            <Badge variant="outline" className={
                              service.status === 'Active' ? 'border-slate-500 text-slate-400' : 'border-slate-600 text-slate-500'
                            }>
                              {service.status}
                            </Badge>
                          </div>
                          <ul className="text-sm text-slate-400 space-y-1">
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
