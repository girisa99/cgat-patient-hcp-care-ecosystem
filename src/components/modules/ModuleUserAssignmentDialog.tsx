
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, User, Calendar } from 'lucide-react';
import { useUnifiedUserManagement } from '@/hooks/useUnifiedUserManagement';
import { useModuleAssignments } from '@/hooks/useModuleAssignments';

interface ModuleUserAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleId: string | null;
  moduleName: string;
}

const ModuleUserAssignmentDialog: React.FC<ModuleUserAssignmentDialogProps> = ({
  open,
  onOpenChange,
  moduleId,
  moduleName
}) => {
  const { users } = useUnifiedUserManagement();
  const { assignUserToModule, isAssigning } = useModuleAssignments();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [expiresAt, setExpiresAt] = useState<string>('');

  const filteredUsers = users.filter(user =>
    user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAssign = async () => {
    if (!moduleId || selectedUsers.length === 0) return;

    try {
      for (const userId of selectedUsers) {
        await assignUserToModule({
          userId,
          moduleId,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined
        });
      }
      
      setSelectedUsers([]);
      setExpiresAt('');
      onOpenChange(false);
    } catch (error) {
      console.error('Module assignment error:', error);
    }
  };

  const handleClose = () => {
    setSelectedUsers([]);
    setExpiresAt('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Assign Users to {moduleName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="secondary">
              {selectedUsers.length} selected
            </Badge>
          </div>

          <div>
            <Label htmlFor="expires" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Expires At (Optional)
            </Label>
            <Input
              id="expires"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="border rounded-lg max-h-96 overflow-y-auto">
            <div className="p-3 border-b bg-gray-50">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedUsers(filteredUsers.map(user => user.id));
                    } else {
                      setSelectedUsers([]);
                    }
                  }}
                />
                <Label htmlFor="select-all" className="font-medium">
                  Select All ({filteredUsers.length})
                </Label>
              </div>
            </div>
            
            <div className="p-3 space-y-3">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`user-${user.id}`}
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={() => handleUserToggle(user.id)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={`user-${user.id}`} className="cursor-pointer">
                      <div className="font-medium">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      {user.user_roles.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {user.user_roles.map((userRole, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {userRole.roles.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </Label>
                  </div>
                </div>
              ))}
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No users found matching your search.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssign} 
              disabled={selectedUsers.length === 0 || isAssigning}
            >
              {isAssigning ? 'Assigning...' : `Assign ${selectedUsers.length} Users`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModuleUserAssignmentDialog;
