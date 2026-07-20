import {
  LayoutDashboard,
  Users,
  Building,
  CreditCard,
  MessageSquare,
  Shield,
  FileText,
  Car,
  Bell,
  Settings,
  Ticket,
  ClipboardList,
} from "lucide-react";

export const NAVIGATION_CONFIG = {
  super_admin: [
    { name: "Dashboard", href: "/super-admin", icon: LayoutDashboard },
    { name: "Societies", href: "/super-admin/societies", icon: Building },
    { name: "Admins", href: "/super-admin/admins", icon: Users },
    { name: "Settings", href: "/super-admin/settings", icon: Settings },
  ],
  society_admin: [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/residents", icon: Users },
    { name: "Visitors", href: "/admin/visitors", icon: Shield },
    { name: "Complaints", href: "/admin/complaints", icon: MessageSquare },
    { name: "Billing", href: "/admin/billing", icon: CreditCard },
    { name: "Parking", href: "/admin/parking", icon: Car },
    { name: "Amenities", href: "/admin/amenities", icon: Ticket },
    { name: "Notices", href: "/admin/notices", icon: Bell },
    { name: "Setup", href: "/admin/setup", icon: Settings },
  ],
  resident: [
    { name: "Dashboard", href: "/resident", icon: LayoutDashboard },
    { name: "My Family", href: "/resident/profile", icon: Users },
    { name: "My Visitors", href: "/resident/visitors", icon: Shield },
    { name: "My Complaints", href: "/resident/complaints", icon: MessageSquare },
    { name: "My Bills", href: "/resident/bills", icon: CreditCard },
    { name: "My Vehicles", href: "/resident/parking", icon: Car },
    { name: "Notices", href: "/resident/notices", icon: Bell },
  ],
  security: [
    { name: "Dashboard", href: "/security", icon: LayoutDashboard },
    { name: "Scan Pass", href: "/security/scan", icon: Shield },
    { name: "Walk-ins", href: "/security/walk-in", icon: Users },
    { name: "Visitor History", href: "/security/history", icon: ClipboardList },
  ],
  service_staff: [
    { name: "Dashboard", href: "/service", icon: LayoutDashboard },
    { name: "Work Orders", href: "/service/work-orders", icon: ClipboardList },
    { name: "Schedule", href: "/service/schedule", icon: FileText },
  ],
};
