/**
 * AccessibilityPanel - P3-QW-04 UI Component
 * 
 * WCAG compliance checking with Label Studio integration
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Accessibility, 
  Eye, 
  Volume2, 
  Type, 
  Palette,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Wand2,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAccessibilityCheck, WCAGLevel, AccessibilityIssue } from '@/hooks/useAccessibilityCheck';

interface AccessibilityPanelProps {
  contentUrl?: string;
  contentType?: 'video' | 'image' | 'document' | 'webpage';
  onCheckComplete?: (score: number, issues: number) => void;
}

const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({
  contentUrl: initialUrl = '',
  contentType: initialType = 'video',
  onCheckComplete
}) => {
  const [contentUrl, setContentUrl] = useState(initialUrl);
  const [contentType, setContentType] = useState<'video' | 'image' | 'document' | 'webpage'>(initialType);
  const [targetLevel, setTargetLevel] = useState<WCAGLevel>('AA');
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

  const {
    isChecking,
    report,
    issues,
    runAccessibilityCheck,
    autoFixIssue,
    ignoreIssue,
    getScoreSummary
  } = useAccessibilityCheck();

  const contentTypes: { id: typeof contentType; label: string; icon: React.ReactNode }[] = [
    { id: 'video', label: 'Video', icon: '🎬' },
    { id: 'image', label: 'Image', icon: '🖼️' },
    { id: 'document', label: 'Document', icon: '📄' },
    { id: 'webpage', label: 'Webpage', icon: '🌐' },
  ];

  const wcagLevels: { id: WCAGLevel; label: string; desc: string }[] = [
    { id: 'A', label: 'Level A', desc: 'Basic' },
    { id: 'AA', label: 'Level AA', desc: 'Recommended' },
    { id: 'AAA', label: 'Level AAA', desc: 'Advanced' },
  ];

  const handleCheck = async () => {
    const checkReport = await runAccessibilityCheck({
      contentUrl: contentUrl || undefined,
      contentType,
      targetLevel,
      checkCaptions: true,
      checkAudioDescription: true,
      checkColorContrast: true,
      checkCognitiveLoad: true,
    });

    if (checkReport) {
      onCheckComplete?.(checkReport.overallScore, checkReport.summary.total);
    }
  };

  const getSeverityIcon = (severity: AccessibilityIssue['severity']) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'serious': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'moderate': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getCategoryIcon = (category: AccessibilityIssue['category']) => {
    switch (category) {
      case 'visual': return <Eye className="h-4 w-4" />;
      case 'audio': return <Volume2 className="h-4 w-4" />;
      case 'cognitive': return <Type className="h-4 w-4" />;
      default: return <Palette className="h-4 w-4" />;
    }
  };

  const scoreSummary = getScoreSummary();

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Check Configuration */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Accessibility className="h-4 w-4" />
              Accessibility Checker
              <Badge variant="secondary" className="text-[10px]">P3-QW-04</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Content URL (optional)</label>
              <Input 
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1"
              />
            </div>

            {/* Content Type */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Content Type</label>
              <div className="flex flex-wrap gap-2">
                {contentTypes.map(type => (
                  <Button
                    key={type.id}
                    variant={contentType === type.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setContentType(type.id)}
                    className="gap-1"
                  >
                    <span>{type.icon}</span>
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* WCAG Level */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">WCAG Target Level</label>
              <div className="flex gap-2">
                {wcagLevels.map(level => (
                  <Button
                    key={level.id}
                    variant={targetLevel === level.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTargetLevel(level.id)}
                    className="flex-1 flex-col h-auto py-2"
                  >
                    <span className="font-bold">{level.label}</span>
                    <span className="text-[10px] opacity-70">{level.desc}</span>
                  </Button>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleCheck}
              disabled={isChecking}
              className="w-full"
            >
              {isChecking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking Accessibility...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Run Accessibility Check
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Score Summary */}
        {scoreSummary && report && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Accessibility Score</span>
                <Badge 
                  variant={scoreSummary.status === 'pass' ? 'default' : 
                          scoreSummary.status === 'warning' ? 'secondary' : 'destructive'}
                >
                  Grade {scoreSummary.grade}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{scoreSummary.score}%</span>
                  <span className="text-sm text-muted-foreground">WCAG {targetLevel}</span>
                </div>
                <Progress value={scoreSummary.score} className="h-2" />
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <div className="text-lg font-bold text-destructive">{report.summary.critical}</div>
                  <div className="text-[10px] text-muted-foreground">Critical</div>
                </div>
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <div className="text-lg font-bold text-orange-500">{report.summary.serious}</div>
                  <div className="text-[10px] text-muted-foreground">Serious</div>
                </div>
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <div className="text-lg font-bold text-yellow-500">{report.summary.moderate}</div>
                  <div className="text-[10px] text-muted-foreground">Moderate</div>
                </div>
                <div className="p-2 rounded-lg bg-muted">
                  <div className="text-lg font-bold">{report.summary.minor}</div>
                  <div className="text-[10px] text-muted-foreground">Minor</div>
                </div>
              </div>

              <div className="flex gap-2 text-xs">
                <Badge variant={report.hasCaptions ? 'default' : 'outline'}>
                  {report.hasCaptions ? '✓' : '✗'} Captions
                </Badge>
                <Badge variant={report.hasAudioDescription ? 'default' : 'outline'}>
                  {report.hasAudioDescription ? '✓' : '✗'} Audio Desc
                </Badge>
                <Badge variant={report.hasTranscript ? 'default' : 'outline'}>
                  {report.hasTranscript ? '✓' : '✗'} Transcript
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Issues List */}
        {issues.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Issues Found
                </span>
                <Badge variant="outline">{issues.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {issues.map(issue => (
                <div 
                  key={issue.id}
                  className="border rounded-lg overflow-hidden"
                >
                  <div 
                    className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50"
                    onClick={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
                  >
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(issue.severity)}
                      <span className="text-sm font-medium">{issue.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(issue.category)}
                      <Badge variant="outline" className="text-[9px]">
                        {issue.wcagCriteria}
                      </Badge>
                      {expandedIssue === issue.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>

                  {expandedIssue === issue.id && (
                    <div className="p-3 border-t bg-muted/30 space-y-3">
                      <p className="text-sm text-muted-foreground">{issue.description}</p>
                      
                      <div className="p-2 rounded bg-primary/5 border">
                        <div className="text-xs font-medium mb-1">Suggestion:</div>
                        <p className="text-sm">{issue.suggestion}</p>
                      </div>

                      <div className="flex gap-2">
                        {issue.autoFixAvailable && (
                          <Button 
                            size="sm" 
                            onClick={() => autoFixIssue(issue.id)}
                            className="gap-1"
                          >
                            <Wand2 className="h-3 w-3" />
                            Auto-Fix
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => ignoreIssue(issue.id)}
                        >
                          Ignore
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {report && (
                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={handleCheck}
                  disabled={isChecking}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Re-check
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
};

export default AccessibilityPanel;
