
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMasterFormStateManager } from '@/hooks/useMasterFormStateManager';
import type { MasterUserFormState } from '@/types/masterFormState';

interface TypeSafeUserFormProps {
  onSubmit: (data: MasterUserFormState) => void;
  initialData?: Partial<MasterUserFormState>;
  isLoading?: boolean;
}

export const TypeSafeUserForm: React.FC<TypeSafeUserFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false
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
    <Card>
      <CardHeader>
        <CardTitle>User Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formState.firstName}
                onChange={(e) => updateFormState({ firstName: e.target.value, first_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formState.lastName}
                onChange={(e) => updateFormState({ lastName: e.target.value, last_name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formState.email}
              onChange={(e) => updateFormState({ email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              value={formState.role}
              onChange={(e) => updateFormState({ role: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input
              id="phone"
              value={formState.phone || ''}
              onChange={(e) => updateFormState({ phone: e.target.value })}
            />
          </div>

          <Button 
            type="submit" 
            disabled={!isFormValid || isLoading}
            className="w-full"
          >
            {isLoading ? 'Saving...' : 'Save User'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
