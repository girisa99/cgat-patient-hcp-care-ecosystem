
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Shield, Database, Activity } from 'lucide-react';

interface UserStats {
  total: number;
  byRole: Record<string, number>;
  byStatus: Record<string, number>;
  recent: number;
}

interface ConsistentUsersHeaderProps {
  userStats: UserStats;
  meta?: any;
  debugMode: boolean;
  onToggleDebug: () => void;
}

export const ConsistentUsersHeader: React.FC<ConsistentUsersHeaderProps> = ({
  userStats,
  meta,
  debugMode,
  onToggleDebug
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Users Card */}
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{userStats.total}</div>
          <p className="text-xs text-gray-500">
            {userStats.recent} added recently
          </p>
        </CardContent>
      </Card>

      {/* Roles Distribution Card */}
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Roles</CardTitle>
          <Shield className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(userStats.byRole).map(([role, count]) => (
              <div key={role} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">{role}</span>
                <Badge variant="outline" className="text-xs">
                  {count}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Overview Card */}
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Status</CardTitle>
          <Activity className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(userStats.byStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">{status}</span>
                <Badge 
                  variant={status === 'active' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {count}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Debug Controls Card */}
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Debug Tools</CardTitle>
          <Database className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              onClick={onToggleDebug}
              variant={debugMode ? "default" : "outline"}
              size="sm"
              className="w-full"
            >
              {debugMode ? "Hide Debug" : "Show Debug"}
            </Button>
            {meta && (
              <div className="text-xs text-gray-500">
                <div>Source: {meta.source || 'Database'}</div>
                <div>Updated: {meta.lastUpdated ? new Date(meta.lastUpdated).toLocaleTimeString() : 'Just now'}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
