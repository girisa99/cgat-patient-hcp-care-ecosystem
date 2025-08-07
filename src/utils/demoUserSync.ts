/**
 * Demo User Sync Utility
 * 
 * This utility provides functions to automatically sync new functionality
 * for the demoUser role when new features are added to the system.
 */

import { supabase } from "@/integrations/supabase/client";

export interface DemoSyncResult {
  success: boolean;
  demo_role_id: string;
  modules_synced: number;
  sync_timestamp: string;
}

export interface DemoSyncError {
  error: string;
  details?: string;
}

/**
 * Automatically sync demoUser access to all active modules
 * This should be run whenever new modules are added to ensure
 * demo users have access to showcase all features
 */
export const syncDemoUserAccess = async (): Promise<DemoSyncResult | DemoSyncError> => {
  try {
    console.log('🔄 Starting demo user access sync...');
    
    const { data, error } = await supabase.rpc('auto_sync_demo_user_access');
    
    if (error) {
      console.error('❌ Demo user sync failed:', error);
      return {
        error: 'Failed to sync demo user access',
        details: error.message
      };
    }
    
    console.log('✅ Demo user sync completed:', data);
    return data as unknown as DemoSyncResult;
  } catch (err) {
    console.error('❌ Unexpected error during demo user sync:', err);
    return {
      error: 'Unexpected error during sync',
      details: err instanceof Error ? err.message : 'Unknown error'
    };
  }
};

/**
 * Check if a user has the demoUser role
 */
export const isDemoUser = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('is_demo_user', { 
      check_user_id: userId 
    });
    
    if (error) {
      console.error('❌ Failed to check demo user status:', error);
      return false;
    }
    
    return data === true;
  } catch (err) {
    console.error('❌ Error checking demo user status:', err);
    return false;
  }
};

/**
 * Manual trigger for demo user sync
 * Call this function when you want to manually ensure
 * demo users have access to all new functionality
 */
export const triggerDemoSync = async (): Promise<void> => {
  console.log('🚀 Manually triggering demo user sync...');
  const result = await syncDemoUserAccess();
  
  if ('error' in result) {
    console.error('❌ Manual demo sync failed:', result.error);
    throw new Error(result.error);
  } else {
    console.log(`✅ Demo sync successful: ${result.modules_synced} modules synced`);
  }
};

/**
 * HOW TO USE FOR FUTURE UPDATES:
 * 
 * 1. **Automatic (Recommended)**: The system automatically syncs when new modules are added
 *    - A database trigger runs whenever a new module is created or activated
 *    - No manual intervention needed
 * 
 * 2. **Manual Trigger**: Use when you want to ensure sync after bulk changes
 *    ```typescript
 *    import { triggerDemoSync } from '@/utils/demoUserSync';
 *    
 *    // In your admin panel or management interface
 *    await triggerDemoSync();
 *    ```
 * 
 * 3. **API/Admin Interface**: Call the function directly from Supabase
 *    ```sql
 *    SELECT public.auto_sync_demo_user_access();
 *    ```
 * 
 * 4. **Check Demo User Status**: 
 *    ```typescript
 *    import { isDemoUser } from '@/utils/demoUserSync';
 *    
 *    const isDemo = await isDemoUser(user.id);
 *    if (isDemo) {
 *      // Show demo-specific features
 *    }
 *    ```
 */