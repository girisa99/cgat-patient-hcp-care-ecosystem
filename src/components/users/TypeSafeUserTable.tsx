
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import type { MasterUser } from '@/hooks/useMasterUserManagement';

interface TypeSafeUserTableProps {
  users: MasterUser[];
  onEdit?: (user: MasterUser) => void;
  onDelete?: (userId: string) => void;
  onToggleStatus?: (userId: string, isActive: boolean) => void;
  isLoading?: boolean;
}

export const TypeSafeUserTable: React.FC<TypeSafeUserTableProps> = ({
  users,
  onEdit,
  onDelete,
  onToggleStatus,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">Loading users...</div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center text-gray-500">No users found</div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="font-medium">
                  {user.firstName} {user.lastName}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-600">{user.email}</div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{user.role}</Badge>
              </TableCell>
              <TableCell>
                <div className="text-sm">{user.phone || 'N/A'}</div>
              </TableCell>
              <TableCell>
                <Badge variant={user.isActive ? 'default' : 'destructive'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {onToggleStatus && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleStatus(user.id, user.isActive)}
                    >
                      {user.isActive ? (
                        <UserX className="h-4 w-4" />
                      ) : (
                        <UserCheck className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
