import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, Palette, ChevronLeft, Settings, Bot, Shield
} from 'lucide-react';
import { EnhancedNodePalette } from './EnhancedNodePalette';

interface ExpandedWorkflowAssetPanelProps {
  isCollapsed: boolean;
  onToggle: () => void;
}


export const ExpandedWorkflowAssetPanel: React.FC<ExpandedWorkflowAssetPanelProps> = ({
  isCollapsed,
  onToggle
}) => {
  const [showQuickActions, setShowQuickActions] = useState(false);


  if (isCollapsed) {
    return (
      <div className="w-12 h-full bg-background border-r border-border flex flex-col items-center py-2 gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0 hover:bg-accent"
          onClick={onToggle}
        >
          <Palette className="h-4 w-4" />
        </Button>
        <div className="flex flex-col gap-1 opacity-60">
          <div className="w-6 h-6 rounded bg-muted/50" />
          <div className="w-6 h-4 rounded bg-muted/30" />
          <div className="w-6 h-4 rounded bg-muted/30" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-96 xl:w-[28rem] h-full bg-background border-r border-border flex flex-col">
      <Card className="h-full rounded-none border-0 flex flex-col">
        <CardHeader className="flex-shrink-0 px-3 py-2 border-b">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="truncate">Node Palette</span>
            </div>
            <div className="flex items-center gap-1">
              <Collapsible open={showQuickActions} onOpenChange={setShowQuickActions}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-accent"
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="absolute top-full right-0 z-50 bg-popover border rounded-md shadow-md p-2 space-y-1">
                  <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                    <Bot className="h-3 w-3 mr-2" />
                    Agent Setup
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                    <Shield className="h-3 w-3 mr-2" />
                    Access Control
                  </Button>
                </CollapsibleContent>
              </Collapsible>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-accent"
                onClick={onToggle}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 p-0 min-h-0 overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="flex-shrink-0 p-3 pb-2">
              <div className="text-xs text-primary/80 p-2 bg-primary/5 border border-primary/20 rounded-lg">
                <strong>Enhanced Node Library:</strong> Drag and drop nodes to build your workflow. Each node has detailed capabilities and configurations.
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                <EnhancedNodePalette heightClass="min-h-full" />
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};