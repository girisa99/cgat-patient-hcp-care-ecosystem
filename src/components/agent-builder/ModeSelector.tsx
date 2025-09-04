import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Workflow, 
  Settings, 
  Zap, 
  ArrowRight,
  Brain,
  MousePointer,
  Sliders,
  Sparkles,
  Network,
  Activity,
  Eye,
  MonitorPlay
} from 'lucide-react';

export type AgentMode = 'visual' | 'manual' | 'unified' | 'ecosystem' | 'observability' | 'animated-flow';

interface ModeSelectorProps {
  onModeSelect: (mode: AgentMode) => void;
  selectedMode?: AgentMode;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ 
  onModeSelect, 
  selectedMode 
}) => {
  console.log('[ModeSelector] icon types', { Workflow: typeof Workflow, Settings: typeof Settings, Zap: typeof Zap, ArrowRight: typeof ArrowRight, Brain: typeof Brain, MousePointer: typeof MousePointer, Sliders: typeof Sliders });
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Brain className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-2">Choose Your Agent Building Method</h2>
          <p className="text-lg text-muted-foreground">
            Select the approach that best fits your experience and preferences
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
        {/* Unified Workflow Experience - NEW */}
        <Card className={`cursor-pointer transition-all hover:shadow-lg ${
          selectedMode === 'unified' ? 'ring-2 ring-primary border-primary' : ''
        }`}>
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-3">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              Unified Experience
              <Badge variant="default" className="text-xs bg-gradient-to-r from-blue-600 to-purple-600">
                NEW
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Complete guided experience with AI assistance at every step
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">AI-powered scenario generation</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Drag-and-drop with AI suggestions</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Real-time testing & deployment</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Database-synced node library</span>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={() => onModeSelect('unified')}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                variant={selectedMode === 'unified' ? 'default' : 'outline'}
              >
                <Sparkles className="w-4 h-4" />
                Start Unified Builder
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Best for: All users, complete workflows, AI-assisted development
            </div>
          </CardContent>
        </Card>

        {/* Visual Workflow Mode */}
        <Card className={`cursor-pointer transition-all hover:shadow-lg ${
          selectedMode === 'visual' ? 'ring-2 ring-primary border-primary' : ''
        }`}>
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <Workflow className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              Visual Workflow Builder
              <Badge variant="secondary" className="text-xs">
                Recommended
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Build your agent using an intuitive drag-and-drop interface with AI assistance
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Visual flow designer with drag-and-drop</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">AI prompt assistant for quick setup</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Real-time flow testing and validation</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Perfect for beginners and visual learners</span>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={() => onModeSelect('visual')}
                className="w-full flex items-center justify-center gap-2"
                variant={selectedMode === 'visual' ? 'default' : 'outline'}
              >
                <MousePointer className="w-4 h-4" />
                Start Visual Building
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Best for: First-time builders, visual thinkers, rapid prototyping
            </div>
          </CardContent>
        </Card>

        {/* Manual Configuration Mode */}
        <Card className={`cursor-pointer transition-all hover:shadow-lg ${
          selectedMode === 'manual' ? 'ring-2 ring-primary border-primary' : ''
        }`}>
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <Settings className="w-6 h-6 text-purple-600" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              Manual Configuration
              <Badge variant="outline" className="text-xs">
                Advanced
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Configure every aspect of your agent with detailed forms and advanced settings
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Detailed configuration forms</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">AI prompt assistant for initial setup</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Advanced connector and knowledge base setup</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Full control over every parameter</span>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={() => onModeSelect('manual')}
                className="w-full flex items-center justify-center gap-2"
                variant={selectedMode === 'manual' ? 'default' : 'outline'}
              >
                <Sliders className="w-4 h-4" />
                Start Manual Config
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Best for: Experienced users, complex requirements, precise control
            </div>
          </CardContent>
        </Card>

        {/* Agent Ecosystem Management - NEW */}
        <Card className={`cursor-pointer transition-all hover:shadow-lg ${
          selectedMode === 'ecosystem' ? 'ring-2 ring-primary border-primary' : ''
        }`}>
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mb-3">
              <Network className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              Agent Ecosystem
              <Badge variant="default" className="text-xs bg-gradient-to-r from-green-600 to-teal-600">
                MANAGE
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Manage agent lifecycle, deployments, and performance monitoring
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Agent lifecycle management</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Workflow deployment bridge</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Performance monitoring</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Multi-agent orchestration</span>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={() => onModeSelect('ecosystem')}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                variant={selectedMode === 'ecosystem' ? 'default' : 'outline'}
              >
                <Network className="w-4 h-4" />
                Manage Ecosystem
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Best for: Production agents, DevOps, performance optimization
            </div>
          </CardContent>
        </Card>

        {/* AI Observability */}
        <Card className={`cursor-pointer transition-all hover:shadow-lg ${
          selectedMode === 'observability' ? 'ring-2 ring-primary border-primary' : ''
        }`}>
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-3">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              AI Observability
              <Badge variant="default" className="text-xs bg-gradient-to-r from-orange-600 to-red-600">
                MONITOR
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Monitor and analyze AI workflows with Arize and LangWatch
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Real-time monitoring</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Arize vs LangWatch comparison</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Performance metrics</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Trace analysis</span>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={() => onModeSelect('observability')}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                variant={selectedMode === 'observability' ? 'default' : 'outline'}
              >
                <Eye className="w-4 h-4" />
                Monitor Workflows
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Best for: Production monitoring, performance analysis, observability
            </div>
          </CardContent>
        </Card>

        {/* Animated Flow Visualizer */}
        <Card className={`cursor-pointer transition-all hover:shadow-lg ${
          selectedMode === 'animated-flow' ? 'ring-2 ring-primary border-primary' : ''
        }`}>
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-3">
              <MonitorPlay className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              Animated Flow
              <Badge variant="default" className="text-xs bg-gradient-to-r from-purple-600 to-pink-600">
                VISUAL
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Real-time workflow execution with animated visual feedback
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Live execution tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Node status indicators</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Flow animations</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Test mode</span>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={() => onModeSelect('animated-flow')}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                variant={selectedMode === 'animated-flow' ? 'default' : 'outline'}
              >
                <MonitorPlay className="w-4 h-4" />
                Visualize Flow
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Best for: Testing, debugging, workflow visualization
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Prompt Assistant Feature */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">AI Prompt Assistant Available in Both Modes</h3>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              No matter which mode you choose, you can describe what you want to build in plain English. 
              Our AI will generate the initial configuration and you can refine it using your preferred method.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-muted-foreground">
        You can switch between modes at any time during the building process
      </div>
    </div>
  );
};