/**
 * Feedback Analytics Dashboard
 * 
 * Aggregates like/dislike ratios by product, context, and provider
 * to identify AI quality weak spots and improvement opportunities.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BarChart3, ThumbsUp, ThumbsDown, TrendingUp, TrendingDown, 
  RefreshCw, AlertTriangle, Sparkles, Target 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FeedbackStat {
  product: string;
  context: string;
  positive: number;
  negative: number;
  total: number;
  ratio: number;
}

interface AudienceRelevanceStat {
  product_id: string;
  audience_id: string;
  relevance_score: number;
  feedback_count: number;
  positive_feedback: number;
  negative_feedback: number;
}

interface FeedbackAnalyticsDashboardProps {
  className?: string;
}

export const FeedbackAnalyticsDashboard: React.FC<FeedbackAnalyticsDashboardProps> = ({ className }) => {
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStat[]>([]);
  const [audienceStats, setAudienceStats] = useState<AudienceRelevanceStat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const loadStats = async () => {
    setIsLoading(true);
    try {
      // Load feedback from conversation_learning_feedback
      const { data: feedbackData } = await supabase
        .from('conversation_learning_feedback')
        .select('domain, feedback_type, feedback_score, metadata')
        .order('created_at', { ascending: false })
        .limit(500);

      // Aggregate by product/context
      const statsMap = new Map<string, FeedbackStat>();
      (feedbackData || []).forEach((fb: any) => {
        const product = fb.domain || 'unknown';
        const context = fb.metadata?.context || 'general';
        const key = `${product}:${context}`;
        
        if (!statsMap.has(key)) {
          statsMap.set(key, { product, context, positive: 0, negative: 0, total: 0, ratio: 0 });
        }
        const stat = statsMap.get(key)!;
        stat.total++;
        if (fb.feedback_type === 'positive' || fb.feedback_score >= 4) {
          stat.positive++;
        } else {
          stat.negative++;
        }
        stat.ratio = stat.total > 0 ? stat.positive / stat.total : 0;
      });

      setFeedbackStats(Array.from(statsMap.values()).sort((a, b) => b.total - a.total));

      // Load audience relevance stats
      const { data: audienceData } = await supabase
        .from('product_audience_relevance')
        .select('*')
        .order('feedback_count', { ascending: false })
        .limit(100);

      setAudienceStats((audienceData || []) as AudienceRelevanceStat[]);
    } catch (err) {
      console.error('[FeedbackAnalytics] Load failed:', err);
      toast.error('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const totalFeedback = feedbackStats.reduce((sum, s) => sum + s.total, 0);
  const overallPositive = feedbackStats.reduce((sum, s) => sum + s.positive, 0);
  const overallRatio = totalFeedback > 0 ? overallPositive / totalFeedback : 0;
  const weakSpots = feedbackStats.filter(s => s.ratio < 0.5 && s.total >= 3);
  const strongAreas = feedbackStats.filter(s => s.ratio >= 0.8 && s.total >= 3);

  // Group by product
  const byProduct = feedbackStats.reduce((acc, stat) => {
    if (!acc[stat.product]) acc[stat.product] = [];
    acc[stat.product].push(stat);
    return acc;
  }, {} as Record<string, FeedbackStat[]>);

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              AI Feedback Analytics
            </CardTitle>
            <CardDescription className="text-xs">
              Like/dislike ratios across products and contexts
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadStats} disabled={isLoading}>
            <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 h-8">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="products" className="text-xs">By Product</TabsTrigger>
            <TabsTrigger value="audience" className="text-xs">Audience Learning</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="mt-3 space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 rounded-lg border bg-muted/30 text-center">
                <p className="text-2xl font-bold">{totalFeedback}</p>
                <p className="text-[10px] text-muted-foreground">Total Feedback</p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/30 text-center">
                <p className={cn("text-2xl font-bold", overallRatio >= 0.7 ? "text-primary" : "text-destructive")}>
                  {Math.round(overallRatio * 100)}%
                </p>
                <p className="text-[10px] text-muted-foreground">Positive Rate</p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/30 text-center">
                <p className="text-2xl font-bold text-primary">{strongAreas.length}</p>
                <p className="text-[10px] text-muted-foreground">Strong Areas</p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/30 text-center">
                <p className="text-2xl font-bold text-destructive">{weakSpots.length}</p>
                <p className="text-[10px] text-muted-foreground">Weak Spots</p>
              </div>
            </div>

            {/* Weak Spots Alert */}
            {weakSpots.length > 0 && (
              <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium">Areas Needing Improvement</span>
                </div>
                <div className="space-y-1.5">
                  {weakSpots.map(spot => (
                    <div key={`${spot.product}:${spot.context}`} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{spot.product}</Badge>
                        <span className="text-muted-foreground">{spot.context}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-destructive font-medium">{Math.round(spot.ratio * 100)}%</span>
                        <TrendingDown className="h-3 w-3 text-destructive" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strong Areas */}
            {strongAreas.length > 0 && (
              <div className="p-3 rounded-lg border border-primary/30 bg-primary/5">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">High-Quality Areas</span>
                </div>
                <div className="space-y-1.5">
                  {strongAreas.slice(0, 5).map(area => (
                    <div key={`${area.product}:${area.context}`} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{area.product}</Badge>
                        <span className="text-muted-foreground">{area.context}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-medium">{Math.round(area.ratio * 100)}%</span>
                        <TrendingUp className="h-3 w-3 text-primary" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* By Product */}
          <TabsContent value="products" className="mt-3">
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {Object.entries(byProduct).map(([product, stats]) => {
                  const prodTotal = stats.reduce((s, st) => s + st.total, 0);
                  const prodPositive = stats.reduce((s, st) => s + st.positive, 0);
                  const prodRatio = prodTotal > 0 ? prodPositive / prodTotal : 0;

                  return (
                    <div key={product} className="p-3 rounded-lg border space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className="text-[10px]">{product}</Badge>
                          <span className="text-xs text-muted-foreground">{prodTotal} feedback</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ThumbsUp className="h-3 w-3 text-primary" />
                          <span className="text-xs font-medium">{Math.round(prodRatio * 100)}%</span>
                        </div>
                      </div>
                      <Progress value={prodRatio * 100} className="h-1.5" />
                      <div className="space-y-1">
                        {stats.map(stat => (
                          <div key={stat.context} className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{stat.context}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-primary">👍 {stat.positive}</span>
                              <span className="text-destructive">👎 {stat.negative}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {Object.keys(byProduct).length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    No feedback data yet. Feedback will appear as users interact with AI outputs.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Audience Learning */}
          <TabsContent value="audience" className="mt-3">
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {audienceStats.length > 0 ? (
                  audienceStats.map(stat => (
                    <div key={`${stat.product_id}:${stat.audience_id}`} className="flex items-center justify-between p-2 rounded-lg border text-xs">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{stat.product_id}</Badge>
                        <Target className="h-3 w-3 text-muted-foreground" />
                        <span>{stat.audience_id}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-primary">👍 {stat.positive_feedback}</span>
                        <span className="text-destructive">👎 {stat.negative_feedback}</span>
                        <Badge
                          variant={stat.relevance_score >= 0.6 ? 'default' : 'secondary'}
                          className="text-[10px]"
                        >
                          {Math.round(stat.relevance_score * 100)}%
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    No audience learning data yet. Use the messaging generator and provide feedback on audience suggestions.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FeedbackAnalyticsDashboard;
