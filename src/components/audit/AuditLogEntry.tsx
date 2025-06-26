
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Clock, User, Eye, Database } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface AuditLogEntryProps {
  log: {
    id: string;
    user_id: string;
    action: string;
    table_name: string;
    record_id: string;
    old_values: any;
    new_values: any;
    ip_address: string;
    created_at: string;
    profiles?: {
      first_name: string;
      last_name: string;
      email: string;
    };
  };
}

export const AuditLogEntry = ({ log }: AuditLogEntryProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'INSERT':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionDescription = (action: string, tableName: string) => {
    const tableDisplayName = tableName.replace('_', ' ').toLowerCase();
    switch (action.toUpperCase()) {
      case 'INSERT':
        return `Created new ${tableDisplayName} record`;
      case 'UPDATE':
        return `Updated ${tableDisplayName} record`;
      case 'DELETE':
        return `Deleted ${tableDisplayName} record`;
      default:
        return `${action} on ${tableDisplayName}`;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getUserName = () => {
    if (log.profiles) {
      const fullName = `${log.profiles.first_name || ''} ${log.profiles.last_name || ''}`.trim();
      return fullName || log.profiles.email;
    }
    return 'Unknown User';
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-muted-foreground" />
          <div>
            <h4 className="font-medium">{getActionDescription(log.action, log.table_name)}</h4>
            <p className="text-sm text-muted-foreground">Record ID: {log.record_id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getActionColor(log.action)}>
            {log.action.toUpperCase()}
          </Badge>
          {(log.old_values || log.new_values) && (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <User className="h-4 w-4" />
          <span>By: {getUserName()}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{formatTimestamp(log.created_at)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Database className="h-4 w-4" />
          <span>Table: {log.table_name}</span>
        </div>
        {log.ip_address && (
          <div className="flex items-center gap-1">
            <span>IP: {log.ip_address}</span>
          </div>
        )}
      </div>

      {(log.old_values || log.new_values) && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleContent className="space-y-3">
            <div className="border-t pt-3">
              {log.old_values && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-red-700">Previous Values:</h5>
                  <pre className="text-xs bg-red-50 p-2 rounded overflow-x-auto">
                    {JSON.stringify(log.old_values, null, 2)}
                  </pre>
                </div>
              )}
              {log.new_values && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-green-700">New Values:</h5>
                  <pre className="text-xs bg-green-50 p-2 rounded overflow-x-auto">
                    {JSON.stringify(log.new_values, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};
