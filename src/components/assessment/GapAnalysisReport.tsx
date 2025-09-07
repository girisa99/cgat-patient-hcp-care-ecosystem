import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock,
  Database,
  Brain,
  Palette,
  FileText,
  Settings,
  Plug,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { comprehensiveGapAnalyzer, SystemOverview, GapAnalysisResult } from '@/utils/assessment/ComprehensiveGapAnalysis';

export const GapAnalysisReport: React.FC = () => {
  const [analysis, setAnalysis] = useState<SystemOverview | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runAnalysis = async () => {
    setIsLoading(true);
    try {
      const result = await comprehensiveGapAnalyzer.runFullAnalysis();
      setAnalysis(result);
    } catch (error) {
      console.error('Failed to run gap analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, []);

  const getStatusIcon = (status: GapAnalysisResult['status']) => {
    switch (status) {
      case 'IMPLEMENTED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'PARTIAL':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'MISSING':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'DEPRECATED':
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: GapAnalysisResult['status']) => {
    switch (status) {
      case 'IMPLEMENTED':
        return 'bg-green-500';
      case 'PARTIAL':
        return 'bg-yellow-500';
      case 'MISSING':
        return 'bg-red-500';
      case 'DEPRECATED':
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: GapAnalysisResult['priority']) => {
    switch (priority) {
      case 'HIGH':
        return 'destructive';
      case 'MEDIUM':
        return 'default';
      case 'LOW':
        return 'secondary';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'AI Prompt Integration':
        return <Brain className="w-5 h-5" />;
      case 'Visual Builder':
        return <Palette className="w-5 h-5" />;
      case 'Templates':
        return <FileText className="w-5 h-5" />;
      case 'Database Sync':
        return <Database className="w-5 h-5" />;
      case 'Node Configuration':
        return <Settings className="w-5 h-5" />;
      case 'Connectors':
        return <Plug className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Clock className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>Running comprehensive gap analysis...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <p>Failed to load analysis</p>
          <Button onClick={runAnalysis} className="mt-4">Retry</Button>
        </CardContent>
      </Card>
    );
  }

  const groupedGaps = analysis.gaps.reduce((acc, gap) => {
    if (!acc[gap.category]) {
      acc[gap.category] = [];
    }
    acc[gap.category].push(gap);
    return acc;
  }, {} as Record<string, GapAnalysisResult[]>);

  return (
    <div className="space-y-6">
      {/* Overall Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Overall Score</p>
                <p className="text-2xl font-bold text-primary">{analysis.implementation_score.overall}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <Progress value={analysis.implementation_score.overall} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">AI Prompt</p>
                <p className="text-2xl font-bold">{analysis.implementation_score.ai_prompt}%</p>
              </div>
              <Brain className="w-8 h-8 text-blue-500" />
            </div>
            <Progress value={analysis.implementation_score.ai_prompt} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Visual Builder</p>
                <p className="text-2xl font-bold">{analysis.implementation_score.visual_builder}%</p>
              </div>
              <Palette className="w-8 h-8 text-green-500" />
            </div>
            <Progress value={analysis.implementation_score.visual_builder} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Templates</p>
                <p className="text-2xl font-bold">{analysis.implementation_score.templates}%</p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
            <Progress value={analysis.implementation_score.templates} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Database Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{analysis.database_stats.workflow_node_types}</div>
              <div className="text-sm text-muted-foreground">Node Types</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{analysis.database_stats.workflow_node_categories}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{analysis.database_stats.agent_templates}</div>
              <div className="text-sm text-muted-foreground">Agent Templates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">{analysis.database_stats.agents}</div>
              <div className="text-sm text-muted-foreground">Agents</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Issues */}
      {analysis.critical_issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Critical Issues ({analysis.critical_issues.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.critical_issues.map((issue, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-red-700">{issue}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Component Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={Object.keys(groupedGaps)[0]}>
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
              {Object.keys(groupedGaps).map((category) => (
                <TabsTrigger key={category} value={category} className="text-xs">
                  {category.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(groupedGaps).map(([category, gaps]) => (
              <TabsContent key={category} value={category} className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  {getCategoryIcon(category)}
                  <h3 className="text-lg font-semibold">{category}</h3>
                </div>

                <div className="space-y-3">
                  {gaps.map((gap, index) => (
                    <Card key={index} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(gap.status)}
                            <h4 className="font-medium">{gap.component}</h4>
                            <Badge variant={getPriorityColor(gap.priority)}>{gap.priority}</Badge>
                            {gap.database_sync && (
                              <Badge variant="outline" className="text-xs">
                                <Database className="w-3 h-3 mr-1" />
                                DB Sync
                              </Badge>
                            )}
                          </div>
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(gap.status)}`} />
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">{gap.description}</p>

                        {gap.implementation_details && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-green-700 mb-1">✅ Implemented:</p>
                            <p className="text-xs text-green-600 bg-green-50 p-2 rounded">
                              {gap.implementation_details}
                            </p>
                          </div>
                        )}

                        {gap.gaps && gap.gaps.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-red-700 mb-1">❌ Gaps:</p>
                            <ul className="text-xs text-red-600 space-y-1">
                              {gap.gaps.map((gapItem, gapIndex) => (
                                <li key={gapIndex} className="flex items-start gap-1">
                                  <span>•</span>
                                  <span>{gapItem}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {gap.recommendations && gap.recommendations.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-blue-700 mb-1">💡 Recommendations:</p>
                            <ul className="text-xs text-blue-600 space-y-1">
                              {gap.recommendations.map((rec, recIndex) => (
                                <li key={recIndex} className="flex items-start gap-1">
                                  <span>•</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Recommendations Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Priority Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {analysis.recommendations.slice(0, 10).map((recommendation, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-blue-700">{recommendation}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button onClick={runAnalysis} className="w-full">
        Re-run Analysis
      </Button>
    </div>
  );
};