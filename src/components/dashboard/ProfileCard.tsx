
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';

interface ProfileCardProps {
  profile: any;
  user: any;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, user }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Profile Information
        </CardTitle>
        <CardDescription>Your account details and status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {profile ? (
            <>
              <div className="space-y-2">
                <p><strong>Name:</strong> {profile.first_name || 'Not set'} {profile.last_name || ''}</p>
                <p><strong>Email:</strong> {profile.email || user?.email || 'Not available'}</p>
                <p><strong>Department:</strong> {profile.department || 'Not specified'}</p>
                {profile.facility_id && (
                  <p><strong>Facility ID:</strong> {profile.facility_id.slice(0, 8)}...</p>
                )}
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-green-600 font-medium">
                  ✅ Profile loaded via RLS policy
                </p>
              </div>
            </>
          ) : user ? (
            <>
              <div className="space-y-2">
                <p><strong>Email:</strong> {user.email}</p>
                <p className="text-sm text-amber-600">⚠ Profile not found</p>
                <p className="text-xs text-muted-foreground">Check console for error details</p>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  User ID: {user.id.slice(0, 8)}...
                </p>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">No profile information available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
