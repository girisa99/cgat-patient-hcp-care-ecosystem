/**
 * Database Performance Analyzer Component
 * Provides UI for analyzing and optimizing database performance
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DatabasePerformanceOptimizer, type PerformanceIssue, type OptimizationResult } from '@/utils/database/DatabasePerformanceOptimizer';
import { AlertTriangle, Database, TrendingUp, CheckCircle, Clock, HardDrive } from 'lucide-react';
import { toast } from 'sonner';

export const DatabasePerformanceAnalyzer: React.FC = () => {
  const [analysis, setAnalysis] = useState<OptimizationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await DatabasePerformanceOptimizer.analyzePerformance();
      setAnalysis(result);
      toast.success(`Analysis complete: ${result.totalIssues} issues found`);
    } catch (error) {
      toast.error('Failed to analyze database performance');
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const result = await DatabasePerformanceOptimizer.executeOptimizations();
      if (result.success) {
        toast.success('Basic optimizations completed successfully');
        // Re-run analysis to show improvements
        await handleAnalyze();
      } else {
        toast.error('Some optimizations failed - check results');
      }
    } catch (error) {
      toast.error('Failed to execute optimizations');
    } finally {
      setIsOptimizing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bloat': return <HardDrive className="h-4 w-4" />;
      case 'high_updates': return <TrendingUp className="h-4 w-4" />;
      case 'missing_index': return <Database className="h-4 w-4" />;
      case 'redundant_data': return <AlertTriangle className="h-4 w-4" />;
      case 'normalization': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const generateSQL = () => {
    if (!analysis) return;
    
    const sql = DatabasePerformanceOptimizer.generateOptimizationSQL(analysis.issues);
    const sqlText = sql.join('\n');
    
    // Copy to clipboard
    navigator.clipboard.writeText(sqlText);
    toast.success('SQL optimization script copied to clipboard');
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Database Performance Analyzer
          </h1>
          <p className="text-muted-foreground mt-2">
            Analyze and optimize database performance, reduce redundancy, and improve query speed
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            variant="outline"
          >
            {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
          </Button>
          
          {analysis && (
            <>
              <Button
                onClick={handleOptimize}
                disabled={isOptimizing}
                variant="secondary"
              >
                {isOptimizing ? 'Optimizing...' : 'Run Basic Optimization'}
              </Button>
              
              <Button
                onClick={generateSQL}
                variant="outline"
              >
                Generate SQL
              </Button>
            </>
          )}
        </div>
      </div>

      {analysis && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysis.totalIssues}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{analysis.criticalIssues}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Potential Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold text-green-600">{analysis.potentialSavings}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={analysis.criticalIssues > 0 ? 'destructive' : 'secondary'}>
                  {analysis.criticalIssues > 0 ? 'Needs Attention' : 'Good'}
                </Badge>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="issues" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="issues">Performance Issues</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="issues" className="mt-6">
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {analysis.issues.map((issue, index) => (
                    <Card key={index} className="w-full">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(issue.type)}
                            <CardTitle className="text-lg">{issue.table}</CardTitle>
                            {issue.column && (
                              <code className="text-sm bg-muted px-2 py-1 rounded">
                                {issue.column}
                              </code>
                            )}
                          </div>
                          <Badge variant={getSeverityColor(issue.severity) as any}>
                            {issue.severity}
                          </Badge>
                        </div>
                        <CardDescription className="text-base">
                          {issue.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-3">
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Impact</AlertTitle>
                            <AlertDescription>{issue.impact}</AlertDescription>
                          </Alert>
                          
                          <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertTitle>Recommendation</AlertTitle>
                            <AlertDescription>{issue.recommendation}</AlertDescription>
                          </Alert>
                          
                          {issue.estimatedSavings && (
                            <div className="text-sm text-green-600 font-medium">
                              💡 Estimated savings: {issue.estimatedSavings}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="recommendations" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Optimization Recommendations</CardTitle>
                  <CardDescription>
                    Prioritized action items to improve database performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-2">
                      {analysis.recommendations.map((rec, index) => (
                        <div
                          key={index}
                          className={`p-2 rounded ${
                            rec.startsWith('🔥') ? 'bg-destructive/10 font-semibold' :
                            rec.startsWith('📊') ? 'bg-blue-50 font-medium' :
                            rec.startsWith('🎯') ? 'bg-purple-50' :
                            rec.startsWith('📈') ? 'bg-green-50' :
                            rec.startsWith('-') ? 'ml-4 text-sm' : ''
                          }`}
                        >
                          {rec || '\u00A0'}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {!analysis && (
        <Card>
          <CardContent className="py-12 text-center">
            <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Ready to Analyze</h3>
            <p className="text-muted-foreground mb-4">
              Click "Run Analysis" to identify performance issues and optimization opportunities
            </p>
            <Button onClick={handleAnalyze} disabled={isAnalyzing}>
              {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};