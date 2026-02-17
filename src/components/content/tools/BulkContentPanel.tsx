/**
 * Bulk Content Panel - Wrapper for bulk processing
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Layers, Upload, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BulkContentPanelProps {
  onJobCreated?: (result: any) => void;
}

const BulkContentPanel: React.FC<BulkContentPanelProps> = ({ onJobCreated }) => {
  const navigate = useNavigate();

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Bulk Processing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Process multiple videos at once with AI optimization.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Upload className="h-5 w-5" />
              <span className="text-xs">Upload Batch</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/production-hub?tab=bulk')}
            >
              <Zap className="h-5 w-5" />
              <span className="text-xs">View Queue</span>
            </Button>
          </div>
          <Badge variant="secondary" className="w-full justify-center py-2">
            Full bulk manager available in Production Hub
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkContentPanel;
