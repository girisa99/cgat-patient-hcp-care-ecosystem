/**
 * Unified Input Step - Step 0
 * 
 * Universal Input Gateway integration for all input types:
 * Text, Document, Image, Video, Audio, URL, Screen Recording
 * 
 * Uses StandardizedInput for ecosystem-wide compatibility
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Type, Upload, Link, Video, Mic, Monitor, FileText,
  Loader2, Check, X, Sparkles, AlertCircle, Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getGateway } from '@/services/universal-input-gateway/UniversalInputGateway';
import type { StandardizedInput, InputType, ProcessingStatus } from '@/services/universal-input-gateway/types';

// ==========================================
// TYPES
// ==========================================

export interface UnifiedInputStepProps {
  value: UnifiedInputState;
  onChange: (value: UnifiedInputState) => void;
  isMobile?: boolean;
  onAnalysisComplete?: (input: StandardizedInput) => void;
}

export interface UnifiedInputState {
  type: InputType | null;
  content: StandardizedInput | null;
  rawText?: string;
  rawUrl?: string;
  rawFile?: File;
  status: ProcessingStatus;
  error?: string;
}

// ==========================================
// INPUT TYPE CARDS
// ==========================================

const INPUT_TYPES = [
  { 
    id: 'text' as InputType, 
    label: 'Text', 
    icon: Type, 
    description: 'Paste or type content',
    mobileSupported: true,
    offlineSupported: true 
  },
  { 
    id: 'document' as InputType, 
    label: 'Document', 
    icon: FileText, 
    description: 'PDF, DOCX, PPTX',
    mobileSupported: true,
    offlineSupported: false 
  },
  { 
    id: 'image' as InputType, 
    label: 'Image', 
    icon: ImageIcon, 
    description: 'Analyze image content',
    mobileSupported: true,
    offlineSupported: false 
  },
  { 
    id: 'video' as InputType, 
    label: 'Video', 
    icon: Video, 
    description: 'Extract from video',
    mobileSupported: true,
    offlineSupported: false 
  },
  { 
    id: 'audio' as InputType, 
    label: 'Audio', 
    icon: Mic, 
    description: 'Transcribe audio',
    mobileSupported: true,
    offlineSupported: false 
  },
  { 
    id: 'url' as InputType, 
    label: 'URL', 
    icon: Link, 
    description: 'Import from web',
    mobileSupported: true,
    offlineSupported: false 
  },
  { 
    id: 'screen' as InputType, 
    label: 'Screen', 
    icon: Monitor, 
    description: 'Record screen',
    mobileSupported: false,
    offlineSupported: false 
  },
];

// ==========================================
// COMPONENT
// ==========================================

export const UnifiedInputStep: React.FC<UnifiedInputStepProps> = ({
  value,
  onChange,
  isMobile = false,
  onAnalysisComplete
}) => {
  const [activeTab, setActiveTab] = useState<InputType | 'select'>('select');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const gateway = getGateway();

  // Filter input types for mobile
  const visibleInputTypes = isMobile 
    ? INPUT_TYPES.filter(t => t.mobileSupported)
    : INPUT_TYPES;

  // Process input through gateway
  const processInput = useCallback(async (
    source: File | Blob | string | MediaStream,
    type: InputType
  ) => {
    setIsProcessing(true);
    setProgress(0);
    onChange({ ...value, status: 'processing', type });

    try {
      const result = await gateway.process(source, {
        mode: 'auto',
        quality: 'balanced',
        onProgress: (p, status) => setProgress(p)
      });

      if (result.success && result.input) {
        onChange({
          type,
          content: result.input,
          status: 'complete',
          rawText: result.input.content.text,
        });
        onAnalysisComplete?.(result.input);
        toast.success('Content processed successfully');
      } else {
        onChange({
          ...value,
          type,
          status: 'error',
          error: result.error?.message || 'Processing failed'
        });
        toast.error(result.error?.message || 'Processing failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      onChange({ ...value, type, status: 'error', error: message });
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  }, [gateway, onChange, onAnalysisComplete, value]);

  // Handle text input
  const handleTextChange = (text: string) => {
    onChange({ ...value, rawText: text, type: 'text' });
  };

  const handleTextSubmit = () => {
    if (value.rawText && value.rawText.trim().length > 0) {
      processInput(value.rawText, 'text');
    }
  };

  // Handle URL input
  const handleUrlChange = (url: string) => {
    onChange({ ...value, rawUrl: url, type: 'url' });
  };

  const handleUrlSubmit = () => {
    if (value.rawUrl && value.rawUrl.trim().length > 0) {
      processInput(value.rawUrl, 'url');
    }
  };

  // Handle file upload
  const handleFileUpload = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      onChange({ ...value, rawFile: file });
      processInput(file, gateway.detectType(file));
    }
  };

  // Render input type selector
  const renderTypeSelector = () => (
    <div className={cn(
      "grid gap-3",
      isMobile ? "grid-cols-2" : "grid-cols-4"
    )}>
      {visibleInputTypes.map((type) => (
        <Card
          key={type.id}
          className={cn(
            "cursor-pointer transition-all hover:border-primary/50",
            activeTab === type.id && "border-primary bg-primary/5"
          )}
          onClick={() => setActiveTab(type.id)}
        >
          <CardContent className="p-4 text-center">
            <type.icon className={cn(
              "h-8 w-8 mx-auto mb-2",
              activeTab === type.id ? "text-primary" : "text-muted-foreground"
            )} />
            <p className="font-medium text-sm">{type.label}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {type.description}
            </p>
            {!type.offlineSupported && (
              <Badge variant="outline" className="mt-2 text-[9px]">
                Online
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Render text input
  const renderTextInput = () => (
    <div className="space-y-4">
      <Textarea
        placeholder="Paste or type your content here... (minimum 50 characters for analysis)"
        value={value.rawText || ''}
        onChange={(e) => handleTextChange(e.target.value)}
        className="min-h-[200px] resize-none"
        disabled={isProcessing}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {value.rawText?.length || 0} characters
        </span>
        <Button
          onClick={handleTextSubmit}
          disabled={!value.rawText || value.rawText.length < 50 || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Analyze Content
            </>
          )}
        </Button>
      </div>
    </div>
  );

  // Render URL input
  const renderUrlInput = () => (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="https://example.com/article"
          value={value.rawUrl || ''}
          onChange={(e) => handleUrlChange(e.target.value)}
          disabled={isProcessing}
          className="flex-1"
        />
        <Button
          onClick={handleUrlSubmit}
          disabled={!value.rawUrl || isProcessing}
        >
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link className="h-4 w-4" />}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        We'll extract and analyze the content from this URL
      </p>
    </div>
  );

  // Render file upload
  const renderFileUpload = (acceptTypes: string) => (
    <div className="space-y-4">
      <div 
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer",
          "hover:border-primary/50 transition-colors",
          isProcessing && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !isProcessing && document.getElementById('file-upload')?.click()}
      >
        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {acceptTypes}
        </p>
      </div>
      <input
        id="file-upload"
        type="file"
        accept={acceptTypes}
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files)}
        disabled={isProcessing}
      />
      {value.rawFile && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded">
          <FileText className="h-4 w-4" />
          <span className="text-sm flex-1 truncate">{value.rawFile.name}</span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onChange({ ...value, rawFile: undefined })}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );

  // Render processing status
  const renderProcessingStatus = () => (
    <div className="space-y-4 py-8">
      <div className="flex justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
      <Progress value={progress} className="w-full" />
      <p className="text-center text-sm text-muted-foreground">
        Processing your content... {progress}%
      </p>
    </div>
  );

  // Render success state with suggestions
  const renderSuccessState = () => {
    if (!value.content) return null;

    const analysis = value.content.analysis;
    const compatibility = value.content.compatibility;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <Check className="h-5 w-5 text-green-500" />
          <span className="text-sm font-medium text-green-700 dark:text-green-400">
            Content analyzed successfully
          </span>
        </div>

        {/* Content Preview */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Content Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[100px]">
              <p className="text-sm text-muted-foreground">
                {value.content.content.text?.substring(0, 500)}...
              </p>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Analysis Summary */}
        {analysis && (
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {analysis.language.name} ({Math.round(analysis.language.confidence * 100)}%)
                </Badge>
                <Badge variant="secondary">
                  {analysis.contentType.primary}
                </Badge>
                <Badge variant="outline">
                  {analysis.wordCount} words
                </Badge>
                <Badge variant="outline">
                  ~{analysis.readingTime} min read
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {analysis.keywords.slice(0, 5).map((kw) => (
                  <Badge key={kw} variant="outline" className="text-xs">
                    {kw}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Auto-Suggestions */}
        {compatibility && compatibility.industries.length > 0 && (
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Suggested Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-20">Industry:</span>
                <div className="flex gap-1">
                  {compatibility.industries.slice(0, 3).map((ind) => (
                    <Badge key={ind.id} variant="default" className="text-xs">
                      {ind.name} ({Math.round(ind.confidence * 100)}%)
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-20">Frameworks:</span>
                <div className="flex gap-1">
                  {compatibility.frameworks.slice(0, 3).map((fw) => (
                    <Badge key={fw.id} variant="secondary" className="text-xs">
                      {fw.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => {
            onChange({ type: null, content: null, status: 'idle' });
            setActiveTab('select');
          }}
        >
          Use Different Input
        </Button>
      </div>
    );
  };

  // Render error state
  const renderErrorState = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <span className="text-sm font-medium text-destructive">
          {value.error || 'Processing failed'}
        </span>
      </div>
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => onChange({ ...value, status: 'idle', error: undefined })}
      >
        Try Again
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Status-based rendering */}
      {value.status === 'processing' && renderProcessingStatus()}
      {value.status === 'complete' && renderSuccessState()}
      {value.status === 'error' && renderErrorState()}
      
      {/* Input selection */}
      {value.status === 'idle' && (
        <>
          {activeTab === 'select' ? (
            renderTypeSelector()
          ) : (
            <div className="space-y-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setActiveTab('select')}
              >
                ← Back to input types
              </Button>
              
              {activeTab === 'text' && renderTextInput()}
              {activeTab === 'url' && renderUrlInput()}
              {activeTab === 'document' && renderFileUpload('.pdf,.docx,.pptx,.xlsx')}
              {activeTab === 'image' && renderFileUpload('.jpg,.jpeg,.png,.webp,.gif')}
              {activeTab === 'video' && renderFileUpload('.mp4,.webm,.mov')}
              {activeTab === 'audio' && renderFileUpload('.mp3,.wav,.m4a,.ogg')}
              {activeTab === 'screen' && (
                <div className="text-center py-8 text-muted-foreground">
                  Screen recording coming soon...
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UnifiedInputStep;
