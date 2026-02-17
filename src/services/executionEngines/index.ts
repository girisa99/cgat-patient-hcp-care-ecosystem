/**
 * Execution Engines Index
 * Exports all execution engines for multi-agent architectures
 */

export { SwarmDecisionEngine, createSwarmEngine } from './SwarmDecisionEngine';
export type { SwarmParticipant, SwarmVote, SwarmDecisionConfig, SwarmDecisionResult } from './SwarmDecisionEngine';

export { ReActLoopEngine, createReActEngine, BUILTIN_TOOLS } from './ReActLoopEngine';
export type { ReActConfig, ReActTool, ReActStep, ReActResult, ThoughtProcess } from './ReActLoopEngine';

// LoopAgent Self-Correction Engine (98%+ automation via Generator/Verifier loops)
export { 
  LoopAgentSelfCorrectionEngine, 
  createLoopAgentEngine, 
  loopAgentEngine,
  DEFAULT_QUALITY_RUBRICS,
  PIPELINE_RUBRIC_PRESETS
} from './LoopAgentSelfCorrectionEngine';
export type { 
  LoopAgentConfig, 
  LoopAgentResult, 
  LoopContext, 
  LoopIteration,
  QualityRubric,
  RubricEvaluation,
  GeneratorFunction 
} from './LoopAgentSelfCorrectionEngine';

// Pipeline Automation Booster (98%+ for non-VR/AR pipelines)
export {
  executeWithSelfCorrection,
  getBoostedAutomationLevel,
  isHardwareDependent,
  getAutomationStats,
  BOOSTED_AUTOMATION_LEVELS,
  HARDWARE_DEPENDENT_PIPELINES,
  HIGH_AUTOMATION_CATEGORIES,
  BOOST_CONFIG_98_PLUS,
  BOOST_CONFIG_HARDWARE,
} from './pipelineAutomationBooster';
export type { PipelineAutomationConfig } from './pipelineAutomationBooster';
