import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Workflow, 
  ArrowRight,
  Brain,
  MousePointer,
  Sparkles,
  Activity,
  Eye
} from 'lucide-react';

// Simplified to 3 core modes: unified, visual, observability
export type AgentMode = 'visual' | 'unified' | 'observability';

interface ModeSelectorProps {
  onModeSelect: (mode: AgentMode) => void;
  selectedMode?: AgentMode;
  layout?: 'grid' | 'horizontal-scroll';
  userRole?: string;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ 
  onModeSelect, 
  selectedMode,
  layout = 'grid',
}) => {
  const modeCards = [
    // Unified Experience - Primary
    <Card 
      key="unified" 
      className={`cursor-pointer transition-all hover:shadow-lg ${
        selectedMode === 'unified' ? 'ring-2 ring-primary border-primary' : ''
      }`}
      onClick={() => onModeSelect('unified')}
    >
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-3">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          AI-Assisted Builder
          <Badge variant="default" className="text-xs bg-gradient-to-r from-blue-600 to-purple-600">
            RECOMMENDED
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          Complete guided experience with AI assistance at every step
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-sm">AI-powered workflow generation</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-sm">Drag-and-drop with AI suggestions</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-sm">Real-time testing & deployment</span>
          </div>
        </div>

        <Button 
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Sparkles className="w-4 h-4" />
          Start Building
          <ArrowRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>,

    // Visual Workflow Builder
    <Card 
      key="visual" 
      className={`cursor-pointer transition-all hover:shadow-lg ${
        selectedMode === 'visual' ? 'ring-2 ring-primary border-primary' : ''
      }`}
      onClick={() => onModeSelect('visual')}
    >
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
          <Workflow className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          Visual Canvas
          <Badge variant="secondary" className="text-xs">
            Drag & Drop
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          Build workflows using drag-and-drop with 182 node types
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-sm">Visual flow designer</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-sm">31 node categories</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-sm">Templates & connectors</span>
          </div>
        </div>

        <Button 
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
        >
          <MousePointer className="w-4 h-4" />
          Open Canvas
          <ArrowRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>,

    // Observability
    <Card 
      key="observability" 
      className={`cursor-pointer transition-all hover:shadow-lg ${
        selectedMode === 'observability' ? 'ring-2 ring-primary border-primary' : ''
      }`}
      onClick={() => onModeSelect('observability')}
    >
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-3">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          Observability
          <Badge variant="default" className="text-xs bg-gradient-to-r from-orange-600 to-red-600">
            MONITOR
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          Monitor AI workflows with Arize and LangWatch integrations
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-sm">Real-time monitoring</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-sm">Arize & LangWatch</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-sm">Trace analysis</span>
          </div>
        </div>

        <Button 
          variant="outline"
          className="w-full flex items-center justify-center gap-2 border-orange-200 hover:bg-orange-50"
        >
          <Eye className="w-4 h-4" />
          View Metrics
          <ArrowRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Choose Your Building Mode</h2>
        <p className="text-sm text-muted-foreground">
          Select how you want to create and manage your AI agents
        </p>
      </div>

      <div className={layout === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        : "flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
      }>
        {modeCards}
      </div>
    </div>
  );
};

export default ModeSelector;
