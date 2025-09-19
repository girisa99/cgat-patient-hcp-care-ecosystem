/**
 * NPI VERIFICATION CONFIRMATION MODAL
 * Asks users to choose between manual entry and NPI auto-verification
 * Integrates with enrollment agent for seamless workflow
 */
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ShieldCheck, 
  Edit, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Zap,
  FileText,
  User
} from 'lucide-react';

interface NPIVerificationChoice {
  method: 'manual' | 'verify' | null;
  confirmed: boolean;
}

interface NPIVerificationConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChoice: (choice: NPIVerificationChoice) => void;
  sectionType: 'provider' | 'treatment_center' | 'referral';
}

export const NPIVerificationConfirmationModal: React.FC<NPIVerificationConfirmationModalProps> = ({
  isOpen,
  onClose,
  onChoice,
  sectionType
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'manual' | 'verify' | null>(null);

  const getSectionTitle = () => {
    switch (sectionType) {
      case 'provider': return 'Provider Information';
      case 'treatment_center': return 'Treatment Center Information';
      case 'referral': return 'Referral Information';
      default: return 'Information Entry';
    }
  };

  const handleConfirm = () => {
    if (selectedMethod) {
      onChoice({
        method: selectedMethod,
        confirmed: true
      });
      onClose();
    }
  };

  const handleSkip = () => {
    onChoice({
      method: null,
      confirmed: false
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {getSectionTitle()} Entry Method
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto max-h-[calc(85vh-140px)] pr-2">
          <p className="text-muted-foreground">
            Choose how you'd like to enter {sectionType} information. Our NPI verification agent can auto-fill most fields to save you time.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Manual Entry Option */}
            <Card 
              className={`cursor-pointer transition-all ${
                selectedMethod === 'manual' 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'hover:border-muted-foreground'
              }`}
              onClick={() => setSelectedMethod('manual')}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    selectedMethod === 'manual' ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    <Edit className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Manual Entry</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Fill out all fields manually with complete control
                    </p>
                    
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-3 w-3" />
                        <span>~15-20 minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-3 w-3" />
                        <span>All 44 fields available</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>Complete control</span>
                      </div>
                    </div>

                    {selectedMethod === 'manual' && (
                      <Badge className="mt-3" variant="default">Selected</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* NPI Verification Option */}
            <Card 
              className={`cursor-pointer transition-all ${
                selectedMethod === 'verify' 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'hover:border-muted-foreground'
              }`}
              onClick={() => setSelectedMethod('verify')}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    selectedMethod === 'verify' ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">NPI Verification & Auto-Fill</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Verify NPI and automatically fill provider information
                    </p>
                    
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Zap className="h-3 w-3 text-blue-600" />
                        <span>~5-8 minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <ShieldCheck className="h-3 w-3 text-green-600" />
                        <span>NPI Registry verified</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>Auto-filled accuracy</span>
                      </div>
                    </div>

                    {selectedMethod === 'verify' && (
                      <Badge className="mt-3" variant="default">Selected</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparison Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted/30 p-3 border-b">
              <h4 className="font-medium">Feature Comparison</h4>
            </div>
            <div className="divide-y">
              <div className="grid grid-cols-3 gap-4 p-3 text-sm">
                <span className="font-medium">Feature</span>
                <span className="text-center font-medium">Manual Entry</span>
                <span className="text-center font-medium">NPI Verification</span>
              </div>
              <div className="grid grid-cols-3 gap-4 p-3 text-sm">
                <span>Setup Time</span>
                <span className="text-center">15-20 min</span>
                <span className="text-center text-green-600">5-8 min</span>
              </div>
              <div className="grid grid-cols-3 gap-4 p-3 text-sm">
                <span>Data Accuracy</span>
                <span className="text-center">User dependent</span>
                <span className="text-center text-green-600">Registry verified</span>
              </div>
              <div className="grid grid-cols-3 gap-4 p-3 text-sm">
                <span>Field Coverage</span>
                <span className="text-center">All 44 fields</span>
                <span className="text-center">~30 auto + manual</span>
              </div>
              <div className="grid grid-cols-3 gap-4 p-3 text-sm">
                <span>Error Prevention</span>
                <span className="text-center">Manual validation</span>
                <span className="text-center text-green-600">Auto validation</span>
              </div>
            </div>
          </div>

          {selectedMethod === 'verify' && (
            <div className="space-y-3">
              <div className="p-3 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      🤖 NPI Verification Process:
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="font-medium text-blue-700 dark:text-blue-300">Phase 1: Registry Check</p>
                        <ul className="text-blue-600 dark:text-blue-400 space-y-0.5">
                          <li>• Validate NPI format</li>
                          <li>• Query NPPES registry</li>
                          <li>• Verify active status</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-blue-700 dark:text-blue-300">Phase 2: Auto-Fill</p>
                        <ul className="text-blue-600 dark:text-blue-400 space-y-0.5">
                          <li>• Extract provider details</li>
                          <li>• Fill practice information</li>
                          <li>• Cross-validate data</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-2 p-2 bg-white/50 dark:bg-black/20 rounded border-l-2 border-green-500">
                      <p className="text-xs font-medium text-green-700 dark:text-green-300">
                        ⏱️ Time: 30-60 seconds • Auto-fills ~30 fields
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-2 border rounded-lg bg-amber-50 dark:bg-amber-950/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-3 w-3 text-amber-600 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-medium text-amber-800 dark:text-amber-200">Referral & Treatment Center Integration:</p>
                    <p className="text-amber-700 dark:text-amber-300">Will capture provider-treatment center associations and referral relationships automatically.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Separator />

          <div className="flex justify-between">
            <Button variant="outline" onClick={handleSkip}>
              Skip for Now
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!selectedMethod}
              className="min-w-32"
            >
              {selectedMethod === 'manual' && 'Start Manual Entry'}
              {selectedMethod === 'verify' && 'Start Verification'}
              {!selectedMethod && 'Select Method'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};