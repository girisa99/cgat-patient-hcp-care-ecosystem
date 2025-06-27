
/**
 * System Assessment Loading State Component
 * Displays loading state while assessment is running
 */

import React from 'react';
import { RefreshCw } from 'lucide-react';

export const SystemAssessmentLoadingState: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <RefreshCw className="h-8 w-8 animate-spin" />
      <span className="ml-2">Running comprehensive system assessment...</span>
    </div>
  );
};
