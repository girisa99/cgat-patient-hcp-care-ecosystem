/**
 * CROSS-TAB VALIDATION HELPER
 * Ensures consistency between consent and provider information across enrollment steps
 * Provides validation, conflict resolution, and auto-population features
 */
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  ArrowRight, 
  Info 
} from 'lucide-react';

interface CrossTabValidationProps {
  consentData: {
    provider_name?: string;
    provider_npi?: string;
    treatment_center?: string;
    treatment_center_npi?: string;
  };
  currentData: {
    provider_name?: string;
    provider_npi?: string;
    treatment_center?: string;
    treatment_center_npi?: string;
  };
  onSync: (field: string, value: string) => void;
  onValidate: () => void;
}

export const CrossTabValidationHelper: React.FC<CrossTabValidationProps> = ({
  consentData,
  currentData,
  onSync,
  onValidate
}) => {
  const conflicts = [];
  const matches = [];
  const missingInCurrent = [];

  // Check for conflicts and matches
  Object.keys(consentData).forEach(key => {
    const consentValue = consentData[key as keyof typeof consentData];
    const currentValue = currentData[key as keyof typeof currentData];
    
    if (consentValue && currentValue) {
      if (consentValue !== currentValue) {
        conflicts.push({ field: key, consent: consentValue, current: currentValue });
      } else {
        matches.push({ field: key, value: consentValue });
      }
    } else if (consentValue && !currentValue) {
      missingInCurrent.push({ field: key, value: consentValue });
    }
  });

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      provider_name: 'Provider Name',
      provider_npi: 'Provider NPI',
      treatment_center: 'Treatment Center',
      treatment_center_npi: 'Treatment Center NPI'
    };
    return labels[field] || field;
  };

  return (
    <div className="space-y-4">
      {/* Auto-population available */}
      {missingInCurrent.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-600" />
              Auto-Population Available
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <p className="text-sm text-muted-foreground">
              Provider information from consent step can be auto-filled:
            </p>
            {missingInCurrent.map(({ field, value }) => (
              <div key={field} className="flex items-center justify-between p-2 bg-white rounded border">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{getFieldLabel(field)}:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{value}</code>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSync(field, value)}
                  className="h-7"
                >
                  <ArrowRight className="h-3 w-3 mr-1" />
                  Auto-fill
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Conflicts detected */}
      {conflicts.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            <div className="space-y-3">
              <p className="font-medium">Data conflicts detected between consent and provider sections:</p>
              {conflicts.map(({ field, consent, current }) => (
                <div key={field} className="space-y-2">
                  <p className="text-sm font-medium">{getFieldLabel(field)}:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-white rounded border">
                      <p className="font-medium mb-1">Consent Step:</p>
                      <code>{consent}</code>
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <p className="font-medium mb-1">Provider Step:</p>
                      <code>{current}</code>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSync(field, consent)}
                      className="h-7 text-xs"
                    >
                      Use Consent Value
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onValidate}
                      className="h-7 text-xs"
                    >
                      Keep Current
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Matches confirmed */}
      {matches.length > 0 && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Consistent Data ({matches.length} field{matches.length !== 1 ? 's' : ''})
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {matches.map(({ field }) => (
                    <Badge key={field} variant="secondary" className="text-xs">
                      {getFieldLabel(field)} ✓
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All synced */}
      {conflicts.length === 0 && missingInCurrent.length === 0 && matches.length > 0 && (
        <div className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">All provider data is consistent across enrollment steps</span>
          </div>
        </div>
      )}
    </div>
  );
};