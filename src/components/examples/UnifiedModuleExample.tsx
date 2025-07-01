
import React, { useState } from 'react';
import { ExtensibleModuleTemplate } from '@/templates/components/ExtensibleModuleTemplate';
import { useTypeSafeModuleTemplate } from '@/templates/hooks/useTypeSafeModuleTemplate';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Universal Module Example
 * 
 * This example shows how any module can now use the unified template system.
 * This same pattern works for ALL modules: Patients, Users, Facilities, etc.
 */
const UnifiedModuleExample: React.FC = () => {
  // Example: Using the template for any module
  const patientsTemplate = useTypeSafeModuleTemplate({
    tableName: 'profiles',
    moduleName: 'Patients',
    requiredFields: ['first_name', 'email', 'role'],
    customValidation: (data) => data.role === 'patient'
  });

  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Custom columns for this specific use case
  const customColumns = [
    {
      key: 'patient_info',
      header: 'Patient Information',
      render: (item: any) => (
        <div className="space-y-1">
          <div className="font-medium">{item.first_name} {item.last_name}</div>
          <div className="text-sm text-muted-foreground">{item.email}</div>
          <Badge variant="outline">{item.role}</Badge>
        </div>
      )
    },
    {
      key: 'status_enhanced',
      header: 'Status & Activity',
      render: (item: any) => (
        <div className="space-y-1">
          <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
            {item.status}
          </Badge>
          <div className="text-xs text-muted-foreground">
            Created: {new Date(item.created_at).toLocaleDateString()}
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">🎯 Phase 1 Complete: Unified Module System</h1>
        <p className="text-muted-foreground mt-2">
          This example demonstrates the new unified template system. The same code pattern
          now works for ALL modules with zero duplication.
        </p>
      </div>

      <ExtensibleModuleTemplate
        config={{
          tableName: 'profiles',
          moduleName: 'Patients',
          requiredFields: ['first_name', 'email', 'role']
        }}
        data={patientsTemplate.items}
        isLoading={patientsTemplate.isLoading}
        statistics={patientsTemplate.getStatistics()}
        onAdd={() => setShowCreateDialog(true)}
        onEdit={(item) => console.log('Edit patient:', item)}
        onDelete={(item) => console.log('Delete patient:', item)}
        onSearch={patientsTemplate.searchItems}
        customColumns={customColumns}
        customActions={
          <Button variant="outline" onClick={() => patientsTemplate.refetch()}>
            Refresh Data
          </Button>
        }
        enableSearch={true}
        enableStats={true}
        searchPlaceholder="Search patients by name, email..."
      />

      {/* Summary of Phase 1 Achievements */}
      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-semibold text-green-800 mb-2">✅ Phase 1 Complete - Achievements:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-green-700">Template Unification:</h4>
            <ul className="list-disc list-inside text-green-600 space-y-1">
              <li>Single useTypeSafeModuleTemplate for all modules</li>
              <li>Universal ExtensibleModuleTemplate component</li>
              <li>Intelligent column detection and rendering</li>
              <li>Built-in search, stats, and validation</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-green-700">Backward Compatibility:</h4>
            <ul className="list-disc list-inside text-green-600 space-y-1">
              <li>All existing hooks maintained their API</li>
              <li>No breaking changes to existing code</li>
              <li>Enhanced with new universal capabilities</li>
              <li>Legacy template patterns still work</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedModuleExample;
