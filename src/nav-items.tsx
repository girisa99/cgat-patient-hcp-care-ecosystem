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
  Network,
  ShoppingCart,
  FileSearch,
  GitBranch,
  Sparkles,
  Wrench,
  Presentation,
  Factory
} from "lucide-react";

/**
 * CONSOLIDATED NAV ITEMS
 * Duplicates removed - Production Hub/Arc merged into /genie-admin
 */
export const navItems = [
  // === MAIN SECTION ===
  {
    title: "Dashboard",
    url: "/",
    icon: HomeIcon,
  },
  {
    title: "Genie Suite",
    url: "/genie-studio",
    icon: Sparkles,
  },
  {
    title: "Production Hub",
    url: "/genie-admin",
    icon: Factory,
    description: "Unified production management - Kanban, Calendar, Scheduling",
  },
  {
    title: "Genie Deck",
    url: "/genie-deck",
    icon: Presentation,
  },
  {
    title: "Content Tools",
    url: "/content-tools",
    icon: Wrench,
  },
  
  // === HEALTHCARE SECTION ===
  {
    title: "Order Management",
    url: "/order-management",
    icon: ShoppingCart,
  },
  {
    title: "Patient Onboarding",
    url: "/patient-onboarding", 
    icon: UserCheck,
  },
  {
    title: "Document Processing",
    url: "/document-processing",
    icon: FileSearch,
  },
  {
    title: "Patients",
    url: "/patients", 
    icon: Stethoscope,
  },
  {
    title: "Treatment Centers",
    url: "/treatment-centers",
    icon: Building2,
  },
  
  // === MANAGEMENT SECTION ===
  {
    title: "Agents",
    url: "/agents",
    icon: Bot,
  },
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
  
  // === SYSTEM INTEGRATION SECTION ===
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
  
  // === REPORTS & COMPLIANCE SECTION ===
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
  
  // === ARCHITECTURE & DIAGRAMS SECTION ===
  {
    title: "Presentations",
    url: "/presentations",
    icon: Layers,
  },
  {
    title: "Architecture",
    url: "/architecture",
    icon: GitBranch,
  },
  
  // === SPECIALIZED TOOLS ===
  {
    title: "Healthcare AI",
    url: "/healthcare-ai",
    icon: Brain,
  },
  {
    title: "Database Performance",
    url: "/database-performance",
    icon: Database,
  },
  {
    title: "Ngrok Integration",
    url: "/ngrok",
    icon: Globe,
  },
];
