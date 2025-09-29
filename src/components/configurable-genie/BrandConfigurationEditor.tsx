/**
 * BRAND CONFIGURATION EDITOR
 * Comprehensive form for editing Genie brand configurations
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Brain, 
  Database, 
  Settings, 
  Code, 
  Plus, 
  Trash2,
  Save,
  X,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

import { GenieBrandConfig, useGenieBrandConfig } from '@/hooks/useGenieBrandConfig';
import { GenieModelDropdown } from '@/components/genie/GenieModelDropdown';
import { SelectedModelConfig } from '@/components/ai';

interface BrandConfigurationEditorProps {
  config?: GenieBrandConfig | null;
  onSave: (config: Omit<GenieBrandConfig, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const BrandConfigurationEditor: React.FC<BrandConfigurationEditorProps> = ({
  config,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const { getDefaultConfig, generateThemeCSS } = useGenieBrandConfig();
  const [formData, setFormData] = useState<Omit<GenieBrandConfig, 'id' | 'created_at' | 'updated_at'>>(
    config || getDefaultConfig()
  );
  const [previewTheme, setPreviewTheme] = useState(false);

  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedFieldChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev] as any,
        [field]: value
      }
    }));
  };

  const handleModelConfigChange = (models: SelectedModelConfig[]) => {
    handleNestedFieldChange('model_config', 'defaultModels', models);
  };

  const handleSave = async () => {
    await onSave(formData);
  };

  const applyPreviewTheme = () => {
    if (!previewTheme) return;
    
    const css = generateThemeCSS(formData.theme_config);
    const styleElement = document.createElement('style');
    styleElement.id = 'genie-preview-theme';
    styleElement.textContent = css;
    
    const existingStyle = document.getElementById('genie-preview-theme');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    document.head.appendChild(styleElement);
  };

  useEffect(() => {
    if (previewTheme) {
      applyPreviewTheme();
    } else {
      const existingStyle = document.getElementById('genie-preview-theme');
      if (existingStyle) {
        existingStyle.remove();
      }
    }
  }, [formData.theme_config, previewTheme]);

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {config ? 'Edit Configuration' : 'Create Configuration'}
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure your GENIE AI instance with custom branding, models, and features
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="rag">RAG</TabsTrigger>
          <TabsTrigger value="mcp">MCP</TabsTrigger>
          <TabsTrigger value="deployment">Deploy</TabsTrigger>
        </TabsList>

        {/* Basic Configuration */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand_name">Brand Name</Label>
                  <Input
                    id="brand_name"
                    value={formData.brand_name}
                    onChange={(e) => handleFieldChange('brand_name', e.target.value)}
                    placeholder="My Healthcare Brand"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_unit">Business Unit</Label>
                  <Input
                    id="business_unit"
                    value={formData.business_unit || ''}
                    onChange={(e) => handleFieldChange('business_unit', e.target.value)}
                    placeholder="Oncology Division"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="system_prompt">System Prompt</Label>
                <Textarea
                  id="system_prompt"
                  value={formData.system_prompt}
                  onChange={(e) => handleFieldChange('system_prompt', e.target.value)}
                  rows={4}
                  placeholder="You are GENIE AI, a helpful healthcare technology assistant..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="welcome_message">Welcome Message</Label>
                <Textarea
                  id="welcome_message"
                  value={formData.welcome_message}
                  onChange={(e) => handleFieldChange('welcome_message', e.target.value)}
                  rows={3}
                  placeholder="Hello! I'm GENIE AI, your healthcare technology navigator..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleFieldChange('is_active', checked)}
                />
                <Label htmlFor="is_active">Active Configuration</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Theme Configuration */}
        <TabsContent value="theme" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme Configuration
                <div className="ml-auto flex items-center space-x-2">
                  <Switch
                    id="preview_theme"
                    checked={previewTheme}
                    onCheckedChange={setPreviewTheme}
                  />
                  <Label htmlFor="preview_theme" className="text-sm">Live Preview</Label>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="primary_color"
                      value={formData.theme_config.primaryColor}
                      onChange={(e) => handleNestedFieldChange('theme_config', 'primaryColor', e.target.value)}
                      className="w-20"
                    />
                    <Input
                      value={formData.theme_config.primaryColor}
                      onChange={(e) => handleNestedFieldChange('theme_config', 'primaryColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="secondary_color"
                      value={formData.theme_config.secondaryColor}
                      onChange={(e) => handleNestedFieldChange('theme_config', 'secondaryColor', e.target.value)}
                      className="w-20"
                    />
                    <Input
                      value={formData.theme_config.secondaryColor}
                      onChange={(e) => handleNestedFieldChange('theme_config', 'secondaryColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accent_color">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="accent_color"
                      value={formData.theme_config.accentColor}
                      onChange={(e) => handleNestedFieldChange('theme_config', 'accentColor', e.target.value)}
                      className="w-20"
                    />
                    <Input
                      value={formData.theme_config.accentColor}
                      onChange={(e) => handleNestedFieldChange('theme_config', 'accentColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branding_text">Branding Text</Label>
                  <Input
                    id="branding_text"
                    value={formData.theme_config.brandingText}
                    onChange={(e) => handleNestedFieldChange('theme_config', 'brandingText', e.target.value)}
                    placeholder="GENIE AI"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="font_family">Font Family</Label>
                  <Select
                    value={formData.theme_config.fontFamily}
                    onValueChange={(value) => handleNestedFieldChange('theme_config', 'fontFamily', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system-ui">System UI</SelectItem>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      <SelectItem value="Lato">Lato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo_url">Logo URL (Optional)</Label>
                <Input
                  id="logo_url"
                  value={formData.theme_config.logoUrl || ''}
                  onChange={(e) => handleNestedFieldChange('theme_config', 'logoUrl', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Model Configuration */}
        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Model Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default_mode">Default Mode</Label>
                  <Select
                    value={formData.model_config.defaultMode}
                    onValueChange={(value) => handleNestedFieldChange('model_config', 'defaultMode', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Model</SelectItem>
                      <SelectItem value="multi">Multi Model</SelectItem>
                      <SelectItem value="system">System Mode</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max_models">Max Models</Label>
                  <Input
                    id="max_models"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.model_config.maxModels}
                    onChange={(e) => handleNestedFieldChange('model_config', 'maxModels', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.model_config.temperature}
                    onChange={(e) => handleNestedFieldChange('model_config', 'temperature', parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Default Models</Label>
                <GenieModelDropdown
                  selectedModels={formData.model_config.defaultModels}
                  onModelsChange={handleModelConfigChange}
                  mode={formData.model_config.defaultMode}
                  maxSelections={formData.model_config.maxModels}
                />
              </div>

              <div className="space-y-2">
                <Label>Enabled Features</Label>
                <div className="flex flex-wrap gap-2">
                  {['medical', 'vision', 'tools', 'analytics'].map((feature) => (
                    <Badge
                      key={feature}
                      variant={formData.model_config.enabledFeatures.includes(feature) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        const features = formData.model_config.enabledFeatures;
                        const newFeatures = features.includes(feature)
                          ? features.filter(f => f !== feature)
                          : [...features, feature];
                        handleNestedFieldChange('model_config', 'enabledFeatures', newFeatures);
                      }}
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RAG Configuration */}
        <TabsContent value="rag" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                RAG Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="rag_enabled"
                  checked={formData.rag_config.enabled}
                  onCheckedChange={(checked) => handleNestedFieldChange('rag_config', 'enabled', checked)}
                />
                <Label htmlFor="rag_enabled">Enable RAG</Label>
              </div>

              {formData.rag_config.enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="context_window">Context Window Size</Label>
                      <Input
                        id="context_window"
                        type="number"
                        min="1"
                        max="50"
                        value={formData.rag_config.contextWindowSize}
                        onChange={(e) => handleNestedFieldChange('rag_config', 'contextWindowSize', parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="enhancement_level">Enhancement Level</Label>
                      <Select
                        value={formData.rag_config.ragEnhancementLevel}
                        onValueChange={(value) => handleNestedFieldChange('rag_config', 'ragEnhancementLevel', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="future_context"
                      checked={formData.rag_config.enableFutureContext}
                      onCheckedChange={(checked) => handleNestedFieldChange('rag_config', 'enableFutureContext', checked)}
                    />
                    <Label htmlFor="future_context">Enable Future Context Learning</Label>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* MCP Configuration */}
        <TabsContent value="mcp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                MCP Tools Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="mcp_enabled"
                  checked={formData.mcp_config.enabled}
                  onCheckedChange={(checked) => handleNestedFieldChange('mcp_config', 'enabled', checked)}
                />
                <Label htmlFor="mcp_enabled">Enable MCP Tools</Label>
              </div>

              {formData.mcp_config.enabled && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Available Tools</Label>
                    <div className="flex flex-wrap gap-2">
                      {['search', 'calendar', 'email', 'files', 'database', 'api'].map((tool) => (
                        <Badge
                          key={tool}
                          variant={formData.mcp_config.enabledTools.includes(tool) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            const tools = formData.mcp_config.enabledTools;
                            const newTools = tools.includes(tool)
                              ? tools.filter(t => t !== tool)
                              : [...tools, tool];
                            handleNestedFieldChange('mcp_config', 'enabledTools', newTools);
                          }}
                        >
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deployment Configuration */}
        <TabsContent value="deployment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Deployment Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="embed_type">Embed Type</Label>
                  <Select
                    value={formData.deployment_config.embedType}
                    onValueChange={(value) => handleNestedFieldChange('deployment_config', 'embedType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popup">Popup</SelectItem>
                      <SelectItem value="inline">Inline</SelectItem>
                      <SelectItem value="fullscreen">Fullscreen</SelectItem>
                      <SelectItem value="sidebar">Sidebar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Select
                    value={formData.deployment_config.position}
                    onValueChange={(value) => handleNestedFieldChange('deployment_config', 'position', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="top-left">Top Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trigger_text">Trigger Text</Label>
                <Input
                  id="trigger_text"
                  value={formData.deployment_config.triggerText}
                  onChange={(e) => handleNestedFieldChange('deployment_config', 'triggerText', e.target.value)}
                  placeholder="Chat with GENIE"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="analytics_enabled"
                  checked={formData.deployment_config.enableAnalytics}
                  onCheckedChange={(checked) => handleNestedFieldChange('deployment_config', 'enableAnalytics', checked)}
                />
                <Label htmlFor="analytics_enabled">Enable Analytics</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="require_auth"
                  checked={formData.deployment_config.requireAuth}
                  onCheckedChange={(checked) => handleNestedFieldChange('deployment_config', 'requireAuth', checked)}
                />
                <Label htmlFor="require_auth">Require Authentication</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};