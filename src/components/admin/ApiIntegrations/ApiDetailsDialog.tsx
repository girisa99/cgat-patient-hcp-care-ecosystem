import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Globe, 
  Shield, 
  Database, 
  Code, 
  Copy,
  BookOpen,
  Key,
  FileText,
  Link,
  Lock,
  Zap,
  Server,
  Activity,
  AlertCircle,
  CheckCircle,
  Settings,
  Layers
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ApiIntegrationDetails } from '@/hooks/usePublishedApiDetails';

interface ApiDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiDetails: ApiIntegrationDetails | null;
  isLoading: boolean;
}

const ApiDetailsDialog = ({ open, onOpenChange, apiDetails, isLoading }: ApiDetailsDialogProps) => {
  const { toast } = useToast();

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code Copied",
      description: "Code has been copied to clipboard",
    });
  };

  if (!apiDetails) return null;

  // Generate comprehensive code examples for all endpoints
  const generateCodeExamples = () => {
    if (!apiDetails.endpoints || apiDetails.endpoints.length === 0) {
      return {
        curl: '# No endpoints available - Configure endpoints first',
        javascript: '// No endpoints available - Configure endpoints first',
        react: '// No endpoints available - Configure endpoints first',
        python: '# No endpoints available - Configure endpoints first',
        sdk: '// SDK example - No endpoints configured'
      };
    }

    const authEndpoint = apiDetails.endpoints.find(e => e.url.includes('/auth/login'));
    const patientsEndpoint = apiDetails.endpoints.find(e => e.url.includes('/patients') && e.method === 'GET');
    const createEndpoint = apiDetails.endpoints.find(e => e.method === 'POST' && !e.url.includes('/auth'));
    const baseUrl = apiDetails.base_url;

    // Comprehensive cURL examples
    const curlExamples = `# Healthcare API Examples

# 1. Authentication
curl -X POST "${baseUrl}/auth/login" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "doctor@healthcarecorp.com",
    "password": "SecurePass123!",
    "remember_me": true
  }'

# 2. Get Patients List (with authentication)
curl -X GET "${baseUrl}/api/v1/patients?page=1&limit=20&facility_id=123e4567-e89b-12d3-a456-426614174000" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json"

# 3. Create New Patient
curl -X POST "${baseUrl}/api/v1/patients" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "1985-03-15",
    "facility_id": "123e4567-e89b-12d3-a456-426614174000",
    "phone": "+1-555-0123",
    "email": "john.doe@email.com"
  }'

# 4. Get Facilities
curl -X GET "${baseUrl}/api/v1/facilities" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json"`;

    // Comprehensive JavaScript examples
    const jsExamples = `// Healthcare API JavaScript Examples

class HealthcareAPI {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.accessToken = null;
  }

  // 1. Authentication
  async login(email, password, rememberMe = false) {
    try {
      const response = await fetch(\`\${this.baseUrl}/auth/login\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          remember_me: rememberMe
        })
      });

      const data = await response.json();
      
      if (data.success) {
        this.accessToken = data.data.access_token;
        localStorage.setItem('healthcare_token', data.data.access_token);
      } else {
        setError(data.message || 'Login failed');
      }
      
      return data;
    } catch (err) {
      setError('Network error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // 2. Get Patients with Pagination
  async getPatients(options = {}) {
    const { page = 1, limit = 20, search = '', facilityId = null } = options;
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(facilityId && { facility_id: facilityId })
    });

    const response = await fetch(\`\${this.baseUrl}/api/v1/patients?\${params}\`, {
      method: 'GET',
      headers: {
        'Authorization': \`Bearer \${this.accessToken}\`,
        'Content-Type': 'application/json'
      }
    });

    return await response.json();
  }

  // 3. Create New Patient
  async createPatient(patientData) {
    const response = await fetch(\`\${this.baseUrl}/api/v1/patients\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${this.accessToken}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(patientData)
    });

    return await response.json();
  }

  // 4. Get Facilities
  async getFacilities(facilityType = null) {
    const params = new URLSearchParams({
      ...(facilityType && { facility_type: facilityType })
    });

    const response = await fetch(\`\${this.baseUrl}/api/v1/facilities?\${params}\`, {
      headers: {
        'Authorization': \`Bearer \${this.accessToken}\`,
        'Content-Type': 'application/json'
      }
    });

    return await response.json();
  }
}

// Usage Example
const api = new HealthcareAPI('${baseUrl}', 'your-api-key');

// Login and use the API
async function example() {
  await api.login('doctor@healthcarecorp.com', 'SecurePass123!');
  
  const patients = await api.getPatients({ 
    page: 1, 
    limit: 10, 
    search: 'John' 
  });
  
  console.log('Patients:', patients);
}`;

    // React Hook examples
    const reactExamples = `// React Hooks for Healthcare API

import React, { useState, useEffect, useCallback } from 'react';

// Custom hook for Healthcare API
export const useHealthcareAPI = (baseUrl) => {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem('healthcare_token')
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Login function
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(\`\${baseUrl}/auth/login\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (data.success) {
        setAccessToken(data.data.access_token);
        localStorage.setItem('healthcare_token', data.data.access_token);
      } else {
        setError(data.message || 'Login failed');
      }
      
      return data;
    } catch (err) {
      setError('Network error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  // API request helper
  const apiRequest = useCallback(async (endpoint, options = {}) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': \`Bearer \${accessToken}\` }),
        ...options.headers
      },
      ...options
    };

    const response = await fetch(\`\${baseUrl}\${endpoint}\`, config);
    return await response.json();
  }, [baseUrl, accessToken]);

  return {
    accessToken,
    loading,
    error,
    login,
    apiRequest,
    isAuthenticated: !!accessToken
  };
};

// React Component Example
export const PatientList = () => {
  const { apiRequest, isAuthenticated } = useHealthcareAPI('${baseUrl}');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPatients();
    }
  }, [isAuthenticated]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('/api/v1/patients?page=1&limit=20');
      if (response.success) {
        setPatients(response.data);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <div>Please log in to view patients</div>;
  }

  return (
    <div>
      <h2>Patient List</h2>
      {loading ? (
        <div>Loading patients...</div>
      ) : (
        <ul>
          {patients.map(patient => (
            <li key={patient.id}>
              {patient.first_name} {patient.last_name} - MRN: {patient.medical_record_number}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};`;

    // Python examples
    const pythonExamples = `# Healthcare API Python Examples

import requests
import json
from typing import Optional, Dict, List

class HealthcareAPI:
    def __init__(self, base_url: str, api_key: Optional[str] = None):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.access_token = None
        self.session = requests.Session()
    
    def login(self, email: str, password: str, remember_me: bool = False) -> Dict:
        """Authenticate with the Healthcare API"""
        url = f"{self.base_url}/auth/login"
        
        payload = {
            "email": email,
            "password": password,
            "remember_me": remember_me
        }
        
        response = self.session.post(url, json=payload)
        response.raise_for_status()
        
        data = response.json()
        if data.get('success'):
            self.access_token = data['data']['access_token']
            # Update session headers for subsequent requests
            self.session.headers.update({
                'Authorization': f'Bearer {self.access_token}'
            })
        
        return data
    
    def get_patients(self, page: int = 1, limit: int = 20, 
                    search: Optional[str] = None, 
                    facility_id: Optional[str] = None) -> Dict:
        """Retrieve paginated list of patients"""
        url = f"{self.base_url}/api/v1/patients"
        
        params = {
            'page': page,
            'limit': limit
        }
        
        if search:
            params['search'] = search
        if facility_id:
            params['facility_id'] = facility_id
        
        response = self.session.get(url, params=params)
        response.raise_for_status()
        
        return response.json()
    
    def create_patient(self, patient_data: Dict) -> Dict:
        """Create a new patient record"""
        url = f"{self.base_url}/api/v1/patients"
        
        response = self.session.post(url, json=patient_data)
        response.raise_for_status()
        
        return response.json()
    
    def get_facilities(self, facility_type: Optional[str] = None) -> Dict:
        """Retrieve list of healthcare facilities"""
        url = f"{self.base_url}/api/v1/facilities"
        
        params = {}
        if facility_type:
            params['facility_type'] = facility_type
        
        response = self.session.get(url, params=params)
        response.raise_for_status()
        
        return response.json()

# Usage Example
def main():
    # Initialize the API client
    api = HealthcareAPI('${baseUrl}')
    
    try:
        # Login
        login_result = api.login(
            email='doctor@healthcarecorp.com',
            password='SecurePass123!',
            remember_me=True
        )
        
        print("Login successful:", login_result['success'])
        
        # Get patients
        patients = api.get_patients(page=1, limit=10, search='John')
        print(f"Found {len(patients['data'])} patients")
        
        # Create a new patient
        new_patient = {
            "first_name": "Jane",
            "last_name": "Smith",
            "date_of_birth": "1990-05-15",
            "facility_id": "123e4567-e89b-12d3-a456-426614174000",
            "phone": "+1-555-0456",
            "email": "jane.smith@email.com"
        }
        
        result = api.create_patient(new_patient)
        print("Patient created:", result['success'])
        
        # Get facilities
        facilities = api.get_facilities(facility_type='hospital')
        print(f"Found {len(facilities['data'])} hospitals")
        
    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error: {e}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()`;

    // SDK example (TypeScript)
    const sdkExamples = `// Healthcare API TypeScript SDK

export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface Patient {
  id?: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  medical_record_number?: string;
  facility_id: string;
  phone?: string;
  email?: string;
  status?: 'active' | 'inactive' | 'discharged';
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  search?: string;
  facility_id?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export class HealthcareSDK {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\\/$/, '');
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<ApiResponse<{
    user: any;
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }>> {
    const response = await this.makeRequest<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success) {
      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;
    }

    return response;
  }

  async logout(): Promise<void> {
    await this.makeRequest('/auth/logout', { method: 'POST' });
    this.accessToken = null;
    this.refreshToken = null;
  }

  // Patient management methods
  async getPatients(options: PaginationOptions = {}): Promise<ApiResponse<Patient[]>> {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = \`/api/v1/patients\${queryString ? \`?\${queryString}\` : ''}\`;
    
    return this.makeRequest<Patient[]>(endpoint);
  }

  async createPatient(patientData: Omit<Patient, 'id' | 'medical_record_number'>): Promise<ApiResponse<Patient>> {
    return this.makeRequest<Patient>('/api/v1/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
  }

  async getPatient(patientId: string): Promise<ApiResponse<Patient>> {
    return this.makeRequest<Patient>(\`/api/v1/patients/\${patientId}\`);
  }

  async updatePatient(patientId: string, updates: Partial<Patient>): Promise<ApiResponse<Patient>> {
    return this.makeRequest<Patient>(\`/api/v1/patients/\${patientId}\`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Facility management methods
  async getFacilities(facilityType?: string): Promise<ApiResponse<any[]>> {
    const params = facilityType ? \`?facility_type=\${facilityType}\` : '';
    return this.makeRequest<any[]>(\`/api/v1/facilities\${params}\`);
  }

  // Private helper methods
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = \`\${this.baseUrl}\${endpoint}\`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken && !endpoint.includes('/auth/login')) {
      headers['Authorization'] = \`Bearer \${this.accessToken}\`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    return response.json();
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }
}

// Usage Example
const sdk = new HealthcareSDK('${baseUrl}');

async function exampleUsage() {
  try {
    // Login
    const loginResponse = await sdk.login({
      email: 'doctor@healthcarecorp.com',
      password: 'SecurePass123!',
      remember_me: true
    });

    console.log('Logged in:', loginResponse.success);

    // Get patients
    const patients = await sdk.getPatients({
      page: 1,
      limit: 20,
      search: 'John'
    });

    console.log('Patients found:', patients.data.length);

    // Create patient
    const newPatient = {
      first_name: 'Alice',
      last_name: 'Johnson',
      date_of_birth: '1988-12-10',
      facility_id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'alice.johnson@email.com'
    };

    const result = await sdk.createPatient(newPatient);
    console.log('Patient created:', result.success);

  } catch (error) {
    console.error('SDK Error:', error);
  }
}`;

    return {
      curl: curlExamples,
      javascript: jsExamples,
      react: reactExamples,
      python: pythonExamples,
      sdk: sdkExamples
    };
  };

  const examples = generateCodeExamples();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {apiDetails.name}
            <Badge variant="outline">v{apiDetails.version}</Badge>
            <Badge variant="secondary">{apiDetails.category}</Badge>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="p-8 text-center">Loading API details...</div>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
              <TabsTrigger value="authentication">Auth</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="schema">Schema</TabsTrigger>
              <TabsTrigger value="architecture">Architecture</TabsTrigger>
              <TabsTrigger value="examples">Code</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      API Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div><strong>Name:</strong> {apiDetails.name}</div>
                    <div><strong>Version:</strong> {apiDetails.version}</div>
                    <div><strong>Category:</strong> {apiDetails.category}</div>
                    <div><strong>Base URL:</strong> <code className="bg-muted px-1 rounded text-sm">{apiDetails.base_url}</code></div>
                    <div><strong>Description:</strong> {apiDetails.description}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      API Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div><strong>Endpoints:</strong> {apiDetails.endpoints.length}</div>
                    <div><strong>Database Tables:</strong> {apiDetails.database_schema.tables.length}</div>
                    <div><strong>Auth Methods:</strong> {apiDetails.security_config.authentication_methods.length}</div>
                    <div><strong>Rate Limit:</strong> {apiDetails.rate_limits.requests_per_hour}/hour</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Rate Limits & Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div><strong>Requests/Hour:</strong> {apiDetails.rate_limits.requests_per_hour.toLocaleString()}</div>
                    <div><strong>Requests/Day:</strong> {apiDetails.rate_limits.requests_per_day.toLocaleString()}</div>
                    <div><strong>Burst Limit:</strong> {apiDetails.rate_limits.burst_limit}</div>
                    <div><strong>Rate Headers:</strong> {apiDetails.rate_limits.rate_limit_headers.length}</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="endpoints" className="space-y-4">
              {apiDetails.endpoints.length > 0 ? (
                <div className="space-y-3">
                  {apiDetails.endpoints.map((endpoint) => (
                    <Card key={endpoint.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={
                              endpoint.method === 'GET' ? 'bg-green-50 text-green-700 border-green-200' :
                              endpoint.method === 'POST' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              endpoint.method === 'PUT' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                              endpoint.method === 'DELETE' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-gray-50 text-gray-700 border-gray-200'
                            }>{endpoint.method}</Badge>
                            <code className="text-sm bg-muted px-2 py-1 rounded font-mono">{endpoint.url}</code>
                          </div>
                          <div className="flex gap-1">
                            {endpoint.is_public && (
                              <Badge variant="secondary" className="text-xs">Public</Badge>
                            )}
                            {endpoint.authentication?.required && (
                              <Badge variant="outline" className="text-xs">Auth Required</Badge>
                            )}
                            {endpoint.authentication?.scopes && (
                              <Badge variant="outline" className="text-xs">
                                {endpoint.authentication.scopes.length} scopes
                              </Badge>
                            )}
                          </div>
                        </div>
                        <h5 className="font-medium">{endpoint.name}</h5>
                        <p className="text-sm text-muted-foreground mt-1">{endpoint.description}</p>
                        {endpoint.authentication?.scopes && (
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground mb-1">Required Scopes:</p>
                            <div className="flex flex-wrap gap-1">
                              {endpoint.authentication.scopes.map((scope: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">{scope}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No Endpoints Configured</h3>
                    <p className="text-muted-foreground">
                      This API has been published but no endpoints have been configured yet. 
                      Please add endpoints to make this API functional.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="authentication" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      Authentication Methods
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Supported Methods</h4>
                      <div className="space-y-2">
                        {apiDetails.security_config.authentication_methods.map((method, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <Badge variant="outline">{method.replace('_', ' ').toUpperCase()}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {method === 'bearer_token' && 'JWT Bearer tokens for secure API access'}
                              {method === 'api_key' && 'API keys for simple authentication'}
                              {method === 'oauth2' && 'OAuth 2.0 for third-party integrations'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Access Control
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Row-Level Security</span>
                      <Badge variant={apiDetails.security_config.access_control.rls_enabled ? "default" : "secondary"}>
                        {apiDetails.security_config.access_control.rls_enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Role-Based Access</span>
                      <Badge variant={apiDetails.security_config.access_control.role_based_access ? "default" : "secondary"}>
                        {apiDetails.security_config.access_control.role_based_access ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Facility-Level Access</span>
                      <Badge variant={apiDetails.security_config.access_control.facility_level_access ? "default" : "secondary"}>
                        {apiDetails.security_config.access_control.facility_level_access ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Audit Logging</span>
                      <Badge variant={apiDetails.security_config.access_control.audit_logging ? "default" : "secondary"}>
                        {apiDetails.security_config.access_control.audit_logging ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    RLS Policies ({apiDetails.rls_policies.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {apiDetails.rls_policies.map((policy) => (
                      <div key={policy.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-sm">{policy.policy_name}</h5>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs">{policy.table_name}</Badge>
                            <Badge variant="secondary" className="text-xs">{policy.operation}</Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{policy.description}</p>
                        <code className="text-xs bg-muted px-2 py-1 rounded block">{policy.condition}</code>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Encryption & Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Encryption Methods</h4>
                      <div className="space-y-1">
                        {apiDetails.security_config.encryption_methods.map((method, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Lock className="h-3 w-3 text-green-600" />
                            <span className="text-sm">{method}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Authorization Policies</h4>
                      <div className="space-y-1">
                        {apiDetails.security_config.authorization_policies.map((policy, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Shield className="h-3 w-3 text-blue-600" />
                            <span className="text-sm">{policy}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Data Protection
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Compliance & Protection</h4>
                      <div className="space-y-1">
                        {apiDetails.security_config.data_protection.map((protection, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-sm">{protection}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Data Mappings ({apiDetails.data_mappings.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {apiDetails.data_mappings.map((mapping) => (
                      <div key={mapping.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">{mapping.source_field}</code>
                            <span className="text-xs text-muted-foreground">→</span>
                            <code className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">{mapping.target_field}</code>
                          </div>
                          <Badge variant="outline" className="text-xs">{mapping.target_table}</Badge>
                        </div>
                        <div className="flex gap-2 text-xs">
                          <Badge variant="secondary" className="text-xs">{mapping.transformation}</Badge>
                          <span className="text-muted-foreground">{mapping.validation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schema" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Database Schema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {apiDetails.database_schema.tables.map((table) => (
                      <div key={table.name} className="border rounded-lg p-4">
                        <h5 className="font-medium mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {table.name}
                        </h5>
                        
                        <div className="mb-3">
                          <h6 className="text-sm font-medium mb-2">Columns ({table.columns.length})</h6>
                          <div className="space-y-1">
                            {table.columns.map((column) => (
                              <div key={column.name} className="flex items-center gap-2 text-sm">
                                <code className="bg-muted px-1 rounded text-xs">{column.name}</code>
                                <Badge variant="outline" className="text-xs">{column.type}</Badge>
                                {!column.nullable && <Badge variant="secondary" className="text-xs">NOT NULL</Badge>}
                                {column.default && <Badge variant="outline" className="text-xs">DEFAULT</Badge>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="architecture" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="h-5 w-5" />
                      Design Principles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {apiDetails.architecture.design_principles.map((principle, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm">{principle}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Architecture Patterns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {apiDetails.architecture.patterns.map((pattern, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Settings className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span className="text-sm">{pattern}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Scalability
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {apiDetails.architecture.scalability.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-orange-600 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Reliability
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {apiDetails.architecture.reliability.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="h-5 w-5" />
                      Technology Stack
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {apiDetails.architecture.technology_stack.map((tech, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Code className="h-4 w-4 text-purple-600 flex-shrink-0" />
                          <span className="text-sm">{tech}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Deployment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {apiDetails.architecture.deployment.map((deploy, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Server className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                          <span className="text-sm">{deploy}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="examples" className="space-y-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      cURL Examples
                      <Button size="sm" variant="outline" onClick={() => handleCopyCode(examples.curl)}>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm bg-muted p-3 rounded-lg overflow-x-auto">
                      <code>{examples.curl}</code>
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      JavaScript Examples
                      <Button size="sm" variant="outline" onClick={() => handleCopyCode(examples.javascript)}>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm bg-muted p-3 rounded-lg overflow-x-auto">
                      <code>{examples.javascript}</code>
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      React Hook Examples
                      <Button size="sm" variant="outline" onClick={() => handleCopyCode(examples.react)}>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm bg-muted p-3 rounded-lg overflow-x-auto">
                      <code>{examples.react}</code>
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Python Examples
                      <Button size="sm" variant="outline" onClick={() => handleCopyCode(examples.python)}>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm bg-muted p-3 rounded-lg overflow-x-auto">
                      <code>{examples.python}</code>
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      TypeScript SDK Example
                      <Button size="sm" variant="outline" onClick={() => handleCopyCode(examples.sdk)}>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm bg-muted p-3 rounded-lg overflow-x-auto">
                      <code>{examples.sdk}</code>
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ApiDetailsDialog;
