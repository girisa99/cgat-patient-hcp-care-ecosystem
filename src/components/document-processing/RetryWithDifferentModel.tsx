/**
 * Retry with Different Model Component
 * Improvement 7: User-triggered model fallback/retry
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter, DialogTrigger 
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  RefreshCw, Zap, Brain, AlertTriangle, 
  CheckCircle, Clock, DollarSign, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ModelOption {
  id: 'claude' | 'gemini' | 'openai';
  name: string;
  description: string;
  strengths: string[];
  avgTime: string;
  costPerDoc: string;
  color: string;
}

const MODEL_OPTIONS: ModelOption[] = [
  {
    id: 'claude',
    name: 'Claude (Anthropic)',
    description: 'Best for medical terminology and clinical reasoning',
    strengths: ['Medical documents', 'Prescriptions', 'Insurance forms', 'Drug interactions'],
    avgTime: '8-12s',
    costPerDoc: '$0.02-0.05',
    color: '#8B5CF6'
  },
  {
    id: 'gemini',
    name: 'Gemini (Google)',
    description: 'Best for vision analysis and form fields',
    strengths: ['Medical imaging', 'Handwriting', 'Forms', 'ID documents'],
    avgTime: '5-8s',
    costPerDoc: '$0.01-0.03',
    color: '#3B82F6'
  },
  {
    id: 'openai',
    name: 'GPT-4 (OpenAI)',
    description: 'Best for structured data and financial documents',
    strengths: ['Invoices', 'Billing', 'Tables', 'Calculations'],
    avgTime: '6-10s',
    costPerDoc: '$0.03-0.06',
    color: '#10B981'
  }
];

interface RetryWithDifferentModelProps {
  documentId: string;
  currentModel?: string;
  documentType?: string;
  onRetryComplete?: (result: any) => void;
  className?: string;
  compact?: boolean;
}

export const RetryWithDifferentModel: React.FC<RetryWithDifferentModelProps> = ({
  documentId,
  currentModel = 'gemini',
  documentType = 'unknown',
  onRetryComplete,
  className,
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isRetrying, setIsRetrying] = useState(false);
  const [preserveExisting, setPreserveExisting] = useState(true);
  const [enhanceWithSecondModel, setEnhanceWithSecondModel] = useState(false);

  const availableModels = MODEL_OPTIONS.filter(m => m.id !== currentModel);

  const handleRetry = async () => {
    if (!selectedModel) {
      toast.error('Please select a model');
      return;
    }

    setIsRetrying(true);
    try {
      const { data, error } = await supabase.functions.invoke('document-processor', {
        body: {
          action: 'process',
          documentId,
          processingConfig: {
            forceModel: selectedModel,
            preserveExisting,
            enhanceMode: enhanceWithSecondModel,
            previousModel: currentModel
          }
        }
      });

      if (error) throw error;

      toast.success(`Re-processed with ${selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1)}`);
      
      if (onRetryComplete) {
        onRetryComplete(data);
      }
      
      setIsOpen(false);
    } catch (e) {
      console.error('Retry failed:', e);
      toast.error('Failed to re-process document');
    } finally {
      setIsRetrying(false);
    }
  };

  const currentModelInfo = MODEL_OPTIONS.find(m => m.id === currentModel);

  if (compact) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className={cn("gap-1", className)}>
            <RefreshCw className="h-3 w-3" />
            <span className="text-xs">Retry</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Retry with Different Model</DialogTitle>
            <DialogDescription>
              Select a different AI model to re-process this document
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Current Model */}
            {currentModelInfo && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Currently processed with:</div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: currentModelInfo.color }}
                  />
                  <span className="font-medium">{currentModelInfo.name}</span>
                </div>
              </div>
            )}

            {/* Model Selection */}
            <RadioGroup value={selectedModel} onValueChange={setSelectedModel}>
              {availableModels.map(model => (
                <div 
                  key={model.id}
                  className={cn(
                    "flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all",
                    selectedModel === model.id 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => setSelectedModel(model.id)}
                >
                  <RadioGroupItem value={model.id} id={model.id} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={model.id} className="font-medium cursor-pointer">
                      {model.name}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">{model.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <Badge variant="outline" className="text-[10px]">
                        <Clock className="h-2.5 w-2.5 mr-1" />
                        {model.avgTime}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        <DollarSign className="h-2.5 w-2.5 mr-1" />
                        {model.costPerDoc}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>

            <Separator />

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="preserve" className="text-sm">Preserve existing extractions</Label>
                  <p className="text-xs text-muted-foreground">Keep high-confidence fields from previous extraction</p>
                </div>
                <Switch 
                  id="preserve" 
                  checked={preserveExisting}
                  onCheckedChange={setPreserveExisting}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enhance" className="text-sm">Enhance mode</Label>
                  <p className="text-xs text-muted-foreground">Fill gaps without overwriting existing data</p>
                </div>
                <Switch 
                  id="enhance" 
                  checked={enhanceWithSecondModel}
                  onCheckedChange={setEnhanceWithSecondModel}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRetry} disabled={!selectedModel || isRetrying}>
              {isRetrying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry with {selectedModel ? MODEL_OPTIONS.find(m => m.id === selectedModel)?.name.split(' ')[0] : 'Model'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-primary" />
          Re-process with Different Model
        </CardTitle>
        <CardDescription>
          Try a different AI model for better extraction results
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Model */}
        {currentModelInfo && (
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Current model:</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: currentModelInfo.color }}
                />
                <span className="font-medium">{currentModelInfo.name}</span>
              </div>
              <Badge variant="outline" className="text-xs">Active</Badge>
            </div>
          </div>
        )}

        {/* Available Models */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Try another model:</div>
          {availableModels.map(model => (
            <button
              key={model.id}
              className={cn(
                "w-full flex items-center gap-3 p-3 border rounded-lg text-left transition-all",
                selectedModel === model.id 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => setSelectedModel(model.id)}
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${model.color}20` }}
              >
                <Brain className="h-4 w-4" style={{ color: model.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{model.name}</div>
                <div className="text-xs text-muted-foreground truncate">{model.description}</div>
              </div>
              {selectedModel === model.id && (
                <CheckCircle className="h-4 w-4 text-primary shrink-0" />
              )}
            </button>
          ))}
        </div>

        {/* Action */}
        <Button 
          onClick={handleRetry} 
          disabled={!selectedModel || isRetrying}
          className="w-full"
        >
          {isRetrying ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Re-process Document
            </>
          )}
        </Button>

        {/* Tip */}
        <div className="p-2 bg-blue-500/10 rounded text-xs text-blue-700 flex items-start gap-2">
          <Zap className="h-3 w-3 mt-0.5 shrink-0" />
          <span>
            Different models excel at different document types. 
            Use Claude for medical docs, Gemini for images, OpenAI for invoices.
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default RetryWithDifferentModel;
