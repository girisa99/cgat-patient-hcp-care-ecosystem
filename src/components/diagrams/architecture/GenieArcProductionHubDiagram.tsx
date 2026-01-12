/**
 * Genie Arc & Production Hub Architecture Diagram
 * Team Collaboration & Enterprise Production Center
 */

import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Maximize2, X, Users, Building, Workflow, Calendar, Shield, GitBranch, CheckCircle, Radio } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

const colors = {
  complete: { bg: '#10b981', text: '#ffffff' },
  partial: { bg: '#f59e0b', text: '#ffffff' },
  planned: { bg: '#6366f1', text: '#ffffff' },
};

const arcFeatures = [
  { name: 'Team Workspace', description: 'Shared project environments', status: 'partial', category: 'Collaboration' },
  { name: 'Review & Approval', description: 'Workflow-based approvals', status: 'partial', category: 'Workflow' },
  { name: 'Asset Sharing', description: 'Central asset library', status: 'partial', category: 'Assets' },
  { name: 'Version Control', description: 'Track all changes', status: 'partial', category: 'Versioning' },
  { name: 'Comments & Annotations', description: 'Inline feedback', status: 'planned', category: 'Collaboration' },
  { name: 'Role-based Access', description: 'Permission management', status: 'planned', category: 'Security' },
];

const hubFeatures = [
  { name: 'Multi-show Management', description: 'Manage multiple productions', status: 'partial', category: 'Production' },
  { name: 'Broadcast Scheduling', description: 'Schedule live events', status: 'partial', category: 'Scheduling' },
  { name: 'Team Assignments', description: 'Assign roles & tasks', status: 'planned', category: 'Team' },
  { name: 'Pipeline Automation', description: 'Automated workflows', status: 'planned', category: 'Automation' },
  { name: 'Enterprise SSO', description: 'SAML/OIDC integration', status: 'planned', category: 'Security' },
  { name: 'Analytics Dashboard', description: 'Production metrics', status: 'planned', category: 'Analytics' },
];

const agentIntegrations = [
  { name: 'collaboration_agent', description: 'Team sync & notifications', status: 'partial' },
  { name: 'approval_workflow_agent', description: 'Automated review routing', status: 'partial' },
  { name: 'production_orchestrator_agent', description: 'Multi-show coordination', status: 'planned' },
  { name: 'scheduling_agent', description: 'Calendar & event management', status: 'planned' },
  { name: 'resource_allocation_agent', description: 'Team capacity planning', status: 'planned' },
  { name: 'compliance_agent', description: 'Enterprise policy enforcement', status: 'planned' },
];

const apiEndpoints = [
  { name: 'collaboration-sync', description: 'Real-time team sync', status: 'partial' },
  { name: 'asset-manager', description: 'Asset CRUD operations', status: 'partial' },
  { name: 'shows-api', description: 'Show management', status: 'partial' },
  { name: 'calendar-sync', description: 'External calendar integration', status: 'planned' },
  { name: 'team-management', description: 'User & role management', status: 'planned' },
  { name: 'audit-trail', description: 'Compliance logging', status: 'planned' },
];

export const GenieArcProductionHubDiagram: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);

  const handleDownloadPNG = async () => {
    if (!diagramRef.current) return;
    try {
      toast.info('Generating PNG...');
      const canvas = await html2canvas(diagramRef.current, {
        backgroundColor: '#0f172a',
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
        return <Badge className="text-xs" style={{ backgroundColor: colors.complete.bg, color: colors.complete.text }}>✓ Complete</Badge>;
      case 'partial':
        return <Badge className="text-xs" style={{ backgroundColor: colors.partial.bg, color: colors.partial.text }}>◐ Partial</Badge>;
      default:
        return <Badge className="text-xs" style={{ backgroundColor: colors.planned.bg, color: colors.planned.text }}>○ Planned</Badge>;
    }
  };

  const content = (
    <div ref={diagramRef} className="p-6 bg-slate-900 rounded-xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-3">
          <Users className="h-8 w-8 text-blue-400" />
          Genie Arc & Production Hub
        </h2>
        <p className="text-slate-400 mt-2">Team Collaboration • Enterprise Production • Workflow Automation</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Arc Section */}
        <Card className="bg-slate-800/50 border-blue-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-300 flex items-center gap-2">
              <Users className="h-5 w-5" />
              🌈 Genie Arc - Collaboration Hub
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {arcFeatures.map((feature) => (
                <div key={feature.name} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium text-sm">{feature.name}</span>
                    {getStatusBadge(feature.status)}
                  </div>
                  <p className="text-slate-400 text-xs">{feature.description}</p>
                  <Badge variant="outline" className="text-xs mt-2 text-blue-300 border-blue-500/30">
                    {feature.category}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hub Section */}
        <Card className="bg-slate-800/50 border-violet-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-violet-300 flex items-center gap-2">
              <Building className="h-5 w-5" />
              🎬 Production Hub - Enterprise Center
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {hubFeatures.map((feature) => (
                <div key={feature.name} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium text-sm">{feature.name}</span>
                    {getStatusBadge(feature.status)}
                  </div>
                  <p className="text-slate-400 text-xs">{feature.description}</p>
                  <Badge variant="outline" className="text-xs mt-2 text-violet-300 border-violet-500/30">
                    {feature.category}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Integrations */}
      <Card className="bg-slate-800/50 border-emerald-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-emerald-300 flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Agent Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {agentIntegrations.map((agent) => (
              <div key={agent.name} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                <div className="flex items-center justify-between mb-1">
                  <code className="text-emerald-300 text-xs">{agent.name}</code>
                  {getStatusBadge(agent.status)}
                </div>
                <p className="text-slate-400 text-xs">{agent.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints */}
      <Card className="bg-slate-800/50 border-cyan-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-cyan-300 flex items-center gap-2">
            <Radio className="h-5 w-5" />
            API Endpoints
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {apiEndpoints.map((api) => (
              <div key={api.name} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                <div className="flex items-center justify-between mb-1">
                  <code className="text-cyan-300 text-xs">{api.name}</code>
                  {getStatusBadge(api.status)}
                </div>
                <p className="text-slate-400 text-xs">{api.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Diagram */}
      <Card className="bg-slate-800/50 border-orange-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-orange-300 flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Approval Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between overflow-x-auto gap-4 pb-2">
            {['Draft', 'Review', 'Revisions', 'Approval', 'Published'].map((stage, index) => (
              <React.Fragment key={stage}>
                <div className="flex-shrink-0 bg-slate-700/50 rounded-lg p-3 border border-slate-600 text-center min-w-[100px]">
                  <CheckCircle className={`h-5 w-5 mx-auto mb-1 ${index <= 1 ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <div className="text-white text-sm font-medium">{stage}</div>
                </div>
                {index < 4 && <div className="text-slate-500 text-lg">→</div>}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 text-center">
        <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/30">
          <div className="text-2xl font-bold text-blue-300">6</div>
          <div className="text-xs text-slate-400">Arc Features</div>
        </div>
        <div className="bg-violet-900/30 rounded-lg p-3 border border-violet-500/30">
          <div className="text-2xl font-bold text-violet-300">6</div>
          <div className="text-xs text-slate-400">Hub Features</div>
        </div>
        <div className="bg-emerald-900/30 rounded-lg p-3 border border-emerald-500/30">
          <div className="text-2xl font-bold text-emerald-300">6</div>
          <div className="text-xs text-slate-400">Agents</div>
        </div>
        <div className="bg-cyan-900/30 rounded-lg p-3 border border-cyan-500/30">
          <div className="text-2xl font-bold text-cyan-300">25%</div>
          <div className="text-xs text-slate-400">Complete</div>
        </div>
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/95 overflow-auto">
        <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">Genie Arc & Production Hub Architecture</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadPNG} className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
              <Download className="h-4 w-4 mr-2" />
              Download PNG
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsFullscreen(false)} className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
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
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-400" />
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
