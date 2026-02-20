/**
 * Local Session Storage - Unified Persistence Layer
 *
 * Persists all session data (auth, profile, roles, app state) to localStorage
 * for instant hydration on page reload, reducing Supabase round-trips.
 *
 * Storage keys use the prefix `genie_local_` to avoid conflicts.
 *
 * Version: local-session-v1.0.0
 */

import type { User, Session } from '@supabase/supabase-js';

// ============================================
// TYPES
// ============================================

export interface LocalAuthSession {
  user: User;
  session: Session;
  profile: Record<string, any> | null;
  userRoles: string[];
  cachedAt: string; // ISO timestamp
  expiresAt: string; // ISO timestamp - matches session expiry
}

export interface LocalGenieSession {
  authUserId: string;
  genieUser: Record<string, any>;
  isInternalUser: boolean;
  hasMarketingAccess: boolean;
  cachedAt: string;
}

export interface LocalAppState {
  currentFacilityId: string | null;
  p2Settings: Record<string, any> | null;
  aiPreferences: Record<string, any> | null;
  cachedAt: string;
}

export interface LocalSessionSnapshot {
  version: string;
  createdAt: string;
  auth: LocalAuthSession | null;
  genie: LocalGenieSession | null;
  appState: LocalAppState | null;
  castSession: Record<string, any> | null;
  recoveryStates: Record<string, any>;
}

// ============================================
// CONSTANTS
// ============================================

const STORAGE_PREFIX = 'genie_local_';
const KEYS = {
  AUTH_SESSION: `${STORAGE_PREFIX}auth_session`,
  GENIE_SESSION: `${STORAGE_PREFIX}genie_session`,
  APP_STATE: `${STORAGE_PREFIX}app_state`,
  SNAPSHOT_VERSION: `${STORAGE_PREFIX}snapshot_version`,
} as const;

const SNAPSHOT_VERSION = '1.0.0';
const MAX_CACHE_AGE_MS = 60 * 60 * 1000; // 1 hour - profile/roles refresh after this

// ============================================
// LOCAL SESSION STORAGE CLASS
// ============================================

class LocalSessionStorage {
  // ---- Auth Session ----

  /**
   * Persist the current auth session (user, session, profile, roles) locally.
   */
  saveAuthSession(data: {
    user: User;
    session: Session;
    profile: Record<string, any> | null;
    userRoles: string[];
  }): void {
    try {
      const entry: LocalAuthSession = {
        user: data.user,
        session: data.session,
        profile: data.profile,
        userRoles: data.userRoles,
        cachedAt: new Date().toISOString(),
        expiresAt: data.session.expires_at
          ? new Date(data.session.expires_at * 1000).toISOString()
          : new Date(Date.now() + MAX_CACHE_AGE_MS).toISOString(),
      };
      localStorage.setItem(KEYS.AUTH_SESSION, JSON.stringify(entry));
    } catch (err) {
      console.warn('[LocalSessionStorage] Failed to save auth session:', err);
    }
  }

  /**
   * Load cached auth session. Returns null if missing, expired, or corrupt.
   */
  loadAuthSession(): LocalAuthSession | null {
    try {
      const raw = localStorage.getItem(KEYS.AUTH_SESSION);
      if (!raw) return null;

      const entry: LocalAuthSession = JSON.parse(raw);

      // Check if the cached data has expired
      if (this.isCacheExpired(entry.cachedAt)) {
        this.clearAuthSession();
        return null;
      }

      // Check if the underlying session has expired
      if (entry.expiresAt && new Date(entry.expiresAt).getTime() < Date.now()) {
        this.clearAuthSession();
        return null;
      }

      return entry;
    } catch {
      this.clearAuthSession();
      return null;
    }
  }

  clearAuthSession(): void {
    localStorage.removeItem(KEYS.AUTH_SESSION);
  }

  /**
   * Update just the profile & roles in the cached auth session.
   * Useful after a refreshAuth() call without re-persisting the whole session.
   */
  updateProfileAndRoles(profile: Record<string, any> | null, userRoles: string[]): void {
    try {
      const raw = localStorage.getItem(KEYS.AUTH_SESSION);
      if (!raw) return;

      const entry: LocalAuthSession = JSON.parse(raw);
      entry.profile = profile;
      entry.userRoles = userRoles;
      entry.cachedAt = new Date().toISOString();
      localStorage.setItem(KEYS.AUTH_SESSION, JSON.stringify(entry));
    } catch (err) {
      console.warn('[LocalSessionStorage] Failed to update profile/roles:', err);
    }
  }

  // ---- Genie Studio Session ----

  saveGenieSession(data: {
    authUserId: string;
    genieUser: Record<string, any>;
    isInternalUser: boolean;
    hasMarketingAccess: boolean;
  }): void {
    try {
      const entry: LocalGenieSession = {
        ...data,
        cachedAt: new Date().toISOString(),
      };
      localStorage.setItem(KEYS.GENIE_SESSION, JSON.stringify(entry));
    } catch (err) {
      console.warn('[LocalSessionStorage] Failed to save genie session:', err);
    }
  }

  loadGenieSession(): LocalGenieSession | null {
    try {
      const raw = localStorage.getItem(KEYS.GENIE_SESSION);
      if (!raw) return null;

      const entry: LocalGenieSession = JSON.parse(raw);
      if (this.isCacheExpired(entry.cachedAt)) {
        this.clearGenieSession();
        return null;
      }
      return entry;
    } catch {
      this.clearGenieSession();
      return null;
    }
  }

  clearGenieSession(): void {
    localStorage.removeItem(KEYS.GENIE_SESSION);
  }

  // ---- App State ----

  saveAppState(data: {
    currentFacilityId: string | null;
    p2Settings: Record<string, any> | null;
    aiPreferences: Record<string, any> | null;
  }): void {
    try {
      const entry: LocalAppState = {
        ...data,
        cachedAt: new Date().toISOString(),
      };
      localStorage.setItem(KEYS.APP_STATE, JSON.stringify(entry));
    } catch (err) {
      console.warn('[LocalSessionStorage] Failed to save app state:', err);
    }
  }

  loadAppState(): LocalAppState | null {
    try {
      const raw = localStorage.getItem(KEYS.APP_STATE);
      if (!raw) return null;

      const entry: LocalAppState = JSON.parse(raw);
      return entry; // App state doesn't expire the same way auth does
    } catch {
      return null;
    }
  }

  clearAppState(): void {
    localStorage.removeItem(KEYS.APP_STATE);
  }

  // ---- Full Snapshot (export / import) ----

  /**
   * Create a full snapshot of all local session data.
   * Useful for exporting session state or debugging.
   */
  exportSnapshot(): LocalSessionSnapshot {
    const recoveryStates: Record<string, any> = {};

    // Collect all genie_session_* recovery states
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('genie_session_')) {
        try {
          recoveryStates[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch {
          // skip corrupt entries
        }
      }
    }

    // Get cast session
    let castSession: Record<string, any> | null = null;
    try {
      const raw = localStorage.getItem('genie-cast-session');
      if (raw) castSession = JSON.parse(raw);
    } catch {
      // skip
    }

    return {
      version: SNAPSHOT_VERSION,
      createdAt: new Date().toISOString(),
      auth: this.loadAuthSession(),
      genie: this.loadGenieSession(),
      appState: this.loadAppState(),
      castSession,
      recoveryStates,
    };
  }

  /**
   * Import a full snapshot, restoring all local session data.
   * Merges non-null fields from the snapshot.
   */
  importSnapshot(snapshot: LocalSessionSnapshot): { imported: string[]; skipped: string[] } {
    const imported: string[] = [];
    const skipped: string[] = [];

    if (snapshot.auth) {
      localStorage.setItem(KEYS.AUTH_SESSION, JSON.stringify(snapshot.auth));
      imported.push('auth');
    } else {
      skipped.push('auth');
    }

    if (snapshot.genie) {
      localStorage.setItem(KEYS.GENIE_SESSION, JSON.stringify(snapshot.genie));
      imported.push('genie');
    } else {
      skipped.push('genie');
    }

    if (snapshot.appState) {
      localStorage.setItem(KEYS.APP_STATE, JSON.stringify(snapshot.appState));
      imported.push('appState');
    } else {
      skipped.push('appState');
    }

    if (snapshot.castSession) {
      localStorage.setItem('genie-cast-session', JSON.stringify(snapshot.castSession));
      imported.push('castSession');
    } else {
      skipped.push('castSession');
    }

    // Restore recovery states
    for (const [key, value] of Object.entries(snapshot.recoveryStates)) {
      localStorage.setItem(key, JSON.stringify(value));
      imported.push(key);
    }

    return { imported, skipped };
  }

  // ---- Cleanup ----

  /**
   * Clear ALL local session data (called on sign out).
   */
  clearAll(): void {
    this.clearAuthSession();
    this.clearGenieSession();
    this.clearAppState();

    // Clear cast session
    localStorage.removeItem('genie-cast-session');

    // Clear all recovery states
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('genie_session_') || key.startsWith(STORAGE_PREFIX))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Clear other known app keys
    localStorage.removeItem('genie_p2_settings');
    localStorage.removeItem('genie_ai_preferences');
    localStorage.removeItem('currentFacilityId');
    localStorage.removeItem('genie_studio_is_internal');
  }

  // ---- Utilities ----

  /**
   * Check if cached data is older than MAX_CACHE_AGE_MS.
   */
  private isCacheExpired(cachedAt: string): boolean {
    const cachedTime = new Date(cachedAt).getTime();
    return Date.now() - cachedTime > MAX_CACHE_AGE_MS;
  }

  /**
   * Get a summary of what's stored locally (useful for debug panels).
   */
  getStorageSummary(): {
    hasAuth: boolean;
    hasGenie: boolean;
    hasAppState: boolean;
    hasCastSession: boolean;
    recoveryCount: number;
    totalKeys: number;
    estimatedSizeKB: number;
  } {
    let recoveryCount = 0;
    let totalSize = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('genie_session_')) {
        recoveryCount++;
      }
      if (key) {
        const value = localStorage.getItem(key) || '';
        totalSize += key.length + value.length;
      }
    }

    return {
      hasAuth: !!localStorage.getItem(KEYS.AUTH_SESSION),
      hasGenie: !!localStorage.getItem(KEYS.GENIE_SESSION),
      hasAppState: !!localStorage.getItem(KEYS.APP_STATE),
      hasCastSession: !!localStorage.getItem('genie-cast-session'),
      recoveryCount,
      totalKeys: localStorage.length,
      estimatedSizeKB: Math.round(totalSize / 1024),
    };
  }
}

// Global singleton
export const localSessionStorage = new LocalSessionStorage();

// Export keys for AuthStateManager cleanup
export const LOCAL_SESSION_KEYS = KEYS;
