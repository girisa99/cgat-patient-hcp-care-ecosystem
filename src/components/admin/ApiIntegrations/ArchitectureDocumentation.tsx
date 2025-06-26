
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Users, 
  Shield, 
  ArrowRight, 
  Layers, 
  Settings,
  FileText,
  Lock,
  Server,
  Globe,
  ArrowDown,
  CheckCircle,
  AlertTriangle,
  Clock,
  Eye,
  UserCheck,
  Key,
  Activity
} from 'lucide-react';

export const ArchitectureDocumentation: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Healthcare Admin Portal Architecture</h2>
        <p className="text-muted-foreground">
          Comprehensive overview of the data architecture, security model, and service layer
        </p>
      </div>

      <Tabs defaultValue="data-flow" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="data-flow">Data Flow</TabsTrigger>
          <TabsTrigger value="user-management">User Management</TabsTrigger>
          <TabsTrigger value="security">Security Model</TabsTrigger>
          <TabsTrigger value="api-layer">API Layer</TabsTrigger>
          <TabsTrigger value="integration">Integration Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="data-flow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Hybrid Data Architecture Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Why Hybrid Architecture?</h4>
                <p className="text-sm text-muted-foreground">
                  The system uses a hybrid approach combining Supabase Auth with custom profile management 
                  to provide both security and flexibility for healthcare data management.
                </p>
              </div>

              {/* Animated Data Flow Visualization */}
              <div className="relative bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg p-6">
                <h4 className="font-semibold mb-4 text-center">Visual Data Flow Process</h4>
                
                {/* Step 1: User Registration */}
                <div className="flex items-center justify-center mb-6">
                  <div className="animate-fade-in">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold animate-pulse">
                        1
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-md border-2 border-blue-200 hover-scale">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">User Registration</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Data stored in auth.users
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mb-6">
                  <ArrowDown className="h-6 w-6 text-blue-500 animate-bounce" />
                </div>

                {/* Step 2: Profile Creation */}
                <div className="flex items-center justify-center mb-6">
                  <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold animate-pulse">
                        2
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-md border-2 border-green-200 hover-scale">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Trigger Activation</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Auto-creates profiles record
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mb-6">
                  <ArrowDown className="h-6 w-6 text-green-500 animate-bounce" style={{ animationDelay: '0.5s' }} />
                </div>

                {/* Step 3: Data Enrichment */}
                <div className="flex items-center justify-center mb-6">
                  <div className="animate-fade-in" style={{ animationDelay: '1s' }}>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold animate-pulse">
                        3
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-md border-2 border-purple-200 hover-scale">
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium">Data Enrichment</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Healthcare data added to profiles
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mb-6">
                  <ArrowDown className="h-6 w-6 text-purple-500 animate-bounce" style={{ animationDelay: '1s' }} />
                </div>

                {/* Step 4: Unified Access */}
                <div className="flex items-center justify-center">
                  <div className="animate-fade-in" style={{ animationDelay: '1.5s' }}>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold animate-pulse">
                        4
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-md border-2 border-orange-200 hover-scale">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-orange-600" />
                          <span className="text-sm font-medium">Unified API Access</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Edge function combines all data sources
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Traditional Table Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Database className="h-5 w-5 text-blue-600" />
                      auth.users
                    </CardTitle>
                    <Badge variant="outline" className="w-fit">Supabase Managed</Badge>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm">
                      <strong>Purpose:</strong> Core authentication
                    </div>
                    <div className="text-sm">
                      <strong>Contains:</strong>
                      <ul className="list-disc list-inside ml-2 text-xs">
                        <li>Email & password</li>
                        <li>Authentication tokens</li>
                        <li>Email verification status</li>
                        <li>Raw metadata (firstName, lastName)</li>
                      </ul>
                    </div>
                    <div className="text-sm">
                      <strong>Access:</strong> Edge functions only
                    </div>
                  </CardContent>
                </Card>

                <div className="flex items-center justify-center">
                  <ArrowRight className="h-8 w-8 text-muted-foreground animate-pulse" />
                </div>

                <Card className="border-green-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-600" />
                      profiles
                    </CardTitle>
                    <Badge variant="outline" className="w-fit">Custom Managed</Badge>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm">
                      <strong>Purpose:</strong> Extended user data
                    </div>
                    <div className="text-sm">
                      <strong>Contains:</strong>
                      <ul className="list-disc list-inside ml-2 text-xs">
                        <li>Healthcare-specific fields</li>
                        <li>Facility assignments</li>
                        <li>Department information</li>
                        <li>Phone, address, etc.</li>
                      </ul>
                    </div>
                    <div className="text-sm">
                      <strong>Access:</strong> Frontend + Edge functions
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user-management" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User & Role Management Architecture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-amber-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Key Architecture Decision</h4>
                <p className="text-sm text-muted-foreground">
                  <strong>External APIs target the `profiles` table</strong> because they cannot directly access 
                  Supabase's `auth.users` table. The `manage-user-profiles` edge function acts as the bridge, 
                  combining data from both sources to provide complete user objects.
                </p>
              </div>

              {/* Animated User Management Flow */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6">
                <h4 className="font-semibold mb-4 text-center">User Management Process Flow</h4>
                
                <div className="space-y-4">
                  {/* External API Flow */}
                  <div className="flex items-center gap-4">
                    <div className="animate-fade-in flex-shrink-0">
                      <div className="bg-blue-500 text-white p-2 rounded-lg">
                        <Globe className="h-5 w-5" />
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-blue-500 animate-pulse" />
                    <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                      <div className="bg-white p-3 rounded-lg border border-blue-200 shadow-sm hover-scale">
                        <div className="font-medium text-sm">External System</div>
                        <div className="text-xs text-muted-foreground">HR/EMR Integration</div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-blue-500 animate-pulse" style={{ animationDelay: '0.3s' }} />
                    <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
                      <div className="bg-white p-3 rounded-lg border border-green-200 shadow-sm hover-scale">
                        <div className="font-medium text-sm">profiles table</div>
                        <div className="text-xs text-muted-foreground">Direct access allowed</div>
                      </div>
                    </div>
                  </div>

                  {/* Internal Processing Flow */}
                  <div className="flex items-center gap-4">
                    <div className="animate-fade-in flex-shrink-0" style={{ animationDelay: '0.9s' }}>
                      <div className="bg-purple-500 text-white p-2 rounded-lg">
                        <Server className="h-5 w-5" />
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-purple-500 animate-pulse" style={{ animationDelay: '0.9s' }} />
                    <div className="animate-fade-in" style={{ animationDelay: '1.2s' }}>
                      <div className="bg-white p-3 rounded-lg border border-purple-200 shadow-sm hover-scale">
                        <div className="font-medium text-sm">Edge Function</div>
                        <div className="text-xs text-muted-foreground">manage-user-profiles</div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-purple-500 animate-pulse" style={{ animationDelay: '1.2s' }} />
                    <div className="animate-fade-in" style={{ animationDelay: '1.5s' }}>
                      <div className="bg-white p-3 rounded-lg border border-orange-200 shadow-sm hover-scale">
                        <div className="font-medium text-sm">Complete User Object</div>
                        <div className="text-xs text-muted-foreground">auth.users + profiles + roles</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Role Assignment Visualization */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Role Assignment Flow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div className="text-center animate-fade-in">
                      <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-2">
                        <UserCheck className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="text-sm font-medium">User Creation</div>
                      <div className="text-xs text-muted-foreground">auth.users</div>
                    </div>
                    
                    <div className="flex justify-center">
                      <ArrowRight className="h-4 w-4 text-muted-foreground animate-pulse" />
                    </div>
                    
                    <div className="text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
                      <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-2">
                        <Database className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="text-sm font-medium">Profile Trigger</div>
                      <div className="text-xs text-muted-foreground">Auto-created</div>
                    </div>
                    
                    <div className="flex justify-center">
                      <ArrowRight className="h-4 w-4 text-muted-foreground animate-pulse" style={{ animationDelay: '0.5s' }} />
                    </div>
                    
                    <div className="text-center animate-fade-in" style={{ animationDelay: '1s' }}>
                      <div className="bg-purple-100 p-3 rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-2">
                        <Shield className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="text-sm font-medium">Role Assignment</div>
                      <div className="text-xs text-muted-foreground">user_roles table</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Complete User Object Structure */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Complete User Object Structure</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`{
  // From auth.users (via edge function)
  "id": "uuid",
  "email": "user@example.com",
  "email_verified": true,
  
  // From profiles table (direct access)
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "department": "Cardiology",
  "facility_id": "uuid",
  
  // From role system (combined via edge function)
  "roles": [
    {
      "id": "uuid",
      "name": "healthcareStaff",
      "description": "Healthcare Staff Role"
    }
  ],
  
  // From module assignments
  "modules": [
    {
      "id": "uuid", 
      "name": "Patient Management",
      "description": "Patient care module"
    }
  ],
  
  // From permission system
  "permissions": [
    {
      "name": "patients.read",
      "source": "healthcareStaff"
    }
  ]
}`}
                  </pre>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Model & Protection Layers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Multi-Layer Security Approach</h4>
                <p className="text-sm text-muted-foreground">
                  The system implements multiple security layers including authentication, authorization, 
                  Row Level Security (RLS), rate limiting, and comprehensive audit logging to ensure 
                  healthcare data protection and compliance.
                </p>
              </div>

              {/* Security Layers Visualization */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-6">
                <h4 className="font-semibold mb-4 text-center">Security Protection Layers</h4>
                
                <div className="space-y-4">
                  {/* Layer 1: Authentication */}
                  <div className="animate-fade-in">
                    <div className="bg-white p-4 rounded-lg border-l-4 border-red-500 shadow-sm hover-scale">
                      <div className="flex items-center gap-3">
                        <div className="bg-red-100 p-2 rounded-full">
                          <Key className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">Layer 1: Authentication</div>
                          <div className="text-xs text-muted-foreground">JWT Token Validation</div>
                        </div>
                        <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                      </div>
                    </div>
                  </div>

                  {/* Layer 2: Authorization */}
                  <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500 shadow-sm hover-scale">
                      <div className="flex items-center gap-3">
                        <div className="bg-orange-100 p-2 rounded-full">
                          <Shield className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">Layer 2: Authorization</div>
                          <div className="text-xs text-muted-foreground">Role & Permission Checks</div>
                        </div>
                        <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                      </div>
                    </div>
                  </div>

                  {/* Layer 3: RLS Policies */}
                  <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
                    <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-500 shadow-sm hover-scale">
                      <div className="flex items-center gap-3">
                        <div className="bg-yellow-100 p-2 rounded-full">
                          <Database className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">Layer 3: Row Level Security</div>
                          <div className="text-xs text-muted-foreground">Database-Level Access Control</div>
                        </div>
                        <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                      </div>
                    </div>
                  </div>

                  {/* Layer 4: Rate Limiting */}
                  <div className="animate-fade-in" style={{ animationDelay: '0.9s' }}>
                    <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500 shadow-sm hover-scale">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Clock className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">Layer 4: Rate Limiting</div>
                          <div className="text-xs text-muted-foreground">Request Throttling & DoS Protection</div>
                        </div>
                        <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                      </div>
                    </div>
                  </div>

                  {/* Layer 5: Audit Logging */}
                  <div className="animate-fade-in" style={{ animationDelay: '1.2s' }}>
                    <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500 shadow-sm hover-scale">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-full">
                          <Activity className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">Layer 5: Audit Logging</div>
                          <div className="text-xs text-muted-foreground">Comprehensive Activity Tracking</div>
                        </div>
                        <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rate Limiting Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Rate Limiting & DoS Protection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h5 className="font-semibold">Default Rate Limits</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="text-sm">Authentication Attempts</span>
                          <Badge variant="outline">5/min</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="text-sm">API Requests</span>
                          <Badge variant="outline">100/min</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="text-sm">Data Export Operations</span>
                          <Badge variant="outline">10/hour</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="text-sm">File Upload Operations</span>
                          <Badge variant="outline">20/hour</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h5 className="font-semibold">Rate Limiting Features</h5>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Per-user tracking</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Sliding window algorithm</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Automatic cleanup</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Configurable thresholds</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Graceful error responses</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-800">Rate Limit Implementation</span>
                    </div>
                    <p className="text-sm text-amber-700">
                      Rate limiting is implemented using an in-memory Map with sliding window tracking. 
                      For production environments, consider using Redis or a distributed cache for 
                      multi-instance deployments.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* RLS Policy Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">RLS Policy Categories</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Badge variant="outline" className="mb-1">Authentication Policies</Badge>
                      <div className="text-sm text-muted-foreground">
                        Ensure only authenticated users can access data
                      </div>
                      <code className="text-xs bg-muted px-2 py-1 rounded block mt-1">
                        auth.uid() IS NOT NULL
                      </code>
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-1">Role-Based Policies</Badge>
                      <div className="text-sm text-muted-foreground">
                        Restrict access based on user roles
                      </div>
                      <code className="text-xs bg-muted px-2 py-1 rounded block mt-1">
                        user_has_role(auth.uid(), 'superAdmin')
                      </code>
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-1">Facility-Based Policies</Badge>
                      <div className="text-sm text-muted-foreground">
                        Limit access to facility-specific data
                      </div>
                      <code className="text-xs bg-muted px-2 py-1 rounded block mt-1">
                        facility_id IN (SELECT facility_id FROM user_facility_access WHERE user_id = auth.uid())
                      </code>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Security Functions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <code className="text-sm font-mono">user_has_role()</code>
                      <div className="text-xs text-muted-foreground">
                        Checks if user has specific role
                      </div>
                    </div>
                    <div>
                      <code className="text-sm font-mono">user_has_permission()</code>
                      <div className="text-xs text-muted-foreground">
                        Verifies user permissions with overrides
                      </div>
                    </div>
                    <div>
                      <code className="text-sm font-mono">get_user_accessible_facilities()</code>
                      <div className="text-xs text-muted-foreground">
                        Returns facilities user can access
                      </div>
                    </div>
                    <div>
                      <code className="text-sm font-mono">validateModulePermission()</code>
                      <div className="text-xs text-muted-foreground">
                        Frontend permission validation with rate limiting
                      </div>
                    </div>
                    <div>
                      <code className="text-sm font-mono">checkRateLimit()</code>
                      <div className="text-xs text-muted-foreground">
                        Client-side rate limiting for sensitive operations
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Security Best Practices */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Security Monitoring & Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-2">
                        <Activity className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="font-semibold text-sm">Real-time Monitoring</div>
                      <div className="text-xs text-muted-foreground">All actions logged and tracked</div>
                    </div>
                    <div className="text-center">
                      <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-2">
                        <Shield className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="font-semibold text-sm">HIPAA Compliance</div>
                      <div className="text-xs text-muted-foreground">Healthcare data protection</div>
                    </div>
                    <div className="text-center">
                      <div className="bg-purple-100 p-3 rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-2">
                        <Lock className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="font-semibold text-sm">Data Encryption</div>
                      <div className="text-xs text-muted-foreground">At rest and in transit</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-layer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                API Service Layer Architecture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-600" />
                      Edge Functions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm space-y-1">
                      <div><strong>manage-user-profiles</strong></div>
                      <div className="text-xs text-muted-foreground">
                        Combines auth.users + profiles + roles
                      </div>
                    </div>
                    <div className="text-sm space-y-1">
                      <div><strong>manage-user-roles</strong></div>
                      <div className="text-xs text-muted-foreground">
                        Role assignment and management
                      </div>
                    </div>
                    <div className="text-sm space-y-1">
                      <div><strong>audit-logs</strong></div>
                      <div className="text-xs text-muted-foreground">
                        Comprehensive audit trail
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="h-5 w-5 text-green-600" />
                      Internal APIs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm space-y-1">
                      <div><strong>User Management</strong></div>
                      <div className="text-xs text-muted-foreground">
                        CRUD operations for users
                      </div>
                    </div>
                    <div className="text-sm space-y-1">
                      <div><strong>Role Management</strong></div>
                      <div className="text-xs text-muted-foreground">
                        Role and permission APIs
                      </div>
                    </div>
                    <div className="text-sm space-y-1">
                      <div><strong>Facility Management</strong></div>
                      <div className="text-xs text-muted-foreground">
                        Healthcare facility APIs
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lock className="h-5 w-5 text-purple-600" />
                      Security Layer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm space-y-1">
                      <div><strong>Authentication</strong></div>
                      <div className="text-xs text-muted-foreground">
                        JWT token validation
                      </div>
                    </div>
                    <div className="text-sm space-y-1">
                      <div><strong>Authorization</strong></div>
                      <div className="text-xs text-muted-foreground">
                        Role and permission checks
                      </div>
                    </div>
                    <div className="text-sm space-y-1">
                      <div><strong>Rate Limiting</strong></div>
                      <div className="text-xs text-muted-foreground">
                        Request throttling protection
                      </div>
                    </div>
                    <div className="text-sm space-y-1">
                      <div><strong>Audit Logging</strong></div>
                      <div className="text-xs text-muted-foreground">
                        All operations logged
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">API Request Flow with Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg animate-fade-in">
                      <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <strong>Client Request:</strong> Frontend sends authenticated request
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
                      <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <strong>Rate Limit Check:</strong> Validate request frequency and patterns
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg animate-fade-in" style={{ animationDelay: '0.4s' }}>
                      <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <strong>Authentication:</strong> JWT token validated
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg animate-fade-in" style={{ animationDelay: '0.6s' }}>
                      <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <strong>Authorization:</strong> Role and permissions checked
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg animate-fade-in" style={{ animationDelay: '0.8s' }}>
                      <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">5</div>
                      <div>
                        <strong>Data Access:</strong> RLS policies applied automatically
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg animate-fade-in" style={{ animationDelay: '1s' }}>
                      <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">6</div>
                      <div>
                        <strong>Audit Logging:</strong> Operation recorded for compliance
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg animate-fade-in" style={{ animationDelay: '1.2s' }}>
                      <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">7</div>
                      <div>
                        <strong>Response:</strong> Filtered data returned to client
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Integration Guide & Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Integration Checklist</h4>
                <p className="text-sm text-muted-foreground">
                  Follow these guidelines when integrating with the healthcare admin portal APIs.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">External API Integration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Badge variant="outline">✅ Do</Badge>
                      <ul className="text-sm space-y-1 ml-4">
                        <li>• Target the `profiles` table for user data</li>
                        <li>• Use proper authentication headers</li>
                        <li>• Validate data before sending</li>
                        <li>• Handle rate limiting gracefully</li>
                        <li>• Implement proper error handling</li>
                        <li>• Respect rate limits (100 req/min default)</li>
                        <li>• Include audit trail information</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <Badge variant="destructive">❌ Don't</Badge>
                      <ul className="text-sm space-y-1 ml-4">
                        <li>• Try to access `auth.users` directly</li>
                        <li>• Bypass security validations</li>
                        <li>• Send sensitive data in query params</li>
                        <li>• Ignore RLS policy requirements</li>
                        <li>• Exceed rate limiting thresholds</li>
                        <li>• Skip audit logging requirements</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Security Integration Requirements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm space-y-2">
                      <div>
                        <strong>Authentication Headers:</strong>
                        <div className="bg-muted p-2 rounded text-xs font-mono">
                          Authorization: Bearer {`{jwt_token}`}<br/>
                          X-Client-Info: {`{client_identifier}`}
                        </div>
                      </div>
                      <div>
                        <strong>Rate Limiting Headers:</strong>
                        <div className="bg-muted p-2 rounded text-xs font-mono">
                          X-RateLimit-Limit: 100<br/>
                          X-RateLimit-Remaining: 95<br/>
                          X-RateLimit-Reset: 1640995200
                        </div>
                      </div>
                      <div>
                        <strong>Security Requirements:</strong>
                        <ul className="list-disc list-inside text-xs ml-2">
                          <li>HTTPS only connections</li>
                          <li>JWT token validation</li>
                          <li>Role-based authorization</li>
                          <li>Request rate monitoring</li>
                          <li>Audit trail compliance</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Common Integration Scenarios</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h5 className="font-semibold">HR System Integration</h5>
                    <p className="text-sm text-muted-foreground">
                      Sync employee data from HR system to profiles table, maintain role assignments with rate limiting
                    </p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h5 className="font-semibold">EMR System Integration</h5>
                    <p className="text-sm text-muted-foreground">
                      Import healthcare provider information, link to facilities and departments with security validation
                    </p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h5 className="font-semibold">Identity Provider Integration</h5>
                    <p className="text-sm text-muted-foreground">
                      Federate authentication while maintaining local profile and role data with audit compliance
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Testing & Validation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold mb-2">API Testing</h5>
                      <ul className="text-sm space-y-1">
                        <li>• Use Postman collections</li>
                        <li>• Test with different user roles</li>
                        <li>• Validate data transformations</li>
                        <li>• Check RLS policy enforcement</li>
                        <li>• Test rate limiting behavior</li>
                        <li>• Verify audit log generation</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold mb-2">Security Validation</h5>
                      <ul className="text-sm space-y-1">
                        <li>• Verify authentication flow</li>
                        <li>• Test authorization boundaries</li>
                        <li>• Validate rate limit responses</li>
                        <li>• Check audit trail completeness</li>
                        <li>• Test facility access controls</li>
                        <li>• Verify data encryption</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
