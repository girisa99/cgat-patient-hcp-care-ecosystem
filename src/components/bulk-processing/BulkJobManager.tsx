/**
 * Bulk Job Manager - Desktop Full UI
 * Connected to bulk_jobs database table
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileSpreadsheet, Play, Pause, Trash2, 
  CheckCircle, AlertCircle, Clock, Loader2,
  Download, RefreshCw, Video, FileText, Image, LayoutGrid
} from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';
import { useBulkJobs } from '@/hooks/useBulkJobs';

const BulkJobManager: React.FC = () => {
  const { showSuccess, showError } = useMasterToast();
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
  const [isCreating, setIsCreating] = useState(false);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        showSuccess(`CSV loaded: ${file.name}`);
      } else {
        showError('Please upload a CSV file');
      }
    }
  };

  const handleCreateJob = async () => {
    if (!selectedFile) {
      showError('Please upload a CSV file first');
      return;
    }
    
    setIsCreating(true);
    try {
      await createJob({
        operation_type: 'video_generation',
        items: [], // Would parse CSV here
        options: { name: selectedFile.name.replace('.csv', '') }
      });
      setSelectedFile(null);
      showSuccess('Bulk job created and queued');
    } catch (error) {
      showError('Failed to create job');
    } finally {
      setIsCreating(false);
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
            <FileSpreadsheet className="h-5 w-5" />
            Create Bulk Job
          </CardTitle>
          <CardDescription>Upload a CSV with video data to generate multiple videos at once</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">CSV File</label>
              <div className="flex gap-2">
                <Input type="file" accept=".csv" onChange={handleFileUpload} className="flex-1" />
                {selectedFile && <Badge variant="secondary" className="px-3">{selectedFile.name}</Badge>}
              </div>
            </div>
            <Button onClick={handleCreateJob} disabled={!selectedFile || isCreating} className="gap-2">
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Start Batch
            </Button>
          </div>
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
