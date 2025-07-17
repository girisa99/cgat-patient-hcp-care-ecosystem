import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map, Plus } from "lucide-react";

const FieldMappingTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Field Mapping</h2>
          <p className="text-gray-600">Map data fields between different API endpoints</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Mapping
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Map className="h-5 w-5" />
            <span>Field Mappings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Map className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold mb-2">No Field Mappings Found</h3>
            <p className="text-sm">Create field mappings to transform data between APIs</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FieldMappingTab;