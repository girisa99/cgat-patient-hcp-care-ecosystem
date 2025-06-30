
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stethoscope, Heart, Brain, Pill } from 'lucide-react';

const ServicesPage: React.FC = () => {
  const serviceCategories = [
    {
      title: "Primary Care Services",
      description: "Essential healthcare services and routine checkups",
      icon: Stethoscope,
      color: "text-blue-600",
      services: ["Annual Physicals", "Preventive Care", "Health Screenings"]
    },
    {
      title: "Specialized Therapies",
      description: "Advanced treatment options and specialized care",
      icon: Heart,
      color: "text-red-600",
      services: ["Cell Therapy", "Gene Therapy", "Immunotherapy"]
    },
    {
      title: "Mental Health Services",
      description: "Comprehensive mental health and wellness support",
      icon: Brain,
      color: "text-purple-600",
      services: ["Counseling", "Therapy Sessions", "Support Groups"]
    },
    {
      title: "Pharmaceutical Services",
      description: "Medication management and pharmaceutical care",
      icon: Pill,
      color: "text-green-600",
      services: ["Prescription Management", "Drug Interactions", "Pharmacy Services"]
    }
  ];

  return (
    <MainLayout>
      <PageContainer
        title="Service Selection"
        subtitle="Select and configure healthcare services"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {serviceCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-8 w-8 ${category.color}`} />
                    <div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      {category.services.map((service) => (
                        <div key={service} className="text-sm text-muted-foreground">
                          • {service}
                        </div>
                      ))}
                    </div>
                    <Button className="w-full" variant="outline">
                      Configure Services
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
