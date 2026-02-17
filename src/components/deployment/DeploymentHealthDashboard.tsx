/**
 * DEPLOYMENT HEALTH & VERSIONING DASHBOARD
 * Shows health status, analytics metrics, and version history with rollback.
 * Uses existing genie_deployments table columns (total_conversations, total_tokens_used, avg_confidence_score, version, parent_deployment_id, changelog).
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Heart,
  Activity,
  History,
  RotateCcw,
  Plus,
  MessageSquare,
  Zap,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { useDeploymentHealth } from '@/hooks/useDeploymentHealth';
import { DeploymentHealthStatus, DeploymentVersion } from '@/services/deploymentFeaturePersistence';

interface DeploymentHealthDashboardProps {
  deploymentId?: string;
  showAllDeployments?: boolean;
}

const STATUS_CONFIG: Record<DeploymentHealthStatus['status'], { icon: React.ElementType; color: string; label: string }> = {
  healthy: { icon: CheckCircle, color: 'text-green-500', label: 'Healthy' },
  degraded: { icon: AlertTriangle, color: 'text-yellow-500', label: 'Degraded' },
  unhealthy: { icon: XCircle, color: 'text-red-500', label: 'Unhealthy' },
  unknown: { icon: HelpCircle, color: 'text-muted-foreground', label: 'Unknown' },
};

function formatUptime(seconds: number): string {
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export const DeploymentHealthDashboard: React.FC<DeploymentHealthDashboardProps> = ({
  deploymentId,
  showAllDeployments = false,
}) => {
  const {
    health,
    allHealth,
    versions,
    loading,
    refreshHealth,
    refreshAllHealth,
    createVersion,
    rollback,
  } = useDeploymentHealth(deploymentId);

  const [changelog, setChangelog] = useState('');
  const [activeTab, setActiveTab] = useState<'health' | 'analytics' | 'versions'>('health');

  const healthData = health;
  const statusConfig = healthData ? STATUS_CONFIG[healthData.status] : STATUS_CONFIG.unknown;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-2">
        {[
          { id: 'health' as const, label: 'Health', icon: Heart },
          { id: 'analytics' as const, label: 'Analytics', icon: Activity },
          { id: 'versions' as const, label: 'Versions', icon: History },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon className="h-4 w-4 mr-1" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Health Tab */}
      {activeTab === 'health' && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="h-5 w-5" />
                Deployment Health
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={refreshHealth}>
                <Activity className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {healthData ? (
              <>
                {/* Status Badge */}
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <StatusIcon className={`h-8 w-8 ${statusConfig.color}`} />
                  <div>
                    <div className="font-semibold text-lg">{statusConfig.label}</div>
                    <div className="text-sm text-muted-foreground">
                      Last checked: {new Date(healthData.lastChecked).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-3 w-3" />
                      Uptime: {formatUptime(healthData.uptime)}
                    </div>
                  </div>
                </div>

                {/* Quick Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg border text-center">
                    <MessageSquare className="h-4 w-4 mx-auto mb-1 text-primary" />
                    <div className="text-xl font-bold">{formatNumber(healthData.metrics.totalConversations)}</div>
                    <div className="text-xs text-muted-foreground">Conversations</div>
                  </div>
                  <div className="p-3 rounded-lg border text-center">
                    <Zap className="h-4 w-4 mx-auto mb-1 text-primary" />
                    <div className="text-xl font-bold">{formatNumber(healthData.metrics.totalTokensUsed)}</div>
                    <div className="text-xs text-muted-foreground">Tokens Used</div>
                  </div>
                  <div className="p-3 rounded-lg border text-center">
                    <Target className="h-4 w-4 mx-auto mb-1 text-primary" />
                    <div className="text-xl font-bold">{(healthData.metrics.avgConfidenceScore * 100).toFixed(0)}%</div>
                    <div className="text-xs text-muted-foreground">Confidence</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-6">
                {deploymentId ? 'Loading health data...' : 'Select a deployment to view health'}
              </div>
            )}

            {/* All Deployments Overview */}
            {showAllDeployments && allHealth.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <h4 className="text-sm font-medium">All Active Deployments</h4>
                {allHealth.map((h) => {
                  const cfg = STATUS_CONFIG[h.status];
                  const Icon = cfg.icon;
                  return (
                    <div key={h.deploymentId} className="flex items-center gap-2 p-2 rounded border text-sm">
                      <Icon className={`h-4 w-4 ${cfg.color}`} />
                      <span className="font-mono text-xs truncate flex-1">{h.deploymentId.slice(0, 8)}...</span>
                      <Badge variant="secondary">{cfg.label}</Badge>
                      <span className="text-xs text-muted-foreground">{formatNumber(h.metrics.totalConversations)} conv</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5" />
              Deployment Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {healthData ? (
              <>
                {/* Confidence Score Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Average Confidence Score</span>
                    <span className="font-bold">{(healthData.metrics.avgConfidenceScore * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={healthData.metrics.avgConfidenceScore * 100} />
                </div>

                {/* Detailed Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground">Total Conversations</div>
                    <div className="text-2xl font-bold mt-1">{formatNumber(healthData.metrics.totalConversations)}</div>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground">Total Tokens Used</div>
                    <div className="text-2xl font-bold mt-1">{formatNumber(healthData.metrics.totalTokensUsed)}</div>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground">Uptime</div>
                    <div className="text-2xl font-bold mt-1">{formatUptime(healthData.uptime)}</div>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground">Health Status</div>
                    <div className="flex items-center gap-1 mt-1">
                      <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                      <span className="text-lg font-bold">{statusConfig.label}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-6">
                {deploymentId ? 'Loading analytics...' : 'Select a deployment to view analytics'}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Versions Tab */}
      {activeTab === 'versions' && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="h-5 w-5" />
                Version History
              </CardTitle>
              <Badge variant="secondary">{versions.length} version(s)</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Create New Version */}
            {deploymentId && (
              <div className="flex gap-2">
                <Input
                  placeholder="Changelog message..."
                  value={changelog}
                  onChange={(e) => setChangelog(e.target.value)}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  disabled={!changelog.trim() || loading}
                  onClick={async () => {
                    await createVersion(changelog.trim());
                    setChangelog('');
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Snapshot
                </Button>
              </div>
            )}

            {/* Version List */}
            <div className="space-y-2">
              {versions.length === 0 ? (
                <div className="text-center text-muted-foreground py-6">
                  No version history yet. Create a snapshot to start tracking.
                </div>
              ) : (
                versions.map((v) => (
                  <div
                    key={v.id}
                    className={`p-3 rounded-lg border flex items-center gap-3 ${
                      v.is_active ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold">v{v.version}</span>
                        {v.is_active && <Badge variant="default">Active</Badge>}
                        <Badge variant="outline" className="text-xs">
                          {v.deployment_status}
                        </Badge>
                      </div>
                      {v.changelog && (
                        <p className="text-sm text-muted-foreground mt-1 truncate">{v.changelog}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {v.created_at ? new Date(v.created_at).toLocaleDateString() : 'N/A'}
                        {v.deployed_at && ` • Deployed: ${new Date(v.deployed_at).toLocaleDateString()}`}
                      </p>
                    </div>
                    {!v.is_active && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={loading}
                        onClick={() => rollback(v.id)}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Rollback
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DeploymentHealthDashboard;
