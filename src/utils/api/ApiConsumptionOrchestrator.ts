
/**
 * API Consumption Orchestration
 */

import { ApiIntegration, ApiIntegrationRegistry, ApiConsumptionConfig, ApiConsumptionResult } from './ApiIntegrationTypes';

export interface ConsumptionMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  errorRate: number;
}

export class ApiConsumptionOrchestrator {
  private metrics: Map<string, ConsumptionMetrics> = new Map();
  private integrationRegistry: Map<string, ApiIntegrationRegistry> = new Map();

  registerIntegration(integration: ApiIntegrationRegistry) {
    this.integrationRegistry.set(integration.id, integration);
    this.initializeMetrics(integration.id);
  }

  private initializeMetrics(integrationId: string) {
    this.metrics.set(integrationId, {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      errorRate: 0
    });
  }

  recordRequest(integrationId: string, success: boolean, responseTime: number) {
    const metrics = this.metrics.get(integrationId);
    if (!metrics) return;

    metrics.totalRequests++;
    if (success) {
      metrics.successfulRequests++;
    } else {
      metrics.failedRequests++;
    }

    // Update average response time
    metrics.averageResponseTime = 
      (metrics.averageResponseTime * (metrics.totalRequests - 1) + responseTime) / metrics.totalRequests;

    // Update error rate
    metrics.errorRate = (metrics.failedRequests / metrics.totalRequests) * 100;

    this.metrics.set(integrationId, metrics);
  }

  getMetrics(integrationId: string): ConsumptionMetrics | undefined {
    return this.metrics.get(integrationId);
  }

  getAllMetrics(): Record<string, ConsumptionMetrics> {
    const result: Record<string, ConsumptionMetrics> = {};
    this.metrics.forEach((metrics, id) => {
      result[id] = metrics;
    });
    return result;
  }

  generateConsumptionReport(): any {
    const allMetrics = this.getAllMetrics();
    const totalIntegrations = Object.keys(allMetrics).length;
    
    let totalRequests = 0;
    let totalSuccessful = 0;
    let totalFailed = 0;
    let totalResponseTime = 0;

    Object.values(allMetrics).forEach(metrics => {
      totalRequests += metrics.totalRequests;
      totalSuccessful += metrics.successfulRequests;
      totalFailed += metrics.failedRequests;
      totalResponseTime += metrics.averageResponseTime;
    });

    return {
      summary: {
        totalIntegrations,
        totalRequests,
        overallSuccessRate: totalRequests > 0 ? (totalSuccessful / totalRequests) * 100 : 0,
        overallErrorRate: totalRequests > 0 ? (totalFailed / totalRequests) * 100 : 0,
        averageResponseTime: totalIntegrations > 0 ? totalResponseTime / totalIntegrations : 0
      },
      integrationMetrics: allMetrics,
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance for consistent usage
export const apiConsumptionOrchestrator = new ApiConsumptionOrchestrator();
