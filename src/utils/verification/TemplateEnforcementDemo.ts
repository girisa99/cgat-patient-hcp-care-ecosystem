
/**
 * Template Enforcement Demo
 * Shows how the template enforcement system works
 */

import { TemplateEnforcement } from './TemplateEnforcement';

/**
 * Demo function to show template enforcement in action
 */
export const demoTemplateEnforcement = () => {
  console.log('🎯 Template Enforcement Demo');

  // Example 1: Hook creation request
  const hookRequest = {
    componentType: 'hook' as const,
    tableName: 'patient_records',
    moduleName: 'PatientRecords',
    description: 'Hook for managing patient medical records'
  };

  console.log('\n📋 Example 1: Hook Creation Request');
  const hookEnforcement = TemplateEnforcement.analyzeAndEnforce(hookRequest);
  const hookSummary = TemplateEnforcement.generateEnforcementSummary(hookEnforcement);
  hookSummary.forEach(item => console.log(item));

  // Example 2: Component creation request
  const componentRequest = {
    componentType: 'component' as const,
    tableName: 'appointments',
    moduleName: 'Appointments',
    description: 'Component for managing appointment scheduling'
  };

  console.log('\n📋 Example 2: Component Creation Request');
  const componentEnforcement = TemplateEnforcement.analyzeAndEnforce(componentRequest);
  const componentSummary = TemplateEnforcement.generateEnforcementSummary(componentEnforcement);
  componentSummary.forEach(item => console.log(item));

  // Example 3: Anti-pattern violation
  const violationRequest = {
    componentType: 'hook' as const,
    description: 'Custom hook with mock data for testing'
  };

  console.log('\n📋 Example 3: Anti-Pattern Violation');
  const violationEnforcement = TemplateEnforcement.analyzeAndEnforce(violationRequest);
  const violationSummary = TemplateEnforcement.generateEnforcementSummary(violationEnforcement);
  violationSummary.forEach(item => console.log(item));
};

// Uncomment to run demo
// demoTemplateEnforcement();
