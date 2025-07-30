/**
 * THERAPY SELECTION PAGE
 * Standalone page for therapy and service selection with integrated data generation
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { TherapyServiceSelector } from '@/components/therapy/TherapyServiceSelector';
import type { TherapySelection } from '@/types/therapies';

export default function TherapySelection() {
  const [rawSelectedTherapies, setRawSelectedTherapies] = useState<TherapySelection[]>([]);
  
  // Ensure selectedTherapies is always an array
  const selectedTherapies = React.useMemo(() => {
    if (!rawSelectedTherapies) return [];
    if (Array.isArray(rawSelectedTherapies)) return rawSelectedTherapies;
    
    // Handle object with numeric keys
    if (typeof rawSelectedTherapies === 'object') {
      const keys = Object.keys(rawSelectedTherapies);
      if (keys.every(key => !isNaN(Number(key)))) {
        return Object.values(rawSelectedTherapies) as TherapySelection[];
      }
    }
    
    console.warn('selectedTherapies is not in expected format:', rawSelectedTherapies);
    return [];
  }, [rawSelectedTherapies]);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      // Here you would save the selections to your backend
      // For now, just show a success message
      toast({
        title: "Selections Saved",
        description: `${selectedTherapies.length} therapy selections have been saved.`,
      });
    } catch (error) {
      toast({
        title: "Error Saving",
        description: "Failed to save therapy selections.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Stethoscope className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold">Therapy & Service Selection</h1>
            </div>
            <p className="text-muted-foreground">
              Select and configure therapies and services for your treatment center
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {selectedTherapies.length} Selected
          </Badge>
          
          <Button onClick={handleSave} disabled={selectedTherapies.length === 0}>
            <Save className="h-4 w-4 mr-2" />
            Save Selections
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <TherapyServiceSelector
        selectedTherapies={selectedTherapies}
        onTherapySelectionChange={setRawSelectedTherapies}
      />

      {/* Summary */}
      {selectedTherapies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selection Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                You have selected <strong>{selectedTherapies.length}</strong> therapy area{selectedTherapies.length !== 1 ? 's' : ''} for your treatment center.
              </p>
              
              <div className="flex flex-wrap gap-2">
                {selectedTherapies.map((selection) => (
                  <Badge key={selection.therapy_id} variant="secondary">
                    {selection.therapy?.name}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}