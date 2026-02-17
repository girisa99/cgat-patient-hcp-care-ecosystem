/**
 * Powered By End Card Component
 * 
 * Displays which Genie products and AI models were used to generate a video.
 * Serves as the "meta-layer" transparency card per the messaging playbook.
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Brain, Film, Mic, Image, Layers, Clock, Sparkles } from 'lucide-react';

interface PoweredByProduct {
  id: string;
  name: string;
  tagline: string;
  role: string;
  icon: string;
}

interface PoweredByModel {
  task: string;
  model: string;
}

export interface PoweredByData {
  products: PoweredByProduct[];
  models: PoweredByModel[];
  ecosystemMessage: string;
  generationTimeSec?: number;
  totalCredits?: number;
  frameworkUsed?: string;
  audienceSegment?: string;
}

interface PoweredByEndCardProps {
  data: PoweredByData;
  variant?: 'full' | 'compact' | 'badge';
  className?: string;
}

const TASK_ICONS: Record<string, React.ReactNode> = {
  llm: <Brain className="w-3.5 h-3.5" />,
  tts: <Mic className="w-3.5 h-3.5" />,
  video: <Film className="w-3.5 h-3.5" />,
  image: <Image className="w-3.5 h-3.5" />,
  assembly: <Layers className="w-3.5 h-3.5" />,
};

export const PoweredByEndCard: React.FC<PoweredByEndCardProps> = ({
  data,
  variant = 'full',
  className = '',
}) => {
  if (variant === 'badge') {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur-sm rounded-lg border border-border ${className}`}>
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-xs text-muted-foreground">
          Powered by {data.products.length} Products • {data.models.length} AI Models
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        {data.products.map((product) => (
          <Badge
            key={product.id}
            variant="outline"
            className="text-xs bg-background/80 border-primary/20"
          >
            <span className="mr-1">{product.icon}</span>
            {product.name}
          </Badge>
        ))}
        {data.generationTimeSec != null && (
          <Badge variant="secondary" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {Math.round(data.generationTimeSec)}s
          </Badge>
        )}
      </div>
    );
  }

  // Full variant
  return (
    <Card className={`bg-gradient-to-br from-background to-muted/50 border-primary/20 ${className}`}>
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h4 className="text-sm font-semibold text-foreground">Powered By Genie Ecosystem</h4>
        </div>

        {/* Products Used */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Products</p>
          <div className="grid grid-cols-2 gap-2">
            {data.products.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-background/60 border border-border/50"
              >
                <span className="text-lg">{product.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{product.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{product.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Models */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">AI Models</p>
          <div className="flex flex-wrap gap-1.5">
            {data.models.map((model) => (
              <Badge
                key={model.task}
                variant="outline"
                className="text-[10px] bg-primary/5 border-primary/20 gap-1"
              >
                {TASK_ICONS[model.task] || <Zap className="w-3 h-3" />}
                <span className="text-muted-foreground">{model.task}:</span>
                <span className="font-medium">{model.model}</span>
              </Badge>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          {data.generationTimeSec && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              Generated in {Math.round(data.generationTimeSec)}s
            </div>
          )}
          {data.frameworkUsed && (
            <Badge variant="secondary" className="text-[10px]">
              {data.frameworkUsed.replace('+', ' + ').toUpperCase()}
            </Badge>
          )}
        </div>

        {/* Ecosystem Message */}
        <p className="text-[11px] text-center text-muted-foreground italic">
          {data.ecosystemMessage}
        </p>
      </CardContent>
    </Card>
  );
};

export default PoweredByEndCard;
