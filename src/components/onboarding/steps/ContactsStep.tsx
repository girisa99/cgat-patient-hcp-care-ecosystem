
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TreatmentCenterOnboarding } from '@/types/onboarding';

interface ContactsStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onUpdate: (data: Partial<TreatmentCenterOnboarding>) => void;
}

export const ContactsStep: React.FC<ContactsStepProps> = ({ data, onUpdate }) => {
  const updateContact = (contactType: 'primary_contact' | 'accounts_payable_contact' | 'shipping_contact' | 'alternate_contact', field: string, value: string) => {
    onUpdate({
      contacts: {
        ...data.contacts,
        [contactType]: {
          ...data.contacts?.[contactType],
          [field]: value
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Primary Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Primary Contact *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primary_name">Full Name *</Label>
              <Input
                id="primary_name"
                value={data.contacts?.primary_contact?.name || ''}
                onChange={(e) => updateContact('primary_contact', 'name', e.target.value)}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="primary_title">Title</Label>
              <Input
                id="primary_title"
                value={data.contacts?.primary_contact?.title || ''}
                onChange={(e) => updateContact('primary_contact', 'title', e.target.value)}
                placeholder="Enter job title"
              />
            </div>
            <div>
              <Label htmlFor="primary_phone">Phone *</Label>
              <Input
                id="primary_phone"
                value={data.contacts?.primary_contact?.phone || ''}
                onChange={(e) => updateContact('primary_contact', 'phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="primary_email">Email *</Label>
              <Input
                id="primary_email"
                type="email"
                value={data.contacts?.primary_contact?.email || ''}
                onChange={(e) => updateContact('primary_contact', 'email', e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <Label htmlFor="primary_fax">Fax</Label>
              <Input
                id="primary_fax"
                value={data.contacts?.primary_contact?.fax || ''}
                onChange={(e) => updateContact('primary_contact', 'fax', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Payable Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Accounts Payable Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ap_name">Full Name</Label>
              <Input
                id="ap_name"
                value={data.contacts?.accounts_payable_contact?.name || ''}
                onChange={(e) => updateContact('accounts_payable_contact', 'name', e.target.value)}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="ap_title">Title</Label>
              <Input
                id="ap_title"
                value={data.contacts?.accounts_payable_contact?.title || ''}
                onChange={(e) => updateContact('accounts_payable_contact', 'title', e.target.value)}
                placeholder="Enter job title"
              />
            </div>
            <div>
              <Label htmlFor="ap_phone">Phone</Label>
              <Input
                id="ap_phone"
                value={data.contacts?.accounts_payable_contact?.phone || ''}
                onChange={(e) => updateContact('accounts_payable_contact', 'phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="ap_email">Email</Label>
              <Input
                id="ap_email"
                type="email"
                value={data.contacts?.accounts_payable_contact?.email || ''}
                onChange={(e) => updateContact('accounts_payable_contact', 'email', e.target.value)}
                placeholder="email@example.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping/Receiving Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shipping_name">Full Name</Label>
              <Input
                id="shipping_name"
                value={data.contacts?.shipping_contact?.name || ''}
                onChange={(e) => updateContact('shipping_contact', 'name', e.target.value)}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="shipping_title">Title</Label>
              <Input
                id="shipping_title"
                value={data.contacts?.shipping_contact?.title || ''}
                onChange={(e) => updateContact('shipping_contact', 'title', e.target.value)}
                placeholder="Enter job title"
              />
            </div>
            <div>
              <Label htmlFor="shipping_phone">Phone</Label>
              <Input
                id="shipping_phone"
                value={data.contacts?.shipping_contact?.phone || ''}
                onChange={(e) => updateContact('shipping_contact', 'phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="shipping_email">Email</Label>
              <Input
                id="shipping_email"
                type="email"
                value={data.contacts?.shipping_contact?.email || ''}
                onChange={(e) => updateContact('shipping_contact', 'email', e.target.value)}
                placeholder="email@example.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alternate Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Alternate Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="alt_name">Full Name</Label>
              <Input
                id="alt_name"
                value={data.contacts?.alternate_contact?.name || ''}
                onChange={(e) => updateContact('alternate_contact', 'name', e.target.value)}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="alt_title">Title</Label>
              <Input
                id="alt_title"
                value={data.contacts?.alternate_contact?.title || ''}
                onChange={(e) => updateContact('alternate_contact', 'title', e.target.value)}
                placeholder="Enter job title"
              />
            </div>
            <div>
              <Label htmlFor="alt_phone">Phone</Label>
              <Input
                id="alt_phone"
                value={data.contacts?.alternate_contact?.phone || ''}
                onChange={(e) => updateContact('alternate_contact', 'phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="alt_email">Email</Label>
              <Input
                id="alt_email"
                type="email"
                value={data.contacts?.alternate_contact?.email || ''}
                onChange={(e) => updateContact('alternate_contact', 'email', e.target.value)}
                placeholder="email@example.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
