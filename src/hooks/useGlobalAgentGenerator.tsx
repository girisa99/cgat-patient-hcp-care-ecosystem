import { createContext, useContext, useState, ReactNode } from 'react';

interface GeneratedAgent {
  id: string;
  name: string;
  nodes: any[];
  edges: any[];
  prompt: string;
  provider: string;
  generatedAt: string;
}

interface GlobalAgentGeneratorContextType {
  isGeneratorOpen: boolean;
  openGenerator: (context?: { purpose?: string; prefillPrompt?: string }) => void;
  closeGenerator: () => void;
  onAgentGenerated: (handler: (agent: GeneratedAgent) => void) => void;
  generatedAgents: GeneratedAgent[];
  addGeneratedAgent: (agent: GeneratedAgent) => void;
  context: { purpose?: string; prefillPrompt?: string } | null;
}

const GlobalAgentGeneratorContext = createContext<GlobalAgentGeneratorContextType | undefined>(undefined);

export const GlobalAgentGeneratorProvider = ({ children }: { children: ReactNode }) => {
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [context, setContext] = useState<{ purpose?: string; prefillPrompt?: string } | null>(null);
  const [generatedAgents, setGeneratedAgents] = useState<GeneratedAgent[]>([]);
  const [agentGeneratedHandlers, setAgentGeneratedHandlers] = useState<((agent: GeneratedAgent) => void)[]>([]);

  const openGenerator = (ctx?: { purpose?: string; prefillPrompt?: string }) => {
    setContext(ctx || null);
    setIsGeneratorOpen(true);
  };

  const closeGenerator = () => {
    setIsGeneratorOpen(false);
    setContext(null);
  };

  const onAgentGenerated = (handler: (agent: GeneratedAgent) => void) => {
    setAgentGeneratedHandlers(prev => [...prev, handler]);
  };

  const addGeneratedAgent = (agent: GeneratedAgent) => {
    setGeneratedAgents(prev => [...prev, agent]);
    // Notify all handlers
    agentGeneratedHandlers.forEach(handler => handler(agent));
  };

  return (
    <GlobalAgentGeneratorContext.Provider
      value={{
        isGeneratorOpen,
        openGenerator,
        closeGenerator,
        onAgentGenerated,
        generatedAgents,
        addGeneratedAgent,
        context
      }}
    >
      {children}
    </GlobalAgentGeneratorContext.Provider>
  );
};

export const useGlobalAgentGenerator = () => {
  const context = useContext(GlobalAgentGeneratorContext);
  if (context === undefined) {
    throw new Error('useGlobalAgentGenerator must be used within a GlobalAgentGeneratorProvider');
  }
  return context;
};