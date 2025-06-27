
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
import { Shield, Search, Calendar, User, Database } from 'lucide-react';

interface AuditLogListProps {
  filters?: any;
}

interface AuditLogEntry {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  timestamp: string;
  ip_address?: string;
  user_email?: string;
  details?: any;
}

export const AuditLogList: React.FC<AuditLogListProps> = ({ filters = {} }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');

  // Mock data for demonstration
  const mockAuditLogs: AuditLogEntry[] = [
    {
      id: '1',
      user_id: 'user-1',
      action: 'CREATE',
      table_name: 'facilities',
      timestamp: '2025-06-27T04:30:00Z',
      ip_address: '192.168.1.100',
      user_email: 'admin@example.com',
      details: { facility_name: 'New Medical Center' }
    },
    {
      id: '2',
      user_id: 'user-2',
      action: 'UPDATE',
      table_name: 'profiles',
      timestamp: '2025-06-27T04:25:00Z',
      ip_address: '192.168.1.101',
      user_email: 'user@example.com',
      details: { field_changed: 'phone_number' }
    },
    {
      id: '3',
      user_id: 'user-1',
      action: 'DELETE',
      table_name: 'user_roles',
      timestamp: '2025-06-27T04:20:00Z',
      ip_address: '192.168.1.100',
      user_email: 'admin@example.com',
      details: { role_removed: 'temporary_access' }
    }
  ];

  const getActionBadgeColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const filteredLogs = mockAuditLogs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = selectedAction === 'all' || 
      log.action.toLowerCase() === selectedAction.toLowerCase();

    return matchesSearch && matchesAction;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Audit Log ({filteredLogs.length} entries)
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
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
          </select>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              {searchTerm || selectedAction !== 'all' ? 'No audit logs match your filters.' : 'No audit logs found.'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Timestamp
                </TableHead>
                <TableHead className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  User
                </TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="flex items-center gap-1">
                  <Database className="h-4 w-4" />
                  Table
                </TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">
                    {formatTimestamp(log.timestamp)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{log.user_email}</div>
                      <div className="text-sm text-muted-foreground font-mono">
                        {log.user_id.substring(0, 8)}...
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getActionBadgeColor(log.action)}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {log.table_name}
                    </code>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {log.ip_address || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {log.details && (
                      <div className="text-sm text-muted-foreground max-w-xs truncate">
                        {JSON.stringify(log.details)}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default AuditLogList;
