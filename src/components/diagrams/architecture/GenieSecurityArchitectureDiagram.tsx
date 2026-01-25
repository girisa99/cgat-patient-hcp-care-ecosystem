/**
 * Genie Security Architecture Diagram
 * Authentication • Compliance • RLS • Content Moderation
 * Updated: 2026-01-25
 */

import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Maximize2, X, Shield, Lock, Key, Eye, UserCheck, AlertTriangle, CheckCircle, Globe } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

const authProviders = [
  { name: 'Supabase Auth', type: 'Primary', features: ['Email/Password', 'Magic Link', 'OTP'], status: 'active' },
  { name: 'Google OAuth', type: 'Social', features: ['Google Workspace', 'Gmail'], status: 'active' },
  { name: 'GitHub OAuth', type: 'Social', features: ['Developer Auth'], status: 'active' },
  { name: 'Azure AD (SAML)', type: 'Enterprise', features: ['SSO', 'SCIM'], status: 'partial' },
  { name: 'Apple Sign-In', type: 'Mobile', features: ['iOS Auth'], status: 'planned' },
];

const securityLayers = [
  { layer: 'Transport Layer', color: 'emerald', controls: [
    { name: 'HTTPS/TLS 1.3', description: 'All traffic encrypted', status: 'active' },
    { name: 'HSTS', description: 'Force HTTPS', status: 'active' },
    { name: 'VPN Detection', description: 'Sanctions compliance', status: 'active' },
  ]},
  { layer: 'Application Layer', color: 'blue', controls: [
    { name: 'JWT Tokens', description: 'Stateless auth', status: 'active' },
    { name: 'Rate Limiting', description: '60/min API, 10/min public', status: 'active' },
    { name: 'Input Validation', description: 'Zod schemas', status: 'active' },
    { name: 'Content Moderation', description: 'Adult/PII blocking', status: 'active' },
  ]},
  { layer: 'Database Layer', color: 'violet', controls: [
    { name: 'Row Level Security', description: '100+ RLS policies', status: 'active' },
    { name: 'Audit Logging', description: 'All data changes tracked', status: 'active' },
    { name: 'Encryption at Rest', description: 'AES-256', status: 'active' },
  ]},
  { layer: 'Infrastructure', color: 'orange', controls: [
    { name: 'Edge Function Isolation', description: 'Deno sandboxing', status: 'active' },
    { name: 'Secrets Management', description: 'Supabase Vault', status: 'active' },
    { name: 'DDoS Protection', description: 'Cloudflare CDN', status: 'active' },
  ]},
];

const complianceFrameworks = [
  { name: 'GDPR', status: 'active', regions: ['EU'], requirements: ['Data Deletion', 'Consent', 'DPA'] },
  { name: 'CCPA', status: 'active', regions: ['California'], requirements: ['Opt-out', 'Disclosure'] },
  { name: 'LGPD', status: 'active', regions: ['Brazil'], requirements: ['Consent', 'Data Rights'] },
  { name: 'PDPL', status: 'active', regions: ['MENA'], requirements: ['Data Localization'] },
  { name: 'HIPAA', status: 'partial', regions: ['US Healthcare'], requirements: ['BAA', 'Encryption'] },
  { name: 'SOC 2', status: 'planned', regions: ['Enterprise'], requirements: ['Audit', 'Monitoring'] },
];

const sanctionedRegions = ['RU', 'BY', 'IR', 'KP', 'SY', 'CU'];

const rbacRoles = [
  { role: 'Super Admin', permissions: ['ALL'], color: 'red' },
  { role: 'Admin', permissions: ['Manage Users', 'Configure Agents'], color: 'orange' },
  { role: 'Manager', permissions: ['Create Agents', 'Manage Team'], color: 'amber' },
  { role: 'Creator', permissions: ['Create Content', 'Use Agents'], color: 'blue' },
  { role: 'Viewer', permissions: ['View Only'], color: 'slate' },
];

export const GenieSecurityArchitectureDiagram: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);

  const handleDownloadPNG = async () => {
    if (!diagramRef.current) return;
    try {
      toast.info('Generating PNG...');
      const canvas = await html2canvas(diagramRef.current, { backgroundColor: '#ffffff', scale: 3, useCORS: true });
      const link = document.createElement('a');
      link.download = 'genie-security-architecture.png';
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      toast.success('Downloaded!');
    } catch { toast.error('Failed'); }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">✓</Badge>;
      case 'partial': return <Badge className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">◐</Badge>;
      default: return <Badge className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">○</Badge>;
    }
  };

  const content = (
    <div ref={diagramRef} className="p-6 bg-background rounded-xl space-y-6 border border-border">
      <div className="text-center border-b border-border pb-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center justify-center gap-3">
          <Shield className="h-8 w-8 text-red-500" />
          Genie Security Architecture
        </h2>
        <p className="text-muted-foreground mt-2">Auth • RLS • Compliance • Content Moderation • Geo-Blocking</p>
      </div>

      <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-2 border-red-200 dark:border-red-800/40">
        <CardContent className="pt-4">
          <div className="grid grid-cols-6 gap-4 text-center">
            <div><div className="text-2xl font-bold text-red-600">{authProviders.length}</div><div className="text-xs text-muted-foreground">Auth Providers</div></div>
            <div><div className="text-2xl font-bold text-orange-600">4</div><div className="text-xs text-muted-foreground">Security Layers</div></div>
            <div><div className="text-2xl font-bold text-emerald-600">100+</div><div className="text-xs text-muted-foreground">RLS Policies</div></div>
            <div><div className="text-2xl font-bold text-blue-600">{rbacRoles.length}</div><div className="text-xs text-muted-foreground">RBAC Roles</div></div>
            <div><div className="text-2xl font-bold text-violet-600">{complianceFrameworks.length}</div><div className="text-xs text-muted-foreground">Compliance</div></div>
            <div><div className="text-2xl font-bold text-pink-600">{sanctionedRegions.length}</div><div className="text-xs text-muted-foreground">Blocked Regions</div></div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-blue-200 dark:border-blue-800/40 bg-blue-50/50 dark:bg-blue-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-blue-700 dark:text-blue-400 flex items-center gap-2"><Key className="h-5 w-5" />Authentication Providers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {authProviders.map((p) => (
              <div key={p.name} className="bg-background rounded-lg p-3 border border-border">
                <div className="flex items-center justify-between mb-2"><span className="font-semibold text-sm">{p.name}</span>{getStatusBadge(p.status)}</div>
                <Badge variant="secondary" className="text-xs mb-2">{p.type}</Badge>
                <div className="flex flex-wrap gap-1">{p.features.map((f) => <Badge key={f} variant="outline" className="text-xs">{f}</Badge>)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {securityLayers.map((layer) => (
          <Card key={layer.layer} className={`border-2 border-${layer.color}-200 dark:border-${layer.color}-800/40 bg-${layer.color}-50/50 dark:bg-${layer.color}-950/10`}>
            <CardHeader className="pb-2"><CardTitle className={`text-sm text-${layer.color}-700 dark:text-${layer.color}-400 flex items-center gap-2`}><Lock className="h-4 w-4" />{layer.layer}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {layer.controls.map((c) => (
                  <div key={c.name} className="bg-background rounded p-2 border border-border flex items-center justify-between">
                    <div><span className="font-semibold text-xs">{c.name}</span><p className="text-muted-foreground text-xs">{c.description}</p></div>
                    {getStatusBadge(c.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-2 border-pink-200 dark:border-pink-800/40 bg-pink-50/50 dark:bg-pink-950/10">
        <CardHeader className="pb-2"><CardTitle className="text-lg text-pink-700 dark:text-pink-400 flex items-center gap-2"><CheckCircle className="h-5 w-5" />Compliance (13 Regional Zones)</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-3">
            {complianceFrameworks.map((f) => (
              <div key={f.name} className="bg-background rounded-lg p-3 border border-border">
                <div className="flex items-center justify-between mb-2"><span className="font-bold text-sm">{f.name}</span>{getStatusBadge(f.status)}</div>
                <div className="flex flex-wrap gap-1">{f.requirements.slice(0, 2).map((r) => <Badge key={r} variant="outline" className="text-xs">{r}</Badge>)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-red-200 dark:border-red-800/40 bg-red-50/50 dark:bg-red-950/10">
        <CardHeader className="pb-2"><CardTitle className="text-lg text-red-700 dark:text-red-400 flex items-center gap-2"><AlertTriangle className="h-5 w-5" />OFAC Sanctions Blocking</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {sanctionedRegions.map((r) => <Badge key={r} variant="destructive" className="text-sm">{r}</Badge>)}
            <span className="text-muted-foreground text-sm ml-4">IP + VPN detection enabled</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background overflow-auto">
        <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
          <h2 className="font-semibold">Genie Security Architecture</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadPNG}><Download className="h-4 w-4 mr-2" />Download</Button>
            <Button variant="outline" size="sm" onClick={() => setIsFullscreen(false)}><X className="h-4 w-4 mr-2" />Close</Button>
          </div>
        </div>
        <div className="p-8 flex justify-center"><div className="max-w-7xl w-full">{content}</div></div>
      </div>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5 text-red-500" />Security Architecture</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(true)}><Maximize2 className="h-4 w-4" /></Button>
          <Button variant="default" size="sm" onClick={handleDownloadPNG}><Download className="h-4 w-4" /></Button>
        </div>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
};

export default GenieSecurityArchitectureDiagram;
