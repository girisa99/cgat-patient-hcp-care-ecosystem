
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shield } from 'lucide-react';
import UserModuleAccess from './UserModuleAccess';

interface UserModuleAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

const UserModuleAccessDialog: React.FC<UserModuleAccessDialogProps> = ({
  open,
  onOpenChange,
  userId,
  userName
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Module Access Overview
          </DialogTitle>
        </DialogHeader>
        
        <UserModuleAccess userId={userId} userName={userName} />
      </DialogContent>
    </Dialog>
  );
};

export default UserModuleAccessDialog;
