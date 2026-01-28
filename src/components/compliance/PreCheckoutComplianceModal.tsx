/**
 * PRE-CHECKOUT COMPLIANCE MODAL
 * Captures legal acceptances before redirecting to Stripe checkout
 * Includes Terms of Service, Privacy Policy, and Acceptable Use Policy
 */
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, FileText, Lock, AlertTriangle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLegalCompliance } from '@/hooks/useLegalCompliance';

interface PreCheckoutComplianceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAcceptAll: () => void;
  tierName?: string;
  isLoading?: boolean;
}

interface AcceptanceState {
  termsOfService: boolean;
  privacyPolicy: boolean;
  acceptableUse: boolean;
  ageVerification: boolean;
  contentGuidelines: boolean;
}

export const PreCheckoutComplianceModal: React.FC<PreCheckoutComplianceModalProps> = ({
  open,
  onOpenChange,
  onAcceptAll,
  tierName = 'subscription',
  isLoading = false,
}) => {
  const { acceptDocument } = useLegalCompliance();
  const [acceptances, setAcceptances] = useState<AcceptanceState>({
    termsOfService: false,
    privacyPolicy: false,
    acceptableUse: false,
    ageVerification: false,
    contentGuidelines: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allAccepted = Object.values(acceptances).every(Boolean);

  const handleAcceptAll = async () => {
    if (!allAccepted) return;

    setIsSubmitting(true);
    try {
      // Record all acceptances
      const acceptancePromises = [
        acceptDocument('terms_of_service', '1.0'),
        acceptDocument('privacy_policy', '1.0'),
        acceptDocument('acceptable_use_policy' as any, '1.0'),
        acceptDocument('age_verification' as any, '13+'),
        acceptDocument('content_guidelines' as any, '1.0'),
      ];

      await Promise.all(acceptancePromises);
      
      console.log('✅ All legal acceptances recorded');
      onAcceptAll();
    } catch (error) {
      console.error('Failed to record acceptances:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAcceptance = (key: keyof AcceptanceState) => {
    setAcceptances(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Before You Subscribe
          </DialogTitle>
          <DialogDescription>
            Please review and accept the following agreements to continue with your {tierName}.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-4">
            {/* Terms of Service */}
            <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <Checkbox
                id="terms"
                checked={acceptances.termsOfService}
                onCheckedChange={() => toggleAcceptance('termsOfService')}
              />
              <div className="space-y-1">
                <Label htmlFor="terms" className="font-medium cursor-pointer flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Terms of Service
                </Label>
                <p className="text-xs text-muted-foreground">
                  I agree to the{' '}
                  <Link to="/terms" target="_blank" className="text-primary underline">
                    Terms of Service
                  </Link>{' '}
                  and understand my rights and obligations.
                </p>
              </div>
            </div>

            {/* Privacy Policy */}
            <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <Checkbox
                id="privacy"
                checked={acceptances.privacyPolicy}
                onCheckedChange={() => toggleAcceptance('privacyPolicy')}
              />
              <div className="space-y-1">
                <Label htmlFor="privacy" className="font-medium cursor-pointer flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  Privacy Policy
                </Label>
                <p className="text-xs text-muted-foreground">
                  I have read and accept the{' '}
                  <Link to="/privacy" target="_blank" className="text-primary underline">
                    Privacy Policy
                  </Link>{' '}
                  regarding data collection and usage.
                </p>
              </div>
            </div>

            {/* Acceptable Use Policy */}
            <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <Checkbox
                id="acceptable-use"
                checked={acceptances.acceptableUse}
                onCheckedChange={() => toggleAcceptance('acceptableUse')}
              />
              <div className="space-y-1">
                <Label htmlFor="acceptable-use" className="font-medium cursor-pointer flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Acceptable Use Policy
                </Label>
                <p className="text-xs text-muted-foreground">
                  I agree to the{' '}
                  <Link to="/acceptable-use" target="_blank" className="text-primary underline">
                    Acceptable Use Policy
                  </Link>{' '}
                  and will not misuse the platform.
                </p>
              </div>
            </div>

            {/* Age Verification */}
            <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <Checkbox
                id="age"
                checked={acceptances.ageVerification}
                onCheckedChange={() => toggleAcceptance('ageVerification')}
              />
              <div className="space-y-1">
                <Label htmlFor="age" className="font-medium cursor-pointer flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Age Verification
                </Label>
                <p className="text-xs text-muted-foreground">
                  I confirm that I am at least 13 years of age (or 18+ for certain content types).
                </p>
              </div>
            </div>

            {/* Content Guidelines */}
            <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <Checkbox
                id="content"
                checked={acceptances.contentGuidelines}
                onCheckedChange={() => toggleAcceptance('contentGuidelines')}
              />
              <div className="space-y-1">
                <Label htmlFor="content" className="font-medium cursor-pointer flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Content Guidelines
                </Label>
                <p className="text-xs text-muted-foreground">
                  I agree to follow the{' '}
                  <Link to="/content-guidelines" target="_blank" className="text-primary underline">
                    Content Guidelines
                  </Link>{' '}
                  and understand prohibited content.
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAcceptAll} 
            disabled={!allAccepted || isSubmitting || isLoading}
          >
            {(isSubmitting || isLoading) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Accept All & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PreCheckoutComplianceModal;
