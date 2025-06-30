
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, FileText, TrendingUp, Users } from 'lucide-react';

const ReportsPage: React.FC = () => {
  const reportCategories = [
    {
      title: "User Analytics",
      description: "Track user engagement and activity",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "System Performance",
      description: "Monitor system health and performance metrics",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Financial Reports",
      description: "View financial summaries and billing reports",
      icon: BarChart3,
      color: "text-purple-600"
    },
    {
      title: "Document Reports",
      description: "Generate and export various system reports",
      icon: FileText,
      color: "text-orange-600"
    }
  ];

  return (
    <MainLayout>
      <PageContainer
        title="Reports"
        subtitle="View and generate system reports"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {reportCategories.map((category) => {
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
                    Click to access {category.title.toLowerCase()}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default ReportsPage;
