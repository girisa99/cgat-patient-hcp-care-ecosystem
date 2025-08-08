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
  Layers,
  Database,
  Upload,
  Brain,
  Bot,
  UserCheck,
  Zap,
  Network,
  Workflow
} from "lucide-react";

export const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: HomeIcon,
  },
  {
    title: "Patients",
    url: "/patients", 
    icon: Stethoscope,
  },
  {
    title: "Agents",
    url: "/agents",
    icon: Bot,
  },
  {
    title: "Treatment Centers",
    url: "/treatment-centers",
    icon: Building2,
  },
  // MANAGEMENT SECTION
  {
    title: "Users",
    url: "/users",
    icon: Users,
  },
  {
    title: "Facilities", 
    url: "/facilities",
    icon: Building2,
  },
  {
    title: "Onboarding",
    url: "/onboarding", 
    icon: UserCheck,
  },
  {
    title: "Modules",
    url: "/modules",
    icon: Settings,
  },
  {
    title: "Role Management",
    url: "/role-management",
    icon: BarChart3,
  },
  // SYSTEM INTEGRATION SECTION
  {
    title: "API Services",
    url: "/api-services",
    icon: Activity,
  },
  {
    title: "System Integration",
    url: "/system-integration",
    icon: Network,
  },
  {
    title: "Data Import",
    url: "/data-import",
    icon: Upload,
  },
  {
    title: "Security",
    url: "/security", 
    icon: Shield,
  },
  {
    title: "Testing & Validation",
    url: "/testing",
    icon: TestTube,
  },
  // REPORTS & COMPLIANCE SECTION  
  {
    title: "Reports",
    url: "/reports",
    icon: FileText,
  },
  {
    title: "Governance",
    url: "/governance",
    icon: Eye,
  },
  {
    title: "Framework",
    url: "/framework",
    icon: Shield,
  },
  {
    title: "Stability",
    url: "/stability", 
    icon: Activity,
  },
  {
    title: "Verification",
    url: "/active-verification",
    icon: BarChart3,
  },
  // SPECIALIZED TOOLS
  {
    title: "Healthcare AI",
    url: "/healthcare-ai",
    icon: Brain,
  },
  {
    title: "Softphone System",
    url: "/softphone",
    icon: Phone,
  },
  {
    title: "Ngrok Integration",
    url: "/ngrok",
    icon: Globe,
  },
];
