
/**
 * BULK OPERATIONS TAB
 * Handles bulk operations for user management
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Download, Upload, Mail, Trash2, UserPlus } from 'lucide-react';

interface BulkOperationsTabProps {
  selectedUsers: string[];
  onSelectAll: (checked: boolean) => void;
  onBulkAssignRole: (roleId: string) => void;
  onBulkAssignFacility: (facilityId: string) => void;
  onBulkDeactivate: () => void;
  onBulkDelete: () => void;
  onBulkEmail: () => void;
  onExportUsers: () => void;
  onImportUsers: () => void;
}

export const BulkOperationsTab: React.FC<BulkOperationsTabProps> = ({
  selectedUsers,
  onSelectAll,
  onBulkAssignRole,
  onBulkAssignFacility,
  onBulkDeactivate,
  onBulkDelete,
  onBulkEmail,
  onExportUsers,
  onImportUsers
}) => {
  return (
    <div className="space-y-6">
      {/* Selection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {selectedUsers.length} users selected
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectAll(selectedUsers.length === 0)}
              >
                {selectedUsers.length === 0 ? 'Select All' : 'Deselect All'}
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              onClick={() => onBulkAssignRole('example-role-id')}
              disabled={selectedUsers.length === 0}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Role
            </Button>

            <Button
              variant="outline"
              onClick={() => onBulkAssignFacility('example-facility-id')}
              disabled={selectedUsers.length === 0}
            >
              <Users className="h-4 w-4 mr-2" />
              Assign Facility
            </Button>

            <Button
              variant="outline"
              onClick={onBulkEmail}
              disabled={selectedUsers.length === 0}
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>

            <Button
              variant="destructive"
              onClick={onBulkDelete}
              disabled={selectedUsers.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Users
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import/Export */}
      <Card>
        <CardHeader>
          <CardTitle>Import & Export</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline" onClick={onImportUsers}>
              <Upload className="h-4 w-4 mr-2" />
              Import Users
            </Button>
            <Button variant="outline" onClick={onExportUsers}>
              <Download className="h-4 w-4 mr-2" />
              Export Users
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
