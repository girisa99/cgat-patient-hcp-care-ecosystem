/**
 * ONBOARDING TABLE - Applications data table
 * Displays onboarding applications with actions for onboardingTeam
 */
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  Eye, 
  FileText, 
  Calendar,
  Building
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface OnboardingTableProps {
  applications: any[];
  isLoading: boolean;
  onEdit: (id: string) => void;
}

export const OnboardingTable: React.FC<OnboardingTableProps> = ({
  applications,
  isLoading,
  onEdit
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No applications found</h3>
        <p className="text-muted-foreground">
          Create a new onboarding application to get started.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: { variant: 'secondary', label: 'Draft' },
      submitted: { variant: 'default', label: 'Submitted' },
      under_review: { variant: 'outline', label: 'Under Review' },
      approved: { variant: 'default', label: 'Approved', className: 'bg-green-100 text-green-800' },
      rejected: { variant: 'destructive', label: 'Rejected' }
    };

    const config = variants[status] || { variant: 'secondary', label: status };
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 font-medium">Company</th>
            <th className="text-left p-3 font-medium">Type</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-left p-3 font-medium">Created</th>
            <th className="text-left p-3 font-medium">Last Updated</th>
            <th className="text-left p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id} className="border-b hover:bg-gray-50">
              <td className="p-3">
                <div className="flex items-center gap-3">
                  <Building className="h-8 w-8 p-2 bg-blue-100 text-blue-600 rounded" />
                  <div>
                    <div className="font-medium">{app.legal_name}</div>
                    {app.dba_name && (
                      <div className="text-sm text-muted-foreground">
                        DBA: {app.dba_name}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="p-3">
                <div className="text-sm">
                  {app.business_types?.join(', ') || 'Not specified'}
                </div>
              </td>
              <td className="p-3">
                {getStatusBadge(app.status)}
              </td>
              <td className="p-3">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                </div>
              </td>
              <td className="p-3">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDistanceToNow(new Date(app.updated_at), { addSuffix: true })}
                </div>
              </td>
              <td className="p-3">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(app.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // TODO: Implement view details
                      console.log('View details for:', app.id);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};