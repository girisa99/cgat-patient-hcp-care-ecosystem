/**
 * Demo Mode Indicator Component
 * Shows demo mode status and provides demo controls
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Play, 
  RefreshCw, 
  Info, 
  Eye,
  Shield,
  Database
} from 'lucide-react';
import { useDemoMode } from '@/hooks/useDemoMode';
import { cn } from '@/lib/utils';

interface DemoModeIndicatorProps {
  showDetails?: boolean;
  className?: string;
}

export const DemoModeIndicator: React.FC<DemoModeIndicatorProps> = ({ 
  showDetails = false,
  className 
}) => {
  const { 
    isDemoMode, 
    demoConfig, 
    resetDemoData, 
    mockData,
    meta 
  } = useDemoMode();

  if (!isDemoMode) return null;

  const DemoControls = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-orange-600" />
        <span className="text-sm font-medium">Demo Mode Active</span>
      </div>
      
      <div className="text-xs text-muted-foreground space-y-2">
        <div className="flex justify-between">
          <span>Mode:</span>
          <Badge variant="outline" className="text-xs">
            {demoConfig.mode}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span>Data Entry:</span>
          <Badge variant={demoConfig.allowDataEntry ? "default" : "secondary"} className="text-xs">
            {demoConfig.allowDataEntry ? 'Allowed' : 'Restricted'}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span>Mock Records:</span>
          <span className="font-mono">{meta.totalMockRecords}</span>
        </div>
      </div>

      <div className="pt-2 border-t space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={resetDemoData}
          className="w-full flex items-center gap-2"
        >
          <RefreshCw className="w-3 h-3" />
          Reset Demo Data
        </Button>
        
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="flex-1 text-xs">
            <Eye className="w-3 h-3 mr-1" />
            Tour
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 text-xs">
            <Database className="w-3 h-3 mr-1" />
            Data
          </Button>
        </div>
      </div>
    </div>
  );

  if (showDetails) {
    return (
      <Card className={cn("border-orange-200 bg-orange-50/50", className)}>
        <CardContent className="p-4">
          <DemoControls />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "border-orange-300 bg-orange-100 hover:bg-orange-200 text-orange-800",
          "flex items-center gap-2 text-xs font-medium",
          className
        )}
      >
        <Play className="w-3 h-3 fill-orange-600" />
        🎭 DEMO MODE
        <Info className="w-3 h-3" />
      </Button>
    </div>
  );
};