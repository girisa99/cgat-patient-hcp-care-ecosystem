
import React from 'react';
import { Users } from 'lucide-react';

interface UserManagementStatsProps {
  stats: {
    total: number;
    withRoles: number;
    active: number;
    withFacilities: number;
  };
}

export const UserManagementStats: React.FC<UserManagementStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
        <Users className="h-5 w-5 text-blue-600" />
        <div>
          <div className="text-xl font-semibold text-blue-900">{stats.total}</div>
          <div className="text-sm text-blue-700">Total Users</div>
        </div>
      </div>
      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
        <div className="h-5 w-5 bg-green-600 rounded" />
        <div>
          <div className="text-xl font-semibold text-green-900">{stats.withRoles}</div>
          <div className="text-sm text-green-700">With Roles</div>
        </div>
      </div>
      <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
        <div className="h-5 w-5 bg-purple-600 rounded" />
        <div>
          <div className="text-xl font-semibold text-purple-900">{stats.active}</div>
          <div className="text-sm text-purple-700">Active</div>
        </div>
      </div>
      <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
        <div className="h-5 w-5 bg-orange-600 rounded" />
        <div>
          <div className="text-xl font-semibold text-orange-900">{stats.withFacilities}</div>
          <div className="text-sm text-orange-700">With Facilities</div>
        </div>
      </div>
    </div>
  );
};
