
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Shield, Search, Calendar, User, Database, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { AuditLogEntry } from './AuditLogEntry';

interface AuditLogListProps {
  auditLogs: any[];
  isLoading?: boolean;
  error?: any;
  filters?: any;
  onRefresh?: () => void;
}

export const AuditLogList: React.FC<AuditLogListProps> = ({ 
  auditLogs = [], 
  isLoading = false, 
  error = null,
  filters = {},
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');

  console.log('📋 AuditLogList received:', {
    auditLogsCount: auditLogs.length,
    isLoading,
    error,
    filters,
    sampleLog: auditLogs[0]
  });

  const getActionBadgeColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'INSERT':
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      case 'PATIENT_DEACTIVATED':
        return 'bg-orange-100 text-orange-800';
      case 'API_INTEGRATION_CREATED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Apply local search filtering to the real data
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.table_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = selectedAction === 'all' || 
      log.action?.toLowerCase() === selectedAction.toLowerCase();

    return matchesSearch && matchesAction;
  });

  console.log('🔍 Filtered logs:', {
    originalCount: auditLogs.length,
    filteredCount: filteredLogs.length,
    searchTerm,
    selectedAction
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Audit Log ({filteredLogs.length} entries)
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by user, table, or action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Actions</option>
            <option value="insert">Insert</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
          </select>
        </div>

        {error && (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">Error loading audit logs</p>
            <p className="text-red-500 text-sm">{error.message}</p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading audit logs...</p>
          </div>
        )}

        {!isLoading && !error && filteredLogs.length === 0 && (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              {searchTerm || selectedAction !== 'all' ? 'No audit logs match your filters.' : 'No audit logs found.'}
            </p>
          </div>
        )}

        {!isLoading && !error && filteredLogs.length > 0 && (
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <AuditLogEntry key={log.id} log={log} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuditLogList;
