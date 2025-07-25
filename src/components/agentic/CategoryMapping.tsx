import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, ChevronDown, ChevronUp, UserX } from 'lucide-react';
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
  'Onboarding and Credentaling',
  'Market access',
  'Distribution',
  'Manufacturing',
  'Claims Management',
  'Clinical information',
  'Product Information',
  'Packaging',
  'Scheduling',
  'Buy & Build',
  'Insurance',
  'Prior Authorization',
  'Compliance & Regulatory'
];

const DEFAULT_BUSINESS_UNITS = [
  'Commercial',
  'Research & Development',
  'Supply Chain',
  'IT',
  'Manufacturing',
  'Compliance',
  'Finance',
  'HR'
];

const DEFAULT_TOPICS = [
  'Patient onboarding',
  'Treatment center',
  'Provider onboarding',
  'Pharma/Biotech onboarding',
  'Eligibility Investigation',
  'Eligibility Verification',
  'Delivery/Fulfillment',
  'Label & Adverse Events',
  'Product details',
  'Billing & Coding',
  'Appointments scheduling and communication',
  '21 CFR Part 11'
];

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
  const [topics, setTopics] = useState<string[]>(DEFAULT_TOPICS);
  const [newCategory, setNewCategory] = useState('');
  const [newBusinessUnit, setNewBusinessUnit] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [openDropdowns, setOpenDropdowns] = useState<{
    categories: boolean;
    businessUnits: boolean;
    topics: boolean;
  }>({
    categories: false,
    businessUnits: false,
    topics: false
  });
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddBusinessUnit, setShowAddBusinessUnit] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);


  const removeCategory = (category: string) => {
    setCategories(prev => prev.filter(c => c !== category));
    onCategoriesChange(selectedCategories.filter(c => c !== category));
  };

  const removeBusinessUnit = (unit: string) => {
    setBusinessUnits(prev => prev.filter(u => u !== unit));
    onBusinessUnitsChange(selectedBusinessUnits.filter(u => u !== unit));
  };

  const removeTopic = (topic: string) => {
    setTopics(prev => prev.filter(t => t !== topic));
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

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const updated = [...categories, newCategory.trim()];
      setCategories(updated);
      setNewCategory('');
      setShowAddCategory(false);
      toast({
        title: 'Success',
        description: 'New category added successfully'
      });
    }
  };

  const handleAddBusinessUnit = () => {
    if (newBusinessUnit.trim() && !businessUnits.includes(newBusinessUnit.trim())) {
      const updated = [...businessUnits, newBusinessUnit.trim()];
      setBusinessUnits(updated);
      setNewBusinessUnit('');
      setShowAddBusinessUnit(false);
      toast({
        title: 'Success',
        description: 'New business unit added successfully'
      });
    }
  };

  const handleAddTopic = () => {
    if (newTopic.trim() && !topics.includes(newTopic.trim())) {
      const updated = [...topics, newTopic.trim()];
      setTopics(updated);
      setNewTopic('');
      setShowAddTopic(false);
      toast({
        title: 'Success',
        description: 'New topic added successfully'
      });
    }
  };

  const toggleDropdown = (dropdown: 'categories' | 'businessUnits' | 'topics') => {
    setOpenDropdowns(prev => ({
      categories: false,
      businessUnits: false,
      topics: false,
      [dropdown]: !prev[dropdown]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Category Mapping</h3>
        <p className="text-muted-foreground">
          Select categories, business units, and topics to organize your agent's capabilities
        </p>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            className="w-full justify-between text-left font-normal"
            onClick={() => toggleDropdown('categories')}
          >
            <span className="text-muted-foreground">Category</span>
            {openDropdowns.categories ? (
              <ChevronUp className="h-4 w-4 opacity-50" />
            ) : (
              <ChevronDown className="h-4 w-4 opacity-50" />
            )}
          </Button>
          
          {openDropdowns.categories && (
            <Card className="absolute top-full left-0 right-0 z-[100] mt-1 max-h-80 overflow-hidden shadow-lg bg-background border">
              <div className="p-2 space-y-1 overflow-y-auto max-h-72 bg-background">
                {categories.map((category) => (
                  <div key={category} className="flex items-center justify-between group">
                    <div
                      className={`flex-1 p-2 text-sm cursor-pointer rounded transition-colors ${
                        selectedCategories.includes(category)
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => toggleCategorySelection(category)}
                    >
                      {category}
                    </div>
                    {!DEFAULT_CATEGORIES.includes(category) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCategory(category)}
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                
                {showAddCategory ? (
                  <div className="p-2 space-y-2 border-t">
                    <Input
                      placeholder="Enter category name..."
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                      className="text-sm"
                    />
                    <div className="flex gap-1">
                      <Button size="sm" onClick={handleAddCategory} className="text-xs">
                        Add
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => {
                          setShowAddCategory(false);
                          setNewCategory('');
                        }}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : null}
                
                {/* Add/Deactivate Actions at Bottom */}
                <div className="border-t p-2 flex justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddCategory(true)}
                    className="text-xs flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Close dropdown when deactivating
                      setOpenDropdowns(prev => ({ ...prev, categories: false }));
                      toast({
                        title: 'Info',
                        description: 'Categories can be removed individually using the X button'
                      });
                    }}
                    className="text-xs flex items-center gap-1 text-muted-foreground"
                  >
                    <UserX className="h-3 w-3" />
                    Deactivate
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Business Units Dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            className="w-full justify-between text-left font-normal"
            onClick={() => toggleDropdown('businessUnits')}
          >
            <span className="text-muted-foreground">Business Units</span>
            {openDropdowns.businessUnits ? (
              <ChevronUp className="h-4 w-4 opacity-50" />
            ) : (
              <ChevronDown className="h-4 w-4 opacity-50" />
            )}
          </Button>
          
          {openDropdowns.businessUnits && (
            <Card className="absolute top-full left-0 right-0 z-[100] mt-1 max-h-80 overflow-hidden shadow-lg bg-background border">
              <div className="p-2 space-y-1 overflow-y-auto max-h-72 bg-background">
                {businessUnits.map((unit) => (
                  <div key={unit} className="flex items-center justify-between group">
                    <div
                      className={`flex-1 p-2 text-sm cursor-pointer rounded transition-colors ${
                        selectedBusinessUnits.includes(unit)
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => toggleBusinessUnitSelection(unit)}
                    >
                      {unit}
                    </div>
                    {!DEFAULT_BUSINESS_UNITS.includes(unit) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBusinessUnit(unit)}
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                
                {showAddBusinessUnit ? (
                  <div className="p-2 space-y-2 border-t">
                    <Input
                      placeholder="Enter business unit..."
                      value={newBusinessUnit}
                      onChange={(e) => setNewBusinessUnit(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddBusinessUnit()}
                      className="text-sm"
                    />
                    <div className="flex gap-1">
                      <Button size="sm" onClick={handleAddBusinessUnit} className="text-xs">
                        Add
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => {
                          setShowAddBusinessUnit(false);
                          setNewBusinessUnit('');
                        }}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : null}
                
                {/* Add/Deactivate Actions at Bottom */}
                <div className="border-t p-2 flex justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddBusinessUnit(true)}
                    className="text-xs flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setOpenDropdowns(prev => ({ ...prev, businessUnits: false }));
                      toast({
                        title: 'Info',
                        description: 'Business units can be removed individually using the X button'
                      });
                    }}
                    className="text-xs flex items-center gap-1 text-muted-foreground"
                  >
                    <UserX className="h-3 w-3" />
                    Deactivate
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Topics Dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            className="w-full justify-between text-left font-normal"
            onClick={() => toggleDropdown('topics')}
          >
            <span className="text-muted-foreground">Topics</span>
            {openDropdowns.topics ? (
              <ChevronUp className="h-4 w-4 opacity-50" />
            ) : (
              <ChevronDown className="h-4 w-4 opacity-50" />
            )}
          </Button>
          
          {openDropdowns.topics && (
            <Card className="absolute top-full left-0 right-0 z-[100] mt-1 max-h-80 overflow-hidden shadow-lg bg-background border">
              <div className="p-2 space-y-1 overflow-y-auto max-h-72 bg-background">
                {topics.map((topic) => (
                  <div key={topic} className="flex items-center justify-between group">
                    <div
                      className={`flex-1 p-2 text-sm cursor-pointer rounded transition-colors ${
                        selectedTopics.includes(topic)
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => toggleTopicSelection(topic)}
                    >
                      {topic}
                    </div>
                    {!DEFAULT_TOPICS.includes(topic) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTopic(topic)}
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                
                {showAddTopic ? (
                  <div className="p-2 space-y-2 border-t">
                    <Input
                      placeholder="Enter topic..."
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTopic()}
                      className="text-sm"
                    />
                    <div className="flex gap-1">
                      <Button size="sm" onClick={handleAddTopic} className="text-xs">
                        Add
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => {
                          setShowAddTopic(false);
                          setNewTopic('');
                        }}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : null}
                
                {/* Add/Deactivate Actions at Bottom */}
                <div className="border-t p-2 flex justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddTopic(true)}
                    className="text-xs flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setOpenDropdowns(prev => ({ ...prev, topics: false }));
                      toast({
                        title: 'Info',
                        description: 'Topics can be removed individually using the X button'
                      });
                    }}
                    className="text-xs flex items-center gap-1 text-muted-foreground"
                  >
                    <UserX className="h-3 w-3" />
                    Deactivate
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Selection Summary */}
      <Card className="bg-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Selection Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">Categories:</span> {selectedCategories.length > 0 ? selectedCategories.join(', ') : 'None selected'}
          </div>
          <div className="text-sm">
            <span className="font-medium">Business Units:</span> {selectedBusinessUnits.length > 0 ? selectedBusinessUnits.join(', ') : 'None selected'}
          </div>
          <div className="text-sm">
            <span className="font-medium">Topics:</span> {selectedTopics.length > 0 ? selectedTopics.join(', ') : 'None selected'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};