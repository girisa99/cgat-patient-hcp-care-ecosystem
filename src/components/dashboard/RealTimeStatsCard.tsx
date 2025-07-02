
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Shield, Building, CheckCircle, RefreshCw, Activity } from 'lucide-react';
import { useRealTimeUserStats } from '@/hooks/useRealTimeUserStats';

export const RealTimeStatsCard: React.FC = () => {
  const { data: stats, isLoading, error, refetch, isRefetching } = useRealTimeUserStats();

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    refetch();
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800">Statistics Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700 mb-4">Failed to load user statistics</p>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Activity className="h-5 w-5" />
            Real-Time System Statistics
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Live Data
            </Badge>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm"
              disabled={isLoading || isRefetching}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${(isLoading || isRefetching) ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-blue-700">Loading real-time statistics...</span>
          </div>
        ) : stats ? (
          <div className="space-y-4">
            {/* Main Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 border border-blue-200 rounded-lg bg-white">
                <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-900">{stats.totalUsers}</div>
                <div className="text-sm text-blue-700">Total Users</div>
              </div>
              
              <div className="text-center p-3 border border-green-200 rounded-lg bg-green-50">
                <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-900">{stats.verifiedUsers}</div>
                <div className="text-sm text-green-700">Verified Users</div>
              </div>
              
              <div className="text-center p-3 border border-purple-200 rounded-lg bg-purple-50">
                <Shield className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-900">{stats.totalPermissions}</div>
                <div className="text-sm text-purple-700">Permissions</div>
              </div>
              
              <div className="text-center p-3 border border-orange-200 rounded-lg bg-orange-50">
                <Building className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-900">{stats.totalFacilities}</div>
                <div className="text-sm text-orange-700">Facilities</div>
                <div className="text-xs text-orange-600 mt-1">
                  ({stats.activeFacilities} active)
                </div>
              </div>
            </div>

            {/* Role Distribution */}
            {Object.keys(stats.usersByRole).length > 0 && (
              <div>
                <h4 className="font-medium text-blue-900 mb-3">User Role Distribution</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.usersByRole).map(([role, count]) => (
                    <Badge key={role} variant="secondary" className="px-3 py-1">
                      {role}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Last Updated */}
            <div className="text-xs text-blue-600 text-center pt-2 border-t border-blue-200">
              Last updated: {new Date(stats.lastUpdated).toLocaleString()}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-blue-700">
            No statistics available
          </div>
        )}
      </CardContent>
    </Card>
  );
};
