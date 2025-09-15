import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Settings, Shield, Users, Database, Globe } from 'lucide-react';

interface TenantModeExplanationProps {
  currentMode?: 'multi-tenant' | 'system';
}

export const TenantModeExplanation: React.FC<TenantModeExplanationProps> = ({ 
  currentMode = 'system' 
}) => {
  const modes = {
    'multi-tenant': {
      title: 'Multi-Tenant Mode',
      description: 'Supports multiple organizations with isolated data and configurations',
      icon: Building2,
      color: 'bg-blue-500',
      features: [
        'Data isolation per organization',
        'Custom branding per tenant',
        'Independent user management',
        'Separate compliance settings',
        'Isolated reporting and analytics',
        'Tenant-specific configurations'
      ],
      benefits: [
        'Enterprise-ready',
        'Scalable architecture',
        'Data security',
        'Customizable experience'
      ]
    },
    'system': {
      title: 'SYSTEM Mode',
      description: 'Default operational mode with core system functionalities',
      icon: Settings,
      color: 'bg-green-500',
      features: [
        'Core system operations',
        'Default configurations',
        'Standard workflows',
        'Basic user management',
        'System-wide settings',
        'Universal access patterns'
      ],
      benefits: [
        'Simplified setup',
        'Faster deployment',
        'Consistent experience',
        'Easier maintenance'
      ]
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Operational Modes</h3>
        <p className="text-sm text-muted-foreground">
          Choose the mode that best fits your organizational needs
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(modes).map(([key, mode]) => {
          const IconComponent = mode.icon;
          const isActive = currentMode === key;
          
          return (
            <Card key={key} className={`relative ${isActive ? 'ring-2 ring-primary' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${mode.color} text-white`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-base">{mode.title}</CardTitle>
                  </div>
                  {isActive && (
                    <Badge variant="default" className="text-xs">
                      Current
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{mode.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Database className="h-3 w-3" />
                    Key Features
                  </h4>
                  <ul className="text-xs space-y-1">
                    {mode.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                        {feature}
                      </li>
                    ))}
                    {mode.features.length > 4 && (
                      <li className="text-muted-foreground">
                        +{mode.features.length - 4} more features
                      </li>
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Benefits
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {mode.benefits.map((benefit, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Globe className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Current Configuration</h4>
            <p className="text-xs text-muted-foreground">
              The system is currently running in <strong>{modes[currentMode].title}</strong>. 
              This affects how patient data is organized, user access is managed, and 
              organizational settings are applied across the platform.
            </p>
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="outline" className="text-xs">
                Mode: {currentMode.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {currentMode === 'multi-tenant' ? 'Enterprise Ready' : 'Standard Operation'}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};