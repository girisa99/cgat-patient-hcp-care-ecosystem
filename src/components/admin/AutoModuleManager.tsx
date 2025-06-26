
/**
 * Auto Module Manager Component
 * 
 * Provides a dashboard for viewing auto-detected modules, managing
 * the registration process, and generating boilerplate code.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap, Eye, Download, Check, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  detectNewModules, 
  AutoModuleConfig, 
  generateHookCode, 
  generateComponentCode 
} from '@/utils/schemaScanner';
import { autoRegisterModules, autoModuleWatcher } from '@/utils/autoModuleRegistration';

interface RegistrationStats {
  autoRegistered: number;
  needsReview: number;
  totalScanned: number;
}

export const AutoModuleManager = () => {
  const [detectedModules, setDetectedModules] = useState<AutoModuleConfig[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [autoRegistrationEnabled, setAutoRegistrationEnabled] = useState(false);
  const [registrationStats, setRegistrationStats] = useState<RegistrationStats>({
    autoRegistered: 0,
    needsReview: 0,
    totalScanned: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    // Start auto-detection on component mount
    handleScanModules();
    
    // Set up auto-registration watcher
    const unsubscribe = autoModuleWatcher.onUpdate((result) => {
      const stats: RegistrationStats = {
        autoRegistered: result.autoRegistered?.length || 0,
        needsReview: result.needsReview?.length || 0,
        totalScanned: result.totalScanned || 0
      };
      setRegistrationStats(stats);
      toast({
        title: "Auto-Registration Update",
        description: `Auto-registered ${stats.autoRegistered} modules`,
      });
    });

    return () => {
      unsubscribe();
      autoModuleWatcher.stop();
    };
  }, []);

  const handleScanModules = async () => {
    setIsScanning(true);
    try {
      const modules = await detectNewModules();
      setDetectedModules(modules);
      toast({
        title: "Schema Scan Complete",
        description: `Detected ${modules.length} potential modules`,
      });
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Failed to scan database schema",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleAutoRegister = async () => {
    try {
      const result = await autoRegisterModules();
      const stats: RegistrationStats = {
        autoRegistered: result.autoRegistered?.length || 0,
        needsReview: result.needsReview?.length || 0,
        totalScanned: result.totalScanned || 0
      };
      setRegistrationStats(stats);
      toast({
        title: "Auto-Registration Complete",
        description: `Registered ${stats.autoRegistered} modules automatically`,
      });
    } catch (error) {
      toast({
        title: "Auto-Registration Failed",
        description: "Failed to auto-register modules",
        variant: "destructive",
      });
    }
  };

  const toggleAutoRegistration = () => {
    if (autoRegistrationEnabled) {
      autoModuleWatcher.stop();
      setAutoRegistrationEnabled(false);
      toast({
        title: "Auto-Registration Disabled",
        description: "Stopped watching for new modules",
      });
    } else {
      autoModuleWatcher.start();
      setAutoRegistrationEnabled(true);
      toast({
        title: "Auto-Registration Enabled",
        description: "Now watching for new modules every 30 seconds",
      });
    }
  };

  const downloadGeneratedCode = (module: AutoModuleConfig) => {
    const hookCode = generateHookCode(module);
    const componentCode = generateComponentCode(module);
    
    // Create and download hook file
    const hookBlob = new Blob([hookCode], { type: 'text/typescript' });
    const hookUrl = URL.createObjectURL(hookBlob);
    const hookLink = document.createElement('a');
    hookLink.href = hookUrl;
    hookLink.download = `use${module.moduleName}.tsx`;
    hookLink.click();
    
    // Create and download component file
    const componentBlob = new Blob([componentCode], { type: 'text/typescript' });
    const componentUrl = URL.createObjectURL(componentBlob);
    const componentLink = document.createElement('a');
    componentLink.href = componentUrl;
    componentLink.download = `${module.moduleName}Module.tsx`;
    componentLink.click();
    
    toast({
      title: "Code Downloaded",
      description: `Generated files for ${module.moduleName}`,
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <Check className="w-4 h-4" />;
    if (confidence >= 0.6) return <Eye className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Auto Module Manager</h2>
          <p className="text-gray-600">Automatically detect and generate modules from database schema</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleScanModules}
            disabled={isScanning}
            variant="outline"
          >
            {isScanning ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            Scan Schema
          </Button>
          <Button
            onClick={toggleAutoRegistration}
            variant={autoRegistrationEnabled ? "destructive" : "default"}
          >
            <Zap className="w-4 h-4 mr-2" />
            {autoRegistrationEnabled ? 'Disable Auto-Reg' : 'Enable Auto-Reg'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Auto-Registered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{registrationStats.autoRegistered}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Needs Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{registrationStats.needsReview}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Scanned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{registrationStats.totalScanned}</div>
          </CardContent>
        </Card>
      </div>

      {/* Detected Modules */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Detected Modules</CardTitle>
            <Button onClick={handleAutoRegister} size="sm">
              Auto-Register All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {detectedModules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No new modules detected. Click "Scan Schema" to check for new tables.
            </div>
          ) : (
            <div className="space-y-4">
              {detectedModules.map((module, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{module.moduleName}</h3>
                      <p className="text-sm text-gray-600">Table: {module.tableName}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getConfidenceColor(module.confidence)}>
                        {getConfidenceIcon(module.confidence)}
                        {Math.round(module.confidence * 100)}%
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadGeneratedCode(module)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download Code
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                    <div>
                      <span className="font-medium">Required Fields:</span>
                      <div className="mt-1">
                        {module.requiredFields.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {module.requiredFields.map(field => (
                              <Badge key={field} variant="secondary" className="text-xs">
                                {field}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">None</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Optional Fields:</span>
                      <div className="mt-1">
                        {module.optionalFields && module.optionalFields.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {module.optionalFields.map(field => (
                              <Badge key={field} variant="outline" className="text-xs">
                                {field}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">None</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
