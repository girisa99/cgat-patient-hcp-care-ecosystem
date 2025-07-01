
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Settings, Activity, Shield } from 'lucide-react';

const ApiServices: React.FC = () => {
  const serviceCategories = [
    {
      title: "External APIs",
      description: "Manage connections to external healthcare systems",
      icon: Globe,
      color: "text-blue-600"
    },
    {
      title: "API Configuration",
      description: "Configure API endpoints and authentication",
      icon: Settings,
      color: "text-green-600"
    },
    {
      title: "API Monitoring",
      description: "Monitor API performance and health",
      icon: Activity,
      color: "text-purple-600"
    },
    {
      title: "API Security",
      description: "Manage API keys and security policies",
      icon: Shield,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">API Services</h1>
        <p className="text-gray-600 mt-2">
          Manage API integrations and external services
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {serviceCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.title} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-3">
                <div className="flex-1">
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {category.description}
                  </CardDescription>
                </div>
                <Icon className={`h-8 w-8 ${category.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Configure and manage {category.title.toLowerCase()}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ApiServices;
