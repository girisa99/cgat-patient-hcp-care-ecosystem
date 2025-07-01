import { HomeIcon, UsersIcon, BuildingOfficeIcon, Cog6ToothIcon, ShieldCheckIcon, DocumentTextIcon, ChartBarIcon, UserGroupIcon, ClipboardDocumentListIcon, BookOpenIcon, ServerIcon, WrenchScrewdriverIcon, BeakerIcon, CpuChipIcon, EyeIcon, BugAntIcon, HeartIcon } from "@heroicons/react/24/outline";
import Index from "./pages/Index";
import Users from "./pages/Users";
import Facilities from "./pages/Facilities";
import Settings from "./pages/Settings";
import SecurityPage from "./pages/SecurityPage";
import AdminPage from "./pages/AdminPage";
import Modules from "./pages/Modules";
import Onboarding from "./pages/Onboarding";
import ServicesPage from "./pages/ServicesPage";
import TherapiesPage from "./pages/TherapiesPage";
import ReportsPage from "./pages/ReportsPage";
import DocumentsPage from "./pages/DocumentsPage";
import ApiIntegrations from "./pages/ApiIntegrations";
import SystemVerificationPage from "./pages/SystemVerificationPage";
import HealthMonitoring from "./pages/HealthMonitoring";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Users",
    to: "/users",
    icon: <UsersIcon className="h-4 w-4" />,
    page: <Users />,
  },
  {
    title: "Facilities",
    to: "/facilities",
    icon: <BuildingOfficeIcon className="h-4 w-4" />,
    page: <Facilities />,
  },
  {
    title: "Modules",
    to: "/modules",
    icon: <ClipboardDocumentListIcon className="h-4 w-4" />,
    page: <Modules />,
  },
  {
    title: "Onboarding",
    to: "/onboarding",
    icon: <BookOpenIcon className="h-4 w-4" />,
    page: <Onboarding />,
  },
  {
    title: "Services",
    to: "/services",
    icon: <ServerIcon className="h-4 w-4" />,
    page: <ServicesPage />,
  },
  {
    title: "Therapies",
    to: "/therapies",
    icon: <WrenchScrewdriverIcon className="h-4 w-4" />,
    page: <TherapiesPage />,
  },
  {
    title: "API Integrations",
    to: "/api-integrations",
    icon: <BeakerIcon className="h-4 w-4" />,
    page: <ApiIntegrations />,
  },
  {
    title: "Reports",
    to: "/reports",
    icon: <ChartBarIcon className="h-4 w-4" />,
    page: <ReportsPage />,
  },
  {
    title: "Documents",
    to: "/documents",
    icon: <DocumentTextIcon className="h-4 w-4" />,
    page: <DocumentsPage />,
  },
  {
    title: "Admin",
    to: "/admin",
    icon: <Cog6ToothIcon className="h-4 w-4" />,
    page: <AdminPage />,
  },
  {
    title: "Security",
    to: "/security",
    icon: <ShieldCheckIcon className="h-4 w-4" />,
    page: <SecurityPage />,
  },
  {
    title: "System Verification",
    to: "/system-verification",
    icon: <EyeIcon className="h-4 w-4" />,
    page: <SystemVerificationPage />,
  },
  {
    title: "Health Monitoring",
    to: "/health-monitoring",
    icon: <HeartIcon className="h-4 w-4" />,
    page: <HealthMonitoring />,
  },
];
