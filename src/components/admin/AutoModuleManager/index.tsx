
/**
 * Auto Module Manager Component - Enhanced with Security
 */

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AutoModuleHeader } from './AutoModuleHeader';
import { AutoModuleStats } from './AutoModuleStats';
import { DetectedModulesList } from './DetectedModulesList';
import { detectNewModules } from '@/utils/schema/moduleDetector';
import { generateHookCode, generateComponentCode } from '@/utils/schema/codeGenerator';
import { autoRegisterModules, autoModuleWatcher } from '@/utils/autoModuleRegistration';
import { validateModuleSecurity, sanitizeModuleConfig } from '@/utils/security/moduleSecurityValidator';
import { validateModulePermission } from '@/utils/security/authSecurityHelpers';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { AutoModuleConfig } from '@/utils/schema/types';

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
  const { user } = useAuthContext();

  useEffect(() => {
    handleScanModules();
    
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
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to scan modules",
        variant: "destructive",
      });
      return;
    }

    // Check permission
    const hasPermission = await validateModulePermission(user.id, 'read', 'AutoModuleManager');
    if (!hasPermission) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to scan modules",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    try {
      const modules = await detectNewModules();
      
      // Apply security validation and sanitization
      const secureModules = modules.map(module => {
        const validation = validateModuleSecurity(module);
        if (!validation.isSecure) {
          console.warn('⚠️ Security issues found:', validation.securityIssues);
        }
        return sanitizeModuleConfig(module);
      });
      
      setDetectedModules(secureModules);
      toast({
        title: "Schema Scan Complete",
        description: `Detected ${secureModules.length} potential modules`,
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
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to register modules",
        variant: "destructive",
      });
      return;
    }

    // Check permission
    const hasPermission = await validateModulePermission(user.id, 'create', 'AutoModuleManager');
    if (!hasPermission) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to register modules",
        variant: "destructive",
      });
      return;
    }

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

  const downloadGeneratedCode = async (module: AutoModuleConfig) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to download code",
        variant: "destructive",
      });
      return;
    }

    // Security validation before code generation
    const validation = validateModuleSecurity(module);
    if (!validation.isSecure) {
      toast({
        title: "Security Warning",
        description: `Cannot generate code: ${validation.securityIssues.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    const sanitizedModule = sanitizeModuleConfig(module);
    const hookCode = generateHookCode(sanitizedModule);
    const componentCode = generateComponentCode(sanitizedModule);
    
    // Create and download hook file
    const hookBlob = new Blob([hookCode], { type: 'text/typescript' });
    const hookUrl = URL.createObjectURL(hookBlob);
    const hookLink = document.createElement('a');
    hookLink.href = hookUrl;
    hookLink.download = `use${sanitizedModule.moduleName}.tsx`;
    hookLink.click();
    
    // Create and download component file
    const componentBlob = new Blob([componentCode], { type: 'text/typescript' });
    const componentUrl = URL.createObjectURL(componentBlob);
    const componentLink = document.createElement('a');
    componentLink.href = componentUrl;
    componentLink.download = `${sanitizedModule.moduleName}Module.tsx`;
    componentLink.click();
    
    toast({
      title: "Code Downloaded",
      description: `Generated secure files for ${sanitizedModule.moduleName}`,
    });
  };

  return (
    <div className="space-y-6">
      <AutoModuleHeader
        isScanning={isScanning}
        autoRegistrationEnabled={autoRegistrationEnabled}
        onScanModules={handleScanModules}
        onToggleAutoRegistration={toggleAutoRegistration}
      />

      <AutoModuleStats stats={registrationStats} />

      <DetectedModulesList
        modules={detectedModules}
        onAutoRegisterAll={handleAutoRegister}
        onDownloadCode={downloadGeneratedCode}
      />
    </div>
  );
};
