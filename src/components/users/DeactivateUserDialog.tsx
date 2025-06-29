
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, UserX, Loader2 } from 'lucide-react';
import { useUserDeactivation } from '@/hooks/mutations/useUserDeactivation';

interface DeactivateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  userEmail: string;
}

const DeactivateUserDialog: React.FC<DeactivateUserDialogProps> = ({
  open,
  onOpenChange,
  userId,
  userName,
  userEmail
}) => {
  const [reason, setReason] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const { deactivateUser, isDeactivating } = useUserDeactivation();

  const handleDeactivateUser = () => {
    if (confirmText.toLowerCase() !== 'deactivate') {
      return;
    }

    console.log('🔄 Deactivating user:', userId, userName, 'Reason:', reason);
    deactivateUser({ userId, reason });
    
    // Close dialog and reset form
    onOpenChange(false);
    setReason('');
    setConfirmText('');
  };

  const handleClose = () => {
    onOpenChange(false);
    setReason('');
    setConfirmText('');
  };

  const isConfirmValid = confirmText.toLowerCase() === 'deactivate';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <UserX className="h-5 w-5" />
            Deactivate User Account
          </DialogTitle>
          <DialogDescription>
            This action will permanently deactivate the user account and revoke all access permissions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* User Details */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">User to be deactivated:</p>
                <p className="text-sm text-red-700">
                  <strong>Name:</strong> {userName}
                </p>
                <p className="text-sm text-red-700">
                  <strong>Email:</strong> {userEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Deactivation Reason */}
          <div className="space-y-2">
            <Label htmlFor="deactivation-reason">Reason for Deactivation</Label>
            <Textarea
              id="deactivation-reason"
              placeholder="Please provide a reason for deactivating this user account..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <Label htmlFor="confirm-text">
              Type "DEACTIVATE" to confirm this action
            </Label>
            <input
              id="confirm-text"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DEACTIVATE here"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Warning Message */}
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Important:</strong> Deactivating this user will:
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Permanently delete the user account</li>
                <li>• Remove all role assignments and permissions</li>
                <li>• Log the deactivation for audit purposes</li>
                <li>• This action cannot be undone</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isDeactivating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeactivateUser}
              disabled={!isConfirmValid || !reason.trim() || isDeactivating}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeactivating ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Deactivating...</span>
                </div>
              ) : (
                <>
                  <UserX className="h-4 w-4 mr-2" />
                  Deactivate User
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeactivateUserDialog;
