
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Package, Shield, Building2, Globe, TestTube, 
  CheckCircle2, Activity, Database, UserPlus, HeartHandshake 
} from "lucide-react";
import { useMasterAuth } from "@/hooks/useMasterAuth";
import DashboardHeader from "@/components/layout/DashboardHeader";

const Index = () => {
  const { user, profile, userRoles, isLoading } = useMasterAuth();

  const getUserDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) {
      return profile.first_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  // All available modules/pages
  const allModules = [
    {
      title: "User Management",
      description: "Manage users, roles, and access permissions across your healthcare system.",
      path: "/users",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Patient Management", 
      description: "Comprehensive patient data management and healthcare records.",
      path: "/patients",
      icon: HeartHandshake,
      color: "text-pink-600",
      bgColor: "bg-pink-50"
    },
    {
      title: "Facilities Management",
      description: "Manage healthcare facilities, locations, and infrastructure.",
      path: "/facilities", 
      icon: Building2,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Module Management",
      description: "Configure and manage system modules, features, and integrations.",
      path: "/modules",
      icon: Package,
      color: "text-purple-600", 
      bgColor: "bg-purple-50"
    },
    {
      title: "API Services",
      description: "API integration management and service configuration.",
      path: "/api-services",
      icon: Globe,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      title: "Testing Suite Services",
      description: "Comprehensive testing tools and quality assurance management.",
      path: "/testing",
      icon: TestTube,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Active Verification",
      description: "Real-time system verification and monitoring dashboard.",
      path: "/active-verification",
      icon: CheckCircle2,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50"
    },
    {
      title: "Security Management",
      description: "Security monitoring, compliance, and access control management.",
      path: "/security",
      icon: Shield,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Data Import",
      description: "Import and manage healthcare data from various sources.",
      path: "/data-import",
      icon: Database,
      color: "text-teal-600",
      bgColor: "bg-teal-50"
    },
    {
      title: "Onboarding",
      description: "Patient and staff onboarding workflows and processes.",
      path: "/onboarding",
      icon: UserPlus,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {getUserDisplayName()}! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Access your healthcare management modules and tools below.
          </p>
          <div className="flex items-center space-x-2 mt-3">
            <Badge variant="outline" className="text-sm">
              {userRoles.length} Active Role{userRoles.length !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="secondary" className="text-sm">
              {allModules.length} Modules Available
            </Badge>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allModules.map((module, index) => {
            const Icon = module.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-all duration-200 border-0 shadow-sm hover:scale-105">
                <CardHeader className={`${module.bgColor} rounded-t-lg`}>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg">
                      <Icon className={`h-5 w-5 ${module.color}`} />
                    </div>
                    <span className="text-gray-900">{module.title}</span>
                  </CardTitle>
                  <CardDescription className="text-gray-700">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Link to={module.path}>
                    <Button className="w-full" size="lg">
                      Access {module.title}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* System Status */}
        <div className="mt-12 text-center bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Activity className="h-5 w-5 text-green-500" />
            <span className="text-lg font-semibold text-gray-900">System Status: Active</span>
          </div>
          <p className="text-gray-600">
            Built with single source of truth architecture • Real-time updates • Role-based security
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
