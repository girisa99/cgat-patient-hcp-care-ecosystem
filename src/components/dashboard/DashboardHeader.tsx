
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, UserPlus } from 'lucide-react';

interface DashboardHeaderProps {
  user: any;
  userRoles: string[];
  onRefresh: () => void;
  onAssignTestRole: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  user, 
  userRoles, 
  onRefresh, 
  onAssignTestRole 
}) => {
  return (
    <div className="flex justify-between items-center w-full">
      <div className="text-left">
        <h2 className="text-3xl font-bold tracking-tight text-left">Dashboard</h2>
        <p className="text-muted-foreground text-left">
          Welcome to your healthcare portal dashboard
        </p>
      </div>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
        {user && userRoles.length === 0 && (
          <Button
            variant="default"
            size="sm"
            onClick={onAssignTestRole}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Test Role Assignment
          </Button>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
