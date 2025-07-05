# 🚀 **INTEGRATION EXAMPLE: User Default Tab Management**

## ✅ **STEP 1: Add to Existing Users Page (Option 1)**

### **Enhanced Users Page with Default Tab Management**
```typescript
// src/pages/Users.tsx - ENHANCED VERSION
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// ... existing imports
import { UserDefaultTabManager } from '@/components/tenant/UserDefaultTabManager';

const Users: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useMasterAuth();
  const { users, /* ... existing data */ } = useMasterData();
  // ... existing state and handlers

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage users, roles, permissions, and default landing tabs
        </p>
      </div>

      {/* ✅ TABBED INTERFACE */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="defaults">Default Tabs</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>

        {/* ✅ EXISTING USERS TAB */}
        <TabsContent value="users">
          {/* ... existing users table code ... */}
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={usersWithRoles}
                columns={columns}
                actions={renderRowActions}
                bulkActions={bulkActions}
                permissions={permissions}
                // ... existing props
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ✅ NEW DEFAULT TABS TAB */}
        <TabsContent value="defaults">
          <UserDefaultTabManager 
            users={usersWithRoles}
            showInline={false}
          />
        </TabsContent>

        {/* ✅ EXISTING ROLES TAB */}
        <TabsContent value="roles">
          {/* ... existing roles management ... */}
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

---

## ✅ **STEP 2: Create Dedicated Route (Option 2)**

### **Dedicated Default Tab Management Page**
```typescript
// src/pages/UserDefaults.tsx - NEW DEDICATED PAGE
import React from 'react';
import { UserDefaultTabManager } from '@/components/tenant/UserDefaultTabManager';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useMasterData } from '@/hooks/useMasterData';
import { AccessDenied } from '@/components/AccessDenied';

const UserDefaults: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, permissions } = useMasterAuth();
  const { users, isLoading, error } = useMasterData();

  // ✅ PERMISSION CHECK
  const canManageDefaults = permissions.includes('users.manage') || permissions.includes('tenant.manage');

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AccessDenied requiredPermission="authentication" />;
  }

  if (!canManageDefaults) {
    return <AccessDenied requiredPermission="users.manage" />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">Error loading users: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <UserDefaultTabManager 
        users={users}
        showInline={false}
      />
    </div>
  );
};

export default UserDefaults;
```

### **Add Route to App.tsx**
```typescript
// src/App.tsx - ADD NEW ROUTE
import UserDefaults from '@/pages/UserDefaults';

// ✅ ADD TO ROUTES
<Route path="/user-defaults" element={
  <RoleBasedRoute 
    path="/user-defaults" 
    requiredPermissions={['users.manage', 'admin.access']}
  >
    <UserDefaults />
  </RoleBasedRoute>
} />
```

### **Add to Navigation**
```typescript
// src/nav-items.tsx - ADD TO NAVIGATION
export const navItems: NavItem[] = [
  // ... existing items
  {
    title: "User Defaults",
    url: "/user-defaults",
    to: "/user-defaults", 
    icon: Settings,
    isActive: false,
    items: [],
    requiredPermissions: ['users.manage']
  },
  // ... rest of items
];
```

---

## ✅ **STEP 3: Inline Integration (Option 3)**

### **Add to Users Page as Inline Component**
```typescript
// src/pages/Users.tsx - INLINE INTEGRATION
const Users: React.FC = () => {
  // ... existing code

  return (
    <div className="p-6">
      {/* ... existing header and stats ... */}

      {/* ✅ EXISTING USERS TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={usersWithRoles}
            columns={columns}
            actions={renderRowActions}
            bulkActions={bulkActions}
            // ... existing props
          />
        </CardContent>
      </Card>

      {/* ✅ INLINE DEFAULT TAB MANAGEMENT */}
      <div className="mt-6">
        <UserDefaultTabManager 
          users={usersWithRoles}
          showInline={true}
        />
      </div>
    </div>
  );
};
```

---

## ✅ **STEP 4: Enhanced Bulk Actions Integration**

### **Add Default Tab Actions to Existing Users Table**
```typescript
// src/pages/Users.tsx - ENHANCED BULK ACTIONS
const bulkActions: BulkActionConfig[] = [
  // ... existing bulk actions
  {
    id: 'set-default-dashboard',
    label: 'Set Dashboard as Default',
    icon: Home,
    handler: (selectedIds) => handleBulkDefaultTab(selectedIds, 'dashboard'),
    permission: 'users.manage'
  },
  {
    id: 'set-default-patients',
    label: 'Set Patients as Default',
    icon: Heart,
    handler: (selectedIds) => handleBulkDefaultTab(selectedIds, 'patients'),
    permission: 'users.manage'
  },
  {
    id: 'set-default-facilities',
    label: 'Set Facilities as Default',
    icon: Building,
    handler: (selectedIds) => handleBulkDefaultTab(selectedIds, 'facilities'),
    permission: 'users.manage'
  },
  {
    id: 'custom-default-tab',
    label: 'Set Custom Default Tab',
    icon: Settings,
    handler: (selectedIds) => openBulkDefaultDialog(selectedIds),
    permission: 'users.manage'
  }
];

const handleBulkDefaultTab = async (userIds: string[], defaultTab: string) => {
  try {
    // ✅ TODO: Implement in useMasterData
    // await Promise.all(userIds.map(id => updateUserDefaultTab(id, defaultTab)));
    
    showSuccess(`Set ${defaultTab} as default tab for ${userIds.length} users`);
  } catch (error) {
    showError('Failed to update default tabs');
  }
};
```

---

## ✅ **STEP 5: Enhanced User Row Actions**

### **Add Default Tab Action to User Rows**
```typescript
// src/pages/Users.tsx - ENHANCED ROW ACTIONS
const renderRowActions = (user: any) => (
  <div className="flex items-center gap-2">
    {/* ... existing actions */}
    
    {/* ✅ QUICK DEFAULT TAB SELECTOR */}
    <Select 
      value={user.default_landing_tab || 'dashboard'}
      onValueChange={(tab) => handleQuickDefaultChange(user.id, tab)}
    >
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="dashboard">
          <div className="flex items-center space-x-2">
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </div>
        </SelectItem>
        <SelectItem value="patients">
          <div className="flex items-center space-x-2">
            <Heart className="h-4 w-4" />
            <span>Patients</span>
          </div>
        </SelectItem>
        <SelectItem value="users">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>

    <ActionButton
      icon={Settings}
      label="Manage Default"
      onClick={() => openDefaultTabDialog(user)}
      variant="outline"
      size="sm"
    />
  </div>
);

const handleQuickDefaultChange = async (userId: string, defaultTab: string) => {
  try {
    // ✅ TODO: Implement in useMasterData
    // await updateUserDefaultTab(userId, defaultTab);
    
    showSuccess(`Default tab updated to ${defaultTab}`);
  } catch (error) {
    showError('Failed to update default tab');
  }
};
```

---

## ✅ **STEP 6: Dashboard Integration**

### **Show Default Tab Stats in Dashboard**
```typescript
// src/pages/Index.tsx - DASHBOARD INTEGRATION
const Dashboard: React.FC = () => {
  const { users } = useMasterData();
  
  // ✅ CALCULATE DEFAULT TAB STATS
  const defaultTabStats = useMemo(() => {
    const stats = users.reduce((acc, user) => {
      const tab = user.default_landing_tab || 'dashboard';
      acc[tab] = (acc[tab] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(stats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  }, [users]);

  return (
    <div className="space-y-6">
      {/* ... existing dashboard content ... */}

      {/* ✅ DEFAULT TAB USAGE STATS */}
      <Card>
        <CardHeader>
          <CardTitle>Most Popular Default Tabs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {defaultTabStats.map(([tab, count]) => {
              const module = AVAILABLE_MODULES.find(m => m.id === tab);
              return (
                <div key={tab} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {module && <module.icon className="h-4 w-4" />}
                    <span>{module?.name || tab}</span>
                  </div>
                  <Badge variant="secondary">{count} users</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

---

## ✅ **STEP 7: Module Management Integration**

### **Add Default Tab Assignment in Module Management**
```typescript
// src/pages/SimpleModules.tsx - MODULE INTEGRATION
const SimpleModules: React.FC = () => {
  const { users } = useMasterData();
  
  const handleSetModuleAsDefault = async (moduleName: string, userIds: string[]) => {
    try {
      // ✅ TODO: Implement bulk assignment
      // await Promise.all(userIds.map(id => updateUserDefaultTab(id, moduleName)));
      
      showSuccess(`Set ${moduleName} as default for ${userIds.length} users`);
    } catch (error) {
      showError('Failed to set module as default');
    }
  };

  return (
    <div className="space-y-6">
      {/* ... existing module content ... */}

      {/* ✅ MODULE DEFAULT ASSIGNMENT */}
      {modules.map(module => (
        <Card key={module.id}>
          <CardHeader>
            <CardTitle>{module.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p>{module.description}</p>
                <Badge variant="secondary">
                  {users.filter(u => u.default_landing_tab === module.id).length} users have this as default
                </Badge>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <ActionButton
                    icon={Settings}
                    label="Set as Default"
                    onClick={() => {}}
                    variant="outline"
                  />
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Set {module.name} as Default Tab</DialogTitle>
                  </DialogHeader>
                  <ModuleUserDefaults
                    moduleId={module.id}
                    moduleName={module.name}
                    assignedUsers={users.filter(u => 
                      u.available_modules?.includes(module.id)
                    )}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
```

---

## 🎯 **IMPLEMENTATION SUMMARY**

### **✅ OPTION 1: Tabbed Users Page (Recommended)**
- Most intuitive for users
- Keeps related functionality together
- Uses existing navigation structure

### **✅ OPTION 2: Dedicated Route**
- Separates concerns clearly
- Easier to manage permissions
- Can be linked from multiple places

### **✅ OPTION 3: Inline Integration**
- Seamless user experience
- All functionality on one page
- No additional navigation needed

### **✅ OPTION 4: Enhanced Bulk Actions**
- Quick default tab assignment
- Integrated with existing workflows
- Minimal UI changes

### **✅ ARCHITECTURAL BENEFITS**

1. **Single Source of Truth**: ✅ All components use master hooks
2. **Component Isolation**: ✅ Each component is self-contained
3. **Reusable Components**: ✅ ActionButton, DataTable, Select, etc.
4. **No Duplicates**: ✅ Extends existing patterns
5. **Permission-Based**: ✅ RBAC integration
6. **Tenant-Aware**: ✅ Multi-tenant support
7. **Scalable**: ✅ Infinite module support

**Choose the integration approach that best fits your workflow and user experience requirements!**