/**
 * Agent Ecosystem Components - Complete Agent Management System
 * 
 * This module provides comprehensive agent lifecycle management including:
 * - Agent-Node Deployment Bridge
 * - Performance Monitoring & Health Checks
 * - Multi-Agent Orchestration & Communication
 * - Security & Permissions Management
 * - Template Marketplace & Versioning
 * - A2A Protocol Support
 * - Agentic AI Capabilities (ReAct, Planning, Tool Chaining)
 */

// Main Dashboard
export { AgentEcosystemDashboard } from './AgentEcosystemDashboard';

// Orchestration Engine
export { AgentOrchestrationEngine } from './AgentOrchestrationEngine';

// Core Agent Hooks
export { useAgentLifecycle } from '@/hooks/useAgentLifecycle';
export { useAgentDeploymentBridge } from '@/hooks/useAgentDeploymentBridge';
export { useAgentPerformanceMonitoring } from '@/hooks/useAgentPerformanceMonitoring';

// A2A Protocol & Multi-Agent
export { useA2AProtocol } from '@/hooks/useA2AProtocol';
export { useMultiAgentOrchestration } from '@/hooks/useMultiAgentOrchestration';
export { useAgenticAI } from '@/hooks/useAgenticAI';
export { useMultiAgentCanvasIntegration } from '@/hooks/useMultiAgentCanvasIntegration';

// Multi-Agent Node Types
export { 
  multiAgentNodeTypes, 
  multiAgentNodeDefinitions,
  A2AAgentNode,
  AgentTeamNode,
  ReActNode,
  SwarmDecisionNode,
  ToolChainNode,
  TaskHandoffNode,
  CommunicationHubNode
} from '@/components/workflow-builder/MultiAgentNodeTypes';

// Multi-Agent Deployment
export { MultiAgentDeploymentPanel } from '@/components/workflow-builder/MultiAgentDeploymentPanel';

// Type Exports
export type { AgentLifecycleState, AgentLifecycleStatus } from '@/hooks/useAgentLifecycle';
export type { AgentNodeDeployment } from '@/hooks/useAgentDeploymentBridge';
export type { AgentPerformanceMetric, AgentHealthCheck, PerformanceSummary } from '@/hooks/useAgentPerformanceMonitoring';
export type { AgentCard, A2ATask, TaskStatus } from '@/hooks/useA2AProtocol';
export type { AgentTeam, TeamMember, SwarmDecision, TaskAssignment } from '@/hooks/useMultiAgentOrchestration';
export type { ReActState, Plan, Tool, SelfReflection, ToolChain } from '@/hooks/useAgenticAI';
export type { MultiAgentDeploymentConfig, CanvasAgentNode } from '@/hooks/useMultiAgentCanvasIntegration';