
/**
 * Module Settings Component
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const ModuleSettings: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Module Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Auto-Registration</h3>
              <p className="text-sm text-gray-600">Automatically register new modules when detected</p>
            </div>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Code Generation</h3>
              <p className="text-sm text-gray-600">Generate boilerplate code for new modules</p>
            </div>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Schema Validation</h3>
              <p className="text-sm text-gray-600">Validate module configurations against database schema</p>
            </div>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
