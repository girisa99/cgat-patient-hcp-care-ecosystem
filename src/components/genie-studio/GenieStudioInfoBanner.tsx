/**
 * Genie Suite Info Banner
 * Addresses Ralph Wiggum finding: "What *is* Genie Suite?"
 * Provides clear, persistent context about what users can accomplish
 */

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  Wand2,
  PenTool,
  Mic,
  Music,
  Video,
  Calendar,
  HelpCircle,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GenieStudioInfoBannerProps {
  className?: string;
  onDismiss?: () => void;
  variant?: 'compact' | 'full';
}

export const GenieStudioInfoBanner: React.FC<GenieStudioInfoBannerProps> = ({
  className,
  onDismiss,
  variant = 'compact'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    // Remember dismissal in localStorage
    return localStorage.getItem('genie-studio-info-dismissed') === 'true';
  });

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('genie-studio-info-dismissed', 'true');
    onDismiss?.();
  };

  const handleReset = () => {
    setIsDismissed(false);
    localStorage.removeItem('genie-studio-info-dismissed');
  };

  if (isDismissed && variant === 'compact') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleReset}
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <HelpCircle className="h-4 w-4" />
        <span className="text-xs">What is Genie Suite?</span>
      </Button>
    );
  }

  const features = [
    {
      icon: PenTool,
      title: 'Write Scripts',
      description: 'AI-enhanced writing for videos, podcasts, and presentations',
      color: 'text-blue-500'
    },
    {
      icon: Mic,
      title: 'Generate Voiceovers',
      description: '50+ AI voices to bring your scripts to life',
      color: 'text-purple-500'
    },
    {
      icon: Music,
      title: 'Create Music',
      description: 'Royalty-free background music and sound design',
      color: 'text-pink-500'
    },
    {
      icon: Video,
      title: 'Record & Produce',
      description: 'Professional recording studio with teleprompter',
      color: 'text-green-500'
    },
    {
      icon: Calendar,
      title: 'Schedule Shows',
      description: 'Coordinate guests for podcasts and webcasts',
      color: 'text-indigo-500'
    }
  ];

  return (
    <Card className={cn(
      "border-primary/20 bg-gradient-to-r from-primary/5 via-background to-purple-500/5",
      "transition-all duration-300",
      className
    )}>
      <CardContent className={cn("p-4", variant === 'full' && "p-6")}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center flex-shrink-0">
              <Wand2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground">What is Genie Studio?</h3>
                <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                  AI-Powered
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your complete AI-powered content creation hub. Write scripts, generate voiceovers, 
                create music, and produce professional media—all in one place.
              </p>
              
              {/* Expandable features */}
              {(isExpanded || variant === 'full') && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {features.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <div
                        key={feature.title}
                        className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <Icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", feature.color)} />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground">{feature.title}</p>
                          <p className="text-[10px] text-muted-foreground line-clamp-2">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {variant === 'compact' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 p-0"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}
            {variant === 'compact' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
