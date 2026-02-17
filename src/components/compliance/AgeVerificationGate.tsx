/**
 * AGE VERIFICATION GATE
 * Blocks access until user verifies their age
 * Supports 13+ and 18+ gates
 */
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Calendar } from 'lucide-react';
import { useAgeVerification, AgeGate } from '@/hooks/useAgeVerification';

interface AgeVerificationGateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requiredAge: AgeGate;
  onVerified: () => void;
  title?: string;
  description?: string;
}

export const AgeVerificationGate: React.FC<AgeVerificationGateProps> = ({
  open,
  onOpenChange,
  requiredAge,
  onVerified,
  title,
  description,
}) => {
  const { verifyAge, checkAge } = useAgeVerification();
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const requiredYears = requiredAge === '18+' ? 18 : 13;

  const handleVerify = () => {
    if (!birthDate) {
      setError('Please enter your date of birth');
      return;
    }

    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    if (age < requiredYears) {
      setError(`You must be at least ${requiredYears} years old to access this content.`);
      return;
    }

    verifyAge(requiredAge, birth);
    onVerified();
    onOpenChange(false);
  };

  const handleQuickVerify = () => {
    verifyAge(requiredAge);
    onVerified();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {title || `Age Verification Required (${requiredAge})`}
          </DialogTitle>
          <DialogDescription>
            {description || `You must be at least ${requiredYears} years old to access this content.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="birthdate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date of Birth
            </Label>
            <Input
              id="birthdate"
              type="date"
              value={birthDate}
              onChange={(e) => {
                setBirthDate(e.target.value);
                setError(null);
              }}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-xs text-muted-foreground">
            By continuing, you confirm that you are at least {requiredYears} years of age. 
            We do not store your date of birth for privacy purposes.
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={handleQuickVerify}>
            I am {requiredYears}+ years old
          </Button>
          <Button onClick={handleVerify}>
            Verify with Date
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AgeVerificationGate;
