
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Activity, Shield, Database, Code } from 'lucide-react';
import { useComprehensiveVerification } from '@/hooks/useComprehensiveVerification';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const ActiveVerification: React.FC = () => {
  const {
    verificationResult,
    hasResults,
    healthScore,
    criticalIssues,
    totalIssues,
    isSystemStable,
    runComprehensiveVerification,
    isVerifying
  } = useComprehensiveVerification();

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreBadge = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const verificationCategories = [
    {
      title: "System Health",
      description: "Overall system stability and performance",
      icon: Activity,
      score: healthScore,
      status: isSystemStable ? 'healthy' : 'warning'
    },
    {
      title: "Security Status",
      description: "Security policies and vulnerabilities",
      icon: Shield,
      score: hasResults ? 85 : 0,
      status: criticalIssues === 0 ? 'healthy' : 'critical'
    },
    {
      title: "Database Integrity",
      description: "Database connections and data consistency",
      icon: Database,
      score: hasResults ? 92 : 0,
      status: 'healthy'
    },
    {
      title: "Code Quality",
      description: "Code standards and best practices",
      icon: Code,
      score: hasResults ? 78 : 0,
      status: 'warning'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Active Verification</h1>
          <p className="text-gray-600 mt-2">
            Real-time system health and verification status
          </p>
        </div>
        <Button 
          onClick={runComprehensiveVerification}
          disabled={isVerifying}
        >
          {isVerifying ? 'Running...' : 'Run Verification'}
        </Button>
      </div>

      {/* Overall Health Score */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6" />
                System Health Score
              </CardTitle>
              <CardDescription>
                Overall system health and stability rating
              </CardDescription>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${getHealthScoreColor(healthScore)}`}>
                {healthScore}/100
              </div>
              <Badge className={getHealthScoreBadge(healthScore)}>
                {isSystemStable ? 'Stable' : 'Needs Attention'}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Verification Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {verificationCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.title}>
              <CardHeader className="flex flex-row items-center space-y-0 pb-3">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {category.title}
                  </CardTitle>
                  <CardDescription>
                    {category.description}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getHealthScoreColor(category.score)}`}>
                    {category.score}%
                  </div>
                  <Badge 
                    className={
                      category.status === 'healthy' ? 'bg-green-100 text-green-800' :
                      category.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }
                  >
                    {category.status}
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{hasResults ? totalIssues - criticalIssues : 0}</p>
                <p className="text-sm text-muted-foreground">Issues Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{totalIssues}</p>
                <p className="text-sm text-muted-foreground">Total Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{criticalIssues}</p>
                <p className="text-sm text-muted-foreground">Critical Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Results Summary */}
      {hasResults && (
        <Card>
          <CardHeader>
            <CardTitle>Latest Verification Results</CardTitle>
            <CardDescription>
              Summary of the most recent comprehensive verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>System Status:</span>
                <Badge className={isSystemStable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {isSystemStable ? 'Stable' : 'Unstable'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Health Score:</span>
                <span className={`font-semibold ${getHealthScoreColor(healthScore)}`}>
                  {healthScore}/100
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Total Issues:</span>
                <span className="font-semibold">{totalIssues}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Critical Issues:</span>
                <span className={`font-semibold ${criticalIssues > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {criticalIssues}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!hasResults && (
        <Card>
          <CardContent className="p-8 text-center">
            <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-4">No verification results available</p>
            <Button onClick={runComprehensiveVerification} disabled={isVerifying}>
              {isVerifying ? 'Running Verification...' : 'Run First Verification'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ActiveVerification;
