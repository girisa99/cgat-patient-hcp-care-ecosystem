/**
 * Agent Ecosystem Components - Complete Agent Management System
 * 
 * This module provides comprehensive agent lifecycle management including:
 * - Agent-Node Deployment Bridge
 * - Performance Monitoring & Health Checks
 * - Multi-Agent Orchestration & Communication
 * - Security & Permissions Management
 * - Template Marketplace & Versioning
 */

// Main Dashboard
export { AgentEcosystemDashboard } from './AgentEcosystemDashboard';

// Orchestration Engine
export { AgentOrchestrationEngine } from './AgentOrchestrationEngine';

// Hooks
export { useAgentLifecycle } from '@/hooks/useAgentLifecycle';
export { useAgentDeploymentBridge } from '@/hooks/useAgentDeploymentBridge';
export { useAgentPerformanceMonitoring } from '@/hooks/useAgentPerformanceMonitoring';

// Type Exports
export type { AgentLifecycleState } from '@/hooks/useAgentLifecycle';
export type { AgentNodeDeployment } from '@/hooks/useAgentDeploymentBridge';
export type { AgentPerformanceMetric, AgentHealthCheck } from '@/hooks/useAgentPerformanceMonitoring';