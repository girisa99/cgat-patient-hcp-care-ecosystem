import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bot, Settings, Zap, Database, MessageCircle, 
  X, Save, RefreshCw, Play, Pause
} from 'lucide-react';

interface InlineNodeConfigProps {
  nodeId: string;
  nodeType: string;
  data: any;
  onUpdate: (nodeId: string, updates: any) => void;
  onClose: () => void;
  isVisible: boolean;
}

export const InlineNodeConfig: React.FC<InlineNodeConfigProps> = ({
  nodeId,
  nodeType,
  data,
  onUpdate,
  onClose,
  isVisible
}) => {
  const [activeTab, setActiveTab] = useState('config');
  const [localData, setLocalData] = useState(data);

  if (!isVisible) return null;

  const updateLocalData = (updates: any) => {
    const newData = { ...localData, ...updates };
    setLocalData(newData);
  };

  const saveChanges = () => {
    onUpdate(nodeId, { data: localData });
    onClose();
  };

  const renderAIAgentConfig = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Agent Name</Label>
          <Input
            value={localData.label || ''}
            onChange={(e) => updateLocalData({ label: e.target.value })}
            className="h-8 text-xs"
            placeholder="Agent name"
          />
        </div>
        <div>
          <Label className="text-xs">Model</Label>
          <Select 
            value={localData.model || 'gpt-4o'} 
            onValueChange={(value) => updateLocalData({ model: value })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
              <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
              <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
              <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
              <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-xs">System Prompt</Label>
        <Textarea
          value={localData.prompt || ''}
          onChange={(e) => updateLocalData({ prompt: e.target.value })}
          className="text-xs resize-none"
          rows={3}
          placeholder="Enter system prompt for this agent..."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Temperature: {localData.temperature?.[0] || 0.7}</Label>
          <Slider
            value={localData.temperature || [0.7]}
            onValueChange={(value) => updateLocalData({ temperature: value })}
            max={2}
            min={0}
            step={0.1}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Max Tokens</Label>
          <Input
            type="number"
            value={localData.max_tokens || 1000}
            onChange={(e) => updateLocalData({ max_tokens: parseInt(e.target.value) })}
            className="h-8 text-xs"
            min={1}
            max={4000}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            checked={localData.active !== false}
            onCheckedChange={(checked) => updateLocalData({ active: checked })}
          />
          <Label className="text-xs">Agent Active</Label>
        </div>
        <Badge variant={localData.active !== false ? "default" : "secondary"} className="text-xs">
          {localData.active !== false ? 'Active' : 'Inactive'}
        </Badge>
      </div>
    </div>
  );

  const renderActionsConfig = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Actions Configuration</Label>
        <Button size="sm" variant="outline">
          <Zap className="h-3 w-3 mr-1" />
          Add Action
        </Button>
      </div>
      
      <div className="space-y-2">
        {(localData.actions || []).map((action: any, index: number) => (
          <Card key={index} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-orange-500" />
                <span className="text-xs font-medium">{action.name || 'Untitled Action'}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {action.type || 'API'}
              </Badge>
            </div>
          </Card>
        ))}
        
        {(!localData.actions || localData.actions.length === 0) && (
          <div className="text-center py-4 text-muted-foreground text-xs">
            No actions configured
          </div>
        )}
      </div>
    </div>
  );

  const renderDataConfig = () => (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Data Sources</Label>
      
      <div className="space-y-2">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-500" />
            <div className="flex-1">
              <div className="text-xs font-medium">Database Connection</div>
              <div className="text-xs text-muted-foreground">Primary data store</div>
            </div>
            <Switch defaultChecked />
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-green-500" />
            <div className="flex-1">
              <div className="text-xs font-medium">Knowledge Base</div>
              <div className="text-xs text-muted-foreground">Document storage</div>
            </div>
            <Switch />
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <Card className="absolute top-full left-0 mt-2 w-80 shadow-xl border-2 z-50 bg-background">
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span className="font-medium text-sm">Configure Node</span>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" onClick={saveChanges}>
            <Save className="h-3 w-3 mr-1" />
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-3 pt-2">
            <TabsList className="grid w-full grid-cols-3 h-8">
              <TabsTrigger value="config" className="text-xs">
                <Bot className="h-3 w-3 mr-1" />
                Config
              </TabsTrigger>
              <TabsTrigger value="actions" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Actions
              </TabsTrigger>
              <TabsTrigger value="data" className="text-xs">
                <Database className="h-3 w-3 mr-1" />
                Data
              </TabsTrigger>
            </TabsList>
          </div>
          
          <ScrollArea className="h-80">
            <div className="p-3">
              <TabsContent value="config" className="mt-0">
                {nodeType === 'agent' || nodeType === 'aiModelsNode' ? renderAIAgentConfig() : (
                  <div className="text-center py-8 text-muted-foreground text-xs">
                    Basic configuration for {nodeType} nodes
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="actions" className="mt-0">
                {renderActionsConfig()}
              </TabsContent>
              
              <TabsContent value="data" className="mt-0">
                {renderDataConfig()}
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
};