/**
 * Genie Data Architecture Diagram
 * 180+ Tables • RLS • Storage • ER Relationships
 * Updated: 2026-01-25
 */

import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Maximize2, X, Database, Shield, Layers, Table, Key, Link2, FileText, Archive } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

const coreEntities = [
  { name: 'agents', description: 'AI Agent configurations', fields: ['id', 'name', 'model_provider', 'template_id', 'created_by'], relationships: ['→ agent_templates', '→ agent_conversations'], rowCount: '~1K', status: 'active' },
  { name: 'agent_conversations', description: 'Chat sessions with agents', fields: ['id', 'agent_id', 'user_id', 'session_id', 'conversation_data'], relationships: ['← agents', '→ agent_compliance_monitoring'], rowCount: '~50K', status: 'active' },
  { name: 'agent_templates', description: 'Reusable agent blueprints', fields: ['id', 'name', 'template_type', 'journey_stages'], relationships: ['← agents', '→ agent_template_versions'], rowCount: '~100', status: 'active' },
  { name: 'universal_knowledge_base', description: 'RAG knowledge documents', fields: ['id', 'title', 'content', 'embedding', 'metadata'], relationships: ['← agent_knowledge_bases'], rowCount: '~10K', status: 'active' },
  { name: 'genie_studio_users', description: 'Genie-specific user profiles', fields: ['id', 'user_id', 'display_name', 'subscription_tier'], relationships: ['← auth.users', '→ genie_studio_teams'], rowCount: '~5K', status: 'active' },
  { name: 'subscriptions', description: '6-tier subscription data', fields: ['id', 'user_id', 'tier', 'stripe_subscription_id', 'status'], relationships: ['← profiles', '← stripe_customers'], rowCount: '~2K', status: 'active' },
];

const mediaEntities = [
  { name: 'scripts', description: 'Content scripts & versions', fields: ['id', 'title', 'content', 'version', 'user_id'], rowCount: '~15K', status: 'active' },
  { name: 'tts_outputs', description: 'Generated audio files', fields: ['id', 'script_id', 'voice_id', 'audio_url', 'duration_ms'], rowCount: '~25K', status: 'active' },
  { name: 'media_assets', description: 'Videos, images, audio files', fields: ['id', 'type', 'file_url', 'thumbnail_url', 'metadata'], rowCount: '~50K', status: 'active' },
  { name: 'presentation_versions', description: 'Deck generation history', fields: ['id', 'presentation_id', 'version', 'slides_json'], rowCount: '~20K', status: 'active' },
];

const pipelineEntities = [
  { name: 'pipeline_executions', description: '119 pipeline run history', fields: ['id', 'pipeline_type', 'input_data', 'output_data', 'status'], rowCount: '~100K', status: 'active' },
  { name: 'ai_credit_transactions', description: 'Credit usage tracking', fields: ['id', 'user_id', 'credits', 'provider', 'operation'], rowCount: '~200K', status: 'active' },
  { name: 'genie_cast_content', description: 'Genie Cast marketing content', fields: ['id', 'product', 'platform', 'region', 'status'], rowCount: '~10K', status: 'active' },
  { name: 'genie_cast_schedules', description: 'Genie Cast scheduling', fields: ['id', 'content_id', 'scheduled_at', 'timezone', 'status'], rowCount: '~5K', status: 'active' },
  { name: 'genie_deployments', description: 'Agent deployments', fields: ['id', 'agent_id', 'channel', 'config', 'status'], rowCount: '~500', status: 'active' },
];

const securityEntities = [
  { name: 'access_requests', description: 'User access request logs', status: 'active' },
  { name: 'agent_audit_logs', description: 'Agent activity audit trail', status: 'active' },
  { name: 'agent_compliance_monitoring', description: 'GDPR/HIPAA compliance checks', status: 'active' },
  { name: 'agent_permissions', description: 'Agent RBAC control', status: 'active' },
];

const storageBuckets = [
  { name: 'avatars', description: 'User profile images', public: true, size: '~100MB' },
  { name: 'media', description: 'Video/audio content', public: false, size: '~50GB' },
  { name: 'documents', description: 'Uploaded documents', public: false, size: '~5GB' },
  { name: 'thumbnails', description: 'Generated thumbnails', public: true, size: '~500MB' },
  { name: 'exports', description: 'Export downloads', public: false, size: '~10GB' },
  { name: 'voice-samples', description: 'Voice clone samples', public: false, size: '~1GB' },
];

export const GenieDataArchitectureDiagram: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);

  const handleDownloadPNG = async () => {
    if (!diagramRef.current) return;
    try {
      toast.info('Generating PNG...');
      const canvas = await html2canvas(diagramRef.current, { backgroundColor: '#ffffff', scale: 3, useCORS: true, logging: false });
      const link = document.createElement('a');
      link.download = 'genie-data-architecture.png';
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      toast.success('PNG downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download PNG');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">✓ Active</Badge>;
      case 'partial': return <Badge className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">◐ Partial</Badge>;
      default: return <Badge className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">○ Planned</Badge>;
    }
  };

  const content = (
    <div ref={diagramRef} className="p-6 bg-background rounded-xl space-y-6 border border-border">
      <div className="text-center border-b border-border pb-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center justify-center gap-3">
          <Database className="h-8 w-8 text-blue-500" />
          Genie Data Architecture
        </h2>
        <p className="text-muted-foreground mt-2">PostgreSQL • 180+ Tables • 100+ RLS Policies • 6 Storage Buckets</p>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-2 border-blue-200 dark:border-blue-800/40">
        <CardContent className="pt-4">
          <div className="grid grid-cols-6 gap-4 text-center">
            <div><div className="text-2xl font-bold text-blue-600 dark:text-blue-400">180+</div><div className="text-xs text-muted-foreground">Tables</div></div>
            <div><div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">100+</div><div className="text-xs text-muted-foreground">RLS Policies</div></div>
            <div><div className="text-2xl font-bold text-purple-600 dark:text-purple-400">6</div><div className="text-xs text-muted-foreground">Storage Buckets</div></div>
            <div><div className="text-2xl font-bold text-orange-600 dark:text-orange-400">50+</div><div className="text-xs text-muted-foreground">DB Functions</div></div>
            <div><div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">30+</div><div className="text-xs text-muted-foreground">Triggers</div></div>
            <div><div className="text-2xl font-bold text-pink-600 dark:text-pink-400">~500K</div><div className="text-xs text-muted-foreground">Total Rows</div></div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-violet-200 dark:border-violet-800/40 bg-violet-50/50 dark:bg-violet-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-violet-700 dark:text-violet-400 flex items-center gap-2">
            <Table className="h-5 w-5" />
            Core Entities (ER Diagram)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {coreEntities.map((entity) => (
              <div key={entity.name} className="bg-background rounded-lg p-3 border-2 border-border shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <code className="text-violet-600 dark:text-violet-400 text-sm font-bold">{entity.name}</code>
                  {getStatusBadge(entity.status)}
                </div>
                <p className="text-muted-foreground text-xs mb-2">{entity.description}</p>
                <div className="flex items-center gap-1 text-xs mb-1">
                  <Key className="h-3 w-3 text-amber-500" />
                  <span className="text-muted-foreground">{entity.fields.slice(0, 3).join(', ')}...</span>
                </div>
                <Badge variant="secondary" className="text-xs">{entity.rowCount} rows</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-2 border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Media Entities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mediaEntities.map((e) => (
                <div key={e.name} className="bg-background rounded p-2 border border-border flex justify-between items-center">
                  <code className="text-emerald-600 text-xs font-bold">{e.name}</code>
                  <Badge variant="secondary" className="text-xs">{e.rowCount}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 dark:border-orange-800/40 bg-orange-50/50 dark:bg-orange-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-orange-700 dark:text-orange-400 flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Pipeline Entities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pipelineEntities.map((e) => (
                <div key={e.name} className="bg-background rounded p-2 border border-border flex justify-between items-center">
                  <code className="text-orange-600 text-xs font-bold">{e.name}</code>
                  <Badge variant="secondary" className="text-xs">{e.rowCount}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-cyan-200 dark:border-cyan-800/40 bg-cyan-50/50 dark:bg-cyan-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-cyan-700 dark:text-cyan-400 flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Supabase Storage Buckets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-3">
            {storageBuckets.map((bucket) => (
              <div key={bucket.name} className="bg-background rounded-lg p-3 border-2 border-border text-center shadow-sm">
                <Archive className={`h-5 w-5 mx-auto mb-1 ${bucket.public ? 'text-emerald-500' : 'text-orange-500'}`} />
                <code className="text-cyan-600 text-xs font-bold">{bucket.name}</code>
                <p className="text-muted-foreground text-xs mt-1">{bucket.size}</p>
                <Badge variant={bucket.public ? 'default' : 'secondary'} className="text-xs mt-1">
                  {bucket.public ? 'Public' : 'Private'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background overflow-auto">
        <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
          <h2 className="font-semibold">Genie Data Architecture</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadPNG}><Download className="h-4 w-4 mr-2" />Download</Button>
            <Button variant="outline" size="sm" onClick={() => setIsFullscreen(false)}><X className="h-4 w-4 mr-2" />Close</Button>
          </div>
        </div>
        <div className="p-8 flex justify-center"><div className="max-w-7xl w-full">{content}</div></div>
      </div>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2"><Database className="h-5 w-5 text-blue-500" />Data Architecture</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(true)}><Maximize2 className="h-4 w-4" /></Button>
          <Button variant="default" size="sm" onClick={handleDownloadPNG}><Download className="h-4 w-4" /></Button>
        </div>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
};

export default GenieDataArchitectureDiagram;
