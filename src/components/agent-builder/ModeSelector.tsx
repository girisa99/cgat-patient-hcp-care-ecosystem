import React, { useEffect, useRef, useState } from 'react';
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
  MonitorPlay,
  Shield,
  Gavel,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export type AgentMode = 'visual' | 'manual' | 'unified' | 'ecosystem' | 'observability' | 'animated-flow' | 'security' | 'governance' | 'consolidated';

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
  userRole 
}) => {
  console.log('[ModeSelector] icon types', { Workflow: typeof Workflow, Settings: typeof Settings, Zap: typeof Zap, ArrowRight: typeof ArrowRight, Brain: typeof Brain, MousePointer: typeof MousePointer, Sliders: typeof Sliders });
  
  // Filter modes based on user role (onboarding sees all options but guided copy)
  const isCustomerOnboarding = userRole === 'onboardingTeam';
  const recommendedModes = ['unified', 'visual', 'manual', 'ecosystem', 'observability', 'animated-flow', 'security', 'governance', 'consolidated'] as const;

  // Horizontal scroll helpers
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  const scrollByAmount = (dx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dx, behavior: 'smooth' });
  };

  useEffect(() => {
    if (layout !== 'horizontal-scroll') return;
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => updateScrollButtons();
    updateScrollButtons();
    el.addEventListener('scroll', onScroll);
    const ResizeObs = (window as any).ResizeObserver;
    const ro = ResizeObs ? new ResizeObs(updateScrollButtons) : null;
    if (ro) ro.observe(el);
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (ro) ro.disconnect();
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [layout]);

  const getAllModeCards = () => {
    const allCards = [
      /* Unified Workflow Experience - NEW */
      <Card key="unified" className={`cursor-pointer transition-all hover:shadow-lg flex-shrink-0 ${layout === 'horizontal-scroll' ? 'w-80 snap-center' : ''} ${
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
      </Card>,

      /* Visual Workflow Mode */
      <Card key="visual" className={`cursor-pointer transition-all hover:shadow-lg flex-shrink-0 ${layout === 'horizontal-scroll' ? 'w-80 snap-center' : ''} ${
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
      </Card>,

      /* Manual Configuration Mode */
      <Card key="manual" className={`cursor-pointer transition-all hover:shadow-lg flex-shrink-0 ${layout === 'horizontal-scroll' ? 'w-80 snap-center' : ''} ${
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
      </Card>,

      /* Agent Ecosystem Management - NEW */
      <Card key="ecosystem" className={`cursor-pointer transition-all hover:shadow-lg flex-shrink-0 ${layout === 'horizontal-scroll' ? 'w-80 snap-center' : ''} ${
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
      </Card>,

      /* AI Observability */
      <Card key="observability" className={`cursor-pointer transition-all hover:shadow-lg flex-shrink-0 ${layout === 'horizontal-scroll' ? 'w-80 snap-center' : ''} ${
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
      </Card>,

      /* Animated Flow Visualizer */
      <Card key="animated-flow" className={`cursor-pointer transition-all hover:shadow-lg flex-shrink-0 ${layout === 'horizontal-scroll' ? 'w-80 snap-center' : ''} ${
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
      </Card>,

      /* Security & Compliance */
      <Card key="security" className={`cursor-pointer transition-all hover:shadow-lg flex-shrink-0 ${layout === 'horizontal-scroll' ? 'w-80 snap-center' : ''} ${
        selectedMode === 'security' ? 'ring-2 ring-primary border-primary' : ''
      }`}>
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center mb-3">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              Security & Compliance
              <Badge variant="destructive" className="text-xs">
                SECURE
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Comprehensive security monitoring and regulatory compliance
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Vulnerability scanning</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">HIPAA/GDPR compliance</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Access control management</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Audit trail monitoring</span>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={() => onModeSelect('security')}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                variant={selectedMode === 'security' ? 'default' : 'outline'}
              >
                <Shield className="w-4 h-4" />
                Security Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Best for: Enterprise security, compliance officers, auditors
            </div>
          </CardContent>
      </Card>,

      /* AI Governance */
      <Card key="governance" className={`cursor-pointer transition-all hover:shadow-lg flex-shrink-0 ${layout === 'horizontal-scroll' ? 'w-80 snap-center' : ''} ${
        selectedMode === 'governance' ? 'ring-2 ring-primary border-primary' : ''
      }`}>
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center mb-3">
              <Gavel className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              AI Governance
              <Badge variant="default" className="text-xs bg-gradient-to-r from-indigo-600 to-blue-600">
                GOVERN
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              AI ethics, policy management, and governance workflows
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Policy compliance tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Approval workflows</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Risk management</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">AI ethics monitoring</span>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={() => onModeSelect('governance')}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
                variant={selectedMode === 'governance' ? 'default' : 'outline'}
              >
                <Gavel className="w-4 h-4" />
                Governance Center
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Best for: Governance officers, policy managers, risk teams
            </div>
          </CardContent>
      </Card>,

      // Consolidated Management Card
      {
        key: 'consolidated',
        element: <Card 
          key="consolidated"
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
            selectedMode === 'consolidated' ? 'ring-2 ring-primary shadow-lg' : ''
          }`}
          onClick={() => onModeSelect('consolidated')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Network className="w-5 h-5 text-blue-600" />
              Consolidated Management
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <p className="text-sm text-muted-foreground">
              Complete agent lifecycle with structured workflow - consolidates all existing integrations including Patient Enrollment, Healthcare MCP, multi-channel deployment, and real-time monitoring.
            </p>

            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">Patient Enrollment</Badge>
                <Badge variant="secondary" className="text-xs">Healthcare MCP</Badge>
                <Badge variant="secondary" className="text-xs">Multi-Channel</Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">Arize/LangWatch</Badge>
                <Badge variant="secondary" className="text-xs">Real-time Sync</Badge>
                <Badge variant="secondary" className="text-xs">Voice Integration</Badge>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={() => onModeSelect('consolidated')}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                variant={selectedMode === 'consolidated' ? 'default' : 'outline'}
              >
                <Network className="w-4 h-4" />
                Consolidated Workflow
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Best for: Complete agent lifecycle management with all integrations
            </div>
          </CardContent>
      </Card>
      }
    ];

    return allCards.filter(card => 
      recommendedModes.includes(card.key as AgentMode)
    );
  };

  return (
    <div className="max-w-full mx-auto space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Brain className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-2">
            {isCustomerOnboarding ? 'Choose Your Onboarding Method' : 'Choose Your Agent Building Method'}
          </h2>
          <p className="text-lg text-muted-foreground">
            {isCustomerOnboarding 
              ? 'Select the approach that works best for your customer onboarding process'
              : 'Select the approach that best fits your experience and preferences'
            }
          </p>
        </div>
      </div>

      {layout === 'horizontal-scroll' ? (
        <div className="relative">
          {/* Edge fades */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-background to-transparent" />

          {/* Scroll container */}
          <div ref={scrollRef} className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {getAllModeCards()}
          </div>

          {/* Arrows */}
          {canScrollLeft && (
            <div className="absolute left-2 top-1/2 -translate-y-1/2">
              <Button variant="secondary" size="icon" onClick={() => scrollByAmount(-320)} aria-label="Scroll left">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </div>
          )}
          {canScrollRight && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Button variant="secondary" size="icon" onClick={() => scrollByAmount(320)} aria-label="Scroll right">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}

          {/* Scroll indicators */}
          <div className="flex justify-center mt-4 gap-2">
            {getAllModeCards().map((_, index) => (
              <div key={index} className="w-2 h-2 rounded-full bg-muted" />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
          {getAllModeCards()}
        </div>
      )}

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