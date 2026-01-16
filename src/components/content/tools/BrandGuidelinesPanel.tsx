/**
 * BrandGuidelinesPanel - P3-QW-05 UI Component
 * 
 * Brand compliance checking with Label Studio integration
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Palette, 
  Type, 
  Image,
  MessageCircle,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Wand2,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ThumbsUp
} from 'lucide-react';
import { useBrandGuidelinesCheck, BrandCheckCategory, BrandViolation, ComplianceLevel } from '@/hooks/useBrandGuidelinesCheck';

interface BrandGuidelinesPanelProps {
  contentUrl?: string;
  contentText?: string;
  contentType?: 'video' | 'image' | 'document' | 'text';
  onCheckComplete?: (score: number, level: ComplianceLevel) => void;
}

const BrandGuidelinesPanel: React.FC<BrandGuidelinesPanelProps> = ({
  contentUrl: initialUrl = '',
  contentText: initialText = '',
  contentType: initialType = 'text',
  onCheckComplete
}) => {
  const [contentUrl, setContentUrl] = useState(initialUrl);
  const [contentText, setContentText] = useState(initialText);
  const [contentType, setContentType] = useState<'video' | 'image' | 'document' | 'text'>(initialType);
  const [selectedCategories, setSelectedCategories] = useState<BrandCheckCategory[]>(['logo', 'colors', 'typography', 'tone']);
  const [expandedViolation, setExpandedViolation] = useState<string | null>(null);

  const {
    isChecking,
    report,
    violations,
    runBrandCheck,
    autoFixViolation,
    approveWithWarnings,
    getComplianceBadge
  } = useBrandGuidelinesCheck();

  const contentTypes: { id: typeof contentType; label: string; icon: string }[] = [
    { id: 'text', label: 'Text', icon: '📝' },
    { id: 'image', label: 'Image', icon: '🖼️' },
    { id: 'video', label: 'Video', icon: '🎬' },
    { id: 'document', label: 'Document', icon: '📄' },
  ];

  const categories: { id: BrandCheckCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'logo', label: 'Logo', icon: <Image className="h-4 w-4" /> },
    { id: 'colors', label: 'Colors', icon: <Palette className="h-4 w-4" /> },
    { id: 'typography', label: 'Typography', icon: <Type className="h-4 w-4" /> },
    { id: 'tone', label: 'Tone', icon: <MessageCircle className="h-4 w-4" /> },
    { id: 'imagery', label: 'Imagery', icon: <Image className="h-4 w-4" /> },
  ];

  const toggleCategory = (cat: BrandCheckCategory) => {
    setSelectedCategories(prev => 
      prev.includes(cat) 
        ? prev.filter(c => c !== cat)
        : [...prev, cat]
    );
  };

  const handleCheck = async () => {
    const checkReport = await runBrandCheck({
      contentUrl: contentUrl || undefined,
      contentText: contentText || undefined,
      contentType,
      categories: selectedCategories,
    });

    if (checkReport) {
      onCheckComplete?.(checkReport.overallScore, checkReport.complianceLevel);
    }
  };

  const getLevelIcon = (level: ComplianceLevel) => {
    switch (level) {
      case 'compliant': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'violation': return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getLevelColor = (level: ComplianceLevel) => {
    switch (level) {
      case 'compliant': return 'text-green-500 bg-green-500/10';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10';
      case 'violation': return 'text-destructive bg-destructive/10';
    }
  };

  const complianceBadge = getComplianceBadge();

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Check Configuration */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Brand Guidelines Checker
              <Badge variant="secondary" className="text-[10px]">P3-QW-05</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

            {/* Input based on content type */}
            {contentType === 'text' ? (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Text to Check</label>
                <Textarea 
                  value={contentText}
                  onChange={(e) => setContentText(e.target.value)}
                  placeholder="Enter text content to check brand compliance..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            ) : (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Content URL</label>
                <Input 
                  value={contentUrl}
                  onChange={(e) => setContentUrl(e.target.value)}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>
            )}

            {/* Categories to Check */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Check Categories</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <Button
                    key={cat.id}
                    variant={selectedCategories.includes(cat.id) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleCategory(cat.id)}
                    className="gap-1"
                  >
                    {cat.icon}
                    {cat.label}
                  </Button>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleCheck}
              disabled={isChecking || (!contentUrl && !contentText)}
              className="w-full"
            >
              {isChecking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking Brand Compliance...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Run Brand Check
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Compliance Summary */}
        {complianceBadge && report && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Brand Compliance</span>
                <Badge 
                  className={getLevelColor(complianceBadge.level)}
                >
                  {complianceBadge.label}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{complianceBadge.score}%</span>
                  {getLevelIcon(complianceBadge.level)}
                </div>
                <Progress value={complianceBadge.score} className="h-2" />
              </div>

              {/* Category Scores */}
              <div className="space-y-2">
                {Object.entries(report.categoryScores).map(([cat, score]) => (
                  <div key={cat} className="flex items-center gap-2">
                    <span className="text-xs capitalize w-20">{cat}</span>
                    <Progress value={score} className="h-1.5 flex-1" />
                    <span className="text-xs w-8 text-right">{score}%</span>
                    {getLevelIcon(report.summary[cat as BrandCheckCategory])}
                  </div>
                ))}
              </div>

              {report.complianceLevel === 'warning' && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => approveWithWarnings()}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Approve with Warnings
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Violations List */}
        {violations.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Violations Found
                </span>
                <Badge variant="outline">{violations.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {violations.map(violation => (
                <div 
                  key={violation.id}
                  className="border rounded-lg overflow-hidden"
                >
                  <div 
                    className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50"
                    onClick={() => setExpandedViolation(expandedViolation === violation.id ? null : violation.id)}
                  >
                    <div className="flex items-center gap-2">
                      {getLevelIcon(violation.level)}
                      <span className="text-sm font-medium">{violation.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[9px] capitalize">
                        {violation.category}
                      </Badge>
                      {expandedViolation === violation.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>

                  {expandedViolation === violation.id && (
                    <div className="p-3 border-t bg-muted/30 space-y-3">
                      <p className="text-sm text-muted-foreground">{violation.description}</p>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="p-2 rounded bg-destructive/10">
                          <div className="text-xs font-medium mb-1 text-destructive">Current:</div>
                          <code className="text-xs">{violation.currentValue}</code>
                        </div>
                        <div className="p-2 rounded bg-green-500/10">
                          <div className="text-xs font-medium mb-1 text-green-600">Expected:</div>
                          <code className="text-xs">{violation.expectedValue}</code>
                        </div>
                      </div>

                      <div className="p-2 rounded bg-primary/5 border">
                        <div className="text-xs font-medium mb-1">Suggestion:</div>
                        <p className="text-sm">{violation.suggestion}</p>
                      </div>

                      <div className="flex gap-2">
                        {violation.autoFixAvailable && (
                          <Button 
                            size="sm" 
                            onClick={() => autoFixViolation(violation.id)}
                            className="gap-1"
                          >
                            <Wand2 className="h-3 w-3" />
                            Auto-Fix
                          </Button>
                        )}
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

        {/* Recommendations */}
        {report && report.recommendations.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-primary">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
};

export default BrandGuidelinesPanel;
