
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuthActions } from '@/hooks/useAuthActions';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';

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
  const { resendVerificationEmail, loading } = useAuthActions();
  const [emailSent, setEmailSent] = useState(false);

  const handleResendEmail = async () => {
    console.log('📧 Resending verification email for:', userEmail);
    
    const result = await resendVerificationEmail(userEmail);
    if (result.success) {
      setEmailSent(true);
      // Auto-close dialog after 3 seconds
      setTimeout(() => {
        onOpenChange(false);
        setEmailSent(false);
      }, 3000);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setEmailSent(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            Resend Verification Email
          </DialogTitle>
          <DialogDescription>
            Send a new email verification link to the user
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">User Details</p>
                <p className="text-sm text-blue-700">
                  <strong>Name:</strong> {userName}
                </p>
                <p className="text-sm text-blue-700">
                  <strong>Email:</strong> {userEmail}
                </p>
              </div>
            </div>
          </div>

          {emailSent ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">Email Sent Successfully!</p>
                  <p className="text-sm text-green-700">
                    Verification email has been sent to {userEmail}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-amber-800">
                    This will send a new email verification link to <strong>{userEmail}</strong>. 
                    The user will need to click the link in their email to verify their account.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              {emailSent ? 'Close' : 'Cancel'}
            </Button>
            {!emailSent && (
              <Button 
                onClick={handleResendEmail}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Verification Email
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResendVerificationDialog;
