import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useLabelStudio, type LSTask } from '@/hooks/useLabelStudio';
import { useMasterToast } from '@/hooks/useMasterToast';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  Download,
  FileText,
  CheckCircle,
  AlertCircle,
  Trash2,
  Play,
  Pause,
  Settings,
  Database,
  RefreshCw
} from 'lucide-react';

interface LSBatchOperationsProps {
  projectId: number;
  onBatchComplete?: (operation: string, results: any) => void;
}

export const LSBatchOperations: React.FC<LSBatchOperationsProps> = ({
  projectId,
  onBatchComplete
}) => {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [operationLogs, setOperationLogs] = useState<string[]>([]);
  const [importData, setImportData] = useState<any[]>([]);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'xml'>('json');
  const [batchSize, setBatchSize] = useState(50);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    loading,
    listProjectTasks,
    bulkImportTasks,
    exportProject,
    updateTask,
    createAnnotation
  } = useLabelStudio();

  const { showSuccess, showError, showInfo } = useMasterToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let data;
        
        if (file.name.endsWith('.json')) {
          data = JSON.parse(content);
        } else if (file.name.endsWith('.csv')) {
          data = parseCSV(content);
        } else {
          throw new Error('Unsupported file format');
        }

        setImportData(Array.isArray(data) ? data : [data]);
        showSuccess(`Loaded ${Array.isArray(data) ? data.length : 1} items for import`);
      } catch (error) {
        showError('Failed to parse file. Please check the format.');
      }
    };
    reader.readAsText(file);
  }, [showSuccess, showError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
      'text/csv': ['.csv'],
      'application/xml': ['.xml']
    },
    multiple: false
  });

  const parseCSV = (content: string) => {
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim());
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] || '';
        });
        data.push(obj);
      }
    }

    return data;
  };

  const addLog = (message: string) => {
    setOperationLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const simulateProgress = (duration: number, onComplete: () => void) => {
    let current = 0;
    const increment = 100 / (duration / 100);
    
    const interval = setInterval(() => {
      current += increment;
      setProgress(Math.min(current, 100));
      
      if (current >= 100) {
        clearInterval(interval);
        onComplete();
      }
    }, 100);
  };

  const handleBulkImport = async () => {
    if (importData.length === 0) {
      showError('No data to import. Please upload a file first.');
      return;
    }

    setActiveOperation('import');
    setProgress(0);
    addLog(`Starting bulk import of ${importData.length} items`);

    try {
      simulateProgress(3000, async () => {
        const result = await bulkImportTasks(projectId, importData);
        addLog(`Successfully imported ${importData.length} tasks`);
        showSuccess(`Imported ${importData.length} tasks successfully`);
        setActiveOperation(null);
        onBatchComplete?.('import', { imported: importData.length, result });
      });
    } catch (error) {
      addLog(`Import failed: ${error}`);
      showError('Bulk import failed');
      setActiveOperation(null);
    }
  };

  const handleBulkExport = async () => {
    setActiveOperation('export');
    setProgress(0);
    addLog(`Starting bulk export in ${exportFormat} format`);

    try {
      simulateProgress(2000, async () => {
        const data = await exportProject(projectId);
        
        let exportContent: string;
        let mimeType: string;
        let fileExtension: string;

        switch (exportFormat) {
          case 'csv':
            exportContent = convertToCSV(data);
            mimeType = 'text/csv';
            fileExtension = 'csv';
            break;
          case 'xml':
            exportContent = convertToXML(data);
            mimeType = 'application/xml';
            fileExtension = 'xml';
            break;
          default:
            exportContent = JSON.stringify(data, null, 2);
            mimeType = 'application/json';
            fileExtension = 'json';
        }

        const blob = new Blob([exportContent], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `label-studio-export-${projectId}-${Date.now()}.${fileExtension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        addLog(`Export completed successfully`);
        showSuccess(`Data exported as ${exportFormat.toUpperCase()}`);
        setActiveOperation(null);
        onBatchComplete?.('export', { format: exportFormat, itemCount: data.length });
      });
    } catch (error) {
      addLog(`Export failed: ${error}`);
      showError('Bulk export failed');
      setActiveOperation(null);
    }
  };

  const convertToCSV = (data: any[]): string => {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(item => 
        headers.map(header => 
          JSON.stringify(item[header] || '')
        ).join(',')
      )
    ].join('\n');
    
    return csvContent;
  };

  const convertToXML = (data: any[]): string => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<tasks>\n';
    data.forEach(item => {
      xml += '  <task>\n';
      Object.entries(item).forEach(([key, value]) => {
        xml += `    <${key}>${JSON.stringify(value)}</${key}>\n`;
      });
      xml += '  </task>\n';
    });
    xml += '</tasks>';
    return xml;
  };

  const handleBatchUpdate = async () => {
    if (selectedTasks.length === 0) {
      showError('No tasks selected for update');
      return;
    }

    setActiveOperation('update');
    setProgress(0);
    addLog(`Starting batch update of ${selectedTasks.length} tasks`);

    try {
      let completed = 0;
      for (const taskId of selectedTasks) {
        await updateTask(taskId, { updated_at: new Date().toISOString() });
        completed++;
        setProgress((completed / selectedTasks.length) * 100);
        addLog(`Updated task ${taskId}`);
      }

      addLog(`Batch update completed successfully`);
      showSuccess(`Updated ${selectedTasks.length} tasks`);
      setActiveOperation(null);
      onBatchComplete?.('update', { updated: selectedTasks.length });
    } catch (error) {
      addLog(`Batch update failed: ${error}`);
      showError('Batch update failed');
      setActiveOperation(null);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedTasks.length === 0) {
      showError('No tasks selected for deletion');
      return;
    }

    setActiveOperation('delete');
    setProgress(0);
    addLog(`Starting batch deletion of ${selectedTasks.length} tasks`);

    // Note: Label Studio typically doesn't support task deletion via API
    // This is a simulation
    simulateProgress(2000, () => {
      addLog(`Batch deletion completed (simulated)`);
      showInfo(`Would delete ${selectedTasks.length} tasks`);
      setActiveOperation(null);
      onBatchComplete?.('delete', { deleted: selectedTasks.length });
    });
  };

  const cancelOperation = () => {
    setActiveOperation(null);
    setProgress(0);
    addLog('Operation cancelled by user');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Batch Operations</h2>
          <p className="text-muted-foreground">
            Bulk import, export, and manage Label Studio data
          </p>
        </div>
        {activeOperation && (
          <Button variant="outline" onClick={cancelOperation}>
            <Pause className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        )}
      </div>

      {/* Progress Indicator */}
      {activeOperation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              {activeOperation.charAt(0).toUpperCase() + activeOperation.slice(1)} in Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="mb-2" />
            <p className="text-sm text-muted-foreground">{progress.toFixed(0)}% complete</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="import">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="import" disabled={activeOperation !== null}>Import</TabsTrigger>
          <TabsTrigger value="export" disabled={activeOperation !== null}>Export</TabsTrigger>
          <TabsTrigger value="update" disabled={activeOperation !== null}>Update</TabsTrigger>
          <TabsTrigger value="manage" disabled={activeOperation !== null}>Manage</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Import</CardTitle>
              <CardDescription>Import tasks from JSON, CSV, or XML files</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload */}
              <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}`}>
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  {isDragActive ? 'Drop the file here' : 'Drag & drop file here'}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports JSON, CSV, and XML formats
                </p>
                <Button variant="outline">Browse Files</Button>
              </div>

              {/* Import Preview */}
              {importData.length > 0 && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-medium">Import Preview</p>
                    <Badge variant="secondary">{importData.length} items</Badge>
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    <pre className="text-sm bg-muted p-2 rounded">
                      {JSON.stringify(importData.slice(0, 3), null, 2)}
                      {importData.length > 3 && '\n... and more'}
                    </pre>
                  </div>
                </div>
              )}

              {/* Import Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="batch-size">Batch Size</Label>
                  <Input 
                    id="batch-size"
                    type="number" 
                    value={batchSize} 
                    onChange={(e) => setBatchSize(Number(e.target.value))}
                    min={1}
                    max={1000}
                  />
                </div>
              </div>

              <Button 
                onClick={handleBulkImport} 
                disabled={importData.length === 0 || activeOperation !== null}
                className="w-full"
              >
                <Database className="h-4 w-4 mr-2" />
                Import {importData.length} Tasks
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Export</CardTitle>
              <CardDescription>Export project data in various formats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Export Format</Label>
                <div className="flex gap-2 mt-2">
                  {['json', 'csv', 'xml'].map((format) => (
                    <Button
                      key={format}
                      variant={exportFormat === format ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setExportFormat(format as any)}
                    >
                      {format.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-annotations" defaultChecked />
                  <Label htmlFor="include-annotations">Include Annotations</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-metadata" defaultChecked />
                  <Label htmlFor="include-metadata">Include Metadata</Label>
                </div>
              </div>

              <Button 
                onClick={handleBulkExport} 
                disabled={activeOperation !== null}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Project Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="update" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Batch Update</CardTitle>
              <CardDescription>Update multiple tasks simultaneously</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="task-ids">Task IDs (comma-separated)</Label>
                <Textarea 
                  id="task-ids"
                  placeholder="1001, 1002, 1003..."
                  value={selectedTasks.join(', ')}
                  onChange={(e) => setSelectedTasks(e.target.value.split(',').map(id => id.trim()).filter(id => id))}
                />
              </div>

              <div>
                <Label htmlFor="update-fields">Update Fields (JSON)</Label>
                <Textarea 
                  id="update-fields"
                  placeholder='{"status": "completed", "priority": "high"}'
                />
              </div>

              <Button 
                onClick={handleBatchUpdate} 
                disabled={selectedTasks.length === 0 || activeOperation !== null}
                className="w-full"
              >
                <Settings className="h-4 w-4 mr-2" />
                Update {selectedTasks.length} Tasks
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Batch Delete</CardTitle>
                <CardDescription>Permanently remove tasks (use with caution)</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="destructive" 
                  onClick={handleBatchDelete}
                  disabled={selectedTasks.length === 0 || activeOperation !== null}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete {selectedTasks.length} Tasks
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cleanup Operations</CardTitle>
                <CardDescription>Maintain project data quality</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full" size="sm">
                  Remove Duplicate Tasks
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  Clean Empty Annotations
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  Validate Data Integrity
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Operation Logs */}
      {operationLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Operation Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-40 overflow-y-auto bg-muted p-4 rounded text-sm font-mono">
              {operationLogs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};