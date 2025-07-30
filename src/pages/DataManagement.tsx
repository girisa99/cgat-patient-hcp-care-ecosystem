/**
 * DATA MANAGEMENT PAGE - Centralized data generation and management
 * Leverages MCP and LLM capabilities to populate therapy, service, and product data
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  Sparkles, 
  FileText, 
  Users, 
  Building,
  Stethoscope
} from 'lucide-react';
import { TherapyDataGenerator } from '@/components/data-generation/TherapyDataGenerator';

export default function DataManagement() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <Database className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Data Management</h1>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            MCP + LLM Powered
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Generate and manage comprehensive healthcare data using advanced AI capabilities and Model Context Protocol (MCP) integrations.
        </p>
      </div>

      {/* Data Management Tabs */}
      <Tabs defaultValue="therapies" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="therapies" className="flex items-center space-x-2">
            <Stethoscope className="h-4 w-4" />
            <span>Therapies</span>
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>Services</span>
          </TabsTrigger>
          <TabsTrigger value="facilities" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Facilities</span>
          </TabsTrigger>
          <TabsTrigger value="documentation" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Documentation</span>
          </TabsTrigger>
        </TabsList>

        {/* Therapy Data Generation */}
        <TabsContent value="therapies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span>Therapy & Service Data Generation</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Generate comprehensive therapy and service data for:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline">Cell Therapy</Badge>
                <Badge variant="outline">Gene Therapy</Badge>
                <Badge variant="outline">Personalized Medicine</Badge>
                <Badge variant="outline">Radioligand Therapy</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <TherapyDataGenerator />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Data */}
        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Provider Data</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage service provider information and capabilities
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Service Management</h3>
                <p className="text-gray-500 mb-4">
                  Service provider data generation will be available here.
                </p>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Facilities Data */}
        <TabsContent value="facilities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Facility Data Management</CardTitle>
              <p className="text-sm text-muted-foreground">
                Generate and manage treatment center and facility data
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Facility Management</h3>
                <p className="text-gray-500 mb-4">
                  Facility data generation will be available here.
                </p>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documentation */}
        <TabsContent value="documentation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Generation Documentation</CardTitle>
              <p className="text-sm text-muted-foreground">
                Learn about the MCP and LLM-powered data generation system
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Model Context Protocol (MCP)</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Specialized healthcare MCP servers provide structured access to:
                  </p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• BioMCP for biotech/pharma workflows</li>
                    <li>• Healthcare database tooling</li>
                    <li>• Agent development kit (ADK)</li>
                    <li>• Specialized therapy modalities</li>
                  </ul>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium mb-2">Data Generation Process</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Intelligent data generation using:
                  </p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Domain-specific prompts</li>
                    <li>• Regulatory compliance frameworks</li>
                    <li>• Healthcare data standards</li>
                    <li>• Real-world therapy protocols</li>
                  </ul>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium mb-2">Therapy Modalities</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Comprehensive coverage of advanced therapies:
                  </p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Cell therapy (CAR-T, stem cell, regenerative)</li>
                    <li>• Gene therapy (CRISPR, AAV, lentiviral)</li>
                    <li>• Personalized medicine (biomarkers, genomics)</li>
                    <li>• Radioligand therapy (theranostics, targeted)</li>
                  </ul>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium mb-2">Service Integration</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Supporting services and infrastructure:
                  </p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Manufacturing and production services</li>
                    <li>• Quality control and testing</li>
                    <li>• Regulatory consulting</li>
                    <li>• Supply chain and logistics</li>
                  </ul>
                </Card>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Integration Benefits</h4>
                <p className="text-sm text-blue-800">
                  The MCP and LLM-powered data generation system provides real, structured healthcare data 
                  that can be immediately used in the enhanced onboarding wizard for therapy and service selection, 
                  creating meaningful relationships between treatment centers, distributors, therapies, and services.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}