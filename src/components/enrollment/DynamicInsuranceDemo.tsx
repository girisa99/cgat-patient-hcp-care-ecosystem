/**
 * DYNAMIC INSURANCE DEMO
 * Interactive demonstration showing field count changes based on insurance selections
 */
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Calculator, 
  CreditCard, 
  Building2, 
  Shield, 
  Pill,
  TrendingUp,
  Info
} from 'lucide-react';

interface InsuranceConfiguration {
  primary: {
    enabled: boolean;
    type: 'commercial' | 'medicare' | 'medicaid' | 'government_other' | '';
  };
  secondary: {
    enabled: boolean;
    type: 'commercial' | 'medicare' | 'medicaid' | 'government_other' | '';
  };
  tertiary: {
    enabled: boolean;
    type: 'commercial' | 'medicare' | 'medicaid' | 'government_other' | '';
  };
  pharmacy: {
    enabled: boolean;
    separateCard: boolean;
  };
}

export const DynamicInsuranceDemo: React.FC = () => {
  const [config, setConfig] = useState<InsuranceConfiguration>({
    primary: { enabled: true, type: '' },
    secondary: { enabled: false, type: '' },
    tertiary: { enabled: false, type: '' },
    pharmacy: { enabled: false, separateCard: false }
  });

  // Field count calculation logic
  const fieldCounts = useMemo(() => {
    let total = 0;
    const breakdown: { [key: string]: number } = {};

    // Base insurance fields per tier
    const baseFields = 10;
    const governmentExtraFields = 7; // Medicare parts, SSN, etc.
    const commercialExtraFields = 4; // Employer info, COBRA, etc.
    const pharmacyFields = 8;

    // Primary Insurance
    if (config.primary.enabled) {
      let primaryCount = baseFields;
      if (['medicare', 'medicaid', 'government_other'].includes(config.primary.type)) {
        primaryCount += governmentExtraFields;
      }
      if (config.primary.type === 'commercial') {
        primaryCount += commercialExtraFields;
      }
      breakdown['Primary Insurance'] = primaryCount;
      total += primaryCount;
    }

    // Secondary Insurance
    if (config.secondary.enabled) {
      let secondaryCount = baseFields;
      if (['medicare', 'medicaid', 'government_other'].includes(config.secondary.type)) {
        secondaryCount += governmentExtraFields;
      }
      if (config.secondary.type === 'commercial') {
        secondaryCount += commercialExtraFields;
      }
      breakdown['Secondary Insurance'] = secondaryCount;
      total += secondaryCount;
    }

    // Tertiary Insurance
    if (config.tertiary.enabled) {
      let tertiaryCount = baseFields;
      if (['medicare', 'medicaid', 'government_other'].includes(config.tertiary.type)) {
        tertiaryCount += governmentExtraFields;
      }
      if (config.tertiary.type === 'commercial') {
        tertiaryCount += commercialExtraFields;
      }
      breakdown['Tertiary Insurance'] = tertiaryCount;
      total += tertiaryCount;
    }

    // Pharmacy Benefits
    if (config.pharmacy.enabled) {
      breakdown['Pharmacy Benefits'] = pharmacyFields;
      total += pharmacyFields;
    }

    return { total, breakdown };
  }, [config]);

  const updateConfig = (path: string, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current: any = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  const getComplexityLevel = (total: number): { level: string; color: string; description: string } => {
    if (total <= 15) {
      return { 
        level: 'Basic', 
        color: 'bg-green-500', 
        description: 'Simple coverage scenario'
      };
    } else if (total <= 30) {
      return { 
        level: 'Moderate', 
        color: 'bg-yellow-500', 
        description: 'Standard multi-tier coverage'
      };
    } else if (total <= 45) {
      return { 
        level: 'Complex', 
        color: 'bg-orange-500', 
        description: 'Complex multi-type coverage'
      };
    } else {
      return { 
        level: 'Maximum', 
        color: 'bg-red-500', 
        description: 'Most complex scenario possible'
      };
    }
  };

  const complexity = getComplexityLevel(fieldCounts.total);

  const resetToScenario = (scenario: string) => {
    switch (scenario) {
      case 'basic':
        setConfig({
          primary: { enabled: true, type: 'commercial' },
          secondary: { enabled: false, type: '' },
          tertiary: { enabled: false, type: '' },
          pharmacy: { enabled: false, separateCard: false }
        });
        break;
      case 'dual':
        setConfig({
          primary: { enabled: true, type: 'medicare' },
          secondary: { enabled: true, type: 'medicaid' },
          tertiary: { enabled: false, type: '' },
          pharmacy: { enabled: false, separateCard: false }
        });
        break;
      case 'maximum':
        setConfig({
          primary: { enabled: true, type: 'medicare' },
          secondary: { enabled: true, type: 'commercial' },
          tertiary: { enabled: true, type: 'medicaid' },
          pharmacy: { enabled: true, separateCard: true }
        });
        break;
      default:
        setConfig({
          primary: { enabled: false, type: '' },
          secondary: { enabled: false, type: '' },
          tertiary: { enabled: false, type: '' },
          pharmacy: { enabled: false, separateCard: false }
        });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Dynamic Field Count */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Dynamic Insurance Field Calculator
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-lg px-4 py-2">
                {fieldCounts.total} Fields
              </Badge>
              <Badge className={`${complexity.color} text-white`}>
                {complexity.level}
              </Badge>
            </div>
          </CardTitle>
          <p className="text-sm text-muted-foreground">{complexity.description}</p>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Insurance Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Scenario Buttons */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quick Scenarios</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => resetToScenario('basic')}
                >
                  Basic (14 fields)
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => resetToScenario('dual')}
                >
                  Dual Coverage (34 fields)
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => resetToScenario('maximum')}
                >
                  Maximum (56 fields)
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => resetToScenario('clear')}
                >
                  Clear All
                </Button>
              </div>
            </div>

            <Separator />

            {/* Primary Insurance */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="primary-enabled"
                  checked={config.primary.enabled}
                  onCheckedChange={(checked) => updateConfig('primary.enabled', checked)}
                />
                <Label htmlFor="primary-enabled" className="font-medium">
                  Primary Insurance
                </Label>
                {config.primary.enabled && (
                  <Badge variant="outline">
                    {fieldCounts.breakdown['Primary Insurance'] || 0} fields
                  </Badge>
                )}
              </div>
              {config.primary.enabled && (
                <Select 
                  value={config.primary.type} 
                  onValueChange={(value) => updateConfig('primary.type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select insurance type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commercial">Commercial (14 fields)</SelectItem>
                    <SelectItem value="medicare">Medicare (17 fields)</SelectItem>
                    <SelectItem value="medicaid">Medicaid (17 fields)</SelectItem>
                    <SelectItem value="government_other">Other Government (17 fields)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Secondary Insurance */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="secondary-enabled"
                  checked={config.secondary.enabled}
                  onCheckedChange={(checked) => updateConfig('secondary.enabled', checked)}
                />
                <Label htmlFor="secondary-enabled" className="font-medium">
                  Secondary Insurance
                </Label>
                {config.secondary.enabled && (
                  <Badge variant="outline">
                    {fieldCounts.breakdown['Secondary Insurance'] || 0} fields
                  </Badge>
                )}
              </div>
              {config.secondary.enabled && (
                <Select 
                  value={config.secondary.type} 
                  onValueChange={(value) => updateConfig('secondary.type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select insurance type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commercial">Commercial (14 fields)</SelectItem>
                    <SelectItem value="medicare">Medicare (17 fields)</SelectItem>
                    <SelectItem value="medicaid">Medicaid (17 fields)</SelectItem>
                    <SelectItem value="government_other">Other Government (17 fields)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Tertiary Insurance */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tertiary-enabled"
                  checked={config.tertiary.enabled}
                  onCheckedChange={(checked) => updateConfig('tertiary.enabled', checked)}
                />
                <Label htmlFor="tertiary-enabled" className="font-medium">
                  Tertiary Insurance
                </Label>
                {config.tertiary.enabled && (
                  <Badge variant="outline">
                    {fieldCounts.breakdown['Tertiary Insurance'] || 0} fields
                  </Badge>
                )}
              </div>
              {config.tertiary.enabled && (
                <Select 
                  value={config.tertiary.type} 
                  onValueChange={(value) => updateConfig('tertiary.type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select insurance type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commercial">Commercial (14 fields)</SelectItem>
                    <SelectItem value="medicare">Medicare (17 fields)</SelectItem>
                    <SelectItem value="medicaid">Medicaid (17 fields)</SelectItem>
                    <SelectItem value="government_other">Other Government (17 fields)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Pharmacy Benefits */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pharmacy-enabled"
                  checked={config.pharmacy.enabled}
                  onCheckedChange={(checked) => updateConfig('pharmacy.enabled', checked)}
                />
                <Label htmlFor="pharmacy-enabled" className="font-medium flex items-center gap-2">
                  <Pill className="h-4 w-4" />
                  Separate Pharmacy Benefits
                </Label>
                {config.pharmacy.enabled && (
                  <Badge variant="outline">8 fields</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Field Breakdown Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Field Count Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.keys(fieldCounts.breakdown).length > 0 ? (
              <>
                {Object.entries(fieldCounts.breakdown).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      {category.includes('Primary') && <Shield className="h-4 w-4 text-blue-500" />}
                      {category.includes('Secondary') && <Building2 className="h-4 w-4 text-green-500" />}
                      {category.includes('Tertiary') && <CreditCard className="h-4 w-4 text-purple-500" />}
                      {category.includes('Pharmacy') && <Pill className="h-4 w-4 text-orange-500" />}
                      <span className="font-medium">{category}</span>
                    </div>
                    <Badge variant="secondary">{count} fields</Badge>
                  </div>
                ))}
                
                <Separator />
                
                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="font-semibold text-lg">Total Fields Required</div>
                  <Badge className="text-lg px-4 py-2">{fieldCounts.total}</Badge>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Current Implementation Status:</strong><br />
                    • Basic scenarios (≤22 fields): ✅ Fully supported<br />
                    • Complex scenarios (23-45 fields): ⚠️ Partial support<br />
                    • Maximum complexity (46+ fields): ❌ Requires enhancement
                  </AlertDescription>
                </Alert>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select insurance options to see field breakdown</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Field Details */}
      {fieldCounts.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Field Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Base Fields (All Insurance Types)</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Insurance Provider Name</li>
                  <li>• Member/Policy ID</li>
                  <li>• Group Number</li>
                  <li>• Policy Holder Information (3 fields)</li>
                  <li>• Customer Service Phone</li>
                  <li>• Coverage Dates (2 fields)</li>
                  <li>• Insurance Type Selection</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Additional Fields by Type</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-blue-600">Government (+7 fields):</span>
                    <p className="text-muted-foreground">Medicare Parts A-D, SSN, Medicaid ID, Railroad Retirement</p>
                  </div>
                  <div>
                    <span className="font-medium text-green-600">Commercial (+4 fields):</span>
                    <p className="text-muted-foreground">Employer Info, HR Contact, COBRA Status, Open Enrollment</p>
                  </div>
                  <div>
                    <span className="font-medium text-orange-600">Pharmacy (+8 fields):</span>
                    <p className="text-muted-foreground">PBM Info, PCN, BIN, Pharmacy Networks (3 types)</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};