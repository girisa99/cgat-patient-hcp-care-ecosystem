
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { TreatmentCenterOnboarding } from '@/types/onboarding';
import { Clock, Calendar, Phone, Mail } from 'lucide-react';

interface OfficeHoursStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onDataChange: (data: Partial<TreatmentCenterOnboarding>) => void;
}

export const OfficeHoursStep: React.FC<OfficeHoursStepProps> = ({ data, onDataChange }) => {
  const officeHours = data.office_hours || {
    monday: { open: '', close: '', closed: false },
    tuesday: { open: '', close: '', closed: false },
    wednesday: { open: '', close: '', closed: false },
    thursday: { open: '', close: '', closed: false },
    friday: { open: '', close: '', closed: false },
    saturday: { open: '', close: '', closed: true },
    sunday: { open: '', close: '', closed: true },
    timezone: '',
    emergency_contact: {
      available_24_7: false,
      phone: '',
      email: '',
      instructions: ''
    },
    special_hours: {
      holidays_closed: true,
      holiday_schedule: '',
      seasonal_adjustments: ''
    }
  };

  const updateOfficeHours = (day: string, field: string, value: any) => {
    const updatedHours = {
      ...officeHours,
      [day]: {
        ...officeHours[day as keyof typeof officeHours],
        [field]: value
      }
    };

    onDataChange({
      ...data,
      office_hours: updatedHours
    });
  };

  const updateEmergencyContact = (field: string, value: any) => {
    const updatedHours = {
      ...officeHours,
      emergency_contact: {
        ...officeHours.emergency_contact,
        [field]: value
      }
    };

    onDataChange({
      ...data,
      office_hours: updatedHours
    });
  };

  const updateSpecialHours = (field: string, value: any) => {
    const updatedHours = {
      ...officeHours,
      special_hours: {
        ...officeHours.special_hours,
        [field]: value
      }
    };

    onDataChange({
      ...data,
      office_hours: updatedHours
    });
  };

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  const timezones = [
    'America/New_York',
    'America/Chicago', 
    'America/Denver',
    'America/Los_Angeles',
    'America/Phoenix',
    'America/Anchorage',
    'Pacific/Honolulu'
  ];

  return (
    <div className="space-y-6">
      {/* Operating Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Operating Hours</span>
          </CardTitle>
          <CardDescription>
            Define your facility's operating hours for delivery scheduling and support
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timezone Selection */}
          <div className="mb-6">
            <Label htmlFor="timezone">Timezone *</Label>
            <Select
              value={officeHours.timezone}
              onValueChange={(value) => updateOfficeHours('timezone', '', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz.replace('America/', '').replace('Pacific/', '').replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Daily Hours */}
          <div className="space-y-4">
            {days.map((day) => {
              const dayHours = officeHours[day.key as keyof typeof officeHours] as any;
              return (
                <div key={day.key} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="w-24">
                    <Label className="font-medium">{day.label}</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${day.key}-closed`}
                      checked={dayHours?.closed || false}
                      onCheckedChange={(checked) => updateOfficeHours(day.key, 'closed', checked)}
                    />
                    <Label htmlFor={`${day.key}-closed`} className="text-sm">Closed</Label>
                  </div>

                  {!dayHours?.closed && (
                    <>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`${day.key}-open`} className="text-sm">Open:</Label>
                        <Input
                          id={`${day.key}-open`}
                          type="time"
                          value={dayHours?.open || ''}
                          onChange={(e) => updateOfficeHours(day.key, 'open', e.target.value)}
                          className="w-32"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`${day.key}-close`} className="text-sm">Close:</Label>
                        <Input
                          id={`${day.key}-close`}
                          type="time"
                          value={dayHours?.close || ''}
                          onChange={(e) => updateOfficeHours(day.key, 'close', e.target.value)}
                          className="w-32"
                        />
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="h-5 w-5" />
            <span>Emergency Contact Information</span>
          </CardTitle>
          <CardDescription>
            Emergency contact details for after-hours or urgent situations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="available-24-7"
              checked={officeHours.emergency_contact?.available_24_7 || false}
              onCheckedChange={(checked) => updateEmergencyContact('available_24_7', checked)}
            />
            <Label htmlFor="available-24-7">24/7 emergency contact available</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emergency-phone">Emergency Phone</Label>
              <Input
                id="emergency-phone"
                value={officeHours.emergency_contact?.phone || ''}
                onChange={(e) => updateEmergencyContact('phone', e.target.value)}
                placeholder="Emergency contact number"
              />
            </div>
            <div>
              <Label htmlFor="emergency-email">Emergency Email</Label>
              <Input
                id="emergency-email"
                type="email"
                value={officeHours.emergency_contact?.email || ''}
                onChange={(e) => updateEmergencyContact('email', e.target.value)}
                placeholder="emergency@example.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="emergency-instructions">Emergency Contact Instructions</Label>
            <Textarea
              id="emergency-instructions"
              value={officeHours.emergency_contact?.instructions || ''}
              onChange={(e) => updateEmergencyContact('instructions', e.target.value)}
              placeholder="Instructions for emergency contact (e.g., call main number and press 1 for emergencies)"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Special Hours & Holidays */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Special Hours & Holidays</span>
          </CardTitle>
          <CardDescription>
            Holiday schedules and seasonal hour adjustments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="holidays-closed"
              checked={officeHours.special_hours?.holidays_closed || false}
              onCheckedChange={(checked) => updateSpecialHours('holidays_closed', checked)}
            />
            <Label htmlFor="holidays-closed">Closed on major holidays</Label>
          </div>

          <div>
            <Label htmlFor="holiday-schedule">Holiday Schedule</Label>
            <Textarea
              id="holiday-schedule"
              value={officeHours.special_hours?.holiday_schedule || ''}
              onChange={(e) => updateSpecialHours('holiday_schedule', e.target.value)}
              placeholder="List specific holidays when closed or modified hours (e.g., Closed Dec 25, Half day Dec 24)"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="seasonal-adjustments">Seasonal Hour Adjustments</Label>
            <Textarea
              id="seasonal-adjustments"
              value={officeHours.special_hours?.seasonal_adjustments || ''}
              onChange={(e) => updateSpecialHours('seasonal_adjustments', e.target.value)}
              placeholder="Any seasonal changes to operating hours"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
