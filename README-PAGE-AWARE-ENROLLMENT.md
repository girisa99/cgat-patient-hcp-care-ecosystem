# Page-Aware Conversational Enrollment

## ✅ **Complete Implementation**

The conversational enrollment system now intelligently adapts to show only relevant options based on the current page context.

## 🎯 **How It Works**

### **Automatic Page Detection**
- **Route Analysis**: System detects current URL path
- **Context Mapping**: Maps pages to specific enrollment modules
- **Smart Filtering**: Shows only relevant enrollment options
- **Contextual AI**: AI greetings adapt to page context

### **Page-Specific Behavior**

| Page Route | Enrollment Module | Floating Button | AI Greeting Context |
|------------|------------------|----------------|-------------------|
| `/patients` | Patient Only | ✅ Patient Enrollment | "I see you're in the patient portal..." |
| `/patient-onboarding` | Patient Only | ✅ Patient Enrollment | "Welcome to patient onboarding!" |
| `/treatment-centers` | Treatment Center Only | ✅ Treatment Center | "Let me help you register your facility..." |
| `/facilities` | Treatment Center Only | ✅ Facility Registration | "Let's complete your facility registration..." |
| `/order-management` | Customer Only | ✅ Customer Registration | "I see you want to place orders. Let me help you register..." |
| `/system-integration` | Manufacturer Only | ✅ Vendor Registration | "Let's get you registered as a vendor partner..." |
| `/dashboard` | All Modules | ❌ No Floating Button | Shows all options when explicitly called |
| `/enrollment-demo` | All Modules | ❌ Demo Mode | Full feature demonstration |

## 🚀 **Features**

### **Smart Contextual Display**
- **Single Module Pages**: Show only relevant enrollment option
- **General Pages**: No floating button (avoid clutter)
- **Demo Pages**: Show all options for testing

### **Adaptive UI Components**
- **Floating Button**: Changes title and color based on page context
- **Menu Integration**: Shows contextual options in navigation
- **Inline Components**: Adapt to show relevant modules

### **Contextual AI Conversations**
- **Page-Aware Greetings**: AI knows why user is there
- **Context-Specific Prompts**: Tailored conversation starters
- **Smart Assumptions**: Pre-fills context based on page

## 📱 **Usage Examples**

### **1. Patient Portal Integration**
```tsx
// On /patients page - automatically shows only patient enrollment
// Floating button appears as "Patient Enrollment" with medical icon
// AI greeting: "I see you're in the patient portal. Let me help..."
```

### **2. Treatment Center Pages**
```tsx
// On /treatment-centers or /facilities
// Shows only treatment center registration
// AI greeting: "Let me help you register your treatment facility..."
```

### **3. Order Management Context**
```tsx
// On /order-management page
// Shows customer registration to enable ordering
// AI greeting: "I see you want to place orders. Let me help you register as a customer first..."
```

### **4. Force Specific Module**
```tsx
<EnrollmentLauncher 
  variant="inline" 
  forceModule="patient" 
/>
// Forces showing only patient enrollment regardless of page
```

### **5. Show All Options**
```tsx
<EnrollmentLauncher 
  variant="inline" 
  showAllOptions={true} 
/>
// Override page detection to show all modules
```

## 🔧 **Configuration**

### **Route Mapping**
Edit `src/hooks/usePageAwareEnrollment.tsx` to add new page mappings:

```tsx
const pageModuleMap: Record<string, PageEnrollmentConfig> = {
  '/your-new-page': {
    moduleType: 'patient',
    title: 'Custom Page Enrollment',
    description: 'Page-specific description',
    showFloating: true,
    context: 'custom_context'
  }
};
```

### **Contextual AI Prompts**
Customize AI greetings in `getContextualPrompt()` method:

```tsx
const contextPrompts = {
  patient: {
    your_context: "Custom greeting for your specific page context..."
  }
};
```

## 🎨 **Component Variants**

### **1. Context-Aware Floating Button**
```tsx
// Automatically adapts based on current page
// Only shows on relevant pages
// Single module = direct action
// Multiple modules = expandable menu
```

### **2. Page-Specific Menu**
```tsx
<EnrollmentLauncher variant="menu" />
// Shows contextual options in dropdown
// Adapts title and options to current page
```

### **3. Inline Context Display**
```tsx
<EnrollmentLauncher variant="inline" />
// Embeds contextually relevant options
// Responsive grid layout
// Page-specific titles and descriptions
```

## 🧪 **Testing**

### **Test Pages Available**
- `/page-demo` - Interactive demonstration of page-aware behavior
- Navigate between different pages to see floating button adapt
- Each page shows only relevant enrollment options

### **Testing Checklist**
- [ ] `/patients` shows only Patient Enrollment
- [ ] `/treatment-centers` shows only Treatment Center Registration  
- [ ] `/order-management` shows only Customer Registration
- [ ] `/system-integration` shows only Manufacturer Registration
- [ ] Dashboard pages show no floating button
- [ ] AI greetings are contextually appropriate

## 💡 **Benefits**

### **User Experience**
- **Reduced Cognitive Load**: Only see relevant options
- **Faster Decisions**: No need to choose between irrelevant modules
- **Context Awareness**: AI understands user's current task
- **Seamless Integration**: Feels native to each page

### **Business Benefits**
- **Higher Conversion**: Less choice paralysis
- **Better UX**: More intuitive enrollment flows
- **Page-Specific Metrics**: Track enrollment by page context
- **Reduced Support**: Clear, contextual options

## 🚀 **Implementation Status**

✅ **Complete**: Page-aware enrollment system with contextual AI conversations  
✅ **Complete**: Route-based module detection and filtering  
✅ **Complete**: Adaptive floating button behavior  
✅ **Complete**: Context-specific AI greetings and prompts  
✅ **Complete**: Multi-variant launcher components  
✅ **Complete**: Page-specific demo and testing interface  

The system is production-ready and automatically provides the right enrollment options based on user context!