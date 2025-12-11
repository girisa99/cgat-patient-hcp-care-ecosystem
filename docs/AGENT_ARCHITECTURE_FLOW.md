# Agent Architecture & Flow Documentation

## Overview

This document provides comprehensive architecture diagrams for the multi-agent, A2A, and agentic AI capabilities integrated into the platform.

## System Architecture Diagram

```mermaid
flowchart TB
    subgraph EntryPoints["🚀 Entry Points"]
        Admin["/admin Dashboard"]
        Canvas["/agents/canvas Builder"]
    end

    subgraph ArchitectureIntelligence["🧠 Architecture Intelligence"]
        IntentDetection["Intent Detection Service"]
        ArchIntelligence["Agent Architecture Intelligence"]
        
        IntentDetection --> ArchIntelligence
        
        subgraph ArchTypes["Architecture Types"]
            Single["Single Agent"]
            Conversational["Conversational"]
            MCPSDK["MCP SDK"]
            MultiAgent["Multi-Agent"]
            A2A["A2A Protocol"]
            Agentic["Agentic AI"]
            Swarm["Swarm Intelligence"]
        end
        
        ArchIntelligence --> ArchTypes
    end

    subgraph CanvasBuilder["🎨 Canvas Workflow Builder"]
        NodeLibrary["Node Library Panel"]
        ContextMenu["Right-Click Context Menu"]
        AIAssist["Enhanced AI Assist Panel"]
        NodeRegistry["Multi-Agent Node Registry"]
        
        subgraph NodeCategories["Node Categories"]
            A2ANodes["A2A Protocol Nodes
            • A2A Agent
            • Task Handoff
            • Communication Hub"]
            
            OrchNodes["Orchestration Nodes
            • Agent Team
            • Swarm Decision
            • Tool Sharing"]
            
            AgenticNodes["Agentic AI Nodes
            • ReAct Loop
            • Tool Chain
            • Self Reflection
            • Goal Decomposition"]
            
            MCPNodes["MCP SDK Nodes
            • Data Sync
            • API Connector
            • Webhook Handler"]
        end
        
        NodeLibrary --> NodeCategories
        ContextMenu --> NodeCategories
        AIAssist --> NodeCategories
    end

    subgraph CoreHooks["⚡ Core Hooks & Services"]
        subgraph A2AProtocol["A2A Protocol Layer"]
            useA2A["useA2AProtocol"]
            AgentCard["Agent Card Management"]
            TaskLifecycle["Task Lifecycle"]
            SSEStream["SSE Streaming"]
        end
        
        subgraph MultiAgentLayer["Multi-Agent Layer"]
            useMultiAgent["useMultiAgentOrchestration"]
            TeamMgmt["Team Management"]
            TaskAssignment["Task Assignment"]
            SwarmDecision["Swarm Decision Making"]
        end
        
        subgraph AgenticLayer["Agentic AI Layer"]
            useAgentic["useAgenticAI"]
            ReActLoop["ReAct Loop Engine"]
            Planning["Planning & Decomposition"]
            ToolChaining["Tool Chaining"]
            SelfReflect["Self Reflection"]
        end
        
        subgraph LifecycleLayer["Lifecycle Layer"]
            useLifecycle["useAgentLifecycle"]
            StateManagement["State Management"]
            Versioning["Version Control"]
            Rollback["Rollback Support"]
        end
        
        subgraph DeploymentLayer["Deployment Layer"]
            useDeployment["useAgentDeploymentBridge"]
            MultiChannel["Multi-Channel Deploy"]
            HealthChecks["Health Checks"]
        end
        
        subgraph PerformanceLayer["Performance Layer"]
            usePerformance["useAgentPerformanceMonitoring"]
            Metrics["Metrics Collection"]
            Analytics["Performance Analytics"]
        end
        
        subgraph CanvasIntegration["Canvas Integration"]
            useCanvasInteg["useMultiAgentCanvasIntegration"]
            NodeGeneration["Node Generation"]
            WorkflowExec["Workflow Execution"]
        end
    end

    subgraph Deployment["📤 Deployment System"]
        DeployPanel["Multi-Agent Deployment Panel"]
        IntegrationTargets["Integration Target Selector"]
        DeployMonitor["Deployment Monitor"]
        
        subgraph Channels["Deployment Channels"]
            WebChat["Web Chat"]
            Voice["Voice/Phone"]
            Email["Email"]
            SMS["SMS"]
            WhatsApp["WhatsApp"]
            API["API"]
            Webhook["Webhook"]
            Slack["Slack"]
        end
        
        subgraph OrchPatterns["Orchestration Patterns"]
            Hierarchical["Hierarchical"]
            PeerToPeer["Peer-to-Peer"]
            SwarmPattern["Swarm"]
            Pipeline["Pipeline"]
        end
        
        DeployPanel --> Channels
        DeployPanel --> OrchPatterns
    end

    subgraph Database["🗄️ Supabase Database"]
        AgentsTable["agents"]
        ConversationsTable["agent_conversations"]
        ChannelDeploys["agent_channel_deployments"]
        PerformanceMetrics["agent_performance_metrics"]
        Communications["agent_communications"]
        LifecycleStates["agent_lifecycle_states"]
    end

    subgraph AdminDashboard["📊 Admin Dashboard"]
        AgentsList["Agents List with Architecture Badges"]
        EnginesMgmt["Conversation Engines"]
        DeploymentsMgmt["Deployments Management"]
        
        subgraph ArchitectureBadges["Architecture Indicators"]
            SingleBadge["🔹 Single Agent"]
            MultiBadge["🟢 Multi-Agent"]
            A2ABadge["🔵 A2A Protocol"]
            AgenticBadge["🔴 Agentic AI"]
            SwarmBadge["🟡 Swarm"]
        end
    end

    subgraph Analytics["📈 Analytics (Separate Workspace)"]
        GenieAnalytics["Genie Analytics Dashboard"]
        ArchitectureMetrics["Architecture-specific Metrics"]
        PerformanceReports["Performance Reports"]
    end

    %% Connections
    Admin --> ArchitectureIntelligence
    Admin --> Canvas
    
    Canvas --> CanvasBuilder
    CanvasBuilder --> CoreHooks
    
    AIAssist --> ArchitectureIntelligence
    
    CoreHooks --> Deployment
    CoreHooks --> Database
    
    Deployment --> Database
    
    Database --> AdminDashboard
    Database --> Analytics
    
    AdminDashboard --> ArchitectureBadges

    style EntryPoints fill:#e1f5fe
    style ArchitectureIntelligence fill:#f3e5f5
    style CanvasBuilder fill:#e8f5e9
    style CoreHooks fill:#fff3e0
    style Deployment fill:#fce4ec
    style Database fill:#e3f2fd
    style AdminDashboard fill:#f5f5f5
    style Analytics fill:#fff8e1
```

## Architecture Selection Flow

```mermaid
flowchart LR
    subgraph UserInput["User Input"]
        Description["Agent Description"]
        UseCase["Use Case Selection"]
        Features["Feature Requirements"]
    end

    subgraph Analysis["Intent Analysis"]
        Keywords["Keyword Detection"]
        Factors["Factor Analysis"]
        UseCaseMap["Use Case Mapping"]
    end

    subgraph Scoring["Architecture Scoring"]
        KeywordScore["Keyword Score (30%)"]
        UseCaseScore["Use Case Score (30%)"]
        FactorScore["Factor Score (40%)"]
    end

    subgraph Recommendation["Recommendation"]
        Primary["Primary Architecture"]
        Alternatives["3 Alternatives"]
        Reasoning["Detailed Reasoning"]
        SuggestedNodes["Suggested Nodes"]
    end

    subgraph UserDecision["User Decision"]
        Accept["Accept Primary"]
        SelectAlt["Select Alternative"]
        Override["Manual Override"]
    end

    UserInput --> Analysis
    Analysis --> Scoring
    Scoring --> Recommendation
    Recommendation --> UserDecision
```

## Agent Architecture Types

### 1. Single Agent
```mermaid
flowchart LR
    Input["User Input"] --> Agent["AI Agent"] --> Output["Response"]
```
**Use Cases:** Simple FAQ, basic chatbot, information retrieval

### 2. Conversational Agent
```mermaid
flowchart LR
    Input["User Input"] --> Context["Context Manager"] --> Agent["Conversational Agent"]
    Agent --> Memory["Memory Store"]
    Memory --> Agent
    Agent --> Output["Response"]
```
**Use Cases:** Patient intake, support conversations, guided forms

### 3. MCP SDK Integration
```mermaid
flowchart TB
    Input["User Input"] --> Agent["AI Agent"]
    Agent --> MCP["MCP SDK"]
    
    subgraph Tools["External Tools"]
        CRM["Salesforce/HubSpot"]
        DB["Supabase DB"]
        API["External APIs"]
        Webhook["Webhooks"]
    end
    
    MCP --> Tools
    Tools --> MCP
    MCP --> Agent
    Agent --> Output["Response"]
```
**Use Cases:** CRM sync, data integration, form processing, enrollment

### 4. Multi-Agent System
```mermaid
flowchart TB
    Input["User Input"] --> Coordinator["Coordinator Agent"]
    
    subgraph Team["Agent Team"]
        A1["Specialist A"]
        A2["Specialist B"]
        A3["Specialist C"]
    end
    
    Coordinator --> Team
    Team --> SharedContext["Shared Context"]
    SharedContext --> Team
    Team --> Coordinator
    Coordinator --> Output["Combined Response"]
```
**Use Cases:** Complex workflows, parallel processing, specialized tasks

### 5. A2A Protocol
```mermaid
flowchart TB
    Input["User Input"] --> Agent1["A2A Agent 1"]
    
    subgraph A2AProtocol["A2A Communication"]
        AgentCard["Agent Cards"]
        TaskLifecycle["Task Lifecycle"]
        SSE["SSE Streaming"]
    end
    
    Agent1 --> |"Task Handoff"| Hub["Communication Hub"]
    Hub --> Agent2["A2A Agent 2"]
    Hub --> Agent3["A2A Agent 3"]
    
    Agent2 --> Hub
    Agent3 --> Hub
    Hub --> Output["Aggregated Response"]
```
**Use Cases:** Cross-system integration, standardized agent communication, federated systems

### 6. Agentic AI (ReAct)
```mermaid
flowchart TB
    Goal["Complex Goal"] --> Decomposition["Goal Decomposition"]
    
    subgraph ReActLoop["ReAct Loop"]
        Think["Reasoning"]
        Act["Action Selection"]
        Observe["Observation"]
        Reflect["Self Reflection"]
        
        Think --> Act
        Act --> Observe
        Observe --> Reflect
        Reflect --> Think
    end
    
    Decomposition --> ReActLoop
    
    subgraph Tools["Tool Chain"]
        T1["Tool 1"]
        T2["Tool 2"]
        T3["Tool 3"]
    end
    
    Act --> Tools
    Tools --> Observe
    
    ReActLoop --> |"Goal Achieved"| Output["Final Result"]
```
**Use Cases:** Autonomous research, complex problem solving, adaptive workflows

### 7. Swarm Intelligence
```mermaid
flowchart TB
    Question["Complex Decision"] --> Broadcast["Broadcast to Swarm"]
    
    subgraph Swarm["Agent Swarm"]
        A1["Agent 1 (w=0.3)"]
        A2["Agent 2 (w=0.25)"]
        A3["Agent 3 (w=0.25)"]
        A4["Agent 4 (w=0.2)"]
    end
    
    Broadcast --> Swarm
    
    Swarm --> Voting["Weighted Voting"]
    Voting --> Consensus["Consensus Building"]
    Consensus --> |"Threshold Met"| Decision["Final Decision"]
```
**Use Cases:** Collective decisions, multi-perspective analysis, distributed consensus

## Multi-Channel Deployment

```mermaid
flowchart TB
    subgraph AgentConfig["Agent Configuration"]
        Agent["Configured Agent/Team"]
        Workflow["Workflow Definition"]
        Features["Enabled Features"]
    end

    subgraph DeploymentPanel["Deployment Panel"]
        Mode["Single / Team Mode"]
        Pattern["Orchestration Pattern"]
        ChannelSelect["Channel Selection"]
    end

    AgentConfig --> DeploymentPanel

    subgraph Channels["Target Channels"]
        direction LR
        Web["🌐 Web Chat"]
        Voice["📞 Voice"]
        Email["📧 Email"]
        SMS["💬 SMS"]
        WA["📱 WhatsApp"]
        API["🔌 API"]
        Hook["🪝 Webhook"]
        Slack["💼 Slack"]
    end

    DeploymentPanel --> Channels

    subgraph ChannelAdaptation["Channel Adaptation"]
        Config["Channel-specific Config"]
        RateLimit["Rate Limits"]
        Format["Message Format"]
    end

    Channels --> ChannelAdaptation

    subgraph Database["Database"]
        Deployments["agent_channel_deployments"]
        Metrics["agent_performance_metrics"]
    end

    ChannelAdaptation --> Database
```

## Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Admin as Admin Dashboard
    participant Canvas as Canvas Builder
    participant AI as Architecture Intelligence
    participant Hooks as Core Hooks
    participant DB as Supabase
    participant Deploy as Deployment
    participant Channel as Channels

    User->>Admin: Create Agent
    Admin->>AI: Analyze Use Case
    AI-->>Admin: Recommend Architecture
    
    Admin->>Canvas: Navigate with Context
    Canvas->>AI: Get Suggestions
    AI-->>Canvas: Recommended Nodes
    
    User->>Canvas: Build Workflow
    Canvas->>Hooks: Configure Agent
    
    User->>Canvas: Deploy Agent
    Canvas->>Deploy: Multi-Channel Deploy
    Deploy->>DB: Save Deployment Config
    
    loop Each Channel
        Deploy->>Channel: Deploy to Channel
        Channel-->>DB: Update Status
    end
    
    Deploy-->>Canvas: Deployment Complete
    
    DB-->>Admin: Update Agent List
    Admin->>User: Show Architecture Badge
```

## Integration with Existing Systems

### Backward Compatibility

| Feature | Status | Integration Point |
|---------|--------|-------------------|
| Single Agent | ✅ Supported | Default architecture |
| Conversational | ✅ Supported | useConversationalContext hook |
| MCP SDK | ✅ Supported | MCP tool nodes in node library |
| Knowledge Base | ✅ Supported | KB linking in AI Assist panel |
| RAG | ✅ Supported | RAG configuration in nodes |

### New Capabilities

| Feature | Status | Integration Point |
|---------|--------|-------------------|
| A2A Protocol | ✅ New | useA2AProtocol hook, A2A nodes |
| Multi-Agent | ✅ New | useMultiAgentOrchestration hook |
| Agentic AI | ✅ New | useAgenticAI hook, ReAct nodes |
| Swarm | ✅ New | Swarm decision nodes |
| Multi-Channel | ✅ New | MultiAgentDeploymentPanel |

## File References

### Core Services
- `src/services/agentArchitectureIntelligence.ts` - Architecture recommendation engine
- `src/services/intentDetectionService.ts` - Intent analysis for responses

### Hooks
- `src/hooks/useA2AProtocol.ts` - A2A Protocol implementation
- `src/hooks/useMultiAgentOrchestration.ts` - Multi-agent coordination
- `src/hooks/useAgenticAI.ts` - Agentic AI (ReAct, planning)
- `src/hooks/useAgentLifecycle.ts` - Agent lifecycle management
- `src/hooks/useAgentDeploymentBridge.ts` - Deployment bridge
- `src/hooks/useAgentPerformanceMonitoring.ts` - Performance metrics
- `src/hooks/useMultiAgentCanvasIntegration.ts` - Canvas integration

### Components
- `src/components/workflow-builder/MultiAgentNodeTypes.tsx` - Node components
- `src/components/workflow-builder/MultiAgentNodeRegistry.ts` - Node definitions
- `src/components/workflow-builder/MultiAgentDeploymentPanel.tsx` - Deployment UI
- `src/components/workflow-builder/ArchitectureRecommendationPanel.tsx` - Recommendations UI

### Admin Dashboard
- `src/components/admin/UnifiedAgentAdminDashboard.tsx` - Agent management with badges

## Usage Examples

### 1. Getting Architecture Recommendation
```typescript
import { agentArchitectureIntelligence } from '@/services/agentArchitectureIntelligence';

const analysis = agentArchitectureIntelligence.analyzeAndRecommend(
  "I need an agent that can autonomously research and compile reports",
  "research-assistant",
  existingNodes,
  "Autonomous research agent with planning capabilities"
);

console.log(analysis.primaryRecommendation);
// { architecture: 'agentic', confidence: 0.85, reasoning: [...] }
```

### 2. Multi-Channel Deployment
```typescript
import { useMultiAgentCanvasIntegration } from '@/hooks/useMultiAgentCanvasIntegration';

const { deployToMultipleChannels } = useMultiAgentCanvasIntegration();

await deployToMultipleChannels(
  agentConfig,
  ['web-chat', 'voice', 'email', 'slack']
);
```

### 3. Creating A2A Agent Node
```typescript
const { createA2AAgentNode } = useMultiAgentCanvasIntegration();

const node = createA2AAgentNode(agentId, 'task-processor');
// Returns canvas-compatible node with A2A capabilities
```
