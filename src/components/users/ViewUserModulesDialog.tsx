
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Shield, Edit, Trash } from 'lucide-react';

interface ViewUserModulesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  userName: string;
}

const ViewUserModulesDialog: React.FC<ViewUserModulesDialogProps> = ({ 
  open, 
  onOpenChange, 
  userId, 
  userName 
}) => {
  const [userModules, setUserModules] = useState([
    {
      id: '1',
      name: 'Patient Management',
      description: 'Access to patient records and management',
      accessLevel: 'read',
      assignedDate: '2024-01-15',
      expiresAt: null
    },
    {
      id: '2',
      name: 'Facilities',
      description: 'Facility management and oversight',
      accessLevel: 'write',
      assignedDate: '2024-01-20',
      expiresAt: null
    },
    {
      id: '3',
      name: 'API Services',
      description: 'API integration and management',
      accessLevel: 'admin',
      assignedDate: '2024-02-01',
      expiresAt: '2024-12-31'
    }
  ]);

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'read': return 'bg-blue-100 text-blue-800';
      case 'write': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
      case 'read': return <Eye className="h-3 w-3" />;
      case 'write': return <Edit className="h-3 w-3" />;
      case 'admin': return <Shield className="h-3 w-3" />;
      default: return null;
    }
  };

  const handleRemoveModule = (moduleId: string) => {
    setUserModules(prev => prev.filter(module => module.id !== moduleId));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Module Access - {userName}</DialogTitle>
          <DialogDescription>
            View and manage module access for this user
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {userModules.length > 0 ? (
            userModules.map((module) => (
              <Card key={module.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{module.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getAccessLevelColor(module.accessLevel)} flex items-center gap-1`}>
                        {getAccessLevelIcon(module.accessLevel)}
                        {module.accessLevel.charAt(0).toUpperCase() + module.accessLevel.slice(1)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveModule(module.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3">{module.description}</p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>Assigned: {new Date(module.assignedDate).toLocaleDateString()}</p>
                    {module.expiresAt && (
                      <p>Expires: {new Date(module.expiresAt).toLocaleDateString()}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No modules assigned to this user</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewUserModulesDialog;
