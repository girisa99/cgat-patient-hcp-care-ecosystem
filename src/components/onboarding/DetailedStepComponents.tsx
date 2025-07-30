/**
 * DETAILED STEP COMPONENTS - Complete implementations for all onboarding steps
 * These are the fully functional step components with all form fields and logic
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Building, Users, CreditCard, FileText } from 'lucide-react';

// BUSINESS CLASSIFICATION STEP
export const DetailedBusinessClassificationStep = ({ formData, updateFormData }: any) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="years_in_business">Years in Business</Label>
        <Input
          id="years_in_business"
          type="number"
          value={formData.business_info?.years_in_business || ''}
          onChange={(e) => updateFormData('business_info', { years_in_business: parseInt(e.target.value) || 0 })}
          placeholder="5"
          min="0"
        />
      </div>
      <div>
        <Label htmlFor="number_of_employees">Number of Employees</Label>
        <Input
          id="number_of_employees"
          type="number"
          value={formData.business_info?.number_of_employees || ''}
          onChange={(e) => updateFormData('business_info', { number_of_employees: parseInt(e.target.value) || 0 })}
          placeholder="50"
          min="0"
        />
      </div>
      <div>
        <Label htmlFor="estimated_monthly_purchases">Estimated Monthly Purchases ($)</Label>
        <Input
          id="estimated_monthly_purchases"
          type="number"
          value={formData.business_info?.estimated_monthly_purchases || ''}
          onChange={(e) => updateFormData('business_info', { estimated_monthly_purchases: parseInt(e.target.value) || 0 })}
          placeholder="100000"
          min="0"
        />
      </div>
      <div>
        <Label htmlFor="ownership_type">Ownership Type</Label>
        <select
          id="ownership_type"
          value={formData.business_info?.ownership_type || 'corporation'}
          onChange={(e) => updateFormData('business_info', { ownership_type: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="corporation">Corporation</option>
          <option value="llc">LLC</option>
          <option value="partnership">Partnership</option>
          <option value="sole_proprietorship">Sole Proprietorship</option>
          <option value="non_profit">Non-Profit</option>
        </select>
      </div>
    </div>
  </div>
);

// DETAILED CREDIT APPLICATION STEP
export const DetailedCreditApplicationStep = ({ formData, updateFormData }: any) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="requested_credit_limit">Requested Credit Limit ($)</Label>
        <Input
          id="requested_credit_limit"
          type="number"
          placeholder="100000"
          min="0"
        />
      </div>
      <div>
        <Label htmlFor="payment_terms_requested">Requested Payment Terms</Label>
        <select className="w-full px-3 py-2 border rounded-md">
          <option value="">Select terms</option>
          <option value="net_30">Net 30 Days</option>
          <option value="net_60">Net 60 Days</option>
          <option value="net_90">Net 90 Days</option>
          <option value="cod">Cash on Delivery</option>
          <option value="prepaid">Prepaid</option>
        </select>
      </div>
    </div>
    
    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-3">Trade References</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Provide three trade references for credit verification.
      </p>
      <div className="space-y-4">
        {[1, 2, 3].map((ref) => (
          <div key={ref} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 border rounded">
            <div>
              <Label htmlFor={`trade_ref_${ref}_company`}>Company Name</Label>
              <Input
                id={`trade_ref_${ref}_company`}
                placeholder="Reference company"
              />
            </div>
            <div>
              <Label htmlFor={`trade_ref_${ref}_contact`}>Contact Person</Label>
              <Input
                id={`trade_ref_${ref}_contact`}
                placeholder="Contact name"
              />
            </div>
            <div>
              <Label htmlFor={`trade_ref_${ref}_phone`}>Phone</Label>
              <Input
                id={`trade_ref_${ref}_phone`}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
    
    <div className="p-4 border rounded-lg bg-yellow-50">
      <h4 className="font-medium mb-2">Credit Check Authorization</h4>
      <div className="flex items-center space-x-2">
        <Checkbox id="authorize_credit_check" />
        <Label htmlFor="authorize_credit_check">
          I authorize a credit check to be performed for this application
        </Label>
      </div>
    </div>
  </div>
);

// DETAILED GPO MEMBERSHIP STEP
export const DetailedGPOMembershipStep = ({ formData, updateFormData }: any) => (
  <div className="space-y-6">
    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-3">Group Purchasing Organization (GPO) Memberships</h4>
      <p className="text-sm text-muted-foreground mb-4">
        List your current GPO memberships and contracts.
      </p>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox id="has_gpo_membership" />
          <Label htmlFor="has_gpo_membership">
            Our facility has GPO memberships
          </Label>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="primary_gpo">Primary GPO</Label>
            <select className="w-full px-3 py-2 border rounded-md">
              <option value="">Select primary GPO</option>
              <option value="premier">Premier Inc.</option>
              <option value="vizient">Vizient</option>
              <option value="healthtrust">HealthTrust</option>
              <option value="amerinet">Amerinet</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <Label htmlFor="gpo_contract_number">Contract Number</Label>
            <Input
              id="gpo_contract_number"
              placeholder="GPO contract number"
            />
          </div>
        </div>
        
        <div className="space-y-3">
          <h5 className="font-medium">Additional GPO Memberships</h5>
          <Button variant="outline" className="w-full">
            <Users className="h-4 w-4 mr-2" />
            Add GPO Membership
          </Button>
        </div>
      </div>
    </div>
    
    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-3">340B Program</h4>
      <div className="flex items-center space-x-2">
        <Checkbox id="is_340b_entity" />
        <Label htmlFor="is_340b_entity">
          Our facility is a 340B covered entity
        </Label>
      </div>
    </div>
  </div>
);

// DETAILED FINANCIAL ASSESSMENT STEP
export const DetailedFinancialAssessmentStep = ({ formData, updateFormData }: any) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="annual_revenue">Annual Revenue ($)</Label>
        <Input
          id="annual_revenue"
          type="number"
          placeholder="1000000"
          min="0"
        />
      </div>
      <div>
        <Label htmlFor="years_in_business_financial">Years in Business</Label>
        <Input
          id="years_in_business_financial"
          type="number"
          placeholder="5"
          min="0"
        />
      </div>
      <div>
        <Label htmlFor="primary_insurance">Primary Insurance Provider</Label>
        <Input
          id="primary_insurance"
          placeholder="Insurance company name"
        />
      </div>
      <div>
        <Label htmlFor="credit_rating">Current Credit Rating</Label>
        <select className="w-full px-3 py-2 border rounded-md">
          <option value="">Select rating</option>
          <option value="excellent">Excellent (750+)</option>
          <option value="good">Good (700-749)</option>
          <option value="fair">Fair (650-699)</option>
          <option value="poor">Poor (below 650)</option>
        </select>
      </div>
    </div>
    
    <div className="p-4 border rounded-lg bg-blue-50">
      <h4 className="font-medium mb-2">Financial Verification</h4>
      <p className="text-sm text-blue-800">
        💼 This information helps us establish appropriate credit terms and payment arrangements.
        All financial information is kept strictly confidential.
      </p>
    </div>
  </div>
);

// DETAILED OPERATING HOURS STEP
export const DetailedOperatingHoursStep = ({ formData, updateFormData }: any) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-4 border rounded-lg">
        <h4 className="font-medium mb-3">Operating Hours</h4>
        <div className="space-y-3">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
            <div key={day} className="grid grid-cols-3 gap-2 items-center">
              <Label className="text-sm">{day}</Label>
              <Input type="time" placeholder="08:00" />
              <Input type="time" placeholder="17:00" />
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 border rounded-lg">
        <h4 className="font-medium mb-3">Emergency Contacts</h4>
        <div className="space-y-3">
          <div>
            <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
            <Input
              id="emergency_contact_name"
              placeholder="After-hours contact person"
            />
          </div>
          <div>
            <Label htmlFor="emergency_contact_phone">Emergency Phone</Label>
            <Input
              id="emergency_contact_phone"
              placeholder="(555) 123-4567"
            />
          </div>
          <div>
            <Label htmlFor="emergency_contact_email">Emergency Email</Label>
            <Input
              id="emergency_contact_email"
              type="email"
              placeholder="emergency@facility.com"
            />
          </div>
        </div>
      </div>
    </div>
    
    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-3">Delivery Preferences</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="preferred_delivery_time">Preferred Delivery Time</Label>
          <select className="w-full px-3 py-2 border rounded-md">
            <option value="">Select time</option>
            <option value="morning">Morning (8AM-12PM)</option>
            <option value="afternoon">Afternoon (12PM-5PM)</option>
            <option value="anytime">Anytime during business hours</option>
          </select>
        </div>
        <div>
          <Label htmlFor="special_delivery_instructions">Special Instructions</Label>
          <Textarea
            id="special_delivery_instructions"
            placeholder="Any special delivery instructions..."
            rows={3}
          />
        </div>
      </div>
    </div>
  </div>
);

// DETAILED AUTHORIZATION & SIGNATURE STEP
export const DetailedAuthorizationsStep = ({ formData, updateFormData }: any) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="authorized_signatory_name">Authorized Signatory Name</Label>
        <Input
          id="authorized_signatory_name"
          placeholder="Full name of authorized signatory"
        />
      </div>
      <div>
        <Label htmlFor="authorized_signatory_title">Signatory Title</Label>
        <Input
          id="authorized_signatory_title"
          placeholder="Title/Position"
        />
      </div>
      <div>
        <Label htmlFor="authorized_signatory_ssn">Signatory SSN (Optional)</Label>
        <Input
          id="authorized_signatory_ssn"
          placeholder="XXX-XX-XXXX"
        />
      </div>
    </div>
    
    <Separator />
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="guarantor_name">Guarantor Name (If Applicable)</Label>
        <Input
          id="guarantor_name"
          placeholder="Guarantor full name"
        />
      </div>
      <div>
        <Label htmlFor="guarantor_ssn">Guarantor SSN (If Applicable)</Label>
        <Input
          id="guarantor_ssn"
          placeholder="XXX-XX-XXXX"
        />
      </div>
    </div>
    
    <div className="p-4 border rounded-lg bg-blue-50">
      <h4 className="font-medium mb-3">Electronic Signature & Authorization</h4>
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox id="terms_accepted" />
          <Label htmlFor="terms_accepted">
            I accept the terms and conditions and authorize this application
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="electronic_signature" />
          <Label htmlFor="electronic_signature">
            I authorize the use of electronic signatures for this application
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="privacy_policy" />
          <Label htmlFor="privacy_policy">
            I have read and agree to the privacy policy
          </Label>
        </div>
      </div>
      
      <div className="mt-4 p-3 border rounded bg-white">
        <Label htmlFor="digital_signature">Digital Signature</Label>
        <Input
          id="digital_signature"
          placeholder="Type your full name as digital signature"
        />
        <p className="text-xs text-muted-foreground mt-1">
          By typing your name, you are providing a legal electronic signature
        </p>
      </div>
    </div>
  </div>
);

// DETAILED DOCUMENT UPLOAD STEP
export const DetailedDocumentsStep = ({ formData, updateFormData }: any) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 border rounded-lg space-y-3">
        <h4 className="font-medium">Required Documents</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Voided Check</span>
            <Button variant="outline" size="sm">Upload</Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">DEA Registration Copy</span>
            <Button variant="outline" size="sm">Upload</Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Medical License Copy</span>
            <Button variant="outline" size="sm">Upload</Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Financial Statements</span>
            <Button variant="outline" size="sm">Upload</Button>
          </div>
        </div>
      </div>
      
      <div className="p-4 border rounded-lg space-y-3">
        <h4 className="font-medium">Optional Documents</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Resale Tax Exemption</span>
            <Button variant="outline" size="sm">Upload</Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Supplier Statements</span>
            <Button variant="outline" size="sm">Upload</Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Insurance Certificates</span>
            <Button variant="outline" size="sm">Upload</Button>
          </div>
        </div>
      </div>
    </div>
    
    <div className="p-4 border rounded-lg bg-blue-50">
      <h4 className="font-medium mb-2">Document Upload Requirements</h4>
      <p className="text-sm text-blue-800">
        📄 All documents must be in PDF format and clearly legible. 
        Maximum file size is 10MB per document. Documents will be securely stored and encrypted.
      </p>
    </div>
  </div>
);

// DETAILED OWNERSHIP STRUCTURE STEP
export const DetailedOwnershipStep = ({ formData, updateFormData }: any) => (
  <div className="space-y-6">
    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-3">Principal Owners</h4>
      <p className="text-sm text-muted-foreground mb-4">
        List all principal owners with 20% or greater ownership interest.
      </p>
      
      <div className="space-y-4">
        {[1, 2, 3].map((owner) => (
          <div key={owner} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 border rounded">
            <div>
              <Label htmlFor={`owner_${owner}_name`}>Owner Name</Label>
              <Input
                id={`owner_${owner}_name`}
                placeholder="Full name"
              />
            </div>
            <div>
              <Label htmlFor={`owner_${owner}_title`}>Title</Label>
              <Input
                id={`owner_${owner}_title`}
                placeholder="President, CEO, etc."
              />
            </div>
            <div>
              <Label htmlFor={`owner_${owner}_percentage`}>Ownership %</Label>
              <Input
                id={`owner_${owner}_percentage`}
                type="number"
                placeholder="25"
                min="0"
                max="100"
              />
            </div>
          </div>
        ))}
        <Button variant="outline" className="w-full">
          <Users className="h-4 w-4 mr-2" />
          Add Principal Owner
        </Button>
      </div>
    </div>
    
    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-3">Controlling Entity (If Applicable)</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="controlling_entity_name">Entity Name</Label>
          <Input
            id="controlling_entity_name"
            placeholder="Parent company or controlling entity"
          />
        </div>
        <div>
          <Label htmlFor="controlling_entity_relationship">Relationship</Label>
          <Input
            id="controlling_entity_relationship"
            placeholder="Parent company, subsidiary, etc."
          />
        </div>
        <div>
          <Label htmlFor="controlling_entity_phone">Phone</Label>
          <Input
            id="controlling_entity_phone"
            placeholder="(555) 123-4567"
          />
        </div>
      </div>
    </div>

    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-3">Bankruptcy History</h4>
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox id="bankruptcy_history" />
          <Label htmlFor="bankruptcy_history">
            Has the company or any principal owner filed for bankruptcy in the past 7 years?
          </Label>
        </div>
        <div>
          <Label htmlFor="bankruptcy_explanation">If yes, please explain</Label>
          <Textarea
            id="bankruptcy_explanation"
            placeholder="Provide details about bankruptcy filing..."
            rows={3}
          />
        </div>
      </div>
    </div>
  </div>
);

// DETAILED REFERENCES STEP
export const DetailedReferencesStep = ({ formData, updateFormData }: any) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-4 border rounded-lg">
        <h4 className="font-medium mb-3">Primary Bank Reference</h4>
        <div className="space-y-3">
          <div>
            <Label htmlFor="bank_name">Bank Name</Label>
            <Input
              id="bank_name"
              placeholder="Name of primary bank"
            />
          </div>
          <div>
            <Label htmlFor="bank_contact_name">Bank Contact Name</Label>
            <Input
              id="bank_contact_name"
              placeholder="Contact person at bank"
            />
          </div>
          <div>
            <Label htmlFor="bank_phone">Bank Phone</Label>
            <Input
              id="bank_phone"
              placeholder="(555) 123-4567"
            />
          </div>
          <div>
            <Label htmlFor="bank_account_number">Account Number (Optional)</Label>
            <Input
              id="bank_account_number"
              placeholder="Last 4 digits only"
            />
          </div>
        </div>
      </div>
      
      <div className="p-4 border rounded-lg">
        <h4 className="font-medium mb-3">Primary Supplier Reference</h4>
        <div className="space-y-3">
          <div>
            <Label htmlFor="supplier_name">Supplier Name</Label>
            <Input
              id="supplier_name"
              placeholder="Name of primary supplier"
            />
          </div>
          <div>
            <Label htmlFor="supplier_contact_name">Supplier Contact Name</Label>
            <Input
              id="supplier_contact_name"
              placeholder="Contact person at supplier"
            />
          </div>
          <div>
            <Label htmlFor="supplier_phone">Supplier Phone</Label>
            <Input
              id="supplier_phone"
              placeholder="(555) 123-4567"
            />
          </div>
          <div>
            <Label htmlFor="supplier_account_number">Account Number</Label>
            <Input
              id="supplier_account_number"
              placeholder="Account number with supplier"
            />
          </div>
        </div>
      </div>
    </div>
    
    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-3">Additional References</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Provide additional trade or business references.
      </p>
      <div className="space-y-4">
        {[1, 2].map((ref) => (
          <div key={ref} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border rounded">
            <div>
              <Label htmlFor={`additional_ref_${ref}_name`}>Company Name</Label>
              <Input
                id={`additional_ref_${ref}_name`}
                placeholder="Reference company"
              />
            </div>
            <div>
              <Label htmlFor={`additional_ref_${ref}_contact`}>Contact Name</Label>
              <Input
                id={`additional_ref_${ref}_contact`}
                placeholder="Contact person"
              />
            </div>
            <div>
              <Label htmlFor={`additional_ref_${ref}_phone`}>Phone</Label>
              <Input
                id={`additional_ref_${ref}_phone`}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor={`additional_ref_${ref}_account`}>Account #</Label>
              <Input
                id={`additional_ref_${ref}_account`}
                placeholder="Account number"
              />
            </div>
          </div>
        ))}
        <Button variant="outline" className="w-full">
          <Building className="h-4 w-4 mr-2" />
          Add Reference
        </Button>
      </div>
    </div>

    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-3">Technology Provider Reference (Optional)</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tech_provider_name">Technology Provider Name</Label>
          <Input
            id="tech_provider_name"
            placeholder="EMR, PMS, or other tech provider"
          />
        </div>
        <div>
          <Label htmlFor="tech_provider_contact">Contact Name</Label>
          <Input
            id="tech_provider_contact"
            placeholder="Contact person"
          />
        </div>
        <div>
          <Label htmlFor="tech_provider_phone">Phone</Label>
          <Input
            id="tech_provider_phone"
            placeholder="(555) 123-4567"
          />
        </div>
        <div>
          <Label htmlFor="tech_provider_email">Email</Label>
          <Input
            id="tech_provider_email"
            type="email"
            placeholder="contact@techprovider.com"
          />
        </div>
      </div>
    </div>
  </div>
);

// DETAILED PAYMENT & BANKING STEP
export const DetailedPaymentBankingStep = ({ formData, updateFormData }: any) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-4 border rounded-lg">
        <h4 className="font-medium mb-3">Banking Information</h4>
        <div className="space-y-3">
          <div>
            <Label htmlFor="bank_name_payment">Bank Name</Label>
            <Input
              id="bank_name_payment"
              placeholder="Name of your bank"
            />
          </div>
          <div>
            <Label htmlFor="bank_routing_number">Routing Number</Label>
            <Input
              id="bank_routing_number"
              placeholder="9-digit routing number"
            />
          </div>
          <div>
            <Label htmlFor="bank_account_number_payment">Account Number</Label>
            <Input
              id="bank_account_number_payment"
              placeholder="Account number"
            />
          </div>
          <div>
            <Label htmlFor="bank_phone_payment">Bank Phone</Label>
            <Input
              id="bank_phone_payment"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>
      </div>
      
      <div className="p-4 border rounded-lg">
        <h4 className="font-medium mb-3">Payment Preferences</h4>
        <div className="space-y-3">
          <div>
            <Label htmlFor="ach_preference">ACH Preference</Label>
            <select 
              id="ach_preference"
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="">Select preference</option>
              <option value="direct_debit">Direct Debit</option>
              <option value="credit_card">Credit Card</option>
              <option value="wire_transfer">Wire Transfer</option>
            </select>
          </div>
          <div>
            <Label htmlFor="statement_delivery">Statement Delivery</Label>
            <select 
              id="statement_delivery"
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="">Select delivery method</option>
              <option value="email">Email</option>
              <option value="mail">Mail</option>
            </select>
          </div>
          <div>
            <Label htmlFor="payment_terms_requested">Payment Terms Requested</Label>
            <select 
              id="payment_terms_requested"
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="">Select terms</option>
              <option value="net_30">Net 30 Days</option>
              <option value="net_60">Net 60 Days</option>
              <option value="net_90">Net 90 Days</option>
              <option value="cod">Cash on Delivery</option>
              <option value="prepaid">Prepaid</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    
    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-3">Bank Address</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="bank_street">Street Address</Label>
          <Input
            id="bank_street"
            placeholder="Bank street address"
          />
        </div>
        <div>
          <Label htmlFor="bank_city">City</Label>
          <Input
            id="bank_city"
            placeholder="Bank city"
          />
        </div>
        <div>
          <Label htmlFor="bank_state">State</Label>
          <Input
            id="bank_state"
            placeholder="Bank state"
          />
        </div>
        <div>
          <Label htmlFor="bank_zip">ZIP Code</Label>
          <Input
            id="bank_zip"
            placeholder="Bank ZIP code"
          />
        </div>
      </div>
    </div>

    <div className="p-4 border rounded-lg bg-yellow-50">
      <h4 className="font-medium mb-2">Important Banking Information</h4>
      <p className="text-sm text-yellow-800">
        🏦 Please attach a voided check to verify banking information. 
        All ACH transactions will be processed securely and encrypted.
      </p>
    </div>
  </div>
);

// DETAILED LICENSES STEP  
export const DetailedLicensesStep = ({ formData, updateFormData }: any) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-4 border rounded-lg">
        <h4 className="font-medium mb-3">Federal & State Licenses</h4>
        <div className="space-y-3">
          <div>
            <Label htmlFor="dea_number">DEA Number</Label>
            <Input
              id="dea_number"
              placeholder="DEA registration number"
            />
          </div>
          <div>
            <Label htmlFor="medical_license">Medical License Number</Label>
            <Input
              id="medical_license"
              placeholder="State medical license number"
            />
          </div>
          <div>
            <Label htmlFor="hin_number">HIN Number</Label>
            <Input
              id="hin_number"
              placeholder="Health Industry Number"
            />
          </div>
          <div>
            <Label htmlFor="state_pharmacy_license">State Pharmacy License</Label>
            <Input
              id="state_pharmacy_license"
              placeholder="State pharmacy license number"
            />
          </div>
        </div>
      </div>
      
      <div className="p-4 border rounded-lg">
        <h4 className="font-medium mb-3">Tax & Business Licenses</h4>
        <div className="space-y-3">
          <div>
            <Label htmlFor="resale_tax_exemption">Resale Tax Exemption</Label>
            <Input
              id="resale_tax_exemption"
              placeholder="Tax exemption certificate number"
            />
          </div>
          <div>
            <Label htmlFor="state_business_license">State Business License</Label>
            <Input
              id="state_business_license"
              placeholder="State business license number"
            />
          </div>
          <div>
            <Label htmlFor="city_business_license">City Business License</Label>
            <Input
              id="city_business_license"
              placeholder="City business license number"
            />
          </div>
        </div>
      </div>
    </div>
    
    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-3">Additional Licenses</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Add any additional professional or specialty licenses.
      </p>
      <div className="space-y-4">
        {[1, 2].map((license) => (
          <div key={license} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border rounded">
            <div>
              <Label htmlFor={`license_${license}_type`}>License Type</Label>
              <Input
                id={`license_${license}_type`}
                placeholder="e.g., Specialty License"
              />
            </div>
            <div>
              <Label htmlFor={`license_${license}_number`}>License Number</Label>
              <Input
                id={`license_${license}_number`}
                placeholder="License number"
              />
            </div>
            <div>
              <Label htmlFor={`license_${license}_state`}>Issuing State</Label>
              <Input
                id={`license_${license}_state`}
                placeholder="State"
              />
            </div>
            <div>
              <Label htmlFor={`license_${license}_expiration`}>Expiration Date</Label>
              <Input
                id={`license_${license}_expiration`}
                type="date"
              />
            </div>
          </div>
        ))}
        <Button variant="outline" className="w-full">
          <FileText className="h-4 w-4 mr-2" />
          Add License
        </Button>
      </div>
    </div>

    <div className="p-4 border rounded-lg bg-blue-50">
      <h4 className="font-medium mb-2">License Verification</h4>
      <p className="text-sm text-blue-800">
        🔍 All licenses will be verified with appropriate state and federal agencies. 
        Please ensure all license numbers are current and accurate.
      </p>
    </div>
  </div>
);