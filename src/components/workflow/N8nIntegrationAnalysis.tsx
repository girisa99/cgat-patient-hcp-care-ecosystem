/**
 * N8N INTEGRATION ANALYSIS
 * Analysis component comparing n8n integration vs custom workflow implementation
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Code, 
  Database, 
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Clock,
  Users,
  Shield,
  Workflow
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ComparisonMetric {
  category: string;
  custom: {
    score: number;
    pros: string[];
    cons: string[];
    effort: 'Low' | 'Medium' | 'High';
    cost: 'Low' | 'Medium' | 'High';
  };
  n8n: {
    score: number;
    pros: string[];
    cons: string[];
    effort: 'Low' | 'Medium' | 'High';
    cost: 'Low' | 'Medium' | 'High';
  };
}

const COMPARISON_METRICS: ComparisonMetric[] = [
  {
    category: 'Development Speed',
    custom: {
      score: 6,
      pros: ['Full control over implementation', 'Custom UI/UX', 'Perfect integration'],
      cons: ['High development time', 'Need to build everything', 'More complex debugging'],
      effort: 'High',
      cost: 'High'
    },
    n8n: {
      score: 9,
      pros: ['Pre-built nodes', 'Visual workflow editor', 'Quick prototyping', '600+ integrations'],
      cons: ['Learning curve', 'Limited customization', 'Dependency on n8n'],
      effort: 'Low',
      cost: 'Low'
    }
  },
  {
    category: 'Maintenance & Support',
    custom: {
      score: 8,
      pros: ['Full ownership', 'No external dependencies', 'Custom bug fixes'],
      cons: ['Full responsibility for bugs', 'No community support', 'More testing needed'],
      effort: 'High',
      cost: 'High'
    },
    n8n: {
      score: 7,
      pros: ['Community support', 'Regular updates', 'Documentation', 'Bug fixes by n8n team'],
      cons: ['Dependent on n8n roadmap', 'Limited control over fixes', 'Version compatibility'],
      effort: 'Low',
      cost: 'Medium'
    }
  },
  {
    category: 'Scalability',
    custom: {
      score: 9,
      pros: ['Unlimited scalability', 'Custom performance optimization', 'Cloud-native design'],
      cons: ['Need to handle scaling yourself', 'More infrastructure complexity'],
      effort: 'High',
      cost: 'Medium'
    },
    n8n: {
      score: 7,
      pros: ['Built-in scaling features', 'Queue management', 'Load balancing'],
      cons: ['Limited by n8n architecture', 'Enterprise features cost extra', 'Resource overhead'],
      effort: 'Medium',
      cost: 'Medium'
    }
  },
  {
    category: 'Healthcare Compliance',
    custom: {
      score: 9,
      pros: ['Full HIPAA control', 'Custom security measures', 'Audit trail customization'],
      cons: ['Need to implement all compliance features', 'Security responsibility'],
      effort: 'High',
      cost: 'High'
    },
    n8n: {
      score: 6,
      pros: ['Some compliance features', 'Encryption support', 'Access controls'],
      cons: ['Not HIPAA certified by default', 'Limited healthcare-specific features', 'Data residency concerns'],
      effort: 'Medium',
      cost: 'Medium'
    }
  },
  {
    category: 'Integration Flexibility',
    custom: {
      score: 8,
      pros: ['Unlimited custom integrations', 'Direct API control', 'Perfect healthcare integration'],
      cons: ['Need to build each integration', 'More API management'],
      effort: 'High',
      cost: 'High'
    },
    n8n: {
      score: 9,
      pros: ['600+ pre-built nodes', 'Community integrations', 'Easy webhook handling'],
      cons: ['Limited to available nodes', 'Healthcare integrations may be limited'],
      effort: 'Low',
      cost: 'Low'
    }
  },
  {
    category: 'User Experience',
    custom: {
      score: 9,
      pros: ['Tailored for healthcare users', 'Custom UI/UX', 'Perfect brand integration'],
      cons: ['Need to design and build UI', 'User testing required'],
      effort: 'High',
      cost: 'High'
    },
    n8n: {
      score: 7,
      pros: ['Proven workflow interface', 'Visual editor', 'User-friendly'],
      cons: ['Generic interface', 'Not healthcare-specific', 'Limited customization'],
      effort: 'Low',
      cost: 'Low'
    }
  }
];

export const N8nIntegrationAnalysis: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('comparison');

  const calculateOverallScore = (approach: 'custom' | 'n8n') => {
    const total = COMPARISON_METRICS.reduce((sum, metric) => sum + metric[approach].score, 0);
    return (total / COMPARISON_METRICS.length).toFixed(1);
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'Low':
        return 'text-green-600 bg-green-100';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'High':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getCostColor = (cost: string) => {
    switch (cost) {
      case 'Low':
        return 'text-green-600 bg-green-100';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'High':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">n8n Integration Analysis</h2>
        <p className="text-muted-foreground">
          Comprehensive comparison between n8n integration and custom workflow implementation
        </p>
      </div>

      {/* Overall Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Code className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{calculateOverallScore('custom')}/10</div>
                <div className="text-sm text-muted-foreground">Custom Implementation</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Full control, high effort, maximum customization
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <Workflow className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{calculateOverallScore('n8n')}/10</div>
                <div className="text-sm text-muted-foreground">n8n Integration</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Quick setup, proven solution, good integrations
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="comparison">Detailed Comparison</TabsTrigger>
          <TabsTrigger value="recommendation">Recommendation</TabsTrigger>
          <TabsTrigger value="implementation">Implementation Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-4">
          {COMPARISON_METRICS.map((metric, index) => (
            <motion.div
              key={metric.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{metric.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Custom Implementation */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium flex items-center gap-2">
                          <Code className="h-4 w-4" />
                          Custom Implementation
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge className={getEffortColor(metric.custom.effort)}>
                            {metric.custom.effort} Effort
                          </Badge>
                          <Badge className={getCostColor(metric.custom.cost)}>
                            {metric.custom.cost} Cost
                          </Badge>
                          <Badge variant="outline">
                            {metric.custom.score}/10
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium text-green-600 mb-1">Pros:</div>
                        <ul className="text-sm space-y-1">
                          {metric.custom.pros.map((pro, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-red-600 mb-1">Cons:</div>
                        <ul className="text-sm space-y-1">
                          {metric.custom.cons.map((con, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* n8n Integration */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium flex items-center gap-2">
                          <Workflow className="h-4 w-4" />
                          n8n Integration
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge className={getEffortColor(metric.n8n.effort)}>
                            {metric.n8n.effort} Effort
                          </Badge>
                          <Badge className={getCostColor(metric.n8n.cost)}>
                            {metric.n8n.cost} Cost
                          </Badge>
                          <Badge variant="outline">
                            {metric.n8n.score}/10
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium text-green-600 mb-1">Pros:</div>
                        <ul className="text-sm space-y-1">
                          {metric.n8n.pros.map((pro, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-red-600 mb-1">Cons:</div>
                        <ul className="text-sm space-y-1">
                          {metric.n8n.cons.map((con, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="recommendation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recommendation: Hybrid Approach
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 dark:text-blue-100">
                      Best of Both Worlds
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Use custom implementation for core healthcare workflows and n8n for general automation and third-party integrations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Use Custom Implementation For:</h4>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Patient onboarding workflows
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      HIPAA-compliant data processing
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Core healthcare agent logic
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Clinical decision support
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      EMR integrations (custom)
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Use n8n Integration For:</h4>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      General business automation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Third-party API integrations
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Notification workflows
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Data synchronization
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Non-healthcare automations
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="implementation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Implementation Roadmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                    <Settings className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Phase 1: Core Custom Implementation</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Build custom healthcare workflow nodes, MCP integration, and HIPAA-compliant processing
                    </p>
                    <Badge variant="outline" className="mt-2">2-3 months</Badge>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-lg">
                    <Workflow className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Phase 2: n8n Integration Layer</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add n8n integration for general automation and third-party connections
                    </p>
                    <Badge variant="outline" className="mt-2">1-2 months</Badge>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Phase 3: Testing & Optimization</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Comprehensive testing, performance optimization, and compliance validation
                    </p>
                    <Badge variant="outline" className="mt-2">1 month</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};