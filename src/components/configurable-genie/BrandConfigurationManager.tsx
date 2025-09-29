/**
 * BRAND CONFIGURATION MANAGER
 * Comprehensive interface for managing Genie brand configurations
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Palette, 
  Brain, 
  Database, 
  Code, 
  Copy, 
  Edit, 
  Trash2, 
  Plus,
  Eye,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

import { useGenieBrandConfig, GenieBrandConfig } from '@/hooks/useGenieBrandConfig';
import { BrandConfigurationEditor } from './BrandConfigurationEditor';
import { DeploymentCodeGenerator } from './DeploymentCodeGenerator';
import { ConfigurationPreview } from './ConfigurationPreview';

export const BrandConfigurationManager: React.FC = () => {
  const [selectedConfig, setSelectedConfig] = useState<GenieBrandConfig | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showDeployment, setShowDeployment] = useState(false);

  const {
    brandConfigs,
    isLoading,
    createBrandConfig,
    updateBrandConfig,
    deleteBrandConfig,
    cloneBrandConfig,
    getDefaultConfig,
    isCreating: isCreatingConfig,
    isUpdating,
    isDeleting,
    isCloning
  } = useGenieBrandConfig();

  const handleCreateNew = () => {
    setSelectedConfig(null);
    setIsCreating(true);
  };

  const handleEdit = (config: GenieBrandConfig) => {
    setSelectedConfig(config);
    setIsCreating(true);
  };

  const handleClone = async (config: GenieBrandConfig) => {
    cloneBrandConfig(config.id!);
  };

  const handleDelete = async (config: GenieBrandConfig) => {
    if (window.confirm(`Are you sure you want to delete "${config.brand_name}"?`)) {
      deleteBrandConfig(config.id!);
    }
  };

  const handleSave = async (configData: Omit<GenieBrandConfig, 'id' | 'created_at' | 'updated_at'>) => {
    if (selectedConfig?.id) {
      updateBrandConfig({ id: selectedConfig.id, ...configData });
    } else {
      createBrandConfig(configData);
    }
    setIsCreating(false);
    setSelectedConfig(null);
  };

  const handlePreview = (config: GenieBrandConfig) => {
    setSelectedConfig(config);
    setShowPreview(true);
  };

  const handleShowDeployment = (config: GenieBrandConfig) => {
    setSelectedConfig(config);
    setShowDeployment(true);
  };

  if (isCreating) {
    return (
      <BrandConfigurationEditor
        config={selectedConfig}
        onSave={handleSave}
        onCancel={() => {
          setIsCreating(false);
          setSelectedConfig(null);
        }}
        isLoading={isCreatingConfig || isUpdating}
      />
    );
  }

  if (showPreview && selectedConfig) {
    return (
      <ConfigurationPreview
        config={selectedConfig}
        onClose={() => {
          setShowPreview(false);
          setSelectedConfig(null);
        }}
      />
    );
  }

  if (showDeployment && selectedConfig) {
    return (
      <DeploymentCodeGenerator
        config={selectedConfig}
        onClose={() => {
          setShowDeployment(false);
          setSelectedConfig(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">GENIE Brand Configurations</h1>
          <p className="text-muted-foreground mt-2">
            Manage configurable GENIE AI instances for different brands and business units
          </p>
        </div>
        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Configuration
        </Button>
      </div>

      {/* Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : brandConfigs?.length === 0 ? (
          // Empty state
          <div className="col-span-full text-center py-12">
            <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Configurations Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first GENIE brand configuration to get started
            </p>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Configuration
            </Button>
          </div>
        ) : (
          // Configuration cards
          brandConfigs?.map((config) => (
            <motion.div
              key={config.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{config.brand_name}</CardTitle>
                      {config.business_unit && (
                        <p className="text-sm text-muted-foreground truncate">
                          {config.business_unit}
                        </p>
                      )}
                    </div>
                    <Badge variant={config.is_active ? 'default' : 'secondary'}>
                      {config.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Theme Preview */}
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <div className="flex gap-1">
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: config.theme_config.primaryColor }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: config.theme_config.secondaryColor }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: config.theme_config.accentColor }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {config.theme_config.brandingText}
                    </span>
                  </div>

                  {/* Model Config */}
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {config.model_config.defaultModels.length} model{config.model_config.defaultModels.length !== 1 ? 's' : ''}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {config.model_config.defaultMode}
                    </Badge>
                  </div>

                  {/* Features */}
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <div className="flex gap-1 flex-wrap">
                      {config.rag_config.enabled && (
                        <Badge variant="outline" className="text-xs">RAG</Badge>
                      )}
                      {config.mcp_config.enabled && (
                        <Badge variant="outline" className="text-xs">MCP</Badge>
                      )}
                      {config.deployment_config.enableAnalytics && (
                        <Badge variant="outline" className="text-xs">Analytics</Badge>
                      )}
                    </div>
                  </div>

                  {/* Meta info */}
                  <div className="text-xs text-muted-foreground">
                    Created {format(new Date(config.created_at!), 'MMM dd, yyyy')}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handlePreview(config)}
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(config)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleClone(config)}
                      disabled={isCloning}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleShowDeployment(config)}
                    >
                      <Code className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(config)}
                      disabled={isDeleting}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};