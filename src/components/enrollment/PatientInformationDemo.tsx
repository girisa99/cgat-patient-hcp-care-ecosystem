/**
 * PATIENT INFORMATION DEMO
 * Live demonstration of what fields are captured in Patient Information section
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Phone, 
  MapPin, 
  Mail, 
  Eye, 
  Database,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { PatientInformationFieldComparison } from './PatientInformationFieldComparison';

const PATIENT_INFO_FIELDS = [
  // Personal Demographics
  { category: 'Personal', field: 'First Name*', type: 'text', required: true, icon: User, database: 'profiles.first_name' },
  { category: 'Personal', field: 'Last Name*', type: 'text', required: true, icon: User, database: 'profiles.last_name' },
  { category: 'Personal', field: 'Middle Name', type: 'text', required: false, icon: User, database: 'profiles.middle_name' },
  { category: 'Personal', field: 'Date of Birth*', type: 'date', required: true, icon: User, database: 'profiles.date_of_birth' },
  { category: 'Personal', field: 'Preferred Language*', type: 'select', required: true, icon: User, database: 'profiles.preferred_language' },
  { category: 'Personal', field: 'Gender*', type: 'select', required: true, icon: User, database: 'profiles.gender' },
  { category: 'Personal', field: 'SSN', type: 'text', required: false, icon: User, database: 'profiles.ssn' },

  // Contact Information
  { category: 'Contact', field: 'Email Address*', type: 'email', required: true, icon: Mail, database: 'profiles.email' },
  { category: 'Contact', field: 'Cell Phone*', type: 'phone', required: true, icon: Phone, database: 'profiles.cell_phone' },
  { category: 'Contact', field: 'Home Phone', type: 'phone', required: false, icon: Phone, database: 'profiles.home_phone' },
  { category: 'Contact', field: 'Alternate Phone', type: 'phone', required: false, icon: Phone, database: 'profiles.alternate_phone' },

  // Address Information
  { category: 'Address', field: 'Street Address*', type: 'text', required: true, icon: MapPin, database: 'profiles.address_street' },
  { category: 'Address', field: 'Apartment/Unit', type: 'text', required: false, icon: MapPin, database: 'profiles.address_unit' },
  { category: 'Address', field: 'City*', type: 'text', required: true, icon: MapPin, database: 'profiles.address_city' },
  { category: 'Address', field: 'State*', type: 'text', required: true, icon: MapPin, database: 'profiles.address_state' },
  { category: 'Address', field: 'ZIP Code*', type: 'text', required: true, icon: MapPin, database: 'profiles.address_zip' },

  // Emergency Contact
  { category: 'Emergency', field: 'Alternate Contact Name', type: 'text', required: false, icon: User, database: 'profiles.alternate_contact_name' },
  { category: 'Emergency', field: 'Contact Relationship', type: 'text', required: false, icon: User, database: 'profiles.alternate_contact_relationship' },
  { category: 'Emergency', field: 'Do Not Contact Patient', type: 'checkbox', required: false, icon: Phone, database: 'profiles.do_not_contact_patient' }
];

export const PatientInformationDemo: React.FC = () => {
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const requiredFields = PATIENT_INFO_FIELDS.filter(f => f.required);
  const optionalFields = PATIENT_INFO_FIELDS.filter(f => !f.required);
  const categories = [...new Set(PATIENT_INFO_FIELDS.map(f => f.category))];

  const getCategoryCount = (category: string) => {
    return PATIENT_INFO_FIELDS.filter(f => f.category === category).length;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Personal': return User;
      case 'Contact': return Phone;
      case 'Address': return MapPin;
      case 'Emergency': return AlertCircle;
      default: return User;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            Patient Information Section - Field Capture
          </CardTitle>
          <p className="text-muted-foreground">
            Complete view of all fields captured in the Patient Information section from Online Form → MCP Agent → Database
          </p>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>{requiredFields.length} Required Fields</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <span>{optionalFields.length} Optional Fields</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-600" />
              <span>Destination: profiles table</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Field Overview</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="mapping">Complete Mapping</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map(category => {
              const Icon = getCategoryIcon(category);
              const count = getCategoryCount(category);
              return (
                <Card key={category} className="text-center">
                  <CardContent className="p-4">
                    <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold">{category}</h3>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground">fields</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Field Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PATIENT_INFO_FIELDS.map((field, index) => {
              const Icon = field.icon;
              return (
                <Card 
                  key={index} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedField === field.field ? 'ring-2 ring-primary' : ''
                  } ${field.required ? 'border-green-200' : 'border-blue-200'}`}
                  onClick={() => setSelectedField(selectedField === field.field ? null : field.field)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 mt-0.5 ${field.required ? 'text-green-600' : 'text-blue-600'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">{field.field}</h4>
                          {field.required && (
                            <Badge className="bg-green-100 text-green-800 text-xs">Required</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{field.category} • {field.type}</p>
                        
                        {selectedField === field.field && (
                          <div className="space-y-2 pt-2 border-t">
                            <div className="flex items-center gap-2 text-xs">
                              <Database className="h-3 w-3" />
                              <ArrowRight className="h-3 w-3" />
                              <code className="bg-muted px-1 rounded text-xs">{field.database}</code>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Data flows: Online Form → MCP Agent → Database
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          {categories.map(category => {
            const Icon = getCategoryIcon(category);
            const categoryFields = PATIENT_INFO_FIELDS.filter(f => f.category === category);
            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {category} Information ({categoryFields.length} fields)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categoryFields.map((field, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                        <field.icon className={`h-4 w-4 ${field.required ? 'text-green-600' : 'text-blue-600'}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{field.field}</span>
                            {field.required && <Badge className="bg-green-100 text-green-800 text-xs">Required</Badge>}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {field.type} → {field.database}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="mapping">
          <PatientInformationFieldComparison />
        </TabsContent>
      </Tabs>

      {/* Flow Diagram */}
      <Card>
        <CardHeader>
          <CardTitle>Data Flow Process</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-4 p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold">Online Form</h3>
              <p className="text-xs text-muted-foreground">User fills form</p>
            </div>
            
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
            
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <User className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold">MCP Agent</h3>
              <p className="text-xs text-muted-foreground">Conversational collection</p>
            </div>
            
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
            
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                <Database className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold">Database</h3>
              <p className="text-xs text-muted-foreground">Structured storage</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};