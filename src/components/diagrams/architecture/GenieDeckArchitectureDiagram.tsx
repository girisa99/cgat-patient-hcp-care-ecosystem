/**
 * Genie Deck Architecture Diagram
 * Presentation & Document Generation Engine
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Presentation, FileText, Image, Video, Languages, Palette,
  Download, Maximize2, CheckCircle, Layers, Sparkles, Users
} from 'lucide-react';

const deckFeatures = [
  { name: 'AI Slide Generation', description: 'Text-to-slides with smart layouts', status: 'active', progress: 95 },
  { name: 'Template Library', description: '50+ industry templates', status: 'active', progress: 90 },
  { name: 'Brand Customization', description: 'Logo, colors, fonts auto-apply', status: 'active', progress: 85 },
  { name: 'Multi-Format Export', description: 'PPTX, PDF, Google Slides', status: 'active', progress: 90 },
  { name: 'Localization', description: '120+ languages with cultural adaptation', status: 'active', progress: 85 },
  { name: 'Collaboration', description: 'Real-time editing and comments', status: 'beta', progress: 70 },
];

const outputFormats = [
  { format: 'PPTX', icon: '📊', description: 'Microsoft PowerPoint' },
  { format: 'PDF', icon: '📄', description: 'Print-ready documents' },
  { format: 'Google Slides', icon: '🔗', description: 'Direct export' },
  { format: 'Keynote', icon: '🍎', description: 'Apple presentation' },
  { format: 'HTML5', icon: '🌐', description: 'Web presentations' },
  { format: 'Video', icon: '🎬', description: 'With Vibe integration' },
];

const industryTemplates = [
  { industry: 'Enterprise', count: 12, examples: ['Quarterly Review', 'Board Deck', 'Strategy'] },
  { industry: 'Sales', count: 10, examples: ['Pitch Deck', 'Proposal', 'Case Study'] },
  { industry: 'Marketing', count: 8, examples: ['Campaign Brief', 'Brand Guide', 'Report'] },
  { industry: 'Education', count: 8, examples: ['Lecture', 'Training', 'Workshop'] },
  { industry: 'Healthcare', count: 6, examples: ['Clinical', 'Research', 'Compliance'] },
  { industry: 'Finance', count: 6, examples: ['Investment', 'Audit', 'Forecast'] },
];

export const GenieDeckArchitectureDiagram: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
            <Presentation className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              Genie Deck
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Presentations</Badge>
            </h2>
            <p className="text-slate-400">AI-Powered Presentation & Document Generation</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PNG
          </Button>
          <Button variant="outline" size="sm">
            <Maximize2 className="h-4 w-4 mr-2" />
            Fullscreen
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-cyan-400">50+</div>
            <div className="text-sm text-slate-400">Templates</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-400">6</div>
            <div className="text-sm text-slate-400">Export Formats</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-violet-400">120+</div>
            <div className="text-sm text-slate-400">Languages</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-400">90%</div>
            <div className="text-sm text-slate-400">Complete</div>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            Core Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deckFeatures.map((feature, i) => (
              <Card key={i} className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">{feature.name}</span>
                    <Badge className={feature.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}>
                      {feature.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-400 mb-3">{feature.description}</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-cyan-400">{feature.progress}%</span>
                    </div>
                    <Progress value={feature.progress} className="h-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Output Formats */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-400" />
            Export Formats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {outputFormats.map((format, i) => (
              <div key={i} className="p-4 bg-slate-700/50 rounded-lg text-center">
                <div className="text-3xl mb-2">{format.icon}</div>
                <div className="font-medium text-white">{format.format}</div>
                <div className="text-xs text-slate-400">{format.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Industry Templates */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-cyan-400" />
            Industry Template Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {industryTemplates.map((industry, i) => (
              <div key={i} className="p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{industry.industry}</span>
                  <Badge className="bg-cyan-500/20 text-cyan-400">{industry.count} templates</Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {industry.examples.map((ex, j) => (
                    <Badge key={j} variant="outline" className="text-xs">{ex}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Implementation Status */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Implementation Progress</span>
            <span className="text-cyan-400">90%</span>
          </div>
          <Progress value={90} className="h-2" />
          <div className="mt-2 text-sm text-slate-400">Phase: P1-P2 (Production Ready)</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GenieDeckArchitectureDiagram;
