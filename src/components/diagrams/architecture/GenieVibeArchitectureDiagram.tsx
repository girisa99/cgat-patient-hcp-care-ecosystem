/**
 * Genie Vibe Architecture Diagram
 * Production Layer with Recording Studio, 6 AI Agents, and Deployment Modes
 */

import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Maximize2, X, Film, Smartphone, Monitor, Layers, Bot, Video, Music, Wand2, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

const colors = {
  complete: { bg: '#10b981', text: '#ffffff' },
  partial: { bg: '#f59e0b', text: '#ffffff' },
  planned: { bg: '#6366f1', text: '#ffffff' },
};

const deploymentModes = [
  {
    name: 'Mobile',
    icon: Smartphone,
    color: '#f97316',
    features: ['One-Tap Record', 'Quick Clips', 'Offline Mode', 'Share to Social'],
    status: 'partial',
    completion: 30,
  },
  {
    name: 'Desktop',
    icon: Monitor,
    color: '#0ea5e9',
    features: ['Full Timeline', 'Screen + Camera', 'Multi-track Audio', 'PiP Recording'],
    status: 'partial',
    completion: 60,
  },
  {
    name: 'Full Studio',
    icon: Film,
    color: '#7c3aed',
    features: ['Multi-show', 'Team Collab', 'Broadcast', 'Enterprise Features'],
    status: 'partial',
    completion: 40,
  },
];

const aiAgents = [
  { name: 'Voice Director', icon: '🎙️', description: 'TTS orchestration & voice selection', status: 'complete' },
  { name: 'Scene Analyzer', icon: '👁️', description: 'Visual content analysis & framing', status: 'partial' },
  { name: 'Script Matcher', icon: '📝', description: 'Sync audio to script segments', status: 'complete' },
  { name: 'Music Composer', icon: '🎵', description: 'Background music selection & mixing', status: 'partial' },
  { name: 'Auto-Editor', icon: '✂️', description: 'Smart cuts, transitions, effects', status: 'planned' },
  { name: 'Distribution', icon: '🚀', description: 'Multi-platform export & publish', status: 'planned' },
];

const productionPhases = [
  { name: 'Script Import', description: 'From Mind or new', status: 'complete' },
  { name: 'Voice Selection', description: 'TTS or live record', status: 'complete' },
  { name: 'Audio Production', description: 'Generate or record', status: 'complete' },
  { name: 'Video Capture', description: 'Camera + screen', status: 'complete' },
  { name: 'Editing', description: 'Timeline assembly', status: 'partial' },
  { name: 'Enhancement', description: 'AI effects & polish', status: 'partial' },
  { name: 'Export', description: 'Multi-format output', status: 'complete' },
];

export const GenieVibeArchitectureDiagram: React.FC = () => {
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
          <Film className="h-8 w-8 text-emerald-400" />
          Genie Vibe Architecture
        </h2>
        <p className="text-slate-400 mt-2">Production Layer • Recording Studio • 6 AI Agents • 7-Phase Pipeline</p>
      </div>

      {/* Deployment Modes */}
      <Card className="bg-slate-800/50 border-emerald-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-emerald-300 flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Deployment Modes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {deploymentModes.map((mode) => (
              <div key={mode.name} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${mode.color}20` }}>
                    <mode.icon className="h-6 w-6" style={{ color: mode.color }} />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{mode.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-600 rounded-full">
                        <div className="h-full rounded-full" style={{ width: `${mode.completion}%`, backgroundColor: mode.color }} />
                      </div>
                      <span className="text-xs text-slate-400">{mode.completion}%</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  {mode.features.map((feature) => (
                    <div key={feature} className="text-xs text-slate-400 flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full" style={{ backgroundColor: mode.color }} />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Agents */}
      <Card className="bg-slate-800/50 border-purple-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-purple-300 flex items-center gap-2">
            <Bot className="h-5 w-5" />
            6 AI Production Agents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {aiAgents.map((agent) => (
              <div key={agent.name} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{agent.icon}</span>
                    <span className="text-white font-medium text-sm">{agent.name}</span>
                  </div>
                  {getStatusBadge(agent.status)}
                </div>
                <p className="text-slate-400 text-xs">{agent.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 7-Phase Production Pipeline */}
      <Card className="bg-slate-800/50 border-cyan-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-cyan-300 flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            7-Phase Production Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between overflow-x-auto gap-2 pb-2">
            {productionPhases.map((phase, index) => (
              <React.Fragment key={phase.name}>
                <div className="flex-shrink-0 bg-slate-700/50 rounded-lg p-3 border border-slate-600 text-center min-w-[120px]">
                  <div className="text-xs text-cyan-300 font-medium mb-1">Phase {index + 1}</div>
                  <div className="text-white text-sm font-medium">{phase.name}</div>
                  <div className="text-slate-400 text-xs mt-1">{phase.description}</div>
                  <div className="mt-2">{getStatusBadge(phase.status)}</div>
                </div>
                {index < productionPhases.length - 1 && (
                  <div className="text-slate-500 text-lg">→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Points */}
      <Card className="bg-slate-800/50 border-orange-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-orange-300 flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Integration Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3 text-center text-sm">
            <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-500/30">
              <div className="text-purple-300 font-medium">← Genie Mind</div>
              <div className="text-xs text-slate-400 mt-1">Scripts, AI, TTS</div>
            </div>
            <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/30">
              <div className="text-blue-300 font-medium">→ Genie Arc</div>
              <div className="text-xs text-slate-400 mt-1">Team Review</div>
            </div>
            <div className="bg-orange-900/30 rounded-lg p-3 border border-orange-500/30">
              <div className="text-orange-300 font-medium">← Genie Spark</div>
              <div className="text-xs text-slate-400 mt-1">Quick Ideas</div>
            </div>
            <div className="bg-violet-900/30 rounded-lg p-3 border border-violet-500/30">
              <div className="text-violet-300 font-medium">→ Production Hub</div>
              <div className="text-xs text-slate-400 mt-1">Shows, Broadcast</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 text-center">
        <div className="bg-emerald-900/30 rounded-lg p-3 border border-emerald-500/30">
          <div className="text-2xl font-bold text-emerald-300">3</div>
          <div className="text-xs text-slate-400">Deploy Modes</div>
        </div>
        <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-500/30">
          <div className="text-2xl font-bold text-purple-300">6</div>
          <div className="text-xs text-slate-400">AI Agents</div>
        </div>
        <div className="bg-cyan-900/30 rounded-lg p-3 border border-cyan-500/30">
          <div className="text-2xl font-bold text-cyan-300">7</div>
          <div className="text-xs text-slate-400">Phases</div>
        </div>
        <div className="bg-orange-900/30 rounded-lg p-3 border border-orange-500/30">
          <div className="text-2xl font-bold text-orange-300">50</div>
          <div className="text-xs text-slate-400">Scenarios</div>
        </div>
        <div className="bg-pink-900/30 rounded-lg p-3 border border-pink-500/30">
          <div className="text-2xl font-bold text-pink-300">43%</div>
          <div className="text-xs text-slate-400">Complete</div>
        </div>
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/95 overflow-auto">
        <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">Genie Vibe Architecture</h2>
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
          <Film className="h-5 w-5 text-emerald-400" />
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
