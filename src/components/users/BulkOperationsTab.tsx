
/**
 * BULK OPERATIONS TAB COMPONENT
 * Handles bulk operations for user management
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Users, 
  Shield, 
  Building2, 
  UserX, 
  Mail,
  Download,
  Upload,
  Trash2
} from 'lucide-react';

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
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedFacility, setSelectedFacility] = useState<string>('');

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
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-2">
                <Users className="h-3 w-3" />
                {selectedUsers.length} users selected
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectAll(selectedUsers.length === 0)}
              >
                {selectedUsers.length === 0 ? 'Select All' : 'Clear Selection'}
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Role Assignment */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Assign Role</label>
              <div className="flex gap-2">
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">Patient</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedRole && onBulkAssignRole(selectedRole)}
                  disabled={!selectedRole || selectedUsers.length === 0}
                >
                  <Shield className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Facility Assignment */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Assign Facility</label>
              <div className="flex gap-2">
                <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select facility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facility-1">Main Hospital</SelectItem>
                    <SelectItem value="facility-2">Clinic A</SelectItem>
                    <SelectItem value="facility-3">Clinic B</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedFacility && onBulkAssignFacility(selectedFacility)}
                  disabled={!selectedFacility || selectedUsers.length === 0}
                >
                  <Building2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Communication */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Communication</label>
              <Button
                variant="outline"
                size="sm"
                onClick={onBulkEmail}
                disabled={selectedUsers.length === 0}
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="mt-6 p-4 border border-red-200 rounded-lg bg-red-50">
            <h3 className="text-sm font-medium text-red-800 mb-2">Danger Zone</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onBulkDeactivate}
                disabled={selectedUsers.length === 0}
                className="text-orange-600 border-orange-200 hover:bg-orange-50"
              >
                <UserX className="h-4 w-4 mr-2" />
                Deactivate Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onBulkDelete}
                disabled={selectedUsers.length === 0}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import/Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline" onClick={onExportUsers}>
              <Download className="h-4 w-4 mr-2" />
              Export Users
            </Button>
            <Button variant="outline" onClick={onImportUsers}>
              <Upload className="h-4 w-4 mr-2" />
              Import Users
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
