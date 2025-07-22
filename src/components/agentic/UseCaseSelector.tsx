import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UseCaseSelectorProps {
  selectedUseCase: string;
  onUseCaseChange: (value: string) => void;
  selectedCategories: string[];
  selectedTopics: string[];
}

export const UseCaseSelector: React.FC<UseCaseSelectorProps> = ({
  selectedUseCase,
  onUseCaseChange,
  selectedCategories,
  selectedTopics
}) => {
  const [customUseCases, setCustomUseCases] = useState<string[]>([]);
  const [newUseCase, setNewUseCase] = useState('');
  const [showAddUseCase, setShowAddUseCase] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Generate use cases based on categories and topics
  const generatedUseCases = useMemo(() => {
    const useCases = new Set<string>();

    // Add use cases based on selected categories
    selectedCategories.forEach(category => {
      switch (category.toLowerCase()) {
        case 'onboarding and credentaling':
          useCases.add('Provider Onboarding Assistant');
          useCases.add('Patient Onboarding Support');
          useCases.add('Credentialing Workflow Manager');
          break;
        case 'market access':
          useCases.add('Market Access Strategy Assistant');
          useCases.add('Reimbursement Support Agent');
          useCases.add('Payer Relations Manager');
          break;
        case 'distribution':
          useCases.add('Supply Chain Coordinator');
          useCases.add('Distribution Channel Manager');
          useCases.add('Logistics Support Agent');
          break;
        case 'manufacturing':
          useCases.add('Production Planning Assistant');
          useCases.add('Quality Control Manager');
          useCases.add('Manufacturing Compliance Agent');
          break;
        case 'claims management':
          useCases.add('Claims Processing Assistant');
          useCases.add('Prior Authorization Manager');
          useCases.add('Benefits Verification Agent');
          break;
        case 'clinical information':
          useCases.add('Clinical Data Manager');
          useCases.add('Medical Information Assistant');
          useCases.add('Patient Care Coordinator');
          break;
        case 'product information':
          useCases.add('Product Knowledge Assistant');
          useCases.add('Therapeutic Information Agent');
          useCases.add('Drug Information Manager');
          break;
        case 'scheduling':
          useCases.add('Appointment Scheduling Assistant');
          useCases.add('Resource Planning Manager');
          useCases.add('Calendar Coordination Agent');
          break;
        case 'insurance':
          useCases.add('Insurance Verification Assistant');
          useCases.add('Coverage Analysis Agent');
          useCases.add('Policy Management Helper');
          break;
        case 'prior authorization':
          useCases.add('Prior Auth Processing Assistant');
          useCases.add('Authorization Status Manager');
          useCases.add('PA Documentation Agent');
          break;
        case 'compliance & regulatory':
          useCases.add('Regulatory Compliance Monitor');
          useCases.add('Audit Trail Manager');
          useCases.add('Documentation Assistant');
          break;
        default:
          useCases.add(`${category} Assistant`);
      }
    });

    // Add use cases based on selected topics
    selectedTopics.forEach(topic => {
      switch (topic.toLowerCase()) {
        case 'patient onboarding':
          useCases.add('Patient Onboarding Specialist');
          useCases.add('Intake Process Manager');
          break;
        case 'treatment center':
          useCases.add('Treatment Center Coordinator');
          useCases.add('Care Facility Manager');
          break;
        case 'provider onboarding':
          useCases.add('Provider Credentialing Assistant');
          useCases.add('Healthcare Provider Support');
          break;
        case 'eligibility investigation':
        case 'eligibility verification':
          useCases.add('Eligibility Verification Specialist');
          useCases.add('Benefits Investigation Agent');
          break;
        case 'delivery/fulfillment':
          useCases.add('Fulfillment Coordinator');
          useCases.add('Delivery Management Assistant');
          break;
        case 'billing & coding':
          useCases.add('Medical Coding Assistant');
          useCases.add('Billing Support Agent');
          break;
        case 'appointments scheduling and communication':
          useCases.add('Scheduling Communication Manager');
          useCases.add('Appointment Coordination Agent');
          break;
        case '21 cfr part 11':
          useCases.add('Regulatory Compliance Assistant');
          useCases.add('21 CFR Part 11 Monitor');
          break;
        default:
          useCases.add(`${topic} Specialist`);
      }
    });

    // Add some general use cases if no specific categories/topics are selected
    if (selectedCategories.length === 0 && selectedTopics.length === 0) {
      useCases.add('General Healthcare Assistant');
      useCases.add('Customer Support Agent');
      useCases.add('Data Analysis Assistant');
      useCases.add('Document Processing Agent');
      useCases.add('Administrative Assistant');
    }

    return Array.from(useCases).sort();
  }, [selectedCategories, selectedTopics]);

  // Combine generated and custom use cases
  const allUseCases = useMemo(() => {
    return [...generatedUseCases, ...customUseCases].sort();
  }, [generatedUseCases, customUseCases]);

  const handleAddUseCase = () => {
    if (newUseCase.trim() && !allUseCases.includes(newUseCase.trim())) {
      const updatedCustomUseCases = [...customUseCases, newUseCase.trim()];
      setCustomUseCases(updatedCustomUseCases);
      setNewUseCase('');
      setShowAddUseCase(false);
      toast({
        title: 'Success',
        description: 'New use case added successfully'
      });
    }
  };

  const removeCustomUseCase = (useCase: string) => {
    setCustomUseCases(prev => prev.filter(u => u !== useCase));
    if (selectedUseCase === useCase) {
      onUseCaseChange('');
    }
  };

  const toggleUseCaseSelection = (useCase: string) => {
    onUseCaseChange(useCase === selectedUseCase ? '' : useCase);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        className="w-full justify-between text-left font-normal"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedUseCase ? 'text-foreground' : 'text-muted-foreground'}>
          {selectedUseCase || 'Select use case'}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 opacity-50" />
        ) : (
          <ChevronDown className="h-4 w-4 opacity-50" />
        )}
      </Button>
      
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-[100] mt-1 max-h-80 overflow-hidden shadow-lg bg-background border">
          <div className="p-2 space-y-1 overflow-y-auto max-h-64 bg-background">
            {allUseCases.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground text-center">
                Select categories or topics to see suggested use cases
              </div>
            ) : (
              allUseCases.map((useCase) => {
                const isCustom = customUseCases.includes(useCase);
                return (
                  <div key={useCase} className="flex items-center justify-between group">
                    <div
                      className={`flex-1 p-2 text-sm cursor-pointer rounded transition-colors ${
                        selectedUseCase === useCase
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => toggleUseCaseSelection(useCase)}
                    >
                      {useCase}
                    </div>
                    {isCustom && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomUseCase(useCase)}
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                );
              })
            )}
            
            {showAddUseCase ? (
              <div className="p-2 space-y-2 border-t">
                <Input
                  placeholder="Enter use case name..."
                  value={newUseCase}
                  onChange={(e) => setNewUseCase(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddUseCase()}
                  className="text-sm"
                />
                <div className="flex gap-1">
                  <Button size="sm" onClick={handleAddUseCase} className="text-xs">
                    Add
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => {
                      setShowAddUseCase(false);
                      setNewUseCase('');
                    }}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : null}
            
            {/* Add Use Case Button */}
            <div className="border-t p-2 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddUseCase(true)}
                className="text-xs flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add New Use Case
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};