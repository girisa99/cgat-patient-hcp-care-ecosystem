
import { Home, Users, Building2, Shield, Zap, UserCheck, Upload } from "lucide-react";
import { NavItem } from './types/navigation';
import Index from "./pages/Index";
import UsersPage from "./pages/Users";
import Facilities from "./pages/Facilities";
import Modules from "./pages/Modules";
import ApiServices from "./pages/ApiServices";
import Patients from "./pages/Patients";
import ComprehensiveValidation from "./pages/ComprehensiveValidation";
import DataImport from "./pages/DataImport";

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    to: "/",
    icon: <Home className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Users",
    to: "/users", 
    icon: <Users className="h-4 w-4" />,
    page: <UsersPage />,
  },
  {
    title: "Patients",
    to: "/patients",
    icon: <UserCheck className="h-4 w-4" />,
    page: <Patients />,
  },
  {
    title: "Facilities",
    to: "/facilities",
    icon: <Building2 className="h-4 w-4" />,
    page: <Facilities />,
  },
  {
    title: "Data Import",
    to: "/data-import",
    icon: <Upload className="h-4 w-4" />,
    page: <DataImport />,
  },
  {
    title: "Modules", 
    to: "/modules",
    icon: <Shield className="h-4 w-4" />,
    page: <Modules />,
  },
  {
    title: "API Services",
    to: "/api-services",
    icon: <Zap className="h-4 w-4" />,
    page: <ApiServices />,
  },
  {
    title: "Comprehensive Validation",
    to: "/comprehensive-validation", 
    icon: <Shield className="h-4 w-4" />,
    page: <ComprehensiveValidation />,
  }
];
