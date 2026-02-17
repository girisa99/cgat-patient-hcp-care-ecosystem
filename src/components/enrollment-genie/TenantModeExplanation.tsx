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
      title: 'Multi-Tenant',
      description: 'Multiple organizations with isolated data',
      icon: Building2,
      color: 'bg-blue-500',
      keyPoints: ['Data isolation', 'Custom branding', 'Independent management']
    },
    'system': {
      title: 'SYSTEM Mode',
      description: 'Default operational mode',
      icon: Settings,
      color: 'bg-green-500',
      keyPoints: ['Core operations', 'Standard workflows', 'Unified access']
    }
  };

  return (
    <div className="space-y-3 max-w-md">
      <div className="text-center mb-4">
        <h3 className="text-base font-semibold mb-1">Operational Modes</h3>
        <p className="text-xs text-muted-foreground">
          Choose the mode for your organization
        </p>
      </div>

      <div className="space-y-3">
        {Object.entries(modes).map(([key, mode]) => {
          const IconComponent = mode.icon;
          const isActive = currentMode === key;
          
          return (
            <Card key={key} className={`relative ${isActive ? 'ring-1 ring-primary' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded ${mode.color} text-white flex-shrink-0`}>
                    <IconComponent className="h-3 w-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium">{mode.title}</h4>
                      {isActive && (
                        <Badge variant="default" className="text-xs px-1.5 py-0.5">
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{mode.description}</p>
                    <div className="space-y-1">
                      {mode.keyPoints.map((point, index) => (
                        <div key={index} className="flex items-center gap-1.5 text-xs">
                          <div className="w-1 h-1 bg-primary rounded-full flex-shrink-0" />
                          <span className="text-muted-foreground">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-muted/30 p-3 rounded border">
        <div className="flex items-start gap-2">
          <Globe className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-xs mb-1">Current: {modes[currentMode].title}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Affects data organization, user access, and platform settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};