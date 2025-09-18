/**
 * ENROLLMENT COMPONENTS INDEX
 * Exports all enrollment-related components including enhanced versions
 */

// Enhanced MCP Agent - Smart Field Routing
export { SmartMCPStepwiseAgent } from './SmartMCPStepwiseAgent';

// Enhanced Conversational Agent
export { EnhancedFloatingConversationalAgent } from './EnhancedFloatingConversationalAgent';

// Enhanced Structured Agent  
export { EnhancedStructuredEnrollmentAgent } from './EnhancedStructuredEnrollmentAgent';

// Legacy components (for backward compatibility)
export { FloatingConversationalAgent } from './FloatingConversationalAgent';
export { StructuredEnrollmentAgent } from './StructuredEnrollmentAgent';

// Support components
export { EnrollmentErrorBoundary } from './EnrollmentErrorBoundary';
export { MCPWelcomeOverview } from './MCPWelcomeOverview';