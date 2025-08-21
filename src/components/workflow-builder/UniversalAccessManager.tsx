import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  ChevronDown, Settings, Users, Eye, Edit3, Trash2, 
  Plus, Shield, Lock, Unlock, UserCheck, UserX,
  Layers, Network, Database, Zap, FileText
} from 'lucide-react';

interface UniversalAccessManagerProps {
  onAccessChange?: (access: any) => void;
}

// Access control sections for React Flow workflow assets
const ACCESS_SECTIONS = {
  'Workflow Elements': [
    { id: 'nodes', name: 'Nodes', type: 'Element', access: 'Full', status: 'active', icon: Layers, color: 'bg-blue-100' },
    { id: 'edges', name: 'Edges', type: 'Element', access: 'Full', status: 'active', icon: Network, color: 'bg-green-100' },
    { id: 'canvas', name: 'Canvas', type: 'Element', access: 'Full', status: 'active', icon: FileText, color: 'bg-purple-100' },
    { id: 'minimap', name: 'MiniMap', type: 'Element', access: 'View', status: 'active', icon: Eye, color: 'bg-cyan-100' },
  ],
  'User Permissions': [
    { id: 'admin', name: 'Admin Access', type: 'Role', access: 'Full', status: 'active', icon: Shield, color: 'bg-red-100' },
    { id: 'editor', name: 'Editor Access', type: 'Role', access: 'Edit', status: 'active', icon: Edit3, color: 'bg-orange-100' },
    { id: 'viewer', name: 'Viewer Access', type: 'Role', access: 'View', status: 'active', icon: Eye, color: 'bg-blue-100' },
    { id: 'guest', name: 'Guest Access', type: 'Role', access: 'None', status: 'inactive', icon: UserX, color: 'bg-gray-100' },
  ],
  'Flow Operations': [
    { id: 'create', name: 'Create Flows', type: 'Operation', access: 'Admin', status: 'active', icon: Plus, color: 'bg-green-100' },
    { id: 'delete', name: 'Delete Flows', type: 'Operation', access: 'Admin', status: 'active', icon: Trash2, color: 'bg-red-100' },
    { id: 'export', name: 'Export Flows', type: 'Operation', access: 'Editor', status: 'active', icon: Database, color: 'bg-purple-100' },
    { id: 'execute', name: 'Execute Flows', type: 'Operation', access: 'Editor', status: 'active', icon: Zap, color: 'bg-yellow-100' },
  ],
  'Security Policies': [
    { id: 'node_validation', name: 'Node Validation', type: 'Policy', access: 'Enforced', status: 'active', icon: UserCheck, color: 'bg-green-100' },
    { id: 'data_privacy', name: 'Data Privacy', type: 'Policy', access: 'Enforced', status: 'active', icon: Lock, color: 'bg-blue-100' },
    { id: 'audit_trail', name: 'Audit Trail', type: 'Policy', access: 'Enabled', status: 'active', icon: FileText, color: 'bg-purple-100' },
    { id: 'session_timeout', name: 'Session Timeout', type: 'Policy', access: '30min', status: 'active', icon: Shield, color: 'bg-orange-100' },
  ]
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active': return <UserCheck className="h-3 w-3 text-green-600" />;
    case 'inactive': return <UserX className="h-3 w-3 text-red-600" />;
    case 'pending': return <Settings className="h-3 w-3 text-yellow-600" />;
    default: return <Shield className="h-3 w-3 text-gray-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 border-green-200';
    case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const UniversalAccessManager: React.FC<UniversalAccessManagerProps> = ({
  onAccessChange
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Workflow Elements': true,
    'User Permissions': true
  });
  const [searchTerm, setSearchTerm] = useState('');

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const filteredSections = Object.entries(ACCESS_SECTIONS).reduce((acc, [sectionName, items]) => {
    const filteredItems = items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.access.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filteredItems.length > 0) {
      acc[sectionName] = filteredItems;
    }
    return acc;
  }, {} as typeof ACCESS_SECTIONS);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Universal Access Control</h3>
        </div>
        <Badge variant="outline" className="text-xs">React Flow</Badge>
      </div>

      <Card className="border border-primary/20 bg-primary/5">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <Network className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-xs text-primary">
              <p className="font-medium mb-1">React Flow Access Management</p>
              <p className="text-muted-foreground">
                Control access to workflow elements, user permissions, and flow operations within the React Flow canvas environment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Input
          placeholder="Search access controls..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-8 text-xs"
        />
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {Object.entries(filteredSections).map(([sectionName, items]) => (
            <Collapsible 
              key={sectionName}
              open={expandedSections[sectionName]}
              onOpenChange={() => toggleSection(sectionName)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center justify-between w-full p-2 h-auto text-left hover:bg-accent/50 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-2">
                    <ChevronDown 
                      className={`h-3 w-3 transition-transform ${
                        expandedSections[sectionName] ? 'rotate-0' : '-rotate-90'
                      }`} 
                    />
                    <span className="font-medium text-xs">{sectionName}</span>
                    <Badge variant="secondary" className="text-xs h-4">
                      {items.length}
                    </Badge>
                  </div>
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-1 mt-2">
                {items.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 ml-3 rounded-lg border border-border hover:bg-accent/30 transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <div className={`w-6 h-6 rounded-md ${item.color} flex items-center justify-center`}>
                          <IconComponent className="h-3 w-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-xs truncate">{item.name}</span>
                            {getStatusIcon(item.status)}
                          </div>
                          <div className="text-xs text-muted-foreground">{item.type}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs h-5 ${getStatusColor(item.status)}`}
                        >
                          {item.access}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-accent"
                          onClick={() => onAccessChange?.(item)}
                        >
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>

      <Card>
        <CardContent className="p-3">
          <div className="text-xs text-muted-foreground space-y-2">
            <div className="flex items-center justify-between">
              <span>Active Flow Sessions:</span>
              <Badge variant="outline" className="text-xs">3</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Access Policies Applied:</span>
              <Badge variant="outline" className="text-xs">12</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Security Level:</span>
              <Badge className="text-xs bg-green-100 text-green-800">High</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};