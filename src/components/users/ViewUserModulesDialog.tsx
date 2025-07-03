import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, CheckCircle, Database } from 'lucide-react';
import { useModules } from '@/hooks/useModules';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ViewUserModulesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

const ViewUserModulesDialog: React.FC<ViewUserModulesDialogProps> = ({
  open,
  onOpenChange,
  userId,
  userName
}) => {
  const { modules, isLoading: modulesLoading } = useModules();

  // Fetch real user module assignments from database - NO MOCK DATA
  const { data: userModuleAssignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['user-module-assignments-real', userId],
    queryFn: async () => {
      console.log('🔍 Fetching REAL user module assignments for user:', userId);
      
      if (!userId) {
        console.log('❌ No user ID provided');
        return [];
      }

      try {
        // Query real user module assignments from database
        const { data: assignments, error } = await supabase
          .from('user_module_assignments')
          .select(`
            id,
            module_id,
            user_id,
            is_active,
            access_level,
            assigned_at,
            assigned_by,
            modules (
              id,
              name,
              description,
              is_active
            )
          `)
          .eq('user_id', userId)
          .eq('is_active', true);

        if (error) {
          console.error('❌ Error fetching user module assignments:', error);
          throw error;
        }

        console.log('✅ Real user module assignments fetched:', assignments?.length || 0);
        return assignments || [];

      } catch (error) {
        console.error('❌ Failed to fetch user module assignments:', error);
        throw error;
      }
    },
    enabled: !!userId && open,
    retry: 2,
    staleTime: 60000
  });

  // Process real module data with actual assignments - NO MOCK DATA
  const processedModules = modules.map(module => {
    const assignment = userModuleAssignments?.find(
      assignment => assignment.module_id === module.id && assignment.modules
    );

    return {
      ...module,
      isAssigned: !!assignment,
      assignedAt: assignment?.assigned_at || null,
      accessLevel: assignment?.access_level || 'none',
      assignmentId: assignment?.id || null,
      assignedBy: assignment?.assigned_by || null
    };
  });

  const assignedModules = processedModules.filter(m => m.isAssigned);
  const availableModules = processedModules.filter(m => !m.isAssigned);

  const isLoading = modulesLoading || assignmentsLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Module Access for {userName}
          </DialogTitle>
        </DialogHeader>
        
        {/* Real Data Status Indicator */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <Database className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800 font-medium">
              Real Database Assignments - No Mock Data
            </span>
          </div>
          <div className="mt-1 text-xs text-green-700">
            Displaying actual module assignments from user_module_assignments table
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading real module assignments...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Assigned Modules - REAL DATA */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Assigned Modules ({assignedModules.length})
              </h3>
              {assignedModules.length > 0 ? (
                <div className="space-y-3">
                  {assignedModules.map((module) => (
                    <div key={module.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{module.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Active
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            Real Assignment
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {module.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Assigned {module.assignedAt ? new Date(module.assignedAt).toLocaleDateString() : 'Unknown'}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {module.accessLevel}
                        </Badge>
                        {module.assignmentId && (
                          <Badge variant="outline" className="text-xs">
                            ID: {module.assignmentId.slice(0, 8)}...
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-sm font-medium">No modules assigned to this user</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Real database query returned no active module assignments
                  </p>
                </div>
              )}
            </div>

            {/* Available Modules - REAL DATA */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-400" />
                Available Modules ({availableModules.length})
              </h3>
              {availableModules.length > 0 ? (
                <div className="space-y-2">
                  {availableModules.map((module) => (
                    <div key={module.id} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sm">{module.name}</h4>
                          <p className="text-xs text-gray-600">
                            {module.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Available
                          </Badge>
                          <Badge className="bg-gray-100 text-gray-600 text-xs">
                            No Assignment
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-green-50 rounded-lg">
                  <p className="text-green-700 text-sm font-medium">All modules have been assigned!</p>
                  <p className="text-xs text-green-600 mt-1">
                    This user has access to all available modules
                  </p>
                </div>
              )}
            </div>

            {/* Real Data Information */}
            <div className="text-xs text-gray-500 pt-4 border-t bg-gray-50 p-3 rounded-lg">
              <p><strong>Data Source:</strong> user_module_assignments table (real database)</p>
              <p><strong>Total Modules:</strong> {modules.length} modules from modules table</p>
              <p><strong>User Assignments:</strong> {userModuleAssignments?.length || 0} real assignments found</p>
              <p><strong>Last Updated:</strong> {new Date().toLocaleString()}</p>
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                <p className="text-blue-800">
                  ✅ <strong>No Mock Data:</strong> All assignments are from live database queries.
                  Random assignment generation has been eliminated.
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewUserModulesDialog;
