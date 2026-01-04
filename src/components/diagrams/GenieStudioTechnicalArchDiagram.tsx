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
        backgroundColor: colors.background,
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
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Server className="h-8 w-8 text-muted-foreground" />
              <div>
                <CardTitle className="text-2xl text-foreground">Technical Architecture</CardTitle>
                <p className="text-muted-foreground text-sm">Genie Studio & Recording Studio - System Design</p>
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
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="script-pipeline">Script Pipeline</TabsTrigger>
          <TabsTrigger value="recording-pipeline">Recording Pipeline</TabsTrigger>
          <TabsTrigger value="data-model">Data Model</TabsTrigger>
          <TabsTrigger value="integration">Integration Points</TabsTrigger>
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
                  <h4 className="text-sm font-semibold mb-2" style={{ color: colors.text }}>Architecture Layers</h4>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.presentation.bg }} />
                      <span className="text-xs" style={{ color: colors.textMuted }}>Presentation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.application.bg }} />
                      <span className="text-xs" style={{ color: colors.textMuted }}>Application</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.domain.bg }} />
                      <span className="text-xs" style={{ color: colors.textMuted }}>Domain</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.infrastructure.bg }} />
                      <span className="text-xs" style={{ color: colors.textMuted }}>Infrastructure</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <TabsContent value="overview" className="space-y-4 mt-0">
              {/* System Overview SVG Diagram */}
              <Card className="border" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                <CardContent className="pt-6">
                  <svg viewBox="0 0 1200 550" className="w-full h-auto">
                    <defs>
                      <marker id="arrowTech" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill={colors.presentation.bg} />
                      </marker>
                    </defs>

                    {/* Background */}
                    <rect width="1200" height="550" fill={colors.background} rx="12" />

                    {/* Title */}
                    <text x="600" y="35" textAnchor="middle" fill={colors.text} fontSize="20" fontWeight="600">
                      Genie Studio Technical Architecture - P0/P1/P2
                    </text>

                    {/* Frontend Layer */}
                    <g transform="translate(50, 60)">
                      <rect width="1100" height="95" rx="8" fill={colors.presentation.light} stroke={colors.presentation.bg} strokeWidth="2" />
                      <rect width="1100" height="28" rx="8" fill={colors.presentation.bg} />
                      <text x="20" y="19" fill="#ffffff" fontSize="12" fontWeight="600">FRONTEND LAYER (React + Vite + TypeScript)</text>
                      
                      {['GenieStudio.tsx', 'RecordingStudio.tsx', 'Teleprompter.tsx', 'AudioMixer.tsx', 'ScriptEditor.tsx', 'ProjectManager.tsx'].map((name, i) => (
                        <g key={name}>
                          <rect x={20 + i * 180} y="40" width="160" height="40" rx="6" fill={colors.background} stroke={colors.border} strokeWidth="1" />
                          <text x={100 + i * 180} y="65" textAnchor="middle" fill={colors.text} fontSize="10">{name}</text>
                        </g>
                      ))}
                    </g>

                    {/* Services Layer */}
                    <g transform="translate(50, 175)">
                      <rect width="1100" height="95" rx="8" fill={colors.application.light} stroke={colors.application.bg} strokeWidth="2" />
                      <rect width="1100" height="28" rx="8" fill={colors.application.bg} />
                      <text x="20" y="19" fill="#ffffff" fontSize="12" fontWeight="600">SERVICES LAYER (Hooks & Services)</text>
                      
                      {['useUniversalAI', 'genieConversationService', 'useRecordingStudio', 'useTTSGeneration', 'useMediaRecorder'].map((name, i) => (
                        <g key={name}>
                          <rect x={20 + i * 220} y="40" width="200" height="40" rx="6" fill={colors.background} stroke={colors.border} strokeWidth="1" />
                          <text x={120 + i * 220} y="65" textAnchor="middle" fill={colors.text} fontSize="10">{name}</text>
                        </g>
                      ))}
                    </g>

                    {/* Edge Functions Layer */}
                    <g transform="translate(50, 290)">
                      <rect width="1100" height="95" rx="8" fill={colors.domain.light} stroke={colors.domain.bg} strokeWidth="2" />
                      <rect width="1100" height="28" rx="8" fill={colors.domain.bg} />
                      <text x="20" y="19" fill="#ffffff" fontSize="12" fontWeight="600">EDGE FUNCTIONS (Supabase)</text>
                      
                      {['ai-universal-processor', 'tts-generate', 'script-enhance', 'media-processor', 'knowledge-search'].map((name, i) => (
                        <g key={name}>
                          <rect x={20 + i * 220} y="40" width="200" height="40" rx="6" fill={colors.background} stroke={colors.border} strokeWidth="1" />
                          <text x={120 + i * 220} y="65" textAnchor="middle" fill={colors.text} fontSize="9">{name}</text>
                        </g>
                      ))}
                    </g>

                    {/* Database Layer */}
                    <g transform="translate(50, 405)">
                      <rect width="1100" height="95" rx="8" fill={colors.infrastructure.light} stroke={colors.infrastructure.bg} strokeWidth="2" />
                      <rect width="1100" height="28" rx="8" fill={colors.infrastructure.bg} />
                      <text x="20" y="19" fill="#ffffff" fontSize="12" fontWeight="600">DATABASE LAYER (Supabase PostgreSQL)</text>
                      
                      {['genie_projects', 'genie_scripts', 'genie_recordings', 'genie_tts_audio', 'universal_knowledge_base', 'agent_conversations'].map((name, i) => (
                        <g key={name}>
                          <rect x={20 + i * 180} y="40" width="160" height="40" rx="6" fill={colors.background} stroke={colors.border} strokeWidth="1" />
                          <text x={100 + i * 180} y="65" textAnchor="middle" fill={colors.text} fontSize="9">{name}</text>
                        </g>
                      ))}
                    </g>

                    {/* Connecting Arrows */}
                    <line x1="600" y1="155" x2="600" y2="175" stroke={colors.presentation.bg} strokeWidth="2" markerEnd="url(#arrowTech)" />
                    <line x1="600" y1="270" x2="600" y2="290" stroke={colors.application.bg} strokeWidth="2" markerEnd="url(#arrowTech)" />
                    <line x1="600" y1="385" x2="600" y2="405" stroke={colors.domain.bg} strokeWidth="2" markerEnd="url(#arrowTech)" />
                  </svg>
                </CardContent>
              </Card>

              {/* Implementation Status Grid */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="border-2" style={{ borderColor: colors.completed.bg, backgroundColor: colors.completed.light }}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="h-5 w-5" style={{ color: colors.completed.bg }} />
                      <span className="font-semibold" style={{ color: colors.completed.bg }}>P0 Core - 90% Done</span>
                    </div>
                    <ul className="text-sm space-y-1" style={{ color: colors.text }}>
                      <li style={{ color: colors.completed.bg }}>✓ Script creation & editing</li>
                      <li style={{ color: colors.completed.bg }}>✓ TTS generation (ElevenLabs)</li>
                      <li style={{ color: colors.completed.bg }}>✓ Basic recording</li>
                      <li style={{ color: colors.completed.bg }}>✓ Teleprompter sync</li>
                      <li style={{ color: colors.textMuted }}>○ Export pipeline</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-2" style={{ borderColor: colors.inProgress.bg, backgroundColor: colors.inProgress.light }}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-5 w-5" style={{ color: colors.inProgress.bg }} />
                      <span className="font-semibold" style={{ color: colors.inProgress.bg }}>P1 Enhanced - 60% Done</span>
                    </div>
                    <ul className="text-sm space-y-1" style={{ color: colors.text }}>
                      <li style={{ color: colors.completed.bg }}>✓ Multi-track audio</li>
                      <li style={{ color: colors.completed.bg }}>✓ AI script enhancement</li>
                      <li style={{ color: colors.textMuted }}>○ Screen recording</li>
                      <li style={{ color: colors.textMuted }}>○ Audio ducking</li>
                      <li style={{ color: colors.textMuted }}>○ Template library</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-2" style={{ borderColor: colors.planned.bg, backgroundColor: colors.planned.light }}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="h-5 w-5" style={{ color: colors.planned.bg }} />
                      <span className="font-semibold" style={{ color: colors.planned.bg }}>P2 Advanced - 30% Done</span>
                    </div>
                    <ul className="text-sm space-y-1" style={{ color: colors.textMuted }}>
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

            <TabsContent value="script-pipeline" className="space-y-4 mt-0">
              <Card className="border" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: colors.application.bg }}>
                    <Workflow className="h-5 w-5" />
                    Script Generation Pipeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <svg viewBox="0 0 1000 380" className="w-full h-auto">
                    <rect width="1000" height="380" fill={colors.background} rx="8" />
                    
                    {/* Pipeline Steps */}
                    <g transform="translate(50, 30)">
                      {[
                        { num: 1, title: 'INPUT', desc: ['User provides topic', 'or document'], color: colors.application.bg },
                        { num: 2, title: 'AI PROCESS', desc: ['useUniversalAI', 'generates script'], color: colors.presentation.bg },
                        { num: 3, title: 'ENHANCE', desc: ['Script optimization', '& timing calc'], color: colors.completed.bg },
                        { num: 4, title: 'TTS', desc: ['ElevenLabs API', 'voice generation'], color: colors.inProgress.bg },
                        { num: 5, title: 'OUTPUT', desc: ['Script + Audio', 'ready for recording'], color: colors.domain.bg }
                      ].map((step, i) => (
                        <g key={step.num}>
                          <rect x={i * 180} y="0" width="160" height="80" rx="8" fill={colors.cardBg} stroke={step.color} strokeWidth="2" />
                          <text x={80 + i * 180} y="35" textAnchor="middle" fill={step.color} fontSize="12" fontWeight="600">{step.num}. {step.title}</text>
                          {step.desc.map((d, j) => (
                            <text key={j} x={80 + i * 180} y={55 + j * 14} textAnchor="middle" fill={colors.textMuted} fontSize="10">{d}</text>
                          ))}
                          {i < 4 && (
                            <g>
                              <line x1={160 + i * 180} y1="40" x2={180 + i * 180} y2="40" stroke={colors.border} strokeWidth="2" />
                              <polygon points={`${175 + i * 180},35 ${185 + i * 180},40 ${175 + i * 180},45`} fill={colors.border} />
                            </g>
                          )}
                        </g>
                      ))}
                    </g>

                    {/* Data Flow Details */}
                    <g transform="translate(50, 130)">
                      <rect width="900" height="160" rx="8" fill={colors.cardBg} stroke={colors.border} strokeWidth="1" />
                      <rect width="900" height="28" rx="8" fill={colors.presentation.bg} />
                      <text x="20" y="19" fill="#ffffff" fontSize="11" fontWeight="600">DATA FLOW DETAILS</text>
                      
                      <text x="20" y="55" fill={colors.textMuted} fontSize="11">Input Types:</text>
                      <text x="120" y="55" fill={colors.text} fontSize="11">Topic prompt | Document upload | Knowledge base query | Manual text</text>
                      
                      <text x="20" y="80" fill={colors.textMuted} fontSize="11">AI Models:</text>
                      <text x="120" y="80" fill={colors.text} fontSize="11">GPT-4 / Claude / Gemini (via useUniversalAI)</text>
                      
                      <text x="20" y="105" fill={colors.textMuted} fontSize="11">TTS Voices:</text>
                      <text x="120" y="105" fill={colors.text} fontSize="11">ElevenLabs (30+ voices) | Browser Web Speech API (fallback)</text>
                      
                      <text x="20" y="130" fill={colors.textMuted} fontSize="11">Output:</text>
                      <text x="120" y="130" fill={colors.text} fontSize="11">Script JSON | Audio WAV/MP3 | Timing metadata | Project file</text>
                    </g>

                    {/* Tech Stack */}
                    <g transform="translate(50, 310)">
                      <text x="0" y="15" fill={colors.textMuted} fontSize="10">Tech Stack:</text>
                      {['React', 'TypeScript', 'Supabase Edge', 'ElevenLabs API', 'Web Audio API'].map((tech, i) => (
                        <g key={tech}>
                          <rect x={80 + i * 130} y="0" width="110" height="24" rx="4" fill={colors.cardBg} stroke={colors.border} strokeWidth="1" />
                          <text x={135 + i * 130} y="16" textAnchor="middle" fill={colors.text} fontSize="9">{tech}</text>
                        </g>
                      ))}
                    </g>
                  </svg>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recording-pipeline" className="space-y-4 mt-0">
              <Card className="border" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: colors.completed.bg }}>
                    <Cpu className="h-5 w-5" />
                    Recording Pipeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <svg viewBox="0 0 1000 400" className="w-full h-auto">
                    <rect width="1000" height="400" fill={colors.background} rx="8" />
                    
                    {/* Recording Flow */}
                    <g transform="translate(50, 30)">
                      {[
                        { num: 1, title: 'SETUP', items: ['Camera selection', 'Audio input', 'Screen share'], color: colors.presentation.bg },
                        { num: 2, title: 'TELEPROMPTER', items: ['Script sync', 'Speed control', 'Markers'], color: colors.application.bg },
                        { num: 3, title: 'RECORD', items: ['Multi-track', 'Pause/Resume', 'Monitor levels'], color: colors.completed.bg },
                        { num: 4, title: 'PROCESS', items: ['Audio mixing', 'Video encode', 'Compression'], color: colors.inProgress.bg },
                        { num: 5, title: 'EXPORT', items: ['MP4/WebM', 'Audio only', 'Thumbnails'], color: colors.domain.bg },
                      ].map((stage, i) => (
                        <g key={stage.num}>
                          <rect x={i * 180} y="0" width="160" height="110" rx="8" fill={colors.cardBg} stroke={stage.color} strokeWidth="2" />
                          <text x={80 + i * 180} y="25" textAnchor="middle" fill={stage.color} fontSize="12" fontWeight="600">{stage.num}. {stage.title}</text>
                          {stage.items.map((item, j) => (
                            <text key={j} x={80 + i * 180} y={50 + j * 18} textAnchor="middle" fill={colors.text} fontSize="10">{item}</text>
                          ))}
                          {i < 4 && (
                            <line x1={160 + i * 180} y1="55" x2={180 + i * 180} y2="55" stroke={colors.border} strokeWidth="2" markerEnd="url(#arrowTech)" />
                          )}
                        </g>
                      ))}
                    </g>

                    {/* Browser APIs */}
                    <g transform="translate(50, 160)">
                      <rect width="900" height="90" rx="8" fill={colors.cardBg} stroke={colors.border} strokeWidth="1" />
                      <rect width="900" height="28" rx="8" fill={colors.infrastructure.bg} />
                      <text x="20" y="19" fill="#ffffff" fontSize="11" fontWeight="600">BROWSER APIs USED</text>
                      
                      {[
                        { name: 'MediaRecorder API', desc: 'Video/Audio capture' },
                        { name: 'Web Audio API', desc: 'Audio processing' },
                        { name: 'getDisplayMedia', desc: 'Screen capture' },
                        { name: 'getUserMedia', desc: 'Camera/Mic access' },
                      ].map((api, i) => (
                        <g key={api.name}>
                          <rect x={20 + i * 220} y="40" width="200" height="38" rx="6" fill={colors.background} stroke={colors.border} strokeWidth="1" />
                          <text x={120 + i * 220} y="57" textAnchor="middle" fill={colors.text} fontSize="10" fontWeight="500">{api.name}</text>
                          <text x={120 + i * 220} y="72" textAnchor="middle" fill={colors.textMuted} fontSize="9">{api.desc}</text>
                        </g>
                      ))}
                    </g>

                    {/* Output Formats */}
                    <g transform="translate(50, 270)">
                      <rect width="900" height="100" rx="8" fill={colors.cardBg} stroke={colors.border} strokeWidth="1" />
                      <rect width="900" height="28" rx="8" fill={colors.domain.bg} />
                      <text x="20" y="19" fill="#ffffff" fontSize="11" fontWeight="600">OUTPUT FORMATS</text>
                      
                      <g transform="translate(20, 45)">
                        {[
                          { format: 'WebM (VP9)', status: 'implemented' },
                          { format: 'MP4 (H.264)', status: 'partial' },
                          { format: 'MP3 Audio', status: 'implemented' },
                          { format: 'WAV Audio', status: 'implemented' },
                          { format: 'PNG Thumbnails', status: 'planned' },
                        ].map((fmt, i) => (
                          <g key={fmt.format}>
                            <rect x={i * 175} y="0" width="160" height="40" rx="6" fill={
                              fmt.status === 'implemented' ? colors.completed.light : 
                              fmt.status === 'partial' ? colors.inProgress.light : colors.planned.light
                            } stroke={
                              fmt.status === 'implemented' ? colors.completed.bg : 
                              fmt.status === 'partial' ? colors.inProgress.bg : colors.planned.bg
                            } strokeWidth="1" />
                            <text x={80 + i * 175} y="18" textAnchor="middle" fill={colors.text} fontSize="10" fontWeight="500">{fmt.format}</text>
                            <text x={80 + i * 175} y="32" textAnchor="middle" fill={
                              fmt.status === 'implemented' ? colors.completed.bg : 
                              fmt.status === 'partial' ? colors.inProgress.bg : colors.planned.bg
                            } fontSize="9">{fmt.status === 'implemented' ? '✓ Done' : fmt.status === 'partial' ? '◐ Partial' : '○ Planned'}</text>
                          </g>
                        ))}
                      </g>
                    </g>
                  </svg>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data-model" className="space-y-4 mt-0">
              <Card className="border" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: colors.infrastructure.bg }}>
                    <Database className="h-5 w-5" />
                    Database Schema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <svg viewBox="0 0 1000 450" className="w-full h-auto">
                    <rect width="1000" height="450" fill={colors.background} rx="8" />
                    
                    {/* Core Tables */}
                    {[
                      { name: 'genie_projects', x: 50, y: 30, fields: ['id (UUID PK)', 'user_id (FK)', 'name', 'description', 'status', 'created_at'], color: colors.presentation.bg },
                      { name: 'genie_scripts', x: 350, y: 30, fields: ['id (UUID PK)', 'project_id (FK)', 'content', 'word_count', 'duration_estimate', 'version'], color: colors.application.bg },
                      { name: 'genie_recordings', x: 650, y: 30, fields: ['id (UUID PK)', 'script_id (FK)', 'video_url', 'audio_url', 'duration', 'status'], color: colors.domain.bg },
                      { name: 'genie_tts_audio', x: 50, y: 250, fields: ['id (UUID PK)', 'script_id (FK)', 'voice_id', 'audio_url', 'duration', 'settings'], color: colors.inProgress.bg },
                      { name: 'universal_knowledge_base', x: 350, y: 250, fields: ['id (UUID PK)', 'user_id (FK)', 'content', 'embedding', 'metadata', 'source'], color: colors.completed.bg },
                      { name: 'agent_conversations', x: 650, y: 250, fields: ['id (UUID PK)', 'agent_id (FK)', 'user_id', 'messages', 'context', 'status'], color: colors.planned.bg },
                    ].map((table) => (
                      <g key={table.name}>
                        <rect x={table.x} y={table.y} width="280" height="180" rx="8" fill={colors.cardBg} stroke={table.color} strokeWidth="2" />
                        <rect x={table.x} y={table.y} width="280" height="32" rx="8" fill={table.color} />
                        <text x={table.x + 140} y={table.y + 22} textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="600">{table.name}</text>
                        {table.fields.map((field, i) => (
                          <text key={field} x={table.x + 15} y={table.y + 55 + i * 22} fill={colors.text} fontSize="10">{field}</text>
                        ))}
                      </g>
                    ))}

                    {/* Relationships */}
                    <line x1="330" y1="120" x2="350" y2="120" stroke={colors.border} strokeWidth="1.5" strokeDasharray="4" />
                    <line x1="630" y1="120" x2="650" y2="120" stroke={colors.border} strokeWidth="1.5" strokeDasharray="4" />
                    <line x1="190" y1="210" x2="190" y2="250" stroke={colors.border} strokeWidth="1.5" strokeDasharray="4" />
                  </svg>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integration" className="space-y-4 mt-0">
              <Card className="border" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: colors.domain.bg }}>
                    <Server className="h-5 w-5" />
                    External Integration Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <svg viewBox="0 0 1000 380" className="w-full h-auto">
                    <rect width="1000" height="380" fill={colors.background} rx="8" />
                    
                    {/* AI Providers */}
                    <g transform="translate(50, 20)">
                      <rect width="280" height="150" rx="8" fill={colors.cardBg} stroke={colors.application.bg} strokeWidth="2" />
                      <rect width="280" height="28" rx="8" fill={colors.application.bg} />
                      <text x="140" y="19" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="600">AI PROVIDERS</text>
                      
                      {['OpenAI GPT-4', 'Anthropic Claude', 'Google Gemini'].map((provider, i) => (
                        <g key={provider}>
                          <rect x="15" y={40 + i * 35} width="250" height="28" rx="4" fill={colors.background} stroke={colors.border} strokeWidth="1" />
                          <circle cx="30" cy={54 + i * 35} r="6" fill={colors.completed.bg} />
                          <text x="45" y={58 + i * 35} fill={colors.text} fontSize="10">{provider}</text>
                        </g>
                      ))}
                    </g>

                    {/* TTS Providers */}
                    <g transform="translate(360, 20)">
                      <rect width="280" height="150" rx="8" fill={colors.cardBg} stroke={colors.inProgress.bg} strokeWidth="2" />
                      <rect width="280" height="28" rx="8" fill={colors.inProgress.bg} />
                      <text x="140" y="19" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="600">TTS PROVIDERS</text>
                      
                      {[
                        { name: 'ElevenLabs', status: 'active' },
                        { name: 'Web Speech API', status: 'fallback' },
                        { name: 'Amazon Polly', status: 'planned' }
                      ].map((provider, i) => (
                        <g key={provider.name}>
                          <rect x="15" y={40 + i * 35} width="250" height="28" rx="4" fill={colors.background} stroke={colors.border} strokeWidth="1" />
                          <circle cx="30" cy={54 + i * 35} r="6" fill={provider.status === 'active' ? colors.completed.bg : provider.status === 'fallback' ? colors.inProgress.bg : colors.textMuted} />
                          <text x="45" y={58 + i * 35} fill={colors.text} fontSize="10">{provider.name}</text>
                          <text x="250" y={58 + i * 35} textAnchor="end" fill={colors.textMuted} fontSize="9">{provider.status}</text>
                        </g>
                      ))}
                    </g>

                    {/* Storage */}
                    <g transform="translate(670, 20)">
                      <rect width="280" height="150" rx="8" fill={colors.cardBg} stroke={colors.infrastructure.bg} strokeWidth="2" />
                      <rect width="280" height="28" rx="8" fill={colors.infrastructure.bg} />
                      <text x="140" y="19" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="600">STORAGE</text>
                      
                      {['Supabase Storage (Media)', 'PostgreSQL (Metadata)', 'pgvector (Embeddings)'].map((storage, i) => (
                        <g key={storage}>
                          <rect x="15" y={40 + i * 35} width="250" height="28" rx="4" fill={colors.background} stroke={colors.border} strokeWidth="1" />
                          <circle cx="30" cy={54 + i * 35} r="6" fill={colors.completed.bg} />
                          <text x="45" y={58 + i * 35} fill={colors.text} fontSize="10">{storage}</text>
                        </g>
                      ))}
                    </g>

                    {/* API Endpoints */}
                    <g transform="translate(50, 190)">
                      <rect width="900" height="160" rx="8" fill={colors.cardBg} stroke={colors.border} strokeWidth="1" />
                      <rect width="900" height="28" rx="8" fill={colors.domain.bg} />
                      <text x="20" y="19" fill="#ffffff" fontSize="11" fontWeight="600">API ENDPOINTS (Edge Functions)</text>
                      
                      <g transform="translate(15, 40)">
                        {[
                          { endpoint: '/ai-universal-processor', method: 'POST', status: 'active' },
                          { endpoint: '/tts-generate', method: 'POST', status: 'active' },
                          { endpoint: '/script-enhance', method: 'POST', status: 'active' },
                          { endpoint: '/media-processor', method: 'POST', status: 'partial' },
                          { endpoint: '/knowledge-search', method: 'POST', status: 'active' },
                        ].map((api, i) => (
                          <g key={api.endpoint}>
                            <rect x={i * 175} y="0" width="165" height="50" rx="6" fill={colors.background} stroke={colors.border} strokeWidth="1" />
                            <text x={82 + i * 175} y="20" textAnchor="middle" fill={colors.text} fontSize="9" fontWeight="500">{api.endpoint}</text>
                            <rect x={20 + i * 175} y="30" width="40" height="14" rx="3" fill={colors.presentation.bg} />
                            <text x={40 + i * 175} y="40" textAnchor="middle" fill="#ffffff" fontSize="8">{api.method}</text>
                            <circle cx={130 + i * 175} cy="37" r="5" fill={api.status === 'active' ? colors.completed.bg : colors.inProgress.bg} />
                          </g>
                        ))}
                      </g>

                      {/* Rate Limits */}
                      <g transform="translate(15, 100)">
                        <text x="0" y="15" fill={colors.textMuted} fontSize="10">Rate Limits:</text>
                        <text x="80" y="15" fill={colors.text} fontSize="10">AI: 60 req/min | TTS: 30 req/min | Media: 20 req/min</text>
                        <text x="450" y="15" fill={colors.textMuted} fontSize="10">Auth:</text>
                        <text x="490" y="15" fill={colors.text} fontSize="10">Supabase JWT + RLS Policies</text>
                      </g>
                    </g>
                  </svg>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
};
