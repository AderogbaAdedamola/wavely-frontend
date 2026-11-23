import {
  CalendarClockIcon,
  MegaphoneIcon,
  PlugZapIcon,
  RadioIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  SquareSlashIcon,
  UsersRoundIcon,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Match the pathname exactly (used for the "/" root). */
  exact?: boolean;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV: NavSection[] = [
  {
    label: "Console",
    items: [
      { href: "/", label: "Control Center", icon: RadioIcon, exact: true },
      { href: "/connection", label: "Connection", icon: PlugZapIcon },
    ],
  },
  {
    label: "Dispatch",
    items: [
      { href: "/broadcasts", label: "Broadcasts", icon: MegaphoneIcon },
      { href: "/schedules", label: "Schedules", icon: CalendarClockIcon },
      { href: "/groups", label: "Groups", icon: UsersRoundIcon },
    ],
  },
  {
    label: "Control",
    items: [
      { href: "/commands", label: "Commands", icon: SquareSlashIcon },
      { href: "/settings", label: "Settings", icon: SlidersHorizontalIcon },
    ],
  },
  {
    label: "Administration",
    items: [{ href: "/admin", label: "Admin overview", icon: ShieldCheckIcon }],
  },
];

export function isActivePath(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
