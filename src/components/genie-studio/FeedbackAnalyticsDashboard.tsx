/**
 * Feedback Analytics Dashboard
 * 
 * PURPOSE: View and analyze collected AI training feedback
 * - Shows feedback trends over time
 * - Highlights areas for improvement
 * - Displays feedback by tool and context
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ThumbsUp, 
  ThumbsDown, 
  TrendingUp, 
  TrendingDown, 
  MessageSquare,
  RefreshCw,
  Loader2,
  BarChart3,
  PieChart,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface FeedbackEntry {
  id: string;
  feedback_type: string;
  feedback_text: string | null;
  domain: string | null;
  feedback_score: number | null;
  created_at: string | null;
  metadata: unknown;
}

interface FeedbackByProduct {
  product: string;
  total: number;
  positive: number;
  negative: number;
  ratio: number;
}

interface FeedbackByContext {
  context: string;
  count: number;
  avgScore: number;
}

export const FeedbackAnalyticsDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [byProduct, setByProduct] = useState<FeedbackByProduct[]>([]);
  const [byContext, setByContext] = useState<FeedbackByContext[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');

  const fetchFeedback = useCallback(async () => {
    setIsLoading(true);
    try {
      // Calculate date filter
      let dateFilter = new Date();
      if (timeRange === '7d') {
        dateFilter.setDate(dateFilter.getDate() - 7);
      } else if (timeRange === '30d') {
        dateFilter.setDate(dateFilter.getDate() - 30);
      } else {
        dateFilter = new Date('2020-01-01');
      }

      let query = supabase
        .from('conversation_learning_feedback')
        .select('*')
        .gte('created_at', dateFilter.toISOString())
        .order('created_at', { ascending: false })
        .limit(500);

      if (selectedProduct) {
        query = query.eq('domain', selectedProduct);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setFeedback(data || []);

      // Calculate by product stats
      const productStats: Record<string, { total: number; positive: number; negative: number }> = {};
      (data || []).forEach(f => {
        const product = f.domain || 'unknown';
        if (!productStats[product]) {
          productStats[product] = { total: 0, positive: 0, negative: 0 };
        }
        productStats[product].total += 1;
        if (f.feedback_type === 'positive') {
          productStats[product].positive += 1;
        } else {
          productStats[product].negative += 1;
        }
      });

      setByProduct(
        Object.entries(productStats).map(([product, stats]) => ({
          product,
          ...stats,
          ratio: stats.total > 0 ? stats.positive / stats.total : 0
        })).sort((a, b) => b.total - a.total)
      );

      // Calculate by context stats
      const contextStats: Record<string, { count: number; totalScore: number }> = {};
      (data || []).forEach(f => {
        const ctx = (f.metadata as any)?.context || 'general';
        if (!contextStats[ctx]) {
          contextStats[ctx] = { count: 0, totalScore: 0 };
        }
        contextStats[ctx].count += 1;
        contextStats[ctx].totalScore += f.feedback_score || 0;
      });

      setByContext(
        Object.entries(contextStats).map(([context, stats]) => ({
          context,
          count: stats.count,
          avgScore: stats.count > 0 ? stats.totalScore / stats.count : 0
        })).sort((a, b) => b.count - a.count)
      );
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, selectedProduct]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const totalFeedback = feedback.length;
  const positiveFeedback = feedback.filter(f => f.feedback_type === 'positive').length;
  const negativeFeedback = feedback.filter(f => f.feedback_type === 'negative').length;
  const positiveRatio = totalFeedback > 0 ? (positiveFeedback / totalFeedback) * 100 : 0;
  const feedbackWithText = feedback.filter(f => f.feedback_text).length;

  const productColors: Record<string, string> = {
    spark: 'bg-orange-500',
    mind: 'bg-blue-500',
    vibe: 'bg-purple-500',
    arc: 'bg-green-500',
    hub: 'bg-pink-500',
    ask_genie: 'bg-cyan-500',
    document: 'bg-yellow-500'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Training Feedback</h2>
          <p className="text-sm text-muted-foreground">
            Analyze user feedback to improve AI responses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
            <TabsList className="h-8">
              <TabsTrigger value="7d" className="text-xs">7 Days</TabsTrigger>
              <TabsTrigger value="30d" className="text-xs">30 Days</TabsTrigger>
              <TabsTrigger value="all" className="text-xs">All Time</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchFeedback}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Feedback</p>
                <p className="text-2xl font-bold">{totalFeedback}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Positive Rate</p>
                <p className="text-2xl font-bold flex items-center gap-1">
                  {positiveRatio.toFixed(1)}%
                  {positiveRatio >= 70 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </p>
              </div>
              <ThumbsUp className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Negative Feedback</p>
                <p className="text-2xl font-bold">{negativeFeedback}</p>
              </div>
              <ThumbsDown className="h-8 w-8 text-red-500/50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">With Comments</p>
                <p className="text-2xl font-bold">{feedbackWithText}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* By Product */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              By Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {byProduct.map(p => (
                <div
                  key={p.product}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-colors",
                    selectedProduct === p.product && "border-primary bg-primary/5"
                  )}
                  onClick={() => setSelectedProduct(
                    selectedProduct === p.product ? null : p.product
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        productColors[p.product] || 'bg-gray-500'
                      )} />
                      <span className="font-medium capitalize">{p.product}</span>
                    </div>
                    <Badge variant="secondary">{p.total}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${p.ratio * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {(p.ratio * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
              {byProduct.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No feedback data yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* By Context */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              By Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px]">
              <div className="space-y-2">
                {byContext.map(c => (
                  <div
                    key={c.context}
                    className="flex items-center justify-between p-2 rounded bg-muted/50"
                  >
                    <span className="text-sm capitalize">
                      {c.context.replace(/_/g, ' ')}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {c.count}
                      </Badge>
                      <span className={cn(
                        "text-xs font-medium",
                        c.avgScore >= 4 ? "text-green-500" :
                        c.avgScore >= 2.5 ? "text-yellow-500" :
                        "text-red-500"
                      )}>
                        {c.avgScore.toFixed(1)}★
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Feedback with Comments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Comments
            </CardTitle>
            <CardDescription>
              User suggestions for improvement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px]">
              <div className="space-y-3">
                {feedback
                  .filter(f => f.feedback_text)
                  .slice(0, 10)
                  .map(f => (
                    <div
                      key={f.id}
                      className="p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {f.feedback_type === 'positive' ? (
                          <ThumbsUp className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <ThumbsDown className="h-3.5 w-3.5 text-red-500" />
                        )}
                        <Badge variant="outline" className="text-xs capitalize">
                          {f.domain}
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(f.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{f.feedback_text}</p>
                    </div>
                  ))}
                {feedback.filter(f => f.feedback_text).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No text feedback yet
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeedbackAnalyticsDashboard;
