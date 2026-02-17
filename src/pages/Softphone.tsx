import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SoftphoneInterface } from '@/components/softphone/SoftphoneInterface';
import { CallManagement } from '@/components/softphone/CallManagement';
import { VoiceProviderManager } from '@/components/softphone/VoiceProviderManager';
import { PhoneNumberManager } from '@/components/softphone/PhoneNumberManager';
import { CallTranscriptions } from '@/components/softphone/CallTranscriptions';
import { ProviderTesting } from '@/components/softphone/ProviderTesting';
import { Phone, Settings, FileText, TestTube, Hash } from 'lucide-react';

const Softphone = () => {
  const [activeTab, setActiveTab] = useState('phone');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/5">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Comprehensive Softphone System
          </h1>
          <p className="text-muted-foreground text-lg">
            Make and receive calls, manage providers, review transcriptions, and test integrations
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-card shadow-lg">
            <TabsTrigger value="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone
            </TabsTrigger>
            <TabsTrigger value="calls" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Calls
            </TabsTrigger>
            <TabsTrigger value="numbers" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Numbers
            </TabsTrigger>
            <TabsTrigger value="transcriptions" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Transcriptions
            </TabsTrigger>
            <TabsTrigger value="providers" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Providers
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Testing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="phone" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Softphone Interface
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SoftphoneInterface />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calls" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Call Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CallManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="numbers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-primary" />
                  Phone Number Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PhoneNumberManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transcriptions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Call Transcriptions & Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CallTranscriptions />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="providers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Voice Provider Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VoiceProviderManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5 text-primary" />
                  Provider Testing & Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProviderTesting />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Softphone;