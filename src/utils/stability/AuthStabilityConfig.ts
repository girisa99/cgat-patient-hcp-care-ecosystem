/**
 * AUTHENTICATION STABILITY CONFIGURATION
 * Specialized configuration for protecting authentication components
 * Ensures login system remains stable and unchanging
 */

import { componentProtection } from './ComponentProtection';

export interface AuthComponentLock {
  componentName: string;
  locked: boolean;
  allowedModifications: string[];
  emergencyBypass: boolean;
  lockReason: string;
}

class AuthStabilityManager {
  private static instance: AuthStabilityManager;
  private authLocks: Map<string, AuthComponentLock> = new Map();

  static getInstance(): AuthStabilityManager {
    if (!AuthStabilityManager.instance) {
      AuthStabilityManager.instance = new AuthStabilityManager();
    }
    return AuthStabilityManager.instance;
  }

  /**
   * Lock an authentication component
   */
  lockAuthComponent(
    componentName: string, 
    reason: string = 'Stability protection',
    allowedModifications: string[] = []
  ): void {
    const lock: AuthComponentLock = {
      componentName,
      locked: true,
      allowedModifications,
      emergencyBypass: false,
      lockReason: reason
    };

    this.authLocks.set(componentName, lock);
    
    console.log(`🔒 AUTH COMPONENT LOCKED: ${componentName}`);
    console.log(`📝 Reason: ${reason}`);
    
    if (allowedModifications.length > 0) {
      console.log(`✅ Allowed modifications:`, allowedModifications);
    } else {
      console.log(`❌ NO modifications allowed`);
    }
  }

  /**
   * Check if component is locked
   */
  isComponentLocked(componentName: string): boolean {
    const lock = this.authLocks.get(componentName);
    return lock?.locked || false;
  }

  /**
   * Check if modification is allowed
   */
  isModificationAllowed(componentName: string, modificationType: string): boolean {
    const lock = this.authLocks.get(componentName);
    if (!lock?.locked) return true;
    
    if (lock.emergencyBypass) {
      console.warn(`🚨 Emergency bypass active for: ${componentName}`);
      return true;
    }

    return lock.allowedModifications.includes(modificationType);
  }

  /**
   * Get lock status
   */
  getLockStatus(componentName: string): AuthComponentLock | null {
    return this.authLocks.get(componentName) || null;
  }

  /**
   * Unlock component (admin only)
   */
  unlockComponent(componentName: string, adminOverride: boolean = false): boolean {
    if (!adminOverride) {
      console.error(`❌ Cannot unlock ${componentName}: Admin override required`);
      return false;
    }

    const lock = this.authLocks.get(componentName);
    if (lock) {
      lock.locked = false;
      console.log(`🔓 AUTH COMPONENT UNLOCKED: ${componentName} (Admin Override)`);
      return true;
    }

    return false;
  }

  /**
   * Enable emergency bypass
   */
  enableEmergencyBypass(componentName: string, reason: string): void {
    const lock = this.authLocks.get(componentName);
    if (lock) {
      lock.emergencyBypass = true;
      console.warn(`🚨 EMERGENCY BYPASS ENABLED: ${componentName}`);
      console.warn(`📝 Reason: ${reason}`);
    }
  }

  /**
   * Get all locked components
   */
  getAllLocks(): AuthComponentLock[] {
    return Array.from(this.authLocks.values());
  }

  /**
   * Initialize default auth protection
   */
  initializeAuthProtection(): void {
    console.log('🛡️ Initializing authentication component protection...');

    // Lock critical auth components
    this.lockAuthComponent(
      'MasterAuthForm',
      'Core authentication form - critical for login/signup functionality',
      ['styling', 'validation-messages'] // Only allow minor styling changes
    );

    this.lockAuthComponent(
      'Login',
      'Main login page - entry point to application',
      ['layout-styling'] // Only allow layout styling
    );

    this.lockAuthComponent(
      'HealthcareAuthLayout',
      'Authentication layout wrapper - provides consistent UI',
      ['styling', 'responsive-layout'] // Allow styling and responsive changes
    );

    this.lockAuthComponent(
      'useMasterAuth',
      'Master authentication hook - core auth logic',
      [] // NO modifications allowed
    );

    this.lockAuthComponent(
      'ProtectedRoute',
      'Route protection component - security critical',
      [] // NO modifications allowed
    );

    console.log('✅ Authentication protection initialized');
    console.log(`🔒 ${this.authLocks.size} components are now protected`);
  }
}

// Export singleton instance
export const authStability = AuthStabilityManager.getInstance();

// Initialize protection on import
authStability.initializeAuthProtection();

// Register validation hooks
const originalLog = componentProtection.logComponentChange;
componentProtection.logComponentChange = (componentName: string, changeType: string, details?: any) => {
  // Check if auth component is locked
  if (authStability.isComponentLocked(componentName)) {
    if (!authStability.isModificationAllowed(componentName, changeType)) {
      console.error(`🚫 BLOCKED: Modification '${changeType}' not allowed on locked component '${componentName}'`);
      const lockStatus = authStability.getLockStatus(componentName);
      console.error(`🔒 Lock reason: ${lockStatus?.lockReason}`);
      console.error(`✅ Allowed modifications:`, lockStatus?.allowedModifications);
      return;
    }
  }
  
  // Call original logging
  originalLog.call(componentProtection, componentName, changeType, details);
};