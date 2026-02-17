/**
 * ENROLLMENT DEBUG PANEL
 * Real-time debugging interface for enrollment form issues
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Bug, 
  Database, 
  AlertTriangle, 
  Info, 
  AlertCircle,
  RefreshCw,
  Download,
  Trash
} from "lucide-react";
import { useEnrollmentDebugger } from "@/utils/enrollmentDebugger";

export const EnrollmentDebugPanel: React.FC = () => {
  const { debugger: enrollmentLogger, getLogs, getErrors, getSummary } = useEnrollmentDebugger();
  const [summary, setSummary] = useState(getSummary());
  const [logs, setLogs] = useState(getLogs());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh debug data
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setSummary(getSummary());
      setLogs(getLogs());
    }, 2000);

    return () => clearInterval(interval);
  }, [autoRefresh, getSummary, getLogs]);

  const handleRefresh = () => {
    setSummary(getSummary());
    setLogs(getLogs());
  };

  const handleClearLogs = () => {
    enrollmentLogger.clearLogs();
    handleRefresh();
  };

  const handleExportLogs = () => {
    const debugData = {
      timestamp: new Date().toISOString(),
      summary: summary,
      logs: logs
    };
    
    const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enrollment-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warn': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLevelBadgeVariant = (level: string): "default" | "destructive" | "secondary" => {
    switch (level) {
      case 'error': return 'destructive';
      case 'warn': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bug className="h-5 w-5" />
            <CardTitle>Enrollment Debug Panel</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportLogs}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearLogs}>
              <Trash className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <Badge variant="outline">{summary.summary.totalLogs} total logs</Badge>
          </div>
          {summary.summary.errorCount > 0 && (
            <div className="flex items-center space-x-1">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <Badge variant="destructive">{summary.summary.errorCount} errors</Badge>
            </div>
          )}
          {summary.summary.warningCount > 0 && (
            <div className="flex items-center space-x-1">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <Badge variant="secondary">{summary.summary.warningCount} warnings</Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Last Error Alert */}
        {summary.lastError && (
          <Alert className="mb-4" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Latest Error:</strong> {summary.lastError.message}
              <div className="text-xs mt-1 opacity-80">
                {summary.lastError.category} • {new Date(summary.lastError.timestamp).toLocaleTimeString()}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="all-logs" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all-logs">All Logs</TabsTrigger>
            <TabsTrigger value="errors">Errors ({summary.summary.errorCount})</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="field-mapping">Field Mapping</TabsTrigger>
          </TabsList>

          <TabsContent value="all-logs">
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {logs.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No logs available. Start using the enrollment form to see debug information.
                  </div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="p-3 border rounded-lg bg-card">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          {getLogIcon(log.level)}
                          <Badge variant={getLevelBadgeVariant(log.level)}>{log.level}</Badge>
                          <Badge variant="outline">{log.category}</Badge>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="font-medium">{log.message}</div>
                        {log.data && (
                          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="errors">
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {summary.recentErrors.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No errors found. Great job! 🎉
                  </div>
                ) : (
                  summary.recentErrors.map((log, index) => (
                    <div key={index} className="p-3 border border-red-200 rounded-lg bg-red-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <Badge variant="destructive">{log.category}</Badge>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="font-medium text-red-800">{log.message}</div>
                        {log.data && (
                          <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="database">
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {summary.databaseLogs.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No database operations logged yet.
                  </div>
                ) : (
                  summary.databaseLogs.map((log, index) => (
                    <div key={index} className="p-3 border rounded-lg bg-card">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <Database className="h-4 w-4" />
                          <Badge variant={getLevelBadgeVariant(log.level)}>{log.level}</Badge>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="font-medium">{log.message}</div>
                        {log.data && (
                          <pre className="mt-2 text-xs bg-blue-50 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="field-mapping">
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {summary.fieldMappingLogs.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No field mapping operations logged yet.
                  </div>
                ) : (
                  summary.fieldMappingLogs.map((log, index) => (
                    <div key={index} className="p-3 border rounded-lg bg-card">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          {getLogIcon(log.level)}
                          <Badge variant={getLevelBadgeVariant(log.level)}>{log.level}</Badge>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="font-medium">{log.message}</div>
                        {log.data && (
                          <pre className="mt-2 text-xs bg-green-50 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};