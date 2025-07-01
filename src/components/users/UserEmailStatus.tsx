
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { isVerifiedEmail } from '@/config/userManagement';

interface UserEmailStatusProps {
  user: {
    email_confirmed_at?: string | null;
    email?: string;
  };
}

export const UserEmailStatus: React.FC<UserEmailStatusProps> = ({ user }) => {
  // Use centralized verification check
  const isEmailVerified = Boolean(user.email_confirmed_at) || 
    (user.email ? isVerifiedEmail(user.email) : false);

  return (
    <div className="flex items-center gap-2">
      {isEmailVerified ? (
        <>
          <CheckCircle className="h-4 w-4 text-green-600" />
          <Badge variant="outline" className="text-xs text-green-600 border-green-300">
            Verified
          </Badge>
        </>
      ) : (
        <>
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
            Unverified
          </Badge>
        </>
      )}
    </div>
  );
};
