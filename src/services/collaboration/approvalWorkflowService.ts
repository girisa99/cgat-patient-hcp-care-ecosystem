/**
 * Approval Workflow Service
 * P4-COLLAB-06: Approval workflows for content review
 * 
 * Manages multi-stage approval processes for:
 * - Content generation review
 * - Publishing approval
 * - Asset modifications
 * - Deployment gates
 */

import { supabase } from '@/integrations/supabase/client';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested' | 'expired';
export type ApprovalPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface ApprovalRequest {
  id: string;
  workspaceId: string;
  resourceType: 'content' | 'asset' | 'deployment' | 'publish' | 'settings';
  resourceId: string;
  resourceName: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  status: ApprovalStatus;
  priority: ApprovalPriority;
  title: string;
  description?: string;
  changes?: Record<string, { before: unknown; after: unknown }>;
  approvers: ApprovalStep[];
  currentStep: number;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
}

export interface ApprovalStep {
  stepIndex: number;
  approverId: string;
  approverName: string;
  approverEmail: string;
  role: 'reviewer' | 'approver' | 'admin';
  status: ApprovalStatus;
  decision?: 'approved' | 'rejected' | 'changes_requested';
  comment?: string;
  decidedAt?: string;
  requiredForApproval: boolean;
}

export interface ApprovalRule {
  id: string;
  workspaceId: string;
  name: string;
  resourceType: ApprovalRequest['resourceType'];
  conditions: ApprovalCondition[];
  steps: ApprovalStepTemplate[];
  isActive: boolean;
  autoExpireHours?: number;
}

export interface ApprovalCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: unknown;
}

export interface ApprovalStepTemplate {
  stepIndex: number;
  roleRequired: string;
  minApprovers: number;
  skipIfPreviousApproved: boolean;
}

export interface ApprovalNotification {
  type: 'request' | 'reminder' | 'approved' | 'rejected' | 'changes_requested' | 'expired';
  requestId: string;
  recipientId: string;
  message: string;
  createdAt: string;
}

class ApprovalWorkflowService {
  private pendingRequests: Map<string, ApprovalRequest> = new Map();
  private rules: Map<string, ApprovalRule> = new Map();
  private notificationHandlers: ((notification: ApprovalNotification) => void)[] = [];

  // ============================================================================
  // REQUEST MANAGEMENT
  // ============================================================================

  /**
   * Create a new approval request
   */
  async createRequest(
    params: Omit<ApprovalRequest, 'id' | 'status' | 'currentStep' | 'createdAt' | 'updatedAt'>
  ): Promise<ApprovalRequest> {
    const request: ApprovalRequest = {
      ...params,
      id: `apr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      status: 'pending',
      currentStep: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Initialize all steps as pending
    request.approvers = request.approvers.map(step => ({
      ...step,
      status: 'pending',
    }));

    this.pendingRequests.set(request.id, request);

    // Notify first approver(s)
    await this.notifyApprovers(request, 0);

    console.log(`[ApprovalWorkflow] Created request ${request.id} for ${request.resourceType}`);
    return request;
  }

  /**
   * Submit a decision on an approval request
   */
  async submitDecision(
    requestId: string,
    approverId: string,
    decision: 'approved' | 'rejected' | 'changes_requested',
    comment?: string
  ): Promise<ApprovalRequest | null> {
    const request = this.pendingRequests.get(requestId);
    if (!request) {
      console.error(`[ApprovalWorkflow] Request ${requestId} not found`);
      return null;
    }

    // Find the approver's step
    const stepIndex = request.approvers.findIndex(
      step => step.approverId === approverId && step.status === 'pending'
    );

    if (stepIndex === -1) {
      console.error(`[ApprovalWorkflow] Approver ${approverId} not found or already decided`);
      return null;
    }

    // Update the step
    request.approvers[stepIndex] = {
      ...request.approvers[stepIndex],
      status: decision === 'approved' ? 'approved' : decision === 'rejected' ? 'rejected' : 'changes_requested',
      decision,
      comment,
      decidedAt: new Date().toISOString(),
    };

    request.updatedAt = new Date().toISOString();

    // Evaluate overall status
    this.evaluateRequestStatus(request);

    // Notify requester
    await this.notifyRequester(request, decision, comment);

    return request;
  }

  private evaluateRequestStatus(request: ApprovalRequest): void {
    const currentStepApprovers = request.approvers.filter(
      a => a.stepIndex === request.currentStep
    );

    // Check if any required approver rejected
    const hasRejection = currentStepApprovers.some(
      a => a.requiredForApproval && a.decision === 'rejected'
    );
    if (hasRejection) {
      request.status = 'rejected';
      return;
    }

    // Check if any requested changes
    const hasChangesRequested = currentStepApprovers.some(
      a => a.decision === 'changes_requested'
    );
    if (hasChangesRequested) {
      request.status = 'changes_requested';
      return;
    }

    // Check if all required approvers approved
    const allRequiredApproved = currentStepApprovers
      .filter(a => a.requiredForApproval)
      .every(a => a.decision === 'approved');

    if (allRequiredApproved) {
      // Move to next step or complete
      const hasNextStep = request.approvers.some(
        a => a.stepIndex > request.currentStep
      );

      if (hasNextStep) {
        request.currentStep++;
        this.notifyApprovers(request, request.currentStep);
      } else {
        request.status = 'approved';
      }
    }
  }

  // ============================================================================
  // QUERIES
  // ============================================================================

  getRequest(requestId: string): ApprovalRequest | null {
    return this.pendingRequests.get(requestId) || null;
  }

  getPendingRequests(workspaceId?: string, approverId?: string): ApprovalRequest[] {
    const requests = Array.from(this.pendingRequests.values())
      .filter(r => r.status === 'pending');

    if (workspaceId) {
      return requests.filter(r => r.workspaceId === workspaceId);
    }

    if (approverId) {
      return requests.filter(r =>
        r.approvers.some(a => a.approverId === approverId && a.status === 'pending')
      );
    }

    return requests;
  }

  getRequestsByStatus(status: ApprovalStatus): ApprovalRequest[] {
    return Array.from(this.pendingRequests.values())
      .filter(r => r.status === status);
  }

  getMyRequests(requesterId: string): ApprovalRequest[] {
    return Array.from(this.pendingRequests.values())
      .filter(r => r.requesterId === requesterId);
  }

  // ============================================================================
  // RULE MANAGEMENT
  // ============================================================================

  createRule(rule: Omit<ApprovalRule, 'id'>): ApprovalRule {
    const fullRule: ApprovalRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    };
    this.rules.set(fullRule.id, fullRule);
    return fullRule;
  }

  getApplicableRule(
    workspaceId: string,
    resourceType: ApprovalRequest['resourceType'],
    resourceData?: Record<string, unknown>
  ): ApprovalRule | null {
    const workspaceRules = Array.from(this.rules.values())
      .filter(r => r.workspaceId === workspaceId && r.resourceType === resourceType && r.isActive);

    for (const rule of workspaceRules) {
      const matchesConditions = rule.conditions.every(condition => {
        const value = resourceData?.[condition.field];
        switch (condition.operator) {
          case 'equals': return value === condition.value;
          case 'contains': return String(value).includes(String(condition.value));
          case 'greater_than': return Number(value) > Number(condition.value);
          case 'less_than': return Number(value) < Number(condition.value);
          default: return false;
        }
      });

      if (matchesConditions || rule.conditions.length === 0) {
        return rule;
      }
    }

    return null;
  }

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================

  onNotification(handler: (notification: ApprovalNotification) => void): () => void {
    this.notificationHandlers.push(handler);
    return () => {
      const index = this.notificationHandlers.indexOf(handler);
      if (index >= 0) this.notificationHandlers.splice(index, 1);
    };
  }

  private async notifyApprovers(request: ApprovalRequest, stepIndex: number): Promise<void> {
    const approvers = request.approvers.filter(a => a.stepIndex === stepIndex);
    
    for (const approver of approvers) {
      const notification: ApprovalNotification = {
        type: 'request',
        requestId: request.id,
        recipientId: approver.approverId,
        message: `${request.requesterName} requests your approval for: ${request.title}`,
        createdAt: new Date().toISOString(),
      };
      
      this.notificationHandlers.forEach(handler => handler(notification));
    }
  }

  private async notifyRequester(
    request: ApprovalRequest,
    decision: string,
    comment?: string
  ): Promise<void> {
    const notification: ApprovalNotification = {
      type: decision as ApprovalNotification['type'],
      requestId: request.id,
      recipientId: request.requesterId,
      message: `Your request "${request.title}" was ${decision}${comment ? `: ${comment}` : ''}`,
      createdAt: new Date().toISOString(),
    };
    
    this.notificationHandlers.forEach(handler => handler(notification));
  }

  // ============================================================================
  // EXPIRATION HANDLING
  // ============================================================================

  async checkExpirations(): Promise<void> {
    const now = new Date();
    
    for (const request of this.pendingRequests.values()) {
      if (request.expiresAt && new Date(request.expiresAt) < now && request.status === 'pending') {
        request.status = 'expired';
        request.updatedAt = now.toISOString();
        
        const notification: ApprovalNotification = {
          type: 'expired',
          requestId: request.id,
          recipientId: request.requesterId,
          message: `Your approval request "${request.title}" has expired`,
          createdAt: now.toISOString(),
        };
        
        this.notificationHandlers.forEach(handler => handler(notification));
      }
    }
  }
}

// Singleton
export const approvalWorkflowService = new ApprovalWorkflowService();
