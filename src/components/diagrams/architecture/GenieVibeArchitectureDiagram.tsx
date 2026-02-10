/**
 * Genie Vibe Architecture Diagram
 * Production Layer with Recording Studio, AI Agents, and Multi-Modal Output
 * Updated: 2026-01-25
 */

import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Maximize2, X, Film, Smartphone, Monitor, Layers, Bot, Video, Music, Wand2, Share2, Globe } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

const deploymentModes = [
  {
    name: 'Mobile Studio',
    icon: Smartphone,
    color: 'orange',
    features: ['One-Tap Record', 'Quick Clips', 'Offline Mode', 'Share to Social', 'Voice Notes'],
    status: 'active',
    completion: 65,
  },
  {
    name: 'Desktop Studio',
    icon: Monitor,
    color: 'sky',
    features: ['Full Timeline Editor', 'Screen + Camera', 'Multi-track Audio', 'PiP Recording', 'Hybrid Workspace'],
    status: 'active',
    completion: 85,
  },
  {
    name: 'Enterprise Hub',
    icon: Film,
    color: 'violet',
    features: ['Multi-show Management', 'Team Collaboration', 'Broadcast Scheduling', 'Enterprise SSO', 'Audit Logs'],
    status: 'partial',
    completion: 55,
  },
];

const aiAgents = [
  { name: 'Voice Director', icon: '🎙️', description: 'TTS orchestration, 6 providers, voice cloning', status: 'active' },
  { name: 'Scene Analyzer', icon: '👁️', description: 'Visual analysis, framing, motion detection', status: 'active' },
  { name: 'Script Matcher', icon: '📝', description: 'Audio-to-script sync, timestamp alignment', status: 'active' },
  { name: 'Music Composer', icon: '🎵', description: 'AI background music, mood matching, mixing', status: 'active' },
  { name: 'Auto-Editor', icon: '✂️', description: 'Smart cuts, transitions, effects, pacing', status: 'active' },
  { name: 'Distribution Agent', icon: '🚀', description: 'Multi-platform publish, scheduling, analytics', status: 'partial' },
];

const productionPhases = [
  { name: 'Input Processing', description: 'Multi-modal ingestion', status: 'complete' },
  { name: 'Script Enhancement', description: 'AI improvement', status: 'complete' },
  { name: 'Voice Generation', description: 'TTS or live record', status: 'complete' },
  { name: 'Video Capture', description: 'Camera + screen', status: 'complete' },
  { name: 'Timeline Editing', description: 'Hybrid workspace', status: 'complete' },
  { name: 'AI Enhancement', description: 'Effects & polish', status: 'active' },
  { name: 'Multi-format Export', description: '35-50 formats', status: 'complete' },
];

const outputFormats = [
  { category: 'Video', formats: ['MP4', 'WebM', 'MOV', 'GIF', 'Shorts'], count: 8 },
  { category: 'Presentation', formats: ['PPTX', 'PDF', 'Google Slides', 'Keynote'], count: 5 },
  { category: 'Audio', formats: ['MP3', 'WAV', 'M4A', 'AAC'], count: 4 },
  { category: 'Document', formats: ['PDF', 'DOCX', 'MD', 'HTML'], count: 6 },
  { category: 'Social', formats: ['Reels', 'TikTok', 'Shorts', 'Stories'], count: 8 },
];

const colorClasses: Record<string, { bg: string; border: string; text: string; progress: string }> = {
  orange: { bg: 'bg-orange-50 dark:bg-orange-950/20', border: 'border-orange-200 dark:border-orange-800/40', text: 'text-orange-600 dark:text-orange-400', progress: 'bg-orange-500' },
  sky: { bg: 'bg-sky-50 dark:bg-sky-950/20', border: 'border-sky-200 dark:border-sky-800/40', text: 'text-sky-600 dark:text-sky-400', progress: 'bg-sky-500' },
  violet: { bg: 'bg-violet-50 dark:bg-violet-950/20', border: 'border-violet-200 dark:border-violet-800/40', text: 'text-violet-600 dark:text-violet-400', progress: 'bg-violet-500' },
};

export const GenieVibeArchitectureDiagram: React.FC = () => {
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
      link.download = 'genie-vibe-architecture.png';
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
          <Film className="h-8 w-8 text-emerald-500" />
          Genie Vibe Architecture
        </h2>
        <p className="text-muted-foreground mt-2">Production Layer • Recording Studio • 6 AI Agents • 7-Phase Pipeline • 35+ Output Formats</p>
      </div>

      {/* Deployment Modes */}
      <Card className="border-2 border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Deployment Modes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {deploymentModes.map((mode) => {
              const colors = colorClasses[mode.color];
              return (
                <div key={mode.name} className={`${colors.bg} rounded-lg p-4 border-2 ${colors.border}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${colors.bg} border ${colors.border}`}>
                      <mode.icon className={`h-6 w-6 ${colors.text}`} />
                    </div>
                    <div>
                      <h3 className="text-foreground font-semibold">{mode.name}</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full">
                          <div className={`h-full rounded-full ${colors.progress}`} style={{ width: `${mode.completion}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{mode.completion}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {mode.features.map((feature) => (
                      <div key={feature} className="text-xs text-muted-foreground flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${colors.progress}`} />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* AI Agents */}
      <Card className="border-2 border-purple-200 dark:border-purple-800/40 bg-purple-50/50 dark:bg-purple-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-purple-700 dark:text-purple-400 flex items-center gap-2">
            <Bot className="h-5 w-5" />
            6 AI Production Agents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {aiAgents.map((agent) => (
              <div key={agent.name} className="bg-background rounded-lg p-3 border-2 border-border shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{agent.icon}</span>
                    <span className="text-foreground font-semibold text-sm">{agent.name}</span>
                  </div>
                  {getStatusBadge(agent.status)}
                </div>
                <p className="text-muted-foreground text-xs">{agent.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 7-Phase Production Pipeline */}
      <Card className="border-2 border-cyan-200 dark:border-cyan-800/40 bg-cyan-50/50 dark:bg-cyan-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-cyan-700 dark:text-cyan-400 flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            7-Phase Production Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between overflow-x-auto gap-2 pb-2">
            {productionPhases.map((phase, index) => (
              <React.Fragment key={phase.name}>
                <div className="flex-shrink-0 bg-background rounded-lg p-3 border-2 border-border text-center min-w-[120px] shadow-sm">
                  <div className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold mb-1">Phase {index + 1}</div>
                  <div className="text-foreground text-sm font-semibold">{phase.name}</div>
                  <div className="text-muted-foreground text-xs mt-1">{phase.description}</div>
                  <div className="mt-2">{getStatusBadge(phase.status)}</div>
                </div>
                {index < productionPhases.length - 1 && (
                  <div className="text-muted-foreground text-lg font-bold">→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Output Formats */}
      <Card className="border-2 border-pink-200 dark:border-pink-800/40 bg-pink-50/50 dark:bg-pink-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-pink-700 dark:text-pink-400 flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Multi-Format Output (35-50 Formats)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {outputFormats.map((output) => (
              <div key={output.category} className="bg-background rounded-lg p-3 border-2 border-border shadow-sm">
                <div className="text-foreground font-semibold text-sm mb-2">{output.category}</div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {output.formats.slice(0, 3).map((format) => (
                    <Badge key={format} variant="secondary" className="text-xs">{format}</Badge>
                  ))}
                  {output.formats.length > 3 && (
                    <Badge variant="outline" className="text-xs">+{output.formats.length - 3}</Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{output.count} formats</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Points */}
      <Card className="border-2 border-orange-200 dark:border-orange-800/40 bg-orange-50/50 dark:bg-orange-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-orange-700 dark:text-orange-400 flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Integration Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3 text-center text-sm">
            <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3 border-2 border-purple-200 dark:border-purple-800/40">
              <div className="text-purple-600 dark:text-purple-400 font-semibold">← Genie Mind</div>
              <div className="text-xs text-muted-foreground mt-1">Scripts, AI, TTS</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-3 border-2 border-orange-200 dark:border-orange-800/40">
              <div className="text-orange-600 dark:text-orange-400 font-semibold">← Genie Spark</div>
              <div className="text-xs text-muted-foreground mt-1">Quick Ideas</div>
            </div>
            <div className="bg-cyan-50 dark:bg-cyan-950/20 rounded-lg p-3 border-2 border-cyan-200 dark:border-cyan-800/40">
              <div className="text-cyan-600 dark:text-cyan-400 font-semibold">← Genie Deck</div>
              <div className="text-xs text-muted-foreground mt-1">Presentations</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border-2 border-blue-200 dark:border-blue-800/40">
              <div className="text-blue-600 dark:text-blue-400 font-semibold">→ Genie Hub</div>
              <div className="text-xs text-muted-foreground mt-1">Team Review</div>
            </div>
            <div className="bg-violet-50 dark:bg-violet-950/20 rounded-lg p-3 border-2 border-violet-200 dark:border-violet-800/40">
              <div className="text-violet-600 dark:text-violet-400 font-semibold">→ Distribution</div>
              <div className="text-xs text-muted-foreground mt-1">YouTube, LinkedIn</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-6 gap-4 text-center">
        <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-3 border-2 border-emerald-200 dark:border-emerald-800/40">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">3</div>
          <div className="text-xs text-muted-foreground font-medium">Deploy Modes</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3 border-2 border-purple-200 dark:border-purple-800/40">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">6</div>
          <div className="text-xs text-muted-foreground font-medium">AI Agents</div>
        </div>
        <div className="bg-cyan-50 dark:bg-cyan-950/20 rounded-lg p-3 border-2 border-cyan-200 dark:border-cyan-800/40">
          <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">7</div>
          <div className="text-xs text-muted-foreground font-medium">Phases</div>
        </div>
        <div className="bg-pink-50 dark:bg-pink-950/20 rounded-lg p-3 border-2 border-pink-200 dark:border-pink-800/40">
          <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">35+</div>
          <div className="text-xs text-muted-foreground font-medium">Output Formats</div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-3 border-2 border-orange-200 dark:border-orange-800/40">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">119</div>
          <div className="text-xs text-muted-foreground font-medium">Pipelines</div>
        </div>
        <div className="bg-violet-50 dark:bg-violet-950/20 rounded-lg p-3 border-2 border-violet-200 dark:border-violet-800/40">
          <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">78%</div>
          <div className="text-xs text-muted-foreground font-medium">Complete</div>
        </div>
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background overflow-auto">
        <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
          <h2 className="text-foreground font-semibold text-lg">Genie Vibe Architecture</h2>
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
          <Film className="h-5 w-5 text-emerald-500" />
          Genie Vibe Architecture
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

export default GenieVibeArchitectureDiagram;
