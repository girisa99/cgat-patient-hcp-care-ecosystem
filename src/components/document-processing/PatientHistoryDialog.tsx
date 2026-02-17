import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  HeartPulse, 
  AlertTriangle, 
  Pill, 
  ClipboardList,
  Plus,
  X,
  CheckCircle
} from 'lucide-react';

export interface PatientHistory {
  allergies: string[];
  currentMedications: string[];
  conditions: string[];
  notes: string;
}

interface PatientHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (history: PatientHistory) => void;
  patientName?: string;
  medicationName?: string;
}

export const PatientHistoryDialog: React.FC<PatientHistoryDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  patientName,
  medicationName
}) => {
  const [allergies, setAllergies] = useState<string[]>([]);
  const [currentMedications, setCurrentMedications] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [newCondition, setNewCondition] = useState('');

  const addItem = (
    value: string, 
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    clearInput: () => void
  ) => {
    if (value.trim()) {
      setter(prev => [...prev, value.trim()]);
      clearInput();
    }
  };

  const removeItem = (
    index: number,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    onSubmit({
      allergies,
      currentMedications,
      conditions,
      notes
    });
    // Reset form
    setAllergies([]);
    setCurrentMedications([]);
    setConditions([]);
    setNotes('');
    onClose();
  };

  const handleSkip = () => {
    onSubmit({
      allergies: [],
      currentMedications: [],
      conditions: [],
      notes: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-primary" />
            Patient History Check
          </DialogTitle>
          <DialogDescription>
            {patientName && medicationName ? (
              <>
                Review patient history for <strong>{patientName}</strong> before dispensing <strong>{medicationName}</strong>
              </>
            ) : (
              <>
                Enter patient medical history for drug interaction and safety screening
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Drug Allergies */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-medium">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Drug Allergies
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Penicillin, Sulfa drugs, NSAIDs..."
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addItem(newAllergy, setAllergies, () => setNewAllergy(''));
                  }
                }}
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => addItem(newAllergy, setAllergies, () => setNewAllergy(''))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {allergies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {allergies.map((allergy, i) => (
                  <Badge key={i} variant="destructive" className="gap-1 py-1">
                    {allergy}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:opacity-70" 
                      onClick={() => removeItem(i, setAllergies)}
                    />
                  </Badge>
                ))}
              </div>
            )}
            {allergies.length === 0 && (
              <p className="text-xs text-muted-foreground">No known drug allergies</p>
            )}
          </div>

          {/* Current Medications */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-medium">
              <Pill className="h-4 w-4 text-primary" />
              Current Medications
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Metformin 500mg, Lisinopril 10mg..."
                value={newMedication}
                onChange={(e) => setNewMedication(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addItem(newMedication, setCurrentMedications, () => setNewMedication(''));
                  }
                }}
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => addItem(newMedication, setCurrentMedications, () => setNewMedication(''))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {currentMedications.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {currentMedications.map((med, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 py-1">
                    {med}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:opacity-70" 
                      onClick={() => removeItem(i, setCurrentMedications)}
                    />
                  </Badge>
                ))}
              </div>
            )}
            {currentMedications.length === 0 && (
              <p className="text-xs text-muted-foreground">No current medications listed</p>
            )}
          </div>

          {/* Medical Conditions */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-medium">
              <ClipboardList className="h-4 w-4 text-amber-500" />
              Medical Conditions
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Diabetes, Hypertension, Renal impairment..."
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addItem(newCondition, setConditions, () => setNewCondition(''));
                  }
                }}
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => addItem(newCondition, setConditions, () => setNewCondition(''))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {conditions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {conditions.map((condition, i) => (
                  <Badge key={i} variant="outline" className="gap-1 py-1 border-amber-500 text-amber-700">
                    {condition}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:opacity-70" 
                      onClick={() => removeItem(i, setConditions)}
                    />
                  </Badge>
                ))}
              </div>
            )}
            {conditions.length === 0 && (
              <p className="text-xs text-muted-foreground">No medical conditions listed</p>
            )}
          </div>

          {/* Additional Notes */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Additional Notes</Label>
            <Textarea
              placeholder="Any other relevant patient information (pregnancy, nursing, recent surgeries, etc.)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Safety Notice */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Patient history will be used to check for drug interactions, contraindications, 
              and provide personalized clinical recommendations.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleSkip}>
            Skip for Now
          </Button>
          <Button onClick={handleSubmit}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Continue with History
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PatientHistoryDialog;
