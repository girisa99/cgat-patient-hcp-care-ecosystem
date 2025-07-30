/**
 * ADDITIONAL STEP COMPONENTS - Service selection, therapy selection, and other specialized steps
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Building, Users, CreditCard, FileText, Clock, Stethoscope, Settings, Globe, Package } from 'lucide-react';

// THERAPY SELECTION STEP
export const DetailedTherapySelectionStep = ({ formData, updateFormData }: any) => (
  <div className="space-y-6">
    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-3">Therapeutic Areas of Focus</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Select the therapeutic areas that are relevant to your facility.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          'Oncology', 'Cardiology', 'Neurology', 'Orthopedics', 'Gastroenterology',
          'Endocrinology', 'Nephrology', 'Pulmonology', 'Rheumatology', 'Dermatology',
          'Infectious Disease', 'Pain Management', 'Mental Health', 'Pediatrics', 'Geriatrics'
        ].map((therapy) => (
          <div key={therapy} className="flex items-center space-x-2 p-2 border rounded">
            <Checkbox id={`therapy_${therapy.toLowerCase().replace(' ', '_')}`} />
            <Label htmlFor={`therapy_${therapy.toLowerCase().replace(' ', '_')}`} className="text-sm">
              {therapy}
            </Label>
          </div>
        ))}
      </div>
    </div>
    
    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-3">Special Programs</h4>
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox id="clinical_trials" />
          <Label htmlFor="clinical_trials">Clinical Trials</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="research_programs" />
          <Label htmlFor="research_programs">Research Programs</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="teaching_hospital" />
          <Label htmlFor="teaching_hospital">Teaching Hospital</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="specialty_pharmacy" />
          <Label htmlFor="specialty_pharmacy">Specialty Pharmacy</Label>
        </div>
      </div>
    </div>

    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-3">Additional Therapeutic Notes</h4>
      <Textarea
        placeholder="Describe any specific therapeutic focus areas or special considerations..."
        rows={4}
      />
    </div>
  </div>
);

// SERVICE SELECTION STEP
export const DetailedServiceSelectionStep = ({ formData, updateFormData }: any) => (
  <div className="space-y-6">
    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-3">Distribution Services</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          'Pharmaceuticals', 'Medical Supplies', 'Surgical Instruments', 'Laboratory Supplies',
          'Radiology Supplies', 'Nutritional Products', 'Respiratory Care', 'Home Health Equipment'
        ].map((service) => (
          <div key={service} className="flex items-center space-x-2 p-2 border rounded">
            <Checkbox id={`service_${service.toLowerCase().replace(' ', '_')}`} />
            <Label htmlFor={`service_${service.toLowerCase().replace(' ', '_')}`} className="text-sm">
              {service}
            </Label>
          </div>
        ))}
      </div>
    </div>
    
    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-3">Value-Added Services</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          'Just-in-Time Delivery', 'Inventory Management', 'Clinical Consulting', 'Staff Training',
          'Regulatory Compliance Support', 'Data Analytics', 'Cost Containment Programs', 'Emergency Supply'
        ].map((service) => (
          <div key={service} className="flex items-center space-x-2 p-2 border rounded">
            <Checkbox id={`value_service_${service.toLowerCase().replace(/[^a-z]/g, '_')}`} />
            <Label htmlFor={`value_service_${service.toLowerCase().replace(/[^a-z]/g, '_')}`} className="text-sm">
              {service}
            </Label>
          </div>
        ))}
      </div>
    </div>

    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-3">Service Priorities</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="primary_service_need">Primary Service Need</Label>
          <select className="w-full px-3 py-2 border rounded-md bg-background">
            <option value="">Select primary need</option>
            <option value="cost_reduction">Cost Reduction</option>
            <option value="inventory_optimization">Inventory Optimization</option>
            <option value="clinical_support">Clinical Support</option>
            <option value="technology_integration">Technology Integration</option>
          </select>
        </div>
        <div>
          <Label htmlFor="service_timeline">Implementation Timeline</Label>
          <select className="w-full px-3 py-2 border rounded-md bg-background">
            <option value="">Select timeline</option>
            <option value="immediate">Immediate (within 30 days)</option>
            <option value="short_term">Short-term (1-3 months)</option>
            <option value="medium_term">Medium-term (3-6 months)</option>
            <option value="long_term">Long-term (6+ months)</option>
          </select>
        </div>
      </div>
    </div>
  </div>
);

// ONLINE SERVICES STEP
export const DetailedOnlineServicesStep = ({ formData, updateFormData }: any) => (
  <div className="space-y-6">
    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-3">Online Platform Services</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Select the online services you would like to access.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          'Online Ordering', 'Invoice Management', 'Account Analytics', 'Inventory Tracking',
          'Contract Management', 'Product Catalog', 'Price Lists', 'Order History',
          'Statement Downloads', 'Credit Application Status', 'Return Processing', 'Support Portal'
        ].map((service) => (
          <div key={service} className="flex items-center space-x-2 p-2 border rounded">
            <Checkbox id={`online_${service.toLowerCase().replace(/[^a-z]/g, '_')}`} />
            <Label htmlFor={`online_${service.toLowerCase().replace(/[^a-z]/g, '_')}`} className="text-sm">
              {service}
            </Label>
          </div>
        ))}
      </div>
    </div>

    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-3">Platform Users</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Add users who will need access to the online platform.
      </p>
      
      <div className="space-y-4">
        {[1, 2, 3].map((user) => (
          <div key={user} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border rounded">
            <div>
              <Label htmlFor={`user_${user}_name`}>Name</Label>
              <Input
                id={`user_${user}_name`}
                placeholder="User full name"
              />
            </div>
            <div>
              <Label htmlFor={`user_${user}_email`}>Email</Label>
              <Input
                id={`user_${user}_email`}
                type="email"
                placeholder="user@facility.com"
              />
            </div>
            <div>
              <Label htmlFor={`user_${user}_role`}>Role</Label>
              <select 
                id={`user_${user}_role`}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">Select role</option>
                <option value="administrator">Administrator</option>
                <option value="purchasing">Purchasing Manager</option>
                <option value="finance">Finance/Billing</option>
                <option value="clinical">Clinical Staff</option>
                <option value="viewer">View Only</option>
              </select>
            </div>
            <div>
              <Label htmlFor={`user_${user}_department`}>Department</Label>
              <Input
                id={`user_${user}_department`}
                placeholder="Department"
              />
            </div>
          </div>
        ))}
        <Button variant="outline" className="w-full">
          <Users className="h-4 w-4 mr-2" />
          Add Platform User
        </Button>
      </div>
    </div>

    <div className="p-4 border rounded-lg bg-green-50">
      <h4 className="font-medium mb-2">Platform Access Benefits</h4>
      <p className="text-sm text-green-800">
        🌐 Online platform access provides 24/7 ordering, real-time inventory tracking, 
        detailed analytics, and streamlined account management.
      </p>
    </div>
  </div>
);

// PURCHASING PREFERENCES STEP
export const DetailedPurchasingPreferencesStep = ({ formData, updateFormData }: any) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-4 border rounded-lg">
        <h4 className="font-medium mb-3">Preferred Purchasing Methods</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="just_in_time" />
            <Label htmlFor="just_in_time">Just-in-Time Delivery</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="bulk_ordering" />
            <Label htmlFor="bulk_ordering">Bulk Ordering</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="consignment" />
            <Label htmlFor="consignment">Consignment</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="drop_ship" />
            <Label htmlFor="drop_ship">Drop Ship</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="blanket_orders" />
            <Label htmlFor="blanket_orders">Blanket Orders</Label>
          </div>
        </div>
      </div>
      
      <div className="p-4 border rounded-lg">
        <h4 className="font-medium mb-3">Inventory Management</h4>
        <div className="space-y-3">
          <div>
            <Label htmlFor="inventory_model">Preferred Inventory Model</Label>
            <select 
              id="inventory_model"
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="">Select model</option>
              <option value="traditional_wholesale">Traditional Wholesale</option>
              <option value="consignment">Consignment</option>
              <option value="vendor_managed">Vendor Managed</option>
              <option value="drop_ship_only">Drop Ship Only</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="automated_reordering" />
            <Label htmlFor="automated_reordering">Enable Automated Reordering</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="temperature_controlled" />
            <Label htmlFor="temperature_controlled">Temperature Controlled Storage</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="hazmat_storage" />
            <Label htmlFor="hazmat_storage">Hazmat Storage Capabilities</Label>
          </div>
        </div>
      </div>
    </div>
    
    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-3">Order Frequency & Volume</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="preferred_order_frequency">Preferred Order Frequency</Label>
          <select 
            id="preferred_order_frequency"
            className="w-full px-3 py-2 border rounded-md bg-background"
          >
            <option value="">Select frequency</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="bi_weekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
            <option value="as_needed">As Needed</option>
          </select>
        </div>
        <div>
          <Label htmlFor="storage_capacity">Storage Capacity (sq ft)</Label>
          <Input
            id="storage_capacity"
            type="number"
            placeholder="5000"
            min="0"
          />
        </div>
        <div>
          <Label htmlFor="delivery_dock_access">Delivery Dock Access</Label>
          <select 
            id="delivery_dock_access"
            className="w-full px-3 py-2 border rounded-md bg-background"
          >
            <option value="">Select access type</option>
            <option value="full_dock">Full Loading Dock</option>
            <option value="ground_level">Ground Level</option>
            <option value="stairs_required">Stairs Required</option>
            <option value="elevator_required">Elevator Required</option>
          </select>
        </div>
      </div>
    </div>

    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-3">Special Requirements</h4>
      <Textarea
        placeholder="Describe any special purchasing requirements, delivery restrictions, or handling needs..."
        rows={3}
      />
    </div>
  </div>
);

// TECHNOLOGY INTEGRATION STEP
export const DetailedTechnologyIntegrationStep = ({ formData, updateFormData }: any) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-4 border rounded-lg">
        <h4 className="font-medium mb-3">Current Systems</h4>
        <div className="space-y-3">
          <div>
            <Label htmlFor="emr_system">EMR System</Label>
            <Input
              id="emr_system"
              placeholder="e.g., Epic, Cerner, Allscripts"
            />
          </div>
          <div>
            <Label htmlFor="inventory_system">Inventory Management System</Label>
            <Input
              id="inventory_system"
              placeholder="e.g., RFID, Barcode scanning"
            />
          </div>
          <div>
            <Label htmlFor="erp_system">ERP System</Label>
            <Input
              id="erp_system"
              placeholder="e.g., SAP, Oracle, Microsoft"
            />
          </div>
          <div>
            <Label htmlFor="pharmacy_system">Pharmacy System</Label>
            <Input
              id="pharmacy_system"
              placeholder="e.g., Pyxis, Omnicell"
            />
          </div>
        </div>
      </div>
      
      <div className="p-4 border rounded-lg">
        <h4 className="font-medium mb-3">Integration Requirements</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="api_integration" />
            <Label htmlFor="api_integration">API Integration Required</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="edi_integration" />
            <Label htmlFor="edi_integration">EDI Integration</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="real_time_sync" />
            <Label htmlFor="real_time_sync">Real-time Data Synchronization</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="single_sign_on" />
            <Label htmlFor="single_sign_on">Single Sign-On (SSO)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="automated_ordering" />
            <Label htmlFor="automated_ordering">Automated Ordering</Label>
          </div>
        </div>
      </div>
    </div>
    
    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-3">Technical Contact</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="tech_contact_name">Technical Contact Name</Label>
          <Input
            id="tech_contact_name"
            placeholder="IT Manager or Technical Lead"
          />
        </div>
        <div>
          <Label htmlFor="tech_contact_email">Email</Label>
          <Input
            id="tech_contact_email"
            type="email"
            placeholder="tech@facility.com"
          />
        </div>
        <div>
          <Label htmlFor="tech_contact_phone">Phone</Label>
          <Input
            id="tech_contact_phone"
            placeholder="(555) 123-4567"
          />
        </div>
      </div>
    </div>

    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-3">Integration Timeline & Priority</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="integration_timeline">Implementation Timeline</Label>
          <select 
            id="integration_timeline"
            className="w-full px-3 py-2 border rounded-md bg-background"
          >
            <option value="">Select timeline</option>
            <option value="immediate">Immediate (within 30 days)</option>
            <option value="short_term">Short-term (1-3 months)</option>
            <option value="medium_term">Medium-term (3-6 months)</option>
            <option value="long_term">Long-term (6+ months)</option>
          </select>
        </div>
        <div>
          <Label htmlFor="integration_priority">Integration Priority</Label>
          <select 
            id="integration_priority"
            className="w-full px-3 py-2 border rounded-md bg-background"
          >
            <option value="">Select priority</option>
            <option value="high">High - Critical for operations</option>
            <option value="medium">Medium - Important but not critical</option>
            <option value="low">Low - Nice to have</option>
          </select>
        </div>
      </div>
    </div>

    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-3">Additional Integration Notes</h4>
      <Textarea
        placeholder="Describe any specific integration requirements, security considerations, or technical constraints..."
        rows={4}
      />
    </div>
  </div>
);