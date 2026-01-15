/**
 * Bulk Job Manager - Desktop Full UI
 * Manages bulk video generation, batch exports, and queue operations
 * Part of P3 Bulk Processing (Category Y)
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
  Upload, FileSpreadsheet, Play, Pause, Trash2, 
  CheckCircle, AlertCircle, Clock, Loader2,
  Download, RefreshCw, Settings, ChevronRight,
  Video, FileText, Image, LayoutGrid
} from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';

interface BulkJob {
  id: string;
  name: string;
  type: 'video_generation' | 'audio_processing' | 'image_resize' | 'content_publish';
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'paused';
  totalItems: number;
  completedItems: number;
  failedItems: number;
  createdAt: string;
  estimatedCompletion?: string;
}

const mockJobs: BulkJob[] = [
  {
    id: '1',
    name: 'Q1 Product Videos',
    type: 'video_generation',
    status: 'processing',
    totalItems: 50,
    completedItems: 23,
    failedItems: 2,
    createdAt: '2026-01-15T10:00:00Z',
    estimatedCompletion: '2026-01-15T14:30:00Z'
  },
  {
    id: '2',
    name: 'Training Module Batch',
    type: 'video_generation',
    status: 'queued',
    totalItems: 25,
    completedItems: 0,
    failedItems: 0,
    createdAt: '2026-01-15T11:00:00Z'
  },
  {
    id: '3',
    name: 'Social Media Cuts',
    type: 'content_publish',
    status: 'completed',
    totalItems: 100,
    completedItems: 98,
    failedItems: 2,
    createdAt: '2026-01-14T09:00:00Z'
  }
];

const BulkJobManager: React.FC = () => {
  const { showSuccess, showError } = useMasterToast();
  const [jobs, setJobs] = useState<BulkJob[]>(mockJobs);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const getStatusColor = (status: BulkJob['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'queued': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: BulkJob['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      case 'queued': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: BulkJob['type']) => {
    switch (type) {
      case 'video_generation': return <Video className="h-4 w-4" />;
      case 'audio_processing': return <FileText className="h-4 w-4" />;
      case 'image_resize': return <Image className="h-4 w-4" />;
      case 'content_publish': return <Upload className="h-4 w-4" />;
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
    // Simulate job creation
    setTimeout(() => {
      const newJob: BulkJob = {
        id: String(jobs.length + 1),
        name: selectedFile.name.replace('.csv', ''),
        type: 'video_generation',
        status: 'queued',
        totalItems: Math.floor(Math.random() * 50) + 10,
        completedItems: 0,
        failedItems: 0,
        createdAt: new Date().toISOString()
      };
      setJobs([newJob, ...jobs]);
      setSelectedFile(null);
      setIsCreating(false);
      showSuccess('Bulk job created and queued');
    }, 1500);
  };

  const handlePauseResume = (jobId: string) => {
    setJobs(jobs.map(job => {
      if (job.id === jobId) {
        return {
          ...job,
          status: job.status === 'paused' ? 'processing' : 'paused'
        };
      }
      return job;
    }));
  };

  const handleCancel = (jobId: string) => {
    setJobs(jobs.filter(job => job.id !== jobId));
    showSuccess('Job cancelled');
  };

  const activeJobs = jobs.filter(j => j.status === 'processing' || j.status === 'queued');
  const completedJobs = jobs.filter(j => j.status === 'completed' || j.status === 'failed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Bulk Processing</h2>
          <p className="text-sm text-muted-foreground">
            Manage batch video generation and content processing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {activeJobs.length} Active Jobs
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Create New Job */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Create Bulk Job
          </CardTitle>
          <CardDescription>
            Upload a CSV with video data to generate multiple videos at once
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">CSV File</label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="flex-1"
                />
                {selectedFile && (
                  <Badge variant="secondary" className="px-3">
                    {selectedFile.name}
                  </Badge>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Template</label>
              <select className="h-10 px-3 border rounded-md bg-background">
                <option>Product Demo Template</option>
                <option>Training Video Template</option>
                <option>Social Media Template</option>
                <option>Custom Template...</option>
              </select>
            </div>
            <Button 
              onClick={handleCreateJob}
              disabled={!selectedFile || isCreating}
              className="gap-2"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Start Batch
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            CSV should include columns: title, script, duration, aspect_ratio, voice_id
          </p>
        </CardContent>
      </Card>

      {/* Job Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active" className="gap-2">
            <Loader2 className="h-4 w-4" />
            Active ({activeJobs.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed ({completedJobs.length})
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
                    <p className="text-sm">Create a new bulk job to get started</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {activeJobs.map((job) => (
                      <div key={job.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              {getTypeIcon(job.type)}
                            </div>
                            <div>
                              <h4 className="font-medium">{job.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                Created {new Date(job.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(job.status)}>
                              {getStatusIcon(job.status)}
                              <span className="ml-1 capitalize">{job.status}</span>
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handlePauseResume(job.id)}
                            >
                              {job.status === 'paused' ? (
                                <Play className="h-4 w-4" />
                              ) : (
                                <Pause className="h-4 w-4" />
                              )}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleCancel(job.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{job.completedItems} / {job.totalItems} items</span>
                            <span>{Math.round((job.completedItems / job.totalItems) * 100)}%</span>
                          </div>
                          <Progress 
                            value={(job.completedItems / job.totalItems) * 100} 
                            className="h-2"
                          />
                          {job.failedItems > 0 && (
                            <p className="text-xs text-destructive">
                              {job.failedItems} items failed
                            </p>
                          )}
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
                            <div className="p-2 rounded-lg bg-muted">
                              {getTypeIcon(job.type)}
                            </div>
                            <div>
                              <h4 className="font-medium">{job.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {job.completedItems} / {job.totalItems} completed
                                {job.failedItems > 0 && ` • ${job.failedItems} failed`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(job.status)}>
                              {getStatusIcon(job.status)}
                              <span className="ml-1 capitalize">{job.status}</span>
                            </Badge>
                            <Button variant="outline" size="sm" className="gap-2">
                              <Download className="h-4 w-4" />
                              Download All
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
