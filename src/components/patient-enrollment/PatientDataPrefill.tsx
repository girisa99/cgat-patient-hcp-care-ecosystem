/**
 * Patient Data Prefill Component
 * Allows selection of existing patients or adding new ones
 */
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, User, Search } from 'lucide-react';
import { useOnboardingDataPrefill } from '@/hooks/useOnboardingDataPrefill';
import { PatientEnrollmentData } from './PatientEnrollmentForm';

interface PatientDataPrefillProps {
  formData: PatientEnrollmentData;
  onPatientDataUpdate: (data: Partial<PatientEnrollmentData>) => void;
  readOnly?: boolean;
}

export const PatientDataPrefill: React.FC<PatientDataPrefillProps> = ({
  formData,
  onPatientDataUpdate,
  readOnly = false
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [isNewPatient, setIsNewPatient] = useState(true);
  const { prefillData, isLoading } = useOnboardingDataPrefill();

  const handlePatientSelection = (patientId: string) => {
    setSelectedPatientId(patientId);
    
    if (patientId === 'new') {
      setIsNewPatient(true);
      // Clear existing patient data
      onPatientDataUpdate({
        firstName: '',
        lastName: '',
        email: '',
        cellPhone: '',
        dateOfBirth: ''
      });
      return;
    }

    const selectedPatient = prefillData.patients.find(p => p.id === patientId);
    if (selectedPatient) {
      setIsNewPatient(false);
      onPatientDataUpdate({
        firstName: selectedPatient.firstName,
        lastName: selectedPatient.lastName,
        email: selectedPatient.email,
        cellPhone: selectedPatient.phone || ''
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading patient data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="patientSelect">Patient Information</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Select an existing patient from your records or add a new one
        </p>
        
        <Select 
          value={selectedPatientId} 
          onValueChange={handlePatientSelection}
          disabled={readOnly}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Choose existing patient or add new" />
          </SelectTrigger>
          <SelectContent className="z-50 bg-background shadow-md border">
            <SelectItem value="new">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Patient
              </div>
            </SelectItem>
            {prefillData.patients.map(patient => (
              <SelectItem key={patient.id} value={patient.id}>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {patient.firstName} {patient.lastName}
                  {patient.email && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {patient.email}
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!isNewPatient && selectedPatientId && (
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-primary" />
            <span className="font-medium text-primary">Using Existing Patient Data</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Patient information has been pre-filled from your records. 
            You can modify any fields below if needed.
          </p>
        </div>
      )}

      {isNewPatient && (
        <div className="p-3 bg-muted/30 border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Plus className="h-4 w-4" />
            <span className="font-medium">New Patient Registration</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Complete all required patient information fields below.
          </p>
        </div>
      )}
    </div>
  );
};