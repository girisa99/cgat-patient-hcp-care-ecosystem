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
  Sliders
} from 'lucide-react';

export type AgentMode = 'visual' | 'manual';

interface ModeSelectorProps {
  onModeSelect: (mode: AgentMode) => void;
  selectedMode?: AgentMode;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ 
  onModeSelect, 
  selectedMode 
}) => {
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

      <div className="grid md:grid-cols-2 gap-6">
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