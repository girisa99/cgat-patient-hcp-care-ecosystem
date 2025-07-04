# 🏢 **MULTI-TENANT COMPONENT ISOLATION & REUSABLE ARCHITECTURE**

## ✅ **MULTI-TENANT SUPPORT WITH SINGLE SOURCE OF TRUTH**

### **🎯 Current Architecture + Multi-Tenancy**
```typescript
// ✅ EXTENDS EXISTING SINGLE SOURCE - NO DUPLICATES
const multiTenantArchitecture = {
  singleSource: 'useMasterAuth + useMasterData + useMasterToast',
  tenantIsolation: 'Database-level tenant separation',
  componentReuse: 'Same components, tenant-specific data',
  userDefaults: 'Per-user default landing tabs',
  roleBasedAccess: 'Tenant-specific role permissions',
  scaleability: 'Infinite tenants, infinite users per tenant'
};
```

---

## 🏗️ **MULTI-TENANT DATABASE SCHEMA**

### **✅ Extended Database Tables (Single Source)**
```sql
-- ✅ TENANT ISOLATION
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  domain VARCHAR UNIQUE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- ✅ TENANT-SPECIFIC USER PROFILES
CREATE TABLE tenant_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  user_id UUID REFERENCES auth.users(id),
  first_name VARCHAR,
  last_name VARCHAR,
  default_landing_tab VARCHAR DEFAULT 'dashboard',
  tenant_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

-- ✅ TENANT-SPECIFIC ROLES
CREATE TABLE tenant_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  role_id UUID REFERENCES roles(id),
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE
);

-- ✅ TENANT-SPECIFIC USER ASSIGNMENTS
CREATE TABLE tenant_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  user_id UUID REFERENCES auth.users(id),
  role_id UUID REFERENCES roles(id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, user_id, role_id)
);

-- ✅ TENANT-SPECIFIC MODULE CONFIGURATIONS
CREATE TABLE tenant_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  module_name VARCHAR NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  configuration JSONB DEFAULT '{}',
  permissions JSONB DEFAULT '{}',
  UNIQUE(tenant_id, module_name)
);

-- ✅ TENANT-SPECIFIC DEFAULT TABS
CREATE TABLE tenant_user_defaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  user_id UUID REFERENCES auth.users(id),
  default_tab VARCHAR NOT NULL,
  quick_actions JSONB DEFAULT '[]',
  dashboard_widgets JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);
```

---

## 🔐 **EXTENDED MASTER AUTH HOOK (SINGLE SOURCE)**

### **✅ Multi-Tenant useMasterAuth Extension**
```typescript
// ✅ EXTENDS EXISTING HOOK - NO DUPLICATES
export interface TenantContext {
  tenantId: string;
  tenantName: string;
  tenantDomain: string;
  tenantSettings: any;
  userTenantProfile: any;
  defaultLandingTab: string;
  tenantPermissions: string[];
  availableModules: string[];
  quickActions: string[];
  dashboardWidgets: string[];
}

// ✅ ENHANCED useMasterAuth (SINGLE SOURCE)
export const useMasterAuth = () => {
  const context = useContext(MasterAuthContext);
  if (!context) {
    throw new Error('useMasterAuth must be used within MasterAuthProvider');
  }

  // ✅ TENANT-SPECIFIC DATA (SINGLE SOURCE)
  const {
    user,
    profile,
    userRoles,
    permissions,
    tenantContext, // ✅ NEW: Tenant-specific context
    isLoading,
    isAuthenticated,
    signOut,
    refreshAuth
  } = context;

  return {
    // ✅ EXISTING SINGLE SOURCE DATA
    user,
    profile,
    userRoles,
    permissions,
    isLoading,
    isAuthenticated,
    signOut,
    refreshAuth,
    
    // ✅ NEW: TENANT-SPECIFIC DATA (SINGLE SOURCE)
    tenantId: tenantContext?.tenantId,
    tenantName: tenantContext?.tenantName,
    tenantDomain: tenantContext?.tenantDomain,
    defaultLandingTab: tenantContext?.defaultLandingTab || 'dashboard',
    tenantPermissions: tenantContext?.tenantPermissions || [],
    availableModules: tenantContext?.availableModules || [],
    quickActions: tenantContext?.quickActions || [],
    dashboardWidgets: tenantContext?.dashboardWidgets || [],
    
    // ✅ TENANT-SPECIFIC ACTIONS (SINGLE SOURCE)
    updateDefaultTab: (tab: string) => updateUserDefaultTab(user?.id, tenantContext?.tenantId, tab),
    updateQuickActions: (actions: string[]) => updateUserQuickActions(user?.id, tenantContext?.tenantId, actions),
    switchTenant: (tenantId: string) => switchUserTenant(user?.id, tenantId)
  };
};
```

---

## 🗄️ **EXTENDED MASTER DATA HOOK (SINGLE SOURCE)**

### **✅ Multi-Tenant useMasterData Extension**
```typescript
// ✅ EXTENDS EXISTING HOOK - NO DUPLICATES
export const useMasterData = () => {
  const { showSuccess, showError } = useMasterToast();
  const { userRoles, isAuthenticated, tenantId } = useMasterAuth(); // ✅ SINGLE SOURCE

  // ✅ TENANT-FILTERED DATA QUERIES (SINGLE SOURCE)
  const {
    data: tenantUsers = [],
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: [...MASTER_DATA_CACHE_KEY, 'users', tenantId],
    queryFn: async (): Promise<User[]> => {
      console.log('🔍 Fetching tenant users from master data source...');
      
      const { data, error } = await supabase
        .from('tenant_profiles')
        .select(`
          *,
          tenant_user_roles (
            roles (*)
          )
        `)
        .eq('tenant_id', tenantId) // ✅ TENANT ISOLATION
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: isAuthenticated && !!tenantId,
    staleTime: 300000,
    retry: 2,
  });

  // ✅ TENANT-SPECIFIC MODULES (SINGLE SOURCE)
  const {
    data: tenantModules = [],
    isLoading: modulesLoading,
  } = useQuery({
    queryKey: [...MASTER_DATA_CACHE_KEY, 'modules', tenantId],
    queryFn: async (): Promise<TenantModule[]> => {
      const { data, error } = await supabase
        .from('tenant_modules')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_enabled', true);

      if (error) throw error;
      return data || [];
    },
    enabled: isAuthenticated && !!tenantId,
    staleTime: 300000,
  });

  // ✅ TENANT-SPECIFIC PERMISSIONS (SINGLE SOURCE)
  const {
    data: tenantRoles = [],
    isLoading: rolesLoading,
  } = useQuery({
    queryKey: [...MASTER_DATA_CACHE_KEY, 'roles', tenantId],
    queryFn: async (): Promise<TenantRole[]> => {
      const { data, error } = await supabase
        .from('tenant_roles')
        .select(`
          *,
          roles (*)
        `)
        .eq('tenant_id', tenantId)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    },
    enabled: isAuthenticated && !!tenantId,
    staleTime: 300000,
  });

  return {
    // ✅ EXISTING SINGLE SOURCE DATA
    users: tenantUsers,
    modules: tenantModules,
    roles: tenantRoles,
    isLoading: usersLoading || modulesLoading || rolesLoading,
    error: usersError,
    
    // ✅ NEW: TENANT-SPECIFIC ACTIONS (SINGLE SOURCE)
    createTenantUser: (userData: any) => createTenantUser(tenantId, userData),
    assignTenantRole: (userId: string, roleId: string) => assignTenantRole(tenantId, userId, roleId),
    updateTenantModule: (moduleId: string, config: any) => updateTenantModule(tenantId, moduleId, config),
    updateUserDefaultTab: (userId: string, tab: string) => updateUserDefaultTab(tenantId, userId, tab),
    
    // ✅ TENANT MANAGEMENT ACTIONS (SINGLE SOURCE)
    getTenantStats: () => getTenantStats(tenantId),
    refreshTenantData: () => refreshTenantData(tenantId)
  };
};
```

---

## 🎨 **REUSABLE MULTI-TENANT COMPONENTS**

### **✅ Tenant-Aware ActionButton (REUSABLE)**
```typescript
// ✅ EXTENDS EXISTING COMPONENT - NO DUPLICATES
export const TenantActionButton: React.FC<ActionButtonProps & {
  tenantId?: string;
  modulePermission?: string;
  tenantPermission?: string;
}> = ({ 
  tenantId, 
  modulePermission, 
  tenantPermission, 
  ...props 
}) => {
  const { tenantPermissions, availableModules } = useMasterAuth(); // ✅ SINGLE SOURCE
  
  // ✅ TENANT-SPECIFIC PERMISSION CHECKING
  const hasPermission = useMemo(() => {
    if (modulePermission && !availableModules.includes(modulePermission)) {
      return false;
    }
    if (tenantPermission && !tenantPermissions.includes(tenantPermission)) {
      return false;
    }
    return true;
  }, [modulePermission, tenantPermission, availableModules, tenantPermissions]);

  if (!hasPermission) return null;

  // ✅ REUSES EXISTING ActionButton (NO DUPLICATES)
  return <ActionButton {...props} />;
};
```

### **✅ Tenant-Aware DataTable (REUSABLE)**
```typescript
// ✅ EXTENDS EXISTING COMPONENT - NO DUPLICATES
export const TenantDataTable: React.FC<DataTableProps & {
  tenantId?: string;
  tenantFiltered?: boolean;
}> = ({ 
  tenantId, 
  tenantFiltered = true, 
  data,
  ...props 
}) => {
  const { tenantId: currentTenantId } = useMasterAuth(); // ✅ SINGLE SOURCE
  
  // ✅ TENANT-FILTERED DATA
  const filteredData = useMemo(() => {
    if (!tenantFiltered) return data;
    return data.filter(item => 
      item.tenant_id === (tenantId || currentTenantId)
    );
  }, [data, tenantId, currentTenantId, tenantFiltered]);

  // ✅ REUSES EXISTING DataTable (NO DUPLICATES)
  return <DataTable {...props} data={filteredData} />;
};
```

---

## 🎯 **USER DEFAULT TAB MANAGEMENT**

### **✅ Default Tab Assignment Process**

#### **Option 1: User Management (Recommended)**
```typescript
// ✅ REUSABLE COMPONENT FOR USER MANAGEMENT
const UserDefaultTabSelector: React.FC<{
  userId: string;
  currentTab: string;
  availableModules: string[];
}> = ({ userId, currentTab, availableModules }) => {
  const { updateDefaultTab } = useMasterAuth(); // ✅ SINGLE SOURCE
  const { showSuccess } = useMasterToast(); // ✅ SINGLE SOURCE

  const handleTabChange = async (newTab: string) => {
    try {
      await updateDefaultTab(newTab);
      showSuccess(`Default tab updated to ${newTab}`);
    } catch (error) {
      showError('Failed to update default tab');
    }
  };

  return (
    <div className="space-y-4">
      <Label>Default Landing Tab</Label>
      <Select value={currentTab} onValueChange={handleTabChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select default tab" />
        </SelectTrigger>
        <SelectContent>
          {availableModules.map(module => (
            <SelectItem key={module} value={module}>
              {module.charAt(0).toUpperCase() + module.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
```

#### **Option 2: Module Management**
```typescript
// ✅ REUSABLE COMPONENT FOR MODULE MANAGEMENT
const ModuleUserDefaults: React.FC<{
  moduleId: string;
  moduleName: string;
  assignedUsers: User[];
}> = ({ moduleId, moduleName, assignedUsers }) => {
  const { updateUserDefaultTab } = useMasterData(); // ✅ SINGLE SOURCE
  const { showSuccess } = useMasterToast(); // ✅ SINGLE SOURCE

  const handleBulkAssignDefault = async (userIds: string[]) => {
    try {
      await Promise.all(
        userIds.map(userId => updateUserDefaultTab(userId, moduleName))
      );
      showSuccess(`Set ${moduleName} as default for ${userIds.length} users`);
    } catch (error) {
      showError('Failed to update default tabs');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Set as Default Tab</h3>
      <TenantDataTable
        data={assignedUsers}
        columns={userColumns}
        bulkActions={[
          {
            id: 'set-default',
            label: `Set ${moduleName} as Default`,
            icon: Settings,
            handler: handleBulkAssignDefault,
            permission: 'modules.manage'
          }
        ]}
        permissions={['modules.manage']}
      />
    </div>
  );
};
```

---

## 🔄 **REUSABLE TENANT CONFIGURATION COMPONENTS**

### **✅ Tenant Settings Manager (REUSABLE)**
```typescript
// ✅ REUSABLE COMPONENT FOR TENANT MANAGEMENT
const TenantSettingsManager: React.FC<{
  tenantId: string;
}> = ({ tenantId }) => {
  const { updateTenantModule } = useMasterData(); // ✅ SINGLE SOURCE
  const { showSuccess } = useMasterToast(); // ✅ SINGLE SOURCE

  const bulkActions: BulkActionConfig[] = [
    {
      id: 'enable-modules',
      label: 'Enable Modules',
      icon: Plus,
      handler: (moduleIds) => handleBulkModuleToggle(moduleIds, true),
      permission: 'tenant.manage'
    },
    {
      id: 'disable-modules',
      label: 'Disable Modules',
      icon: Minus,
      handler: (moduleIds) => handleBulkModuleToggle(moduleIds, false),
      permission: 'tenant.manage'
    }
  ];

  const handleBulkModuleToggle = async (moduleIds: string[], enabled: boolean) => {
    try {
      await Promise.all(
        moduleIds.map(moduleId => 
          updateTenantModule(moduleId, { is_enabled: enabled })
        )
      );
      showSuccess(`${enabled ? 'Enabled' : 'Disabled'} ${moduleIds.length} modules`);
    } catch (error) {
      showError('Failed to update modules');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tenant Module Configuration</h2>
        <TenantActionButton
          icon={Plus}
          label="Add Module"
          onClick={() => handleAddModule()}
          variant="default"
          tenantPermission="tenant.manage"
        />
      </div>

      <TenantDataTable
        data={modules}
        columns={moduleColumns}
        bulkActions={bulkActions}
        permissions={['tenant.manage']}
        tenantId={tenantId}
      />
    </div>
  );
};
```

---

## 🎯 **LANDING TAB ROUTING SYSTEM**

### **✅ Tenant-Aware Router (SINGLE SOURCE)**
```typescript
// ✅ EXTENDS EXISTING ROUTING - NO DUPLICATES
const TenantAwareRouter: React.FC = () => {
  const { 
    isAuthenticated, 
    isLoading, 
    defaultLandingTab,
    availableModules,
    tenantId 
  } = useMasterAuth(); // ✅ SINGLE SOURCE

  // ✅ TENANT-SPECIFIC DEFAULT ROUTING
  const getDefaultRoute = useCallback(() => {
    if (!isAuthenticated) return '/login';
    if (!tenantId) return '/select-tenant';
    
    // ✅ USER-SPECIFIC DEFAULT TAB
    if (defaultLandingTab && availableModules.includes(defaultLandingTab)) {
      return `/${defaultLandingTab}`;
    }
    
    // ✅ FALLBACK TO FIRST AVAILABLE MODULE
    if (availableModules.length > 0) {
      return `/${availableModules[0]}`;
    }
    
    return '/dashboard';
  }, [isAuthenticated, tenantId, defaultLandingTab, availableModules]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <Router>
      <Routes>
        {/* ✅ TENANT SELECTION */}
        <Route path="/select-tenant" element={<TenantSelector />} />
        
        {/* ✅ DEFAULT REDIRECT */}
        <Route path="/" element={<Navigate to={getDefaultRoute()} />} />
        
        {/* ✅ TENANT-SPECIFIC ROUTES */}
        {availableModules.map(module => (
          <Route 
            key={module}
            path={`/${module}`} 
            element={
              <TenantRoute requiredModule={module}>
                <ModuleComponent moduleName={module} />
              </TenantRoute>
            } 
          />
        ))}
        
        {/* ✅ FALLBACK */}
        <Route path="*" element={<Navigate to={getDefaultRoute()} />} />
      </Routes>
    </Router>
  );
};
```

---

## 📊 **TENANT MANAGEMENT DASHBOARD**

### **✅ Multi-Tenant Admin Dashboard (REUSABLE)**
```typescript
// ✅ REUSABLE COMPONENT FOR TENANT ADMINISTRATION
const TenantManagementDashboard: React.FC = () => {
  const { tenantId, tenantName, tenantPermissions } = useMasterAuth(); // ✅ SINGLE SOURCE
  const { 
    users, 
    modules, 
    roles, 
    getTenantStats,
    isLoading 
  } = useMasterData(); // ✅ SINGLE SOURCE

  const [tenantStats, setTenantStats] = useState<any>(null);

  useEffect(() => {
    getTenantStats().then(setTenantStats);
  }, [getTenantStats]);

  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage tenant users and roles',
      icon: Users,
      action: () => navigate('/users'),
      permission: 'users.manage'
    },
    {
      title: 'Module Configuration',
      description: 'Configure available modules',
      icon: Settings,
      action: () => navigate('/modules'),
      permission: 'modules.manage'
    },
    {
      title: 'Default Tab Settings',
      description: 'Set user default landing tabs',
      icon: Home,
      action: () => navigate('/defaults'),
      permission: 'tenant.manage'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{tenantName} Management</h1>
          <p className="text-gray-600">Tenant ID: {tenantId}</p>
        </div>
        <TenantActionButton
          icon={Plus}
          label="Add User"
          onClick={() => navigate('/users/add')}
          variant="default"
          tenantPermission="users.create"
        />
      </div>

      {/* ✅ TENANT STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {modules.filter(m => m.is_enabled).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Default Tabs Set</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tenantStats?.usersWithDefaults || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ✅ QUICK ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions
          .filter(action => tenantPermissions.includes(action.permission))
          .map(action => (
            <Card key={action.title} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader onClick={action.action}>
                <div className="flex items-center space-x-2">
                  <action.icon className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                </div>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
            </Card>
          ))
        }
      </div>
    </div>
  );
};
```

---

## 🎯 **IMPLEMENTATION SUMMARY**

### **✅ USER DEFAULT TAB ASSIGNMENT OPTIONS**

#### **1. User Management Approach (Recommended)**
```typescript
// ✅ IN USERS PAGE - INDIVIDUAL ASSIGNMENT
<UserDefaultTabSelector 
  userId={user.id}
  currentTab={user.defaultLandingTab}
  availableModules={user.availableModules}
/>

// ✅ IN USERS PAGE - BULK ASSIGNMENT
<BulkActions
  actions={[
    {
      id: 'set-default-dashboard',
      label: 'Set Dashboard as Default',
      icon: Home,
      handler: (userIds) => bulkUpdateDefaultTab(userIds, 'dashboard'),
      permission: 'users.manage'
    },
    {
      id: 'set-default-patients',
      label: 'Set Patients as Default',
      icon: Heart,
      handler: (userIds) => bulkUpdateDefaultTab(userIds, 'patients'),
      permission: 'users.manage'
    }
  ]}
  selectedItems={selectedUsers}
  permissions={permissions}
/>
```

#### **2. Module Management Approach**
```typescript
// ✅ IN MODULES PAGE - MODULE-SPECIFIC ASSIGNMENT
<ModuleUserDefaults
  moduleId={module.id}
  moduleName={module.name}
  assignedUsers={moduleUsers}
/>
```

### **✅ ARCHITECTURAL BENEFITS**

1. **Component Isolation**: ✅ Each tenant's data is isolated
2. **Reusable Components**: ✅ Same components, tenant-specific data
3. **Single Source of Truth**: ✅ All data flows through master hooks
4. **No Duplicates**: ✅ Extends existing components
5. **No Mock Data**: ✅ Real tenant database
6. **Scalable**: ✅ Infinite tenants and users
7. **Configurable**: ✅ Per-tenant, per-user defaults
8. **Maintainable**: ✅ Single implementation, multiple tenants

**This architecture provides complete multi-tenant support with user-specific default tabs while maintaining perfect compliance with single source of truth principles!**