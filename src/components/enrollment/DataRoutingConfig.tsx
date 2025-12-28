/**
 * DATA ROUTING CONFIGURATION COMPONENT
 * 
 * Routing Logic:
 * 1. ALL data → Supabase (always, required, cannot disable)
 * 2. Patient/Insurance/Medication → Salesforce (default ON)
 * 3. Provider data → Veeva (optional, default OFF)
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, Database, FileJson, FileSpreadsheet, 
  ArrowRight, Check, Settings, User, Pill, 
  DollarSign, CreditCard, FileCheck, Send, Lock, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  RoutingRule, 
  DEFAULT_ROUTING_RULES,
  TargetSystemType 
} from '@/types/dataRoutingTypes';

interface DataRoutingConfigProps {
  onRoutingChange?: (rules: RoutingRule[]) => void;
  onExecute?: (enabledSystems: TargetSystemType[]) => void;
  className?: string;
}

const SYSTEM_ICONS: Record<TargetSystemType, React.ReactNode> = {
  salesforce: <Building2 className="h-5 w-5 text-blue-500" />,
  veeva: <Building2 className="h-5 w-5 text-purple-500" />,
  hubspot: <Building2 className="h-5 w-5 text-orange-500" />,
  supabase: <Database className="h-5 w-5 text-green-500" />,
  csv: <FileSpreadsheet className="h-5 w-5 text-emerald-500" />,
  json: <FileJson className="h-5 w-5 text-amber-500" />,
  api: <Send className="h-5 w-5 text-indigo-500" />,
  mcp: <Settings className="h-5 w-5 text-cyan-500" />
};

const SECTION_ICONS: Record<string, React.ReactNode> = {
  patient_information: <User className="h-4 w-4" />,
  prescriber_provider: <Building2 className="h-4 w-4" />,
  insurance_coverage: <CreditCard className="h-4 w-4" />,
  income_financial: <DollarSign className="h-4 w-4" />,
  medication_requested: <Pill className="h-4 w-4" />,
  consent_authorization: <FileCheck className="h-4 w-4" />
};

const RoutingRuleCard: React.FC<{
  rule: RoutingRule;
  onToggle: (active: boolean) => void;
  isLocked?: boolean;
}> = ({ rule, onToggle, isLocked }) => {
  const isSupabase = rule.targetSystem === 'supabase';
  
  return (
    <div className={cn(
      "p-4 border rounded-lg transition-all",
      rule.isActive ? "bg-card" : "bg-muted/30 opacity-60",
      isSupabase && "border-green-500/50 bg-green-50/30 dark:bg-green-950/20"
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {SYSTEM_ICONS[rule.targetSystem]}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{rule.name}</span>
              {isSupabase && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                  <Lock className="h-3 w-3 mr-1" />
                  Required
                </Badge>
              )}
              {rule.targetSystem === 'veeva' && !rule.isActive && (
                <Badge variant="outline" className="text-xs">Optional</Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">{rule.description}</div>
          </div>
        </div>
        {isLocked ? (
          <Badge variant="secondary" className="text-xs">
            <Check className="h-3 w-3 mr-1" />
            Always On
          </Badge>
        ) : (
          <Switch
            checked={rule.isActive}
            onCheckedChange={onToggle}
          />
        )}
      </div>

      {rule.isActive && (
        <>
          <Separator className="my-3" />
          
          {/* Source Sections */}
          <div className="mb-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              Source Sections
            </Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {rule.sourceSections.length > 0 ? (
                rule.sourceSections.map(section => (
                  <Badge key={section} variant="secondary" className="text-xs">
                    {SECTION_ICONS[section] || null}
                    <span className="ml-1">{section.replace(/_/g, ' ')}</span>
                  </Badge>
                ))
              ) : (
                <Badge variant="outline" className="text-xs">All Sections</Badge>
              )}
            </div>
          </div>

          {/* Target */}
          <div className="flex items-center gap-2 text-sm">
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="default">
              {rule.targetSystem.toUpperCase()}
            </Badge>
            {rule.targetObject && (
              <span className="text-muted-foreground">
                → {rule.targetObject}
              </span>
            )}
          </div>

          {/* Field Mappings Preview */}
          {rule.fieldMappings.length > 0 && (
            <div className="mt-3 p-2 bg-muted/50 rounded text-xs">
              <div className="font-medium mb-1">Field Mappings ({rule.fieldMappings.length})</div>
              <div className="grid grid-cols-2 gap-1 text-muted-foreground">
                {rule.fieldMappings.slice(0, 4).map((m, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className="truncate">{m.sourceFieldKey}</span>
                    <ArrowRight className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{m.targetFieldKey}</span>
                  </div>
                ))}
                {rule.fieldMappings.length > 4 && (
                  <div className="text-muted-foreground">
                    +{rule.fieldMappings.length - 4} more...
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export const DataRoutingConfig: React.FC<DataRoutingConfigProps> = ({
  onRoutingChange,
  onExecute,
  className
}) => {
  const [rules, setRules] = useState<RoutingRule[]>(DEFAULT_ROUTING_RULES);

  const handleToggleRule = (ruleId: string, active: boolean) => {
    // Supabase rule cannot be toggled off
    if (ruleId === 'all_to_supabase') return;
    
    const updated = rules.map(r => 
      r.id === ruleId ? { ...r, isActive: active } : r
    );
    setRules(updated);
    onRoutingChange?.(updated);
  };

  const enabledSystems = rules
    .filter(r => r.isActive)
    .map(r => r.targetSystem);

  const handleExecute = () => {
    onExecute?.(enabledSystems);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Data Routing Configuration
        </CardTitle>
        <CardDescription>
          Configure where extracted enrollment data is sent
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Routing Logic:</strong> All data is always saved to Supabase. 
            Patient data goes to Salesforce by default. 
            Enable Veeva to push provider data separately.
          </AlertDescription>
        </Alert>
        
        <ScrollArea className="h-[350px] pr-4">
          <div className="space-y-4">
            {rules.map(rule => (
              <RoutingRuleCard
                key={rule.id}
                rule={rule}
                onToggle={(active) => handleToggleRule(rule.id, active)}
                isLocked={rule.id === 'all_to_supabase'}
              />
            ))}
          </div>
        </ScrollArea>

        <Separator />

        {/* Summary */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">
              {enabledSystems.length} routing rules active
            </div>
            <div className="flex gap-1 mt-1">
              {[...new Set(enabledSystems)].map(sys => (
                <Badge key={sys} variant="outline" className="text-xs">
                  {sys}
                </Badge>
              ))}
            </div>
          </div>
          <Button onClick={handleExecute} disabled={enabledSystems.length === 0}>
            <Send className="h-4 w-4 mr-2" />
            Execute Routing
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
