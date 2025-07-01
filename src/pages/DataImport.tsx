
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Import, FileText, Database, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DataImport: React.FC = () => {
  const importTypes = [
    {
      title: 'Patient Data Import',
      description: 'Import patient records from CSV or Excel files',
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      title: 'Healthcare Provider Import',
      description: 'Import provider and staff information',
      icon: Database,
      color: 'bg-green-500'
    },
    {
      title: 'Facility Data Import',
      description: 'Import healthcare facility information',
      icon: Upload,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Data Import</h1>
        <p className="text-gray-600 mt-2">
          Import data from external sources into the system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {importTypes.map((importType, index) => {
          const Icon = importType.icon;
          return (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md ${importType.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{importType.title}</CardTitle>
                  </div>
                </div>
                <CardDescription>
                  {importType.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Import className="h-4 w-4 mr-2" />
                  Start Import
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import History</CardTitle>
          <CardDescription>
            Recent data import operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Import className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No import operations yet</p>
            <p className="text-sm">Start your first import to see it here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataImport;
