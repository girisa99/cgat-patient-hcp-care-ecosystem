import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Lightbulb, Shield, Database, Link, Settings2, 
  AlertTriangle, CheckCircle, TrendingUp, Users,
  Bot, Target, MessageCircle, X, Move
} from 'lucide-react';

interface NodeInsightsPanelProps {
  node: any;
  position: { x: number; y: number };
  onClose: () => void;
}

export const NodeInsightsPanel: React.FC<NodeInsightsPanelProps> = ({
  node,
  position,
  onClose
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(position);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, select')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - dragPosition.x,
      y: e.clientY - dragPosition.y
    });
  };

  React.useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setDragPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const getNodeRecommendations = (nodeType: string) => {
    return {
      insights: [
        { type: 'success', title: 'Configuration Ready', desc: 'Node is properly configured' },
        { type: 'info', title: 'API Integration', desc: 'Connected to existing APIs' }
      ],
      recommendations: [
        'Connect to patient database',
        'Add validation rules', 
        'Configure error handling'
      ],
      connectors: ['Patient API', 'Treatment API', 'Onboarding API', 'Provider API'],
      security: ['Data Encryption', 'Access Control', 'Audit Logging'],
      suggestedNodes: [
        { type: 'agent', label: 'AI Agent', desc: 'Add intelligent processing' },
        { type: 'data', label: 'Data Store', desc: 'Connect external data source' }
      ]
    };
  };

  const data = getNodeRecommendations(node.type);

  const handleApplyAll = () => {
    const detail = { 
      nodeId: node.id, 
      recommendations: data.recommendations,
      connectors: data.connectors,
      security: data.security 
    };
    window.dispatchEvent(new CustomEvent('apply-access-suggestions', { detail }));
    onClose();
  };

  const handleConfigure = () => {
    const detail = { 
      nodeId: node.id,
      nodeType: node.type,
      currentData: node.data 
    };
    window.dispatchEvent(new CustomEvent('open-node-config', { detail }));
    onClose();
  };

  const handleAddSuggestedNode = (suggestedNode: any) => {
    const detail = {
      currentNodeId: node.id,
      nodeType: suggestedNode.type,
      nodeLabel: suggestedNode.label,
      nodeDesc: suggestedNode.desc
    };
    window.dispatchEvent(new CustomEvent('add-suggested-node', { detail }));
  };

  return (
    <div 
      className={`fixed w-96 max-h-[80vh] pointer-events-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        left: Math.min(dragPosition.x + 20, window.innerWidth - 400),
        top: Math.max(Math.min(dragPosition.y - 10, window.innerHeight - 600), 20),
        zIndex: 9999,
      }}
    >
      <Card className="shadow-xl border-2 border-primary/20 bg-background/98 backdrop-blur-md pointer-events-auto">
        <CardHeader 
          className="pb-3 border-b cursor-grab active:cursor-grabbing" 
          onMouseDown={handleMouseDown}
        >
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <Move className="h-3 w-3 text-muted-foreground" />
              Node Insights - {node.data?.label || node.type}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0 hover:bg-destructive/10">
              <X className="h-3 w-3" />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="max-h-[60vh] p-4">
            <div className="space-y-4">
              {/* Live Insights */}
              <div>
                <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Live Insights
                </h4>
                <div className="space-y-1">
                  {data.insights.map((insight, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-muted/30 rounded text-xs">
                      {insight.type === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {insight.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                      {insight.type === 'info' && <TrendingUp className="h-4 w-4 text-blue-500" />}
                      <div>
                        <div className="font-medium">{insight.title}</div>
                        <div className="text-muted-foreground">{insight.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Smart Recommendations */}
              <div>
                <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
                  <Lightbulb className="h-3 w-3" />
                  Smart Recommendations
                </h4>
                <div className="space-y-1">
                  {data.recommendations.map((rec, i) => (
                    <div key={i} className="text-xs p-2 bg-primary/5 rounded flex items-start gap-2">
                      <div className="w-1 h-1 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                      {rec}
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Connectors */}
              <div>
                <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
                  <Settings2 className="h-3 w-3" />
                  Suggested Connectors
                </h4>
                <div className="flex flex-wrap gap-1">
                  {data.connectors.map((connector, i) => (
                    <Badge 
                      key={i} 
                      variant="outline" 
                      className="text-xs cursor-pointer hover:bg-primary/10"
                      onClick={() => {
                        const detail = { nodeId: node.id, connector };
                        window.dispatchEvent(new CustomEvent('add-connector', { detail }));
                      }}
                    >
                      <Link className="h-2 w-2 mr-1" />
                      {connector}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Suggested Nodes */}
              <div>
                <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
                  <Bot className="h-3 w-3" />
                  Suggested Nodes
                </h4>
                <div className="space-y-1">
                  {data.suggestedNodes.map((suggestedNode, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-accent/30 rounded text-xs">
                      <div className="flex-1">
                        <div className="font-medium">{suggestedNode.label}</div>
                        <div className="text-muted-foreground">{suggestedNode.desc}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 text-xs px-2"
                        onClick={() => handleAddSuggestedNode(suggestedNode)}
                      >
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Requirements */}
              <div>
                <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Security Requirements
                </h4>
                <div className="flex flex-wrap gap-1">
                  {data.security.map((sec, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      <CheckCircle className="h-2 w-2 mr-1" />
                      {sec}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="flex gap-2 p-4 pt-3 border-t bg-muted/30">
            <Button 
              size="sm" 
              className="flex-1 text-xs"
              onClick={handleApplyAll}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Apply All
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={handleConfigure}
            >
              <Settings2 className="h-3 w-3 mr-1" />
              Configure
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};