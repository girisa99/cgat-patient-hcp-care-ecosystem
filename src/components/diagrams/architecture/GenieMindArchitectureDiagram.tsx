/**
 * Genie Mind Architecture Diagram
 * AI Intelligence Layer with Model Routing, Script Versioning, and TTS Integration
 */

import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Maximize2, X, Brain, Cpu, Mic, FileText, Sparkles, Layers } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const colors = {
  primary: { bg: '#7c3aed', text: '#ffffff' },
  secondary: { bg: '#4f46e5', text: '#ffffff' },
  ai: { bg: '#059669', text: '#ffffff' },
  tts: { bg: '#0ea5e9', text: '#ffffff' },
  script: { bg: '#f97316', text: '#ffffff' },
  complete: { bg: '#10b981', text: '#ffffff' },
  partial: { bg: '#f59e0b', text: '#ffffff' },
  planned: { bg: '#6366f1', text: '#ffffff' },
};

const aiModels = [
  { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', use: 'Script Enhancement, Analysis', status: 'active' },
  { name: 'GPT-4o', provider: 'OpenAI', use: 'Content Generation, Chat', status: 'active' },
  { name: 'GPT-4o Mini', provider: 'OpenAI', use: 'Fast Responses', status: 'active' },
  { name: 'Gemini Pro', provider: 'Google', use: 'Multi-modal, Vision', status: 'active' },
  { name: 'Gemini Flash', provider: 'Google', use: 'Quick Processing', status: 'partial' },
  { name: 'Llama 3.1', provider: 'Meta', use: 'Open Source Fallback', status: 'planned' },
];

const ttsProviders = [
  { name: 'ElevenLabs', voices: ['Rachel', 'Drew', 'Clyde', 'Paul', 'Domi', 'Bella', 'Antoni', 'Elli', 'Josh', 'Arnold'], status: 'active' },
  { name: 'OpenAI TTS', voices: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'], status: 'active' },
  { name: 'Azure Neural', voices: ['Jenny', 'Guy', 'Aria'], status: 'planned' },
  { name: 'Google Cloud', voices: ['Wavenet', 'Neural2'], status: 'planned' },
];

const scriptFeatures = [
  { name: 'AI Enhancement', description: 'Auto-improve scripts with AI', status: 'complete' },
  { name: 'Version Control', description: 'Track script changes', status: 'complete' },
  { name: 'Template Library', description: 'Pre-built script templates', status: 'complete' },
  { name: 'Multi-format Export', description: 'PDF, DOCX, MD export', status: 'complete' },
  { name: 'Collaborative Editing', description: 'Real-time multi-user', status: 'partial' },
  { name: 'Voice Cloning', description: 'Custom voice models', status: 'planned' },
];

export const GenieMindArchitectureDiagram: React.FC = () => {
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
      link.download = 'genie-mind-architecture.png';
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
        return <Badge className="text-xs" style={{ backgroundColor: colors.complete.bg, color: colors.complete.text }}>✓ Active</Badge>;
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
          <Brain className="h-8 w-8 text-purple-400" />
          Genie Mind Architecture
        </h2>
        <p className="text-slate-400 mt-2">AI Intelligence Layer • Model Routing • Script Engine • TTS Integration</p>
      </div>

      {/* AI Models Section */}
      <Card className="bg-slate-800/50 border-purple-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-purple-300 flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            AI Model Router
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {aiModels.map((model) => (
              <div key={model.name} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium text-sm">{model.name}</span>
                  {getStatusBadge(model.status)}
                </div>
                <p className="text-slate-400 text-xs">{model.provider}</p>
                <p className="text-purple-300 text-xs mt-1">{model.use}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* TTS Providers Section */}
      <Card className="bg-slate-800/50 border-cyan-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-cyan-300 flex items-center gap-2">
            <Mic className="h-5 w-5" />
            TTS Integration Hub
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ttsProviders.map((provider) => (
              <div key={provider.name} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium text-sm">{provider.name}</span>
                  {getStatusBadge(provider.status)}
                </div>
                <div className="flex flex-wrap gap-1">
                  {provider.voices.slice(0, 4).map((voice) => (
                    <Badge key={voice} variant="outline" className="text-xs text-cyan-300 border-cyan-500/30">
                      {voice}
                    </Badge>
                  ))}
                  {provider.voices.length > 4 && (
                    <Badge variant="outline" className="text-xs text-slate-400">
                      +{provider.voices.length - 4}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Script Engine Section */}
      <Card className="bg-slate-800/50 border-orange-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-orange-300 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Script Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {scriptFeatures.map((feature) => (
              <div key={feature.name} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-medium text-sm">{feature.name}</span>
                  {getStatusBadge(feature.status)}
                </div>
                <p className="text-slate-400 text-xs">{feature.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Flow */}
      <Card className="bg-slate-800/50 border-emerald-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-emerald-300 flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Data Flow Architecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-white">User Input</span>
              <span className="text-slate-500">→</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-white">AI Router</span>
              <span className="text-slate-500">→</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-white">Script Engine</span>
              <span className="text-slate-500">→</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500" />
              <span className="text-white">TTS Generation</span>
              <span className="text-slate-500">→</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-pink-500" />
              <span className="text-white">Genie Vibe</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 text-center">
        <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-500/30">
          <div className="text-2xl font-bold text-purple-300">6</div>
          <div className="text-xs text-slate-400">AI Models</div>
        </div>
        <div className="bg-cyan-900/30 rounded-lg p-3 border border-cyan-500/30">
          <div className="text-2xl font-bold text-cyan-300">4</div>
          <div className="text-xs text-slate-400">TTS Providers</div>
        </div>
        <div className="bg-orange-900/30 rounded-lg p-3 border border-orange-500/30">
          <div className="text-2xl font-bold text-orange-300">16+</div>
          <div className="text-xs text-slate-400">Voice Options</div>
        </div>
        <div className="bg-emerald-900/30 rounded-lg p-3 border border-emerald-500/30">
          <div className="text-2xl font-bold text-emerald-300">85%</div>
          <div className="text-xs text-slate-400">Complete</div>
        </div>
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/95 overflow-auto">
        <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">Genie Mind Architecture</h2>
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
          <Brain className="h-5 w-5 text-purple-400" />
          Genie Mind Architecture
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

export default GenieMindArchitectureDiagram;
