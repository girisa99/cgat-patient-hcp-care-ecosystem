import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, BarChart3, TrendingUp, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/components/layout/AppLayout';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import AccessDenied from '@/components/AccessDenied';

const Reports: React.FC = () => {
  const { hasAccess } = useRoleBasedNavigation();
  if (!hasAccess('/reports')) return <AccessDenied />;

  const reportTypes = [
    {
      title: 'User Activity Report',
      description: 'Detailed analysis of user engagement and system usage',
      icon: BarChart3,
      color: 'bg-blue-500'
    },
    {
      title: 'System Performance Report',
      description: 'Performance metrics and system health indicators',
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      title: 'Compliance Report',
      description: 'Healthcare compliance and security audit results',
      icon: FileText,
      color: 'bg-purple-500'
    }
  ];

  return (
    <AppLayout title="Reports">
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-2">
          Generate and view comprehensive system reports
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report, index) => {
          const Icon = report.icon;
          return (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md ${report.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                  </div>
                </div>
                <CardDescription>
                  {report.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>
            Your recently generated reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No reports generated yet</p>
            <p className="text-sm">Generate your first report to see it here</p>
          </div>
        </CardContent>
      </Card>
    </div>
    </AppLayout>
  );
};

export default Reports;
