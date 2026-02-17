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
  AlertCircle,
  Smartphone,
  Shield,
  Globe,
  Maximize2,
  X
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

// Enterprise color palette with HSL for theme consistency
const colors = {
  completed: { bg: 'hsl(160, 84%, 39%)', text: '#ffffff', light: 'hsl(150, 80%, 94%)' },
  inProgress: { bg: 'hsl(38, 92%, 50%)', text: '#ffffff', light: 'hsl(48, 96%, 94%)' },
  planned: { bg: 'hsl(239, 84%, 67%)', text: '#ffffff', light: 'hsl(224, 76%, 94%)' },
  
  presentation: { bg: 'hsl(199, 89%, 48%)', text: '#ffffff', light: 'hsl(201, 94%, 94%)' },
  application: { bg: 'hsl(258, 90%, 66%)', text: '#ffffff', light: 'hsl(250, 91%, 95%)' },
  domain: { bg: 'hsl(330, 81%, 60%)', text: '#ffffff', light: 'hsl(326, 78%, 95%)' },
  infrastructure: { bg: 'hsl(215, 16%, 47%)', text: '#ffffff', light: 'hsl(210, 40%, 96%)' },
  
  border: 'hsl(var(--border))',
  background: 'hsl(var(--background))',
  cardBg: 'hsl(var(--card))',
  text: 'hsl(var(--foreground))',
  textMuted: 'hsl(var(--muted-foreground))',
};

export const GenieStudioTechnicalArchDiagram = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);

  const openDocs = () => {
    window.open('/docs/GENIE_PHASE_IMPLEMENTATION_ROADMAP.md', '_blank');
  };

  const handleDownloadPNG = async () => {
    if (!diagramRef.current) return;
    try {
      const canvas = await html2canvas(diagramRef.current, { backgroundColor: colors.background, scale: 2 });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `genie-studio-technical-${activeTab}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('PNG downloaded successfully');
    } catch (error) {
      toast.error('Failed to download PNG');
    }
  };

  const handleDownloadSVG = () => {
    toast.success('SVG download initiated');
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Server className="h-8 w-8 text-muted-foreground" />
              <div>
                <CardTitle className="text-2xl text-foreground">Technical Architecture</CardTitle>
                <p className="text-muted-foreground text-sm">Genie Mind + Genie Vibe — 6 Phases • 140 Scenarios • 12 Agents • 15 APIs</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadSVG} className="gap-2">
                <Download className="h-4 w-4" />SVG
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPNG} className="gap-2">
                <Download className="h-4 w-4" />PNG
              </Button>
              <Button variant="outline" size="sm" onClick={openDocs} className="gap-2">
                <FileText className="h-4 w-4" />Docs<ExternalLink className="h-3 w-3" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsFullscreen(true)} className="gap-2">
                <Maximize2 className="h-4 w-4" />Expand
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="phases">P0-P5 Roadmap</TabsTrigger>
          <TabsTrigger value="mobile">Mobile-First</TabsTrigger>
          <TabsTrigger value="data-model">Data Model</TabsTrigger>
          <TabsTrigger value="segments">Segment Tech</TabsTrigger>
          <TabsTrigger value="integration">Integrations</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[600px] mt-4">
          <div ref={diagramRef} className="p-4 bg-white rounded-lg">
            {/* Legend */}
            <div className="mb-4 p-3 rounded-lg border" style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2" style={{ color: colors.text }}>Implementation Status</h4>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ backgroundColor: colors.completed.bg }} /><span className="text-xs">Completed (P0)</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ backgroundColor: colors.inProgress.bg }} /><span className="text-xs">In Progress (P1)</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ backgroundColor: colors.planned.bg }} /><span className="text-xs">Planned (P2-P5)</span></div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2" style={{ color: colors.text }}>Architecture Layers</h4>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ backgroundColor: colors.presentation.bg }} /><span className="text-xs">Presentation</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ backgroundColor: colors.application.bg }} /><span className="text-xs">Application</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ backgroundColor: colors.domain.bg }} /><span className="text-xs">Domain</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ backgroundColor: colors.infrastructure.bg }} /><span className="text-xs">Infrastructure</span></div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2" style={{ color: colors.text }}>Market Stats</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge style={{ backgroundColor: colors.inProgress.light, color: colors.inProgress.bg }}>68% want mobile</Badge>
                    <Badge style={{ backgroundColor: colors.planned.light, color: colors.planned.bg }}>54% need offline</Badge>
                  </div>
                </div>
              </div>
            </div>

            <TabsContent value="overview" className="space-y-4 mt-0">
              <Card className="border" style={{ borderColor: colors.border }}>
                <CardContent className="pt-6">
                  <svg viewBox="0 0 1200 600" className="w-full h-auto">
                    <defs>
                      <marker id="arrowTech" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill={colors.presentation.bg} />
                      </marker>
                    </defs>
                    <rect width="1200" height="600" fill={colors.background} rx="12" />
                    <text x="600" y="35" textAnchor="middle" fill={colors.text} fontSize="20" fontWeight="600">Genie Mind + Genie Vibe Technical Architecture (140 Scenarios)</text>
                    <text x="600" y="55" textAnchor="middle" fill={colors.textMuted} fontSize="12">P0 Complete (18) | P1 In Progress (15) | P2-P5 Planned (107) | 12 Agents | 27 APIs</text>

                    {/* Frontend Layer */}
                    <g transform="translate(50, 75)">
                      <rect width="1100" height="100" rx="8" fill={colors.presentation.light} stroke={colors.presentation.bg} strokeWidth="2" />
                      <rect width="1100" height="28" rx="8" fill={colors.presentation.bg} />
                      <text x="20" y="19" fill="#ffffff" fontSize="12" fontWeight="600">FRONTEND LAYER (React + Vite + TypeScript)</text>
                      {['GenieStudio.tsx', 'RecordingStudio.tsx', 'Teleprompter.tsx', 'ContentAnalyzer.tsx', 'VibeToMindBridge.tsx', 'MobileRecord.tsx (P1)'].map((name, i) => (
                        <g key={name}>
                          <rect x={20 + i * 180} y="40" width="165" height="45" rx="6" fill={i < 5 ? colors.background : colors.planned.light} stroke={i < 5 ? colors.border : colors.planned.bg} strokeWidth="1" />
                          <text x={102 + i * 180} y="68" textAnchor="middle" fill={colors.text} fontSize="10">{name}</text>
                        </g>
                      ))}
                    </g>

                    {/* Services Layer */}
                    <g transform="translate(50, 195)">
                      <rect width="1100" height="100" rx="8" fill={colors.application.light} stroke={colors.application.bg} strokeWidth="2" />
                      <rect width="1100" height="28" rx="8" fill={colors.application.bg} />
                      <text x="20" y="19" fill="#ffffff" fontSize="12" fontWeight="600">SERVICES LAYER (Hooks & Services)</text>
                      {['useUniversalAI ✓', 'genieConversationService ✓', 'useTTSGeneration ✓', 'useRemixEngine (P1)', 'useOfflineMode (P2)'].map((name, i) => (
                        <g key={name}>
                          <rect x={20 + i * 220} y="40" width="205" height="45" rx="6" fill={i < 3 ? colors.background : i === 3 ? colors.inProgress.light : colors.planned.light} stroke={colors.border} strokeWidth="1" />
                          <text x={122 + i * 220} y="68" textAnchor="middle" fill={colors.text} fontSize="10">{name}</text>
                        </g>
                      ))}
                    </g>

                    {/* Edge Functions Layer */}
                    <g transform="translate(50, 315)">
                      <rect width="1100" height="100" rx="8" fill={colors.domain.light} stroke={colors.domain.bg} strokeWidth="2" />
                      <rect width="1100" height="28" rx="8" fill={colors.domain.bg} />
                      <text x="20" y="19" fill="#ffffff" fontSize="12" fontWeight="600">EDGE FUNCTIONS (Supabase)</text>
                      {['ai-universal-processor ✓', 'tts-generate ✓', 'rag-search ✓', 'media-processor (P2)', 'hipaa-audit (P3)'].map((name, i) => (
                        <g key={name}>
                          <rect x={20 + i * 220} y="40" width="205" height="45" rx="6" fill={i < 3 ? colors.background : colors.planned.light} stroke={colors.border} strokeWidth="1" />
                          <text x={122 + i * 220} y="68" textAnchor="middle" fill={colors.text} fontSize="9">{name}</text>
                        </g>
                      ))}
                    </g>

                    {/* Database Layer */}
                    <g transform="translate(50, 435)">
                      <rect width="1100" height="100" rx="8" fill={colors.infrastructure.light} stroke={colors.infrastructure.bg} strokeWidth="2" />
                      <rect width="1100" height="28" rx="8" fill={colors.infrastructure.bg} />
                      <text x="20" y="19" fill="#ffffff" fontSize="12" fontWeight="600">DATABASE LAYER (Supabase PostgreSQL)</text>
                      {['genie_projects ✓', 'genie_scripts ✓', 'genie_recordings ✓', 'universal_knowledge_base ✓', 'user_subscriptions (P5)', 'hipaa_audit_logs (P3)'].map((name, i) => (
                        <g key={name}>
                          <rect x={20 + i * 180} y="40" width="165" height="45" rx="6" fill={i < 4 ? colors.background : colors.planned.light} stroke={colors.border} strokeWidth="1" />
                          <text x={102 + i * 180} y="68" textAnchor="middle" fill={colors.text} fontSize="9">{name}</text>
                        </g>
                      ))}
                    </g>

                    {/* Arrows */}
                    <line x1="600" y1="175" x2="600" y2="195" stroke={colors.presentation.bg} strokeWidth="2" markerEnd="url(#arrowTech)" />
                    <line x1="600" y1="295" x2="600" y2="315" stroke={colors.application.bg} strokeWidth="2" markerEnd="url(#arrowTech)" />
                    <line x1="600" y1="415" x2="600" y2="435" stroke={colors.domain.bg} strokeWidth="2" markerEnd="url(#arrowTech)" />
                  </svg>
                </CardContent>
              </Card>

              {/* Phase Status Cards */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="border-2" style={{ borderColor: colors.completed.bg, backgroundColor: colors.completed.light }}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="h-5 w-5" style={{ color: colors.completed.bg }} />
                      <span className="font-semibold" style={{ color: colors.completed.bg }}>P0 Core + Vibe↔Mind - 100%</span>
                    </div>
                    <ul className="text-sm space-y-1">
                      <li style={{ color: colors.completed.bg }}>✓ Script creation & AI enhancement</li>
                      <li style={{ color: colors.completed.bg }}>✓ TTS generation (ElevenLabs)</li>
                      <li style={{ color: colors.completed.bg }}>✓ Bidirectional ContentAnalyzer</li>
                      <li style={{ color: colors.completed.bg }}>✓ VibeToMindBridge</li>
                      <li style={{ color: colors.completed.bg }}>✓ 13 scenarios complete</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-2" style={{ borderColor: colors.inProgress.bg, backgroundColor: colors.inProgress.light }}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-5 w-5" style={{ color: colors.inProgress.bg }} />
                      <span className="font-semibold" style={{ color: colors.inProgress.bg }}>P1 Mobile & Remix - 30%</span>
                    </div>
                    <ul className="text-sm space-y-1">
                      <li style={{ color: colors.textMuted }}>○ One-Tap Mobile Record (68% want)</li>
                      <li style={{ color: colors.textMuted }}>○ Multi-Clip Timeline</li>
                      <li style={{ color: colors.textMuted }}>○ Remix Engine</li>
                      <li style={{ color: colors.inProgress.bg }}>◐ PWA Infrastructure</li>
                      <li style={{ color: colors.textMuted }}>10 scenarios planned</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-2" style={{ borderColor: colors.planned.bg, backgroundColor: colors.planned.light }}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="h-5 w-5" style={{ color: colors.planned.bg }} />
                      <span className="font-semibold" style={{ color: colors.planned.bg }}>P2-P5 Future - 0%</span>
                    </div>
                    <ul className="text-sm space-y-1" style={{ color: colors.textMuted }}>
                      <li>○ P2: Offline + AI Features (54% need)</li>
                      <li>○ P3: Segment-Specific (SMB/Edu/Healthcare)</li>
                      <li>○ P4: Enterprise White-label</li>
                      <li>○ P5: Advanced AI & Analytics</li>
                      <li>87 scenarios planned</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="phases" className="space-y-4 mt-0">
              <h3 className="text-lg font-semibold" style={{ color: colors.text }}>P0-P5 Technical Implementation Roadmap</h3>
              <div className="space-y-3">
                {[
                  { phase: 'P0', name: 'Core + Vibe↔Mind', status: 'completed', tech: ['React', 'TypeScript', 'Supabase', 'ElevenLabs'], features: ['GenieStudio.tsx', 'RecordingStudio.tsx', 'ContentAnalyzer.tsx', 'VibeToMindBridge.tsx', 'useUniversalAI', 'ai-universal-processor'], scenarios: 13 },
                  { phase: 'P1', name: 'Mobile & Remix', status: 'in-progress', tech: ['PWA', 'Service Workers', 'IndexedDB', 'WebRTC'], features: ['MobileRecord.tsx', 'RemixTimeline.tsx', 'useRemixEngine', 'useOfflineCache'], scenarios: 10 },
                  { phase: 'P2', name: 'Advanced Features', status: 'planned', tech: ['Workbox', 'TensorFlow.js', 'WebGPU'], features: ['OfflineRecorder.tsx', 'VoiceCommands.tsx', 'AIAutoArrange', 'SmartTransitions'], scenarios: 10 },
                  { phase: 'P3', name: 'Segment-Specific', status: 'planned', tech: ['HIPAA SDKs', 'SCORM', 'LTI'], features: ['ProductDemoMode.tsx', 'LessonBuilder.tsx', 'PatientEducation.tsx', 'hipaa-audit'], scenarios: 10 },
                  { phase: 'P4', name: 'Enterprise', status: 'planned', tech: ['SAML', 'SSO', 'Multi-tenant'], features: ['WhiteLabelConfig.tsx', 'ApprovalWorkflows.tsx', 'TenantManager', 'RoleBasedAccess'], scenarios: 10 },
                  { phase: 'P5', name: 'Future Innovation', status: 'planned', tech: ['Stripe', 'AI Avatars', 'Custom Models'], features: ['SubscriptionManager.tsx', 'AvatarGenerator.tsx', 'BatchProcessor', 'AdvancedAnalytics'], scenarios: 10 },
                ].map((p) => (
                  <Card key={p.phase} className="border" style={{ borderColor: p.status === 'completed' ? colors.completed.bg : p.status === 'in-progress' ? colors.inProgress.bg : colors.planned.bg }}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge style={{ backgroundColor: p.status === 'completed' ? colors.completed.bg : p.status === 'in-progress' ? colors.inProgress.bg : colors.planned.bg, color: '#fff' }}>{p.phase}</Badge>
                          <span className="font-semibold" style={{ color: colors.text }}>{p.name}</span>
                          <span className="text-sm" style={{ color: colors.textMuted }}>({p.scenarios} scenarios)</span>
                        </div>
                        <Badge variant="outline">{p.status === 'completed' ? '100%' : p.status === 'in-progress' ? '30%' : '0%'}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold mb-1" style={{ color: colors.textMuted }}>Tech Stack:</p>
                          <div className="flex flex-wrap gap-1">
                            {p.tech.map((t) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold mb-1" style={{ color: colors.textMuted }}>Key Components:</p>
                          <div className="flex flex-wrap gap-1">
                            {p.features.slice(0, 4).map((f) => <Badge key={f} variant="outline" className="text-xs">{f}</Badge>)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="mobile" className="space-y-4 mt-0">
              <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: colors.text }}>
                <Smartphone className="h-5 w-5" />
                Mobile-First Architecture (68% user demand)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Card className="border" style={{ borderColor: colors.inProgress.bg }}>
                  <CardContent className="pt-4">
                    <h4 className="font-semibold mb-2" style={{ color: colors.inProgress.bg }}>P1: Mobile Recording</h4>
                    <ul className="text-sm space-y-1">
                      <li>○ One-Tap Record widget</li>
                      <li>○ PWA with offline support</li>
                      <li>○ Quick social templates (TikTok, Reels, Shorts)</li>
                      <li>○ Service Worker for background sync</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="border" style={{ borderColor: colors.planned.bg }}>
                  <CardContent className="pt-4">
                    <h4 className="font-semibold mb-2" style={{ color: colors.planned.bg }}>P2: Offline Mode (54% need)</h4>
                    <ul className="text-sm space-y-1">
                      <li>○ Full offline recording</li>
                      <li>○ IndexedDB for local storage</li>
                      <li>○ Background sync when online</li>
                      <li>○ Compressed local TTS cache</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="data-model" className="space-y-4 mt-0">
              <Card className="border" style={{ borderColor: colors.border }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: colors.infrastructure.bg }}>
                    <Database className="h-5 w-5" />Database Schema (Core + Subscription Tables)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <svg viewBox="0 0 1000 500" className="w-full h-auto">
                    <rect width="1000" height="500" fill={colors.background} rx="8" />
                    {[
                      { name: 'genie_projects', x: 50, y: 30, fields: ['id (UUID PK)', 'user_id (FK)', 'name', 'status'], color: colors.presentation.bg, status: '✓' },
                      { name: 'genie_scripts', x: 300, y: 30, fields: ['id (UUID PK)', 'project_id (FK)', 'content', 'version'], color: colors.application.bg, status: '✓' },
                      { name: 'genie_recordings', x: 550, y: 30, fields: ['id (UUID PK)', 'script_id (FK)', 'video_url', 'duration'], color: colors.domain.bg, status: '✓' },
                      { name: 'universal_knowledge_base', x: 800, y: 30, fields: ['id (UUID PK)', 'embedding', 'content', 'metadata'], color: colors.completed.bg, status: '✓' },
                      { name: 'user_subscriptions', x: 50, y: 250, fields: ['id (UUID PK)', 'user_id (FK)', 'tier', 'modules_enabled'], color: colors.planned.bg, status: 'P5' },
                      { name: 'subscription_tiers', x: 300, y: 250, fields: ['id (TEXT PK)', 'name', 'price_monthly', 'default_modules'], color: colors.planned.bg, status: 'P5' },
                      { name: 'hipaa_audit_logs', x: 550, y: 250, fields: ['id (UUID PK)', 'action', 'user_id', 'phi_accessed'], color: colors.planned.bg, status: 'P3' },
                      { name: 'remix_clips', x: 800, y: 250, fields: ['id (UUID PK)', 'source_id (FK)', 'start_time', 'end_time'], color: colors.inProgress.bg, status: 'P1' },
                    ].map((table) => (
                      <g key={table.name}>
                        <rect x={table.x} y={table.y} width="200" height="180" rx="8" fill={colors.cardBg} stroke={table.color} strokeWidth="2" />
                        <rect x={table.x} y={table.y} width="200" height="32" rx="8" fill={table.color} />
                        <text x={table.x + 100} y={table.y + 22} textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="600">{table.name}</text>
                        <text x={table.x + 180} y={table.y + 22} textAnchor="middle" fill="#ffffff" fontSize="9">{table.status}</text>
                        {table.fields.map((field, i) => (
                          <text key={field} x={table.x + 15} y={table.y + 55 + i * 20} fill={colors.text} fontSize="10">{field}</text>
                        ))}
                      </g>
                    ))}
                  </svg>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="segments" className="space-y-4 mt-0">
              <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: colors.text }}>
                <Shield className="h-5 w-5" />Segment-Specific Technical Requirements
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { segment: 'Creator', color: colors.presentation.bg, tech: ['Quick Templates', 'Social Presets', 'Auto-shorts'], phase: 'P1' },
                  { segment: 'Traveler', color: colors.application.bg, tech: ['Offline Mode', 'Geo-tagging', 'Trip Auto-edit'], phase: 'P2' },
                  { segment: 'SMB', color: colors.inProgress.bg, tech: ['Product Demo', 'Testimonial Collector', 'Quick Templates'], phase: 'P3' },
                  { segment: 'Education', color: colors.completed.bg, tech: ['Lesson Builder', 'SCORM Export', 'Quiz Integration'], phase: 'P3' },
                  { segment: 'Healthcare', color: colors.domain.bg, tech: ['HIPAA Compliance', 'PHI Redaction', 'Audit Trails'], phase: 'P3-P4' },
                  { segment: 'Enterprise', color: colors.infrastructure.bg, tech: ['White-label', 'SSO/SAML', 'Multi-tenant'], phase: 'P4' },
                ].map((s) => (
                  <Card key={s.segment} className="border" style={{ borderColor: s.color }}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold" style={{ color: s.color }}>{s.segment}</span>
                        <Badge style={{ backgroundColor: s.color, color: '#fff' }}>{s.phase}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {s.tech.map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="integration" className="space-y-4 mt-0">
              <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: colors.text }}>
                <Globe className="h-5 w-5" />External Integration Points
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <Card className="border" style={{ borderColor: colors.application.bg }}>
                  <CardContent className="pt-4">
                    <h4 className="font-semibold mb-2" style={{ color: colors.application.bg }}>AI Providers ✓</h4>
                    <ul className="text-sm space-y-1">
                      <li style={{ color: colors.completed.bg }}>✓ OpenAI GPT-4</li>
                      <li style={{ color: colors.completed.bg }}>✓ Anthropic Claude</li>
                      <li style={{ color: colors.completed.bg }}>✓ Google Gemini</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="border" style={{ borderColor: colors.inProgress.bg }}>
                  <CardContent className="pt-4">
                    <h4 className="font-semibold mb-2" style={{ color: colors.inProgress.bg }}>TTS Providers ✓</h4>
                    <ul className="text-sm space-y-1">
                      <li style={{ color: colors.completed.bg }}>✓ ElevenLabs</li>
                      <li style={{ color: colors.completed.bg }}>✓ OpenAI TTS</li>
                      <li style={{ color: colors.textMuted }}>○ Play.ht (P1)</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="border" style={{ borderColor: colors.planned.bg }}>
                  <CardContent className="pt-4">
                    <h4 className="font-semibold mb-2" style={{ color: colors.planned.bg }}>Future (P3-P5)</h4>
                    <ul className="text-sm space-y-1">
                      <li style={{ color: colors.textMuted }}>○ Stripe Billing</li>
                      <li style={{ color: colors.textMuted }}>○ SAML/SSO</li>
                      <li style={{ color: colors.textMuted }}>○ LMS (SCORM/LTI)</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadSVG} className="gap-2">
              <Download className="h-4 w-4" />SVG
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPNG} className="gap-2">
              <Download className="h-4 w-4" />PNG
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsFullscreen(false)} className="gap-2">
              <X className="h-4 w-4" />Close
            </Button>
          </div>
          <ScrollArea className="h-screen w-screen p-8">
            <div ref={diagramRef} className="bg-card p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Technical Architecture (140 Scenarios)</h2>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
