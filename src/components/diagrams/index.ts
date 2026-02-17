// Core diagrams
export { PatientOnboardingFlowDiagram } from './PatientOnboardingFlowDiagram';
export { TwoStagePipelineFlowDiagram } from './TwoStagePipelineFlowDiagram';
export { SubAgentArchitectureDiagram } from './SubAgentArchitectureDiagram';
export { BeforeAfterArchitectureDiagram } from './BeforeAfterArchitectureDiagram';

// Product-Feature Matrix (253 Scenarios → 6 Products mapping)
export { ProductFeatureMatrix } from './ProductFeatureMatrix';

// =============================================================================
// GENIE STUDIO - CONSOLIDATED SINGLE SOURCE OF TRUTH
// =============================================================================
// The Unified Hub is the ONLY entry point for all Genie Studio content.
// It contains 11 tabs: Overview, Verification, Product Suite, Scenarios (177),
// Architecture (7 diagrams), Technical, Functional, Market Analysis, 
// Investor Dashboard, Assets & Studio, and Roadmap.
//
// DEPRECATED external components (kept for backwards compatibility only):
// - GenieRecordingStudioArchitectureDiagram → Use Unified Hub "Assets & Studio" tab
// - MarketAnalysisDashboard → Use Unified Hub "Market Analysis" tab
// - GenieVisualAssetsGalleryDiagram → Use Unified Hub "Assets & Studio" tab
// - GenieMarketAnalysisDiagram → Use Unified Hub "Market Analysis" tab
// =============================================================================
export { GenieStudioUnifiedHub } from './GenieStudioUnifiedHub';

// Genie Studio - Individual diagrams (accessible via Architecture tab in Unified Hub)
export { GenieRecordingStudioArchitectureDiagram } from './GenieRecordingStudioArchitectureDiagram';
export { MarketAnalysisDashboard } from './MarketAnalysisDashboard';

// Genie Studio - Investor Dashboard (accessible via Investor Dashboard tab in Unified Hub)
export { GenieInvestorDashboard } from './GenieInvestorDashboard';

// Genie Studio - Architecture Hub (consolidated architecture tab within Unified Hub)
export { GenieArchitectureHub } from './GenieArchitectureHub';

// Genie Studio - Architecture Diagrams (individual with download/expand, used by Architecture Hub)
export { 
  GenieMindArchitectureDiagram,
  GenieVibeArchitectureDiagram,
  GenieArcProductionHubDiagram,
  GenieSparkArchitectureDiagram,
  GenieStudioOverallArchitectureDiagram,
  GenieIntegrationsDiagram,
  GenieMicroservicesDiagram
} from './architecture';
