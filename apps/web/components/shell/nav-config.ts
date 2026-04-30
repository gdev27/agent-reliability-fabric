import {
  Activity,
  BookCheck,
  GaugeCircle,
  HeartPulse,
  LifeBuoy,
  ListChecks,
  Network,
  Settings as SettingsIcon,
  ShieldCheck,
  type LucideIcon
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
};

export type NavGroup = {
  id: string;
  title: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "overview",
    title: "Overview",
    items: [
      {
        href: "/app",
        label: "Dashboard",
        icon: GaugeCircle,
        description: "System health, KPI sparklines, recent runs"
      },
      {
        href: "/app/onboarding",
        label: "Readiness",
        icon: BookCheck,
        description: "Environment checks for safe operation"
      },
      {
        href: "/app/about",
        label: "About",
        icon: LifeBuoy,
        description: "What gctl is and how to use it"
      }
    ]
  },
  {
    id: "operations",
    title: "Operations",
    items: [
      {
        href: "/app/runs",
        label: "Runs",
        icon: Activity,
        description: "Execution timeline with fail-closed visibility"
      },
      {
        href: "/app/policies",
        label: "Policies",
        icon: ListChecks,
        description: "Inventory, hashes, and routing simulator"
      },
      {
        href: "/app/swarm",
        label: "Swarm",
        icon: Network,
        description: "Planner / Researcher / Critic / Executor loop"
      }
    ]
  },
  {
    id: "trust",
    title: "Trust",
    items: [
      {
        href: "/app/evidence",
        label: "Evidence",
        icon: ShieldCheck,
        description: "Identity, attestation, and audit pointers"
      },
      {
        href: "/app/settings",
        label: "Settings",
        icon: SettingsIcon,
        description: "Account, workspace, and connections"
      }
    ]
  }
];

export const HEALTH_NAV: NavItem = {
  href: "/app/settings",
  label: "Health",
  icon: HeartPulse,
  description: "Connector health and recovery"
};

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/app") {
    return pathname === "/app";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findActiveNavLabel(pathname: string): string | null {
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (isNavActive(pathname, item.href)) {
        return item.label;
      }
    }
  }
  return null;
}
