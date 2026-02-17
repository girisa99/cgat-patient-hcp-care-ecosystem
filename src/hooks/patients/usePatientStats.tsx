
/**
 * Patient statistics hook
 */
export const usePatientStats = (patients: any[]) => {
  const getPatientStatistics = () => {
    const total = patients.length;
    const caregivers = patients.filter((p: any) => 
      p.user_roles?.some((ur: any) => ur.roles?.name === 'patientCaregiver')
    ).length;
    const directPatients = patients.filter((p: any) => 
      p.user_roles?.some((ur: any) => ur.roles?.name === 'patient')
    ).length;
    
    const recentlyCreated = patients.filter((p: any) => {
      const created = new Date(p.created_at);
      const week = new Date();
      week.setDate(week.getDate() - 7);
      return created > week;
    }).length;

    const facilityBreakdown = patients.reduce((acc: any, patient: any) => {
      const facilityName = patient.facilities?.name || 'Unassigned';
      acc[facilityName] = (acc[facilityName] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      caregivers,
      directPatients,
      recentlyCreated,
      facilityBreakdown,
      active: patients.filter((p: any) => p.is_active !== false).length,
      inactive: patients.filter((p: any) => p.is_active === false).length
    };
  };

  return {
    getPatientStatistics
  };
};
