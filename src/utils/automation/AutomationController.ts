
/**
 * Central Automation Controller
 * Coordinates all automated systems
 */

import { realtimeManager } from '@/utils/realtime/RealtimeManager';
import { bulkOperationsManager } from '@/utils/bulkOperations/BulkOperationsManager';
import { advancedSearchManager } from '@/utils/search/AdvancedSearchManager';
import { mobileAppManager } from '@/utils/mobile/MobileAppManager';
import { workflowManager } from '@/utils/workflow/WorkflowManager';
import { whiteLabelManager } from '@/utils/whiteLabel/WhiteLabelManager';
import { moduleRegistry } from '@/utils/moduleRegistry';

export interface AutomationStatus {
  realtime: boolean;
  bulkOperations: boolean;
  advancedSearch: boolean;
  mobileFeatures: boolean;
  workflows: boolean;
  whiteLabel: boolean;
  totalModules: number;
  lastUpdate: string;
}

class AutomationController {
  private isInitialized = false;
  private status: AutomationStatus = {
    realtime: false,
    bulkOperations: false,
    advancedSearch: false,
    mobileFeatures: false,
    workflows: false,
    whiteLabel: false,
    totalModules: 0,
    lastUpdate: new Date().toISOString()
  };

  /**
   * Initialize all automation systems
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('⚠️ Automation controller already initialized');
      return;
    }

    console.log('🚀 Initializing automation controller...');
    
    try {
      // Initialize in sequence to avoid conflicts
      await this.initializeWhiteLabel();
      await this.initializeMobileFeatures();
      await this.initializeRealtime();
      await this.initializeBulkOperations();
      await this.initializeAdvancedSearch();
      await this.initializeWorkflows();
      
      this.isInitialized = true;
      this.updateStatus();
      
      console.log('✅ All automation systems initialized successfully');
      
      // Dispatch global event
      window.dispatchEvent(new CustomEvent('automation-ready', {
        detail: this.status
      }));
      
    } catch (error) {
      console.error('❌ Failed to initialize automation systems:', error);
    }
  }

  /**
   * Initialize white label system
   */
  private async initializeWhiteLabel() {
    try {
      await whiteLabelManager.initialize();
      this.status.whiteLabel = true;
      console.log('✅ White label system initialized');
    } catch (error) {
      console.error('❌ White label initialization failed:', error);
    }
  }

  /**
   * Initialize mobile features
   */
  private async initializeMobileFeatures() {
    try {
      await mobileAppManager.initialize();
      this.status.mobileFeatures = true;
      console.log('✅ Mobile features initialized');
    } catch (error) {
      console.error('❌ Mobile features initialization failed:', error);
    }
  }

  /**
   * Initialize real-time system
   */
  private async initializeRealtime() {
    try {
      await realtimeManager.autoDetectAndRegister();
      this.status.realtime = true;
      console.log('✅ Real-time system initialized');
    } catch (error) {
      console.error('❌ Real-time initialization failed:', error);
    }
  }

  /**
   * Initialize bulk operations
   */
  private async initializeBulkOperations() {
    try {
      await bulkOperationsManager.autoDetectBulkCapabilities();
      this.status.bulkOperations = true;
      console.log('✅ Bulk operations initialized');
    } catch (error) {
      console.error('❌ Bulk operations initialization failed:', error);
    }
  }

  /**
   * Initialize advanced search
   */
  private async initializeAdvancedSearch() {
    try {
      await advancedSearchManager.autoDetectSearchCapabilities();
      this.status.advancedSearch = true;
      console.log('✅ Advanced search initialized');
    } catch (error) {
      console.error('❌ Advanced search initialization failed:', error);
    }
  }

  /**
   * Initialize workflows
   */
  private async initializeWorkflows() {
    try {
      await workflowManager.autoGenerateWorkflows();
      this.status.workflows = true;
      console.log('✅ Workflows initialized');
    } catch (error) {
      console.error('❌ Workflows initialization failed:', error);
    }
  }

  /**
   * Update automation status
   */
  private updateStatus() {
    this.status.totalModules = moduleRegistry.getAll().length;
    this.status.lastUpdate = new Date().toISOString();
    
    // Store status in localStorage for persistence
    localStorage.setItem('automationStatus', JSON.stringify(this.status));
  }

  /**
   * Get current automation status
   */
  getStatus(): AutomationStatus {
    return { ...this.status };
  }

  /**
   * Check if automation is ready
   */
  isReady(): boolean {
    return this.isInitialized && Object.values(this.status).every(val => 
      typeof val === 'boolean' ? val : true
    );
  }

  /**
   * Auto-register new module with all systems
   */
  async registerNewModule(tableName: string, moduleName: string) {
    console.log(`🔄 Auto-registering new module: ${moduleName}`);
    
    try {
      // Register with real-time
      if (this.status.realtime) {
        await realtimeManager.registerModule({
          tableName,
          moduleName,
          enableInsert: true,
          enableUpdate: true,
          enableDelete: true,
          enableBulkOperations: true
        });
      }

      // Register with search
      if (this.status.advancedSearch) {
        await advancedSearchManager.autoDetectSearchCapabilities();
      }

      // Register with bulk operations
      if (this.status.bulkOperations) {
        await bulkOperationsManager.autoDetectBulkCapabilities();
      }

      this.updateStatus();
      console.log(`✅ Module ${moduleName} registered with all systems`);
      
    } catch (error) {
      console.error(`❌ Failed to register module ${moduleName}:`, error);
    }
  }

  /**
   * Get automation health report
   */
  getHealthReport() {
    const report = {
      overall: this.isReady() ? 'healthy' : 'degraded',
      systems: {
        realtime: this.status.realtime ? 'active' : 'inactive',
        bulkOperations: this.status.bulkOperations ? 'active' : 'inactive',
        advancedSearch: this.status.advancedSearch ? 'active' : 'inactive',
        mobileFeatures: this.status.mobileFeatures ? 'active' : 'inactive',
        workflows: this.status.workflows ? 'active' : 'inactive',
        whiteLabel: this.status.whiteLabel ? 'active' : 'inactive'
      },
      totalModules: this.status.totalModules,
      lastHealthCheck: new Date().toISOString()
    };

    console.log('📊 Automation health report:', report);
    return report;
  }

  /**
   * Reset all automation systems
   */
  async reset() {
    console.log('🔄 Resetting automation systems...');
    
    this.isInitialized = false;
    this.status = {
      realtime: false,
      bulkOperations: false,
      advancedSearch: false,
      mobileFeatures: false,
      workflows: false,
      whiteLabel: false,
      totalModules: 0,
      lastUpdate: new Date().toISOString()
    };

    // Clear stored status
    localStorage.removeItem('automationStatus');
    
    // Reinitialize
    await this.initialize();
  }
}

// Global singleton instance
export const automationController = new AutomationController();

// Auto-initialize when the app loads
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => automationController.initialize(), 1000);
    });
  } else {
    setTimeout(() => automationController.initialize(), 1000);
  }
}

// Export for debugging
(window as any).automationController = automationController;
