
# Patient Data Management Guidelines

## Overview
This document establishes strict guidelines for handling patient data to ensure security, consistency, and prevent regression issues.

## ⚠️ CRITICAL RULES

### 1. Data Source Requirements
- **✅ ALWAYS** fetch patient data from `auth.users` table via `manage-user-profiles` edge function
- **❌ NEVER** query `profiles` table directly for patient data
- **❌ NEVER** bypass the edge function for patient data retrieval

### 2. Role-Based Filtering
- Patient data MUST be filtered by `patientCaregiver` role
- Filtering MUST happen at the edge function level for security
- All patient queries MUST validate role membership

### 3. Approved Hooks and Utilities
Use ONLY these hooks for patient data:
- `usePatients()` - Primary hook for patient management
- `useSecurePatientData()` - For enhanced security scenarios
- `patientDataHelpers.ts` - Utility functions for validation

## 🔒 Security Requirements

### Authentication & Authorization
```typescript
// ✅ CORRECT: Using approved hook with role validation
const { patients } = usePatients();

// ❌ WRONG: Direct database query
const { data } = await supabase.from('profiles').select('*');
```

### Data Validation
```typescript
// ✅ CORRECT: Validate patient data
import { validatePatientData, isPatientUser } from '@/utils/patientDataHelpers';

if (isPatientUser(user)) {
  validatePatientData(user);
  // Proceed with patient operations
}
```

## 🚨 Common Mistakes to Avoid

1. **Querying profiles table directly**
   ```typescript
   // ❌ WRONG - Will include non-patients
   supabase.from('profiles').select('*')
   ```

2. **Missing role validation**
   ```typescript
   // ❌ WRONG - No role checking
   const allUsers = await fetchUsers();
   ```

3. **Bypassing edge function**
   ```typescript
   // ❌ WRONG - Direct auth.users access not allowed
   supabase.auth.admin.listUsers()
   ```

## 📋 Development Checklist

Before deploying patient-related features:

- [ ] Patient data fetched via `manage-user-profiles` edge function
- [ ] Role filtering applied (`patientCaregiver` only)
- [ ] Data validation implemented
- [ ] Audit logging enabled
- [ ] Security permissions verified
- [ ] Cache invalidation handled
- [ ] Error handling implemented

## 🔧 Implementation Examples

### Fetching Patients
```typescript
import { usePatients } from '@/hooks/usePatients';

const PatientComponent = () => {
  const { patients, isLoading, error } = usePatients();
  
  if (isLoading) return <div>Loading patients...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {patients.map(patient => (
        <div key={patient.id}>{patient.first_name} {patient.last_name}</div>
      ))}
    </div>
  );
};
```

### Enhanced Security
```typescript
import { useSecurePatientData } from '@/hooks/useSecurePatientData';

const SecurePatientComponent = () => {
  const { getSecurePatientData, verifyPatientAccess } = useSecurePatientData();
  
  const handleViewPatients = async () => {
    const hasAccess = await verifyPatientAccess();
    if (hasAccess) {
      const patients = await getSecurePatientData();
      // Handle patient data
    }
  };
  
  return <button onClick={handleViewPatients}>View Patients</button>;
};
```

## 🎯 Future Development

When adding new patient features:

1. **Extend existing hooks** rather than creating new queries
2. **Add new utilities** to `patientDataHelpers.ts`
3. **Update edge function** if new data fields are needed
4. **Follow established patterns** for consistency
5. **Test role-based access** thoroughly

## 📊 Monitoring & Debugging

### Query Keys
Patient queries use standardized cache keys:
```typescript
['patients', 'patientCaregiver', operation, filters?]
```

### Audit Logging
All patient data access is logged with:
- User ID and email
- Action performed
- Timestamp
- Data accessed

### Console Logging
Patient operations include detailed logging:
- `🔍` for data fetching
- `✅` for successful operations
- `❌` for errors
- `⚠️` for warnings

## 🚀 Emergency Procedures

If patient data appears incorrect:

1. **Check console logs** for role filtering
2. **Verify edge function** is being called
3. **Test role assignments** in database
4. **Review audit logs** for unauthorized access
5. **Validate data structure** using helpers

## 📞 Support

For questions about patient data management:
- Review this document first
- Check console logs and audit trails
- Validate using provided utility functions
- Ensure edge function is functioning properly

---

**Remember: Patient data security is paramount. When in doubt, use the secure hooks and validate thoroughly.**
