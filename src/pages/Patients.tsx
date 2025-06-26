
import React, { useState } from 'react';
import { PatientManagementHeader } from '@/components/admin/PatientManagement/PatientManagementHeader';
import { PatientSearch } from '@/components/admin/PatientManagement/PatientSearch';
import { PatientsList } from '@/components/admin/PatientManagement/PatientsList';
import { LoadingState } from '@/components/admin/shared/LoadingState';
import { ErrorState } from '@/components/admin/shared/ErrorState';
import { useConsistentPatients } from '@/hooks/useConsistentPatients';
import { useToast } from '@/hooks/use-toast';

// New automated capabilities
import { useRealtime } from '@/hooks/useRealtime';
import { useBulkOperations } from '@/hooks/useBulkOperations';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';
import { useMobileFeatures } from '@/hooks/useMobileFeatures';

const Patients = () => {
  const { patients, isLoading, error, deactivatePatient, isDeactivating, meta } = useConsistentPatients();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  // Automatically enabled real-time updates
  useRealtime({
    tableName: 'profiles',
    moduleName: 'Patients',
    enableNotifications: true,
    onEvent: (event) => {
      console.log('📡 Real-time patient update:', event);
    }
  });

  // Automatically enabled bulk operations
  const {
    bulkUpdate,
    bulkDelete,
    isProcessing: isBulkProcessing,
    progress: bulkProgress
  } = useBulkOperations({
    tableName: 'profiles',
    onSuccess: (result) => {
      toast({
        title: "Bulk Operation Completed",
        description: `Successfully processed ${result.processedCount} patients`,
      });
    }
  });

  // Automatically enabled advanced search
  const {
    data: searchResults,
    setSearchTerm: setAdvancedSearchTerm,
    isLoading: isSearching,
    clearSearch,
    addFilter,
    searchableFields
  } = useAdvancedSearch({
    tableName: 'profiles',
    enableAutoSearch: true,
    debounceMs: 300
  });

  // Automatically enabled mobile features
  const {
    isNativeApp,
    isOnline,
    showLocalNotification,
    capabilities
  } = useMobileFeatures();

  // Use search results if available, otherwise use regular patients
  const displayPatients = searchTerm ? searchResults : patients;

  const filteredPatients = displayPatients?.filter(patient =>
    patient.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm)
  ) || [];

  const handleViewPatient = (patientId: string) => {
    toast({
      title: "View Patient",
      description: "Patient details view would open here.",
    });
    console.log('View patient:', patientId);
    
    // Mobile notification if supported
    if (isNativeApp) {
      showLocalNotification('Patient Viewed', 'Patient details opened');
    }
  };

  const handleEditPatient = (patientId: string) => {
    toast({
      title: "Edit Patient",
      description: "Patient edit form would open here.",
    });
    console.log('Edit patient:', patientId);
  };

  const handleDeactivatePatient = (patientId: string, patientName: string) => {
    if (window.confirm(`Are you sure you want to deactivate ${patientName}?`)) {
      deactivatePatient(patientId);
    }
  };

  // Bulk operations handlers
  const handleBulkDeactivate = async (selectedPatients: string[]) => {
    const patientsToUpdate = selectedPatients.map(id => ({
      id,
      is_active: false
    }));
    
    await bulkUpdate(patientsToUpdate);
  };

  // Advanced search handler
  const handleAdvancedSearch = (term: string) => {
    setSearchTerm(term);
    setAdvancedSearchTerm(term);
  };

  if (isLoading) {
    return (
      <LoadingState
        title="Patient Management"
        description="Loading patient records..."
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Patient Management"
        error={error}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced header with real-time status */}
      <PatientManagementHeader 
        meta={{
          ...meta,
          totalPatients: patients?.length || 0,
          realtimeEnabled: true,
          isOnline,
          platform: capabilities.platform,
          bulkOperationsEnabled: true,
          advancedSearchEnabled: true
        }} 
      />

      {/* Enhanced search with advanced capabilities */}
      <PatientSearch
        searchTerm={searchTerm}
        setSearchTerm={handleAdvancedSearch}
        // New props for advanced search
        searchableFields={searchableFields}
        isSearching={isSearching}
        onClearSearch={clearSearch}
        onAddFilter={addFilter}
      />

      {/* Enhanced patients list with bulk operations */}
      <PatientsList
        patients={filteredPatients}
        onView={handleViewPatient}
        onEdit={handleEditPatient}
        onDeactivate={handleDeactivatePatient}
        isDeactivating={isDeactivating}
        isLoading={isLoading}
        searchTerm={searchTerm}
        // New props for bulk operations
        onBulkDeactivate={handleBulkDeactivate}
        isBulkProcessing={isBulkProcessing}
        bulkProgress={bulkProgress}
        // Mobile features
        isMobileApp={isNativeApp}
        isOnline={isOnline}
      />
      
      {/* Real-time status indicator */}
      {!isOnline && (
        <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg">
          Offline Mode - Changes will sync when online
        </div>
      )}
    </div>
  );
};

export default Patients;
