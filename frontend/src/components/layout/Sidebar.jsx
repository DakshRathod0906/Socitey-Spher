import { useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useAuth } from "../../contexts/AuthContext";
import { NAVIGATION_CONFIG } from "../../app/navigation";
import { ChevronLeft, ChevronRight, LogOut, Menu } from "lucide-react";
import { Tooltip } from "../ui";

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Fallback to resident if no role is provided (for development purposes)
  const role = user?.role || "resident";
  const links = NAVIGATION_CONFIG[role] || [];

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-surface border-r border-border">
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <span className="text-xl font-bold text-primary truncate">
            SocietySphere
          </span>
        )}
        {collapsed && (
          <span className="text-xl font-bold text-primary mx-auto">S</span>
        )}
        
        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1.5 rounded-lg text-muted hover:bg-secondary-light hover:text-text transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const linkContent = (
            <NavLink
              key={link.name}
              to={link.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-light text-primary"
                    : "text-muted hover:bg-secondary-light hover:text-text"
                )
              }
              onClick={() => setMobileOpen?.(false)}
            >
              <Icon size={20} className="shrink-0" />
              {!collapsed && <span>{link.name}</span>}
            </NavLink>
          );

          return collapsed ? (
            <Tooltip key={link.name} content={link.name} side="right">
              {linkContent}
            </Tooltip>
          ) : (
            linkContent
          );
        })}
      </nav>

      {/* Footer (User Profile & Logout) */}
      <div className="p-3 border-t border-border">
        <button
          onClick={logout}
          className={cn(
            "flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-danger hover:bg-danger-light transition-colors",
            collapsed && "justify-center"
          )}
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:block h-screen sticky top-0 transition-all duration-300",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Overlay & Sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-sidebar flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-64 max-w-[80%] h-full">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
