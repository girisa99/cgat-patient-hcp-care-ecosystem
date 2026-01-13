/**
 * Genie Studio P0-P5 Stage Gate Dashboard
 * Comprehensive production readiness assessment across all phases
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronRight,
  Shield,
  Database,
  Server,
  Key,
  Bot,
  Zap,
  Target,
  Rocket,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StageGateItem {
  id: string;
  name: string;
  status: 'complete' | 'in_progress' | 'pending' | 'blocked';
  description: string;
  owner?: string;
  notes?: string;
}

interface Phase {
  id: string;
  name: string;
  description: string;
  status: 'complete' | 'in_progress' | 'pending';
  completionPercent: number;
  items: StageGateItem[];
  targetWeek: string;
}

// Comprehensive P0-P5 Phase Data
const phases: Phase[] = [
  {
    id: 'p0',
    name: 'P0: Foundation & Core',
    description: 'Infrastructure, authentication, and core platform setup',
    status: 'complete',
    completionPercent: 100,
    targetWeek: 'Week 1-4',
    items: [
      { id: 'p0-1', name: 'Supabase Database Setup', status: 'complete', description: 'Core tables, auth, RLS policies' },
      { id: 'p0-2', name: 'Authentication System', status: 'complete', description: 'Email, OAuth, SSO foundation' },
      { id: 'p0-3', name: 'Base UI Components', status: 'complete', description: 'Design system, shadcn components' },
      { id: 'p0-4', name: 'Navigation & Routing', status: 'complete', description: 'App layout, route structure' },
      { id: 'p0-5', name: 'Edge Functions Setup', status: 'complete', description: 'Base edge function architecture' },
      { id: 'p0-6', name: 'Environment Configuration', status: 'complete', description: 'Secrets, API keys management' },
    ]
  },
  {
    id: 'p1',
    name: 'P1: Core Features',
    description: 'Essential product features and agent framework',
    status: 'complete',
    completionPercent: 100,
    targetWeek: 'Week 5-8',
    items: [
      { id: 'p1-1', name: 'Agent Framework', status: 'complete', description: 'Base agent types, configurations' },
      { id: 'p1-2', name: 'Genie Mind Core', status: 'complete', description: 'AI pre-production intelligence' },
      { id: 'p1-3', name: 'Genie Vibe Core', status: 'complete', description: 'Recording, TTS, video production' },
      { id: 'p1-4', name: 'Genie Spark Core', status: 'complete', description: 'Content pipeline, templates' },
      { id: 'p1-5', name: 'Knowledge Base', status: 'complete', description: 'RAG, document processing' },
      { id: 'p1-6', name: 'Script Editor', status: 'complete', description: 'Writing, AI enhancement' },
      { id: 'p1-7', name: 'Voice Generation', status: 'complete', description: 'ElevenLabs, OpenAI TTS' },
      { id: 'p1-8', name: 'Music Studio', status: 'complete', description: 'AI music generation' },
    ]
  },
  {
    id: 'p2',
    name: 'P2: Advanced Features',
    description: 'Enhanced capabilities and integrations',
    status: 'complete',
    completionPercent: 100,
    targetWeek: 'Week 9-12',
    items: [
      { id: 'p2-1', name: 'Multi-Agent Orchestration', status: 'complete', description: 'Agent teams, workflows' },
      { id: 'p2-2', name: 'MCP Integration', status: 'complete', description: 'Model Context Protocol servers' },
      { id: 'p2-3', name: 'Production Hub', status: 'complete', description: 'Kanban, production pipeline' },
      { id: 'p2-4', name: 'Session Management', status: 'complete', description: 'Calendar, invites, reminders' },
      { id: 'p2-5', name: 'Conversation Engines', status: 'complete', description: 'Multi-modal conversations' },
      { id: 'p2-6', name: 'Healthcare Specialization', status: 'complete', description: 'NPI verification, compliance' },
      { id: 'p2-7', name: 'Analytics Foundation', status: 'complete', description: 'Usage tracking, metrics' },
      { id: 'p2-8', name: 'Webhook System', status: 'complete', description: 'External integrations' },
    ]
  },
  {
    id: 'p3',
    name: 'P3: Enterprise & Scale',
    description: 'Enterprise features, collaboration, and marketplace',
    status: 'complete',
    completionPercent: 100,
    targetWeek: 'Week 13-16',
    items: [
      { id: 'p3-1', name: 'Legal Review Gate', status: 'complete', description: 'Compliance review workflow', owner: 'Backend' },
      { id: 'p3-2', name: 'Bulk Operations', status: 'complete', description: 'Batch processing, bulk uploads', owner: 'Backend' },
      { id: 'p3-3', name: 'Workspace Collaboration', status: 'complete', description: 'Teams, invitations, activity', owner: 'Full Stack' },
      { id: 'p3-4', name: 'Advanced Analytics Dashboard', status: 'complete', description: 'Enterprise analytics, reporting', owner: 'Frontend' },
      { id: 'p3-5', name: 'Template Marketplace', status: 'complete', description: 'Template store, reviews, installs', owner: 'Full Stack' },
      { id: 'p3-6', name: 'P3 Database Migration', status: 'complete', description: '11 new tables created', owner: 'DBA' },
      { id: 'p3-7', name: 'P3 Edge Functions', status: 'complete', description: '5 P3 functions deployed', owner: 'Backend' },
      { id: 'p3-8', name: 'P3 Documentation', status: 'complete', description: 'Architecture docs updated', owner: 'Tech Lead' },
    ]
  },
  {
    id: 'p4',
    name: 'P4: Polish & Optimization',
    description: 'Performance optimization, testing, and polish',
    status: 'in_progress',
    completionPercent: 45,
    targetWeek: 'Week 17-20',
    items: [
      { id: 'p4-1', name: 'Integration Testing', status: 'in_progress', description: 'End-to-end test suite', owner: 'QA' },
      { id: 'p4-2', name: 'Performance Optimization', status: 'in_progress', description: 'Query optimization, caching', owner: 'Backend' },
      { id: 'p4-3', name: 'Security Audit', status: 'pending', description: 'Penetration testing, RLS review', owner: 'Security' },
      { id: 'p4-4', name: 'UI/UX Polish', status: 'in_progress', description: 'Animation, accessibility', owner: 'Frontend' },
      { id: 'p4-5', name: 'Mobile Responsiveness', status: 'complete', description: 'Mobile-first experience', owner: 'Frontend' },
      { id: 'p4-6', name: 'Error Handling', status: 'complete', description: 'Global error boundaries', owner: 'Full Stack' },
      { id: 'p4-7', name: 'Logging & Monitoring', status: 'pending', description: 'Observability setup', owner: 'DevOps' },
      { id: 'p4-8', name: 'Load Testing', status: 'pending', description: 'Stress testing, benchmarks', owner: 'QA' },
    ]
  },
  {
    id: 'p5',
    name: 'P5: Production Launch',
    description: 'Go-live preparation and deployment',
    status: 'pending',
    completionPercent: 15,
    targetWeek: 'Week 21-24',
    items: [
      { id: 'p5-1', name: 'Production Environment', status: 'in_progress', description: 'Production Supabase setup', owner: 'DevOps' },
      { id: 'p5-2', name: 'Domain & SSL', status: 'complete', description: 'Custom domain, certificates', owner: 'DevOps' },
      { id: 'p5-3', name: 'CDN Configuration', status: 'pending', description: 'Asset delivery optimization', owner: 'DevOps' },
      { id: 'p5-4', name: 'Backup & Recovery', status: 'pending', description: 'Database backups, DR plan', owner: 'DBA' },
      { id: 'p5-5', name: 'User Documentation', status: 'pending', description: 'Help docs, tutorials', owner: 'Tech Writing' },
      { id: 'p5-6', name: 'Admin Training', status: 'pending', description: 'Admin onboarding materials', owner: 'Training' },
      { id: 'p5-7', name: 'Go-Live Checklist', status: 'pending', description: 'Final verification', owner: 'Project Lead' },
      { id: 'p5-8', name: 'Launch Monitoring', status: 'pending', description: '24/7 launch support', owner: 'Support' },
    ]
  }
];

// API Keys Configuration Status
const apiKeysStatus = [
  { name: 'LOVABLE_API_KEY', status: 'configured', usedBy: 'All AI Features', critical: true },
  { name: 'OPENAI_API_KEY', status: 'configured', usedBy: 'GPT Models, TTS', critical: true },
  { name: 'ANTHROPIC_API_KEY', status: 'configured', usedBy: 'Claude Models', critical: true },
  { name: 'CLAUDE_API_KEY', status: 'configured', usedBy: 'Conversations', critical: true },
  { name: 'ELEVENLABS_API_KEY', status: 'configured', usedBy: 'Voice Synthesis', critical: true },
  { name: 'GEMINI_API_KEY', status: 'configured', usedBy: 'Google Gemini', critical: false },
  { name: 'GOOGLE_API_KEY', status: 'configured', usedBy: 'TTS, Search', critical: false },
  { name: 'REPLICATE_API_TOKEN', status: 'configured', usedBy: 'Media Generation', critical: false },
  { name: 'HUGGING_FACE_ACCESS_TOKEN', status: 'configured', usedBy: 'ML Models', critical: false },
  { name: 'TWILIO_ACCOUNT_SID', status: 'configured', usedBy: 'SMS/Voice', critical: false },
  { name: 'TWILIO_AUTH_TOKEN', status: 'configured', usedBy: 'SMS/Voice', critical: false },
  { name: 'RESEND_API_KEY', status: 'configured', usedBy: 'Email', critical: false },
  { name: 'SENDGRID_API_KEY', status: 'configured', usedBy: 'Bulk Email', critical: false },
  { name: 'STRIPE_SECRET_KEY', status: 'configured', usedBy: 'Payments', critical: true },
  { name: 'DOCUSIGN_API_KEY', status: 'configured', usedBy: 'E-Signatures', critical: false },
  { name: 'ARIZE_API_KEY', status: 'configured', usedBy: 'AI Observability', critical: false },
  { name: 'LANGWATCH_API_KEY', status: 'configured', usedBy: 'LLM Monitoring', critical: false },
  { name: 'NPPES_API_KEY', status: 'optional', usedBy: 'NPI Verification', critical: false, note: 'Free API, rate-limited' },
  { name: 'YOUTUBE_API_KEY', status: 'optional', usedBy: 'Publishing Agent', critical: false },
  { name: 'AXE_API_KEY', status: 'optional', usedBy: 'Accessibility', critical: false },
];

// Agent Deployment Status
const agentDeployments = [
  { name: 'NPI Verification Agent', type: 'mcp-stepwise', status: 'active', dependencies: 'NPPES API (free)', ready: true },
  { name: 'Patient Enrollment Agent', type: 'mcp-stepwise', status: 'active', dependencies: 'Internal only', ready: true },
  { name: 'Conversational Enrollment', type: 'conversational', status: 'active', dependencies: 'Lovable AI', ready: true },
  { name: 'Structured Enrollment', type: 'structured', status: 'active', dependencies: 'Internal', ready: true },
  { name: 'Treatment Center Agent', type: 'mcp-stepwise', status: 'active', dependencies: 'License APIs', ready: true },
  { name: 'Manufacturing Agent', type: 'mcp-stepwise', status: 'active', dependencies: 'Compliance APIs', ready: true },
  { name: 'Distribution Agent', type: 'workflow', status: 'active', dependencies: 'Social APIs', ready: true },
  { name: 'Voice Director Agent', type: 'ai', status: 'active', dependencies: 'ElevenLabs', ready: true },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'complete':
    case 'configured':
    case 'active':
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case 'in_progress':
      return <Clock className="h-4 w-4 text-amber-500" />;
    case 'pending':
    case 'optional':
      return <AlertTriangle className="h-4 w-4 text-slate-400" />;
    case 'blocked':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-slate-500" />;
  }
};

const getStatusBadge = (status: string) => {
  const variants: Record<string, string> = {
    complete: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    configured: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    in_progress: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    pending: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    optional: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    blocked: 'bg-red-500/10 text-red-400 border-red-500/30',
  };
  return variants[status] || variants.pending;
};

export const GenieStageGateDashboard: React.FC = () => {
  const [expandedPhases, setExpandedPhases] = useState<string[]>(['p3', 'p4']);
  const [activeView, setActiveView] = useState<'phases' | 'apis' | 'agents'>('phases');

  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev =>
      prev.includes(phaseId)
        ? prev.filter(id => id !== phaseId)
        : [...prev, phaseId]
    );
  };

  // Calculate overall progress
  const totalItems = phases.reduce((acc, p) => acc + p.items.length, 0);
  const completedItems = phases.reduce(
    (acc, p) => acc + p.items.filter(i => i.status === 'complete').length,
    0
  );
  const overallProgress = Math.round((completedItems / totalItems) * 100);

  // Critical API keys count
  const criticalAPIs = apiKeysStatus.filter(a => a.critical);
  const configuredCritical = criticalAPIs.filter(a => a.status === 'configured').length;

  // Ready agents count
  const readyAgents = agentDeployments.filter(a => a.ready).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="h-6 w-6 text-violet-400" />
            Production Readiness Stage Gates
          </h2>
          <p className="text-slate-400 text-sm">
            P0-P5 implementation tracking and go-live requirements
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-emerald-300 border-emerald-500/30 px-3 py-1">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {overallProgress}% Complete
          </Badge>
          <Badge variant="outline" className="text-blue-300 border-blue-500/30 px-3 py-1">
            <Key className="h-3 w-3 mr-1" />
            {configuredCritical}/{criticalAPIs.length} Critical APIs
          </Badge>
          <Badge variant="outline" className="text-purple-300 border-purple-500/30 px-3 py-1">
            <Bot className="h-3 w-3 mr-1" />
            {readyAgents}/{agentDeployments.length} Agents Ready
          </Badge>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-300">Overall Production Readiness</span>
            <span className="text-sm font-medium text-white">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-3" />
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span>P0 Foundation</span>
            <span>P1 Core</span>
            <span>P2 Advanced</span>
            <span>P3 Enterprise</span>
            <span>P4 Polish</span>
            <span>P5 Launch</span>
          </div>
        </CardContent>
      </Card>

      {/* View Tabs */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="w-full">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="phases" className="data-[state=active]:bg-violet-600">
            <Rocket className="h-4 w-4 mr-2" />
            Phase Tracking
          </TabsTrigger>
          <TabsTrigger value="apis" className="data-[state=active]:bg-violet-600">
            <Key className="h-4 w-4 mr-2" />
            API Dependencies
          </TabsTrigger>
          <TabsTrigger value="agents" className="data-[state=active]:bg-violet-600">
            <Bot className="h-4 w-4 mr-2" />
            Agent Deployments
          </TabsTrigger>
        </TabsList>

        {/* Phases View */}
        <TabsContent value="phases" className="mt-4">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {phases.map((phase) => (
                <Collapsible
                  key={phase.id}
                  open={expandedPhases.includes(phase.id)}
                  onOpenChange={() => togglePhase(phase.id)}
                >
                  <Card className={cn(
                    "bg-slate-900/50 border-slate-700/50 transition-all",
                    phase.status === 'complete' && "border-l-4 border-l-emerald-500",
                    phase.status === 'in_progress' && "border-l-4 border-l-amber-500",
                    phase.status === 'pending' && "border-l-4 border-l-slate-500"
                  )}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-slate-800/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {expandedPhases.includes(phase.id) ? (
                              <ChevronDown className="h-5 w-5 text-slate-400" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-slate-400" />
                            )}
                            <div>
                              <CardTitle className="text-lg text-white flex items-center gap-2">
                                {phase.name}
                                <Badge variant="outline" className={getStatusBadge(phase.status)}>
                                  {phase.status === 'complete' ? 'Complete' : 
                                   phase.status === 'in_progress' ? 'In Progress' : 'Pending'}
                                </Badge>
                              </CardTitle>
                              <p className="text-sm text-slate-400 mt-1">{phase.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-2xl font-bold text-white">{phase.completionPercent}%</div>
                              <div className="text-xs text-slate-500">{phase.targetWeek}</div>
                            </div>
                          </div>
                        </div>
                        <Progress value={phase.completionPercent} className="h-2 mt-3" />
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {phase.items.map((item) => (
                            <div
                              key={item.id}
                              className={cn(
                                "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                                item.status === 'complete' && "bg-emerald-500/5 border-emerald-500/20",
                                item.status === 'in_progress' && "bg-amber-500/5 border-amber-500/20",
                                item.status === 'pending' && "bg-slate-500/5 border-slate-500/20",
                                item.status === 'blocked' && "bg-red-500/5 border-red-500/20"
                              )}
                            >
                              {getStatusIcon(item.status)}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-white text-sm">{item.name}</div>
                                <div className="text-xs text-slate-400">{item.description}</div>
                                {item.owner && (
                                  <div className="text-xs text-slate-500 mt-1">Owner: {item.owner}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* APIs View */}
        <TabsContent value="apis" className="mt-4">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Key className="h-5 w-5 text-amber-400" />
                API Keys & External Dependencies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {apiKeysStatus.map((api) => (
                    <div
                      key={api.name}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border",
                        api.status === 'configured' && "bg-emerald-500/5 border-emerald-500/20",
                        api.status === 'optional' && "bg-slate-500/5 border-slate-500/20"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(api.status)}
                        <div>
                          <div className="font-mono text-sm text-white flex items-center gap-2">
                            {api.name}
                            {api.critical && (
                              <Badge variant="outline" className="text-red-400 border-red-500/30 text-[10px]">
                                CRITICAL
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">Used by: {api.usedBy}</div>
                          {api.note && <div className="text-xs text-slate-500 italic">{api.note}</div>}
                        </div>
                      </div>
                      <Badge variant="outline" className={getStatusBadge(api.status)}>
                        {api.status === 'configured' ? 'Configured' : 'Optional'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agents View */}
        <TabsContent value="agents" className="mt-4">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-400" />
                Deployed Agents Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {agentDeployments.map((agent) => (
                    <div
                      key={agent.name}
                      className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center",
                          agent.ready ? "bg-emerald-500/20" : "bg-amber-500/20"
                        )}>
                          <Bot className={cn(
                            "h-5 w-5",
                            agent.ready ? "text-emerald-400" : "text-amber-400"
                          )} />
                        </div>
                        <div>
                          <div className="font-medium text-white">{agent.name}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-2">
                            <Badge variant="outline" className="text-xs text-slate-300">
                              {agent.type}
                            </Badge>
                            <span>•</span>
                            <span>{agent.dependencies}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(agent.status)}
                        <Badge variant="outline" className={getStatusBadge(agent.status)}>
                          {agent.status === 'active' ? 'Active' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Go-Live Blockers Summary */}
      <Card className="bg-gradient-to-r from-slate-900/80 to-violet-900/30 border-violet-500/30">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-violet-400" />
            Go-Live Readiness Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <div className="text-3xl font-bold text-emerald-400">4</div>
              <div className="text-xs text-slate-400">Phases Complete</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <div className="text-3xl font-bold text-amber-400">1</div>
              <div className="text-xs text-slate-400">In Progress</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-slate-500/10 border border-slate-500/30">
              <div className="text-3xl font-bold text-slate-400">1</div>
              <div className="text-xs text-slate-400">Pending</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="text-3xl font-bold text-red-400">0</div>
              <div className="text-xs text-slate-400">Blocked</div>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span className="text-white font-medium">Pending for Go-Live:</span>
            </div>
            <ul className="mt-2 text-xs text-slate-400 space-y-1 ml-6">
              <li>• Security Audit (P4) - Penetration testing required</li>
              <li>• Load Testing (P4) - Stress test benchmarks</li>
              <li>• Logging & Monitoring (P4) - Observability setup</li>
              <li>• Backup & Recovery (P5) - DR plan implementation</li>
              <li>• User Documentation (P5) - Help docs completion</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GenieStageGateDashboard;
