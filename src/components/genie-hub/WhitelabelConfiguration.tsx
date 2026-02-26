/**
 * WHITELABEL CONFIGURATION
 * Custom branding, colors, domain, and advanced settings for enterprise workspaces
 */

import React, { useState, useCallback } from 'react';
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
import { 
  Paintbrush, Globe, FileImage, Code, Lock, Crown, Save, 
  Upload, X, CheckCircle2, AlertCircle, Clock, Shield, ExternalLink, Copy, Check
} from 'lucide-react';
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

const WHITELABEL_TIERS = ['business', 'enterprise'];

// --- Copyable DNS Value ---
const CopyableValue: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast({ title: 'Copied!', description: `${label}: ${value}` });
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="p-3 bg-background rounded-lg border space-y-1.5">
      <span className="text-muted-foreground text-xs font-medium">{label}</span>
      <p className="font-mono font-semibold text-sm text-foreground break-all">{value}</p>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="w-full gap-1.5 h-7 text-xs mt-1"
      >
        {copied ? (
          <>
            <Check className="h-3 w-3 text-green-500" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" />
            Copy
          </>
        )}
      </Button>
    </div>
  );
};

// --- DNS Instructions ---
const DnsInstructions: React.FC<{ customDomain: string; teamId: string }> = ({ customDomain, teamId }) => {
  const cnameHost = customDomain?.split('.')[0] || 'app';
  const cnameTarget = 'genie-custom.genieaisuite.com';
  const txtName = '_genie-verify';
  const txtValue = `genie_verify=${teamId?.slice(0, 8) || 'xxxxxxxx'}`;

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-sm flex items-center gap-2">
        <Shield className="w-4 h-4 text-primary" />
        DNS Configuration Steps
      </h4>
      <div className="space-y-3">
        {/* Step 1 - CNAME */}
        <div className="flex gap-3 items-start">
          <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">1</div>
          <div className="flex-1">
            <p className="text-sm font-medium">Add CNAME Record</p>
            <p className="text-xs text-muted-foreground mb-2">Log into your domain registrar and create a CNAME record:</p>
            <div className="grid grid-cols-3 gap-2">
              <CopyableValue label="Type" value="CNAME" />
              <CopyableValue label="Name" value={cnameHost} />
              <CopyableValue label="Value" value={cnameTarget} />
            </div>
          </div>
        </div>
        {/* Step 2 - TXT */}
        <div className="flex gap-3 items-start">
          <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">2</div>
          <div className="flex-1">
            <p className="text-sm font-medium">Add TXT Verification Record</p>
            <p className="text-xs text-muted-foreground mb-2">Prove domain ownership:</p>
            <div className="grid grid-cols-3 gap-2">
              <CopyableValue label="Type" value="TXT" />
              <CopyableValue label="Name" value={txtName} />
              <CopyableValue label="Value" value={txtValue} />
            </div>
          </div>
        </div>
        {/* Step 3 */}
        <div className="flex gap-3 items-start">
          <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">3</div>
          <div>
            <p className="text-sm font-medium">Wait for Propagation</p>
            <p className="text-xs text-muted-foreground">
              DNS changes can take up to 72 hours. SSL certificate will be provisioned automatically once verified.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Logo Upload Sub-component ---
const LogoUploader: React.FC<{
  label: string;
  currentUrl: string | null;
  onUploaded: (url: string) => void;
  onRemove: () => void;
  teamId: string;
  fileKey: string;
}> = ({ label, currentUrl, onUploaded, onRemove, teamId, fileKey }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please upload an image file (PNG, JPG, SVG)', variant: 'destructive' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Maximum 2MB', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'png';
      const path = `whitelabel/${teamId}/${fileKey}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('brand-assets')
        .upload(path, file, { contentType: file.type, upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(path);

      onUploaded(urlData.publicUrl);
      toast({ title: `${label} uploaded successfully` });
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  }, [teamId, fileKey, label, onUploaded]);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        {currentUrl ? (
          <div className="relative group">
            <div className="h-16 w-16 rounded-lg border bg-muted/30 flex items-center justify-center overflow-hidden">
              <img src={currentUrl} alt={label} className="h-full w-full object-contain p-1" />
            </div>
            <button
              onClick={onRemove}
              className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="h-16 w-16 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
            <FileImage className="h-6 w-6 text-muted-foreground/50" />
          </div>
        )}
        <div className="flex-1">
          <label className="cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <span>
                <Upload className="h-3.5 w-3.5" />
                {uploading ? 'Uploading...' : currentUrl ? 'Replace' : 'Upload'}
              </span>
            </Button>
          </label>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG, SVG • Max 2MB</p>
        </div>
      </div>
      {/* Also allow URL input */}
      <Input
        value={currentUrl || ''}
        onChange={(e) => onUploaded(e.target.value)}
        placeholder="Or paste image URL..."
        className="text-xs"
      />
    </div>
  );
};

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

  // Fetch eligible teams
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

  React.useEffect(() => {
    if (whitelabelConfig) {
      setLocalConfig(whitelabelConfig);
    } else if (selectedTeamId) {
      setLocalConfig({ ...DEFAULT_CONFIG, team_id: selectedTeamId });
    }
    setHasChanges(false);
  }, [whitelabelConfig, selectedTeamId]);

  React.useEffect(() => {
    if (teams?.length && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  // Save mutation
  const saveConfig = useMutation({
    mutationFn: async (config: Partial<WhitelabelConfig>) => {
      if (!selectedTeamId) throw new Error('No team selected');
      const payload = { ...config, team_id: selectedTeamId };
      if (whitelabelConfig?.id) {
        const { data, error } = await supabase
          .from('genie_studio_whitelabel_configs')
          .update(payload)
          .eq('id', whitelabelConfig.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
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
              <FileImage className="w-4 h-4" /> Branding
            </TabsTrigger>
            <TabsTrigger value="colors" className="gap-2">
              <Paintbrush className="w-4 h-4" /> Colors
            </TabsTrigger>
            <TabsTrigger value="domain" className="gap-2">
              <Globe className="w-4 h-4" /> Domain
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-2">
              <Code className="w-4 h-4" /> Advanced
            </TabsTrigger>
          </TabsList>

          {/* ==================== BRANDING TAB ==================== */}
          <TabsContent value="branding" className="mt-6 space-y-6">
            {/* Logo & Favicon Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Logo & Favicon</CardTitle>
                <CardDescription>Upload your brand logo and favicon for a fully branded experience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <LogoUploader
                    label="Brand Logo"
                    currentUrl={localConfig.logo_url || null}
                    onUploaded={(url) => updateConfig('logo_url', url)}
                    onRemove={() => updateConfig('logo_url', null)}
                    teamId={selectedTeamId}
                    fileKey="logo"
                  />
                  <LogoUploader
                    label="Favicon"
                    currentUrl={localConfig.favicon_url || null}
                    onUploaded={(url) => updateConfig('favicon_url', url)}
                    onRemove={() => updateConfig('favicon_url', null)}
                    teamId={selectedTeamId}
                    fileKey="favicon"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Identity & Text */}
            <Card>
              <CardHeader>
                <CardTitle>Identity & Messaging</CardTitle>
                <CardDescription>Configure your app name and text shown to users</CardDescription>
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

          {/* ==================== COLORS TAB ==================== */}
          <TabsContent value="colors" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Color Scheme</CardTitle>
                <CardDescription>Customize your brand colors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  {[
                    { key: 'primary_color' as const, label: 'Primary Color', fallback: '#3B82F6' },
                    { key: 'secondary_color' as const, label: 'Secondary Color', fallback: '#1F2937' },
                    { key: 'accent_color' as const, label: 'Accent Color', fallback: '#10B981' },
                  ].map(({ key, label, fallback }) => (
                    <div key={key} className="space-y-2">
                      <Label>{label}</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={(localConfig[key] as string) || fallback}
                          onChange={(e) => updateConfig(key, e.target.value)}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={(localConfig[key] as string) || fallback}
                          onChange={(e) => updateConfig(key, e.target.value)}
                          placeholder={fallback}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {/* Preview */}
                <div className="mt-6 p-4 border rounded-lg">
                  <Label className="mb-3 block">Preview</Label>
                  <div className="flex gap-4 items-center flex-wrap">
                    <Button style={{ backgroundColor: localConfig.primary_color }}>
                      Primary Button
                    </Button>
                    <Button
                      variant="outline"
                      style={{
                        borderColor: localConfig.secondary_color,
                        color: localConfig.secondary_color,
                      }}
                    >
                      Secondary
                    </Button>
                    <Badge style={{ backgroundColor: localConfig.accent_color, color: 'white' }}>
                      Accent Badge
                    </Badge>
                    {localConfig.logo_url && (
                      <div className="h-8 ml-auto">
                        <img src={localConfig.logo_url} alt="Logo preview" className="h-full object-contain" />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== DOMAIN TAB ==================== */}
          <TabsContent value="domain" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Custom Domain
                </CardTitle>
                <CardDescription>Point your own domain to this workspace for a fully branded URL</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Your Custom Domain</Label>
                  <Input
                    value={localConfig.custom_domain || ''}
                    onChange={(e) => updateConfig('custom_domain', e.target.value)}
                    placeholder="app.yourcompany.com"
                  />
                </div>

                {/* Domain verification status */}
                {localConfig.custom_domain && (
                  <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium">Verification Pending</span>
                      <Badge variant="outline" className="ml-auto text-xs">Awaiting DNS</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Once you configure DNS records below, verification will complete automatically (up to 72 hours).
                    </p>
                  </div>
                )}

                {/* DNS Instructions */}
                <DnsInstructions 
                  customDomain={localConfig.custom_domain || ''} 
                  teamId={selectedTeamId} 
                />

                {/* SSL Info */}
                <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20 flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">SSL Included:</strong> A free SSL certificate will be automatically provisioned for your domain once DNS is verified.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== ADVANCED TAB ==================== */}
          <TabsContent value="advanced" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Custom CSS</CardTitle>
                <CardDescription>Fine-grained visual control with custom stylesheets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={localConfig.custom_css || ''}
                  onChange={(e) => updateConfig('custom_css', e.target.value)}
                  placeholder={`.my-header {\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n}\n\n.my-button {\n  border-radius: 999px;\n}`}
                  rows={12}
                  className="font-mono text-sm"
                />
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    CSS is injected into the page at runtime. Incorrect CSS may break the layout. Test thoroughly.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Toggle whitelabel behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <Label>Enable Whitelabel</Label>
                    <p className="text-xs text-muted-foreground">Master toggle for all whitelabel customizations</p>
                  </div>
                  <Switch
                    checked={localConfig.is_active !== false}
                    onCheckedChange={(checked) => updateConfig('is_active', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <Label>Hide "Powered by" Badge</Label>
                    <p className="text-xs text-muted-foreground">Remove Genie Suite attribution entirely</p>
                  </div>
                  <Switch
                    checked={localConfig.hide_powered_by || false}
                    onCheckedChange={(checked) => updateConfig('hide_powered_by', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Reference */}
            <Card className="border-dashed">
              <CardContent className="py-4">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" /> Whitelabel Applies To
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                  {['Login Screen', 'Navigation Bar', 'Email Templates', 'Public Genie Widget', 'Dashboard Header', 'Browser Tab (Favicon)', 'Footer', 'PDF Exports'].map(item => (
                    <div key={item} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                      {item}
                    </div>
                  ))}
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
