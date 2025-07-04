
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, Shield } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Healthcare Management System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive healthcare management with role-based access control, 
            user management, and module administration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage users, roles, and access permissions across your healthcare system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/users">
                <Button className="w-full">
                  Access User Management
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" />
                Module Management
              </CardTitle>
              <CardDescription>
                Configure and manage system modules, features, and integrations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/modules">
                <Button className="w-full">
                  Access Module Management
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                Role Management
              </CardTitle>
              <CardDescription>
                Create roles, assign facilities, manage modules, and configure permissions dynamically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/role-management">
                <Button className="w-full">
                  Access Role Management
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Built with single source of truth architecture • No mock data • Real-time updates
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
