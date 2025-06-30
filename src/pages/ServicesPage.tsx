
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, Heart, Brain, Pill, Truck, Shield, Users, Phone } from 'lucide-react';

const ServicesPage: React.FC = () => {
  const serviceCategories = [
    {
      title: "Primary Care Services",
      description: "Essential healthcare services and routine checkups",
      icon: Stethoscope,
      color: "text-blue-600",
      services: ["Annual Physicals", "Preventive Care", "Health Screenings"],
      status: "Active"
    },
    {
      title: "Specialized Therapies",
      description: "Advanced treatment options and specialized care",
      icon: Heart,
      color: "text-red-600",
      services: ["Cell Therapy", "Gene Therapy", "Immunotherapy"],
      status: "Active"
    },
    {
      title: "Mental Health Services",
      description: "Comprehensive mental health and wellness support",
      icon: Brain,
      color: "text-purple-600",
      services: ["Counseling", "Therapy Sessions", "Support Groups"],
      status: "Active"
    },
    {
      title: "Pharmaceutical Services",
      description: "Medication management and pharmaceutical care",
      icon: Pill,
      color: "text-green-600",
      services: ["Prescription Management", "Drug Interactions", "Pharmacy Services"],
      status: "Active"
    },
    {
      title: "Logistics & Distribution",
      description: "Supply chain and distribution services",
      icon: Truck,
      color: "text-orange-600",
      services: ["Cold Chain Management", "Specialty Distribution", "Inventory Management"],
      status: "Active"
    },
    {
      title: "Compliance & Safety",
      description: "Regulatory compliance and safety protocols",
      icon: Shield,
      color: "text-teal-600",
      services: ["HIPAA Compliance", "Safety Protocols", "Quality Assurance"],
      status: "Active"
    },
    {
      title: "Patient Support Services",
      description: "Comprehensive patient care and support programs",
      icon: Users,
      color: "text-indigo-600",
      services: ["Patient Navigation", "Financial Assistance", "Care Coordination"],
      status: "Active"
    },
    {
      title: "Communication Services",
      description: "Patient and provider communication solutions",
      icon: Phone,
      color: "text-pink-600",
      services: ["SMS Notifications", "Voice Calls", "Secure Messaging"],
      status: "Active"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Inactive": return "bg-red-100 text-red-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <MainLayout>
      <PageContainer
        title="Healthcare Services"
        subtitle="Comprehensive healthcare service management and configuration"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-8 w-8 ${category.color}`} />
                      <div>
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                        <Badge className={getStatusColor(category.status)}>
                          {category.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="mt-2">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-muted-foreground">Available Services:</h4>
                      {category.services.map((service) => (
                        <div key={service} className="text-sm text-muted-foreground">
                          • {service}
                        </div>
                      ))}
                    </div>
                    <Button className="w-full" variant="outline">
                      Manage Services
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default ServicesPage;
