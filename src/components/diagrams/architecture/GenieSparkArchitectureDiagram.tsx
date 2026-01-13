/**
 * Genie Spark Architecture Diagram
 * Quick-Start Content Generation Engine
 */

import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Maximize2, X, Zap, Lightbulb, Rocket, FileText, Wand2, Clock, Sparkles } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

const sparkFeatures = [
  { name: 'Idea Capture', description: 'Quick idea to content starter', status: 'planned', time: '30s' },
  { name: 'Quick Prompts', description: 'Pre-built prompt templates', status: 'planned', time: '15s' },
  { name: 'Template Starter', description: 'Industry templates', status: 'planned', time: '45s' },
  { name: 'Instant Script', description: 'One-click script generation', status: 'planned', time: '60s' },
  { name: 'Voice Preview', description: 'Quick TTS preview', status: 'planned', time: '30s' },
  { name: 'Export to Mind', description: 'Seamless handoff', status: 'planned', time: '5s' },
];

const templates = [
  { name: 'Product Demo', segment: 'SMB', icon: '🎯', scenarios: 5 },
  { name: 'Tutorial Video', segment: 'Education', icon: '📚', scenarios: 4 },
  { name: 'Patient Education', segment: 'Healthcare', icon: '🏥', scenarios: 6 },
  { name: 'Social Clip', segment: 'Creator', icon: '🎨', scenarios: 8 },
  { name: 'Travel Story', segment: 'Traveler', icon: '✈️', scenarios: 3 },
  { name: 'Corporate Update', segment: 'Enterprise', icon: '🏢', scenarios: 4 },
];

const quickActions = [
  { name: 'Script from Topic', description: 'Enter topic → Get script', icon: '📝' },
  { name: 'Blog to Video', description: 'Paste URL → Video outline', icon: '🔗' },
  { name: 'Voice Note to Script', description: 'Record → Transcribe → Enhance', icon: '🎙️' },
  { name: 'Image to Storyboard', description: 'Upload images → Story flow', icon: '🖼️' },
];

const agentIntegrations = [
  { name: 'idea_generator_agent', description: 'Creative content ideation', status: 'planned' },
  { name: 'template_matcher_agent', description: 'Match content to templates', status: 'planned' },
  { name: 'quick_draft_agent', description: 'Rapid script drafting', status: 'planned' },
];

export const GenieSparkArchitectureDiagram: React.FC = () => {
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
      link.download = 'genie-spark-architecture.png';
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
          <Zap className="h-8 w-8 text-orange-500" />
          Genie Spark Architecture
        </h2>
        <p className="text-muted-foreground mt-2">Quick-Start Engine • Idea to Content in Seconds • Template Library</p>
        <Badge className="mt-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700">
          Phase 2 • 0% Complete
        </Badge>
      </div>

      {/* Quick Actions */}
      <Card className="border-2 border-orange-200 dark:border-orange-800/40 bg-orange-50/50 dark:bg-orange-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-orange-700 dark:text-orange-400 flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <div key={action.name} className="bg-background rounded-lg p-4 border-2 border-border text-center shadow-sm hover:border-orange-300 dark:hover:border-orange-700 transition-colors cursor-pointer">
                <div className="text-3xl mb-2">{action.icon}</div>
                <div className="text-foreground font-semibold text-sm">{action.name}</div>
                <p className="text-muted-foreground text-xs mt-1">{action.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Core Features */}
      <Card className="border-2 border-yellow-200 dark:border-yellow-800/40 bg-yellow-50/50 dark:bg-yellow-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Core Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {sparkFeatures.map((feature) => (
              <div key={feature.name} className="bg-background rounded-lg p-3 border-2 border-border shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-foreground font-semibold text-sm">{feature.name}</span>
                  {getStatusBadge(feature.status)}
                </div>
                <p className="text-muted-foreground text-xs">{feature.description}</p>
                <div className="flex items-center gap-1 mt-2 text-orange-600 dark:text-orange-400 text-xs font-medium">
                  <Clock className="h-3 w-3" />
                  {feature.time}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Template Library */}
      <Card className="border-2 border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Template Library by Segment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {templates.map((template) => (
              <div key={template.name} className="bg-background rounded-lg p-3 border-2 border-border shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{template.icon}</span>
                  <div>
                    <div className="text-foreground font-semibold text-sm">{template.name}</div>
                    <Badge variant="secondary" className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                      {template.segment}
                    </Badge>
                  </div>
                </div>
                <p className="text-muted-foreground text-xs">{template.scenarios} scenarios mapped</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Agent Integrations */}
      <Card className="border-2 border-purple-200 dark:border-purple-800/40 bg-purple-50/50 dark:bg-purple-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-purple-700 dark:text-purple-400 flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI Agent Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {agentIntegrations.map((agent) => (
              <div key={agent.name} className="bg-background rounded-lg p-3 border-2 border-border shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <code className="text-purple-600 dark:text-purple-400 text-xs font-semibold">{agent.name}</code>
                  {getStatusBadge(agent.status)}
                </div>
                <p className="text-muted-foreground text-xs">{agent.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Flow Diagram */}
      <Card className="border-2 border-cyan-200 dark:border-cyan-800/40 bg-cyan-50/50 dark:bg-cyan-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-cyan-700 dark:text-cyan-400 flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Spark → Mind Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between overflow-x-auto gap-4 pb-2">
            {[
              { name: 'Idea', icon: '💡', time: '0s' },
              { name: 'Template', icon: '📋', time: '15s' },
              { name: 'Quick Draft', icon: '✍️', time: '30s' },
              { name: 'TTS Preview', icon: '🔊', time: '45s' },
              { name: 'Export to Mind', icon: '🧠', time: '60s' },
            ].map((step, index) => (
              <React.Fragment key={step.name}>
                <div className="flex-shrink-0 bg-background rounded-lg p-3 border-2 border-border text-center min-w-[100px] shadow-sm">
                  <div className="text-2xl mb-1">{step.icon}</div>
                  <div className="text-foreground text-sm font-semibold">{step.name}</div>
                  <div className="text-orange-600 dark:text-orange-400 text-xs mt-1 font-medium">{step.time}</div>
                </div>
                {index < 4 && <div className="text-muted-foreground text-lg font-bold">→</div>}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 text-center">
        <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-3 border-2 border-orange-200 dark:border-orange-800/40">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">6</div>
          <div className="text-xs text-muted-foreground font-medium">Core Features</div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-3 border-2 border-emerald-200 dark:border-emerald-800/40">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">6</div>
          <div className="text-xs text-muted-foreground font-medium">Segment Templates</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3 border-2 border-purple-200 dark:border-purple-800/40">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</div>
          <div className="text-xs text-muted-foreground font-medium">AI Agents</div>
        </div>
        <div className="bg-cyan-50 dark:bg-cyan-950/20 rounded-lg p-3 border-2 border-cyan-200 dark:border-cyan-800/40">
          <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">60s</div>
          <div className="text-xs text-muted-foreground font-medium">Idea to Script</div>
        </div>
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background overflow-auto">
        <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
          <h2 className="text-foreground font-semibold text-lg">Genie Spark Architecture</h2>
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
          <Zap className="h-5 w-5 text-orange-500" />
          Genie Spark Architecture
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

export default GenieSparkArchitectureDiagram;
