/**
 * Bulk Queue Status - Mobile Compact Widget
 * Shows queue status in a compact card for mobile views
 * Links to full Bulk Job Manager in Hub
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, CheckCircle, Clock, ChevronRight,
  Layers, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QueueStats {
  activeJobs: number;
  totalItems: number;
  completedItems: number;
  failedItems: number;
  isProcessing: boolean;
}

interface BulkQueueStatusMobileProps {
  stats?: QueueStats;
  onViewDetails?: () => void;
}

const BulkQueueStatusMobile: React.FC<BulkQueueStatusMobileProps> = ({
  stats = {
    activeJobs: 2,
    totalItems: 75,
    completedItems: 23,
    failedItems: 2,
    isProcessing: true
  },
  onViewDetails
}) => {
  const navigate = useNavigate();
  
  const progress = stats.totalItems > 0 
    ? Math.round((stats.completedItems / stats.totalItems) * 100) 
    : 0;

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails();
    } else {
      navigate('/genie-hub?tab=bulk');
    }
  };

  if (stats.activeJobs === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Layers className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Bulk Queue</p>
                <p className="text-xs text-muted-foreground">No active jobs</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleViewDetails}
              className="gap-1"
            >
              Create
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={stats.isProcessing ? 'border-primary/30 bg-primary/5' : ''}>
      <CardContent className="py-3 px-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stats.isProcessing ? 'bg-primary/10' : 'bg-muted'}`}>
              {stats.isProcessing ? (
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">Bulk Queue</p>
              <p className="text-xs text-muted-foreground">
                {stats.activeJobs} active job{stats.activeJobs !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {stats.completedItems}/{stats.totalItems}
            </Badge>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleViewDetails}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-1.5">
          <Progress value={progress} className="h-1.5" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{progress}% complete</span>
            {stats.failedItems > 0 && (
              <span className="text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {stats.failedItems} failed
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkQueueStatusMobile;
