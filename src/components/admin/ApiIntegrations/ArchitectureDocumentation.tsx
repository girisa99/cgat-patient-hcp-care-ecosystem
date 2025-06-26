
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
  Globe
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
                  <ArrowRight className="h-8 w-8 text-muted-foreground" />
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

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Data Flow Process</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <strong>User Registration:</strong> Data stored in auth.users with metadata
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <strong>Profile Creation:</strong> Trigger automatically creates profiles record
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <strong>Data Enrichment:</strong> Additional healthcare data added to profiles
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                    <div>
                      <strong>Unified Access:</strong> Edge function combines auth.users + profiles + roles
                    </div>
                  </div>
                </div>
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Data Mapping Strategy</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Badge variant="outline" className="mb-2">External API Integration</Badge>
                      <div className="text-sm space-y-1">
                        <div><strong>Source:</strong> External System</div>
                        <div><strong>Target:</strong> profiles table</div>
                        <div><strong>Reason:</strong> Direct auth.users access restricted</div>
                      </div>
                    </div>
                    <div className="border-t pt-3">
                      <Badge variant="outline" className="mb-2">Internal Processing</Badge>
                      <div className="text-sm space-y-1">
                        <div><strong>Source:</strong> auth.users + profiles</div>
                        <div><strong>Process:</strong> Edge function merge</div>
                        <div><strong>Output:</strong> Complete user object</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-indigo-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Role Management Flow</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        <span>User created in auth.users</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        <span>Profile auto-created via trigger</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        <span>Roles assigned in user_roles table</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        <span>Permissions linked via role_permissions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        <span>Modules assigned via user_module_assignments</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Complete User Object Structure</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`{
  // From auth.users
  "id": "uuid",
  "email": "user@example.com",
  "email_verified": true,
  
  // From profiles  
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "department": "Cardiology",
  "facility_id": "uuid",
  
  // From user_roles + roles
  "roles": [
    {
      "id": "uuid",
      "name": "healthcareStaff",
      "description": "Healthcare Staff Role"
    }
  ],
  
  // From user_module_assignments + modules
  "modules": [
    {
      "id": "uuid", 
      "name": "Patient Management",
      "description": "Patient care module"
    }
  ],
  
  // From user_permissions + permissions
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
                Security Model & RLS Policies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Security First Approach</h4>
                <p className="text-sm text-muted-foreground">
                  Row Level Security (RLS) policies ensure that users can only access data they're authorized to see, 
                  with role-based permissions controlling what actions they can perform.
                </p>
              </div>

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
                      <code className="text-sm font-mono">get_user_effective_permissions()</code>
                      <div className="text-xs text-muted-foreground">
                        Lists all effective user permissions
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
                  <CardTitle className="text-lg">API Request Flow</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <strong>Client Request:</strong> Frontend sends authenticated request
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <strong>Authentication:</strong> JWT token validated
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <strong>Authorization:</strong> Role and permissions checked
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <strong>Data Access:</strong> RLS policies applied automatically
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">5</div>
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
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <Badge variant="destructive">❌ Don't</Badge>
                      <ul className="text-sm space-y-1 ml-4">
                        <li>• Try to access `auth.users` directly</li>
                        <li>• Bypass security validations</li>
                        <li>• Send sensitive data in query params</li>
                        <li>• Ignore RLS policy requirements</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Data Mapping Best Practices</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm space-y-2">
                      <div>
                        <strong>Field Mapping:</strong>
                        <div className="bg-muted p-2 rounded text-xs font-mono">
                          external.firstName → profiles.first_name<br/>
                          external.email → profiles.email<br/>
                          external.department → profiles.department
                        </div>
                      </div>
                      <div>
                        <strong>Data Transformation:</strong>
                        <ul className="list-disc list-inside text-xs ml-2">
                          <li>Normalize phone numbers</li>
                          <li>Validate email formats</li>
                          <li>Handle null/empty values</li>
                          <li>Apply business rules</li>
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
                      Sync employee data from HR system to profiles table, maintain role assignments
                    </p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h5 className="font-semibold">EMR System Integration</h5>
                    <p className="text-sm text-muted-foreground">
                      Import healthcare provider information, link to facilities and departments
                    </p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h5 className="font-semibold">Identity Provider Integration</h5>
                    <p className="text-sm text-muted-foreground">
                      Federate authentication while maintaining local profile and role data
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
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold mb-2">Data Validation</h5>
                      <ul className="text-sm space-y-1">
                        <li>• Verify user data completeness</li>
                        <li>• Check role assignments</li>
                        <li>• Validate facility associations</li>
                        <li>• Test permission inheritance</li>
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
