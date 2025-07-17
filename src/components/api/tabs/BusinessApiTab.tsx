import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Plus, Building, Stethoscope } from "lucide-react";

const BusinessApiTab: React.FC = () => {
  const businessApis = [
    { name: 'NPI Provider Registry', category: 'Healthcare', status: 'active', type: 'REST' },
    { name: 'CMS Data Services', category: 'Healthcare', status: 'configured', type: 'REST' },
    { name: 'Patient Portal API', category: 'Patient Care', status: 'active', type: 'GraphQL' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Business APIs</h2>
          <p className="text-gray-600">Healthcare and business-focused API integrations</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Business API
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Business API Services</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {businessApis.map((api, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Stethoscope className="h-5 w-5 text-blue-600" />
                      <div>
                        <h3 className="font-semibold">{api.name}</h3>
                        <p className="text-sm text-gray-600">{api.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={api.status === 'active' ? "default" : "secondary"}>
                        {api.status}
                      </Badge>
                      <Badge variant="outline">{api.type}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessApiTab;