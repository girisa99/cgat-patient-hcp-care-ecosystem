import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRealUsers } from '@/hooks/api/useRealUsers';

export const UserManagement: React.FC = () => {
  const { data: users = [], isLoading } = useRealUsers();

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.length > 0 ? (
            users.map((user) => (
              <div key={user.id} className="border-b pb-4">
                <h3 className="font-medium">{user.first_name} {user.last_name}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                <div className="flex gap-2 mt-2">
                  {user.roles.map((roleName, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {roleName}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No users found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
