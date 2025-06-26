
/**
 * Auto Module Manager Header Component
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Zap, Eye } from 'lucide-react';

interface AutoModuleHeaderProps {
  isScanning: boolean;
  autoRegistrationEnabled: boolean;
  onScanModules: () => void;
  onToggleAutoRegistration: () => void;
}

export const AutoModuleHeader: React.FC<AutoModuleHeaderProps> = ({
  isScanning,
  autoRegistrationEnabled,
  onScanModules,
  onToggleAutoRegistration
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold">Auto Module Manager</h2>
        <p className="text-gray-600">Automatically detect and generate modules from database schema</p>
      </div>
      <div className="flex space-x-2">
        <Button
          onClick={onScanModules}
          disabled={isScanning}
          variant="outline"
        >
          {isScanning ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
          Scan Schema
        </Button>
        <Button
          onClick={onToggleAutoRegistration}
          variant={autoRegistrationEnabled ? "destructive" : "default"}
        >
          <Zap className="w-4 h-4 mr-2" />
          {autoRegistrationEnabled ? 'Disable Auto-Reg' : 'Enable Auto-Reg'}
        </Button>
      </div>
    </div>
  );
};
