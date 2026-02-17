import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { verifyAllProviders } from '@/services/providerVerificationService';
import { toast } from 'sonner';

export const APIKeyVerificationComponent: React.FC = () => {
  const [verificationResults, setVerificationResults] = useState<{
    openai: boolean;
    huggingface: boolean;
    claude: boolean;
    gemini: boolean;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyKeys = async () => {
    setIsVerifying(true);
    try {
      const results = await verifyAllProviders();
      setVerificationResults(results);
      
      const availableCount = Object.values(results).filter(Boolean).length;
      toast.success(`Verified ${availableCount} out of 4 API keys`);
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to verify API keys');
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    verifyKeys();
  }, []);

  const getStatusIcon = (available: boolean) => {
    return available ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    );
  };

  const getStatusBadge = (available: boolean) => {
    return (
      <Badge variant={available ? "default" : "destructive"}>
        {available ? "Available" : "Not Set"}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>AI Provider API Keys Status</span>
          <Button
            onClick={verifyKeys}
            disabled={isVerifying}
            size="sm"
            variant="outline"
          >
            {isVerifying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isVerifying ? 'Verifying...' : 'Refresh'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {verificationResults ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(verificationResults.openai)}
                  <span className="font-medium">OpenAI</span>
                </div>
                {getStatusBadge(verificationResults.openai)}
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(verificationResults.huggingface)}
                  <span className="font-medium">HuggingFace</span>
                </div>
                {getStatusBadge(verificationResults.huggingface)}
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(verificationResults.claude)}
                  <span className="font-medium">Claude</span>
                </div>
                {getStatusBadge(verificationResults.claude)}
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(verificationResults.gemini)}
                  <span className="font-medium">Gemini</span>
                </div>
                {getStatusBadge(verificationResults.gemini)}
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Provider Capabilities</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li><strong>OpenAI:</strong> Image generation (DALL-E, GPT-Image-1)</li>
                <li><strong>HuggingFace:</strong> Image generation (FLUX models)</li>
                <li><strong>Claude:</strong> Text processing and analysis</li>
                <li><strong>Gemini:</strong> Multimodal AI capabilities</li>
              </ul>
            </div>

            {verificationResults.openai || verificationResults.huggingface ? (
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-green-800 text-sm">
                  ✅ You have {verificationResults.openai && verificationResults.huggingface ? 'both OpenAI and HuggingFace' : verificationResults.openai ? 'OpenAI' : 'HuggingFace'} API keys configured. 
                  Image and video generation should work!
                </p>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  ⚠️ No image generation providers are available. Please configure OpenAI or HuggingFace API keys to enable media generation.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default APIKeyVerificationComponent;