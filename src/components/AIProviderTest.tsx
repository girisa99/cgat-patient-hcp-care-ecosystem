import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useUniversalAI } from '@/hooks/useUniversalAI';

export const AIProviderTest: React.FC = () => {
  const [testResults, setTestResults] = useState<{[key: string]: {
    available: boolean;
    tested: boolean;
    loading: boolean;
    response?: string;
    error?: string;
  }}>({
    openai: { available: false, tested: false, loading: false },
    claude: { available: false, tested: false, loading: false },
    gemini: { available: false, tested: false, loading: false }
  });

  const { generateResponse, isProviderAvailable, loadAvailableProviders } = useUniversalAI();

  useEffect(() => {
    loadAvailableProviders();
  }, [loadAvailableProviders]);

  const testProvider = async (provider: 'openai' | 'claude' | 'gemini') => {
    setTestResults(prev => ({
      ...prev,
      [provider]: { ...prev[provider], loading: true, tested: false }
    }));

    try {
      const response = await generateResponse({
        provider,
        prompt: 'Say "Hello" in one word',
        systemPrompt: 'Respond with exactly one word.',
        temperature: 0.1,
        maxTokens: 10
      });

      setTestResults(prev => ({
        ...prev,
        [provider]: {
          available: !!response,
          tested: true,
          loading: false,
          response: response?.content || 'No response',
          error: undefined
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [provider]: {
          available: false,
          tested: true,
          loading: false,
          response: undefined,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
    }
  };

  const testAllProviders = async () => {
    await Promise.all([
      testProvider('openai'),
      testProvider('claude'),
      testProvider('gemini')
    ]);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Universal AI Provider Test
          <Button onClick={testAllProviders} size="sm">
            Test All Providers
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(testResults).map(([provider, result]) => (
          <div key={provider} className="flex items-center justify-between p-3 border rounded">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {result.loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : result.tested ? (
                  result.available ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )
                ) : (
                  <div className="h-4 w-4 rounded-full bg-gray-300" />
                )}
                <span className="font-medium capitalize">{provider}</span>
              </div>
              
              <Badge 
                variant={result.available ? 'default' : result.tested ? 'destructive' : 'secondary'}
              >
                {result.loading ? 'Testing...' : 
                 result.tested ? (result.available ? 'Working' : 'Failed') : 
                 'Not Tested'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => testProvider(provider as 'openai' | 'claude' | 'gemini')}
                disabled={result.loading}
              >
                {result.loading ? 'Testing...' : 'Test'}
              </Button>
            </div>
          </div>
        ))}

        {Object.values(testResults).some(r => r.tested) && (
          <div className="mt-6 space-y-2">
            <h4 className="font-medium">Test Results:</h4>
            {Object.entries(testResults).map(([provider, result]) => (
              result.tested && (
                <div key={provider} className="text-sm">
                  <strong className="capitalize">{provider}:</strong> 
                  {result.response ? (
                    <span className="text-green-600 ml-2">{result.response}</span>
                  ) : result.error ? (
                    <span className="text-red-600 ml-2">{result.error}</span>
                  ) : (
                    <span className="text-gray-500 ml-2">No response</span>
                  )}
                </div>
              )
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};