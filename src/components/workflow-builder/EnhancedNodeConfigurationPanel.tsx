import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Zap, 
  Bot, 
  Database,
  MessageSquare,
  Code,
  TestTube,
  Save,
  RotateCcw,
  X,
  ChevronRight
} from 'lucide-react';
import { DynamicConfigurationForm } from './DynamicConfigurationForm';
import { ConfigurationTemplates } from './ConfigurationTemplates';
import { toast } from 'sonner';

interface EnhancedNodeConfigurationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  nodeId: string;
  nodeType: string;
  nodeName?: string;
  nodeCategory?: string;
  initialConfiguration?: any;
  onSave: (nodeId: string, configuration: any) => void;
  onTest?: (nodeId: string, configuration: any) => void;
}

export const EnhancedNodeConfigurationPanel: React.FC<EnhancedNodeConfigurationPanelProps> = ({
  isOpen,
  onClose,
  nodeId,
  nodeType,
  nodeName,
  nodeCategory,
  initialConfiguration = {},
  onSave,
  onTest
}) => {
  const [configuration, setConfiguration] = useState(initialConfiguration);
  const [activeTab, setActiveTab] = useState('configuration');
  const [isDirty, setIsDirty] = useState(false);

  const handleConfigurationChange = useCallback((newConfig: any) => {
    setConfiguration(newConfig);
    setIsDirty(true);
  }, []);

  const handleSave = useCallback(() => {
    try {
      onSave(nodeId, configuration);
      setIsDirty(false);
      toast.success(`Configuration saved for ${nodeName || nodeType}`);
    } catch (error: any) {
      toast.error(`Failed to save configuration: ${error.message}`);
    }
  }, [nodeId, configuration, onSave, nodeName, nodeType]);

  const handleReset = useCallback(() => {
    setConfiguration(initialConfiguration);
    setIsDirty(false);
    toast.info('Configuration reset to initial values');
  }, [initialConfiguration]);

  const handleTemplateApply = useCallback((template: any) => {
    const updatedConfig = { ...configuration, ...template };
    setConfiguration(updatedConfig);
    setIsDirty(true);
    setActiveTab('configuration');
    toast.success('Template applied successfully');
  }, [configuration]);

  const handleTest = useCallback(async () => {
    if (onTest) {
      try {
        await onTest(nodeId, configuration);
        toast.success('Node test completed');
      } catch (error: any) {
        toast.error(`Test failed: ${error.message}`);
      }
    }
  }, [nodeId, configuration, onTest]);

  const getNodeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'llm-agent':
      case 'agent':
        return Bot;
      case 'database':
      case 'vector-store':
        return Database;
      case 'api':
      case 'http-request':
        return Zap;
      case 'message':
      case 'chat':
        return MessageSquare;
      case 'code':
      case 'function':
        return Code;
      default:
        return Settings;
    }
  };

  const NodeIcon = getNodeIcon(nodeType);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] bg-background shadow-xl">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <NodeIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  {nodeName || `${nodeType} Configuration`}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {nodeType}
                  </Badge>
                  {nodeCategory && (
                    <>
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      <Badge variant="secondary" className="text-xs">
                        {nodeCategory}
                      </Badge>
                    </>
                  )}
                  {isDirty && (
                    <Badge variant="destructive" className="text-xs">
                      Modified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {onTest && (
                <Button variant="outline" size="sm" onClick={handleTest}>
                  <TestTube className="h-4 w-4 mr-2" />
                  Test
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleReset}
                disabled={!isDirty}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button size="sm" onClick={handleSave} disabled={!isDirty}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="border-b px-6 py-2">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="configuration">Configuration</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="h-[60vh]">
              <TabsContent value="configuration" className="p-6 m-0">
                <DynamicConfigurationForm
                  nodeType={nodeType}
                  configAction="configure"
                  configuration={configuration}
                  onChange={handleConfigurationChange}
                />
              </TabsContent>

              <TabsContent value="templates" className="p-6 m-0">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Configuration Templates</h3>
                    <p className="text-sm text-muted-foreground">
                      Apply pre-built configurations for common use cases
                    </p>
                  </div>
                  <Separator />
                  <ConfigurationTemplates
                    nodeType={nodeType}
                    configAction="configure"
                    onApplyTemplate={handleTemplateApply}
                  />
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="p-6 m-0">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Advanced Settings</h3>
                    <p className="text-sm text-muted-foreground">
                      Advanced configuration options and debugging tools
                    </p>
                  </div>
                  <Separator />
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Configuration JSON</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-60">
                        {JSON.stringify(configuration, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};