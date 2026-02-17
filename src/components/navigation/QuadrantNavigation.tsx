/**
 * QuadrantNavigation - 4-Quadrant Unified Workflow Architecture
 * 
 * Simplifies Genie Studio UI/UX by consolidating 206 pipelines into 4 sequential task-based flows:
 * 1. CREATE (Spark, Mind, Deck) - Script/slide generation
 * 2. PRODUCE (Vibe) - Audio/video production
 * 3. MANAGE (Arc, Hub) - Scheduling/assets
 * 4. PUBLISH (Cast) - Distribution
 * 
 * Ask Genie serves as universal support via floating FAB
 * 
 * @see memory/strategy/4-quadrant-unified-workflow-architecture
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Sparkles,
  Video,
  Calendar,
  Send,
  ChevronRight,
  ChevronLeft,
  Wand2,
  Brain,
  Presentation,
  Mic,
  Film,
  LayoutDashboard,
  Users,
  Share2,
  BarChart,
  Menu,
  X,
} from 'lucide-react';

// Import logos
import genieSparkLogo from '@/assets/logos/genie-spark-combined.png';
import genieMindLogo from '@/assets/logos/genie-mind-combined.png';
import genieVibeLogo from '@/assets/logos/genie-vibe-combined.png';
import genieDeckLogo from '@/assets/logos/genie-deck-combined.png';
import genieArcLogo from '@/assets/logos/genie-arc-combined.png';
import genieCastLogo from '@/assets/logos/genie-cast-logo.png';

export type Quadrant = 'create' | 'produce' | 'manage' | 'publish';

export interface QuadrantConfig {
  id: Quadrant;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  products: {
    id: string;
    name: string;
    logo: string;
    route: string;
    description: string;
    icon: React.ReactNode;
  }[];
  primaryRoute: string;
}

export const QUADRANT_CONFIG: QuadrantConfig[] = [
  {
    id: 'create',
    label: 'CREATE',
    description: 'Generate scripts, presentations & ideas',
    icon: <Sparkles className="h-5 w-5" />,
    color: 'text-amber-500',
    bgGradient: 'from-amber-500/10 to-amber-600/5',
    primaryRoute: '/genie-spark',
    products: [
      {
        id: 'spark',
        name: 'Genie Spark',
        logo: genieSparkLogo,
        route: '/genie-spark',
        description: 'AI ideation & script generation',
        icon: <Wand2 className="h-4 w-4" />,
      },
      {
        id: 'mind',
        name: 'Genie Mind',
        logo: genieMindLogo,
        route: '/genie-mind',
        description: 'Script enhancement & TTS',
        icon: <Brain className="h-4 w-4" />,
      },
      {
        id: 'deck',
        name: 'Genie Deck',
        logo: genieDeckLogo,
        route: '/genie-deck',
        description: 'AI presentation builder',
        icon: <Presentation className="h-4 w-4" />,
      },
    ],
  },
  {
    id: 'produce',
    label: 'PRODUCE',
    description: 'Record, edit & produce media',
    icon: <Video className="h-5 w-5" />,
    color: 'text-rose-500',
    bgGradient: 'from-rose-500/10 to-rose-600/5',
    primaryRoute: '/genie-vibe',
    products: [
      {
        id: 'vibe',
        name: 'Genie Vibe',
        logo: genieVibeLogo,
        route: '/genie-vibe',
        description: 'Recording studio & video editing',
        icon: <Mic className="h-4 w-4" />,
      },
      {
        id: 'editor',
        name: 'Timeline Editor',
        logo: genieVibeLogo,
        route: '/genie-vibe?tab=editor',
        description: 'Multi-track A/V editing',
        icon: <Film className="h-4 w-4" />,
      },
    ],
  },
  {
    id: 'manage',
    label: 'MANAGE',
    description: 'Schedule, organize & collaborate',
    icon: <Calendar className="h-5 w-5" />,
    color: 'text-blue-500',
    bgGradient: 'from-blue-500/10 to-blue-600/5',
    primaryRoute: '/genie-admin?tab=kanban',
    products: [
      {
        id: 'hub',
        name: 'Production Hub',
        logo: genieArcLogo,
        route: '/genie-admin?tab=kanban',
        description: 'Kanban & project management',
        icon: <LayoutDashboard className="h-4 w-4" />,
      },
      {
        id: 'calendar',
        name: 'Calendar',
        logo: genieArcLogo,
        route: '/genie-admin?tab=calendar',
        description: 'Scheduling & deadlines',
        icon: <Calendar className="h-4 w-4" />,
      },
      {
        id: 'team',
        name: 'Team',
        logo: genieArcLogo,
        route: '/genie-admin?tab=team',
        description: 'Team & workspace management',
        icon: <Users className="h-4 w-4" />,
      },
    ],
  },
  {
    id: 'publish',
    label: 'PUBLISH',
    description: 'Distribute & track performance',
    icon: <Send className="h-5 w-5" />,
    color: 'text-emerald-500',
    bgGradient: 'from-emerald-500/10 to-emerald-600/5',
    primaryRoute: '/genie-admin?tab=scheduler',
    products: [
      {
        id: 'cast',
        name: 'Genie Cast',
        logo: genieCastLogo,
        route: '/genie-admin?tab=scheduler',
        description: 'Multi-platform publishing',
        icon: <Share2 className="h-4 w-4" />,
      },
      {
        id: 'analytics',
        name: 'Analytics',
        logo: genieCastLogo,
        route: '/genie-admin?tab=analytics',
        description: 'Performance tracking',
        icon: <BarChart className="h-4 w-4" />,
      },
    ],
  },
];

interface QuadrantNavigationProps {
  variant?: 'horizontal' | 'vertical' | 'compact';
  showLabels?: boolean;
  className?: string;
}

export const QuadrantNavigation: React.FC<QuadrantNavigationProps> = ({
  variant = 'horizontal',
  showLabels = true,
  className,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedQuadrant, setExpandedQuadrant] = useState<Quadrant | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determine active quadrant based on current route
  const getActiveQuadrant = (): Quadrant | null => {
    const path = location.pathname;
    const search = location.search;
    const fullPath = path + search;

    if (path.includes('spark') || path.includes('mind') || path.includes('deck')) {
      return 'create';
    }
    if (path.includes('vibe')) {
      return 'produce';
    }
    if (path.includes('admin') && (fullPath.includes('kanban') || fullPath.includes('calendar') || fullPath.includes('team') || fullPath.includes('content') || fullPath.includes('composition'))) {
      return 'manage';
    }
    if (path.includes('admin') && (fullPath.includes('scheduler') || fullPath.includes('analytics'))) {
      return 'publish';
    }
    return null;
  };

  const activeQuadrant = getActiveQuadrant();

  const handleQuadrantClick = (quadrant: QuadrantConfig) => {
    if (expandedQuadrant === quadrant.id) {
      // Navigate to primary route
      navigate(quadrant.primaryRoute);
      setExpandedQuadrant(null);
    } else {
      setExpandedQuadrant(quadrant.id);
    }
  };

  const handleProductClick = (route: string) => {
    navigate(route);
    setExpandedQuadrant(null);
    setIsMobileMenuOpen(false);
  };

  // Horizontal variant (top nav) - used in QuadrantLayout header
  if (variant === 'horizontal') {
    return (
      <TooltipProvider>
        <nav className={cn('w-full', className)}>
          {/* Mobile toggle */}
          <div className="flex md:hidden items-center justify-between px-4 py-3">
            <span className="text-sm font-semibold">Navigation</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Desktop horizontal nav */}
          <div className="hidden md:flex items-center justify-center gap-2 px-4 py-2">
            {QUADRANT_CONFIG.map((quadrant, index) => (
              <React.Fragment key={quadrant.id}>
                {/* Arrow separator */}
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                )}

                <div className="relative">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={activeQuadrant === quadrant.id ? 'default' : 'ghost'}
                        size="sm"
                        className={cn(
                          'flex items-center gap-2 transition-all',
                          activeQuadrant === quadrant.id && 'shadow-md',
                          expandedQuadrant === quadrant.id && 'ring-2 ring-primary/20'
                        )}
                        onClick={() => handleQuadrantClick(quadrant)}
                      >
                        <span className={activeQuadrant === quadrant.id ? '' : quadrant.color}>
                          {quadrant.icon}
                        </span>
                        {showLabels && <span>{quadrant.label}</span>}
                        <Badge variant="outline" className="ml-1 text-[10px]">
                          {quadrant.products.length}
                        </Badge>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{quadrant.description}</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Dropdown for products */}
                  {expandedQuadrant === quadrant.id && (
                    <div className="absolute top-full left-0 mt-2 w-64 rounded-lg border bg-popover p-2 shadow-lg animate-in fade-in-0 zoom-in-95 z-50">
                      <div className="space-y-1">
                        {quadrant.products.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => handleProductClick(product.route)}
                            className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-muted transition-colors"
                          >
                            <div className={cn('flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br', quadrant.bgGradient)}>
                              {product.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{product.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{product.description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Mobile expanded menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t bg-muted/50 p-4 space-y-4 animate-in slide-in-from-top-2">
              {QUADRANT_CONFIG.map((quadrant) => (
                <div key={quadrant.id} className="space-y-2">
                  <div className={cn('flex items-center gap-2 text-sm font-semibold', quadrant.color)}>
                    {quadrant.icon}
                    <span>{quadrant.label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pl-7">
                    {quadrant.products.map((product) => (
                      <Button
                        key={product.id}
                        variant="outline"
                        size="sm"
                        className="justify-start text-xs"
                        onClick={() => handleProductClick(product.route)}
                      >
                        {product.icon}
                        <span className="ml-1 truncate">{product.name.replace('Genie ', '')}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </nav>
      </TooltipProvider>
    );
  }

  // Vertical variant (sidebar)
  if (variant === 'vertical') {
    return (
      <TooltipProvider>
        <nav className={cn('flex flex-col gap-1 p-2', className)}>
          {QUADRANT_CONFIG.map((quadrant, index) => (
            <React.Fragment key={quadrant.id}>
              {index > 0 && (
                <div className="flex justify-center py-1">
                  <ChevronRight className="h-3 w-3 text-muted-foreground/30 rotate-90" />
                </div>
              )}

              <div className="space-y-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeQuadrant === quadrant.id ? 'secondary' : 'ghost'}
                      size="sm"
                      className={cn(
                        'w-full justify-start gap-2',
                        activeQuadrant === quadrant.id && 'bg-primary/10 border border-primary/20'
                      )}
                      onClick={() => handleQuadrantClick(quadrant)}
                    >
                      <span className={activeQuadrant === quadrant.id ? 'text-primary' : quadrant.color}>
                        {quadrant.icon}
                      </span>
                      {showLabels && <span className="flex-1 text-left">{quadrant.label}</span>}
                      <ChevronRight
                        className={cn(
                          'h-4 w-4 text-muted-foreground transition-transform',
                          expandedQuadrant === quadrant.id && 'rotate-90'
                        )}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{quadrant.description}</p>
                  </TooltipContent>
                </Tooltip>

                {/* Expanded products */}
                {expandedQuadrant === quadrant.id && (
                  <div className="pl-6 space-y-1 animate-in slide-in-from-left-2">
                    {quadrant.products.map((product) => (
                      <Button
                        key={product.id}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2 h-8 text-xs"
                        onClick={() => handleProductClick(product.route)}
                      >
                        {product.icon}
                        <span className="truncate">{product.name.replace('Genie ', '')}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </React.Fragment>
          ))}
        </nav>
      </TooltipProvider>
    );
  }

  // Compact variant (just icons)
  return (
    <TooltipProvider>
      <nav className={cn('flex items-center gap-1', className)}>
        {QUADRANT_CONFIG.map((quadrant) => (
          <Tooltip key={quadrant.id}>
            <TooltipTrigger asChild>
              <Button
                variant={activeQuadrant === quadrant.id ? 'default' : 'ghost'}
                size="icon"
                className={cn('h-8 w-8', activeQuadrant !== quadrant.id && quadrant.color)}
                onClick={() => navigate(quadrant.primaryRoute)}
              >
                {quadrant.icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-semibold">{quadrant.label}</p>
              <p className="text-xs text-muted-foreground">{quadrant.description}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </nav>
    </TooltipProvider>
  );
};

export default QuadrantNavigation;
