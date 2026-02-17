/**
 * Batch Script Generation Workflow (P3-GEN-01)
 * 5-Phase guided wizard for generating multiple scripts from templates
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Upload, Sparkles, Eye, Download, CheckCircle2, 
  ArrowRight, ArrowLeft, Loader2, AlertCircle, Play, Pause,
  Settings, Wand2, Table, FileJson, FileSpreadsheet, X, Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Types
interface Variable {
  key: string;
  description: string;
  defaultValue?: string;
}

interface VariableRow {
  id: string;
  values: Record<string, string>;
}

interface GeneratedScript {
  id: string;
  title: string;
  content: string;
  variables: Record<string, string>;
  status: 'pending' | 'generating' | 'complete' | 'error';
  error?: string;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'active' | 'complete';
}

// Template presets
const TEMPLATE_PRESETS = [
  { id: 'educational', name: 'Educational Content', description: 'Tutorials, how-tos, explainers', tone: 'informative' },
  { id: 'marketing', name: 'Marketing Video', description: 'Product demos, testimonials, ads', tone: 'persuasive' },
  { id: 'social', name: 'Social Media', description: 'TikTok, Reels, Shorts', tone: 'engaging' },
  { id: 'corporate', name: 'Corporate Training', description: 'Onboarding, compliance, procedures', tone: 'professional' },
  { id: 'healthcare', name: 'Healthcare Education', description: 'Patient education, medical info', tone: 'empathetic' },
  { id: 'custom', name: 'Custom Template', description: 'Start from scratch', tone: 'neutral' },
];

const AI_MODELS = [
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash', description: 'Fast & balanced', recommended: true },
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Best quality' },
  { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', description: 'Cost-effective' },
];

export const BatchScriptGenerationWorkflow: React.FC = () => {
  const { toast } = useToast();
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  
  // Phase 1: Template Selection
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [baseScript, setBaseScript] = useState('');
  
  // Phase 2: Variable Configuration
  const [variables, setVariables] = useState<Variable[]>([
    { key: 'product', description: 'Product or topic name' },
    { key: 'audience', description: 'Target audience' },
    { key: 'duration', description: 'Video length (30s, 60s, 2min)' },
  ]);
  const [variableRows, setVariableRows] = useState<VariableRow[]>([]);
  const [csvData, setCsvData] = useState<string>('');
  
  // Phase 3: AI Settings
  const [selectedModel, setSelectedModel] = useState('google/gemini-3-flash-preview');
  const [creativity, setCreativity] = useState([0.7]);
  const [maxLength, setMaxLength] = useState([500]);
  const [customInstructions, setCustomInstructions] = useState('');
  
  // Phase 4 & 5: Preview & Generation
  const [previewScripts, setPreviewScripts] = useState<GeneratedScript[]>([]);
  const [generatedScripts, setGeneratedScripts] = useState<GeneratedScript[]>([]);

  const steps: WizardStep[] = [
    { id: 'template', title: 'Template Selection', description: 'Choose base template', icon: <FileText className="w-5 h-5" />, status: currentStep > 0 ? 'complete' : currentStep === 0 ? 'active' : 'pending' },
    { id: 'variables', title: 'Variable Configuration', description: 'Define placeholders', icon: <Table className="w-5 h-5" />, status: currentStep > 1 ? 'complete' : currentStep === 1 ? 'active' : 'pending' },
    { id: 'ai-settings', title: 'AI Enhancement', description: 'Configure AI model', icon: <Sparkles className="w-5 h-5" />, status: currentStep > 2 ? 'complete' : currentStep === 2 ? 'active' : 'pending' },
    { id: 'preview', title: 'Review & Approve', description: 'Preview samples', icon: <Eye className="w-5 h-5" />, status: currentStep > 3 ? 'complete' : currentStep === 3 ? 'active' : 'pending' },
    { id: 'generate', title: 'Generate & Export', description: 'Batch generation', icon: <Download className="w-5 h-5" />, status: currentStep === 4 ? 'active' : 'pending' },
  ];

  // Add variable
  const addVariable = () => {
    setVariables([...variables, { key: '', description: '' }]);
  };

  // Remove variable
  const removeVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  // Parse CSV data
  const parseCSV = (csv: string) => {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return;
    
    const headers = lines[0].split(',').map(h => h.trim());
    const rows: VariableRow[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const rowData: Record<string, string> = {};
      headers.forEach((header, idx) => {
        rowData[header] = values[idx] || '';
      });
      rows.push({ id: `row-${i}`, values: rowData });
    }
    
    setVariableRows(rows);
    
    // Update variables from headers
    const newVars = headers.map(h => ({ key: h, description: `Value for ${h}` }));
    setVariables(newVars);
    
    toast({ title: 'CSV Parsed', description: `Found ${rows.length} rows with ${headers.length} variables` });
  };

  // Add manual row
  const addManualRow = () => {
    const newRow: VariableRow = {
      id: `row-${Date.now()}`,
      values: variables.reduce((acc, v) => ({ ...acc, [v.key]: '' }), {}),
    };
    setVariableRows([...variableRows, newRow]);
  };

  // Generate preview scripts (first 3)
  const generatePreviews = async () => {
    if (variableRows.length === 0) {
      toast({ title: 'No data', description: 'Add at least one row of variable values', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    const previews: GeneratedScript[] = [];
    const previewCount = Math.min(3, variableRows.length);

    for (let i = 0; i < previewCount; i++) {
      const row = variableRows[i];
      try {
        const script = await generateSingleScript(row.values);
        previews.push({
          id: row.id,
          title: `Script ${i + 1}: ${row.values[variables[0]?.key] || 'Preview'}`,
          content: script,
          variables: row.values,
          status: 'complete',
        });
      } catch (error) {
        previews.push({
          id: row.id,
          title: `Script ${i + 1}`,
          content: '',
          variables: row.values,
          status: 'error',
          error: error instanceof Error ? error.message : 'Generation failed',
        });
      }
    }

    setPreviewScripts(previews);
    setIsGenerating(false);
    setCurrentStep(3);
  };

  // Generate single script using AI
  const generateSingleScript = async (values: Record<string, string>): Promise<string> => {
    // Replace variables in base script
    let prompt = baseScript;
    Object.entries(values).forEach(([key, value]) => {
      prompt = prompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    });

    const systemPrompt = `You are a professional script writer. Generate a video script based on the template and variables provided.
    
Template type: ${TEMPLATE_PRESETS.find(t => t.id === selectedTemplate)?.name || 'Custom'}
Tone: ${TEMPLATE_PRESETS.find(t => t.id === selectedTemplate)?.tone || 'professional'}
Max length: ${maxLength[0]} words
${customInstructions ? `Additional instructions: ${customInstructions}` : ''}

Generate a complete, ready-to-record script with clear sections, natural dialogue, and engaging content.`;

    const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
      body: {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        model: selectedModel,
        temperature: creativity[0],
        maxTokens: Math.max(maxLength[0] * 2, 1000),
      },
    });

    if (error) throw new Error(error.message);
    return data?.content || data?.response || 'Failed to generate script';
  };

  // Generate all scripts (batch)
  const generateAllScripts = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    const scripts: GeneratedScript[] = [];
    
    for (let i = 0; i < variableRows.length; i++) {
      const row = variableRows[i];
      setGenerationProgress(Math.round(((i + 1) / variableRows.length) * 100));
      
      try {
        const script = await generateSingleScript(row.values);
        scripts.push({
          id: row.id,
          title: `Script ${i + 1}: ${row.values[variables[0]?.key] || 'Generated'}`,
          content: script,
          variables: row.values,
          status: 'complete',
        });
      } catch (error) {
        scripts.push({
          id: row.id,
          title: `Script ${i + 1}`,
          content: '',
          variables: row.values,
          status: 'error',
          error: error instanceof Error ? error.message : 'Generation failed',
        });
      }
    }

    setGeneratedScripts(scripts);
    setIsGenerating(false);
    
    const successCount = scripts.filter(s => s.status === 'complete').length;
    toast({
      title: 'Batch Generation Complete',
      description: `Successfully generated ${successCount}/${scripts.length} scripts`,
    });
  };

  // Export scripts
  const exportScripts = (format: 'json' | 'csv' | 'txt') => {
    const data = generatedScripts.filter(s => s.status === 'complete');
    
    let content = '';
    let filename = `batch-scripts-${Date.now()}`;
    let mimeType = 'text/plain';

    switch (format) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        filename += '.json';
        mimeType = 'application/json';
        break;
      case 'csv':
        const headers = ['Title', ...variables.map(v => v.key), 'Content'];
        const rows = data.map(s => [
          s.title,
          ...variables.map(v => s.variables[v.key] || ''),
          s.content.replace(/,/g, ';').replace(/\n/g, ' '),
        ]);
        content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        filename += '.csv';
        mimeType = 'text/csv';
        break;
      case 'txt':
        content = data.map(s => `=== ${s.title} ===\n\n${s.content}\n\n`).join('\n---\n\n');
        filename += '.txt';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return selectedTemplate && baseScript.length > 20;
      case 1: return variables.length > 0 && variableRows.length > 0;
      case 2: return true;
      case 3: return previewScripts.some(s => s.status === 'complete');
      default: return false;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">Batch Script Generation</h1>
        <p className="text-muted-foreground mt-2">Generate multiple scripts from templates with AI enhancement</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, idx) => (
          <React.Fragment key={step.id}>
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                step.status === 'complete' ? 'bg-green-500/10 text-green-600' :
                step.status === 'active' ? 'bg-primary/10 text-primary' :
                'bg-muted text-muted-foreground'
              }`}
            >
              {step.status === 'complete' ? <CheckCircle2 className="w-5 h-5" /> : step.icon}
              <span className="hidden md:inline text-sm font-medium">{step.title}</span>
            </div>
            {idx < steps.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Phase 1: Template Selection */}
          {currentStep === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" /> Template Selection
                </CardTitle>
                <CardDescription>Choose a template type and provide your base script with variables</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Template Presets */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {TEMPLATE_PRESETS.map(template => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        selectedTemplate === template.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{template.description}</div>
                    </button>
                  ))}
                </div>

                {/* Base Script */}
                <div className="space-y-2">
                  <Label>Base Script Template</Label>
                  <p className="text-xs text-muted-foreground">
                    Use {'{variable_name}'} syntax for placeholders. Example: {'{product}'}, {'{audience}'}
                  </p>
                  <Textarea
                    value={baseScript}
                    onChange={(e) => setBaseScript(e.target.value)}
                    placeholder={`Create an engaging video script about {product} for {audience}.

The video should be {duration} long and cover:
1. Introduction to {product}
2. Key benefits for {audience}
3. Call to action

Make it conversational and easy to understand.`}
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Phase 2: Variable Configuration */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Table className="w-5 h-5" /> Variable Configuration
                </CardTitle>
                <CardDescription>Define variables and provide values for batch generation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="manual">
                  <TabsList>
                    <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                    <TabsTrigger value="csv">Upload CSV</TabsTrigger>
                  </TabsList>

                  <TabsContent value="manual" className="space-y-4">
                    {/* Variables Definition */}
                    <div className="space-y-2">
                      <Label>Variables</Label>
                      {variables.map((v, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            value={v.key}
                            onChange={(e) => {
                              const updated = [...variables];
                              updated[idx].key = e.target.value;
                              setVariables(updated);
                            }}
                            placeholder="Variable name"
                            className="flex-1"
                          />
                          <Input
                            value={v.description}
                            onChange={(e) => {
                              const updated = [...variables];
                              updated[idx].description = e.target.value;
                              setVariables(updated);
                            }}
                            placeholder="Description"
                            className="flex-1"
                          />
                          <Button variant="ghost" size="icon" onClick={() => removeVariable(idx)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={addVariable}>
                        <Plus className="w-4 h-4 mr-2" /> Add Variable
                      </Button>
                    </div>

                    {/* Variable Values */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Variable Values ({variableRows.length} rows)</Label>
                        <Button variant="outline" size="sm" onClick={addManualRow}>
                          <Plus className="w-4 h-4 mr-2" /> Add Row
                        </Button>
                      </div>
                      <ScrollArea className="h-[300px] border rounded-lg p-2">
                        {variableRows.map((row, rowIdx) => (
                          <div key={row.id} className="flex gap-2 mb-2 items-center">
                            <span className="w-8 text-xs text-muted-foreground">{rowIdx + 1}</span>
                            {variables.map(v => (
                              <Input
                                key={v.key}
                                value={row.values[v.key] || ''}
                                onChange={(e) => {
                                  const updated = [...variableRows];
                                  updated[rowIdx].values[v.key] = e.target.value;
                                  setVariableRows(updated);
                                }}
                                placeholder={v.key}
                                className="flex-1"
                              />
                            ))}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setVariableRows(variableRows.filter((_, i) => i !== rowIdx))}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                  </TabsContent>

                  <TabsContent value="csv" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Paste CSV Data</Label>
                      <p className="text-xs text-muted-foreground">
                        First row should be headers matching your variable names
                      </p>
                      <Textarea
                        value={csvData}
                        onChange={(e) => setCsvData(e.target.value)}
                        placeholder={`product,audience,duration
Fitness App,Young professionals,60s
Meditation Guide,Busy parents,2min
Cooking Course,Beginners,30s`}
                        className="min-h-[200px] font-mono text-sm"
                      />
                      <Button onClick={() => parseCSV(csvData)}>
                        <Upload className="w-4 h-4 mr-2" /> Parse CSV
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Phase 3: AI Enhancement Settings */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> AI Enhancement Settings
                </CardTitle>
                <CardDescription>Configure AI model and generation parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Model Selection */}
                <div className="space-y-2">
                  <Label>AI Model</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {AI_MODELS.map(model => (
                      <button
                        key={model.id}
                        onClick={() => setSelectedModel(model.id)}
                        className={`p-4 rounded-lg border text-left transition-all ${
                          selectedModel === model.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{model.name}</span>
                          {model.recommended && <Badge variant="secondary" className="text-xs">Recommended</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{model.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Creativity Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Creativity Level</Label>
                    <span className="text-sm text-muted-foreground">{(creativity[0] * 100).toFixed(0)}%</span>
                  </div>
                  <Slider
                    value={creativity}
                    onValueChange={setCreativity}
                    min={0}
                    max={1}
                    step={0.1}
                  />
                  <p className="text-xs text-muted-foreground">
                    Lower = more consistent, Higher = more creative variations
                  </p>
                </div>

                {/* Max Length */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Max Script Length (words)</Label>
                    <span className="text-sm text-muted-foreground">{maxLength[0]} words</span>
                  </div>
                  <Slider
                    value={maxLength}
                    onValueChange={setMaxLength}
                    min={100}
                    max={2000}
                    step={50}
                  />
                </div>

                {/* Custom Instructions */}
                <div className="space-y-2">
                  <Label>Custom Instructions (Optional)</Label>
                  <Textarea
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="Add specific instructions for the AI, e.g., 'Include a joke in each script' or 'Use simple language for beginners'"
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Phase 4: Review & Approve */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" /> Review & Approve
                </CardTitle>
                <CardDescription>Preview generated scripts before batch generation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {previewScripts.length === 0 ? (
                  <div className="text-center py-8">
                    <Wand2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Click Generate Previews to see sample scripts</p>
                    <Button onClick={generatePreviews} disabled={isGenerating} className="mt-4">
                      {isGenerating ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                      ) : (
                        <><Sparkles className="w-4 h-4 mr-2" /> Generate Previews</>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {previewScripts.map((script, idx) => (
                      <Card key={script.id} className={script.status === 'error' ? 'border-destructive' : ''}>
                        <CardHeader className="py-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">{script.title}</CardTitle>
                            {script.status === 'complete' ? (
                              <Badge className="bg-green-500">Generated</Badge>
                            ) : (
                              <Badge variant="destructive">Error</Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          {script.status === 'complete' ? (
                            <ScrollArea className="h-[200px] border rounded-lg p-3">
                              <pre className="text-sm whitespace-pre-wrap">{script.content}</pre>
                            </ScrollArea>
                          ) : (
                            <p className="text-destructive text-sm">{script.error}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    <Button onClick={generatePreviews} variant="outline" disabled={isGenerating}>
                      <Sparkles className="w-4 h-4 mr-2" /> Regenerate Previews
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Phase 5: Generate & Export */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" /> Generate & Export
                </CardTitle>
                <CardDescription>Generate all {variableRows.length} scripts and export</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {generatedScripts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl font-bold text-primary mb-2">{variableRows.length}</div>
                    <p className="text-muted-foreground mb-4">scripts ready to generate</p>
                    
                    {isGenerating ? (
                      <div className="space-y-4">
                        <Progress value={generationProgress} className="h-3" />
                        <p className="text-sm text-muted-foreground">
                          Generating scripts... {generationProgress}%
                        </p>
                      </div>
                    ) : (
                      <Button onClick={generateAllScripts} size="lg">
                        <Play className="w-5 h-5 mr-2" /> Start Batch Generation
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-green-600 font-medium">
                          {generatedScripts.filter(s => s.status === 'complete').length}
                        </span>
                        <span className="text-muted-foreground"> scripts generated successfully</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => exportScripts('json')}>
                          <FileJson className="w-4 h-4 mr-2" /> JSON
                        </Button>
                        <Button variant="outline" onClick={() => exportScripts('csv')}>
                          <FileSpreadsheet className="w-4 h-4 mr-2" /> CSV
                        </Button>
                        <Button onClick={() => exportScripts('txt')}>
                          <Download className="w-4 h-4 mr-2" /> TXT
                        </Button>
                      </div>
                    </div>
                    
                    <ScrollArea className="h-[400px]">
                      {generatedScripts.map(script => (
                        <Card key={script.id} className="mb-2">
                          <CardHeader className="py-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{script.title}</span>
                              {script.status === 'complete' ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-destructive" />
                              )}
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Previous
        </Button>
        
        {currentStep < 4 ? (
          <Button
            onClick={() => {
              if (currentStep === 2) {
                generatePreviews();
              } else {
                setCurrentStep(currentStep + 1);
              }
            }}
            disabled={!canProceed()}
          >
            {currentStep === 2 ? 'Generate Previews' : 'Next'} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={() => setCurrentStep(0)} variant="outline">
            Start New Batch
          </Button>
        )}
      </div>
    </div>
  );
};

export default BatchScriptGenerationWorkflow;
