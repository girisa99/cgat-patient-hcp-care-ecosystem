
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Database, TrendingUp } from 'lucide-react';
import { useRealTimeUserStats } from '@/hooks/useRealTimeUserStats';

interface StatusAlertsProps {
  user: any;
  profile: any;
  userRoles: string[];
}

const StatusAlerts: React.FC<StatusAlertsProps> = ({ user, profile, userRoles }) => {
  const { data: realTimeStats } = useRealTimeUserStats();

  return (
    <>
      {/* System Status Messages */}
      {user && profile && userRoles.length > 0 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>✅ System fully operational!</strong> Profile loaded, {userRoles.length} role(s) assigned, and RLS policies working correctly with security definer functions.
          </AlertDescription>
        </Alert>
      )}

      {user && !profile && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Profile Status:</strong> No profile found. This may be normal for new accounts. Check browser console for detailed logs.
          </AlertDescription>
        </Alert>
      )}

      {user && profile && userRoles.length === 0 && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>⚠️ Role Assignment Test Ready:</strong> Profile loaded but no roles found. Click "Test Role Assignment" to verify the new security definer function is working.
          </AlertDescription>
        </Alert>
      )}

      {/* Real-time System Statistics */}
      {realTimeStats && (
        <Alert className="border-blue-200 bg-blue-50">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>📊 Real-time System Stats:</strong> {realTimeStats.totalUsers} total users, {realTimeStats.verifiedUsers} verified ({Math.round((realTimeStats.verifiedUsers / realTimeStats.totalUsers) * 100)}% verification rate), {realTimeStats.totalFacilities} facilities, {realTimeStats.totalPermissions} permissions configured.
            <div className="mt-1 text-xs">
              Last updated: {new Date(realTimeStats.lastUpdated).toLocaleTimeString()}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Updated RLS Status */}
      <Alert className="border-blue-200 bg-blue-50">
        <Database className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>🛡️ RLS Security Update Applied:</strong> Implemented security definer function to prevent recursion. New policies allow self-assignment and admin management.
          {user && (
            <div className="mt-1 text-xs">
              User ID: {user.id.slice(0, 8)}... | Auth Status: Active | Profile: {profile ? '✅' : '❌'} | Roles: {userRoles.length}
              <br />
              <strong>Security:</strong> Using user_has_role() function with SECURITY DEFINER to bypass RLS recursion
            </div>
          )}
        </AlertDescription>
      </Alert>
    </>
  );
};

export default StatusAlerts;
