import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';

interface CreateProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateProviderDialog = ({ open, onOpenChange }: CreateProviderDialogProps) => {
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

  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();

  const createProvider = useMutation({
    mutationFn: async (providerData: typeof formData) => {
      const { data, error } = await supabase
        .from('voice_providers')
        .insert([{
          ...providerData,
          configuration: JSON.parse(providerData.configuration),
          capabilities: JSON.parse(providerData.capabilities),
          api_credentials: JSON.parse(providerData.api_credentials),
          rate_limits: JSON.parse(providerData.rate_limits),
          webhook_config: JSON.parse(providerData.webhook_config),
          health_check_config: JSON.parse(providerData.health_check_config)
        }])
        .select()
        .maybeSingle();
        
        if (error) throw error;
        if (!data) { throw new Error('Insert failed: no data returned'); }
        return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-providers'] });
      onOpenChange(false);
      resetForm();
      showSuccess('Voice provider created successfully');
    },
    onError: (error) => {
      console.error('Error creating provider:', error);
      showError('Failed to create voice provider');
    }
  });

  const resetForm = () => {
    setFormData({
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate JSON fields
    try {
      JSON.parse(formData.configuration);
      JSON.parse(formData.capabilities);
      JSON.parse(formData.api_credentials);
      JSON.parse(formData.rate_limits);
      JSON.parse(formData.webhook_config);
      JSON.parse(formData.health_check_config);
    } catch {
      showError('Please ensure all JSON fields are valid');
      return;
    }

    createProvider.mutate(formData);
  };

  const getProviderTemplate = (providerType: string) => {
    const templates = {
      twilio: {
        configuration: JSON.stringify({ 
          account_sid: '', 
          auth_token: '', 
          phone_number: '' 
        }, null, 2),
        capabilities: JSON.stringify({ 
          calls: true, 
          sms: true, 
          tts: false, 
          stt: false 
        }, null, 2),
        rate_limits: JSON.stringify({ 
          calls_per_second: 10, 
          requests_per_minute: 600 
        }, null, 2)
      },
      elevenlabs: {
        configuration: JSON.stringify({ 
          api_key: '', 
          model_id: 'eleven_monolingual_v1', 
          voice_id: 'alloy' 
        }, null, 2),
        capabilities: JSON.stringify({ 
          tts: true, 
          voice_clone: true, 
          realtime: true, 
          calls: false 
        }, null, 2),
        rate_limits: JSON.stringify({ 
          characters_per_month: 10000, 
          requests_per_minute: 60 
        }, null, 2)
      },
      openai: {
        configuration: JSON.stringify({ 
          api_key: '', 
          model: 'gpt-4o-realtime-preview-2024-10-01' 
        }, null, 2),
        capabilities: JSON.stringify({ 
          tts: true, 
          stt: true, 
          realtime: true, 
          calls: false 
        }, null, 2),
        rate_limits: JSON.stringify({ 
          requests_per_minute: 500, 
          tokens_per_minute: 40000 
        }, null, 2)
      }
    };
    
    return templates[providerType as keyof typeof templates] || {
      configuration: '{}',
      capabilities: '{}',
      rate_limits: '{}'
    };
  };

  const handleProviderTypeChange = (value: string) => {
    const template = getProviderTemplate(value);
    setFormData(prev => ({
      ...prev,
      provider_type: value,
      configuration: template.configuration,
      capabilities: template.capabilities,
      rate_limits: template.rate_limits
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Voice Provider</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Provider Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., My Twilio Provider"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="provider_type">Provider Type</Label>
              <Select
                value={formData.provider_type}
                onValueChange={handleProviderTypeChange}
                required
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

          <div className="space-y-2">
            <Label htmlFor="configuration">Configuration (JSON)</Label>
            <Textarea
              id="configuration"
              value={formData.configuration}
              onChange={(e) => setFormData(prev => ({ ...prev, configuration: e.target.value }))}
              placeholder='{"api_key": "", "endpoint": ""}'
              rows={4}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capabilities">Capabilities (JSON)</Label>
            <Textarea
              id="capabilities"
              value={formData.capabilities}
              onChange={(e) => setFormData(prev => ({ ...prev, capabilities: e.target.value }))}
              placeholder='{"tts": true, "stt": false, "calls": true}'
              rows={3}
              className="font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rate_limits">Rate Limits (JSON)</Label>
              <Textarea
                id="rate_limits"
                value={formData.rate_limits}
                onChange={(e) => setFormData(prev => ({ ...prev, rate_limits: e.target.value }))}
                placeholder='{"requests_per_minute": 60}'
                rows={3}
                className="font-mono text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="api_credentials">API Credentials (JSON)</Label>
              <Textarea
                id="api_credentials"
                value={formData.api_credentials}
                onChange={(e) => setFormData(prev => ({ ...prev, api_credentials: e.target.value }))}
                placeholder='{"api_key": "***"}'
                rows={3}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="webhook_config">Webhook Config (JSON)</Label>
              <Textarea
                id="webhook_config"
                value={formData.webhook_config}
                onChange={(e) => setFormData(prev => ({ ...prev, webhook_config: e.target.value }))}
                placeholder='{"url": "", "events": []}'
                rows={2}
                className="font-mono text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="health_check_config">Health Check Config (JSON)</Label>
              <Textarea
                id="health_check_config"
                value={formData.health_check_config}
                onChange={(e) => setFormData(prev => ({ ...prev, health_check_config: e.target.value }))}
                placeholder='{"endpoint": "", "interval": 300}'
                rows={2}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={createProvider.isPending}>
              {createProvider.isPending ? 'Creating...' : 'Create Provider'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};