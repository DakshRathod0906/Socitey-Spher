import { Menu, Search, Bell } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Avatar, Dropdown, Badge } from "../ui";

export default function TopHeader({ onMenuClick }) {
  const { user } = useAuth();

  const userMenuItems = [
    { label: "Profile", onClick: () => console.log("Profile clicked") },
    { label: "Settings", onClick: () => console.log("Settings clicked") },
    { type: "separator" },
    { label: "Logout", danger: true, onClick: () => console.log("Logout clicked") },
  ];

  return (
    <header className="sticky top-0 z-header flex h-16 items-center justify-between border-b border-border bg-surface/80 px-4 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 rounded-lg text-text hover:bg-secondary-light"
        >
          <Menu size={20} />
        </button>

        {/* Search / Command Palette Placeholder */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary-light border border-border text-muted w-64 hover:border-primary transition-colors cursor-text">
          <Search size={16} />
          <span className="text-sm">Search... (Ctrl+K)</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 rounded-full text-muted hover:text-text hover:bg-secondary-light transition-colors">
          <Bell size={20} />
          <Badge
            variant="danger"
            size="sm"
            className="absolute top-1 right-1 h-4 min-w-4 p-0 flex items-center justify-center text-[10px]"
          >
            3
          </Badge>
        </button>

        {/* User Menu */}
        <Dropdown
          align="right"
          items={userMenuItems}
          trigger={
            <div className="flex items-center gap-2 cursor-pointer p-1 rounded-full hover:bg-secondary-light transition-colors">
              <Avatar name={user?.name || "User"} size="sm" />
              <div className="hidden sm:block text-left mr-1">
                <p className="text-sm font-medium text-text leading-tight">
                  {user?.name || "Guest"}
                </p>
                <p className="text-xs text-muted leading-tight">
                  {user?.role?.replace("_", " ") || "No role"}
                </p>
              </div>
            </div>
          }
        />
      </div>
    </header>
  );
}
