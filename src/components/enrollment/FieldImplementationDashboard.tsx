/**
 * FIELD IMPLEMENTATION DASHBOARD
 * Complete visualization of field implementation status with actionable insights
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  User, 
  Building2, 
  CreditCard, 
  Stethoscope, 
  Send,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Settings,
  Target,
  TrendingUp
} from 'lucide-react';
import { 
  VERIFIED_FIELD_COUNTS, 
  FIELD_MAPPING_ISSUES,
  MISSING_FIELDS,
  COMPLETE_FIELD_REGISTRY,
  getFieldImplementationStatus 
} from '@/utils/comprehensiveFieldVerification';

export const FieldImplementationDashboard = () => {
  const [selectedSection, setSelectedSection] = useState('overview');
  const status = getFieldImplementationStatus();

  const sectionIcons = {
    consent: Shield,
    patient_information: User,
    provider_treatment: Building2,
    insurance: CreditCard,
    clinical_treatment: Stethoscope,
    submit: Send
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fields</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.summary.totalFields}</div>
            <p className="text-xs text-muted-foreground">Across all sections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Implemented</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.summary.implementedFields}</div>
            <p className="text-xs text-muted-foreground">
              {status.summary.completionPercentage.toFixed(1)}% complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missing</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.summary.missingFields}</div>
            <p className="text-xs text-muted-foreground">Need implementation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <Target className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {status.issues.filter(i => i.severity === 'critical' || i.severity === 'high').length}
            </div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedSection} onValueChange={setSelectedSection} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sections">By Section</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="missing">Missing Fields</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Implementation Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{status.summary.completionPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={status.summary.completionPercentage} className="h-2" />
              </div>

              {Object.entries(status.summary.sectionsStatus).map(([section, data]) => {
                const Icon = sectionIcons[section as keyof typeof sectionIcons];
                return (
                  <div key={section} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="capitalize">{section.replace('_', ' ')}</span>
                      </div>
                      <span>{data.percentage.toFixed(0)}% ({data.implemented}/{data.total})</span>
                    </div>
                    <Progress value={data.percentage} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections" className="space-y-4">
          <div className="grid gap-4">
            {Object.entries(VERIFIED_FIELD_COUNTS).map(([section, data]) => {
              const Icon = sectionIcons[section as keyof typeof sectionIcons];
              const completionRate = (data.implemented / data.total) * 100;
              
              return (
                <Card key={section}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <span className="capitalize">{section.replace('_', ' ')}</span>
                      <Badge variant={completionRate > 80 ? "default" : completionRate > 50 ? "secondary" : "destructive"}>
                        {completionRate.toFixed(0)}%
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Total Fields</p>
                        <p className="text-2xl font-bold">{data.total}</p>
                      </div>
                      <div>
                        <p className="font-medium">Required</p>
                        <p className="text-2xl font-bold text-orange-600">{data.required}</p>
                      </div>
                      <div>
                        <p className="font-medium">Implemented</p>
                        <p className="text-2xl font-bold text-green-600">{data.implemented}</p>
                      </div>
                      <div>
                        <p className="font-medium">Missing</p>
                        <p className="text-2xl font-bold text-red-600">{data.missing}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Sections:</p>
                      <div className="flex flex-wrap gap-2">
                        {data.sections.map(subsection => (
                          <Badge key={subsection} variant="outline">
                            {subsection.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Progress value={completionRate} className="h-2" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          {status.issues.map((issue, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="capitalize">{issue.section.replace('_', ' ')}</span>
                  <Badge className={getSeverityColor(issue.severity)}>
                    {issue.severity}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium text-sm mb-1">Issue:</p>
                  <p className="text-sm text-gray-600">{issue.issue}</p>
                </div>
                
                <div>
                  <p className="font-medium text-sm mb-1">Recommended Fix:</p>
                  <p className="text-sm text-gray-600">{issue.fix}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{issue.errorCode}</Badge>
                  <Button size="sm" variant="outline">
                    Implement Fix
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="missing" className="space-y-4">
          {Object.entries(MISSING_FIELDS).map(([section, fields]) => (
            <Card key={section}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span className="capitalize">{section.replace('_', ' ')}</span>
                  <Badge variant="secondary">{fields.length} missing</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {fields.slice(0, 12).map((field, index) => (
                    <div key={index} className="text-sm p-2 bg-gray-50 rounded border">
                      {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  ))}
                  {fields.length > 12 && (
                    <div className="text-sm p-2 bg-blue-50 rounded border text-blue-600 font-medium">
                      +{fields.length - 12} more fields...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};