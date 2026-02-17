/**
 * Lovable Configuration - Integration with Lovable platform
 */

import { LovableIntegration } from './stability-framework/integrations/lovable.js';

export default {
  // Stability framework integration
  stabilityFramework: {
    enabled: true,
    autoStart: true,
    monitoringInterval: 30000
  },

  // Lovable-specific settings
  lovable: {
    enableRealTimeSync: true,
    enableAIAssistance: true,
    autoFix: false
  },

  // Project settings
  project: {
    type: 'healthcare',
    framework: 'react',
    complexity: 'medium'
  }
};