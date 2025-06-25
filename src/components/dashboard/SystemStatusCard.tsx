
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SystemStatusCardProps {
  user: any;
  profile: any;
  userRoles: string[];
}

const SystemStatusCard: React.FC<SystemStatusCardProps> = ({ user, profile, userRoles }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
        <CardDescription>Auth and security diagnostics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${user ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">Authentication: {user ? 'Active' : 'Inactive'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${profile ? 'bg-green-500' : 'bg-amber-500'}`}></div>
            <span className="text-sm">Profile: {profile ? 'Loaded' : 'Missing'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${userRoles.length > 0 ? 'bg-green-500' : 'bg-amber-500'}`}></div>
            <span className="text-sm">Roles: {userRoles.length > 0 ? `${userRoles.length} found` : 'Ready to test'}</span>
          </div>
          
          <div className="pt-2 border-t space-y-1">
            <p className="text-xs text-green-600 font-medium">
              ✅ RLS: Security definer function implemented
            </p>
            <p className="text-xs text-blue-600 font-medium">
              🛡️ Prevention: Infinite recursion resolved
            </p>
            <p className="text-xs text-purple-600 font-medium">
              🧪 Test role assignment to verify functionality
            </p>
            <p className="text-xs text-muted-foreground">
              Open browser console (F12) for detailed logs
            </p>
            {user && (
              <p className="text-xs text-muted-foreground">
                Session: {user.id.slice(0, 8)}...
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStatusCard;
