
// Browser-compatible bootstrap
export function startBackgroundServices() {
  console.log('🛡️ Background services starting (browser mode)');
  
  // In browser environment, we don't start background services
  // that require Node.js modules
  if (typeof window !== 'undefined') {
    console.log('🌐 Running in browser - background services disabled');
    return;
  }
  
  console.log('🛡️ Background services ready');
}

// Only auto-start in appropriate environments
if (typeof window === 'undefined') {
  // Only start on server / Node environment, not in the browser bundle
  startBackgroundServices();
}
