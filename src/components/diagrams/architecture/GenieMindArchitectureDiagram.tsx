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
        backgroundColor: '#ffffff',
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
          <Brain className="h-8 w-8 text-purple-500" />
          Genie Mind Architecture
        </h2>
        <p className="text-muted-foreground mt-2">AI Intelligence Layer • Model Routing • Script Engine • TTS Integration</p>
      </div>

      {/* AI Models Section */}
      <Card className="border-2 border-purple-200 dark:border-purple-800/40 bg-purple-50/50 dark:bg-purple-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-purple-700 dark:text-purple-400 flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            AI Model Router
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {aiModels.map((model) => (
              <div key={model.name} className="bg-background rounded-lg p-3 border-2 border-border shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-foreground font-semibold text-sm">{model.name}</span>
                  {getStatusBadge(model.status)}
                </div>
                <p className="text-muted-foreground text-xs font-medium">{model.provider}</p>
                <p className="text-purple-600 dark:text-purple-400 text-xs mt-1">{model.use}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* TTS Providers Section */}
      <Card className="border-2 border-cyan-200 dark:border-cyan-800/40 bg-cyan-50/50 dark:bg-cyan-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-cyan-700 dark:text-cyan-400 flex items-center gap-2">
            <Mic className="h-5 w-5" />
            TTS Integration Hub
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ttsProviders.map((provider) => (
              <div key={provider.name} className="bg-background rounded-lg p-3 border-2 border-border shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-foreground font-semibold text-sm">{provider.name}</span>
                  {getStatusBadge(provider.status)}
                </div>
                <div className="flex flex-wrap gap-1">
                  {provider.voices.slice(0, 4).map((voice) => (
                    <Badge key={voice} variant="secondary" className="text-xs bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300">
                      {voice}
                    </Badge>
                  ))}
                  {provider.voices.length > 4 && (
                    <Badge variant="secondary" className="text-xs">
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
      <Card className="border-2 border-orange-200 dark:border-orange-800/40 bg-orange-50/50 dark:bg-orange-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-orange-700 dark:text-orange-400 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Script Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {scriptFeatures.map((feature) => (
              <div key={feature.name} className="bg-background rounded-lg p-3 border-2 border-border shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-foreground font-semibold text-sm">{feature.name}</span>
                  {getStatusBadge(feature.status)}
                </div>
                <p className="text-muted-foreground text-xs">{feature.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Flow */}
      <Card className="border-2 border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Data Flow Architecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between flex-wrap gap-4 text-sm">
            {[
              { label: 'User Input', color: 'purple' },
              { label: 'AI Router', color: 'emerald' },
              { label: 'Script Engine', color: 'orange' },
              { label: 'TTS Generation', color: 'cyan' },
              { label: 'Genie Vibe', color: 'pink' },
            ].map((item, index, arr) => (
              <React.Fragment key={item.label}>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-${item.color}-500`} />
                  <span className="text-foreground font-medium">{item.label}</span>
                </div>
                {index < arr.length - 1 && (
                  <span className="text-muted-foreground font-bold">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 text-center">
        <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3 border-2 border-purple-200 dark:border-purple-800/40">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">6</div>
          <div className="text-xs text-muted-foreground font-medium">AI Models</div>
        </div>
        <div className="bg-cyan-50 dark:bg-cyan-950/20 rounded-lg p-3 border-2 border-cyan-200 dark:border-cyan-800/40">
          <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">4</div>
          <div className="text-xs text-muted-foreground font-medium">TTS Providers</div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-3 border-2 border-orange-200 dark:border-orange-800/40">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">16+</div>
          <div className="text-xs text-muted-foreground font-medium">Voice Options</div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-3 border-2 border-emerald-200 dark:border-emerald-800/40">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">85%</div>
          <div className="text-xs text-muted-foreground font-medium">Complete</div>
        </div>
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background overflow-auto">
        <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
          <h2 className="text-foreground font-semibold text-lg">Genie Mind Architecture</h2>
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
          <Brain className="h-5 w-5 text-purple-500" />
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
