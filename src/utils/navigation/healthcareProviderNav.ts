import {
  HomeIcon,
  ShoppingCart,
  Stethoscope,
  UserCheck,
  MessageSquare,
  Activity,
  Bot,
  TestTube
} from "lucide-react";

/**
 * Healthcare Provider Navigation Configuration
 * Dedicated navigation items for healthcare provider users
 */
export const healthcareProviderNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: HomeIcon,
    description: "Healthcare provider dashboard overview"
  },
  {
    title: "Order Management",
    url: "/order-management", 
    icon: ShoppingCart,
    description: "Manage patient medication orders and prescriptions"
  },
  {
    title: "Patient Onboarding",
    url: "/patient-onboarding",
    icon: UserCheck,
    description: "Standard patient enrollment and onboarding processes"
  },
  {
    title: "WhatsApp Patient Enrollment",
    url: "/patient-onboarding-whatsapp",
    icon: MessageSquare,
    description: "AI-powered patient consent via WhatsApp with location awareness"
  },
  {
    title: "API Services",
    url: "/api-services",
    icon: Activity,
    description: "Integration and API management tools"
  },
  {
    title: "Agents",
    url: "/agents",
    icon: Bot,
    description: "AI agents for healthcare workflows"
  },
  {
    title: "Testing Suite",
    url: "/testing",
    icon: TestTube,
    description: "Provider-specific testing and validation tools"
  }
];

/**
 * Get allowed pages for healthcare provider role
 */
export const getHealthcareProviderPages = () => {
  return healthcareProviderNavItems.map(item => item.url);
};

/**
 * Check if a page is accessible to healthcare providers
 */
export const isHealthcareProviderPage = (url: string): boolean => {
  return getHealthcareProviderPages().includes(url);
};