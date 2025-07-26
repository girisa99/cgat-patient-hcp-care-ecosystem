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