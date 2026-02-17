/**
 * PUBLIC RATE LIMIT COMPONENT
 * Displays rate limiting information and handles enforcement
 */
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Shield, User, Zap } from 'lucide-react';

interface PublicRateLimitProps {
  requestsUsed: number;
  maxRequests: number;
  timeWindowHours: number;
  isBlocked: boolean;
  nextResetTime?: Date;
}

export const PublicRateLimit: React.FC<PublicRateLimitProps> = ({
  requestsUsed,
  maxRequests,
  timeWindowHours,
  isBlocked,
  nextResetTime
}) => {
  const usagePercentage = (requestsUsed / maxRequests) * 100;
  const remainingRequests = maxRequests - requestsUsed;
  
  const getUsageColor = () => {
    if (usagePercentage >= 90) return 'bg-red-500';
    if (usagePercentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatTimeRemaining = () => {
    if (!nextResetTime) return 'Unknown';
    
    const now = new Date();
    const diff = nextResetTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Resetting now...';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (isBlocked) {
    return (
      <Alert variant="destructive" className="mb-4">
        <Shield className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <strong>Rate limit exceeded!</strong>
            <p className="text-sm mt-1">
              You've used all {maxRequests} requests for this {timeWindowHours}-hour period.
              {nextResetTime && ` Resets in ${formatTimeRemaining()}.`}
            </p>
          </div>
          <Badge variant="destructive">Blocked</Badge>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Usage Limit</CardTitle>
          </div>
          <Badge variant={usagePercentage >= 90 ? 'destructive' : usagePercentage >= 70 ? 'secondary' : 'default'}>
            {requestsUsed}/{maxRequests}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          {remainingRequests} requests remaining this hour
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress value={usagePercentage} className="h-2" />
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                {nextResetTime ? `Resets in ${formatTimeRemaining()}` : 'Hourly limit'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>Public demo</span>
            </div>
          </div>
          
          {usagePercentage >= 80 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
              <p className="text-xs text-yellow-800">
                <strong>Approaching limit:</strong> Consider connecting with a human expert for extended assistance.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};