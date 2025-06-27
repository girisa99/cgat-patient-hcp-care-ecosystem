
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Zap, CheckCircle, AlertTriangle } from 'lucide-react';

interface QuickFix {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'quick' | 'moderate' | 'extensive';
  codeExample: string;
  implementation: string;
}

const AccessibilityQuickFixes = () => {
  const quickFixes: QuickFix[] = [
    {
      id: 'alt-text',
      title: 'Add Alt Text to Images',
      description: 'Add meaningful alternative text to all images',
      impact: 'high',
      effort: 'quick',
      codeExample: `// Before:
<img src="/avatar.jpg" />

// After:
<img src="/avatar.jpg" alt="User profile avatar" />`,
      implementation: 'Search for all <img> tags and add descriptive alt attributes'
    },
    {
      id: 'focus-styles',
      title: 'Add Focus Indicators',
      description: 'Make focus states visible for keyboard navigation',
      impact: 'high',
      effort: 'quick',
      codeExample: `// Add to your CSS or Tailwind classes:
.focus-visible:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

// Or use Tailwind:
className="focus:ring-2 focus:ring-blue-500 focus:outline-none"`,
      implementation: 'Add focus styles to all interactive elements (buttons, links, inputs)'
    },
    {
      id: 'aria-labels',
      title: 'Add ARIA Labels',
      description: 'Provide accessible names for interactive elements',
      impact: 'high',
      effort: 'quick',
      codeExample: `// Before:
<button><SearchIcon /></button>

// After:
<button aria-label="Search users">
  <SearchIcon />
</button>`,
      implementation: 'Add aria-label to buttons with only icons or unclear text'
    },
    {
      id: 'heading-structure',
      title: 'Fix Heading Hierarchy',
      description: 'Ensure proper heading structure (h1 → h2 → h3)',
      impact: 'medium',
      effort: 'moderate',
      codeExample: `// Before:
<h1>Dashboard</h1>
<h3>Users</h3>  // Skip h2

// After:
<h1>Dashboard</h1>
<h2>Users</h2>`,
      implementation: 'Review and fix heading hierarchy across all pages'
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'quick': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'extensive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Quick Wins:</strong> Start with these high-impact, low-effort accessibility improvements 
          to immediately boost your compliance score.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {quickFixes.map((fix) => (
          <Card key={fix.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  {fix.title}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant={getImpactColor(fix.impact) as any}>
                    {fix.impact} impact
                  </Badge>
                  <Badge variant="outline" className={getEffortColor(fix.effort)}>
                    {fix.effort}
                  </Badge>
                </div>
              </div>
              <CardDescription>{fix.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Implementation:</h4>
                <p className="text-sm text-muted-foreground">{fix.implementation}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm mb-2">Code Example:</h4>
                <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                  <code>{fix.codeExample}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <CheckCircle className="h-5 w-5" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Start with the "quick" effort fixes to get immediate improvements</li>
            <li>Test keyboard navigation on all interactive elements</li>
            <li>Run an accessibility checker (like axe-core) to validate changes</li>
            <li>Consider adding skip links for main content navigation</li>
            <li>Implement a high-contrast theme option for better visibility</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessibilityQuickFixes;
