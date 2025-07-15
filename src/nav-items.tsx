import {
  HomeIcon,
  Users,
  Building2,
  Settings,
  Shield,
  FileText,
  BarChart3,
  Stethoscope,
  TestTube,
  Activity,
  Globe,
  Eye,
} from "lucide-react";

export const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: HomeIcon,
  },
  {
    title: "Users",
    url: "/users",
    icon: Users,
  },
  {
    title: "Patients",
    url: "/patients",
    icon: Stethoscope,
  },
  {
    title: "Facilities",
    url: "/facilities",
    icon: Building2,
  },
  {
    title: "Modules",
    url: "/modules",
    icon: Settings,
  },
  {
    title: "API Services",
    url: "/api-services",
    icon: Activity,
  },
  {
    title: "Ngrok Integration",
    url: "/ngrok",
    icon: Globe,
  },
  {
    title: "Security",
    url: "/security",
    icon: Shield,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: FileText,
  },
  {
    title: "Testing",
    url: "/testing",
    icon: TestTube,
  },
  {
    title: "Role Management",
    url: "/role-management",
    icon: BarChart3,
  },
  {
    title: "Data Import",
    url: "/data-import",
    icon: Globe,
  },
  {
    title: "Verification",
    url: "/active-verification",
    icon: BarChart3,
  },
  {
    title: "Governance",
    url: "/governance",
    icon: Eye,
  },
];
