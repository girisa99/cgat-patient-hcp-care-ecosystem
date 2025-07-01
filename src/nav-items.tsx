
import { 
  Home, 
  Users, 
  Building2, 
  Package, 
  UserPlus, 
  Settings, 
  Shield, 
  Activity,
  BarChart3,
  Search,
  Globe,
  FileText,
  Database,
  CheckCircle2,
  Import,
  Cloud
} from 'lucide-react';

export interface NavItem {
  title: string;
  url: string;
  to: string;
  page?: React.ComponentType;
  icon: React.ComponentType<any>;
  isActive: boolean;
  items: Array<{
    title: string;
    url: string;
    to: string;
    icon: React.ComponentType<any>;
  }>;
}

// SINGLE SOURCE OF TRUTH for all navigation
export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/",
    to: "/",
    icon: Home,
    isActive: false,
    items: []
  },
  {
    title: "User Management", // Consolidated - single route
    url: "/users",
    to: "/users",
    icon: Users,
    isActive: false,
    items: []
  },
  {
    title: "Patients",
    url: "/patients",
    to: "/patients", 
    icon: Users,
    isActive: false,
    items: []
  },
  {
    title: "Facilities",
    url: "/facilities",
    to: "/facilities",
    icon: Building2,
    isActive: false,
    items: []
  },
  {
    title: "Modules",
    url: "/modules",
    to: "/modules",
    icon: Package,
    isActive: false,
    items: []
  },
  {
    title: "API Services",
    url: "/api-services",
    to: "/api-services",
    icon: Globe,
    isActive: false,
    items: []
  },
  {
    title: "Data Import",
    url: "/data-import",
    to: "/data-import",
    icon: Import,
    isActive: false,
    items: []
  },
  {
    title: "Active Verification",
    url: "/active-verification",
    to: "/active-verification",
    icon: CheckCircle2,
    isActive: false,
    items: []
  },
  {
    title: "Onboarding",
    url: "/onboarding",
    to: "/onboarding",
    icon: UserPlus,
    isActive: false,
    items: []
  },
  {
    title: "Security",
    url: "/security",
    to: "/security",
    icon: Shield,
    isActive: false,
    items: []
  }
];

// Helper functions for consistent route access
export const getRouteByPath = (path: string) => {
  return navItems.find(item => item.to === path);
};

export const getAllRoutes = () => {
  return navItems.map(item => ({ path: item.to, title: item.title }));
};

export const isValidRoute = (path: string) => {
  return navItems.some(item => item.to === path);
};
