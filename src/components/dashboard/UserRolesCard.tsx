
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

interface UserRolesCardProps {
  userRoles: string[];
  user: any;
  getRoleColor: (role: string) => string;
  getRoleDescription: (role: string) => string;
}

const UserRolesCard: React.FC<UserRolesCardProps> = ({ 
  userRoles, 
  user, 
  getRoleColor, 
  getRoleDescription 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          User Roles ({userRoles.length})
        </CardTitle>
        <CardDescription>System access permissions via security definer RLS</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {userRoles.length > 0 ? (
            <>
              {userRoles.map((role) => (
                <div key={role} className="space-y-1">
                  <Badge variant="outline" className={getRoleColor(role)}>
                    {role}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {getRoleDescription(role)}
                  </p>
                </div>
              ))}
              <div className="pt-2 border-t">
                <p className="text-xs text-green-600 font-medium">
                  ✅ Roles loaded successfully via security definer function
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <p className="text-muted-foreground">No roles assigned</p>
              <p className="text-xs text-amber-600">
                🔧 Test the new security definer function by clicking "Test Role Assignment"
              </p>
              {user && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    User ID: {user.id.slice(0, 8)}...
                  </p>
                  <p className="text-xs text-blue-600">
                    🛡️ Security definer function should prevent recursion issues
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserRolesCard;
