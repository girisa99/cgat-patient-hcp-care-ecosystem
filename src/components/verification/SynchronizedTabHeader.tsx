
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Bug, CheckCircle, Activity, Code, FileText, Settings, RefreshCw } from 'lucide-react';
import { TabSyncData } from '@/hooks/useTabSynchronization';

interface SynchronizedTabHeaderProps {
  syncData: TabSyncData;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const SynchronizedTabHeader: React.FC<SynchronizedTabHeaderProps> = ({
  syncData,
  onRefresh,
  isRefreshing = false
}) => {
  return (
    <div className="space-y-4">
      {/* Sync Status */}
      <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium text-blue-900">Tab Synchronization</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-blue-700">
          <span>Last sync: {syncData.lastUpdateTime.toLocaleTimeString()}</span>
          {onRefresh && (
            <button 
              onClick={onRefresh}
              disabled={isRefreshing}
              className="px-2 py-1 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
            >
              {isRefreshing ? 'Syncing...' : 'Refresh'}
            </button>
          )}
        </div>
      </div>

      {/* Synchronized Tab List */}
      <TabsList className="grid w-full grid-cols-6 bg-muted/50">
        <TabsTrigger value="issues" className="flex items-center gap-2">
          <Bug className="h-4 w-4" />
          <span>Issues</span>
          <Badge variant="destructive" className="ml-1 text-xs">
            {syncData.totalActiveCount}
          </Badge>
        </TabsTrigger>
        
        <TabsTrigger value="fixed" className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>Fixed</span>
          <Badge variant="default" className="ml-1 text-xs bg-green-600">
            {syncData.totalFixedCount}
          </Badge>
        </TabsTrigger>
        
        <TabsTrigger value="security-performance" className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          <span>Security</span>
          <Badge variant="outline" className="ml-1 text-xs">
            {syncData.securityIssuesCount}
          </Badge>
        </TabsTrigger>
        
        <TabsTrigger value="implementation" className="flex items-center gap-2">
          <Code className="h-4 w-4" />
          <span>Implementation</span>
        </TabsTrigger>
        
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>Overview</span>
        </TabsTrigger>
        
        <TabsTrigger value="recommendations" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span>Recommendations</span>
        </TabsTrigger>
      </TabsList>

      {/* Real-time Metrics Bar */}
      <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-bold text-red-600">{syncData.criticalCount}</div>
          <div className="text-xs text-gray-600">Critical</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-orange-600">{syncData.highCount}</div>
          <div className="text-xs text-gray-600">High</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-yellow-600">{syncData.mediumCount}</div>
          <div className="text-xs text-gray-600">Medium</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{syncData.realFixesApplied}</div>
          <div className="text-xs text-gray-600">Real Fixes</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{syncData.backendFixedCount}</div>
          <div className="text-xs text-gray-600">Auto-Fixed</div>
        </div>
      </div>
    </div>
  );
};

export default SynchronizedTabHeader;
