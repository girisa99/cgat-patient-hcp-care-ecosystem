import { useState } from 'react';
import { useMasterToast } from './useMasterToast';

interface VoiceConnector {
  id: string;
  name: string;
  type: 'SIP' | 'API' | 'Webhook' | 'Database' | 'CRM' | 'Cloud';
  configuration: any;
  endpoints: string[];
  features: string[];
  status: 'active' | 'inactive' | 'testing';
  health_status: 'healthy' | 'warning' | 'error' | 'unknown';
  last_tested_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface CreateConnectorData {
  name: string;
  type: 'SIP' | 'API' | 'Webhook' | 'Database' | 'CRM' | 'Cloud';
  configuration: any;
  endpoints?: string[];
  features?: string[];
}

interface UpdateConnectorData extends Partial<CreateConnectorData> {
  status?: 'active' | 'inactive' | 'testing';
  health_status?: 'healthy' | 'warning' | 'error' | 'unknown';
}

// Mock data
const mockConnectors: VoiceConnector[] = [
  {
    id: '1',
    name: 'Twilio SIP Trunk',
    type: 'SIP',
    configuration: {},
    endpoints: ['sip.twilio.com'],
    features: ['Failover', 'Load Balancing'],
    status: 'active',
    health_status: 'healthy',
    last_tested_at: new Date().toISOString(),
    created_by: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const useVoiceConnectors = () => {
  const { showSuccess, showError } = useMasterToast();
  const [connectors, setConnectors] = useState<VoiceConnector[]>(mockConnectors);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const createConnector = async (connectorData: CreateConnectorData) => {
    setIsCreating(true);
    try {
      const newConnector: VoiceConnector = {
        id: Date.now().toString(),
        ...connectorData,
        endpoints: connectorData.endpoints || [],
        features: connectorData.features || [],
        status: 'active',
        health_status: 'unknown',
        last_tested_at: null,
        created_by: 'current_user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setConnectors(prev => [...prev, newConnector]);
      showSuccess('Voice connector created successfully');
    } catch (error) {
      console.error('Error creating connector:', error);
      showError('Failed to create connector');
    } finally {
      setIsCreating(false);
    }
  };

  const updateConnector = async ({ id, updates }: { id: string; updates: UpdateConnectorData }) => {
    setIsUpdating(true);
    try {
      setConnectors(prev => prev.map(connector => 
        connector.id === id 
          ? { ...connector, ...updates, updated_at: new Date().toISOString() }
          : connector
      ));
      showSuccess('Connector updated successfully');
    } catch (error) {
      console.error('Error updating connector:', error);
      showError('Failed to update connector');
    } finally {
      setIsUpdating(false);
    }
  };

  const testConnector = async (id: string) => {
    setIsTesting(true);
    try {
      setConnectors(prev => prev.map(connector => 
        connector.id === id 
          ? { 
              ...connector, 
              last_tested_at: new Date().toISOString(),
              health_status: 'healthy',
              updated_at: new Date().toISOString()
            }
          : connector
      ));
      showSuccess('Connector test completed successfully');
    } catch (error) {
      console.error('Error testing connector:', error);
      showError('Connector test failed');
    } finally {
      setIsTesting(false);
    }
  };

  const testAllConnectors = async () => {
    setIsTesting(true);
    try {
      setConnectors(prev => prev.map(connector => ({
        ...connector,
        last_tested_at: new Date().toISOString(),
        health_status: 'healthy' as const,
        updated_at: new Date().toISOString()
      })));
      showSuccess('All connectors tested successfully');
    } catch (error) {
      console.error('Error testing all connectors:', error);
      showError('Failed to test all connectors');
    } finally {
      setIsTesting(false);
    }
  };

  const deleteConnector = async (id: string) => {
    setIsDeleting(true);
    try {
      setConnectors(prev => prev.filter(connector => connector.id !== id));
      showSuccess('Connector deleted successfully');
    } catch (error) {
      console.error('Error deleting connector:', error);
      showError('Failed to delete connector');
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    connectors,
    isLoading: false,
    error: null,
    createConnector,
    updateConnector,
    testConnector,
    testAllConnectors,
    deleteConnector,
    isCreating,
    isUpdating,
    isTesting,
    isDeleting,
  };
};