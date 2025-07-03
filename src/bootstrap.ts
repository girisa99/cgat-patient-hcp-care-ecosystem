import { registryFixAgent } from '@/utils/agents/RegistryFixAgent';

export function startBackgroundServices() {
  // Start Registry Fix Agent which internally kicks off verification service monitoring
  registryFixAgent.start();
  console.log('🛡️ Registry Fix Agent started (background verification active)');
}

// Auto-start when this module is imported at application entry
if (typeof window === 'undefined') {
  // Only start on server / Node environment, not in the browser bundle
  startBackgroundServices();
}