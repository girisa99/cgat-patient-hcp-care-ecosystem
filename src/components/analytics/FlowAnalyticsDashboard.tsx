import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Activity, TrendingUp, Users, Zap, Brain, Grid, 
  BarChart3, PieChart, LineChart, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { unifiedFlowIntegrator, FlowEvent, AnalyticsEvent } from '@/services/integration/UnifiedFlowIntegrator';

interface FlowMetrics {
  totalEvents: number;
  aiPrompts: number;
  templateUpdates: number;
  visualChanges: number;
  collaborators: number;
  averageResponseTime: number;
  topFlowPaths: string[];
}

interface EventTimeline {
  timestamp: string;
  type: string;
  source: string;
  impact: 'low' | 'medium' | 'high';
  description: string;
}

export const FlowAnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<FlowMetrics>({
    totalEvents: 0,
    aiPrompts: 0,
    templateUpdates: 0,
    visualChanges: 0,
    collaborators: 0,
    averageResponseTime: 0,
    topFlowPaths: []
  });
  
  const [timeline, setTimeline] = useState<EventTimeline[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLive, setIsLive] = useState(true);

  // Real-time analytics integration
  useEffect(() => {
    if (!isLive) return;

    const unsubscribe = unifiedFlowIntegrator.subscribe('*', (event: FlowEvent) => {
      updateMetrics(event);
      addToTimeline(event);
    });

    // Initial metrics load
    loadInitialMetrics();

    return unsubscribe;
  }, [isLive]);

  const loadInitialMetrics = async () => {
    // Simulate loading analytics data
    setMetrics({
      totalEvents: 1247,
      aiPrompts: 342,
      templateUpdates: 189,
      visualChanges: 716,
      collaborators: 23,
      averageResponseTime: 1.8,
      topFlowPaths: [
        'AI Prompt → Template → Visual',
        'Visual → AI Prompt → Template',
        'Template → Visual → Analytics'
      ]
    });

    // Load recent timeline
    const recentEvents: EventTimeline[] = [
      {
        timestamp: new Date(Date.now() - 2000).toISOString(),
        type: 'ai_prompt',
        source: 'user_session_123',
        impact: 'high',
        description: 'Generated healthcare workflow template'
      },
      {
        timestamp: new Date(Date.now() - 5000).toISOString(),
        type: 'visual_change',
        source: 'user_session_456',
        impact: 'medium',
        description: 'Added decision node to patient flow'
      },
      {
        timestamp: new Date(Date.now() - 8000).toISOString(),
        type: 'template_update',
        source: 'ai_integration',
        impact: 'high',
        description: 'Updated insurance verification template'
      }
    ];

    setTimeline(recentEvents);
  };

  const updateMetrics = (event: FlowEvent) => {
    setMetrics(prev => {
      const updated = { ...prev };
      updated.totalEvents += 1;

      switch (event.type) {
        case 'ai_prompt':
          updated.aiPrompts += 1;
          break;
        case 'template_update':
          updated.templateUpdates += 1;
          break;
        case 'visual_change':
          updated.visualChanges += 1;
          break;
      }

      return updated;
    });
  };

  const addToTimeline = (event: FlowEvent) => {
    const timelineEvent: EventTimeline = {
      timestamp: event.timestamp,
      type: event.type,
      source: event.source,
      impact: determineImpact(event),
      description: generateDescription(event)
    };

    setTimeline(prev => [timelineEvent, ...prev.slice(0, 49)]); // Keep last 50 events
  };

  const determineImpact = (event: FlowEvent): 'low' | 'medium' | 'high' => {
    switch (event.type) {
      case 'ai_prompt': return 'high';
      case 'template_update': return 'high';
      case 'visual_change': return 'medium';
      default: return 'low';
    }
  };

  const generateDescription = (event: FlowEvent): string => {
    switch (event.type) {
      case 'ai_prompt':
        return `AI prompt processed: "${event.data.prompt?.substring(0, 50)}..."`;
      case 'template_update':
        return `Template updated: ${event.data.templateId}`;
      case 'visual_change':
        return `Visual ${event.data.action}: ${event.data.nodeId || 'element'}`;
      default:
        return `${event.type} event`;
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'ai_prompt': return <Brain className="w-4 h-4 text-primary" />;
      case 'template_update': return <Grid className="w-4 h-4 text-secondary" />;
      case 'visual_change': return <Zap className="w-4 h-4 text-accent" />;
      default: return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Flow Analytics Dashboard
              {isLive && <Badge variant="secondary" className="animate-pulse">Live</Badge>}
            </CardTitle>
            <CardDescription>
              Real-time analytics for AI prompts, templates, and visual builder interactions
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1h</SelectItem>
                <SelectItem value="24h">24h</SelectItem>
                <SelectItem value="7d">7d</SelectItem>
                <SelectItem value="30d">30d</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsLive(!isLive)}
            >
              {isLive ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-1" />
              )}
              {isLive ? 'Live' : 'Paused'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="flows">Flow Paths</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
              >
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Total Events</span>
                  </div>
                  <div className="text-2xl font-bold">{metrics.totalEvents.toLocaleString()}</div>
                  <div className="text-xs text-green-600">+12% from last hour</div>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">AI Prompts</span>
                  </div>
                  <div className="text-2xl font-bold">{metrics.aiPrompts}</div>
                  <div className="text-xs text-green-600">+8% from last hour</div>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Grid className="w-4 h-4 text-secondary" />
                    <span className="text-sm font-medium">Templates</span>
                  </div>
                  <div className="text-2xl font-bold">{metrics.templateUpdates}</div>
                  <div className="text-xs text-green-600">+15% from last hour</div>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium">Collaborators</span>
                  </div>
                  <div className="text-2xl font-bold">{metrics.collaborators}</div>
                  <div className="text-xs text-blue-600">4 active now</div>
                </Card>
              </motion.div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="font-medium">Average Response Time</span>
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {metrics.averageResponseTime}s
                </div>
                <div className="text-sm text-muted-foreground">
                  AI prompt to template generation
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <LineChart className="w-4 h-4 text-primary" />
                  <span className="font-medium">Flow Completion Rate</span>
                </div>
                <div className="text-3xl font-bold text-green-600">94.2%</div>
                <div className="text-sm text-muted-foreground">
                  End-to-end flow success rate
                </div>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="timeline" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Event Timeline</h3>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="ai_prompt">AI Prompts</SelectItem>
                    <SelectItem value="template_update">Templates</SelectItem>
                    <SelectItem value="visual_change">Visual Changes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="max-h-96 overflow-y-auto space-y-2">
                {timeline
                  .filter(event => selectedCategory === 'all' || event.type === selectedCategory)
                  .map((event, index) => (
                    <motion.div
                      key={`${event.timestamp}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="mt-0.5">
                        {getEventIcon(event.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{event.description}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getImpactColor(event.impact)}`}
                          >
                            {event.impact}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(event.timestamp).toLocaleTimeString()} • {event.source}
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="flows" className="space-y-4">
            <div>
              <h3 className="font-medium mb-3">Top Flow Paths</h3>
              <div className="space-y-3">
                {metrics.topFlowPaths.map((path, index) => (
                  <motion.div
                    key={path}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{path}</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.floor(Math.random() * 200) + 50} completions this hour
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {Math.floor(Math.random() * 30) + 70}%
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h3 className="font-medium mb-3">AI Performance</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Template Generation</span>
                    <span className="text-sm font-medium text-green-600">98.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Prompt Understanding</span>
                    <span className="text-sm font-medium text-green-600">96.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">User Satisfaction</span>
                    <span className="text-sm font-medium text-green-600">94.8%</span>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <h3 className="font-medium mb-3">Collaboration Metrics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Concurrent Users</span>
                    <span className="text-sm font-medium">4.2 avg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Conflict Resolution</span>
                    <span className="text-sm font-medium text-green-600">99.1%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Sync Latency</span>
                    <span className="text-sm font-medium">28ms avg</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};