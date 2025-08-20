import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Lightbulb, Shield, Database, Link, Settings2, 
  AlertTriangle, CheckCircle, TrendingUp, Users,
  Bot, Target, MessageCircle, X
} from 'lucide-react';

interface ContextualAccessOverlayProps {
  node: any;
  position: { x: number; y: number };
  onClose: () => void;
}

export const ContextualAccessOverlay: React.FC<ContextualAccessOverlayProps> = ({
  node,
  position,
  onClose
}) => {
  const getNodeRecommendations = (nodeType: string) => {
    switch (nodeType) {
      case 'customer':
        return {
          insights: [
            { type: 'success', title: 'High Engagement', desc: 'This touchpoint shows 85% engagement rate' },
            { type: 'warning', title: 'Data Privacy', desc: 'Ensure GDPR compliance for customer data' }
          ],
          recommendations: [
            'Add personalization layer to improve experience',
            'Implement feedback collection mechanism',
            'Set up A/B testing for this touchpoint'
          ],
          connectors: ['CRM Integration', 'Analytics Tracker', 'Feedback System'],
          security: ['Data Encryption', 'Access Control', 'Audit Logging'],
          suggestedNodes: [
            { type: 'agent', label: 'Support Agent', desc: 'Add AI assistant for customer queries' },
            { type: 'decision', label: 'Route Decision', desc: 'Intelligently route customer requests' },
            { type: 'data', label: 'Customer Data', desc: 'Store customer interaction history' }
          ]
        };
      case 'agent':
        return {
          insights: [
            { type: 'success', title: 'Response Time', desc: 'Average response: 1.2s (excellent)' },
            { type: 'info', title: 'Model Usage', desc: 'Currently using GPT-4o-mini' }
          ],
          recommendations: [
            'Consider upgrading to GPT-4o for complex queries',
            'Add context memory for conversation continuity',
            'Implement fallback to human agent'
          ],
          connectors: ['Knowledge Base', 'Sentiment Analysis', 'Live Chat'],
          security: ['API Rate Limiting', 'Content Filtering', 'User Authentication'],
          suggestedNodes: [
            { type: 'data', label: 'Knowledge Base', desc: 'Add external knowledge source' },
            { type: 'decision', label: 'Escalation Rule', desc: 'Route complex queries to humans' },
            { type: 'action', label: 'Follow-up Action', desc: 'Automated follow-up sequences' }
          ]
        };
      case 'decision':
        return {
          insights: [
            { type: 'warning', title: 'Logic Complexity', desc: '12 decision paths - consider simplification' },
            { type: 'success', title: 'Accuracy', desc: '94% correct routing' }
          ],
          recommendations: [
            'Simplify decision tree for better maintainability',
            'Add confidence scoring for decisions',
            'Implement decision logging for analysis'
          ],
          connectors: ['Rule Engine', 'Analytics', 'Workflow Logger'],
          security: ['Decision Audit', 'Access Validation', 'Data Protection'],
          suggestedNodes: [
            { type: 'agent', label: 'Specialist Agent', desc: 'Add specialized AI for complex cases' },
            { type: 'action', label: 'Notification Action', desc: 'Send alerts based on decisions' },
            { type: 'data', label: 'Analytics Store', desc: 'Track decision outcomes' }
          ]
        };
      default:
        return {
          insights: [
            { type: 'info', title: 'Configuration', desc: 'Node ready for configuration' }
          ],
          recommendations: [
            'Configure node properties',
            'Set up connections to other nodes',
            'Add validation rules'
          ],
          connectors: ['Generic API', 'Data Store', 'Notification'],
          security: ['Basic Security', 'Data Validation', 'Error Handling'],
          suggestedNodes: [
            { type: 'agent', label: 'AI Agent', desc: 'Add intelligent assistant' },
            { type: 'decision', label: 'Logic Node', desc: 'Add conditional routing' },
            { type: 'data', label: 'Data Source', desc: 'Connect external data' }
          ]
        };
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      default: return <Lightbulb className="h-4 w-4 text-purple-500" />;
    }
  };

  const data = getNodeRecommendations(node.type);

  return (
    <div 
      className="absolute z-50 w-80 max-h-96"
      style={{
        left: position.x + 20,
        top: position.y - 10,
        transform: position.x > 600 ? 'translateX(-100%)' : 'none'
      }}
    >
      <Card className="shadow-lg border-2 border-primary/20 bg-background/95 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Access Insights - {node.data?.label || node.type}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
              <X className="h-3 w-3" />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <ScrollArea className="max-h-64">
            <div className="space-y-3">
              {/* Live Insights */}
              <div>
                <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Live Insights
                </h4>
                <div className="space-y-1">
                  {data.insights.map((insight, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-muted/30 rounded text-xs">
                      {getInsightIcon(insight.type)}
                      <div>
                        <div className="font-medium">{insight.title}</div>
                        <div className="text-muted-foreground">{insight.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
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

              {/* Quick Actions */}
              <div>
                <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
                  <Settings2 className="h-3 w-3" />
                  Suggested Connectors
                </h4>
                <div className="flex flex-wrap gap-1">
                  {data.connectors.map((connector, i) => (
                    <Badge key={i} variant="outline" className="text-xs cursor-pointer hover:bg-primary/10">
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
                        onClick={() => {
                          const detail = {
                            currentNodeId: node.id,
                            nodeType: suggestedNode.type,
                            nodeLabel: suggestedNode.label,
                            nodeDesc: suggestedNode.desc
                          };
                          window.dispatchEvent(new CustomEvent('add-suggested-node', { detail }));
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Check */}
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

          <div className="flex gap-2 pt-2 border-t">
            <Button 
              size="sm" 
              className="flex-1 text-xs"
              onClick={() => {
                const detail = { nodeId: node.id, connectors: data.connectors } as any;
                window.dispatchEvent(new CustomEvent('apply-access-suggestions', { detail }));
                onClose();
              }}
            >
              Apply Suggestions
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={() => {
                const detail = { nodeId: node.id } as any;
                window.dispatchEvent(new CustomEvent('open-node-config', { detail }));
                onClose();
              }}
            >
              Configure
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};