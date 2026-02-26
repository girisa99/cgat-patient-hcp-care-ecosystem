/**
 * MessagingImprovementPanel
 * 
 * Dashboard panel for bi-weekly messaging improvements based on
 * user feedback, confusion signals, and usage patterns.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  RefreshCw,
  Calendar,
  Lightbulb,
  Target,
  Users,
  ChevronDown,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useMessagingFeedback } from '@/hooks/useMessagingFeedback';
import { GENIE_PRODUCTS, type GenieProductId } from '@/services/marketing/productVersionTrackingService';

// Product color map (products don't have color property, so we define here)
const PRODUCT_COLORS: Record<GenieProductId, string> = {
  spark: '#F97316',
  mind: '#3B82F6',
  vibe: '#22C55E',
  deck: '#EAB308',
  arc: '#EC4899',
  studio: '#9333EA',
  cast: '#EF4444',
  ask_genie: '#06B6D4',
};
import { toast } from 'sonner';

interface MessagingImprovementPanelProps {
  className?: string;
  onApplyImprovement?: (improvementId: string, newMessaging: string) => void;
}

export const MessagingImprovementPanel: React.FC<MessagingImprovementPanelProps> = ({
  className,
  onApplyImprovement,
}) => {
  const {
    currentCycle,
    pendingImprovements,
    recentFeedback,
    confusionSignals,
    latestAnalysis,
    isAnalyzing,
    runAnalysis,
    startCycle,
    approveImprovement,
    rejectImprovement,
    cycleProgress,
    daysRemaining,
    improvementStats,
  } = useMessagingFeedback({ showNotifications: true });

  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

  const toggleProduct = (productId: string) => {
    setExpandedProducts(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  // Group improvements by product
  const improvementsByProduct = pendingImprovements.reduce((acc, imp) => {
    if (!acc[imp.productId]) {
      acc[imp.productId] = [];
    }
    acc[imp.productId].push(imp);
    return acc;
  }, {} as Record<string, typeof pendingImprovements>);

  const handleApprove = (improvementId: string) => {
    approveImprovement(improvementId, 'admin');
    const improvement = pendingImprovements.find(i => i.id === improvementId);
    if (improvement && onApplyImprovement) {
      onApplyImprovement(improvementId, improvement.suggestedMessaging);
    }
  };

  const getImprovementTypeIcon = (type: string) => {
    switch (type) {
      case 'hook': return <Target className="w-4 h-4" />;
      case 'cta': return <ArrowRight className="w-4 h-4" />;
      case 'value_prop': return <Sparkles className="w-4 h-4" />;
      case 'clarification': return <Lightbulb className="w-4 h-4" />;
      case 'differentiation': return <TrendingUp className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getImprovementTypeColor = (type: string) => {
    switch (type) {
      case 'hook': return 'bg-orange-500/10 text-orange-600 border-orange-200';
      case 'cta': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'value_prop': return 'bg-purple-500/10 text-purple-600 border-purple-200';
      case 'clarification': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'differentiation': return 'bg-pink-500/10 text-pink-600 border-pink-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Cycle Status */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Messaging Improvement Engine
          </h3>
          <p className="text-sm text-muted-foreground">
            Bi-weekly analysis of user feedback, usage patterns, and confusion signals
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!currentCycle ? (
            <Button onClick={startCycle} variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              Start Cycle
            </Button>
          ) : (
            <Badge variant="outline" className="gap-1">
              <Clock className="w-3 h-3" />
              {daysRemaining}d remaining
            </Badge>
          )}
          <Button 
            onClick={() => runAnalysis()} 
            disabled={isAnalyzing}
            className="gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", isAnalyzing && "animate-spin")} />
            Run Analysis
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-500/5 to-orange-500/10 border-orange-200/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{improvementStats.pending}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-200/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">{improvementStats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-200/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Feedback</p>
                <p className="text-2xl font-bold text-blue-600">{recentFeedback.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-200/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Signals</p>
                <p className="text-2xl font-bold text-purple-600">{confusionSignals.length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cycle Progress */}
      {currentCycle && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Cycle #{currentCycle.cycleNumber} Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(cycleProgress)}%</span>
            </div>
            <Progress value={cycleProgress} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Started: {currentCycle.startDate.toLocaleDateString()}</span>
              <span>Ends: {currentCycle.endDate.toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Latest Analysis Summary */}
      {latestAnalysis && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Latest Analysis Summary
            </CardTitle>
            <CardDescription>
              {latestAnalysis.period.start.toLocaleDateString()} - {latestAnalysis.period.end.toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Sentiment</p>
                <div className="flex items-center gap-2 mt-1">
                  <ThumbsUp className="w-3 h-3 text-green-500" />
                  <span className="text-green-600">{latestAnalysis.sentimentBreakdown.positive}</span>
                  <ThumbsDown className="w-3 h-3 text-red-500" />
                  <span className="text-red-600">{latestAnalysis.sentimentBreakdown.negative}</span>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Top Keywords</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {latestAnalysis.topKeywords.slice(0, 3).map(k => (
                    <Badge key={k.keyword} variant="secondary" className="text-[10px]">
                      {k.keyword}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Competitors</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {latestAnalysis.competitorMentions.slice(0, 2).map(c => (
                    <Badge key={c.competitor} variant="outline" className="text-[10px]">
                      {c.competitor} ({c.frequency})
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Improvements by Product */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Suggested Improvements
            {pendingImprovements.length > 0 && (
              <Badge variant="secondary">{pendingImprovements.length}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            AI-suggested messaging improvements based on user feedback and confusion signals
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(improvementsByProduct).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No pending improvements</p>
              <p className="text-sm">Run analysis to generate suggestions</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {Object.entries(improvementsByProduct).map(([productId, productImprovements]) => {
                  const product = GENIE_PRODUCTS[productId as GenieProductId];
                  const isExpanded = expandedProducts.has(productId);

                  return (
                    <Collapsible
                      key={productId}
                      open={isExpanded}
                      onOpenChange={() => toggleProduct(productId)}
                    >
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: PRODUCT_COLORS[productId as GenieProductId] || '#888' }}
                            />
                            <span className="font-medium">{product?.name || productId}</span>
                            <Badge variant="secondary" className="text-xs">
                              {productImprovements.length} improvement{productImprovements.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="space-y-3 mt-3 pl-4 border-l-2 border-muted">
                          {productImprovements.map((improvement) => (
                            <motion.div
                              key={improvement.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-4 bg-background rounded-lg border space-y-3"
                            >
                              {/* Header */}
                              <div className="flex items-center justify-between">
                                <Badge 
                                  variant="outline" 
                                  className={cn("gap-1", getImprovementTypeColor(improvement.improvementType))}
                                >
                                  {getImprovementTypeIcon(improvement.improvementType)}
                                  {improvement.improvementType.replace('_', ' ')}
                                </Badge>
                                <Badge variant="secondary" className="text-[10px]">
                                  {Math.round(improvement.confidenceScore * 100)}% confidence
                                </Badge>
                              </div>

                              {/* Current vs Suggested */}
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Current</p>
                                  <p className="text-muted-foreground line-through">
                                    {improvement.currentMessaging.slice(0, 100)}...
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-green-600 mb-1">Suggested</p>
                                  <p className="font-medium">
                                    {improvement.suggestedMessaging.slice(0, 100)}...
                                  </p>
                                </div>
                              </div>

                              {/* Reasoning */}
                              <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                                <strong>Reasoning:</strong> {improvement.reasoning}
                              </div>

                              {/* Actions */}
                              <div className="flex items-center justify-between pt-2 border-t">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Users className="w-3 h-3" />
                                  Based on {improvement.basedOnFeedback.length} feedback + {improvement.basedOnSignals.length} signals
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => rejectImprovement(improvement.id, 'admin')}
                                    className="gap-1 text-red-600 hover:text-red-700"
                                  >
                                    <XCircle className="w-3 h-3" />
                                    Reject
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprove(improvement.id)}
                                    className="gap-1"
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                    Approve
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Recent Confusion Signals */}
      {confusionSignals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Active Confusion Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {confusionSignals.slice(0, 5).map((signal) => {
                const product = GENIE_PRODUCTS[signal.productId];
                return (
                  <div
                    key={signal.id}
                    className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: PRODUCT_COLORS[signal.productId] || '#888' }}
                      />
                      <span className="font-medium">{product?.name}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {signal.signalType.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span className="text-xs">{signal.frequency}x detected</span>
                      <span className="text-xs">{signal.affectedUsers} users</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MessagingImprovementPanel;
