/**
 * AI ROUTING OBSERVABILITY DASHBOARD
 * Phase 1 gap: Metrics for provider usage, latency, costs, and routing decisions.
 * Uses existing AIRoutingIntelligenceService and useAIRoutingIntelligence hook.
 */
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  Brain, Zap, DollarSign, Clock, Search, TrendingUp, Activity, Route,
} from 'lucide-react';
import { useAIRoutingIntelligence } from '@/hooks/useAIRoutingIntelligence';
import { aiRoutingIntelligence } from '@/services/ai/AIRoutingIntelligenceService';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(210,80%,55%)', 'hsl(160,60%,45%)', 'hsl(40,90%,55%)', 'hsl(0,70%,55%)'];

export const AIRoutingObservabilityDashboard: React.FC = () => {
  const { analyzeQuery, lastClassification, recommendations, routingDecision, isAnalyzing, reset } = useAIRoutingIntelligence();
  const [testQuery, setTestQuery] = useState('');
  const [history, setHistory] = useState<Array<{
    query: string;
    intent: string;
    model: string;
    cost: number;
    latency: number;
    complexity: string;
    timestamp: Date;
  }>>([]);

  const handleAnalyze = () => {
    if (!testQuery.trim()) return;
    const decision = analyzeQuery(testQuery.trim());
    setHistory(prev => [{
      query: testQuery.trim(),
      intent: decision.classification.intent,
      model: decision.primaryRecommendation?.displayName || 'N/A',
      cost: decision.primaryRecommendation?.estimatedCost || 0,
      latency: decision.primaryRecommendation?.estimatedLatency || 0,
      complexity: decision.classification.complexity,
      timestamp: new Date(),
    }, ...prev].slice(0, 50));
    setTestQuery('');
  };

  // Aggregate stats from history
  const stats = useMemo(() => {
    if (!history.length) return null;
    const intentCounts: Record<string, number> = {};
    const modelCounts: Record<string, number> = {};
    let totalCost = 0;
    let totalLatency = 0;
    history.forEach(h => {
      intentCounts[h.intent] = (intentCounts[h.intent] || 0) + 1;
      modelCounts[h.model] = (modelCounts[h.model] || 0) + 1;
      totalCost += h.cost;
      totalLatency += h.latency;
    });
    return {
      totalQueries: history.length,
      avgCost: totalCost / history.length,
      avgLatency: totalLatency / history.length,
      totalCost,
      intentData: Object.entries(intentCounts).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value })),
      modelData: Object.entries(modelCounts).map(([name, value]) => ({ name, value })),
    };
  }, [history]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Route className="h-5 w-5 text-primary" />
          AI Routing Observability
        </h2>
        <Badge variant="outline" className="text-xs">
          {history.length} queries analyzed
        </Badge>
      </div>

      {/* Test Query Input */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-2">
            <Input
              placeholder="Test a query to see routing decision..."
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              className="flex-1"
            />
            <Button onClick={handleAnalyze} disabled={isAnalyzing || !testQuery.trim()}>
              <Search className="h-4 w-4 mr-1" />
              Analyze
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Latest Decision */}
      {routingDecision && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Latest Routing Decision
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg border text-center">
                <div className="text-xs text-muted-foreground">Intent</div>
                <div className="font-semibold text-sm mt-1">{lastClassification?.intent?.replace(/_/g, ' ')}</div>
              </div>
              <div className="p-3 rounded-lg border text-center">
                <div className="text-xs text-muted-foreground">Confidence</div>
                <div className="font-semibold text-sm mt-1">{((lastClassification?.confidence || 0) * 100).toFixed(0)}%</div>
              </div>
              <div className="p-3 rounded-lg border text-center">
                <div className="text-xs text-muted-foreground">Complexity</div>
                <Badge variant="secondary" className="mt-1">{lastClassification?.complexity}</Badge>
              </div>
              <div className="p-3 rounded-lg border text-center">
                <div className="text-xs text-muted-foreground">Cost Tier</div>
                <Badge variant="outline" className="mt-1">{lastClassification?.suggestedCostTier}</Badge>
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">Model Recommendations</h4>
              {recommendations.slice(0, 4).map((rec, i) => (
                <div key={rec.modelId} className={`flex items-center gap-3 p-2 rounded-lg border ${i === 0 ? 'ring-1 ring-primary bg-primary/5' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{rec.displayName}</span>
                      {i === 0 && <Badge className="text-[10px]">Primary</Badge>}
                      <Badge variant="outline" className="text-[10px]">{rec.provider}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${rec.estimatedCost.toFixed(4)}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{rec.estimatedLatency}ms</span>
                    <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" />{rec.score.toFixed(0)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Optimization Options */}
            <div className="grid grid-cols-3 gap-2">
              {routingDecision.costOptimizedOption && (
                <div className="p-2 rounded border text-center">
                  <DollarSign className="h-3 w-3 mx-auto mb-1 text-green-500" />
                  <div className="text-[10px] text-muted-foreground">Cost Optimized</div>
                  <div className="text-xs font-medium truncate">{routingDecision.costOptimizedOption.displayName}</div>
                </div>
              )}
              {routingDecision.qualityOptimizedOption && (
                <div className="p-2 rounded border text-center">
                  <TrendingUp className="h-3 w-3 mx-auto mb-1 text-blue-500" />
                  <div className="text-[10px] text-muted-foreground">Quality Optimized</div>
                  <div className="text-xs font-medium truncate">{routingDecision.qualityOptimizedOption.displayName}</div>
                </div>
              )}
              {routingDecision.speedOptimizedOption && (
                <div className="p-2 rounded border text-center">
                  <Zap className="h-3 w-3 mx-auto mb-1 text-yellow-500" />
                  <div className="text-[10px] text-muted-foreground">Speed Optimized</div>
                  <div className="text-xs font-medium truncate">{routingDecision.speedOptimizedOption.displayName}</div>
                </div>
              )}
            </div>

            {/* Reasoning */}
            {lastClassification?.reasoning && lastClassification.reasoning.length > 0 && (
              <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                <strong>Reasoning:</strong> {lastClassification.reasoning.join(' • ')}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Aggregate Charts */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Summary Cards */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Session Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border">
                  <Activity className="h-4 w-4 text-primary mb-1" />
                  <div className="text-lg font-bold">{stats.totalQueries}</div>
                  <div className="text-xs text-muted-foreground">Total Queries</div>
                </div>
                <div className="p-3 rounded-lg border">
                  <DollarSign className="h-4 w-4 text-green-500 mb-1" />
                  <div className="text-lg font-bold">${stats.totalCost.toFixed(4)}</div>
                  <div className="text-xs text-muted-foreground">Est. Total Cost</div>
                </div>
                <div className="p-3 rounded-lg border">
                  <DollarSign className="h-4 w-4 text-muted-foreground mb-1" />
                  <div className="text-lg font-bold">${stats.avgCost.toFixed(4)}</div>
                  <div className="text-xs text-muted-foreground">Avg Cost/Query</div>
                </div>
                <div className="p-3 rounded-lg border">
                  <Clock className="h-4 w-4 text-muted-foreground mb-1" />
                  <div className="text-lg font-bold">{stats.avgLatency.toFixed(0)}ms</div>
                  <div className="text-xs text-muted-foreground">Avg Latency</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Intent Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Intent Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={stats.intentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ name }) => name}>
                    {stats.intentData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Model Usage */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Model Usage Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.modelData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent History */}
      {history.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Recent Routing Decisions</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => { setHistory([]); reset(); }}>Clear</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {history.map((h, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded border text-xs">
                  <span className="flex-1 truncate font-mono">{h.query}</span>
                  <Badge variant="secondary">{h.intent.replace(/_/g, ' ')}</Badge>
                  <span className="text-muted-foreground">{h.model}</span>
                  <span className="text-green-600">${h.cost.toFixed(4)}</span>
                  <span className="text-muted-foreground">{h.latency}ms</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIRoutingObservabilityDashboard;
