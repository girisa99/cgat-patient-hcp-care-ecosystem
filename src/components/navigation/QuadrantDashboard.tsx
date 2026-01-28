/**
 * QuadrantDashboard - Landing Dashboard for 4-Quadrant Architecture
 * 
 * Displays 4 clear quadrant cards with visual flow:
 * CREATE → PRODUCE → MANAGE → PUBLISH
 * 
 * Each card shows:
 * - Quick access to primary product
 * - Recent activity
 * - Progress indicator
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Video,
  Calendar,
  Send,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { QUADRANT_CONFIG, type Quadrant } from './QuadrantNavigation';

interface QuadrantStats {
  quadrant: Quadrant;
  inProgress: number;
  completed: number;
  recentActivity?: string;
}

interface QuadrantDashboardProps {
  stats?: QuadrantStats[];
  className?: string;
}

export const QuadrantDashboard: React.FC<QuadrantDashboardProps> = ({
  stats = [],
  className,
}) => {
  const navigate = useNavigate();

  // Mock stats if not provided
  const defaultStats: QuadrantStats[] = [
    { quadrant: 'create', inProgress: 3, completed: 12, recentActivity: '2 scripts in progress' },
    { quadrant: 'produce', inProgress: 1, completed: 8, recentActivity: '1 video rendering' },
    { quadrant: 'manage', inProgress: 5, completed: 24, recentActivity: '3 scheduled for today' },
    { quadrant: 'publish', inProgress: 2, completed: 18, recentActivity: 'Last published 2h ago' },
  ];

  const quadrantStats = stats.length > 0 ? stats : defaultStats;

  const getStatsForQuadrant = (quadrantId: Quadrant) => {
    return quadrantStats.find(s => s.quadrant === quadrantId) || {
      quadrant: quadrantId,
      inProgress: 0,
      completed: 0,
    };
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Flow indicator */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium">Your Production Flow</span>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">CREATE</Badge>
          <ArrowRight className="h-3 w-3" />
          <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50">PRODUCE</Badge>
          <ArrowRight className="h-3 w-3" />
          <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">MANAGE</Badge>
          <ArrowRight className="h-3 w-3" />
          <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">PUBLISH</Badge>
        </div>
      </div>

      {/* Quadrant Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUADRANT_CONFIG.map((quadrant, index) => {
          const stats = getStatsForQuadrant(quadrant.id);
          const total = stats.inProgress + stats.completed;
          const progress = total > 0 ? Math.round((stats.completed / total) * 100) : 0;

          return (
            <Card
              key={quadrant.id}
              className={cn(
                'group relative overflow-hidden transition-all hover:shadow-lg cursor-pointer',
                'border-2 hover:border-primary/30'
              )}
              onClick={() => navigate(quadrant.primaryRoute)}
            >
              {/* Step number */}
              <div className="absolute top-3 right-3">
                <Badge variant="outline" className="text-xs font-mono">
                  {index + 1}/4
                </Badge>
              </div>

              {/* Gradient background */}
              <div className={cn(
                'absolute inset-0 opacity-50 bg-gradient-to-br',
                quadrant.bgGradient
              )} />

              <CardHeader className="relative pb-2">
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br mb-3', quadrant.bgGradient)}>
                  <span className={quadrant.color}>{quadrant.icon}</span>
                </div>
                <CardTitle className="flex items-center gap-2">
                  <span>{quadrant.label}</span>
                </CardTitle>
                <CardDescription>{quadrant.description}</CardDescription>
              </CardHeader>

              <CardContent className="relative space-y-4">
                {/* Products */}
                <div className="flex flex-wrap gap-1">
                  {quadrant.products.slice(0, 3).map((product) => (
                    <Badge key={product.id} variant="secondary" className="text-xs">
                      {product.name.replace('Genie ', '')}
                    </Badge>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{stats.inProgress} in progress</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{stats.completed} done</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-1">
                  <Progress value={progress} className="h-1.5" />
                  {stats.recentActivity && (
                    <p className="text-[10px] text-muted-foreground truncate">
                      {stats.recentActivity}
                    </p>
                  )}
                </div>

                {/* CTA */}
                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(quadrant.primaryRoute);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    New
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs group-hover:translate-x-1 transition-transform"
                  >
                    Open
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardContent>

              {/* Arrow connector (except last) */}
              {index < 3 && (
                <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background border shadow-sm">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/genie-spark')}>
          <Sparkles className="h-4 w-4 mr-2" />
          Start New Project
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate('/genie-admin?tab=content')}>
          <Video className="h-4 w-4 mr-2" />
          View Library
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate('/genie-admin?tab=analytics')}>
          <Calendar className="h-4 w-4 mr-2" />
          View Analytics
        </Button>
      </div>
    </div>
  );
};

export default QuadrantDashboard;
