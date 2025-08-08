import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { DataTable } from '@/components/ui/DataTable';
import { useVoiceProviders } from '@/hooks/useVoiceProviders';
import { 
  Settings, 
  CheckCircle, 
  XCircle, 
  Activity,
  TestTube,
  Plus,
  Edit,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { CreateProviderDialog } from './CreateProviderDialog';

export const VoiceProviderManager = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);

  const {
    voiceProviders,
    voiceConfigurations,
    isLoading,
    updateProviderStatus,
    testVoiceProvider,
    isTesting
  } = useVoiceProviders();

  const getProviderTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'twilio':
        return '📞';
      case 'five9':
        return '🌟';
      case 'genesys':
        return '⚡';
      case 'elevenlabs':
        return '🎙️';
      case 'openai':
        return '🤖';
      case 'huggingface':
        return '🤗';
      case 'claude':
        return '🧠';
      default:
        return '🔧';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  const handleToggleProvider = async (providerId: string, isActive: boolean) => {
    updateProviderStatus({ id: providerId, isActive: !isActive });
  };

  const handleTestProvider = (providerId: string) => {
    testVoiceProvider(providerId);
  };

  const providerColumns = [
    {
      key: 'name',
      label: 'Provider',
      accessorKey: 'name',
      header: 'Provider',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getProviderTypeIcon(row.original.provider_type)}</span>
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-sm text-muted-foreground capitalize">
              {row.original.provider_type}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'capabilities',
      label: 'Capabilities',
      accessorKey: 'capabilities',
      header: 'Capabilities',
      cell: ({ row }: any) => {
        const capabilities = row.original.capabilities || {};
        return (
          <div className="flex flex-wrap gap-1">
            {capabilities.tts && (
              <Badge variant="secondary" className="text-xs">TTS</Badge>
            )}
            {capabilities.stt && (
              <Badge variant="secondary" className="text-xs">STT</Badge>
            )}
            {capabilities.calls && (
              <Badge variant="secondary" className="text-xs">Calls</Badge>
            )}
            {capabilities.realtime && (
              <Badge variant="secondary" className="text-xs">Realtime</Badge>
            )}
          </div>
        );
      },
    },
    {
      key: 'is_active',
      label: 'Status',
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(row.original.is_active)} variant="secondary">
            {row.original.is_active ? 'Active' : 'Inactive'}
          </Badge>
          <Switch
            checked={row.original.is_active}
            onCheckedChange={() => handleToggleProvider(row.original.id, row.original.is_active)}
            aria-label="Toggle provider status"
          />
        </div>
      ),
    },
    {
      key: 'rate_limits',
      label: 'Rate Limits',
      accessorKey: 'rate_limits',
      header: 'Rate Limits',
      cell: ({ row }: any) => {
        const rateLimits = row.original.rate_limits || {};
        return (
          <div className="text-sm">
            {rateLimits.requests_per_minute || 'N/A'} req/min
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleTestProvider(row.original.id)}
            disabled={isTesting}
          >
            <TestTube className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedProvider(row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Provider Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Settings className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{voiceProviders.length}</p>
                <p className="text-sm text-muted-foreground">Total Providers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {voiceProviders.filter(p => p.is_active).length}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">
                  {voiceProviders.filter(p => !p.is_active).length}
                </p>
                <p className="text-sm text-muted-foreground">Inactive</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{voiceConfigurations.length}</p>
                <p className="text-sm text-muted-foreground">Configurations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Provider Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Voice Providers
          </CardTitle>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Provider
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={providerColumns}
            data={voiceProviders.map(provider => ({
              ...provider,
              [provider.id]: provider.id // Add string index signature
            }))}
            loading={isLoading}
            searchPlaceholder="Search providers..."
          />
        </CardContent>
      </Card>

      {/* Provider Types Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Supported Provider Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📞</span>
                <h3 className="font-medium">Twilio</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Voice calls, SMS, and communication APIs
              </p>
              <div className="flex gap-1">
                <Badge variant="secondary" className="text-xs">Calls</Badge>
                <Badge variant="secondary" className="text-xs">SMS</Badge>
                <Badge variant="secondary" className="text-xs">TTS</Badge>
              </div>
            </div>

            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🎙️</span>
                <h3 className="font-medium">ElevenLabs</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                AI-powered text-to-speech and voice synthesis
              </p>
              <div className="flex gap-1">
                <Badge variant="secondary" className="text-xs">TTS</Badge>
                <Badge variant="secondary" className="text-xs">Voice Clone</Badge>
                <Badge variant="secondary" className="text-xs">Realtime</Badge>
              </div>
            </div>

            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🤖</span>
                <h3 className="font-medium">OpenAI</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                GPT-powered speech services and realtime API
              </p>
              <div className="flex gap-1">
                <Badge variant="secondary" className="text-xs">TTS</Badge>
                <Badge variant="secondary" className="text-xs">STT</Badge>
                <Badge variant="secondary" className="text-xs">Realtime</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateProviderDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
};