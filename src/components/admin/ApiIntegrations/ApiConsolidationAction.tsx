
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ApiConsolidationUtility } from '@/utils/api/ApiConsolidationUtility';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertTriangle, Loader2, GitMerge } from 'lucide-react';

interface ApiConsolidationActionProps {
  comparisonResult: any;
  onConsolidationComplete?: () => void;
}

export const ApiConsolidationAction: React.FC<ApiConsolidationActionProps> = ({
  comparisonResult,
  onConsolidationComplete
}) => {
  const [isConsolidating, setIsConsolidating] = useState(false);
  const [consolidationResult, setConsolidationResult] = useState<any>(null);
  const { toast } = useToast();

  const handleConsolidate = async (forceConsolidation = false) => {
    if (!comparisonResult) return;

    setIsConsolidating(true);
    
    try {
      console.log('🚀 Starting consolidation process...');
      
      const keepApiId = comparisonResult.recommended.id;
      const removeApiIds = comparisonResult.deprecated.map((api: any) => api.id);
      
      const result = await ApiConsolidationUtility.consolidateToSingleSource(
        keepApiId, 
        removeApiIds, 
        forceConsolidation
      );
      
      setConsolidationResult(result);
      
      if (result.errors.length === 0) {
        toast({
          title: "✅ Consolidation Complete",
          description: `Successfully consolidated ${result.apisRemoved} APIs and migrated ${result.endpointsMigrated} endpoints.`,
        });
        
        if (onConsolidationComplete) {
          onConsolidationComplete();
        }
      } else {
        toast({
          title: "⚠️ Consolidation Partial",
          description: `Some issues occurred: ${result.errors.join(', ')}`,
          variant: "destructive",
        });
      }
      
    } catch (error: any) {
      console.error('❌ Consolidation failed:', error);
      toast({
        title: "❌ Consolidation Failed",
        description: error.message || 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setIsConsolidating(false);
    }
  };

  if (consolidationResult) {
    return (
      <Card className="border-green-500 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Consolidation Complete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-green-700">
            <p><strong>APIs Removed:</strong> {consolidationResult.apisRemoved}</p>
            <p><strong>Endpoints Migrated:</strong> {consolidationResult.endpointsMigrated}</p>
            {consolidationResult.errors.length > 0 && (
              <p><strong>Errors:</strong> {consolidationResult.errors.join(', ')}</p>
            )}
          </div>
          <Badge className="mt-2" variant="default">Single Source of Truth Established</Badge>
        </CardContent>
      </Card>
    );
  }

  const isSafeToRemove = comparisonResult?.validationResults?.safeToRemove;

  return (
    <Card className="border-blue-500">
      <CardHeader>
        <CardTitle className="text-blue-800 flex items-center gap-2">
          <GitMerge className="h-5 w-5" />
          Execute Consolidation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm space-y-2">
          <p><strong>Single Source of Truth:</strong> {comparisonResult?.recommended?.name}</p>
          <p><strong>APIs to Remove:</strong> {comparisonResult?.deprecated?.length || 0}</p>
          <p><strong>Endpoints to Migrate:</strong> {comparisonResult?.differences?.endpoints?.deprecated?.reduce((a: number, b: number) => a + b, 0) || 0}</p>
          <p><strong>Safety Status:</strong> 
            <Badge variant={isSafeToRemove ? "default" : "destructive"} className="ml-2">
              {isSafeToRemove ? "SAFE" : "REQUIRES REVIEW"}
            </Badge>
          </p>
        </div>

        {!isSafeToRemove && (
          <Alert className="border-yellow-500 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Review Required:</strong> Some data might be lost during consolidation. 
              Missing items: {comparisonResult?.validationResults?.missingData?.join(', ')}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          {isSafeToRemove ? (
            <Button 
              onClick={() => handleConsolidate(false)}
              disabled={isConsolidating}
              className="bg-green-600 hover:bg-green-700"
            >
              {isConsolidating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              ✅ Safe Consolidation - Execute Now
            </Button>
          ) : (
            <>
              <Button 
                onClick={() => handleConsolidate(true)}
                disabled={isConsolidating}
                variant="destructive"
              >
                {isConsolidating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                ⚠️ Force Consolidation (Accept Data Loss)
              </Button>
              <Button 
                onClick={() => handleConsolidate(false)}
                disabled={isConsolidating}
                variant="outline"
              >
                Cancel - Review Missing Data
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
