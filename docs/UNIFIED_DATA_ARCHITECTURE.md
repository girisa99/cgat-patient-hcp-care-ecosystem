
# Unified Data Architecture Guidelines

## Overview
This document establishes the unified data architecture for all user-related operations across the healthcare application to ensure consistency, prevent regressions, and maintain data integrity.

## 🏗️ Architecture Overview

### Core Principle
**ALL user data MUST come from auth.users table via the manage-user-profiles edge function**

### Data Flow
```
auth.users (Supabase Auth) 
    ↓
manage-user-profiles (Edge Function)
    ↓
useUnifiedUserData (Centralized Hook)
    ↓
Specialized Hooks (usePatientData, useHealthcareStaffData, etc.)
    ↓
UI Components (Patients, Users, Facilities, etc.)
```

## 📚 Core Components

### 1. Utility Functions (`src/utils/userDataHelpers.ts`)
- **Purpose**: Centralized validation, filtering, and helper functions
- **Key Functions**:
  - `userHasRole()` - Role validation
  - `validateUserData()` - Data structure validation
  - `filterUsersByRole()` - Role-based filtering
  - `getPatientUsers()`, `getHealthcareStaff()`, `getAdminUsers()` - Specialized filters

### 2. Unified Data Hook (`src/hooks/useUnifiedUserData.tsx`)
- **Purpose**: Single source of truth for all user data
- **Features**:
  - Fetches from auth.users via edge function
  - Provides filtered data for all user types
  - Consistent error handling and caching
  - Metadata for debugging and monitoring

### 3. Specialized Hooks
- **usePatientData**: Filtered patient data only
- **useHealthcareStaffData**: Healthcare staff data only
- **useAdminUserData**: Admin users data only
- **useConsistentPatients**: Replaces old usePatients with unified approach
- **useConsistentUsers**: Replaces old useUsers with unified approach

## 🎯 Implementation Areas

### Patients (`src/pages/Patients.tsx`)
- ✅ **Updated**: Now uses `useConsistentPatients`
- ✅ **Data Source**: auth.users via edge function
- ✅ **Validation**: Proper role filtering for patientCaregiver
- ✅ **Consistency**: Standardized error handling and UI

### Users (`src/pages/Users.tsx`)
- ✅ **Updated**: Now uses `useConsistentUsers`
- ✅ **Data Source**: auth.users via edge function
- ✅ **Features**: All user types with proper role management
- ✅ **Consistency**: Unified cache invalidation and mutations

### Facilities (`src/pages/Facilities.tsx`)
- 🔄 **Status**: Uses existing hook pattern
- ⚠️ **Note**: Should use unified approach for user-facility relationships

### Onboarding (`src/pages/Onboarding.tsx`)
- 🔄 **Status**: Uses existing patterns
- ⚠️ **Note**: Should leverage unified user creation workflows

### Modules (`src/pages/Modules.tsx`)
- 🔄 **Status**: Uses existing patterns
- ⚠️ **Note**: Should use unified approach for user-module assignments

## 🔒 Security & Validation

### Data Source Validation
- All user data MUST come from auth.users table
- Edge function provides role-based filtering
- RLS policies protect data access
- Audit logging for all operations

### Role Validation
- Use `userHasRole()` for all role checks
- Validate data structure with `validateUserData()`
- Filter users by roles using helper functions
- Never bypass role validation

### Error Handling
- Standardized error messages via `USER_ERROR_MESSAGES`
- Consistent toast notifications
- Proper error logging and debugging
- Graceful fallbacks for missing data

## 📋 Migration Checklist

### For Each Area (Facilities, Onboarding, Modules):
- [ ] Replace direct data fetching with unified hooks
- [ ] Update to use userDataHelpers for validation
- [ ] Implement proper role-based filtering
- [ ] Add data source verification UI
- [ ] Update cache invalidation patterns
- [ ] Add proper error handling
- [ ] Update documentation

### Code Quality Checks:
- [ ] No direct profiles table queries
- [ ] All user data comes from edge function
- [ ] Proper TypeScript types
- [ ] Consistent naming conventions
- [ ] Comprehensive error handling
- [ ] Proper cache management

## 🚀 Benefits

1. **Consistency**: All areas use the same data source and patterns
2. **Maintainability**: Single source of truth for user data logic
3. **Security**: Centralized validation and role checking
4. **Performance**: Efficient caching and data sharing
5. **Debugging**: Clear data flow and comprehensive logging
6. **Scalability**: Easy to extend and modify

## 🔧 Development Guidelines

### When Adding New Features:
1. Use `useUnifiedUserData` as the base
2. Create specialized hooks if needed
3. Use helper functions for validation and filtering
4. Follow established patterns for error handling
5. Add proper TypeScript types
6. Include comprehensive logging

### When Modifying Existing Code:
1. Migrate to unified hooks gradually
2. Maintain backward compatibility during transition
3. Update tests to use new patterns
4. Document breaking changes
5. Verify data consistency after changes

## 📊 Monitoring & Debugging

### Data Source Verification:
- Green badges on pages indicate unified data source usage
- Meta information shows data source and statistics
- Console logs provide detailed operation tracking

### Cache Management:
- Unified query keys for consistent caching
- Proper cache invalidation across all operations
- Performance monitoring for data fetching

### Error Tracking:
- Standardized error messages and logging
- User-friendly error displays
- Detailed console output for debugging

---

**Remember**: The goal is to have a single, consistent, and secure way to handle user data across the entire application. Any deviation from this pattern should be carefully considered and documented.
