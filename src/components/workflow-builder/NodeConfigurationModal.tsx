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
import { Save, X, RotateCcw } from 'lucide-react';

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
    onSave(nodeId, configuration);
    onClose();
  };

  const handleReset = () => {
    setConfiguration(initialData || {});
  };

  const handleTemplateApply = (template: any) => {
    setConfiguration({ ...configuration, ...template });
    setActiveTab('form');
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {getModalTitle()}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Configuration Form</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="flex-1 overflow-auto">
            <DynamicConfigurationForm
              nodeType={nodeType}
              configAction={configAction}
              configuration={configuration}
              onChange={setConfiguration}
            />
          </TabsContent>

          <TabsContent value="templates" className="flex-1 overflow-auto">
            <ConfigurationTemplates
              nodeType={nodeType}
              configAction={configAction}
              onApplyTemplate={handleTemplateApply}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};