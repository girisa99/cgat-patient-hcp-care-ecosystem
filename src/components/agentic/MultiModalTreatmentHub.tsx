import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAgenticOrchestrator } from '@/hooks/useAgenticOrchestrator';
import { 
  Dna, 
  Heart, 
  Zap, 
  RadioIcon, 
  Users,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Activity
} from 'lucide-react';

interface PatientContext {
  patientId: string;
  medicalHistory: any;
  currentCondition: string;
  treatmentGoals: string[];
}

const modalityIcons = {
  'cell-therapy': Heart,
  'gene-therapy': Dna,
  'personalized-medicine': Users,
  'radioland-treatment': RadioIcon
};

const modalityColors = {
  'cell-therapy': 'bg-green-100 text-green-800 border-green-200',
  'gene-therapy': 'bg-blue-100 text-blue-800 border-blue-200',
  'personalized-medicine': 'bg-purple-100 text-purple-800 border-purple-200',
  'radioland-treatment': 'bg-orange-100 text-orange-800 border-orange-200'
};

export const MultiModalTreatmentHub: React.FC = () => {
  const [patientContext, setPatientContext] = useState<PatientContext>({
    patientId: '',
    medicalHistory: {},
    currentCondition: '',
    treatmentGoals: []
  });

  const [selectedModalities, setSelectedModalities] = useState<Array<keyof typeof modalityIcons>>([]);
  const [orchestrationResult, setOrchestrationResult] = useState<any>(null);

  const { 
    orchestrateMultiModalTreatment, 
    isExecuting,
    activeWorkflows 
  } = useAgenticOrchestrator();

  const handleModalityToggle = (modality: keyof typeof modalityIcons) => {
    setSelectedModalities(prev => 
      prev.includes(modality) 
        ? prev.filter(m => m !== modality)
        : [...prev, modality]
    );
  };

  const handleOrchestration = async () => {
    if (!patientContext.patientId || selectedModalities.length === 0) {
      return;
    }

    try {
      const result = await orchestrateMultiModalTreatment(patientContext, selectedModalities);
      setOrchestrationResult(result);
    } catch (error) {
      console.error('Orchestration failed:', error);
    }
  };

  const addTreatmentGoal = () => {
    const goal = (document.getElementById('treatmentGoal') as HTMLInputElement)?.value;
    if (goal && !patientContext.treatmentGoals.includes(goal)) {
      setPatientContext(prev => ({
        ...prev,
        treatmentGoals: [...prev.treatmentGoals, goal]
      }));
      (document.getElementById('treatmentGoal') as HTMLInputElement).value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Multi-Modal Healthcare Treatment Orchestration
          </CardTitle>
          <p className="text-muted-foreground">
            Coordinate Cell, Gene, Personalized Medicine, and Radioland therapies with shared assessment
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="setup" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="setup">Patient Setup</TabsTrigger>
              <TabsTrigger value="modalities">Treatment Modalities</TabsTrigger>
              <TabsTrigger value="orchestration">Orchestration Results</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Patient ID</label>
                  <Input 
                    value={patientContext.patientId}
                    onChange={(e) => setPatientContext(prev => ({ ...prev, patientId: e.target.value }))}
                    placeholder="Enter patient identifier"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Condition</label>
                  <Input 
                    value={patientContext.currentCondition}
                    onChange={(e) => setPatientContext(prev => ({ ...prev, currentCondition: e.target.value }))}
                    placeholder="Primary diagnosis or condition"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Medical History (JSON)</label>
                <Textarea 
                  value={JSON.stringify(patientContext.medicalHistory, null, 2)}
                  onChange={(e) => {
                    try {
                      const history = JSON.parse(e.target.value);
                      setPatientContext(prev => ({ ...prev, medicalHistory: history }));
                    } catch {
                      // Invalid JSON, ignore
                    }
                  }}
                  placeholder='{"allergies": [], "conditions": [], "medications": []}'
                  className="h-32"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Treatment Goals</label>
                <div className="flex gap-2">
                  <Input id="treatmentGoal" placeholder="Add treatment goal" />
                  <Button onClick={addTreatmentGoal} size="sm">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {patientContext.treatmentGoals.map((goal, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer"
                      onClick={() => setPatientContext(prev => ({
                        ...prev,
                        treatmentGoals: prev.treatmentGoals.filter((_, i) => i !== index)
                      }))}>
                      {goal} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="modalities" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(modalityIcons).map(([modality, IconComponent]) => {
                  const isSelected = selectedModalities.includes(modality as keyof typeof modalityIcons);
                  const colorClass = modalityColors[modality as keyof typeof modalityColors];
                  
                  return (
                    <Card 
                      key={modality}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        isSelected ? 'ring-2 ring-primary shadow-lg' : ''
                      }`}
                      onClick={() => handleModalityToggle(modality as keyof typeof modalityIcons)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <IconComponent className="h-5 w-5" />
                            {modality.split('-').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </CardTitle>
                          {isSelected && <CheckCircle className="h-5 w-5 text-green-600" />}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Badge className={colorClass}>
                          {modality === 'cell-therapy' && 'CAR-T, Stem Cell, Regenerative'}
                        {modality === 'gene-therapy' && 'Genetic Modification, Vector Delivery'}
                        {modality === 'personalized-medicine' && 'Biomarker Analysis, Precision Treatment'}
                        {modality === 'radioland-treatment' && 'Radiopharmaceuticals, Targeted Radiation'}
                        </Badge>
                        <div className="mt-3 text-sm text-muted-foreground">
                          {modality === 'cell-therapy' && 'Advanced cellular therapies including CAR-T cells, stem cell treatments, and regenerative medicine approaches.'}
                          {modality === 'gene-therapy' && 'Cutting-edge genetic modification techniques and optimized vector delivery systems.'}
                          {modality === 'personalized-medicine' && 'Patient-specific treatment customization based on biomarker analysis and genetic profiling.'}
                          {modality === 'radioland-treatment' && 'Specialized radiopharmaceutical treatments and precise radiation therapy protocols.'}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex justify-center pt-4">
                <Button 
                  onClick={handleOrchestration}
                  disabled={!patientContext.patientId || selectedModalities.length === 0 || isExecuting}
                  size="lg"
                  className="w-full md:w-auto"
                >
                  {isExecuting ? (
                    <>
                      <Activity className="h-4 w-4 mr-2 animate-spin" />
                      Orchestrating Treatment...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Start Multi-Modal Orchestration
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="orchestration" className="space-y-4">
              {orchestrationResult ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Orchestration Workflow</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="secondary">{orchestrationResult.workflow.id}</Badge>
                        <ArrowRight className="h-4 w-4" />
                        <span>{orchestrationResult.workflow.agents.length} agents</span>
                        <ArrowRight className="h-4 w-4" />
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Shared Assessment Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                        {JSON.stringify(orchestrationResult.assessment, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Modality Evaluations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {orchestrationResult.modalityEvaluations.map((evaluation: any, index: number) => (
                          <div key={index} className="p-3 border rounded">
                            <h4 className="font-medium mb-2">Evaluation {index + 1}</h4>
                            <pre className="text-xs text-muted-foreground overflow-auto">
                              {JSON.stringify(evaluation, null, 2)}
                            </pre>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Unified Treatment Recommendation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-primary/5 p-3 rounded text-xs overflow-auto">
                        {JSON.stringify(orchestrationResult.unifiedRecommendation, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Configure patient context and select treatment modalities to begin orchestration
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {activeWorkflows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeWorkflows.map((workflow) => (
                <div key={workflow.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-medium">{workflow.name}</span>
                    <div className="text-sm text-muted-foreground">
                      {workflow.agents.length} agents • {workflow.connections.length} connections
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600">Active</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MultiModalTreatmentHub;