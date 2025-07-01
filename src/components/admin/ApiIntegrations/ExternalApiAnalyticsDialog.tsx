
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, X } from 'lucide-react';

interface ExternalApiAnalyticsDialogProps {
  api: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExternalApiAnalyticsDialog: React.FC<ExternalApiAnalyticsDialogProps> = ({
  api,
  open,
  onOpenChange
}) => {
  if (!api) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics: {api.external_name || api.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Total Requests</label>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Active Users</label>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExternalApiAnalyticsDialog;
