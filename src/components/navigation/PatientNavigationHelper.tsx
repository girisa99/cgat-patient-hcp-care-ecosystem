import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, FileText, Database, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PatientNavigationHelper: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 p-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Patient Data Navigation Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-blue-700">
            <p className="mb-3"><strong>You're currently viewing:</strong> Patient Onboarding Workflow</p>
            <p><strong>This page shows:</strong> Active enrollment processes and workflow steps</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Page - Patient Onboarding */}
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-orange-600" />
                  <h4 className="font-semibold text-orange-800">Patient Onboarding Workflow</h4>
                </div>
                <p className="text-sm text-orange-700 mb-3">
                  Current page - Shows enrollment progress and workflow steps
                </p>
                <div className="text-xs text-orange-600 space-y-1">
                  <p>• Shows "Patient Name Pending" for active workflows</p>
                  <p>• Tracks enrollment progress (0/5 steps)</p>
                  <p>• Data from: treatment_center_onboarding table</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 w-full border-orange-300"
                  disabled
                >
                  Currently Here
                </Button>
              </CardContent>
            </Card>

            {/* Enhanced Patient Dashboard */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <h4 className="font-semibold text-green-800">Enhanced Patient Dashboard</h4>
                </div>
                <p className="text-sm text-green-700 mb-3">
                  Complete patient management with names, CRUD operations
                </p>
                <div className="text-xs text-green-600 space-y-1">
                  <p>• Shows actual patient names and details</p>
                  <p>• Enrollment types: MCP, Conversational, AI, Online</p>
                  <p>• CRUD operations: Edit, Deactivate, Change Type</p>
                  <p>• Data from: profiles table (superadmin managed)</p>
                </div>
                <Button 
                  size="sm" 
                  className="mt-3 w-full bg-green-600 hover:bg-green-700"
                  onClick={() => navigate('/patients')}
                >
                  <ArrowRight className="h-4 w-4 mr-1" />
                  Go to Patient Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Data Relationship Explanation */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-4 w-4" />
                Data Relationships Explained
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <h5 className="font-semibold mb-2">Patient Names Source:</h5>
                <div className="bg-white p-3 rounded border">
                  <p><strong>profiles table</strong> (managed by superadmin)</p>
                  <p className="text-xs text-muted-foreground">
                    Contains: first_name, last_name, email, enrollment_type, enrollment_status
                  </p>
                  <p className="text-xs text-green-600 mt-1">✅ 5 patients with complete names</p>
                </div>
              </div>
              
              <div className="text-sm">
                <h5 className="font-semibold mb-2">Workflow Data Source:</h5>
                <div className="bg-white p-3 rounded border">
                  <p><strong>treatment_center_onboarding table</strong></p>
                  <p className="text-xs text-muted-foreground">
                    Contains: workflow steps, business info, enrollment progress
                  </p>
                  <p className="text-xs text-orange-600 mt-1">⚠️ 185 workflow records (business data, not patient names)</p>
                </div>
              </div>

              <div className="bg-blue-100 p-3 rounded border-blue-200">
                <h5 className="font-semibold text-blue-800 mb-1">Key Point:</h5>
                <p className="text-xs text-blue-700">
                  Patient names come from the <strong>profiles table</strong> (superadmin system), 
                  not from the onboarding workflow. The enhanced dashboard connects this data 
                  to show complete patient information with enrollment capabilities.
                </p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};