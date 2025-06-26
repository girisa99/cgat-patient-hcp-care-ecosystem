# Module Architecture Guide

## Overview
This guide provides a standardized approach for creating new modules in the healthcare application while maintaining consistency and preventing regressions.

## 🏗️ Module Structure

### 1. File Organization
```
src/
├── hooks/
│   └── [module-name]/
│       ├── index.tsx          # Main hook export
│       ├── use[Module]Data.tsx # Data fetching logic
│       └── use[Module]Mutations.tsx # Mutation operations
├── components/
│   └── [module-name]/
│       ├── [Module]List.tsx    # List component
│       ├── [Module]Form.tsx    # Form component
│       └── [Module]Actions.tsx # Action buttons
├── pages/
│   └── [ModuleName].tsx       # Main page component
└── templates/                 # Reusable templates
```

### 2. Hook Pattern
Each module should follow the refactored hook pattern:
- **Data Hook**: Handles fetching and caching
- **Mutations Hook**: Handles create/update/delete operations
- **Main Hook**: Combines data and mutations

### 3. Component Pattern
Use shared components for consistency:
- **DataTable**: For listing data
- **PageHeader**: For page headers with stats
- **StatusBadge**: For status display

## 🚀 Creating a New Module

### Step 1: Copy Templates
```bash
# Copy hook template
cp src/templates/hooks/useModuleTemplate.tsx src/hooks/[module-name]/index.tsx

# Copy component template  
cp src/templates/ModuleTemplate.tsx src/pages/[ModuleName].tsx
```

### Step 2: Customize Data Structure
Update the hook to match your data requirements:
```typescript
// Update table name and data structure
const tableName = 'your_table_name';

// Define your data interface
interface YourModuleData {
  id: string;
  name: string;
  status: string;
  // ... other fields
}
```

### Step 3: Configure Components
Update the component to display your data:
```typescript
const columns = [
  {
    key: 'name',
    header: 'Name',
    render: (item: YourModuleData) => item.name
  },
  // ... other columns
];
```

### Step 4: Add Routes
Add your module to the main App.tsx:
```typescript
<Route path="/your-module" element={
  <ProtectedRoute>
    <DashboardLayout>
      <YourModule />
    </DashboardLayout>
  </ProtectedRoute>
} />
```

## 🔒 Security Guidelines

### 1. Data Access
- Always use the unified data architecture
- Fetch user data from auth.users via edge functions
- Apply proper role-based filtering

### 2. RLS Policies
Ensure proper Row Level Security for your tables:
```sql
-- Example RLS policy
CREATE POLICY "Users can view their own records"
ON your_table
FOR SELECT
USING (auth.uid() = user_id);
```

### 3. Edge Functions
Use edge functions for:
- Complex business logic
- External API calls
- Data aggregation

## 📊 Monitoring & Debugging

### 1. Data Source Verification
Each module should display its data source:
```typescript
meta: {
  dataSource: 'your_table via edge function',
  totalItems: items?.length || 0,
  lastFetch: new Date().toISOString()
}
```

### 2. Error Handling
Implement consistent error handling:
```typescript
onError: (error: any) => {
  console.error('❌ Module error:', error);
  toast({
    title: "Error",
    description: error.message || "Operation failed",
    variant: "destructive",
  });
}
```

### 3. Logging
Add comprehensive logging:
```typescript
console.log('🔍 Fetching module data...');
console.log('✅ Module data loaded:', data.length);
console.log('❌ Module error:', error);
```

## 🎯 Best Practices

### 1. Component Isolation
- Keep components focused and single-purpose
- Use shared components to prevent duplication
- Avoid tight coupling between modules

### 2. Cache Management
- Use consistent query keys
- Implement proper cache invalidation
- Consider cache stale time based on data volatility

### 3. TypeScript
- Define proper interfaces for all data structures
- Use strict typing for better development experience
- Export types for reuse across components

### 4. Testing
- Write unit tests for hooks
- Test component rendering with different data states
- Verify error handling scenarios

## 🔄 Module Migration Checklist

When migrating existing modules:
- [ ] Break down large hooks into focused modules
- [ ] Update to use shared UI components
- [ ] Implement unified data architecture
- [ ] Add proper error handling and logging
- [ ] Update cache invalidation patterns
- [ ] Add TypeScript interfaces
- [ ] Test all functionality thoroughly

## 📋 Module Templates

Use the provided templates as starting points:
- `src/templates/ModuleTemplate.tsx` - Component template
- `src/templates/hooks/useModuleTemplate.tsx` - Hook template

These templates include:
- Consistent structure and patterns
- Error handling and loading states
- Proper TypeScript typing
- Integration with shared components

---

Following this architecture ensures consistent, maintainable, and scalable modules that integrate seamlessly with the existing application.
