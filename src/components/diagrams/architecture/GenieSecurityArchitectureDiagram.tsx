/**
 * Genie Security Architecture Diagram
 * Authentication, Authorization, RLS, Encryption, and Compliance
 */

import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Maximize2, X, Shield, Lock, Key, Eye, UserCheck, AlertTriangle, CheckCircle, Globe, Server } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

const authProviders = [
  { name: 'Supabase Auth', type: 'Primary', features: ['Email/Password', 'Magic Link', 'OTP'], status: 'active' },
  { name: 'Google OAuth', type: 'Social', features: ['Google Workspace', 'Gmail'], status: 'active' },
  { name: 'GitHub OAuth', type: 'Social', features: ['Developer Auth'], status: 'active' },
  { name: 'Azure AD (SAML)', type: 'Enterprise', features: ['SSO', 'SCIM'], status: 'planned' },
  { name: 'Okta (OIDC)', type: 'Enterprise', features: ['SSO', 'MFA'], status: 'planned' },
];

const securityLayers = [
  {
    layer: 'Transport Layer',
    color: 'emerald',
    controls: [
      { name: 'HTTPS/TLS 1.3', description: 'All traffic encrypted', status: 'active' },
      { name: 'HSTS', description: 'Force HTTPS', status: 'active' },
      { name: 'Certificate Pinning', description: 'Mobile apps', status: 'planned' },
    ],
  },
  {
    layer: 'Application Layer',
    color: 'blue',
    controls: [
      { name: 'JWT Tokens', description: 'Stateless auth', status: 'active' },
      { name: 'CORS Policy', description: 'Origin validation', status: 'active' },
      { name: 'Rate Limiting', description: 'API throttling', status: 'active' },
      { name: 'Input Validation', description: 'Zod schemas', status: 'active' },
    ],
  },
  {
    layer: 'Database Layer',
    color: 'violet',
    controls: [
      { name: 'Row Level Security (RLS)', description: 'Per-user data isolation', status: 'active' },
      { name: 'Column-Level Encryption', description: 'Sensitive data', status: 'partial' },
      { name: 'Audit Logging', description: 'All data changes', status: 'active' },
      { name: 'Backup Encryption', description: 'At-rest encryption', status: 'active' },
    ],
  },
  {
    layer: 'Infrastructure Layer',
    color: 'orange',
    controls: [
      { name: 'Edge Functions Isolation', description: 'Deno sandboxing', status: 'active' },
      { name: 'Secrets Management', description: 'Supabase Vault', status: 'active' },
      { name: 'CDN Security', description: 'DDoS protection', status: 'active' },
      { name: 'Network Segmentation', description: 'VPC isolation', status: 'active' },
    ],
  },
];

const rbacRoles = [
  { role: 'Super Admin', permissions: ['ALL'], users: '2', color: 'red' },
  { role: 'Admin', permissions: ['Manage Users', 'View Analytics', 'Configure Agents'], users: '5', color: 'orange' },
  { role: 'Manager', permissions: ['Create Agents', 'Manage Team', 'View Reports'], users: '15', color: 'amber' },
  { role: 'Creator', permissions: ['Create Content', 'Edit Own', 'Use Agents'], users: '100', color: 'blue' },
  { role: 'Viewer', permissions: ['View Content', 'Use Public Agents'], users: '500', color: 'slate' },
];

const complianceFrameworks = [
  { name: 'HIPAA', status: 'partial', description: 'Healthcare data protection', requirements: ['BAA', 'Encryption', 'Audit Logs'] },
  { name: 'SOC 2 Type II', status: 'planned', description: 'Service organization controls', requirements: ['Access Controls', 'Monitoring', 'Incident Response'] },
  { name: 'GDPR', status: 'active', description: 'EU data protection', requirements: ['Data Deletion', 'Consent', 'DPA'] },
  { name: 'CCPA', status: 'active', description: 'California privacy', requirements: ['Opt-out', 'Data Access', 'Disclosure'] },
];

const securityFeatures = [
  { name: 'MFA Support', status: 'active', icon: Key },
  { name: 'Session Management', status: 'active', icon: UserCheck },
  { name: 'Audit Trail', status: 'active', icon: Eye },
  { name: 'Anomaly Detection', status: 'planned', icon: AlertTriangle },
  { name: 'Penetration Testing', status: 'partial', icon: Shield },
  { name: 'Vulnerability Scanning', status: 'active', icon: CheckCircle },
];

const apiSecurityPolicies = [
  { endpoint: 'ai-universal-processor', auth: 'JWT + API Key', rateLimit: '60/min', status: 'active' },
  { endpoint: 'tts-generate', auth: 'JWT', rateLimit: '30/min', status: 'active' },
  { endpoint: 'stripe-webhook', auth: 'Signature Verification', rateLimit: 'N/A', status: 'active' },
  { endpoint: 'public-genie', auth: 'Rate Limited', rateLimit: '10/min', status: 'active' },
  { endpoint: 'admin-api', auth: 'JWT + Admin Role', rateLimit: '120/min', status: 'active' },
];

export const GenieSecurityArchitectureDiagram: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);

  const handleDownloadPNG = async () => {
    if (!diagramRef.current) return;
    try {
      toast.info('Generating PNG...');
      const canvas = await html2canvas(diagramRef.current, {
        backgroundColor: '#ffffff',
        scale: 3,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = 'genie-security-architecture.png';
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      toast.success('PNG downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download PNG');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700">✓ Active</Badge>;
      case 'partial':
        return <Badge className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700">◐ Partial</Badge>;
      default:
        return <Badge className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700">○ Planned</Badge>;
    }
  };

  const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-800/40', text: 'text-emerald-600 dark:text-emerald-400' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-800/40', text: 'text-blue-600 dark:text-blue-400' },
    violet: { bg: 'bg-violet-50 dark:bg-violet-950/20', border: 'border-violet-200 dark:border-violet-800/40', text: 'text-violet-600 dark:text-violet-400' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-950/20', border: 'border-orange-200 dark:border-orange-800/40', text: 'text-orange-600 dark:text-orange-400' },
  };

  const content = (
    <div ref={diagramRef} className="p-6 bg-background rounded-xl space-y-6 border border-border">
      {/* Header */}
      <div className="text-center border-b border-border pb-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center justify-center gap-3">
          <Shield className="h-8 w-8 text-red-500" />
          Genie Security Architecture
        </h2>
        <p className="text-muted-foreground mt-2">Authentication • Authorization • RLS • Encryption • Compliance</p>
      </div>

      {/* Security Stats */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-2 border-red-200 dark:border-red-800/40">
        <CardContent className="pt-4">
          <div className="grid grid-cols-6 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{authProviders.length}</div>
              <div className="text-xs text-muted-foreground font-medium">Auth Providers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">4</div>
              <div className="text-xs text-muted-foreground font-medium">Security Layers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">100+</div>
              <div className="text-xs text-muted-foreground font-medium">RLS Policies</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{rbacRoles.length}</div>
              <div className="text-xs text-muted-foreground font-medium">RBAC Roles</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">{complianceFrameworks.length}</div>
              <div className="text-xs text-muted-foreground font-medium">Compliance</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{securityFeatures.length}</div>
              <div className="text-xs text-muted-foreground font-medium">Security Features</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auth Providers */}
      <Card className="border-2 border-blue-200 dark:border-blue-800/40 bg-blue-50/50 dark:bg-blue-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-blue-700 dark:text-blue-400 flex items-center gap-2">
            <Key className="h-5 w-5" />
            Authentication Providers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {authProviders.map((provider) => (
              <div key={provider.name} className="bg-background rounded-lg p-3 border-2 border-border shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-foreground font-semibold text-sm">{provider.name}</span>
                  {getStatusBadge(provider.status)}
                </div>
                <Badge variant="secondary" className="text-xs mb-2">{provider.type}</Badge>
                <div className="flex flex-wrap gap-1">
                  {provider.features.map((feature) => (
                    <Badge key={feature} variant="outline" className="text-xs">{feature}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Layers */}
      <div className="grid grid-cols-2 gap-4">
        {securityLayers.map((layer) => {
          const colors = colorClasses[layer.color];
          return (
            <Card key={layer.layer} className={`${colors.bg} border-2 ${colors.border}`}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm ${colors.text} flex items-center gap-2`}>
                  <Lock className="h-4 w-4" />
                  {layer.layer}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {layer.controls.map((control) => (
                    <div key={control.name} className="bg-background rounded p-2 border-2 border-border flex items-center justify-between shadow-sm">
                      <div>
                        <span className="text-foreground font-semibold text-xs">{control.name}</span>
                        <p className="text-muted-foreground text-xs">{control.description}</p>
                      </div>
                      {getStatusBadge(control.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* RBAC Roles */}
      <Card className="border-2 border-purple-200 dark:border-purple-800/40 bg-purple-50/50 dark:bg-purple-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-purple-700 dark:text-purple-400 flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Role-Based Access Control (RBAC)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {rbacRoles.map((role) => (
              <div key={role.role} className="bg-background rounded-lg p-3 border-2 border-border text-center shadow-sm">
                <div className={`text-${role.color}-600 dark:text-${role.color}-400 font-bold text-sm`}>{role.role}</div>
                <div className="text-2xl font-bold text-foreground my-2">{role.users}</div>
                <div className="text-xs text-muted-foreground">users</div>
                <div className="mt-2 flex flex-wrap gap-1 justify-center">
                  {role.permissions.slice(0, 2).map((perm) => (
                    <Badge key={perm} variant="outline" className="text-xs">{perm}</Badge>
                  ))}
                  {role.permissions.length > 2 && (
                    <Badge variant="secondary" className="text-xs">+{role.permissions.length - 2}</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Security */}
      <Card className="border-2 border-cyan-200 dark:border-cyan-800/40 bg-cyan-50/50 dark:bg-cyan-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-cyan-700 dark:text-cyan-400 flex items-center gap-2">
            <Globe className="h-5 w-5" />
            API Security Policies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {apiSecurityPolicies.map((api) => (
              <div key={api.endpoint} className="bg-background rounded-lg p-2 border-2 border-border shadow-sm">
                <code className="text-cyan-600 dark:text-cyan-400 text-xs font-bold block mb-1">{api.endpoint}</code>
                <div className="text-xs text-muted-foreground">{api.auth}</div>
                <Badge variant="secondary" className="text-xs mt-1">{api.rateLimit}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Frameworks */}
      <Card className="border-2 border-pink-200 dark:border-pink-800/40 bg-pink-50/50 dark:bg-pink-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-pink-700 dark:text-pink-400 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Compliance Frameworks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {complianceFrameworks.map((framework) => (
              <div key={framework.name} className="bg-background rounded-lg p-3 border-2 border-border shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-foreground font-bold text-sm">{framework.name}</span>
                  {getStatusBadge(framework.status)}
                </div>
                <p className="text-muted-foreground text-xs mb-2">{framework.description}</p>
                <div className="flex flex-wrap gap-1">
                  {framework.requirements.map((req) => (
                    <Badge key={req} variant="outline" className="text-xs">{req}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Features Grid */}
      <Card className="border-2 border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-3">
            {securityFeatures.map((feature) => (
              <div key={feature.name} className="bg-background rounded-lg p-3 border-2 border-border text-center shadow-sm">
                <feature.icon className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
                <div className="text-foreground text-sm font-semibold">{feature.name}</div>
                <div className="mt-2">{getStatusBadge(feature.status)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background overflow-auto">
        <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
          <h2 className="text-foreground font-semibold text-lg">Genie Security Architecture</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadPNG}>
              <Download className="h-4 w-4 mr-2" />
              Download PNG
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsFullscreen(false)}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
        <div className="p-8 flex justify-center">
          <div className="max-w-7xl w-full">{content}</div>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-foreground text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-red-500" />
          Security Architecture
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(true)} className="gap-2">
            <Maximize2 className="h-4 w-4" />
            Full Size
          </Button>
          <Button variant="default" size="sm" onClick={handleDownloadPNG} className="gap-2">
            <Download className="h-4 w-4" />
            Download PNG
          </Button>
        </div>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
};

export default GenieSecurityArchitectureDiagram;
