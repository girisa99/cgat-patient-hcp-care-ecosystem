
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, Building, Calendar, MapPin } from 'lucide-react';

interface PatientViewDialogProps {
  open: boolean;
  onClose: () => void;
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    created_at: string;
    facilities?: {
      name: string;
    } | null;
    department?: string;
    avatar_url?: string;
  };
}

export const PatientViewDialog: React.FC<PatientViewDialogProps> = ({
  open,
  onClose,
  patient
}) => {
  if (!patient) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Patient Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Header */}
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold">
                {patient.first_name} {patient.last_name}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Active Patient
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Contact Information
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{patient.email}</p>
                </div>
              </div>

              {patient.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{patient.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Facility Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Facility Information
            </h4>
            
            <div className="flex items-center gap-3">
              <Building className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Assigned Facility</p>
                <p className="text-sm text-muted-foreground">
                  {patient.facilities?.name || 'Not assigned to any facility'}
                </p>
              </div>
            </div>

            {patient.department && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Department</p>
                  <p className="text-sm text-muted-foreground">{patient.department}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Registration Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Registration Information
            </h4>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Registration Date</p>
                <p className="text-sm text-muted-foreground">{formatDate(patient.created_at)}</p>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">System Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Patient ID:</span>
                <p className="font-mono text-xs">{patient.id}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <p className="text-green-600 font-medium">Active</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
