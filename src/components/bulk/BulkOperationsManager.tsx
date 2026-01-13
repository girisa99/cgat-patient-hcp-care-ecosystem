import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Layers, Play, Pause, XCircle, RefreshCw, Upload, 
  CheckCircle, AlertTriangle, Clock, FileVideo, FileAudio, 
  Image, FileText, Download
} from 'lucide-react';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';

interface BulkJob {
  id: string;
  operation_type: string;
  status: string;
  total_items: number;
  processed_items: number;
  failed_items: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  progress_percent?: number;
}

const operationTypes = [
  { value: 'video_generation', label: 'Video Generation', icon: FileVideo },
  { value: 'audio_processing', label: 'Audio Processing', icon: FileAudio },
  { value: 'image_resize', label: 'Image Resize', icon: Image },
  { value: 'document_convert', label: 'Document Convert', icon: FileText },
  { value: 'data_export', label: 'Data Export', icon: Download },
  { value: 'content_publish', label: 'Content Publish', icon: Upload }
];

export const BulkOperationsManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedOperation, setSelectedOperation] = useState('video_generation');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [pollingJobId, setPollingJobId] = useState<string | null>(null);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['bulk-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('bulk-operations', {
        body: { action: 'get_jobs' }
      });
      if (error) throw error;
      return data.jobs as BulkJob[];
    },
    refetchInterval: pollingJobId ? 3000 : false
  });

  const { data: activeJobStatus } = useQuery({
    queryKey: ['bulk-job-status', pollingJobId],
    queryFn: async () => {
      if (!pollingJobId) return null;
      const { data, error } = await supabase.functions.invoke('bulk-operations', {
        body: { action: 'get_status', job_id: pollingJobId }
      });
      if (error) throw error;
      if (data.job?.status === 'completed' || data.job?.status === 'failed') {
        setPollingJobId(null);
      }
      return data.job;
    },
    enabled: !!pollingJobId,
    refetchInterval: pollingJobId ? 2000 : false
  });

  const createJobMutation = useMutation({
    mutationFn: async (items: Array<Record<string, unknown>>) => {
      const { data, error } = await supabase.functions.invoke('bulk-operations', {
        body: { 
          action: 'create_job', 
          operation_type: selectedOperation,
          items,
          batch_size: 5
        }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bulk-jobs'] });
      setPollingJobId(data.job_id);
      setUploadedFiles([]);
      toast.success(`Bulk job started! Processing ${data.total_items} items`);
    },
    onError: (error) => {
      toast.error('Failed to start job: ' + (error as Error).message);
    }
  });

  const cancelJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { data, error } = await supabase.functions.invoke('bulk-operations', {
        body: { action: 'cancel_job', job_id: jobId }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulk-jobs'] });
      setPollingJobId(null);
      toast.info('Job cancelled');
    }
  });

  const retryFailedMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { data, error } = await supabase.functions.invoke('bulk-operations', {
        body: { action: 'retry_failed', job_id: jobId }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bulk-jobs'] });
      setPollingJobId(data.retry_job_id);
      toast.success(`Retrying ${data.items_to_retry} failed items`);
    }
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleStartJob = () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please upload files first');
      return;
    }
    const items = uploadedFiles.map((file, index) => ({
      index,
      filename: file.name,
      size: file.size,
      type: file.type
    }));
    createJobMutation.mutate(items);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getOperationIcon = (type: string) => {
    const op = operationTypes.find(o => o.value === type);
    return op ? <op.icon className="h-4 w-4" /> : <Layers className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layers className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Bulk Operations</h2>
            <p className="text-muted-foreground">Process multiple items at scale</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['bulk-jobs'] })}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>New Bulk Job</CardTitle>
            <CardDescription>Upload files and start processing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Operation Type</label>
              <Select value={selectedOperation} onValueChange={setSelectedOperation}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {operationTypes.map(op => (
                    <SelectItem key={op.value} value={op.value}>
                      <div className="flex items-center gap-2">
                        <op.icon className="h-4 w-4" />
                        {op.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              {isDragActive ? (
                <p className="text-sm">Drop files here...</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Drag & drop files, or click to select
                </p>
              )}
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Files ({uploadedFiles.length})</span>
                  <Button variant="ghost" size="sm" onClick={() => setUploadedFiles([])}>
                    Clear
                  </Button>
                </div>
                <ScrollArea className="h-32">
                  {uploadedFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm py-1">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate flex-1">{file.name}</span>
                      <span className="text-muted-foreground">{(file.size / 1024).toFixed(1)}KB</span>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            )}

            <Button 
              className="w-full" 
              onClick={handleStartJob}
              disabled={uploadedFiles.length === 0 || createJobMutation.isPending}
            >
              {createJobMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Start Processing
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Active & Recent Jobs</CardTitle>
            <CardDescription>Monitor job progress and history</CardDescription>
          </CardHeader>
          <CardContent>
            {activeJobStatus && (
              <div className="mb-6 p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
                    <span className="font-medium">Processing...</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => cancelJobMutation.mutate(activeJobStatus.id)}
                  >
                    <Pause className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
                <Progress value={activeJobStatus.progress_percent || 0} className="mb-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{activeJobStatus.processed_items} / {activeJobStatus.total_items} items</span>
                  <span>{activeJobStatus.progress_percent || 0}%</span>
                </div>
              </div>
            )}

            <ScrollArea className="h-[400px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : jobs?.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Layers className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No jobs yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs?.map((job) => (
                    <div key={job.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getOperationIcon(job.operation_type)}
                          <span className="font-medium capitalize">
                            {job.operation_type.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(job.status)}
                          <Badge variant={job.status === 'completed' ? 'default' : 'secondary'}>
                            {job.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <Progress 
                        value={(job.processed_items / job.total_items) * 100} 
                        className="mb-2"
                      />
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          {job.processed_items}/{job.total_items} items
                          {job.failed_items > 0 && (
                            <span className="text-red-500 ml-2">
                              ({job.failed_items} failed)
                            </span>
                          )}
                        </span>
                        <div className="flex items-center gap-2">
                          <span>{new Date(job.created_at).toLocaleString()}</span>
                          {job.failed_items > 0 && job.status === 'completed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => retryFailedMutation.mutate(job.id)}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Retry Failed
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BulkOperationsManager;
