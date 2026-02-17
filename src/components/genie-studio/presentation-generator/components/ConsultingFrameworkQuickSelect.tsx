/**
 * Consulting Framework Quick Select Component
 * Pre-defined consulting templates for fast generation
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Zap, 
  ChevronRight, 
  Building2, 
  TrendingUp, 
  Target,
  BarChart3,
  Layers,
  GitBranch,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FLOW_SHORTCUTS, applyConsultingFrameworkPreset, FlowAutoConfig } from '../utils/flowShortcuts';

interface ConsultingFramework {
  id: string;
  name: string;
  firm: string;
  description: string;
  icon: React.ReactNode;
  frameworks: string[];
  color: string;
  bgColor: string;
}

const CONSULTING_FRAMEWORKS: ConsultingFramework[] = [
  {
    id: 'tier1-strategy',
    name: 'Tier 1 Strategy',
    firm: 'Executive Consulting',
    description: 'Strategic analysis with organizational framework, structured reasoning, and pyramid communication',
    icon: <Building2 className="h-5 w-5" />,
    frameworks: ['7S Framework', 'MECE', 'Pyramid Principle', 'Three Horizons'],
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100'
  },
  {
    id: 'portfolio-analysis',
    name: 'Portfolio Analysis',
    firm: 'Growth Strategy',
    description: 'Portfolio optimization with growth-share analysis and experience curves',
    icon: <TrendingUp className="h-5 w-5" />,
    frameworks: ['Growth-Share Matrix', 'Experience Curve', 'Advantage Matrix', 'Portfolio Optimization'],
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100'
  },
  {
    id: 'results-delivery',
    name: 'Results Delivery',
    firm: 'Performance Focus',
    description: 'Results-focused with customer loyalty metrics and decision frameworks',
    icon: <Target className="h-5 w-5" />,
    frameworks: ['Customer Metrics', 'Results Framework', 'Decision Insights', 'Full Potential'],
    color: 'text-red-600',
    bgColor: 'bg-red-50 hover:bg-red-100'
  },
  {
    id: 'universal-strategy',
    name: 'Universal Strategy',
    firm: 'Balanced Framework',
    description: 'Comprehensive approach with competitive analysis and value chain mapping',
    icon: <BarChart3 className="h-5 w-5" />,
    frameworks: ['SWOT Analysis', 'Competitive Forces', 'Value Chain', 'Market Analysis'],
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100'
  },
  {
    id: 'innovation-framework',
    name: 'Innovation Framework',
    firm: 'Design & Innovation',
    description: 'Innovation-centered approach with design thinking and lean methodologies',
    icon: <Layers className="h-5 w-5" />,
    frameworks: ['Design Thinking', 'Lean Startup', 'Blue Ocean', 'Jobs To Be Done'],
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 hover:bg-orange-100'
  },
  {
    id: 'agile-transformation',
    name: 'Agile Transformation',
    firm: 'Digital & Agile',
    description: 'Agile methodologies with digital transformation and continuous improvement',
    icon: <GitBranch className="h-5 w-5" />,
    frameworks: ['Agile/Scrum', 'OKRs', 'DevOps', 'Continuous Improvement'],
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50 hover:bg-cyan-100'
  }
];

interface ConsultingFrameworkQuickSelectProps {
  onSelect: (config: FlowAutoConfig) => void;
  onQuickGenerate?: (frameworkId: string) => void;
  compact?: boolean;
  className?: string;
}

export function ConsultingFrameworkQuickSelect({
  onSelect,
  onQuickGenerate,
  compact = false,
  className
}: ConsultingFrameworkQuickSelectProps) {
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const handleFrameworkSelect = (framework: ConsultingFramework) => {
    setSelectedFramework(framework.id);
    const config = applyConsultingFrameworkPreset(framework.id);
    onSelect(config);
  };
  
  const handleQuickGenerate = (framework: ConsultingFramework) => {
    handleFrameworkSelect(framework);
    onQuickGenerate?.(framework.id);
  };
  
  if (compact) {
    return (
      <div className={cn("grid grid-cols-2 gap-2", className)}>
        {CONSULTING_FRAMEWORKS.map((framework) => (
          <Button
            key={framework.id}
            variant="outline"
            size="sm"
            onClick={() => handleFrameworkSelect(framework)}
            className={cn(
              "h-auto py-2 px-3 justify-start gap-2",
              selectedFramework === framework.id && "ring-2 ring-primary"
            )}
          >
            <span className={framework.color}>{framework.icon}</span>
            <span className="text-xs truncate">{framework.name}</span>
          </Button>
        ))}
      </div>
    );
  }
  
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Consulting Framework Templates</h3>
          <p className="text-xs text-muted-foreground">
            Pre-configured templates with industry-standard frameworks
          </p>
        </div>
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1">
              <Info className="h-3.5 w-3.5" />
              Learn More
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Consulting Framework Templates</DialogTitle>
              <DialogDescription>
                Professional templates based on top consulting firm methodologies
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {CONSULTING_FRAMEWORKS.map((framework) => (
                <div key={framework.id} className="flex gap-4 p-4 rounded-lg border">
                  <div className={cn("p-3 rounded-lg", framework.bgColor, framework.color)}>
                    {framework.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{framework.name}</h4>
                    <p className="text-sm text-muted-foreground">{framework.firm}</p>
                    <p className="text-xs text-muted-foreground mt-1">{framework.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {framework.frameworks.map((fw, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {fw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CONSULTING_FRAMEWORKS.map((framework) => (
          <Card
            key={framework.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              selectedFramework === framework.id && "ring-2 ring-primary"
            )}
            onClick={() => handleFrameworkSelect(framework)}
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between">
                <div className={cn("p-2 rounded-lg", framework.bgColor, framework.color)}>
                  {framework.icon}
                </div>
                {onQuickGenerate && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1 text-xs h-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickGenerate(framework);
                    }}
                  >
                    <Zap className="h-3 w-3" />
                    Quick
                  </Button>
                )}
              </div>
              <CardTitle className="text-sm mt-2">{framework.name}</CardTitle>
              <CardDescription className="text-xs">{framework.firm}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex flex-wrap gap-1">
                {framework.frameworks.slice(0, 3).map((fw, idx) => (
                  <Badge key={idx} variant="secondary" className="text-[10px] px-1.5 py-0">
                    {fw}
                  </Badge>
                ))}
                {framework.frameworks.length > 3 && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    +{framework.frameworks.length - 3}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ConsultingFrameworkQuickSelect;
