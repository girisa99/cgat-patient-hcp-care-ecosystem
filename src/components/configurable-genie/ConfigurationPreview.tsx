/**
 * CONFIGURATION PREVIEW
 * Live preview of Genie configuration with interactive demo
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Eye, 
  Smartphone, 
  Monitor, 
  Tablet,
  Palette,
  Brain,
  Database,
  Zap,
  Play,
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';

import { GenieBrandConfig } from '@/hooks/useGenieBrandConfig';
import { ConfigurableGenieWidget } from './ConfigurableGenieWidget';

interface ConfigurationPreviewProps {
  config: GenieBrandConfig;
  onClose: () => void;
}

export const ConfigurationPreview: React.FC<ConfigurationPreviewProps> = ({
  config,
  onClose
}) => {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [embedType, setEmbedType] = useState(config.deployment_config.embedType);
  const [position, setPosition] = useState(config.deployment_config.position);
  const [showWidget, setShowWidget] = useState(false);

  // Apply preview theme
  useEffect(() => {
    const css = `
      .preview-container {
        background-color: ${config.theme_config.backgroundColor};
        color: ${config.theme_config.textColor};
        font-family: ${config.theme_config.fontFamily};
      }
      
      .preview-primary {
        background-color: ${config.theme_config.primaryColor};
      }
      
      .preview-secondary {
        background-color: ${config.theme_config.secondaryColor};
      }
      
      .preview-accent {
        background-color: ${config.theme_config.accentColor};
      }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'genie-preview-styles';
    styleElement.textContent = css;
    
    const existingStyle = document.getElementById('genie-preview-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    document.head.appendChild(styleElement);
    
    return () => {
      const style = document.getElementById('genie-preview-styles');
      if (style) {
        style.remove();
      }
    };
  }, [config.theme_config]);

  const getPreviewSize = () => {
    switch (previewMode) {
      case 'mobile':
        return 'w-80 h-[600px]';
      case 'tablet':
        return 'w-[768px] h-[600px]';
      case 'desktop':
      default:
        return 'w-full h-[600px]';
    }
  };

  const ConfigSummary = ({ title, icon: Icon, children }: { 
    title: string; 
    icon: React.ElementType; 
    children: React.ReactNode; 
  }) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Configuration Preview</h1>
            <p className="text-muted-foreground mt-1">
              Preview {config.brand_name} configuration
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={previewMode === 'desktop' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode('desktop')}
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant={previewMode === 'tablet' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode('tablet')}
          >
            <Tablet className="h-4 w-4" />
          </Button>
          <Button
            variant={previewMode === 'mobile' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode('mobile')}
          >
            <Smartphone className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Summary */}
        <div className="space-y-4">
          <ConfigSummary title="Theme" icon={Palette}>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-2">Colors</p>
                <div className="flex gap-2">
                  <div 
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: config.theme_config.primaryColor }}
                    title="Primary"
                  />
                  <div 
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: config.theme_config.secondaryColor }}
                    title="Secondary"
                  />
                  <div 
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: config.theme_config.accentColor }}
                    title="Accent"
                  />
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium">Branding</p>
                <p className="text-sm text-muted-foreground">{config.theme_config.brandingText}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Font</p>
                <p className="text-sm text-muted-foreground">{config.theme_config.fontFamily}</p>
              </div>
            </div>
          </ConfigSummary>

          <ConfigSummary title="Models" icon={Brain}>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{config.model_config.defaultMode}</Badge>
                <span className="text-sm text-muted-foreground">
                  {config.model_config.defaultModels.length} model{config.model_config.defaultModels.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="space-y-1">
                {config.model_config.defaultModels.slice(0, 3).map((model, index) => (
                  <div key={index} className="text-xs text-muted-foreground">
                    {model.provider}/{model.model}
                  </div>
                ))}
                {config.model_config.defaultModels.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{config.model_config.defaultModels.length - 3} more
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-1 pt-2">
                {config.model_config.enabledFeatures.map((feature) => (
                  <Badge key={feature} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </ConfigSummary>

          <ConfigSummary title="Features" icon={Database}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">RAG</span>
                <Badge variant={config.rag_config.enabled ? 'default' : 'secondary'}>
                  {config.rag_config.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">MCP Tools</span>
                <Badge variant={config.mcp_config.enabled ? 'default' : 'secondary'}>
                  {config.mcp_config.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Analytics</span>
                <Badge variant={config.deployment_config.enableAnalytics ? 'default' : 'secondary'}>
                  {config.deployment_config.enableAnalytics ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Authentication</span>
                <Badge variant={config.deployment_config.requireAuth ? 'default' : 'secondary'}>
                  {config.deployment_config.requireAuth ? 'Required' : 'Optional'}
                </Badge>
              </div>
            </div>
          </ConfigSummary>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Preview Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Embed Type</label>
                <select
                  value={embedType}
                  onChange={(e) => setEmbedType(e.target.value as any)}
                  className="w-full p-2 border rounded text-sm"
                >
                  <option value="popup">Popup</option>
                  <option value="inline">Inline</option>
                  <option value="fullscreen">Fullscreen</option>
                  <option value="sidebar">Sidebar</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Position</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as any)}
                  className="w-full p-2 border rounded text-sm"
                  disabled={embedType === 'inline' || embedType === 'fullscreen'}
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="top-left">Top Left</option>
                  <option value="center">Center</option>
                </select>
              </div>
              
              <Button
                onClick={() => setShowWidget(!showWidget)}
                className="w-full"
                variant={showWidget ? 'secondary' : 'default'}
              >
                <Play className="h-4 w-4 mr-2" />
                {showWidget ? 'Hide Widget' : 'Show Widget'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Live Preview
                <Badge variant="outline" className="ml-auto">
                  {previewMode}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full">
              <div className="flex justify-center items-center h-full min-h-[500px]">
                <motion.div
                  key={previewMode}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`preview-container border rounded-lg ${getPreviewSize()} relative overflow-hidden`}
                  style={{
                    backgroundColor: config.theme_config.backgroundColor,
                    fontFamily: config.theme_config.fontFamily
                  }}
                >
                  {/* Mock website content */}
                  <div className="p-6 h-full">
                    <div className="space-y-4">
                      <div 
                        className="h-12 rounded preview-primary opacity-20"
                        style={{ backgroundColor: config.theme_config.primaryColor }}
                      />
                      <div className="space-y-2">
                        <div 
                          className="h-4 rounded preview-secondary opacity-15 w-3/4"
                          style={{ backgroundColor: config.theme_config.secondaryColor }}
                        />
                        <div 
                          className="h-4 rounded preview-secondary opacity-15 w-1/2"
                          style={{ backgroundColor: config.theme_config.secondaryColor }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div 
                          className="h-24 rounded preview-accent opacity-10"
                          style={{ backgroundColor: config.theme_config.accentColor }}
                        />
                        <div 
                          className="h-24 rounded preview-accent opacity-10"
                          style={{ backgroundColor: config.theme_config.accentColor }}
                        />
                      </div>
                    </div>
                    
                    {/* Centered welcome message for preview */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                      <div className="text-center text-white p-6 rounded-lg bg-black bg-opacity-70">
                        <h3 className="text-xl font-bold mb-2">{config.brand_name}</h3>
                        <p className="text-sm opacity-90">{config.welcome_message}</p>
                        <div className="mt-4 text-xs opacity-75">
                          Click "Show Widget" to see the interactive preview
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Widget overlay */}
                  {showWidget && (
                    <ConfigurableGenieWidget
                      configId={config.id}
                      embedType={embedType}
                      position={position}
                      className="absolute"
                    />
                  )}
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};