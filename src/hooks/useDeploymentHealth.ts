/**
 * DEPLOYMENT HEALTH & VERSIONING HOOK
 * Provides health monitoring, version history, and rollback for genie deployments.
 * Extends existing deploymentFeaturePersistence service.
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  deploymentFeaturePersistence,
  DeploymentHealthStatus,
  DeploymentVersion,
} from '@/services/deploymentFeaturePersistence';
import { useMasterToast } from './useMasterToast';

const HEALTH_POLL_INTERVAL_MS = 30_000; // 30 seconds

export const useDeploymentHealth = (deploymentId?: string) => {
  const [health, setHealth] = useState<DeploymentHealthStatus | null>(null);
  const [allHealth, setAllHealth] = useState<DeploymentHealthStatus[]>([]);
  const [versions, setVersions] = useState<DeploymentVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useMasterToast();
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  // ── Health Monitoring ──────────────────────────────
  const refreshHealth = useCallback(async () => {
    if (!deploymentId) return;
    const result = await deploymentFeaturePersistence.getDeploymentHealth(deploymentId);
    setHealth(result);
  }, [deploymentId]);

  const refreshAllHealth = useCallback(async () => {
    const results = await deploymentFeaturePersistence.getAllActiveDeploymentsHealth();
    setAllHealth(results);
  }, []);

  // Auto-poll health
  useEffect(() => {
    if (!deploymentId) return;
    refreshHealth();
    pollRef.current = setInterval(refreshHealth, HEALTH_POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [deploymentId, refreshHealth]);

  // ── Version History ────────────────────────────────
  const loadVersions = useCallback(async () => {
    if (!deploymentId) return;
    setLoading(true);
    try {
      const result = await deploymentFeaturePersistence.getVersionHistory(deploymentId);
      setVersions(result);
    } finally {
      setLoading(false);
    }
  }, [deploymentId]);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  // ── Versioning Actions ─────────────────────────────
  const createVersion = useCallback(async (changelog: string) => {
    if (!deploymentId) return null;
    setLoading(true);
    try {
      const result = await deploymentFeaturePersistence.createVersion(deploymentId, changelog);
      if (result.success) {
        showSuccess(`Version created successfully`);
        await loadVersions();
      } else {
        showError(result.error || 'Failed to create version');
      }
      return result;
    } finally {
      setLoading(false);
    }
  }, [deploymentId, loadVersions, showSuccess, showError]);

  const rollback = useCallback(async (targetVersionId: string) => {
    setLoading(true);
    try {
      const result = await deploymentFeaturePersistence.rollbackToVersion(targetVersionId);
      if (result.success) {
        showSuccess('Rolled back successfully');
        await loadVersions();
        await refreshHealth();
      } else {
        showError(result.error || 'Rollback failed');
      }
      return result;
    } finally {
      setLoading(false);
    }
  }, [loadVersions, refreshHealth, showSuccess, showError]);

  return {
    // Health
    health,
    allHealth,
    refreshHealth,
    refreshAllHealth,
    // Versions
    versions,
    loading,
    loadVersions,
    createVersion,
    rollback,
  };
};
