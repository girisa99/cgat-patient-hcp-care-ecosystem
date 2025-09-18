import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Phone, MessageSquare, Mail, PhoneCall, TestTube } from 'lucide-react';

interface TestResult {
  channel: string;
  status: 'success' | 'failed' | 'error';
  timestamp: string;
  to: string;
  error?: string;
  result?: any;
}

const CommunicationChannelTester: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState<'sms' | 'whatsapp' | 'email' | 'voice'>('sms');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('Hello! This is a test message from the healthcare enrollment system.');
  const [subject, setSubject] = useState('Test Communication - Healthcare Enrollment');
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const { toast } = useToast();

  const channelIcons = {
    sms: Phone,
    whatsapp: MessageSquare,
    email: Mail,
    voice: PhoneCall,
  };

  const channelLabels = {
    sms: 'SMS',
    whatsapp: 'WhatsApp',
    email: 'Email',
    voice: 'Voice Call',
  };

  const getPlaceholder = () => {
    switch (selectedChannel) {
      case 'sms':
      case 'voice':
        return '+1234567890';
      case 'whatsapp':
        return '+1234567890';
      case 'email':
        return 'test@example.com';
      default:
        return '';
    }
  };

  const validateRecipient = () => {
    if (!recipient.trim()) return false;
    
    switch (selectedChannel) {
      case 'sms':
      case 'whatsapp':
      case 'voice':
        return /^\+\d{10,15}$/.test(recipient);
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient);
      default:
        return false;
    }
  };

  const testChannel = async () => {
    if (!validateRecipient()) {
      toast({
        title: "Invalid Recipient",
        description: `Please enter a valid ${selectedChannel === 'email' ? 'email address' : 'phone number (with country code)'}.`,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log(`🧪 Testing ${selectedChannel} to ${recipient}`);
      
      const { data, error } = await supabase.functions.invoke('test-communication-channels', {
        body: {
          channel: selectedChannel,
          to: recipient,
          message: message || undefined,
          subject: selectedChannel === 'email' ? subject : undefined
        }
      });

      if (error) {
        console.error('Test error:', error);
        const result: TestResult = {
          channel: selectedChannel,
          status: 'error',
          timestamp: new Date().toISOString(),
          to: recipient,
          error: error.message
        };
        setTestResults(prev => [result, ...prev]);
        
        toast({
          title: "Test Failed",
          description: `Failed to test ${channelLabels[selectedChannel]}: ${error.message}`,
          variant: "destructive"
        });
      } else {
        console.log('Test result:', data);
        setTestResults(prev => [data, ...prev]);
        
        if (data.status === 'success') {
          toast({
            title: "Test Successful! ✅",
            description: `${channelLabels[selectedChannel]} message sent successfully to ${recipient}`,
          });
        } else {
          toast({
            title: "Test Failed",
            description: `${channelLabels[selectedChannel]} test failed: ${data.error || 'Unknown error'}`,
            variant: "destructive"
          });
        }
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      const result: TestResult = {
        channel: selectedChannel,
        status: 'error',
        timestamp: new Date().toISOString(),
        to: recipient,
        error: error.message
      };
      setTestResults(prev => [result, ...prev]);
      
      toast({
        title: "Unexpected Error",
        description: `An unexpected error occurred: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const IconComponent = channelIcons[selectedChannel];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Communication Channel Tester
          </CardTitle>
          <CardDescription>
            Test WhatsApp, SMS, Email, and Voice channels to ensure they're working properly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Channel Type</label>
              <Select value={selectedChannel} onValueChange={(value: any) => setSelectedChannel(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">📱 SMS</SelectItem>
                  <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                  <SelectItem value="email">📧 Email</SelectItem>
                  <SelectItem value="voice">📞 Voice Call</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {selectedChannel === 'email' ? 'Email Address' : 'Phone Number'}
              </label>
              <Input
                placeholder={getPlaceholder()}
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>

          {selectedChannel === 'email' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject Line</label>
              <Input
                placeholder="Enter email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Test Message</label>
            <Textarea
              placeholder="Enter your test message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <Button 
            onClick={testChannel}
            disabled={isLoading || !recipient.trim()}
            className="w-full"
          >
            <IconComponent className="h-4 w-4 mr-2" />
            {isLoading ? 'Testing...' : `Test ${channelLabels[selectedChannel]}`}
          </Button>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Recent communication channel test results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {testResults.map((result, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${
                  result.status === 'success' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${
                      result.status === 'success' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {result.status === 'success' ? '✅' : '❌'} {channelLabels[result.channel as keyof typeof channelLabels]}
                    </span>
                    <span className="text-sm text-muted-foreground">→ {result.to}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {result.error && (
                  <p className="text-sm text-red-600 mt-1">{result.error}</p>
                )}
                {result.result && (
                  <details className="mt-2">
                    <summary className="text-xs text-muted-foreground cursor-pointer">View Details</summary>
                    <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                      {JSON.stringify(result.result, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CommunicationChannelTester;