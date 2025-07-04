
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMasterFormStateManager } from '@/hooks/useMasterFormStateManager';
import type { MasterUserFormState } from '@/types/masterFormState';

interface MasterUserFormProps {
  onSubmit: (userData: MasterUserFormState) => void;
  isSubmitting?: boolean;
  onCancel: () => void;
  initialData?: Partial<MasterUserFormState>;
  title?: string;
}

export const MasterUserForm: React.FC<MasterUserFormProps> = ({
  onSubmit,
  isSubmitting = false,
  onCancel,
  initialData,
  title = "Add New User"
}) => {
  const {
    formState,
    updateFormState,
    isFormValid
  } = useMasterFormStateManager(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onSubmit(formState);
    }
  };

  return (
    <Card className="bg-gray-50">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formState.firstName}
                onChange={(e) => updateFormState({ firstName: e.target.value })}
                placeholder="Enter first name"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formState.lastName}
                onChange={(e) => updateFormState({ lastName: e.target.value })}
                placeholder="Enter last name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formState.email}
                onChange={(e) => updateFormState({ email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <div>
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                value={formState.role}
                onChange={(e) => updateFormState({ role: e.target.value })}
                placeholder="Enter role"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formState.phone || ''}
                onChange={(e) => updateFormState({ phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button type="submit" disabled={isSubmitting || !isFormValid}>
              {isSubmitting ? 'Processing...' : 'Save User'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
