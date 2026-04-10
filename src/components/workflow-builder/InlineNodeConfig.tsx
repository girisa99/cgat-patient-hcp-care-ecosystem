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
              <SelectItem value="claude-opus-4-6">Claude Opus 4.6</SelectItem>
              <SelectItem value="claude-sonnet-4-6">Claude Sonnet 4.6</SelectItem>
              <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
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
    <Card className="fixed bottom-24 right-4 w-[28rem] shadow-xl border-2 z-[60] bg-background">
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
            <TabsList className="w-full flex flex-wrap gap-1 h-auto">
              <TabsTrigger value="config" className="text-xs">Config</TabsTrigger>
              <TabsTrigger value="variables" className="text-xs">Variables</TabsTrigger>
              <TabsTrigger value="assets" className="text-xs">Assets</TabsTrigger>
              <TabsTrigger value="logic" className="text-xs">Logic</TabsTrigger>
              <TabsTrigger value="conditions" className="text-xs">Conditions</TabsTrigger>
              <TabsTrigger value="human" className="text-xs">Human</TabsTrigger>
              <TabsTrigger value="notes" className="text-xs">Notes</TabsTrigger>
              <TabsTrigger value="actions" className="text-xs">Actions</TabsTrigger>
              <TabsTrigger value="data" className="text-xs">Data</TabsTrigger>
            </TabsList>
          </div>
          
          <ScrollArea className="h-[26rem]">
            <div className="p-3 space-y-4">
              <TabsContent value="config" className="mt-0">
                {nodeType === 'agent' || nodeType === 'aiModelsNode' ? renderAIAgentConfig() : (
                  <div className="text-center py-8 text-muted-foreground text-xs">
                    Basic configuration for {nodeType} nodes
                  </div>
                )}
              </TabsContent>

              <TabsContent value="variables" className="mt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Variables</Label>
                    <Button size="sm" variant="outline" onClick={() => updateLocalData({ variables: [ ...(localData.variables||[]), { key: '', type: 'string', value: '' } ] })}>
                      + Add
                    </Button>
                  </div>
                  {(localData.variables || []).map((v: any, i: number) => (
                    <div key={i} className="grid grid-cols-5 gap-2">
                      <Input className="col-span-2 h-8 text-xs" placeholder="key" value={v.key||''} onChange={(e)=>{
                        const arr = [...(localData.variables||[])]; arr[i] = { ...arr[i], key: e.target.value }; updateLocalData({ variables: arr });
                      }} />
                      <Select value={v.type||'string'} onValueChange={(val)=>{ const arr = [...(localData.variables||[])]; arr[i] = { ...arr[i], type: val }; updateLocalData({ variables: arr }); }}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">string</SelectItem>
                          <SelectItem value="number">number</SelectItem>
                          <SelectItem value="boolean">boolean</SelectItem>
                          <SelectItem value="json">json</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input className="col-span-2 h-8 text-xs" placeholder="value" value={v.value||''} onChange={(e)=>{
                        const arr = [...(localData.variables||[])]; arr[i] = { ...arr[i], value: e.target.value }; updateLocalData({ variables: arr });
                      }} />
                    </div>
                  ))}
                  {(!localData.variables || localData.variables.length === 0) && (
                    <div className="text-xs text-muted-foreground">No variables added</div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="assets" className="mt-0">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Assets</Label>
                  <div className="flex gap-2">
                    <Select onValueChange={(val)=>{
                      const current = new Set([...(localData.assets||[])]); current.add(val); updateLocalData({ assets: Array.from(current) });
                    }}>
                      <SelectTrigger className="h-8 text-xs w-full">
                        <SelectValue placeholder={(localData.availableAssets||[]).length ? 'Select asset' : 'No assets available'} />
                      </SelectTrigger>
                      <SelectContent>
                        {(localData.availableAssets||[]).map((a: string) => (
                          <SelectItem key={a} value={a}>{a}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(localData.assets||[]).map((a: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {a}
                        <Button size="sm" variant="ghost" className="h-5 px-1 ml-1" onClick={()=>{
                          const arr = (localData.assets||[]).filter((x: string)=>x!==a); updateLocalData({ assets: arr });
                        }}>✕</Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="logic" className="mt-0">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Custom Logic</Label>
                  <Textarea rows={4} className="text-xs" placeholder="Write custom logic or expression..." value={localData.logic||''} onChange={(e)=>updateLocalData({ logic: e.target.value })} />
                </div>
              </TabsContent>

              <TabsContent value="conditions" className="mt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Conditions</Label>
                    <Button size="sm" variant="outline" onClick={() => updateLocalData({ conditions: [ ...(localData.conditions||[]), '' ] })}>+ Add</Button>
                  </div>
                  {(localData.conditions||[]).map((c: string, i: number) => (
                    <div key={i} className="flex gap-2">
                      <Input className="h-8 text-xs" placeholder="e.g., score > 0.5" value={c} onChange={(e)=>{
                        const arr = [...(localData.conditions||[])]; arr[i] = e.target.value; updateLocalData({ conditions: arr });
                      }} />
                      <Button size="sm" variant="ghost" onClick={()=>{
                        const arr = (localData.conditions||[]).filter((_: any, idx: number)=>idx!==i); updateLocalData({ conditions: arr });
                      }}>✕</Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="human" className="mt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Switch checked={!!localData.humanInLoop?.required} onCheckedChange={(v)=>updateLocalData({ humanInLoop: { ...(localData.humanInLoop||{}), required: v } })} />
                    <Label className="text-xs">Require human approval</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Approver Role</Label>
                      <Select value={localData.humanInLoop?.role||'CareManager'} onValueChange={(val)=>updateLocalData({ humanInLoop: { ...(localData.humanInLoop||{}), role: val } })}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CareManager">Care Manager</SelectItem>
                          <SelectItem value="Nurse">Nurse</SelectItem>
                          <SelectItem value="Provider">Provider</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2 pt-5">
                      <Switch checked={!!localData.humanInLoop?.notify} onCheckedChange={(v)=>updateLocalData({ humanInLoop: { ...(localData.humanInLoop||{}), notify: v } })} />
                      <Label className="text-xs">Notify on wait</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notes" className="mt-0">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Sticky Notes</Label>
                  <Textarea rows={6} className="text-xs" placeholder="Add notes for this node..." value={localData.notes||''} onChange={(e)=>updateLocalData({ notes: e.target.value })} />
                </div>
              </TabsContent>

              <TabsContent value="actions" className="mt-0">{renderActionsConfig()}</TabsContent>
              <TabsContent value="data" className="mt-0">{renderDataConfig()}</TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
};