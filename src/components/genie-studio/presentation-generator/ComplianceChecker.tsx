/**
 * Compliance Checker Component
 * HIPAA, GDPR, Copyright, WCAG compliance checking UI
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert,
  ShieldX,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  ChevronDown,
  Loader2,
  FileText,
  Lock,
  Eye,
  Copyright,
  Accessibility
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  genieVibeService, 
  type ComplianceType, 
  type ComplianceCheckResult 
} from '@/services/genieVibeService';

interface ComplianceCheckerProps {
  content: string;
  contentType: 'text' | 'audio' | 'video' | 'image' | 'document';
  onComplianceResult?: (result: ComplianceCheckResult) => void;
  industry?: 'healthcare' | 'finance' | 'education' | 'general';
  className?: string;
}

const complianceTypeInfo: Record<ComplianceType, { 
  name: string; 
  icon: React.ReactNode; 
  description: string;
  color: string;
}> = {
  hipaa: { 
    name: 'HIPAA', 
    icon: <Lock className="h-4 w-4" />, 
    description: 'Protected Health Information',
    color: 'text-red-500'
  },
  gdpr: { 
    name: 'GDPR', 
    icon: <Eye className="h-4 w-4" />, 
    description: 'Personal Data Protection',
    color: 'text-blue-500'
  },
  copyright: { 
    name: 'Copyright', 
    icon: <Copyright className="h-4 w-4" />, 
    description: 'Intellectual Property',
    color: 'text-purple-500'
  },
  wcag: { 
    name: 'WCAG 2.1 AA', 
    icon: <Accessibility className="h-4 w-4" />, 
    description: 'Accessibility Standards',
    color: 'text-green-500'
  },
  fda: { 
    name: 'FDA', 
    icon: <FileText className="h-4 w-4" />, 
    description: 'FDA Guidelines',
    color: 'text-orange-500'
  },
  'content-moderation': { 
    name: 'Content Safety', 
    icon: <Shield className="h-4 w-4" />, 
    description: 'Platform Guidelines',
    color: 'text-cyan-500'
  },
};

export function ComplianceChecker({
  content,
  contentType,
  onComplianceResult,
  industry = 'general',
  className,
}: ComplianceCheckerProps) {
  const [selectedTypes, setSelectedTypes] = useState<ComplianceType[]>(['hipaa', 'gdpr', 'copyright']);
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<ComplianceCheckResult | null>(null);
  const [autoCheck, setAutoCheck] = useState(true);
  const [expandedChecks, setExpandedChecks] = useState<string[]>([]);

  const toggleType = (type: ComplianceType) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const runComplianceCheck = async () => {
    if (!content || selectedTypes.length === 0) return;
    
    setIsChecking(true);
    try {
      const checkResult = await genieVibeService.checkCompliance({
        content,
        contentType,
        complianceTypes: selectedTypes,
        industry,
      });
      setResult(checkResult);
      onComplianceResult?.(checkResult);
    } catch (error) {
      console.error('Compliance check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const getSeverityIcon = (severity: 'info' | 'warning' | 'error' | 'critical') => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'error':
        return <ShieldX className="h-4 w-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  const toggleCheckExpanded = (type: string) => {
    setExpandedChecks(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Compliance Check
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={autoCheck}
              onCheckedChange={setAutoCheck}
              id="auto-check"
            />
            <Label htmlFor="auto-check" className="text-xs font-normal">
              Auto-check
            </Label>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Compliance Type Selection */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Check Types</Label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(complianceTypeInfo).map(([type, info]) => (
              <Badge
                key={type}
                variant={selectedTypes.includes(type as ComplianceType) ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer transition-colors text-xs',
                  selectedTypes.includes(type as ComplianceType) && 'bg-primary'
                )}
                onClick={() => toggleType(type as ComplianceType)}
              >
                <span className={cn("mr-1", info.color)}>{info.icon}</span>
                {info.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Check Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={runComplianceCheck}
          disabled={isChecking || !content || selectedTypes.length === 0}
        >
          {isChecking ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Checking Compliance...
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4 mr-2" />
              Run Compliance Check
            </>
          )}
        </Button>

        {/* Results */}
        {result && (
          <div className="space-y-3 pt-2 border-t">
            {/* Overall Score */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {result.passed ? (
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                ) : (
                  <ShieldAlert className="h-5 w-5 text-red-500" />
                )}
                <span className="text-sm font-medium">
                  {result.passed ? 'Passed' : 'Issues Found'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("text-lg font-bold", getScoreColor(result.overallScore))}>
                  {Math.round(result.overallScore)}%
                </span>
              </div>
            </div>

            <Progress value={result.overallScore} className="h-2" />

            {/* Individual Checks */}
            <ScrollArea className="max-h-[200px]">
              <div className="space-y-2">
                {result.checks.map((check, idx) => {
                  const typeInfo = complianceTypeInfo[check.type];
                  const isExpanded = expandedChecks.includes(check.type);
                  
                  return (
                    <Collapsible
                      key={idx}
                      open={isExpanded}
                      onOpenChange={() => toggleCheckExpanded(check.type)}
                    >
                      <CollapsibleTrigger className="w-full">
                        <div className={cn(
                          "flex items-center justify-between p-2 rounded-md border",
                          check.passed ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"
                        )}>
                          <div className="flex items-center gap-2">
                            <span className={typeInfo.color}>{typeInfo.icon}</span>
                            <span className="text-xs font-medium">{typeInfo.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {check.passed ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <Badge variant="destructive" className="text-[10px]">
                                {check.issues.length} issues
                              </Badge>
                            )}
                            <ChevronDown className={cn(
                              "h-4 w-4 transition-transform",
                              isExpanded && "rotate-180"
                            )} />
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        {check.issues.length > 0 ? (
                          <div className="mt-1 pl-6 space-y-1">
                            {check.issues.map((issue, issueIdx) => (
                              <div
                                key={issueIdx}
                                className="flex items-start gap-2 text-xs p-1.5 rounded bg-muted/50"
                              >
                                {getSeverityIcon(issue.severity)}
                                <div className="flex-1 min-w-0">
                                  <p className="text-foreground">{issue.message}</p>
                                  {issue.suggestedFix && (
                                    <p className="text-muted-foreground mt-0.5">
                                      💡 {issue.suggestedFix}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                            {check.autoRemediation?.available && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-6 mt-1"
                              >
                                ✨ Auto-fix available
                              </Button>
                            )}
                          </div>
                        ) : (
                          <p className="mt-1 pl-6 text-xs text-green-600">
                            No issues found
                          </p>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Disclaimer */}
            {result.disclaimer && (
              <div className="p-2 rounded-md bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                  ⚠️ {result.disclaimer}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
