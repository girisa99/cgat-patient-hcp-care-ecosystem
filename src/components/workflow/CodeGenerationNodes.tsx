/**
 * CODE GENERATION NODES
 * React Flow nodes for code generation, fixing, and GitHub integration
 */
import React, { useState, useCallback } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Code, 
  Github, 
  GitBranch,
  GitPullRequest,
  Bug,
  Sparkles,
  Play,
  Settings,
  FileText,
  Download,
  Upload
} from 'lucide-react';
import { motion } from 'framer-motion';

export type CodeNodeType = 
  | 'code-generator'
  | 'code-fixer'
  | 'github-repo'
  | 'github-pr'
  | 'github-deploy'
  | 'code-reviewer';

interface CodeNodeData {
  label: string;
  nodeType: CodeNodeType;
  language?: string;
  framework?: string;
  status?: 'idle' | 'generating' | 'fixing' | 'reviewing' | 'complete' | 'error';
  prompt?: string;
  generatedCode?: string;
  githubRepo?: string;
  branch?: string;
  prNumber?: number;
  errors?: string[];
  config?: any;
}

const CODE_NODE_CONFIGS = {
  'code-generator': {
    icon: Code,
    color: 'bg-green-500',
    title: 'Code Generator',
    description: 'Generate code from natural language prompts'
  },
  'code-fixer': {
    icon: Bug,
    color: 'bg-red-500',
    title: 'Code Fixer',
    description: 'Automatically fix code errors and issues'
  },
  'github-repo': {
    icon: Github,
    color: 'bg-gray-800',
    title: 'GitHub Repository',
    description: 'Connect to GitHub repository'
  },
  'github-pr': {
    icon: GitPullRequest,
    color: 'bg-blue-500',
    title: 'Pull Request',
    description: 'Create and manage pull requests'
  },
  'github-deploy': {
    icon: Upload,
    color: 'bg-purple-500',
    title: 'GitHub Deploy',
    description: 'Deploy code to GitHub and trigger CI/CD'
  },
  'code-reviewer': {
    icon: FileText,
    color: 'bg-orange-500',
    title: 'Code Reviewer',
    description: 'AI-powered code review and suggestions'
  }
};

export const CodeGenerationNode: React.FC<NodeProps<any>> = ({ data, selected }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localPrompt, setLocalPrompt] = useState((data as CodeNodeData).prompt || '');
  const [isProcessing, setIsProcessing] = useState(false);

  const codeData = data as CodeNodeData;
  const config = CODE_NODE_CONFIGS[codeData.nodeType];
  const IconComponent = config.icon;

  const handleGenerate = useCallback(async () => {
    setIsProcessing(true);
    try {
      // Simulate code generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockGeneratedCode = `// Generated ${codeData.language || 'JavaScript'} code
function ${codeData.nodeType.replace('-', '')}() {
  // Implementation based on prompt: ${localPrompt}
  return "Generated code based on your requirements";
}

export default ${codeData.nodeType.replace('-', '')};`;

      // Update node data (in real implementation, this would update the flow state)
      console.log('Generated code:', mockGeneratedCode);
    } catch (error) {
      console.error('Code generation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [localPrompt, codeData.language, codeData.nodeType]);

  const handleFix = useCallback(async () => {
    setIsProcessing(true);
    try {
      // Simulate code fixing
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Code fixed successfully');
    } catch (error) {
      console.error('Code fixing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleGitHubAction = useCallback(async () => {
    setIsProcessing(true);
    try {
      // Simulate GitHub actions
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`GitHub action completed: ${codeData.nodeType}`);
    } catch (error) {
      console.error('GitHub action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [codeData.nodeType]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'generating':
      case 'fixing':
      case 'reviewing':
        return 'text-blue-500';
      case 'complete':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const renderNodeContent = () => {
    switch (codeData.nodeType) {
      case 'code-generator':
        return (
          <div className="space-y-3">
            {codeData.language && (
              <Badge variant="secondary" className="text-xs">
                {codeData.language}
              </Badge>
            )}
            {codeData.framework && (
              <Badge variant="outline" className="text-xs">
                {codeData.framework}
              </Badge>
            )}
            
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Textarea
                  placeholder="Describe what code you want to generate..."
                  value={localPrompt}
                  onChange={(e) => setLocalPrompt(e.target.value)}
                  className="text-xs"
                  rows={3}
                />
              </motion.div>
            )}

            <div className="flex gap-1">
              <Button
                size="sm"
                onClick={handleGenerate}
                disabled={isProcessing}
                className="flex-1 h-7 text-xs"
              >
                {isProcessing ? (
                  <>
                    <Sparkles className="h-3 w-3 mr-1 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Code className="h-3 w-3 mr-1" />
                    Generate
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-7 px-2"
              >
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          </div>
        );

      case 'code-fixer':
        return (
          <div className="space-y-3">
            {codeData.errors && codeData.errors.length > 0 && (
              <div>
                <div className="text-xs font-medium mb-1">Errors Found</div>
                <div className="space-y-1">
                  {codeData.errors.slice(0, 2).map((error, index) => (
                    <div key={index} className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-1 rounded">
                      {error}
                    </div>
                  ))}
                  {codeData.errors.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{codeData.errors.length - 2} more errors
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button
              size="sm"
              onClick={handleFix}
              disabled={isProcessing}
              className="w-full h-7 text-xs"
            >
              {isProcessing ? (
                <>
                  <Bug className="h-3 w-3 mr-1 animate-pulse" />
                  Fixing...
                </>
              ) : (
                <>
                  <Bug className="h-3 w-3 mr-1" />
                  Fix Issues
                </>
              )}
            </Button>
          </div>
        );

      case 'github-repo':
        return (
          <div className="space-y-3">
            {codeData.githubRepo && (
              <div className="text-xs">
                <div className="font-medium">Repository</div>
                <div className="text-muted-foreground">{codeData.githubRepo}</div>
              </div>
            )}
            {codeData.branch && (
              <div className="flex items-center gap-1">
                <GitBranch className="h-3 w-3" />
                <span className="text-xs">{codeData.branch}</span>
              </div>
            )}

            <div className="flex gap-1">
              <Button
                size="sm"
                onClick={handleGitHubAction}
                disabled={isProcessing}
                className="flex-1 h-7 text-xs"
              >
                <Github className="h-3 w-3 mr-1" />
                Connect
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2"
              >
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          </div>
        );

      case 'github-pr':
        return (
          <div className="space-y-3">
            {codeData.prNumber && (
              <Badge variant="outline" className="text-xs">
                PR #{codeData.prNumber}
              </Badge>
            )}
            
            <div className="flex gap-1">
              <Button
                size="sm"
                onClick={handleGitHubAction}
                disabled={isProcessing}
                className="flex-1 h-7 text-xs"
              >
                <GitPullRequest className="h-3 w-3 mr-1" />
                Create PR
              </Button>
            </div>
          </div>
        );

      case 'github-deploy':
        return (
          <div className="space-y-3">
            <div className="flex gap-1">
              <Button
                size="sm"
                onClick={handleGitHubAction}
                disabled={isProcessing}
                className="flex-1 h-7 text-xs"
              >
                {isProcessing ? (
                  <>
                    <Upload className="h-3 w-3 mr-1 animate-bounce" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Upload className="h-3 w-3 mr-1" />
                    Deploy
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      case 'code-reviewer':
        return (
          <div className="space-y-3">
            <Button
              size="sm"
              onClick={handleGitHubAction}
              disabled={isProcessing}
              className="w-full h-7 text-xs"
            >
              {isProcessing ? (
                <>
                  <FileText className="h-3 w-3 mr-1 animate-pulse" />
                  Reviewing...
                </>
              ) : (
                <>
                  <FileText className="h-3 w-3 mr-1" />
                  Review Code
                </>
              )}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={`min-w-[280px] ${selected ? 'ring-2 ring-primary' : ''}`}>
      <Handle type="target" position={Position.Top} />
      
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${config.color} text-white`}>
            <IconComponent className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-sm">{codeData.label}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {config.description}
            </p>
          </div>
          {codeData.status && (
            <Badge variant="outline" className={`text-xs ${getStatusColor(codeData.status)}`}>
              {codeData.status}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {renderNodeContent()}
      </CardContent>

      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
};

// Node type registry for React Flow
export const CODE_NODE_TYPES = {
  'code-generator': CodeGenerationNode,
  'code-fixer': CodeGenerationNode,
  'github-repo': CodeGenerationNode,
  'github-pr': CodeGenerationNode,
  'github-deploy': CodeGenerationNode,
  'code-reviewer': CodeGenerationNode,
};

// Utility function to create code generation nodes
export const createCodeNode = (
  id: string,
  nodeType: CodeNodeType,
  label: string,
  position: { x: number; y: number },
  additionalData?: Partial<CodeNodeData>
) => ({
  id,
  type: nodeType,
  position,
  data: {
    label,
    nodeType,
    status: 'idle' as const,
    ...additionalData
  }
});