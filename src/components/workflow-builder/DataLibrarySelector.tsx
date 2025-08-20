import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, Plus, Database, ExternalLink, 
  FileText, Folder, Upload, Download,
  RefreshCw, Settings, Brain
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DataLibrary {
  id: string;
  name: string;
  type: 'knowledge_base' | 'data_source' | 'ai_model' | 'document_library' | 'api_collection';
  description: string;
  category: string;
  provider: string;
  recordCount: number;
  lastUpdated: string;
  isActive: boolean;
  accessLevel: 'public' | 'private' | 'restricted';
  metadata: {
    size?: string;
    format?: string;
    apiVersion?: string;
    capabilities?: string[];
    fields?: string[];
  };
}

interface DataLibrarySelectorProps {
  onLibrariesSelect?: (libraries: DataLibrary[]) => void;
  selectedLibraries?: DataLibrary[];
  mode?: 'select' | 'manage';
  contextFilter?: {
    domain?: string;
    relevantLibraries?: any[];
  };
}

export const DataLibrarySelector: React.FC<DataLibrarySelectorProps> = ({
  onLibrariesSelect,
  selectedLibraries = [],
  mode = 'select'
}) => {
  const [libraries, setLibraries] = useState<DataLibrary[]>([]);
  const [filteredLibraries, setFilteredLibraries] = useState<DataLibrary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  // Mock data - replace with actual API calls
  const mockLibraries: DataLibrary[] = [
    {
      id: '1',
      name: 'Healthcare Knowledge Base',
      type: 'knowledge_base',
      description: 'Comprehensive medical knowledge including treatment protocols, diagnoses, and procedures',
      category: 'Medical Knowledge',
      provider: 'Internal',
      recordCount: 45230,
      lastUpdated: '2024-01-25',
      isActive: true,
      accessLevel: 'private',
      metadata: {
        size: '2.3 GB',
        format: 'Structured Text',
        fields: ['diagnosis', 'treatment', 'symptoms', 'medications', 'procedures']
      }
    },
    {
      id: '2',
      name: 'Patient Records Database',
      type: 'data_source',
      description: 'Anonymized patient data for training and analysis purposes',
      category: 'Patient Data',
      provider: 'EMR System',
      recordCount: 125000,
      lastUpdated: '2024-01-24',
      isActive: true,
      accessLevel: 'restricted',
      metadata: {
        size: '8.7 GB',
        format: 'FHIR R4',
        fields: ['patient_id', 'demographics', 'conditions', 'medications', 'visits']
      }
    },
    {
      id: '3',
      name: 'GPT-4 Medical Specialist',
      type: 'ai_model',
      description: 'Fine-tuned GPT-4 model specialized for medical consultations and diagnosis assistance',
      category: 'AI Model',
      provider: 'OpenAI',
      recordCount: 0,
      lastUpdated: '2024-01-20',
      isActive: true,
      accessLevel: 'private',
      metadata: {
        apiVersion: 'v1',
        capabilities: ['medical_consultation', 'diagnosis_assistance', 'treatment_planning'],
        format: 'API Endpoint'
      }
    },
    {
      id: '4',
      name: 'Clinical Guidelines Library',
      type: 'document_library',
      description: 'Latest clinical guidelines and best practices from medical associations',
      category: 'Clinical Guidelines',
      provider: 'Medical Associations',
      recordCount: 3420,
      lastUpdated: '2024-01-22',
      isActive: true,
      accessLevel: 'public',
      metadata: {
        size: '1.2 GB',
        format: 'PDF, DOC',
        fields: ['guideline_type', 'specialty', 'publication_date', 'source']
      }
    },
    {
      id: '5',
      name: 'Drug Interaction Database',
      type: 'data_source',
      description: 'Comprehensive database of drug interactions, contraindications, and safety information',
      category: 'Pharmaceutical',
      provider: 'FDA',
      recordCount: 89500,
      lastUpdated: '2024-01-23',
      isActive: true,
      accessLevel: 'public',
      metadata: {
        size: '450 MB',
        format: 'Structured Data',
        fields: ['drug_name', 'interactions', 'contraindications', 'side_effects']
      }
    },
    {
      id: '6',
      name: 'Healthcare API Collection',
      type: 'api_collection',
      description: 'Collection of healthcare APIs for data integration and interoperability',
      category: 'Integration',
      provider: 'Multiple',
      recordCount: 25,
      lastUpdated: '2024-01-21',
      isActive: true,
      accessLevel: 'private',
      metadata: {
        apiVersion: 'Various',
        capabilities: ['data_sync', 'real_time_updates', 'standards_compliance'],
        format: 'REST/SOAP APIs'
      }
    }
  ];

  useEffect(() => {
    setLibraries(mockLibraries);
    setFilteredLibraries(mockLibraries);
  }, []);

  useEffect(() => {
    let filtered = libraries.filter(library => {
      const matchesSearch = library.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          library.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || library.type === selectedType;
      const matchesProvider = selectedProvider === 'all' || library.provider === selectedProvider;
      
      return matchesSearch && matchesType && matchesProvider && library.isActive;
    });
    
    setFilteredLibraries(filtered);
  }, [libraries, searchTerm, selectedType, selectedProvider]);

  const getLibraryIcon = (type: DataLibrary['type']) => {
    switch (type) {
      case 'knowledge_base': return <Brain className="h-4 w-4" />;
      case 'data_source': return <Database className="h-4 w-4" />;
      case 'ai_model': return <Settings className="h-4 w-4" />;
      case 'document_library': return <FileText className="h-4 w-4" />;
      case 'api_collection': return <ExternalLink className="h-4 w-4" />;
      default: return <Folder className="h-4 w-4" />;
    }
  };

  const getAccessLevelColor = (level: DataLibrary['accessLevel']) => {
    switch (level) {
      case 'public': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'private': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'restricted': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleLibraryToggle = (libraryId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(libraryId)) {
      newSelected.delete(libraryId);
    } else {
      newSelected.add(libraryId);
    }
    setSelectedItems(newSelected);
    
    if (onLibrariesSelect) {
      const selectedLibrariesList = libraries.filter(library => newSelected.has(library.id));
      onLibrariesSelect(selectedLibrariesList);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const providers = [...new Set(libraries.map(lib => lib.provider))];
  const types = [...new Set(libraries.map(lib => lib.type))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Select Data Libraries</h2>
          <p className="text-muted-foreground">
            Choose from available data sources, AI models, and knowledge bases
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Einstein Data Library
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for libraries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Library Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {providers.map(provider => (
                  <SelectItem key={provider} value={provider}>
                    {provider}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Selected Items Summary */}
      {selectedItems.size > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedItems.size} libraries selected
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedItems(new Set())}
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Libraries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLibraries.map((library) => (
          <Card 
            key={library.id} 
            className={`hover:shadow-md transition-shadow cursor-pointer ${
              selectedItems.has(library.id) ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleLibraryToggle(library.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getLibraryIcon(library.type)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{library.name}</h3>
                    <p className="text-xs text-muted-foreground">{library.provider}</p>
                  </div>
                </div>
                <Checkbox
                  checked={selectedItems.has(library.id)}
                  onCheckedChange={() => handleLibraryToggle(library.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {library.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Badge variant="secondary" className="text-xs">
                    {library.category}
                  </Badge>
                  <Badge className={`text-xs ${getAccessLevelColor(library.accessLevel)}`}>
                    {library.accessLevel}
                  </Badge>
                </div>
                
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Records:</span>
                  <span className="font-medium">{formatNumber(library.recordCount)}</span>
                </div>
                
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Updated:</span>
                  <span className="font-medium">{library.lastUpdated}</span>
                </div>
                
                {library.metadata.size && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Size:</span>
                    <span className="font-medium">{library.metadata.size}</span>
                  </div>
                )}
              </div>

              {library.metadata.fields && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Available Fields:</p>
                  <div className="flex flex-wrap gap-1">
                    {library.metadata.fields.slice(0, 3).map((field, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {field}
                      </Badge>
                    ))}
                    {library.metadata.fields.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{library.metadata.fields.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLibraries.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Libraries Found</h3>
            <p className="text-muted-foreground">
              No data libraries match your current search criteria.
            </p>
            <Button className="mt-4" variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Browse Einstein Data Library
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};