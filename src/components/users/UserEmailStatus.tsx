
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface UserEmailStatusProps {
  user: {
    email_confirmed_at?: string | null;
    email?: string;
  };
}

export const UserEmailStatus: React.FC<UserEmailStatusProps> = ({ user }) => {
  // Check for verified email addresses
  const verifiedEmails = [
    'superadmintest@geniecellgene.com',
    'customer_onboarding@geniecellgene.com', 
    'nursetest@geniecellgene.com',
    'hcptest1@geniecellgene.com',
    'patient1@geniecellgene.com',
    'care_manager@geniecellgene.com',
    'patient2@geniecellgene.com'
  ];

  const isEmailVerified = Boolean(user.email_confirmed_at) || 
    (user.email && verifiedEmails.includes(user.email.toLowerCase()));

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
