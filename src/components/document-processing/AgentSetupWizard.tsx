/**
 * Agent Setup Wizard Component
 * Guides users through configuring agents with data collection options:
 * - Inline upload
 * - Navigate to upload
 * - AI assist
 * - Manual entry
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Settings,
  Key,
  FileText,
  Upload,
  Bot,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Info,
  Zap,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import {
  useAgentConfiguration,
  DATA_COLLECTION_METHODS,
  type AgentDataRequirements,
  type DataCollectionMethod
} from '@/hooks/useAgentConfiguration';
import { toast } from 'sonner';

interface AgentSetupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentTypeId: string;
  agentName: string;
  extractedData?: Record<string, any>;
  onConfigured?: () => void;
  onDataCollectionRequest?: (method: DataCollectionMethod['id'], missingFields: string[]) => void;
}

export function AgentSetupWizard({
  open,
  onOpenChange,
  agentTypeId,
  agentName,
  extractedData = {},
  onConfigured,
  onDataCollectionRequest
}: AgentSetupWizardProps) {
  const navigate = useNavigate();
  const {
    requirements,
    configuration,
    isConfigured,
    isLoading,
    fetchRequirements,
    saveConfiguration,
    validateConfiguration,
    testConnection,
    getMissingData,
    getSupportedMethods
  } = useAgentConfiguration();

  const [activeTab, setActiveTab] = useState<'api' | 'data' | 'test'>('api');
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [secretValues, setSecretValues] = useState<Record<string, string>>({});
  const [selectedDataMethod, setSelectedDataMethod] = useState<DataCollectionMethod['id']>('extracted_data');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; errors: string[] } | null>(null);

  // Fetch requirements when dialog opens
  useEffect(() => {
    if (open && agentTypeId) {
      fetchRequirements(agentTypeId);
    }
  }, [open, agentTypeId, fetchRequirements]);

  // Pre-fill form with existing configuration
  useEffect(() => {
    if (configuration) {
      setFormValues(configuration.required_fields || {});
    }
  }, [configuration]);

  const missingData = getMissingData(agentTypeId, extractedData);
  const supportedMethods = getSupportedMethods(agentTypeId);

  const handleFormChange = (field: string, value: string) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSecretChange = (field: string, value: string) => {
    setSecretValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const saved = await saveConfiguration(agentTypeId, {
      required_fields: formValues,
      environment: 'sandbox',
      data_source_config: { preferred_method: selectedDataMethod }
    });

    if (saved) {
      const validation = await validateConfiguration(agentTypeId);
      setValidationResult(validation);
      
      if (validation.isValid) {
        onConfigured?.();
      }
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const result = await testConnection(agentTypeId);
      setTestResult(result);
      
      if (result.success) {
        toast.success('Connection test successful!');
      } else {
        toast.error('Connection test failed');
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleDataMethodSelect = (method: DataCollectionMethod['id']) => {
    setSelectedDataMethod(method);
    
    if (method === 'navigate_upload') {
      onOpenChange(false);
      navigate('/dashboard/documents');
    } else if (method === 'ai_assist' || method === 'inline_upload') {
      onDataCollectionRequest?.(method, missingData.map(d => d.field));
    }
  };

  const renderApiConfigTab = () => {
    if (!requirements) return null;

    const apiFields = requirements.required_api_fields || [];
    const hasSecrets = apiFields.some(f => f.type === 'secret');

    return (
      <div className="space-y-4">
        {requirements.setup_instructions && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Setup Instructions</AlertTitle>
            <AlertDescription className="text-sm whitespace-pre-line">
              {requirements.setup_instructions}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {apiFields.map((field) => (
            <div key={field.name} className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor={field.name} className="flex items-center gap-1">
                  {field.type === 'secret' && <Key className="h-3 w-3 text-amber-500" />}
                  {field.label}
                  {field.required && <span className="text-destructive">*</span>}
                </Label>
                {field.description && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>{field.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              
              {field.type === 'secret' ? (
                <Input
                  id={field.name}
                  type="password"
                  placeholder={field.default || `Enter ${field.label.toLowerCase()}`}
                  value={secretValues[field.name] || ''}
                  onChange={(e) => handleSecretChange(field.name, e.target.value)}
                  className="font-mono text-sm"
                />
              ) : (
                <Input
                  id={field.name}
                  type={field.type === 'url' ? 'url' : 'text'}
                  placeholder={field.default || `Enter ${field.label.toLowerCase()}`}
                  value={formValues[field.name] || field.default || ''}
                  onChange={(e) => handleFormChange(field.name, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        {hasSecrets && (
          <Alert variant="default" className="bg-amber-500/10 border-amber-500/30">
            <Key className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-sm">
              API keys and secrets are encrypted and stored securely. They are never exposed in the frontend.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  const renderDataRequirementsTab = () => {
    if (!requirements) return null;

    const requiredData = requirements.required_document_data || [];
    const optionalData = requirements.optional_document_data || [];

    return (
      <div className="space-y-4">
        {/* Data status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Available</span>
            </div>
            <div className="text-2xl font-bold">
              {requiredData.length - missingData.length}
            </div>
            <div className="text-xs text-muted-foreground">of {requiredData.length} required</div>
          </div>
          
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">Missing</span>
            </div>
            <div className="text-2xl font-bold text-amber-500">
              {missingData.length}
            </div>
            <div className="text-xs text-muted-foreground">fields needed</div>
          </div>
        </div>

        {/* Required fields */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Required Data</h4>
          <div className="space-y-1">
            {requiredData.map((field) => {
              const hasValue = extractedData[field.field];
              return (
                <div
                  key={field.field}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg",
                    hasValue ? "bg-green-500/10" : "bg-amber-500/10"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {hasValue ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-amber-500" />
                    )}
                    <span className="text-sm">{field.label}</span>
                    <Badge variant="outline" className="text-xs">
                      {field.source}
                    </Badge>
                  </div>
                  {hasValue && (
                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {String(extractedData[field.field])}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Data collection method selection */}
        {missingData.length > 0 && (
          <div className="space-y-3">
            <Separator />
            <h4 className="text-sm font-medium">How would you like to provide missing data?</h4>
            
            <RadioGroup
              value={selectedDataMethod}
              onValueChange={(v) => handleDataMethodSelect(v as DataCollectionMethod['id'])}
              className="space-y-2"
            >
              {supportedMethods.map((method) => (
                <div
                  key={method.id}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    selectedDataMethod === method.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  )}
                  onClick={() => handleDataMethodSelect(method.id)}
                >
                  <RadioGroupItem value={method.id} id={method.id} />
                  <div className="flex-1">
                    <Label
                      htmlFor={method.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <span className="text-lg">{method.icon}</span>
                      <span className="font-medium">{method.label}</span>
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {method.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        {/* Optional fields */}
        {optionalData.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Optional Data</h4>
            <div className="space-y-1">
              {optionalData.map((field) => {
                const hasValue = extractedData[field.field];
                return (
                  <div
                    key={field.field}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-2">
                      {hasValue ? (
                        <CheckCircle className="h-4 w-4 text-green-500/70" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-muted-foreground/30" />
                      )}
                      <span className="text-sm text-muted-foreground">{field.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTestTab = () => {
    return (
      <div className="space-y-4">
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Zap className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium">Test Connection</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Verify that your API configuration is working correctly
          </p>
        </div>

        <Button
          onClick={handleTest}
          disabled={isTesting}
          className="w-full"
          size="lg"
        >
          {isTesting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testing Connection...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Run Connection Test
            </>
          )}
        </Button>

        {testResult && (
          <Alert variant={testResult.success ? "default" : "destructive"}>
            {testResult.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {testResult.success ? 'Connection Successful' : 'Connection Failed'}
            </AlertTitle>
            <AlertDescription>{testResult.message}</AlertDescription>
          </Alert>
        )}

        {validationResult && !validationResult.isValid && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Validation Errors</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2">
                {validationResult.errors.map((error, i) => (
                  <li key={i} className="text-sm">{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configure {agentName}
          </DialogTitle>
          <DialogDescription>
            Set up the required API credentials and data sources for this agent.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="api" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  API Setup
                </TabsTrigger>
                <TabsTrigger value="data" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Data
                  {missingData.length > 0 && (
                    <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {missingData.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="test" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Test
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 pr-4 mt-4" style={{ maxHeight: '400px' }}>
                <TabsContent value="api" className="mt-0">
                  {renderApiConfigTab()}
                </TabsContent>
                <TabsContent value="data" className="mt-0">
                  {renderDataRequirementsTab()}
                </TabsContent>
                <TabsContent value="test" className="mt-0">
                  {renderTestTab()}
                </TabsContent>
              </ScrollArea>
            </Tabs>

            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Configuration'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default AgentSetupWizard;
