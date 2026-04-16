import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, Minimize2, Maximize2, Settings, Bot, Play, TestTube, 
  Save, RotateCcw, Copy, Trash2, ChevronDown, ChevronRight,
  Sparkles, Brain, Zap
} from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';

interface ConfigurableNodePanelProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData?: any;
  onSave: (nodeData: any) => void;
  onAIAssist: (mode: 'build' | 'generate' | 'test' | 'deploy' | 'configure') => void;
}

export const ConfigurableNodePanel: React.FC<ConfigurableNodePanelProps> = ({
  isOpen,
  onClose,
  nodeData,
  onSave,
  onAIAssist
}) => {
  const { showSuccess, showError } = useMasterToast();
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [configuration, setConfiguration] = useState(nodeData?.configuration || {});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    general: true,
    ai: false,
    advanced: false
  });

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const handleConfigurationChange = useCallback((key: string, value: any) => {
    setConfiguration(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const handleSave = useCallback(() => {
    const updatedNodeData = {
      ...nodeData,
      configuration,
      lastModified: new Date().toISOString()
    };
    
    onSave(updatedNodeData);
    showSuccess('Node configuration saved successfully');
  }, [nodeData, configuration, onSave, showSuccess]);

  const handleReset = useCallback(() => {
    setConfiguration(nodeData?.configuration || {});
    showSuccess('Configuration reset to last saved state');
  }, [nodeData]);

  const renderBasicConfig = () => (
    <div className="space-y-6">
      {/* General Configuration */}
      <div className="space-y-4">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('general')}
        >
          <h3 className="font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General Configuration
          </h3>
          {expandedSections.general ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
        
        {expandedSections.general && (
          <div className="pl-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nodeName">Node Name</Label>
                <Input
                  id="nodeName"
                  value={configuration.name || ''}
                  onChange={(e) => handleConfigurationChange('name', e.target.value)}
                  placeholder="Enter node name"
                />
              </div>
              <div>
                <Label htmlFor="nodeType">Node Type</Label>
                <Select 
                  value={configuration.type || ''}
                  onValueChange={(value) => handleConfigurationChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single-agent">Single Agent</SelectItem>
                    <SelectItem value="multi-agent">Multi-Agent</SelectItem>
                    <SelectItem value="action">Action</SelectItem>
                    <SelectItem value="condition">Condition</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={configuration.description || ''}
                onChange={(e) => handleConfigurationChange('description', e.target.value)}
                placeholder="Describe what this node does"
                rows={3}
              />
            </div>
          </div>
        )}
      </div>

      {/* AI Configuration */}
      <div className="space-y-4">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('ai')}
        >
          <h3 className="font-medium flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Configuration
          </h3>
          {expandedSections.ai ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
        
        {expandedSections.ai && (
          <div className="pl-6 space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="aiEnabled"
                checked={configuration.aiEnabled || false}
                onCheckedChange={(checked) => handleConfigurationChange('aiEnabled', checked)}
              />
              <Label htmlFor="aiEnabled">Enable AI Processing</Label>
            </div>
            
            {configuration.aiEnabled && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="aiProvider">AI Provider</Label>
                    <Select 
                      value={configuration.aiProvider || 'openai'}
                      onValueChange={(value) => handleConfigurationChange('aiProvider', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="claude">Claude</SelectItem>
                        <SelectItem value="gemini">Gemini</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="aiModel">Model</Label>
                    <Select 
                      value={configuration.aiModel || ''}
                      onValueChange={(value) => handleConfigurationChange('aiModel', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                        <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                        <SelectItem value="claude-opus-4-7">Claude Opus 4.7</SelectItem>
                        <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="systemPrompt">System Prompt</Label>
                  <Textarea
                    id="systemPrompt"
                    value={configuration.systemPrompt || ''}
                    onChange={(e) => handleConfigurationChange('systemPrompt', e.target.value)}
                    placeholder="Enter system prompt for AI agent"
                    rows={4}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderAdvancedConfig = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-medium flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Advanced Settings
        </h3>
        
        <div className="pl-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="timeout">Timeout (seconds)</Label>
              <Input
                id="timeout"
                type="number"
                value={configuration.timeout || '30'}
                onChange={(e) => handleConfigurationChange('timeout', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="retries">Max Retries</Label>
              <Input
                id="retries"
                type="number"
                value={configuration.retries || '3'}
                onChange={(e) => handleConfigurationChange('retries', parseInt(e.target.value))}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="enableLogging"
              checked={configuration.enableLogging || false}
              onCheckedChange={(checked) => handleConfigurationChange('enableLogging', checked)}
            />
            <Label htmlFor="enableLogging">Enable Detailed Logging</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="cacheResults"
              checked={configuration.cacheResults || false}
              onCheckedChange={(checked) => handleConfigurationChange('cacheResults', checked)}
            />
            <Label htmlFor="cacheResults">Cache Results</Label>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-background border-l shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <h2 className="font-semibold">Node Configuration</h2>
          {nodeData?.type && (
            <Badge variant="secondary" className="text-xs">
              {nodeData.type}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* AI Assist Bar */}
          <div className="p-4 bg-secondary/50 border-b">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">AI Assistance</span>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onAIAssist('configure')}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Configure
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onAIAssist('test')}
                >
                  <TestTube className="h-3 w-3 mr-1" />
                  Test
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="mt-4">
                {renderBasicConfig()}
              </TabsContent>
              
              <TabsContent value="advanced" className="mt-4">
                {renderAdvancedConfig()}
              </TabsContent>
            </Tabs>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="p-4 border-t bg-background">
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => {}}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};