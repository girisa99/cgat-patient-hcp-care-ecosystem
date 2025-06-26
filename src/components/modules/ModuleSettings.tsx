
/**
 * Module Settings Component - Enhanced with Real Functionality
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { moduleRegistry } from '@/utils/moduleRegistry';
import { useToast } from '@/hooks/use-toast';

export const ModuleSettings: React.FC = () => {
  const [autoConfig, setAutoConfig] = useState(moduleRegistry.getAutoConfig());
  const { toast } = useToast();

  const handleConfigUpdate = (updates: Partial<typeof autoConfig>) => {
    const newConfig = { ...autoConfig, ...updates };
    setAutoConfig(newConfig);
    moduleRegistry.updateAutoConfig(newConfig);
    
    toast({
      title: "Settings Updated",
      description: "Module configuration has been saved",
    });
  };

  const handleExportConfig = () => {
    const exportData = moduleRegistry.export();
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'module-config.json';
    link.click();
    
    toast({
      title: "Configuration Exported",
      description: "Module configuration downloaded successfully",
    });
  };

  const stats = moduleRegistry.getStats();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Auto-Registration Settings</CardTitle>
          <p className="text-sm text-gray-600">Configure automatic module detection and registration</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="auto-registration">Enable Auto-Registration</Label>
              <p className="text-sm text-gray-500">Automatically register new modules when detected</p>
            </div>
            <Switch
              id="auto-registration"
              checked={autoConfig.enabled}
              onCheckedChange={(enabled) => handleConfigUpdate({ enabled })}
            />
          </div>

          <div className="space-y-2">
            <Label>Confidence Threshold: {Math.round(autoConfig.confidenceThreshold * 100)}%</Label>
            <p className="text-sm text-gray-500">Minimum confidence required for auto-registration</p>
            <Slider
              value={[autoConfig.confidenceThreshold]}
              onValueChange={([value]) => handleConfigUpdate({ confidenceThreshold: value })}
              max={1}
              min={0.5}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Scan Interval: {autoConfig.scanIntervalMs / 1000} seconds</Label>
            <p className="text-sm text-gray-500">How often to scan for new modules</p>
            <Slider
              value={[autoConfig.scanIntervalMs]}
              onValueChange={([value]) => handleConfigUpdate({ scanIntervalMs: value })}
              max={300000}
              min={10000}
              step={10000}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Code Generation Settings</CardTitle>
          <p className="text-sm text-gray-600">Configure automatic code generation features</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="auto-code-gen">Auto-Generate Code</Label>
              <p className="text-sm text-gray-500">Generate boilerplate hooks and components</p>
            </div>
            <Switch
              id="auto-code-gen"
              checked={autoConfig.autoGenerateCode}
              onCheckedChange={(autoGenerateCode) => handleConfigUpdate({ autoGenerateCode })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="track-components">Track Components</Label>
              <p className="text-sm text-gray-500">Monitor and track component changes</p>
            </div>
            <Switch
              id="track-components"
              checked={autoConfig.trackComponents}
              onCheckedChange={(trackComponents) => handleConfigUpdate({ trackComponents })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="track-services">Track Services</Label>
              <p className="text-sm text-gray-500">Monitor and track service changes</p>
            </div>
            <Switch
              id="track-services"
              checked={autoConfig.trackServices}
              onCheckedChange={(trackServices) => handleConfigUpdate({ trackServices })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registry Statistics</CardTitle>
          <p className="text-sm text-gray-600">Current module registry information</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-500">Total Modules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalComponents}</div>
              <div className="text-sm text-gray-500">Components</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalServices}</div>
              <div className="text-sm text-gray-500">Services</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.totalHooks}</div>
              <div className="text-sm text-gray-500">Hooks</div>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline">
              Active: {stats.active}
            </Badge>
            <Badge variant="outline">
              Auto-Generated: {stats.autoGenerated}
            </Badge>
            <Badge variant="outline">
              Protected: {stats.protectedComponents}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Management</CardTitle>
          <p className="text-sm text-gray-600">Export and manage module configurations</p>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Button onClick={handleExportConfig} variant="outline">
              Export Configuration
            </Button>
            <Button 
              onClick={() => {
                // Reset to defaults
                const defaultConfig = {
                  enabled: false,
                  confidenceThreshold: 0.8,
                  scanIntervalMs: 30000,
                  autoGenerateCode: true,
                  trackComponents: true,
                  trackServices: true
                };
                handleConfigUpdate(defaultConfig);
              }} 
              variant="outline"
            >
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
