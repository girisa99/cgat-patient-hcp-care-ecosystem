
import React from 'react';
import { AlertTriangle, Bug } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface RoleStatisticsCardProps {
  userStats: {
    totalUsers: number;
    usersWithRoles: number;
    usersWithoutRoles: number;
  };
  debugMode: boolean;
  onToggleDebug: () => void;
}

export const RoleStatisticsCard: React.FC<RoleStatisticsCardProps> = ({
  userStats,
  debugMode,
  onToggleDebug
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Role Assignment Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 items-center mb-4">
          <Badge variant="outline">
            Total Users: {userStats.totalUsers}
          </Badge>
          <Badge variant="default">
            With Roles: {userStats.usersWithRoles}
          </Badge>
          <Badge variant="destructive">
            Without Roles: {userStats.usersWithoutRoles}
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={onToggleDebug}
            variant="outline"
            size="sm"
          >
            <Bug className="mr-2 h-4 w-4" />
            {debugMode ? 'Hide' : 'Show'} Role Debug Info
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
