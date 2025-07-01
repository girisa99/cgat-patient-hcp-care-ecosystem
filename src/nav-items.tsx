
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
  CheckCircle2
} from 'lucide-react';

export const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    isActive: false,
    items: []
  },
  {
    title: "User Management",
    url: "/users",
    icon: Users,
    isActive: false,
    items: []
  },
  {
    title: "Patients",
    url: "/patients", 
    icon: Users,
    isActive: false,
    items: []
  },
  {
    title: "Facilities",
    url: "/facilities",
    icon: Building2,
    isActive: false,
    items: []
  },
  {
    title: "Modules",
    url: "/modules",
    icon: Package,
    isActive: false,
    items: []
  },
  {
    title: "Onboarding",
    url: "/onboarding",
    icon: UserPlus,
    isActive: false,
    items: []
  },
  {
    title: "Admin",
    url: "#",
    icon: Settings,
    isActive: false,
    items: [
      {
        title: "System Analysis",
        url: "/admin/system-analysis",
        icon: BarChart3
      },
      {
        title: "System Assessment", 
        url: "/admin/system-assessment",
        icon: Search
      },
      {
        title: "API Services",
        url: "/admin/api-services",
        icon: Globe
      },
      {
        title: "API Integrations",
        url: "/admin/api-integrations", 
        icon: Globe
      },
      {
        title: "Data Import",
        url: "/admin/data-import",
        icon: Database
      },
      {
        title: "System Status",
        url: "/admin/system-status",
        icon: Activity
      },
      {
        title: "User Management",
        url: "/admin/user-management",
        icon: Users
      },
      {
        title: "Patient Management",
        url: "/admin/patient-management", 
        icon: Users
      },
      {
        title: "Auto Module Manager",
        url: "/admin/auto-module-manager",
        icon: Package
      },
      {
        title: "System Verification",
        url: "/admin/system-verification",
        icon: CheckCircle2
      }
    ]
  },
  {
    title: "Security",
    url: "/security",
    icon: Shield,
    isActive: false,
    items: []
  },
  {
    title: "Reports",
    url: "/reports", 
    icon: FileText,
    isActive: false,
    items: []
  }
];
