/**
 * Real-Time Metrics Component
 * P4-ANA-27: Real-Time Metrics Stream
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { performanceAnalyticsService, RealTimeMetric } from '@/services/analytics/performanceAnalyticsService';
import { TrendingUp, TrendingDown, Minus, Activity, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const RealTimeMetricsPanel: React.FC = () => {
  const [metrics, setMetrics] = useState<RealTimeMetric[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initial fetch
    performanceAnalyticsService.getCurrentMetrics().then(setMetrics);
    setIsConnected(true);

    // Subscribe to real-time updates
    const subscriberId = `realtime_${Date.now()}`;
    performanceAnalyticsService.subscribeToRealTimeMetrics(
      subscriberId,
      (newMetrics) => setMetrics(newMetrics),
      5000 // 5 second intervals
    );

    return () => {
      performanceAnalyticsService.unsubscribeFromRealTimeMetrics(subscriberId);
      setIsConnected(false);
    };
  }, []);

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getChangeColor = (change: number, metric: string) => {
    // For error rate and queue depth, lower is better
    const lowerIsBetter = ['error_rate', 'queue_depth', 'api_latency'].includes(metric);
    if (lowerIsBetter) {
      return change < 0 ? 'text-green-600' : change > 0 ? 'text-red-600' : 'text-muted-foreground';
    }
    return change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-muted-foreground';
  };

  const getMetricIcon = (metricId: string) => {
    switch (metricId) {
      case 'active_users': return '👥';
      case 'generations_minute': return '🚀';
      case 'api_latency': return '⚡';
      case 'error_rate': return '⚠️';
      case 'queue_depth': return '📊';
      default: return '📈';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Real-Time Metrics
            </CardTitle>
            <CardDescription>Live system metrics updated every 5 seconds</CardDescription>
          </div>
          <Badge 
            variant={isConnected ? 'default' : 'secondary'} 
            className="flex items-center gap-1"
          >
            <Radio className={`h-3 w-3 ${isConnected ? 'animate-pulse' : ''}`} />
            {isConnected ? 'Live' : 'Disconnected'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {metrics.map((metric) => (
              <motion.div
                key={metric.metricId}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{getMetricIcon(metric.metricId)}</span>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(metric.change)}
                    <span className={`text-sm font-medium ${getChangeColor(metric.changePercent, metric.metricId)}`}>
                      {metric.changePercent > 0 ? '+' : ''}{metric.changePercent}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{metric.name}</p>
                  <motion.p
                    key={`${metric.metricId}-${metric.value}`}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    className="text-2xl font-bold"
                  >
                    {metric.metricId === 'error_rate' 
                      ? `${metric.value}%` 
                      : metric.metricId === 'api_latency'
                        ? `${metric.value}ms`
                        : metric.value.toLocaleString()
                    }
                  </motion.p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metric.unit}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Last Update Timestamp */}
        {metrics.length > 0 && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            Last updated: {new Date(metrics[0]?.timestamp).toLocaleTimeString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default RealTimeMetricsPanel;
