
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TreatmentCenterOnboarding } from '@/types/onboarding';

interface ContactsStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onDataChange: (data: Partial<TreatmentCenterOnboarding>) => void;
}

export const ContactsStep: React.FC<ContactsStepProps> = ({ data, onDataChange }) => {
  const handleContactChange = (contactType: string, field: string, value: string) => {
    onDataChange({
      contacts: {
        ...data.contacts,
        [contactType]: {
          ...data.contacts?.[contactType as keyof typeof data.contacts],
          [field]: value,
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Primary Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Primary Contact</CardTitle>
          <CardDescription>
            Main contact person for this application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primary_name">Full Name *</Label>
              <Input
                id="primary_name"
                value={data.contacts?.primary_contact?.name || ''}
                onChange={(e) => handleContactChange('primary_contact', 'name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="primary_title">Title</Label>
              <Input
                id="primary_title"
                value={data.contacts?.primary_contact?.title || ''}
                onChange={(e) => handleContactChange('primary_contact', 'title', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="primary_phone">Phone Number *</Label>
              <Input
                id="primary_phone"
                type="tel"
                value={data.contacts?.primary_contact?.phone || ''}
                onChange={(e) => handleContactChange('primary_contact', 'phone', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="primary_fax">Fax Number</Label>
              <Input
                id="primary_fax"
                type="tel"
                value={data.contacts?.primary_contact?.fax || ''}
                onChange={(e) => handleContactChange('primary_contact', 'fax', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="primary_email">Email Address *</Label>
              <Input
                id="primary_email"
                type="email"
                value={data.contacts?.primary_contact?.email || ''}
                onChange={(e) => handleContactChange('primary_contact', 'email', e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Payable Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Accounts Payable Contact</CardTitle>
          <CardDescription>
            Contact person for billing and payment matters (if different from primary)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ap_name">Full Name</Label>
              <Input
                id="ap_name"
                value={data.contacts?.accounts_payable_contact?.name || ''}
                onChange={(e) => handleContactChange('accounts_payable_contact', 'name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="ap_title">Title</Label>
              <Input
                id="ap_title"
                value={data.contacts?.accounts_payable_contact?.title || ''}
                onChange={(e) => handleContactChange('accounts_payable_contact', 'title', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="ap_phone">Phone Number</Label>
              <Input
                id="ap_phone"
                type="tel"
                value={data.contacts?.accounts_payable_contact?.phone || ''}
                onChange={(e) => handleContactChange('accounts_payable_contact', 'phone', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="ap_fax">Fax Number</Label>
              <Input
                id="ap_fax"
                type="tel"
                value={data.contacts?.accounts_payable_contact?.fax || ''}
                onChange={(e) => handleContactChange('accounts_payable_contact', 'fax', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="ap_email">Email Address</Label>
              <Input
                id="ap_email"
                type="email"
                value={data.contacts?.accounts_payable_contact?.email || ''}
                onChange={(e) => handleContactChange('accounts_payable_contact', 'email', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Contact</CardTitle>
          <CardDescription>
            Contact person for shipping and receiving (if different from primary)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shipping_name">Full Name</Label>
              <Input
                id="shipping_name"
                value={data.contacts?.shipping_contact?.name || ''}
                onChange={(e) => handleContactChange('shipping_contact', 'name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="shipping_title">Title</Label>
              <Input
                id="shipping_title"
                value={data.contacts?.shipping_contact?.title || ''}
                onChange={(e) => handleContactChange('shipping_contact', 'title', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="shipping_phone">Phone Number</Label>
              <Input
                id="shipping_phone"
                type="tel"
                value={data.contacts?.shipping_contact?.phone || ''}
                onChange={(e) => handleContactChange('shipping_contact', 'phone', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="shipping_fax">Fax Number</Label>
              <Input
                id="shipping_fax"
                type="tel"
                value={data.contacts?.shipping_contact?.fax || ''}
                onChange={(e) => handleContactChange('shipping_contact', 'fax', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="shipping_email">Email Address</Label>
              <Input
                id="shipping_email"
                type="email"
                value={data.contacts?.shipping_contact?.email || ''}
                onChange={(e) => handleContactChange('shipping_contact', 'email', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
