/**
 * PROTECTED MASTER AUTH FORM
 * Wrapper component that provides stability protection for the MasterAuthForm
 * Implements component isolation and change detection
 */
import React, { useEffect } from 'react';
import { componentProtection } from '@/utils/stability/ComponentProtection';
import MasterAuthForm from './MasterAuthForm';

interface ProtectedMasterAuthFormProps {
  onSuccess?: () => void;
  defaultTab?: 'login' | 'signup';
}

export const ProtectedMasterAuthForm: React.FC<ProtectedMasterAuthFormProps> = (props) => {
  useEffect(() => {
    // Log component usage
    componentProtection.logComponentChange('MasterAuthForm', 'component_mount', {
      timestamp: new Date().toISOString(),
      props: Object.keys(props)
    });

    return () => {
      componentProtection.logComponentChange('MasterAuthForm', 'component_unmount', {
        timestamp: new Date().toISOString()
      });
    };
  }, [props]);

  // Validate component integrity
  useEffect(() => {
    const validation = componentProtection.validateComponent('MasterAuthForm');
    if (!validation.valid) {
      console.warn('🚨 MasterAuthForm validation issues:', validation.issues);
    }
  }, []);

  // Create isolated wrapper
  const IsolatedMasterAuthForm = componentProtection.createIsolationWrapper(
    'MasterAuthForm',
    MasterAuthForm
  );

  return <IsolatedMasterAuthForm {...props} />;
};

export default ProtectedMasterAuthForm;