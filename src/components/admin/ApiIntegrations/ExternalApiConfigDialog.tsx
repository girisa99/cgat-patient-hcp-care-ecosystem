import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, X } from 'lucide-react';
import { ApiSummary } from '@/types/api';

interface ExternalApiConfigDialogProps {
  api: ApiSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExternalApiConfigDialog: React.FC<ExternalApiConfigDialogProps> = ({
  api,
  open,
  onOpenChange
}) => {
  if (!api) return null;

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configure API: {api.external_name || api.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge variant="outline" className="ml-2">
                    {api.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Version</label>
                  <p>v{api.version}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Visibility</label>
                  <p>{api.visibility || 'Private'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Pricing Model</label>
                  <p>{api.pricing_model || 'Free'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExternalApiConfigDialog;
