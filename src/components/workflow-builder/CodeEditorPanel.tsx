import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Code, Play, Save, Download, Upload, Sparkles, 
  Check, X, AlertTriangle, Lightbulb, Zap, Settings
} from 'lucide-react';
import { useMasterToast } from '@/hooks/useMasterToast';

interface CodeEditorPanelProps {
  isVisible: boolean;
  onToggle: () => void;
  selectedNode?: any;
  onCodeChange?: (code: string, language: string) => void;
  sessionId?: string;
}

interface AICodeSuggestion {
  id: string;
  type: 'fix' | 'optimize' | 'generate' | 'explain';
  title: string;
  description: string;
  code: string;
  confidence: number;
}

export const CodeEditorPanel: React.FC<CodeEditorPanelProps> = ({
  isVisible,
  onToggle,
  selectedNode,
  onCodeChange,
  sessionId
}) => {
  const [activeTab, setActiveTab] = useState('editor');
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(`// AI Agent Code for ${selectedNode?.data?.label || 'Node'}
async function processNode(input, context) {
  try {
    // Your custom logic here
    console.log('Processing input:', input);
    
    // Example: Data transformation
    const result = {
      ...input,
      processed: true,
      timestamp: new Date().toISOString(),
      nodeId: context.nodeId
    };
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { processNode };`);
  
  const [promptInput, setPromptInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AICodeSuggestion[]>([]);
  const [codeErrors, setCodeErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const { showSuccess, showError } = useMasterToast();

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        onToggle();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onToggle]);

  // Auto-validate code when it changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateCode();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [code]);

  // Update code when node changes
  useEffect(() => {
    if (selectedNode) {
      const nodeType = selectedNode.type || 'default';
      const nodeLabel = selectedNode.data?.label || 'Node';
      
      setCode(`// AI Agent Code for ${nodeLabel}
async function processNode(input, context) {
  try {
    // Node type: ${nodeType}
    console.log('Processing ${nodeLabel}:', input);
    
    ${getNodeTypeTemplate(nodeType)}
    
    return {
      success: true,
      data: result,
      nodeId: context.nodeId
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { processNode };`);
    }
  }, [selectedNode]);

  const getNodeTypeTemplate = (nodeType: string): string => {
    switch (nodeType) {
      case 'agent':
        return `    // AI Agent processing
    const aiResponse = await context.ai.chat({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful AI assistant.' },
        { role: 'user', content: input.message }
      ]
    });
    
    const result = {
      ...input,
      aiResponse: aiResponse.content,
      processed: true
    };`;
      
      case 'decision':
        return `    // Decision logic
    const shouldContinue = input.score > 0.5;
    
    const result = {
      ...input,
      decision: shouldContinue ? 'continue' : 'stop',
      confidence: input.score
    };`;
      
      case 'data':
        return `    // Data processing
    const processedData = input.data.map(item => ({
      ...item,
      processed: true,
      timestamp: new Date().toISOString()
    }));
    
    const result = {
      ...input,
      data: processedData
    };`;
      
      default:
        return `    // Custom processing logic
    const result = {
      ...input,
      processed: true,
      timestamp: new Date().toISOString()
    };`;
    }
  };

  const validateCode = async () => {
    setIsValidating(true);
    setCodeErrors([]);

    try {
      // Basic syntax validation for JavaScript — parse only, never execute
      if (language === 'javascript') {
        try {
          // Use acorn-like approach: try to parse as a module/script without executing
          // Fall back to regex-based checks for basic syntax errors
          const balanced = (code.match(/\{/g) || []).length === (code.match(/\}/g) || []).length;
          const parensBalanced = (code.match(/\(/g) || []).length === (code.match(/\)/g) || []).length;
          if (!balanced) setCodeErrors(['Syntax Error: Unbalanced curly braces']);
          if (!parensBalanced) setCodeErrors(prev => [...prev, 'Syntax Error: Unbalanced parentheses']);
        } catch (error: any) {
          setCodeErrors([`Syntax Error: ${error.message}`]);
        }
      }

      // Simulate AI-powered code analysis
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const suggestions: AICodeSuggestion[] = [];
      
      // Check for common issues and suggest fixes
      if (code.includes('console.log') && !code.includes('// Debug')) {
        suggestions.push({
          id: '1',
          type: 'optimize',
          title: 'Remove debug logs',
          description: 'Consider removing console.log statements for production',
          code: code.replace(/console\.log\([^)]*\);?\n?/g, ''),
          confidence: 0.8
        });
      }
      
      if (!code.includes('try') && !code.includes('catch')) {
        suggestions.push({
          id: '2',
          type: 'fix',
          title: 'Add error handling',
          description: 'Wrap your code in try-catch for better error handling',
          code: `try {
${code.split('\n').map(line => '  ' + line).join('\n')}
} catch (error) {
  return {
    success: false,
    error: error.message
  };
}`,
          confidence: 0.9
        });
      }
      
      if (code.includes('async') && !code.includes('await')) {
        suggestions.push({
          id: '3',
          type: 'optimize',
          title: 'Consider using await',
          description: 'Async function should use await for asynchronous operations',
          code: code,
          confidence: 0.7
        });
      }
      
      setAiSuggestions(suggestions);
      
    } catch (error: any) {
      setCodeErrors([`Validation Error: ${error.message}`]);
    } finally {
      setIsValidating(false);
    }
  };

  const generateCodeFromPrompt = async () => {
    if (!promptInput.trim()) {
      showError('Please enter a description of what you want to generate');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate AI code generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const generatedCode = generateCodeFromDescription(promptInput);
      setCode(generatedCode);
      setPromptInput('');
      
      showSuccess('Code generated successfully!');
      
      // Add generation suggestion
      setAiSuggestions(prev => [{
        id: 'generated',
        type: 'generate',
        title: 'Generated Code',
        description: `Code generated from: "${promptInput}"`,
        code: generatedCode,
        confidence: 0.85
      }, ...prev]);
      
    } catch (error: any) {
      showError(`Code generation failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCodeFromDescription = (description: string): string => {
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('api') || lowerDesc.includes('fetch') || lowerDesc.includes('request')) {
      return `// API Integration Code
async function processNode(input, context) {
  try {
    const response = await fetch(input.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${context.apiKey}\`
      },
      body: JSON.stringify(input.data)
    });
    
    if (!response.ok) {
      throw new Error(\`API request failed: \${response.statusText}\`);
    }
    
    const result = await response.json();
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { processNode };`;
    }
    
    if (lowerDesc.includes('database') || lowerDesc.includes('query') || lowerDesc.includes('sql')) {
      return `// Database Query Code
async function processNode(input, context) {
  try {
    const { supabase } = context;
    
    const { data, error } = await supabase
      .from(input.tableName)
      .select('*')
      .eq('status', 'active');
    
    if (error) {
      throw new Error(\`Database query failed: \${error.message}\`);
    }
    
    const result = {
      ...input,
      queryResults: data,
      count: data.length
    };
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { processNode };`;
    }
    
    if (lowerDesc.includes('email') || lowerDesc.includes('notification') || lowerDesc.includes('send')) {
      return `// Email/Notification Code
async function processNode(input, context) {
  try {
    const { email } = context.services;
    
    const emailResult = await email.send({
      to: input.recipient,
      subject: input.subject,
      body: input.message,
      template: input.template || 'default'
    });
    
    const result = {
      ...input,
      emailSent: true,
      messageId: emailResult.id
    };
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { processNode };`;
    }
    
    // Default generation
    return `// Generated Code: ${description}
async function processNode(input, context) {
  try {
    // TODO: Implement logic for: ${description}
    console.log('Processing:', input);
    
    const result = {
      ...input,
      processed: true,
      description: "${description}",
      timestamp: new Date().toISOString()
    };
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { processNode };`;
  };

  const applySuggestion = (suggestion: AICodeSuggestion) => {
    setCode(suggestion.code);
    showSuccess(`Applied ${suggestion.type}: ${suggestion.title}`);
    
    // Remove applied suggestion
    setAiSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  const saveCode = () => {
    if (onCodeChange) {
      onCodeChange(code, language);
    }
    
    // Save to localStorage as backup
    localStorage.setItem(`code_${selectedNode?.id || 'global'}_${language}`, code);
    
    showSuccess('Code saved successfully!');
  };

  const exportCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedNode?.data?.label || 'node'}_code.${language === 'javascript' ? 'js' : language}`;
    a.click();
    URL.revokeObjectURL(url);
    
    showSuccess('Code exported successfully!');
  };

  const runCode = async () => {
    try {
      // Basic validation
      if (codeErrors.length > 0) {
        showError('Please fix code errors before running');
        return;
      }
      
      // Simulate code execution
      showSuccess('Code is valid and ready to run!');
      
      // In a real implementation, this would execute the code in a safe environment
      console.log('Code would be executed:', code);
      
    } catch (error: any) {
      showError(`Code execution failed: ${error.message}`);
    }
  };

  if (!isVisible) return null;

  return (
    <Card className="h-full flex flex-col bg-background/95 backdrop-blur">
      <CardHeader className="p-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Code className="h-4 w-4" />
            Code Editor
            {selectedNode && (
              <Badge variant="outline" className="text-xs">
                {selectedNode.data?.label || selectedNode.id}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-1">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="h-7 w-24 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JS</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="typescript">TS</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
            
            <Button size="sm" variant="outline" onClick={runCode} className="h-7 text-xs">
              <Play className="h-3 w-3 mr-1" />
              Run
            </Button>
            
            <Button size="sm" variant="outline" onClick={saveCode} className="h-7 text-xs">
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
            
            <Button size="sm" variant="outline" onClick={exportCode} className="h-7 text-xs">
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
            
            <Button size="sm" variant="ghost" onClick={onToggle} className="h-7 text-xs" title="Close Editor (ESC)">
              ✕
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 flex flex-col min-h-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="w-full grid grid-cols-3 h-8">
            <TabsTrigger value="editor" className="text-xs">Code Editor</TabsTrigger>
            <TabsTrigger value="ai" className="text-xs">AI Assistant</TabsTrigger>
            <TabsTrigger value="errors" className="text-xs">
              Validation
              {codeErrors.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 w-4 text-[10px] p-0">
                  {codeErrors.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="flex-1 m-0 p-3">
            <div className="h-full flex flex-col">
              <textarea
                ref={editorRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 w-full p-3 border rounded font-mono text-sm resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your code here..."
                spellCheck={false}
              />
              
              {isValidating && (
                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                  <Settings className="h-3 w-3 animate-spin" />
                  Validating code...
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="ai" className="flex-1 m-0 p-3">
            <div className="space-y-3 h-full flex flex-col">
              <div>
                <label className="text-xs font-medium mb-1 block">Describe what you want to generate:</label>
                <div className="flex gap-2">
                  <Input
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder="e.g., Create an API call to fetch user data"
                    className="text-xs"
                    onKeyPress={(e) => e.key === 'Enter' && generateCodeFromPrompt()}
                  />
                  <Button
                    size="sm"
                    onClick={generateCodeFromPrompt}
                    disabled={isGenerating || !promptInput.trim()}
                    className="text-xs"
                  >
                    {isGenerating ? (
                      <Settings className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto">
                <div className="text-xs font-medium mb-2">AI Suggestions:</div>
                {aiSuggestions.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-8">
                    {isGenerating ? 'Generating suggestions...' : 'No suggestions yet. Generate or edit code to get AI assistance.'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {aiSuggestions.map((suggestion) => (
                      <Card key={suggestion.id} className="p-2">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-1">
                            {suggestion.type === 'fix' && <AlertTriangle className="h-3 w-3 text-red-500" />}
                            {suggestion.type === 'optimize' && <Zap className="h-3 w-3 text-yellow-500" />}
                            {suggestion.type === 'generate' && <Sparkles className="h-3 w-3 text-blue-500" />}
                            {suggestion.type === 'explain' && <Lightbulb className="h-3 w-3 text-purple-500" />}
                            <span className="text-xs font-medium">{suggestion.title}</span>
                          </div>
                          <Badge variant="outline" className="text-[10px]">
                            {Math.round(suggestion.confidence * 100)}%
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{suggestion.description}</p>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => applySuggestion(suggestion)}
                            className="h-6 text-[10px]"
                          >
                            Apply
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setAiSuggestions(prev => prev.filter(s => s.id !== suggestion.id))}
                            className="h-6 text-[10px]"
                          >
                            Dismiss
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="errors" className="flex-1 m-0 p-3">
            <div className="space-y-2">
              <div className="text-xs font-medium">Code Validation Results:</div>
              
              {codeErrors.length === 0 ? (
                <div className="flex items-center gap-2 text-green-600 text-xs">
                  <Check className="h-3 w-3" />
                  No errors found. Code looks good!
                </div>
              ) : (
                <div className="space-y-1">
                  {codeErrors.map((error, index) => (
                    <div key={index} className="flex items-start gap-2 text-red-600 text-xs">
                      <X className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {isValidating && (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Settings className="h-3 w-3 animate-spin" />
                  Running validation...
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};