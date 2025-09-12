import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, RefreshCw, Settings } from 'lucide-react';
import { verifyAllProviders } from '@/services/providerVerificationService';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export const APIKeyVerificationFloating: React.FC = () => {
  const [verificationResults, setVerificationResults] = useState<{
    openai: boolean;
    huggingface: boolean;
    claude: boolean;
    gemini: boolean;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getStatusBadge = (available: boolean) => {
    return (
      <Badge variant={available ? "default" : "destructive"} className="text-xs">
        {available ? "✓" : "✗"}
      </Badge>
    );
  };

  const availableCount = verificationResults 
    ? Object.values(verificationResults).filter(Boolean).length 
    : 0;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="w-80 shadow-lg border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span>API Keys Status</span>
                  <div className="flex gap-2">
                    <Button
                      onClick={verifyKeys}
                      disabled={isVerifying}
                      size="sm"
                      variant="outline"
                    >
                      {isVerifying ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      onClick={() => setIsExpanded(false)}
                      size="sm"
                      variant="ghost"
                      className="px-2"
                    >
                      ×
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {verificationResults ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center justify-between p-2 border rounded text-xs">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(verificationResults.openai)}
                          <span>OpenAI</span>
                        </div>
                        {getStatusBadge(verificationResults.openai)}
                      </div>

                      <div className="flex items-center justify-between p-2 border rounded text-xs">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(verificationResults.huggingface)}
                          <span>HuggingFace</span>
                        </div>
                        {getStatusBadge(verificationResults.huggingface)}
                      </div>

                      <div className="flex items-center justify-between p-2 border rounded text-xs">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(verificationResults.claude)}
                          <span>Claude</span>
                        </div>
                        {getStatusBadge(verificationResults.claude)}
                      </div>

                      <div className="flex items-center justify-between p-2 border rounded text-xs">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(verificationResults.gemini)}
                          <span>Gemini</span>
                        </div>
                        {getStatusBadge(verificationResults.gemini)}
                      </div>
                    </div>

                    {verificationResults.openai || verificationResults.huggingface ? (
                      <div className="p-2 bg-green-50 rounded text-xs text-green-800">
                        ✅ Image generation enabled
                      </div>
                    ) : (
                      <div className="p-2 bg-yellow-50 rounded text-xs text-yellow-800">
                        ⚠️ No image generation providers
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              onClick={() => setIsExpanded(true)}
              size="sm"
              variant="outline"
              className="shadow-lg bg-white/95 backdrop-blur-sm border"
            >
              <Settings className="h-4 w-4 mr-2" />
              API Keys ({availableCount}/4)
              {isVerifying && <Loader2 className="h-3 w-3 ml-2 animate-spin" />}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default APIKeyVerificationFloating;