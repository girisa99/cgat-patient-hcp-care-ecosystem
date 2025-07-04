# 🏗️ ENTERPRISE HEALTHCARE ARCHITECTURE FRAMEWORK

## 🚨 **ARCHITECTURAL CLARIFICATION - PROPER RBAC IMPLEMENTATION**

### **❌ WHAT WAS WRONG:**
"Development friendly" bypassing of role-based access control was **architecturally incorrect**. Healthcare systems require **strict role-based access control**.

### **✅ WHAT SHOULD BE IMPLEMENTED:**
**Proper Role-Based Access Control (RBAC)** with database-level security, JWT claims, and UI-level permissions.

---

## 🎯 **SINGLE SOURCE OF TRUTH ARCHITECTURE FOR HEALTHCARE**

### **🔐 LAYER 1: AUTHENTICATION & AUTHORIZATION**
```typescript
// ✅ SINGLE AUTHENTICATION SOURCE
useMasterAuth: {
  responsibilities: [
    'User authentication state',
    'JWT token management', 
    'Profile loading',
    'Role resolution',
    'Permission checking'
  ],
  usedBy: 'ALL components, pages, hooks',
  principle: 'SINGLE SOURCE OF TRUTH'
}
```

### **🗄️ LAYER 2: DATA MANAGEMENT**
```typescript
// ✅ SINGLE DATA SOURCE
useMasterData: {
  responsibilities: [
    'All database operations',
    'Role-filtered data',
    'Real-time updates',
    'Cache management',
    'Error handling'
  ],
  usedBy: 'ALL pages and data operations',
  principle: 'SINGLE SOURCE OF TRUTH'
}
```

### **🔔 LAYER 3: NOTIFICATIONS**
```typescript
// ✅ SINGLE NOTIFICATION SOURCE
useMasterToast: {
  responsibilities: [
    'Success/Error messages',
    'User feedback',
    'System notifications'
  ],
  usedBy: 'ALL operations',
  principle: 'SINGLE SOURCE OF TRUTH'
}
```

---

## 🏥 **PROPER HEALTHCARE RBAC IMPLEMENTATION**

### **🔑 DATABASE SCHEMA FOR RBAC:**
```sql
-- ✅ PROPER HEALTHCARE ROLES
CREATE TYPE healthcare_roles AS ENUM (
  'superAdmin',         -- System administrators
  'admin',              -- Facility administrators  
  'provider',           -- Healthcare providers
  'nurse',              -- Nursing staff
  'patient',            -- Patients
  'caregiver',          -- Patient caregivers
  'onboardingTeam',     -- Onboarding specialists
  'technicalServices',  -- Technical support
  'billing',            -- Billing department
  'compliance'          -- Compliance officers
);

-- ✅ GRANULAR PERMISSIONS
CREATE TYPE healthcare_permissions AS ENUM (
  'users.read',         'users.write',        'users.delete',
  'patients.read',      'patients.write',     'patients.delete',
  'facilities.read',    'facilities.write',   'facilities.delete',
  'modules.read',       'modules.write',      'modules.delete',
  'api.read',           'api.write',          'api.delete',
  'testing.read',       'testing.write',      'testing.execute',
  'security.read',      'security.write',     'security.audit',
  'billing.read',       'billing.write',      'billing.process',
  'onboarding.read',    'onboarding.write',   'onboarding.approve',
  'verification.read',  'verification.write', 'verification.approve',
  'data.import',        'data.export',        'data.audit'
);

-- ✅ USER ROLES TABLE
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role healthcare_roles NOT NULL,
  facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, role, facility_id)
);

-- ✅ ROLE PERMISSIONS TABLE
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role healthcare_roles NOT NULL,
  permission healthcare_permissions NOT NULL,
  facility_type TEXT,
  conditions JSONB,
  UNIQUE(role, permission, facility_type)
);
```

### **🔐 PROPER AUTH HOOK:**
```sql
-- ✅ HEALTHCARE AUTH HOOK WITH PROPER RBAC
CREATE OR REPLACE FUNCTION public.healthcare_auth_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    claims jsonb;
    user_roles text[];
    user_permissions text[];
    primary_role healthcare_roles;
    facility_access uuid[];
BEGIN
    -- Get user roles
    SELECT array_agg(ur.role::text), array_agg(DISTINCT ur.facility_id)
    INTO user_roles, facility_access
    FROM public.user_roles ur 
    WHERE ur.user_id = (event->>'user_id')::uuid 
    AND ur.is_active = true 
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW());
    
    -- Get user permissions based on roles
    SELECT array_agg(DISTINCT rp.permission::text)
    INTO user_permissions
    FROM public.role_permissions rp
    WHERE rp.role = ANY(user_roles::healthcare_roles[]);
    
    -- Determine primary role (highest hierarchy)
    SELECT role INTO primary_role
    FROM public.user_roles ur
    WHERE ur.user_id = (event->>'user_id')::uuid 
    AND ur.is_active = true
    ORDER BY 
      CASE ur.role
        WHEN 'superAdmin' THEN 1
        WHEN 'admin' THEN 2
        WHEN 'provider' THEN 3
        WHEN 'nurse' THEN 4
        WHEN 'onboardingTeam' THEN 5
        WHEN 'technicalServices' THEN 6
        WHEN 'billing' THEN 7
        WHEN 'compliance' THEN 8
        WHEN 'caregiver' THEN 9
        WHEN 'patient' THEN 10
        ELSE 999
      END
    LIMIT 1;
    
    claims := event->'claims';
    
    -- Add healthcare-specific claims
    claims := jsonb_set(claims, '{user_roles}', to_jsonb(COALESCE(user_roles, ARRAY[]::text[])));
    claims := jsonb_set(claims, '{permissions}', to_jsonb(COALESCE(user_permissions, ARRAY[]::text[])));
    claims := jsonb_set(claims, '{primary_role}', to_jsonb(primary_role));
    claims := jsonb_set(claims, '{facility_access}', to_jsonb(COALESCE(facility_access, ARRAY[]::uuid[])));
    
    event := jsonb_set(event, '{claims}', claims);
    return event;
END;
$$;
```

---

## 🛡️ **PERMISSION CHECKING ARCHITECTURE**

### **🔐 DATABASE FUNCTION FOR PERMISSION CHECKING:**
```sql
-- ✅ HEALTHCARE PERMISSION CHECKER
CREATE OR REPLACE FUNCTION public.has_healthcare_permission(
  user_id uuid,
  required_permission healthcare_permissions,
  facility_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role = rp.role
    WHERE ur.user_id = has_healthcare_permission.user_id
    AND rp.permission = required_permission
    AND ur.is_active = true
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    AND (facility_id IS NULL OR ur.facility_id = facility_id OR ur.role = 'superAdmin')
  );
END;
$$;
```

### **🔒 RLS POLICIES FOR HEALTHCARE:**
```sql
-- ✅ EXAMPLE: PATIENT ACCESS CONTROL
CREATE POLICY "Healthcare providers can read patients" 
ON patients FOR SELECT 
USING (
  public.has_healthcare_permission(auth.uid(), 'patients.read'::healthcare_permissions, facility_id)
);

CREATE POLICY "Only providers can modify patients" 
ON patients FOR UPDATE 
USING (
  public.has_healthcare_permission(auth.uid(), 'patients.write'::healthcare_permissions, facility_id)
);

-- ✅ EXAMPLE: FACILITY ACCESS CONTROL
CREATE POLICY "Facility-based access control" 
ON facilities FOR ALL 
USING (
  id = ANY(
    SELECT unnest((auth.jwt() ->> 'facility_access')::uuid[])
  ) OR 
  public.has_healthcare_permission(auth.uid(), 'facilities.read'::healthcare_permissions)
);
```

---

## 🏗️ **ADDING NEW MODULES - ARCHITECTURAL GUIDELINES**

### **✅ STEP 1: PERMISSION DESIGN**
```sql
-- ✅ ADD NEW PERMISSIONS TO ENUM
ALTER TYPE healthcare_permissions ADD VALUE 'reports.read';
ALTER TYPE healthcare_permissions ADD VALUE 'reports.write';
ALTER TYPE healthcare_permissions ADD VALUE 'reports.export';

-- ✅ ASSIGN PERMISSIONS TO ROLES
INSERT INTO role_permissions (role, permission) VALUES
('provider', 'reports.read'),
('admin', 'reports.read'),
('admin', 'reports.write'),
('superAdmin', 'reports.read'),
('superAdmin', 'reports.write'),
('superAdmin', 'reports.export');
```

### **✅ STEP 2: DATABASE TABLE DESIGN**
```sql
-- ✅ FOLLOW NAMING CONVENTIONS
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content JSONB,
  facility_id UUID REFERENCES facilities(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ✅ ADD RLS POLICIES
CREATE POLICY "Reports access control" ON reports FOR ALL 
USING (
  public.has_healthcare_permission(auth.uid(), 'reports.read'::healthcare_permissions, facility_id)
);
```

### **✅ STEP 3: PAGE COMPONENT PATTERN**
```typescript
// ✅ FOLLOW SINGLE SOURCE OF TRUTH PATTERN
import React from 'react';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useMasterData } from '@/hooks/useMasterData';

const ReportsPage: React.FC = () => {
  const { isAuthenticated, userRoles, permissions } = useMasterAuth();
  const { reports, isLoading, error, refreshData } = useMasterData();

  // ✅ PERMISSION CHECK
  const canReadReports = permissions.includes('reports.read');
  const canWriteReports = permissions.includes('reports.write');
  const canExportReports = permissions.includes('reports.export');

  // ✅ EARLY RETURN FOR ACCESS CONTROL
  if (!isAuthenticated) {
    return <LoginRequired />;
  }

  if (!canReadReports) {
    return <AccessDenied requiredPermission="reports.read" />;
  }

  // ✅ RENDER WITH CONDITIONAL FEATURES
  return (
    <div>
      <h1>Reports</h1>
      {canWriteReports && <CreateReportButton />}
      {canExportReports && <ExportReportsButton />}
      <ReportsList reports={reports} />
    </div>
  );
};

export default ReportsPage;
```

### **✅ STEP 4: NAVIGATION INTEGRATION**
```typescript
// ✅ ADD TO nav-items.tsx
{
  title: "Reports",
  url: "/reports",
  to: "/reports",
  icon: FileText,
  isActive: false,
  items: [],
  requiredPermissions: ['reports.read'] // ✅ PERMISSION REQUIREMENT
}
```

---

## 🔒 **ROLE ISOLATION & STABILITY GUARANTEES**

### **✅ ADMIN MODULE PROTECTION:**
```typescript
// ✅ ADMIN COMPONENTS ARE ISOLATED
const AdminDashboard: React.FC = () => {
  const { permissions } = useMasterAuth();
  
  // ✅ MULTIPLE PERMISSION CHECKS
  const isAdmin = permissions.includes('admin.access');
  const isSuperAdmin = permissions.includes('superAdmin.access');
  
  if (!isAdmin && !isSuperAdmin) {
    return <AccessDenied />; // ✅ NO ADMIN ACCESS FOR NON-ADMINS
  }
  
  return <AdminInterface />;
};
```

### **✅ PATIENT MODULE PROTECTION:**
```typescript
// ✅ PATIENT COMPONENTS ARE ISOLATED
const PatientDashboard: React.FC = () => {
  const { permissions, userRoles, user } = useMasterAuth();
  
  // ✅ PATIENT-SPECIFIC ACCESS
  const isPatient = userRoles.includes('patient');
  const canAccessPatientData = permissions.includes('patients.read');
  
  if (!isPatient && !canAccessPatientData) {
    return <AccessDenied />;
  }
  
  // ✅ FILTER DATA BASED ON ROLE
  const patientData = isPatient 
    ? getOwnPatientData(user.id) 
    : getAllPatientData();
    
  return <PatientInterface data={patientData} />;
};
```

### **✅ PROVIDER MODULE PROTECTION:**
```typescript
// ✅ PROVIDER COMPONENTS ARE ISOLATED
const ProviderWorkspace: React.FC = () => {
  const { permissions, userRoles } = useMasterAuth();
  
  const isProvider = userRoles.includes('provider');
  const isNurse = userRoles.includes('nurse');
  const canAccessClinicalData = permissions.includes('clinical.read');
  
  if (!isProvider && !isNurse && !canAccessClinicalData) {
    return <AccessDenied />;
  }
  
  return <ClinicalInterface />;
};
```

---

## 🎯 **ENFORCING SINGLE SOURCE OF TRUTH FOR NEW FEATURES**

### **✅ MANDATORY PATTERNS:**

#### **1. ALL AUTHENTICATION THROUGH useMasterAuth:**
```typescript
// ✅ REQUIRED PATTERN
const { isAuthenticated, userRoles, permissions, user } = useMasterAuth();

// ❌ FORBIDDEN PATTERNS
// const { user } = useSupabaseAuth(); // NO DIRECT SUPABASE
// const { session } = useSession();   // NO CUSTOM SESSION HOOKS
```

#### **2. ALL DATA THROUGH useMasterData:**
```typescript
// ✅ REQUIRED PATTERN
const { reports, createReport, updateReport, deleteReport } = useMasterData();

// ❌ FORBIDDEN PATTERNS
// const { data } = useSWR('/api/reports'); // NO DIRECT API CALLS
// const reports = await supabase.from('reports').select(); // NO DIRECT SUPABASE
```

#### **3. ALL NOTIFICATIONS THROUGH useMasterToast:**
```typescript
// ✅ REQUIRED PATTERN
const { showSuccess, showError } = useMasterToast();

// ❌ FORBIDDEN PATTERNS
// toast.success('Success'); // NO DIRECT TOAST
// alert('Success');         // NO NATIVE ALERTS
```

### **✅ ARCHITECTURAL VALIDATION CHECKLIST:**

#### **For Every New Feature:**
- [ ] Uses `useMasterAuth` for authentication
- [ ] Uses `useMasterData` for data operations
- [ ] Uses `useMasterToast` for notifications
- [ ] Has proper RLS policies
- [ ] Has permission checking
- [ ] Follows TypeScript/Database naming alignment
- [ ] Has proper error handling
- [ ] Has proper loading states
- [ ] Has role-based UI rendering
- [ ] Has access control validation

#### **For Every New Hook:**
- [ ] Extends existing master hooks (no new data sources)
- [ ] Uses `useMasterAuth` internally
- [ ] Uses `useMasterData` internally  
- [ ] Uses `useMasterToast` internally
- [ ] Follows single source principle
- [ ] Has TypeScript alignment
- [ ] Has proper error boundaries

---

## 🚀 **IMPLEMENTATION ROADMAP**

### **✅ IMMEDIATE FIXES NEEDED:**

1. **Implement Proper RBAC:**
   - Remove "development friendly" bypassing
   - Add healthcare_roles enum
   - Add healthcare_permissions enum
   - Create proper auth hook
   - Add RLS policies

2. **Fix Current Pages:**
   - Add permission checking to all pages
   - Add proper access control
   - Add role-based rendering
   - Remove unauthorized access

3. **Implement Navigation Security:**
   - Add permission requirements to nav items
   - Filter navigation based on permissions
   - Add proper access denied pages
   - Add loading states

### **✅ TESTING REQUIREMENTS:**

#### **Role-Based Testing:**
```typescript
// ✅ TEST EACH ROLE SEPARATELY
describe('Patient Role Access', () => {
  test('Patient can only access own data', () => {
    // Test patient-specific access
  });
  
  test('Patient cannot access admin functions', () => {
    // Test admin access denial
  });
});

describe('Provider Role Access', () => {
  test('Provider can access clinical data', () => {
    // Test provider access
  });
  
  test('Provider cannot access billing data', () => {
    // Test billing access denial
  });
});
```

---

## 🎉 **FINAL ARCHITECTURE SUMMARY**

### **✅ SINGLE SOURCE OF TRUTH:**
- **Authentication**: `useMasterAuth` (roles, permissions, user state)
- **Data**: `useMasterData` (all database operations)
- **Notifications**: `useMasterToast` (all user feedback)

### **✅ HEALTHCARE RBAC:**
- **Database-level**: RLS policies with permission checking
- **Application-level**: Role-based UI rendering
- **API-level**: Permission validation on all operations

### **✅ STABILITY GUARANTEES:**
- **Role Isolation**: Admin/Patient/Provider modules are separate
- **Permission Boundaries**: Strict access control at all levels
- **Error Boundaries**: Graceful degradation for unauthorized access

### **✅ SCALABILITY:**
- **New Features**: Must follow established patterns
- **New Roles**: Added via enum extensions
- **New Permissions**: Added via enum and role assignments
- **New Pages**: Must use master hooks and permission checking

**🎯 THIS ARCHITECTURE ENSURES NO BREAKING CHANGES ACROSS ROLES AND MAINTAINS ENTERPRISE-GRADE SECURITY FOR HEALTHCARE APPLICATIONS.**