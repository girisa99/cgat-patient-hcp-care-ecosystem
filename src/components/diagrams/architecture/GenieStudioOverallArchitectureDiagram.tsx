/**
 * Genie Studio Overall Architecture Diagram
 * Master System Diagram with All Module Relationships
 */

import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Maximize2, X, Layers, Brain, Film, Users, Zap, Building, Database, Cloud, Shield, Server } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

const colors = {
  complete: { bg: '#10b981', text: '#ffffff' },
  partial: { bg: '#f59e0b', text: '#ffffff' },
  planned: { bg: '#6366f1', text: '#ffffff' },
  mind: '#7c3aed',
  vibe: '#059669',
  arc: '#3b82f6',
  spark: '#f97316',
  hub: '#8b5cf6',
};

const modules = [
  { id: 'mind', name: 'Genie Mind', icon: '🧠', color: colors.mind, description: 'AI Intelligence Layer', status: 'partial', completion: 85 },
  { id: 'vibe', name: 'Genie Vibe', icon: '🎬', color: colors.vibe, description: 'Production Layer', status: 'partial', completion: 43 },
  { id: 'spark', name: 'Genie Spark', icon: '⚡', color: colors.spark, description: 'Quick-Start Engine', status: 'planned', completion: 0 },
  { id: 'arc', name: 'Genie Arc', icon: '🌈', color: colors.arc, description: 'Team Collaboration', status: 'partial', completion: 25 },
  { id: 'hub', name: 'Production Hub', icon: '🎥', color: colors.hub, description: 'Enterprise Center', status: 'partial', completion: 20 },
];

const techStack = {
  frontend: ['React 18', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Radix UI'],
  backend: ['Supabase', 'Edge Functions', 'PostgreSQL', 'Realtime'],
  ai: ['OpenAI GPT-4o', 'Claude 3.5', 'Gemini Pro', 'ElevenLabs', 'OpenAI TTS'],
  infra: ['Lovable Cloud', 'CDN', 'Object Storage', 'WebRTC'],
};

const dataFlows = [
  { from: 'Spark', to: 'Mind', description: 'Ideas & templates' },
  { from: 'Mind', to: 'Vibe', description: 'Scripts & TTS audio' },
  { from: 'Vibe', to: 'Arc', description: 'Media for review' },
  { from: 'Arc', to: 'Hub', description: 'Approved content' },
  { from: 'Hub', to: 'Distribution', description: 'Published media' },
];

const scenarioSummary = {
  total: 177,
  implemented: 43,
  partial: 7,
  planned: 127,
  p0: { total: 35, done: 33 },
  p1: { total: 32, done: 5 },
  p2: { total: 50, done: 12 },
  p3: { total: 30, done: 0 },
  p4: { total: 20, done: 0 },
  p5: { total: 10, done: 0 },
};

export const GenieStudioOverallArchitectureDiagram: React.FC = () => {
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
      link.download = 'genie-studio-overall-architecture.png';
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      toast.success('PNG downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download PNG');
    }
  };

  const content = (
    <div ref={diagramRef} className="p-6 bg-slate-900 rounded-xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-3">
          <Layers className="h-8 w-8 text-violet-400" />
          Genie Studio - Complete Architecture
        </h2>
        <p className="text-slate-400 mt-2">Mind to Media • 177 Scenarios • 5 Modules • 6 Phases</p>
      </div>

      {/* Implementation Summary */}
      <Card className="bg-gradient-to-r from-violet-900/30 to-purple-900/30 border-violet-500/30">
        <CardContent className="pt-4">
          <div className="grid grid-cols-6 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-violet-300">{scenarioSummary.total}</div>
              <div className="text-xs text-slate-400">Total Scenarios</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-300">{scenarioSummary.implemented}</div>
              <div className="text-xs text-slate-400">Implemented (24%)</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-300">{scenarioSummary.partial}</div>
              <div className="text-xs text-slate-400">Partial (4%)</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-300">{scenarioSummary.planned}</div>
              <div className="text-xs text-slate-400">Planned (72%)</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-300">12</div>
              <div className="text-xs text-slate-400">AI Agents</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-300">15</div>
              <div className="text-xs text-slate-400">API Endpoints</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Cards */}
      <div className="grid grid-cols-5 gap-4">
        {modules.map((module) => (
          <Card key={module.id} className="bg-slate-800/50 border-slate-600" style={{ borderColor: `${module.color}40` }}>
            <CardContent className="pt-4 text-center">
              <div className="text-3xl mb-2">{module.icon}</div>
              <div className="text-white font-medium text-sm">{module.name}</div>
              <div className="text-slate-400 text-xs mb-2">{module.description}</div>
              <div className="w-full h-2 bg-slate-700 rounded-full">
                <div 
                  className="h-full rounded-full transition-all" 
                  style={{ width: `${module.completion}%`, backgroundColor: module.color }}
                />
              </div>
              <div className="text-xs mt-1" style={{ color: module.color }}>{module.completion}% Complete</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Data Flow */}
      <Card className="bg-slate-800/50 border-cyan-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-cyan-300 flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Flow Architecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between overflow-x-auto gap-2 pb-2">
            {dataFlows.map((flow, index) => (
              <React.Fragment key={index}>
                <div className="flex-shrink-0 bg-slate-700/50 rounded-lg p-3 border border-slate-600 text-center min-w-[100px]">
                  <div className="text-white text-sm font-medium">{flow.from}</div>
                  <div className="text-slate-400 text-xs mt-1">{flow.description}</div>
                </div>
                {index < dataFlows.length - 1 && (
                  <div className="text-cyan-400 text-lg flex-shrink-0">→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tech Stack */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-blue-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-300 flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Frontend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {techStack.frontend.map((tech) => (
                <Badge key={tech} variant="outline" className="text-xs text-blue-300 border-blue-500/30">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-emerald-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-emerald-300 flex items-center gap-2">
              <Server className="h-4 w-4" />
              Backend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {techStack.backend.map((tech) => (
                <Badge key={tech} variant="outline" className="text-xs text-emerald-300 border-emerald-500/30">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-purple-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-purple-300 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI/ML
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {techStack.ai.map((tech) => (
                <Badge key={tech} variant="outline" className="text-xs text-purple-300 border-purple-500/30">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-orange-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-orange-300 flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Infrastructure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {techStack.infra.map((tech) => (
                <Badge key={tech} variant="outline" className="text-xs text-orange-300 border-orange-500/30">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Phase Progress */}
      <Card className="bg-slate-800/50 border-pink-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-pink-300 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Phase Progress (P0-P5)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-3">
            {[
              { id: 'P0', ...scenarioSummary.p0, color: '#10b981' },
              { id: 'P1', ...scenarioSummary.p1, color: '#0ea5e9' },
              { id: 'P2', ...scenarioSummary.p2, color: '#f59e0b' },
              { id: 'P3', ...scenarioSummary.p3, color: '#ec4899' },
              { id: 'P4', ...scenarioSummary.p4, color: '#8b5cf6' },
              { id: 'P5', ...scenarioSummary.p5, color: '#64748b' },
            ].map((phase) => {
              const percentage = Math.round((phase.done / phase.total) * 100);
              return (
                <div key={phase.id} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600 text-center">
                  <div className="text-lg font-bold" style={{ color: phase.color }}>{phase.id}</div>
                  <div className="text-white text-sm">{phase.done}/{phase.total}</div>
                  <div className="w-full h-1.5 bg-slate-600 rounded-full mt-2">
                    <div 
                      className="h-full rounded-full" 
                      style={{ width: `${percentage}%`, backgroundColor: phase.color }}
                    />
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{percentage}%</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/95 overflow-auto">
        <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">Genie Studio - Complete Architecture</h2>
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
          <div className="max-w-7xl w-full">{content}</div>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Layers className="h-5 w-5 text-violet-400" />
          Genie Studio - Complete Architecture
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

export default GenieStudioOverallArchitectureDiagram;
