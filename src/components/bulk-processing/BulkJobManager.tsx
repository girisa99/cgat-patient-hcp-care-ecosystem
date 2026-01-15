/**
 * Bulk Job Manager - Desktop Full UI
 * Connected to bulk_jobs database table
 * 
 * CREATE BULK JOBS:
 * 1. Template-Based (Recommended): Clone from existing shows/templates
 * 2. CSV Import (Advanced): For power users with spreadsheet data
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  FileSpreadsheet, Play, Pause, Trash2, 
  CheckCircle, AlertCircle, Clock, Loader2,
  Download, RefreshCw, Video, FileText, Image, LayoutGrid,
  Upload, HelpCircle, Copy, Layers, Plus, ChevronRight
} from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';
import { useBulkJobs } from '@/hooks/useBulkJobs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// CSV field mapping for video generation
interface VideoItem {
  title: string;
  prompt: string;
  duration?: number;
  aspectRatio?: string;
  style?: string;
  voiceId?: string;
  script?: string;
}

type OperationType = 'video_generation' | 'audio_processing' | 'image_resize' | 'content_publish';
type CreateMethod = 'template' | 'csv';

const OPERATION_CONFIGS: Record<OperationType, { label: string; requiredFields: string[]; optionalFields: string[] }> = {
  video_generation: {
    label: 'Video Generation',
    requiredFields: ['title', 'prompt'],
    optionalFields: ['duration', 'aspectRatio', 'style', 'voiceId', 'script']
  },
  audio_processing: {
    label: 'Audio Processing',
    requiredFields: ['title', 'text'],
    optionalFields: ['voiceId', 'speed', 'format']
  },
  image_resize: {
    label: 'Image Resize',
    requiredFields: ['source_url', 'width', 'height'],
    optionalFields: ['format', 'quality']
  },
  content_publish: {
    label: 'Content Publish',
    requiredFields: ['title', 'content', 'platform'],
    optionalFields: ['scheduled_at', 'hashtags']
  }
};

// CSV Parser utility
const parseCSV = (content: string): Record<string, string>[] => {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
  const rows: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row: Record<string, string> = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx]?.trim().replace(/^["']|["']$/g, '') || '';
      });
      rows.push(row);
    }
  }
  
  return rows;
};

// Handle quoted CSV values properly
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
};

const BulkJobManager: React.FC = () => {
  const { showSuccess, showError, showInfo } = useMasterToast();
  const { 
    activeJobs, 
    completedJobs, 
    stats,
    isLoading,
    isRefreshing,
    createJob,
    toggleJobPause,
    cancelJob,
    refreshJobs,
    isCreating: isCreatingJob,
  } = useBulkJobs();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedItems, setParsedItems] = useState<Record<string, string>[]>([]);
  const [operationType, setOperationType] = useState<OperationType>('video_generation');
  const [isCreating, setIsCreating] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [createMethod, setCreateMethod] = useState<CreateMethod>('template');
  const [templateCount, setTemplateCount] = useState(5);
  const [templateTitle, setTemplateTitle] = useState('');

  const validateItems = useCallback((items: Record<string, string>[], opType: OperationType): { valid: boolean; errors: string[] } => {
    const config = OPERATION_CONFIGS[opType];
    const errors: string[] = [];
    
    items.forEach((item, index) => {
      config.requiredFields.forEach(field => {
        if (!item[field] || item[field].trim() === '') {
          errors.push(`Row ${index + 1}: Missing required field "${field}"`);
        }
      });
    });
    
    return { valid: errors.length === 0, errors };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setParseError(null);
    setParsedItems([]);
    
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        
        try {
          const content = await file.text();
          const items = parseCSV(content);
          
          if (items.length === 0) {
            setParseError('CSV file is empty or has invalid format');
            return;
          }
          
          const validation = validateItems(items, operationType);
          if (!validation.valid) {
            setParseError(validation.errors.slice(0, 3).join('; ') + (validation.errors.length > 3 ? ` (+${validation.errors.length - 3} more)` : ''));
            return;
          }
          
          setParsedItems(items);
          showSuccess(`Parsed ${items.length} items from CSV`);
        } catch (err) {
          setParseError('Failed to parse CSV file');
          showError('Failed to parse CSV');
        }
      } else {
        showError('Please upload a CSV file');
      }
    }
  };

  const handleCreateJob = async () => {
    if (!selectedFile || parsedItems.length === 0) {
      showError('Please upload a valid CSV file first');
      return;
    }
    
    setIsCreating(true);
    try {
      await createJob({
        operation_type: operationType,
        items: parsedItems,
        options: { 
          name: selectedFile.name.replace('.csv', ''),
          source_file: selectedFile.name,
          created_from: 'bulk_manager'
        }
      });
      setSelectedFile(null);
      setParsedItems([]);
      showSuccess(`Bulk job created with ${parsedItems.length} items`);
    } catch (error) {
      showError('Failed to create job');
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': case 'cancelled': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'failed': case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video_generation': return <Video className="h-4 w-4" />;
      case 'audio_processing': return <FileText className="h-4 w-4" />;
      case 'image_resize': return <Image className="h-4 w-4" />;
      default: return <LayoutGrid className="h-4 w-4" />;
    }
  };

  const handlePauseResume = async (jobId: string, status: string) => {
    try {
      await toggleJobPause(jobId, status as any);
    } catch (error) {
      showError('Failed to update job');
    }
  };

  const handleCancel = async (jobId: string) => {
    try {
      await cancelJob(jobId);
      showSuccess('Job cancelled');
    } catch (error) {
      showError('Failed to cancel job');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Bulk Processing</h2>
          <p className="text-sm text-muted-foreground">Manage batch video generation and content processing</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{stats.activeJobs} Active Jobs</Badge>
          <Button variant="outline" size="sm" onClick={refreshJobs} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Create Bulk Job
          </CardTitle>
          <CardDescription>Create multiple items at once using templates or CSV import</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Method Selection */}
          <div className="grid grid-cols-2 gap-3">
            <Card 
              className={`p-3 cursor-pointer transition-all ${createMethod === 'template' ? 'border-primary ring-1 ring-primary' : 'hover:bg-muted/50'}`}
              onClick={() => setCreateMethod('template')}
            >
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${createMethod === 'template' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <Copy className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Template Based</p>
                  <p className="text-xs text-muted-foreground">Quick batch from template</p>
                </div>
                {createMethod === 'template' && <CheckCircle className="h-4 w-4 text-primary" />}
              </div>
            </Card>
            
            <Card 
              className={`p-3 cursor-pointer transition-all ${createMethod === 'csv' ? 'border-primary ring-1 ring-primary' : 'hover:bg-muted/50'}`}
              onClick={() => setCreateMethod('csv')}
            >
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${createMethod === 'csv' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">CSV Import</p>
                  <p className="text-xs text-muted-foreground">Advanced spreadsheet upload</p>
                </div>
                {createMethod === 'csv' && <CheckCircle className="h-4 w-4 text-primary" />}
              </div>
            </Card>
          </div>
          
          {/* Template Method */}
          {createMethod === 'template' && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Operation Type</Label>
                  <Select value={operationType} onValueChange={(v) => setOperationType(v as OperationType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(OPERATION_CONFIGS).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Number of Items</Label>
                  <Select value={String(templateCount)} onValueChange={(v) => setTemplateCount(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 20, 50, 100].map((n) => (
                        <SelectItem key={n} value={String(n)}>{n} items</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Base Title (items will be numbered)</Label>
                <Input 
                  value={templateTitle} 
                  onChange={(e) => setTemplateTitle(e.target.value)}
                  placeholder="e.g., Product Video, Episode, Training Module"
                />
              </div>
              
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <HelpCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">How it works:</p>
                    <p>Creates {templateCount} items named "{templateTitle || 'Item'} 1", "{templateTitle || 'Item'} 2", etc.</p>
                    <p className="mt-1">Each item will use the selected operation type with placeholder content you can edit later.</p>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={async () => {
                  if (!templateTitle.trim()) {
                    showError('Please enter a base title');
                    return;
                  }
                  setIsCreating(true);
                  try {
                    const items = Array.from({ length: templateCount }, (_, i) => ({
                      title: `${templateTitle} ${i + 1}`,
                      prompt: `Placeholder prompt for ${templateTitle} ${i + 1}`,
                    }));
                    await createJob({
                      operation_type: operationType,
                      items,
                      options: { 
                        name: `${templateTitle} Batch (${templateCount} items)`,
                        source_file: 'template',
                        created_from: 'bulk_manager_template'
                      }
                    });
                    setTemplateTitle('');
                    showSuccess(`Created batch job with ${templateCount} items`);
                  } catch (error) {
                    showError('Failed to create batch job');
                  } finally {
                    setIsCreating(false);
                  }
                }}
                disabled={!templateTitle.trim() || isCreating}
                className="w-full gap-2"
              >
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create Batch ({templateCount} items)
              </Button>
            </div>
          )}
          
          {/* CSV Method */}
          {createMethod === 'csv' && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Operation Type
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          <p className="font-medium mb-1">CSV Format:</p>
                          <p className="text-xs">Required: {OPERATION_CONFIGS[operationType].requiredFields.join(', ')}</p>
                          <p className="text-xs">Optional: {OPERATION_CONFIGS[operationType].optionalFields.join(', ')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Select value={operationType} onValueChange={(v) => setOperationType(v as OperationType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(OPERATION_CONFIGS).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>CSV File</Label>
                  <Input type="file" accept=".csv" onChange={handleFileUpload} />
                </div>
              </div>
              
              {parseError && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                  <p className="text-sm text-destructive">{parseError}</p>
                </div>
              )}
              
              {parsedItems.length > 0 && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">
                        {parsedItems.length} items ready for processing
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Columns: {Object.keys(parsedItems[0] || {}).join(', ')}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-2">
                <div className="text-xs text-muted-foreground">
                  Required: {OPERATION_CONFIGS[operationType].requiredFields.join(', ')}
                </div>
                <Button 
                  onClick={handleCreateJob} 
                  disabled={parsedItems.length === 0 || isCreating}
                  className="gap-2"
                >
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Start Batch ({parsedItems.length} items)
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active" className="gap-2">
            <Loader2 className="h-4 w-4" />Active ({activeJobs.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle className="h-4 w-4" />Completed ({completedJobs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                {activeJobs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Clock className="h-12 w-12 mb-4 opacity-50" />
                    <p>No active jobs</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {activeJobs.map((job) => (
                      <div key={job.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">{getTypeIcon(job.operation_type)}</div>
                            <div>
                              <h4 className="font-medium">{job.options?.name || job.operation_type}</h4>
                              <p className="text-xs text-muted-foreground">Created {new Date(job.created_at).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(job.status)}>
                              {getStatusIcon(job.status)}
                              <span className="ml-1 capitalize">{job.status}</span>
                            </Badge>
                            <Button variant="ghost" size="icon" onClick={() => handlePauseResume(job.id, job.status)}>
                              {job.status === 'paused' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleCancel(job.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{job.processed_items || 0} / {job.total_items} items</span>
                            <span>{job.total_items > 0 ? Math.round(((job.processed_items || 0) / job.total_items) * 100) : 0}%</span>
                          </div>
                          <Progress value={job.total_items > 0 ? ((job.processed_items || 0) / job.total_items) * 100 : 0} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                {completedJobs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mb-4 opacity-50" />
                    <p>No completed jobs yet</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {completedJobs.map((job) => (
                      <div key={job.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-muted">{getTypeIcon(job.operation_type)}</div>
                            <div>
                              <h4 className="font-medium">{job.options?.name || job.operation_type}</h4>
                              <p className="text-xs text-muted-foreground">
                                {job.processed_items || 0} / {job.total_items} completed
                                {(job.failed_items || 0) > 0 && ` • ${job.failed_items} failed`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(job.status)}>
                              {getStatusIcon(job.status)}
                              <span className="ml-1 capitalize">{job.status}</span>
                            </Badge>
                            <Button variant="outline" size="sm" className="gap-2">
                              <Download className="h-4 w-4" />Download All
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BulkJobManager;
