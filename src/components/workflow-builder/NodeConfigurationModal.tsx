import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DynamicConfigurationForm } from './DynamicConfigurationForm';
import { ConfigurationTemplates } from './ConfigurationTemplates';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Save, X, RotateCcw, Settings } from 'lucide-react';

interface NodeConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeId: string;
  nodeType: string;
  configAction: string;
  initialData?: any;
  onSave: (nodeId: string, configuration: any) => void;
}

export const NodeConfigurationModal: React.FC<NodeConfigurationModalProps> = ({
  isOpen,
  onClose,
  nodeId,
  nodeType,
  configAction,
  initialData,
  onSave,
}) => {
  const [configuration, setConfiguration] = useState(initialData || {});
  const [activeTab, setActiveTab] = useState('form');

  useEffect(() => {
    if (initialData) {
      setConfiguration(initialData);
    }
  }, [initialData]);

  const handleSave = () => {
    console.log('Saving node configuration:', { nodeId, configuration });
    onSave(nodeId, configuration);
    onClose();
  };

  const handleReset = () => {
    setConfiguration(initialData || {});
  };

  const handleTemplateApply = (template: any) => {
    const updatedConfig = { ...configuration, ...template };
    setConfiguration(updatedConfig);
    setActiveTab('form');
    console.log('Applied template configuration:', updatedConfig);
  };

  const getModalTitle = () => {
    const actionLabels: Record<string, string> = {
      'ai-model': 'AI Model Settings',
      'prompt': 'Prompt Configuration',
      'endpoint': 'API Endpoint Configuration',
      'auth': 'Authentication Settings',
      'connection': 'Database Connection',
      'flow-logic': 'Workflow Logic',
      'basic': 'Basic Settings',
      'advanced': 'Advanced Options',
    };
    
    return actionLabels[configAction] || 'Node Configuration';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0 border-b pb-4">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Settings className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{getModalTitle()}</h2>
                <p className="text-sm text-muted-foreground">
                  Configure {nodeType} node settings and parameters
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save & Apply
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <div className="flex-shrink-0 border-b">
              <TabsList className="w-full justify-start h-12 bg-transparent p-0">
                <TabsTrigger 
                  value="form" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Configuration
                </TabsTrigger>
                <TabsTrigger 
                  value="templates"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Templates
                </TabsTrigger>
                <TabsTrigger 
                  value="advanced"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Advanced
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="form" className="flex-1 overflow-auto mt-0 p-4">
              <DynamicConfigurationForm
                nodeType={nodeType}
                configAction={configAction}
                configuration={configuration}
                onChange={setConfiguration}
              />
            </TabsContent>

            <TabsContent value="templates" className="flex-1 overflow-auto mt-0 p-4">
              <ConfigurationTemplates
                nodeType={nodeType}
                configAction={configAction}
                onApplyTemplate={handleTemplateApply}
              />
            </TabsContent>

            <TabsContent value="advanced" className="flex-1 overflow-auto mt-0 p-4">
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Advanced Configuration</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced settings and custom parameters will be available here
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};