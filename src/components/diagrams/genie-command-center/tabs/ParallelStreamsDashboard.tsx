/**
 * Parallel Streams Dashboard - P3 Implementation Tracking
 * Shows Streams A, B, C running in parallel with real-time progress
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Scale, TestTube, Bot, CheckCircle2, Clock, AlertCircle, 
  ArrowRight, Users, Zap, Shield, Play, Pause, ExternalLink,
  FileText, Globe, Wallet, Eye, Server, UserX, Layers
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Stream definitions with tasks
interface StreamTask {
  id: string;
  name: string;
  category: string;
  status: 'done' | 'in-progress' | 'pending' | 'blocked';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  owner?: string;
  location?: string;
  estimate?: string;
  dependencies?: string[];
}

interface Stream {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  team: string;
  tasks: StreamTask[];
}

const PARALLEL_STREAMS: Stream[] = [
  {
    id: 'A',
    name: 'Legal & Business Ops',
    description: 'Legal, Domain, Payments - External-facing setup',
    icon: <Scale className="w-5 h-5" />,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 border-purple-500/30',
    team: 'Legal/Ops Team',
    tasks: [
      // Legal (12 items)
      { id: 'A-01', name: 'Terms of Service', category: 'Legal', status: 'pending', priority: 'Critical', location: 'public/terms.html', estimate: '2h' },
      { id: 'A-02', name: 'Privacy Policy', category: 'Legal', status: 'pending', priority: 'Critical', location: 'public/privacy.html', estimate: '2h' },
      { id: 'A-03', name: 'Cookie Consent Banner', category: 'Legal', status: 'pending', priority: 'High', location: 'src/components/common/CookieConsent.tsx', estimate: '4h' },
      { id: 'A-04', name: 'GDPR Compliance (Data Export/Delete)', category: 'Legal', status: 'pending', priority: 'High', location: 'supabase/functions/gdpr-data-export/', estimate: '8h' },
      { id: 'A-05', name: 'AI Generated Content Disclaimer', category: 'Legal', status: 'pending', priority: 'High', location: 'ContentModerationService.ts', estimate: '2h' },
      { id: 'A-06', name: 'Acceptable Use Policy', category: 'Legal', status: 'pending', priority: 'High', location: 'public/aup.html', estimate: '2h' },
      { id: 'A-07', name: 'Refund & Cancellation Policy', category: 'Legal', status: 'pending', priority: 'High', location: 'Terms + Pricing Page', estimate: '2h' },
      // Domain (9 items)
      { id: 'A-08', name: 'Primary Domain Registration', category: 'Domain', status: 'pending', priority: 'Critical', location: 'External: Domain Registrar', estimate: '1h' },
      { id: 'A-09', name: 'DNS Configuration (A, CNAME, TXT)', category: 'Domain', status: 'pending', priority: 'Critical', location: 'External: Cloudflare', estimate: '2h' },
      { id: 'A-10', name: 'Email Domain Auth (SPF, DKIM, DMARC)', category: 'Domain', status: 'pending', priority: 'High', location: 'External: DNS + Resend', estimate: '3h' },
      { id: 'A-11', name: 'WWW Redirect Configuration', category: 'Domain', status: 'pending', priority: 'High', location: 'External: DNS Provider', estimate: '1h' },
      { id: 'A-12', name: 'Subdomain Strategy (app., api., docs.)', category: 'Domain', status: 'pending', priority: 'Medium', location: 'docs/DOMAIN_STRATEGY.md', estimate: '2h' },
      // Payments (13 items)
      { id: 'A-13', name: 'Bank Account Connected for Payouts', category: 'Payments', status: 'pending', priority: 'Critical', location: 'External: Stripe → Payouts', estimate: '1h' },
      { id: 'A-14', name: 'Tax Collection Setup (Stripe Tax)', category: 'Payments', status: 'pending', priority: 'High', location: 'External: Stripe Tax Settings', estimate: '2h' },
      { id: 'A-15', name: 'Fraud Detection Rules', category: 'Payments', status: 'pending', priority: 'High', location: 'External: Stripe Radar', estimate: '2h' },
      { id: 'A-16', name: 'Chargeback Handling Process', category: 'Payments', status: 'pending', priority: 'High', location: 'docs/Ops_Runbook_Genie.md', estimate: '3h' },
      { id: 'A-17', name: 'Pricing Tier Testing (All Plans)', category: 'Payments', status: 'pending', priority: 'High', location: 'src/components/pricing/', estimate: '4h' },
      { id: 'A-18', name: 'Multi-Currency Support', category: 'Payments', status: 'pending', priority: 'Medium', location: 'External: Stripe Settings', estimate: '2h' },
    ],
  },
  {
    id: 'B',
    name: 'Engineering & QA',
    description: 'Testing, Monitoring, DevOps - Technical infrastructure',
    icon: <TestTube className="w-5 h-5" />,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 border-blue-500/30',
    team: 'Engineering/QA Team',
    tasks: [
      // Testing (7 items)
      { id: 'B-01', name: 'Unit Tests for Critical Hooks', category: 'Testing', status: 'pending', priority: 'High', location: 'src/__tests__/', estimate: '16h' },
      { id: 'B-02', name: 'E2E Tests for User Journeys', category: 'Testing', status: 'pending', priority: 'High', location: 'cypress/e2e/', estimate: '24h' },
      { id: 'B-03', name: 'API Integration Tests', category: 'Testing', status: 'pending', priority: 'High', location: 'supabase/functions/__tests__/', estimate: '12h' },
      { id: 'B-04', name: 'Load Testing (100 concurrent users)', category: 'Testing', status: 'pending', priority: 'Medium', location: 'k6 scripts', estimate: '8h' },
      { id: 'B-05', name: 'Mobile Device Testing (iOS/Android)', category: 'Testing', status: 'in-progress', priority: 'High', location: 'Manual + BrowserStack', estimate: '8h' },
      { id: 'B-06', name: 'Accessibility Testing (WCAG 2.1)', category: 'Testing', status: 'pending', priority: 'High', location: 'axe-core integration', estimate: '8h' },
      // Monitoring (7 items)
      { id: 'B-07', name: 'Error Tracking (Sentry/LogRocket)', category: 'Monitoring', status: 'pending', priority: 'Critical', location: 'src/lib/sentry.ts', estimate: '4h' },
      { id: 'B-08', name: 'Performance Monitoring (Web Vitals)', category: 'Monitoring', status: 'pending', priority: 'High', location: 'src/lib/analytics.ts', estimate: '4h' },
      { id: 'B-09', name: 'API Response Time Alerts', category: 'Monitoring', status: 'pending', priority: 'High', location: 'External: Grafana/Datadog', estimate: '4h' },
      { id: 'B-10', name: 'Uptime Monitoring (UptimeRobot)', category: 'Monitoring', status: 'pending', priority: 'Critical', location: 'External: UptimeRobot', estimate: '1h' },
      { id: 'B-11', name: 'User Analytics (Mixpanel/Amplitude)', category: 'Monitoring', status: 'pending', priority: 'High', location: 'src/lib/analytics.ts', estimate: '6h' },
      { id: 'B-12', name: 'Database Query Performance', category: 'Monitoring', status: 'pending', priority: 'Medium', location: 'Supabase Dashboard', estimate: '2h' },
      // DevOps (5 items)
      { id: 'B-13', name: 'CI/CD Pipeline Optimization', category: 'DevOps', status: 'done', priority: 'High', location: 'Lovable Auto', estimate: '0h' },
      { id: 'B-14', name: 'Staging Environment Setup', category: 'DevOps', status: 'pending', priority: 'High', location: 'Lovable Project Settings', estimate: '2h' },
      { id: 'B-15', name: 'Database Backup Verification', category: 'DevOps', status: 'done', priority: 'Critical', location: 'Supabase Auto', estimate: '0h' },
      { id: 'B-16', name: 'Rollback Procedures Documented', category: 'DevOps', status: 'pending', priority: 'High', location: 'docs/Ops_Runbook_Genie.md', estimate: '3h' },
      { id: 'B-17', name: 'Security Headers Configuration', category: 'DevOps', status: 'pending', priority: 'High', location: 'Edge function headers', estimate: '2h' },
    ],
  },
  {
    id: 'C',
    name: 'AI Safety & Content',
    description: 'AI Content Moderation, Restrictions - Safety infrastructure',
    icon: <Bot className="w-5 h-5" />,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10 border-amber-500/30',
    team: 'AI Safety Team',
    tasks: [
      // AI Content (10 items)
      { id: 'C-01', name: 'Content Moderation Service Active', category: 'AI Content', status: 'done', priority: 'Critical', location: 'ContentModerationService.ts' },
      { id: 'C-02', name: 'Profanity Filter Implementation', category: 'AI Content', status: 'done', priority: 'High', location: 'ContentModerationService.ts' },
      { id: 'C-03', name: 'Content Safety Scoring', category: 'AI Content', status: 'done', priority: 'High', location: 'ContentModerationService.ts' },
      { id: 'C-04', name: 'Model Output Logging (Audit Trail)', category: 'AI Content', status: 'done', priority: 'High', location: 'ai_workflow_traces table' },
      { id: 'C-05', name: 'AI-Generated Content Watermarking', category: 'AI Content', status: 'pending', priority: 'Medium', location: 'Export pipeline', estimate: '8h' },
      { id: 'C-06', name: 'Deepfake Detection (Voice Cloning)', category: 'AI Content', status: 'pending', priority: 'High', location: 'voice-clone-processor', estimate: '16h' },
      { id: 'C-07', name: 'Bias Detection in AI Outputs', category: 'AI Content', status: 'pending', priority: 'Medium', location: 'AI processor prompts', estimate: '12h' },
      { id: 'C-08', name: 'User-Reported Content Workflow', category: 'AI Content', status: 'pending', priority: 'High', location: 'New edge function', estimate: '8h' },
      { id: 'C-09', name: 'AI Transparency Labels', category: 'AI Content', status: 'pending', priority: 'Medium', location: 'Export metadata', estimate: '4h' },
      { id: 'C-10', name: 'AI Ethics Policy Published', category: 'AI Content', status: 'pending', priority: 'Medium', location: 'public/ai-ethics.html', estimate: '3h' },
      // Restrictions (10 items)
      { id: 'C-11', name: 'Adult Content Blocking', category: 'Restrictions', status: 'done', priority: 'Critical', location: 'ContentModerationService.ts' },
      { id: 'C-12', name: 'Violent Content Restrictions', category: 'Restrictions', status: 'done', priority: 'Critical', location: 'ContentModerationService.ts' },
      { id: 'C-13', name: 'Hate Speech Detection', category: 'Restrictions', status: 'done', priority: 'Critical', location: 'ContentModerationService.ts' },
      { id: 'C-14', name: 'Medical Content Warnings', category: 'Restrictions', status: 'done', priority: 'High', location: 'Healthcare segment' },
      { id: 'C-15', name: 'Financial Advice Disclaimers', category: 'Restrictions', status: 'done', priority: 'High', location: 'Content disclaimers' },
      { id: 'C-16', name: 'Legal Advice Restrictions', category: 'Restrictions', status: 'done', priority: 'High', location: 'Content disclaimers' },
      { id: 'C-17', name: 'Minimum Age Requirement (13+)', category: 'Restrictions', status: 'pending', priority: 'High', location: 'Registration flow', estimate: '4h' },
      { id: 'C-18', name: 'Age Verification UI (if needed)', category: 'Restrictions', status: 'pending', priority: 'Medium', location: 'Auth components', estimate: '6h' },
      { id: 'C-19', name: 'Geographic Restrictions (Sanctions)', category: 'Restrictions', status: 'pending', priority: 'Medium', location: 'Edge function middleware', estimate: '6h' },
      { id: 'C-20', name: 'Export Control Compliance', category: 'Restrictions', status: 'pending', priority: 'Low', location: 'Legal review', estimate: '4h' },
    ],
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'done': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    case 'in-progress': return <Clock className="w-4 h-4 text-amber-500" />;
    case 'pending': return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    case 'blocked': return <AlertCircle className="w-4 h-4 text-destructive" />;
    default: return <AlertCircle className="w-4 h-4" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Critical': return 'bg-red-500/10 text-red-600 border-red-500/30';
    case 'High': return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
    case 'Medium': return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
    default: return 'bg-muted text-muted-foreground';
  }
};

const StreamCard: React.FC<{ stream: Stream; expanded: boolean; onToggle: () => void }> = ({ 
  stream, expanded, onToggle 
}) => {
  const done = stream.tasks.filter(t => t.status === 'done').length;
  const inProgress = stream.tasks.filter(t => t.status === 'in-progress').length;
  const pending = stream.tasks.filter(t => t.status === 'pending').length;
  const total = stream.tasks.length;
  const progress = Math.round((done / total) * 100);
  
  // Group tasks by category
  const tasksByCategory = stream.tasks.reduce((acc, task) => {
    if (!acc[task.category]) acc[task.category] = [];
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, StreamTask[]>);

  return (
    <Card className={`${stream.bgColor} border`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stream.color} bg-background`}>
              {stream.icon}
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Stream {stream.id}: {stream.name}
                {progress === 100 && <Badge className="bg-green-500">Complete</Badge>}
              </CardTitle>
              <CardDescription>{stream.description}</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{progress}%</div>
            <div className="text-xs text-muted-foreground">{done}/{total} tasks</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-3">
          <Badge variant="outline" className="gap-1">
            <Users className="w-3 h-3" /> {stream.team}
          </Badge>
          <div className="flex gap-2 text-xs">
            <span className="text-green-600">✓ {done}</span>
            <span className="text-amber-500">⟳ {inProgress}</span>
            <span className="text-muted-foreground">○ {pending}</span>
          </div>
        </div>
        
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>
      
      <Collapsible open={expanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full">
            {expanded ? 'Hide Tasks' : 'Show Tasks'} ({total})
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <ScrollArea className="max-h-[400px]">
              {Object.entries(tasksByCategory).map(([category, tasks]) => {
                const catDone = tasks.filter(t => t.status === 'done').length;
                return (
                  <div key={category} className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{category}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {catDone}/{tasks.length}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {tasks.map(task => (
                        <div 
                          key={task.id}
                          className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                            task.status === 'done' ? 'bg-green-500/5' : 'bg-background/50'
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            {getStatusIcon(task.status)}
                            <span className={task.status === 'done' ? 'line-through text-muted-foreground' : ''}>
                              {task.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {task.estimate && (
                              <span className="text-muted-foreground">{task.estimate}</span>
                            )}
                            <Badge variant="outline" className={`text-[10px] ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </ScrollArea>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export const ParallelStreamsDashboard: React.FC = () => {
  const [expandedStreams, setExpandedStreams] = useState<Record<string, boolean>>({
    A: true, B: true, C: true
  });
  
  // Calculate totals
  const allTasks = PARALLEL_STREAMS.flatMap(s => s.tasks);
  const totalDone = allTasks.filter(t => t.status === 'done').length;
  const totalInProgress = allTasks.filter(t => t.status === 'in-progress').length;
  const totalPending = allTasks.filter(t => t.status === 'pending').length;
  const totalTasks = allTasks.length;
  const overallProgress = Math.round((totalDone / totalTasks) * 100);
  
  // Estimate total hours
  const totalHours = allTasks
    .filter(t => t.status !== 'done' && t.estimate)
    .reduce((sum, t) => sum + parseInt(t.estimate || '0'), 0);

  const toggleStream = (id: string) => {
    setExpandedStreams(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Overview */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Parallel Implementation Streams</h2>
              <p className="text-muted-foreground">3 streams running concurrently for P3 go-live</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{totalDone}</div>
                <div className="text-xs text-muted-foreground">Complete</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-500">{totalInProgress}</div>
                <div className="text-xs text-muted-foreground">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-muted-foreground">{totalPending}</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{totalHours}h</div>
                <div className="text-xs text-muted-foreground">Est. Remaining</div>
              </div>
            </div>
          </div>
          <Progress value={overallProgress} className="h-3 mt-4" />
          <div className="flex justify-between mt-2 text-sm">
            <span>Overall Progress</span>
            <span className="font-medium">{overallProgress}% ({totalDone}/{totalTasks})</span>
          </div>
        </CardContent>
      </Card>

      {/* Parallel Streams Visualization */}
      <div className="grid grid-cols-1 gap-1">
        <div className="flex items-center justify-center gap-2 py-3 bg-muted/30 rounded-lg">
          <Layers className="w-5 h-5 text-primary" />
          <span className="font-medium">Parallel Execution</span>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <Badge variant="outline">3 Independent Streams</Badge>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <Badge className="bg-green-500">Go-Live Ready</Badge>
        </div>
      </div>

      {/* Stream Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {PARALLEL_STREAMS.map(stream => (
          <StreamCard 
            key={stream.id} 
            stream={stream} 
            expanded={expandedStreams[stream.id]}
            onToggle={() => toggleStream(stream.id)}
          />
        ))}
      </div>

      {/* Critical Path Alert */}
      {allTasks.some(t => t.priority === 'Critical' && t.status === 'pending') && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <div>
                <h4 className="font-medium text-destructive">Critical Blockers</h4>
                <p className="text-sm text-muted-foreground">
                  {allTasks.filter(t => t.priority === 'Critical' && t.status === 'pending').length} critical items must be completed before go-live
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {allTasks
                .filter(t => t.priority === 'Critical' && t.status === 'pending')
                .map(t => (
                  <Badge key={t.id} variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                    {t.name}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default ParallelStreamsDashboard;
