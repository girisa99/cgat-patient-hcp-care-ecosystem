/**
 * Role Manager - Manages user roles and permissions
 * Handles role-based access control and permission validation
 */

import { TypeValidator, RoleSchema, FrameworkError } from '../core/types.js';

export class RoleManager {
  constructor(config = {}) {
    this.config = {
      hierarchical: true,
      cacheTimeout: 300000, // 5 minutes
      ...config
    };
    
    this.roles = new Map();
    this.userRoles = new Map();
    this.permissions = new Map();
    this.roleHierarchy = new Map();
    this.cache = new Map();
    
    this.initializeDefaultRoles();
  }

  /**
   * Initialize default roles for the healthcare system
   */
  initializeDefaultRoles() {
    const defaultRoles = [
      {
        id: 'superAdmin',
        name: 'Super Administrator',
        permissions: ['*'], // All permissions
        hierarchy: 100,
        active: true
      },
      {
        id: 'admin',
        name: 'Administrator',
        permissions: [
          'users.create', 'users.read', 'users.update', 'users.delete',
          'facilities.create', 'facilities.read', 'facilities.update',
          'onboarding.manage', 'reports.view'
        ],
        hierarchy: 90,
        active: true
      },
      {
        id: 'onboardingTeam',
        name: 'Onboarding Team',
        permissions: [
          'onboarding.create', 'onboarding.read', 'onboarding.update',
          'facilities.read', 'users.read'
        ],
        hierarchy: 80,
        active: true
      },
      {
        id: 'facilityManager',
        name: 'Facility Manager',
        permissions: [
          'facility.manage', 'users.facility.manage', 'patients.read',
          'orders.manage', 'inventory.manage'
        ],
        hierarchy: 70,
        active: true
      },
      {
        id: 'clinician',
        name: 'Clinician',
        permissions: [
          'patients.read', 'patients.update', 'treatments.manage',
          'prescriptions.create', 'clinical.data.access'
        ],
        hierarchy: 60,
        active: true
      },
      {
        id: 'nurse',
        name: 'Nurse',
        permissions: [
          'patients.read', 'patients.update', 'medications.administer',
          'vitals.record', 'care.plans.update'
        ],
        hierarchy: 50,
        active: true
      },
      {
        id: 'pharmacist',
        name: 'Pharmacist',
        permissions: [
          'prescriptions.review', 'medications.dispense', 'inventory.drugs',
          'drug.interactions.check', 'pharmacy.reports'
        ],
        hierarchy: 55,
        active: true
      },
      {
        id: 'patientCaregiver',
        name: 'Patient/Caregiver',
        permissions: [
          'patient.profile.view', 'appointments.manage', 'medications.view',
          'treatment.status.view', 'communications.receive'
        ],
        hierarchy: 30,
        active: true
      },
      {
        id: 'support',
        name: 'Support Staff',
        permissions: [
          'tickets.manage', 'communications.manage', 'basic.reports.view'
        ],
        hierarchy: 40,
        active: true
      },
      {
        id: 'readonly',
        name: 'Read Only',
        permissions: [
          'basic.read'
        ],
        hierarchy: 10,
        active: true
      }
    ];

    defaultRoles.forEach(role => this.addRole(role));
  }

  /**
   * Add a new role
   */
  addRole(roleData) {
    const validation = TypeValidator.validate(roleData, RoleSchema);
    if (!validation.valid) {
      throw new FrameworkError(
        `Invalid role data: ${validation.errors.join(', ')}`,
        'INVALID_ROLE_DATA',
        'RoleManager'
      );
    }

    this.roles.set(roleData.id, { ...roleData });
    this.roleHierarchy.set(roleData.id, roleData.hierarchy);
    this.clearCache();
    
    console.log(`✅ Role added: ${roleData.name}`);
  }

  /**
   * Remove a role
   */
  removeRole(roleId) {
    if (!this.roles.has(roleId)) {
      throw new FrameworkError(
        `Role not found: ${roleId}`,
        'ROLE_NOT_FOUND',
        'RoleManager'
      );
    }

    this.roles.delete(roleId);
    this.roleHierarchy.delete(roleId);
    
    // Remove role from all users
    for (const [userId, userRoles] of this.userRoles) {
      const filteredRoles = userRoles.filter(id => id !== roleId);
      this.userRoles.set(userId, filteredRoles);
    }
    
    this.clearCache();
    console.log(`🗑️ Role removed: ${roleId}`);
  }

  /**
   * Assign role to user
   */
  assignRole(userId, roleId) {
    if (!this.roles.has(roleId)) {
      throw new FrameworkError(
        `Role not found: ${roleId}`,
        'ROLE_NOT_FOUND',
        'RoleManager'
      );
    }

    if (!this.userRoles.has(userId)) {
      this.userRoles.set(userId, []);
    }

    const userRoles = this.userRoles.get(userId);
    if (!userRoles.includes(roleId)) {
      userRoles.push(roleId);
      this.clearCache();
      console.log(`👤 Role ${roleId} assigned to user ${userId}`);
    }
  }

  /**
   * Remove role from user
   */
  removeRole(userId, roleId) {
    if (!this.userRoles.has(userId)) return;

    const userRoles = this.userRoles.get(userId);
    const index = userRoles.indexOf(roleId);
    
    if (index > -1) {
      userRoles.splice(index, 1);
      this.clearCache();
      console.log(`🗑️ Role ${roleId} removed from user ${userId}`);
    }
  }

  /**
   * Get user roles
   */
  getUserRoles(userId) {
    return this.userRoles.get(userId) || [];
  }

  /**
   * Check if user has specific role
   */
  hasRole(userId, roleId) {
    const userRoles = this.getUserRoles(userId);
    return userRoles.includes(roleId);
  }

  /**
   * Check if user has permission
   */
  hasPermission(userId, permission, options = {}) {
    const cacheKey = `${userId}:${permission}:${JSON.stringify(options)}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.config.cacheTimeout) {
        return cached.value;
      }
    }

    const result = this.checkPermission(userId, permission, options);
    
    // Cache result
    this.cache.set(cacheKey, {
      value: result,
      timestamp: Date.now()
    });

    return result;
  }

  /**
   * Internal permission check logic
   */
  checkPermission(userId, permission, options = {}) {
    const userRoles = this.getUserRoles(userId);
    
    for (const roleId of userRoles) {
      const role = this.roles.get(roleId);
      if (!role || !role.active) continue;

      // Check for wildcard permission
      if (role.permissions.includes('*')) {
        return true;
      }

      // Check for exact permission
      if (role.permissions.includes(permission)) {
        return true;
      }

      // Check for pattern permissions (e.g., 'users.*')
      for (const rolePermission of role.permissions) {
        if (rolePermission.endsWith('*')) {
          const pattern = rolePermission.slice(0, -1);
          if (permission.startsWith(pattern)) {
            return true;
          }
        }
      }

      // Check hierarchical permissions if enabled
      if (this.config.hierarchical && options.requireHierarchy) {
        const requiredHierarchy = options.minimumHierarchy || 0;
        if (role.hierarchy >= requiredHierarchy) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get all permissions for user
   */
  getUserPermissions(userId) {
    const userRoles = this.getUserRoles(userId);
    const permissions = new Set();

    for (const roleId of userRoles) {
      const role = this.roles.get(roleId);
      if (role && role.active) {
        role.permissions.forEach(permission => permissions.add(permission));
      }
    }

    return Array.from(permissions);
  }

  /**
   * Get effective permissions (expanded patterns)
   */
  getEffectivePermissions(userId) {
    const permissions = this.getUserPermissions(userId);
    const effective = new Set();

    permissions.forEach(permission => {
      if (permission === '*') {
        // Add all known permissions
        this.getAllKnownPermissions().forEach(p => effective.add(p));
      } else if (permission.endsWith('*')) {
        // Expand pattern permissions
        const pattern = permission.slice(0, -1);
        this.getAllKnownPermissions()
          .filter(p => p.startsWith(pattern))
          .forEach(p => effective.add(p));
      } else {
        effective.add(permission);
      }
    });

    return Array.from(effective);
  }

  /**
   * Get all known permissions in the system
   */
  getAllKnownPermissions() {
    const allPermissions = new Set();
    
    // Collect all permissions from all roles
    for (const role of this.roles.values()) {
      role.permissions.forEach(permission => {
        if (permission !== '*' && !permission.endsWith('*')) {
          allPermissions.add(permission);
        }
      });
    }

    return Array.from(allPermissions);
  }

  /**
   * Get role hierarchy level
   */
  getRoleHierarchy(roleId) {
    return this.roleHierarchy.get(roleId) || 0;
  }

  /**
   * Get highest hierarchy level for user
   */
  getUserHierarchy(userId) {
    const userRoles = this.getUserRoles(userId);
    let maxHierarchy = 0;

    for (const roleId of userRoles) {
      const hierarchy = this.getRoleHierarchy(roleId);
      maxHierarchy = Math.max(maxHierarchy, hierarchy);
    }

    return maxHierarchy;
  }

  /**
   * Check if user can perform action on target user
   */
  canManageUser(managerId, targetUserId) {
    const managerHierarchy = this.getUserHierarchy(managerId);
    const targetHierarchy = this.getUserHierarchy(targetUserId);
    
    return managerHierarchy > targetHierarchy;
  }

  /**
   * Get all roles
   */
  getAllRoles() {
    return Array.from(this.roles.values()).filter(role => role.active);
  }

  /**
   * Get role by ID
   */
  getRole(roleId) {
    return this.roles.get(roleId);
  }

  /**
   * Clear permission cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get role statistics
   */
  getStatistics() {
    const totalRoles = this.roles.size;
    const activeRoles = Array.from(this.roles.values()).filter(r => r.active).length;
    const totalUsers = this.userRoles.size;
    
    const roleDistribution = {};
    for (const [userId, roles] of this.userRoles) {
      roles.forEach(roleId => {
        roleDistribution[roleId] = (roleDistribution[roleId] || 0) + 1;
      });
    }

    return {
      totalRoles,
      activeRoles,
      totalUsers,
      roleDistribution,
      cacheSize: this.cache.size
    };
  }

  /**
   * Validate role configuration
   */
  validateConfiguration() {
    const issues = [];

    // Check for orphaned permissions
    const allPermissions = this.getAllKnownPermissions();
    for (const [roleId, role] of this.roles) {
      for (const permission of role.permissions) {
        if (permission !== '*' && !permission.endsWith('*') && !allPermissions.includes(permission)) {
          issues.push(`Role ${roleId} has unknown permission: ${permission}`);
        }
      }
    }

    // Check for users with no roles
    for (const [userId, roles] of this.userRoles) {
      if (roles.length === 0) {
        issues.push(`User ${userId} has no roles assigned`);
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Export role configuration
   */
  exportConfiguration() {
    return {
      roles: Array.from(this.roles.values()),
      userRoles: Object.fromEntries(this.userRoles),
      timestamp: new Date()
    };
  }

  /**
   * Import role configuration
   */
  importConfiguration(config) {
    this.roles.clear();
    this.userRoles.clear();
    this.roleHierarchy.clear();
    
    // Import roles
    config.roles.forEach(role => this.addRole(role));
    
    // Import user roles
    for (const [userId, roles] of Object.entries(config.userRoles)) {
      this.userRoles.set(userId, roles);
    }
    
    this.clearCache();
    console.log('📥 Role configuration imported successfully');
  }
}

export default RoleManager;