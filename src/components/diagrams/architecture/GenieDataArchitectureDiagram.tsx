/**
 * Genie Data Architecture Diagram
 * Database Schema, ER Diagram, and Data Flow
 */

import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Maximize2, X, Database, Shield, Layers, Table, Key, Link2, FileText, Archive } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

const coreEntities = [
  {
    name: 'agents',
    description: 'AI Agent configurations',
    fields: ['id', 'name', 'description', 'model_provider', 'template_id', 'created_by'],
    relationships: ['→ agent_templates', '→ agent_conversations', '→ agent_knowledge_bases'],
    rowCount: '~500',
    status: 'active',
  },
  {
    name: 'agent_conversations',
    description: 'Chat sessions with agents',
    fields: ['id', 'agent_id', 'user_id', 'session_id', 'conversation_data', 'status'],
    relationships: ['← agents', '→ agent_compliance_monitoring'],
    rowCount: '~10K',
    status: 'active',
  },
  {
    name: 'agent_templates',
    description: 'Reusable agent blueprints',
    fields: ['id', 'name', 'template_type', 'configuration', 'journey_stages'],
    relationships: ['← agents', '→ agent_template_versions'],
    rowCount: '~50',
    status: 'active',
  },
  {
    name: 'knowledge_base',
    description: 'RAG knowledge documents',
    fields: ['id', 'title', 'content', 'embedding', 'metadata', 'agent_id'],
    relationships: ['← agent_knowledge_bases', '→ universal_knowledge_base'],
    rowCount: '~2K',
    status: 'active',
  },
  {
    name: 'profiles',
    description: 'User profiles & settings',
    fields: ['id', 'user_id', 'full_name', 'role', 'avatar_url', 'settings'],
    relationships: ['← auth.users', '→ subscriptions'],
    rowCount: '~5K',
    status: 'active',
  },
  {
    name: 'subscriptions',
    description: 'Stripe subscription data',
    fields: ['id', 'user_id', 'stripe_subscription_id', 'status', 'plan_id'],
    relationships: ['← profiles', '← stripe_customers'],
    rowCount: '~1K',
    status: 'active',
  },
];

const mediaEntities = [
  {
    name: 'scripts',
    description: 'Content scripts & versions',
    fields: ['id', 'title', 'content', 'version', 'user_id', 'status'],
    relationships: ['→ script_versions', '→ tts_outputs'],
    rowCount: '~5K',
    status: 'active',
  },
  {
    name: 'tts_outputs',
    description: 'Generated audio files',
    fields: ['id', 'script_id', 'voice_id', 'audio_url', 'duration_ms', 'provider'],
    relationships: ['← scripts', '→ media_assets'],
    rowCount: '~8K',
    status: 'active',
  },
  {
    name: 'media_assets',
    description: 'Videos, images, audio files',
    fields: ['id', 'type', 'file_url', 'thumbnail_url', 'metadata', 'user_id'],
    relationships: ['→ clips', '→ shows'],
    rowCount: '~15K',
    status: 'active',
  },
  {
    name: 'shows',
    description: 'Production shows/series',
    fields: ['id', 'title', 'description', 'status', 'published_at', 'metadata'],
    relationships: ['← media_assets', '→ episodes'],
    rowCount: '~200',
    status: 'partial',
  },
];

const securityEntities = [
  {
    name: 'access_requests',
    description: 'User access request logs',
    fields: ['id', 'user_email', 'ip_address', 'status', 'reviewed_by'],
    status: 'active',
  },
  {
    name: 'agent_audit_logs',
    description: 'Agent activity audit trail',
    fields: ['id', 'agent_id', 'action_type', 'actor_user_id', 'before_state', 'after_state'],
    status: 'active',
  },
  {
    name: 'agent_compliance_monitoring',
    description: 'Compliance checks & violations',
    fields: ['id', 'agent_id', 'compliance_check_type', 'check_result', 'violations'],
    status: 'active',
  },
  {
    name: 'agent_permissions',
    description: 'Agent access control',
    fields: ['id', 'agent_id', 'resource_type', 'permission_type', 'is_active'],
    status: 'partial',
  },
];

const storageBuckets = [
  { name: 'avatars', description: 'User profile images', public: true, size: '~50MB' },
  { name: 'media', description: 'Video/audio content', public: false, size: '~5GB' },
  { name: 'documents', description: 'Uploaded documents', public: false, size: '~500MB' },
  { name: 'thumbnails', description: 'Generated thumbnails', public: true, size: '~100MB' },
  { name: 'exports', description: 'Export downloads', public: false, size: '~1GB' },
  { name: 'temp', description: 'Processing temp files', public: false, size: '~200MB' },
];

const rlsPolicies = [
  { table: 'agents', policy: 'Users can view own agents', type: 'SELECT' },
  { table: 'agents', policy: 'Users can create own agents', type: 'INSERT' },
  { table: 'agent_conversations', policy: 'Users access own conversations', type: 'ALL' },
  { table: 'profiles', policy: 'Users can update own profile', type: 'UPDATE' },
  { table: 'scripts', policy: 'Users can manage own scripts', type: 'ALL' },
  { table: 'media_assets', policy: 'Users access own media', type: 'ALL' },
];

export const GenieDataArchitectureDiagram: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);

  const handleDownloadPNG = async () => {
    if (!diagramRef.current) return;
    try {
      toast.info('Generating PNG...');
      const canvas = await html2canvas(diagramRef.current, {
        backgroundColor: '#ffffff',
        scale: 3,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = 'genie-data-architecture.png';
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      toast.success('PNG downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download PNG');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700">✓ Active</Badge>;
      case 'partial':
        return <Badge className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700">◐ Partial</Badge>;
      default:
        return <Badge className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700">○ Planned</Badge>;
    }
  };

  const content = (
    <div ref={diagramRef} className="p-6 bg-background rounded-xl space-y-6 border border-border">
      {/* Header */}
      <div className="text-center border-b border-border pb-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center justify-center gap-3">
          <Database className="h-8 w-8 text-blue-500" />
          Genie Data Architecture
        </h2>
        <p className="text-muted-foreground mt-2">PostgreSQL • Supabase • RLS • Storage Buckets • ER Relationships</p>
      </div>

      {/* Stats */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-2 border-blue-200 dark:border-blue-800/40">
        <CardContent className="pt-4">
          <div className="grid grid-cols-6 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">50+</div>
              <div className="text-xs text-muted-foreground font-medium">Tables</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">100+</div>
              <div className="text-xs text-muted-foreground font-medium">RLS Policies</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">6</div>
              <div className="text-xs text-muted-foreground font-medium">Storage Buckets</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">15+</div>
              <div className="text-xs text-muted-foreground font-medium">DB Functions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">10+</div>
              <div className="text-xs text-muted-foreground font-medium">Triggers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">5</div>
              <div className="text-xs text-muted-foreground font-medium">Indexes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Entities - ER Diagram */}
      <Card className="border-2 border-violet-200 dark:border-violet-800/40 bg-violet-50/50 dark:bg-violet-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-violet-700 dark:text-violet-400 flex items-center gap-2">
            <Table className="h-5 w-5" />
            Core Entities (ER Diagram)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {coreEntities.map((entity) => (
              <div key={entity.name} className="bg-background rounded-lg p-3 border-2 border-border shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <code className="text-violet-600 dark:text-violet-400 text-sm font-bold">{entity.name}</code>
                  {getStatusBadge(entity.status)}
                </div>
                <p className="text-muted-foreground text-xs mb-2">{entity.description}</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs">
                    <Key className="h-3 w-3 text-amber-500" />
                    <span className="text-foreground font-medium">Fields:</span>
                    <span className="text-muted-foreground">{entity.fields.slice(0, 3).join(', ')}...</span>
                  </div>
                  <div className="flex items-start gap-1 text-xs">
                    <Link2 className="h-3 w-3 text-blue-500 mt-0.5" />
                    <div className="text-blue-600 dark:text-blue-400">
                      {entity.relationships.slice(0, 2).map((rel, i) => (
                        <div key={i}>{rel}</div>
                      ))}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">{entity.rowCount} rows</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Media Entities */}
      <Card className="border-2 border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Media & Content Entities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {mediaEntities.map((entity) => (
              <div key={entity.name} className="bg-background rounded-lg p-3 border-2 border-border shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <code className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">{entity.name}</code>
                  {getStatusBadge(entity.status)}
                </div>
                <p className="text-muted-foreground text-xs mb-2">{entity.description}</p>
                <div className="flex items-start gap-1 text-xs">
                  <Link2 className="h-3 w-3 text-blue-500 mt-0.5" />
                  <div className="text-blue-600 dark:text-blue-400">
                    {entity.relationships.map((rel, i) => (
                      <div key={i}>{rel}</div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security & Audit Entities */}
      <Card className="border-2 border-red-200 dark:border-red-800/40 bg-red-50/50 dark:bg-red-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-red-700 dark:text-red-400 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Audit Entities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {securityEntities.map((entity) => (
              <div key={entity.name} className="bg-background rounded-lg p-3 border-2 border-border shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <code className="text-red-600 dark:text-red-400 text-xs font-bold">{entity.name}</code>
                  {getStatusBadge(entity.status)}
                </div>
                <p className="text-muted-foreground text-xs">{entity.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Storage Buckets */}
      <Card className="border-2 border-orange-200 dark:border-orange-800/40 bg-orange-50/50 dark:bg-orange-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-orange-700 dark:text-orange-400 flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Supabase Storage Buckets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-3">
            {storageBuckets.map((bucket) => (
              <div key={bucket.name} className="bg-background rounded-lg p-3 border-2 border-border text-center shadow-sm">
                <Archive className={`h-6 w-6 mx-auto mb-2 ${bucket.public ? 'text-emerald-500' : 'text-orange-500'}`} />
                <code className="text-orange-600 dark:text-orange-400 text-xs font-bold">{bucket.name}</code>
                <p className="text-muted-foreground text-xs mt-1">{bucket.description}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Badge variant="secondary" className={`text-xs ${bucket.public ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                    {bucket.public ? 'Public' : 'Private'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{bucket.size}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* RLS Policies Sample */}
      <Card className="border-2 border-cyan-200 dark:border-cyan-800/40 bg-cyan-50/50 dark:bg-cyan-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-cyan-700 dark:text-cyan-400 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Row Level Security (RLS) Policies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {rlsPolicies.map((policy, i) => (
              <div key={i} className="bg-background rounded-lg p-2 border-2 border-border shadow-sm flex items-center justify-between">
                <div>
                  <code className="text-cyan-600 dark:text-cyan-400 text-xs font-bold">{policy.table}</code>
                  <p className="text-muted-foreground text-xs">{policy.policy}</p>
                </div>
                <Badge variant="secondary" className="text-xs">{policy.type}</Badge>
              </div>
            ))}
          </div>
          <div className="text-center mt-3">
            <Badge className="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300">
              100+ RLS policies enforcing data isolation
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Data Flow */}
      <Card className="border-2 border-pink-200 dark:border-pink-800/40 bg-pink-50/50 dark:bg-pink-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-pink-700 dark:text-pink-400 flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Data Flow Architecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between overflow-x-auto gap-2 pb-2">
            {[
              { name: 'Client', desc: 'React App' },
              { name: 'Supabase Client', desc: 'SDK + Auth' },
              { name: 'Edge Functions', desc: 'Business Logic' },
              { name: 'PostgreSQL', desc: 'Data Store' },
              { name: 'Storage', desc: 'File Assets' },
              { name: 'Realtime', desc: 'WebSocket Sync' },
            ].map((step, i, arr) => (
              <React.Fragment key={step.name}>
                <div className="flex-shrink-0 bg-background rounded-lg p-3 border-2 border-border text-center min-w-[110px] shadow-sm">
                  <div className="text-foreground text-sm font-semibold">{step.name}</div>
                  <div className="text-muted-foreground text-xs mt-1">{step.desc}</div>
                </div>
                {i < arr.length - 1 && <div className="text-pink-500 text-lg font-bold">→</div>}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background overflow-auto">
        <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
          <h2 className="text-foreground font-semibold text-lg">Genie Data Architecture</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadPNG}>
              <Download className="h-4 w-4 mr-2" />
              Download PNG
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsFullscreen(false)}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
        <div className="p-8 flex justify-center">
          <div className="max-w-7xl w-full">{content}</div>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-foreground text-lg flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-500" />
          Data Architecture
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(true)} className="gap-2">
            <Maximize2 className="h-4 w-4" />
            Full Size
          </Button>
          <Button variant="default" size="sm" onClick={handleDownloadPNG} className="gap-2">
            <Download className="h-4 w-4" />
            Download PNG
          </Button>
        </div>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
};

export default GenieDataArchitectureDiagram;
