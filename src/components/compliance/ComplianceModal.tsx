/**
 * COMPLIANCE MODAL
 * Popup wrapper for the full Compliance Dashboard
 * Can be triggered from anywhere via button click
 */
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import { ComplianceDashboard } from './ComplianceDashboard';

interface ComplianceModalProps {
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
}

export const ComplianceModal: React.FC<ComplianceModalProps> = ({ 
  trigger,
  defaultOpen = false 
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Shield className="h-4 w-4 mr-2" />
            Compliance
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Compliance & Governance Dashboard
          </DialogTitle>
        </DialogHeader>
        <ComplianceDashboard />
      </DialogContent>
    </Dialog>
  );
};

export default ComplianceModal;
