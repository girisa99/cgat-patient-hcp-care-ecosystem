import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users2, Shield, Package, Building2 } from 'lucide-react';

interface UserStatsCardsProps {
  meta: {
    totalUsers: number;
    adminCount: number;
    staffCount: number;
  };
  selectedCount: number;
}

export const UserStatsCards: React.FC<UserStatsCardsProps> = React.memo(({ 
  meta, 
  selectedCount 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              <p className="text-3xl font-bold text-blue-600">{meta.totalUsers}</p>
            </div>
            <Users2 className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Admins</p>
              <p className="text-3xl font-bold text-green-600">{meta.adminCount}</p>
            </div>
            <Shield className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-purple-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Staff Members</p>
              <p className="text-3xl font-bold text-purple-600">{meta.staffCount}</p>
            </div>
            <Package className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-orange-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Selected</p>
              <p className="text-3xl font-bold text-orange-600">{selectedCount}</p>
            </div>
            <Building2 className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

UserStatsCards.displayName = 'UserStatsCards';