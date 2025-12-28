/**
 * Hierarchical Multi-Agent Architecture Types
 * 
 * Implements a two-tier architecture with Domain Orchestrators managing
 * specialized Sub-Agents for healthcare enrollment processing.
 */

// ============================================================================
// CORE ORCHESTRATION TYPES
// ============================================================================

export type DomainType = 'insurance' | 'medication' | 'adherence' | 'patient' | 'document';
export type PipelineStatus = 'pending' | 'in_progress' | 'awaiting_input' | 'completed' | 'failed' | 'skipped';
export type HandoffType = 'sequential' | 'parallel' | 'conditional';

export interface DomainOrchestrator {
  id: string;
  domain: DomainType;
  name: string;
  description: string;
  subAgents: SubAgent[];
  pipelinePattern: HandoffType;
  sharedContext: SharedContext;
  status: PipelineStatus;
  config: OrchestratorConfig;
  createdAt: string;
  updatedAt: string;
}

export interface SubAgent {
  id: string;
  orchestratorId: string;
  name: string;
  role: SubAgentRole;
  capabilities: string[];
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  priority: number;
  dependsOn: string[];
  timeoutMs: number;
  retryConfig: RetryConfig;
}

export type SubAgentRole = 
  | 'verification'
  | 'benefits_investigation'
  | 'prior_authorization'
  | 'copay_assistance'
  | 'alternative_funding'
  | 'coding_lookup'
  | 'coding_validation'
  | 'adherence_monitoring'
  | 'intervention'
  | 'escalation';

export interface SharedContext {
  enrollmentId?: string;
  patientId?: string;
  medicationId?: string;
  insuranceInfo?: InsuranceContext;
  medicationInfo?: MedicationContext;
  adherenceInfo?: AdherenceContext;
  history: ContextHistoryEntry[];
  metadata: Record<string, any>;
}

export interface ContextHistoryEntry {
  agentId: string;
  agentRole: SubAgentRole;
  timestamp: string;
  action: string;
  input: any;
  output: any;
  duration: number;
}

export interface OrchestratorConfig {
  maxRetries: number;
  timeoutMs: number;
  parallelExecution: boolean;
  humanInLoopRequired: boolean;
  autoEscalation: boolean;
  escalationThreshold: number;
}

export interface RetryConfig {
  maxAttempts: number;
  backoffMs: number;
  backoffMultiplier: number;
}

// ============================================================================
// INSURANCE PIPELINE TYPES
// ============================================================================

export interface InsuranceContext {
  payerId: string;
  planId: string;
  memberId: string;
  groupNumber?: string;
  effectiveDate: string;
  terminationDate?: string;
  coverageType: 'commercial' | 'medicare' | 'medicaid' | 'tricare' | 'va' | 'other';
}

export interface VerificationResult {
  isActive: boolean;
  eligibilityStatus: 'eligible' | 'ineligible' | 'pending' | 'unknown';
  coverageDetails: CoverageDetails;
  verifiedAt: string;
  expiresAt: string;
  rawResponse?: any;
}

export interface CoverageDetails {
  inNetwork: boolean;
  deductible: number;
  deductibleMet: number;
  outOfPocketMax: number;
  outOfPocketMet: number;
  coinsurance: number;
  copay: number;
  priorAuthRequired: boolean;
  stepTherapyRequired: boolean;
  quantityLimits?: QuantityLimit[];
}

export interface QuantityLimit {
  type: 'days_supply' | 'units' | 'fills';
  value: number;
  period: 'per_fill' | 'per_month' | 'per_year';
}

export interface BenefitsInvestigationResult {
  benefitId: string;
  drugCoverage: 'covered' | 'not_covered' | 'covered_with_restrictions';
  tier: number;
  priorAuthStatus: 'required' | 'not_required' | 'approved' | 'denied';
  stepTherapyStatus: 'required' | 'not_required' | 'met' | 'not_met';
  patientResponsibility: PatientResponsibility;
  alternativeTherapies?: AlternativeTherapy[];
  investigatedAt: string;
}

export interface PatientResponsibility {
  estimatedCopay: number;
  estimatedCoinsurance: number;
  estimatedDeductible: number;
  totalEstimated: number;
}

export interface AlternativeTherapy {
  drugName: string;
  ndc: string;
  tier: number;
  estimatedCost: number;
  reason: string;
}

export interface PriorAuthorizationResult {
  paId: string;
  status: 'submitted' | 'pending' | 'approved' | 'denied' | 'appeal_pending';
  submittedAt: string;
  expiresAt?: string;
  approvalCode?: string;
  denialReason?: string;
  appealDeadline?: string;
  requiredDocuments: RequiredDocument[];
  clinicalCriteria: ClinicalCriterion[];
}

export interface RequiredDocument {
  type: string;
  description: string;
  required: boolean;
  submitted: boolean;
  submittedAt?: string;
}

export interface ClinicalCriterion {
  criterion: string;
  met: boolean;
  evidence?: string;
}

export interface CopayAssistanceResult {
  programId: string;
  programName: string;
  status: 'eligible' | 'enrolled' | 'ineligible' | 'pending';
  maxBenefit: number;
  usedBenefit: number;
  remainingBenefit: number;
  cardNumber?: string;
  bin?: string;
  pcn?: string;
  groupId?: string;
  expirationDate?: string;
}

export interface AlternativeFundingResult {
  fundingId: string;
  fundingType: 'foundation' | 'manufacturer' | 'state_program' | 'charity' | 'bridge_program';
  programName: string;
  status: 'available' | 'applied' | 'approved' | 'denied' | 'waitlist';
  maxAssistance: number;
  incomeRequirement?: string;
  applicationDeadline?: string;
  applicationUrl?: string;
  contactInfo?: ContactInfo;
}

export interface ContactInfo {
  phone: string;
  email?: string;
  fax?: string;
  address?: string;
}

export interface InsurancePipelineState {
  enrollmentId: string;
  currentStage: InsurancePipelineStage;
  stages: InsurancePipelineStageStatus[];
  context: SharedContext;
  startedAt: string;
  completedAt?: string;
}

export type InsurancePipelineStage = 
  | 'verification'
  | 'benefits'
  | 'prior_auth'
  | 'copay'
  | 'alt_funding';

export interface InsurancePipelineStageStatus {
  stage: InsurancePipelineStage;
  status: PipelineStatus;
  result?: any;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  agentId: string;
}

// ============================================================================
// MEDICATION CODING TYPES
// ============================================================================

export interface MedicationContext {
  drugName: string;
  strength: string;
  dosageForm: string;
  ndc?: string;
  rxcui?: string;
  gpi?: string;
  manufacturer?: string;
  prescriberId?: string;
  prescriberNpi?: string;
}

export interface ICDCode {
  code: string;
  description: string;
  category: string;
  version: 'ICD-10-CM' | 'ICD-10-PCS' | 'ICD-9';
  specificity: 'billable' | 'header';
  laterality?: 'left' | 'right' | 'bilateral' | 'unspecified';
}

export interface HCPCSCode {
  code: string;
  shortDescription: string;
  longDescription: string;
  category: 'Level I' | 'Level II';
  pricingIndicator?: string;
  statusIndicator?: string;
  apcCode?: string;
}

export interface NDCCode {
  ndc: string;
  ndc10: string;
  ndc11: string;
  productName: string;
  labelerName: string;
  activeIngredients: ActiveIngredient[];
  dosageForm: string;
  route: string;
  strengthNumber: string;
  strengthUnit: string;
  packageDescription: string;
  marketingStatus: string;
}

export interface ActiveIngredient {
  name: string;
  strength: string;
  unit: string;
}

export interface CodingSuggestion {
  id: string;
  type: 'ICD' | 'HCPCS' | 'NDC';
  code: string;
  description: string;
  confidence: number;
  reasoning: string;
  alternatives: AlternativeCode[];
  requiresConfirmation: boolean;
}

export interface AlternativeCode {
  code: string;
  description: string;
  confidence: number;
  reason: string;
}

export interface CodingValidationResult {
  isValid: boolean;
  errors: CodingError[];
  warnings: CodingWarning[];
  suggestions: CodingSuggestion[];
  auditTrail: CodingAuditEntry[];
}

export interface CodingError {
  code: string;
  field: string;
  message: string;
  severity: 'critical' | 'error';
}

export interface CodingWarning {
  code: string;
  field: string;
  message: string;
  recommendation: string;
}

export interface CodingAuditEntry {
  timestamp: string;
  action: 'suggested' | 'validated' | 'confirmed' | 'rejected' | 'overridden';
  code: string;
  codeType: 'ICD' | 'HCPCS' | 'NDC';
  userId?: string;
  agentId?: string;
  reason?: string;
}

export interface MedicalCodingState {
  medicationId: string;
  status: PipelineStatus;
  suggestions: CodingSuggestion[];
  confirmedCodes: ConfirmedCode[];
  validationResult?: CodingValidationResult;
  requiresHumanReview: boolean;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface ConfirmedCode {
  type: 'ICD' | 'HCPCS' | 'NDC';
  code: string;
  description: string;
  confirmedAt: string;
  confirmedBy: 'agent' | 'human';
  userId?: string;
}

// ============================================================================
// ADHERENCE ORCHESTRATOR TYPES
// ============================================================================

export interface AdherenceContext {
  patientId: string;
  medicationId: string;
  prescriptionId: string;
  startDate: string;
  refillDueDate?: string;
  lastFillDate?: string;
  daysSupply: number;
  currentAdherenceScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface AdherenceMetrics {
  pdc: number; // Proportion of Days Covered
  mpr: number; // Medication Possession Ratio
  refillGaps: RefillGap[];
  missedDoses: number;
  onTimeRefills: number;
  lateRefills: number;
  calculatedAt: string;
}

export interface RefillGap {
  startDate: string;
  endDate: string;
  daysGap: number;
  reason?: string;
}

export interface AdherenceMonitoringResult {
  patientId: string;
  medicationId: string;
  metrics: AdherenceMetrics;
  alerts: AdherenceAlert[];
  nextCheckDate: string;
  recommendations: AdherenceRecommendation[];
}

export interface AdherenceAlert {
  id: string;
  type: 'refill_due' | 'refill_overdue' | 'gap_detected' | 'pattern_change' | 'high_risk';
  severity: 'info' | 'warning' | 'urgent' | 'critical';
  message: string;
  triggeredAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

export interface AdherenceRecommendation {
  type: 'refill_reminder' | 'outreach_call' | 'care_team_alert' | 'intervention' | 'escalation';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  message: string;
  suggestedAction: string;
}

export interface InterventionResult {
  interventionId: string;
  type: 'phone_call' | 'sms' | 'email' | 'app_notification' | 'provider_outreach' | 'home_visit';
  status: 'scheduled' | 'attempted' | 'completed' | 'failed' | 'patient_refused';
  outcome?: InterventionOutcome;
  scheduledAt?: string;
  completedAt?: string;
  notes?: string;
}

export interface InterventionOutcome {
  contactMade: boolean;
  patientResponse: 'positive' | 'neutral' | 'negative' | 'no_response';
  barriersIdentified: AdherenceBarrier[];
  actionsTaken: string[];
  followUpRequired: boolean;
  followUpDate?: string;
}

export interface AdherenceBarrier {
  type: 'cost' | 'side_effects' | 'complexity' | 'forgetfulness' | 'transportation' | 'health_literacy' | 'other';
  description: string;
  severity: 'minor' | 'moderate' | 'major';
  addressed: boolean;
}

export interface EscalationResult {
  escalationId: string;
  level: 'care_manager' | 'clinical_pharmacist' | 'provider' | 'medical_director';
  reason: string;
  status: 'escalated' | 'acknowledged' | 'in_review' | 'resolved';
  escalatedAt: string;
  escalatedTo: string;
  resolvedAt?: string;
  resolution?: string;
}

export interface AdherenceOrchestratorState {
  patientId: string;
  medicationId: string;
  currentStage: AdherenceStage;
  monitoringResult?: AdherenceMonitoringResult;
  interventions: InterventionResult[];
  escalations: EscalationResult[];
  status: PipelineStatus;
  startedAt: string;
  lastUpdatedAt: string;
}

export type AdherenceStage = 'monitoring' | 'intervention' | 'escalation' | 'resolved';

// ============================================================================
// A2A MESSAGE TYPES FOR HIERARCHICAL COMMUNICATION
// ============================================================================

export interface HierarchicalMessage {
  id: string;
  type: HierarchicalMessageType;
  fromAgent: AgentIdentifier;
  toAgent: AgentIdentifier;
  payload: any;
  correlationId: string;
  parentMessageId?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  timestamp: string;
  ttl?: number;
}

export type HierarchicalMessageType = 
  | 'task_assignment'
  | 'task_result'
  | 'context_update'
  | 'handoff_request'
  | 'handoff_accept'
  | 'escalation_request'
  | 'status_update'
  | 'query'
  | 'response';

export interface AgentIdentifier {
  id: string;
  domain: DomainType;
  role: SubAgentRole | 'orchestrator';
  tier: 'orchestrator' | 'sub_agent';
}

// ============================================================================
// CANVAS NODE TYPES
// ============================================================================

export interface HierarchicalNodeData {
  nodeType: 'domain_orchestrator' | 'sub_agent' | 'pipeline_connector';
  domain?: DomainType;
  role?: SubAgentRole;
  config?: OrchestratorConfig;
  pipelinePosition?: number;
  status?: PipelineStatus;
}

export interface PipelineEdgeData {
  edgeType: 'sequential' | 'conditional' | 'parallel';
  condition?: string;
  priority?: number;
}
