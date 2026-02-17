/**
 * Contextual Content Tools
 * 
 * PURPOSE: Embeddable content tools for ALL Genie products
 * - Adapts to context (Vibe shows video tools, Spark shows script tools, etc.)
 * - Appears as collapsible sidebar or inline panel
 * - Uses Label Studio background service for ML hints
 * 
 * PRODUCTS: Mind, Spark, Vibe, Arc, Hub
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Wand2, 
  Image, 
  MessageSquare, 
  Hash, 
  Search, 
  Shield, 
  Accessibility,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLabelStudioBackground, type InlineHint } from '@/services/labelStudioBackgroundService';

export type GenieProduct = 'mind' | 'spark' | 'vibe' | 'arc' | 'hub';

interface ContentToolConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  products: GenieProduct[];
  component?: React.ComponentType<any>;
}

const CONTENT_TOOLS: ContentToolConfig[] = [
  {
    id: 'seo',
    label: 'SEO',
    icon: <Search className="h-4 w-4" />,
    description: 'Optimize for discoverability',
    products: ['mind', 'spark', 'hub']
  },
  {
    id: 'thumbnails',
    label: 'Thumbnails',
    icon: <Image className="h-4 w-4" />,
    description: 'AI thumbnail generation',
    products: ['vibe', 'hub']
  },
  {
    id: 'captions',
    label: 'Captions',
    icon: <MessageSquare className="h-4 w-4" />,
    description: 'Smart caption generation',
    products: ['vibe', 'spark', 'hub']
  },
  {
    id: 'hashtags',
    label: 'Hashtags',
    icon: <Hash className="h-4 w-4" />,
    description: 'Optimized for reach',
    products: ['spark', 'hub']
  },
  {
    id: 'brand',
    label: 'Brand Check',
    icon: <Shield className="h-4 w-4" />,
    description: 'Guidelines compliance',
    products: ['mind', 'spark', 'vibe', 'hub']
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    icon: <Accessibility className="h-4 w-4" />,
    description: 'WCAG compliance',
    products: ['vibe', 'hub']
  }
];

interface ContextualContentToolsProps {
  product: GenieProduct;
  contentId?: string;
  contentTitle?: string;
  contentDescription?: string;
  videoUrl?: string;
  variant?: 'sidebar' | 'inline' | 'compact';
  className?: string;
  onToolAction?: (toolId: string, action: string, data?: any) => void;
}

export const ContextualContentTools: React.FC<ContextualContentToolsProps> = ({
  product,
  contentId,
  contentTitle = '',
  contentDescription = '',
  videoUrl,
  variant = 'sidebar',
  className,
  onToolAction
}) => {
  const [isOpen, setIsOpen] = useState(variant !== 'compact');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [hints, setHints] = useState<InlineHint[]>([]);
  const { getHints, recordEvent } = useLabelStudioBackground();

  // Filter tools for current product
  const availableTools = CONTENT_TOOLS.filter(tool => tool.products.includes(product));

  // Fetch hints from Label Studio background service
  useEffect(() => {
    const fetchHints = async () => {
      const productHints = await getHints(product, {
        contentId,
        contentTitle,
        contentDescription,
        hasVideo: !!videoUrl
      });
      setHints(productHints);
    };
    fetchHints();
  }, [product, contentId, contentTitle, getHints]);

  const handleToolClick = (toolId: string) => {
    setActiveTool(activeTool === toolId ? null : toolId);
    onToolAction?.(toolId, 'open');
  };

  const handleHintAction = (hint: InlineHint) => {
    recordEvent({
      eventType: 'caption_selected',
      context: {
        product,
        userAction: 'accept',
        originalValue: hint.message
      }
    });
    hint.action?.callback();
  };

  // Compact variant - just icon buttons
  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {availableTools.slice(0, 4).map(tool => (
          <Button
            key={tool.id}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleToolClick(tool.id)}
            title={tool.label}
          >
            {tool.icon}
          </Button>
        ))}
        {hints.length > 0 && (
          <Badge variant="secondary" className="ml-1 animate-pulse">
            <Lightbulb className="h-3 w-3 mr-1" />
            {hints.length}
          </Badge>
        )}
      </div>
    );
  }

  // Sidebar variant
  if (variant === 'sidebar') {
    return (
      <Card className={cn("w-64", className)}>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-primary" />
                  Content Tools
                </span>
                <div className="flex items-center gap-2">
                  {hints.length > 0 && (
                    <Badge variant="outline" className="text-xs animate-pulse">
                      {hints.length} hints
                    </Badge>
                  )}
                  {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-0">
              <ScrollArea className="h-[400px]">
                {/* Inline Hints from Label Studio */}
                {hints.length > 0 && (
                  <>
                    <div className="space-y-2 mb-4">
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        AI Suggestions
                      </p>
                      {hints.slice(0, 3).map(hint => (
                        <div 
                          key={hint.id}
                          className={cn(
                            "p-2 rounded-lg text-xs border",
                            hint.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30' :
                            hint.type === 'improvement' ? 'bg-blue-500/10 border-blue-500/30' :
                            'bg-green-500/10 border-green-500/30'
                          )}
                        >
                          <p>{hint.message}</p>
                          {hint.action && (
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="h-auto p-0 mt-1 text-xs"
                              onClick={() => handleHintAction(hint)}
                            >
                              {hint.action.label} →
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <Separator className="my-3" />
                  </>
                )}

                {/* Available Tools */}
                <div className="space-y-1">
                  {availableTools.map(tool => (
                    <Button
                      key={tool.id}
                      variant={activeTool === tool.id ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start gap-2 h-auto py-2"
                      onClick={() => handleToolClick(tool.id)}
                    >
                      {tool.icon}
                      <div className="flex-1 text-left">
                        <div className="font-medium">{tool.label}</div>
                        <div className="text-xs text-muted-foreground">{tool.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  }

  // Inline variant - horizontal toolbar
  return (
    <div className={cn("flex items-center gap-2 p-2 bg-muted/50 rounded-lg", className)}>
      <Wand2 className="h-4 w-4 text-primary shrink-0" />
      <div className="flex items-center gap-1 overflow-x-auto">
        {availableTools.map(tool => (
          <Button
            key={tool.id}
            variant={activeTool === tool.id ? "secondary" : "ghost"}
            size="sm"
            className="gap-1 shrink-0"
            onClick={() => handleToolClick(tool.id)}
          >
            {tool.icon}
            <span className="hidden sm:inline">{tool.label}</span>
          </Button>
        ))}
      </div>
      {hints.length > 0 && (
        <Badge variant="outline" className="shrink-0 animate-pulse">
          <Lightbulb className="h-3 w-3 mr-1" />
          {hints.length} tips
        </Badge>
      )}
    </div>
  );
};

export default ContextualContentTools;
