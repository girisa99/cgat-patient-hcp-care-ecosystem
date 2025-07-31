# Testing Framework - Role-Based Filtering Documentation

## Overview

The Healthcare Management System now features comprehensive role-based filtering for test cases, test scripts, and test execution. This ensures that users only see test cases relevant to their role and responsibilities.

## Supported Roles & Test Coverage

### 🏥 **Onboarding Team** (`onboardingTeam`)
**Focus:** Treatment Center Onboarding & Facility Management

#### Test Categories:
- **Unit Tests (6):** Form validation, business logic, risk assessment
- **Integration Tests (3):** API testing, document management, data relationships  
- **System Tests (4):** Complete workflows, status management, security
- **E2E Tests (3):** User journeys, form navigation, document workflows
- **UAT Tests (3):** Hospital, clinic, pharmacy onboarding scenarios
- **Performance Tests (3):** Load testing, document performance, database performance
- **Regression Tests (2):** Core features, workflow navigation

#### Filtered Content:
- Treatment center onboarding workflows
- API integration tests for onboarding
- Compliance validation for onboarding process
- Document upload and processing
- Therapy and service selection testing
- Financial assessment validation

---

### 👑 **SuperAdmin** (`superAdmin`)  
**Focus:** System Administration & User Management

#### Test Categories:
- **Unit Tests (6):** User management, role assignment, security functions
- **Integration Tests (4):** User workflows, facility integration, access control
- **System Tests (4):** Deployment, security, framework, stability
- **E2E Tests (3):** Admin workflows, user lifecycle, facility management
- **UAT Tests (3):** Enterprise setup, compliance, security administration
- **Performance Tests (3):** Dashboard performance, bulk operations, monitoring
- **Regression Tests (2):** Admin core functions, security features

#### Filtered Content:
- User profile creation and management
- Role assignment and permissions
- Security administration and monitoring
- API key management and security
- Facility administration (multi-tenant)
- Module configuration and management
- System deployment and stability

---

## Test Type Filtering

All roles have access to the same test types with visual indicators:

- 🧪 **Unit Tests** - Component-level testing
- 🔗 **Integration Tests** - API and workflow integration
- 🖥️ **System Tests** - Complete system functionality
- 🔄 **E2E Tests** - End-to-end user journeys
- 👤 **UAT Tests** - User acceptance testing
- 🔙 **Regression Tests** - Feature stability testing
- ⚡ **Performance Tests** - Load and stress testing

## Filter Options

### Status Filters:
- ✅ **Passed** - Successfully executed tests
- ❌ **Failed** - Tests with failures
- ⏳ **Pending** - Not yet executed

### Category Filters:
- **Form Validation** - Input validation testing
- **Business Logic** - Core functionality testing
- **API Integration** - External system integration
- **User Experience** - Interface and workflow testing
- **Security Testing** - Access control and protection
- **Performance Testing** - System load and response
- **Regression Testing** - Feature stability

### Topic Filters:
Role-specific topics are automatically filtered based on user permissions.

## Database Integration Testing

The DB Integration tab is also filtered by role:

### Onboarding Team:
- Treatment center onboarding tables
- Document upload tables
- Therapy and service selection tables
- Onboarding workflow tables

### SuperAdmin:
- User management tables
- Role and permission tables
- Security and audit tables
- API and module management tables

## Implementation Details

### Component Updates:
- **TestCasesDisplay.tsx** - Enhanced filtering with role-based logic
- **Testing.tsx** - Role-specific information banners and filtering
- **DatabaseIntegrationTestingFramework.tsx** - Role-based table filtering

### Filtering Logic:
```typescript
// Onboarding Team Filter
testCase.related_functionality?.includes('onboarding') ||
testCase.module_name?.includes('onboarding') ||
testCase.topic?.includes('onboarding')

// SuperAdmin Filter  
testCase.related_functionality?.includes('admin') ||
testCase.related_functionality?.includes('user') ||
testCase.related_functionality?.includes('security') ||
testCase.module_name?.includes('management')
```

### Database Schema:
- **55 total test cases** (down from 600+ generic tests)
- **30 onboarding-specific tests**
- **55 admin-specific tests** (includes overlapping system tests)
- All tests tagged with proper `module_name`, `topic`, and `related_functionality`

## Usage

1. **Access Testing Framework:** Navigate to Testing page based on your role
2. **Automatic Filtering:** Test cases are automatically filtered by role
3. **Additional Filtering:** Use the filter dropdowns to further refine results
4. **Role Indicator:** Visual banner shows your current role and scope
5. **Cross-Tab Consistency:** Filtering applies to Test Cases, Test Scripts, Test Execution, and DB Integration tabs

## Compliance & Validation

All test cases maintain:
- **21 CFR Part 11 compliance** metadata
- **Validation levels** (IQ, OQ, PQ)
- **Audit trail** capabilities
- **Electronic signature** readiness
- **Real-time sync** with database

## Benefits

1. **Focused Testing:** Users only see relevant tests for their role
2. **Reduced Complexity:** No more browsing through 600+ unrelated tests
3. **Better Organization:** Tests grouped by business function and topic
4. **Improved Performance:** Smaller, filtered datasets load faster
5. **Role Security:** Users can't access tests outside their scope
6. **Consistent Experience:** Same filtering across all testing tabs

---

*Last Updated: January 31, 2025*  
*Version: 2.0*  
*Role-Based Filtering: Enabled*