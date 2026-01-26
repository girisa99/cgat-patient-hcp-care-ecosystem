/**
 * BetaAwardsPanel
 * 
 * Displays beta tester badges, credits, streaks, and leaderboard.
 * Integrates with useBetaAwards hook for real-time updates.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Star, Flame, Users, Gift, Award, Zap } from 'lucide-react';
import { useBetaAwards } from '@/hooks/useBetaAwards';
import { cn } from '@/lib/utils';

interface BetaAwardsPanelProps {
  userId: string;
  email?: string;
  displayName?: string;
  compact?: boolean;
  className?: string;
}

export const BetaAwardsPanel: React.FC<BetaAwardsPanelProps> = ({
  userId,
  email,
  displayName,
  compact = false,
  className
}) => {
  const {
    participant,
    isEnrolled,
    isLoading,
    earnedBadges,
    availableBadges,
    badgeProgress,
    leaderboard,
    userRank,
    getTierColor,
    getTierIcon,
    getNextTierProgress
  } = useBetaAwards({ userId, email, displayName });

  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="p-4">
          <div className="h-20 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!isEnrolled) {
    return (
      <Card className={cn('border-dashed', className)}>
        <CardContent className="p-4 text-center text-muted-foreground">
          <Gift className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Join the Beta Program to earn rewards!</p>
        </CardContent>
      </Card>
    );
  }

  const tierProgress = getNextTierProgress();

  // Compact view for sidebar/widgets
  if (compact) {
    return (
      <Card className={cn('bg-gradient-to-br from-primary/5 to-primary/10', className)}>
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getTierIcon(participant!.tier)}</span>
              <span className={cn('font-medium capitalize', getTierColor(participant!.tier))}>
                {participant!.tier}
              </span>
            </div>
            <Badge variant="secondary" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              {participant!.totalCreditsEarned}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Flame className="h-3 w-3 text-orange-500" />
            <span>{participant!.currentStreak} day streak</span>
            <span className="mx-1">•</span>
            <Trophy className="h-3 w-3 text-amber-500" />
            <span>{earnedBadges.length} badges</span>
          </div>
          
          <Progress value={tierProgress.percentage} className="h-1" />
        </CardContent>
      </Card>
    );
  }

  // Full panel view
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Award className="h-5 w-5 text-primary" />
          Beta Rewards
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 bg-muted/50 rounded-lg">
            <div className="text-lg font-bold">{getTierIcon(participant!.tier)}</div>
            <div className="text-[10px] text-muted-foreground capitalize">{participant!.tier}</div>
          </div>
          <div className="p-2 bg-primary/10 rounded-lg">
            <div className="text-lg font-bold text-primary">{participant!.totalCreditsEarned}</div>
            <div className="text-[10px] text-muted-foreground">Credits</div>
          </div>
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <div className="text-lg font-bold text-orange-500">{participant!.currentStreak}</div>
            <div className="text-[10px] text-muted-foreground">Streak</div>
          </div>
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <div className="text-lg font-bold text-amber-500">{earnedBadges.length}</div>
            <div className="text-[10px] text-muted-foreground">Badges</div>
          </div>
        </div>

        {/* Tier Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Next Tier Progress</span>
            <span>{tierProgress.current} / {tierProgress.required}</span>
          </div>
          <Progress value={tierProgress.percentage} className="h-2" />
        </div>

        <Tabs defaultValue="badges" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-8">
            <TabsTrigger value="badges" className="text-xs">Badges</TabsTrigger>
            <TabsTrigger value="progress" className="text-xs">Progress</TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-xs">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="badges" className="mt-2">
            <ScrollArea className="h-[200px]">
              <div className="grid grid-cols-4 gap-2">
                {earnedBadges.map(badge => (
                  <div 
                    key={badge.id}
                    className="flex flex-col items-center p-2 bg-primary/5 rounded-lg text-center"
                    title={badge.description}
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <span className="text-[9px] font-medium mt-1 line-clamp-1">{badge.name}</span>
                    <Badge variant="outline" className={cn('text-[8px] mt-1', getTierColor(badge.tier))}>
                      {badge.tier}
                    </Badge>
                  </div>
                ))}
                
                {earnedBadges.length === 0 && (
                  <div className="col-span-4 text-center text-muted-foreground text-sm py-4">
                    Complete activities to earn badges!
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="progress" className="mt-2">
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {availableBadges.slice(0, 6).map(badge => {
                  const progress = badgeProgress.get(badge.id);
                  return (
                    <div key={badge.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                      <span className="text-xl opacity-50">{badge.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium truncate">{badge.name}</span>
                          <span className="text-muted-foreground">
                            {progress?.current || 0}/{progress?.target || 0}
                          </span>
                        </div>
                        <Progress value={progress?.percentage || 0} className="h-1 mt-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-2">
            <ScrollArea className="h-[200px]">
              <div className="space-y-1">
                {leaderboard.map((entry, index) => (
                  <div 
                    key={entry.userId}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-lg',
                      entry.userId === userId ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'
                    )}
                  >
                    <span className={cn(
                      'w-6 text-center font-bold',
                      index === 0 && 'text-amber-500',
                      index === 1 && 'text-gray-400',
                      index === 2 && 'text-orange-600'
                    )}>
                      {index < 3 ? ['🥇', '🥈', '🥉'][index] : entry.rank}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{entry.displayName}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {entry.badgeCount} badges • {entry.streak} streak
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {entry.totalCredits}
                    </Badge>
                  </div>
                ))}
                
                {userRank && userRank > leaderboard.length && (
                  <div className="text-center text-xs text-muted-foreground py-2">
                    Your rank: #{userRank}
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

export default BetaAwardsPanel;
