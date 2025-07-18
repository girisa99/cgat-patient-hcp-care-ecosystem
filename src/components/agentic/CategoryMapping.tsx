import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CategoryMappingProps {
  selectedCategories: string[];
  selectedBusinessUnits: string[];
  selectedTopics: string[];
  onCategoriesChange: (categories: string[]) => void;
  onBusinessUnitsChange: (units: string[]) => void;
  onTopicsChange: (topics: string[]) => void;
}

const DEFAULT_CATEGORIES = [
  'Patient onboarding',
  'Provider and Treatment center onboarding and credentialing',
  'Market access - Reimbursement - Prior Authorization, Insurance eligibility, Prior Authorization, Copay assistance, Alternative funding, Travel and logistics',
  'Distribution - Delivery/Fulfillment',
  'Manufacturing - Order confirmation, batch process',
  'Claims management - Submit claims',
  'Clinical information - ICD 9,10,11, HCPCS codes',
  'Product information - NDC codes, Dosage, strength, dose schedules',
  'Packaging - Label and Adverse Events',
  'Scheduling - appointments, communications',
  'Buy to build - Order confirmation and order details'
];

const DEFAULT_BUSINESS_UNITS = [
  'Commercial',
  'R&D',
  'Supply chain',
  'IT',
  'Manufacturing',
  'Compliance'
];

const DEFAULT_TOPICS = {
  'Commercial': ['Market access'],
  'R&D': ['Clinical data management'],
  'Supply chain': [],
  'IT': ['Service now', 'Dev Ops', 'Jira'],
  'Manufacturing': ['Batch process', 'Order confirmation', 'Fulfillment'],
  'Compliance': ['21 CFR Part 11']
};

export const CategoryMapping: React.FC<CategoryMappingProps> = ({
  selectedCategories,
  selectedBusinessUnits,
  selectedTopics,
  onCategoriesChange,
  onBusinessUnitsChange,
  onTopicsChange
}) => {
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [businessUnits, setBusinessUnits] = useState<string[]>(DEFAULT_BUSINESS_UNITS);
  const [topics, setTopics] = useState<{ [key: string]: string[] }>(DEFAULT_TOPICS);
  const [newCategory, setNewCategory] = useState('');
  const [newBusinessUnit, setNewBusinessUnit] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [selectedBusinessUnitForTopic, setSelectedBusinessUnitForTopic] = useState('');
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    categories: true,
    businessUnits: true,
    topics: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const addNewCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const updated = [...categories, newCategory.trim()];
      setCategories(updated);
      setNewCategory('');
      toast({
        title: 'Success',
        description: 'New category added successfully'
      });
    }
  };

  const addNewBusinessUnit = () => {
    if (newBusinessUnit.trim() && !businessUnits.includes(newBusinessUnit.trim())) {
      const updated = [...businessUnits, newBusinessUnit.trim()];
      setBusinessUnits(updated);
      setTopics(prev => ({ ...prev, [newBusinessUnit.trim()]: [] }));
      setNewBusinessUnit('');
      toast({
        title: 'Success',
        description: 'New business unit added successfully'
      });
    }
  };

  const addNewTopic = () => {
    if (newTopic.trim() && selectedBusinessUnitForTopic && 
        !topics[selectedBusinessUnitForTopic]?.includes(newTopic.trim())) {
      const updated = {
        ...topics,
        [selectedBusinessUnitForTopic]: [...(topics[selectedBusinessUnitForTopic] || []), newTopic.trim()]
      };
      setTopics(updated);
      setNewTopic('');
      toast({
        title: 'Success',
        description: `New topic added to ${selectedBusinessUnitForTopic}`
      });
    }
  };

  const removeCategory = (category: string) => {
    setCategories(prev => prev.filter(c => c !== category));
    onCategoriesChange(selectedCategories.filter(c => c !== category));
  };

  const removeBusinessUnit = (unit: string) => {
    setBusinessUnits(prev => prev.filter(u => u !== unit));
    setTopics(prev => {
      const updated = { ...prev };
      delete updated[unit];
      return updated;
    });
    onBusinessUnitsChange(selectedBusinessUnits.filter(u => u !== unit));
  };

  const removeTopic = (businessUnit: string, topic: string) => {
    setTopics(prev => ({
      ...prev,
      [businessUnit]: prev[businessUnit]?.filter(t => t !== topic) || []
    }));
    onTopicsChange(selectedTopics.filter(t => t !== topic));
  };

  const toggleCategorySelection = (category: string) => {
    const isSelected = selectedCategories.includes(category);
    if (isSelected) {
      onCategoriesChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  const toggleBusinessUnitSelection = (unit: string) => {
    const isSelected = selectedBusinessUnits.includes(unit);
    if (isSelected) {
      onBusinessUnitsChange(selectedBusinessUnits.filter(u => u !== unit));
    } else {
      onBusinessUnitsChange([...selectedBusinessUnits, unit]);
    }
  };

  const toggleTopicSelection = (topic: string) => {
    const isSelected = selectedTopics.includes(topic);
    if (isSelected) {
      onTopicsChange(selectedTopics.filter(t => t !== topic));
    } else {
      onTopicsChange([...selectedTopics, topic]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Category Mapping</h3>
        <p className="text-muted-foreground">
          Map categories to business units and topics to organize your agent's capabilities
        </p>
      </div>

      {/* Categories Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('categories')}
                className="p-0 h-auto"
              >
                {expandedSections.categories ? 
                  <ChevronDown className="h-4 w-4" /> : 
                  <ChevronRight className="h-4 w-4" />
                }
              </Button>
              Categories
              <Badge variant="secondary">{selectedCategories.length} selected</Badge>
            </CardTitle>
          </div>
        </CardHeader>
        {expandedSections.categories && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categories.map((category) => (
                <div key={category} className="flex items-center gap-2">
                  <Card 
                    className={`flex-1 cursor-pointer transition-all ${
                      selectedCategories.includes(category) 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => toggleCategorySelection(category)}
                  >
                    <CardContent className="p-3">
                      <div className="text-sm font-medium">{category}</div>
                    </CardContent>
                  </Card>
                  {!DEFAULT_CATEGORIES.includes(category) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCategory(category)}
                      className="text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Add new category..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addNewCategory()}
              />
              <Button onClick={addNewCategory} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Business Units Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('businessUnits')}
                className="p-0 h-auto"
              >
                {expandedSections.businessUnits ? 
                  <ChevronDown className="h-4 w-4" /> : 
                  <ChevronRight className="h-4 w-4" />
                }
              </Button>
              Business Units
              <Badge variant="secondary">{selectedBusinessUnits.length} selected</Badge>
            </CardTitle>
          </div>
        </CardHeader>
        {expandedSections.businessUnits && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {businessUnits.map((unit) => (
                <div key={unit} className="flex items-center gap-2">
                  <Card 
                    className={`flex-1 cursor-pointer transition-all ${
                      selectedBusinessUnits.includes(unit) 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => toggleBusinessUnitSelection(unit)}
                  >
                    <CardContent className="p-3">
                      <div className="text-sm font-medium text-center">{unit}</div>
                    </CardContent>
                  </Card>
                  {!DEFAULT_BUSINESS_UNITS.includes(unit) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBusinessUnit(unit)}
                      className="text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Add new business unit..."
                value={newBusinessUnit}
                onChange={(e) => setNewBusinessUnit(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addNewBusinessUnit()}
              />
              <Button onClick={addNewBusinessUnit} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Topics Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection('topics')}
                className="p-0 h-auto"
              >
                {expandedSections.topics ? 
                  <ChevronDown className="h-4 w-4" /> : 
                  <ChevronRight className="h-4 w-4" />
                }
              </Button>
              Topics by Business Unit
              <Badge variant="secondary">{selectedTopics.length} selected</Badge>
            </CardTitle>
          </div>
        </CardHeader>
        {expandedSections.topics && (
          <CardContent className="space-y-4">
            {businessUnits.map((unit) => (
              <div key={unit} className="space-y-2">
                <Label className="text-sm font-medium text-primary">{unit}</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {topics[unit]?.map((topic) => (
                    <div key={topic} className="flex items-center gap-2">
                      <Card 
                        className={`flex-1 cursor-pointer transition-all ${
                          selectedTopics.includes(topic) 
                            ? 'ring-2 ring-primary bg-primary/5' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => toggleTopicSelection(topic)}
                      >
                        <CardContent className="p-2">
                          <div className="text-xs font-medium">{topic}</div>
                        </CardContent>
                      </Card>
                      {!DEFAULT_TOPICS[unit]?.includes(topic) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTopic(unit, topic)}
                          className="text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )) || (
                    <p className="text-xs text-muted-foreground col-span-full">No topics for this business unit</p>
                  )}
                </div>
              </div>
            ))}
            
            <div className="space-y-2">
              <Label htmlFor="businessUnitSelect">Add Topic to Business Unit</Label>
              <div className="flex gap-2">
                <select
                  id="businessUnitSelect"
                  value={selectedBusinessUnitForTopic}
                  onChange={(e) => setSelectedBusinessUnitForTopic(e.target.value)}
                  className="flex h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">Select business unit</option>
                  {businessUnits.map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
                <Input
                  placeholder="Add new topic..."
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addNewTopic()}
                  disabled={!selectedBusinessUnitForTopic}
                />
                <Button 
                  onClick={addNewTopic} 
                  size="sm" 
                  disabled={!selectedBusinessUnitForTopic || !newTopic.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Summary */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Selection Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="font-medium">Categories:</span> {selectedCategories.length > 0 ? selectedCategories.join(', ') : 'None selected'}
          </div>
          <div>
            <span className="font-medium">Business Units:</span> {selectedBusinessUnits.length > 0 ? selectedBusinessUnits.join(', ') : 'None selected'}
          </div>
          <div>
            <span className="font-medium">Topics:</span> {selectedTopics.length > 0 ? selectedTopics.join(', ') : 'None selected'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};