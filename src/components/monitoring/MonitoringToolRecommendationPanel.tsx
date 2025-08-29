import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Monitor, TrendingUp, Zap, Target, CheckCircle, Clock, 
  DollarSign, Code, ArrowRight, Star, AlertTriangle
} from 'lucide-react';
import { useMonitoringToolRecommendations } from '@/hooks/useMonitoringToolRecommendations';

export const MonitoringToolRecommendationPanel: React.FC = () => {
  const [selectedUseCase, setSelectedUseCase] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const {
    allTools,
    selectedTools,
    implementationPlan,
    getToolsByCategory,
    getComplementaryTools,
    getAlternativeTools,
    getToolRecommendations,
    addToSelection,
    clearSelection,
    generateImplementationPlan,
    getIntegrationGuide
  } = useMonitoringToolRecommendations();

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      apm: <Monitor className="h-4 w-4" />,
      observability: <TrendingUp className="h-4 w-4" />,
      workflow: <Zap className="h-4 w-4" />,
      ml_ops: <Target className="h-4 w-4" />,
      infrastructure: <CheckCircle className="h-4 w-4" />
    };
    return icons[category] || <Monitor className="h-4 w-4" />;
  };

  const getCostColor = (tier: string) => {
    const colors = {
      free: 'bg-green-100 text-green-800',
      paid: 'bg-blue-100 text-blue-800',
      enterprise: 'bg-purple-100 text-purple-800'
    };
    return colors[tier as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getComplexityColor = (complexity: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[complexity as keyof typeof colors];
  };

  const filteredTools = selectedCategory === 'all' 
    ? allTools 
    : getToolsByCategory(selectedCategory as any);

  const recommendedTools = selectedUseCase 
    ? getToolRecommendations(selectedUseCase)
    : [];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Monitoring Tool Recommendations
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Explore monitoring tools that complement your Arize implementation
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="flex gap-4">
            <Select value={selectedUseCase} onValueChange={setSelectedUseCase}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select use case" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="startup">Startup/Small Team</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
                <SelectItem value="ml_focused">ML/AI Focused</SelectItem>
                <SelectItem value="workflow_heavy">Workflow Heavy</SelectItem>
                <SelectItem value="cost_conscious">Cost Conscious</SelectItem>
                <SelectItem value="debugging_focus">Debugging Focus</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="apm">APM & Performance</SelectItem>
                <SelectItem value="observability">Observability</SelectItem>
                <SelectItem value="workflow">Workflow Management</SelectItem>
                <SelectItem value="ml_ops">ML Operations</SelectItem>
                <SelectItem value="infrastructure">Infrastructure</SelectItem>
              </SelectContent>
            </Select>

            {selectedTools.length > 0 && (
              <div className="flex gap-2">
                <Button onClick={() => generateImplementationPlan(selectedTools)}>
                  Generate Plan ({selectedTools.length})
                </Button>
                <Button variant="outline" onClick={clearSelection}>
                  Clear Selection
                </Button>
              </div>
            )}
          </div>

          <Tabs defaultValue="tools" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tools">All Tools</TabsTrigger>
              <TabsTrigger value="complementary">Arize Compatible</TabsTrigger>
              <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
              <TabsTrigger value="plan">Implementation Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="tools" className="space-y-4">
              {/* Recommended for use case */}
              {recommendedTools.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Recommended for {selectedUseCase.replace('_', ' ')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTools
                      .filter(tool => recommendedTools.includes(tool.name))
                      .map(tool => (
                        <ToolCard 
                          key={tool.name} 
                          tool={tool} 
                          isSelected={selectedTools.includes(tool.name)}
                          onSelect={() => addToSelection(tool.name)}
                          isRecommended={true}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* All tools */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTools
                  .filter(tool => !recommendedTools.includes(tool.name))
                  .map(tool => (
                    <ToolCard 
                      key={tool.name} 
                      tool={tool} 
                      isSelected={selectedTools.includes(tool.name)}
                      onSelect={() => addToSelection(tool.name)}
                    />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="complementary" className="space-y-4">
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Tools that complement Arize</h3>
                <p className="text-sm text-muted-foreground">
                  These tools work alongside Arize to provide additional monitoring capabilities
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getComplementaryTools().map(tool => (
                  <ToolCard 
                    key={tool.name} 
                    tool={tool} 
                    isSelected={selectedTools.includes(tool.name)}
                    onSelect={() => addToSelection(tool.name)}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="alternatives" className="space-y-4">
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <h3 className="font-medium text-yellow-800">Alternative Monitoring Solutions</h3>
                </div>
                <p className="text-sm text-yellow-700">
                  These tools could replace Arize for specific use cases. Consider migration costs and feature gaps.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getAlternativeTools().map(tool => (
                  <ToolCard 
                    key={tool.name} 
                    tool={tool} 
                    isSelected={selectedTools.includes(tool.name)}
                    onSelect={() => addToSelection(tool.name)}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="plan" className="space-y-4">
              {implementationPlan ? (
                <ImplementationPlan plan={implementationPlan} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Select tools to generate an implementation plan</p>
                  <Button 
                    onClick={() => generateImplementationPlan([])}
                    disabled={selectedTools.length === 0}
                  >
                    Generate Plan for Selected Tools
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

interface ToolCardProps {
  tool: any;
  isSelected: boolean;
  onSelect: () => void;
  isRecommended?: boolean;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, isSelected, onSelect, isRecommended }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : ''} ${isRecommended ? 'border-yellow-300 bg-yellow-50/50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getCategoryIcon(tool.category)}
            <CardTitle className="text-lg">{tool.name}</CardTitle>
          </div>
          {isRecommended && <Star className="h-4 w-4 text-yellow-500" />}
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Badge className={getCostColor(tool.costTier)}>
            {tool.costTier}
          </Badge>
          <Badge className={getComplexityColor(tool.integrationComplexity)}>
            {tool.integrationComplexity} setup
          </Badge>
          <Badge variant="outline">
            {tool.arizeCompatibility}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium mb-1">Key Benefits:</p>
          <ul className="text-xs space-y-1">
            {tool.valueAdd.slice(0, 3).map((benefit: string, idx: number) => (
              <li key={idx} className="flex items-start gap-1">
                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium mb-1">Best For:</p>
          <div className="flex flex-wrap gap-1">
            {tool.bestFor.slice(0, 2).map((use: string, idx: number) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {use}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            onClick={onSelect}
            variant={isSelected ? "default" : "outline"}
          >
            {isSelected ? 'Selected' : 'Select'}
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => setShowDetails(!showDetails)}
          >
            Details
          </Button>
        </div>

        {showDetails && (
          <div className="mt-3 p-3 bg-muted rounded-lg text-xs space-y-2">
            <div>
              <strong>All Benefits:</strong>
              <ul className="mt-1 space-y-1">
                {tool.valueAdd.map((benefit: string, idx: number) => (
                  <li key={idx}>• {benefit}</li>
                ))}
              </ul>
            </div>
            {tool.implementationUrl && (
              <div>
                <strong>Documentation:</strong>
                <a href={tool.implementationUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                  View API Docs
                </a>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ImplementationPlan: React.FC<{ plan: any }> = ({ plan }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">12-17 weeks</p>
            <p className="text-sm text-muted-foreground">Total implementation time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Estimated Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${plan.totalCost}/month</p>
            <p className="text-sm text-muted-foreground">Recurring costs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-4 w-4" />
              Key Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{plan.keyBenefits.length}</p>
            <p className="text-sm text-muted-foreground">Monitoring capabilities</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {[plan.phase1, plan.phase2, plan.phase3].map((phase, idx) => (
          <Card key={idx}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {idx + 1}
                </div>
                {phase.name}
                <Badge variant="outline">{phase.duration}</Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">{phase.description}</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {phase.tools.map((tool: any) => (
                  <div key={tool.name} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {getCategoryIcon(tool.category)}
                      <span className="font-medium">{tool.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getCostColor(tool.costTier)}>
                        {tool.costTier}
                      </Badge>
                      <Badge className={getComplexityColor(tool.integrationComplexity)}>
                        {tool.integrationComplexity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key Capabilities You'll Gain</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {plan.keyBenefits.map((benefit: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const getCategoryIcon = (category: string) => {
  const icons: Record<string, React.ReactNode> = {
    apm: <Monitor className="h-4 w-4" />,
    observability: <TrendingUp className="h-4 w-4" />,
    workflow: <Zap className="h-4 w-4" />,
    ml_ops: <Target className="h-4 w-4" />,
    infrastructure: <CheckCircle className="h-4 w-4" />
  };
  return icons[category] || <Monitor className="h-4 w-4" />;
};

const getCostColor = (tier: string) => {
  const colors = {
    free: 'bg-green-100 text-green-800',
    paid: 'bg-blue-100 text-blue-800',
    enterprise: 'bg-purple-100 text-purple-800'
  };
  return colors[tier as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

const getComplexityColor = (complexity: string) => {
  const colors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };
  return colors[complexity as keyof typeof colors];
};