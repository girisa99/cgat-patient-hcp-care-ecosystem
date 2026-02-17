/**
 * Funnel Visualization Component
 * P4 Analytics Suite - Conversion Funnel Display
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, Users, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFunnelMetrics } from '@/hooks/useAdvancedAnalytics';

interface FunnelVisualizationProps {
  funnelId?: string;
  title?: string;
  description?: string;
}

export const FunnelVisualization: React.FC<FunnelVisualizationProps> = ({
  funnelId = 'signup_to_generation',
  title = 'User Conversion Funnel',
  description = 'From landing to first generation'
}) => {
  const { data: funnelSteps, isLoading, error } = useFunnelMetrics(funnelId);

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-48" />
          <div className="h-4 bg-muted rounded w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-16 bg-muted/50 rounded" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || !funnelSteps) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <AlertCircle className="w-8 h-8 mx-auto text-destructive mb-2" />
          <p className="text-muted-foreground">Failed to load funnel data</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate max width for funnel visualization
  const maxUsers = Math.max(...funnelSteps.map(s => s.userCount), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {funnelSteps.map((step, index) => {
          const widthPercent = (step.userCount / maxUsers) * 100;
          const isLastStep = index === funnelSteps.length - 1;
          
          return (
            <motion.div
              key={step.stepId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Funnel step */}
              <div className="relative">
                <div
                  className="h-14 rounded-lg bg-gradient-to-r from-primary/80 to-primary/40 flex items-center justify-between px-4 text-primary-foreground transition-all"
                  style={{ 
                    width: `${Math.max(widthPercent, 30)}%`,
                    marginLeft: `${(100 - Math.max(widthPercent, 30)) / 2}%`
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{step.stepName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">
                      {step.userCount.toLocaleString()}
                    </span>
                    <Badge 
                      variant={step.conversionRate >= 50 ? 'default' : 'secondary'}
                      className="bg-white/20"
                    >
                      {step.conversionRate.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Drop-off indicator */}
              {!isLastStep && (
                <div className="flex items-center justify-center py-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ArrowDown className="w-3 h-3" />
                    <span className="text-destructive font-medium">
                      -{step.dropoffRate.toFixed(1)}% drop-off
                    </span>
                    {step.avgTimeSpent > 0 && (
                      <span className="text-muted-foreground">
                        • avg {step.avgTimeSpent}s
                      </span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
        
        {/* Summary */}
        <div className="pt-4 border-t mt-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Overall Conversion</span>
            <span className="font-bold text-lg">
              {funnelSteps.length > 0 
                ? `${((funnelSteps[funnelSteps.length - 1].userCount / Math.max(funnelSteps[0].userCount, 1)) * 100).toFixed(1)}%`
                : '0%'
              }
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FunnelVisualization;
