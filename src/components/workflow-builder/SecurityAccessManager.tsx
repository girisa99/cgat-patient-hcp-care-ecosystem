import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Shield, 
  Users, 
  Key, 
  Lock, 
  Settings, 
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface SecurityAccessManagerProps {
  onPermissionChange?: (permission: any) => void;
}

export const SecurityAccessManager: React.FC<SecurityAccessManagerProps> = ({
  onPermissionChange
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'User Roles': true,
    'Permissions': false,
    'Security Policies': false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const accessSections = {
    'User Roles': {
      icon: Users,
      items: [
        { name: 'Healthcare Provider', level: 'Full Access', status: 'active', count: 12 },
        { name: 'Patient Caregiver', level: 'Limited Access', status: 'active', count: 8 },
        { name: 'Admin User', level: 'System Admin', status: 'active', count: 3 },
        { name: 'Onboarding Team', level: 'Workflow Access', status: 'active', count: 5 }
      ]
    },
    'Permissions': {
      icon: Key,
      items: [
        { name: 'Read Patient Data', level: 'Healthcare Only', status: 'enforced', count: 15 },
        { name: 'Modify Workflows', level: 'Admin & Team', status: 'enforced', count: 8 },
        { name: 'Export Reports', level: 'Provider & Admin', status: 'enforced', count: 12 },
        { name: 'System Configuration', level: 'Admin Only', status: 'enforced', count: 3 }
      ]
    },
    'Security Policies': {
      icon: Shield,
      items: [
        { name: 'RLS Enforcement', level: 'Database Level', status: 'active', count: 9 },
        { name: 'Authentication Required', level: 'All Tables', status: 'active', count: 15 },
        { name: 'Role-based Access', level: 'Healthcare Data', status: 'active', count: 6 },
        { name: 'Audit Logging', level: 'All Operations', status: 'pending', count: 0 }
      ]
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'enforced':
        return <CheckCircle className="h-3 w-3 text-success" />;
      case 'pending':
        return <Clock className="h-3 w-3 text-warning" />;
      default:
        return <AlertCircle className="h-3 w-3 text-destructive" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'enforced':
        return 'bg-success/10 text-success border-success/20';
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-destructive/10 text-destructive border-destructive/20';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-4 w-4 text-primary" />
        <span className="font-medium text-sm">Security Access Manager</span>
        <Badge variant="secondary" className="text-xs">HIPAA</Badge>
      </div>
      
      <div className="text-xs text-muted-foreground mb-4 p-3 bg-muted/30 rounded-lg">
        <strong>Healthcare Compliance:</strong> All access controls follow HIPAA requirements with role-based permissions and audit trails.
      </div>

      {Object.entries(accessSections).map(([sectionName, section]) => (
        <Collapsible 
          key={sectionName}
          open={expandedSections[sectionName]}
          onOpenChange={() => toggleSection(sectionName)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center justify-between w-full p-3 h-auto text-left hover:bg-accent/50 rounded-lg border border-border"
            >
              <div className="flex items-center gap-3">
                <section.icon className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">{sectionName}</span>
                <Badge variant="outline" className="text-xs">
                  {section.items.length}
                </Badge>
              </div>
              <ChevronDown 
                className={`h-4 w-4 transition-transform ${
                  expandedSections[sectionName] ? 'rotate-0' : '-rotate-90'
                }`} 
              />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-2 mt-2 ml-3">
            {section.items.map((item, idx) => (
              <Card key={idx} className="p-3 hover:bg-accent/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getStatusIcon(item.status)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.level}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getStatusColor(item.status)}`}
                    >
                      {item.status}
                    </Badge>
                    {item.count > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {item.count}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </CollapsibleContent>
        </Collapsible>
      ))}

      <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Security Status</span>
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>RLS Policies Active:</span>
            <span className="text-success font-medium">9/9 Tables</span>
          </div>
          <div className="flex justify-between">
            <span>Authentication Required:</span>
            <span className="text-success font-medium">100%</span>
          </div>
          <div className="flex justify-between">
            <span>Compliance Level:</span>
            <span className="text-success font-medium">HIPAA Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};