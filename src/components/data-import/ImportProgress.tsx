import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Loader2, XCircle } from 'lucide-react';

interface ImportProgressProps {
  isImporting: boolean;
  progress: number;
  currentStep: string;
  totalRecords: number;
  processedRecords: number;
  errors: Array<{ message: string; row?: number }>;
  status: 'idle' | 'processing' | 'completed' | 'error';
}

export const ImportProgress: React.FC<ImportProgressProps> = ({
  isImporting,
  progress,
  currentStep,
  totalRecords,
  processedRecords,
  errors,
  status
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'blue';
      case 'completed':
        return 'green';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  if (!isImporting && status === 'idle') {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span>Import Progress</span>
          </div>
          <Badge variant="outline" className={`border-${getStatusColor()}-200 text-${getStatusColor()}-700`}>
            {status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{currentStep}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Total Records:</span>
            <span className="ml-2 font-medium">{totalRecords.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Processed:</span>
            <span className="ml-2 font-medium">{processedRecords.toLocaleString()}</span>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-red-700">
                {errors.length} Error{errors.length > 1 ? 's' : ''} Found
              </span>
            </div>
            <div className="max-h-24 overflow-y-auto space-y-1">
              {errors.slice(0, 5).map((error, index) => (
                <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  {error.row ? `Row ${error.row}: ` : ''}{error.message}
                </div>
              ))}
              {errors.length > 5 && (
                <div className="text-xs text-muted-foreground">
                  +{errors.length - 5} more errors...
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};