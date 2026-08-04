import { Outlet, Link, useNavigate } from "react-router-dom";
import { Building2, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "../components/ui";
import { usePlatformSettings } from "../contexts/PlatformContext";
import { useAuth } from "../contexts/AuthContext";

export default function PublicLayout() {
  const { platformConfig } = usePlatformSettings();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const roleDashboardPaths = {
    super_admin: "/super-admin",
    society_admin: "/admin",
    admin: "/admin",
    resident: "/resident",
    security: "/security",
    service_staff: "/service",
  };

  const dashboardRoute = roleDashboardPaths[user?.role] || "/admin";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Public Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <Building2 size={24} />
            <span className="text-xl font-bold">{platformConfig.appName}</span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to={dashboardRoute}>
                  <Button size="sm" className="flex items-center gap-2">
                    <LayoutDashboard size={16} />
                    Go to Dashboard
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-danger border-danger/30 hover:bg-danger/10 flex items-center gap-1.5"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-text hover:text-primary transition-colors">
                  Log in
                </Link>
                <Link to="/register-society">
                  <Button size="sm">Create Society</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Public Footer */}
      <footer className="bg-surface border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted">
          &copy; {new Date().getFullYear()} {platformConfig.appName}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
