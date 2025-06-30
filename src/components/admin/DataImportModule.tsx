
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataImportHeader } from './DataImport/DataImportHeader';
import { JsonImportTab } from './DataImport/JsonImportTab';
import { CsvImportTab } from './DataImport/CsvImportTab';
import { ApiEndpointsTab } from './DataImport/ApiEndpointsTab';

export const DataImportModule: React.FC = () => {
  return (
    <div className="space-y-6">
      <DataImportHeader />

      <Tabs defaultValue="json-import" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="json-import">JSON Import</TabsTrigger>
          <TabsTrigger value="csv-import">CSV Import</TabsTrigger>
          <TabsTrigger value="api-endpoints">API Access</TabsTrigger>
        </TabsList>

        <TabsContent value="json-import">
          <JsonImportTab />
        </TabsContent>

        <TabsContent value="csv-import">
          <CsvImportTab />
        </TabsContent>

        <TabsContent value="api-endpoints">
          <ApiEndpointsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
