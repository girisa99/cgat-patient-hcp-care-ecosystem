
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ResendVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
  userName: string;
}

const ResendVerificationDialog: React.FC<ResendVerificationDialogProps> = ({ 
  open, 
  onOpenChange, 
  userEmail, 
  userName 
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleResendVerification = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
      });

      if (error) throw error;

      toast({
        title: "Verification Email Sent",
        description: `A new verification email has been sent to ${userEmail}`,
      });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to resend verification:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to resend verification email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Resend Email Verification
          </DialogTitle>
          <DialogDescription>
            Send a new verification email to {userName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-orange-800">Email Verification Required</p>
              <p className="text-orange-700 mt-1">
                This user's email address ({userEmail}) has not been verified. 
                A new verification email will be sent to allow them to complete the verification process.
              </p>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p>The verification email will contain a link that expires in 24 hours.</p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleResendVerification} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Verification Email'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResendVerificationDialog;
