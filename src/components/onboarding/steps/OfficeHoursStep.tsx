
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { TreatmentCenterOnboarding } from '@/types/onboarding';
import { Clock, Phone, Calendar } from 'lucide-react';

interface OfficeHoursStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onDataChange: (data: Partial<TreatmentCenterOnboarding>) => void;
}

interface DayHours {
  open: string;
  close: string;
  closed: boolean;
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

  const updateOfficeHours = (field: string, value: any) => {
    const updatedOfficeHours = {
      ...officeHours,
      [field]: value
    };

    onDataChange({
      ...data,
      office_hours: updatedOfficeHours
    });
  };

  const updateDayHours = (day: string, field: string, value: any) => {
    const currentDayHours = officeHours[day as keyof typeof officeHours] as DayHours;
    const updatedDayHours: DayHours = {
      ...currentDayHours,
      [field]: value
    };

    const updatedOfficeHours = {
      ...officeHours,
      [day]: updatedDayHours
    };

    onDataChange({
      ...data,
      office_hours: updatedOfficeHours
    });
  };

  const updateEmergencyContact = (field: string, value: any) => {
    const updatedOfficeHours = {
      ...officeHours,
      emergency_contact: {
        ...officeHours.emergency_contact,
        [field]: value
      }
    };

    onDataChange({
      ...data,
      office_hours: updatedOfficeHours
    });
  };

  const updateSpecialHours = (field: string, value: any) => {
    const updatedOfficeHours = {
      ...officeHours,
      special_hours: {
        ...officeHours.special_hours,
        [field]: value
      }
    };

    onDataChange({
      ...data,
      office_hours: updatedOfficeHours
    });
  };

  const daysOfWeek = [
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
    'America/Anchorage',
    'Pacific/Honolulu'
  ];

  return (
    <div className="space-y-6">
      {/* Timezone Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Timezone & General Hours</span>
          </CardTitle>
          <CardDescription>
            Set your facility's timezone and operating hours
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="timezone">Timezone *</Label>
            <Select
              value={officeHours.timezone}
              onValueChange={(value) => updateOfficeHours('timezone', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz.replace('_', ' ').replace('America/', '').replace('Pacific/', '')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Operating Hours</CardTitle>
          <CardDescription>
            Configure your facility's hours for each day of the week
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {daysOfWeek.map((day) => {
            const dayHours = officeHours[day.key as keyof typeof officeHours] as DayHours;
            
            return (
              <div key={day.key} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-24">
                  <Label className="font-medium">{day.label}</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`${day.key}-closed`}
                    checked={dayHours?.closed || false}
                    onCheckedChange={(checked) => updateDayHours(day.key, 'closed', checked)}
                  />
                  <Label htmlFor={`${day.key}-closed`} className="text-sm">
                    Closed
                  </Label>
                </div>

                {!dayHours?.closed && (
                  <>
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm">Open:</Label>
                      <Input
                        type="time"
                        value={dayHours?.open || ''}
                        onChange={(e) => updateDayHours(day.key, 'open', e.target.value)}
                        className="w-32"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm">Close:</Label>
                      <Input
                        type="time"
                        value={dayHours?.close || ''}
                        onChange={(e) => updateDayHours(day.key, 'close', e.target.value)}
                        className="w-32"
                      />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="h-5 w-5" />
            <span>Emergency Contact</span>
          </CardTitle>
          <CardDescription>
            Provide emergency contact information for after-hours situations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="available-24-7"
              checked={officeHours.emergency_contact.available_24_7}
              onCheckedChange={(checked) => updateEmergencyContact('available_24_7', checked)}
            />
            <Label htmlFor="available-24-7">24/7 Emergency Contact Available</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Emergency Phone</Label>
              <Input
                value={officeHours.emergency_contact.phone}
                onChange={(e) => updateEmergencyContact('phone', e.target.value)}
                placeholder="Emergency phone number"
              />
            </div>
            <div>
              <Label>Emergency Email</Label>
              <Input
                type="email"
                value={officeHours.emergency_contact.email}
                onChange={(e) => updateEmergencyContact('email', e.target.value)}
                placeholder="Emergency email address"
              />
            </div>
          </div>

          <div>
            <Label>Emergency Instructions</Label>
            <Textarea
              value={officeHours.emergency_contact.instructions}
              onChange={(e) => updateEmergencyContact('instructions', e.target.value)}
              placeholder="Special instructions for emergency contacts"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Special Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Special Hours & Holidays</span>
          </CardTitle>
          <CardDescription>
            Configure holiday schedules and seasonal adjustments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="holidays-closed"
              checked={officeHours.special_hours.holidays_closed}
              onCheckedChange={(checked) => updateSpecialHours('holidays_closed', checked)}
            />
            <Label htmlFor="holidays-closed">Closed on Federal Holidays</Label>
          </div>

          <div>
            <Label>Holiday Schedule</Label>
            <Textarea
              value={officeHours.special_hours.holiday_schedule}
              onChange={(e) => updateSpecialHours('holiday_schedule', e.target.value)}
              placeholder="Describe your holiday schedule (e.g., closed Christmas Day, half day Christmas Eve)"
              rows={3}
            />
          </div>

          <div>
            <Label>Seasonal Adjustments</Label>
            <Textarea
              value={officeHours.special_hours.seasonal_adjustments}
              onChange={(e) => updateSpecialHours('seasonal_adjustments', e.target.value)}
              placeholder="Any seasonal hour changes (e.g., summer hours, winter adjustments)"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
