import { useNavigate } from "react-router-dom";
import { Menu, Search, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Avatar, Dropdown, Button } from "../ui";

export default function TopHeader({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSettings = () => {
    if (user?.role === "super_admin") {
      navigate("/super-admin/settings");
    } else if (user?.role === "society_admin") {
      navigate("/admin/setup");
    } else {
      navigate("/resident/profile");
    }
  };

  const userMenuItems = [
    { label: "Settings", onClick: handleSettings },
    { type: "separator" },
    { label: "Logout", danger: true, onClick: handleLogout },
  ];

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-white px-4 shadow-sm">
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
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="text-danger border-danger/30 hover:bg-danger/10 flex items-center gap-1.5"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </Button>

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
