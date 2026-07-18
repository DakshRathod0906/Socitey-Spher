import { Outlet, Link } from "react-router-dom";
import { Building2 } from "lucide-react";
import { Button } from "../components/ui";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Public Header */}
      <header className="sticky top-0 z-header border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <Building2 size={24} />
            <span className="text-xl font-bold">SocietySphere</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-text hover:text-primary transition-colors">
              Log in
            </Link>
            <Link to="/register-society">
              <Button size="sm">Create Society</Button>
            </Link>
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
          &copy; {new Date().getFullYear()} SocietySphere. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
