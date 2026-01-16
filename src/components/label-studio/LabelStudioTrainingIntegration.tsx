/**
 * Label Studio Training Integration Component
 * Connects Genie Studio features to Label Studio for model improvement
 * 
 * Supports:
 * - Person segmentation training (for background blur)
 * - Avatar training data
 * - Voice sample annotation
 * - Quality control workflows
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useLabelStudio, type LSProject } from '@/hooks/useLabelStudio';
import { useMasterToast } from '@/hooks/useMasterToast';
import { 
  Database, Upload, Sparkles, Users, Mic2, 
  Image, Video, BarChart3, RefreshCw, Loader2,
  Brain, Target, CheckCircle2, AlertCircle
} from 'lucide-react';

interface TrainingDataItem {
  id: string;
  type: 'segmentation' | 'avatar' | 'voice' | 'video';
  data: string; // base64 or URL
  metadata?: Record<string, any>;
  capturedAt: string;
}

interface LabelStudioTrainingIntegrationProps {
  onTrainingProgress?: (progress: number) => void;
  onModelUpdated?: () => void;
}

// Training types with Label Studio project templates
const TRAINING_TYPES = [
  {
    id: 'person_segmentation',
    name: 'Person Segmentation',
    description: 'Train background blur/removal models',
    icon: Users,
    projectTemplate: 'image-segmentation',
    labelConfig: `
      <View>
        <Image name="image" value="$image"/>
        <BrushLabels name="label" toName="image">
          <Label value="Person" background="#FF0000"/>
          <Label value="Background" background="#00FF00"/>
        </BrushLabels>
      </View>
    `,
  },
  {
    id: 'avatar_quality',
    name: 'Avatar Quality',
    description: 'Rate and improve avatar generation',
    icon: Sparkles,
    projectTemplate: 'image-classification',
    labelConfig: `
      <View>
        <Image name="image" value="$image"/>
        <Choices name="quality" toName="image">
          <Choice value="Excellent"/>
          <Choice value="Good"/>
          <Choice value="Acceptable"/>
          <Choice value="Poor"/>
        </Choices>
        <TextArea name="feedback" toName="image" placeholder="Additional feedback..."/>
      </View>
    `,
  },
  {
    id: 'voice_transcription',
    name: 'Voice Transcription',
    description: 'Improve speech recognition accuracy',
    icon: Mic2,
    projectTemplate: 'audio-transcription',
    labelConfig: `
      <View>
        <Audio name="audio" value="$audio"/>
        <TextArea name="transcription" toName="audio" 
                  placeholder="Transcribe the audio..." rows="4"/>
        <Choices name="quality" toName="audio">
          <Choice value="Clear"/>
          <Choice value="Background Noise"/>
          <Choice value="Multiple Speakers"/>
        </Choices>
      </View>
    `,
  },
  {
    id: 'video_quality',
    name: 'Video Quality',
    description: 'Rate generated video outputs',
    icon: Video,
    projectTemplate: 'video-classification',
    labelConfig: `
      <View>
        <Video name="video" value="$video"/>
        <Choices name="quality" toName="video">
          <Choice value="Production Ready"/>
          <Choice value="Needs Minor Edits"/>
          <Choice value="Needs Major Edits"/>
          <Choice value="Unusable"/>
        </Choices>
        <Rating name="rating" toName="video" maxRating="5"/>
      </View>
    `,
  },
];

export function LabelStudioTrainingIntegration({
  onTrainingProgress,
  onModelUpdated,
}: LabelStudioTrainingIntegrationProps) {
  const [selectedType, setSelectedType] = useState<string>('person_segmentation');
  const [pendingData, setPendingData] = useState<TrainingDataItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [autoCapture, setAutoCapture] = useState(false);
  const [captureInterval, setCaptureInterval] = useState(30);
  const [projects, setProjects] = useState<LSProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  
  const { loading, listProjects, bulkImportTasks, getProjectStats } = useLabelStudio();
  const { showSuccess, showError } = useMasterToast();

  // Load Label Studio projects
  const loadProjects = useCallback(async () => {
    try {
      const data = await listProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load LS projects:', error);
    }
  }, [listProjects]);

  // Add captured data to pending queue
  const addTrainingData = useCallback((item: TrainingDataItem) => {
    setPendingData(prev => [...prev, item]);
  }, []);

  // Upload pending data to Label Studio
  const uploadToLabelStudio = useCallback(async () => {
    if (!selectedProject || pendingData.length === 0) {
      showError('Select a project and add training data first');
      return;
    }

    setIsUploading(true);
    try {
      const tasks = pendingData.map(item => ({
        data: {
          [item.type === 'voice' ? 'audio' : item.type === 'video' ? 'video' : 'image']: item.data,
          metadata: item.metadata,
          capturedAt: item.capturedAt,
        },
      }));

      await bulkImportTasks(parseInt(selectedProject), tasks);
      
      showSuccess(`${pendingData.length} items uploaded to Label Studio`);
      setPendingData([]);
      onTrainingProgress?.(100);
    } catch (error) {
      console.error('Upload error:', error);
      showError('Failed to upload training data');
    } finally {
      setIsUploading(false);
    }
  }, [selectedProject, pendingData, bulkImportTasks, showSuccess, showError, onTrainingProgress]);

  // Capture current frame/audio for training
  const captureFrame = useCallback(() => {
    // This would be called from the recording studio
    const type = TRAINING_TYPES.find(t => t.id === selectedType);
    if (!type) return;

    const newItem: TrainingDataItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: selectedType.includes('voice') ? 'voice' : 
            selectedType.includes('video') ? 'video' : 'segmentation',
      data: '', // Would be populated with actual captured data
      metadata: { trainingType: selectedType },
      capturedAt: new Date().toISOString(),
    };

    addTrainingData(newItem);
  }, [selectedType, addTrainingData]);

  const selectedTypeConfig = TRAINING_TYPES.find(t => t.id === selectedType);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Label Studio Training Integration
        </CardTitle>
        <CardDescription>
          Capture and annotate data to improve AI models
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Training Type Selection */}
        <Tabs value={selectedType} onValueChange={setSelectedType}>
          <TabsList className="grid w-full grid-cols-4">
            {TRAINING_TYPES.map(type => (
              <TabsTrigger key={type.id} value={type.id} className="text-xs gap-1">
                <type.icon className="w-3 h-3" />
                <span className="hidden sm:inline">{type.name.split(' ')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {TRAINING_TYPES.map(type => (
            <TabsContent key={type.id} value={type.id} className="space-y-4 mt-4">
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <type.icon className="w-8 h-8 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">{type.name}</h4>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Project Selection */}
        <div className="space-y-2">
          <Label className="text-sm">Target Label Studio Project</Label>
          <div className="flex gap-2">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select project for training data" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.title || `Project ${project.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={loadProjects} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Auto-Capture Settings */}
        <div className="space-y-3 p-3 border rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <Label className="text-sm">Auto-Capture During Recording</Label>
            </div>
            <Switch checked={autoCapture} onCheckedChange={setAutoCapture} />
          </div>
          
          {autoCapture && (
            <div className="flex items-center gap-2 pl-6">
              <Label className="text-xs text-muted-foreground">Every</Label>
              <Input
                type="number"
                value={captureInterval}
                onChange={(e) => setCaptureInterval(parseInt(e.target.value) || 30)}
                className="w-20 h-8"
                min={5}
                max={300}
              />
              <Label className="text-xs text-muted-foreground">seconds</Label>
            </div>
          )}
        </div>

        {/* Pending Data Queue */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Pending Training Data</Label>
            <Badge variant={pendingData.length > 0 ? 'default' : 'secondary'}>
              {pendingData.length} items
            </Badge>
          </div>
          
          {pendingData.length > 0 ? (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {pendingData.slice(-5).map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-muted rounded text-xs">
                  <div className="flex items-center gap-2">
                    {item.type === 'segmentation' && <Image className="w-3 h-3" />}
                    {item.type === 'voice' && <Mic2 className="w-3 h-3" />}
                    {item.type === 'video' && <Video className="w-3 h-3" />}
                    <span>{item.type}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {new Date(item.capturedAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
              No pending training data. Capture frames during recording.
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={uploadToLabelStudio}
            disabled={isUploading || pendingData.length === 0 || !selectedProject}
            className="flex-1"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload to Label Studio ({pendingData.length})
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setPendingData([])}
            disabled={pendingData.length === 0}
          >
            Clear
          </Button>
        </div>

        {/* Training Status */}
        {selectedProject && (
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Training Status</span>
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                Connected
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Database className="w-3 h-3" />
              <span>Project: {projects.find(p => p.id.toString() === selectedProject)?.title}</span>
            </div>
          </div>
        )}

        {/* Help Text */}
        <p className="text-xs text-muted-foreground text-center">
          Captured data is sent to Label Studio for human annotation, then used to improve AI models.
        </p>
      </CardContent>
    </Card>
  );
}

// Export helper hook for components to capture training data
export function useTrainingDataCapture() {
  const [pendingItems, setPendingItems] = useState<TrainingDataItem[]>([]);

  const captureSegmentation = useCallback((imageData: string, metadata?: Record<string, any>) => {
    const item: TrainingDataItem = {
      id: `seg-${Date.now()}`,
      type: 'segmentation',
      data: imageData,
      metadata,
      capturedAt: new Date().toISOString(),
    };
    setPendingItems(prev => [...prev, item]);
    return item.id;
  }, []);

  const captureVoice = useCallback((audioData: string, metadata?: Record<string, any>) => {
    const item: TrainingDataItem = {
      id: `voice-${Date.now()}`,
      type: 'voice',
      data: audioData,
      metadata,
      capturedAt: new Date().toISOString(),
    };
    setPendingItems(prev => [...prev, item]);
    return item.id;
  }, []);

  const captureVideo = useCallback((videoData: string, metadata?: Record<string, any>) => {
    const item: TrainingDataItem = {
      id: `video-${Date.now()}`,
      type: 'video',
      data: videoData,
      metadata,
      capturedAt: new Date().toISOString(),
    };
    setPendingItems(prev => [...prev, item]);
    return item.id;
  }, []);

  const clearPending = useCallback(() => {
    setPendingItems([]);
  }, []);

  return {
    pendingItems,
    captureSegmentation,
    captureVoice,
    captureVideo,
    clearPending,
  };
}
