# Patient Enrollment System Architecture

## Overview
The Patient Enrollment system provides multiple pathways for capturing comprehensive patient information with real-time database integration and AI-powered assistance.

## System Components

### 1. Enrollment Section Manager (`EnrollmentSectionManager.tsx`)
- **Real-time Progress Tracking**: Monitors completion across all sections
- **Database Integration**: Auto-saves to appropriate tables based on section
- **Section Navigation**: Allows jumping between completed sections
- **Progress Visualization**: Shows completion percentage and status indicators

### 2. Consent Management Section (`ConsentManagementSection.tsx`)
- **Provider Selection**: Choose existing providers or add new ones
- **Treatment Center Management**: Select facilities with address/NPI data  
- **Multi-method Consent**: Support for facility present, digital SMS/email, verbal consent
- **Signature Capture**: Digital provider signature collection
- **Status Tracking**: Real-time consent status updates

### 3. Patient Information Section (`PatientInformationSection.tsx`)
- **Complete Demographics**: Name, DOB, gender, preferred language
- **Contact Information**: Email, multiple phone numbers with formatting
- **Address Management**: Full address with state validation
- **Alternative Contacts**: Emergency contact with relationship tracking
- **Communication Preferences**: Do not contact options

### 4. Real-time Features
- **Auto-save**: Debounced saving every few seconds
- **Progress Sync**: Real-time updates across multiple sessions
- **Status Broadcasting**: Live section completion notifications
- **Session Recovery**: Resume interrupted enrollments

## Database Schema Integration

### Tables Used:
- `patient_enrollments` - Main enrollment tracking
- `enrollment_consent` - Consent management data
- `enrollment_patient_info` - Patient demographics
- `enrollment_provider_info` - Provider/facility information  
- `enrollment_insurance_info` - Insurance coverage details
- `enrollment_clinical_info` - Clinical assessments
- `enrollment_treatment_plan` - Treatment planning

### Real-time Channels:
- `enrollment_progress_{enrollmentId}` - Progress updates
- `enrollment_presence_{sessionId}` - User presence tracking

## AI Integration

### Conversational AI Flow:
1. **Message Processing**: Route messages through conversation engines
2. **Data Extraction**: Extract structured data from natural language
3. **Section Mapping**: Map extracted data to appropriate form sections
4. **Progress Updates**: Calculate and broadcast completion status
5. **Navigation**: Intelligently advance to next required section

### Workflow Builder Integration:
- Agent template configuration
- Journey stage definitions
- Automated response patterns
- Reusable enrollment workflows

## Usage Examples

### Basic Section Implementation:
```tsx
<EnrollmentSectionManager
  enrollmentId={enrollmentId}
  currentSection="consent_management"
  formData={formData}
  onSectionComplete={handleSectionComplete}
  onSectionChange={handleSectionChange}
>
  <ConsentManagementSection
    data={consentData}
    onChange={handleConsentChange}
    onSave={handleSave}
    isLoading={isLoading}
  />
</EnrollmentSectionManager>
```

### Real-time Progress Tracking:
```tsx
// Auto-saves to database on every change
const handleFormDataChange = (field, value) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  // Triggers auto-save via EnrollmentSectionManager
};
```

## Key Features

### ✅ Implemented:
- Multi-section enrollment workflow
- Real-time progress tracking and auto-save  
- Comprehensive consent management
- Patient demographics collection
- Provider/facility selection and management
- Digital signature capture
- Session recovery and resume
- Database schema integration

### 🚧 In Progress:
- Insurance information section
- Clinical assessment section
- Treatment planning section
- Final review and submission

### 🔮 Future Enhancements:
- Voice-to-text enrollment
- Document upload and processing
- Multi-language support
- Advanced workflow automation
- Integration with external systems

## Best Practices

1. **Always use the EnrollmentSectionManager** for consistent data handling
2. **Implement real-time auto-save** for better user experience
3. **Validate data at both client and database level**
4. **Use consistent naming conventions** between form fields and database columns
5. **Handle session recovery gracefully** for interrupted enrollments
6. **Provide clear progress indicators** to users
7. **Test with real-time updates** to ensure data consistency