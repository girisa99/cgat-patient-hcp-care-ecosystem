import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Database, Cloud, ExternalLink, Settings,
  Zap, Globe, AlertCircle, CheckCircle, Eye
} from "lucide-react";

interface ApiAssignment {
  id: string;
  taskId: string;
  actionId: string;
  taskName: string;
  actionName: string;
  apiType: 'internal' | 'external';
  apiName: string;
  apiCategory: string;
  status: 'active' | 'inactive' | 'error';
  assignedAt: string;
  lastUsed?: string;
  usageCount: number;
  confidence: number;
}

interface TaskActionApiTrackerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock data for demonstration - in real app this would come from your API assignment tracking system
const API_ASSIGNMENTS: ApiAssignment[] = [
  {
    id: '1',
    taskId: 'task-1',
    actionId: 'action-1',
    taskName: 'Patient Data Processing',
    actionName: 'Validate Patient Info',
    apiType: 'internal',
    apiName: 'Healthcare Validation API',
    apiCategory: 'Data Validation',
    status: 'active',
    assignedAt: '2024-01-15T10:30:00Z',
    lastUsed: '2024-01-20T14:22:00Z',
    usageCount: 145,
    confidence: 95
  },
  {
    id: '2',
    taskId: 'task-1',
    actionId: 'action-2',
    taskName: 'Patient Data Processing',
    actionName: 'Send Notification',
    apiType: 'external',
    apiName: 'Twilio SMS API',
    apiCategory: 'Communication',
    status: 'active',
    assignedAt: '2024-01-15T10:31:00Z',
    lastUsed: '2024-01-20T14:25:00Z',
    usageCount: 89,
    confidence: 88
  },
  {
    id: '3',
    taskId: 'task-2',
    actionId: 'action-3',
    taskName: 'Financial Processing',
    actionName: 'Calculate Costs',
    apiType: 'external',
    apiName: 'SAP ERP Integration',
    apiCategory: 'Enterprise Resource Planning',
    status: 'active',
    assignedAt: '2024-01-16T09:15:00Z',
    lastUsed: '2024-01-20T11:30:00Z',
    usageCount: 67,
    confidence: 92
  },
  {
    id: '4',
    taskId: 'task-2',
    actionId: 'action-4',
    taskName: 'Financial Processing',
    actionName: 'Generate Report',
    apiType: 'internal',
    apiName: 'Report Generation API',
    apiCategory: 'Document Processing',
    status: 'active',
    assignedAt: '2024-01-16T09:16:00Z',
    lastUsed: '2024-01-19T16:45:00Z',
    usageCount: 23,
    confidence: 85
  },
  {
    id: '5',
    taskId: 'task-3',
    actionId: 'action-5',
    taskName: 'Data Synchronization',
    actionName: 'Sync with Oracle',
    apiType: 'external',
    apiName: 'Oracle Database Connector',
    apiCategory: 'Database',
    status: 'error',
    assignedAt: '2024-01-17T14:20:00Z',
    lastUsed: '2024-01-18T10:15:00Z',
    usageCount: 12,
    confidence: 76
  },
  {
    id: '6',
    taskId: 'task-4',
    actionId: 'action-6',
    taskName: 'Automation Workflows',
    actionName: 'Trigger Zapier',
    apiType: 'external',
    apiName: 'Zapier Webhook',
    apiCategory: 'Automation',
    status: 'active',
    assignedAt: '2024-01-18T11:45:00Z',
    lastUsed: '2024-01-20T09:30:00Z',
    usageCount: 34,
    confidence: 90
  }
];

const TaskActionApiTracker: React.FC<TaskActionApiTrackerProps> = ({
  isOpen,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'internal' | 'external'>('all');
  
  // Filter assignments based on search and type
  const filteredAssignments = API_ASSIGNMENTS.filter(assignment => {
    const matchesSearch = 
      assignment.taskName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.actionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.apiName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.apiCategory.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || assignment.apiType === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  // Get statistics
  const stats = {
    total: API_ASSIGNMENTS.length,
    internal: API_ASSIGNMENTS.filter(a => a.apiType === 'internal').length,
    external: API_ASSIGNMENTS.filter(a => a.apiType === 'external').length,
    active: API_ASSIGNMENTS.filter(a => a.status === 'active').length,
    errors: API_ASSIGNMENTS.filter(a => a.status === 'error').length
  };

  const getApiTypeIcon = (type: string) => {
    return type === 'internal' ? (
      <Database className="h-4 w-4 text-blue-500" />
    ) : (
      <ExternalLink className="h-4 w-4 text-green-500" />
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default' as const, text: 'Active', icon: <CheckCircle className="h-3 w-3" /> },
      inactive: { variant: 'secondary' as const, text: 'Inactive', icon: <AlertCircle className="h-3 w-3" /> },
      error: { variant: 'destructive' as const, text: 'Error', icon: <AlertCircle className="h-3 w-3" /> }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.text}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Eye className="h-6 w-6" />
                Task & Action API Tracking
              </h2>
              <p className="text-muted-foreground mt-1">
                Monitor which APIs (internal/external) are assigned to each task and action
              </p>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="p-6 border-b bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
                <div className="text-sm text-blue-600">Total Assignments</div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-green-900">{stats.internal}</div>
                <div className="text-sm text-green-600">Internal APIs</div>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-purple-900">{stats.external}</div>
                <div className="text-sm text-purple-600">External APIs</div>
              </CardContent>
            </Card>
            
            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-emerald-900">{stats.active}</div>
                <div className="text-sm text-emerald-600">Active</div>
              </CardContent>
            </Card>
            
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-red-900">{stats.errors}</div>
                <div className="text-sm text-red-600">Errors</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="p-6 border-b space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search tasks, actions, or APIs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('all')}
              >
                All ({stats.total})
              </Button>
              <Button
                variant={selectedFilter === 'internal' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('internal')}
              >
                <Database className="h-4 w-4 mr-1" />
                Internal ({stats.internal})
              </Button>
              <Button
                variant={selectedFilter === 'external' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('external')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                External ({stats.external})
              </Button>
            </div>
          </div>
        </div>

        {/* Assignments Table */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => (
              <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    {/* Task & Action Info */}
                    <div className="lg:col-span-3">
                      <div className="space-y-1">
                        <p className="font-semibold text-sm">{assignment.taskName}</p>
                        <p className="text-sm text-muted-foreground">{assignment.actionName}</p>
                      </div>
                    </div>

                    {/* API Info */}
                    <div className="lg:col-span-3">
                      <div className="flex items-center gap-2">
                        {getApiTypeIcon(assignment.apiType)}
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{assignment.apiName}</p>
                          <Badge variant="outline" className="text-xs">
                            {assignment.apiCategory}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Status & Confidence */}
                    <div className="lg:col-span-2">
                      <div className="space-y-2">
                        {getStatusBadge(assignment.status)}
                        <div className="flex items-center gap-1">
                          <div className="text-xs text-muted-foreground">Confidence:</div>
                          <Badge variant="outline" className="text-xs">
                            {assignment.confidence}%
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Usage Stats */}
                    <div className="lg:col-span-2">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1">
                          <Zap className="h-3 w-3 text-gray-400" />
                          <span className="text-muted-foreground">Used:</span>
                          <span className="font-medium">{assignment.usageCount}x</span>
                        </div>
                        {assignment.lastUsed && (
                          <div className="text-xs text-muted-foreground">
                            Last: {formatDate(assignment.lastUsed)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="lg:col-span-2">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Settings className="h-3 w-3 mr-1" />
                          Configure
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredAssignments.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No assignments found</h3>
                  <p className="text-gray-600">
                    {searchQuery ? 
                      "Try adjusting your search criteria or filters." :
                      "No API assignments have been configured yet."
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskActionApiTracker;