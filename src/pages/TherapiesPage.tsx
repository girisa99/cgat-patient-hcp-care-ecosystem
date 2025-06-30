
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const TherapiesPage: React.FC = () => {
  const therapyTypes = [
    {
      name: "Cell Therapy",
      description: "Revolutionary treatment using living cells to repair or replace damaged tissue",
      status: "Available",
      complexity: "High",
      areas: ["Oncology", "Cardiology", "Neurology"]
    },
    {
      name: "Gene Therapy",
      description: "Advanced treatment that introduces genetic material into patient cells",
      status: "Clinical Trials",
      complexity: "Very High",
      areas: ["Genetic Disorders", "Cancer", "Immune Disorders"]
    },
    {
      name: "Immunotherapy",
      description: "Treatment that uses the body's immune system to fight disease",
      status: "Available",
      complexity: "Medium",
      areas: ["Oncology", "Autoimmune", "Allergies"]
    },
    {
      name: "Stem Cell Therapy",
      description: "Treatment using stem cells to regenerate damaged or diseased tissue",
      status: "Research Phase",
      complexity: "High",
      areas: ["Regenerative Medicine", "Orthopedics", "Cardiology"]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available": return "bg-green-100 text-green-800";
      case "Clinical Trials": return "bg-yellow-100 text-yellow-800";
      case "Research Phase": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "Very High": return "bg-red-100 text-red-800";
      case "High": return "bg-orange-100 text-orange-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      default: return "bg-green-100 text-green-800";
    }
  };

  return (
    <MainLayout>
      <PageContainer
        title="Therapies & Services"
        subtitle="Manage available therapies and treatment options"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {therapyTypes.map((therapy) => (
            <Card key={therapy.name} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{therapy.name}</CardTitle>
                    <CardDescription className="text-base">
                      {therapy.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge className={getStatusColor(therapy.status)}>
                    {therapy.status}
                  </Badge>
                  <Badge className={getComplexityColor(therapy.complexity)}>
                    {therapy.complexity} Complexity
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">
                      Treatment Areas:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {therapy.areas.map((area) => (
                        <Badge key={area} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full" variant="outline">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default TherapiesPage;
