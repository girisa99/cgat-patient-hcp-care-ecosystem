
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useModules } from '@/hooks/useModules';
import { useAutomatedVerification } from '@/hooks/useAutomatedVerification';
import { Plus, Shield, CheckCircle } from 'lucide-react';

interface CreateModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (moduleData: any) => Promise<void>;
}

const CreateModuleDialog: React.FC<CreateModuleDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const { createModule, isCreating } = useModules();
  const { verifyBeforeCreation, isAutomatic } = useAutomatedVerification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    // AUTOMATIC verification - ALWAYS runs
    setIsVerifying(true);
    
    try {
      console.log('🔍 AUTOMATIC VERIFICATION: Module creation starting...');
      
      // This verification ALWAYS runs automatically
      const canProceed = await verifyBeforeCreation({
        moduleName: name.trim(),
        componentType: 'module',
        description: `Module: ${description.trim() || 'No description provided'}`
      });
      
      if (!canProceed) {
        console.log('🚫 Module creation AUTOMATICALLY BLOCKED by verification system');
        setIsVerifying(false);
        return;
      }
      
      console.log('✅ Module creation AUTOMATICALLY APPROVED by verification system');
      
      const moduleData = {
        name: name.trim(),
        description: description.trim() || null,
        is_active: isActive
      };

      if (onSubmit) {
        await onSubmit(moduleData);
      } else {
        await createModule(moduleData);
      }
      
      onOpenChange(false);
      setName('');
      setDescription('');
      setIsActive(true);
    } catch (error) {
      console.error('❌ Error during AUTOMATIC module creation:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Module
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            {isAutomatic ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                Automatic verification enabled - all modules are verified automatically.
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 text-blue-500" />
                Create a new system module with automated verification.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="module-name">Module Name *</Label>
            <Input
              id="module-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., patient_management"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="module-description">Description</Label>
            <Textarea
              id="module-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this module provides access to..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="module-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="module-active">Active</Label>
          </div>

          {/* Automatic verification status indicator */}
          {isAutomatic && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-2 text-sm text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span>Automatic verification is active - all modules are checked automatically</span>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isCreating || isVerifying}
              className="flex-1"
            >
              {isVerifying ? (
                <>
                  <Shield className="mr-2 h-4 w-4 animate-spin" />
                  Auto-Verifying...
                </>
              ) : isCreating ? (
                'Creating...'
              ) : (
                'Create Module'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateModuleDialog;
