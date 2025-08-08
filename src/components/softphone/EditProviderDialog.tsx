import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';
import { Settings, TestTube, Zap, Database } from 'lucide-react';

interface EditProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: any;
}

export const EditProviderDialog = ({ open, onOpenChange, provider }: EditProviderDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    provider_type: '',
    configuration: '{}',
    capabilities: '{}',
    api_credentials: '{}',
    rate_limits: '{}',
    webhook_config: '{}',
    health_check_config: '{}',
    is_active: true
  });

  const [activeTab, setActiveTab] = useState('basic');
  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (provider && open) {
      setFormData({
        name: provider.name || '',
        provider_type: provider.provider_type || '',
        configuration: JSON.stringify(provider.configuration || {}, null, 2),
        capabilities: JSON.stringify(provider.capabilities || {}, null, 2),
        api_credentials: JSON.stringify(provider.api_credentials || {}, null, 2),
        rate_limits: JSON.stringify(provider.rate_limits || {}, null, 2),
        webhook_config: JSON.stringify(provider.webhook_config || {}, null, 2),
        health_check_config: JSON.stringify(provider.health_check_config || {}, null, 2),
        is_active: provider.is_active ?? true
      });
    }
  }, [provider, open]);

  const updateProvider = useMutation({
    mutationFn: async (updates: any) => {
      const { data, error } = await supabase
        .from('voice_providers')
        .update(updates)
        .eq('id', provider.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-providers'] });
      onOpenChange(false);
      showSuccess('Voice provider updated successfully');
    },
    onError: (error) => {
      console.error('Error updating provider:', error);
      showError('Failed to update voice provider');
    }
  });

  const testProvider = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('test-voice-provider', {
        body: { providerId: provider.id }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        showSuccess(`Test successful: ${data.message}`);
      } else {
        showError(`Test failed: ${data.error}`);
      }
    },
    onError: (error) => {
      console.error('Provider test error:', error);
      showError('Failed to test provider connectivity');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updates = {
        name: formData.name,
        provider_type: formData.provider_type,
        configuration: JSON.parse(formData.configuration),
        capabilities: JSON.parse(formData.capabilities),
        api_credentials: JSON.parse(formData.api_credentials),
        rate_limits: JSON.parse(formData.rate_limits),
        webhook_config: JSON.parse(formData.webhook_config),
        health_check_config: JSON.parse(formData.health_check_config),
        is_active: formData.is_active
      };
      
      updateProvider.mutate(updates);
    } catch (jsonError) {
      showError('Please ensure all JSON fields are valid');
    }
  };

  const handleTest = () => {
    testProvider.mutate();
  };

  if (!provider) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Edit Voice Provider: {provider.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
            <TabsTrigger value="testing">Testing & Health</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Provider Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Provider name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="provider_type">Provider Type</Label>
                  <Select
                    value={formData.provider_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, provider_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twilio">📞 Twilio</SelectItem>
                      <SelectItem value="five9">🌟 Five9</SelectItem>
                      <SelectItem value="genesys">⚡ Genesys</SelectItem>
                      <SelectItem value="elevenlabs">🎙️ ElevenLabs</SelectItem>
                      <SelectItem value="openai">🤖 OpenAI</SelectItem>
                      <SelectItem value="huggingface">🤗 Hugging Face</SelectItem>
                      <SelectItem value="claude">🧠 Claude</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Provider Active</Label>
                <Badge variant={formData.is_active ? "default" : "secondary"}>
                  {formData.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </TabsContent>

            <TabsContent value="config" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="configuration">Configuration (JSON)</Label>
                <Textarea
                  id="configuration"
                  value={formData.configuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, configuration: e.target.value }))}
                  rows={8}
                  className="font-mono text-sm"
                  placeholder='{"api_key": "", "endpoint": ""}'
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="api_credentials">API Credentials (JSON)</Label>
                  <Textarea
                    id="api_credentials"
                    value={formData.api_credentials}
                    onChange={(e) => setFormData(prev => ({ ...prev, api_credentials: e.target.value }))}
                    rows={4}
                    className="font-mono text-sm"
                    placeholder='{"api_key": "***", "secret": "***"}'
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="webhook_config">Webhook Config (JSON)</Label>
                  <Textarea
                    id="webhook_config"
                    value={formData.webhook_config}
                    onChange={(e) => setFormData(prev => ({ ...prev, webhook_config: e.target.value }))}
                    rows={4}
                    className="font-mono text-sm"
                    placeholder='{"url": "", "events": []}'
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="capabilities" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="capabilities">Capabilities (JSON)</Label>
                <Textarea
                  id="capabilities"
                  value={formData.capabilities}
                  onChange={(e) => setFormData(prev => ({ ...prev, capabilities: e.target.value }))}
                  rows={6}
                  className="font-mono text-sm"
                  placeholder='{"tts": true, "stt": false, "calls": true, "realtime": false}'
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rate_limits">Rate Limits (JSON)</Label>
                <Textarea
                  id="rate_limits"
                  value={formData.rate_limits}
                  onChange={(e) => setFormData(prev => ({ ...prev, rate_limits: e.target.value }))}
                  rows={4}
                  className="font-mono text-sm"
                  placeholder='{"requests_per_minute": 60, "characters_per_month": 10000}'
                />
              </div>
            </TabsContent>

            <TabsContent value="testing" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="health_check_config">Health Check Config (JSON)</Label>
                <Textarea
                  id="health_check_config"
                  value={formData.health_check_config}
                  onChange={(e) => setFormData(prev => ({ ...prev, health_check_config: e.target.value }))}
                  rows={4}
                  className="font-mono text-sm"
                  placeholder='{"endpoint": "/health", "interval": 300, "timeout": 30}'
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  type="button"
                  onClick={handleTest}
                  disabled={testProvider.isPending}
                  variant="outline"
                  className="gap-2"
                >
                  <TestTube className="h-4 w-4" />
                  {testProvider.isPending ? 'Testing...' : 'Test Provider'}
                </Button>
                
                <Button 
                  type="button"
                  variant="outline"
                  className="gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Health Check
                </Button>
                
                <Button 
                  type="button"
                  variant="outline"
                  className="gap-2"
                >
                  <Database className="h-4 w-4" />
                  View Logs
                </Button>
              </div>
            </TabsContent>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateProvider.isPending}>
                {updateProvider.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};