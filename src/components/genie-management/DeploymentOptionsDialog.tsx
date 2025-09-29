/**
 * DEPLOYMENT OPTIONS DIALOG
 * Shows deployment code generation options
 */
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, Check, Code2, FileCode, Puzzle, Cpu } from 'lucide-react';
import { GenieInstance } from '@/hooks/useGenieManagement';
import { useMasterToast } from '@/hooks/useMasterToast';

interface DeploymentOptionsDialogProps {
  instance: GenieInstance | null;
  open: boolean;
  onClose: () => void;
  onGenerateCode: (configId: string, deploymentType: string) => Promise<string | null>;
}

export const DeploymentOptionsDialog: React.FC<DeploymentOptionsDialogProps> = ({
  instance,
  open,
  onClose,
  onGenerateCode
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [generatedCodes, setGeneratedCodes] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const { showSuccess } = useMasterToast();

  const deploymentTypes = [
    { id: 'javascript', label: 'JavaScript', icon: Code2, description: 'Browser-based widget integration' },
    { id: 'python', label: 'Python', icon: FileCode, description: 'Server-side Python integration' },
    { id: 'embedded_script', label: 'Embedded Script', icon: Puzzle, description: 'Simple embed code' },
    { id: 'api_integration', label: 'API Integration', icon: Cpu, description: 'Direct API calls' }
  ];

  const handleGenerate = async (type: string) => {
    if (!instance) return;
    
    setIsGenerating(true);
    const code = await onGenerateCode(instance.id, type);
    if (code) {
      setGeneratedCodes(prev => ({ ...prev, [type]: code }));
    }
    setIsGenerating(false);
  };

  const handleCopy = async (type: string, code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedType(type);
    showSuccess('Code copied to clipboard');
    setTimeout(() => setCopiedType(null), 2000);
  };

  if (!instance) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Deployment Options - {instance.brand_name}</DialogTitle>
          <DialogDescription>
            Generate and copy deployment code for {instance.product_name || instance.brand_name}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="javascript" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {deploymentTypes.map((type) => (
              <TabsTrigger key={type.id} value={type.id}>
                <type.icon className="h-4 w-4 mr-2" />
                {type.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {deploymentTypes.map((type) => (
            <TabsContent key={type.id} value={type.id} className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold">{type.label} Integration</h3>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>

                    {generatedCodes[type.id] ? (
                      <div className="space-y-2">
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{generatedCodes[type.id]}</code>
                        </pre>
                        <Button
                          onClick={() => handleCopy(type.id, generatedCodes[type.id])}
                          className="w-full"
                          variant="outline"
                        >
                          {copiedType === type.id ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Code
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleGenerate(type.id)}
                        disabled={isGenerating}
                        className="w-full"
                      >
                        {isGenerating ? 'Generating...' : `Generate ${type.label} Code`}
                      </Button>
                    )}

                    <div className="text-xs text-muted-foreground space-y-1">
                      <p><strong>Domain:</strong> {instance.domain_name || 'Not configured'}</p>
                      <p><strong>Status:</strong> {instance.domain_verified ? '✓ Verified' : '⚠ Pending verification'}</p>
                      <p><strong>Limits:</strong> {instance.hourly_limit} requests/hour, {instance.daily_limit} requests/day</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};