
import { TestResult } from './testingService';

export interface TestSuiteReport {
  suiteType: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  avgDuration: number;
  avgCoverage: number;
  executionTime: string;
  failedTestDetails: TestResult[];
  passedTestDetails: TestResult[];
}

export interface ComprehensiveTestReport {
  overallSummary: {
    totalExecutions: number;
    overallPassRate: number;
    totalDuration: number;
    executionTimestamp: string;
    systemHealth: 'healthy' | 'warning' | 'critical';
  };
  suiteReports: TestSuiteReport[];
  failedFunctionalities: {
    functionality: string;
    testType: string;
    errorMessage: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
    recommendedAction: string;
  }[];
  recommendations: string[];
}

class TestResultsAnalyzer {
  analyzeTestResults(results: TestResult[]): ComprehensiveTestReport {
    const suiteReports = this.generateSuiteReports(results);
    const failedFunctionalities = this.identifyFailedFunctionalities(results);
    const overallSummary = this.calculateOverallSummary(results);
    const recommendations = this.generateRecommendations(results);

    return {
      overallSummary,
      suiteReports,
      failedFunctionalities,
      recommendations
    };
  }

  private generateSuiteReports(results: TestResult[]): TestSuiteReport[] {
    const suiteTypes = ['unit', 'integration', 'system', 'regression', 'e2e'];
    
    return suiteTypes.map(suiteType => {
      const suiteResults = results.filter(r => r.testType === suiteType);
      const passedTests = suiteResults.filter(r => r.status === 'passed');
      const failedTests = suiteResults.filter(r => r.status === 'failed');
      const skippedTests = suiteResults.filter(r => r.status === 'skipped');

      return {
        suiteType,
        totalTests: suiteResults.length,
        passedTests: passedTests.length,
        failedTests: failedTests.length,
        skippedTests: skippedTests.length,
        avgDuration: suiteResults.length > 0 
          ? suiteResults.reduce((sum, r) => sum + r.duration, 0) / suiteResults.length 
          : 0,
        avgCoverage: suiteResults.length > 0
          ? suiteResults.reduce((sum, r) => sum + (r.coverage || 0), 0) / suiteResults.length
          : 0,
        executionTime: suiteResults.length > 0 ? suiteResults[0].executedAt : new Date().toISOString(),
        failedTestDetails: failedTests,
        passedTestDetails: passedTests
      };
    });
  }

  private identifyFailedFunctionalities(results: TestResult[]): ComprehensiveTestReport['failedFunctionalities'] {
    const failedTests = results.filter(r => r.status === 'failed');
    
    return failedTests.map(test => ({
      functionality: this.extractFunctionality(test.testName),
      testType: test.testType,
      errorMessage: test.errorMessage || 'Test failed without specific error message',
      impact: this.assessImpact(test.testType, test.testName),
      recommendedAction: this.getRecommendedAction(test.testType, test.errorMessage)
    }));
  }

  private calculateOverallSummary(results: TestResult[]): ComprehensiveTestReport['overallSummary'] {
    const totalExecutions = results.length;
    const passedTests = results.filter(r => r.status === 'passed').length;
    const overallPassRate = totalExecutions > 0 ? (passedTests / totalExecutions) * 100 : 0;
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
    
    const systemHealth: 'healthy' | 'warning' | 'critical' = 
      overallPassRate >= 90 ? 'healthy' :
      overallPassRate >= 70 ? 'warning' : 'critical';

    return {
      totalExecutions,
      overallPassRate,
      totalDuration,
      executionTimestamp: new Date().toISOString(),
      systemHealth
    };
  }

  private generateRecommendations(results: TestResult[]): string[] {
    const recommendations: string[] = [];
    const failedTests = results.filter(r => r.status === 'failed');
    
    if (failedTests.length > 0) {
      recommendations.push(`${failedTests.length} tests failed - Review error messages and fix underlying issues`);
    }

    const lowCoverageTests = results.filter(r => (r.coverage || 0) < 70);
    if (lowCoverageTests.length > 0) {
      recommendations.push(`${lowCoverageTests.length} tests have low coverage - Consider adding more test scenarios`);
    }

    const slowTests = results.filter(r => r.duration > 5000);
    if (slowTests.length > 0) {
      recommendations.push(`${slowTests.length} tests are running slowly - Optimize performance`);
    }

    return recommendations;
  }

  private extractFunctionality(testName: string): string {
    // Extract API or functionality name from test name
    const parts = testName.split(' - ');
    return parts[0] || testName;
  }

  private assessImpact(testType: string, testName: string): 'low' | 'medium' | 'high' | 'critical' {
    if (testType === 'e2e' || testName.includes('Authentication') || testName.includes('Database')) {
      return 'critical';
    }
    if (testType === 'integration' || testType === 'system') {
      return 'high';
    }
    if (testType === 'regression') {
      return 'medium';
    }
    return 'low';
  }

  private getRecommendedAction(testType: string, errorMessage?: string): string {
    if (!errorMessage) return 'Investigate test failure and review implementation';
    
    if (errorMessage.includes('timeout') || errorMessage.includes('performance')) {
      return 'Check system performance and optimize slow operations';
    }
    if (errorMessage.includes('authentication') || errorMessage.includes('permission')) {
      return 'Review authentication and authorization configurations';
    }
    if (errorMessage.includes('database') || errorMessage.includes('connection')) {
      return 'Check database connectivity and data integrity';
    }
    
    return 'Review error message and fix underlying code issue';
  }

  getDetailedTestReport(results: TestResult[]): string {
    const report = this.analyzeTestResults(results);
    
    let output = `
# Test Execution Report
Generated at: ${new Date(report.overallSummary.executionTimestamp).toLocaleString()}

## Overall Summary
- Total Tests Executed: ${report.overallSummary.totalExecutions}
- Overall Pass Rate: ${report.overallSummary.overallPassRate.toFixed(1)}%
- Total Execution Time: ${(report.overallSummary.totalDuration / 1000).toFixed(2)}s
- System Health: ${report.overallSummary.systemHealth.toUpperCase()}

## Suite Breakdown
`;

    report.suiteReports.forEach(suite => {
      output += `
### ${suite.suiteType.toUpperCase()} Tests
- Total: ${suite.totalTests} | Passed: ${suite.passedTests} | Failed: ${suite.failedTests} | Skipped: ${suite.skippedTests}
- Pass Rate: ${suite.totalTests > 0 ? ((suite.passedTests / suite.totalTests) * 100).toFixed(1) : 0}%
- Avg Duration: ${suite.avgDuration.toFixed(0)}ms | Avg Coverage: ${suite.avgCoverage.toFixed(1)}%
`;
    });

    if (report.failedFunctionalities.length > 0) {
      output += `
## Failed Functionalities (Requires Manual Testing)
`;
      report.failedFunctionalities.forEach(failure => {
        output += `
- **${failure.functionality}** (${failure.testType})
  - Impact: ${failure.impact.toUpperCase()}
  - Error: ${failure.errorMessage}
  - Action: ${failure.recommendedAction}
`;
      });
    }

    if (report.recommendations.length > 0) {
      output += `
## Recommendations
`;
      report.recommendations.forEach(rec => {
        output += `- ${rec}\n`;
      });
    }

    return output;
  }
}

export const testResultsAnalyzer = new TestResultsAnalyzer();
