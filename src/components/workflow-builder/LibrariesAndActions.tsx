import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Package, Zap, Calculator, Database, Globe, Code, 
  Search, Plus, Star, Download, Book, Settings,
  Filter, Tag, Clock, TrendingUp, Shield, Workflow
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';

interface Library {
  id: string;
  name: string;
  description: string;
  version: string;
  category: 'utility' | 'ai' | 'data' | 'api' | 'ui' | 'security';
  rating: number;
  downloads: number;
  author: string;
  tags: string[];
  documentation: string;
  examples: any[];
  isInstalled: boolean;
  isCore: boolean;
}

interface DefaultAction {
  id: string;
  name: string;
  description: string;
  type: 'transform' | 'validate' | 'calculate' | 'request' | 'condition' | 'loop';
  category: string;
  inputs: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  outputs: Array<{
    name: string;
    type: string;
    description: string;
  }>;
  code: string;
  isCustom: boolean;
  usage: number;
}

interface Operator {
  id: string;
  name: string;
  symbol: string;
  description: string;
  category: 'arithmetic' | 'comparison' | 'logical' | 'string' | 'array' | 'object';
  syntax: string;
  examples: string[];
}

export const LibrariesAndActions: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('libraries');
  const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null);

  // Mock data - in real implementation, these would come from APIs
  const mockLibraries: Library[] = [
    {
      id: '1',
      name: 'Healthcare Utilities',
      description: 'Essential utilities for healthcare workflow automation',
      version: '2.1.0',
      category: 'utility',
      rating: 4.8,
      downloads: 12500,
      author: 'HealthTech Inc',
      tags: ['healthcare', 'validation', 'conversion'],
      documentation: 'https://docs.healthtech.com',
      examples: [],
      isInstalled: true,
      isCore: true
    },
    {
      id: '2',
      name: 'AI Model Connectors',
      description: 'Connect to various AI models and services',
      version: '1.5.2',
      category: 'ai',
      rating: 4.6,
      downloads: 8900,
      author: 'AI Solutions',
      tags: ['ai', 'llm', 'integration'],
      documentation: 'https://docs.ai-solutions.com',
      examples: [],
      isInstalled: false,
      isCore: false
    },
    {
      id: '3',
      name: 'Data Transformation Suite',
      description: 'Comprehensive data transformation and validation tools',
      version: '3.0.1',
      category: 'data',
      rating: 4.9,
      downloads: 15600,
      author: 'DataFlow Corp',
      tags: ['data', 'etl', 'validation'],
      documentation: 'https://docs.dataflow.com',
      examples: [],
      isInstalled: true,
      isCore: false
    }
  ];

  const mockActions: DefaultAction[] = [
    {
      id: '1',
      name: 'Format Patient ID',
      description: 'Standardize patient ID format across systems',
      type: 'transform',
      category: 'Healthcare',
      inputs: [
        { name: 'patientId', type: 'string', required: true, description: 'Raw patient ID' },
        { name: 'format', type: 'string', required: false, description: 'Target format pattern' }
      ],
      outputs: [
        { name: 'formattedId', type: 'string', description: 'Standardized patient ID' }
      ],
      code: `function formatPatientId(patientId, format = 'PAT-{id}') {
  const cleanId = patientId.replace(/[^0-9]/g, '');
  return format.replace('{id}', cleanId.padStart(6, '0'));
}`,
      isCustom: false,
      usage: 450
    },
    {
      id: '2',
      name: 'Validate Email',
      description: 'Validate email address format and domain',
      type: 'validate',
      category: 'Validation',
      inputs: [
        { name: 'email', type: 'string', required: true, description: 'Email address to validate' }
      ],
      outputs: [
        { name: 'isValid', type: 'boolean', description: 'Validation result' },
        { name: 'errors', type: 'array', description: 'List of validation errors' }
      ],
      code: `function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  const errors = [];
  
  if (!isValid) {
    errors.push('Invalid email format');
  }
  
  return { isValid, errors };
}`,
      isCustom: false,
      usage: 890
    },
    {
      id: '3',
      name: 'Calculate Age',
      description: 'Calculate age from date of birth',
      type: 'calculate',
      category: 'Healthcare',
      inputs: [
        { name: 'dateOfBirth', type: 'string', required: true, description: 'Date of birth (YYYY-MM-DD)' }
      ],
      outputs: [
        { name: 'age', type: 'number', description: 'Age in years' },
        { name: 'ageInMonths', type: 'number', description: 'Age in months' }
      ],
      code: `function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  const age = today.getFullYear() - birthDate.getFullYear();
  const ageInMonths = age * 12 + (today.getMonth() - birthDate.getMonth());
  
  return { age, ageInMonths };
}`,
      isCustom: false,
      usage: 320
    }
  ];

  const mockOperators: Operator[] = [
    {
      id: '1',
      name: 'Equals',
      symbol: '==',
      description: 'Compare two values for equality',
      category: 'comparison',
      syntax: 'value1 == value2',
      examples: ['age == 25', 'status == "active"']
    },
    {
      id: '2',
      name: 'Greater Than',
      symbol: '>',
      description: 'Check if first value is greater than second',
      category: 'comparison',
      syntax: 'value1 > value2',
      examples: ['score > 80', 'temperature > 98.6']
    },
    {
      id: '3',
      name: 'Contains',
      symbol: 'includes',
      description: 'Check if string contains substring',
      category: 'string',
      syntax: 'string.includes(substring)',
      examples: ['name.includes("John")', 'email.includes("@gmail.com")']
    },
    {
      id: '4',
      name: 'And',
      symbol: '&&',
      description: 'Logical AND operation',
      category: 'logical',
      syntax: 'condition1 && condition2',
      examples: ['age > 18 && status == "active"', 'hasInsurance && isPreApproved']
    }
  ];

  const LibraryCard = ({ library }: { library: Library }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-primary" />
              <h4 className="font-medium text-sm">{library.name}</h4>
              {library.isCore && (
                <Badge variant="secondary" className="text-xs">Core</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {library.description}
            </p>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                v{library.version}
              </Badge>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs">{library.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Download className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs">{library.downloads.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {library.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            by {library.author}
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
              <Book className="h-3 w-3 mr-1" />
              Docs
            </Button>
            {library.isInstalled ? (
              <Badge variant="default" className="text-xs">Installed</Badge>
            ) : (
              <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
                Install
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ActionCard = ({ action }: { action: DefaultAction }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-primary" />
              <h4 className="font-medium text-sm">{action.name}</h4>
              <Badge variant="outline" className="text-xs">
                {action.type}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {action.description}
            </p>
            <div className="flex items-center gap-4 mb-2 text-xs text-muted-foreground">
              <span>Inputs: {action.inputs.length}</span>
              <span>Outputs: {action.outputs.length}</span>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>{action.usage} uses</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {action.category}
          </Badge>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
              <Code className="h-3 w-3 mr-1" />
              View Code
            </Button>
            <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
              <Plus className="h-3 w-3 mr-1" />
              Use
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const OperatorCard = ({ operator }: { operator: Operator }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Calculator className="h-4 w-4 text-primary" />
              <h4 className="font-medium text-sm">{operator.name}</h4>
              <Badge variant="outline" className="text-xs font-mono">
                {operator.symbol}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {operator.description}
            </p>
            <div className="bg-muted p-2 rounded text-xs font-mono mb-2">
              {operator.syntax}
            </div>
            <div className="space-y-1">
              {operator.examples.slice(0, 2).map((example, index) => (
                <div key={index} className="text-xs text-muted-foreground font-mono bg-muted/50 p-1 rounded">
                  {example}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {operator.category}
          </Badge>
          <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
            <Plus className="h-3 w-3 mr-1" />
            Use
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Package className="h-4 w-4" />
            Libraries & Actions
          </CardTitle>
          <Button size="sm" variant="outline" className="h-8">
            <Plus className="h-3 w-3 mr-1" />
            Create Custom
          </Button>
        </div>
        
        {/* Search and Filters */}
        <div className="flex gap-2 mt-3">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search libraries, actions, operators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 h-8 text-xs"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="ai">AI & ML</SelectItem>
              <SelectItem value="data">Data</SelectItem>
              <SelectItem value="api">API</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-3 h-8 mx-4 mb-2">
            <TabsTrigger value="libraries" className="text-xs">Libraries</TabsTrigger>
            <TabsTrigger value="actions" className="text-xs">Actions</TabsTrigger>
            <TabsTrigger value="operators" className="text-xs">Operators</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="p-4">
              <TabsContent value="libraries" className="mt-0 space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium">Available Libraries</h4>
                  <Badge variant="secondary" className="text-xs">
                    {mockLibraries.length} libraries
                  </Badge>
                </div>
                <div className="grid gap-3">
                  {mockLibraries.map((library) => (
                    <LibraryCard key={library.id} library={library} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="actions" className="mt-0 space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium">Default Actions</h4>
                  <Badge variant="secondary" className="text-xs">
                    {mockActions.length} actions
                  </Badge>
                </div>
                <div className="grid gap-3">
                  {mockActions.map((action) => (
                    <ActionCard key={action.id} action={action} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="operators" className="mt-0 space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium">Available Operators</h4>
                  <Badge variant="secondary" className="text-xs">
                    {mockOperators.length} operators
                  </Badge>
                </div>
                <div className="grid gap-3">
                  {mockOperators.map((operator) => (
                    <OperatorCard key={operator.id} operator={operator} />
                  ))}
                </div>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
};