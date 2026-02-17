/**
 * WHITELABEL CONFIGURATION
 * Custom branding, colors, and domain settings for enterprise workspaces
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Paintbrush, Globe, FileImage, Code, Lock, Crown, Save, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface WhitelabelConfig {
  id?: string;
  team_id: string;
  app_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  custom_domain: string | null;
  custom_css: string | null;
  header_text: string | null;
  footer_text: string | null;
  login_message: string | null;
  hide_powered_by: boolean;
  is_active: boolean;
}

const DEFAULT_CONFIG: Partial<WhitelabelConfig> = {
  app_name: 'Genie Suite',
  primary_color: '#3B82F6',
  secondary_color: '#1F2937',
  accent_color: '#10B981',
  hide_powered_by: false,
  is_active: true,
};

// Tiers that allow whitelabel
const WHITELABEL_TIERS = ['business', 'enterprise'];

export const WhitelabelConfiguration: React.FC = () => {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [localConfig, setLocalConfig] = useState<Partial<WhitelabelConfig>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const queryClient = useQueryClient();

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['genie-studio-user'],
    queryFn: async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) return null;
      
      const { data } = await supabase
        .from('genie_studio_users')
        .select('*')
        .eq('auth_user_id', authData.user.id)
        .maybeSingle();
      return data;
    },
  });

  // Fetch eligible teams (business/enterprise only)
  const { data: teams } = useQuery({
    queryKey: ['genie-studio-teams-whitelabel'],
    queryFn: async () => {
      if (!currentUser) return [];
      
      const { data: memberships } = await supabase
        .from('genie_studio_team_members')
        .select('team_id, role')
        .eq('user_id', currentUser.id)
        .in('role', ['owner', 'admin']);
      
      if (!memberships?.length) return [];
      
      const teamIds = memberships.map(m => m.team_id);
      const { data: teams } = await supabase
        .from('genie_studio_teams')
        .select('*')
        .in('id', teamIds)
        .in('subscription_tier', WHITELABEL_TIERS);
      
      return teams || [];
    },
    enabled: !!currentUser,
  });

  // Fetch whitelabel config for selected team
  const { data: whitelabelConfig, isLoading } = useQuery({
    queryKey: ['whitelabel-config', selectedTeamId],
    queryFn: async () => {
      if (!selectedTeamId) return null;
      
      const { data } = await supabase
        .from('genie_studio_whitelabel_configs')
        .select('*')
        .eq('team_id', selectedTeamId)
        .maybeSingle();
      
      return data;
    },
    enabled: !!selectedTeamId,
  });

  // Initialize local config when data loads
  React.useEffect(() => {
    if (whitelabelConfig) {
      setLocalConfig(whitelabelConfig);
    } else if (selectedTeamId) {
      setLocalConfig({ ...DEFAULT_CONFIG, team_id: selectedTeamId });
    }
    setHasChanges(false);
  }, [whitelabelConfig, selectedTeamId]);

  // Auto-select first team if available
  React.useEffect(() => {
    if (teams?.length && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  // Save mutation
  const saveConfig = useMutation({
    mutationFn: async (config: Partial<WhitelabelConfig>) => {
      if (!selectedTeamId) throw new Error('No team selected');
      
      const payload = {
        ...config,
        team_id: selectedTeamId,
      };
      
      if (whitelabelConfig?.id) {
        // Update existing
        const { data, error } = await supabase
          .from('genie_studio_whitelabel_configs')
          .update(payload)
          .eq('id', whitelabelConfig.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('genie_studio_whitelabel_configs')
          .insert(payload)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whitelabel-config', selectedTeamId] });
      setHasChanges(false);
      toast({ title: 'Whitelabel settings saved' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to save settings', description: error.message, variant: 'destructive' });
    },
  });

  const updateConfig = (key: keyof WhitelabelConfig, value: any) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const tier = currentUser?.current_subscription_tier || 'free';
  const canUseWhitelabel = WHITELABEL_TIERS.includes(tier);

  if (!canUseWhitelabel) {
    return (
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="py-12 text-center">
          <Lock className="w-12 h-12 mx-auto text-amber-500 mb-4" />
          <h3 className="font-semibold text-lg mb-2">Whitelabel is a Premium Feature</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Custom branding, domains, and styling are available on Business and Enterprise plans
          </p>
          <Button className="gap-2">
            <Crown className="w-4 h-4" />
            Upgrade to Business
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Paintbrush className="w-5 h-5 text-primary" />
            Whitelabel Configuration
          </h2>
          <p className="text-sm text-muted-foreground">
            Customize branding, colors, and domain for your workspace
          </p>
        </div>
        
        <div className="flex gap-2">
          {teams && teams.length > 0 && (
            <Select value={selectedTeamId || ''} onValueChange={setSelectedTeamId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select workspace" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team: any) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <Button
            onClick={() => saveConfig.mutate(localConfig)}
            disabled={!hasChanges || saveConfig.isPending}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {saveConfig.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {!selectedTeamId ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Paintbrush className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No eligible workspace</h3>
            <p className="text-sm text-muted-foreground">
              Create a Business or Enterprise workspace to configure whitelabel
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading configuration...</div>
      ) : (
        <Tabs defaultValue="branding" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="branding" className="gap-2">
              <FileImage className="w-4 h-4" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="colors" className="gap-2">
              <Paintbrush className="w-4 h-4" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="domain" className="gap-2">
              <Globe className="w-4 h-4" />
              Domain
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-2">
              <Code className="w-4 h-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="branding" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Branding & Identity</CardTitle>
                <CardDescription>Configure your app name, logo, and messaging</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>App Name</Label>
                    <Input
                      value={localConfig.app_name || ''}
                      onChange={(e) => updateConfig('app_name', e.target.value)}
                      placeholder="Your App Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Logo URL</Label>
                    <Input
                      value={localConfig.logo_url || ''}
                      onChange={(e) => updateConfig('logo_url', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Favicon URL</Label>
                    <Input
                      value={localConfig.favicon_url || ''}
                      onChange={(e) => updateConfig('favicon_url', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Header Text</Label>
                    <Input
                      value={localConfig.header_text || ''}
                      onChange={(e) => updateConfig('header_text', e.target.value)}
                      placeholder="Welcome to our platform"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Login Message</Label>
                  <Textarea
                    value={localConfig.login_message || ''}
                    onChange={(e) => updateConfig('login_message', e.target.value)}
                    placeholder="Custom message shown on login page"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Footer Text</Label>
                  <Input
                    value={localConfig.footer_text || ''}
                    onChange={(e) => updateConfig('footer_text', e.target.value)}
                    placeholder="© 2026 Your Company"
                  />
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <Label>Hide "Powered by Genie Suite"</Label>
                    <p className="text-xs text-muted-foreground">Remove the attribution from your app</p>
                  </div>
                  <Switch
                    checked={localConfig.hide_powered_by || false}
                    onCheckedChange={(checked) => updateConfig('hide_powered_by', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="colors" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Color Scheme</CardTitle>
                <CardDescription>Customize your brand colors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={localConfig.primary_color || '#3B82F6'}
                        onChange={(e) => updateConfig('primary_color', e.target.value)}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={localConfig.primary_color || '#3B82F6'}
                        onChange={(e) => updateConfig('primary_color', e.target.value)}
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={localConfig.secondary_color || '#1F2937'}
                        onChange={(e) => updateConfig('secondary_color', e.target.value)}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={localConfig.secondary_color || '#1F2937'}
                        onChange={(e) => updateConfig('secondary_color', e.target.value)}
                        placeholder="#1F2937"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Accent Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={localConfig.accent_color || '#10B981'}
                        onChange={(e) => updateConfig('accent_color', e.target.value)}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={localConfig.accent_color || '#10B981'}
                        onChange={(e) => updateConfig('accent_color', e.target.value)}
                        placeholder="#10B981"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Preview */}
                <div className="mt-6 p-4 border rounded-lg">
                  <Label className="mb-3 block">Preview</Label>
                  <div className="flex gap-4">
                    <Button style={{ backgroundColor: localConfig.primary_color }}>
                      Primary Button
                    </Button>
                    <Button 
                      variant="outline" 
                      style={{ 
                        borderColor: localConfig.secondary_color,
                        color: localConfig.secondary_color 
                      }}
                    >
                      Secondary
                    </Button>
                    <Badge style={{ backgroundColor: localConfig.accent_color, color: 'white' }}>
                      Accent Badge
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="domain" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Custom Domain</CardTitle>
                <CardDescription>Configure your own domain for the workspace</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Custom Domain</Label>
                  <Input
                    value={localConfig.custom_domain || ''}
                    onChange={(e) => updateConfig('custom_domain', e.target.value)}
                    placeholder="app.yourcompany.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    You'll need to configure DNS settings to point to our servers
                  </p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <h4 className="font-medium">DNS Configuration</h4>
                  <p className="text-sm text-muted-foreground">
                    Add the following CNAME record to your DNS:
                  </p>
                  <code className="block p-2 bg-background rounded text-sm">
                    CNAME → genie-custom.genieaisuite.com
                  </code>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Customization</CardTitle>
                <CardDescription>Add custom CSS for fine-grained control</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Custom CSS</Label>
                  <Textarea
                    value={localConfig.custom_css || ''}
                    onChange={(e) => updateConfig('custom_css', e.target.value)}
                    placeholder={`.my-custom-class {\n  color: #333;\n}`}
                    rows={10}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    CSS will be injected into the page. Use with caution.
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <Label>Enable Whitelabel</Label>
                    <p className="text-xs text-muted-foreground">Toggle all whitelabel settings on/off</p>
                  </div>
                  <Switch
                    checked={localConfig.is_active !== false}
                    onCheckedChange={(checked) => updateConfig('is_active', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default WhitelabelConfiguration;
