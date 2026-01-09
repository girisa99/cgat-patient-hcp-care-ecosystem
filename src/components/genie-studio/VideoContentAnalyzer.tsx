/**
 * Video Content Analyzer - Smart Detection with User Confirmation
 * Analyzes uploaded video to detect content type and offers appropriate script options
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Video, 
  Presentation, 
  ShoppingBag, 
  Globe, 
  GraduationCap,
  Mic,
  Film,
  Users,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
  Play,
  FileText,
  Layers,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export type DetectedContentType = 
  | 'presentation'
  | 'product_demo'
  | 'website_walkthrough'
  | 'tutorial'
  | 'interview'
  | 'webinar'
  | 'marketing'
  | 'general';

export interface VideoAnalysisResult {
  detectedType: DetectedContentType;
  confidence: number;
  alternativeTypes: { type: DetectedContentType; confidence: number }[];
  hasSlides: boolean;
  hasSpeaker: boolean;
  hasScreenRecording: boolean;
  estimatedDuration: number;
  keyTopics: string[];
  suggestedScriptFormats: string[];
}

interface ScriptFormatOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  availableFor: DetectedContentType[];
}

const CONTENT_TYPE_INFO: Record<DetectedContentType, {
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}> = {
  presentation: {
    label: 'Presentation Recording',
    description: 'Slides with speaker narration',
    icon: <Presentation className="h-5 w-5" />,
    color: 'text-blue-500',
  },
  product_demo: {
    label: 'Product Demo',
    description: 'Software or product demonstration',
    icon: <ShoppingBag className="h-5 w-5" />,
    color: 'text-purple-500',
  },
  website_walkthrough: {
    label: 'Website Walkthrough',
    description: 'Website or app navigation guide',
    icon: <Globe className="h-5 w-5" />,
    color: 'text-green-500',
  },
  tutorial: {
    label: 'Tutorial / How-To',
    description: 'Step-by-step instructional content',
    icon: <GraduationCap className="h-5 w-5" />,
    color: 'text-orange-500',
  },
  interview: {
    label: 'Interview / Conversation',
    description: 'Multi-person discussion or interview',
    icon: <Users className="h-5 w-5" />,
    color: 'text-pink-500',
  },
  webinar: {
    label: 'Webinar / Live Session',
    description: 'Online seminar or live presentation',
    icon: <Video className="h-5 w-5" />,
    color: 'text-red-500',
  },
  marketing: {
    label: 'Marketing / Promo Video',
    description: 'Promotional or advertising content',
    icon: <Sparkles className="h-5 w-5" />,
    color: 'text-amber-500',
  },
  general: {
    label: 'General Video',
    description: 'Mixed or unclassified content',
    icon: <Film className="h-5 w-5" />,
    color: 'text-gray-500',
  },
};

const SCRIPT_FORMAT_OPTIONS: ScriptFormatOption[] = [
  {
    id: 'slide_by_slide',
    label: 'Slide-by-Slide Voiceover',
    description: 'Individual scripts for each slide with timing',
    icon: <Layers className="h-4 w-4" />,
    availableFor: ['presentation', 'webinar'],
  },
  {
    id: 'full_script',
    label: 'Full Narration Script',
    description: 'Complete script for the entire video',
    icon: <FileText className="h-4 w-4" />,
    availableFor: ['presentation', 'product_demo', 'website_walkthrough', 'tutorial', 'interview', 'webinar', 'marketing', 'general'],
  },
  {
    id: 'chapter_based',
    label: 'Chapter-Based Script',
    description: 'Script organized by detected chapters/sections',
    icon: <Film className="h-4 w-4" />,
    availableFor: ['tutorial', 'product_demo', 'website_walkthrough', 'webinar'],
  },
  {
    id: 'podcast_style',
    label: 'Podcast-Style Script',
    description: 'Conversational format for audio repurposing',
    icon: <Mic className="h-4 w-4" />,
    availableFor: ['interview', 'webinar', 'tutorial', 'general'],
  },
  {
    id: 'marketing_copy',
    label: 'Marketing Copy',
    description: 'Promotional script with key selling points',
    icon: <Sparkles className="h-4 w-4" />,
    availableFor: ['product_demo', 'marketing', 'website_walkthrough'],
  },
];

interface VideoContentAnalyzerProps {
  videoFile: File;
  videoPreviewUrl?: string;
  onAnalysisComplete: (result: VideoAnalysisResult, selectedFormat: string, options: VideoScriptOptions) => void;
  onCancel: () => void;
  className?: string;
}

export interface VideoScriptOptions {
  generateSlideBySlide: boolean;
  includeTimestamps: boolean;
  enhanceWithAI: boolean;
  removeFillerWords: boolean;
  generateTTS: boolean;
}

export function VideoContentAnalyzer({
  videoFile,
  videoPreviewUrl,
  onAnalysisComplete,
  onCancel,
  className,
}: VideoContentAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResult | null>(null);
  const [confirmedType, setConfirmedType] = useState<DetectedContentType | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>('full_script');
  const [options, setOptions] = useState<VideoScriptOptions>({
    generateSlideBySlide: false,
    includeTimestamps: true,
    enhanceWithAI: true,
    removeFillerWords: true,
    generateTTS: false,
  });
  const [error, setError] = useState<string | null>(null);

  // Analyze video on mount
  useEffect(() => {
    analyzeVideo();
  }, [videoFile]);

  const analyzeVideo = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setError(null);

    try {
      // Simulate progress while analyzing
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      // Extract a frame from the video for AI analysis
      const frameBase64 = await extractVideoFrame(videoFile);
      
      // Call AI to analyze the video content
      const { data, error: aiError } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: 'gemini',
          model: 'gemini-2.0-flash-exp',
          prompt: `Analyze this video frame and determine what type of content this video contains.

Based on visual cues, classify this video into ONE of these categories:
- presentation: Slides with speaker narration (PowerPoint, Google Slides, etc.)
- product_demo: Software or product demonstration
- website_walkthrough: Website or app navigation/tour
- tutorial: Step-by-step instructional/educational content
- interview: Multi-person discussion or interview
- webinar: Online seminar or live presentation
- marketing: Promotional or advertising content
- general: Mixed or unclassified content

Also detect:
- hasSlides: Are there presentation slides visible?
- hasSpeaker: Is there a visible speaker/presenter?
- hasScreenRecording: Is this a screen recording?
- keyTopics: What are 3-5 key topics/subjects visible?

Return ONLY valid JSON:
{
  "detectedType": "presentation",
  "confidence": 0.85,
  "alternativeTypes": [
    {"type": "webinar", "confidence": 0.60},
    {"type": "tutorial", "confidence": 0.45}
  ],
  "hasSlides": true,
  "hasSpeaker": false,
  "hasScreenRecording": true,
  "keyTopics": ["topic1", "topic2"],
  "suggestedScriptFormats": ["slide_by_slide", "full_script"]
}`,
          systemPrompt: 'You are a video content classifier. Analyze visual cues to determine video type. Return valid JSON only.',
          imageBase64: frameBase64,
          action: 'analyze_video',
        },
      });

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      if (aiError) throw new Error(aiError.message);

      // Parse the AI response
      const jsonMatch = data.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse analysis result');
      }

      const result = JSON.parse(jsonMatch[0]) as VideoAnalysisResult;
      result.estimatedDuration = Math.ceil(videoFile.size / 1000000 * 60); // Rough estimate
      
      setAnalysisResult(result);
      setConfirmedType(result.detectedType);
      
      // Auto-select format based on detection
      if (result.hasSlides && result.detectedType === 'presentation') {
        setSelectedFormat('slide_by_slide');
        setOptions(prev => ({ ...prev, generateSlideBySlide: true }));
      }
    } catch (err) {
      console.error('Video analysis error:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
      // Fallback to general type
      setAnalysisResult({
        detectedType: 'general',
        confidence: 0.5,
        alternativeTypes: [],
        hasSlides: false,
        hasSpeaker: true,
        hasScreenRecording: false,
        estimatedDuration: 0,
        keyTopics: [],
        suggestedScriptFormats: ['full_script'],
      });
      setConfirmedType('general');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Extract a frame from video for analysis
  const extractVideoFrame = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      
      video.onloadeddata = () => {
        video.currentTime = Math.min(2, video.duration * 0.1); // Get frame at 10% or 2s
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
        URL.revokeObjectURL(video.src);
      };

      video.onerror = () => {
        reject(new Error('Failed to load video'));
        URL.revokeObjectURL(video.src);
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const handleConfirm = () => {
    if (!analysisResult || !confirmedType) return;
    
    const updatedResult = {
      ...analysisResult,
      detectedType: confirmedType,
    };
    
    onAnalysisComplete(updatedResult, selectedFormat, options);
  };

  const availableFormats = SCRIPT_FORMAT_OPTIONS.filter(
    format => confirmedType && format.availableFor.includes(confirmedType)
  );

  // Update options when format changes
  useEffect(() => {
    if (selectedFormat === 'slide_by_slide') {
      setOptions(prev => ({ ...prev, generateSlideBySlide: true }));
    } else {
      setOptions(prev => ({ ...prev, generateSlideBySlide: false }));
    }
  }, [selectedFormat]);

  return (
    <Card className={cn("border-primary/20", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Video className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Smart Video Analysis</CardTitle>
            <CardDescription>
              {isAnalyzing ? 'Analyzing video content...' : 'Confirm detected content type and script options'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Video Preview */}
        {videoPreviewUrl && (
          <div className="relative aspect-video rounded-lg overflow-hidden bg-black/10">
            <video
              src={videoPreviewUrl}
              className="w-full h-full object-contain"
              controls={!isAnalyzing}
              muted
            />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="text-center text-white">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Analyzing content...</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analysis Progress */}
        {isAnalyzing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Detecting video content type...</span>
              <span>{analysisProgress}%</span>
            </div>
            <Progress value={analysisProgress} className="h-2" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
            <Button variant="ghost" size="sm" onClick={analyzeVideo} className="ml-auto">
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </div>
        )}

        {/* Analysis Results */}
        {!isAnalyzing && analysisResult && (
          <>
            {/* Detected Type Confirmation */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Detected Content Type</Label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(CONTENT_TYPE_INFO).map(([type, info]) => (
                  <button
                    key={type}
                    onClick={() => setConfirmedType(type as DetectedContentType)}
                    className={cn(
                      "p-3 rounded-lg border text-left transition-all",
                      confirmedType === type
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50",
                      type === analysisResult.detectedType && confirmedType !== type
                        ? "border-primary/30"
                        : ""
                    )}
                  >
                    <div className={cn("mb-1", info.color)}>{info.icon}</div>
                    <p className="text-xs font-medium truncate">{info.label}</p>
                    {type === analysisResult.detectedType && (
                      <Badge variant="secondary" className="text-[9px] mt-1">
                        {Math.round(analysisResult.confidence * 100)}% match
                      </Badge>
                    )}
                  </button>
                ))}
              </div>

              {/* Detection Details */}
              <div className="flex flex-wrap gap-2 text-xs">
                {analysisResult.hasSlides && (
                  <Badge variant="outline" className="gap-1">
                    <Presentation className="h-3 w-3" />
                    Slides Detected
                  </Badge>
                )}
                {analysisResult.hasSpeaker && (
                  <Badge variant="outline" className="gap-1">
                    <Users className="h-3 w-3" />
                    Speaker Visible
                  </Badge>
                )}
                {analysisResult.hasScreenRecording && (
                  <Badge variant="outline" className="gap-1">
                    <Globe className="h-3 w-3" />
                    Screen Recording
                  </Badge>
                )}
              </div>
            </div>

            {/* Script Format Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Script Format</Label>
              <RadioGroup value={selectedFormat} onValueChange={setSelectedFormat}>
                <div className="grid gap-2">
                  {availableFormats.map((format) => (
                    <div
                      key={format.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                        selectedFormat === format.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => setSelectedFormat(format.id)}
                    >
                      <RadioGroupItem value={format.id} id={format.id} />
                      <div className="p-2 rounded-md bg-secondary">
                        {format.icon}
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={format.id} className="font-medium cursor-pointer">
                          {format.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">{format.description}</p>
                      </div>
                      {analysisResult.suggestedScriptFormats.includes(format.id) && (
                        <Badge variant="secondary" className="text-[9px]">Recommended</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Additional Options */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Processing Options</Label>
              <div className="grid gap-2">
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer">
                  <Checkbox
                    checked={options.includeTimestamps}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, includeTimestamps: !!checked }))
                    }
                  />
                  <span className="text-sm">Include timestamps</span>
                </label>
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer">
                  <Checkbox
                    checked={options.enhanceWithAI}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, enhanceWithAI: !!checked }))
                    }
                  />
                  <span className="text-sm">Enhance script with AI</span>
                </label>
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer">
                  <Checkbox
                    checked={options.removeFillerWords}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, removeFillerWords: !!checked }))
                    }
                  />
                  <span className="text-sm">Remove filler words (um, uh, like)</span>
                </label>
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer">
                  <Checkbox
                    checked={options.generateTTS}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, generateTTS: !!checked }))
                    }
                  />
                  <span className="text-sm">Generate TTS voiceover after script</span>
                </label>
              </div>
            </div>

            {/* Key Topics */}
            {analysisResult.keyTopics.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Detected Topics</Label>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.keyTopics.map((topic, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleConfirm} className="flex-1 gap-2">
                <CheckCircle className="h-4 w-4" />
                Generate Script
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
