/**
 * GENIE CONFIGURATION DASHBOARD
 * Visual configuration builder interface with real-time provider status
 * and advanced configuration management capabilities
 */
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Settings2,
  Download,
  Upload,
  Save,
  Check,
  X,
  AlertCircle,
  Activity,
  Brain,
  Database,
  Zap,
  FileText,
  Microscope,
  Wrench,
  Eye,
  Globe,
  Shield,
  Clock,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UniversalModelSelector, SelectedModelConfig } from '@/components/ai';
import { useGenieState, GenieConfiguration } from '@/hooks/useGenieState';
import { useAIServiceHealth } from '@/hooks/useAIServiceHealth';
import { useMasterToast } from '@/hooks/useMasterToast';
import { GenieProviderStatusPanel } from './GenieProviderStatusPanel';

interface GenieConfigurationDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigurationSelect: (config: GenieConfiguration) => void;
}

export const GenieConfigurationDashboard: React.FC<GenieConfigurationDashboardProps> = ({
  isOpen,
  onClose,
  onConfigurationSelect
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [editingConfig, setEditingConfig] = useState<Partial<GenieConfiguration> | null>(null);
  const [configName, setConfigName] = useState('');
  const [selectedModels, setSelectedModels] = useState<SelectedModelConfig[]>([]);
  const [selectedMode, setSelectedMode] = useState<'system' | 'single' | 'multi'>('single');
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>([]);
  const [selectedMCPTools, setSelectedMCPTools] = useState<string[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState('');
  const [medicalContext, setMedicalContext] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const { 
    configurations, 
    currentConfig, 
    loading, 
    saveConfiguration, 
    loadConfigurations 
  } = useGenieState();
  
  const { status, checkHealth, healthyProviders } = useAIServiceHealth();
  const { showSuccess, showError } = useMasterToast();

  // Load health status on mount
  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  // Auto-refresh health status every 30 seconds
  useEffect(() => {
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  const handleFeatureToggle = useCallback((feature: string) => {
    setEnabledFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  }, []);

  const handleMCPToolToggle = useCallback((tool: string) => {
    setSelectedMCPTools(prev =>
      prev.includes(tool)
        ? prev.filter(t => t !== tool)
        : [...prev, tool]
    );
  }, []);

  const handleSaveConfiguration = useCallback(async () => {
    if (!configName.trim()) {
      showError('Configuration name is required');
      return;
    }

    setSaving(true);

    const config: Omit<GenieConfiguration, 'id'> = {
      configuration_name: configName,
      selected_mode: selectedMode,
      selected_models: selectedModels.map(m => m.model),
      left_model: selectedModels.find(m => m.role === 'primary')?.model || '',
      right_model: selectedModels.find(m => m.role === 'secondary')?.model || '',
      selected_model_type: selectedModels[0]?.category as 'llm' | 'slm' | 'vlm' || 'llm',
      enabled_features: enabledFeatures,
      selected_mcp_tools: selectedMCPTools,
      knowledge_base: knowledgeBase,
      medical_context: medicalContext,
      is_default: isDefault
    };

    const saved = await saveConfiguration(config);
    if (saved) {
      showSuccess('Configuration saved successfully');
      resetForm();
      setActiveTab('overview');
    }
    setSaving(false);
  }, [
    configName, selectedMode, selectedModels, enabledFeatures, 
    selectedMCPTools, knowledgeBase, medicalContext, isDefault,
    saveConfiguration, showSuccess, showError
  ]);

  const resetForm = useCallback(() => {
    setConfigName('');
    setSelectedModels([]);
    setSelectedMode('single');
    setEnabledFeatures([]);
    setSelectedMCPTools([]);
    setKnowledgeBase('');
    setMedicalContext(false);
    setIsDefault(false);
    setEditingConfig(null);
  }, []);

  const loadConfiguration = useCallback((config: GenieConfiguration) => {
    setConfigName(config.configuration_name);
    setSelectedMode(config.selected_mode);
    setEnabledFeatures(config.enabled_features);
    setSelectedMCPTools(config.selected_mcp_tools);
    setKnowledgeBase(config.knowledge_base);
    setMedicalContext(config.medical_context);
    setIsDefault(config.is_default);
    setEditingConfig(config);
    setActiveTab('builder');
  }, []);

  const exportConfiguration = useCallback(() => {
    if (!currentConfig) return;
    
    const dataStr = JSON.stringify(currentConfig, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `genie-config-${currentConfig.configuration_name}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showSuccess('Configuration exported');
  }, [currentConfig, showSuccess]);

  const importConfiguration = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        loadConfiguration(config);
        showSuccess('Configuration imported successfully');
      } catch (error) {
        showError('Failed to import configuration');
      }
    };
    reader.readAsText(file);
  }, [loadConfiguration, showSuccess, showError]);

  const availableFeatures = [
    { id: 'knowledge', label: 'Knowledge Base', icon: Database, description: 'Access to curated knowledge repositories' },
    { id: 'rag', label: 'RAG Search', icon: FileText, description: 'Retrieval-Augmented Generation capabilities' },
    { id: 'medical', label: 'Medical Context', icon: Microscope, description: 'Healthcare and medical expertise' },
    { id: 'tools', label: 'MCP Tools', icon: Wrench, description: 'Model Context Protocol tool integration' },
    { id: 'vision', label: 'Vision Analysis', icon: Eye, description: 'Image and document processing' },
    { id: 'web', label: 'Web Search', icon: Globe, description: 'Real-time web information retrieval' }
  ];

  const availableMCPTools = [
    'filesystem', 'memory', 'web-search', 'database', 'api-client', 
    'document-processor', 'image-analyzer', 'code-executor', 'calculator'
  ];

  const getProviderStatus = useCallback((provider: string) => {
    const isHealthy = healthyProviders.includes(provider);
    return {
      status: isHealthy ? 'healthy' : 'unavailable',
      color: isHealthy ? 'text-green-600' : 'text-red-600',
      bgColor: isHealthy ? 'bg-green-100' : 'bg-red-100'
    };
  }, [healthyProviders]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl h-[85vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            GENIE Configuration Dashboard
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-full">
          {/* Sidebar Navigation */}
          <div className="w-48 border-r bg-muted/30 p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
              <TabsList className="grid w-full grid-rows-4 h-auto">
                <TabsTrigger value="overview" className="justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="builder" className="justify-start">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Builder
                </TabsTrigger>
                <TabsTrigger value="health" className="justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  Health
                </TabsTrigger>
                <TabsTrigger value="management" className="justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Manage
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Overview Tab */}
              <TabsContent value="overview" className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Active Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-semibold">{currentConfig?.configuration_name || 'None'}</p>
                      <p className="text-sm text-muted-foreground">Mode: {currentConfig?.selected_mode || 'N/A'}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Configurations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-semibold">{configurations.length}</p>
                      <p className="text-sm text-muted-foreground">Saved configurations</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Healthy Providers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-semibold">{healthyProviders.length}/3</p>
                      <p className="text-sm text-muted-foreground">AI services online</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Configurations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Recent Configurations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {configurations.slice(0, 5).map((config) => (
                        <div
                          key={config.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                          onClick={() => onConfigurationSelect(config)}
                        >
                          <div>
                            <p className="font-medium">{config.configuration_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {config.selected_mode} mode • {config.selected_models.length} models
                            </p>
                          </div>
                          <div className="flex gap-1">
                            {config.is_default && <Badge variant="secondary">Default</Badge>}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                loadConfiguration(config);
                              }}
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Configuration Builder Tab */}
              <TabsContent value="builder" className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Configuration Builder</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={resetForm}>
                      Reset
                    </Button>
                    <Button onClick={handleSaveConfiguration} disabled={saving || !configName.trim()} aria-busy={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Configuration'}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Basic Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="config-name">Configuration Name</Label>
                        <Input
                          id="config-name"
                          value={configName}
                          onChange={(e) => setConfigName(e.target.value)}
                          placeholder="Enter configuration name"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="mode-select">Conversation Mode</Label>
                        <Select value={selectedMode} onValueChange={(value: any) => setSelectedMode(value)}>
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

                      <div>
                        <Label htmlFor="knowledge-base">Knowledge Base</Label>
                        <Textarea
                          id="knowledge-base"
                          value={knowledgeBase}
                          onChange={(e) => setKnowledgeBase(e.target.value)}
                          placeholder="Describe the knowledge base or domain expertise"
                          rows={3}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="medical-context">Medical Context</Label>
                        <Switch
                          id="medical-context"
                          checked={medicalContext}
                          onCheckedChange={setMedicalContext}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="is-default">Set as Default</Label>
                        <Switch
                          id="is-default"
                          checked={isDefault}
                          onCheckedChange={setIsDefault}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Model Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Model Selection</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <UniversalModelSelector
                        onModelsSelect={setSelectedModels}
                        selectedModels={selectedModels}
                        mode={selectedMode}
                        enabledFeatures={enabledFeatures}
                        allowModeSwitch={false}
                        maxSelections={selectedMode === 'single' ? 1 : 6}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Features & Tools */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Features */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-3">
                        {availableFeatures.map((feature) => (
                          <div
                            key={feature.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <feature.icon className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{feature.label}</p>
                                <p className="text-xs text-muted-foreground">{feature.description}</p>
                              </div>
                            </div>
                            <Switch
                              checked={enabledFeatures.includes(feature.id)}
                              onCheckedChange={() => handleFeatureToggle(feature.id)}
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* MCP Tools */}
                  <Card>
                    <CardHeader>
                      <CardTitle>MCP Tools</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        {availableMCPTools.map((tool) => (
                          <div
                            key={tool}
                            className={`flex items-center justify-between p-2 border rounded cursor-pointer transition-colors ${
                              selectedMCPTools.includes(tool) 
                                ? 'border-primary bg-primary/5' 
                                : 'hover:bg-muted/50'
                            }`}
                            onClick={() => handleMCPToolToggle(tool)}
                          >
                            <span className="text-sm">{tool}</span>
                            {selectedMCPTools.includes(tool) && (
                              <Check className="h-3 w-3 text-primary" />
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Health Status Tab */}
              <TabsContent value="health" className="p-6 space-y-6">
                <GenieProviderStatusPanel />
              </TabsContent>

              {/* Management Tab */}
              <TabsContent value="management" className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Configuration Management</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={exportConfiguration}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <label>
                      <Button variant="outline" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Import
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept=".json"
                        onChange={importConfiguration}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Configuration List */}
                <Card>
                  <CardHeader>
                    <CardTitle>All Configurations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {configurations.map((config) => (
                        <div
                          key={config.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{config.configuration_name}</p>
                              {config.is_default && <Badge variant="secondary">Default</Badge>}
                            </div>
                            <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                              <span>Mode: {config.selected_mode}</span>
                              <span>Models: {config.selected_models.length}</span>
                              <span>Features: {config.enabled_features.length}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onConfigurationSelect(config)}
                            >
                              Use
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => loadConfiguration(config)}
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};