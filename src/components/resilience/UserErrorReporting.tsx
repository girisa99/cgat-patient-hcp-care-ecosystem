/**
 * User Error Reporting Flow - P4-REC-11
 * One-click bug report with automatic context capture
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Bug, 
  AlertTriangle, 
  Send, 
  Loader2, 
  CheckCircle2,
  Monitor,
  Smartphone,
  Globe,
  Clock,
  User,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { errorManager } from '@/utils/error/ErrorManager';
import { supabase } from '@/integrations/supabase/client';

interface ErrorContext {
  url: string;
  userAgent: string;
  timestamp: string;
  screenSize: string;
  recentErrors: string[];
  sessionDuration: string;
  userId?: string;
}

interface BugReport {
  type: 'bug' | 'crash' | 'performance' | 'ui' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  stepsToReproduce: string;
  expectedBehavior: string;
  context: ErrorContext;
  includeScreenshot: boolean;
  includeConsole: boolean;
}

export const UserErrorReporting: React.FC<{ 
  trigger?: React.ReactNode;
  onSubmit?: (report: BugReport) => void;
}> = ({ trigger, onSubmit }) => {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [reportType, setReportType] = useState<BugReport['type']>('bug');
  const [severity, setSeverity] = useState<BugReport['severity']>('medium');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');
  const [expected, setExpected] = useState('');
  const [includeScreenshot, setIncludeScreenshot] = useState(true);
  const [includeConsole, setIncludeConsole] = useState(true);

  // Capture context automatically
  const captureContext = (): ErrorContext => {
    const errorStats = errorManager.getErrorStats();
    const sessionStart = sessionStorage.getItem('session_start') || new Date().toISOString();
    const sessionDuration = Math.round((Date.now() - new Date(sessionStart).getTime()) / 1000 / 60);

    return {
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      recentErrors: errorStats.recentErrors.slice(0, 5).map(e => e.message),
      sessionDuration: `${sessionDuration} minutes`,
      userId: undefined // Will be populated if user is logged in
    };
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error('Please describe the issue');
      return;
    }

    setSubmitting(true);

    try {
      const context = captureContext();
      
      // Get user if logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        context.userId = user.id;
      }

      const report: BugReport = {
        type: reportType,
        severity,
        description,
        stepsToReproduce: steps,
        expectedBehavior: expected,
        context,
        includeScreenshot,
        includeConsole
      };

      // Log to error manager
      errorManager.reportError(`User Report: ${description}`, {
        component: 'UserErrorReporting',
        severity: severity === 'critical' ? 'critical' : severity === 'high' ? 'high' : 'medium',
        additionalContext: report
      });

      // Call onSubmit if provided
      if (onSubmit) {
        onSubmit(report);
      }

      // Simulate sending to backend
      console.log('📝 Bug report submitted:', report);
      
      setSubmitted(true);
      toast.success('Bug report submitted successfully!');
      
      // Reset after 2 seconds
      setTimeout(() => {
        setSubmitted(false);
        setOpen(false);
        setDescription('');
        setSteps('');
        setExpected('');
        setReportType('bug');
        setSeverity('medium');
      }, 2000);

    } catch (error) {
      console.error('Failed to submit bug report:', error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const context = captureContext();

  const typeOptions = [
    { value: 'bug', label: 'Bug', icon: Bug },
    { value: 'crash', label: 'Crash', icon: AlertTriangle },
    { value: 'performance', label: 'Slow', icon: Clock },
    { value: 'ui', label: 'UI Issue', icon: Monitor },
    { value: 'other', label: 'Other', icon: FileText }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Bug className="h-4 w-4" />
            Report Issue
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Report an Issue
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="py-12 text-center">
            <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold">Thank You!</h3>
            <p className="text-muted-foreground">Your report has been submitted.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Issue Type */}
            <div className="space-y-2">
              <Label>Issue Type</Label>
              <div className="flex gap-2">
                {typeOptions.map(option => (
                  <Button
                    key={option.value}
                    variant={reportType === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setReportType(option.value as BugReport['type'])}
                    className="flex-1"
                  >
                    <option.icon className="h-4 w-4 mr-1" />
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Severity */}
            <div className="space-y-2">
              <Label>Severity</Label>
              <RadioGroup value={severity} onValueChange={(v) => setSeverity(v as BugReport['severity'])} className="flex gap-4">
                {['low', 'medium', 'high', 'critical'].map(s => (
                  <div key={s} className="flex items-center space-x-2">
                    <RadioGroupItem value={s} id={s} />
                    <Label htmlFor={s} className="capitalize cursor-pointer">{s}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">What happened? *</Label>
              <Textarea
                id="description"
                placeholder="Describe the issue you encountered..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Steps to Reproduce */}
            <div className="space-y-2">
              <Label htmlFor="steps">Steps to reproduce (optional)</Label>
              <Textarea
                id="steps"
                placeholder="1. Go to...&#10;2. Click on...&#10;3. See error"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                rows={3}
              />
            </div>

            {/* Expected Behavior */}
            <div className="space-y-2">
              <Label htmlFor="expected">Expected behavior (optional)</Label>
              <Textarea
                id="expected"
                placeholder="What did you expect to happen?"
                value={expected}
                onChange={(e) => setExpected(e.target.value)}
                rows={2}
              />
            </div>

            {/* Auto-captured Context */}
            <Card className="bg-muted/50">
              <CardContent className="pt-4 space-y-2">
                <Label className="text-xs text-muted-foreground">Auto-captured context</Label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Globe className="h-3 w-3" />
                    <span className="truncate">{context.url.split('/').pop() || 'Home'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Monitor className="h-3 w-3" />
                    <span>{context.screenSize}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>{context.sessionDuration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3" />
                    <span>{context.recentErrors.length} recent errors</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Include Options */}
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="screenshot" 
                  checked={includeScreenshot}
                  onCheckedChange={(v) => setIncludeScreenshot(!!v)}
                />
                <Label htmlFor="screenshot" className="text-sm cursor-pointer">Include screenshot</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="console" 
                  checked={includeConsole}
                  onCheckedChange={(v) => setIncludeConsole(!!v)}
                />
                <Label htmlFor="console" className="text-sm cursor-pointer">Include console logs</Label>
              </div>
            </div>

            {/* Submit */}
            <Button 
              className="w-full" 
              onClick={handleSubmit} 
              disabled={submitting || !description.trim()}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserErrorReporting;
