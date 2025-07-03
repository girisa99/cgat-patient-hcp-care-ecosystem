import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Shield, Building2, UserX, X } from 'lucide-react';
import type { UserWithRoles } from '@/types/userManagement';

interface BulkActionsTabProps {
  selectedUsers: string[];
  users: UserWithRoles[];
  onBulkAssignRole: () => void;
  onBulkAssignModule: () => void;
  onBulkAssignFacility: () => void;
  onBulkDeactivate: () => void;
  onDeselectUser: (userId: string) => void;
  onClearSelection: () => void;
  isAssigningRole: boolean;
  isAssigningFacility: boolean;
  isDeactivating: boolean;
}

export const BulkActionsTab: React.FC<BulkActionsTabProps> = React.memo(({
  selectedUsers,
  users,
  onBulkAssignRole,
  onBulkAssignModule,
  onBulkAssignFacility,
  onBulkDeactivate,
  onDeselectUser,
  onClearSelection,
  isAssigningRole,
  isAssigningFacility,
  isDeactivating
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Package className="h-6 w-6" />
          <div>
            <h3 className="text-xl font-semibold">Bulk Operations</h3>
            <p className="text-sm text-muted-foreground font-normal">
              Perform actions on {selectedUsers.length} selected users
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Button
            variant="outline"
            onClick={onBulkAssignRole}
            disabled={selectedUsers.length === 0 || isAssigningRole}
            className="flex items-center gap-3 h-16 justify-start text-left"
          >
            <Shield className="h-8 w-8 text-blue-500" />
            <div>
              <div className="font-medium">Assign Roles</div>
              <div className="text-sm text-muted-foreground">
                {isAssigningRole ? 'Assigning...' : 'Assign roles to selected users'}
              </div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            onClick={onBulkAssignModule}
            disabled={selectedUsers.length === 0}
            className="flex items-center gap-3 h-16 justify-start text-left"
          >
            <Package className="h-8 w-8 text-green-500" />
            <div>
              <div className="font-medium">Assign Modules</div>
              <div className="text-sm text-muted-foreground">Assign modules to selected users</div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            onClick={onBulkAssignFacility}
            disabled={selectedUsers.length === 0 || isAssigningFacility}
            className="flex items-center gap-3 h-16 justify-start text-left"
          >
            <Building2 className="h-8 w-8 text-purple-500" />
            <div>
              <div className="font-medium">Assign Facilities</div>
              <div className="text-sm text-muted-foreground">
                {isAssigningFacility ? 'Assigning...' : 'Assign facilities to selected users'}
              </div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            onClick={onBulkDeactivate}
            disabled={selectedUsers.length === 0 || isDeactivating}
            className="flex items-center gap-3 h-16 justify-start text-left border-red-200 hover:bg-red-50"
          >
            <UserX className="h-8 w-8 text-red-500" />
            <div>
              <div className="font-medium text-red-600">Deactivate Users</div>
              <div className="text-sm text-muted-foreground">
                {isDeactivating ? 'Deactivating...' : 'Deactivate selected users'}
              </div>
            </div>
          </Button>
        </div>
        
        {selectedUsers.length > 0 && (
          <div className="border rounded-lg p-4 bg-muted/20">
            <h4 className="font-medium mb-3">Selected Users ({selectedUsers.length}):</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedUsers.map(userId => {
                const user = users.find(u => u.id === userId);
                return user ? (
                  <Badge key={userId} variant="secondary" className="flex items-center gap-1">
                    {user.first_name} {user.last_name}
                    <button
                      onClick={() => onDeselectUser(userId)}
                      className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ) : null;
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSelection}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear All Selections
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

BulkActionsTab.displayName = 'BulkActionsTab';