
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Plus, X, Users, Shield, Settings } from 'lucide-react';
import { TreatmentCenterOnboarding } from '@/types/onboarding';

interface OnlinePlatformUsersStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onDataChange: (data: Partial<TreatmentCenterOnboarding>) => void;
}

interface PlatformUser {
  user_type: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  access_level: string;
  can_place_orders: boolean;
  can_manage_users: boolean;
  can_view_reports: boolean;
  notification_preferences: {
    email_orders: boolean;
    email_shipments: boolean;
    email_invoices: boolean;
    sms_urgent: boolean;
  };
}

const USER_TYPES = [
  { value: 'primary_admin', label: 'Primary Administrator' },
  { value: 'secondary_admin', label: 'Secondary Administrator' },
  { value: 'ordering_user', label: 'Ordering User' },
  { value: 'receiving_user', label: 'Receiving User' },
  { value: 'accounting_user', label: 'Accounting User' }
];

const ACCESS_LEVELS = [
  { value: 'full', label: 'Full Access' },
  { value: 'limited', label: 'Limited Access' },
  { value: 'view_only', label: 'View Only' }
];

export const OnlinePlatformUsersStep: React.FC<OnlinePlatformUsersStepProps> = ({
  data,
  onDataChange
}) => {
  const platformUsers = (data as any)?.platform_users || [];

  const addPlatformUser = () => {
    const newUser: PlatformUser = {
      user_type: 'ordering_user',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      department: '',
      access_level: 'limited',
      can_place_orders: false,
      can_manage_users: false,
      can_view_reports: false,
      notification_preferences: {
        email_orders: true,
        email_shipments: true,
        email_invoices: false,
        sms_urgent: false
      }
    };

    onDataChange({
      ...data,
      platform_users: [...platformUsers, newUser]
    });
  };

  const updatePlatformUser = (index: number, field: string, value: any) => {
    const updatedUsers = [...platformUsers];
    if (field.startsWith('notification_preferences.')) {
      const prefField = field.split('.')[1];
      updatedUsers[index] = {
        ...updatedUsers[index],
        notification_preferences: {
          ...updatedUsers[index].notification_preferences,
          [prefField]: value
        }
      };
    } else {
      updatedUsers[index] = {
        ...updatedUsers[index],
        [field]: value
      };
    }

    onDataChange({
      ...data,
      platform_users: updatedUsers
    });
  };

  const removePlatformUser = (index: number) => {
    const updatedUsers = platformUsers.filter((_: any, i: number) => i !== index);
    onDataChange({
      ...data,
      platform_users: updatedUsers
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Online Platform Users</span>
            </span>
            <Button onClick={addPlatformUser} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </CardTitle>
          <CardDescription>
            Set up user accounts for your organization's online platform access. Define roles, permissions, and notification preferences for each user.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {platformUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No platform users configured yet.</p>
              <p className="text-sm">Add users to manage online platform access.</p>
            </div>
          ) : (
            platformUsers.map((user: PlatformUser, index: number) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base">
                    Platform User {index + 1}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePlatformUser(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>User Type *</Label>
                      <Select
                        value={user.user_type}
                        onValueChange={(value) => updatePlatformUser(index, 'user_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select user type" />
                        </SelectTrigger>
                        <SelectContent>
                          {USER_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Access Level *</Label>
                      <Select
                        value={user.access_level}
                        onValueChange={(value) => updatePlatformUser(index, 'access_level', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select access level" />
                        </SelectTrigger>
                        <SelectContent>
                          {ACCESS_LEVELS.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>First Name *</Label>
                      <Input
                        value={user.first_name}
                        onChange={(e) => updatePlatformUser(index, 'first_name', e.target.value)}
                        placeholder="Enter first name"
                        required
                      />
                    </div>
                    <div>
                      <Label>Last Name *</Label>
                      <Input
                        value={user.last_name}
                        onChange={(e) => updatePlatformUser(index, 'last_name', e.target.value)}
                        placeholder="Enter last name"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Email Address *</Label>
                      <Input
                        type="email"
                        value={user.email}
                        onChange={(e) => updatePlatformUser(index, 'email', e.target.value)}
                        placeholder="user@example.com"
                        required
                      />
                    </div>
                    <div>
                      <Label>Phone Number</Label>
                      <Input
                        value={user.phone}
                        onChange={(e) => updatePlatformUser(index, 'phone', e.target.value)}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Department</Label>
                    <Input
                      value={user.department}
                      onChange={(e) => updatePlatformUser(index, 'department', e.target.value)}
                      placeholder="e.g., Pharmacy, Nursing, Administration"
                    />
                  </div>

                  <Separator />

                  {/* Permissions */}
                  <div>
                    <h4 className="font-medium flex items-center space-x-2 mb-3">
                      <Shield className="h-4 w-4" />
                      <span>Permissions</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`can_place_orders_${index}`}
                          checked={user.can_place_orders}
                          onCheckedChange={(checked) => 
                            updatePlatformUser(index, 'can_place_orders', checked)
                          }
                        />
                        <Label htmlFor={`can_place_orders_${index}`}>Can Place Orders</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`can_manage_users_${index}`}
                          checked={user.can_manage_users}
                          onCheckedChange={(checked) => 
                            updatePlatformUser(index, 'can_manage_users', checked)
                          }
                        />
                        <Label htmlFor={`can_manage_users_${index}`}>Can Manage Users</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`can_view_reports_${index}`}
                          checked={user.can_view_reports}
                          onCheckedChange={(checked) => 
                            updatePlatformUser(index, 'can_view_reports', checked)
                          }
                        />
                        <Label htmlFor={`can_view_reports_${index}`}>Can View Reports</Label>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Notification Preferences */}
                  <div>
                    <h4 className="font-medium flex items-center space-x-2 mb-3">
                      <Settings className="h-4 w-4" />
                      <span>Notification Preferences</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`email_orders_${index}`}
                          checked={user.notification_preferences?.email_orders || false}
                          onCheckedChange={(checked) => 
                            updatePlatformUser(index, 'notification_preferences.email_orders', checked)
                          }
                        />
                        <Label htmlFor={`email_orders_${index}`}>Email - Order Updates</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`email_shipments_${index}`}
                          checked={user.notification_preferences?.email_shipments || false}
                          onCheckedChange={(checked) => 
                            updatePlatformUser(index, 'notification_preferences.email_shipments', checked)
                          }
                        />
                        <Label htmlFor={`email_shipments_${index}`}>Email - Shipment Updates</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`email_invoices_${index}`}
                          checked={user.notification_preferences?.email_invoices || false}
                          onCheckedChange={(checked) => 
                            updatePlatformUser(index, 'notification_preferences.email_invoices', checked)
                          }
                        />
                        <Label htmlFor={`email_invoices_${index}`}>Email - Invoice Updates</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`sms_urgent_${index}`}
                          checked={user.notification_preferences?.sms_urgent || false}
                          onCheckedChange={(checked) => 
                            updatePlatformUser(index, 'notification_preferences.sms_urgent', checked)
                          }
                        />
                        <Label htmlFor={`sms_urgent_${index}`}>SMS - Urgent Notifications</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
