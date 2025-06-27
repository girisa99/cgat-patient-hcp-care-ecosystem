
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Calendar } from 'lucide-react';

interface PatientViewDialogProps {
  open: boolean;
  onClose: () => void;
  patient: any;
}

export const PatientViewDialog: React.FC<PatientViewDialogProps> = ({
  open,
  onClose,
  patient
}) => {
  const patientName = patient?.first_name && patient?.last_name 
    ? `${patient.first_name} ${patient.last_name}`
    : 'Unknown Patient';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Patient Details
          </DialogTitle>
          <DialogDescription>
            View patient information and account details.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Patient</Badge>
            <Badge variant="secondary">Active</Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{patientName}</p>
                <p className="text-sm text-muted-foreground">Full Name</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{patient?.email || 'No email provided'}</p>
                <p className="text-sm text-muted-foreground">Email Address</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{patient?.phone || 'No phone provided'}</p>
                <p className="text-sm text-muted-foreground">Phone Number</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {patient?.created_at ? new Date(patient.created_at).toLocaleDateString() : 'Unknown'}
                </p>
                <p className="text-sm text-muted-foreground">Member Since</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
