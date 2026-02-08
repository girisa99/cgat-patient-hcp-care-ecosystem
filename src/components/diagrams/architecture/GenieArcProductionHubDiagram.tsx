/**
 * Genie Arc & Production Hub Architecture Diagram
 * Team Collaboration & Enterprise Production Center
 * Updated: 2026-01-25 - Full 119 Pipeline Integration
 */

import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Maximize2, X, Users, Building, Workflow, Calendar, Shield, GitBranch, CheckCircle, Radio, Layers, Globe, Zap } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

const arcFeatures = [
  { name: 'Team Workspace', description: 'Shared project environments with real-time sync', status: 'complete', category: 'Collaboration' },
  { name: 'Review & Approval', description: '5-stage workflow-based approvals', status: 'complete', category: 'Workflow' },
  { name: 'Asset Sharing', description: 'Central asset library with 6 storage buckets', status: 'complete', category: 'Assets' },
  { name: 'Version Control', description: 'Full history tracking with rollback', status: 'complete', category: 'Versioning' },
  { name: 'Comments & Annotations', description: 'Inline feedback with @mentions', status: 'partial', category: 'Collaboration' },
  { name: 'RBAC Permissions', description: '5-tier role-based access control', status: 'complete', category: 'Security' },
];

const hubFeatures = [
  { name: 'Multi-Show Management', description: 'Manage 100+ concurrent productions', status: 'complete', category: 'Production' },
  { name: 'Broadcast Scheduling', description: 'Timezone-aware scheduling (14 regions)', status: 'partial', category: 'Scheduling' },
  { name: 'Team Assignments', description: 'Capacity planning with seat limits', status: 'complete', category: 'Team' },
  { name: 'Pipeline Automation', description: '119 automated transformation workflows', status: 'complete', category: 'Automation' },
  { name: 'Enterprise SSO', description: 'Google OAuth + SAML/OIDC ready', status: 'partial', category: 'Security' },
  { name: 'Analytics Dashboard', description: 'Real-time production metrics', status: 'complete', category: 'Analytics' },
];

const agentIntegrations = [
  { name: 'collaboration_agent', description: 'Real-time team sync & notifications', status: 'complete' },
  { name: 'approval_workflow_agent', description: 'Automated review routing with SLA', status: 'complete' },
  { name: 'production_orchestrator_agent', description: 'Multi-show A2A coordination', status: 'partial' },
  { name: 'scheduling_agent', description: 'Calendar & timezone management', status: 'partial' },
  { name: 'resource_allocation_agent', description: 'Team capacity & credit planning', status: 'partial' },
  { name: 'compliance_agent', description: 'GDPR/HIPAA policy enforcement', status: 'complete' },
];

const pipelineIntegrations = [
  { name: '119 Pipelines', description: 'Full transformation workflow support', status: 'complete' },
  { name: '15 AI Providers', description: 'Multi-provider orchestration', status: 'complete' },
  { name: '35+ Output Formats', description: 'Comprehensive export options', status: 'complete' },
  { name: '5-Zone Routing', description: 'Regional cost optimization', status: 'complete' },
  { name: '143+ Edge Functions', description: 'Serverless processing layer', status: 'complete' },
  { name: '6 Subscription Tiers', description: 'Free to Enterprise plans', status: 'complete' },
];

export const GenieArcProductionHubDiagram: React.FC = () => {
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
      link.download = 'genie-arc-production-hub-architecture.png';
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
      case 'complete':
        return <Badge className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700">✓ Complete</Badge>;
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
          <Users className="h-8 w-8 text-blue-500" />
          Genie Arc & Production Hub
        </h2>
        <p className="text-muted-foreground mt-2">Team Collaboration • Enterprise Production • 119 Pipeline Orchestration</p>
      </div>

      {/* Stats Bar */}
      <Card className="bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-950/20 dark:to-violet-950/20 border-2 border-blue-200 dark:border-blue-800/40">
        <CardContent className="pt-4">
          <div className="grid grid-cols-6 gap-3 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">119</div>
              <div className="text-xs text-muted-foreground font-medium">Pipelines</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">12</div>
              <div className="text-xs text-muted-foreground font-medium">AI Providers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">6</div>
              <div className="text-xs text-muted-foreground font-medium">Agents</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">5</div>
              <div className="text-xs text-muted-foreground font-medium">RBAC Roles</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">14</div>
              <div className="text-xs text-muted-foreground font-medium">Regions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">85%</div>
              <div className="text-xs text-muted-foreground font-medium">Complete</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Arc Section */}
        <Card className="border-2 border-blue-200 dark:border-blue-800/40 bg-blue-50/50 dark:bg-blue-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <Users className="h-5 w-5" />
              🌈 Genie Arc - Collaboration Hub
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {arcFeatures.map((feature) => (
                <div key={feature.name} className="bg-background rounded-lg p-3 border-2 border-border shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-foreground font-semibold text-sm">{feature.name}</span>
                    {getStatusBadge(feature.status)}
                  </div>
                  <p className="text-muted-foreground text-xs">{feature.description}</p>
                  <Badge variant="secondary" className="text-xs mt-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    {feature.category}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hub Section */}
        <Card className="border-2 border-violet-200 dark:border-violet-800/40 bg-violet-50/50 dark:bg-violet-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-violet-700 dark:text-violet-400 flex items-center gap-2">
              <Building className="h-5 w-5" />
              🎬 Production Hub - Enterprise Center
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {hubFeatures.map((feature) => (
                <div key={feature.name} className="bg-background rounded-lg p-3 border-2 border-border shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-foreground font-semibold text-sm">{feature.name}</span>
                    {getStatusBadge(feature.status)}
                  </div>
                  <p className="text-muted-foreground text-xs">{feature.description}</p>
                  <Badge variant="secondary" className="text-xs mt-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                    {feature.category}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Integrations */}
      <Card className="border-2 border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            🤖 AI Agent Integrations (A2A Protocol)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {agentIntegrations.map((agent) => (
              <div key={agent.name} className="bg-background rounded-lg p-3 border-2 border-border shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <code className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">{agent.name}</code>
                  {getStatusBadge(agent.status)}
                </div>
                <p className="text-muted-foreground text-xs">{agent.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Integrations */}
      <Card className="border-2 border-cyan-200 dark:border-cyan-800/40 bg-cyan-50/50 dark:bg-cyan-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-cyan-700 dark:text-cyan-400 flex items-center gap-2">
            <Layers className="h-5 w-5" />
            🔄 Full Ecosystem Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-3">
            {pipelineIntegrations.map((item) => (
              <div key={item.name} className="bg-background rounded-lg p-3 border-2 border-border shadow-sm text-center">
                <div className="text-cyan-600 dark:text-cyan-400 text-sm font-semibold">{item.name}</div>
                <p className="text-muted-foreground text-xs mt-1">{item.description}</p>
                <div className="mt-2">{getStatusBadge(item.status)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Diagram */}
      <Card className="border-2 border-orange-200 dark:border-orange-800/40 bg-orange-50/50 dark:bg-orange-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-orange-700 dark:text-orange-400 flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            5-Stage Approval Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between overflow-x-auto gap-4 pb-2">
            {['Draft', 'Review', 'Revisions', 'Approval', 'Published'].map((stage, index) => (
              <React.Fragment key={stage}>
                <div className="flex-shrink-0 bg-background rounded-lg p-3 border-2 border-border text-center min-w-[100px] shadow-sm">
                  <CheckCircle className={`h-5 w-5 mx-auto mb-1 ${index <= 3 ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                  <div className="text-foreground text-sm font-semibold">{stage}</div>
                </div>
                {index < 4 && <div className="text-muted-foreground text-lg font-bold">→</div>}
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
          <h2 className="text-foreground font-semibold text-lg">Genie Arc & Production Hub Architecture</h2>
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
          <div className="max-w-6xl w-full">{content}</div>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-foreground text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          Genie Arc & Production Hub
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

export default GenieArcProductionHubDiagram;
