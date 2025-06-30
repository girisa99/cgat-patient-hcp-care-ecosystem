
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { TreatmentCenterOnboarding } from '@/types/onboarding';
import { Separator } from '@/components/ui/separator';
import { Plus, X } from 'lucide-react';

interface ContactsStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onDataChange: (data: Partial<TreatmentCenterOnboarding>) => void;
}

export const ContactsStep: React.FC<ContactsStepProps> = ({ data, onDataChange }) => {
  const contacts = data.contacts || {
    primary_contact: { name: '', phone: '', email: '' }
  };

  const updateContact = (contactType: keyof typeof contacts, field: string, value: string) => {
    const updatedContacts = {
      ...contacts,
      [contactType]: {
        ...contacts[contactType],
        [field]: value
      }
    };

    onDataChange({
      ...data,
      contacts: updatedContacts
    });
  };

  const addOptionalContact = (contactType: 'accounts_payable_contact' | 'shipping_contact' | 'alternate_contact') => {
    const updatedContacts = {
      ...contacts,
      [contactType]: { name: '', phone: '', email: '', title: '' }
    };

    onDataChange({
      ...data,
      contacts: updatedContacts
    });
  };

  const removeOptionalContact = (contactType: 'accounts_payable_contact' | 'shipping_contact' | 'alternate_contact') => {
    const updatedContacts = { ...contacts };
    delete updatedContacts[contactType];

    onDataChange({
      ...data,
      contacts: updatedContacts
    });
  };

  return (
    <div className="space-y-6">
      {/* Primary Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Primary Contact *</CardTitle>
          <CardDescription>
            Main point of contact for your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primary-name">Full Name *</Label>
              <Input
                id="primary-name"
                value={contacts.primary_contact?.name || ''}
                onChange={(e) => updateContact('primary_contact', 'name', e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>
            <div>
              <Label htmlFor="primary-title">Title</Label>
              <Input
                id="primary-title"
                value={contacts.primary_contact?.title || ''}
                onChange={(e) => updateContact('primary_contact', 'title', e.target.value)}
                placeholder="e.g., CEO, Administrator"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primary-phone">Phone Number *</Label>
              <Input
                id="primary-phone"
                type="tel"
                value={contacts.primary_contact?.phone || ''}
                onChange={(e) => updateContact('primary_contact', 'phone', e.target.value)}
                placeholder="(555) 123-4567"
                required
              />
            </div>
            <div>
              <Label htmlFor="primary-email">Email Address *</Label>
              <Input
                id="primary-email"
                type="email"
                value={contacts.primary_contact?.email || ''}
                onChange={(e) => updateContact('primary_contact', 'email', e.target.value)}
                placeholder="contact@company.com"
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="primary-fax">Fax Number</Label>
            <Input
              id="primary-fax"
              type="tel"
              value={contacts.primary_contact?.fax || ''}
              onChange={(e) => updateContact('primary_contact', 'fax', e.target.value)}
              placeholder="(555) 123-4568"
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Optional Contacts */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Additional Contacts (Optional)</h3>
        
        {/* Accounts Payable Contact */}
        {!contacts.accounts_payable_contact ? (
          <Card className="border-dashed">
            <CardContent className="pt-6 text-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => addOptionalContact('accounts_payable_contact')}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Accounts Payable Contact</span>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">Accounts Payable Contact</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeOptionalContact('accounts_payable_contact')}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={contacts.accounts_payable_contact?.name || ''}
                    onChange={(e) => updateContact('accounts_payable_contact', 'name', e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={contacts.accounts_payable_contact?.title || ''}
                    onChange={(e) => updateContact('accounts_payable_contact', 'title', e.target.value)}
                    placeholder="e.g., Accounts Payable Manager"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    value={contacts.accounts_payable_contact?.phone || ''}
                    onChange={(e) => updateContact('accounts_payable_contact', 'phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={contacts.accounts_payable_contact?.email || ''}
                    onChange={(e) => updateContact('accounts_payable_contact', 'email', e.target.value)}
                    placeholder="ap@company.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Shipping Contact */}
        {!contacts.shipping_contact ? (
          <Card className="border-dashed">
            <CardContent className="pt-6 text-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => addOptionalContact('shipping_contact')}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Shipping/Receiving Contact</span>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">Shipping/Receiving Contact</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeOptionalContact('shipping_contact')}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={contacts.shipping_contact?.name || ''}
                    onChange={(e) => updateContact('shipping_contact', 'name', e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={contacts.shipping_contact?.title || ''}
                    onChange={(e) => updateContact('shipping_contact', 'title', e.target.value)}
                    placeholder="e.g., Receiving Manager"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    value={contacts.shipping_contact?.phone || ''}
                    onChange={(e) => updateContact('shipping_contact', 'phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={contacts.shipping_contact?.email || ''}
                    onChange={(e) => updateContact('shipping_contact', 'email', e.target.value)}
                    placeholder="shipping@company.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alternate Contact */}
        {!contacts.alternate_contact ? (
          <Card className="border-dashed">
            <CardContent className="pt-6 text-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => addOptionalContact('alternate_contact')}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Alternate Contact</span>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">Alternate Contact</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeOptionalContact('alternate_contact')}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={contacts.alternate_contact?.name || ''}
                    onChange={(e) => updateContact('alternate_contact', 'name', e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={contacts.alternate_contact?.title || ''}
                    onChange={(e) => updateContact('alternate_contact', 'title', e.target.value)}
                    placeholder="Enter title"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    value={contacts.alternate_contact?.phone || ''}
                    onChange={(e) => updateContact('alternate_contact', 'phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={contacts.alternate_contact?.email || ''}
                    onChange={(e) => updateContact('alternate_contact', 'email', e.target.value)}
                    placeholder="contact@company.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
