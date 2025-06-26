
import React from 'react';
import { Key } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const PermissionSystemCard: React.FC = () => {
  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Key className="h-5 w-5" />
          Enhanced Permission System
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-900">New Features Available:</h4>
              <ul className="text-blue-800 space-y-1">
                <li>• Individual user permission grants</li>
                <li>• Role-based permission inheritance</li>
                <li>• Permission expiration dates</li>
                <li>• Granular access control</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-900">How to Use:</h4>
              <ul className="text-blue-800 space-y-1">
                <li>• Click the <Key className="h-3 w-3 inline mx-1" /> button next to any user</li>
                <li style={{ marginLeft: '0.5rem' }}>to manage their permissions</li>
                <li>• View effective permissions from all sources</li>
                <li>• Grant or revoke individual permissions</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
