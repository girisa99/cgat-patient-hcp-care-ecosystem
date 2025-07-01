
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
    title: "User Management",
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
    title: "Onboarding",
    url: "/onboarding",
    to: "/onboarding",
    icon: UserPlus,
    isActive: false,
    items: []
  },
  {
    title: "Admin",
    url: "#",
    to: "#",
    icon: Settings,
    isActive: false,
    items: [
      {
        title: "System Analysis",
        url: "/admin/system-analysis",
        to: "/admin/system-analysis",
        icon: BarChart3
      },
      {
        title: "System Assessment", 
        url: "/admin/system-assessment",
        to: "/admin/system-assessment",
        icon: Search
      },
      {
        title: "API Services",
        url: "/admin/api-services",
        to: "/admin/api-services",
        icon: Globe
      },
      {
        title: "API Integrations",
        url: "/admin/api-integrations",
        to: "/admin/api-integrations", 
        icon: Cloud
      },
      {
        title: "Data Import",
        url: "/admin/data-import",
        to: "/admin/data-import",
        icon: Database
      },
      {
        title: "System Status",
        url: "/admin/system-status",
        to: "/admin/system-status",
        icon: Activity
      },
      {
        title: "User Management",
        url: "/admin/user-management",
        to: "/admin/user-management",
        icon: Users
      },
      {
        title: "Patient Management",
        url: "/admin/patient-management",
        to: "/admin/patient-management", 
        icon: Users
      },
      {
        title: "Auto Module Manager",
        url: "/admin/auto-module-manager",
        to: "/admin/auto-module-manager",
        icon: Package
      },
      {
        title: "System Verification",
        url: "/admin/system-verification",
        to: "/admin/system-verification",
        icon: CheckCircle2
      }
    ]
  },
  {
    title: "Security",
    url: "/security",
    to: "/security",
    icon: Shield,
    isActive: false,
    items: []
  },
  {
    title: "Reports",
    url: "/reports",
    to: "/reports", 
    icon: FileText,
    isActive: false,
    items: []
  }
];
