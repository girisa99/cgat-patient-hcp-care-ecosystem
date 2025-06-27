
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, RefreshCw } from 'lucide-react';

interface AdminVerificationHeaderProps {
  onRunVerification: () => void;
  isRunning: boolean;
}

const AdminVerificationHeader: React.FC<AdminVerificationHeaderProps> = ({
  onRunVerification,
  isRunning
}) => {
  return (
    <Button onClick={onRunVerification} disabled={isRunning}>
      {isRunning ? (
        <>
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          Running Verification...
        </>
      ) : (
        <>
          <Play className="h-4 w-4 mr-2" />
          Re-run Verification
        </>
      )}
    </Button>
  );
};

export default AdminVerificationHeader;
